# ru-fileflex README

## Add web app

Adding a web app inside a webview is easy - it's just HTML and JS/CSS,
the difficulty comes when it's created with tool like @vue/cli (or React CRA, ...)
where they have a build step (usually Webpack) that bundles the resources/assets (JS, CSS, images)

To make it work with Vue several things are done here:

1. Update the vue.config.js to augment the Webpack build step
    - remove output hashing
    - copy assets directly into the build/output folder
    - because of the CSP (content-security-policy) applied in the loaded webview HTML the JavaScripts must NOT contain *eval(...)* calls. In production build it's ok, but to work in development mode make the source-maps be *cheap-module-source-map*
2. Add a dynamic *baseUri* "param" (inserted as data attribute in a hidden input, but that is irrelevant)
    - *baseUri* is the allowed/registered local resources URI for the extension
3. Read this *baseUri* in runtime from the Vue app and set it as as base path for all requested images
    - to simplify this there's a global Vue mixin that adds the *baseUri* to each component and it can be used in the templates

## Add two web apps (for two different webviews for instance)

This is not relevant to developing VSCode extension that needs this.
This is simple for reusing the @vue/cli functionality to build two (or more) apps from the same codebase.
It's very simple in fact (at least 2 methods)

    > A handy tool of @vue/cli is ```vue inspect > webpack.config.json``` which will output the to-be-used Webpack configuration from the current vue.config.js (or if missing to see the default one used internally)

1. Use env variables like VUE_APP_BUILD_TARGET (VUE_APP_xxxxx variables are exposed to the client)
    - it can have values like "./App1.vue", "./App2.vue", ...)
    - in the main.js then use like

        ```js
            // get the starting root component
            const BUILD_TARGETS = {
                app1: './App1.vue',
                app2: './App2.vue',
            };
            const path = BUILD_TARGETS[process.env.VUE_APP_BUILD_TARGET] || BUILD_TARGETS.app1;

            // dynamic loading supported by Webpack 
            import(`${path}`).then(({ default: App }) =>
                new Vue({
                    render: h => h(App),
                }).$mount('#app')
            );
        ```

    - separate build scripts like ```VUE_APP_BUILD_TARGET=app1 npm run build/dev```
    - this is not so nice - the output JS will be overwritten if built one be one the two apps

2. Augment the Webpack config as @vue/cli allows exposes low-level configuration (as apposed to React CRA)
    - just give Webpack multiple entry points, by default its config is:

        ```json
            ...,
            entry: {
                app: [
                    './src/main.js'
                ]
            }
        ```

    - so update it using configureWebpack inside vue.config.js like this:

        ```json
            ...,
            entry: {
                app1: './src/main1.js',
                app2: './src/main2.js'
            }
        ```

3. Make use of @vue/cli "pages" - https://cli.vuejs.org/config/#pages