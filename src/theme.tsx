import { createTheme } from "@mui/material/styles"
import { red } from "@mui/material/colors"

import { Link as RouterLink, LinkProps as RouterLinkProps } from "react-router-dom"
import { LinkProps } from "@mui/material/Link"
import { forwardRef } from "react"

const LinkBehavior = forwardRef<HTMLAnchorElement, Omit<RouterLinkProps, "to"> & { href: RouterLinkProps["to"] }>(
    (props, ref) => {
        const { href, ...other } = props
        // Map href (MUI) -> to (react-router)
        return <RouterLink ref={ref} to={href} {...other} />
    },
)

LinkBehavior.displayName = "LinkBehavior"

// Create a theme instance.
export const theme = createTheme({
    components: {
        MuiLink: {
            defaultProps: {
                component: LinkBehavior,
            } as LinkProps,
        },
        MuiButtonBase: {
            defaultProps: {
                LinkComponent: LinkBehavior,
            },
        },
    },
    palette: {
        primary: {
            main: "#f79521",
            contrastText: "#fff",
        },
        secondary: {
            main: "#2a3c90",
        },
        error: {
            main: red.A400,
        },
    },
})
