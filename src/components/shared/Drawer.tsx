import { FunctionComponent } from "react"
import {
    CSSObject,
    Divider,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    styled,
    type Theme,
    Tooltip,
    useTheme,
} from "@mui/material"
import MuiDrawer from "@mui/material/Drawer"
import {
    ChevronLeft,
    ChevronRight,
    ManageAccountsOutlined,
    SchoolOutlined,
    OpenInNewOutlined,
    HomeOutlined,
} from "@mui/icons-material"
import { Link } from "react-router-dom"
import { useUserContext } from "~/components/contexts/UserContext"
import { useTranslation } from "react-i18next"

type Props = {
    open: boolean
    handleDrawerClose: () => void
}
const drawerWidth = 240

const DrawerHeader = styled("div")(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
}))

const openedMixin = (theme: Theme): CSSObject => ({
    width: drawerWidth,
    transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: "hidden",
})

const closedMixin = (theme: Theme): CSSObject => ({
    transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: "hidden",
    width: `calc(${theme.spacing(7)} + 1px)`,
    [theme.breakpoints.up("sm")]: {
        width: `calc(${theme.spacing(8)} + 1px)`,
    },
})

const MyDrawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== "open" })(({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: "nowrap",
    boxSizing: "border-box",
    ...(open && {
        ...openedMixin(theme),
        "& .MuiDrawer-paper": openedMixin(theme),
    }),
    ...(!open && {
        ...closedMixin(theme),
        "& .MuiDrawer-paper": closedMixin(theme),
    }),
}))

const Drawer: FunctionComponent<Props> = ({ open, handleDrawerClose }) => {
    const theme = useTheme()
    const { state } = useUserContext()
    const { t } = useTranslation()

    const MenuList = [
        { name: t("Home Page"), icon: <HomeOutlined />, link: "/", role: "student" },
        {
            name: t("Courses Management"),
            icon: <SchoolOutlined />,
            link: "/courses/management",
            role: "admin",
            external: false,
        },
        {
            name: t("Users Management"),
            icon: <ManageAccountsOutlined />,
            link: "/users/management",
            role: "admin",
            external: false,
        },
        {
            name: t("RSMF Web Site"),
            icon: <OpenInNewOutlined />,
            link: "https://rsmf-project.eu",
            role: "student",
            external: true,
        },
    ]

    return (
        <MyDrawer variant="permanent" open={open}>
            <DrawerHeader>
                <IconButton onClick={() => handleDrawerClose()}>
                    {theme.direction === "rtl" ? <ChevronRight /> : <ChevronLeft />}
                </IconButton>
            </DrawerHeader>
            <Divider />
            <List>
                {MenuList.map((item, index) => {
                    if (state.role !== "admin" && item.role === "admin") return null
                    return (
                        <Tooltip title={item.name} key={index} placement="right">
                            <ListItem disablePadding sx={{ display: "block" }}>
                                <ListItemButton
                                    component={Link}
                                    to={item.link}
                                    target={item.external ? "_blank" : "_self"}
                                    sx={{
                                        minHeight: 48,
                                        justifyContent: open ? "initial" : "center",
                                        px: 2.5,
                                    }}
                                >
                                    <ListItemIcon
                                        sx={{
                                            minWidth: 0,
                                            mr: open ? 3 : "auto",
                                            justifyContent: "center",
                                        }}
                                    >
                                        {item.icon}
                                    </ListItemIcon>
                                    <ListItemText primary={item.name} sx={{ opacity: open ? 1 : 0 }} />
                                </ListItemButton>
                            </ListItem>
                        </Tooltip>
                    )
                })}
            </List>
        </MyDrawer>
    )
}

export { Drawer, DrawerHeader }
