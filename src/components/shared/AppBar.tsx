import MenuIcon from "@mui/icons-material/Menu"
import {
    Avatar,
    Box,
    FormControl,
    IconButton,
    InputLabel,
    Menu,
    MenuItem,
    Select,
    SelectChangeEvent,
    styled,
    Toolbar,
    Tooltip,
    Typography,
} from "@mui/material"
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar"
import { FunctionComponent, MouseEvent, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { useSignOut, useUserContext } from "~/components/contexts/UserContext"
import { stringToColor } from "~/lib/helperFunctions"

const drawerWidth = 240

interface AppBarProps extends MuiAppBarProps {
    open?: boolean
}

const MyAppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme, open }) => ({
    backgroundColor: theme.palette.background.paper,
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(["width", "margin"], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(["width", "margin"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}))

interface OwnProps {
    open: boolean
    handleDrawerOpen: () => void
}

type Props = OwnProps

const AppBar: FunctionComponent<Props> = ({ open, handleDrawerOpen }) => {
    const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null)
    const { signOut } = useSignOut()
    const { state } = useUserContext()
    const { t, i18n } = useTranslation()

    const [displayName, setDisplayName] = useState<string | null>(null)

    useEffect(() => {
        if (state.currentUser && state.currentUser.displayName) {
            setDisplayName(state.currentUser.displayName)
        }
    }, [state])

    const nameArray = displayName ? displayName.trim().split(" ") : []
    const initials =
        nameArray.length === 0
            ? "?"
            : nameArray.length === 1
              ? `${nameArray[0][0].toUpperCase()}${nameArray[0][1]?.toUpperCase() ?? ""}`
              : `${nameArray[0][0].toUpperCase()}${nameArray[1][0].toUpperCase()}`

    const handleOpenUserMenu = (event: MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget)
    }

    const handleCloseUserMenu = () => {
        setAnchorElUser(null)
    }

    const handleLogout = async () => {
        handleCloseUserMenu()
        await signOut()
    }

    const handleLangChange = async (event: SelectChangeEvent) => {
        const langCode = event.target.value as string
        await i18n.changeLanguage(langCode)
    }

    return (
        <MyAppBar position="fixed" open={open}>
            <Toolbar>
                {state.state === "SIGNED_IN" && (
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        onClick={() => handleDrawerOpen()}
                        edge="start"
                        sx={{
                            marginRight: 5,
                            ...(open && { display: "none" }),
                        }}
                    >
                        <MenuIcon />
                    </IconButton>
                )}
                <img
                    src="/assets/images/header-logo.svg"
                    style={{ marginRight: "20px" }}
                    alt="Remote Student Framework for Securing Exams Logo"
                    height="50"
                />
                <img src="/assets/images/eu-logo.png" alt="EU Logo" height="50" />
                <Box sx={{ flexGrow: 1 }} />
                <FormControl variant="standard" sx={{ minWidth: 130 }}>
                    <InputLabel id="select-language">{t("Language")}: </InputLabel>
                    <Select
                        value={i18n.language}
                        label="Language"
                        labelId="select-language"
                        onChange={handleLangChange}
                    >
                        <MenuItem value="en">🇬🇧 English</MenuItem>
                        <MenuItem value="el">🇬🇷 Ελληνικά</MenuItem>
                        <MenuItem value="pl">🇵🇱 Polski</MenuItem>
                        <MenuItem value="it">🇮🇹 Italiano</MenuItem>
                    </Select>
                </FormControl>
                <Box sx={{ flexGrow: 1 }} />
                {state.state === "SIGNED_IN" && (
                    <Box sx={{ flexGrow: 0 }}>
                        <Tooltip title="Open User Menu">
                            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                                <Avatar
                                    sx={{
                                        bgcolor: displayName ? stringToColor(displayName) : "#000",
                                    }}
                                >
                                    {initials}
                                </Avatar>
                            </IconButton>
                        </Tooltip>
                        <Menu
                            sx={{ mt: "45px" }}
                            id="menu-appbar"
                            anchorEl={anchorElUser}
                            anchorOrigin={{
                                vertical: "top",
                                horizontal: "right",
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: "top",
                                horizontal: "right",
                            }}
                            open={Boolean(anchorElUser)}
                            onClose={handleCloseUserMenu}
                        >
                            <MenuItem key="profile" component={Link} to="/profile" onClick={handleCloseUserMenu}>
                                <Typography textAlign="center">{t("Profile")}</Typography>
                            </MenuItem>
                            <MenuItem key="logout" onClick={handleLogout}>
                                <Typography textAlign="center">{t("Logout")}</Typography>
                            </MenuItem>
                        </Menu>
                    </Box>
                )}
            </Toolbar>
        </MyAppBar>
    )
}

export { AppBar }
