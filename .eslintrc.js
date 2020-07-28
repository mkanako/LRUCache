module.exports = {
  root: true,
  env: {
    es6: true,
    mocha: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  extends: [
    'plugin:@typescript-eslint/recommended',
    'standard',
  ],
  plugins: [
    '@typescript-eslint',
  ],
  rules: {
    '@typescript-eslint/no-empty-function': 'off',
    'comma-dangle': ['error', 'always-multiline'],
    'quote-props': [
      'error',
      'consistent-as-needed',
    ],
    'no-useless-constructor': 'off',
    'no-console': process.env.NODE_ENV === 'publish' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'publish' ? 'error' : 'off',
  },
}
