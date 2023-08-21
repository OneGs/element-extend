import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

const routes = [
	{
		path: '/',
		name: 'home',
		redirect: '/virtual-tree',
		meta: {
			hidden: true
		}
	},
	{
		path: '/virtual-tree',
		name: 'virtual-tree',
		component: () => import('@/views/virtual-tree/index.vue'),
		meta: { title: '树' }
	},
	{
		path: '/select-tree',
		name: 'select-tree',
		component: () => import('@/views/SelectTree.vue'),
		meta: { title: '树选择器' }
	}
];

const router = new VueRouter({
	mode: 'history',
	// eslint-disable-next-line no-undef
	base: process.env.BASE_URL,
	routes
});

export default router;

export { routes };
