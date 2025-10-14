import { useState } from 'react';
import { MoreHorizontal } from 'lucide-react';
import type { ConversationItemProps } from '../types';
import { STYLES } from '../config';

/**
 * 对话项组件
 */
export function ConversationItem({
  conversation,
  isSelected,
  onClick,
  onMoreAction,
}: ConversationItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    onClick(conversation.id);
  };

  const handleMoreClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 防止触发父元素的点击事件
    onMoreAction?.(conversation.id);
  };

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        ${STYLES.conversationItem.base}
        ${isSelected ? STYLES.conversationItem.selected : STYLES.conversationItem.hover}
      `}
    >
      <div className="flex justify-between items-center">
        <div className="flex-1">
          <h3 className={STYLES.conversationItem.title}>
            {conversation.title}
          </h3>
          <p className={STYLES.conversationItem.time}>
            {conversation.time}
          </p>
        </div>
        {isHovered && (
          <button
            onClick={handleMoreClick}
            className={STYLES.conversationItem.moreButton}
            aria-label="更多操作"
          >
            <MoreHorizontal className="w-4 h-4 text-neutral-600 dark:text-gray-400" />
          </button>
        )}
      </div>
    </div>
  );
}

