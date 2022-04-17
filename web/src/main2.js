import Vue from "vue";
import App2 from "./App2.vue";

Vue.config.productionTip = false;

// global mixin - that will inject 'baseUri' in every component
Vue.mixin({
  data() {
    return {
      baseUri: "",
    };
  },
  mounted() {
    const el = document.querySelector("input[data-base-uri]");
    if (!el) return;

    // Note the "data-base-uri" attribute in HTML is transformed in JS to 'baseUri'
    this.baseUri = el.dataset.baseUri;
    console.log('BaseUri', this.baseUri);
  },
});

new Vue({
  render: (h) => h(App2),
}).$mount("#app");
