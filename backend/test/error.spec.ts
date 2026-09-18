import { describe, expect, it } from 'vitest'
import { AppError } from '../src/common/app-error.js'

describe('AppError', () => {
  it('保留稳定业务错误码与状态码', () => {
    const error = AppError.notFound('NOVEL_NOT_FOUND', '小说')
    expect(error.code).toBe('NOVEL_NOT_FOUND')
    expect(error.status).toBe(404)
    expect(error.message).toBe('小说不存在')
  })
})
