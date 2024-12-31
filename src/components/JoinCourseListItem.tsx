import { FunctionComponent, useMemo } from "react"
import { Course } from "~/models/Course"
import { Button, ListItem, ListItemText } from "@mui/material"
import { isOpenToJoin } from "~/lib/helperFunctions"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"

type props = {
    course: Course
}
const JoinCourseListItem: FunctionComponent<props> = ({ course }) => {
    const navigate = useNavigate()
    const { t } = useTranslation()
    const handleJoinCourse = (course: Course) => {
        navigate(`/video-exam/${course.id}`)
    }

    const openToJoin = useMemo(() => isOpenToJoin(course), [course])

    return (
        <ListItem
            secondaryAction={
                <Button
                    sx={{ width: 170 }}
                    disabled={!openToJoin}
                    onClick={() => handleJoinCourse(course)}
                    variant="contained"
                    color="primary"
                >
                    {openToJoin ? "Join" : "Closed"}
                </Button>
            }
        >
            <ListItemText
                primary={`${course.code} - ${course.name}`}
                secondary={t("courseStart", {
                    date: course.startDate.toDate().toLocaleDateString(),
                    time: course.startDate.toDate().toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                    }),
                    duration: course.duration,
                })}
            />
        </ListItem>
    )
}
export { JoinCourseListItem as default }
