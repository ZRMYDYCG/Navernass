export function getSelectionAiStreamUrl(): string {
  return process.env.NEXT_PUBLIC_NEST_BACKEND_ENABLED === 'true'
    ? '/api/backend/v1/editor/selection-ai/stream'
    : '/api/editor/selection-ai/stream'
}
