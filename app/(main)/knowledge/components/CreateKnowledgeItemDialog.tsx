import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";

interface CreateKnowledgeItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "folder" | "file";
  name: string;
  isCreating: boolean;
  onNameChange: (name: string) => void;
  onCreate: () => void;
}

export function CreateKnowledgeItemDialog({
  open,
  onOpenChange,
  type,
  name,
  isCreating,
  onNameChange,
  onCreate,
}: CreateKnowledgeItemDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] animate-in fade-in-0 zoom-in-95">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <Dialog.Title className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {type === "folder" ? "新增文件夹" : "新增文件"}
            </Dialog.Title>

            <div className="space-y-4">
              {/* 名称输入 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {type === "folder" ? "文件夹" : "文件"}名称{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => onNameChange(e.target.value)}
                  placeholder={`例如：${type === "folder" ? "角色设定" : "主角背景.md"}`}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      onCreate();
                    }
                  }}
                />
              </div>
            </div>

            {/* 按钮组 */}
            <div className="flex gap-3 mt-6">
              <Dialog.Close asChild>
                <Button
                  type="button"
                  className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600"
                  disabled={isCreating}
                >
                  取消
                </Button>
              </Dialog.Close>
              <Button
                onClick={onCreate}
                className="flex-1 bg-black dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200"
                disabled={isCreating || !name.trim()}
              >
                {isCreating ? "创建中..." : "创建"}
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
