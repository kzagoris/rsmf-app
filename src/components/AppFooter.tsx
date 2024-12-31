import { Container, Typography } from "@mui/material"
import { FunctionComponent } from "react"
import { useTranslation } from "react-i18next"

type props = {}
const AppFooter: FunctionComponent<props> = ({}) => {
    const { t } = useTranslation()
    return (
        <Container
            maxWidth={false}
            disableGutters
            sx={{
                backgroundColor: (theme) => theme.palette.background.paper,
                mt: 4,
                py: 1,
                boxShadow:
                    "0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12)",
            }}
        >
            <Typography variant="caption" color="textSecondary" align="center">
                <p style={{ margin: "0.2em" }}>
                    <small>
                        {t(
                            "Project No. 2021-1-PL01-KA220-HED-000032089, Programme: ERASMUS+ Programme, Key Action 2-Cooperation partnerships in higher education",
                        )}
                    </small>
                </p>
                <p style={{ margin: "0.2em" }}>
                    <small>{t("Start Date: 01/11/2021, End Date: 31/10/2023")}</small>
                </p>
                <p style={{ margin: "0.2em" }}>
                    <small>{t("This project has been funded with support from the European Commission.")}</small>
                </p>
                <p style={{ margin: "0.2em" }}>
                    <small>
                        {t(
                            "This website reflects the views only of the author, and the Commission cannot be held responsible for any use which may be made of the information contained herein.",
                        )}
                    </small>
                </p>
            </Typography>
        </Container>
    )
}
export { AppFooter as default }
