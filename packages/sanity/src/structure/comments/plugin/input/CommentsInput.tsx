import {EditorChange, RangeDecoration} from '@sanity/portable-text-editor'
import {Grid, Stack} from '@sanity/ui'
import {PropsWithChildren, useCallback, useMemo, useState} from 'react'
import styled, {css} from 'styled-components'
import {hues} from '@sanity/color'
import {Button} from '../../../../ui-components'
import {InputProps, PortableTextInputProps, isArrayOfBlocksSchemaType} from 'sanity'

const EMPTY_ARRAY: [] = []

function isPortableTextInputProps(
  inputProps: InputProps | Omit<InputProps, 'renderDefault'>,
): inputProps is PortableTextInputProps {
  return isArrayOfBlocksSchemaType(inputProps.schemaType)
}

function RangeDecorator(props: PropsWithChildren) {
  const {children} = props

  return <HighlightSpan data-ui="CommentDecorator">{children}</HighlightSpan>
}

function renderDecorator(props: PropsWithChildren) {
  return <RangeDecorator {...props} />
}

function isRangeInvalid() {
  return false
}

const HighlightSpan = styled.span(({theme}) => {
  const isDark = theme.sanity.v2?.color._dark
  const bg = hues.yellow[isDark ? 700 : 100].hex
  const border = hues.yellow[isDark ? 800 : 300].hex

  const hoverBg = hues.yellow[isDark ? 800 : 200].hex
  const hoverBorder = hues.yellow[isDark ? 900 : 400].hex

  return css`
    background-color: ${bg};
    border-bottom: 2px solid ${border};
    box-sizing: border-box;
    mix-blend-mode: ${isDark ? 'screen' : 'multiply'};
    transition:
      background-color 100ms ease,
      border-color 100ms ease;

    @media (hover: hover) {
      &:hover {
        background-color: ${hoverBg};
        border-bottom: 2px solid ${hoverBorder};

        [data-ui='CommentDecorator'] {
          background-color: inherit;
          border-bottom: inherit;
        }
      }
    }
  `
})

function CommentsPortableTextInput(props: PortableTextInputProps) {
  const [nextRangeDecorations, setNextRangeDecorations] = useState<RangeDecoration[]>([])
  const [currentSelectedRange, setCurrentSelectedRange] = useState<RangeDecoration | null>(null)

  const onEditorChange = useCallback((change: EditorChange) => {
    if (change.type === 'mutation') {
      //   console.log(change.snapshot)
    }

    const isSelectionChange = change.type === 'selection' && change.selection
    if (!isSelectionChange) return

    const range: RangeDecoration = {
      selection: change.selection,
      component: renderDecorator,
      isRangeInvalid,
    }

    setCurrentSelectedRange(range)
  }, [])

  const handleAddRange = useCallback(() => {
    const next = currentSelectedRange
    if (!next) return

    setNextRangeDecorations((prev) => [...prev, next])
    setCurrentSelectedRange(null)
  }, [currentSelectedRange])

  const resetRangeDecorations = useCallback(() => {
    setNextRangeDecorations([])
  }, [])

  const rangeDecorations = useMemo((): RangeDecoration[] => {
    return [
      // Any existing range decorations
      ...(props.rangeDecorations || EMPTY_ARRAY),
      // Any new range decorations
      ...nextRangeDecorations,
    ]
  }, [nextRangeDecorations, props.rangeDecorations])

  return (
    <Stack space={2}>
      {props.renderDefault({
        ...props,
        rangeDecorations,
        onEditorChange,
      })}

      <Grid columns={2} gap={2}>
        <Button text="Clear ranges" onClick={resetRangeDecorations} mode="ghost" />
        <Button text="Add range" onClick={handleAddRange} />
      </Grid>
    </Stack>
  )
}

export function CommentsInput(props: InputProps) {
  if (isPortableTextInputProps(props)) {
    return <CommentsPortableTextInput {...props} />
  }

  return props.renderDefault(props)
}
