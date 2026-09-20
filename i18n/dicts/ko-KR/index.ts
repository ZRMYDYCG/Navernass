import admin from './admin'
import auth from './auth'
import chat from './chat'
import commandGuide from './command-guide'
import common from './common'
import editor from './editor'
import main from './main'
import marketing from './marketing'
import nav from './nav'
import novels from './novels'
import publish from './publish'
import settings from './settings'
import survey from './survey'
import tiptap from './tiptap'
import trash from './trash'
import workspace from './workspace'

const koKR = {
  common,
  nav,
  auth,
  workspace,
  novels,
  publish,
  main,
  chat,
  commandGuide,
  editor,
  marketing,
  settings,
  survey,
  tiptap,
  trash,
  admin,
} as const

export default koKR
