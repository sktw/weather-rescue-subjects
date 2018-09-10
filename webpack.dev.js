var fs = require('fs');
var path = require('path');
var merge = require('webpack-merge');
var common = require('./webpack.common.js');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var utils = require('./static/templates/utils');

var link = utils.link;
var script = utils.script;

var publicPath = '/';
var url = utils.createUrlResolver(publicPath);

module.exports = merge(common, {
    output: {
        publicPath: publicPath
    },
    devtool: 'inline-source-map',
    devServer: {
        contentBase: path.join(__dirname, 'static')
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: 'static/templates/index.html',
            filename: 'index.html',
            context: {
                publicPath: publicPath,
                js: [
                    script({src: 'js/fetch.js'})
                ],
                css: [
                    link({href: url('lib/bootstrap/css/bootstrap.min.css'), rel: 'stylesheet'}),
                    link({href: url('lib/font-awesome/css/font-awesome.min.css'), rel: 'stylesheet'}),
                    link({href: url('css/styles.css'), rel: 'stylesheet'})
                ]
            }
        })
    ]
});
