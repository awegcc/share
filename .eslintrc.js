/*
 * Ver : 1.0
 * date: Sun Apr  8 09:54:48 CST 2018
 */
module.exports = {
        "env": {
                "browser": false,
                "node": true,
                "commonjs": true,
                "jasmine": true,
                "es6": true
        },
        "extends": "eslint:recommended",
        "parserOptions": {
                "sourceType": "module",
                "ecmaVersion":8
        },
        "rules": {
                "indent": [
                        "warn",
                        4
                ],
                "linebreak-style": [
                        "warn",
                        "unix"
                ],
                "quotes": [
                        "warn",
                        "double"
                ],
                "semi": [
                        "error",
                        "always"
                ],
                "no-console": [
                        "off"
                ],
                "no-mixed-spaces-and-tabs": [
                        "error"
                ]
        }
};
