ALTER TABLE `agent_runs`
  ADD COLUMN `skill_ids` JSON NULL,
  ADD COLUMN `skill_snapshot` JSON NULL;

CREATE TABLE `skill_defs` (
  `id` VARCHAR(64) NOT NULL,
  `slug` VARCHAR(64) NOT NULL,
  `owner_id` VARCHAR(36) NULL,
  `display_name` VARCHAR(100) NOT NULL,
  `description` VARCHAR(1024) NOT NULL,
  `category` VARCHAR(64) NOT NULL DEFAULT 'writing-style',
  `source` ENUM('builtin', 'community', 'custom') NOT NULL DEFAULT 'custom',
  `license` VARCHAR(32) NOT NULL DEFAULT 'user',
  `skill_md` LONGTEXT NOT NULL,
  `manifest` JSON NOT NULL,
  `version` VARCHAR(32) NOT NULL DEFAULT '1.0.0',
  `checksum` CHAR(64) NOT NULL,
  `is_builtin` BOOLEAN NOT NULL DEFAULT FALSE,
  `status` ENUM('draft', 'published', 'disabled') NOT NULL DEFAULT 'draft',
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `skill_defs_owner_id_slug_key` (`owner_id`, `slug`),
  INDEX `skill_defs_source_status_is_builtin_idx` (`source`, `status`, `is_builtin`),
  CONSTRAINT `skill_defs_owner_id_fkey` FOREIGN KEY (`owner_id`) REFERENCES `auth_users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `skill_installs` (
  `id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `skill_id` VARCHAR(64) NOT NULL,
  `enabled` BOOLEAN NOT NULL DEFAULT TRUE,
  `config` JSON NOT NULL,
  `installed_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `skill_installs_user_id_skill_id_key` (`user_id`, `skill_id`),
  INDEX `skill_installs_user_id_enabled_idx` (`user_id`, `enabled`),
  CONSTRAINT `skill_installs_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `auth_users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `skill_installs_skill_id_fkey` FOREIGN KEY (`skill_id`) REFERENCES `skill_defs` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `novel_skills` (
  `id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `novel_id` VARCHAR(36) NOT NULL,
  `skill_id` VARCHAR(64) NOT NULL,
  `enabled` BOOLEAN NOT NULL DEFAULT TRUE,
  `priority` INTEGER NOT NULL DEFAULT 0,
  `config` JSON NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `novel_skills_novel_id_skill_id_key` (`novel_id`, `skill_id`),
  INDEX `novel_skills_user_id_novel_id_enabled_priority_idx` (`user_id`, `novel_id`, `enabled`, `priority`),
  CONSTRAINT `novel_skills_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `auth_users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `novel_skills_novel_id_fkey` FOREIGN KEY (`novel_id`) REFERENCES `novels` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `novel_skills_skill_id_fkey` FOREIGN KEY (`skill_id`) REFERENCES `skill_defs` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
