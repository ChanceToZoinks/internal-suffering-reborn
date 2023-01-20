const CopyPlugin = require("copy-webpack-plugin");
const path = require('path');

module.exports = {
  entry: './src/ts/setup.ts',
  experiments: {
    outputModule: true
  },
  devtool: 'source-map',
  plugins: [
    new CopyPlugin({
      patterns: [{ from: "manifest.json", to: "manifest.json" }]
    })
  ],
  mode: "production",
  module: {
    generator: {
      "asset/resource": {
        publicPath: "img/",
        outputPath: "img/",
        filename: "[name][ext]"
      }
    },
    rules: [
      {
        test: /\.tsx?$|\.mts/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: "asset/resource"
      },
    ],
  },
  resolve: {
    extensions: ['.mts', '.tsx', '.ts', '.js'],
  },
  output: {
    filename: "setup.mjs",
    path: path.resolve(__dirname, "packed"),
    library: {
      type: "module"
    },
    clean: true
  },
};
