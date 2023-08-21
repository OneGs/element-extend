<template>
	<div id="app" class="app">
		<div class="menu-right">
			<el-menu v-model="menu">
				<el-menu-item v-for="route in routes" :key="route.name" :index="route.name">
					<router-link :to="route.path">{{ (route.meta && route.meta.title) || route.name }}</router-link>
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
			menu: null,
			routes: []
		};
	},

	created() {
		this.routes = routes.filter((route) => !route.meta?.hidden);
	},

	mounted() {
		this.menu = this.$route.name;
	}
};
</script>

<style>
body {
	margin: 0;
}

#app {
	font-family: Avenir, Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	color: #2c3e50;
	width: 80%;
	margin: 0 auto;
	padding: 30px 0;
}

.app {
	display: flex;
	flex-flow: row nowrap;

	.menu-right {
		width: 200px;
		margin-right: 10px;
	}

	.content-left {
		flex: 1;
		margin-left: 10px;
	}
}
</style>
