import { ChangeEvent, FormEvent, FunctionComponent, useState } from "react"
import { Avatar, Box, Button, Grid, Link, TextField, Typography } from "@mui/material"
import { LockOutlined } from "@mui/icons-material"
import { useSignIn } from "~/components/contexts/UserContext"
import { AuthError } from "firebase/auth"
import { useLocation, useNavigate } from "react-router-dom"
import { useMessageSystem } from "~/lib/useMessageSystem"
import { useTranslation } from "react-i18next"

type Props = {}

type UserLoginType = {
    email: string
    password: string
}

type UserFormErrors = Partial<Record<keyof UserLoginType, string>>

const SignIn: FunctionComponent<Props> = ({}) => {
    const location = useLocation()
    const { t } = useTranslation()
    const navigate = useNavigate()
    const [, , { setError }] = useMessageSystem()
    const navigateTo = location.state?.from?.pathname ?? "/"
    const { signIn } = useSignIn()
    const [formErrors, setFormErrors] = useState<UserFormErrors>({})
    const [userLogin, setUserLogin] = useState<UserLoginType>({
        email: "",
        password: "",
    })
    const checkFromErrors = () => {
        const formErrors: UserFormErrors = {}
        if (!userLogin.email) {
            formErrors.email = t("Email is Required")
        }
        if (!userLogin.password || userLogin.password === "") {
            formErrors.password = t("Password is Required")
        }
        setFormErrors(formErrors)
        return Object.keys(formErrors).length === 0
    }
    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (!checkFromErrors()) {
            return
        }
        try {
            await signIn(userLogin.email, userLogin.password)
            if (navigateTo.includes("sign-in") || navigateTo.includes("sign-up")) {
                navigate("/")
                return
            }
            navigate(navigateTo)
        } catch (e) {
            const authError = e as AuthError
            if ((e as AuthError)?.code === "auth/wrong-password") {
                setError(t("Wrong password"))
            } else if (authError.code === "auth/user-not-found") {
                setError(t("User not found"))
            } else if (authError.code === "auth/invalid-email") {
                setError(t("Invalid email"))
            } else if (authError) {
                setError(authError.message)
            } else {
                setError(t("Unknown error"))
            }
        }
    }
    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target
        setUserLogin((prevState) => ({
            ...prevState,
            [name]: value,
        }))
    }

    const enableForgotPassword = false

    return (
        <Box
            sx={{
                marginTop: 8,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
            }}
        >
            <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
                <LockOutlined />
            </Avatar>
            <Typography component="h1" variant="h5">
                {t("Sign in")}
            </Typography>
            <Box
                component="form"
                onSubmit={handleSubmit}
                noValidate
                sx={{ mt: 1, maxWidth: (theme) => theme.breakpoints.values.sm }}
            >
                <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="email"
                    label={t("Email")}
                    name="email"
                    autoComplete="email"
                    autoFocus
                    value={userLogin.email}
                    error={!!formErrors.email}
                    helperText={formErrors.email}
                    onChange={handleInputChange}
                />
                <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label={t("Password")}
                    type="password"
                    id="password"
                    autoComplete="current-password"
                    value={userLogin.password}
                    error={!!formErrors.password}
                    helperText={formErrors.password}
                    onChange={handleInputChange}
                />
                <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
                    {t("Sign in")}
                </Button>
                <Grid container>
                    <Grid item xs>
                        {enableForgotPassword ? (
                            <Link href="#" variant="body2">
                                {t("Forgot password?")}
                            </Link>
                        ) : null}
                    </Grid>
                    <Grid item>
                        <Link href="/signUp" variant="body2">
                            {t("Do not have an account? Sign Up")}
                        </Link>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    )
}

export { SignIn as default }
