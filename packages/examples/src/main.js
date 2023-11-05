import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';

// ElementUI
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
Vue.use(ElementUI);

// vue-virtual-scroll-tree
import VueVirtualScrollTree from 'vue-2-virtual-scroll-tree';
Vue.use(VueVirtualScrollTree);

// normalize.css
import 'normalize.css';

// styles
import '@/styles/index.scss';

Vue.config.productionTip = false;

new Vue({
	router,
	store,
	render: (h) => h(App)
}).$mount('#app');
