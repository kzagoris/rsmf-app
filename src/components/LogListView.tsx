import { List, ListItem, ListItemText } from "@mui/material"
import { FunctionComponent } from "react"
import { LoggingCourse } from "~/models/LoggingCourse"
import { useTranslation } from "react-i18next"

type Props = {
    LogList: LoggingCourse[]
}

const LogListView: FunctionComponent<Props> = ({ LogList }) => {
    const { t } = useTranslation()
    return (
        <div>
            <List>
                {LogList.map((log) => {
                    const formattedDate = new Date(log.date.seconds * 1000).toLocaleString()
                    return (() => {
                        switch (log.reason) {
                            case "ENTERED_EXAM":
                                return (
                                    <ListItem key={log.id}>
                                        <ListItemText
                                            primary={`${formattedDate} -  ${log.userName} ${t("entered the exam")}`}
                                        />
                                    </ListItem>
                                )
                            case "LEFT_EXAM":
                                return (
                                    <ListItem key={log.id}>
                                        <ListItemText
                                            primary={`${formattedDate} - ${log.userName} ${t("left the exam")}`}
                                        />
                                    </ListItem>
                                )
                            case "VIDEO":
                                return (
                                    <ListItem key={log.id}>
                                        <video style={{ width: "100%" }} controls>
                                            <source src={log.videoId ?? ""} type="video/mp4" />
                                            Your browser does not support the video tag.
                                        </video>
                                    </ListItem>
                                )
                            default:
                                return null
                        }
                    })()
                })}
            </List>
        </div>
    )
}

export { LogListView as default }
