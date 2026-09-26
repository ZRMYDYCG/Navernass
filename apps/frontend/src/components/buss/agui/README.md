# AGUI

Public entry: `index.ts`. Chat consumes `AssistantParts` and `AgentConnecting`; the question composer shares `OptionBadge`.

- `message/`: assistant part ordering, grouping and Markdown rendering.
- `activity/`: shared tool rows, details, reasoning and elapsed-time presentation.
- `tools/`: AI SDK state conversion, typed tool definitions and registry. Each definition owns its input/output schemas and result presentation.
- `interactions/`: stateful result actions, such as reviewing and applying an edit proposal.
- `shared/`: controls shared with the question composer.

Tool rows retain their identity when results arrive. Interactive results render below the same row, not as a replacement segment. Reasoning opened during generation stays open on completion; saved reasoning starts collapsed. Users can expand/collapse with the keyboard. Internal reasoning scrolling follows output only while the reader stays at its bottom.

`metadata.toolTimings[toolCallId]` carries backend start time and final duration in milliseconds. Execution includes retries and excludes trace persistence. Final values are saved with the assistant message. Running values are explicitly approximate; old histories without timings show no invented duration. Tools of the same type have independent clocks. The backend also retains failure durations in tool traces; only successfully persisted assistant messages can restore their timing metadata through message history.

To add a tool, define its renderer under `tools/` and register it in `tools/registry.ts`. Unknown tools use the JSON fallback. All visible copy lives under `agui` in both locale files.
