const workspace = {
  title: 'Workspace',
  recentNovels: 'Recent Novels',
  createNovel: 'Create Novel',
  allNovels: 'All Novels',
  wordCount: 'Total Words',
  chapterCount: 'Chapters',
  page: {
    quote: 'A word after a word after a word is power.',
    author: 'Margaret Atwood',
  },
  projectList: {
    title: 'My Works',
    createNew: 'Start a new chapter',
    createSuccess: 'Created successfully',
    createError: 'Failed to create',
    statusPublished: 'Published',
    statusDraft: 'Draft',
    emptyDescription: 'On this blank canvas, your story awaits.',
  },
  statsCard: {
    title: 'Writing Footprints',
    creationDays: 'Days Created',
    days: 'Days',
    finishedChapters: 'Finished Chapters',
    worldviewEntries: 'Worldview Entries',
  },
  contributionGraph: {
    title: 'Writing Calendar',
    activeDays: 'Active this week',
    days: 'days',
    less: 'Less',
    more: 'More',
    updates: 'updates',
    noActivity: 'No activity',
  },
  welcome: {
    defaultName: 'Creator',
    timeConfig: {
      morning: {
        greeting: 'Morning Light',
        message: 'Good morning. Let the first thoughts of dawn turn into words.',
      },
      noon: {
        greeting: 'Midday Sun',
        message: 'Good afternoon. Inspiration is high, perfect time to advance the main plot.',
      },
      afternoon: {
        greeting: 'Lazy Afternoon',
        message: 'Have a coffee, relax a bit. Or maybe plan a twist for the villain?',
      },
      evening: {
        greeting: 'Dusk Falls',
        message: 'Good evening. The noise fades, now is the best time for refinement.',
      },
      night: {
        greeting: 'Quiet Night',
        message: 'It\'s getting late. Great stories are often born in countless sleepless nights.',
      },
    },
  },
} as const

export default workspace
