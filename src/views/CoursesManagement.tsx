import { Create, List as ListIcon } from "@mui/icons-material"
import {
    Card,
    CardContent,
    CardHeader,
    Container,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
} from "@mui/material"
import { FunctionComponent } from "react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"

type Props = {}

const CoursesManagement: FunctionComponent<Props> = ({}) => {
    const { t } = useTranslation()
    return (
        <Container
            maxWidth="sm"
            sx={{
                mt: 5,
                display: "flex",
                justifyContent: "center",
                flexDirection: "column",
            }}
        >
            <Card
                variant="outlined"
                sx={{ flexGrow: 0, padding: "1em", minWidth: "400px", borderColor: "primary.main" }}
            >
                <CardHeader title={t("Courses Management")} />
                <CardContent>
                    <List>
                        <ListItem>
                            <ListItemButton component={Link} to="/courses/create">
                                <ListItemIcon>
                                    <Create />
                                </ListItemIcon>
                                <ListItemText primary={t("Create Course")} />
                            </ListItemButton>
                        </ListItem>
                        <ListItem>
                            <ListItemButton component={Link} to="/courses/list">
                                <ListItemIcon>
                                    <ListIcon />
                                </ListItemIcon>
                                <ListItemText primary={t("List Courses")} />
                            </ListItemButton>
                        </ListItem>
                    </List>
                </CardContent>
            </Card>
        </Container>
    )
}

export { CoursesManagement as default }
