import eslintPluginTs from "@typescript-eslint/eslint-plugin";
import eslintParserTs from "@typescript-eslint/parser";
import prettier from "eslint-config-prettier";

export default [
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "dist/**", // ✅ adicione esta linha
      "next-env.d.ts",
    ],
    languageOptions: {
      parser: eslintParserTs,
      parserOptions: {
        project: "./tsconfig.json",
        sourceType: "module",
      },
    },
    plugins: { "@typescript-eslint": eslintPluginTs },
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
  prettier,
];
