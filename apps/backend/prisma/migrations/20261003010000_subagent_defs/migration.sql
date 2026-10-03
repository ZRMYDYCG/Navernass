-- CreateTable
CREATE TABLE `subagent_defs` (
    `id` VARCHAR(36) NOT NULL,
    `user_id` VARCHAR(36) NOT NULL,
    `name` VARCHAR(64) NOT NULL,
    `description` VARCHAR(1024) NOT NULL,
    `instructions` LONGTEXT NOT NULL,
    `provider_id` VARCHAR(36) NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `subagent_defs_provider_id_idx`(`provider_id`),
    UNIQUE INDEX `subagent_defs_user_id_name_key`(`user_id`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `subagent_defs` ADD CONSTRAINT `subagent_defs_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `auth_users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subagent_defs` ADD CONSTRAINT `subagent_defs_provider_id_fkey` FOREIGN KEY (`provider_id`) REFERENCES `ai_provider_configs`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

