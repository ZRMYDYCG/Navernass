ALTER TABLE `agent_runs`
  ADD COLUMN `client_request_id` VARCHAR(36) NULL,
  ADD COLUMN `request_snapshot` JSON NULL,
  ADD COLUMN `retry_of_id` VARCHAR(36) NULL;

CREATE UNIQUE INDEX `agent_runs_user_id_client_request_id_key`
  ON `agent_runs` (`user_id`, `client_request_id`);
CREATE INDEX `agent_runs_retry_of_id_idx` ON `agent_runs` (`retry_of_id`);

ALTER TABLE `agent_runs`
  ADD CONSTRAINT `agent_runs_retry_of_id_fkey`
  FOREIGN KEY (`retry_of_id`) REFERENCES `agent_runs` (`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE `agent_stream_events` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `run_id` VARCHAR(36) NOT NULL,
  `sequence` INTEGER NOT NULL,
  `chunk` JSON NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  UNIQUE INDEX `agent_stream_events_run_id_sequence_key` (`run_id`, `sequence`),
  INDEX `agent_stream_events_run_id_created_at_idx` (`run_id`, `created_at`),
  PRIMARY KEY (`id`),
  CONSTRAINT `agent_stream_events_run_id_fkey`
    FOREIGN KEY (`run_id`) REFERENCES `agent_runs` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
