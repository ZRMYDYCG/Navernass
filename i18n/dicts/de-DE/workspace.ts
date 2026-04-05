const workspace = {
  title: 'Arbeitsbereich',
  recentNovels: 'Zuletzt bearbeitete Romane',
  createNovel: 'Roman erstellen',
  allNovels: 'Alle Romane',
  wordCount: 'Wörter gesamt',
  chapterCount: 'Kapitel',
  page: {
    quote: 'Ein Wort nach dem anderen nach dem anderen ist Macht.',
    author: 'Margaret Atwood',
  },
  projectList: {
    title: 'Meine Werke',
    createNew: 'Ein neues Kapitel beginnen',
    createSuccess: 'Erfolgreich erstellt',
    createError: 'Erstellung fehlgeschlagen',
    statusPublished: 'Veröffentlicht',
    statusDraft: 'Entwurf',
    emptyDescription: 'Auf dieser leeren Leinwand wartet Ihre Geschichte.',
  },
  statsCard: {
    title: 'Schreibspuren',
    creationDays: 'Schreibtage',
    days: 'Tage',
    finishedChapters: 'Fertige Kapitel',
    worldviewEntries: 'Weltbau-Einträge',
  },
  contributionGraph: {
    title: 'Schreibkalender',
    activeDays: 'Diese Woche aktiv',
    days: 'Tage',
    less: 'Weniger',
    more: 'Mehr',
    updates: 'Aktualisierungen',
    noActivity: 'Keine Aktivität',
  },
  welcome: {
    defaultName: 'Kreative:r',
    timeConfig: {
      morning: {
        greeting: 'Morgenlicht',
        message: 'Guten Morgen. Lassen Sie die ersten Gedanken der Dämmerung zu Worten werden.',
      },
      noon: {
        greeting: 'Mittagssonne',
        message: 'Guten Tag. Die Inspiration ist hoch — perfekte Zeit, die Haupthandlung voranzutreiben.',
      },
      afternoon: {
        greeting: 'Gemächlicher Nachmittag',
        message: 'Trinken Sie einen Kaffee, entspannen Sie ein wenig. Oder planen Sie eine Wendung für die Antagonistin?',
      },
      evening: {
        greeting: 'Dämmerung',
        message: 'Guten Abend. Der Lärm verstummt — jetzt ist die beste Zeit zum Feinschliff.',
      },
      night: {
        greeting: 'Stille Nacht',
        message: 'Es wird spät. Große Geschichten entstehen oft in unzähligen schlaflosen Nächten.',
      },
    },
  },
} as const

export default workspace
