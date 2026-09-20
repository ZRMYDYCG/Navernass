import { SetMetadata } from '@nestjs/common'

export const RAW_RESPONSE_KEY = 'raw-response'
export const LONG_TASK_KEY = 'long-task'

/** 跳过统一响应包装，供 SSE、文件等原始响应使用。 */
export const RawResponse = () => SetMetadata(RAW_RESPONSE_KEY, true)

/** 使用业务自身的超时与取消机制，跳过全局 30 秒超时。 */
export const LongTask = () => SetMetadata(LONG_TASK_KEY, true)
