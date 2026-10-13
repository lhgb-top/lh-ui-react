import eslint from '@eslint/js'
import eslintConfigPrettier from 'eslint-config-prettier'
import globals from 'globals'
import eslintPluginReactHooks from 'eslint-plugin-react-hooks'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/coverage/**',
      '**/dist/**',
      '**/cache/**',
      '**/es/**',
      '**/lib/**',
      '**/theme/**',
      '**/.vitepress/dist/**',
      '**/.vitepress/cache/**',
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  eslintConfigPrettier,
  {
    files: ['**/*.{js,mjs,cjs,ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      'react-hooks': eslintPluginReactHooks,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      // react-hooks recommended 规则集：保证依赖数组正确、Context value 等纪律
      ...eslintPluginReactHooks.configs.recommended.rules,
    },
  },
  {
    // tsx 组件文件额外约束
    files: ['**/*.tsx'],
    rules: {
      // forwardRef 的泛型组件与多导出（组件 + 类型）在 React 生态是常规写法
      'react/jsx-uses-react': 'off',
    },
  },
)
