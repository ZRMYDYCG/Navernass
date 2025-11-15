import antfu from '@antfu/eslint-config'

export default antfu(
  {
    typescript: true,
    react: true,
    node: true,

    formatters: {
      css: true,
      html: true,
      markdown: 'prettier',
    },

    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      '**/out/**',
      '**/coverage/**',
      '**/.turbo/**',
      '**/pnpm-lock.yaml',
    ],
  },
  {
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react-hooks/exhaustive-deps': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/ban-ts-comment': 'off',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'antfu/if-newline': 'off',
      'style/brace-style': ['error', '1tbs'],
      'node/prefer-global/process': 'off',
      'unicorn/prefer-node-protocol': 'off',
    },
  },
)
