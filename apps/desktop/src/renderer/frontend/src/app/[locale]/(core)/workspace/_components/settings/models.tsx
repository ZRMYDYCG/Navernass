"use client";

import {
  AgnesAI,
  Ai21,
  Ai302,
  AiHubMix,
  Alibaba,
  AMDRadeonCloud,
  Arcee,
  Chutes,
  Cloudflare,
  Crusoe,
  DigitalOcean,
  Friendli,
  GithubCopilot,
  IBM,
  Inception,
  Kimi,
  LongCat,
  Meta,
  Morph,
  Nebius,
  Novita,
  OpenCode,
  Poe,
  Poolside,
  Qiniu,
  SenseNova,
  Snowflake,
  SubModel,
  Tencent,
  Upstage,
  V0,
  Venice,
  Wafer,
  Wandb,
  WorkersAI,
  ZenMux,
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
  Hunyuan,
  LmStudio,
  Minimax,
  Mistral,
  ModelScope,
  Moonshot,
  Nvidia,
  Ollama,
  OpenAI,
  OpenRouter,
  Perplexity,
  Qwen,
  SiliconCloud,
  Stepfun,
  Together,
  Vercel,
  VertexAI,
  Volcengine,
  XAI,
  XiaomiMiMo,
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
import { useMemo, useState, type ComponentType } from "react";
import { Autocomplete } from "@base-ui/react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
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
  type CatalogModel,
  type CatalogProvider,
  type ProviderConfig,
  type ProviderKind,
  type ProviderPayload,
} from "@/lib/http/modules/provider.schema";
import {
  useCreateProvider,
  useDeleteProvider,
  useDiscoverModels,
  useModelCatalog,
  useProviderCatalog,
  useProviders,
  useTestProvider,
  useUpdateProvider,
} from "@/servers/provider.server";

/** 厂商图标：使用 @lobehub/icons 自带 Avatar 配色。 */
type BrandIcon = ComponentType<{ size?: number }> & {
  Avatar: ComponentType<{ className?: string; size: number }>;
};

/** 常用厂商的品牌色图标与密钥页；顺序即厂商列表默认展示顺序，其余厂商使用 Models.dev 图标。 */
const brands: Record<string, { icon: BrandIcon; website?: string }> = {
  openai: { icon: OpenAI, website: "https://platform.openai.com/api-keys" },
  anthropic: { icon: Anthropic, website: "https://console.anthropic.com/" },
  google: { icon: Gemini, website: "https://aistudio.google.com/apikey" },
  deepseek: { icon: DeepSeek, website: "https://platform.deepseek.com/" },
  "alibaba-cn": { icon: Qwen, website: "https://bailian.console.aliyun.com/" },
  zhipuai: { icon: Zhipu, website: "https://open.bigmodel.cn/" },
  moonshotai: { icon: Moonshot, website: "https://platform.moonshot.ai/" },
  "moonshotai-cn": { icon: Moonshot, website: "https://platform.moonshot.cn/" },
  volcengine: { icon: Volcengine, website: "https://console.volcengine.com/ark" },
  minimax: { icon: Minimax, website: "https://platform.minimax.io/" },
  "minimax-cn": { icon: Minimax, website: "https://platform.minimaxi.com/" },
  stepfun: { icon: Stepfun, website: "https://platform.stepfun.com/" },
  xiaomi: { icon: XiaomiMiMo },
  "tencent-tokenhub": { icon: Hunyuan },
  modelscope: { icon: ModelScope, website: "https://modelscope.cn/my/myaccesstoken" },
  "siliconflow-cn": { icon: SiliconCloud, website: "https://cloud.siliconflow.cn/" },
  siliconflow: { icon: SiliconCloud, website: "https://cloud.siliconflow.com/" },
  openrouter: { icon: OpenRouter, website: "https://openrouter.ai/keys" },
  xai: { icon: XAI, website: "https://console.x.ai/" },
  mistral: { icon: Mistral, website: "https://console.mistral.ai/" },
  groq: { icon: Groq, website: "https://console.groq.com/keys" },
  zai: { icon: ZAI, website: "https://open.z.ai/" },
  azure: { icon: Azure, website: "https://ai.azure.com/" },
  "amazon-bedrock": { icon: Bedrock, website: "https://console.aws.amazon.com/bedrock/" },
  "google-vertex": { icon: VertexAI, website: "https://console.cloud.google.com/vertex-ai" },
  vercel: { icon: Vercel, website: "https://vercel.com/ai-gateway" },
  cohere: { icon: Cohere, website: "https://dashboard.cohere.com/" },
  deepinfra: { icon: DeepInfra, website: "https://deepinfra.com/dash" },
  togetherai: { icon: Together, website: "https://api.together.ai/" },
  "fireworks-ai": { icon: Fireworks, website: "https://fireworks.ai/" },
  cerebras: { icon: Cerebras, website: "https://cloud.cerebras.ai/" },
  perplexity: { icon: Perplexity, website: "https://www.perplexity.ai/account/api/keys" },
  huggingface: { icon: HuggingFace, website: "https://huggingface.co/settings/tokens" },
  nvidia: { icon: Nvidia, website: "https://build.nvidia.com/" },
  baseten: { icon: Baseten, website: "https://app.baseten.co/" },
  gmicloud: { icon: GmiCloud, website: "https://console.gmicloud.ai/" },
  anthropic_aws: { icon: Aws, website: "https://console.aws.amazon.com/" },
  ollama: { icon: Ollama, website: "https://ollama.com/" },
  lmstudio: { icon: LmStudio, website: "https://lmstudio.ai/" },
};
const featured = Object.keys(brands);

// 图标映射独立于首批展示顺序，加载更多和搜索结果使用同一套品牌图标。
const catalogIcons: Record<string, BrandIcon> = {
  "302ai": Ai302,
  agnes: AgnesAI,
  ai21: Ai21,
  aihubmix: AiHubMix,
  alibaba: Alibaba,
  "alibaba-coding-plan": Alibaba,
  "alibaba-coding-plan-cn": Alibaba,
  "alibaba-token-plan": Alibaba,
  "alibaba-token-plan-cn": Alibaba,
  amd: AMDRadeonCloud,
  arcee: Arcee,
  "azure-cognitive-services": Azure,
  chutes: Chutes,
  "cloudflare-ai-gateway": Cloudflare,
  "cloudflare-workers-ai": WorkersAI,
  crusoe: Crusoe,
  digitalocean: DigitalOcean,
  friendli: Friendli,
  "github-copilot": GithubCopilot,
  "google-vertex-anthropic": Anthropic,
  inception: Inception,
  "kimi-code-plan-cn": Kimi,
  "kimi-code-plan-global": Kimi,
  longcat: LongCat,
  meta: Meta,
  "minimax-coding-plan": Minimax,
  "minimax-cn-coding-plan": Minimax,
  morph: Morph,
  nebius: Nebius,
  "novita-ai": Novita,
  "ollama-cloud": Ollama,
  opencode: OpenCode,
  "opencode-go": OpenCode,
  poe: Poe,
  poolside: Poolside,
  "perplexity-agent": Perplexity,
  "qiniu-ai": Qiniu,
  sensenova: SenseNova,
  "snowflake-cortex": Snowflake,
  "stepfun-ai": Stepfun,
  "stepfun-ai-step-plan": Stepfun,
  "stepfun-step-plan": Stepfun,
  submodel: SubModel,
  "tencent-coding-plan": Tencent,
  "tencent-token-plan": Tencent,
  upstage: Upstage,
  v0: V0,
  venice: Venice,
  "volcengine-coding-plan": Volcengine,
  "wafer.ai": Wafer,
  wandb: Wandb,
  watsonx: IBM,
  "xiaomi-token-plan-cn": XiaomiMiMo,
  "xiaomi-token-plan-ams": XiaomiMiMo,
  "xiaomi-token-plan-sgp": XiaomiMiMo,
  "zai-coding-plan": ZAI,
  zenmux: ZenMux,
  "zhipuai-coding-plan": Zhipu,
};

function ProviderLogo({ id, size }: { id: string; size: number }) {
  if (id === "compatible") return <GlobeIcon size={size} className="shrink-0" />;
  const Icon = brands[id]?.icon ?? catalogIcons[id];
  if (Icon) {
    return <Icon.Avatar aria-hidden className="shrink-0" size={size} />;
  }
  return (
    // oxlint-disable-next-line next/no-img-element -- models.dev 提供的是固定远程 SVG 图标，直接渲染才能保留原始品牌配色。
    <img
      aria-hidden
      alt=""
      className="shrink-0"
      height={size}
      src={`https://models.dev/logos/${encodeURIComponent(id)}.svg`}
      width={size}
    />
  );
}

function settingText(settings: ProviderConfig["settings"] | undefined, key: string) {
  const value = settings?.[key];
  return typeof value === "string" || typeof value === "number" ? String(value) : "";
}

function settingNumber(settings: ProviderConfig["settings"] | undefined, key: string) {
  const value = settings?.[key];
  return typeof value === "number" ? String(value) : "";
}

function toNumber(value: string) {
  return value.trim() ? Number(value) : undefined;
}

function reasoningChoices(kind: ProviderKind, model: CatalogModel | undefined, current: string) {
  const options = model?.reasoningOptions ?? [];
  const efforts = options.find((option) => option.type === "effort")?.values ?? [];
  const toggle = options.some((option) => option.type === "toggle");
  const levels =
    kind === "alibaba-cn"
      ? toggle || model?.reasoning
        ? ["enabled", "none"]
        : []
      : efforts.length
        ? [...(toggle ? ["none"] : []), ...efforts]
        : toggle
          ? ["enabled", "none"]
          : model?.reasoning || (!model && (kind === "compatible" || kind === "openrouter"))
            ? ["none", "low", "medium", "high", "xhigh", "max"]
            : [];
  return [...new Set(["provider-default", ...levels, ...(current ? [current] : [])])];
}

function ProviderForm({
  vendor,
  provider,
  first,
  saving,
  error,
  onSave,
}: {
  vendor: CatalogProvider;
  provider?: ProviderConfig;
  first: boolean;
  saving: boolean;
  error?: string;
  onSave: (payload: ProviderPayload) => void;
}) {
  const t = useTranslations("settings.models");
  const kind = vendor.id;
  const catalog = useModelCatalog(kind);
  const discover = useDiscoverModels();
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
  const [model, setModel] = useState(provider?.model ?? "");
  const [modelQuery, setModelQuery] = useState("");
  const [reasoning, setReasoning] = useState(settingText(provider?.settings, "reasoning"));
  const [thinkingBudget, setThinkingBudget] = useState(
    settingNumber(provider?.settings, "thinkingBudget"),
  );
  const [temperature, setTemperature] = useState(settingNumber(provider?.settings, "temperature"));
  const [topP, setTopP] = useState(settingNumber(provider?.settings, "topP"));
  const [maxOutputTokens, setMaxOutputTokens] = useState(
    settingNumber(provider?.settings, "maxOutputTokens"),
  );
  const [presencePenalty, setPresencePenalty] = useState(
    settingNumber(provider?.settings, "presencePenalty"),
  );
  const [frequencyPenalty, setFrequencyPenalty] = useState(
    settingNumber(provider?.settings, "frequencyPenalty"),
  );
  const custom = kind === "compatible";
  const azure = vendor.npm === "@ai-sdk/azure";
  const bedrock = vendor.npm === "@ai-sdk/amazon-bedrock";
  const website = brands[kind]?.website ?? vendor.doc;
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
  const models = useMemo(() => {
    const catalogModels = catalog.data ?? [];
    if (!discover.data) return catalogModels;
    const byId = new Map(catalogModels.map((item) => [item.id.toLowerCase(), item]));
    return discover.data.map(
      (item) =>
        byId.get(item.id.toLowerCase()) ?? {
          id: item.id,
          name: item.name,
          reasoning: false,
          contextWindow: 0,
          maxOutputTokens: 0,
          input: [],
          releaseDate: "",
          reasoningOptions: [],
        },
    );
  }, [catalog.data, discover.data]);
  const selectedModel = catalog.data?.find(
    (item) => item.id.toLowerCase() === model.trim().toLowerCase(),
  );
  const shownModels = models.filter((item) =>
    `${item.name} ${item.id}`.toLowerCase().includes(modelQuery.trim().toLowerCase()),
  );
  const choices = reasoningChoices(kind, selectedModel, reasoning);
  const budget = selectedModel?.reasoningOptions.find((option) => option.type === "budget_tokens");
  const showBudget =
    reasoning !== "none" &&
    (selectedModel
      ? !!budget
      : bedrock ||
        [
          "anthropic",
          "anthropic_aws",
          "fireworks-ai",
          "google",
          "alibaba-cn",
          "google-vertex",
        ].includes(kind));

  function chooseModel(next: CatalogModel) {
    setReasoning("");
    setThinkingBudget("");
    setTemperature("");
    setTopP("");
    setMaxOutputTokens("");
    if (next.tools !== undefined) setSupportsTools(next.tools);
    if (next.structured !== undefined) setSupportsStructured(next.structured);
  }

  function discoverAccountModels(form: HTMLFormElement) {
    const data = new FormData(form);
    const value = (key: string) => String(data.get(key) ?? "").trim();
    discover.mutate({
      kind,
      providerId: provider?.id,
      apiKey: value("apiKey") || undefined,
      baseUrl: value("baseUrl") || undefined,
      protocol,
    });
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const value = (key: string) => String(data.get(key) ?? "").trim();
        onSave({
          name: value("name"),
          kind,
          model,
          apiKey:
            value("apiKey") || (provider ? undefined : kind === "ollama" ? "ollama" : undefined),
          baseUrl: value("baseUrl") || null,
          embeddingModel: value("embeddingModel") || null,
          isDefault,
          supportsTools,
          supportsStructured,
          settings: {
            ...provider?.settings,
            reasoning: reasoning || undefined,
            thinkingBudget: toNumber(thinkingBudget),
            temperature: toNumber(temperature),
            topP: toNumber(topP),
            maxOutputTokens: toNumber(maxOutputTokens),
            presencePenalty: toNumber(presencePenalty),
            frequencyPenalty: toNumber(frequencyPenalty),
            ...((custom || kind === "openai") && { protocol }),
            ...((bedrock || kind === "anthropic_aws") && { region: value("region") }),
            ...(azure && { resourceName: value("resourceName") || undefined }),
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
              {website && (
                <a
                  href={website}
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
                vendor.npm === "@ai-sdk/google-vertex"
                  ? "vertexHelp"
                  : bedrock
                    ? "bedrockHelp"
                    : "apiKeyHelp",
              )}
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
          {azure && (
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
          {(bedrock || kind === "anthropic_aws") && (
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
          <Field>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <FieldLabel htmlFor="provider-model">{t("fields.model")}</FieldLabel>
              {vendor.discoverable && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={discover.isPending}
                  onClick={(event) => {
                    const form = event.currentTarget.form;
                    if (form) discoverAccountModels(form);
                  }}
                >
                  {discover.isPending && <Loader2Icon className="animate-spin" />}
                  {t("fetchModels")}
                </Button>
              )}
            </div>
            <Autocomplete.Root
              items={models}
              filteredItems={shownModels}
              value={model}
              onValueChange={(value, details) => {
                setModel(value);
                const next =
                  details.reason === "item-press" && models.find((item) => item.id === value);
                if (next) chooseModel(next);
                else setModelQuery(value);
              }}
              onOpenChange={(open) => {
                if (open) setModelQuery("");
              }}
              itemToStringValue={(item) => item.id}
              openOnInputClick={models.length > 0}
              limit={50}
            >
              <ComboboxInput
                id="provider-model"
                required
                maxLength={191}
                placeholder={t(catalog.isLoading ? "loadingModels" : "placeholders.model")}
                showTrigger={models.length > 0}
              />
              <ComboboxContent>
                <ComboboxEmpty>{t("noModels")}</ComboboxEmpty>
                <ComboboxList>
                  {(item: CatalogModel) => (
                    <ComboboxItem key={item.id} value={item}>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate">{item.name}</span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {item.id}
                        </span>
                      </span>
                      {item.reasoning && <Badge variant="outline">{t("reasoning")}</Badge>}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Autocomplete.Root>
            <FieldDescription>
              {discover.data ? t("accountModelHelp") : t(azure ? "deploymentHelp" : "modelHelp")}
            </FieldDescription>
            {catalog.isError && <FieldError>{t("errors.catalogFailed")}</FieldError>}
            {discover.isError && <FieldError>{discover.error.message}</FieldError>}
            {selectedModel && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {selectedModel.contextWindow > 0 && (
                  <Badge variant="outline">
                    {t("contextTokens", { count: selectedModel.contextWindow })}
                  </Badge>
                )}
                {selectedModel.maxOutputTokens > 0 && (
                  <Badge variant="outline">
                    {t("outputTokens", { count: selectedModel.maxOutputTokens })}
                  </Badge>
                )}
                {selectedModel.reasoning && <Badge variant="secondary">{t("reasoning")}</Badge>}
                {selectedModel.tools && (
                  <Badge variant="outline">{t("fields.supportsTools")}</Badge>
                )}
                {selectedModel.structured && (
                  <Badge variant="outline">{t("fields.supportsStructured")}</Badge>
                )}
              </div>
            )}
          </Field>
          <Field orientation="horizontal">
            <Switch id="provider-default" checked={isDefault} onCheckedChange={setIsDefault} />
            <FieldLabel htmlFor="provider-default">{t("fields.isDefault")}</FieldLabel>
          </Field>
          <div className="rounded-lg border border-border p-4">
            <div className="mb-3">
              <p className="text-sm font-medium">{t("modelParameters")}</p>
              <p className="mt-1 text-xs text-muted-foreground">{t("modelParametersHelp")}</p>
            </div>
            <div className="grid gap-4">
              {choices.length > 1 && (
                <Field>
                  <FieldLabel>{t("fields.reasoning")}</FieldLabel>
                  <Select
                    items={choices.map((choice) => ({
                      value: choice,
                      label: t(`reasoningLevels.${choice}`),
                    }))}
                    value={reasoning || "provider-default"}
                    onValueChange={(value) =>
                      setReasoning(!value || value === "provider-default" ? "" : value)
                    }
                  >
                    <SelectTrigger aria-label={t("fields.reasoning")}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {choices.map((choice) => (
                        <SelectItem key={choice} value={choice}>
                          {t(`reasoningLevels.${choice}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
              {showBudget && (
                <Field>
                  <FieldLabel htmlFor="provider-budget">{t("fields.thinkingBudget")}</FieldLabel>
                  <Input
                    id="provider-budget"
                    type="number"
                    value={thinkingBudget}
                    onChange={(event) => setThinkingBudget(event.target.value)}
                    min={budget?.min ?? 0}
                    max={budget?.max}
                    step={1}
                    placeholder={t("providerDefault")}
                  />
                  {budget && (budget.min !== undefined || budget.max !== undefined) && (
                    <FieldDescription>
                      {t("budgetRange", { min: budget.min ?? 0, max: budget.max ?? "∞" })}
                    </FieldDescription>
                  )}
                </Field>
              )}
              {selectedModel?.temperature !== false && (
                <Field>
                  <FieldLabel htmlFor="provider-temperature">{t("fields.temperature")}</FieldLabel>
                  <Input
                    id="provider-temperature"
                    type="number"
                    value={temperature}
                    onChange={(event) => setTemperature(event.target.value)}
                    min={0}
                    max={2}
                    step="0.1"
                    placeholder={t("providerDefault")}
                  />
                </Field>
              )}
              <Field>
                <FieldLabel htmlFor="provider-output">{t("fields.maxOutputTokens")}</FieldLabel>
                <Input
                  id="provider-output"
                  type="number"
                  value={maxOutputTokens}
                  onChange={(event) => setMaxOutputTokens(event.target.value)}
                  min={1}
                  max={selectedModel?.maxOutputTokens || undefined}
                  step={1}
                  placeholder={t("providerDefault")}
                />
              </Field>
            </div>
          </div>
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
              <Field>
                <FieldLabel htmlFor="provider-top-p">{t("fields.topP")}</FieldLabel>
                <Input
                  id="provider-top-p"
                  type="number"
                  value={topP}
                  onChange={(event) => setTopP(event.target.value)}
                  min={0}
                  max={1}
                  step="0.05"
                  placeholder={t("providerDefault")}
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="provider-presence">{t("fields.presencePenalty")}</FieldLabel>
                  <Input
                    id="provider-presence"
                    type="number"
                    value={presencePenalty}
                    onChange={(event) => setPresencePenalty(event.target.value)}
                    min={-2}
                    max={2}
                    step="0.1"
                    placeholder={t("providerDefault")}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="provider-frequency">
                    {t("fields.frequencyPenalty")}
                  </FieldLabel>
                  <Input
                    id="provider-frequency"
                    type="number"
                    value={frequencyPenalty}
                    onChange={(event) => setFrequencyPenalty(event.target.value)}
                    min={-2}
                    max={2}
                    step="0.1"
                    placeholder={t("providerDefault")}
                  />
                </Field>
              </div>
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
            <Button type="submit" disabled={saving || !model.trim()}>
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
  const catalog = useProviderCatalog();
  const [editor, setEditor] = useState<{ vendor: CatalogProvider; provider?: ProviderConfig }>();
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [error, setError] = useState<string>();
  const [formError, setFormError] = useState<string>();
  const busy = create.isPending || update.isPending || remove.isPending || test.isPending;
  const configured = providers.data ?? [];
  const query = search.trim().toLowerCase();
  const rank = (id: string) => (featured.includes(id) ? featured.indexOf(id) : featured.length);
  const vendors = (catalog.data ?? [])
    .filter((vendor) => vendor.id !== "compatible")
    .sort((a, b) => rank(a.id) - rank(b.id) || a.name.localeCompare(b.name));
  const matched = query
    ? vendors.filter((vendor) => `${vendor.name} ${vendor.id}`.toLowerCase().includes(query))
    : vendors;
  const shown =
    query || showAll ? matched : matched.filter((vendor) => featured.includes(vendor.id));
  function vendorOf(kind: ProviderKind): CatalogProvider {
    return (
      catalog.data?.find((vendor) => vendor.id === kind) ?? {
        id: kind,
        name: kind,
        npm: "",
        discoverable: false,
      }
    );
  }
  function edit(vendor: CatalogProvider, provider?: ProviderConfig) {
    setFormError(undefined);
    setEditor({ vendor, provider });
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
            return (
              <div
                key={provider.id}
                className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-4"
              >
                <ProviderLogo id={provider.kind} size={28} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium">{provider.name}</span>
                    {provider.is_default && <Badge variant="secondary">{t("default")}</Badge>}
                    {!provider.is_enabled && <Badge variant="outline">{t("disabled")}</Badge>}
                  </div>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {provider.model} ·{" "}
                    {provider.kind === "compatible" ? t("custom") : vendorOf(provider.kind).name}
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
                    onClick={() => edit(vendorOf(provider.kind), provider)}
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
        {catalog.isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : catalog.isError ? (
          <Alert variant="destructive">
            <AlertDescription>{catalog.error.message}</AlertDescription>
            <Button variant="outline" onClick={() => void catalog.refetch()}>
              {t("retry")}
            </Button>
          </Alert>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {shown.map((vendor) => (
              <button
                key={vendor.id}
                type="button"
                disabled={busy || !providers.data}
                onClick={() => edit(vendor)}
                className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
              >
                <ProviderLogo id={vendor.id} size={24} />
                <span className="min-w-0 flex-1 truncate text-sm font-medium">{vendor.name}</span>
                {configured.some((provider) => provider.kind === vendor.id) && (
                  <CheckCircle2Icon className="size-3.5 shrink-0 text-muted-foreground" />
                )}
              </button>
            ))}
          </div>
        )}
        {catalog.isSuccess && shown.length === 0 && (
          <p className="py-3 text-sm text-muted-foreground">{t("noResults")}</p>
        )}
        {!query && vendors.length > shown.length && (
          <Button variant="ghost" onClick={() => setShowAll(true)}>
            {t("showAllProviders", { count: vendors.length })}
          </Button>
        )}
      </section>
      <button
        type="button"
        disabled={busy || !providers.data}
        onClick={() => edit(vendorOf("compatible"))}
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
                {editor && <ProviderLogo id={editor.vendor.id} size={24} />}
                {editor?.vendor.id === "compatible" ? t("custom") : editor?.vendor.name}
              </span>
            </DialogTitle>
            <DialogDescription>
              {editor?.provider ? t("editDescription") : t("formDescription")}
            </DialogDescription>
          </DialogHeader>
          <div className="min-h-0 overflow-y-auto px-1 py-1">
            {editor && (
              <ProviderForm
                key={editor.provider?.id ?? editor.vendor.id}
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
