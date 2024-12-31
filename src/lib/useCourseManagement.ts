import {
    Firestore,
    addDoc,
    arrayRemove,
    arrayUnion,
    collection,
    doc,
    getDocs,
    orderBy,
    query,
    where,
    writeBatch,
} from "firebase/firestore"
import { useCollectionData, useDocumentData } from "react-firebase-hooks/firestore"
import { Course, courseConverter } from "~/models/Course"
import { CourseParticipant, courseParticipantConverter } from "~/models/CourseParticipant"
import { User, userConverter } from "~/models/User"

export const useCourseManagement = (firestore: Firestore) => {
    const getAllCourses = () => {
        const coursesRef = collection(firestore, "courses").withConverter(courseConverter)
        return useCollectionData<Course>(query(coursesRef, orderBy("startDate", "desc")))
    }

    const getCourseData = (courseId: string | undefined | null) => {
        const courseRef = courseId ? doc(firestore, "courses", courseId).withConverter(courseConverter) : null
        return useDocumentData<Course>(courseRef)
    }

    const getCourseStudents = (courseId: string | undefined | null) => {
        const studentsRef = courseId
            ? collection(firestore, "courses", courseId, "students").withConverter(courseParticipantConverter)
            : null
        return useCollectionData<CourseParticipant>(studentsRef)
    }

    const getCourseProctors = (courseId: string | undefined | null) => {
        const proctorsRef = courseId
            ? collection(firestore, "courses", courseId, "proctors").withConverter(courseParticipantConverter)
            : null
        return useCollectionData<CourseParticipant>(proctorsRef)
    }

    const getStudents = () => {
        return useCollectionData<User>(
            query(collection(firestore, "users").withConverter(userConverter), where("role", "==", "student")),
        )
    }

    const addStudentToCourse = (course: Course, student: User) => {
        if (!student.id) throw new Error("Student id is not defined")
        if (!course.id) throw new Error("Course id is not defined")

        const batch = writeBatch(firestore)
        const courseStudentRef = doc(collection(firestore, "courses", course.id, "students"), student.id).withConverter(
            courseParticipantConverter,
        )
        const participant: CourseParticipant = {
            firstName: student.firstName,
            lastName: student.lastName,
            email: student.email,
            role: "student",
        }
        batch.set(courseStudentRef, participant)
        const studentRef = doc(firestore, "users", student.id).withConverter(userConverter)
        batch.update(studentRef, { courses: arrayUnion(course) })
        return batch.commit()
    }
    const removeStudentFromCourse = (course: Course, userId: string) => {
        if (!course.id) throw new Error("Course id is not defined")
        const batch = writeBatch(firestore)
        const courseStudentRef = doc(collection(firestore, "courses", course.id, "students"), userId).withConverter(
            courseParticipantConverter,
        )
        batch.delete(courseStudentRef)
        const studentRef = doc(firestore, "users", userId).withConverter(userConverter)
        batch.update(studentRef, { courses: arrayRemove(course) })
        return batch.commit()
    }
    const addProctorToCourse = (course: Course, proctor: User) => {
        if (!proctor.id) throw new Error("Proctor id is not defined")
        if (!course.id) throw new Error("Course id is not defined")
        const batch = writeBatch(firestore)
        const courseProctorRef = doc(collection(firestore, "courses", course.id, "proctors"), proctor.id).withConverter(
            courseParticipantConverter,
        )
        const participant: CourseParticipant = {
            firstName: proctor.firstName,
            lastName: proctor.lastName,
            email: proctor.email,
            role: "proctor",
        }
        batch.set(courseProctorRef, participant)
        const proctorRef = doc(firestore, "users", proctor.id).withConverter(userConverter)
        batch.update(proctorRef, { courses: arrayUnion(course) })
        return batch.commit()
    }
    const removeProctorFromCourse = (course: Course, userId: string) => {
        if (!course.id) throw new Error("Course id is not defined")
        const batch = writeBatch(firestore)
        const courseProctorRef = doc(collection(firestore, "courses", course.id, "proctors"), userId).withConverter(
            courseParticipantConverter,
        )
        batch.delete(courseProctorRef)
        const proctorRef = doc(firestore, "users", userId).withConverter(userConverter)
        batch.delete(proctorRef)
        return batch.commit()
    }

    const updateCourse = async (previousCourse: Course, course: Course) => {
        if (!course.id) throw new Error("Course id is not defined")
        const courseRef = doc(firestore, "courses", course.id).withConverter(courseConverter)
        const courseParticipantDocs = await getDocs(
            query(
                collection(firestore, "users").withConverter(userConverter),
                where("courses", "array-contains", previousCourse),
            ),
        )

        const batch = writeBatch(firestore)
        batch.set(courseRef, course)
        courseParticipantDocs.forEach((userDoc) => {
            const updatedCourses = userDoc
                .data()
                .courses.map((userCourse) => (userCourse.id === course.id ? course : userCourse))
            batch.update(userDoc.ref, { courses: updatedCourses })
        })
        await batch.commit()
    }

    const addCourse = async (course: Course) => {
        return await addDoc(collection(firestore, "courses"), course)
    }

    const removeCourse = async (course: Course) => {
        if (!course.id) throw new Error("Course id is not defined")

        const courseRef = doc(firestore, "courses", course.id).withConverter(courseConverter)
        const studentsRef = collection(firestore, "courses", course.id, "students").withConverter(
            courseParticipantConverter,
        )

        const proctorsRef = collection(firestore, "courses", course.id, "proctors").withConverter(
            courseParticipantConverter,
        )

        const courseParticipantDocs = await getDocs(
            query(
                collection(firestore, "users").withConverter(userConverter),
                where("courses", "array-contains", course),
            ),
        )

        const batch = writeBatch(firestore)
        courseParticipantDocs.forEach((userDoc) => {
            const updatedCourses = userDoc.data().courses.filter((userCourse) => userCourse.id !== course.id)
            batch.update(userDoc.ref, { courses: updatedCourses })
        })

        // Delete students collection
        const students = await getDocs(studentsRef)
        students.forEach((student) => {
            batch.delete(doc(studentsRef, student.id))
        })

        // Delete proctors collection
        const proctors = await getDocs(proctorsRef)
        proctors.forEach((proctor) => {
            batch.delete(doc(proctorsRef, proctor.id))
        })

        batch.delete(courseRef)
        await batch.commit()
    }

    return {
        getAllCourses,
        getCourseStudents,
        getStudents,
        getCourseProctors,
        addStudentToCourse,
        removeStudentFromCourse,
        addProctorToCourse,
        removeProctorFromCourse,
        getCourseData,
        removeCourse,
        addCourse,
        updateCourse,
    }
}
