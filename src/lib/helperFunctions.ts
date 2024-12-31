import { type QueryDocumentSnapshot } from "@firebase/firestore"
import dayjs from "dayjs"
import { Course } from "~/models/Course"

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export const converter = <T>() => ({
    toFirestore: (data: T) => data,
    fromFirestore: (snap: QueryDocumentSnapshot) => snap.data() as T,
})

export function isOpenToJoin(course: Course) {
    const now = dayjs()
    const courseStart = dayjs(course.startDate.toDate()).subtract(10, "minute")
    const courseEnd = dayjs(course.startDate.toDate()).add(course.duration, "minute")
    return now.isAfter(courseStart) && now.isBefore(courseEnd)
}

export function validateEmail(email: string): boolean {
    const re = /\S+@\S+\.\S+/
    return re.test(email)
}

export function capitalizeEachWordString(msg: string) {
    return msg.replace(/(?:^|\s)\S/g, function (a) {
        return a.toUpperCase()
    })
}

export function getFirstName(name: string | undefined | null) {
    if (!name) return null
    const nameArray = name.trim().split(" ")
    if (nameArray.length === 0) {
        return null
    }
    if (nameArray.length >= 1) {
        return nameArray[0]
    }
    return null
}

export function getLastName(name: string | undefined | null) {
    if (!name) return null
    const nameArray = name.trim().split(" ")
    if (nameArray.length === 0) {
        return null
    }
    if (nameArray.length >= 2) {
        return nameArray[1]
    }
    return null
}

export function stringToColor(string: string) {
    let hash = 0
    let i

    /* eslint-disable no-bitwise */
    for (i = 0; i < string.length; i += 1) {
        hash = string.charCodeAt(i) + ((hash << 5) - hash)
    }

    let color = "#"

    for (i = 0; i < 3; i += 1) {
        const value = (hash >> (i * 8)) & 0xff
        color += `00${value.toString(16)}`.slice(-2)
    }
    /* eslint-enable no-bitwise */

    return color
}
export function stringAvatar(name: string | undefined | null) {
    if (!name) return { children: "?" }
    const nameArray = name.trim().split(" ")
    if (nameArray.length === 0) {
        return { children: "?" }
    }
    if (nameArray.length === 1) {
        return {
            sx: {
                bgcolor: stringToColor(name),
            },
            children: `${nameArray[0][0].toUpperCase()}${nameArray[0][1].toUpperCase() ?? ""}`,
        }
    }
    return {
        sx: {
            bgcolor: stringToColor(name),
        },
        children: `${nameArray[0][0].toUpperCase()}${nameArray[1][0].toUpperCase()}`,
    }
}
