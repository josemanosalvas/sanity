import {afterEach, describe, expect, jest, test} from '@jest/globals'
import {fireEvent, render, screen} from '@testing-library/react'
import {type ReactNode} from 'react'
import {defineConfig} from 'sanity'

import {createTestProvider} from '../../../../../test/testUtils/TestProvider'
import {structureUsEnglishLocaleBundle} from '../../../../structure/i18n'
import {StudioAnnouncementsDialog} from '../StudioAnnouncementsDialog'
import {type StudioAnnouncementDocument} from '../types'

jest.mock('@sanity/telemetry/react', () => ({
  useTelemetry: jest.fn(),
}))

const MOCKED_ANNOUNCEMENTS: StudioAnnouncementDocument[] = [
  {
    _id: 'studioAnnouncement-1',
    _type: 'productAnnouncement',
    _rev: '1',
    _createdAt: '',
    _updatedAt: '',
    title: 'Announcement 1',
    body: [
      {
        _type: 'block',
        style: 'normal',
        _key: 'block1',
        children: [{text: 'Content of announcement 1', _type: 'span', _key: 'span1'}],
      },
      {
        _type: 'block',
        style: 'normal',
        _key: '8eaba4868210',
        markDefs: [
          {
            _key: 'be43decf2c02',
            _type: 'link',
            href: 'https://github.com/sanity-io/sanity/releases/tag/v3.56.0',
          },
        ],
        children: [
          {
            _type: 'span',
            marks: ['be43decf2c02'],
            text: 'Content with a link',
            _key: '8a633d5e8f7c',
          },
        ],
      },
    ],
    announcementType: 'whats-new',
    publishedDate: '2024-09-11T14:44:00.000Z',
    audience: 'everyone',
  },
  {
    _id: 'studioAnnouncement-2',
    _type: 'productAnnouncement',
    _rev: '2',
    _createdAt: '',
    _updatedAt: '',
    title: 'Announcement 2',
    body: [
      {
        _type: 'block',
        _key: 'block1',
        style: 'normal',
        children: [{text: 'Content of announcement 2', _type: 'span', _key: 'span1'}],
      },
    ],
    announcementType: 'whats-new',
    publishedDate: '2024-09-10T14:44:00.000Z',
    audience: 'everyone',
  },
]

const config = defineConfig({
  projectId: 'test',
  dataset: 'test',
})

async function createAnnouncementWrapper() {
  const wrapper = await createTestProvider({
    config,
    resources: [structureUsEnglishLocaleBundle],
  })

  return ({children}: {children: ReactNode}) => wrapper({children: <>{children}</>})
}

describe('StudioAnnouncementsCard', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })
  test('renders correctly with unseen documents', async () => {
    const onCloseMock = jest.fn()

    const wrapper = await createAnnouncementWrapper()
    await render(
      <StudioAnnouncementsDialog unseenDocuments={MOCKED_ANNOUNCEMENTS} onClose={onCloseMock} />,
      {wrapper},
    )

    // Check that the titles are rendered
    expect(screen.getByText('Announcement 1')).toBeInTheDocument()
    expect(screen.getByText('Announcement 2')).toBeInTheDocument()

    // Check that the contents are rendered
    expect(screen.getByText('Content of announcement 1')).toBeInTheDocument()
    expect(screen.getByText('Content of announcement 2')).toBeInTheDocument()

    // Check the date is rendered
    expect(screen.getByText('Sep 11')).toBeInTheDocument()
    expect(screen.getByText('Sep 10')).toBeInTheDocument()

    // Expects divider to exists between the dialogs
    const dividers = screen.getAllByRole('separator')
    expect(dividers.length).toBe(1)

    // Check that the close button is rendered
    const closeButton = screen.getByLabelText('Close dialog')
    expect(closeButton).toBeInTheDocument()
  })
  test('calls onClose when the close button is clicked', async () => {
    const onCloseMock = jest.fn()

    const wrapper = await createAnnouncementWrapper()
    await render(
      <StudioAnnouncementsDialog unseenDocuments={MOCKED_ANNOUNCEMENTS} onClose={onCloseMock} />,
      {wrapper},
    )
    // Check that the close button is rendered
    const closeButton = screen.getByLabelText('Close dialog')
    fireEvent.click(closeButton)

    expect(onCloseMock).toHaveBeenCalled()
  })

  test('logs telemetry when link is clicked', async () => {
    const onCloseMock = jest.fn()
    const mockLog = jest.fn()
    const {useTelemetry} = require('@sanity/telemetry/react')
    // Set up the mock return value
    useTelemetry.mockReturnValue({
      log: mockLog,
    })
    const wrapper = await createAnnouncementWrapper()
    await render(
      <StudioAnnouncementsDialog unseenDocuments={MOCKED_ANNOUNCEMENTS} onClose={onCloseMock} />,
      {wrapper},
    )

    // Simulate clicking on a link
    const link = screen.getByText('Content with a link')
    fireEvent.click(link)

    expect(mockLog).toHaveBeenCalledWith({
      description: 'User clicked the link in the studio announcement modal',
      name: 'Studio Announcement Modal Link Clicked',
      schema: undefined,
      type: 'log',
      version: 1,
    })
  })
})