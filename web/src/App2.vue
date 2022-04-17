<template>
  <div id="app">
    <!-- This will statically be build/compiled by vue-cli/webpack, e.g. image will be created in output folder and here replaced with proper path to it -->
    <!-- <img alt="Vue logo" src="./assets/logo.png" /> -->

    <!-- But this will not work in VSCode extention webview as it allows only certain absolute locations -->
    <img alt="Vue logo" :src="baseUri ? `${baseUri}/logo.png` : ''" />

    <HelloWorld :msg="`Welcome to web app App2 ${msg}`" />

    <button @click="openApp">Open web app App1</button>
  </div>
</template>

<script>
import HelloWorld from "./components/HelloWorld.vue";

export default {
  name: "App",
  components: {
    HelloWorld,
  },
  data() {
    return {
      msg: "",
    };
  },
  mounted() {
    // listen to messages from the webview
    window.addEventListener("message", this.receiveMessage);
  },
  methods: {
    receiveMessage(event) {
      if (!event) return;

      const envelope = event.data;
      switch (envelope.command) {
        case "message": {
          this.msg = envelope.data;
          break;
        }
      }
    },
    openApp() {
      // send messa to the extention's webview
      vscode.postMessage({
        type: "openPanelApp",
      });
    },
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
