import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";

import SelectTree from "et-select-tree";
import "et-select-tree/src/select-tree.scss";

Vue.use(ElementUI);
Vue.use(SelectTree);
Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
