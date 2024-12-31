import { FirebaseStorage, getDownloadURL, ref, uploadBytes } from "firebase/storage"

export const useVideoRecordingStorage = (storage: FirebaseStorage) => {
    const uploadVideo = async (video: Blob, courseId: string, userId: string) => {
        const storageRef = ref(storage, `exams/${courseId}/${userId}_${Date.now()}`)
        const snapshot = await uploadBytes(storageRef, video)
        const url = await getDownloadURL(storageRef)
        return { snapshot, url }
    }

    return { uploadVideo }
}
