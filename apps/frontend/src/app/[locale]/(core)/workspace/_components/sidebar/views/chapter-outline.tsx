"use client";

import {
  ArrowDownIcon,
  ArrowUpIcon,
  CheckIcon,
  ChevronRightIcon,
  CopyIcon,
  FolderInputIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef, useState, type ComponentProps, type ReactNode } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  useCreateVolume,
  useDeleteChapter,
  useDeleteVolume,
  useDuplicateChapter,
  useDuplicateVolume,
  useNovelChapters,
  useNovelVolumes,
  useRenameChapter,
  useRenameVolume,
  useReorderOutline,
} from "@/servers/library.server";
import type { ChapterSummary, Volume } from "@/lib/http/modules/library.schema";

interface ChapterGroup {
  /** 缺省表示未分卷的章节。 */
  volume?: Volume;
  chapters: ChapterSummary[];
}

function groupChaptersByVolume(volumes: Volume[], chapters: ChapterSummary[]): ChapterGroup[] {
  const groups = volumes.map((volume): ChapterGroup => ({ volume, chapters: [] }));
  const groupByVolumeId = new Map(groups.map((group) => [group.volume?.id, group]));
  const ungrouped: ChapterSummary[] = [];
  for (const chapter of chapters) {
    const group = chapter.volume_id ? groupByVolumeId.get(chapter.volume_id) : undefined;
    (group?.chapters ?? ungrouped).push(chapter);
  }
  return ungrouped.length ? [...groups, { chapters: ungrouped }] : groups;
}

function swap<T>(list: T[], from: number, to: number) {
  const next = [...list];
  next[from] = list[to];
  next[to] = list[from];
  return next;
}

/**
 * 卷按展示顺序编号；章节的 order_index 是全书顺序，按「卷序 + 卷内序」统一编号。
 * 只返回有变化的条目。
 */
function layoutChanges(groups: ChapterGroup[]) {
  const volumes = groups
    .flatMap((group) => (group.volume ? [group.volume] : []))
    .flatMap((volume, index) =>
      volume.order_index === index ? [] : [{ id: volume.id, order_index: index }],
    );
  const chapters = groups
    .flatMap((group) =>
      group.chapters.map((chapter) => ({ chapter, volumeId: group.volume?.id ?? null })),
    )
    .flatMap(({ chapter, volumeId }, index) =>
      chapter.order_index === index && chapter.volume_id === volumeId
        ? []
        : [{ id: chapter.id, order_index: index, volume_id: volumeId }],
    );
  return { volumes, chapters };
}

function ActionButton({
  label,
  trigger: Trigger,
  ...props
}: Omit<ComponentProps<typeof Button>, "render"> & {
  label: string;
  trigger?: typeof DropdownMenuTrigger | typeof AlertDialogTrigger;
}) {
  const button = <Button variant="ghost" size="icon-xs" aria-label={label} {...props} />;
  return (
    <Tooltip>
      <TooltipTrigger render={Trigger ? <Trigger render={button} /> : button} />
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

/** 悬停、键盘聚焦或菜单打开时浮现在行右侧，盖住行尾的统计信息。 */
function RowActions({ children }: { children: ReactNode }) {
  return (
    <div className="absolute inset-y-0 right-0 flex items-center gap-0.5 rounded-e-md bg-accent px-1 opacity-0 transition-opacity group-hover/row:opacity-100 group-has-[:focus-visible]/row:opacity-100 has-data-[popup-open]:opacity-100">
      {children}
    </div>
  );
}

function RenameInput({
  defaultValue,
  onDone,
}: {
  defaultValue: string;
  /** 取消、未修改或清空时 title 为空。 */
  onDone: (title?: string) => void;
}) {
  const t = useTranslations("sidebar");
  const cancelledRef = useRef(false);

  return (
    <Input
      autoFocus
      defaultValue={defaultValue}
      maxLength={255}
      aria-label={t("actions.renameLabel")}
      onFocus={(event) => event.currentTarget.select()}
      onBlur={(event) => {
        const title = event.currentTarget.value.trim();
        onDone(cancelledRef.current || !title || title === defaultValue ? undefined : title);
      }}
      onKeyDown={(event) => {
        if (event.nativeEvent.isComposing) return;
        if (event.key === "Enter") event.currentTarget.blur();
        if (event.key === "Escape") {
          cancelledRef.current = true;
          event.currentTarget.blur();
        }
      }}
    />
  );
}

function DeleteAction({
  title,
  description,
  onConfirm,
}: {
  title: string;
  description: string;
  onConfirm: () => void;
}) {
  const t = useTranslations("sidebar");
  const [open, setOpen] = useState(false);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <ActionButton label={t("actions.delete")} trigger={AlertDialogTrigger}>
        <Trash2Icon />
      </ActionButton>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("actions.cancel")}</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={() => {
              setOpen(false);
              onConfirm();
            }}
          >
            {t("actions.delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

interface VolumeGroupProps {
  novelId: string;
  group: ChapterGroup;
  defaultExpanded: boolean;
  /** 缺省表示已在边界，按钮禁用。 */
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  children: ReactNode;
}

function VolumeGroup({
  novelId,
  group,
  defaultExpanded,
  onMoveUp,
  onMoveDown,
  children,
}: VolumeGroupProps) {
  const t = useTranslations("sidebar");
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [editing, setEditing] = useState(false);
  const rename = useRenameVolume(novelId);
  const duplicate = useDuplicateVolume(novelId);
  const remove = useDeleteVolume(novelId);
  const { volume } = group;

  return (
    <Collapsible open={expanded} onOpenChange={setExpanded}>
      <div className="group/row relative">
        {volume && editing ? (
          <RenameInput
            defaultValue={volume.title}
            onDone={(title) => {
              setEditing(false);
              if (title) rename.mutate({ id: volume.id, title });
            }}
          />
        ) : (
          <CollapsibleTrigger className="group/trigger flex w-full min-w-0">
            <span className="flex w-full min-w-0 items-center gap-2 rounded-md px-2 py-2 text-sm font-semibold transition-colors group-hover/row:bg-accent group-has-data-[popup-open]/row:bg-accent">
              <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-data-panel-open/trigger:rotate-90" />
              <span className="min-w-0 flex-1 truncate text-start">
                {volume?.title ?? t("ungrouped")}
              </span>
              <span className="shrink-0 text-xs font-normal text-muted-foreground">
                {t("chapterCount", { count: group.chapters.length })}
              </span>
            </span>
          </CollapsibleTrigger>
        )}
        {volume && !editing ? (
          <RowActions>
            <ActionButton label={t("actions.moveUp")} disabled={!onMoveUp} onClick={onMoveUp}>
              <ArrowUpIcon />
            </ActionButton>
            <ActionButton label={t("actions.moveDown")} disabled={!onMoveDown} onClick={onMoveDown}>
              <ArrowDownIcon />
            </ActionButton>
            <ActionButton label={t("actions.rename")} onClick={() => setEditing(true)}>
              <PencilIcon />
            </ActionButton>
            <ActionButton
              label={t("actions.duplicate")}
              disabled={duplicate.isPending}
              onClick={() =>
                duplicate.mutate({ id: volume.id, title: t("copyTitle", { title: volume.title }) })
              }
            >
              <CopyIcon />
            </ActionButton>
            <DeleteAction
              title={t("deleteVolume.title", { title: volume.title })}
              description={t("deleteVolume.description")}
              onConfirm={() => remove.mutate(volume.id)}
            />
          </RowActions>
        ) : null}
      </div>
      <CollapsibleContent>
        <ul className="my-1 ml-6 flex flex-col gap-0.5">{children}</ul>
      </CollapsibleContent>
    </Collapsible>
  );
}

interface ChapterLinkProps {
  novelId: string;
  chapter: ChapterSummary;
  /** 章节当前展示所在的卷，未分卷为 null。 */
  volumeId: string | null;
  volumes: Volume[];
  active: boolean;
  onSelect: () => void;
  /** 缺省表示已在卷内边界，按钮禁用。 */
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onMoveTo: (volumeId: string | null) => void;
}

function ChapterLink({
  novelId,
  chapter,
  volumeId,
  volumes,
  active,
  onSelect,
  onMoveUp,
  onMoveDown,
  onMoveTo,
}: ChapterLinkProps) {
  const t = useTranslations("sidebar");
  const [editing, setEditing] = useState(false);
  const rename = useRenameChapter(novelId);
  const duplicate = useDuplicateChapter(novelId);
  const remove = useDeleteChapter(novelId);
  const targets = [
    ...volumes.map((volume) => ({ id: volume.id, title: volume.title })),
    { id: null, title: t("ungrouped") },
  ];

  if (editing) {
    return (
      <li>
        <RenameInput
          defaultValue={chapter.title}
          onDone={(title) => {
            setEditing(false);
            if (title) rename.mutate({ id: chapter.id, title });
          }}
        />
      </li>
    );
  }

  return (
    <li className="group/row relative">
      <button
        type="button"
        aria-current={active ? "page" : undefined}
        data-active={active || undefined}
        onClick={onSelect}
        className="group/chapter flex w-full items-center gap-2 rounded-md px-3 py-2 text-start transition-colors outline-none group-hover/row:bg-accent group-has-data-[popup-open]/row:bg-accent focus-visible:ring-2 focus-visible:ring-ring data-active:bg-accent data-active:text-accent-foreground"
      >
        <span className="min-w-0 flex-1 truncate text-sm group-data-active/chapter:font-medium">
          {chapter.title}
        </span>
        <span className="shrink-0 text-xs text-muted-foreground">
          {t("chapterMeta", {
            status: t(`chapterStatus.${chapter.status}`),
            count: chapter.word_count,
          })}
        </span>
      </button>
      <RowActions>
        <DropdownMenu>
          <ActionButton label={t("actions.moveTo")} trigger={DropdownMenuTrigger}>
            <FolderInputIcon />
          </ActionButton>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuLabel>{t("actions.moveTo")}</DropdownMenuLabel>
            </DropdownMenuGroup>
            {targets.map((target) => (
              <DropdownMenuItem
                key={target.id ?? "ungrouped"}
                disabled={target.id === volumeId}
                onClick={() => onMoveTo(target.id)}
              >
                <span className="min-w-0 flex-1 truncate">{target.title}</span>
                {target.id === volumeId ? <CheckIcon /> : null}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <ActionButton label={t("actions.moveUp")} disabled={!onMoveUp} onClick={onMoveUp}>
          <ArrowUpIcon />
        </ActionButton>
        <ActionButton label={t("actions.moveDown")} disabled={!onMoveDown} onClick={onMoveDown}>
          <ArrowDownIcon />
        </ActionButton>
        <ActionButton label={t("actions.rename")} onClick={() => setEditing(true)}>
          <PencilIcon />
        </ActionButton>
        <ActionButton
          label={t("actions.duplicate")}
          disabled={duplicate.isPending}
          onClick={() =>
            duplicate.mutate({ id: chapter.id, title: t("copyTitle", { title: chapter.title }) })
          }
        >
          <CopyIcon />
        </ActionButton>
        <DeleteAction
          title={t("deleteChapter.title", { title: chapter.title })}
          description={t("deleteChapter.description")}
          onConfirm={() => remove.mutate(chapter.id)}
        />
      </RowActions>
    </li>
  );
}

interface ChapterOutlineProps {
  novelId: string;
  activeChapterId?: string;
  onSelectChapter: (chapterId: string) => void;
}

export function ChapterOutline({ novelId, activeChapterId, onSelectChapter }: ChapterOutlineProps) {
  const t = useTranslations("sidebar");
  const volumes = useNovelVolumes(novelId);
  const chapters = useNovelChapters(novelId);
  const reorder = useReorderOutline(novelId);
  const createVolume = useCreateVolume(novelId);

  if (volumes.isError || chapters.isError) {
    return <p className="p-4 text-sm text-destructive">{t("loadError")}</p>;
  }

  if (!volumes.data || !chapters.data) {
    return (
      <div className="flex flex-col gap-2 p-4">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-10" />
        <Skeleton className="h-10" />
        <Skeleton className="h-5 w-2/3" />
      </div>
    );
  }

  const volumeList = volumes.data;
  const groups = groupChaptersByVolume(volumeList, chapters.data);

  const commit = (next: ChapterGroup[]) => {
    const changes = layoutChanges(next);
    if (changes.volumes.length || changes.chapters.length) reorder.mutate(changes);
  };

  const moveChapterTo = (chapter: ChapterSummary, volumeId: string | null) => {
    const next = groups.map((group) => ({
      ...group,
      chapters: group.chapters.filter((item) => item.id !== chapter.id),
    }));
    const target = next.find((group) => (group.volume?.id ?? null) === volumeId);
    if (target) target.chapters.push(chapter);
    else next.push({ chapters: [chapter] });
    commit(next);
  };

  const addVolume = () =>
    createVolume.mutate({
      title: t("newVolumeTitle", { index: volumeList.length + 1 }),
      order_index: Math.max(-1, ...volumeList.map((volume) => volume.order_index)) + 1,
    });

  return (
    <div className="flex flex-col gap-1 p-2">
      {groups.length ? null : (
        <p className="p-2 text-center text-sm text-muted-foreground">{t("empty")}</p>
      )}
      {groups.map((group, groupIndex) => {
        const containsActive = group.chapters.some((chapter) => chapter.id === activeChapterId);
        const isVolume = Boolean(group.volume);
        return (
          <VolumeGroup
            key={group.volume?.id ?? "ungrouped"}
            novelId={novelId}
            group={group}
            defaultExpanded={containsActive || (!activeChapterId && groupIndex === 0)}
            onMoveUp={
              isVolume && groupIndex > 0
                ? () => commit(swap(groups, groupIndex, groupIndex - 1))
                : undefined
            }
            onMoveDown={
              isVolume && groupIndex < volumeList.length - 1
                ? () => commit(swap(groups, groupIndex, groupIndex + 1))
                : undefined
            }
          >
            {group.chapters.map((chapter, chapterIndex) => {
              const moveWithinGroup = (to: number) =>
                commit(
                  groups.map((item, index) =>
                    index === groupIndex
                      ? { ...item, chapters: swap(item.chapters, chapterIndex, to) }
                      : item,
                  ),
                );
              return (
                <ChapterLink
                  key={chapter.id}
                  novelId={novelId}
                  chapter={chapter}
                  volumeId={group.volume?.id ?? null}
                  volumes={volumeList}
                  active={chapter.id === activeChapterId}
                  onSelect={() => onSelectChapter(chapter.id)}
                  onMoveUp={chapterIndex > 0 ? () => moveWithinGroup(chapterIndex - 1) : undefined}
                  onMoveDown={
                    chapterIndex < group.chapters.length - 1
                      ? () => moveWithinGroup(chapterIndex + 1)
                      : undefined
                  }
                  onMoveTo={(volumeId) => moveChapterTo(chapter, volumeId)}
                />
              );
            })}
          </VolumeGroup>
        );
      })}
      <div className="px-1 pt-1">
        <Button variant="ghost" size="sm" disabled={createVolume.isPending} onClick={addVolume}>
          <PlusIcon data-icon="inline-start" />
          {t("newVolume")}
        </Button>
      </div>
    </div>
  );
}
