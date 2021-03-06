const path = require('path');
const config = require('./config.js');
const merge = require('webpack-merge');
const resolve = dir => path.resolve(__dirname, '../src/', dir);
const base = require('./webpack.base.config.js');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');// 从js文件中提取css
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');// 压缩css
const ProgressBarPlugin = require('progress-bar-webpack-plugin');// 显示打包时间
const TerserPlugin = require('terser-webpack-plugin');
const lodashWebpackPlugin = require('lodash-webpack-plugin');// 去除未使用的lodash代码
const DuplicatePackageCheckerPlugin = require("duplicate-package-checker-webpack-plugin");// 捆绑包包含同一软件包的多个版本时，会发出警告

const webpackConfig = merge(base, {
    mode: 'production',
    // externals里面库不打包
    externals: {
        'react': 'React',
        'react-dom': 'ReactDOM',
        'react-router-dom': 'ReactRouterDOM'
    },
    plugins: [
        new CleanWebpackPlugin(),
        new MiniCssExtractPlugin({
            filename: 'css/[name].[contenthash:8].css'
        }),
        new lodashWebpackPlugin(),
        new webpack.optimize.ModuleConcatenationPlugin(),// 作用域提升
        new OptimizeCssAssetsPlugin(),
        // IgnorePlugin可以忽略第三方库的某个目录下的内容
        new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),// 忽略moment的locale(语言包)目录下的内容, 减小打包体积
        new ProgressBarPlugin(),
        new DuplicatePackageCheckerPlugin()
    ],
    optimization: {
        minimizer: [
            new TerserPlugin({
                minify: (file, sourceMap) => {
                    const uglifyJsOptions = {
                        compress: {drop_console: true}// 去掉console
                    };
                    if(sourceMap) {
                        uglifyJsOptions.sourceMap = {
                            content: sourceMap
                        };
                    };
                    return require('uglify-js').minify(file, uglifyJsOptions);
                }
            }),
        ],
        splitChunks: {
            cacheGroups: {
                vendor: {
                    name: 'vendor',
                    test: /[\\/]node_modules[\\/]/,
                    chunks: 'all',
                    priority: 9, //权重 eg: 如果vendor的权重高于antd，那最终打包结果不会把antd单独打包
                },
                antd: {
                    name: 'antd',
                    test: /[\\/]node_modules[\\/](antd)[\\/]/,
                    chunks: 'all',
                    priority: 11
                },
                cryptoJs: {
                    name: 'crypto-js',
                    test: /[\\/]node_modules[\\/](crypto-js)[\\/]/,
                    chunks: 'all',
                    priority: 11
                }
            }
        }
    }
})

if(config.sourceMap) {
    webpackConfig.devtool = 'cheap-module-source-map';
}

if(config.manifest) {
    const ManifestPlugin = require('webpack-manifest-plugin');// 抽离manifest.json文件
    webpackConfig.plugins.push(
        new ManifestPlugin()
    )
}

if(config.report) {
    const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;// 查看项目打包体积
    webpackConfig.plugins.push(
        new BundleAnalyzerPlugin()
    )
}

if(config.gzip) {
    const CompressionWebpackPlugin = require('compression-webpack-plugin');// 开启gzip压缩 版本问题降到1.1.12
    webpackConfig.plugins.push(
        new CompressionWebpackPlugin({
            asset: '[path].gz[query]',
            algorithm: 'gzip',
            test: new RegExp('\\.(js|css)$'),
            threshold: 10240,
            minRatio: 0.8
        })
    )
}

if(config.happypack) {
    const HappyPack = require('happypack');// 大项目中使用，小项目使用反而构建速度慢
    const happypackConfig = [
        new HappyPack({
            id: 'happyBabel',
            loaders: ['babel-loader']
        }),
        new HappyPack({
            id: 'happyCss',
            loaders: ['css-loader']
        }),
        new HappyPack({
            id: 'happySass',
            loaders: ['sass-loader']
        })
    ]
    webpackConfig.plugins.push(...happypackConfig);
}

module.exports = webpackConfig;