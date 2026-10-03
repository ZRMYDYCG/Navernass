"use client";

import {
  ActivityIcon,
  ChevronDownIcon,
  GitBranchIcon,
  LoaderCircleIcon,
  MoreHorizontalIcon,
  PlusIcon,
} from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
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
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
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

const statusVariants = {
  completed: "secondary",
  succeeded: "secondary",
  running: "outline",
  blocked: "destructive",
  denied: "destructive",
  failed: "destructive",
  timed_out: "destructive",
  invalid_output: "destructive",
  partial: "outline",
  skipped: "outline",
} as const;

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
      <div className="flex items-center justify-between gap-3">
        <TabsList>
          <TabsTrigger value="installed">{t("tabs.installed")}</TabsTrigger>
          <TabsTrigger value="logs">{t("tabs.logs")}</TabsTrigger>
        </TabsList>
        <Button type="button" size="sm" onClick={() => setCreating(true)}>
          <PlusIcon />
          {t("new")}
        </Button>
      </div>

      <TabsContent value="installed">
        <HookList
          hooks={hooks.data ?? []}
          loading={hooks.isLoading}
          onToggle={(hook, enabled) => updateHook.mutate({ id: hook.id, payload: { enabled } })}
          onDelete={setDeleteTarget}
        />
      </TabsContent>
      <TabsContent value="logs">
        <ExecutionLogs dispatches={dispatches.data ?? []} loading={dispatches.isLoading} />
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
  onToggle,
  onDelete,
}: {
  hooks: HookDefinition[];
  loading: boolean;
  onToggle: (hook: HookDefinition, enabled: boolean) => void;
  onDelete: (hook: HookDefinition) => void;
}) {
  const t = useTranslations("settings.customize.hooks");

  if (loading) return <Loading />;
  if (!hooks.length) {
    return (
      <div className="rounded-lg border border-border">
        <Empty className="min-h-64">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <GitBranchIcon />
            </EmptyMedia>
            <EmptyTitle>{t("emptyTitle")}</EmptyTitle>
            <EmptyDescription>{t("emptyDescription")}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-background">
      {hooks.map((hook) => (
        <div
          key={hook.id}
          className="flex min-h-16 items-center gap-3 border-b border-border px-3 py-2 last:border-b-0"
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="truncate text-sm font-medium">{hook.name}</span>
              <Badge variant="outline">{t(`effects.${hook.effect}`)}</Badge>
              {!hook.enabled ? <Badge variant="secondary">{t("disabled")}</Badge> : null}
            </div>
            <p className="truncate text-sm text-muted-foreground">
              {hook.eventName} · {hook.handlerKey}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {t("metadata", {
                scope: t(`scopes.${hook.scopeType}`),
                priority: hook.priority,
                timeout: hook.timeoutMs,
              })}
            </p>
          </div>
          <Switch
            size="sm"
            checked={hook.enabled}
            aria-label={t("toggle", { name: hook.name })}
            onCheckedChange={(checked) => onToggle(hook, checked)}
          />
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
        </div>
      ))}
    </div>
  );
}

function ExecutionLogs({ dispatches, loading }: { dispatches: HookDispatch[]; loading: boolean }) {
  const t = useTranslations("settings.customize.hooks");
  const locale = useLocale();
  const [expanded, setExpanded] = useState<string | null>(null);

  if (loading) return <Loading />;
  if (!dispatches.length) {
    return (
      <div className="rounded-lg border border-border">
        <Empty className="min-h-64">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ActivityIcon />
            </EmptyMedia>
            <EmptyTitle>{t("emptyLogsTitle")}</EmptyTitle>
            <EmptyDescription>{t("emptyLogsDescription")}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-background">
      {dispatches.map((dispatch) => {
        const open = expanded === dispatch.id;
        return (
          <div key={dispatch.id} className="border-b border-border last:border-b-0">
            <button
              type="button"
              className="flex w-full items-center gap-3 px-3 py-3 text-start hover:bg-muted/50"
              onClick={() => setExpanded(open ? null : dispatch.id)}
            >
              <ChevronDownIcon
                className={open ? "rotate-180 transition-transform" : "transition-transform"}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-medium">{dispatch.event_name}</span>
                  <StatusBadge status={dispatch.status} />
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Intl.DateTimeFormat(locale, {
                    dateStyle: "short",
                    timeStyle: "medium",
                  }).format(new Date(dispatch.started_at))}
                  {" · "}
                  {t("executionSummary", {
                    success: dispatch.success_count,
                    total: dispatch.matched_count,
                    duration: dispatch.duration_ms ?? 0,
                  })}
                </p>
              </div>
            </button>
            {open ? (
              <div className="flex flex-col gap-3 border-t border-border bg-muted/30 px-4 py-3">
                <p className="font-mono text-xs text-muted-foreground">trace {dispatch.trace_id}</p>
                {dispatch.executions.length ? (
                  dispatch.executions.map((execution) => (
                    <div
                      key={execution.id}
                      className="rounded-md border border-border bg-background p-3"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs">{execution.hook_definition_id}</span>
                        <StatusBadge status={execution.status} />
                        <span className="ml-auto text-xs text-muted-foreground">
                          {execution.duration_ms ?? 0}ms
                        </span>
                      </div>
                      {execution.error_message ? (
                        <p className="mt-2 text-sm text-destructive">{execution.error_message}</p>
                      ) : null}
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

function StatusBadge({ status }: { status: keyof typeof statusVariants }) {
  const t = useTranslations("settings.customize.hooks");
  return <Badge variant={statusVariants[status]}>{t(`statuses.${status}`)}</Badge>;
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
