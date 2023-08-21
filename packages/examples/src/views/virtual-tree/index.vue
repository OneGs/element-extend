<template>
	<div>
		<vue-virtual-scroll-tree :options="treeOptions" :normalizer="treeNormalizer" />
	</div>
</template>

<script>
import { treeData } from '@/views/virtual-tree/content';

export default {
	name: 'VirtualTree',

	data() {
		return {
			treeOptions: []
		};
	},

	methods: {
		treeNormalizer(item) {
			return { label: item.taskName };
		}
	},

	created() {
		this.treeOptions = treeData;
	}
};
</script>

<style scoped></style>
