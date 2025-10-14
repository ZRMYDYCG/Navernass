import { MessageCirclePlus } from 'lucide-react';
import type { ConversationListProps } from '../types';
import { STYLES, SIDEBAR_WIDTH, HEADER_HEIGHT, CONVERSATION_LIST_TITLE } from '../config';
import { ConversationItem } from './ConversationItem';

/**
 * 对话列表侧边栏组件
 */
export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  onCreateNew,
}: ConversationListProps) {
  return (
    <section className={STYLES.sidebar.container}>
      <div className={STYLES.sidebar.content} style={{ width: `${SIDEBAR_WIDTH}px`, height: '100%' }}>
        {/* 头部 */}
        <div
          className={STYLES.sidebar.header}
          style={{ height: `${HEADER_HEIGHT}px` }}
        >
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {CONVERSATION_LIST_TITLE}
          </span>
          <button
            onClick={onCreateNew}
            className="hover:scale-110 transition-transform"
            aria-label="创建新对话"
          >
            <MessageCirclePlus className="w-4 h-4 cursor-pointer text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors" />
          </button>
        </div>

        {/* 对话列表 */}
        <div className={STYLES.sidebar.list}>
          {conversations.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              isSelected={selectedId === conversation.id}
              onClick={onSelect}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

