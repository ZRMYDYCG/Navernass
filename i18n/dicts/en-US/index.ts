import auth from './auth'
import common from './common'
import editor from './editor'
import marketing from './marketing'
import nav from './nav'
import settings from './settings'
import workspace from './workspace'

const enUS = {
  common,
  nav,
  auth,
  workspace,
  editor,
  marketing,
  settings,
} as const

export default enUS
