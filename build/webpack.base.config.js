const path = require('path');
const resolve = dir => path.resolve(__dirname, '../src/', dir);
const MiniCssExtractPlugin = require('mini-css-extract-plugin');// 从js文件中提取css
const isDev = process.env.NODE_ENV === 'development';
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: resolve('index.js'),
    output: {
        filename: 'js/[name].[hash:8].js',
        path: resolve('../dist')
    },
    // externals里面库不打包
    externals: {
        'react': 'React',
        'react-dom': 'ReactDOM',
        'react-router-dom': 'ReactRouterDOM'
    },
    resolve: {
        extensions: ['.js', '.jsx'],
        alias: {
            '@': resolve('assets/'),
            '@style': resolve('style/'),
            '@pages': resolve('pages/'),
            '@ant-design/icons/lib/dist$': resolve('icon.js') // 优化@ant-design/icons文件，按需引入icon
        }
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                use: 'babel-loader',
                exclude: /node_modules/
            },
            {
                test: /\.css$/,
                use: [
                    isDev ? 'style-loader' : MiniCssExtractPlugin.loader,
                    'css-loader'
                ]
            },
            {
                test: /\.(sass|scss)$/,
                use: [
                    isDev ? 'style-loader' : MiniCssExtractPlugin.loader,
                    'css-loader',
                    'postcss-loader',
                    'sass-loader'
                ],
                include: resolve('style/'),
                exclude: /node_modules/
            },
            {
                test: /\.(png|jpg|jpeg|gif)$/,
                use: {
                    loader: 'url-loader',
                    options: {
                        name: '[name].[ext]',
                        outputPath: 'images/',
                        limit: 8192, //8kb
                        include: resolve('assets/'),
                        exclude: /node_modules/
                    }
                }
            },
            {
                test: /\.(eot|ttf|svg|woff|woff2)$/,
                use: {
                    loader: 'file-loader',
                    options: {
                        name: '[name].[ext]',
                        outputPath: 'font/',
                        include: resolve('font/'),
                        exclude: /node_modules/
                    },
                }
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: resolve('../public/index.html'),
            inject: 'body',
            hash: isDev ? false : true // development要取消hash
        })
    ]
}