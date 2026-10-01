"use client";

import { CircleAlertIcon, CircleCheckIcon, SlashIcon } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useSyncExternalStore } from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Spinner } from "@/components/ui/spinner";
import { useNovel, useNovelVolumes } from "@/hooks/library/queries";
import type { Chapter } from "@/lib/http/modules/library.schema";

import type { EditorStatusStore, SaveStatus } from "./editor-status-store";

interface EditorHeaderProps {
  novelId: string;
  chapter?: Chapter;
  editorStatus?: EditorStatusStore;
}

function SaveStatusIndicator({ status, savedAt }: { status: SaveStatus; savedAt: Date }) {
  const t = useTranslations("chapterEditor.save");
  const format = useFormatter();

  return (
    <span
      role="status"
      className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground"
    >
      {status === "saving" ? (
        <>
          <Spinner />
          {t("saving")}
        </>
      ) : status === "error" ? (
        <>
          <CircleAlertIcon className="size-4 text-destructive" />
          {t("error")}
        </>
      ) : (
        <>
          <CircleCheckIcon className="size-4 text-muted-foreground" />
          {t("saved", { time: format.dateTime(savedAt, { hour: "2-digit", minute: "2-digit" }) })}
        </>
      )}
    </span>
  );
}

function LiveSaveStatus({ store }: { store: EditorStatusStore }) {
  const snapshot = useSyncExternalStore(
    store.subscribe,
    store.getSaveStatusSnapshot,
    store.getSaveStatusSnapshot,
  );

  return <SaveStatusIndicator status={snapshot.saveStatus} savedAt={snapshot.savedAt} />;
}

function LiveWordCount({ store }: { store: EditorStatusStore }) {
  const t = useTranslations("chapterEditor");
  const wordCount = useSyncExternalStore(
    store.subscribe,
    store.getWordCountSnapshot,
    store.getWordCountSnapshot,
  );

  return (
    <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
      {t("wordCount", { count: wordCount })}
    </span>
  );
}

export function EditorHeader({ novelId, chapter, editorStatus }: EditorHeaderProps) {
  const { data: novel } = useNovel(novelId);
  const { data: volumes } = useNovelVolumes(novelId);
  const volume = volumes?.find((item) => item.id === chapter?.volume_id);

  return (
    <header className="flex h-12 shrink-0 items-center gap-4 border-b border-border/60 px-6">
      <Breadcrumb className="min-w-0 flex-1">
        <BreadcrumbList className="flex-nowrap">
          {novel ? (
            <>
              <BreadcrumbItem className="min-w-0">
                <span className="truncate">{novel.title}</span>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <SlashIcon />
              </BreadcrumbSeparator>
            </>
          ) : null}
          {volume ? (
            <>
              <BreadcrumbItem className="min-w-0">
                <span className="truncate">{volume.title}</span>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <SlashIcon />
              </BreadcrumbSeparator>
            </>
          ) : null}
          {chapter ? (
            <BreadcrumbItem className="min-w-0">
              <BreadcrumbPage className="min-w-0">
                <span className="block truncate">{chapter.title}</span>
              </BreadcrumbPage>
            </BreadcrumbItem>
          ) : null}
        </BreadcrumbList>
      </Breadcrumb>
      {chapter && editorStatus ? (
        <>
          <LiveSaveStatus store={editorStatus} />
          <LiveWordCount store={editorStatus} />
        </>
      ) : null}
    </header>
  );
}
