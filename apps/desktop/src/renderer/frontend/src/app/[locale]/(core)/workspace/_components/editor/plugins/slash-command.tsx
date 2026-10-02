import { $createHeadingNode, $createQuoteNode } from "@lexical/rich-text";
import {
  $createParagraphNode,
  $createTextNode,
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  KEY_DOWN_COMMAND,
} from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect } from "react";

import { $createSceneBreakNode } from "../nodes/scene-break";

export function SlashCommandPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      KEY_DOWN_COMMAND,
      (event: KeyboardEvent) => {
        if (event.key !== "Enter") return false;

        let command: string | null = null;
        editor.getEditorState().read(() => {
          const selection = $getSelection();
          if (!$isRangeSelection(selection) || !selection.isCollapsed()) return;

          const block = selection.anchor.getNode().getTopLevelElementOrThrow();
          const text = block.getTextContent().trim();
          command =
            text === "/h1" || text === "/h2" || text === "/quote" || text === "/scene"
              ? text
              : null;
        });

        if (!command) return false;

        event.preventDefault();
        editor.update(() => {
          const selection = $getSelection();
          if (!$isRangeSelection(selection)) return;

          const block = selection.anchor.getNode().getTopLevelElementOrThrow();
          const nextParagraph = $createParagraphNode();

          if (command === "/h1" || command === "/h2") {
            const heading = $createHeadingNode(command === "/h1" ? "h1" : "h2");
            heading.append($createTextNode(""));
            block.replace(heading);
            heading.selectStart();
          } else if (command === "/quote") {
            const quote = $createQuoteNode();
            quote.append($createTextNode(""));
            block.replace(quote);
            quote.selectStart();
          } else {
            const sceneBreak = $createSceneBreakNode();
            block.replace(sceneBreak);
            sceneBreak.insertAfter(nextParagraph);
            nextParagraph.selectStart();
          }
        });

        return true;
      },
      COMMAND_PRIORITY_LOW,
    );
  }, [editor]);

  return null;
}
