<template>
	<div id="app" class="app">
		<div class="menu-right">
			<el-menu :default-active="menu" class="menu">
				<el-menu-item v-for="route in routes" :key="route.name" :index="route.name" @click="onClick2Router(route)">
					<span>{{ (route.meta && route.meta.title) || route.name }}</span>
				</el-menu-item>
			</el-menu>
		</div>

		<router-view class="content-left" />
	</div>
</template>

<script>
import { routes } from '@/router';

export default {
	data() {
		return {
			menu: 'virtual-tree',
			routes: []
		};
	},

	created() {
		this.routes = routes.filter((route) => !route.meta?.hidden);
	},

	mounted() {
		this.menu = this.$route.name;
	},

	methods: {
		onClick2Router(route) {
			if (this.$route.path === route.path) return;

			this.$router.push(route.path);
		}
	}
};
</script>

<style>
#app {
	font-family: Avenir, Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	color: #2c3e50;
	width: 80%;
	margin: 0 auto;
	padding: 30px 0;
	height: 100vh;
	box-sizing: border-box;
	overflow: hidden;
}

.app {
	display: flex;
	flex-flow: row nowrap;

	.menu-right {
		width: 200px;
		margin-right: 10px;
	}

	.menu {
		height: 100%;
	}

	.content-left {
		flex: 1;
		overflow: auto;
		padding-right: 10px;
	}
}
</style>
