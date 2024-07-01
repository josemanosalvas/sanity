import {type SanityDocument} from '@sanity/types'
import {type ButtonTone} from '@sanity/ui'

export interface BundleDocument extends SanityDocument {
  _type: 'bundle'
  title: string
  name: string
  description?: string
  tone?: ButtonTone
  icon?: string
  authorId: string
}