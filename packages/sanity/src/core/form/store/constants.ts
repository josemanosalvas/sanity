import {type FieldGroup} from '@sanity/types'

import {studioLocaleNamespace} from '../../i18n/localeNamespaces'

/**
 * Max supported field depth. Fields deeper than this will be considered hidden.
 */
export const MAX_FIELD_DEPTH = 20

/**
 * Start auto-collapsing fields at this nesting level unless schema/field configuration says otherwise
 */
export const AUTO_COLLAPSE_DEPTH = 3

export const ALL_FIELDS_GROUP: FieldGroup = {
  name: 'all-fields',
  title: 'All fields',
  hidden: false,
  i18n: {
    title: {
      key: 'inputs.object.field-group-tabs.all-fields-title',
      ns: studioLocaleNamespace,
    },
  },
}
