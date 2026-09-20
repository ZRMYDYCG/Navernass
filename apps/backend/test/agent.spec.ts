import type { ConfigService } from '@nestjs/config'
import type { EnvConfig } from '../src/config/env-schema.js'
import { describe, expect, it } from 'vitest'
import { runAgent } from '../src/agent/agent.schema.js'
import { SecretService } from '../src/agent/secret.service.js'

describe('agent 基础设施', () => {
  it('可以加密并解密 provider 密钥', () => {
    const config = { get: () => 'unit-test-ai-config-secret-at-least-32-chars' } as unknown as ConfigService<EnvConfig, true>
    const secrets = new SecretService(config)
    const cipher = secrets.encrypt('sk-sensitive')

    expect(cipher).not.toContain('sk-sensitive')
    expect(secrets.decrypt(cipher)).toBe('sk-sensitive')
  })

  it('拒绝被篡改的 provider 密钥密文', () => {
    const config = { get: () => 'unit-test-ai-config-secret-at-least-32-chars' } as unknown as ConfigService<EnvConfig, true>
    const secrets = new SecretService(config)
    const cipher = secrets.encrypt('sk-sensitive')
    const [iv, tag, encrypted] = cipher.split('.') as [string, string, string]
    const tampered = `${iv}.${tag}.${encrypted.startsWith('A') ? 'B' : 'A'}${encrypted.slice(1)}`

    expect(() => secrets.decrypt(tampered)).toThrow()
  })

  it('对 agent 上下文和停止步数执行强校验', () => {
    const parsed = runAgent.safeParse({
      novelId: '00000000-0000-4000-8000-000000000001',
      prompt: '继续创作下一幕',
      maxSteps: 12,
    })
    const invalid = runAgent.safeParse({ novelId: 'bad-id', prompt: '', maxSteps: 99 })

    expect(parsed.success).toBe(true)
    expect(invalid.success).toBe(false)
  })
})
