import {renderHook} from '@testing-library/react'
import {beforeEach, describe, expect, it, vi} from 'vitest'

import {
  ScheduledPublishingEnabledProvider,
  useScheduledPublishingEnabled,
} from './ScheduledPublishingEnabledProvider'

vi.mock('../../../hooks', () => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const actual: typeof import('../../../hooks') = vi.requireActual('../../../hooks')
  const mock = vi.fn()

  return new Proxy(actual, {
    get: (target, property: keyof typeof actual) => {
      if (property === 'useFeatureEnabled') return mock
      return target[property]
    },
  })
})

vi.mock('../../../studio', () => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const actual: typeof import('../../../studio') = vi.requireActual('../../../studio')
  const mock = vi.fn()

  return new Proxy(actual, {
    get: (target, property: keyof typeof actual) => {
      if (property === 'useWorkspace') return mock
      return target[property]
    },
  })
})

describe('ScheduledPublishingEnabledProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should not show scheduled publishing if user opt out and the feature is not enabled (any plan)', () => {
    require('../../../hooks').useFeatureEnabled.mockReturnValue({enabled: false, isLoading: false})
    require('../../../studio').useWorkspace.mockReturnValue({scheduledPublishing: {enabled: false}})

    const value = renderHook(useScheduledPublishingEnabled, {
      wrapper: ScheduledPublishingEnabledProvider,
    })

    expect(value.result.current).toEqual({enabled: false, mode: null})
  })
  it('should not show scheduled publishing  if user opt out and the feature is enabled (any plan)', () => {
    require('../../../hooks').useFeatureEnabled.mockReturnValue({enabled: true, isLoading: false})
    require('../../../studio').useWorkspace.mockReturnValue({scheduledPublishing: {enabled: false}})

    const value = renderHook(useScheduledPublishingEnabled, {
      wrapper: ScheduledPublishingEnabledProvider,
    })

    expect(value.result.current).toEqual({enabled: false, mode: null})
  })

  it('should show default mode if user hasnt opted out and the feature is enabled (growth or above)', () => {
    require('../../../hooks').useFeatureEnabled.mockReturnValue({enabled: true, isLoading: false})
    require('../../../studio').useWorkspace.mockReturnValue({scheduledPublishing: {enabled: true}})

    const value = renderHook(useScheduledPublishingEnabled, {
      wrapper: ScheduledPublishingEnabledProvider,
    })

    expect(value.result.current).toEqual({enabled: true, mode: 'default'})
  })

  it('should show upsell mode if user has not opt out and the feature is not enabled (free plans)', () => {
    require('../../../hooks').useFeatureEnabled.mockReturnValue({enabled: false, isLoading: false})
    require('../../../studio').useWorkspace.mockReturnValue({scheduledPublishing: {enabled: true}})

    const value = renderHook(useScheduledPublishingEnabled, {
      wrapper: ScheduledPublishingEnabledProvider,
    })

    expect(value.result.current).toEqual({enabled: true, mode: 'upsell'})
  })

  it('should not show tasks if it is loading the feature', () => {
    require('../../../hooks').useFeatureEnabled.mockReturnValue({enabled: false, isLoading: true})
    require('../../../studio').useWorkspace.mockReturnValue({scheduledPublishing: {enabled: true}})

    const value = renderHook(useScheduledPublishingEnabled, {
      wrapper: ScheduledPublishingEnabledProvider,
    })

    expect(value.result.current).toEqual({enabled: false, mode: null})
  })

  it('should call "useFeatureEnabled" with "scheduledPublishing"', () => {
    require('../../../studio').useWorkspace.mockReturnValue({scheduledPublishing: {enabled: false}})

    const useFeatureEnabled = require('../../../hooks').useFeatureEnabled
    useFeatureEnabled.mockReturnValue({enabled: false, isLoading: false})

    renderHook(useScheduledPublishingEnabled, {
      wrapper: ScheduledPublishingEnabledProvider,
    })

    expect(useFeatureEnabled).toHaveBeenCalledWith('scheduledPublishing')
  })
})
