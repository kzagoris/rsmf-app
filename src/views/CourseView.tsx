import { Add, Delete, Preview } from "@mui/icons-material"
import {
    Autocomplete,
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Modal,
    Stack,
    Tab,
    Tabs,
    TextField,
    Typography,
} from "@mui/material"
import { grey } from "@mui/material/colors"
import { DataGrid, GridColDef } from "@mui/x-data-grid"
import { FormEvent, FunctionComponent, SyntheticEvent, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate, useParams } from "react-router-dom"
import ErrorView from "~/components/shared/ErrorView"
import LoadingView from "~/components/shared/LoadingView"
import { useFirestore } from "~/lib/firebase"
import { useCourseManagement } from "~/lib/useCourseManagement"
import { useMessageSystem } from "~/lib/useMessageSystem"
import { useUserManagement } from "~/lib/useUserManagement"
import { CourseParticipant } from "~/models/CourseParticipant"
import { User, UserRoleType } from "~/models/User"

type Props = {}

const CourseView: FunctionComponent<Props> = ({}) => {
    const navigate = useNavigate()
    const { t } = useTranslation()
    const { courseId } = useParams()

    const firestore = useFirestore()

    const {
        getCourseStudents,
        getCourseProctors,
        removeStudentFromCourse,
        addStudentToCourse,
        addProctorToCourse,
        removeProctorFromCourse,
        getCourseData,
    } = useCourseManagement(firestore)

    const { useUsers } = useUserManagement(firestore)

    const [courseStudentsData, loadingStudentsData, errorStudentsData] = getCourseStudents(courseId)
    const [courseProctorsData, loadingProctorsData, errorProctorsData] = getCourseProctors(courseId)

    const [addUser, setAddUser] = useState<User | null>(null)
    const [tabValue, setTabValue] = useState(0)
    const [addParticipantModal, setAddParticipantModal] = useState<{ open: boolean; type: UserRoleType }>({
        open: false,
        type: "student",
    })

    const [usersData, loadingUsersData, errorUsersData] = useUsers()
    const [courseData, loadingCourseData, errorCourseData] = getCourseData(courseId)
    const [, , { setError, setInfo }] = useMessageSystem()
    const handleAddParticipantModalOpen = (type: UserRoleType) => setAddParticipantModal({ open: true, type })
    const handleAddParticipantModalClose = () => {
        setAddParticipantModal({ open: false, type: addParticipantModal.type })
        setAddUser(null)
    }
    const handleTabChange = (event: SyntheticEvent, newValue: number) => {
        setTabValue(newValue)
    }

    const filterUsers = useMemo(() => {
        const users = usersData
        const role = addParticipantModal.type
        if (!users) return []
        const roleBasedUsers = users.filter((user) => user.role === role)
        if (role === "student") {
            return roleBasedUsers.filter((user) => !courseStudentsData?.some((student) => student.id === user.id))
        } else {
            return roleBasedUsers.filter((user) => !courseProctorsData?.some((proctor) => proctor.id === user.id))
        }
    }, [courseStudentsData, courseProctorsData, usersData, addParticipantModal.type])

    const handleAddParticipantModalSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (!addUser || !courseId || !courseData) return
        try {
            if (addParticipantModal.type === "student") {
                await addStudentToCourse(courseData, addUser)
                setInfo(t("Student added"))
                setTabValue(1)
            } else {
                await addProctorToCourse(courseData, addUser)
                setInfo(t("Proctor added"))
                setTabValue(0)
            }
        } catch (error) {
            setError(t("Error adding user"))
            console.error("Error adding user: ", error)
        }
        setAddUser(null)
        setAddParticipantModal({ open: false, type: addParticipantModal.type })
    }

    const participantColumns: GridColDef<CourseParticipant>[] = [
        {
            field: "firstName",
            headerName: t("First Name"),
            flex: 1,
            type: "string",
            align: "center",
            headerAlign: "center",
        },
        {
            field: "lastName",
            headerName: t("Last Name"),
            flex: 1,
            type: "string",
            align: "center",
            headerAlign: "center",
        },
        { field: "email", headerName: t("Email"), flex: 1, type: "string", align: "center", headerAlign: "center" },
        {
            field: "view",
            headerName: t("View"),
            headerAlign: "center",
            align: "center",
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            renderCell: (params) => (
                <IconButton
                    aria-label="view"
                    color="primary"
                    onClick={() => navigate(`/profile/${params.row.id}`)}
                    sx={{ mr: 1 }}
                >
                    <Preview />
                </IconButton>
            ),
        },
        {
            field: "delete",
            headerName: t("Delete"),
            headerAlign: "center",
            sortable: false,
            align: "center",
            filterable: false,
            disableColumnMenu: true,
            renderCell: (params) => <RemoveParticipantButton participantId={params.row.id!} role={params.row.role} />,
        },
    ]

    const RemoveParticipantButton = ({ participantId, role }: { participantId: string; role: UserRoleType }) => {
        const [open, setOpen] = useState(false)

        const handleOpen = () => setOpen(true)
        const handleClose = () => setOpen(false)

        const type = role === "student" ? t("student") : t("proctor")

        const handleDelete = async () => {
            try {
                if (!courseData || !participantId) {
                    return
                }
                if (role === "student") {
                    await removeStudentFromCourse(courseData, participantId)
                } else {
                    await removeProctorFromCourse(courseData, participantId)
                }

                setInfo(t("removed from course", { type }))
            } catch (error) {
                setError(t("error removing", { type }))
                console.error("Error removing: ", error)
            }
            handleClose()
        }

        return (
            <>
                <IconButton color="error" aria-label="delete" onClick={handleOpen}>
                    <Delete />
                </IconButton>
                <Dialog open={open} onClose={handleClose}>
                    <DialogTitle>{t("Are you sure?")}?</DialogTitle>
                    <DialogContent>
                        <p>{t("This action cannot be undone.")}</p>
                    </DialogContent>
                    <DialogActions>
                        <Button color="secondary" onClick={handleClose}>
                            {t("Cancel")}
                        </Button>
                        <Button onClick={handleDelete} variant="contained" color="error">
                            {t("Delete")}
                        </Button>
                    </DialogActions>
                </Dialog>
            </>
        )
    }

    if (!courseId) {
        return <ErrorView message="Course not found" />
    }

    if (errorStudentsData) {
        return <ErrorView message={errorStudentsData.message} />
    }
    if (errorProctorsData) {
        return <ErrorView message={errorProctorsData.message} />
    }
    if (errorCourseData) {
        return <ErrorView message={errorCourseData.message} />
    }
    if (errorUsersData) {
        return <ErrorView message={errorUsersData.message} />
    }

    if (loadingStudentsData || loadingCourseData || loadingProctorsData || loadingUsersData) {
        return <LoadingView />
    }

    return (
        <Container sx={{ width: "100%", backgroundColor: grey.A100 }}>
            <Typography sx={{ marginTop: "1em", textAlign: "center" }} variant="h4">
                {courseData?.code ?? ""} - {courseData?.name ?? ""}
            </Typography>
            <Typography sx={{ marginTop: "1em" }} variant="subtitle1">
                {courseData?.description ?? ""}
            </Typography>
            <Box display="flex" justifyContent="flex-end">
                <Button
                    onClick={() => handleAddParticipantModalOpen("student")}
                    sx={{ marginTop: 7 }}
                    variant="contained"
                    startIcon={<Add />}
                >
                    {t("Add Student")}
                </Button>
                <Button
                    onClick={() => handleAddParticipantModalOpen("proctor")}
                    sx={{ marginTop: 7, marginLeft: 3 }}
                    variant="contained"
                    color="secondary"
                    startIcon={<Add />}
                >
                    {t("Add Proctor")}
                </Button>
                <Button
                    onClick={() => navigate(`/courses/create/${courseId}`)}
                    sx={{ marginTop: 7, marginLeft: 3 }}
                    color="warning"
                    variant="outlined"
                    startIcon={<Preview />}
                >
                    {t("Edit Course")}
                </Button>
                <Modal
                    open={addParticipantModal.open}
                    onClose={handleAddParticipantModalClose}
                    aria-labelledby="modal-title"
                    aria-describedby="modal-description"
                >
                    <form onSubmit={handleAddParticipantModalSubmit}>
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                height: "80vh",
                            }}
                        >
                            <Card variant="outlined" sx={{ flexGrow: 0, padding: "1em", borderColor: "primary.main" }}>
                                <CardHeader
                                    title={`Add ${
                                        addParticipantModal.type === "student" ? t("student") : t("proctor")
                                    }`}
                                />
                                <CardContent>
                                    <Stack sx={{ minWidth: "500px" }} spacing={2}>
                                        <Autocomplete
                                            options={filterUsers}
                                            getOptionLabel={(option) =>
                                                `${option.firstName ?? ""} ${option.lastName ?? ""} ${option.email}`
                                            }
                                            renderOption={(props, option) => (
                                                <Box component="li" {...props} key={option.id}>
                                                    {option.firstName} {option.lastName} {option.email}
                                                </Box>
                                            )}
                                            noOptionsText={`No ${addParticipantModal.type} found`}
                                            isOptionEqualToValue={(option, value) => option.id === value.id}
                                            value={addUser}
                                            onChange={(event, newValue) => setAddUser(newValue)}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label={t("Search by Name/Email")}
                                                    variant="outlined"
                                                />
                                            )}
                                        />
                                        <Stack direction="row" spacing={2}>
                                            <Button
                                                variant="outlined"
                                                color="error"
                                                onClick={handleAddParticipantModalClose}
                                            >
                                                {t("Cancel")}
                                            </Button>
                                            <Button variant="contained" type="submit">
                                                {t("Add")}
                                            </Button>
                                        </Stack>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Box>
                    </form>
                </Modal>
            </Box>
            <Box sx={{ borderBottom: 1, borderColor: "divider", marginTop: 10 }}>
                <Tabs value={tabValue} onChange={handleTabChange} aria-label="Proctors/Students" centered>
                    <Tab label={t("Proctors")} />
                    <Tab label={t("Students")} />
                </Tabs>
            </Box>
            {tabValue === 0 && (
                <DataGrid
                    rowSpacingType="margin"
                    density="comfortable"
                    disableRowSelectionOnClick
                    loading={loadingStudentsData}
                    isRowSelectable={() => false}
                    localeText={{
                        columnMenuLabel: t("Menu"),
                        columnMenuShowColumns: t("Show columns"),
                        columnMenuManageColumns: t("Manage columns"),
                        columnMenuFilter: t("Filter"),
                        columnMenuHideColumn: t("Hide column"),
                        columnMenuUnsort: t("Unsort"),
                        columnMenuSortAsc: t("Sort by ASC"),
                        columnMenuSortDesc: t("Sort by DESC"),
                        noRowsLabel: t("No Proctors to display. Please Add Proctors."),
                    }}
                    slotProps={{
                        pagination: {
                            labelRowsPerPage: t("Rows per page"),
                            labelDisplayedRows: ({ from, to, count }) => `${from}-${to} ${t("of")} ${count}`,
                        },
                    }}
                    autoHeight
                    sx={{ marginTop: 1, border: 0 }}
                    rows={courseProctorsData ?? []}
                    columns={participantColumns}
                />
            )}
            {tabValue === 1 && (
                <DataGrid
                    rowSpacingType="margin"
                    density="comfortable"
                    disableRowSelectionOnClick
                    loading={loadingStudentsData}
                    isRowSelectable={() => false}
                    autoHeight
                    localeText={{
                        columnMenuLabel: t("Menu"),
                        columnMenuShowColumns: t("Show columns"),
                        columnMenuManageColumns: t("Manage columns"),
                        columnMenuFilter: t("Filter"),
                        columnMenuHideColumn: t("Hide column"),
                        columnMenuUnsort: t("Unsort"),
                        columnMenuSortAsc: t("Sort by ASC"),
                        columnMenuSortDesc: t("Sort by DESC"),
                        noRowsLabel: t("No Students to display. Please Add Students."),
                    }}
                    slotProps={{
                        pagination: {
                            labelRowsPerPage: t("Rows per page"),
                            labelDisplayedRows: ({ from, to, count }) => `${from}-${to} ${t("of")} ${count}`,
                        },
                    }}
                    sx={{ marginTop: 1, border: 0 }}
                    rows={courseStudentsData ?? []}
                    columns={participantColumns}
                />
            )}
        </Container>
    )
}

export default CourseView
