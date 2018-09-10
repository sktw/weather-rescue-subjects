module.exports = {
    "parser": "babel-eslint",
    "plugins": [
        "react"
    ],
    "rules": {
        'no-console': (process.env.NODE_ENV === 'production' ? 2 : 0)
    },
    "env": {
        "es6": true,
        "browser": true,
        "node": true
    },
    "globals": {
        "PUBLIC_PATH": true
    },
    "extends": [
        "eslint:recommended", 
        "plugin:react/recommended"
    ]
}
