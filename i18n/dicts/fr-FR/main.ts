const main = {
  appLogo: {
    alt: 'Logo Narraverse',
  },
  dock: {
    menu: {
      ai: 'Narraverse IA',
      novels: 'Mes romans',
      trash: 'Corbeille',
    },
    toggle: {
      show: 'Afficher la navigation',
      hide: 'Masquer la navigation',
    },
  },
  sidebar: {
    toggleMenu: 'Basculer le menu',
    openSidebar: 'Ouvrir la barre latérale',
    closeSidebar: 'Fermer la barre latérale',
  },
  search: {
    title: 'Rechercher',
    placeholder: 'Rechercher...',
    loading: 'Chargement...',
    empty: {
      noResults: 'Aucun résultat',
      hint: 'Tapez pour rechercher...',
    },
    routes: {
      chat: 'Assistant d\'écriture',
      novels: 'Mes romans',
      trash: 'Corbeille',
      news: 'Mises à jour produit',
    },
    types: {
      novel: 'Roman',
      chat: 'Discussion',
      route: 'Page',
    },
  },
  profile: {
    title: 'Modifier le profil',
    uploadHint: 'Cliquez sur l\'icône caméra pour téléverser un avatar',
    fields: {
      penName: 'Nom de plume',
      website: 'Site web',
    },
    placeholders: {
      penName: 'Saisir votre nom de plume',
    },
    actions: {
      cancel: 'Annuler',
      save: 'Enregistrer',
      uploading: 'Téléversement en cours...',
      saving: 'Enregistrement...',
    },
    messages: {
      avatarTooLarge: 'La taille de l\'avatar doit être inférieure à 5 Mo',
      avatarNotImage: 'Veuillez sélectionner un fichier image',
      avatarUploadFailed: 'Échec du téléversement de l\'avatar',
      updateFailed: 'Échec de la mise à jour',
      updateFailedRetry: 'Échec de la mise à jour, veuillez réessayer',
      updated: 'Profil mis à jour',
    },
  },
} as const

export default main

