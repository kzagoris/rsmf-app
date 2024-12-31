import { Add, ContentCopy, Delete, Edit, Preview } from "@mui/icons-material"
import {
    Box,
    Button,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Tooltip,
    Typography,
} from "@mui/material"
import { DataGrid, GridColDef, GridValueFormatterParams } from "@mui/x-data-grid"
import { Timestamp } from "firebase/firestore"
import { FunctionComponent, useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import ErrorView from "~/components/shared/ErrorView"
import LoadingView from "~/components/shared/LoadingView"
import { useFirestore } from "~/lib/firebase"
import { useCourseManagement } from "~/lib/useCourseManagement"
import { useMessageSystem } from "~/lib/useMessageSystem"
import { getVideoExamURLFromCourse } from "~/lib/videoCall"
import { Course } from "~/models/Course"

type Props = {}
const CoursesList: FunctionComponent<Props> = ({}) => {
    const firestore = useFirestore()
    const navigate = useNavigate()
    const { t } = useTranslation()
    const [, , { setInfo }] = useMessageSystem()
    const { getAllCourses, removeCourse } = useCourseManagement(firestore)
    const [coursesData, loading, error] = getAllCourses()

    if (loading) return <LoadingView />

    if (error) {
        return <ErrorView message={error.message} />
    }
    const columns: GridColDef<Course>[] = [
        { field: "name", headerName: t("Name"), flex: 1, type: "string", align: "center", headerAlign: "center" },
        { field: "code", headerName: t("Code"), flex: 1, type: "string", align: "center", headerAlign: "center" },
        {
            field: "startDate",
            headerName: t("Start Date"),
            flex: 1,
            align: "center",
            headerAlign: "center",
            valueFormatter: (params: GridValueFormatterParams<Timestamp>) =>
                params.value?.toDate().toLocaleDateString() || "",
        },
        {
            field: "duration",
            headerName: t("Duration"),
            width: 150,
            type: "number",
            align: "center",
            headerAlign: "center",
        },
        {
            field: "copyVideoUrl",
            headerName: t("Video URL"),
            headerAlign: "center",
            align: "center",
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            renderCell: (params) => (
                <Tooltip title={t("Click to copy")} placement="bottom">
                    <IconButton
                        aria-label="copy"
                        color="primary"
                        onClick={async () => {
                            await navigator.clipboard.writeText(getVideoExamURLFromCourse(params.row.id!))
                            setInfo(t("Video URL copied to clipboard"))
                        }}
                        sx={{ mr: 1 }}
                    >
                        <ContentCopy />
                    </IconButton>
                </Tooltip>
            ),
        },
        {
            field: "edit",
            headerName: t("Edit"),
            headerAlign: "center",
            align: "center",
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            renderCell: (params) => (
                <IconButton
                    aria-label="edit"
                    color="primary"
                    onClick={() => navigate(`/courses/create/${params.row.id}`)}
                    sx={{ mr: 1 }}
                >
                    <Edit />
                </IconButton>
            ),
        },
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
                    aria-label="edit"
                    color="primary"
                    onClick={() => navigate(`/courses/view/${params.row.id}`)}
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
            renderCell: (params) => <DeleteCourseButton course={params.row} />,
        },
    ]

    const DeleteCourseButton = ({ course }: { course: Course }) => {
        const [open, setOpen] = useState(false)
        const [, , { setError }] = useMessageSystem()
        const { t } = useTranslation()

        const handleOpen = () => setOpen(true)
        const handleClose = () => setOpen(false)

        const handleDelete = async () => {
            try {
                if (!course.id) {
                    return
                }
                await removeCourse(course)
                setInfo(t("Course deleted successfully"))
            } catch (error) {
                console.error(`${t("Error deleting course")}: `, error)
                setError((error as Error)?.message ?? t("Error deleting course"))
            }
            handleClose()
        }

        return (
            <>
                <IconButton color="error" aria-label="delete" onClick={handleOpen}>
                    <Delete />
                </IconButton>
                <Dialog open={open} onClose={handleClose}>
                    <DialogTitle>{t("Are you sure you want to delete this course?")}</DialogTitle>
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

    return (
        <Container sx={{ width: "100%" }}>
            <Typography sx={{ marginTop: "1em", textAlign: "center" }} variant="h4">
                {t("Current Courses List")}
            </Typography>
            <Box display="flex" justifyContent="flex-end">
                <Button
                    onClick={() => navigate("/courses/create")}
                    sx={{ marginTop: "5em" }}
                    variant="contained"
                    startIcon={<Add />}
                >
                    {t("Create New Course")}
                </Button>
            </Box>
            <DataGrid
                rowSpacingType="margin"
                density="comfortable"
                localeText={{
                    columnMenuLabel: t("Menu"),
                    columnMenuShowColumns: t("Show columns"),
                    columnMenuManageColumns: t("Manage columns"),
                    columnMenuFilter: t("Filter"),
                    columnMenuHideColumn: t("Hide column"),
                    columnMenuUnsort: t("Unsort"),
                    columnMenuSortAsc: t("Sort by ASC"),
                    columnMenuSortDesc: t("Sort by DESC"),
                    noRowsLabel: t("No Courses to display. Please Add a Course."),
                }}
                slotProps={{
                    pagination: {
                        labelRowsPerPage: t("Rows per page"),
                        labelDisplayedRows: ({ from, to, count }) => `${from}-${to} ${t("of")} ${count}`,
                    },
                }}
                disableRowSelectionOnClick
                loading={loading}
                isRowSelectable={() => false}
                autoHeight
                sx={{ marginTop: "5em", border: 0 }}
                rows={coursesData ?? []}
                columns={columns}
            />
        </Container>
    )
}

export default CoursesList
