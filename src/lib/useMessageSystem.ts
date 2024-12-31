import { useEffect, useState } from "react"

type options = {
    timeout?: number
}

type severityType = "error" | "warning" | "info" | "success" | undefined
type MessageSystemProps = { message: string | null; severity: severityType; options?: options }
const useMessageSystem = () => {
    const DEFAULT_TIMEOUT: number = 5000

    const [message, setMessage] = useState<string | null>(null)
    const [severity, setSeverity] = useState<severityType>(undefined)

    useEffect(() => {
        document.addEventListener("messageSystemEvent", handleEvent)
        return () => {
            document.removeEventListener("messageSystemEvent", handleEvent)
        }
    }, [])

    const handleEvent = (event: Event) => {
        const customEvent = event as CustomEvent<MessageSystemProps>
        customEvent && setMessageSystem(customEvent.detail)
    }

    const setMessageSystem = (messageProps: MessageSystemProps) => {
        if (!messageProps.message) {
            setMessage(null)
            return
        }
        setMessage(messageProps.message)
        setSeverity(messageProps.severity)
        const currentOptions = messageProps.options ?? { timeout: DEFAULT_TIMEOUT }
        if (currentOptions.timeout == null) currentOptions.timeout = DEFAULT_TIMEOUT
        currentOptions.timeout > 0 &&
            setTimeout(() => {
                setMessage(null)
            }, currentOptions.timeout || DEFAULT_TIMEOUT)
    }
    const setError = (msg: string, options?: options) => {
        document.dispatchEvent(
            new CustomEvent("messageSystemEvent", {
                detail: {
                    message: msg,
                    severity: "error",
                    options,
                },
            }),
        )
    }

    const setWarning = (msg: string, options?: options) => {
        document.dispatchEvent(
            new CustomEvent("messageSystemEvent", {
                detail: {
                    message: msg,
                    severity: "warning",
                    options,
                },
            }),
        )
    }

    const setInfo = (msg: string, options?: options) => {
        document.dispatchEvent(
            new CustomEvent("messageSystemEvent", {
                detail: {
                    message: msg,
                    severity: "info",
                    options,
                },
            }),
        )
    }

    const setSuccess = (msg: string, options?: options) => {
        document.dispatchEvent(
            new CustomEvent("messageSystemEvent", {
                detail: {
                    message: msg,
                    severity: "success",
                    options,
                },
            }),
        )
    }

    const clearMessage = () => {
        document.dispatchEvent(
            new CustomEvent("messageSystemEvent", { detail: { message: null, severity: undefined } }),
        )
    }

    return [
        message,
        severity,
        {
            clearMessage,
            setError,
            setWarning,
            setInfo,
            setSuccess,
        },
    ] as [
        string | null,
        severityType,
        {
            clearMessage: () => void
            setError: (msg: string, options?: options) => void
            setWarning: (msg: string, options?: options) => void
            setInfo: (msg: string, options?: options) => void
            setSuccess: (msg: string, options?: options) => void
        },
    ]
}

export { useMessageSystem, type options, type severityType }
