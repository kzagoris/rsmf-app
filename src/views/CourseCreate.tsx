import { Button, Card, CardContent, CardHeader, Container, Stack, TextField } from "@mui/material"
import { DateTimePicker } from "@mui/x-date-pickers"
import dayjs from "dayjs"
import { AuthError } from "firebase/auth"
import { Timestamp } from "firebase/firestore"
import { ChangeEvent, FormEvent, FunctionComponent, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate, useParams } from "react-router-dom"
import ErrorView from "~/components/shared/ErrorView"
import LoadingView from "~/components/shared/LoadingView"
import { useFirestore } from "~/lib/firebase"
import { useCourseManagement } from "~/lib/useCourseManagement"
import { useMessageSystem } from "~/lib/useMessageSystem"
import { Course } from "~/models/Course"

type Props = {}

const CourseCreate: FunctionComponent<Props> = ({}) => {
    type CourseFormErrors = Partial<Record<keyof Course, string>>
    const { t } = useTranslation()

    const [courseValues, setCourseValues] = useState<Course>({
        name: "",
        code: "",
        startDate: Timestamp.now(),
        duration: 0,
        description: "",
    })

    const [, , { setError }] = useMessageSystem()

    const [formErrors, setFormErrors] = useState<CourseFormErrors>({})

    const firestore = useFirestore()
    const navigate = useNavigate()
    const { courseId } = useParams()
    const { getCourseData, addCourse, updateCourse } = useCourseManagement(firestore)

    const [courseData, isCourseLoading, courseError] = getCourseData(courseId)

    useEffect(() => {
        if (courseData) {
            const { name, code, startDate, duration, description } = courseData
            setCourseValues({
                name,
                code,
                startDate,
                duration,
                description,
            })
        }
    }, [courseData])

    const handleFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        // validate the form
        const errors: CourseFormErrors = {}
        if (!courseValues.name) {
            errors.name = t("Name is required")
        }
        if (!courseValues.code) {
            errors.code = t("Code is required")
        }
        if (!courseValues.startDate) {
            errors.startDate = t("Start Date is required")
        }
        if (courseValues.duration <= 0) {
            errors.duration = t("Duration must be greater than 0")
        }

        setFormErrors(errors)

        if (Object.keys(errors).length > 0) return
        try {
            if (courseId) {
                if (!courseData) return
                await updateCourse(courseData, { ...courseValues, id: courseId })
                navigate(`/courses/view/${courseId}`)
            } else {
                const addedCourseRef = await addCourse(courseValues)
                navigate(`/courses/view/${addedCourseRef.id}`)
            }
        } catch (e) {
            console.error(e)
            const authError = e as AuthError
            if (authError) {
                setError(authError.message)
            } else {
                setError(t("Unknown error"))
            }
        }
    }

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target
        setCourseValues((prevState) => ({
            ...prevState,
            [name]: name === "duration" ? parseInt(value) : value,
        }))
    }

    const handleStartDateChange = (value: dayjs.Dayjs | null) => {
        if (value === null) return
        setCourseValues((prevState) => ({
            ...prevState,
            startDate: Timestamp.fromDate(new Date(value.toDate())),
        }))
    }
    const handleDurationChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target
        setCourseValues((prevState) => ({
            ...prevState,
            [name]: Math.max(parseInt(value) || 0, 0),
        }))
    }

    const handleDescriptionChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        const { name, value } = event.target
        setCourseValues((prevState) => ({
            ...prevState,
            [name]: value,
        }))
    }

    if (isCourseLoading) {
        return <LoadingView />
    }

    if (courseError) {
        return <ErrorView message={courseError.message} />
    }

    return (
        <form onSubmit={handleFormSubmit}>
            <Container
                maxWidth="md"
                sx={{
                    mt: 5,
                    display: "flex",
                    justifyContent: "center",
                    flexDirection: "column",
                }}
            >
                <Card
                    variant="outlined"
                    sx={{ flexGrow: 0, padding: "1em", minWidth: "500px", borderColor: "primary.main" }}
                >
                    <CardHeader title={t("Courses Management")} />
                    <CardContent>
                        <Stack spacing={2}>
                            <TextField
                                label={t("Name")}
                                variant="outlined"
                                name="name"
                                value={courseValues.name}
                                onChange={handleInputChange}
                                fullWidth
                                error={!!formErrors.name}
                                helperText={formErrors.name}
                            />
                            <TextField
                                label={t("Code")}
                                variant="outlined"
                                name="code"
                                value={courseValues.code}
                                onChange={handleInputChange}
                                fullWidth
                                error={!!formErrors.code}
                                helperText={formErrors.code}
                            />
                            <DateTimePicker
                                ampm={false}
                                label={t("Start Date")}
                                value={dayjs(courseValues.startDate.toDate())}
                                onChange={handleStartDateChange}
                                views={["year", "month", "day", "hours", "minutes"]}
                            />
                            <TextField
                                label={t("Duration (in minutes)")}
                                variant="outlined"
                                name="duration"
                                type="number"
                                value={courseValues.duration}
                                onChange={handleDurationChange}
                                InputProps={{ inputProps: { min: 0 } }}
                                fullWidth
                                error={!!formErrors.duration}
                                helperText={formErrors.duration}
                            />
                            <TextField
                                label={t("Description")}
                                variant="outlined"
                                name="description"
                                value={courseValues.description}
                                onChange={handleDescriptionChange}
                                multiline
                                rows={5}
                                fullWidth
                                sx={{ resize: "vertical" }}
                            />
                            <Button type="submit" variant="contained">
                                {courseId ? t("Update") : t("Create")}
                            </Button>
                        </Stack>
                    </CardContent>
                </Card>
            </Container>
        </form>
    )
}

export default CourseCreate
