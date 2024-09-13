import {CloseIcon} from '@sanity/icons'
import {useTelemetry} from '@sanity/telemetry/react'
import {type PortableTextBlock} from '@sanity/types'
import {Box, Flex, Grid, Text} from '@sanity/ui'
import {Fragment, useCallback, useMemo, useRef} from 'react'
import {useTranslation} from 'react-i18next'
import {styled} from 'styled-components'

import {Button, Dialog} from '../../../ui-components'
import {useDateTimeFormat, type UseDateTimeFormatOptions} from '../../hooks'
import {UpsellDescriptionSerializer} from '../upsell'
import {StudioAnnouncementModalLinkClicked} from './__telemetry__/studioAnnouncements.telemetry'
import {Divider} from './Divider'
import {type StudioAnnouncementDocument} from './types'

const DATE_FORMAT_OPTIONS: UseDateTimeFormatOptions = {
  month: 'short',
  day: '2-digit',
}

const Root = styled(Box)`
  overflow: auto;
  max-height: calc(100vh - 200px);
`

const DialogHeader = styled(Grid)`
  position: sticky;
  display: grid;
  grid-template-columns: 64px 1fr 64px;
  top: 0;
  z-index: 1;
  background: var(--card-bg-color);
`

const FloatingButton = styled(Button)`
  position: absolute;
  top: 12px;
  right: 24px;
  z-index: 2;
`

interface UnseenDocumentProps {
  body: PortableTextBlock[]
  header: string
  publishedDate?: string
}

/**
 * Renders the unseen document in the dialog.
 * Has a sticky header with the date and title, and a body with the content.
 */
function UnseenDocument({body = [], header, publishedDate}: UnseenDocumentProps) {
  const telemetry = useTelemetry()
  const dateFormatter = useDateTimeFormat(DATE_FORMAT_OPTIONS)

  const formattedDate = useMemo(() => {
    if (!publishedDate) return ''
    return dateFormatter.format(new Date(publishedDate))
  }, [publishedDate, dateFormatter])

  const handleLinkClick = useCallback(() => {
    telemetry.log(StudioAnnouncementModalLinkClicked)
  }, [telemetry])

  return (
    <Box>
      <DialogHeader padding={3}>
        <Box flex={'none'} padding={2} paddingRight={0}>
          <Box paddingLeft={2}>
            <Text size={1} muted>
              {formattedDate}
            </Text>
          </Box>
        </Box>
        <Flex flex={1} padding={2} justify="center">
          <Text size={1} weight="semibold">
            {header}
          </Text>
        </Flex>
      </DialogHeader>
      <Box padding={4}>
        <UpsellDescriptionSerializer blocks={body} onLinkClick={handleLinkClick} />
      </Box>
    </Box>
  )
}

interface StudioAnnouncementDialogProps {
  unseenDocuments: StudioAnnouncementDocument[]
  onClose: () => void
}

/**
 * Renders the studio announcement dialog displaying unseen announcements.
 * @internal
 * @hidden
 */
export function StudioAnnouncementsDialog({
  unseenDocuments = [],
  onClose,
}: StudioAnnouncementDialogProps) {
  const dialogRef = useRef(null)
  const {t} = useTranslation()

  return (
    <Dialog
      id="in-app-communication-dialog"
      onClose={onClose}
      width={1}
      bodyHeight="fill"
      padding={false}
      __unstable_hideCloseButton
      __unstable_autoFocus={false}
    >
      <Root ref={dialogRef} height="fill">
        {unseenDocuments.map((unseenDocument, index) => (
          <Fragment key={unseenDocument._id}>
            <UnseenDocument
              body={unseenDocument.body}
              header={unseenDocument.title}
              publishedDate={unseenDocument.publishedDate}
            />
            {/* Add a divider between each dialog if it's not the last one */}
            {index < unseenDocuments.length - 1 && <Divider parentRef={dialogRef} />}
          </Fragment>
        ))}
        <FloatingButton
          aria-label={t('announcement.dialog.close-label')}
          icon={CloseIcon}
          mode="bleed"
          onClick={onClose}
          tooltipProps={{
            content: t('announcement.dialog.close'),
          }}
        />
      </Root>
    </Dialog>
  )
}