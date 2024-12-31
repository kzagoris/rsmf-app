import { Box, Button, Card, CardActionArea, CardMedia } from "@mui/material"
import { FunctionComponent } from "react"
import { useTranslation } from "react-i18next"

interface IdCardViewProps {
    imageIdCard?: string
    onRemove?: () => void
    onConfirm?: () => void
    displayOnly?: boolean
}

export const IdCardView: FunctionComponent<IdCardViewProps> = ({ imageIdCard, onRemove, onConfirm, displayOnly }) => {
    const { t } = useTranslation()
    return (
        <Box maxWidth="md">
            <Card>
                {imageIdCard && (
                    <CardActionArea>
                        <CardMedia component="img" image={imageIdCard} />
                    </CardActionArea>
                )}
                {!displayOnly && (
                    <Box display="flex" gap="10em" justifyContent="space-between" alignItems="flex-end" m="2em">
                        <Button fullWidth color="error" variant="outlined" onClick={onRemove}>
                            {t("Remove")}
                        </Button>
                        <Button fullWidth variant="contained" onClick={onConfirm}>
                            {t("Confirm")}
                        </Button>
                    </Box>
                )}
            </Card>
        </Box>
    )
}
