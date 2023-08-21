import VueVirtualScrollList from 'vue-virtual-scroll-list';
import VueVirtualScrollTree from './src/index.vue';

VueVirtualScrollTree.install = (Vue) => {
	Vue.component('VueVirtualScrollList', VueVirtualScrollList);
	Vue.component('VueVirtualScrollTree', VueVirtualScrollTree);
};

export default VueVirtualScrollTree;
