-- AlterTable
ALTER TABLE `ai_provider_configs` MODIFY `kind` VARCHAR(100) NOT NULL;

-- 旧的厂商枚举值改为 Models.dev 厂商 ID
UPDATE `ai_provider_configs` SET `kind` = CASE `kind`
  WHEN 'qwen' THEN 'alibaba-cn'
  WHEN 'glm' THEN 'zhipuai'
  WHEN 'fireworks' THEN 'fireworks-ai'
  WHEN 'bedrock' THEN 'amazon-bedrock'
  WHEN 'vertex' THEN 'google-vertex'
  WHEN 'gateway' THEN 'vercel'
  WHEN 'siliconflow' THEN 'siliconflow-cn'
  ELSE `kind`
END;
