export default {
    extends: ['@commitlint/config-conventional'],
    rules: {
      // Type 枚举
      'type-enum': [
        2,
        'always',
        [
          'feat',     // 新功能
          'fix',      // 修复 bug
          'docs',     // 文档变更
          'style',    // 代码格式（不影响代码运行的变动）
          'refactor', // 重构（既不是新增功能，也不是修改 bug 的代码变动）
          'perf',     // 性能优化
          'test',     // 增加测试
          'build',    // 构建过程或辅助工具的变动
          'ci',       // CI 配置文件和脚本的变动
          'chore',    // 其他不修改 src 或测试文件的变动
          'revert',   // 回滚 commit
        ],
      ],
      // Subject 大小写不做校验
      'subject-case': [0],
      // Subject 不允许为空
      'subject-empty': [2, 'never'],
      // Type 不允许为空
      'type-empty': [2, 'never'],
      // Scope 允许为空
      'scope-empty': [0],
      // Subject 最大长度
      'subject-max-length': [2, 'always', 100],
    },
    prompt: {
      messages: {
        type: '选择你要提交的类型 :',
        scope: '选择一个提交范围（可选）:',
        customScope: '请输入自定义的提交范围 :',
        subject: '填写简短精炼的变更描述 :\n',
        body: '填写更加详细的变更描述（可选）。使用 "|" 换行 :\n',
        breaking: '列举非兼容性重大的变更（可选）。使用 "|" 换行 :\n',
        footerPrefixesSelect: '选择关联issue前缀（可选）:',
        customFooterPrefix: '输入自定义issue前缀 :',
        footer: '列举关联issue (可选) 例如: #31, #I3244 :\n',
        confirmCommit: '是否提交或修改commit ?',
      },
      types: [
        { value: 'feat', name: 'feat:     ✨  新增功能 | A new feature', emoji: ':sparkles:' },
        { value: 'fix', name: 'fix:      🐛  修复缺陷 | A bug fix', emoji: ':bug:' },
        { value: 'docs', name: 'docs:     📝  文档更新 | Documentation only changes', emoji: ':memo:' },
        { value: 'style', name: 'style:    💄  代码格式 | Changes that do not affect the meaning of the code', emoji: ':lipstick:' },
        { value: 'refactor', name: 'refactor: ♻️  代码重构 | A code change that neither fixes a bug nor adds a feature', emoji: ':recycle:' },
        { value: 'perf', name: 'perf:     ⚡️  性能提升 | A code change that improves performance', emoji: ':zap:' },
        { value: 'test', name: 'test:     ✅  测试相关 | Adding missing tests or correcting existing tests', emoji: ':white_check_mark:' },
        { value: 'build', name: 'build:    📦️  构建相关 | Changes that affect the build system or external dependencies', emoji: ':package:' },
        { value: 'ci', name: 'ci:       🎡  持续集成 | Changes to our CI configuration files and scripts', emoji: ':ferris_wheel:' },
        { value: 'chore', name: 'chore:    🔨  其他修改 | Other changes that do not modify src or test files', emoji: ':hammer:' },
        { value: 'revert', name: 'revert:   ⏪️  回退代码 | Reverts a previous commit', emoji: ':rewind:' },
      ],
    },
  }