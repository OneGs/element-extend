<template>
	<div class="tree-container">
		<h2>基础操作</h2>
		<div style="line-height: 2">
			<div>用清晰的层级结构展示信息，可展开或折叠。</div>
			<div>默认采用虚拟结构，支持处理大量数据并保证高效性。</div>
		</div>
		<el-row class="example-item">
			<el-col :span="6" class="col-item">
				<vue-virtual-scroll-tree
					height="360px"
					:options="treeOptions"
					:normalizer="treeNormalizer"
					itemWrapClass="item-style"
					@node-click="nodeClick"
					@icon-click="iconClick"
				/>
			</el-col>
			<el-col :span="18" class="col-item">
				<div style="padding: 10px 20px; line-height: 2">
					<div>icon-click事件点击次数：{{ this.baseMode.iconClickCount }}</div>
					<div>
						node-click事件返回值：<span style="color: #eb5384">新值</span>：{{ this.baseMode.item.taskName }}
						<span style="color: #eb5384">旧值</span>：{{ (this.baseMode.oldItem || {}).taskName }}
					</div>
				</div>
			</el-col>
		</el-row>

		<h2>选择操作</h2>
		<div style="line-height: 2">
			<div>适用于需要选择层级时使用。</div>
			<div style="margin-top: 10px">选中值：{{ this.echoValue() }}</div>
		</div>
		<el-row class="example-item">
			<el-col :span="6" class="col-item">
				<vue-virtual-scroll-tree
					v-model="selectMode.value"
					height="360px"
					showCheckbox
					:options="treeOptions"
					:normalizer="treeNormalizer"
					:flat="selectMode.isFlat"
					:multiple="selectMode.isMultiple"
					:sortValueBy="selectMode.sortValueBy"
					:valueFormat="selectMode.valueFormat"
					:valueConsistsOf="selectMode.valueConsistsOf"
					itemWrapClass="item-style"
					@selected="handler2Select"
				/>
			</el-col>
			<el-col :span="18" class="col-item">
				<div style="padding: 0 20px; line-height: 2">
					<el-radio-group v-model="selectMode.isMultiple">
						<el-radio :label="false">单选</el-radio>
						<el-radio :label="true">多选</el-radio>
					</el-radio-group>

					<div style="margin-top: 10px">
						对于值的选择，提供了丰富的选择模式。
						<ul>
							<li>分支优先：当子节点全部选中时，只返回分支节点（默认）</li>
							<li>叶子优先：当子节点全部选中时，只返回叶子节点，不返回分支节点</li>
							<li>所有选中：标准模式，返回选中节点</li>
							<li>所有选中以及半选中：标准模式，返回选中节点同时返回半选中的分支节点</li>
						</ul>
					</div>
					<div>
						<el-radio-group v-model="selectMode.valueConsistsOf">
							<el-radio :label="'BRANCH_PRIORITY'">分支优先</el-radio>
							<el-radio :label="'LEAF_PRIORITY'">叶子优先</el-radio>
							<el-radio :label="'ALL'">所有选中</el-radio>
							<el-radio :label="'ALL_WITH_INDETERMINATE'">所有选中以及半选中</el-radio>
						</el-radio-group>
					</div>

					<div style="margin-top: 10px">
						由于提供了单选、多选模式，单选时可能需要一个对象而不是数组。又或不需要返回id数组，而是value数组等
						<div>允许你通过配置自定义输出内容，valueFormat: [id | object]|[string | array]</div>
						<div>接受 id|string 模式，第一个值表示返回内容为id还是对象，第二个值描述返回对象(string标识)还是数组</div>
					</div>
					<el-radio-group style="margin: 20px 0" v-model="selectMode.valueFormat">
						<el-radio :label="'id|array'">id|array（默认）</el-radio>
						<el-radio :label="'id|string'">id|string</el-radio>
						<el-radio :label="'object|string'">object|string（同object|array）</el-radio>
						<el-radio :label="'object|array'">object|array</el-radio>
					</el-radio-group>

					<div style="margin-top: 10px">
						值选择完成后，可以根据情况对值进行排序。
						<ul>
							<li>按选择顺序：字面意思，选择时决定顺序（默认）</li>
							<li>按层级深度：层级越高排序越靠后，同级按显示循序排序</li>
							<li>按索引：按字母从小到到排序 A->B，中文排序则会存在问题</li>
						</ul>
					</div>
					<el-radio-group v-model="selectMode.sortValueBy">
						<el-radio :label="'ORDER_SELECTED'">按选择顺序</el-radio>
						<el-radio :label="'LEVEL'">按层级深度</el-radio>
						<el-radio :label="'INDEX'">按索引</el-radio>
					</el-radio-group>

					<div style="margin-top: 10px">
						平铺模式允许选择任何一个层级。平铺模式会导致值选择模式。
						<ul>
							<li>正常模式：选择父级子级也会被选中（默认）</li>
							<li>平铺模式：子级、父级独立，选中后互不影响</li>
						</ul>
					</div>
					<el-radio-group v-model="selectMode.isFlat">
						<el-radio :label="false">正常模式</el-radio>
						<el-radio :label="true">平铺模式</el-radio>
					</el-radio-group>
				</div>
			</el-col>
		</el-row>

		<h2>搜索</h2>
		<div style="line-height: 2">
			<div>提供了丰富的搜索功能。通过matchKeys（默认为label）可以设置匹配字段。</div>
		</div>
		<el-row class="example-item">
			<el-col :span="6" class="col-item">
				<vue-virtual-scroll-tree
					height="360px"
					showCheckbox
					:options="treeOptions"
					:normalizer="treeNormalizer"
					itemWrapClass="item-style"
					:searchText="searchFilter.name"
					v-bind="searchFilterCheck"
				/>
			</el-col>
			<el-col :span="18" class="col-item">
				<div style="padding: 0 20px; line-height: 2">
					<el-checkbox-group v-model="searchFilter.check">
						<el-checkbox label="disableFuzzyMatching">禁用模糊匹配（默认）</el-checkbox>
						<el-checkbox label="flattenSearchResults">搜索平铺结果</el-checkbox>
						<el-checkbox label="searchNested">开启深度搜索</el-checkbox>
					</el-checkbox-group>

					<el-form inline style="margin-top: 10px">
						<el-form-item label="名称">
							<el-input v-model="searchFilter.name" placeholder="输入关键字进行过滤" clearable size="small" />
						</el-form-item>
					</el-form>
				</div>
			</el-col>
		</el-row>
	</div>
</template>

<script>
import { treeData } from '@/views/virtual-tree/content';

export default {
	name: 'VirtualTree',

	data() {
		return {
			treeOptions: [],
			// base
			baseSelect: {},
			baseMode: {
				item: {},
				oldItem: {},
				iconClickCount: 0
			},
			// select
			selectSelect: {},
			selectMode: {
				value: null,
				isFlat: false,
				isMultiple: true,
				valueFormat: 'id|array',
				sortValueBy: 'ORDER_SELECTED',
				valueConsistsOf: 'BRANCH_PRIORITY'
			},
			//search
			searchFilter: {
				name: '',
				check: ['disableFuzzyMatching']
			}
		};
	},

	computed: {
		searchFilterCheck() {
			if (!this.searchFilter.check.length) return {};

			return this.searchFilter.check.reduce((obj, item) => {
				obj[item] = true;
				return obj;
			}, {});
		}
	},

	methods: {
		treeNormalizer(item) {
			return { label: item.taskName };
		},

		nodeClick(item, oldItem) {
			this.baseMode.item = item;
			this.baseMode.oldItem = oldItem;
		},

		iconClick() {
			this.baseMode.iconClickCount += 1;
		},

		echoValue() {
			if (!this.selectMode.value) return;

			const first = this.selectMode.value[0];

			if (!first) return;

			if (typeof first === 'string') return this.selectMode.value;

			return this.selectMode.value.map((val) => val.raw.taskName);
		},

		handler2Select(node, nodes, status) {
			console.log(node, nodes, status);
		}
	},

	created() {
		this.treeOptions = treeData;
	}
};
</script>

<style scoped lang="scss">
.example-item {
	height: 360px;
	margin-top: 10px;
	overflow: hidden;
}

.tree-container {
	margin-left: 40px;
}

.col-item {
	height: 100%;
	overflow: auto;
}

::v-deep {
	.item-style {
		border-radius: 4px;
		padding: 3px 0;
	}
}
</style>
