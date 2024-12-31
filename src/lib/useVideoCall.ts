import { Peer } from "peerjs"
import { useEffect, useState } from "react"
import { LoggingParticipant } from "~/models/LoggingParticipant"
import { UserRoleType } from "~/models/User"
import { RemoteStreamType } from "~/views/VideoExamView"

export type PeerConnectionType = {
    receiverId: string
    createdId: string
    peerConnection: Peer
    role: UserRoleType
}

export const useVideoCall = (
    stream: MediaStream | null | undefined,
    courseId: string | null | undefined,
    participantId: string | null | undefined,
    remoteStreams: Map<string, RemoteStreamType>,
    role: UserRoleType | null,
    cameraMicStatusData: LoggingParticipant | null,
    refreshVideo: () => void = () => {},
    events: {
        enterEvent: () => Promise<void>
        exitEvent: () => Promise<void>
    } = {
        enterEvent: async () => {},
        exitEvent: async () => {},
    },
) => {
    const servers = {
        iceServers: [
            {
                urls: ["stun:stun1.l.google.com:19302"],
            },
            {
                urls: "stun:relay.metered.ca:80",
            },
            {
                urls: "turn:relay.metered.ca:80",
                username: "7e1ac9b3e27979664040db7d",
                credential: "PbSlSfQOZcY9SaNS",
            },
            {
                urls: "turn:relay.metered.ca:443",
                username: "7e1ac9b3e27979664040db7d",
                credential: "PbSlSfQOZcY9SaNS",
            },
            {
                urls: "turn:relay.metered.ca:443?transport=tcp",
                username: "7e1ac9b3e27979664040db7d",
                credential: "PbSlSfQOZcY9SaNS",
            },
        ],
        iceCandidatePoolSize: 10,
    }
    const [peer, setPeer] = useState<Peer | null>(null)

    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!participantId) return

        const myPeer = new Peer(participantId, {
            debug: 2,
            config: {
                iceServers: servers.iceServers,
            },
        })
        console.info("my paticipantId", participantId)
        myPeer.on("open", async (id) => {
            console.info("Peer connected with id", id)
            await events.enterEvent()
        })
        myPeer.on("close", async () => {
            console.info("Peer closed")
            await events.exitEvent()
        })
        myPeer.on("disconnected", () => console.info("Peer disconnected"))
        myPeer.on("error", (error) => {
            console.error("Peer error", error)
        })
        setPeer(myPeer)
        return () => {
            myPeer.destroy()
            setPeer(null)
        }
    }, [participantId])

    useEffect(() => {
        stream?.getTracks().forEach((track) => {
            if (track.kind === "audio") {
                track.enabled = cameraMicStatusData?.micStatus ?? false
            } else if (track.kind === "video") {
                track.enabled = cameraMicStatusData?.cameraStatus ?? true
            }
        })
    }, [cameraMicStatusData, stream?.getTracks()])

    useEffect(() => {
        if (!(peer && stream && courseId && role && remoteStreams.size > 0)) return

        remoteStreams.forEach((remoteStream) => {
            const mediaConnection = peer.call(remoteStream.id, stream, {
                metadata: {
                    id: participantId,
                    role,
                    courseId,
                },
            })

            mediaConnection.on("stream", (remoteMediaStream) => {
                remoteMediaStream.getTracks().forEach((track) => {
                    if (track.kind === "audio") {
                        remoteStream.stream.getAudioTracks().forEach((audioTrack) => {
                            remoteStream.stream.removeTrack(audioTrack)
                        })
                        remoteStream.stream.addTrack(track)
                    } else if (track.kind === "video") {
                        remoteStream.stream.getVideoTracks().forEach((videoTrack) => {
                            remoteStream.stream.removeTrack(videoTrack)
                        })
                        remoteStream.stream.addTrack(track)
                    }
                })
                refreshVideo()
            })

            mediaConnection.on("error", (error) => {
                console.error("Media connection error", error)
                setError(error.message)
            })
            mediaConnection.on("close", () => {
                console.info("Media connection closed")
            })
            mediaConnection.on("iceStateChanged", (state) => {
                console.info("ice state changed", state)
            })
            remoteStream.mediaConnection = mediaConnection

            peer.on("call", (mediaConnection) => {
                mediaConnection.answer(stream)
                const remoteStream = remoteStreams.get(mediaConnection.peer)
                if (remoteStream) remoteStream.mediaConnection = mediaConnection
                mediaConnection.on("stream", (remoteMediaStream) => {
                    remoteMediaStream.getTracks().forEach((track) => {
                        if (track.kind === "audio") {
                            remoteStream?.stream.getAudioTracks().forEach((audioTrack) => {
                                remoteStream?.stream.removeTrack(audioTrack)
                            })
                            remoteStream?.stream.addTrack(track)
                        } else if (track.kind === "video") {
                            remoteStream?.stream.getVideoTracks().forEach((videoTrack) => {
                                remoteStream?.stream.removeTrack(videoTrack)
                            })
                            remoteStream?.stream.addTrack(track)
                        }
                    })
                    refreshVideo()
                })
                mediaConnection.on("error", (error) => {
                    console.error("Media connection error", error)
                    setError(error.message)
                })
                mediaConnection.on("close", () => {
                    console.info("Media connection closed")
                })
            })
        })
        return () => {
            remoteStreams.forEach((remoteStream) => {
                remoteStream.mediaConnection?.close()
                remoteStream.mediaConnection = undefined
            })
        }
    }, [peer, stream, courseId, role, remoteStreams])

    return {
        remoteStreams,
        error,
    }
}
