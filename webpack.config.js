const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const RemoveEmptyScriptsPlugin = require('webpack-remove-empty-scripts');
const webpack = require('webpack');

const { JavascriptModulesPlugin } = webpack.javascript;
const PLUGIN_NAME = 'FixEsmImportPlugin';

class FixEsmImportPlugin {

  /**
   * Apply the plugin
   * @param {import('webpack').Compiler} compiler
   */
  apply(compiler) {
    const removeEmptyChunks = compiler.options.optimization.removeEmptyChunks !== false;
    compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation) => {
      const hooks = JavascriptModulesPlugin.getCompilationHooks(compilation);
      hooks.renderChunk.tap(PLUGIN_NAME, (_modules, renderContext) => {
        const { chunk, chunkGraph } = renderContext;
        const moduleAndEntrypoints = chunkGraph.getChunkEntryModulesWithChunkGroupIterable(chunk);
        for (const [_module, entrypoint] of moduleAndEntrypoints) {
          for (const chunk of entrypoint.chunks) {
            if (
              removeEmptyChunks &&
              chunk !== entrypoint.getRuntimeChunk() &&
              !chunkGraph.getChunkModulesIterableBySourceType(chunk, 'javascript')
            ) {
              entrypoint.removeChunk(chunk);
              console.debug(`[${PLUGIN_NAME}] Removed empty chunk with id "${chunk.id}" before rendering startupSource`);
            }
          }
        }
      });
    });
  }
}

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
    // new RemoveEmptyScriptsPlugin({verbose: true}),
    new MiniCssExtractPlugin({
      filename: '[name].css',
      // Will leverage `assets-webpack-plugin` to generate a manifest file for
      // further process, so I won't need any CSS runtime.
      runtime: false
    }),
    new FixEsmImportPlugin()
  ],
  optimization: {
    // removeEmptyChunks: false,
    runtimeChunk: 'single',
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        styles: {
          name: 'styles',
          // This is recommended way of 'Extracting all CSS in a single file'
          // according to https://github.com/webpack-contrib/mini-css-extract-plugin#extracting-all-css-in-a-single-file
          // only `styles.css` will be produced, but `esm.js` still trying
          // to import `styles.js`.
          type: 'css/mini-extract',
          // test(module, { chunkGraph, moduleGraph }) {
          //   debugger;
          //   // chunkGraph.getChunkEntryModulesWithChunkGroupIterable
          //   return module.type === 'css/mini-extract'
          // },
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
