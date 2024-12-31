import {
    Button,
    Card,
    CardContent,
    Container,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField,
} from "@mui/material"
import { Timestamp } from "firebase/firestore"
import { ChangeEvent, FormEvent, FunctionComponent, useEffect, useState } from "react"
import { getFirstName, getLastName, validateEmail } from "~/lib/helperFunctions"
import { User } from "~/models/User"
import { AuthState, useUserContext } from "~/components/contexts/UserContext"
import { useTranslation } from "react-i18next"

type Props = {
    user: User | null
    onSubmit: (user: User) => void
}

const PersonalInfo: FunctionComponent<Props> = ({ user, onSubmit }) => {
    type UserFormErrors = Partial<Record<keyof User, string>>

    const { state } = useUserContext()
    const { t } = useTranslation()

    useEffect(() => {
        if (!user) return
        setUserValues({
            id: user.id ?? getIdFromState(state) ?? undefined,
            firstName: user.firstName ?? getFirstNameFromState(state) ?? "",
            lastName: user.lastName ?? getLastnameFromState(state) ?? "",
            email: user.email ?? getEmailFromState(state) ?? "",
            role: user.role ?? "student",
            status: user.status ?? "notBiometrics",
            filters: user.filters ?? [],
            createdAt: user.createdAt ?? Timestamp.fromDate(new Date()),
            updatedAt: user.updatedAt ?? Timestamp.fromDate(new Date()),
            descriptorInfo: user.descriptorInfo ?? null,
            idImage: user.idImage ?? null,
            courses: user.courses ?? [],
        })
    }, [user])

    const getFirstNameFromState = (state: AuthState): string => {
        if (state.state === "SIGNED_IN" && state.currentUser) {
            return getFirstName(state.currentUser.displayName) ?? ""
        } else {
            return ""
        }
    }

    const getLastnameFromState = (state: AuthState): string => {
        if (state.state === "SIGNED_IN" && state.currentUser) {
            return getLastName(state.currentUser.displayName) ?? ""
        } else {
            return ""
        }
    }

    const getEmailFromState = (state: AuthState): string => {
        if (state.state === "SIGNED_IN" && state.currentUser) {
            return state.currentUser.email ?? ""
        } else {
            return ""
        }
    }

    const getIdFromState = (state: AuthState): string | undefined => {
        if (state.state === "SIGNED_IN" && state.currentUser) {
            return state.currentUser.uid ?? undefined
        } else {
            return undefined
        }
    }

    const [userValues, setUserValues] = useState<User>({
        id: getIdFromState(state) ?? undefined,
        firstName: getFirstNameFromState(state) ?? "",
        lastName: getLastnameFromState(state) ?? "",
        email: getEmailFromState(state) ?? "",
        role: "student",
        status: "notBiometrics",
        filters: [],
        courses: [],
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date()),
        descriptorInfo: null,
        idImage: null,
    })

    const [formErrors, setFormErrors] = useState<UserFormErrors>({})

    const handleFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        // validate the form
        const errors: UserFormErrors = {}
        if (!userValues.firstName) {
            errors.firstName = t("First Name is Required")
        }
        if (!userValues.lastName) {
            errors.lastName = t("Last Name is Required")
        }
        if (!userValues.email) {
            errors.email = t("Email is Required")
        }
        if (!validateEmail(userValues.email)) {
            errors.email = t("Email is Invalid")
        }

        setFormErrors(errors)

        if (Object.keys(errors).length > 0) return
        onSubmit(userValues)
    }

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target
        setUserValues((prevState) => ({
            ...prevState,
            [name]: value,
        }))
    }

    return (
        <Container
            maxWidth="md"
            sx={{
                mt: 5,
                display: "flex",
                justifyContent: "center",
                flexDirection: "column",
            }}
        >
            <form onSubmit={handleFormSubmit}>
                <Card
                    variant="outlined"
                    sx={{ flexGrow: 0, padding: "1em", minWidth: "500px", borderColor: "primary.main" }}
                >
                    <CardContent>
                        <Stack spacing={2}>
                            <TextField
                                label={t("First Name")}
                                variant="outlined"
                                name="firstName"
                                onChange={handleInputChange}
                                fullWidth
                                value={userValues.firstName}
                                error={!!formErrors.firstName}
                                helperText={formErrors.firstName}
                            />
                            <TextField
                                label={t("Last Name")}
                                variant="outlined"
                                name="lastName"
                                value={userValues.lastName}
                                onChange={handleInputChange}
                                fullWidth
                                error={!!formErrors.lastName}
                                helperText={formErrors.lastName}
                            />
                            <TextField
                                label={t("Email")}
                                variant="outlined"
                                name="email"
                                type="email"
                                value={userValues.email}
                                onChange={handleInputChange}
                                fullWidth
                                error={!!formErrors.email}
                                helperText={formErrors.email}
                                InputProps={{ readOnly: !!user }}
                            />
                            <FormControl required fullWidth>
                                <InputLabel id="user-role-select-label">{t("Role")}</InputLabel>
                                <Select
                                    labelId="user-role-select-label"
                                    id="user-role-select"
                                    inputProps={{ readOnly: true }}
                                    value={userValues.role}
                                    label="Role"
                                >
                                    <MenuItem value="student">{t("student")}</MenuItem>
                                    <MenuItem value="proctor">{t("proctor")}</MenuItem>
                                    <MenuItem value="admin">{t("admin")}</MenuItem>
                                </Select>
                            </FormControl>
                            <Button type="submit" variant="contained">
                                {t("Save")}
                            </Button>
                        </Stack>
                    </CardContent>
                </Card>
            </form>
        </Container>
    )
}

export { PersonalInfo }
