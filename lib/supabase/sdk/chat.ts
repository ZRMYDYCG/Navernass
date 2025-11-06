import { apiClient } from './client';
import type { SendMessageRequest, SendMessageResponse } from './types';

export const chatApi = {
  /**
   * 发送消息并获取AI回复
   */
  sendMessage: async (data: SendMessageRequest): Promise<SendMessageResponse> => {
    return apiClient.post<SendMessageResponse>('/api/chat/send', data);
  },
};
