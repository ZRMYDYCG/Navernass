import auth from './auth'
import chat from './chat'
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

const zhTW = {
  common,
  nav,
  auth,
  workspace,
  novels,
  publish,
  main,
  chat,
  editor,
  marketing,
  settings,
  survey,
  tiptap,
  trash,
} as const

export default zhTW
