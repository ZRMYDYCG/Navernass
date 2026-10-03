CREATE TABLE `hook_definitions` (
  `id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `novel_id` VARCHAR(36) NULL,
  `name` VARCHAR(100) NOT NULL,
  `scope_type` ENUM('system', 'user', 'novel') NOT NULL,
  `event_name` ENUM('session_start', 'prompt_before_submit', 'tool_before_use', 'tool_after_use', 'tool_use_failed', 'content_after_edit', 'agent_before_stop', 'session_end') NOT NULL,
  `effect` ENUM('observe', 'enrich', 'guard', 'follow_up') NOT NULL,
  `handler_key` VARCHAR(100) NOT NULL,
  `matcher` JSON NOT NULL,
  `config` JSON NOT NULL,
  `priority` INTEGER NOT NULL DEFAULT 500,
  `timeout_ms` INTEGER NOT NULL DEFAULT 3000,
  `failure_mode` ENUM('open', 'closed') NOT NULL DEFAULT 'open',
  `enabled` BOOLEAN NOT NULL DEFAULT true,
  `revision` INTEGER NOT NULL DEFAULT 1,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  INDEX `hook_definitions_user_id_event_name_enabled_idx`(`user_id`, `event_name`, `enabled`),
  INDEX `hook_definitions_novel_id_event_name_enabled_idx`(`novel_id`, `event_name`, `enabled`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `hook_dispatches` (
  `id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `novel_id` VARCHAR(36) NULL,
  `run_id` VARCHAR(36) NULL,
  `trace_id` VARCHAR(64) NOT NULL,
  `event_id` VARCHAR(36) NOT NULL,
  `event_name` ENUM('session_start', 'prompt_before_submit', 'tool_before_use', 'tool_after_use', 'tool_use_failed', 'content_after_edit', 'agent_before_stop', 'session_end') NOT NULL,
  `status` ENUM('running', 'completed', 'blocked', 'partial', 'failed') NOT NULL DEFAULT 'running',
  `matched_count` INTEGER NOT NULL DEFAULT 0,
  `success_count` INTEGER NOT NULL DEFAULT 0,
  `failure_count` INTEGER NOT NULL DEFAULT 0,
  `decision` VARCHAR(16) NULL,
  `duration_ms` INTEGER NULL,
  `input_summary` JSON NOT NULL,
  `result_summary` JSON NULL,
  `started_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `finished_at` DATETIME(3) NULL,
  INDEX `hook_dispatches_user_id_started_at_idx`(`user_id`, `started_at`),
  INDEX `hook_dispatches_novel_id_started_at_idx`(`novel_id`, `started_at`),
  INDEX `hook_dispatches_trace_id_started_at_idx`(`trace_id`, `started_at`),
  INDEX `hook_dispatches_run_id_idx`(`run_id`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `hook_executions` (
  `id` VARCHAR(36) NOT NULL,
  `dispatch_id` VARCHAR(36) NOT NULL,
  `hook_definition_id` VARCHAR(36) NOT NULL,
  `hook_revision` INTEGER NOT NULL,
  `status` ENUM('running', 'succeeded', 'denied', 'timed_out', 'failed', 'invalid_output', 'skipped') NOT NULL DEFAULT 'running',
  `decision` VARCHAR(16) NULL,
  `input_redacted` JSON NOT NULL,
  `output_redacted` JSON NULL,
  `error_code` VARCHAR(100) NULL,
  `error_message` TEXT NULL,
  `duration_ms` INTEGER NULL,
  `started_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `finished_at` DATETIME(3) NULL,
  UNIQUE INDEX `hook_executions_dispatch_id_hook_definition_id_key`(`dispatch_id`, `hook_definition_id`),
  INDEX `hook_executions_hook_definition_id_started_at_idx`(`hook_definition_id`, `started_at`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `hook_definitions` ADD CONSTRAINT `hook_definitions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `auth_users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `hook_definitions` ADD CONSTRAINT `hook_definitions_novel_id_fkey` FOREIGN KEY (`novel_id`) REFERENCES `novels`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `hook_dispatches` ADD CONSTRAINT `hook_dispatches_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `auth_users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `hook_dispatches` ADD CONSTRAINT `hook_dispatches_novel_id_fkey` FOREIGN KEY (`novel_id`) REFERENCES `novels`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `hook_dispatches` ADD CONSTRAINT `hook_dispatches_run_id_fkey` FOREIGN KEY (`run_id`) REFERENCES `agent_runs`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `hook_executions` ADD CONSTRAINT `hook_executions_dispatch_id_fkey` FOREIGN KEY (`dispatch_id`) REFERENCES `hook_dispatches`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `hook_executions` ADD CONSTRAINT `hook_executions_hook_definition_id_fkey` FOREIGN KEY (`hook_definition_id`) REFERENCES `hook_definitions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
