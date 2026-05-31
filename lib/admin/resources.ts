export type AdminResourceId =
  | 'users'
  | 'profiles'
  | 'novels'
  | 'chapters'
  | 'volumes'
  | 'conversations'
  | 'messages'
  | 'novel-conversations'
  | 'novel-messages'
  | 'surveys'
  | 'news'
  | 'message-wall'
  | 'writer-todos'
  | 'plan-files'
  | 'worldbook'
  | 'outlines'
  | 'timeline-events'
  | 'user-settings'

export interface AdminResourceConfig {
  id: AdminResourceId
  table?: string
  labelKey: string
  descriptionKey: string
  statKey?: keyof AdminResourceStatKeys
  orderBy?: string
  softDelete?: boolean
  hideContent?: boolean
  customApi?: boolean
}

export interface AdminResourceStatKeys {
  users: number
  profiles: number
  novels: number
  chapters: number
  volumes: number
  conversations: number
  messages: number
  novelConversations: number
  novelMessages: number
  surveys: number
  news: number
  messageWall: number
  writerTodos: number
  planFiles: number
  worldbook: number
  outlines: number
  timelineEvents: number
  userSettings: number
}

export const ADMIN_RESOURCE_GROUPS: { titleKey: string, resources: AdminResourceId[] }[] = [
  {
    titleKey: 'admin.groups.users',
    resources: ['users', 'profiles', 'user-settings'],
  },
  {
    titleKey: 'admin.groups.writing',
    resources: ['novels', 'chapters', 'volumes', 'plan-files', 'worldbook', 'outlines', 'timeline-events'],
  },
  {
    titleKey: 'admin.groups.chat',
    resources: ['conversations', 'messages', 'novel-conversations', 'novel-messages'],
  },
  {
    titleKey: 'admin.groups.community',
    resources: ['surveys', 'news', 'message-wall', 'writer-todos'],
  },
]

export const ADMIN_RESOURCES: Record<AdminResourceId, AdminResourceConfig> = {
  users: {
    id: 'users',
    labelKey: 'admin.resources.users',
    descriptionKey: 'admin.resources.usersDesc',
    statKey: 'users',
    customApi: true,
  },
  profiles: {
    id: 'profiles',
    table: 'profiles',
    labelKey: 'admin.resources.profiles',
    descriptionKey: 'admin.resources.profilesDesc',
    statKey: 'profiles',
    orderBy: 'created_at',
  },
  novels: {
    id: 'novels',
    table: 'novels',
    labelKey: 'admin.resources.novels',
    descriptionKey: 'admin.resources.novelsDesc',
    statKey: 'novels',
    orderBy: 'updated_at',
  },
  chapters: {
    id: 'chapters',
    table: 'chapters',
    labelKey: 'admin.resources.chapters',
    descriptionKey: 'admin.resources.chaptersDesc',
    statKey: 'chapters',
    orderBy: 'updated_at',
    softDelete: true,
    hideContent: true,
  },
  volumes: {
    id: 'volumes',
    table: 'volumes',
    labelKey: 'admin.resources.volumes',
    descriptionKey: 'admin.resources.volumesDesc',
    statKey: 'volumes',
    orderBy: 'updated_at',
    softDelete: true,
  },
  conversations: {
    id: 'conversations',
    table: 'conversations',
    labelKey: 'admin.resources.conversations',
    descriptionKey: 'admin.resources.conversationsDesc',
    statKey: 'conversations',
    orderBy: 'updated_at',
  },
  messages: {
    id: 'messages',
    table: 'messages',
    labelKey: 'admin.resources.messages',
    descriptionKey: 'admin.resources.messagesDesc',
    statKey: 'messages',
    orderBy: 'created_at',
    hideContent: true,
  },
  'novel-conversations': {
    id: 'novel-conversations',
    table: 'novel_conversations',
    labelKey: 'admin.resources.novelConversations',
    descriptionKey: 'admin.resources.novelConversationsDesc',
    statKey: 'novelConversations',
    orderBy: 'updated_at',
  },
  'novel-messages': {
    id: 'novel-messages',
    table: 'novel_messages',
    labelKey: 'admin.resources.novelMessages',
    descriptionKey: 'admin.resources.novelMessagesDesc',
    statKey: 'novelMessages',
    orderBy: 'created_at',
    hideContent: true,
  },
  surveys: {
    id: 'surveys',
    table: 'surveys',
    labelKey: 'admin.resources.surveys',
    descriptionKey: 'admin.resources.surveysDesc',
    statKey: 'surveys',
    orderBy: 'created_at',
  },
  news: {
    id: 'news',
    table: 'news',
    labelKey: 'admin.resources.news',
    descriptionKey: 'admin.resources.newsDesc',
    statKey: 'news',
    orderBy: 'created_at',
    hideContent: true,
  },
  'message-wall': {
    id: 'message-wall',
    table: 'message_wall_entries',
    labelKey: 'admin.resources.messageWall',
    descriptionKey: 'admin.resources.messageWallDesc',
    statKey: 'messageWall',
    orderBy: 'created_at',
  },
  'writer-todos': {
    id: 'writer-todos',
    table: 'writer_todos',
    labelKey: 'admin.resources.writerTodos',
    descriptionKey: 'admin.resources.writerTodosDesc',
    statKey: 'writerTodos',
    orderBy: 'updated_at',
  },
  'plan-files': {
    id: 'plan-files',
    table: 'plan_files',
    labelKey: 'admin.resources.planFiles',
    descriptionKey: 'admin.resources.planFilesDesc',
    statKey: 'planFiles',
    orderBy: 'updated_at',
    softDelete: true,
    hideContent: true,
  },
  worldbook: {
    id: 'worldbook',
    table: 'worldbook_entries',
    labelKey: 'admin.resources.worldbook',
    descriptionKey: 'admin.resources.worldbookDesc',
    statKey: 'worldbook',
    orderBy: 'updated_at',
    softDelete: true,
    hideContent: true,
  },
  outlines: {
    id: 'outlines',
    table: 'outlines',
    labelKey: 'admin.resources.outlines',
    descriptionKey: 'admin.resources.outlinesDesc',
    statKey: 'outlines',
    orderBy: 'updated_at',
    softDelete: true,
    hideContent: true,
  },
  'timeline-events': {
    id: 'timeline-events',
    table: 'character_timeline_events',
    labelKey: 'admin.resources.timelineEvents',
    descriptionKey: 'admin.resources.timelineEventsDesc',
    statKey: 'timelineEvents',
    orderBy: 'updated_at',
    softDelete: true,
  },
  'user-settings': {
    id: 'user-settings',
    table: 'user_settings',
    labelKey: 'admin.resources.userSettings',
    descriptionKey: 'admin.resources.userSettingsDesc',
    statKey: 'userSettings',
    orderBy: 'updated_at',
  },
}

export function isAdminResourceId(value: string): value is AdminResourceId {
  return value in ADMIN_RESOURCES
}

export function getResourceColumns(row: Record<string, unknown>, hideContent?: boolean) {
  const hiddenKeys = new Set(['content', 'thinking', 'password_hash', 'api_key', 'characters', 'relationships'])
  if (hideContent) {
    hiddenKeys.add('content')
    hiddenKeys.add('description')
  }

  return Object.keys(row).filter(key => !hiddenKeys.has(key))
}
