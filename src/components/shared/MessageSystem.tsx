import { Alert, AlertTitle, Box, Collapse } from "@mui/material"
import { FunctionComponent } from "react"
import { useTranslation } from "react-i18next"
import { useMessageSystem } from "~/lib/useMessageSystem"

type Props = {}
const MessageSystem: FunctionComponent<Props> = ({}) => {
    const [message, severity, { clearMessage }] = useMessageSystem()
    const { t } = useTranslation()
    return (
        <Box
            sx={{ position: "fixed", bottom: "80px", left: 0, width: "100%", zIndex: 10000 }}
            component="div"
            display="flex"
            justifyContent="center"
            alignItems="center"
        >
            <Collapse sx={{ width: "600px", marginLeft: "64px", marginBottom: "30px" }} in={message !== null}>
                <Alert
                    onClose={() => {
                        clearMessage()
                    }}
                    severity={severity}
                >
                    <AlertTitle>{severity && t(severity)}</AlertTitle>
                    {message}
                </Alert>
            </Collapse>
        </Box>
    )
}
export { MessageSystem }
