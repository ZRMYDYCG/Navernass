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
import skills from './skills'
import survey from './survey'
import tiptap from './tiptap'
import trash from './trash'
import workspace from './workspace'

const deDE = {
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
  skills,
  survey,
  tiptap,
  trash,
  admin,
} as const

export default deDE
