module.exports = {
    "parser": "babel-eslint",
    "parserOptions": {
        "ecmaFeatures": {
            "jsx": true,
            "modules": true
        }
    },
    "settings": {
        "react": {
            "pragma": "React",  // Pragma to use, default to "React"
            "version": "15.0" // React version, default to the latest React stable release
        }
    },
    "env":
    {
        "browser": false,
        "node": true,
        "mongo": true,
        "es6": true,
    },    
}
