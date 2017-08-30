// module.exports = {
//     "parser": "babel-eslint",
//     "parserOptions": {
//         "ecmaFeatures": {
//             "jsx": true,
//             "modules": true
//         }
//     },
//     "settings": {
//         "react": {
//             "pragma": "React",  // Pragma to use, default to "React"
//             "version": "15.0" // React version, default to the latest React stable release
//         }
//     },
//     "env":
//     {
//         "browser": true,
//         "node": true,
//         "mongo": true,
//         "es6": true,
//         "jest/globals": true
//     },
//     "plugins": [
//         "react",
//         "jest"
//     ],
//     "settings": {
//         "react": {
//             "pragma": "React",  // Pragma to use, default to "React"
//             "version": "15.0" // React version, default to the latest React stable release
//         }
//     },
//     "globals": {
//         // "OneRoost": true,
//         "InboxSDK": true,
//         "chrome": true,
//         "gapi": true,
//         "ChromeExOAuth": true,
//     },
//     "rules": {
//         "strict": [2, "never"],
//         "react/jsx-uses-react": 2,
//         "react/jsx-uses-vars": 2,
//         "react/react-in-jsx-scope": 2,
//         "quotes": [1,"double"],
//         "no-debugger": 1,
//         "no-empty": 1,
//         "no-dupe-args": 1,
//         "no-dupe-keys": 1,
//         "no-extra-parens": 1,
//         "no-extra-semi": 1,
//         "no-irregular-whitespace": 1,
//         "no-unreachable": 1,
//         "valid-typeof": 2,
//         "use-isnan": 2,
//         "block-scoped-var": 1,
//         "consistent-return": 0,
//         "no-magic-numbers": 0,
//         "no-multi-spaces": 1,
//         "brace-style": ["error", "stroustrup"],
//         "no-unused-vars": [
//             1,
//             {
//                 "vars": "local",
//                 "args": "none",
//                 "varsIgnorePattern": "Bootstrap"
//             }
//         ],
//         "no-mixed-requires": 1,
//         "no-use-before-define": [
//             1,
//             {
//                 "functions": false,
//                 "classes": true
//             }
//         ],
//         "no-undef": 2,
//         "newline-per-chained-call": [
//             "error",
//             {
//                 "ignoreChainWithDepth": 3
//             }
//         ],
//         "object-property-newline": ["error", {
//             "allowMultiplePropertiesPerLine": true
//         }],
//         "dot-location": ["error", "property"],
//         "indent": ["error", 4, {
//             "MemberExpression": 1,
//             "SwitchCase": 1,
//             "FunctionExpression": {"parameters": 1, "body": 1},
//             "CallExpression": {"arguments": 1},
//             "ArrayExpression": "first",
//             "ObjectExpression": 1
//         }],
//         // "object-curly-newline": ["error", {
//         //     "ObjectExpression": { multiline: true, minProperties: 2 },
//         //     "ObjectPattern": { multiline: true, minProperties: 2 }
//         // }],
//         "no-multiple-empty-lines": ["error", { "max": 1, "maxEOF": 1 }],
//         "comma-spacing": ["error", { "before": false, "after": true }],
//         "space-in-parens": ["error", "never"],
//         "arrow-spacing": ["error", { "before": true, "after": true }],
//         "padded-blocks": ["error", {
//             "blocks": "never",
//             "switches": "never",
//             "classes": "never"
//         }],
//         "key-spacing": ["error", { "beforeColon": false, "afterColon": true }],
//         "jest/no-disabled-tests": "warn",
//         "jest/no-focused-tests": "error",
//         "jest/no-identical-title": "error",
//     }
// }
