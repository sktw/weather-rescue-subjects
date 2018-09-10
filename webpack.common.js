var path = require('path');

module.exports = {
    entry: ['promise-polyfill/src/polyfill', 'whatwg-fetch', './src/index.js'],
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'docs'),
    },
    
    module: {
        rules: [
            {
                test: /\.js$/,
                use: ['babel-loader', 'eslint-loader'],
                exclude: /node_modules/
            }
        ]
    },
}
