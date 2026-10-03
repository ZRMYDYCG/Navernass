"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeftIcon,
  GripVerticalIcon,
  MoreHorizontalIcon,
  SearchIcon,
  SidebarCloseIcon,
} from "lucide-react";
import { Streamdown } from "streamdown";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCreateCustomSkill, useUpdateCustomSkill } from "@/servers/skill.server";

import type { SkillEditorState } from "./customize";

interface SkillEditorProps {
  state: SkillEditorState;
  onChange: (state: SkillEditorState) => void;
  onBack?: () => void;
  onClose?: () => void;
}

export function SkillEditor({ state, onChange, onBack, onClose }: SkillEditorProps) {
  const createSkill = useCreateCustomSkill();
  const updateSkill = useUpdateCustomSkill();
  const [source, setSource] = useState(state.skillMd);
  const [mode, setMode] = useState<"preview" | "source">("preview");
  const parsed = useMemo(() => parseSkill(source), [source]);
  const saving = createSkill.isPending || updateSkill.isPending;

  const save = async () => {
    if (state.readonly) return;
    const payload = { skillMd: source, enabled: state.enabled };
    if (state.id) {
      const skill = await updateSkill.mutateAsync({ id: state.id, payload });
      onChange({
        ...state,
        ...payload,
        title: skill.displayName,
        description: skill.description,
      });
      return;
    }

    const skill = await createSkill.mutateAsync(payload);
    onChange({
      id: skill.id,
      title: skill.displayName,
      description: skill.description,
      skillMd: skill.skillMd,
      enabled: skill.enabled,
      readonly: false,
    });
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <header className="flex h-11 shrink-0 items-center gap-2 border-b border-border px-3">
        {onBack ? (
          <Button type="button" variant="ghost" size="icon-sm" aria-label="Back" onClick={onBack}>
            <ArrowLeftIcon />
          </Button>
        ) : null}
        <div className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
          skills › {parsed.name || state.title} › SKILL.md
        </div>
        <ModeSwitch mode={mode} onModeChange={setMode} />
        {!state.readonly ? (
          <Button type="button" size="sm" disabled={saving} onClick={save}>
            {saving ? "Saving" : "Save"}
          </Button>
        ) : null}
        <Button type="button" variant="ghost" size="icon-sm" aria-label="More">
          <MoreHorizontalIcon />
        </Button>
        <Button type="button" variant="ghost" size="icon-sm" aria-label="Search">
          <SearchIcon />
        </Button>
        {onClose ? (
          <Button type="button" variant="ghost" size="icon-sm" aria-label="Close" onClick={onClose}>
            <SidebarCloseIcon />
          </Button>
        ) : null}
      </header>
      {mode === "preview" ? (
        <div className="min-h-0 flex-1">
          <ScrollArea className="h-full">
            <div className="px-6 py-6">
              <Properties parsed={parsed} />
              <article className="mt-10 max-w-none text-foreground">
                <Streamdown>{parsed.body}</Streamdown>
              </article>
            </div>
          </ScrollArea>
        </div>
      ) : (
        <textarea
          value={source}
          readOnly={state.readonly}
          onChange={(event) => setSource(event.target.value)}
          className="min-h-0 flex-1 resize-none bg-background p-6 font-mono text-sm leading-6 outline-none"
        />
      )}
    </div>
  );
}

function ModeSwitch({
  mode,
  onModeChange,
}: {
  mode: "preview" | "source";
  onModeChange: (mode: "preview" | "source") => void;
}) {
  return (
    <div className="flex h-8 items-center gap-1 rounded-md bg-muted p-1">
      {(["preview", "source"] as const).map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => onModeChange(item)}
          className={[
            "h-6 rounded-sm px-2 text-sm capitalize",
            mode === item ? "bg-background text-foreground" : "text-muted-foreground",
          ].join(" ")}
        >
          {item}
        </button>
      ))}
    </div>
  );
}

interface ParsedSkill {
  name: string;
  description: string;
  summary: string;
  metadata: string;
  retrieval: string;
  body: string;
}

function Properties({ parsed }: { parsed: ParsedSkill }) {
  const rows = [
    ["name", parsed.name],
    ["description", parsed.description],
    ["summary", parsed.summary],
    ["metadata", parsed.metadata],
    ["retrieval", parsed.retrieval],
  ].filter((row): row is [string, string] => Boolean(row[1]));

  return (
    <section>
      <h2 className="mb-5 text-sm text-muted-foreground">Properties</h2>
      <div className="space-y-5">
        {rows.map(([name, value]) => (
          <div key={name} className="grid grid-cols-3 gap-6 text-sm leading-7">
            <div className="flex items-start gap-3 text-muted-foreground">
              <GripVerticalIcon className="mt-1 size-4" />
              <span>{name}</span>
            </div>
            <p className="col-span-2 min-w-0 whitespace-pre-wrap text-foreground">{value}</p>
          </div>
        ))}
      </div>
      <button type="button" className="mt-6 text-sm text-muted-foreground hover:text-foreground">
        + Add property
      </button>
    </section>
  );
}

function parseSkill(source: string): ParsedSkill {
  const match = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/u.exec(source);
  if (!match) {
    return {
      name: "",
      description: "",
      summary: "",
      metadata: "",
      retrieval: "",
      body: source,
    };
  }

  const frontmatter = match[1] ?? "";
  return {
    name: frontmatterValue(frontmatter, "name"),
    description: frontmatterValue(frontmatter, "description"),
    summary: frontmatterValue(frontmatter, "summary"),
    metadata: objectBlock(frontmatter, "metadata"),
    retrieval: objectBlock(frontmatter, "retrieval"),
    body: match[2] ?? "",
  };
}

function frontmatterValue(frontmatter: string, key: string) {
  const match = new RegExp(`^${key}:\\s*(.*)$`, "mu").exec(frontmatter);
  return match?.[1]?.replace(/^["']|["']$/gu, "").trim() ?? "";
}

function objectBlock(frontmatter: string, key: string) {
  const lines = frontmatter.split("\n");
  const start = lines.findIndex((line) => line.startsWith(`${key}:`));
  if (start < 0) return "";
  const first = lines[start]?.replace(`${key}:`, "").trim();
  if (first) return first;
  const block: string[] = [];
  for (const line of lines.slice(start + 1)) {
    if (/^\S/u.test(line)) break;
    block.push(line.trim());
  }
  return block.join(" ");
}
