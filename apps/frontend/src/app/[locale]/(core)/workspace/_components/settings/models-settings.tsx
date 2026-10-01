"use client";

import {
  CheckCircle2Icon,
  ChevronDownIcon,
  Loader2Icon,
  PlusIcon,
  PlugZapIcon,
  SaveIcon,
  Trash2Icon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Fragment, useMemo, useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  providerKindSchema,
  type ProviderConfig,
  type ProviderKind,
  type ProviderPayload,
  type ProviderTestResult,
} from "@/lib/http/modules/provider.schema";
import {
  useCreateProvider,
  useDeleteProvider,
  useProviders,
  useTestProvider,
  useUpdateProvider,
} from "@/servers/provider.server";

import { SettingsCard, SettingsGroup } from "./settings-ui";

const defaultBaseUrls: Partial<Record<ProviderKind, string>> = {
  deepseek: "https://api.deepseek.com",
  qwen: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  glm: "https://open.bigmodel.cn/api/paas/v4",
};

function isProviderKind(value: unknown): value is ProviderKind {
  return providerKindSchema.safeParse(value).success;
}

function providerEndpoint(provider: ProviderConfig) {
  return provider.base_url || defaultBaseUrls[provider.kind] || "SDK default";
}

interface ProviderFormValues {
  name: string;
  kind: ProviderKind;
  baseUrl: string;
  apiKey: string;
  model: string;
  embeddingModel: string;
  supportsTools: boolean;
  supportsStructured: boolean;
  isDefault: boolean;
}

function emptyValues(): ProviderFormValues {
  return {
    name: "",
    kind: "compatible",
    baseUrl: "",
    apiKey: "",
    model: "",
    embeddingModel: "",
    supportsTools: true,
    supportsStructured: true,
    isDefault: false,
  };
}

function valuesFromProvider(provider: ProviderConfig): ProviderFormValues {
  return {
    name: provider.name,
    kind: provider.kind,
    baseUrl: provider.base_url ?? "",
    apiKey: "",
    model: provider.model,
    embeddingModel: provider.embedding_model ?? "",
    supportsTools: provider.supports_tools,
    supportsStructured: provider.supports_structured,
    isDefault: provider.is_default,
  };
}

function toPayload(values: ProviderFormValues, provider: ProviderConfig | null): ProviderPayload {
  return {
    name: values.name.trim(),
    kind: values.kind,
    baseUrl: values.baseUrl.trim() || undefined,
    apiKey: values.apiKey.trim() || undefined,
    model: values.model.trim(),
    embeddingModel: values.embeddingModel.trim() || undefined,
    supportsTools: values.supportsTools,
    supportsStructured: values.supportsStructured,
    isDefault: values.isDefault,
    isEnabled: provider?.is_enabled,
  };
}

interface ProviderListProps {
  providers: ProviderConfig[];
  isLoading: boolean;
  busy: boolean;
  selectedId: string | undefined;
  onSelect: (id: string) => void;
  onToggle: (provider: ProviderConfig, isEnabled: boolean) => void;
  onDelete: (provider: ProviderConfig) => void;
}

function ProviderList({
  providers,
  isLoading,
  busy,
  selectedId,
  onSelect,
  onToggle,
  onDelete,
}: ProviderListProps) {
  const t = useTranslations("settings.models");

  return (
    <SettingsCard>
      {isLoading ? (
        <div className="flex flex-col gap-3 p-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      ) : providers.length ? (
        providers.map((provider, index) => (
          <Fragment key={provider.id}>
            {index > 0 ? <Separator /> : null}
            <ProviderRow
              provider={provider}
              selected={provider.id === selectedId}
              busy={busy}
              onSelect={onSelect}
              onToggle={onToggle}
              onDelete={onDelete}
            />
          </Fragment>
        ))
      ) : (
        <div className="px-4 py-5">
          <p className="text-sm font-medium">{t("emptyTitle")}</p>
          <p className="mt-1 text-sm text-muted-foreground">{t("emptyDescription")}</p>
        </div>
      )}
    </SettingsCard>
  );
}

function ProviderRow({
  provider,
  selected,
  busy,
  onSelect,
  onToggle,
  onDelete,
}: {
  provider: ProviderConfig;
  selected: boolean;
  busy: boolean;
  onSelect: (id: string) => void;
  onToggle: (provider: ProviderConfig, isEnabled: boolean) => void;
  onDelete: (provider: ProviderConfig) => void;
}) {
  const t = useTranslations("settings.models");

  return (
    <div
      data-selected={selected}
      className="flex items-center gap-4 px-4 py-3 data-[selected=true]:bg-muted/60"
    >
      <button
        type="button"
        className="min-w-0 flex-1 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        onClick={() => onSelect(provider.id)}
      >
        <span className="block truncate text-sm font-medium">{provider.name}</span>
        <span className="mt-0.5 block truncate text-xs text-muted-foreground">
          {provider.model} · {providerEndpoint(provider)}
        </span>
      </button>
      <Switch
        checked={provider.is_enabled}
        disabled={busy}
        onCheckedChange={(isEnabled) => onToggle(provider, isEnabled)}
        aria-label={t("toggleModel", { name: provider.name })}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        disabled={busy}
        aria-label={t("deleteModel", { name: provider.name })}
        onClick={() => onDelete(provider)}
      >
        <Trash2Icon />
      </Button>
    </div>
  );
}

interface ProviderFormProps {
  provider: ProviderConfig | null;
  error: string | undefined;
  saving: boolean;
  testing: boolean;
  deleting: boolean;
  testResult: ProviderTestResult | undefined;
  onSubmit: (values: ProviderFormValues) => void;
  onTest: () => void;
  onDelete: () => void;
  onToggleEnabled: (isEnabled: boolean) => void;
}

function ProviderForm({
  provider,
  error,
  saving,
  testing,
  deleting,
  testResult,
  onSubmit,
  onTest,
  onDelete,
  onToggleEnabled,
}: ProviderFormProps) {
  const t = useTranslations("settings.models");
  const [values, setValues] = useState<ProviderFormValues>(() =>
    provider ? valuesFromProvider(provider) : emptyValues(),
  );
  const kindItems = useMemo(
    () => providerKindSchema.options.map((kind) => ({ value: kind, label: t(`kinds.${kind}`) })),
    [t],
  );
  const busy = saving || testing || deleting;

  const set = <K extends keyof ProviderFormValues>(key: K, value: ProviderFormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  return (
    <SettingsCard>
      <form
        className="flex flex-col"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit(values);
        }}
      >
        <div className="flex items-center justify-between gap-4 px-4 py-3">
          <div className="min-w-0">
            <h4 className="text-sm font-medium">{provider ? provider.name : t("newTitle")}</h4>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {provider ? t("secretSaved") : t("formDescription")}
            </p>
          </div>
          {provider ? (
            <Switch
              checked={provider.is_enabled}
              disabled={busy}
              onCheckedChange={onToggleEnabled}
              aria-label={t("fields.isEnabled")}
            />
          ) : null}
        </div>
        <Separator />

        <div className="p-4">
          <FieldGroup>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="provider-name">{t("fields.name")}</FieldLabel>
                <Input
                  id="provider-name"
                  value={values.name}
                  onChange={(event) => set("name", event.target.value)}
                  placeholder={t("placeholders.name")}
                  required
                />
              </Field>
              <Field>
                <FieldLabel>{t("fields.kind")}</FieldLabel>
                <Select
                  items={kindItems}
                  value={values.kind}
                  onValueChange={(value) => {
                    if (isProviderKind(value)) set("kind", value);
                  }}
                >
                  <SelectTrigger aria-label={t("fields.kind")} className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {kindItems.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="provider-api-key">{t("fields.apiKey")}</FieldLabel>
              <FieldDescription>{t("apiKeyHelp")}</FieldDescription>
              <Input
                id="provider-api-key"
                type="password"
                autoComplete="off"
                placeholder={provider ? t("apiKeyPlaceholder") : t("placeholders.apiKey")}
                value={values.apiKey}
                onChange={(event) => set("apiKey", event.target.value)}
                required={!provider}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="provider-model">{t("fields.model")}</FieldLabel>
              <Input
                id="provider-model"
                value={values.model}
                onChange={(event) => set("model", event.target.value)}
                placeholder={t("placeholders.model")}
                required
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="provider-base-url">{t("fields.baseUrl")}</FieldLabel>
              <FieldDescription>{t("baseUrlHint")}</FieldDescription>
              <Input
                id="provider-base-url"
                type="url"
                placeholder={defaultBaseUrls[values.kind] ?? "https://api.example.com/v1"}
                value={values.baseUrl}
                onChange={(event) => set("baseUrl", event.target.value)}
              />
            </Field>

            <details className="group/details">
              <summary className="flex cursor-default list-none items-center gap-2 text-sm font-medium text-muted-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
                <ChevronDownIcon className="size-4 transition-transform group-open/details:rotate-180" />
                {t("advanced")}
              </summary>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="provider-embedding-model">
                    {t("fields.embeddingModel")}
                  </FieldLabel>
                  <Input
                    id="provider-embedding-model"
                    value={values.embeddingModel}
                    onChange={(event) => set("embeddingModel", event.target.value)}
                  />
                </Field>
                <div className="grid gap-3">
                  <Field orientation="horizontal">
                    <Switch
                      checked={values.supportsTools}
                      onCheckedChange={(checked) => set("supportsTools", checked)}
                    />
                    <FieldLabel>{t("fields.supportsTools")}</FieldLabel>
                  </Field>
                  <Field orientation="horizontal">
                    <Switch
                      checked={values.supportsStructured}
                      onCheckedChange={(checked) => set("supportsStructured", checked)}
                    />
                    <FieldLabel>{t("fields.supportsStructured")}</FieldLabel>
                  </Field>
                  <Field orientation="horizontal">
                    <Switch
                      checked={values.isDefault}
                      onCheckedChange={(checked) => set("isDefault", checked)}
                    />
                    <FieldLabel>{t("fields.isDefault")}</FieldLabel>
                  </Field>
                </div>
              </div>
            </details>

            <FieldError>{error}</FieldError>

            {testResult ? (
              <Alert>
                <CheckCircle2Icon />
                <AlertTitle>{t("testSuccess")}</AlertTitle>
                <AlertDescription>
                  {t("testResult", {
                    latency: testResult.latencyMs,
                    response: testResult.response,
                  })}
                </AlertDescription>
              </Alert>
            ) : null}
          </FieldGroup>
        </div>

        <Separator />
        <div className="flex flex-wrap justify-between gap-3 p-4">
          <div className="flex gap-2">
            <Button type="submit" disabled={busy}>
              {saving ? (
                <Loader2Icon data-icon="inline-start" className="animate-spin" />
              ) : (
                <SaveIcon data-icon="inline-start" />
              )}
              {t("save")}
            </Button>
            <Button type="button" variant="outline" disabled={!provider || busy} onClick={onTest}>
              {testing ? (
                <Loader2Icon data-icon="inline-start" className="animate-spin" />
              ) : (
                <PlugZapIcon data-icon="inline-start" />
              )}
              {t("test")}
            </Button>
          </div>
          <Button
            type="button"
            variant="destructive"
            disabled={!provider || busy}
            onClick={onDelete}
          >
            <Trash2Icon data-icon="inline-start" />
            {t("delete")}
          </Button>
        </div>
      </form>
    </SettingsCard>
  );
}

export function ModelsSettings() {
  const t = useTranslations("settings.models");
  const providers = useProviders();
  const createMutation = useCreateProvider();
  const updateMutation = useUpdateProvider();
  const deleteMutation = useDeleteProvider();
  const testMutation = useTestProvider();
  const [selectedId, setSelectedId] = useState<string>();
  const [error, setError] = useState<string>();
  const selected = providers.data?.find((provider) => provider.id === selectedId) ?? null;

  function startNew() {
    setSelectedId(undefined);
    setError(undefined);
    testMutation.reset();
  }

  function selectProvider(id: string) {
    setSelectedId(id);
    setError(undefined);
    testMutation.reset();
  }

  async function save(values: ProviderFormValues) {
    setError(undefined);

    const payload = toPayload(values, selected);
    if (!payload.name || !payload.model) {
      setError(t("errors.required"));
      return;
    }
    if (!selected && !payload.apiKey) {
      setError(t("errors.apiKeyRequired"));
      return;
    }
    if (payload.kind === "compatible" && !payload.baseUrl) {
      setError(t("errors.baseUrlRequired"));
      return;
    }

    try {
      const saved = selected
        ? await updateMutation.mutateAsync({ id: selected.id, payload })
        : await createMutation.mutateAsync(payload);
      testMutation.reset();
      selectProvider(saved.id);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t("errors.saveFailed"));
    }
  }

  async function testSelected() {
    if (!selected) return;
    setError(undefined);
    try {
      await testMutation.mutateAsync(selected.id);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t("errors.testFailed"));
    }
  }

  async function toggle(provider: ProviderConfig, isEnabled: boolean) {
    setError(undefined);
    try {
      await updateMutation.mutateAsync({
        id: provider.id,
        payload: { ...toPayload(valuesFromProvider(provider), provider), isEnabled },
      });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t("errors.saveFailed"));
    }
  }

  async function remove(provider: ProviderConfig) {
    if (!window.confirm(t("deleteConfirm", { name: provider.name }))) return;
    setError(undefined);
    try {
      await deleteMutation.mutateAsync(provider.id);
      if (provider.id === selectedId) startNew();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t("errors.deleteFailed"));
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">{t("title")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("description")}</p>
        </div>
        <Button variant="outline" size="sm" onClick={startNew}>
          <PlusIcon data-icon="inline-start" />
          {t("new")}
        </Button>
      </div>

      <SettingsGroup title={t("availableModels")}>
        <ProviderList
          providers={providers.data ?? []}
          isLoading={providers.isLoading}
          busy={updateMutation.isPending || deleteMutation.isPending}
          selectedId={selectedId}
          onSelect={selectProvider}
          onToggle={(provider, isEnabled) => void toggle(provider, isEnabled)}
          onDelete={(provider) => void remove(provider)}
        />
      </SettingsGroup>

      <SettingsGroup title={t("apiKeys")}>
        <ProviderForm
          key={selectedId ?? "new"}
          provider={selected}
          error={error}
          saving={createMutation.isPending || updateMutation.isPending}
          testing={testMutation.isPending}
          deleting={deleteMutation.isPending}
          testResult={testMutation.data}
          onSubmit={(values) => void save(values)}
          onTest={() => void testSelected()}
          onDelete={() => {
            if (selected) void remove(selected);
          }}
          onToggleEnabled={(isEnabled) => {
            if (selected) void toggle(selected, isEnabled);
          }}
        />
      </SettingsGroup>
    </div>
  );
}
