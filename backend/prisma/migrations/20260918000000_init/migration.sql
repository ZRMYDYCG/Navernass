-- CreateTable
CREATE TABLE `auth_users` (
    `id` VARCHAR(36) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `emailVerified` BOOLEAN NOT NULL DEFAULT false,
    `image` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `auth_users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `auth_sessions` (
    `id` VARCHAR(36) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `ipAddress` VARCHAR(191) NULL,
    `userAgent` TEXT NULL,
    `userId` VARCHAR(36) NOT NULL,

    UNIQUE INDEX `auth_sessions_token_key`(`token`),
    INDEX `auth_sessions_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `auth_accounts` (
    `id` VARCHAR(36) NOT NULL,
    `accountId` VARCHAR(191) NOT NULL,
    `providerId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(36) NOT NULL,
    `accessToken` TEXT NULL,
    `refreshToken` TEXT NULL,
    `idToken` TEXT NULL,
    `accessTokenExpiresAt` DATETIME(3) NULL,
    `refreshTokenExpiresAt` DATETIME(3) NULL,
    `scope` TEXT NULL,
    `password` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `auth_accounts_userId_idx`(`userId`),
    UNIQUE INDEX `auth_accounts_providerId_accountId_key`(`providerId`, `accountId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `auth_verifications` (
    `id` VARCHAR(36) NOT NULL,
    `identifier` VARCHAR(191) NOT NULL,
    `value` TEXT NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `auth_verifications_identifier_idx`(`identifier`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `profiles` (
    `id` VARCHAR(36) NOT NULL,
    `username` VARCHAR(64) NULL,
    `full_name` VARCHAR(191) NULL,
    `avatar_url` TEXT NULL,
    `website` TEXT NULL,
    `legacy_password_hash` TEXT NULL,
    `role` ENUM('user', 'super_admin') NOT NULL DEFAULT 'user',
    `is_protected` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `profiles_username_key`(`username`),
    INDEX `profiles_role_idx`(`role`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `novels` (
    `id` VARCHAR(36) NOT NULL,
    `user_id` VARCHAR(36) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `cover` TEXT NULL,
    `category` VARCHAR(100) NULL,
    `tags` JSON NOT NULL,
    `word_count` INTEGER NOT NULL DEFAULT 0,
    `chapter_count` INTEGER NOT NULL DEFAULT 0,
    `status` ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'draft',
    `characters` JSON NOT NULL,
    `relationships` JSON NOT NULL,
    `order_index` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `published_at` DATETIME(3) NULL,

    INDEX `novels_user_id_status_order_index_idx`(`user_id`, `status`, `order_index`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `volumes` (
    `id` VARCHAR(36) NOT NULL,
    `novel_id` VARCHAR(36) NOT NULL,
    `user_id` VARCHAR(36) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `order_index` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `volumes_novel_id_deleted_at_order_index_idx`(`novel_id`, `deleted_at`, `order_index`),
    INDEX `volumes_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `chapters` (
    `id` VARCHAR(36) NOT NULL,
    `novel_id` VARCHAR(36) NOT NULL,
    `volume_id` VARCHAR(36) NULL,
    `user_id` VARCHAR(36) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `content` LONGTEXT NOT NULL,
    `summary` TEXT NULL,
    `order_index` INTEGER NOT NULL,
    `word_count` INTEGER NOT NULL DEFAULT 0,
    `status` ENUM('draft', 'published') NOT NULL DEFAULT 'draft',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `chapters_novel_id_deleted_at_order_index_idx`(`novel_id`, `deleted_at`, `order_index`),
    INDEX `chapters_volume_id_deleted_at_order_index_idx`(`volume_id`, `deleted_at`, `order_index`),
    INDEX `chapters_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `worldbook_entries` (
    `id` VARCHAR(36) NOT NULL,
    `user_id` VARCHAR(36) NOT NULL,
    `novel_id` VARCHAR(36) NOT NULL,
    `category` ENUM('setting', 'location', 'item', 'faction', 'event', 'rule', 'character_lore', 'other') NOT NULL DEFAULT 'other',
    `title` VARCHAR(255) NOT NULL,
    `content` LONGTEXT NOT NULL,
    `keywords` JSON NOT NULL,
    `order_index` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `worldbook_entries_novel_id_deleted_at_order_index_idx`(`novel_id`, `deleted_at`, `order_index`),
    INDEX `worldbook_entries_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `outlines` (
    `id` VARCHAR(36) NOT NULL,
    `user_id` VARCHAR(36) NOT NULL,
    `novel_id` VARCHAR(36) NOT NULL,
    `volume_id` VARCHAR(36) NULL,
    `parent_id` VARCHAR(36) NULL,
    `title` VARCHAR(255) NOT NULL,
    `content` LONGTEXT NOT NULL,
    `order_index` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `outlines_novel_id_deleted_at_order_index_idx`(`novel_id`, `deleted_at`, `order_index`),
    INDEX `outlines_volume_id_deleted_at_idx`(`volume_id`, `deleted_at`),
    INDEX `outlines_parent_id_idx`(`parent_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `plan_files` (
    `id` VARCHAR(36) NOT NULL,
    `user_id` VARCHAR(36) NOT NULL,
    `novel_id` VARCHAR(36) NOT NULL,
    `path` VARCHAR(255) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `content` LONGTEXT NOT NULL,
    `order_index` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `plan_files_novel_id_deleted_at_order_index_idx`(`novel_id`, `deleted_at`, `order_index`),
    INDEX `plan_files_user_id_idx`(`user_id`),
    UNIQUE INDEX `plan_files_novel_id_path_key`(`novel_id`, `path`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `character_timeline_events` (
    `id` VARCHAR(36) NOT NULL,
    `user_id` VARCHAR(36) NOT NULL,
    `novel_id` VARCHAR(36) NOT NULL,
    `character_id` VARCHAR(36) NOT NULL,
    `chapter_id` VARCHAR(36) NULL,
    `event_type` ENUM('appearance', 'milestone', 'relation', 'conflict', 'growth', 'death', 'other') NOT NULL DEFAULT 'other',
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `timeline_position` INTEGER NOT NULL DEFAULT 0,
    `occurred_at_label` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `character_timeline_events_character_id_deleted_at_timeline_p_idx`(`character_id`, `deleted_at`, `timeline_position`),
    INDEX `character_timeline_events_novel_id_deleted_at_idx`(`novel_id`, `deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `news` (
    `id` VARCHAR(36) NOT NULL,
    `type` ENUM('feature', 'update', 'announcement', 'community') NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `content` LONGTEXT NOT NULL,
    `image` TEXT NULL,
    `link` TEXT NULL,
    `author` VARCHAR(191) NULL,
    `status` ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'published',
    `priority` INTEGER NOT NULL DEFAULT 0,
    `read_count` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `news_status_priority_created_at_idx`(`status`, `priority`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `surveys` (
    `id` VARCHAR(36) NOT NULL,
    `user_id` VARCHAR(36) NULL,
    `experience` VARCHAR(191) NOT NULL,
    `genres` JSON NOT NULL,
    `pain_points` JSON NOT NULL,
    `tools` JSON NOT NULL,
    `ai_expectations` JSON NOT NULL,
    `ai_concerns` TEXT NULL,
    `contact` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `surveys_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `writer_todos` (
    `id` VARCHAR(36) NOT NULL,
    `user_id` VARCHAR(36) NOT NULL,
    `content` TEXT NOT NULL,
    `completed` BOOLEAN NOT NULL DEFAULT false,
    `priority` ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'medium',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `writer_todos_user_id_completed_created_at_idx`(`user_id`, `completed`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `message_wall_entries` (
    `id` VARCHAR(36) NOT NULL,
    `nickname` VARCHAR(64) NULL,
    `message` VARCHAR(180) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `message_wall_entries_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `auth_sessions` ADD CONSTRAINT `auth_sessions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `auth_users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `auth_accounts` ADD CONSTRAINT `auth_accounts_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `auth_users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `profiles` ADD CONSTRAINT `profiles_id_fkey` FOREIGN KEY (`id`) REFERENCES `auth_users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `novels` ADD CONSTRAINT `novels_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `auth_users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `volumes` ADD CONSTRAINT `volumes_novel_id_fkey` FOREIGN KEY (`novel_id`) REFERENCES `novels`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chapters` ADD CONSTRAINT `chapters_novel_id_fkey` FOREIGN KEY (`novel_id`) REFERENCES `novels`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chapters` ADD CONSTRAINT `chapters_volume_id_fkey` FOREIGN KEY (`volume_id`) REFERENCES `volumes`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `worldbook_entries` ADD CONSTRAINT `worldbook_entries_novel_id_fkey` FOREIGN KEY (`novel_id`) REFERENCES `novels`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `outlines` ADD CONSTRAINT `outlines_novel_id_fkey` FOREIGN KEY (`novel_id`) REFERENCES `novels`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `outlines` ADD CONSTRAINT `outlines_volume_id_fkey` FOREIGN KEY (`volume_id`) REFERENCES `volumes`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `outlines` ADD CONSTRAINT `outlines_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `outlines`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `plan_files` ADD CONSTRAINT `plan_files_novel_id_fkey` FOREIGN KEY (`novel_id`) REFERENCES `novels`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `character_timeline_events` ADD CONSTRAINT `character_timeline_events_novel_id_fkey` FOREIGN KEY (`novel_id`) REFERENCES `novels`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `character_timeline_events` ADD CONSTRAINT `character_timeline_events_chapter_id_fkey` FOREIGN KEY (`chapter_id`) REFERENCES `chapters`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `surveys` ADD CONSTRAINT `surveys_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `auth_users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `writer_todos` ADD CONSTRAINT `writer_todos_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `auth_users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
