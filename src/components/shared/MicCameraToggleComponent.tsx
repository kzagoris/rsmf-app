import { Mic, MicOff, Videocam, VideocamOff } from "@mui/icons-material"
import { Avatar, Badge, Box, Stack } from "@mui/material"
import { blueGrey } from "@mui/material/colors"
import { styled } from "@mui/material/styles"
import { FunctionComponent } from "react"

interface MicToggleComponentProps {
    status: boolean
    toggleMuted: () => void
    type: "mic" | "camera"
    top?: string
    left?: string
    disabled?: boolean
}

export const MicCameraToggleComponent: FunctionComponent<MicToggleComponentProps> = ({
    status,
    toggleMuted,
    type,
    top,
    left,
    disabled = false,
}) => {
    const icon = type === "mic" ? status ? <Mic /> : <MicOff /> : status ? <Videocam /> : <VideocamOff />

    const StyledBadge = styled(Badge)(({ theme }) => ({
        "& .MuiBadge-badge": {
            backgroundColor: "#44b700",
            color: theme.palette.primary.main,
            boxShadow: `0 0 0 1px ${theme.palette.background.paper}`,
            top: 25,
            left: 18,
            width: 6,
            minWidth: 6,
            height: 6,
            "&::after": {
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                animation: "ripple 1.2s infinite ease-in-out",
                border: "1px solid currentColor",
                content: "''",
            },
        },
        "@keyframes ripple": {
            "0%": {
                transform: "scale(.8)",
                opacity: 1,
            },
            "100%": {
                transform: "scale(2.4)",
                opacity: 0,
            },
        },
    }))
    return (
        <Box sx={{ position: "absolute", top: top ?? "20px", left: left ?? "20px", right: 0 }}>
            <Stack direction="row" justifyContent="start" alignContent="start" alignItems="start">
                <StyledBadge
                    variant={status ? "dot" : undefined}
                    onClick={() => (disabled ? undefined : toggleMuted())}
                    sx={{ cursor: disabled ? "inherit" : "pointer" }}
                >
                    <Avatar
                        sx={{
                            color: disabled ? blueGrey[200] : undefined,
                            bgcolor: disabled ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.4)",
                            width: 32,
                            height: 32,
                        }}
                    >
                        {icon}
                    </Avatar>
                </StyledBadge>
            </Stack>
        </Box>
    )
}
