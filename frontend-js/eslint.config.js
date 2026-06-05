import globals from "globals"

export default [
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 2020,
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
    },
    rules: {},
  },
]
