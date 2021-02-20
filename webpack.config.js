const path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// const CopyPlugin = require("copy-webpack-plugin");
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');

const isDev = process.env.NODE_ENV === 'development';
const isProd = !isDev;

const filename = (ext) => (isDev ? `[name].${ext}` : `[name].[contenthash].${ext}`);

const optimization = () => {
  const configObj = {
    splitChunks: {
      // chunks: 'all'
    },
  };

  if (isProd) {
    configObj.minimizer = [
      new CssMinimizerPlugin({
        parallel: true,
      }),
    ];
  }

  return configObj;
};

const plugins = () => {
  const basePlugins = [
    new HTMLWebpackPlugin({
      template: path.resolve(__dirname, 'src/index.html'),
      filename: 'index.html',
      minify: {
        collapseWhitespace: isProd,
      },
    }),
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: `./css/${filename('css')}`,
    }),
    // new CopyWebpackPlugin({
    //   patterns: [
    //     {from: path.resolve(__dirname, 'src/assets') , to: path.resolve(__dirname, 'app')}
    //   ]
    // }),
  ];

  if (isProd) {
    basePlugins.push(
      new ImageMinimizerPlugin({
        minimizerOptions: {
          plugins: [
            ['gifsicle', { interlaced: true }],
            ['jpegtran', { progressive: true }],
            ['optipng', { optimizationLevel: 5 }],
            ['svgo', {
              plugins: [
                {
                  removeViewBox: false,
                },
              ],
            },
            ],
          ],
        },
      }),
    );
  }

  return basePlugins;
};

module.exports = {
  context: path.resolve(__dirname, 'src'),
  mode: 'development',
  entry: './js/index.js',
  output: {
    filename: `./js/${filename('js')}`,
    path: path.resolve(__dirname, 'dist'),
    publicPath: '',
    assetModuleFilename: `assets/${filename('[ext]')}`,
  },

  devServer: {
    historyApiFallback: true,
    contentBase: path.resolve(__dirname, 'dist'),
    open: true,
    compress: true,
    // hot: true,
    port: 9000,
  },

  plugins: plugins(),

  devtool: isProd ? false : 'source-map',

  optimization: optimization(),

  module: {
    rules: [
      {
        test: /\.(?:ico|gif|png|jpg|jpeg)$/i,
        type: 'asset/resource',
        generator: {
          filename: `images/${filename('[ext]')}`,
        },
      },

      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
        generator: {
          filename: `fonts/${filename('[ext]')}`,
        },
      },

      {
        test: /\.svg$/,
        type: 'asset',
        use: 'svgo-loader',
      },

      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },

      {
        test: /\.html$/i,
        loader: 'html-loader',
      },

      {
        test: /\.css$/i,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              hmr: isDev,
            },
          },
          'style-loader',
          'css-loader',
        ],
      },

      {
        test: /\.s[ac]ss$/i,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: (resourcePath, context) => `${path.relative(path.dirname(resourcePath), context)}/`,
            },
          },
          'css-loader',
          'sass-loader',
        ],
      },
    ],
  },
};
