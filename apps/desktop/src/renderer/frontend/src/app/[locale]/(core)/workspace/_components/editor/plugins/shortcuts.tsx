import { COMMAND_PRIORITY_NORMAL, KEY_MODIFIER_COMMAND } from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect } from "react";

interface ShortcutsPluginProps {
  onSave: () => void;
}

export function ShortcutsPlugin({ onSave }: ShortcutsPluginProps) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      KEY_MODIFIER_COMMAND,
      (event: KeyboardEvent) => {
        if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
          event.preventDefault();
          onSave();
          return true;
        }

        return false;
      },
      COMMAND_PRIORITY_NORMAL,
    );
  }, [editor, onSave]);

  return null;
}
