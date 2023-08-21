import {
	UNCHECKED,
	CHECKED,
	INDETERMINATE,
	NO_PARENT_NODE,
	BRANCH_PRIORITY,
	ALL,
	LEAF_PRIORITY,
	ALL_WITH_INDETERMINATE,
	LEVEL,
	INDEX,
	ORDER_SELECTED
} from '../constants';
import { createMap, includes, sortValueByLevel, sortValueByIndex, quickDiff } from '../tools';

export default {
	props: {
		showCheckbox: {
			type: Boolean,
			default: false
		},

		disabled: {
			type: Boolean,
			default: false
		},

		multiple: {
			type: Boolean,
			default: true
		},

		// When user selects a node, automatically select its ancestors. Applies to flat mode only.
		autoSelectAncestors: {
			type: Boolean,
			default: false
		},

		// When user selects a node, automatically select its descendants. Applies to flat mode only.
		autoSelectDescendants: {
			type: Boolean,
			default: false
		},

		// When user deselects a node, automatically deselect its ancestors. Applies to flat mode only.
		autoDeselectAncestors: {
			type: Boolean,
			default: false
		},

		// When user deselects a node, automatically deselect its descendants. Applies to flat mode only.
		autoDeselectDescendants: {
			type: Boolean,
			default: false
		},

		// When an ancestor node is selected/deselected, whether its disabled descendants should be selected/deselected.
		// You may want to use this in conjunction with allowClearingDisabled prop
		allowSelectingDisabledDescendants: {
			type: Boolean,
			default: false
		},

		flat: {
			type: Boolean,
			default: false
		},

		/**
		 * The value of the control.
		 * Should be `id` or `node` object for single-select mode, or an array of `id` or `node` object for multi-select mode.
		 * Its format depends on the `valueFormat` prop.
		 * For most cases, just use `v-model` instead.
		 * @type {?Array}
		 */
		value: null,

		/**
		 * Format of `value` prop.
		 * Note that, when set to `"object"`, only `id` & `label` properties are required in each `node` object in `value` prop.
		 * Acceptable values:
		 *   - "id"
		 *   - "object"
		 */
		valueFormat: {
			type: String,
			default: 'id|array'
		},

		delimiter: {
			type: String,
			default: ','
		},

		valueConsistsOf: {
			type: String,
			default: BRANCH_PRIORITY,
			validator(value) {
				const acceptableValues = [ALL, BRANCH_PRIORITY, LEAF_PRIORITY, ALL_WITH_INDETERMINATE];

				return includes(acceptableValues, value);
			}
		},

		sortValueBy: {
			type: String,
			default: ORDER_SELECTED,
			validator(value) {
				const acceptableValues = [ORDER_SELECTED, LEVEL, INDEX];
				return includes(acceptableValues, value);
			}
		}
	},

	computed: {
		selectedNodes() {
			return this.forest.selectedNodeIds.map(this.getNode);
		},

		single() {
			return !this.multiple;
		},

		internalValue() {
			let internalValue;

			if (this.single || this.flat || this.disableBranchNodes || this.valueConsistsOf === ALL) {
				internalValue = this.forest.selectedNodeIds.slice();
			} else if (this.valueConsistsOf === BRANCH_PRIORITY) {
				internalValue = this.forest.selectedNodeIds.filter((id) => {
					const node = this.getNode(id);
					if (node.isRootNode) return true;
					return !this.isSelected(node.parentNode);
				});
			} else if (this.valueConsistsOf === LEAF_PRIORITY) {
				internalValue = this.forest.selectedNodeIds.filter((id) => {
					const node = this.getNode(id);
					if (node.isLeaf) return true;
					return !node.hasChildren;
				});
			} else if (this.valueConsistsOf === ALL_WITH_INDETERMINATE) {
				const indeterminateNodeIds = [];
				internalValue = this.forest.selectedNodeIds.slice();
				this.selectedNodes.forEach((selectedNode) => {
					selectedNode.ancestors.forEach((ancestor) => {
						if (includes(indeterminateNodeIds, ancestor.id)) return;
						if (includes(internalValue, ancestor.id)) return;
						indeterminateNodeIds.push(ancestor.id);
					});
				});
				internalValue.push(...indeterminateNodeIds);
			}

			if (this.sortValueBy === LEVEL) {
				internalValue.sort((a, b) => sortValueByLevel(this.getNode(a), this.getNode(b)));
			} else if (this.sortValueBy === INDEX) {
				internalValue.sort((a, b) => sortValueByIndex(this.getNode(a), this.getNode(b)));
			}

			return internalValue;
		},

		/**
		 * Has any option been selected?
		 * @type {boolean}
		 */
		hasValue() {
			return this.internalValue.length > 0;
		}
	},

	watch: {
		internalValue(newValue, oldValue) {
			const hasChanged = quickDiff(newValue, oldValue);
			// Vue would trigger this watcher when `newValue` and `oldValue` are shallow-equal.
			// We emit the `input` event only when the value actually changes.
			if (hasChanged) {
				this.$emit('input', this.getValue());
			}
		},

		value: {
			handler() {
				const nodeIdsFromValue = this.extractCheckedNodeIdsFromValue();
				// true when changed from outer
				const hasChanged = quickDiff(nodeIdsFromValue, this.internalValue);
				if (hasChanged) this.fixSelectedNodeIds(nodeIdsFromValue);
			}
		}
	},

	methods: {
		/* ----------------------------------------------------------------
		 * ---------------节点选择 START---------------------------
		 * ---------------------------------------------------------------- */

		/* checkBox */
		select(node) {
			if (this.disabled || node.isDisabled) return;

			const nextState = !this.isSelected(node);

			if (nextState) {
				this._selectNode(node);
			} else {
				this._deselectNode(node);
			}

			this.buildForestState();

			if (nextState) {
				this.$emit('select', node);
			} else {
				this.$emit('deselect', node);
			}
		},

		// This is meant to be called only by `select()`.
		_selectNode(node) {
			if (this.single || this.disableBranchNodes) {
				this.single && this.clearValue();

				return this.addValue(node);
			}

			// 平铺模式 TODO
			if (this.flat) {
				this.addValue(node);

				if (this.autoSelectAncestors) {
					node.ancestors.forEach((ancestor) => {
						if (!this.isSelected(ancestor) && !ancestor.isDisabled) {
							this.addValue(ancestor);
						}
					});
				} else if (this.autoSelectDescendants) {
					this.traverseDescendantsBFS(node, (descendant) => {
						if (!this.isSelected(descendant) && !descendant.isDisabled) {
							this.addValue(descendant);
						}
					});
				}

				return;
			}

			const isFullyChecked =
				node.isLeaf ||
				/* node.isBranch && */ !node.hasDisabledDescendants ||
				/* node.isBranch && */ this.allowSelectingDisabledDescendants;

			// 类似全选的操作
			if (isFullyChecked) {
				this.addValue(node);
			}

			// 分支则递归修改
			if (node.isBranch) {
				this.traverseDescendantsBFS(node, (descendant) => {
					if (!descendant.isDisabled || this.allowSelectingDisabledDescendants) {
						this.addValue(descendant);
					}
				});
			}

			// 子节点全选后，父节点是否也全选了
			if (isFullyChecked) {
				let curr = node;
				while ((curr = curr.parentNode) !== NO_PARENT_NODE) {
					if (curr.children.filter((_) => !_.isDisabled).every(this.isSelected)) this.addValue(curr);
					else break;
				}
			}
		},

		// This is meant to be called only by `select()`.
		_deselectNode(node) {
			if (this.disableBranchNodes) {
				return this.removeValue(node);
			}

			if (this.flat) {
				this.removeValue(node);

				if (this.autoDeselectAncestors) {
					node.ancestors.forEach((ancestor) => {
						if (this.isSelected(ancestor) && !ancestor.isDisabled) {
							this.removeValue(ancestor);
						}
					});
				} else if (this.autoDeselectDescendants) {
					this.traverseDescendantsBFS(node, (descendant) => {
						if (this.isSelected(descendant) && !descendant.isDisabled) {
							this.removeValue(descendant);
						}
					});
				}

				return;
			}

			let hasUncheckedSomeDescendants = false;
			if (node.isBranch) {
				this.traverseDescendantsDFS(node, (descendant) => {
					if (!descendant.isDisabled || this.allowSelectingDisabledDescendants) {
						this.removeValue(descendant);
						hasUncheckedSomeDescendants = true;
					}
				});
			}

			if (node.isLeaf || /* node.isBranch && */ hasUncheckedSomeDescendants) {
				this.removeValue(node);

				let curr = node;
				while ((curr = curr.parentNode) !== NO_PARENT_NODE) {
					if (this.isSelected(curr)) this.removeValue(curr);
					else break;
				}
			}
		},

		isSelected(node) {
			// whether a node is selected (single-select mode) or fully-checked (multi-select mode)
			return this.forest.selectedNodeMap[node.id] === true;
		},

		buildForestState() {
			const selectedNodeMap = createMap();

			this.forest.selectedNodeIds.forEach((selectedNodeId) => {
				selectedNodeMap[selectedNodeId] = true;
			});
			this.forest.selectedNodeMap = selectedNodeMap;

			const checkedStateMap = createMap();
			if (this.multiple) {
				this.traverseAllNodesByIndex((node) => {
					checkedStateMap[node.id] = UNCHECKED;
				});

				this.selectedNodes.forEach((selectedNode) => {
					checkedStateMap[selectedNode.id] = CHECKED;

					if (!this.flat && !this.disableBranchNodes) {
						if (!selectedNode.ancestors) return;

						selectedNode.ancestors.forEach((ancestorNode) => {
							if (!this.isSelected(ancestorNode)) {
								checkedStateMap[ancestorNode.id] = INDETERMINATE;
							}
						});
					}
				});
			}
			if (this.single) {
				this.selectedNodes.forEach((selectedNode) => {
					checkedStateMap[selectedNode.id] = CHECKED;
				});
			}
			this.forest.checkedStateMap = checkedStateMap;
		},

		addValue(node) {
			// value is there
			if (this.isSelected(node)) return;

			this.forest.selectedNodeIds.push(node.id);
			this.forest.selectedNodeMap[node.id] = true;
		},

		removeValue(node) {
			function removeFromArray(arr, elem) {
				const idx = arr.indexOf(elem);
				if (idx !== -1) arr.splice(idx, 1);
			}

			removeFromArray(this.forest.selectedNodeIds, node.id.toString());
			delete this.forest.selectedNodeMap[node.id.toString()];
		},

		clearValue() {
			this.forest.selectedNodeIds = [];
			this.forest.selectedNodeMap = createMap();
		},

		getValue() {
			let [formatter, combain] = this.valueFormat.split('|');

			if (!['id', 'object'].includes(formatter)) formatter = 'id';
			if (!['string', 'array'].includes(combain)) combain = 'array';

			let raws;
			if (formatter === 'id') raws = this.internalValue.slice();
			if (formatter === 'object') raws = this.internalValue.map((id) => this.getNode(id));

			// change data to string
			if (formatter === 'id' && combain === 'string') {
				raws = raws.join(this.delimiter);
				return raws;
			}

			// change data to single
			if (this.single && combain !== 'array') {
				raws = raws[0];
			}

			return raws;
		},

		/* ----------------------------------------------------------------
		 * --------------- END ---------------------------
		 * ---------------------------------------------------------------- */

		/* ----------------------------------------------------------------
		 * --------------- 节点选择回显相关 START ---------------------------
		 * ---------------------------------------------------------------- */
		fixSelectParentNode(queue, nextSelectedNodeIds) {
			const map = createMap();

			while (queue.length) {
				const nodeId = queue.shift();
				const node = this.getNode(nodeId);
				nextSelectedNodeIds.push(nodeId);
				if (node.isRootNode) continue; // root is branch. not parentNode

				const parentNode = node.parentNode;
				if (!(parentNode.id in map)) {
					// recode id of parentNode
					map[parentNode.id] = parentNode.children.filter((child) => !child.isDisabled).length; // need exclude disabled chid
				}

				if (--map[parentNode.id] === 0)
					// set id of parentNode when has only one child
					queue.push(parentNode.id);
			}
		},

		fixSelectedNodeIds(nodeIdListOfPrevValue) {
			let nextSelectedNodeIds = [];

			if (this.single || this.flat || this.disableBranchNodes || this.valueConsistsOf === ALL) {
				nextSelectedNodeIds = nodeIdListOfPrevValue;
			} else if (this.valueConsistsOf === BRANCH_PRIORITY) {
				nodeIdListOfPrevValue.forEach((nodeId) => {
					nextSelectedNodeIds.push(nodeId);
					const node = this.getNode(nodeId);
					if (node.isBranch) {
						this.traverseDescendantsBFS(node, (descendant) => {
							!descendant.isDisabled && nextSelectedNodeIds.push(descendant.id);
						});
					}
				});
			} else if (this.valueConsistsOf === LEAF_PRIORITY) {
				this.fixSelectParentNode(nodeIdListOfPrevValue.slice(), nextSelectedNodeIds);
			} else if (this.valueConsistsOf === ALL_WITH_INDETERMINATE) {
				// filter isBreach node
				const queue = nodeIdListOfPrevValue.filter((nodeId) => {
					const node = this.getNode(nodeId);
					return node.isLeaf || node.children.length === 0;
				});

				// select parentNode when has only one child
				this.fixSelectParentNode(queue, nextSelectedNodeIds);
			}

			const hasChanged = quickDiff(this.forest.selectedNodeIds, nextSelectedNodeIds);

			// If `nextSelectedNodeIds` doesn't actually differ from old `selectedNodeIds`,
			// we don't make the assignment to avoid triggering its watchers which may cause
			// unnecessary calculations.
			if (hasChanged) this.forest.selectedNodeIds = nextSelectedNodeIds;

			this.buildForestState();
		},

		extractCheckedNodeIdsFromValue() {
			let [formatter, combain] = this.valueFormat.split('|');

			if (!['id', 'object'].includes(formatter)) formatter = 'id';
			if (!['string', 'array'].includes(combain)) combain = 'array';
			if (this.value == null) return [];

			if (formatter === 'id') {
				if (combain === 'string') return this.value.split(this.delimiter).filter(Boolean);
				return Array.isArray(this.value) ? this.value : [this.value];
			}

			const valued = Array.isArray(this.value) ? this.value : [this.value];
			if (typeof valued[0] !== 'object') {
				console.warn(`${this.valueFormat} is suit for data. it turn to string.`);
				return valued;
			}

			return valued.map((node) => this.enhancedNormalizer(node)).map((node) => node.id);
		},

		enhancedNormalizer(raw) {
			return {
				raw,
				...this.normalizer(raw),
				id: raw.id,
				label: raw.label,
				parentId: raw.parentId
			};
		}
	}
};
