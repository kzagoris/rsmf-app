import { Box, CssBaseline, Stack } from "@mui/material"
import { grey } from "@mui/material/colors"
import { FunctionComponent, Suspense, useState } from "react"
import { AppBar } from "~/components/shared/AppBar"
import { Drawer, DrawerHeader } from "~/components/shared/Drawer"
import { MessageSystem } from "~/components/shared/MessageSystem"
import AppFooter from "~/components/AppFooter"
import { useUserContext } from "~/components/contexts/UserContext"
import { Outlet } from "react-router-dom"
import LoadingView from "~/components/shared/LoadingView"

type Props = {}

const Main: FunctionComponent<Props> = ({}) => {
    const [open, setOpen] = useState(false)
    const { state } = useUserContext()

    const handleDrawerOpen = () => {
        if (state.state !== "SIGNED_IN") return
        setOpen(true)
    }

    const handleDrawerClose = () => {
        setOpen(false)
    }

    return (
        <Stack
            direction="column"
            justifyContent="space-between"
            alignItems="stretch"
            sx={{ minHeight: "100vh", backgroundColor: grey.A100 }}
        >
            <Box sx={{ display: "flex" }}>
                <CssBaseline />
                <AppBar open={open} handleDrawerOpen={handleDrawerOpen} />
                {state.state === "SIGNED_IN" && <Drawer open={open} handleDrawerClose={handleDrawerClose} />}
                <Box component="main" sx={{ flexGrow: 1, p: 0, mt: 1 }}>
                    <DrawerHeader />
                    <Suspense fallback={<LoadingView />}>
                        <Outlet />
                    </Suspense>
                </Box>
            </Box>
            <MessageSystem />
            <AppFooter />
        </Stack>
    )
}

export { Main }
