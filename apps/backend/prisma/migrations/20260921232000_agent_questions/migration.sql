ALTER TABLE `agent_runs`
  MODIFY COLUMN `status` ENUM('queued', 'running', 'waiting_input', 'completed', 'failed', 'cancelled') NOT NULL DEFAULT 'queued';

CREATE TABLE `agent_questions` (
  `id` VARCHAR(36) NOT NULL,
  `session_id` VARCHAR(36) NOT NULL,
  `run_id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `novel_id` VARCHAR(36) NOT NULL,
  `chapter_id` VARCHAR(36) NULL,
  `tool_call_id` VARCHAR(191) NOT NULL,
  `status` ENUM('pending', 'processing', 'answered', 'dismissed', 'expired') NOT NULL DEFAULT 'pending',
  `question` JSON NOT NULL,
  `answer` JSON NULL,
  `model_messages` JSON NULL,
  `resume_config` JSON NOT NULL,
  `instructions` LONGTEXT NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  `answered_at` DATETIME(3) NULL,

  UNIQUE INDEX `agent_questions_run_id_tool_call_id_key` (`run_id`, `tool_call_id`),
  INDEX `agent_questions_user_id_session_id_status_created_at_idx` (`user_id`, `session_id`, `status`, `created_at`),
  INDEX `agent_questions_run_id_status_idx` (`run_id`, `status`),
  PRIMARY KEY (`id`),
  CONSTRAINT `agent_questions_session_id_fkey` FOREIGN KEY (`session_id`) REFERENCES `agent_sessions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `agent_questions_run_id_fkey` FOREIGN KEY (`run_id`) REFERENCES `agent_runs` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `agent_questions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `auth_users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `agent_questions_novel_id_fkey` FOREIGN KEY (`novel_id`) REFERENCES `novels` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
