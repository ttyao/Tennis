var path = require('path');

module.exports = {
  entry: [
    path.resolve(__dirname, 'app/main.js')
  ],
  output: {
      path: path.resolve(__dirname, 'build'),
      filename: 'bundle.js',
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['es2015', 'react']
        }
      }, {
        test: /\.css$/, // Only .css files
        loader: 'style!css' // Run both loaders
      }, {
        test: /\.less$/,
        loader: "style!css!less"
      }, {
        test: /\.scss$/,
        loaders: ["style", "css", "sass"]
      }
    ]
  },
};
