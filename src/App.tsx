import { LocalizationProvider } from "@mui/x-date-pickers"
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"
import "dayjs/locale/el"
import "dayjs/locale/en-gb"
import "dayjs/locale/it"
import "dayjs/locale/pl"

import { useState } from "react"
import { useTranslation } from "react-i18next"
import { RouterProvider } from "react-router-dom"
import { AuthProvider } from "~/components/contexts/UserContext"
import { RMFRouter } from "~/components/router"
import "./App.css"

function App() {
    const adaptersLocale: Record<string, string> = {
        en: "en-gb",
        el: "el",
        pl: "pl",
        it: "it",
    }

    const { i18n } = useTranslation()
    const [adapterLocale, setAdapterLocale] = useState<string>(adaptersLocale[i18n.language])

    i18n.on("languageChanged", (lng: string) => {
        setAdapterLocale(adaptersLocale[lng])
    })

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={adapterLocale}>
            <AuthProvider>
                <RouterProvider router={RMFRouter} />
            </AuthProvider>
        </LocalizationProvider>
    )
}

export default App
