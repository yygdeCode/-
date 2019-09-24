const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const {
    CleanWebpackPlugin
} = require('clean-webpack-plugin')

module.exports = {
    entry: './src/index.ts',
    output: {
        path: path.resolve('./dist'),
        filename: 'script/bundle.js'
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './public/index.html'
        }),
        new CleanWebpackPlugin()
    ],
    module: {
        rules: [{
                test: /.ts$/,
                loader: 'ts-loader'
            },
            {
                test: /.css$/,
                loader: ['style-loader', 'css-loader']
            },
            {
                test: /.jpg|png|gif|svg$/,
                use: [{
                    loader: 'url-loader',
                    options: {
                        name : '[name][hash:5].[ext]',
                        limit : 100000,
                        outputPath : 'img'
                    }
                }]
            },


        ]
    },
    resolve: {
        extensions: ['.ts', '.js']
    }
}