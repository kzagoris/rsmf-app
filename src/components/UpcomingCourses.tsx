import { Card, CardContent, CardHeader, List, Typography } from "@mui/material"
import dayjs from "dayjs"
import { collection, onSnapshot } from "firebase/firestore"
import { FunctionComponent, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import JoinCourseListItem from "~/components/JoinCourseListItem"
import { useUserContext } from "~/components/contexts/UserContext"
import ErrorView from "~/components/shared/ErrorView"
import LoadingView from "~/components/shared/LoadingView"
import { useFirestore } from "~/lib/firebase"
import { useUserInfo } from "~/lib/useUserManagement"
import { Course, courseConverter } from "~/models/Course"

type props = {}

const UpcomingCourses: FunctionComponent<props> = ({}) => {
    const firestore = useFirestore()
    const { state } = useUserContext()
    const { t } = useTranslation()
    const [userData, loadingUserData, errorUserData] = useUserInfo(firestore, state.currentUser?.uid ?? null)
    const [courses, setCourses] = useState<Course[]>([])

    const upcomingCourses = courses
        .filter((course) => dayjs().subtract(course.duration, "minute").isBefore(dayjs(course.startDate.toDate())))
        .sort((a, b) => {
            return a.startDate.toMillis() - b.startDate.toMillis()
        })
    const previousCourses = courses
        .filter((course) => dayjs().subtract(course.duration, "minute").isAfter(dayjs(course.startDate.toDate())))
        .sort((a, b) => {
            return b.startDate.toMillis() - a.startDate.toMillis()
        })

    useEffect(() => {
        if (userData?.role === "admin") {
            const coursesRef = collection(firestore, "courses").withConverter(courseConverter)
            const unsubscribe = onSnapshot(coursesRef, (snapshot) => {
                const courses = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) satisfies Course[]
                setCourses(courses)
            })
            return () => unsubscribe()
        } else {
            setCourses(userData?.courses ?? [])
        }
    }, [userData?.role])

    if (loadingUserData) return <LoadingView />
    if (errorUserData) return <ErrorView message={errorUserData.message} />

    return (
        <>
            <Card sx={{ flexGrow: 0, mt: 10, padding: 2, borderColor: "primary.main" }} variant="outlined">
                <CardHeader title={t("Upcoming Courses Exams")} />
                <CardContent>
                    <List component="nav">
                        {upcomingCourses.length === 0 ? (
                            <Typography variant="subtitle2" color="text.secondary">
                                {t("There is not any upcoming course exam.")}
                            </Typography>
                        ) : (
                            upcomingCourses.map((course) => <JoinCourseListItem course={course} key={course.id} />)
                        )}
                    </List>
                </CardContent>
            </Card>

            <Card sx={{ flexGrow: 0, mt: 10, padding: 2, borderColor: "secondary.main" }} variant="elevation">
                <CardHeader title={t("Previous Courses Exams")} />
                <CardContent>
                    <List component="nav">
                        {previousCourses.length === 0 ? (
                            <Typography variant="subtitle2" color="text.secondary">
                                {t("There is not any previous course exam.")}
                            </Typography>
                        ) : (
                            previousCourses.map((course) => <JoinCourseListItem course={course} key={course.id} />)
                        )}
                    </List>
                </CardContent>
            </Card>
        </>
    )
}

export { UpcomingCourses as default }
