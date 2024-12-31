import { initializeApp, type FirebaseApp } from "firebase/app"
import { connectAuthEmulator, getAuth, type Auth } from "firebase/auth"
import { connectFirestoreEmulator, getFirestore, type Firestore } from "firebase/firestore"
import { connectStorageEmulator, getStorage, type FirebaseStorage } from "firebase/storage"

let firebaseApp: FirebaseApp
const useEmulator = () => import.meta.env.VITE_USE_FIREBASE_EMULATOR === "true"
const useEmulatorHostUrl = () => {
    return import.meta.env.VITE_FIREBASE_EMULATOR_HOST
}
const firebaseAppOptions = {
    apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTHDOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECTID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGEBUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGINGSENDERID,
    appId: import.meta.env.VITE_FIREBASE_APPID,
}

export const setupFirebase = () => {
    try {
        firebaseApp = initializeApp(firebaseAppOptions)
        return firebaseApp
    } catch (error) {
        console.error({ error })
    }
}

let auth: Auth | null = null
let firestore: Firestore | null = null
let storage: FirebaseStorage | null = null

export const useAuth = () => {
    if (auth) return auth
    auth = getAuth(firebaseApp)

    if (useEmulator()) {
        const emulatorUrl = useEmulatorHostUrl()
        if (emulatorUrl) {
            connectAuthEmulator(auth, `http://${emulatorUrl}:9099`)
        }
    }
    return auth
}

export const useFirestore = () => {
    if (firestore) return firestore
    firestore = getFirestore(firebaseApp)
    if (useEmulator()) {
        const emulatorUrl = useEmulatorHostUrl()
        if (emulatorUrl) {
            connectFirestoreEmulator(firestore, useEmulatorHostUrl()!, 8080)
        }
    }

    return firestore
}

export const useStorage = () => {
    if (storage) return storage
    storage = getStorage(firebaseApp)
    if (useEmulator()) {
        const emulatorUrl = useEmulatorHostUrl()
        if (emulatorUrl) {
            connectStorageEmulator(storage, useEmulatorHostUrl()!, 9199)
        }
    }
    return storage
}
