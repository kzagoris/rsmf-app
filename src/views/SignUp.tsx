import { Avatar, Box, Button, Grid, Link, TextField, Typography } from "@mui/material"
import { ChangeEvent, FormEvent, FunctionComponent, useState } from "react"
import { LockOutlined } from "@mui/icons-material"
import { useNavigate } from "react-router-dom"
import { validateEmail } from "~/lib/helperFunctions"
import { AuthError } from "firebase/auth"
import { useFirestore } from "~/lib/firebase"
import { useUserManagement } from "~/lib/useUserManagement"
import { useMessageSystem } from "~/lib/useMessageSystem"
import { useTranslation } from "react-i18next"

type Props = {}

type UserSignUpType = {
    firstName: string
    lastName: string
    email: string
    password: string
    verifyPassword: string
}

type UserFormErrors = Partial<Record<keyof UserSignUpType, string>>

const SignUp: FunctionComponent<Props> = ({}) => {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const firestore = useFirestore()
    const { signUpUser } = useUserManagement(firestore)
    const [, , { setError }] = useMessageSystem()
    const [userLogin, setUserLogin] = useState<UserSignUpType>({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        verifyPassword: "",
    })
    const [formErrors, setFormErrors] = useState<UserFormErrors>({})

    const checkFormErrors = () => {
        const formErrors: UserFormErrors = {}
        if (!userLogin.firstName) {
            formErrors.firstName = t("First Name is Required")
        }
        if (!userLogin.lastName) {
            formErrors.lastName = t("Last Name is Required")
        }
        if (!userLogin.email) {
            formErrors.email = t("Email is Required")
        } else if (!validateEmail(userLogin.email)) {
            formErrors.email = t("Email is Invalid")
        }
        if (!userLogin.password || userLogin.password === "") {
            formErrors.password = t("Password is Required")
        }

        if (userLogin.password.length < 6) {
            formErrors.password = t("Password must be at least 6 characters")
        }

        if (!userLogin.verifyPassword || userLogin.verifyPassword === "") {
            formErrors.verifyPassword = t("Password is Required")
        } else if (userLogin.password !== userLogin.verifyPassword) {
            formErrors.verifyPassword = t("Passwords do not match")
        }
        return formErrors
    }

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target
        setUserLogin((prevState) => ({
            ...prevState,
            [name]: value,
        }))
    }

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const formErrors = checkFormErrors()
        setFormErrors(formErrors)
        if (Object.keys(formErrors).length > 0) return
        try {
            const user = await signUpUser(userLogin.email, userLogin.password, userLogin.firstName, userLogin.lastName)
            const result = await user.getIdTokenResult(true)
            navigate("/identification")
        } catch (e) {
            const authError = e as AuthError
            if (authError && authError.code === "auth/internal-error") {
                setError(t("Unauthorized Email"))
                console.error(authError)
            } else {
                setError((e as Error).message)
                console.error(e)
            }
        }
    }
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
                {t("Sign up")}
            </Typography>
            <Box
                component="form"
                noValidate
                onSubmit={handleSubmit}
                sx={{
                    mt: 3,
                    maxWidth: (theme) => theme.breakpoints.values.sm,
                }}
            >
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            autoComplete="given-name"
                            name="firstName"
                            required
                            fullWidth
                            id="firstName"
                            label={t("First Name")}
                            autoFocus
                            value={userLogin.firstName}
                            error={!!formErrors.firstName}
                            helperText={formErrors.firstName}
                            onChange={handleInputChange}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            required
                            fullWidth
                            id="lastName"
                            label={t("Last Name")}
                            name="lastName"
                            autoComplete="family-name"
                            value={userLogin.lastName}
                            error={!!formErrors.lastName}
                            helperText={formErrors.lastName}
                            onChange={handleInputChange}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            required
                            fullWidth
                            id="email"
                            label={t("Email")}
                            name="email"
                            autoComplete="email"
                            value={userLogin.email}
                            error={!!formErrors.email}
                            helperText={formErrors.email}
                            onChange={handleInputChange}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            required
                            fullWidth
                            name="password"
                            label={t("Password")}
                            type="password"
                            id="password"
                            autoComplete="new-password"
                            value={userLogin.password}
                            error={!!formErrors.password}
                            helperText={formErrors.password}
                            onChange={handleInputChange}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            required
                            fullWidth
                            name="verifyPassword"
                            label={t("Verify Password")}
                            type="password"
                            id="verifyPassword"
                            autoComplete="new-password"
                            value={userLogin.verifyPassword}
                            error={!!formErrors.verifyPassword}
                            helperText={formErrors.verifyPassword}
                            onChange={handleInputChange}
                        />
                    </Grid>
                </Grid>
                <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
                    {t("Sign Up")}
                </Button>
                <Grid container justifyContent="flex-end">
                    <Grid item>
                        <Link href="/signin" variant="body2">
                            {t("Already have an account? Sign in")}
                        </Link>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    )
}

export { SignUp as default }
