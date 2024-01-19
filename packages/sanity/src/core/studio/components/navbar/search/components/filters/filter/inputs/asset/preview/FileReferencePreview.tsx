import {BinaryDocumentIcon} from '@sanity/icons'
import type {FileAsset, ReferenceValue} from '@sanity/types'
import {Card, Flex, Stack, Text, TextSkeleton} from '@sanity/ui'
import {useCallback} from 'react'
import {formatBytes} from '../../../../../../../../../../form/inputs/common/helper'
import {observeFileAsset} from '../../../../../../../../../../form/studio/inputs/client-adapters/assets'
import {WithReferencedAsset} from '../../../../../../../../../../form/utils/WithReferencedAsset'
import {useDocumentPreviewStore} from '../../../../../../../../../../store'

interface FileReferencePreviewProps {
  reference: ReferenceValue
}

export function FileReferencePreview({reference}: FileReferencePreviewProps) {
  const documentPreviewStore = useDocumentPreviewStore()
  const observeAsset = useCallback(
    (id: string) => observeFileAsset(documentPreviewStore, id),
    [documentPreviewStore],
  )
  return (
    <WithReferencedAsset
      observeAsset={observeAsset}
      reference={reference}
      waitPlaceholder={<FileSkeleton />}
    >
      {(asset) => <FilePreview asset={asset} />}
    </WithReferencedAsset>
  )
}

function FilePreview({asset}: {asset: FileAsset}) {
  // todo: consider replacing with <SanityDefaultPreview>
  return (
    <Card padding={2} shadow={1}>
      <Flex align="center" justify="space-between" wrap="nowrap">
        <Card padding={3} radius={1} shadow={1} tone="transparent">
          <Text>
            <BinaryDocumentIcon />
          </Text>
        </Card>
        <Stack flex={1} space={2} marginLeft={3}>
          <Text muted size={1} textOverflow="ellipsis" weight="medium">
            {asset?.originalFilename || asset._id}
          </Text>
          <Text size={1} muted>
            {formatBytes(asset.size)}
          </Text>
        </Stack>
      </Flex>
    </Card>
  )
}

function FileSkeleton() {
  return (
    <Card padding={2} shadow={1}>
      <Flex align="center" justify="flex-start">
        <Card padding={3} radius={1} shadow={1} tone="transparent">
          <Text>
            <BinaryDocumentIcon />
          </Text>
        </Card>
        <Stack flex={1} space={2} marginLeft={3}>
          <TextSkeleton animated style={{width: '100%'}} radius={1} />
          <TextSkeleton animated style={{width: '100%'}} radius={1} />
        </Stack>
      </Flex>
    </Card>
  )
}
