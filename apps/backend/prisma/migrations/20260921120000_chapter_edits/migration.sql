ALTER TABLE `chapters`
  ADD COLUMN `revision` INTEGER NOT NULL DEFAULT 1;

CREATE TABLE `chapter_edits` (
  `id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `novel_id` VARCHAR(36) NOT NULL,
  `chapter_id` VARCHAR(36) NOT NULL,
  `run_id` VARCHAR(36) NULL,
  `status` ENUM('pending', 'applied', 'rejected', 'stale') NOT NULL DEFAULT 'pending',
  `summary` VARCHAR(500) NOT NULL,
  `base_revision` INTEGER NOT NULL,
  `base_hash` CHAR(64) NOT NULL,
  `result_hash` CHAR(64) NOT NULL,
  `operations` JSON NOT NULL,
  `original_content` LONGTEXT NOT NULL,
  `proposed_content` LONGTEXT NOT NULL,
  `accepted_edits` JSON NULL,
  `rejection_reason` VARCHAR(500) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  `applied_at` DATETIME(3) NULL,
  `rejected_at` DATETIME(3) NULL,
  INDEX `chapter_edits_user_id_chapter_id_status_created_at_idx` (`user_id`, `chapter_id`, `status`, `created_at`),
  INDEX `chapter_edits_run_id_idx` (`run_id`),
  PRIMARY KEY (`id`),
  CONSTRAINT `chapter_edits_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `auth_users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chapter_edits_novel_id_fkey` FOREIGN KEY (`novel_id`) REFERENCES `novels` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chapter_edits_chapter_id_fkey` FOREIGN KEY (`chapter_id`) REFERENCES `chapters` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chapter_edits_run_id_fkey` FOREIGN KEY (`run_id`) REFERENCES `agent_runs` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `chapter_revisions` (
  `id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `novel_id` VARCHAR(36) NOT NULL,
  `chapter_id` VARCHAR(36) NOT NULL,
  `edit_id` VARCHAR(36) NULL,
  `revision` INTEGER NOT NULL,
  `content` LONGTEXT NOT NULL,
  `content_hash` CHAR(64) NOT NULL,
  `word_count` INTEGER NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE INDEX `chapter_revisions_chapter_id_revision_key` (`chapter_id`, `revision`),
  INDEX `chapter_revisions_user_id_chapter_id_created_at_idx` (`user_id`, `chapter_id`, `created_at`),
  INDEX `chapter_revisions_edit_id_idx` (`edit_id`),
  PRIMARY KEY (`id`),
  CONSTRAINT `chapter_revisions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `auth_users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chapter_revisions_novel_id_fkey` FOREIGN KEY (`novel_id`) REFERENCES `novels` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chapter_revisions_chapter_id_fkey` FOREIGN KEY (`chapter_id`) REFERENCES `chapters` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
