const main = {
  appLogo: {
    alt: 'Narraverse logo',
  },
  dock: {
    menu: {
      ai: 'Narraverse AI',
      novels: 'My Novels',
      trash: 'Trash',
    },
    toggle: {
      show: 'Show navigation',
      hide: 'Hide navigation',
    },
  },
  sidebar: {
    toggleMenu: 'Toggle menu',
    openSidebar: 'Open sidebar',
    closeSidebar: 'Close sidebar',
  },
  search: {
    title: 'Search',
    placeholder: 'Search...',
    loading: 'Loading...',
    empty: {
      noResults: 'No results found',
      hint: 'Type to search...',
    },
    routes: {
      chat: 'Writing Assistant',
      novels: 'My Novels',
      trash: 'Trash',
      news: 'Product Updates',
    },
    types: {
      novel: 'Novel',
      chat: 'Chat',
      route: 'Page',
    },
  },
  profile: {
    title: 'Edit profile',
    uploadHint: 'Click the camera icon to upload an avatar',
    fields: {
      penName: 'Pen name',
      website: 'Website',
    },
    placeholders: {
      penName: 'Enter your pen name',
    },
    actions: {
      cancel: 'Cancel',
      save: 'Save',
      uploading: 'Uploading...',
      saving: 'Saving...',
    },
    messages: {
      avatarTooLarge: 'Avatar size must be under 5MB',
      avatarNotImage: 'Please select an image file',
      avatarUploadFailed: 'Avatar upload failed',
      updateFailed: 'Update failed',
      updateFailedRetry: 'Update failed, please try again',
      updated: 'Profile updated',
    },
  },
} as const

export default main

