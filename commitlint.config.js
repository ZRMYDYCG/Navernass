/** @type {import('@commitlint/types').UserConfig} */
module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat", // 新功能
        "fix", // 修复bug
        "docs", // 文档更新
        "style", // 代码格式（不影响代码运行的变动）
        "refactor", // 重构（既不是新增功能，也不是修复bug的代码变动）
        "perf", // 性能优化
        "test", // 测试相关
        "chore", // 构建过程或辅助工具的变动
        "revert", // 回退
        "build", // 构建系统或外部依赖的变化
        "ci", // CI配置文件和脚本的变化
      ],
    ],
    "subject-case": [0], // 允许任意大小写
    "subject-max-length": [0], // 允许任意长度
  },
};
