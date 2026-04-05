const main = {
  appLogo: {
    alt: 'Narraverse-Logo',
  },
  dock: {
    menu: {
      ai: 'Narraverse KI',
      novels: 'Meine Romane',
      trash: 'Papierkorb',
    },
    toggle: {
      show: 'Navigation anzeigen',
      hide: 'Navigation ausblenden',
    },
  },
  sidebar: {
    toggleMenu: 'Menü umschalten',
    openSidebar: 'Seitenleiste öffnen',
    closeSidebar: 'Seitenleiste schließen',
  },
  search: {
    title: 'Suche',
    placeholder: 'Suchen...',
    loading: 'Wird geladen...',
    empty: {
      noResults: 'Keine Ergebnisse gefunden',
      hint: 'Zum Suchen tippen...',
    },
    routes: {
      chat: 'Schreibassistent',
      novels: 'Meine Romane',
      trash: 'Papierkorb',
      news: 'Produkt-Updates',
    },
    types: {
      novel: 'Roman',
      chat: 'Chat',
      route: 'Seite',
    },
  },
  profile: {
    title: 'Profil bearbeiten',
    uploadHint: 'Klicken Sie auf das Kamera-Symbol, um ein Avatar hochzuladen',
    fields: {
      penName: 'Pseudonym',
      website: 'Website',
    },
    placeholders: {
      penName: 'Geben Sie Ihr Pseudonym ein',
    },
    actions: {
      cancel: 'Abbrechen',
      save: 'Speichern',
      uploading: 'Wird hochgeladen...',
      saving: 'Wird gespeichert...',
    },
    messages: {
      avatarTooLarge: 'Die Avatar-Datei muss kleiner als 5 MB sein',
      avatarNotImage: 'Bitte wählen Sie eine Bilddatei aus',
      avatarUploadFailed: 'Avatar-Upload fehlgeschlagen',
      updateFailed: 'Aktualisierung fehlgeschlagen',
      updateFailedRetry: 'Aktualisierung fehlgeschlagen, bitte versuchen Sie es erneut',
      updated: 'Profil aktualisiert',
    },
  },
} as const

export default main
