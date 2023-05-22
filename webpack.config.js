const path = require('node:path');
const webpack = require('webpack');
const stripIndent = require('common-tags').stripIndent;

module.exports = {
    entry: './src/index.ts',
    devtool: 'inline-source-map',
    mode: 'development',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'lib.tsc.user.js',
    },
    plugins: [
        new webpack.BannerPlugin({
            raw: true,
            banner: stripIndent`
                // ==UserScript==
                // @name            TSC Spies
                // @namespace       Torn Stats Central
                // @version         1.1.2
                // @author          mitza [2549762]
                // @description     Thanks mitza! <3
                // @copyright       2023, diicot.cc
                // @grant           GM_addStyle
                // @grant           GM.setValue
                // @grant           GM.getValue
                // @grant           GM_xmlhttpRequest
                // @run-at          document-end
                // @match           https://www.torn.com/profiles.php?*
                // @icon            https://www.google.com/s2/favicons?sz=64&domain=torn.com
                // @updateURL       https://github.com/LeoMavri/torn-stats-central-script/raw/main/dist/lib.tsc.user.js
                // @downloadURL     https://github.com/LeoMavri/torn-stats-central-script/raw/main/dist/lib.tsc.user.js
                // ==/UserScript==`,
        }),
    ],
};
