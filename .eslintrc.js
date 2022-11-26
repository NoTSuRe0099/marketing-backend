module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'airbnb',
    'airbnb-typescript',
    'airbnb/hooks',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  overrides: [],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    tsconfigRootDir: __dirname,
    project: '**/tsconfig.json',
  },
  plugins: ['react', '@typescript-eslint'],
  rules: {
    'react/react-in-jsx-scope': 0,
    'react/jsx-one-expression-per-line': 'off',
    '@typescript-eslint/no-shadow': 'warn',
    '@typescript-eslint/comma-dangle': 'off',
    'comment-whitespace-inside': 'off',
    'react/no-unescaped-entities': 'off',
    'jsx-a11y/anchor-is-valid': 'warn',
    'react/function-component-definition': 'off',
    '@typescript-eslint/ban-ts-comment': 'warn',
    'linebreak-style': 'off',
    'operator-linebreak': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'import/no-named-as-default': 'off',
    'no-underscore-dangle': 'off',
    'import/no-import-module-exports': 'off'
  },
};
