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
import { FormEvent, useMemo, useState } from "react";

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
  useCreateProvider,
  useDeleteProvider,
  useProviders,
  useTestProvider,
  useUpdateProvider,
} from "@/lib/query/provider.query";
import type { ProviderConfig, ProviderKind, ProviderPayload } from "@/schemas/provider.schema";

const providerKinds: ProviderKind[] = [
  "openai",
  "anthropic",
  "google",
  "deepseek",
  "qwen",
  "glm",
  "compatible",
];

const defaultBaseUrls: Partial<Record<ProviderKind, string>> = {
  deepseek: "https://api.deepseek.com",
  qwen: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  glm: "https://open.bigmodel.cn/api/paas/v4",
};

interface ProviderFormState {
  name: string;
  kind: ProviderKind;
  baseUrl: string;
  apiKey: string;
  model: string;
  embeddingModel: string;
  supportsTools: boolean;
  supportsStructured: boolean;
  isDefault: boolean;
  isEnabled: boolean;
}

function emptyForm(): ProviderFormState {
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
    isEnabled: true,
  };
}

function formFromProvider(provider: ProviderConfig): ProviderFormState {
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
    isEnabled: provider.is_enabled,
  };
}

function payloadFromForm(form: ProviderFormState, editing: boolean): ProviderPayload {
  return {
    name: form.name.trim(),
    kind: form.kind,
    baseUrl: form.baseUrl.trim() || undefined,
    apiKey: form.apiKey.trim() || undefined,
    model: form.model.trim(),
    embeddingModel: form.embeddingModel.trim() || undefined,
    supportsTools: form.supportsTools,
    supportsStructured: form.supportsStructured,
    isDefault: form.isDefault,
    isEnabled: editing ? form.isEnabled : undefined,
  };
}

function payloadFromProvider(
  provider: ProviderConfig,
  patch: Partial<ProviderFormState>,
): ProviderPayload {
  return payloadFromForm({ ...formFromProvider(provider), ...patch }, true);
}

function providerEndpoint(provider: ProviderConfig) {
  return provider.base_url || defaultBaseUrls[provider.kind] || "SDK default";
}

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="px-1 text-sm font-medium text-muted-foreground">{title}</h3>
      {children}
    </section>
  );
}

function SettingPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card text-card-foreground">
      {children}
    </div>
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
  const [form, setForm] = useState<ProviderFormState>(emptyForm);
  const [error, setError] = useState<string>();
  const selected = providers.data?.find((provider) => provider.id === selectedId);
  const kindItems = useMemo(
    () => providerKinds.map((kind) => ({ value: kind, label: t(`kinds.${kind}`) })),
    [t],
  );
  const busy =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending ||
    testMutation.isPending;

  function startNew() {
    setSelectedId(undefined);
    setForm(emptyForm());
    setError(undefined);
    testMutation.reset();
  }

  function selectProvider(provider: ProviderConfig) {
    setSelectedId(provider.id);
    setForm(formFromProvider(provider));
    setError(undefined);
    testMutation.reset();
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);

    const payload = payloadFromForm(form, Boolean(selected));
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
      selectProvider(saved);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t("errors.saveFailed"));
    }
  }

  async function deleteConfig(provider: ProviderConfig) {
    if (!window.confirm(t("deleteConfirm", { name: provider.name }))) return;
    setError(undefined);
    try {
      await deleteMutation.mutateAsync(provider.id);
      if (provider.id === selectedId) startNew();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t("errors.deleteFailed"));
    }
  }

  async function onTest() {
    if (!selected) return;
    setError(undefined);
    try {
      await testMutation.mutateAsync(selected.id);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t("errors.testFailed"));
    }
  }

  async function toggleProvider(provider: ProviderConfig, checked: boolean) {
    try {
      await updateMutation.mutateAsync({
        id: provider.id,
        payload: payloadFromProvider(provider, { isEnabled: checked }),
      });
      if (provider.id === selectedId) setForm((current) => ({ ...current, isEnabled: checked }));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t("errors.saveFailed"));
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

      <SettingsSection title={t("availableModels")}>
        <SettingPanel>
          {providers.isLoading ? (
            <div className="flex flex-col gap-3 p-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : providers.data?.length ? (
            providers.data.map((provider, index) => (
              <div key={provider.id}>
                {index > 0 ? <Separator /> : null}
                <div
                  data-selected={provider.id === selectedId}
                  className="flex items-center gap-4 px-4 py-3 data-[selected=true]:bg-muted/60"
                >
                  <button
                    type="button"
                    className="min-w-0 flex-1 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                    onClick={() => selectProvider(provider)}
                  >
                    <span className="block truncate text-sm font-medium">{provider.name}</span>
                    <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                      {provider.model} · {providerEndpoint(provider)}
                    </span>
                  </button>
                  <Switch
                    checked={provider.is_enabled}
                    disabled={updateMutation.isPending}
                    onCheckedChange={(checked) => void toggleProvider(provider, checked)}
                    aria-label={t("toggleModel", { name: provider.name })}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    disabled={deleteMutation.isPending}
                    aria-label={t("deleteModel", { name: provider.name })}
                    onClick={() => void deleteConfig(provider)}
                  >
                    <Trash2Icon />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="px-4 py-5">
              <p className="text-sm font-medium">{t("emptyTitle")}</p>
              <p className="mt-1 text-sm text-muted-foreground">{t("emptyDescription")}</p>
            </div>
          )}
          <Separator />
          <Button variant="link" className="mx-2 my-2" onClick={startNew}>
            {t("viewAllModels")}
          </Button>
        </SettingPanel>
      </SettingsSection>

      <SettingsSection title={t("apiKeys")}>
        <SettingPanel>
          <form className="flex flex-col" onSubmit={onSubmit}>
            <div className="flex items-center justify-between gap-4 px-4 py-3">
              <div className="min-w-0">
                <h4 className="text-sm font-medium">{selected ? selected.name : t("newTitle")}</h4>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {selected ? t("secretSaved") : t("formDescription")}
                </p>
              </div>
              {selected ? (
                <Switch
                  checked={form.isEnabled}
                  onCheckedChange={(checked) => setForm({ ...form, isEnabled: checked })}
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
                      value={form.name}
                      onChange={(event) => setForm({ ...form, name: event.target.value })}
                      placeholder={t("placeholders.name")}
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel>{t("fields.kind")}</FieldLabel>
                    <Select
                      items={kindItems}
                      value={form.kind}
                      onValueChange={(value) => setForm({ ...form, kind: value as ProviderKind })}
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
                    placeholder={selected ? t("apiKeyPlaceholder") : t("placeholders.apiKey")}
                    value={form.apiKey}
                    onChange={(event) => setForm({ ...form, apiKey: event.target.value })}
                    required={!selected}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="provider-model">{t("fields.model")}</FieldLabel>
                  <Input
                    id="provider-model"
                    value={form.model}
                    onChange={(event) => setForm({ ...form, model: event.target.value })}
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
                    placeholder={defaultBaseUrls[form.kind] ?? "https://api.example.com/v1"}
                    value={form.baseUrl}
                    onChange={(event) => setForm({ ...form, baseUrl: event.target.value })}
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
                        value={form.embeddingModel}
                        onChange={(event) =>
                          setForm({ ...form, embeddingModel: event.target.value })
                        }
                      />
                    </Field>
                    <div className="grid gap-3">
                      <Field orientation="horizontal">
                        <Switch
                          checked={form.supportsTools}
                          onCheckedChange={(checked) =>
                            setForm({ ...form, supportsTools: checked })
                          }
                        />
                        <FieldLabel>{t("fields.supportsTools")}</FieldLabel>
                      </Field>
                      <Field orientation="horizontal">
                        <Switch
                          checked={form.supportsStructured}
                          onCheckedChange={(checked) =>
                            setForm({ ...form, supportsStructured: checked })
                          }
                        />
                        <FieldLabel>{t("fields.supportsStructured")}</FieldLabel>
                      </Field>
                      <Field orientation="horizontal">
                        <Switch
                          checked={form.isDefault}
                          onCheckedChange={(checked) => setForm({ ...form, isDefault: checked })}
                        />
                        <FieldLabel>{t("fields.isDefault")}</FieldLabel>
                      </Field>
                    </div>
                  </div>
                </details>

                <FieldError>{error}</FieldError>

                {testMutation.data ? (
                  <Alert>
                    <CheckCircle2Icon />
                    <AlertTitle>{t("testSuccess")}</AlertTitle>
                    <AlertDescription>
                      {t("testResult", {
                        latency: testMutation.data.latencyMs,
                        response: testMutation.data.response,
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
                  {createMutation.isPending || updateMutation.isPending ? (
                    <Loader2Icon data-icon="inline-start" className="animate-spin" />
                  ) : (
                    <SaveIcon data-icon="inline-start" />
                  )}
                  {t("save")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={!selected || busy}
                  onClick={onTest}
                >
                  {testMutation.isPending ? (
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
                disabled={!selected || busy}
                onClick={() => selected && void deleteConfig(selected)}
              >
                <Trash2Icon data-icon="inline-start" />
                {t("delete")}
              </Button>
            </div>
          </form>
        </SettingPanel>
      </SettingsSection>
    </div>
  );
}
