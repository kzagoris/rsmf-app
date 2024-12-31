export type ConferenceObject = {
    room: string
    serverURL?: string
}

export function createConferenceObjectFromURL(inputURL: string): ConferenceObject | undefined {
    const lastIndexOfSlash = inputURL.lastIndexOf("/")
    let room
    let serverURL

    if (lastIndexOfSlash === -1) {
        // This must be only the room name.
        room = inputURL
    } else {
        // Take the substring after last slash to be the room name.
        room = inputURL.substring(lastIndexOfSlash + 1)

        // Take the substring before last slash to be the Server URL.
        serverURL = inputURL.substring(0, lastIndexOfSlash)

        // Normalize the server URL.
        serverURL = normalizeServerURL(serverURL)
    }

    // Don't navigate if no room was specified.
    if (!room) {
        return
    }

    return {
        room,
        serverURL,
    }
}

export const BASE_URL = import.meta.env.VITE_BASE_URL
export function getRoomNameFromCourse(id: string, codeCourse: string) {
    return `${codeCourse.replace(/\s/g, "")}-${id}`
}

export function getVideoExamURLFromCourse(id: string) {
    return `${BASE_URL}/video-exam/${id}`
}

/**
 * Normalizes the given server URL, so it has the proper scheme.
 *
 * @param {string} url - URL with or without scheme.
 * @returns {string}
 */
export function normalizeServerURL(url: string) {
    // eslint-disable-next-line no-param-reassign
    url = url.trim()

    if (url && url.indexOf("://") === -1) {
        return `https://${url}`
    }

    return url
}
