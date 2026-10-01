import type { EditorThemeClasses } from "lexical";

export const editorTheme: EditorThemeClasses = {
  paragraph: "mb-3 min-h-8 leading-8",
  quote: "my-4 border-l-2 border-border pl-4 text-muted-foreground",
  heading: {
    h1: "mt-6 mb-4 text-3xl font-semibold leading-10",
    h2: "mt-5 mb-3 text-2xl font-semibold leading-9",
    h3: "mt-4 mb-2 text-xl font-semibold leading-8",
  },
  list: {
    nested: {
      listitem: "list-none",
    },
    ol: "my-3 ml-6 list-decimal",
    ul: "my-3 ml-6 list-disc",
    listitem: "my-1 pl-1",
  },
  text: {
    bold: "font-semibold",
    italic: "italic",
    underline: "underline underline-offset-2",
  },
};
