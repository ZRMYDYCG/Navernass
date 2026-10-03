ALTER TABLE `agent_sessions` ADD COLUMN `pinned` BOOLEAN NOT NULL DEFAULT false;
CREATE INDEX `agent_sessions_user_id_pinned_updated_at_idx` ON `agent_sessions`(`user_id`, `pinned`, `updated_at`);
DROP INDEX `agent_sessions_user_id_updated_at_idx` ON `agent_sessions`;
