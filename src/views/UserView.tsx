import { FunctionComponent, useState } from "react"
import {
    Box,
    Button,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Typography,
} from "@mui/material"
import { useCollectionData } from "react-firebase-hooks/firestore"
import { useFirestore } from "~/lib/firebase"
import { useNavigate, useParams } from "react-router-dom"
import { Delete, Add, Preview } from "@mui/icons-material"
import { collection, doc, deleteDoc } from "firebase/firestore"
import { DataGrid, GridColDef, GridValueFormatterParams } from "@mui/x-data-grid"
import { User, userConverter } from "~/models/User"
import LoadingView from "~/components/shared/LoadingView"
import ErrorView from "~/components/shared/ErrorView"
import { useTranslation } from "react-i18next"

type Props = {}

const UserView: FunctionComponent<Props> = ({}) => {
    const navigate = useNavigate()
    const { courseId } = useParams()
    const { t } = useTranslation()

    if (!courseId) {
        return <div>Course not found</div>
    }
    const firestore = useFirestore()
    const studentsRef = collection(firestore, "courses", courseId, "students").withConverter(userConverter)
    const [studentsData, loading, error] = useCollectionData<User>(studentsRef)

    if (loading) {
        return <LoadingView />
    }

    if (error) {
        return <ErrorView message={error.message} />
    }
    const columns: GridColDef<User>[] = [
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
            field: "status",
            headerName: t("Status"),
            flex: 1,
            align: "center",
            headerAlign: "center",
            valueFormatter: (params: GridValueFormatterParams<User["role"]>) => params.value.toLocaleUpperCase() || "",
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
                    onClick={() => navigate(`/person/view/${params.row.id}`)}
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
            renderCell: (params) => <RemoveStudentButton studentId={params.row.id!} />,
        },
    ]

    const RemoveStudentButton = ({ studentId }: { studentId: string }) => {
        const [open, setOpen] = useState(false)

        const handleOpen = () => setOpen(true)
        const handleClose = () => setOpen(false)

        const handleDelete = async () => {
            try {
                if (!courseId || !studentId) {
                    return
                }
                await deleteDoc(doc(firestore, "courses", courseId, "students", studentId))
            } catch (error) {
                console.error("Error deleting course: ", error)
            }
            handleClose()
        }

        return (
            <>
                <IconButton color="error" aria-label="delete" onClick={handleOpen}>
                    <Delete />
                </IconButton>
                <Dialog open={open} onClose={handleClose}>
                    <DialogTitle>{t("Are you sure you want to remove this student?")}</DialogTitle>
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
                {t("Course Management")}
            </Typography>
            <Box display="flex" justifyContent="flex-end">
                <Button sx={{ marginTop: "5em" }} variant="contained" startIcon={<Add />}>
                    {t("Add Student")}
                </Button>
                <Button
                    onClick={() => navigate(`/courses/create/${courseId}`)}
                    sx={{ marginTop: "5em", marginLeft: "2em" }}
                    color="secondary"
                    variant="contained"
                    startIcon={<Preview />}
                >
                    {t("Edit Course")}
                </Button>
            </Box>
            <DataGrid
                rowSpacingType="margin"
                density="comfortable"
                disableRowSelectionOnClick
                loading={loading}
                isRowSelectable={() => false}
                autoHeight
                slots={{
                    noRowsOverlay: () => (
                        <Box
                            display="flex"
                            flexDirection="column"
                            sx={{ height: "100%", width: "100%" }}
                            justifyContent="center"
                            alignItems="center"
                        >
                            <div>{t("No Students to display. Please Add Students.")}</div>
                        </Box>
                    ),
                }}
                sx={{ marginTop: "5em", border: 0 }}
                rows={studentsData ?? []}
                columns={columns}
            />
        </Container>
    )
}

export default UserView
