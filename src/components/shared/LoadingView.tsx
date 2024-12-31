import { FunctionComponent } from "react"
import { Box, CircularProgress } from "@mui/material"

type Props = {}
const LoadingView: FunctionComponent<Props> = () => {
    return (
        <Box
            sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "50vh",
            }}
        >
            <div>
                <CircularProgress size="7em" thickness={1} />
            </div>
        </Box>
    )
}

export default LoadingView
