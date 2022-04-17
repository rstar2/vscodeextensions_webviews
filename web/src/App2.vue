<template>
  <div id="app">
      <!-- This will statically be build/compiled by vue-cli/webpack, e.g. image will be created in output folder and here replaced with proper path to it -->
    <!-- <img alt="Vue logo" src="./assets/logo.png" /> -->
    
    <!-- But this will not work in VSCode extention webview as it allows only certain absolute locations -->
    <img alt="Vue logo" :src="baseUri ? `${baseUri}/logo.png` : ''" />



    <HelloWorld msg="Welcome to Your Vue.js App2" />
  </div>
</template>

<script>
import HelloWorld from "./components/HelloWorld.vue";

export default {
  name: "App",
  components: {
    HelloWorld,
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
