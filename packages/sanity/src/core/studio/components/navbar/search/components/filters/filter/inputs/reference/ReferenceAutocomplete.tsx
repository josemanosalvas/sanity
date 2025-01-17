import {type ReferenceValue, type SchemaType} from '@sanity/types'
import {Autocomplete, Box, Flex, Text} from '@sanity/ui'
import {
  type ForwardedRef,
  forwardRef,
  type ReactElement,
  useCallback,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react'
import {styled} from 'styled-components'

import {Popover} from '../../../../../../../../../../ui-components'
import {useSchema} from '../../../../../../../../../hooks'
import {Translate, useTranslation} from '../../../../../../../../../i18n'
import {type SearchHit} from '../../../../../../../../../search'
import {getPublishedId} from '../../../../../../../../../util'
import {POPOVER_RADIUS} from '../../../../../constants'
import {useSearchState} from '../../../../../contexts/search/useSearchState'
import {useSearch} from '../../../../../hooks/useSearch'
import {getDocumentTypesTruncated} from '../../../../../utils/documentTypesTruncated'
import {SearchResultItem} from '../../../../searchResults/item/SearchResultItem'

type AutocompleteSearchHit = {value: string} & SearchHit

interface PopoverContentProps {
  content: ReactElement | null
  hidden: boolean
  onMouseEnter: () => void
  onMouseLeave: () => void
}

interface ReferenceAutocompleteProps {
  onSelect?: (reference: ReferenceValue | null) => void
  types?: SchemaType[]
  value?: ReferenceValue | null
}

const NO_FILTER = () => true

const StyledText = styled(Text)`
  word-break: break-word;
`

export const ReferenceAutocomplete = forwardRef(function ReferenceAutocomplete(
  {onSelect, types = [], value}: ReferenceAutocompleteProps,
  ref: ForwardedRef<HTMLInputElement>,
) {
  const autocompletePopoverReferenceElementRef = useRef<HTMLDivElement | null>(null)

  const schema = useSchema()

  const {
    state: {fullscreen},
  } = useSearchState()
  const {t} = useTranslation()

  const autocompleteId = useId()

  const [hits, setHits] = useState<AutocompleteSearchHit[]>([])
  const {handleSearch, searchState} = useSearch({
    allowEmptyQueries: true,
    initialState: {
      hits: [],
      loading: false,
      error: null,
      terms: {query: '', types},
    },
    onComplete: (result) => {
      setHits(result.hits.map(({hit}) => ({value: hit._id, hit})))
    },
    schema,
  })

  /**
   * Trigger non-debounced search query when autocomplete is manually opened
   */
  const handleAutocompleteOpenButtonClick = useCallback(() => {
    handleSearch({
      debounceTime: 0,
      options: {limit: 100},
      terms: {query: '', types},
    })
  }, [handleSearch, types])

  /**
   * Trigger debounced search queries on text input.
   *
   * When search query has been cleared (either via manual input or by closing autocomplete),
   * trigger an non-debounecd 'empty' search to clear search state terms and reset hits.
   */
  const handleQueryChange = useCallback(
    (query: string | null) => {
      if (query) {
        handleSearch({
          options: {limit: 100},
          terms: {query: query || '', types},
        })
      } else {
        handleSearch({
          debounceTime: 0,
          options: {limit: 0},
          terms: {query: '', types},
        })
      }
    },
    [handleSearch, types],
  )

  const handleSelect = useCallback(
    (val: string) => {
      const hit = hits.find((h) => h.value === val)?.hit
      if (hit) {
        onSelect?.({
          _ref: getPublishedId(hit._id),
          _type: hit._type,
        })
      }
    },
    [hits, onSelect],
  )
  const placeholderText = useMemo(() => {
    if (types.length === 0) {
      // "Search all documents"
      return t('search.action.search-all-types')
    }

    const {remainingCount, types: visibleTypes} = getDocumentTypesTruncated({types})
    const key =
      remainingCount > 0
        ? 'search.action.search-specific-types-truncated'
        : 'search.action.search-specific-types'

    // "Search for Author, Book" or "Search for Author, Book +2 more"
    return t(key, {
      count: remainingCount,
      types: visibleTypes,
      formatParams: {types: {style: 'short', type: 'unit'}},
    })
  }, [types, t])

  const renderOption = useCallback((option: AutocompleteSearchHit) => {
    return (
      <SearchResultItem
        disableIntentLink
        documentId={option.value}
        documentType={option.hit._type}
        layout="compact"
      />
    )
  }, [])

  const renderPopover = useCallback(
    (props: PopoverContentProps, contentRef: ForwardedRef<HTMLDivElement>) => {
      const {content, hidden, onMouseEnter, onMouseLeave} = props
      const hasResults = hits && hits.length > 0
      return (
        <Popover
          constrainSize
          content={
            <div ref={contentRef}>
              {hasResults
                ? content
                : searchState.terms.query && (
                    <Box padding={4}>
                      <Flex align="center" height="fill" justify="center">
                        <StyledText align="center" muted>
                          <Translate
                            t={t}
                            i18nKey="new-document.no-results"
                            values={{searchQuery: searchState.terms.query}}
                          />
                        </StyledText>
                      </Flex>
                    </Box>
                  )}
            </div>
          }
          fallbackPlacements={['bottom', 'bottom-end']}
          matchReferenceWidth
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          open={!searchState.loading && !hidden}
          overflow="auto"
          placement="bottom-start"
          radius={POPOVER_RADIUS}
          referenceElement={autocompletePopoverReferenceElementRef.current}
        />
      )
    },
    [hits, searchState.loading, searchState.terms.query, t],
  )

  return (
    <div ref={autocompletePopoverReferenceElementRef}>
      <Autocomplete
        aria-label={placeholderText}
        filterOption={NO_FILTER}
        fontSize={fullscreen ? 2 : 1}
        id={autocompleteId}
        loading={searchState.loading}
        openButton={{onClick: handleAutocompleteOpenButtonClick}}
        options={hits}
        onQueryChange={handleQueryChange}
        onSelect={handleSelect}
        placeholder={placeholderText}
        radius={2}
        ref={ref}
        renderOption={renderOption}
        renderPopover={renderPopover}
        value={value?._ref}
      />
    </div>
  )
})
