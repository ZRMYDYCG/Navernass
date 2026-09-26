import { FilePenLineIcon } from "lucide-react";
import { proposeEditInputSchema, proposeEditOutputSchema } from "@/schemas/agent-tool.schema";
import { EditProposalCard } from "../interactions/edit-proposal";
import { defineTool } from "./define";

export const proposeArticleEdit = defineTool({
  icon: FilePenLineIcon,
  input: proposeEditInputSchema,
  output: proposeEditOutputSchema,
  summary: (_, { input }) => input?.summary,
  Card: EditProposalCard,
});
