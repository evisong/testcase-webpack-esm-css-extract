const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const config = {
  entry: {
    esm: './src/index.js'
  },
  experiments: {
    outputModule: true
  },
  output: {
    filename: '[name].js',
    chunkFilename: '[name].js',
    chunkLoading: 'import',
    chunkFormat: 'module',
    library: { type: 'module' },
    environment: { module: true },
    module: true,
    clean: true
  },
  module: {
    rules: [
      { test: /\.css$/, use: [MiniCssExtractPlugin.loader, 'css-loader'] }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css',
      // Will leverage `assets-webpack-plugin` to generate a manifest file for
      // further process, so I won't need any CSS runtime.
      runtime: false
    })
  ],
  optimization: {
    runtimeChunk: 'single',
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        styles: {
          name: 'styles',
          // This is recommended way of "Extracting all CSS in a single file"
          // according to https://github.com/webpack-contrib/mini-css-extract-plugin#extracting-all-css-in-a-single-file
          // only `styles.css` will be produced, but `esm.js` still trying
          // to import `styles.js`.
          type: 'css/mini-extract',
          chunks: 'all',
          enforce: true
        }
      }
    }
  },
  devServer: {
    open: ['/'],
    static: ['public', 'dist']
  }
};

module.exports = config;
