const Webpack = require('webpack')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin
const AntdDayjsWebpackPlugin = require('antd-dayjs-webpack-plugin')
const path = require('path')

const isProduction = process.env.NODE_ENV === 'production'

module.exports = {
  publicPath: '/html/calibrate/',
  productionSourceMap: false,
  configureWebpack: config => {
    if (isProduction) {
      config.plugins.push(new Webpack.IgnorePlugin(/^\.\/locale$/, /moment$/))
      config.plugins.push(new BundleAnalyzerPlugin())
      config.plugins.push(new AntdDayjsWebpackPlugin())

      // config.optimization = {
      //   runtimeChunk: 'single',
      //   splitChunks: {
      //     chunks: 'all',
      //     maxInitialRequests: Infinity,
      //     minSize: 20000,
      //     cacheGroups: {
      //       vendor: {
      //         test: /[\\/]node_modules[\\/]/,
      //         name(module) {
      //           const packageName = module.context.match(
      //             /[\\/]node_modules[\\/](.*?)([\\/]|$)/
      //           )[1]
      //           return `npm.${packageName.replace('@', '')}`
      //         }
      //       }
      //     }
      //   }
      // }

      config.resolve = {
        alias: {
          '@ant-design/icons/lib/dist$': path.resolve(
            __dirname,
            './src/icons.js'
          )
        }
      }
    }
  },
  pluginOptions: {}
}
