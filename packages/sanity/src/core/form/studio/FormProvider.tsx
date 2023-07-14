import {ObjectSchemaType, Path, ValidationMarker} from '@sanity/types'
import React, {useCallback, useState} from 'react'
import {Box, Button, Stack} from '@sanity/ui'
import {useSource} from '../../studio'
import {PatchChannel, PatchEvent} from '../patch'
import {FormBuilderProvider} from '../FormBuilderProvider'
import {FormFieldGroup, ObjectMember, StateTree} from '../store'
import {
  BlockAnnotationProps,
  BlockProps,
  FieldProps,
  InputProps,
  ItemProps,
  RenderPreviewCallbackProps,
} from '../types'
import {
  useAnnotationComponent,
  useBlockComponent,
  useFieldComponent,
  useInlineBlockComponent,
  useInputComponent,
  useItemComponent,
  usePreviewComponent,
} from '../form-components-hooks'
import {FieldPresence, FormNodePresence} from '../../presence'
import {PreviewLoader} from '../../preview/components/PreviewLoader'
import {DocumentFieldAction} from '../../config'

/**
 * @alpha This API might change.
 */
export interface FormProviderProps {
  /** @internal */
  __internal_fieldActions?: DocumentFieldAction[]
  /** @internal Considered internal, do not use. */
  __internal_patchChannel: PatchChannel

  autoFocus?: boolean
  changesOpen?: boolean
  children?: React.ReactNode
  collapsedFieldSets: StateTree<boolean> | undefined
  collapsedPaths: StateTree<boolean> | undefined
  focusPath: Path
  focused: boolean | undefined
  groups: FormFieldGroup[]
  id: string
  members: ObjectMember[]
  onChange: (changeEvent: PatchEvent) => void
  onPathBlur: (path: Path) => void
  onPathFocus: (path: Path) => void
  onPathOpen: (path: Path) => void
  onFieldGroupSelect: (path: Path, groupName: string) => void
  onSetPathCollapsed: (path: Path, collapsed: boolean) => void
  onSetFieldSetCollapsed: (path: Path, collapsed: boolean) => void
  presence: FormNodePresence[]
  readOnly?: boolean
  schemaType: ObjectSchemaType
  validation: ValidationMarker[]
  value: {[field in string]: unknown} | undefined
}

function FieldWrapper(props: {
  presence: FieldProps['presence']
  debug?: boolean
  children: React.ReactNode
}) {
  const {children, presence, debug} = props

  return (
    <Stack style={debug ? {outline: '1px dashed rgba(255, 0, 255, 0.5)'} : undefined}>
      <Box
        padding={3}
        style={{
          position: 'relative',
          background: debug ? 'rgba(255, 0, 255, 0.2)' : undefined,
        }}
        data-presence-wrapper
      >
        {presence && presence.length > 0 && (
          <div style={{position: 'absolute', left: 0, top: 0}}>
            <FieldPresence presence={presence} maxAvatars={4} />
          </div>
        )}
      </Box>
      {children}
    </Stack>
  )
}

/**
 * Default wiring for `FormBuilderProvider` when used with Sanity
 *
 * @alpha This API might change.
 */
export function FormProvider(props: FormProviderProps) {
  const {
    __internal_fieldActions: fieldActions,
    __internal_patchChannel: patchChannel,
    autoFocus,
    changesOpen,
    children,
    collapsedFieldSets,
    collapsedPaths,
    focusPath,
    focused,
    groups,
    id,
    members,
    onChange,
    onPathBlur,
    onPathFocus,
    onPathOpen,
    onFieldGroupSelect,
    onSetPathCollapsed,
    onSetFieldSetCollapsed,
    presence,
    readOnly,
    schemaType,
    validation,
    value,
  } = props

  const {file, image} = useSource().form

  // These hooks may be stored in context as an perf optimization
  const Input = useInputComponent()
  const Field = useFieldComponent()
  const Preview = usePreviewComponent()
  const Item = useItemComponent()
  const Block = useBlockComponent()
  const InlineBlock = useInlineBlockComponent()
  const Annotation = useAnnotationComponent()

  const [debug, setDebug] = useState<boolean>(false)

  const renderInput = useCallback(
    (inputProps: Omit<InputProps, 'renderDefault'>) => {
      if (inputProps.id === 'root') {
        return (
          <>
            <Box marginBottom={5}>
              <Button
                text="Debug"
                onClick={() => setDebug((v) => !v)}
                fontSize={1}
                padding={2}
                mode="ghost"
              />
            </Box>
            <Input {...inputProps} />
          </>
        )
      }

      return <Input {...inputProps} />
    },
    [Input]
  )
  const renderField = useCallback(
    (fieldProps: Omit<FieldProps, 'renderDefault'>) => {
      return (
        <FieldWrapper presence={fieldProps.presence} debug={debug}>
          <Field {...fieldProps} />
        </FieldWrapper>
      )
    },
    [Field, debug]
  )
  const renderItem = useCallback(
    (itemProps: Omit<ItemProps, 'renderDefault'>) => <Item {...itemProps} />,
    [Item]
  )
  const renderPreview = useCallback(
    (previewProps: RenderPreviewCallbackProps) => (
      <PreviewLoader component={Preview} {...previewProps} />
    ),
    [Preview]
  )
  const renderBlock = useCallback(
    (blockProps: Omit<BlockProps, 'renderDefault'>) => <Block {...blockProps} />,
    [Block]
  )
  const renderInlineBlock = useCallback(
    (blockProps: Omit<BlockProps, 'renderDefault'>) => <InlineBlock {...blockProps} />,
    [InlineBlock]
  )
  const renderAnnotation = useCallback(
    (annotationProps: Omit<BlockAnnotationProps, 'renderDefault'>) => (
      <Annotation {...annotationProps} />
    ),
    [Annotation]
  )

  return (
    <FormBuilderProvider
      __internal_fieldActions={fieldActions}
      __internal_patchChannel={patchChannel}
      autoFocus={autoFocus}
      changesOpen={changesOpen}
      collapsedFieldSets={collapsedFieldSets}
      collapsedPaths={collapsedPaths}
      file={file}
      focusPath={focusPath}
      focused={focused}
      groups={groups}
      id={id}
      image={image}
      members={members}
      onChange={onChange}
      onPathBlur={onPathBlur}
      onPathFocus={onPathFocus}
      onPathOpen={onPathOpen}
      onFieldGroupSelect={onFieldGroupSelect}
      onSetPathCollapsed={onSetPathCollapsed}
      onSetFieldSetCollapsed={onSetFieldSetCollapsed}
      presence={presence}
      readOnly={readOnly}
      renderAnnotation={renderAnnotation}
      renderBlock={renderBlock}
      renderField={renderField}
      renderInlineBlock={renderInlineBlock}
      renderInput={renderInput}
      renderItem={renderItem}
      renderPreview={renderPreview}
      schemaType={schemaType}
      validation={validation}
      value={value}
    >
      {children}
    </FormBuilderProvider>
  )
}
