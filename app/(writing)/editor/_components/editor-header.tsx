import { ArrowLeft, PanelLeft, PanelRight } from "lucide-react";
import { ThemeSection } from "@/components/theme-select";

interface EditorHeaderProps {
  novelTitle: string;
  showLeftPanel: boolean;
  showRightPanel: boolean;
  onToggleLeftPanel: () => void;
  onToggleRightPanel: () => void;
  onBack?: () => void;
}

export default function EditorHeader({
  novelTitle,
  showLeftPanel,
  showRightPanel,
  onToggleLeftPanel,
  onToggleRightPanel,
  onBack,
}: EditorHeaderProps) {
  return (
    <header className="h-14 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      {/* 左侧：返回按钮 + 小说标题 */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>
        <h1 className="text-base font-semibold text-gray-900 dark:text-gray-100">{novelTitle}</h1>
      </div>

      {/* 右侧：操作按钮 + 头像 */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <button
            onClick={onToggleLeftPanel}
            className={`p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors ${
              showLeftPanel
                ? "text-blue-600 dark:text-blue-400"
                : "text-gray-400 dark:text-gray-600"
            }`}
            title={showLeftPanel ? "隐藏左侧面板" : "显示左侧面板"}
          >
            <PanelLeft className="w-5 h-5" />
          </button>
          <button
            onClick={onToggleRightPanel}
            className={`p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors ${
              showRightPanel
                ? "text-blue-600 dark:text-blue-400"
                : "text-gray-400 dark:text-gray-600"
            }`}
            title={showRightPanel ? "隐藏右侧面板" : "显示右侧面板"}
          >
            <PanelRight className="w-5 h-5" />
          </button>
        </div>

        <ThemeSection />
      </div>
    </header>
  );
}
