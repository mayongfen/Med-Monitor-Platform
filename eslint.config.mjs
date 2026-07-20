// @ts-check
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'

/**
 * ESLint Flat Config
 *
 * 关键治理规则：禁止业务代码直接从 `@/components/ui/select` 导入底层 Select 系列组件。
 * 原因：base-ui 的 SelectValue 默认依赖「已挂载的 SelectItem」反查 label，
 * 而 SelectItem 在 Portal 内、弹窗首次打开前未挂载，导致 trigger 初始渲染
 * 直接把 value（字典 key）当文本显示。必须统一走 `@/components/ui/dict-select`
 * 的 DictSelect 封装（内部用 SelectValue 的 render-fn 显式映射 value→label）。
 *
 * 仅 `components/ui/**` 自身（封装层）豁免该限制。
 */
export default tseslint.config(
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'public/**',
      'pnpm-lock.yaml',
    ],
  },

  // 基础：TS 文件的类型无关 lint
  ...tseslint.configs.recommended,

  // ── 治理规则：禁止业务代码直接 import 底层 Select ──
  // 对除 components/ui/** 以外的所有源码生效。
  {
    files: ['**/*.{ts,tsx}'],
    ignores: ['components/ui/**'],
    name: 'no-raw-select-in-business-code',
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@/components/ui/select',
              message:
                '禁止直接使用底层 Select 组件。请改用 @/components/ui/dict-select 的 DictSelect / dictOptions，以避免 base-ui SelectValue 初始渲染显示 value（字典 key）而非 label 的问题。',
            },
            {
              name: '@base-ui/react/select',
              message:
                '禁止在业务代码中直接使用 @base-ui/react/select。请改用 @/components/ui/dict-select 的 DictSelect。',
            },
          ],
        },
      ],
    },
  },

  // ── 通用规则 ──
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },

  // ── React Hooks（经典两条）──
  // 只启用 rules-of-hooks 与 exhaustive-deps：
  // 1) 让 store.tsx 等处已有的 // eslint-disable-next-line react-hooks/exhaustive-deps
  //    注释合法（否则 ESLint 报 "Definition for rule ... was not found"）；
  // 2) 不引入 react-hooks v7 的激进新规则（set-state-in-effect / immutability 等），
  //    避免在既有项目上大量误报。
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { 'react-hooks': reactHooks },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
)
