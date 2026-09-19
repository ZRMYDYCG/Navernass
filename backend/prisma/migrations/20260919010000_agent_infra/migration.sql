-- CreateTable
CREATE TABLE `ai_provider_configs` (
  `id` VARCHAR(36) NOT NULL, `user_id` VARCHAR(36) NOT NULL, `name` VARCHAR(100) NOT NULL,
  `kind` ENUM('openai', 'anthropic', 'google', 'deepseek', 'qwen', 'glm', 'compatible') NOT NULL,
  `base_url` VARCHAR(500) NULL, `api_key_cipher` LONGTEXT NOT NULL, `model` VARCHAR(191) NOT NULL,
  `embedding_model` VARCHAR(191) NULL, `supports_tools` BOOLEAN NOT NULL DEFAULT true,
  `supports_structured` BOOLEAN NOT NULL DEFAULT true, `is_default` BOOLEAN NOT NULL DEFAULT false,
  `is_enabled` BOOLEAN NOT NULL DEFAULT true, `settings` JSON NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), `updated_at` DATETIME(3) NOT NULL,
  INDEX `ai_provider_configs_user_id_is_default_is_enabled_idx`(`user_id`, `is_default`, `is_enabled`),
  UNIQUE INDEX `ai_provider_configs_user_id_name_key`(`user_id`, `name`), PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `agent_sessions` (
  `id` VARCHAR(36) NOT NULL, `user_id` VARCHAR(36) NOT NULL, `novel_id` VARCHAR(36) NOT NULL,
  `chapter_id` VARCHAR(36) NULL, `provider_id` VARCHAR(36) NOT NULL, `title` VARCHAR(255) NULL,
  `context` JSON NOT NULL, `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL, INDEX `agent_sessions_user_id_updated_at_idx`(`user_id`, `updated_at`),
  INDEX `agent_sessions_novel_id_chapter_id_idx`(`novel_id`, `chapter_id`), PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `agent_runs` (
  `id` VARCHAR(36) NOT NULL, `session_id` VARCHAR(36) NULL, `user_id` VARCHAR(36) NOT NULL,
  `novel_id` VARCHAR(36) NOT NULL, `chapter_id` VARCHAR(36) NULL, `provider_id` VARCHAR(36) NOT NULL,
  `role` ENUM('main', 'character', 'plot', 'world', 'style', 'reviewer') NOT NULL DEFAULT 'main',
  `status` ENUM('queued', 'running', 'completed', 'failed', 'cancelled') NOT NULL DEFAULT 'queued',
  `prompt` LONGTEXT NOT NULL, `output` LONGTEXT NULL, `context_snapshot` JSON NOT NULL,
  `input_tokens` INTEGER NOT NULL DEFAULT 0, `output_tokens` INTEGER NOT NULL DEFAULT 0,
  `total_tokens` INTEGER NOT NULL DEFAULT 0, `finish_reason` VARCHAR(100) NULL,
  `error_code` VARCHAR(100) NULL, `error_message` TEXT NULL, `latency_ms` INTEGER NULL,
  `started_at` DATETIME(3) NULL, `completed_at` DATETIME(3) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `agent_runs_user_id_created_at_idx`(`user_id`, `created_at`),
  INDEX `agent_runs_novel_id_chapter_id_created_at_idx`(`novel_id`, `chapter_id`, `created_at`),
  INDEX `agent_runs_session_id_created_at_idx`(`session_id`, `created_at`),
  INDEX `agent_runs_status_created_at_idx`(`status`, `created_at`), PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `agent_steps` (
  `id` VARCHAR(36) NOT NULL, `run_id` VARCHAR(36) NOT NULL, `step_index` INTEGER NOT NULL,
  `role` ENUM('main', 'character', 'plot', 'world', 'style', 'reviewer') NOT NULL,
  `finish_reason` VARCHAR(100) NULL, `input_tokens` INTEGER NOT NULL DEFAULT 0,
  `output_tokens` INTEGER NOT NULL DEFAULT 0, `tool_call_count` INTEGER NOT NULL DEFAULT 0,
  `metadata` JSON NOT NULL, `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE INDEX `agent_steps_run_id_step_index_key`(`run_id`, `step_index`), PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `agent_tool_calls` (
  `id` VARCHAR(36) NOT NULL, `run_id` VARCHAR(36) NOT NULL, `step_id` VARCHAR(36) NULL,
  `tool_call_id` VARCHAR(191) NOT NULL, `tool_name` VARCHAR(100) NOT NULL, `input` JSON NOT NULL,
  `output` JSON NULL, `status` VARCHAR(32) NOT NULL, `duration_ms` INTEGER NULL,
  `error_message` TEXT NULL, `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `agent_tool_calls_run_id_tool_name_idx`(`run_id`, `tool_name`),
  UNIQUE INDEX `agent_tool_calls_run_id_tool_call_id_key`(`run_id`, `tool_call_id`), PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `semantic_memories` (
  `id` VARCHAR(36) NOT NULL, `user_id` VARCHAR(36) NOT NULL, `novel_id` VARCHAR(36) NOT NULL,
  `chapter_id` VARCHAR(36) NULL, `source_id` VARCHAR(36) NULL, `vector_id` VARCHAR(36) NOT NULL,
  `kind` ENUM('chapter', 'character', 'worldbook', 'outline', 'timeline', 'summary', 'conversation', 'custom') NOT NULL,
  `title` VARCHAR(255) NULL, `content` LONGTEXT NOT NULL, `content_hash` CHAR(64) NOT NULL,
  `metadata` JSON NOT NULL, `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL, UNIQUE INDEX `semantic_memories_vector_id_key`(`vector_id`),
  INDEX `semantic_memories_user_id_novel_id_kind_idx`(`user_id`, `novel_id`, `kind`),
  INDEX `semantic_memories_chapter_id_idx`(`chapter_id`),
  UNIQUE INDEX `semantic_memories_novel_id_kind_source_id_key`(`novel_id`, `kind`, `source_id`), PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `ai_provider_configs` ADD CONSTRAINT `ai_provider_configs_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `auth_users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `agent_sessions` ADD CONSTRAINT `agent_sessions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `auth_users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `agent_sessions` ADD CONSTRAINT `agent_sessions_novel_id_fkey` FOREIGN KEY (`novel_id`) REFERENCES `novels`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `agent_sessions` ADD CONSTRAINT `agent_sessions_provider_id_fkey` FOREIGN KEY (`provider_id`) REFERENCES `ai_provider_configs`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `agent_runs` ADD CONSTRAINT `agent_runs_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `auth_users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `agent_runs` ADD CONSTRAINT `agent_runs_novel_id_fkey` FOREIGN KEY (`novel_id`) REFERENCES `novels`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `agent_runs` ADD CONSTRAINT `agent_runs_provider_id_fkey` FOREIGN KEY (`provider_id`) REFERENCES `ai_provider_configs`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `agent_runs` ADD CONSTRAINT `agent_runs_session_id_fkey` FOREIGN KEY (`session_id`) REFERENCES `agent_sessions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `agent_steps` ADD CONSTRAINT `agent_steps_run_id_fkey` FOREIGN KEY (`run_id`) REFERENCES `agent_runs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `agent_tool_calls` ADD CONSTRAINT `agent_tool_calls_run_id_fkey` FOREIGN KEY (`run_id`) REFERENCES `agent_runs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `agent_tool_calls` ADD CONSTRAINT `agent_tool_calls_step_id_fkey` FOREIGN KEY (`step_id`) REFERENCES `agent_steps`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `semantic_memories` ADD CONSTRAINT `semantic_memories_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `auth_users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `semantic_memories` ADD CONSTRAINT `semantic_memories_novel_id_fkey` FOREIGN KEY (`novel_id`) REFERENCES `novels`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
