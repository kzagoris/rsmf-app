import { FunctionComponent } from "react"
import { Container } from "@mui/material"
import WelcomeConferenceCall from "~/components/AddURLJoinVideoExam"
import UpcomingCourses from "~/components/UpcomingCourses"
import { createConferenceObjectFromURL } from "~/lib/videoCall"
import { useNavigate } from "react-router-dom"

type Props = {}

const Dashboard: FunctionComponent<Props> = ({}) => {
    const navigate = useNavigate()

    const onCall = ({ roomUrl }: { roomUrl: string }) => {
        const conferenceObject = createConferenceObjectFromURL(roomUrl)
        if (!conferenceObject) {
            console.error("Invalid conference object.", conferenceObject)
            return
        }
        navigate(`/video-exam/${conferenceObject.room}`)
    }

    return (
        <Container
            sx={{ minHeight: "70vh", display: "flex", justifyContent: "space-evenly", flexDirection: "column" }}
            maxWidth="md"
        >
            <WelcomeConferenceCall onCall={onCall} />
            <UpcomingCourses />
        </Container>
    )
}

export { Dashboard as default }
