CREATE TABLE `agent_messages` (
  `id` VARCHAR(36) NOT NULL,
  `session_id` VARCHAR(36) NOT NULL,
  `run_id` VARCHAR(36) NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `novel_id` VARCHAR(36) NOT NULL,
  `chapter_id` VARCHAR(36) NULL,
  `remote_id` VARCHAR(191) NULL,
  `role` ENUM('user', 'assistant', 'system', 'tool') NOT NULL,
  `content` LONGTEXT NOT NULL,
  `parts` JSON NOT NULL,
  `metadata` JSON NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  INDEX `agent_messages_session_id_created_at_id_idx` (`session_id`, `created_at`, `id`),
  INDEX `agent_messages_user_id_novel_id_created_at_idx` (`user_id`, `novel_id`, `created_at`),
  INDEX `agent_messages_run_id_idx` (`run_id`),
  INDEX `agent_messages_remote_id_idx` (`remote_id`),
  PRIMARY KEY (`id`),
  CONSTRAINT `agent_messages_session_id_fkey` FOREIGN KEY (`session_id`) REFERENCES `agent_sessions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `agent_messages_run_id_fkey` FOREIGN KEY (`run_id`) REFERENCES `agent_runs` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `agent_messages_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `auth_users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `agent_messages_novel_id_fkey` FOREIGN KEY (`novel_id`) REFERENCES `novels` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 把已有 Agent Run 回填成基础聊天记录，避免升级后历史执行不可见。
INSERT INTO `agent_messages`
  (`id`, `session_id`, `run_id`, `user_id`, `novel_id`, `chapter_id`, `role`, `content`, `parts`, `metadata`, `created_at`)
SELECT
  UUID(), `session_id`, `id`, `user_id`, `novel_id`, `chapter_id`, 'user', `prompt`,
  JSON_ARRAY(JSON_OBJECT('type', 'text', 'text', `prompt`)),
  JSON_OBJECT('migratedFromRun', TRUE), `created_at`
FROM `agent_runs`
WHERE `session_id` IS NOT NULL;

INSERT INTO `agent_messages`
  (`id`, `session_id`, `run_id`, `user_id`, `novel_id`, `chapter_id`, `role`, `content`, `parts`, `metadata`, `created_at`)
SELECT
  UUID(), `session_id`, `id`, `user_id`, `novel_id`, `chapter_id`, 'assistant', `output`,
  JSON_ARRAY(JSON_OBJECT('type', 'text', 'text', `output`)),
  JSON_OBJECT('migratedFromRun', TRUE), COALESCE(`completed_at`, `created_at`)
FROM `agent_runs`
WHERE `session_id` IS NOT NULL AND `output` IS NOT NULL;
