import { useUserContext } from "~/components/contexts/UserContext"
import { Navigate, Outlet } from "react-router-dom"

const NotLoginView = ({ children }: { children: JSX.Element }) => {
    const { state } = useUserContext()
    if (state.state === "SIGNED_IN") {
        return <Navigate to="/" replace />
    }
    return children || <Outlet />
}
export default NotLoginView
