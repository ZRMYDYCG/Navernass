import { $getRoot } from "lexical";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";

import { countWords } from "../serialization";
import type { EditorStatusStore } from "../status";

interface WordCountPluginProps {
  store: EditorStatusStore;
}

export function WordCountPlugin({ store }: WordCountPluginProps) {
  return (
    <OnChangePlugin
      ignoreSelectionChange
      onChange={(editorState) => {
        const text = editorState.read(() => $getRoot().getTextContent());
        store.setCount(countWords(text));
      }}
    />
  );
}
