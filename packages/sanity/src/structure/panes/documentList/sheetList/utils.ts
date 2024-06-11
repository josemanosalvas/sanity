import {
  type BooleanDefinition,
  isBooleanSchemaType,
  isNumberSchemaType,
  isStringSchemaType,
  type NumberDefinition,
  type StringDefinition,
} from '@sanity/types'
import {type Cell, type Header} from '@tanstack/react-table'

import {type DocumentSheetTableRow} from './types'

export function getBorderWidth(
  element: Cell<DocumentSheetTableRow, unknown> | Header<DocumentSheetTableRow, unknown>,
): number {
  const isPinned = element.column.getIsPinned()
  if (isPinned && element.column.getIsLastColumn('left')) {
    return 2
  }

  if (element.column.getIsLastColumn()) {
    return 0
  }
  return typeof element.column.columnDef.meta?.borderWidth === 'undefined'
    ? 1
    : element.column.columnDef.meta.borderWidth
}

export function isSupportedSheetListField(
  fieldType: unknown,
): fieldType is BooleanDefinition | StringDefinition | NumberDefinition {
  return (
    isBooleanSchemaType(fieldType) || isNumberSchemaType(fieldType) || isStringSchemaType(fieldType)
  )
}
