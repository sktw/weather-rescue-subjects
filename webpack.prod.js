var fs = require('fs');
var webpack = require('webpack');
var merge = require('webpack-merge');
var UglifyJSPlugin = require('uglifyjs-webpack-plugin');
var common = require('./webpack.common.js');
var CleanWebpackPlugin = require('clean-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');

var utils = require('./static/templates/utils');

var link = utils.link;
var script = utils.script;

/* urls on github pages need to be relative to project
 * See https://stackoverflow.com/a/19173888
*/

var publicPath = '/weather-rescue-subjects';
var url = utils.createUrlResolver(publicPath);

module.exports = merge(common, {
    devtool: 'none',
    output: {
        publicPath: publicPath
    },
    externals: {
        'react': 'React',
        'react-dom': 'ReactDOM'
    },
    plugins: [
        new UglifyJSPlugin(),
        new CleanWebpackPlugin(['docs']),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production')
        }),
        new CopyWebpackPlugin([{
            from: './static/js/fetch.js',
            to: ''
        },
        {
            from: './static/css/styles.css',
            to: 'css/styles.css'
        },
        {
            from: './static/images',
            to: 'images',
        }
        ]),
        new HtmlWebpackPlugin({
            template: 'static/templates/index.html',
            filename: 'index.html',
            context: {
                publicPath: publicPath,
                js: [
                    script({
                        src: url('fetch.js')
                    }),
                    script({
                        crossorigin: '', 
                        src: 'https://unpkg.com/react@16.2.0/umd/react.production.min.js', 
                        integrity: 'sha384-j40ChW3xknV2Dsc9+kP3/6SW2UrR7gYSbx9pmyNU1YTacm/PEj/0bxB9vM8jWFqx'
                    }),
                    script({
                        crossorigin: '', 
                        src: 'https://unpkg.com/react-dom@16.2.0/umd/react-dom.production.min.js', 
                        integrity: 'sha384-P4XM5fEtXj1kXZzsm1EOHZ7HmQIuzyRjjvX4na21R4eRLjmm+oUZua5ALb2PIojw'
                    })
                ],
                css: [
                    link({
                        href: "https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css",
                        rel: "stylesheet",
                        integrity: "sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO",
                        crossorigin: "anonymous"
                    }),
                    link({
                        href: "https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css",
                        rel: "stylesheet",
                        integrity: "sha384-wvfXpqpZZVQGK6TAh5PVlGOfQNHSoD2xbE+QkPxCAFlNEevoEH3Sl0sibVcOQVnN",
                        crossorigin: "anonymous"
                    }),
                    link({href: url('css/styles.css'), rel: 'stylesheet'})
                ]
            }
        })

    ]
});
