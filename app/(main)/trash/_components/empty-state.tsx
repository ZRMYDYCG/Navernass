export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-start pt-[40vh] min-h-[60vh] text-muted-foreground font-serif">
      <p className="text-lg">回收站是空的</p>
      <p className="text-sm text-muted-foreground/70 text-center mt-2">
        归档的小说会保留在这里，你可以随时恢复或永久删除它们
      </p>
    </div>
  )
}
