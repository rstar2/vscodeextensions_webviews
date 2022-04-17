// @ts-check

const path = require("path");

/** @typedef {import('@vue/cli-service').ProjectOptions} VueCliConfig **/

/** @type VueCliConfig */
module.exports = {
  outputDir: path.resolve(__dirname, "../dist-web"),

  // Removing the hashes from the compiled file names.
  // The compiled JavaScript/CSS/Assets files will look like app.js (etc...) only without any hashes in the file name.
  filenameHashing: false,

  chainWebpack: (config) => {
    // use this source-map type as they don't produce 'eval(...)' in the script which is rejected
    // by the Content-Security-Policy used in the VSCode extension webview
    config.devtool('cheap-module-source-map');

    config.plugin("copy").tap(([pathConfigs]) => {
      const to = pathConfigs[0].to;
      // so the original `/public` folder keeps priority
      pathConfigs[0].force = true;


      // Copy to the destination directory the /web/img/ directory and all of its content.
      // add other locations.
      pathConfigs.unshift({
        from: "src/assets",
        to: `${to}`,
      });

      return [pathConfigs];
    });
  },

  // this is for allowing to build "two apps" from the same config with @vue/cli - very easy
  configureWebpack: (config)=> {
    config.entry = {
        app1: [
            './src/main1.js'
        ],
        app2: [
            './src/main2.js'
        ],
    };
  }
};
