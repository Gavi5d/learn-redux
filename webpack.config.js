var path = require('path');
var webpack = require("webpack");

var DEVELOPMENT = process.env.NODE_ENV.trim() === 'development';
var PRODUCTION = process.env.NODE_ENV.trim() === 'production';

var entry = PRODUCTION ?
    ['./src/index.js'] :
    ['./src/index.js',
        'webpack/hot/dev-server',
        'webpack-dev-server/client?http://localhost:8000'];

module.exports = {
    devtool: "source-map",
    entry: entry,
    plugins: [new webpack.HotModuleReplacementPlugin()],
    module: {
        loaders: [{
                test: /\.js$/,
                loaders: ['babel-loader'],
                exclude: '/node_modules/'
            }]
    },
    output: {
        path: path.join(__dirname, 'dist'),
        publicPath: '/dist/',
        filename: 'bundle.js'
    }
};