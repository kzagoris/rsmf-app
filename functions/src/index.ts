// eslint-disable-next-line object-curly-spacing
import admin from "firebase-admin"
import { getAuth } from "firebase-admin/auth"
import { Timestamp } from "firebase-admin/firestore"
import { defineInt, defineString } from "firebase-functions/params"
import { auth, firestore, logger } from "firebase-functions/v1"
import { sendEmail, SMTPConfigType, type EmailDataType } from "./email"

admin.initializeApp()

const SMTPConfig: SMTPConfigType = {
  User: defineString("SMTP_USER"),
  Password: defineString("SMTP_PASSWORD"),
  Server: defineString("SMTP_SERVER"),
  Port: defineInt("SMTP_PORT"),
}

export const deleteUserAccount = firestore.document("users/{userId}").onDelete(async (snap, context) => {
  const userId = context.params.userId
  const userDeleted = snap.data()
  if (userDeleted.status === "unregister") return

  try {
    await admin.auth().deleteUser(userId)
  } catch (error) {
    logger.error(`Error deleting user: ${userId}`, error)
  }
})

export const createUser = auth.user().onCreate(async (user, context) => {
  const userSnapshot = await admin.firestore().collection("users").where("email", "==", user.email).get()
  if (userSnapshot.empty) {
    await admin
        .firestore()
        .collection("users")
        .doc(user.uid)
        .set({
          email: user.email,
          role: user.customClaims?.role ?? "student",
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          status: "register",
          descriptorInfo: null,
          filters: [],
          idImage: null,
          courses: [],
        })
    return
  }
  const previousData = userSnapshot.docs[0].data()
  const previousUserId = userSnapshot.docs[0].id
  const firstName = user.displayName?.split(" ")[0] ?? null
  const lastName = user.displayName?.split(" ")[1] ?? null
  const newUser = {
    email: user.email,
    role: previousData.role ?? "student",
    firstName,
    lastName,
    status: "register",
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    descriptorInfo: null,
    filters: [],
    idImage: null,
    courses: previousData.courses ?? [],
  }
  const uid = user.uid
  const batch = admin.firestore().batch()
  batch.delete(userSnapshot.docs[0].ref)
  batch.set(admin.firestore().collection("users").doc(uid), newUser)

  for (const course of newUser.courses) {
    if (newUser.role === "admin") continue
    const courseRef = admin.firestore().collection("courses").doc(course.id)
    const courseParticipantRef =
            newUser.role === "student" ? courseRef.collection("students") : courseRef.collection("proctors")
    batch.delete(courseParticipantRef.doc(previousUserId))
    batch.create(courseParticipantRef.doc(uid), { email: newUser.email, firstName, lastName, role: newUser.role })
  }
  await batch.commit()
})

export const beforeCreate = auth.user().beforeCreate(async (user, context) => {
  logger.info("User signup", user, context, { structuredData: true })
  const email = user.email
  const userSnapshot = await admin.firestore().collection("users").where("email", "==", email).get()
  if (userSnapshot.empty) {
    throw new auth.HttpsError(
        "permission-denied",
        "Unauthorized Email. You are not eligible to sign up! Please contact support.",
    )
  }
  const previousData = userSnapshot.docs[0].data()
  getAuth().setCustomUserClaims(user.uid, { role: previousData.role })
})

export const sendSignUpEmail = firestore.document("users/{userId}").onCreate(async (snap, context) => {
  const userId = context.params.userId
  const user = snap.data()
  const email = user.email
  // get the username from email
  const name: string = email.split("@")?.[0] ?? email
  const appName = "RSMF Application"
  const appDomain = "rsmf-project.eu"
  const currentYear = new Date().getFullYear()
  const signupLink = "https://app.rsmf-project.eu/signUp"
  const data = {
    name,
    appName,
    signupLink,
    appDomain,
    currentYear,
  } as EmailDataType
  await sendEmail("SignUpNotification", email, data, SMTPConfig)
  logger.info("User signup email sent", userId, email, { structuredData: true })
})
