const path = require('path');

module.exports = {
    entry: './content/content.js',
    output: {
        filename: 'content.bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
    devtool: 'source-map',
    mode: 'development',
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            },
        ],
    },
    resolve: {
        extensions: ['.js'],
    },
};