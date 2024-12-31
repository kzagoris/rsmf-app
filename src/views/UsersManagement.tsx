import { Add, Delete, Preview } from "@mui/icons-material"
import {
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
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    Modal,
    Select,
    SelectChangeEvent,
    Stack,
    TextField,
    Typography,
} from "@mui/material"
import { DataGrid, GridColDef, GridFooter, GridValueFormatterParams } from "@mui/x-data-grid"
import { ChangeEvent, FormEvent, FunctionComponent, useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import ErrorView from "~/components/shared/ErrorView"
import LoadingView from "~/components/shared/LoadingView"
import { useFirestore } from "~/lib/firebase"
import { useMessageSystem } from "~/lib/useMessageSystem"
import { useUserManagement } from "~/lib/useUserManagement"
import { User, UserRoleType } from "~/models/User"

type Props = {}

const UsersManagement: FunctionComponent<Props> = ({}) => {
    const navigate = useNavigate()
    const { t } = useTranslation()

    const firestore = useFirestore()
    const [openModel, setOpenModel] = useState(false)
    const [email, setEmail] = useState<string>("")
    const [emailError, setEmailError] = useState(false)
    const [role, setRole] = useState<UserRoleType>("student")

    const [, , { setError, setInfo }] = useMessageSystem()
    const { addUser, useUsers, deleteUser } = useUserManagement(firestore)
    const [usersData, loading, error] = useUsers()

    const handleModelOpen = () => setOpenModel(true)
    const handleModelClose = () => setOpenModel(false)

    const handleModalUserSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (validateEmail(email)) {
            try {
                handleModelClose()
                await addUser(email, role)
                setInfo(t("User added successfully"))
                setEmail("")
                setRole("student")
            } catch (error) {
                setError((error as Error).message)
            }
        } else {
            setEmailError(true)
        }
    }

    const handleUserEmailChange = (event: ChangeEvent<HTMLInputElement>) => {
        setEmail(event.target.value)
        setEmailError(false)
    }

    const handleUserRoleChange = (event: SelectChangeEvent<UserRoleType>) => {
        const value = event.target.value
        if (value === "student" || value === "proctor" || value === "admin") {
            setRole(value)
        }
    }

    const validateEmail = (email: string) => {
        // Basic email validation regex
        const emailRegex = /^\S+@\S+\.\S+$/
        return emailRegex.test(email)
    }

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
        { field: "role", headerName: t("Role"), flex: 1, type: "string", align: "center", headerAlign: "center" },
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
            renderCell: (params) => <RemoveUserButton student={params.row} />,
        },
    ]

    const RemoveUserButton = ({ student }: { student: User }) => {
        const [openDialog, setOpenDialog] = useState(false)

        const handleOpenDialog = () => setOpenDialog(true)
        const handleCloseDialog = () => setOpenDialog(false)

        const handleDelete = async () => {
            try {
                await deleteUser(student)
                setInfo(t("User removed successfully"))
            } catch (error) {
                setError((error as Error)?.message ?? t("Error deleting user"))
                console.error("Error deleting user: ", error)
            }
            handleCloseDialog()
        }

        return (
            <>
                <IconButton color="error" aria-label="delete" onClick={handleOpenDialog}>
                    <Delete />
                </IconButton>
                <Dialog open={openDialog} onClose={handleCloseDialog}>
                    <DialogTitle>{t("Are you sure you want to remove this user?")}</DialogTitle>
                    <DialogContent>
                        <p>{t("This action cannot be undone.")}</p>
                    </DialogContent>
                    <DialogActions>
                        <Button color="secondary" onClick={handleCloseDialog}>
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
                {t("User Management")}
            </Typography>
            <Box display="flex" justifyContent="flex-end">
                <Button onClick={handleModelOpen} sx={{ marginTop: "5em" }} variant="contained" startIcon={<Add />}>
                    {t("Add User")}
                </Button>
                <Modal
                    open={openModel}
                    onClose={handleModelClose}
                    aria-labelledby="modal-title"
                    aria-describedby="modal-description"
                >
                    <form onSubmit={handleModalUserSubmit}>
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                height: "80vh",
                            }}
                        >
                            <Card variant="outlined" sx={{ flexGrow: 0, padding: "1em", borderColor: "primary.main" }}>
                                <CardHeader title={t("Add User Info")} />
                                <CardContent>
                                    <Stack sx={{ minWidth: "500px" }} spacing={2}>
                                        <TextField
                                            sx={{ marginBottom: "1em" }}
                                            label={t("Email")}
                                            type="email"
                                            value={email}
                                            onChange={handleUserEmailChange}
                                            error={emailError}
                                            helperText={emailError ? "Invalid email format" : ""}
                                            fullWidth
                                        />

                                        <FormControl required fullWidth>
                                            <InputLabel id="user-role-select-label">{t("Role")}</InputLabel>
                                            <Select
                                                labelId="user-role-select-label"
                                                id="user-role-select"
                                                value={role}
                                                label="Role"
                                                onChange={handleUserRoleChange}
                                            >
                                                <MenuItem value="student">{t("student")}</MenuItem>
                                                <MenuItem value="proctor">{t("proctor")}</MenuItem>
                                                <MenuItem value="admin">{t("admin")}</MenuItem>
                                            </Select>
                                        </FormControl>
                                        <Stack direction="row" spacing={2}>
                                            <Button variant="outlined" color="error" onClick={handleModelClose}>
                                                {t("Cancel")}
                                            </Button>
                                            <Button variant="contained" type="submit">
                                                {t("Add User")}
                                            </Button>
                                        </Stack>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Box>
                    </form>
                </Modal>
            </Box>
            <DataGrid
                localeText={{
                    columnMenuLabel: t("Menu"),
                    columnMenuShowColumns: t("Show columns"),
                    columnMenuManageColumns: t("Manage columns"),
                    columnMenuFilter: t("Filter"),
                    columnMenuHideColumn: t("Hide column"),
                    columnMenuUnsort: t("Unsort"),
                    columnMenuSortAsc: t("Sort by ASC"),
                    columnMenuSortDesc: t("Sort by DESC"),
                }}
                slotProps={{
                    pagination: {
                        labelRowsPerPage: t("Rows per page"),
                        labelDisplayedRows: ({ from, to, count }) => `${from}-${to} ${t("of")} ${count}`,
                    },
                }}
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
                            <div>{t("No Users to display. Please Add Users.")}</div>
                        </Box>
                    ),
                    footer: GridFooter,
                }}
                sx={{ marginTop: "5em", border: 0 }}
                rows={usersData?.map((u) => ({ ...u, role: t(u.role), status: t(u.status) })) ?? []}
                columns={columns}
            />
        </Container>
    )
}

export default UsersManagement
