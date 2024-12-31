import { VideoCallOutlined as VideoCallOutlinedIcon } from "@mui/icons-material"
import {
    Button,
    Card,
    CardActions,
    CardContent,
    CardHeader,
    InputAdornment,
    TextField,
    Typography,
} from "@mui/material"
import { FunctionComponent, useState } from "react"
import { useTranslation } from "react-i18next"

interface onCallProps {
    onCall: ({ roomUrl }: { roomUrl: string }) => void
}

type Props = onCallProps

const AddURLJoinVideoExam: FunctionComponent<Props> = ({ onCall }) => {
    const [roomUrl, setRoomUrl] = useState("")
    const [blur, setBlur] = useState(false)
    const { t } = useTranslation()
    const isError = () => blur && (!roomUrl || roomUrl.length === 0)

    return (
        <Card sx={{ flexGrow: 0, mt: 4, padding: 2, borderColor: "primary.main" }} variant="outlined">
            <CardHeader title={t("Welcome")} />
            <CardContent>
                <Typography variant="body2" color="text.secondary">
                    {t("Enter the video exam URL to join.")}
                </Typography>
            </CardContent>
            <CardActions sx={{ display: "flex" }}>
                <TextField
                    sx={{ flexGrow: 1 }}
                    onBlur={() => setBlur(true)}
                    error={isError()}
                    helperText={isError() ? t("URL is required!") : ""}
                    required
                    id="conference-name"
                    value={roomUrl}
                    onChange={(e) => setRoomUrl(e.target.value)}
                    variant="standard"
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <VideoCallOutlinedIcon />
                            </InputAdornment>
                        ),
                    }}
                />

                <Button
                    sx={{ margin: "0 0 2em 1em" }}
                    color="secondary"
                    disableElevation
                    variant="outlined"
                    onClick={() => {
                        setBlur(true)
                        if (roomUrl.length > 0) {
                            onCall({ roomUrl })
                        }
                    }}
                >
                    {t("Go")}
                </Button>
            </CardActions>
        </Card>
    )
}

export { AddURLJoinVideoExam as default }
