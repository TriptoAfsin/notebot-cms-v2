import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores([
    ".output/**", ".nitro/**", ".tanstack/**", "dist/**", "src/routeTree.gen.ts", "drizzle/**",
    // Vendored from shadcn/ui and Evil Charts; kept byte-for-byte so they can be re-synced upstream.
    "components/ui/**", "components/evilcharts/**",
  ]),
  js.configs.recommended,
  ...tseslint.configs.recommended,
  reactHooks.configs.flat.recommended,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", destructuredArrayIgnorePattern: "^_", ignoreRestSiblings: true },
      ],
      // react-hook-form's watch() opts a component out of the React Compiler; that is expected here.
      "react-hooks/incompatible-library": "off",
    },
  },
]);
