ALTER TABLE `agent_runs`
  ADD COLUMN `error_details` JSON NULL,
  ADD COLUMN `retry_count` INTEGER NOT NULL DEFAULT 0;

ALTER TABLE `agent_tool_calls`
  ADD COLUMN `attempt_count` INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN `retry_log` JSON NULL;
