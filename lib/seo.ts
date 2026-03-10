const SITE_NAME = 'Narraverse'
const DEFAULT_SITE_URL = 'http://localhost:3000'
const DEFAULT_OG_IMAGE = '/landing-page-1.png'

const DEFAULT_DESCRIPTION = 'Narraverse 是面向网文创作者的 AI 小说创作平台，支持灵感共创、人物设定管理、章节续写与发布。'
const MARKETING_DESCRIPTION = 'Narraverse AI 小说创作平台，帮助创作者完成灵感梳理、角色设定、章节续写与内容打磨，提升写作效率与质量。'
const SURVEY_DESCRIPTION = '加入 Narraverse 共创计划，填写 3 分钟 AI 写作问卷，帮助我们打造更懂创作者的小说创作工具。'

function normalizeSiteUrl(url: string) {
  return url.endsWith('/') ? url : `${url}/`
}

export function getSiteUrl() {
  const rawUrl = process.env.NEXT_PUBLIC_BASE_URL || DEFAULT_SITE_URL
  try {
    return new URL(normalizeSiteUrl(rawUrl))
  } catch {
    return new URL(DEFAULT_SITE_URL)
  }
}

export function getAbsoluteUrl(path = '/') {
  return new URL(path, getSiteUrl()).toString()
}

export const seoConfig = {
  siteName: SITE_NAME,
  defaultTitle: 'Narraverse - AI 小说创作平台',
  marketingTitle: 'Narraverse - AI 小说创作平台｜网文作者灵感与写作助手',
  surveyTitle: 'Narraverse 共创问卷｜AI 小说写作需求调研',
  defaultDescription: DEFAULT_DESCRIPTION,
  marketingDescription: MARKETING_DESCRIPTION,
  surveyDescription: SURVEY_DESCRIPTION,
  defaultOgImage: DEFAULT_OG_IMAGE,
} as const
