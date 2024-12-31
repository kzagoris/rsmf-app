import BrowserNotSupportedIcon from "@mui/icons-material/BrowserNotSupported"
import VerifiedIcon from "@mui/icons-material/Verified"
import { Box, Button, Grid, Paper, Stack, Typography } from "@mui/material"
import { FunctionComponent } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useUserContext } from "~/components/contexts/UserContext"
import ErrorView from "~/components/shared/ErrorView"
import { IdCardView } from "~/components/shared/IdCardView"
import LoadingView from "~/components/shared/LoadingView"
import { useFirestore } from "~/lib/firebase"
import { useUserInfo } from "~/lib/useUserManagement"
import { useTranslation } from "react-i18next"

interface Props {}

const UserProfile: FunctionComponent<Props> = ({}) => {
    const { state } = useUserContext()
    const { t } = useTranslation()
    const firestore = useFirestore()
    const navigate = useNavigate()
    const { userId } = useParams()
    const [userData, loadingUserData, userDataError] = useUserInfo(firestore, userId ?? state?.currentUser?.uid ?? null)

    if (userDataError) return <ErrorView message={userDataError.message} />
    if (loadingUserData) return <LoadingView />
    return (
        <Stack display="flex" alignItems="center" justifyContent="center">
            <Stack
                spacing={2}
                sx={{
                    flexGrow: 1,
                    my: 3,
                    borderColor: "primary.main",
                    minWidth: "800px",
                }}
            >
                <Paper sx={{ p: 2, mb: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        {t("Personal Information")}
                    </Typography>
                    <Box>
                        <Grid sx={{ mt: 2 }} container spacing={1}>
                            <Grid item xs={6}>
                                <Typography>{t("First Name")}:</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography> {userData?.firstName}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography>{t("Last Name")}:</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography> {userData?.lastName}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography>{t("Email")}:</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography> {userData?.email}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography>{t("Role")}:</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography> {userData?.role}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography>{t("Status")}:</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography> {userData?.status.toLocaleUpperCase()}</Typography>
                            </Grid>
                        </Grid>
                    </Box>
                </Paper>
                {(state?.role === "student" || (state?.role === "admin" && userId && userData?.role === "student")) && (
                    <Paper sx={{ p: 2, mb: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            {t("ID Image")}
                        </Typography>
                        <Box sx={{ maxHeight: "400px", overflowY: "auto" }}>
                            <IdCardView displayOnly imageIdCard={userData?.idImage?.fullPath} />
                        </Box>
                    </Paper>
                )}
                {(state?.role === "student" || (state?.role === "admin" && userId && userData?.role === "student")) && (
                    <Paper sx={{ p: 2, mb: 2 }}>
                        <Typography
                            display="flex"
                            flexDirection="row"
                            alignItems="center"
                            justifyContent="left"
                            variant="h6"
                            gutterBottom
                        >
                            <span>{t("Face Descriptor")}:</span>{" "}
                            {userData?.descriptorInfo ? (
                                <VerifiedIcon sx={{ ml: 1 }} color="success" />
                            ) : (
                                <BrowserNotSupportedIcon sx={{ ml: 1 }} color="error" />
                            )}
                        </Typography>
                    </Paper>
                )}
                <Box
                    display="flex"
                    flexDirection="row"
                    alignItems="center"
                    justifyContent="space-around"
                    sx={{ width: "100%" }}
                >
                    <Button fullWidth variant="contained" onClick={() => navigate("/identification")}>
                        {state?.role === "student"
                            ? t("Re-Done Identification Steps")
                            : t("Re-Enter your Personal Information")}
                    </Button>
                </Box>
            </Stack>
        </Stack>
    )
}

export default UserProfile
