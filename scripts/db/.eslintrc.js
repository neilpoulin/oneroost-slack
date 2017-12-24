var path = require('path')

module.exports = {
    plugins: ["mongo"],
    // extends: path.join(__dirname, "..", "..", '.eslintrc.json'),
    env: {
        mongo: true,
        "mongo/shell": true,
    },
    globals: {
        "db": false,
    },
}