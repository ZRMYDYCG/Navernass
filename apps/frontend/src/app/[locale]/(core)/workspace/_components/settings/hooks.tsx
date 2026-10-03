"use client";

import { ChevronDownIcon, GitBranchIcon, LoaderCircleIcon, PlusIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Fragment, useId, useMemo, useState, type ReactNode } from "react";

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
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  hookEventNameSchema,
  type CreateHookPayload,
  type HookDefinition,
  type HookEventName,
  type HookHandler,
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

const eventFilters = ["all", ...hookEventNameSchema.options] as const;
type EventFilter = (typeof eventFilters)[number];

const scopeFilters = ["all", "system", "user", "novel"] as const;
type ScopeFilter = (typeof scopeFilters)[number];

const enabledFilters = ["all", "enabled", "disabled"] as const;
type EnabledFilter = (typeof enabledFilters)[number];

const dispatchStatusFilters = [
  "all",
  "running",
  "completed",
  "blocked",
  "partial",
  "failed",
] as const;
type DispatchStatusFilter = (typeof dispatchStatusFilters)[number];

export function Hooks() {
  const t = useTranslations("settings.customize.hooks");
  const handlers = useHookHandlers();
  const createHook = useCreateHook();
  const [creating, setCreating] = useState(false);

  return (
    <Tabs defaultValue="installed" className="flex-col">
      <TabsList variant="line">
        <TabsTrigger value="installed">{t("tabs.installed")}</TabsTrigger>
        <TabsTrigger value="logs">{t("tabs.logs")}</TabsTrigger>
      </TabsList>
      <TabsContent value="installed">
        <InstalledHooks onCreate={() => setCreating(true)} />
      </TabsContent>
      <TabsContent value="logs">
        <ExecutionLogs />
      </TabsContent>

      <CreateHookDialog
        open={creating}
        handlers={handlers.data ?? []}
        pending={createHook.isPending}
        onOpenChange={setCreating}
        onSubmit={(payload) => createHook.mutate(payload, { onSuccess: () => setCreating(false) })}
      />
    </Tabs>
  );
}

function InstalledHooks({ onCreate }: { onCreate: () => void }) {
  const t = useTranslations("settings.customize.hooks");
  const keywordId = useId();
  const hooks = useHooks();
  const updateHook = useUpdateHook();
  const deleteHook = useDeleteHook();
  const [keyword, setKeyword] = useState("");
  const [event, setEvent] = useState<EventFilter>("all");
  const [scope, setScope] = useState<ScopeFilter>("all");
  const [enabled, setEnabled] = useState<EnabledFilter>("all");
  const [deleteTarget, setDeleteTarget] = useState<HookDefinition | null>(null);

  const rows = useMemo(() => {
    const normalized = keyword.trim().toLowerCase();
    return (hooks.data ?? []).filter(
      (hook) =>
        (event === "all" || hook.eventName === event) &&
        (scope === "all" || hook.scopeType === scope) &&
        (enabled === "all" || (enabled === "enabled") === hook.enabled) &&
        (!normalized || `${hook.name} ${hook.handlerKey}`.toLowerCase().includes(normalized)),
    );
  }, [enabled, event, hooks.data, keyword, scope]);

  return (
    <div className="flex flex-col gap-4">
      <form
        className="flex items-end gap-3"
        onSubmit={(formEvent) => formEvent.preventDefault()}
        onReset={() => {
          setKeyword("");
          setEvent("all");
          setScope("all");
          setEnabled("all");
        }}
      >
        <Field className="min-w-0 flex-1">
          <FieldLabel htmlFor={keywordId}>{t("filters.keyword")}</FieldLabel>
          <Input
            id={keywordId}
            value={keyword}
            onChange={(inputEvent) => setKeyword(inputEvent.target.value)}
            placeholder={t("filters.keywordPlaceholder")}
          />
        </Field>
        <FilterSelect
          label={t("filters.event")}
          value={event}
          items={eventFilters.map((value) => ({
            value,
            label: value === "all" ? t("filters.all") : value,
          }))}
          onValueChange={setEvent}
        />
        <FilterSelect
          label={t("filters.scope")}
          value={scope}
          items={scopeFilters.map((value) => ({
            value,
            label: value === "all" ? t("filters.all") : t(`scopes.${value}`),
          }))}
          onValueChange={setScope}
        />
        <FilterSelect
          label={t("filters.status")}
          value={enabled}
          items={enabledFilters.map((value) => ({
            value,
            label: value === "all" ? t("filters.all") : t(`filters.${value}`),
          }))}
          onValueChange={setEnabled}
        />
        <Button type="reset" variant="outline">
          {t("filters.reset")}
        </Button>
      </form>

      <section className="flex flex-col gap-2">
        <header className="flex items-center gap-2">
          <h2 className="text-sm font-medium">{t("listTitle")}</h2>
          <span className="text-xs text-muted-foreground">
            {t("total", { count: rows.length })}
          </span>
          {hooks.isLoading ? (
            <LoaderCircleIcon className="size-3.5 animate-spin text-muted-foreground" />
          ) : null}
          <Button type="button" size="sm" className="ml-auto" onClick={onCreate}>
            <PlusIcon />
            {t("new")}
          </Button>
        </header>
        <div className="-mx-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("columns.hook")}</TableHead>
                <TableHead>{t("columns.event")}</TableHead>
                <TableHead>{t("columns.scope")}</TableHead>
                <TableHead>{t("columns.status")}</TableHead>
                <TableHead>
                  <span className="flex justify-end">{t("columns.actions")}</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length ? (
                rows.map((hook) => (
                  <TableRow key={hook.id}>
                    <TableCell>
                      <div className="flex max-w-64 min-w-0 flex-col">
                        <span className="truncate font-medium">{hook.name}</span>
                        <span className="truncate text-xs text-muted-foreground">
                          {hook.handlerKey} · {t(`effects.${hook.effect}`)} · {hook.timeoutMs}ms
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs text-muted-foreground">{hook.eventName}</code>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground">{t(`scopes.${hook.scopeType}`)}</span>
                    </TableCell>
                    <TableCell>
                      <Switch
                        size="sm"
                        checked={hook.enabled}
                        aria-label={t("toggle", { name: hook.name })}
                        onCheckedChange={(checked) =>
                          updateHook.mutate({ id: hook.id, payload: { enabled: checked } })
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        {hook.builtin ? (
                          <span className="text-xs text-muted-foreground">{t("builtin")}</span>
                        ) : (
                          <Button
                            type="button"
                            variant="destructive"
                            size="xs"
                            onClick={() => setDeleteTarget(hook)}
                          >
                            {t("delete")}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableMessage colSpan={5}>
                  {hooks.isLoading ? (
                    <span className="text-sm text-muted-foreground">{t("loading")}</span>
                  ) : hooks.isError ? (
                    <LoadFailed onRetry={() => hooks.refetch()} />
                  ) : (
                    <Empty>
                      <EmptyHeader>
                        <EmptyMedia variant="icon">
                          <GitBranchIcon />
                        </EmptyMedia>
                        <EmptyTitle>{t("emptyTitle")}</EmptyTitle>
                        <EmptyDescription>{t("emptyDescription")}</EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  )}
                </TableMessage>
              )}
            </TableBody>
          </Table>
        </div>
      </section>

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
    </div>
  );
}

function ExecutionLogs() {
  const t = useTranslations("settings.customize.hooks");
  const locale = useLocale();
  const keywordId = useId();
  const dispatches = useHookDispatches();
  const [keyword, setKeyword] = useState("");
  const [event, setEvent] = useState<EventFilter>("all");
  const [status, setStatus] = useState<DispatchStatusFilter>("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const rows = useMemo(() => {
    const normalized = keyword.trim().toLowerCase();
    return (dispatches.data ?? []).filter(
      (dispatch) =>
        (event === "all" || dispatch.event_name === event) &&
        (status === "all" || dispatch.status === status) &&
        (!normalized || dispatch.trace_id.toLowerCase().includes(normalized)),
    );
  }, [dispatches.data, event, keyword, status]);

  const formatTime = new Intl.DateTimeFormat(locale, {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <div className="flex flex-col gap-4">
      <form
        className="flex items-end gap-3"
        onSubmit={(formEvent) => formEvent.preventDefault()}
        onReset={() => {
          setKeyword("");
          setEvent("all");
          setStatus("all");
        }}
      >
        <Field className="min-w-0 flex-1">
          <FieldLabel htmlFor={keywordId}>{t("filters.trace")}</FieldLabel>
          <Input
            id={keywordId}
            value={keyword}
            onChange={(inputEvent) => setKeyword(inputEvent.target.value)}
            placeholder={t("filters.tracePlaceholder")}
          />
        </Field>
        <FilterSelect
          label={t("filters.event")}
          value={event}
          items={eventFilters.map((value) => ({
            value,
            label: value === "all" ? t("filters.all") : value,
          }))}
          onValueChange={setEvent}
        />
        <FilterSelect
          label={t("filters.status")}
          value={status}
          items={dispatchStatusFilters.map((value) => ({
            value,
            label: value === "all" ? t("filters.all") : t(`statuses.${value}`),
          }))}
          onValueChange={setStatus}
        />
        <Button type="reset" variant="outline">
          {t("filters.reset")}
        </Button>
      </form>

      <section className="flex flex-col gap-2">
        <header className="flex items-center gap-2">
          <h2 className="text-sm font-medium">{t("logsTitle")}</h2>
          <span className="text-xs text-muted-foreground">
            {t("total", { count: rows.length })}
          </span>
          {dispatches.isFetching ? (
            <LoaderCircleIcon className="size-3.5 animate-spin text-muted-foreground" />
          ) : null}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="ml-auto"
            onClick={() => dispatches.refetch()}
          >
            {t("refresh")}
          </Button>
        </header>
        <div className="-mx-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("columns.event")}</TableHead>
                <TableHead>{t("columns.status")}</TableHead>
                <TableHead>{t("columns.result")}</TableHead>
                <TableHead>{t("columns.time")}</TableHead>
                <TableHead>{t("columns.duration")}</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length ? (
                rows.map((dispatch) => {
                  const open = expanded === dispatch.id;
                  return (
                    <Fragment key={dispatch.id}>
                      <TableRow
                        aria-expanded={open}
                        onClick={() => setExpanded(open ? null : dispatch.id)}
                      >
                        <TableCell>
                          <div className="flex max-w-56 min-w-0 flex-col">
                            <code className="truncate text-xs">{dispatch.event_name}</code>
                            <span className="truncate text-xs text-muted-foreground">
                              trace {dispatch.trace_id}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <StatusText status={dispatch.status} />
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-muted-foreground tabular-nums">
                            {dispatch.success_count}/{dispatch.matched_count}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-muted-foreground tabular-nums">
                            {formatTime.format(new Date(dispatch.started_at))}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-muted-foreground tabular-nums">
                            {dispatch.duration_ms ?? 0}ms
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            aria-label={t("toggleDetails")}
                            onClick={(clickEvent) => {
                              clickEvent.stopPropagation();
                              setExpanded(open ? null : dispatch.id);
                            }}
                          >
                            <ChevronDownIcon
                              className={
                                open ? "rotate-180 transition-transform" : "transition-transform"
                              }
                            />
                          </Button>
                        </TableCell>
                      </TableRow>
                      {open ? (
                        <TableRow>
                          <TableCell colSpan={6}>
                            <div className="rounded-md bg-muted/30">
                              {dispatch.executions.length ? (
                                dispatch.executions.map((execution) => (
                                  <div
                                    key={execution.id}
                                    className="flex items-center gap-4 px-3 py-2"
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
                                    <span className="w-16 text-end text-xs text-muted-foreground tabular-nums">
                                      {execution.duration_ms ?? 0}ms
                                    </span>
                                  </div>
                                ))
                              ) : (
                                <p className="px-3 py-2 text-sm text-muted-foreground">
                                  {t("noMatchedHooks")}
                                </p>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : null}
                    </Fragment>
                  );
                })
              ) : (
                <TableMessage colSpan={6}>
                  {dispatches.isLoading ? (
                    <span className="text-sm text-muted-foreground">{t("loading")}</span>
                  ) : dispatches.isError ? (
                    <LoadFailed onRetry={() => dispatches.refetch()} />
                  ) : (
                    <Empty>
                      <EmptyHeader>
                        <EmptyMedia variant="icon">
                          <GitBranchIcon />
                        </EmptyMedia>
                        <EmptyTitle>{t("emptyLogsTitle")}</EmptyTitle>
                        <EmptyDescription>{t("emptyLogsDescription")}</EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  )}
                </TableMessage>
              )}
            </TableBody>
          </Table>
        </div>
      </section>
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

function FilterSelect<T extends string>({
  label,
  value,
  items,
  onValueChange,
}: {
  label: string;
  value: T;
  items: { value: T; label: string }[];
  onValueChange: (value: T) => void;
}) {
  const id = useId();
  return (
    <Field className="min-w-0 flex-1">
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Select
        items={items}
        value={value}
        onValueChange={(next) => {
          const item = items.find((candidate) => candidate.value === next);
          if (item) onValueChange(item.value);
        }}
      >
        <SelectTrigger id={id} className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}

function TableMessage({ colSpan, children }: { colSpan: number; children: ReactNode }) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan}>
        <div className="flex min-h-40 items-center justify-center whitespace-normal">
          {children}
        </div>
      </TableCell>
    </TableRow>
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

function LoadFailed({ onRetry }: { onRetry: () => void }) {
  const t = useTranslations("settings.customize.hooks");
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <p className="text-sm text-destructive">{t("loadFailed")}</p>
      <Button type="button" variant="outline" size="sm" onClick={onRetry}>
        {t("retry")}
      </Button>
    </div>
  );
}
