DROP TABLE IF EXISTS `agent_questions`;

UPDATE `agent_runs` SET `status` = 'cancelled' WHERE `status` = 'waiting_input';

ALTER TABLE `agent_runs`
  MODIFY COLUMN `status` ENUM('queued', 'running', 'completed', 'failed', 'cancelled') NOT NULL DEFAULT 'queued';
