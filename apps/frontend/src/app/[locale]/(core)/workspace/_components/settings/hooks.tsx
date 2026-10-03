"use client";

import { ChevronDownIcon, LoaderCircleIcon, MoreHorizontalIcon, PlusIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  CreateHookPayload,
  HookDefinition,
  HookDispatch,
  HookEventName,
  HookHandler,
} from "@/lib/http/modules/hook.schema";
import {
  useCreateHook,
  useDeleteHook,
  useHookDispatches,
  useHookHandlers,
  useHooks,
  useUpdateHook,
} from "@/servers/hook.server";

const failedStatuses = new Set(["blocked", "denied", "failed", "timed_out", "invalid_output"]);

export function Hooks() {
  const t = useTranslations("settings.customize.hooks");
  const hooks = useHooks();
  const handlers = useHookHandlers();
  const dispatches = useHookDispatches();
  const createHook = useCreateHook();
  const updateHook = useUpdateHook();
  const deleteHook = useDeleteHook();
  const [creating, setCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<HookDefinition | null>(null);

  return (
    <Tabs defaultValue="installed">
      <div className="flex items-end justify-between gap-6 border-b border-border">
        <TabsList variant="line">
          <TabsTrigger value="installed">{t("tabs.installed")}</TabsTrigger>
          <TabsTrigger value="logs">{t("tabs.logs")}</TabsTrigger>
        </TabsList>
        <div className="mb-2">
          <Button type="button" size="sm" onClick={() => setCreating(true)}>
            <PlusIcon />
            {t("new")}
          </Button>
        </div>
      </div>

      <TabsContent value="installed" className="m-0">
        <HookList
          hooks={hooks.data ?? []}
          loading={hooks.isLoading}
          failed={hooks.isError}
          onRetry={() => hooks.refetch()}
          onToggle={(hook, enabled) => updateHook.mutate({ id: hook.id, payload: { enabled } })}
          onDelete={setDeleteTarget}
        />
      </TabsContent>
      <TabsContent value="logs" className="m-0">
        <ExecutionLogs
          dispatches={dispatches.data ?? []}
          loading={dispatches.isLoading}
          failed={dispatches.isError}
          onRetry={() => dispatches.refetch()}
        />
      </TabsContent>

      <CreateHookDialog
        open={creating}
        handlers={handlers.data ?? []}
        pending={createHook.isPending}
        onOpenChange={setCreating}
        onSubmit={(payload) => createHook.mutate(payload, { onSuccess: () => setCreating(false) })}
      />

      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget ? t("deleteDescription", { name: deleteTarget.name }) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteHook.isPending}
              onClick={() => {
                if (!deleteTarget) return;
                deleteHook.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
              }}
            >
              {t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Tabs>
  );
}

function HookList({
  hooks,
  loading,
  failed,
  onRetry,
  onToggle,
  onDelete,
}: {
  hooks: HookDefinition[];
  loading: boolean;
  failed: boolean;
  onRetry: () => void;
  onToggle: (hook: HookDefinition, enabled: boolean) => void;
  onDelete: (hook: HookDefinition) => void;
}) {
  const t = useTranslations("settings.customize.hooks");

  if (loading) return <Loading />;
  if (failed) return <LoadFailed onRetry={onRetry} />;
  if (!hooks.length) {
    return (
      <div className="border-b border-border py-10 text-center">
        <p className="text-sm font-medium">{t("emptyTitle")}</p>
        <p className="mt-1 text-sm text-muted-foreground">{t("emptyDescription")}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 border-b border-border px-1 pb-2 text-xs text-muted-foreground">
        <span className="min-w-0 flex-1">{t("columns.hook")}</span>
        <span className="w-40">{t("columns.event")}</span>
        <span className="w-28">{t("columns.scope")}</span>
        <span className="w-16 text-end">{t("columns.status")}</span>
      </div>
      {hooks.map((hook) => (
        <div
          key={hook.id}
          className="flex min-h-14 items-center gap-4 border-b border-border px-1 py-2.5"
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="truncate text-sm font-medium">{hook.name}</span>
              {hook.builtin ? (
                <span className="text-xs text-muted-foreground">{t("builtin")}</span>
              ) : null}
            </div>
            <p className="truncate text-xs text-muted-foreground">
              {hook.handlerKey} · {t(`effects.${hook.effect}`)} · {hook.timeoutMs}ms
            </p>
          </div>
          <code className="w-40 truncate text-xs text-muted-foreground">{hook.eventName}</code>
          <span className="w-28 text-xs text-muted-foreground">
            {t(`scopes.${hook.scopeType}`)}
          </span>
          <div className="flex w-16 items-center justify-end gap-1">
            <Switch
              size="sm"
              checked={hook.enabled}
              aria-label={t("toggle", { name: hook.name })}
              onCheckedChange={(checked) => onToggle(hook, checked)}
            />
            {!hook.builtin ? (
              <DropdownMenu>
                <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
                  <MoreHorizontalIcon />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem variant="destructive" onClick={() => onDelete(hook)}>
                    {t("delete")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}

function ExecutionLogs({
  dispatches,
  loading,
  failed,
  onRetry,
}: {
  dispatches: HookDispatch[];
  loading: boolean;
  failed: boolean;
  onRetry: () => void;
}) {
  const t = useTranslations("settings.customize.hooks");
  const locale = useLocale();
  const [expanded, setExpanded] = useState<string | null>(null);

  if (loading) return <Loading />;
  if (failed) return <LoadFailed onRetry={onRetry} />;
  if (!dispatches.length) {
    return (
      <div className="border-b border-border py-10 text-center">
        <p className="text-sm font-medium">{t("emptyLogsTitle")}</p>
        <p className="mt-1 text-sm text-muted-foreground">{t("emptyLogsDescription")}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 border-b border-border px-1 pb-2 text-xs text-muted-foreground">
        <span className="min-w-0 flex-1">{t("columns.event")}</span>
        <span className="w-28">{t("columns.status")}</span>
        <span className="w-32">{t("columns.time")}</span>
        <span className="w-20 text-end">{t("columns.duration")}</span>
        <span className="w-5" />
      </div>
      {dispatches.map((dispatch) => {
        const open = expanded === dispatch.id;
        return (
          <div key={dispatch.id} className="border-b border-border">
            <button
              type="button"
              className="flex min-h-12 w-full items-center gap-4 px-1 py-2 text-start hover:bg-muted/40"
              onClick={() => setExpanded(open ? null : dispatch.id)}
            >
              <div className="min-w-0 flex-1">
                <code className="text-xs">{dispatch.event_name}</code>
                <p className="truncate text-xs text-muted-foreground">trace {dispatch.trace_id}</p>
              </div>
              <div className="w-28">
                <StatusText status={dispatch.status} />
              </div>
              <span className="w-32 text-xs text-muted-foreground">
                {new Intl.DateTimeFormat(locale, {
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                }).format(new Date(dispatch.started_at))}
              </span>
              <span className="w-20 text-end text-xs tabular-nums text-muted-foreground">
                {dispatch.duration_ms ?? 0}ms
              </span>
              <ChevronDownIcon
                className={open ? "rotate-180 transition-transform" : "transition-transform"}
              />
            </button>
            {open ? (
              <div className="border-t border-border bg-muted/20 px-4 py-2">
                {dispatch.executions.length ? (
                  dispatch.executions.map((execution) => (
                    <div
                      key={execution.id}
                      className="flex items-center gap-4 border-b border-border py-2 last:border-b-0"
                    >
                      <div className="min-w-0 flex-1">
                        <span className="block truncate font-mono text-xs">
                          {execution.hook_definition_id}
                        </span>
                        {execution.error_message ? (
                          <span className="block truncate text-xs text-destructive">
                            {execution.error_message}
                          </span>
                        ) : null}
                      </div>
                      <div className="w-28">
                        <StatusText status={execution.status} />
                      </div>
                      <span className="w-20 text-end text-xs tabular-nums text-muted-foreground">
                        {execution.duration_ms ?? 0}ms
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">{t("noMatchedHooks")}</p>
                )}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function CreateHookDialog({
  open,
  handlers,
  pending,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  handlers: HookHandler[];
  pending: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: CreateHookPayload) => void;
}) {
  const t = useTranslations("settings.customize.hooks");
  const [name, setName] = useState("");
  const [handlerKey, setHandlerKey] = useState("");
  const selected = handlers.find((handler) => handler.key === handlerKey) ?? handlers[0];
  const [eventName, setEventName] = useState<HookEventName>("session.start");
  const events = selected?.events ?? [];
  const effectiveEvent = events.includes(eventName) ? eventName : events[0];

  function submit() {
    if (!name.trim() || !selected || !effectiveEvent) return;
    onSubmit({
      name: name.trim(),
      scopeType: "user",
      eventName: effectiveEvent,
      effect: selected.effect,
      handlerKey: selected.key,
      matcher: {},
      config: {},
      priority: 500,
      timeoutMs: 3000,
      failureMode: "open",
      enabled: true,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("createTitle")}</DialogTitle>
          <DialogDescription>{t("createDescription")}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium">{t("fields.name")}</span>
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={t("fields.namePlaceholder")}
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium">{t("fields.handler")}</span>
            <Select
              value={selected?.key ?? ""}
              onValueChange={(value) => setHandlerKey(value ?? "")}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {handlers.map((handler) => (
                  <SelectItem key={handler.key} value={handler.key}>
                    {handler.key}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium">{t("fields.event")}</span>
            <Select value={effectiveEvent} onValueChange={(value) => value && setEventName(value)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {events.map((event) => (
                  <SelectItem key={event} value={event}>
                    {event}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t("cancel")}
          </Button>
          <Button type="button" disabled={pending || !name.trim() || !selected} onClick={submit}>
            {pending ? t("saving") : t("create")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function StatusText({ status }: { status: string }) {
  const t = useTranslations("settings.customize.hooks");
  const failed = failedStatuses.has(status);
  return (
    <span
      className={
        failed
          ? "flex items-center gap-1.5 text-xs text-destructive"
          : "flex items-center gap-1.5 text-xs text-muted-foreground"
      }
    >
      <span
        className={
          failed
            ? "size-1.5 rounded-full bg-destructive"
            : "size-1.5 rounded-full bg-muted-foreground"
        }
      />
      {t(`statuses.${status}`)}
    </span>
  );
}

function Loading() {
  const t = useTranslations("settings.customize.hooks");
  return (
    <div className="flex min-h-48 items-center justify-center gap-2 text-sm text-muted-foreground">
      <LoaderCircleIcon className="animate-spin" />
      {t("loading")}
    </div>
  );
}

function LoadFailed({ onRetry }: { onRetry: () => void }) {
  const t = useTranslations("settings.customize.hooks");
  return (
    <div className="flex min-h-48 flex-col items-center justify-center gap-3 text-center">
      <p className="text-sm text-destructive">{t("loadFailed")}</p>
      <Button type="button" variant="outline" size="sm" onClick={onRetry}>
        {t("retry")}
      </Button>
    </div>
  );
}
