"use client";

import { useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { GripHorizontal, Pin } from "lucide-react";

export function meta() {
  return [{ title: "仪表盘 - NarraVerse" }, { name: "description", content: "查看您的创作统计和最近活动" }];
}

interface DashboardCard {
  id: string;
  title: string;
  isPinned: boolean;
}

interface DraggableCardProps {
  card: DashboardCard;
  index: number;
  moveCard: (dragIndex: number, hoverIndex: number) => void;
  togglePin: (id: string) => void;
}

function DraggableCard({ card, index, moveCard, togglePin }: DraggableCardProps) {
  const [{ isDragging }, drag, preview] = useDrag({
    type: "CARD",
    item: { index },
    canDrag: !card.isPinned,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver }, drop] = useDrop({
    accept: "CARD",
    hover: (item: { index: number }) => {
      if (item.index !== index) {
        moveCard(item.index, index);
        item.index = index;
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const connectRef = (node: HTMLDivElement | null) => {
    preview(node);
    drop(node);
  };

  return (
    <div
      ref={connectRef}
      className={`relative bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 transition-all ${
        isDragging ? "opacity-50" : ""
      } ${isOver ? "ring-2 ring-blue-500" : ""}`}
    >
      {/* 拖拽手柄和钉子 */}
      <div className="absolute top-2 right-2 flex items-center gap-2">
        <button
          onClick={() => togglePin(card.id)}
          className={`p-1 rounded transition-colors ${
            card.isPinned
              ? "text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
              : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
          }`}
        >
          <Pin className="w-4 h-4" fill={card.isPinned ? "currentColor" : "none"} />
        </button>
        {!card.isPinned && (
          <div
            ref={drag as any}
            className="cursor-move p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <GripHorizontal className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* 卡片内容 */}
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{card.title}</h3>
      <div className="h-32 flex items-center justify-center text-gray-400 dark:text-gray-500">
        <p className="text-sm">卡片内容占位</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [cards, setCards] = useState<DashboardCard[]>([
    { id: "1", title: "创作统计", isPinned: false },
    { id: "2", title: "最近更新", isPinned: false },
    { id: "3", title: "热门小说", isPinned: false },
    { id: "4", title: "写作进度", isPinned: false },
    { id: "5", title: "收藏趋势", isPinned: false },
    { id: "6", title: "评论活动", isPinned: false },
  ]);

  const moveCard = (dragIndex: number, hoverIndex: number) => {
    const draggedCard = cards[dragIndex];
    const newCards = [...cards];
    newCards.splice(dragIndex, 1);
    newCards.splice(hoverIndex, 0, draggedCard);
    setCards(newCards);
  };

  const togglePin = (id: string) => {
    setCards((prevCards) => prevCards.map((card) => (card.id === id ? { ...card, isPinned: !card.isPinned } : card)));
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-6 min-h-screen bg-white dark:bg-gray-900 transition-colors">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card, index) => (
            <DraggableCard key={card.id} card={card} index={index} moveCard={moveCard} togglePin={togglePin} />
          ))}
        </div>
      </div>
    </DndProvider>
  );
}
