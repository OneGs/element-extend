import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';

// ElementUI
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
Vue.use(ElementUI);

// vue-virtual-scroll-tree
import VueVirtualScrollTree from 'vue-virtual-scroll-tree';
Vue.use(VueVirtualScrollTree);

Vue.config.productionTip = false;

new Vue({
	router,
	store,
	render: (h) => h(App)
}).$mount('#app');
