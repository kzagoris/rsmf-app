import { FunctionComponent, useEffect, useState } from "react"
import FileUpload from "react-mui-fileuploader"
import { ExtendedFileProps } from "react-mui-fileuploader/dist/types/index.types"
import { Box } from "@mui/material"
import { IdCardView } from "~/components/shared/IdCardView"
import { ImageIdType } from "~/models/User"
import { useTranslation } from "react-i18next"

type Props = {
    getIdImage: (idImage: ImageIdType) => void
    currentIdImage: ImageIdType | null | undefined
}

const UploadIDCard: FunctionComponent<Props> = ({ currentIdImage, getIdImage }) => {
    const [file, setFile] = useState<ImageIdType | null>(null)
    const { t } = useTranslation()

    useEffect(() => {
        if (currentIdImage && currentIdImage.fullPath) {
            setFile({
                fullPath: currentIdImage.fullPath,
                extension: currentIdImage.extension,
            })
        }
    }, [currentIdImage])

    const handleFileUploadError = (error: string) => {
        console.error("there error here", error)
    }

    const handleFilesChange = (files: ExtendedFileProps[]) => {
        if (files.length === 0 || !files[0].path || !files[0].extension) {
            return
        }

        setFile({
            fullPath: files[0].path,
            extension: files[0].extension,
        } satisfies ImageIdType)
    }

    const handleCardRemove = () => {
        setFile(null)
    }
    const handleCardConfirm = () => {
        if (file) {
            getIdImage(file)
        }
    }

    return (
        <Box display="flex" justifyContent="center" alignItems="center" m="2em">
            {file ? (
                <IdCardView onRemove={handleCardRemove} onConfirm={handleCardConfirm} imageIdCard={file.fullPath} />
            ) : (
                <FileUpload
                    getBase64
                    acceptedType={"image/*"}
                    errorSizeMessage={t("File size is too big")}
                    BannerProps={{ elevation: 0, variant: "outlined" }}
                    showPlaceholderImage
                    PlaceholderGridProps={{ md: 4 }}
                    LabelsGridProps={{ md: 8 }}
                    onContextReady={(context) => {
                        // access to component context here
                    }}
                    ContainerProps={{
                        elevation: 0,
                        variant: "outlined",
                        sx: { p: 1 },
                    }}
                    PlaceholderImageDimension={{
                        xs: { width: 128, height: 128 },
                        sm: { width: 128, height: 128 },
                        md: { width: 164, height: 164 },
                        lg: { width: 256, height: 256 },
                    }}
                    multiFile={false}
                    disabled={false}
                    title={t("Upload ID Card")}
                    header={t("Drag and drop your ID card here")}
                    leftLabel={t("or")}
                    rightLabel={t("to select a file")}
                    buttonLabel={t("click here")}
                    buttonRemoveLabel={t("Remove")}
                    maxFileSize={10}
                    maxUploadFiles={1}
                    maxFilesContainerHeight={357}
                    allowedExtensions={["jpg", "jpeg", "png", "webp"]}
                    onFilesChange={handleFilesChange}
                    onError={handleFileUploadError}
                    bannerProps={{ elevation: 0, variant: "outlined" }}
                    containerProps={{ elevation: 0, variant: "outlined" }}
                />
            )}
        </Box>
    )
}

export { UploadIDCard }
