const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin'); // Import the plugin

module.exports = {
  entry: './src/index.js', // Entry point of your application
  output: {
    filename: 'main.js', // Name of the bundled JavaScript file
    path: path.resolve(__dirname, 'dist'), // Output directory for the bundle
    publicPath: '/', // Change this to '/' for development
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'), // Serve directly from the 'dist' folder
      publicPath: '/', // Ensure this matches the output publicPath
    },
    port: 8081,
    open: true,
    hot: true,
  },
  mode: 'development', // Set to 'production' for optimized builds
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'], // Loaders for CSS
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html', // Change this line
      filename: 'index.html',
    }),
  ],
};