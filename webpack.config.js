const path = require('path');
const glob = require('glob');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const FixStyleOnlyEntriesPlugin = require("webpack-fix-style-only-entries");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
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
// const entry = Object.assign(jsEntry , cssEntry);
// console.log(entry);

//現在ここでdevelopmentを代入しているのは仮（このままだとpackage.jsonとの整合性が取れない）
const MODE = "development";
const enabledSourceMap = MODE === "development";

module.exports = [

    // js
    {
        entry: jsEntry,
        output: {
            path: path.resolve(__dirname, './assets/js'),
            publicPath: path.resolve(__dirname, "./"),
            filename: "[name]"
        },
        devtool: "source-map",
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
        },
        // resolve: {
        //     alias: {
        //         Scripts: path.resolve(__dirname, 'src/js/'),
        //         RootPath: path.resolve(__dirname, './')
        //     }
        // },
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
                                sourceMap: enabledSourceMap,
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
                                sourceMap: enabledSourceMap,
                                plugins: [
                                    // Autoprefixerを有効化
                                    // ベンダープレフィックスを自動付与する
                                    require("autoprefixer")({
                                        grid: true
                                    })
                                ]
                            }
                        },
                        {
                            loader: 'sass-loader',
                            options: {
                                sourceMap: enabledSourceMap,
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
        ],
        optimization: {
            minimizer: [new OptimizeCSSAssetsPlugin({})],
        },
        // resolve: {
        //     alias: {
        //         Scripts: path.resolve(__dirname, 'src/scss/'),
        //         RootPath: path.resolve(__dirname, './')
        //     }
        // },
    }
];
