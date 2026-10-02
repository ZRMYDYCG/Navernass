"use client";

import {
  Anthropic,
  Aws,
  Azure,
  Baseten,
  Bedrock,
  Cerebras,
  Cohere,
  DeepInfra,
  DeepSeek,
  Fireworks,
  Gemini,
  GmiCloud,
  Groq,
  HuggingFace,
  Minimax,
  Mistral,
  Moonshot,
  Ollama,
  OpenAI,
  OpenRouter,
  Perplexity,
  Qwen,
  SiliconCloud,
  Together,
  Vercel,
  VertexAI,
  XAI,
  ZAI,
  Zhipu,
} from "@lobehub/icons";
import {
  CheckCircle2Icon,
  ChevronDownIcon,
  ExternalLinkIcon,
  GlobeIcon,
  Loader2Icon,
  PencilIcon,
  PlugZapIcon,
  PlusIcon,
  StarIcon,
  Trash2Icon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, type ComponentType } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  providerKindSchema,
  type ProviderConfig,
  type ProviderKind,
  type ProviderPayload,
} from "@/lib/http/modules/provider.schema";
import {
  useCreateProvider,
  useDeleteProvider,
  useProviders,
  useTestProvider,
  useUpdateProvider,
} from "@/servers/provider.server";

const vendors = {
  openai: { name: "OpenAI", icon: OpenAI, website: "https://platform.openai.com/api-keys" },
  anthropic: { name: "Anthropic", icon: Anthropic, website: "https://console.anthropic.com/" },
  google: { name: "Google Gemini", icon: Gemini, website: "https://aistudio.google.com/apikey" },
  deepseek: { name: "DeepSeek", icon: DeepSeek, website: "https://platform.deepseek.com/" },
  qwen: { name: "Alibaba · Qwen", icon: Qwen, website: "https://bailian.console.aliyun.com/" },
  glm: { name: "智谱 · GLM", icon: Zhipu, website: "https://open.bigmodel.cn/" },
  xai: { name: "xAI · Grok", icon: XAI, website: "https://console.x.ai/" },
  mistral: { name: "Mistral AI", icon: Mistral, website: "https://console.mistral.ai/" },
  groq: { name: "Groq", icon: Groq, website: "https://console.groq.com/keys" },
  cohere: { name: "Cohere", icon: Cohere, website: "https://dashboard.cohere.com/" },
  deepinfra: { name: "DeepInfra", icon: DeepInfra, website: "https://deepinfra.com/dash" },
  togetherai: { name: "Together AI", icon: Together, website: "https://api.together.ai/" },
  fireworks: { name: "Fireworks AI", icon: Fireworks, website: "https://fireworks.ai/" },
  cerebras: { name: "Cerebras", icon: Cerebras, website: "https://cloud.cerebras.ai/" },
  perplexity: {
    name: "Perplexity",
    icon: Perplexity,
    website: "https://www.perplexity.ai/account/api/keys",
  },
  moonshotai: { name: "Moonshot · Kimi", icon: Moonshot, website: "https://platform.moonshot.ai/" },
  minimax: { name: "MiniMax", icon: Minimax, website: "https://platform.minimax.io/" },
  azure: { name: "Azure OpenAI", icon: Azure, website: "https://ai.azure.com/" },
  bedrock: {
    name: "Amazon Bedrock",
    icon: Bedrock,
    website: "https://console.aws.amazon.com/bedrock/",
  },
  vertex: {
    name: "Vertex AI",
    icon: VertexAI,
    website: "https://console.cloud.google.com/vertex-ai",
  },
  gateway: { name: "Vercel AI Gateway", icon: Vercel, website: "https://vercel.com/ai-gateway" },
  baseten: { name: "Baseten", icon: Baseten, website: "https://app.baseten.co/" },
  huggingface: {
    name: "Hugging Face",
    icon: HuggingFace,
    website: "https://huggingface.co/settings/tokens",
  },
  gmicloud: { name: "GMI Cloud", icon: GmiCloud, website: "https://console.gmicloud.ai/" },
  zai: { name: "Z.AI", icon: ZAI, website: "https://open.z.ai/" },
  anthropic_aws: { name: "Claude on AWS", icon: Aws, website: "https://console.aws.amazon.com/" },
  openrouter: { name: "OpenRouter", icon: OpenRouter, website: "https://openrouter.ai/keys" },
  siliconflow: {
    name: "SiliconFlow",
    icon: SiliconCloud,
    website: "https://cloud.siliconflow.cn/",
  },
  ollama: { name: "Ollama", icon: Ollama, website: "https://ollama.com/" },
  compatible: { name: "Custom", icon: GlobeIcon, website: "" },
} satisfies Record<
  ProviderKind,
  { name: string; icon: ComponentType<{ size?: number }>; website: string }
>;

function ProviderForm({
  kind,
  provider,
  first,
  saving,
  error,
  onSave,
}: {
  kind: ProviderKind;
  provider?: ProviderConfig;
  first: boolean;
  saving: boolean;
  error?: string;
  onSave: (payload: ProviderPayload) => void;
}) {
  const t = useTranslations("settings.models");
  const [protocol, setProtocol] = useState(
    String(
      provider?.settings.protocol ??
        (kind === "openai" && !provider?.base_url ? "responses" : "chat"),
    ),
  );
  const [isDefault, setIsDefault] = useState(provider?.is_default ?? first);
  const [supportsTools, setSupportsTools] = useState(
    provider?.supports_tools ?? kind !== "perplexity",
  );
  const [supportsStructured, setSupportsStructured] = useState(
    provider?.supports_structured ?? true,
  );
  const vendor = vendors[kind];
  const custom = kind === "compatible";
  const protocols = [
    { value: "chat", label: "OpenAI Chat Completions" },
    { value: "responses", label: "OpenAI Responses" },
    ...(custom
      ? [
          { value: "open-responses", label: "Open Responses" },
          { value: "anthropic", label: "Anthropic Messages" },
          { value: "google", label: "Google Generative AI" },
        ]
      : []),
  ];
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const value = (key: string) => String(data.get(key) ?? "").trim();
        onSave({
          name: value("name"),
          kind,
          model: value("model"),
          apiKey:
            value("apiKey") || (provider ? undefined : kind === "ollama" ? "ollama" : undefined),
          baseUrl: value("baseUrl") || null,
          embeddingModel: value("embeddingModel") || null,
          isDefault,
          supportsTools,
          supportsStructured,
          settings: {
            ...provider?.settings,
            ...((custom || kind === "openai") && { protocol }),
            ...((kind === "bedrock" || kind === "anthropic_aws") && { region: value("region") }),
            ...(kind === "azure" && { resourceName: value("resourceName") || undefined }),
            ...(kind === "anthropic_aws" && { workspaceId: value("workspaceId") }),
          },
        });
      }}
    >
      <fieldset disabled={saving} className="min-w-0">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="provider-name">{t("fields.name")}</FieldLabel>
            <Input
              id="provider-name"
              name="name"
              defaultValue={provider?.name ?? (custom ? "" : vendor.name)}
              required
              maxLength={100}
              placeholder={t("placeholders.name")}
            />
          </Field>
          <Field>
            <div className="flex items-center justify-between gap-2">
              <FieldLabel htmlFor="provider-key">{t("fields.apiKey")}</FieldLabel>
              {vendor.website && (
                <a
                  href={vendor.website}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground underline-offset-4 hover:underline"
                >
                  {t("getApiKey")}
                  <ExternalLinkIcon className="size-3" />
                </a>
              )}
            </div>
            <Input
              id="provider-key"
              name="apiKey"
              type="password"
              autoComplete="new-password"
              required={!provider && kind !== "ollama"}
              placeholder={
                provider
                  ? t("apiKeyPlaceholder")
                  : kind === "ollama"
                    ? t("optionalKey")
                    : t("placeholders.apiKey")
              }
            />
            <FieldDescription>
              {t(
                kind === "vertex"
                  ? "vertexHelp"
                  : kind === "bedrock"
                    ? "bedrockHelp"
                    : "apiKeyHelp",
              )}
            </FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="provider-model">{t("fields.model")}</FieldLabel>
            <Input
              id="provider-model"
              name="model"
              defaultValue={provider?.model}
              required
              maxLength={191}
              placeholder={t("placeholders.model")}
            />
            <FieldDescription>
              {t(kind === "azure" ? "deploymentHelp" : "modelHelp")}
            </FieldDescription>
          </Field>
          {(custom || kind === "openai") && (
            <Field>
              <FieldLabel>{t("fields.protocol")}</FieldLabel>
              <Select
                items={protocols}
                value={protocol}
                onValueChange={(value) => {
                  if (value) setProtocol(value);
                }}
              >
                <SelectTrigger aria-label={t("fields.protocol")}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {protocols.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}
          {kind === "azure" && (
            <Field>
              <FieldLabel htmlFor="provider-resource">{t("fields.resourceName")}</FieldLabel>
              <Input
                id="provider-resource"
                name="resourceName"
                defaultValue={String(provider?.settings.resourceName ?? "")}
                placeholder="my-resource"
              />
              <FieldDescription>{t("azureHelp")}</FieldDescription>
            </Field>
          )}
          {(kind === "bedrock" || kind === "anthropic_aws") && (
            <Field>
              <FieldLabel htmlFor="provider-region">{t("fields.region")}</FieldLabel>
              <Input
                id="provider-region"
                name="region"
                defaultValue={String(provider?.settings.region ?? "us-east-1")}
                required
              />
            </Field>
          )}
          {kind === "anthropic_aws" && (
            <Field>
              <FieldLabel htmlFor="provider-workspace">{t("fields.workspaceId")}</FieldLabel>
              <Input
                id="provider-workspace"
                name="workspaceId"
                defaultValue={String(provider?.settings.workspaceId ?? "")}
                required
              />
            </Field>
          )}
          {(custom || kind === "ollama") && (
            <Field>
              <FieldLabel htmlFor="provider-url">{t("fields.baseUrl")}</FieldLabel>
              <Input
                id="provider-url"
                name="baseUrl"
                type="url"
                required
                defaultValue={
                  provider?.base_url ?? (kind === "ollama" ? "http://localhost:11434/v1" : "")
                }
                placeholder="https://api.example.com/v1"
              />
              <FieldDescription>
                {t(kind === "ollama" ? "ollamaHelp" : "customUrlHelp")}
              </FieldDescription>
            </Field>
          )}
          <Field orientation="horizontal">
            <Switch id="provider-default" checked={isDefault} onCheckedChange={setIsDefault} />
            <FieldLabel htmlFor="provider-default">{t("fields.isDefault")}</FieldLabel>
          </Field>
          <details className="group/details">
            <summary className="flex cursor-pointer list-none items-center gap-2 text-sm text-muted-foreground">
              <ChevronDownIcon className="size-4 group-open/details:rotate-180" />
              {t("advanced")}
            </summary>
            <div className="mt-4 flex flex-col gap-4">
              {!custom && kind !== "ollama" && (
                <Field>
                  <FieldLabel htmlFor="provider-url">{t("overrideBaseUrl")}</FieldLabel>
                  <Input
                    id="provider-url"
                    name="baseUrl"
                    type="url"
                    defaultValue={provider?.base_url ?? ""}
                    placeholder="https://api.example.com/v1"
                  />
                  <FieldDescription>{t("baseUrlHint")}</FieldDescription>
                </Field>
              )}
              <Field>
                <FieldLabel htmlFor="provider-embedding">{t("fields.embeddingModel")}</FieldLabel>
                <Input
                  id="provider-embedding"
                  name="embeddingModel"
                  defaultValue={provider?.embedding_model ?? ""}
                  maxLength={191}
                />
                <FieldDescription>{t("embeddingHelp")}</FieldDescription>
              </Field>
              <Field orientation="horizontal">
                <Switch
                  id="provider-tools"
                  checked={supportsTools}
                  onCheckedChange={setSupportsTools}
                />
                <FieldLabel htmlFor="provider-tools">{t("fields.supportsTools")}</FieldLabel>
              </Field>
              <Field orientation="horizontal">
                <Switch
                  id="provider-structured"
                  checked={supportsStructured}
                  onCheckedChange={setSupportsStructured}
                />
                <FieldLabel htmlFor="provider-structured">
                  {t("fields.supportsStructured")}
                </FieldLabel>
              </Field>
            </div>
          </details>
          <FieldError>{error}</FieldError>
          <div className="flex justify-end">
            <Button type="submit" disabled={saving}>
              {saving && <Loader2Icon className="animate-spin" />}
              {t("save")}
            </Button>
          </div>
        </FieldGroup>
      </fieldset>
    </form>
  );
}

export function Models() {
  const t = useTranslations("settings.models");
  const providers = useProviders();
  const create = useCreateProvider();
  const update = useUpdateProvider();
  const remove = useDeleteProvider();
  const test = useTestProvider();
  const [editor, setEditor] = useState<{ kind: ProviderKind; provider?: ProviderConfig }>();
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string>();
  const [formError, setFormError] = useState<string>();
  const busy = create.isPending || update.isPending || remove.isPending || test.isPending;
  const configured = providers.data ?? [];
  const kinds = providerKindSchema.options.filter(
    (kind) =>
      kind !== "compatible" &&
      `${vendors[kind].name} ${kind}`.toLowerCase().includes(search.trim().toLowerCase()),
  );
  function edit(kind: ProviderKind, provider?: ProviderConfig) {
    setFormError(undefined);
    setEditor({ kind, provider });
  }
  async function save(payload: ProviderPayload) {
    setFormError(undefined);
    try {
      if (editor?.provider) await update.mutateAsync({ id: editor.provider.id, payload });
      else await create.mutateAsync(payload);
      test.reset();
      setEditor(undefined);
    } catch (caught) {
      setFormError(caught instanceof Error ? caught.message : t("errors.saveFailed"));
    }
  }
  async function change(provider: ProviderConfig, patch: Partial<ProviderPayload>) {
    setError(undefined);
    try {
      await update.mutateAsync({
        id: provider.id,
        payload: {
          name: provider.name,
          kind: provider.kind,
          model: provider.model,
          supportsTools: provider.supports_tools,
          supportsStructured: provider.supports_structured,
          isDefault: provider.is_default,
          ...patch,
        },
      });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t("errors.saveFailed"));
    }
  }
  async function testConnection(provider: ProviderConfig) {
    setError(undefined);
    test.reset();
    try {
      await test.mutateAsync(provider.id);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t("errors.testFailed"));
    }
  }
  async function deleteProvider(provider: ProviderConfig) {
    if (!window.confirm(t("deleteConfirm", { name: provider.name }))) return;
    setError(undefined);
    try {
      await remove.mutateAsync(provider.id);
      test.reset();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t("errors.deleteFailed"));
    }
  }
  const EditorIcon = editor ? vendors[editor.kind].icon : GlobeIcon;
  return (
    <div className="flex flex-col gap-7">
      <div>
        <h2 className="text-xl font-semibold">{t("title")}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{t("description")}</p>
      </div>
      {(error || providers.error) && (
        <Alert variant="destructive">
          <AlertDescription>{error ?? providers.error?.message}</AlertDescription>
          {providers.isError && (
            <Button variant="outline" onClick={() => void providers.refetch()}>
              {t("retry")}
            </Button>
          )}
        </Alert>
      )}
      {test.data && (
        <Alert>
          <CheckCircle2Icon />
          <AlertTitle>
            {t("testSuccess")} · {test.data.model}
          </AlertTitle>
          <AlertDescription>
            {t("testResult", { latency: test.data.latencyMs, response: test.data.response })}
          </AlertDescription>
        </Alert>
      )}
      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-medium">{t("configured")}</h3>
        {providers.isLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : configured.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-6 text-center">
            <p className="text-sm font-medium">{t("emptyTitle")}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t("emptyDescription")}</p>
          </div>
        ) : (
          configured.map((provider) => {
            const Icon = vendors[provider.kind].icon;
            return (
              <div
                key={provider.id}
                className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-4"
              >
                <Icon size={28} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium">{provider.name}</span>
                    {provider.is_default && <Badge variant="secondary">{t("default")}</Badge>}
                    {!provider.is_enabled && <Badge variant="outline">{t("disabled")}</Badge>}
                  </div>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {provider.model} ·{" "}
                    {provider.kind === "compatible" ? t("custom") : vendors[provider.kind].name}
                  </p>
                </div>
                <Switch
                  checked={provider.is_enabled}
                  disabled={busy}
                  aria-label={t("toggleModel", { name: provider.name })}
                  onCheckedChange={(isEnabled) => void change(provider, { isEnabled })}
                />
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    disabled={busy || provider.is_default || !provider.is_enabled}
                    title={t("fields.isDefault")}
                    aria-label={t("fields.isDefault")}
                    onClick={() => void change(provider, { isDefault: true })}
                  >
                    <StarIcon />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    disabled={busy || !provider.is_enabled}
                    title={t("test")}
                    aria-label={t("test")}
                    onClick={() => void testConnection(provider)}
                  >
                    {test.isPending && test.variables === provider.id ? (
                      <Loader2Icon className="animate-spin" />
                    ) : (
                      <PlugZapIcon />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    disabled={busy}
                    title={t("editTitle")}
                    aria-label={t("editTitle")}
                    onClick={() => edit(provider.kind, provider)}
                  >
                    <PencilIcon />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    disabled={busy}
                    title={t("delete")}
                    aria-label={t("deleteModel", { name: provider.name })}
                    onClick={() => void deleteProvider(provider)}
                  >
                    <Trash2Icon />
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </section>
      <section className="flex flex-col gap-3">
        <div>
          <h3 className="text-sm font-medium">{t("addProvider")}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{t("catalogHelp")}</p>
        </div>
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={t("search")}
          aria-label={t("search")}
        />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {kinds.map((kind) => {
            const { icon: Icon, name } = vendors[kind];
            return (
              <button
                key={kind}
                type="button"
                disabled={busy || !providers.data}
                onClick={() => edit(kind)}
                className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
              >
                <Icon size={24} />
                <span className="min-w-0 flex-1 text-sm font-medium">{name}</span>
                {configured.some((provider) => provider.kind === kind) && (
                  <CheckCircle2Icon className="size-3.5 shrink-0 text-muted-foreground" />
                )}
              </button>
            );
          })}
        </div>
        {kinds.length === 0 && (
          <p className="py-3 text-sm text-muted-foreground">{t("noResults")}</p>
        )}
      </section>
      <button
        type="button"
        disabled={busy || !providers.data}
        onClick={() => edit("compatible")}
        className="flex items-center gap-4 rounded-lg border border-dashed border-border p-4 text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
      >
        <GlobeIcon className="size-6 shrink-0" />
        <span className="flex-1">
          <span className="block text-sm font-medium">{t("custom")}</span>
          <span className="mt-1 block text-xs text-muted-foreground">{t("customHelp")}</span>
        </span>
        <PlusIcon className="size-4" />
      </button>
      <Dialog
        open={!!editor}
        onOpenChange={(open) => {
          if (!open && !create.isPending && !update.isPending) setEditor(undefined);
        }}
      >
        <DialogContent className="max-h-9/10 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              <span className="flex items-center gap-2">
                <EditorIcon size={24} />
                {editor?.kind === "compatible" ? t("custom") : editor && vendors[editor.kind].name}
              </span>
            </DialogTitle>
            <DialogDescription>
              {editor?.provider ? t("editDescription") : t("formDescription")}
            </DialogDescription>
          </DialogHeader>
          <div className="min-h-0 overflow-y-auto px-1 py-1">
            {editor && (
              <ProviderForm
                key={editor.provider?.id ?? editor.kind}
                {...editor}
                first={!configured.length}
                saving={create.isPending || update.isPending}
                error={formError}
                onSave={(payload) => void save(payload)}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
