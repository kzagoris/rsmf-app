import { Navigate, useLocation } from "react-router-dom"
import { useUserContext } from "~/components/contexts/UserContext"
import { Outlet } from "@mui/icons-material"
import LoadingView from "~/components/shared/LoadingView"

const ProtectedView = ({ children }: { children: JSX.Element }) => {
    const location = useLocation()
    const { state } = useUserContext()
    if (state.state === "SIGNED_IN") {
        return children || <Outlet />
    } else if (state.state === "SIGNED_OUT") {
        return <Navigate to="/signin" replace state={{ from: location }} />
    }
    return <LoadingView />
}

export default ProtectedView
