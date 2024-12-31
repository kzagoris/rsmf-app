import { Button, Card, CardContent, CardHeader, Container, Stack, TextField } from "@mui/material"
import { AuthError } from "firebase/auth"
import { addDoc, collection, doc, setDoc, Timestamp } from "firebase/firestore"
import { ChangeEvent, FormEvent, FunctionComponent, useEffect, useState } from "react"
import { useDocumentData } from "react-firebase-hooks/firestore"
import { useNavigate, useParams } from "react-router-dom"
import { useMessageSystem } from "~/lib/useMessageSystem"
import { useFirestore } from "~/lib/firebase"
import { Course } from "~/models/Course"
import { useTranslation } from "react-i18next"

type Props = {}
type CourseFormErrors = Partial<Record<keyof Course, string>>

const UserCreate: FunctionComponent<Props> = ({}) => {
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
    const courseRef = courseId ? doc(collection(firestore, "courses"), courseId) : null

    // Load course data from Firestore
    const [courseData, isCourseLoading, courseError] = useDocumentData(courseRef)

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

        if (Object.keys(errors).length === 0) {
            console.log(courseValues)
            try {
                if (courseId && courseRef) {
                    await setDoc(courseRef, courseValues)
                    navigate(`/courses/view/${courseRef.id}`)
                } else {
                    const addedCourseRef = await addDoc(collection(firestore, "courses"), courseValues)
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
    }

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target
        setCourseValues((prevState) => ({
            ...prevState,
            [name]: name === "duration" ? parseInt(value) : value,
        }))
    }

    const handleStartDateChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target
        setCourseValues((prevState) => ({
            ...prevState,
            [name]: Timestamp.fromDate(new Date(value)),
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
                            <TextField
                                label={t("Start Date")}
                                variant="outlined"
                                name="startDate"
                                type="date"
                                value={courseValues.startDate.toDate().toISOString().slice(0, 10)}
                                onChange={handleStartDateChange}
                                InputLabelProps={{ shrink: true }}
                                fullWidth
                                error={!!formErrors.startDate}
                                helperText={formErrors.startDate}
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

export default UserCreate
