CREATE TABLE `a2a_tasks` (
  `id` VARCHAR(191) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `context_id` VARCHAR(191) NOT NULL,
  `state` VARCHAR(64) NOT NULL,
  `payload` JSON NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,

  INDEX `a2a_tasks_user_id_updated_at_id_idx` (`user_id`, `updated_at`, `id`),
  INDEX `a2a_tasks_user_id_context_id_updated_at_idx` (`user_id`, `context_id`, `updated_at`),
  INDEX `a2a_tasks_user_id_state_updated_at_idx` (`user_id`, `state`, `updated_at`),
  PRIMARY KEY (`id`),
  CONSTRAINT `a2a_tasks_user_id_fkey`
    FOREIGN KEY (`user_id`) REFERENCES `auth_users` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
