import { Navigate, useLocation } from "react-router-dom"
import { useUserContext } from "~/components/contexts/UserContext"
import { Outlet } from "@mui/icons-material"
import ErrorView from "~/components/shared/ErrorView"
import { useTranslation } from "react-i18next"

const AdminProtectedView = ({ children }: { children: JSX.Element }) => {
    const { t } = useTranslation()
    const { state } = useUserContext()
    const location = useLocation()
    if (state.state === "SIGNED_IN" && state.role === "admin") {
        return children || <Outlet />
    } else if (state.state === "SIGNED_OUT") {
        return <Navigate to="/signin" replace state={{ from: location }} />
    } else if (state.role !== "admin") {
        return <Navigate to="/" replace />
    }
    return <ErrorView message={t("Unauthorized entry")} />
}

export default AdminProtectedView
