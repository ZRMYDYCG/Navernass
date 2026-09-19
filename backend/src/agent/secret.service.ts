import type { EnvConfig } from '../config/env-schema.js'
import { Buffer } from 'node:buffer'
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto'
import { Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

/** API Key 只以 AES-256-GCM 密文落库，认证标签可防止密文被篡改。 */
@Injectable()
export class SecretService {
  private readonly key: Buffer

  constructor(@Inject(ConfigService) config: ConfigService<EnvConfig, true>) {
    this.key = createHash('sha256').update(config.get('AI_CONFIG_SECRET', { infer: true })).digest()
  }

  encrypt(value: string) {
    const iv = randomBytes(12)
    const cipher = createCipheriv('aes-256-gcm', this.key, iv)
    const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()])
    const tag = cipher.getAuthTag()
    return [iv, tag, encrypted].map(part => part.toString('base64url')).join('.')
  }

  decrypt(payload: string) {
    const [ivText, tagText, encryptedText] = payload.split('.')
    if (!ivText || !tagText || !encryptedText) throw new Error('模型密钥密文格式无效')
    const decipher = createDecipheriv('aes-256-gcm', this.key, Buffer.from(ivText, 'base64url'))
    decipher.setAuthTag(Buffer.from(tagText, 'base64url'))
    return Buffer.concat([
      decipher.update(Buffer.from(encryptedText, 'base64url')),
      decipher.final(),
    ]).toString('utf8')
  }
}
