<script>
import Item from './Item.vue';
import Tree from './mixin/tree';
import Check from './mixin/check';
import VueVirtualScrollList from 'vue-virtual-scroll-list';

export default {
	name: 'VTree',

	mixins: [Tree, Check],

	provide() {
		return {
			root: this
		};
	},

	components: {
		VueVirtualScrollList
	},

	data() {
		return {
			itemComponent: Item,
			treeData: []
		};
	},

	methods: {
		renderScrollList() {
			if (this.localSearch.active && this.localSearch.noResults) {
				return (
					<div style={{ height: this.height }} class="empty-text">
						<span>暂无数据</span>
					</div>
				);
			}

			return (
				<vue-virtual-scroll-list
					class="v-tree-list"
					style={{ height: this.height }}
					data-key={this.nodeKey}
					data-sources={this.forest.normalizedOptions}
					data-component={Item}
				/>
			);
		}
	},

	render() {
		return <div class="v-tree">{this.renderScrollList()}</div>;
	}
};
</script>

<style scoped lang="scss">
.v-tree {
	.v-tree-list {
		overflow-y: auto;
	}

	.empty-text {
		font-size: 1rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}
}
</style>
