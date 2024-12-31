import { Alert, AlertTitle, Box } from "@mui/material"
import { FunctionComponent } from "react"
import { useTranslation } from "react-i18next"

type Props = { message: string }
const ErrorView: FunctionComponent<Props> = ({ message }) => {
    const { t } = useTranslation()
    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                height: "40vh",
            }}
        >
            <Alert sx={{ width: "60%" }} severity="error">
                <AlertTitle>{t("Error")}</AlertTitle>
                {message}
            </Alert>
        </Box>
    )
}

export default ErrorView
