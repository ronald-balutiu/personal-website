export default [
    {
        ignores: ["node_modules/", "dist/", ".astro/"],
    },
    {
        extends: ["eslint:recommended", "plugin:astro/recommended", "plugin:prettier/recommended"],
        plugins: ["astro", "prettier"],
        rules: {
            "prettier/prettier": "error",
        },
        overrides: [
            {
                files: ["*.astro"],
                parser: "astro-eslint-parser",
                parserOptions: {
                    parser: "@typescript-eslint/parser",
                    extraFileExtensions: [".astro"],
                },
            },
        ],
    },
];
