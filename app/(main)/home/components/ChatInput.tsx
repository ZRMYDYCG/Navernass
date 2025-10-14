import { Send } from 'lucide-react';
import { useState, type KeyboardEvent } from 'react';
import type { ChatInputProps } from '../types';
import { INPUT_PLACEHOLDER, MAX_INPUT_LENGTH, STYLES } from '../config';

/**
 * 聊天输入框组件
 */
export function ChatInput({
  placeholder = INPUT_PLACEHOLDER,
  onSend,
  disabled = false,
}: ChatInputProps) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage && !disabled) {
      onSend(trimmedMessage);
      setMessage(''); // 清空输入框
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // 支持 Enter 键发送消息（Shift+Enter 换行，但 input 不支持多行）
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // 限制最大字符数
    if (value.length <= MAX_INPUT_LENGTH) {
      setMessage(value);
    }
  };

  return (
    <div className={STYLES.input.container}>
      <div className={STYLES.input.wrapper}>
        <input
          type="text"
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={STYLES.input.field}
          aria-label="消息输入框"
        />
        <button
          onClick={handleSend}
          disabled={disabled || !message.trim()}
          className={STYLES.input.sendButton}
          aria-label="发送消息"
        >
          <Send className="w-4 h-4 text-white" />
        </button>
      </div>
      
      {/* 字符计数提示 */}
      {message.length > MAX_INPUT_LENGTH * 0.8 && (
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
          {message.length} / {MAX_INPUT_LENGTH}
        </div>
      )}
    </div>
  );
}

