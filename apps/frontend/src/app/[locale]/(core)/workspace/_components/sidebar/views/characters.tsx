"use client";

import { ChevronRightIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type {
  CharacterProfile,
  CharacterRelationship,
  RelationshipKind,
} from "@/lib/http/modules/library.schema";
import { useCharacters, useRelationships } from "@/servers/library.server";

/** 某个角色与另一角色的关系，文案取自该角色视角的方向标签。 */
interface RelatedRelationship {
  id: string;
  other: string;
  label: string;
  kind: RelationshipKind;
}

function toRelated(
  character: CharacterProfile,
  characters: CharacterProfile[],
  relationships: CharacterRelationship[],
): RelatedRelationship[] {
  const names = new Map(characters.map((item) => [item.id, item.name]));
  return relationships.flatMap((item) => {
    if (item.sourceId !== character.id && item.targetId !== character.id) return [];
    const isSource = item.sourceId === character.id;
    const other = names.get(isSource ? item.targetId : item.sourceId);
    if (!other) return [];
    return [
      {
        id: item.id,
        other,
        label: isSource ? item.sourceToTargetLabel : item.targetToSourceLabel,
        kind: item.kind,
      },
    ];
  });
}

function CharacterItem({
  character,
  related,
}: {
  character: CharacterProfile;
  related: RelatedRelationship[];
}) {
  const t = useTranslations("relationshipGraph.library");
  const kinds = useTranslations("relationshipGraph.kinds");
  const [expanded, setExpanded] = useState(false);

  return (
    <Collapsible open={expanded} onOpenChange={setExpanded}>
      <CollapsibleTrigger className="group/trigger flex w-full min-w-0">
        <span className="flex w-full min-w-0 items-center gap-1.5 rounded-md px-2 py-1.5 text-sm transition-colors group-hover/trigger:bg-accent group-data-panel-open/trigger:bg-accent">
          <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-data-panel-open/trigger:rotate-90" />
          <Avatar size="sm">
            {character.avatar ? <AvatarImage src={character.avatar} alt={character.name} /> : null}
            <AvatarFallback>{character.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="max-w-1/2 shrink-0 truncate text-start font-medium">
            {character.name}
          </span>
          {character.description ? (
            <span className="min-w-0 flex-1 truncate text-start text-xs font-normal text-muted-foreground">
              {character.description}
            </span>
          ) : null}
        </span>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="flex flex-col gap-2 py-1 pr-2 pl-7.5">
          {character.description ? (
            <p className="text-xs leading-relaxed text-muted-foreground">{character.description}</p>
          ) : null}
          <div className="flex flex-col gap-1">
            <p className="text-xs font-medium text-muted-foreground">{t("relationships")}</p>
            {related.length ? (
              related.map((item) => (
                <div key={item.id} className="flex items-center gap-1.5 text-xs">
                  <span className="min-w-0 max-w-1/2 truncate font-medium">{item.other}</span>
                  <span className="min-w-0 flex-1 truncate text-muted-foreground">
                    {item.label}
                  </span>
                  <span className="shrink-0 text-muted-foreground">{kinds(item.kind)}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground">{t("noRelationships")}</p>
            )}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

/** 「角色」视图：角色列表，点击展开人物详情与关系。 */
export function Characters({ novelId }: { novelId: string }) {
  const t = useTranslations("relationshipGraph.library");
  const { data: characters, isPending } = useCharacters(novelId);
  const { data: relationships } = useRelationships(novelId);

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <ul className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto p-2">
        {characters.map((character) => (
          <li key={character.id}>
            <CharacterItem
              character={character}
              related={toRelated(character, characters, relationships)}
            />
          </li>
        ))}
        {characters.length === 0 ? (
          <li className="px-3 py-6 text-center text-xs text-muted-foreground">
            {isPending ? t("loading") : t("empty")}
          </li>
        ) : null}
      </ul>
    </div>
  );
}
