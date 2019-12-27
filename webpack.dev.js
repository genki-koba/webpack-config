const path = require('path');
const glob = require('glob');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const FixStyleOnlyEntriesPlugin = require("webpack-fix-style-only-entries");
// const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
// const TerserPlugin = require('terser-webpack-plugin');
const jsEntry = glob.sync("./src/js/**/*.js").reduce((a, b) => Object.assign(a, {[b.replace(/src\/js\//, '')]: b}), {});
const cssArray = glob.sync("./src/scss/**/*.scss").filter(n => !n.match(/_/));
const cssEntry = cssArray.reduce(
    (a, b) => 
    Object.assign(a, {
            [b.replace(/src\/scss\//, '').replace(/\.scss$/, '.css')]: b
        }),
    {},
);
console.log(jsEntry);
console.log(cssEntry);

//開発環境用の変数定義
const MODE = "development";
const sourceMap = MODE === "development";
const devtool = "source-map";

module.exports = [

    // js
    {
        entry: jsEntry,
        output: {
            path: path.resolve(__dirname, './assets/js'),
            publicPath: path.resolve(__dirname, "./"),
            filename: "[name]"
        },
        devtool: devtool,
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use: [
                        {
                            loader: 'babel-loader',
                            options: {
                                presets: [
                                    [
                                        '@babel/preset-env', 
                                        { modules: false }
                                    ]
                                ]
                            }
                        }
                    ]
                }
            ]
        }
    },
    // scss
    {
        entry: cssEntry,
        output: {
            path: path.resolve(__dirname, './assets/css'),
            publicPath: path.resolve(__dirname, "./"),
        },
        devtool: 'source-map',
        module: {
            rules: [
                {
                    test: /\.(sa|sc)ss$/,
                    exclude: /node_modules/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        {
                            loader: 'css-loader',
                            options: {
                                sourceMap: sourceMap,
                                // 0 => no loaders (default);
                                // 1 => postcss-loader;
                                // 2 => postcss-loader, sass-loader
                                importLoaders: 2, //postcss + sass
                                url: false,
                            }
                        },
                        {
                            loader: 'postcss-loader',
                            options: {
                                sourceMap: sourceMap,
                                plugins: [
                                    // Autoprefixerを有効化
                                    // ベンダープレフィックスを自動付与する
                                    require("autoprefixer")({
                                        grid: true,
                                        //"https://browserl.ist/"を参考にプレフィックスを以下のように付与
                                        browsers: ["last 2 versions", "ie >= 11", "Android >= 4", 'iOS >= 6', 'Firefox ESR']
                                    })
                                ]
                            }
                        },
                        {
                            loader: 'sass-loader',
                            options: {
                                sourceMap: sourceMap,
                            }
                        }
                    ]
                }
            ]
        },
        plugins: [
            new FixStyleOnlyEntriesPlugin(),
            new MiniCssExtractPlugin({
                filename: "[name]"
            })
        ]
    }
];
