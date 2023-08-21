<script>
import { CHECKED, INDETERMINATE } from './constants';

export default {
	name: 'ItemIndex',

	inject: ['root'],

	props: {
		source: {
			type: Object,
			default: () => ({})
		}
	},

	computed: {
		raw() {
			return this.source.raw;
		},

		nodeLevel() {
			return this.source.level;
		},

		hasChildren() {
			return this.source.hasChildren;
		},

		indentLength() {
			return this.hasChildren ? 12 * this.nodeLevel : 12 * this.nodeLevel + 24;
		},

		isExpanded() {
			return this.source.isExpanded;
		},

		isFocused() {
			return this.source.isFocused;
		},

		isHighlight() {
			return this.root.highlightCurrent;
		},

		showCheckbox() {
			return this.root.showCheckbox;
		},

		hasDisabledDescendants() {
			return this.source.hasDisabledDescendants;
		},

		disabled() {
			return this.root.disabled || this.source.isDisabled || this.hasDisabledDescendants;
		}
	},

	created() {},

	methods: {
		handlerIconClick(evt) {
			evt.preventDefault();
			evt.stopPropagation();
			// eslint-disable-next-line vue/no-mutating-props
			this.source.isExpanded = !this.isExpanded;
			this.root.updateNormalizeOptions();
			this.root.emitEvent('icon-click');
		},

		handlerItemClick(isCheckClick = false) {
			const { root } = this;

			if (root.oldSource) {
				root.oldSource.isFocused = false;
			}

			// eslint-disable-next-line vue/no-mutating-props
			this.source.isFocused = true;
			root.emitEvent('node-click', this.source, root.oldSource);

			// node-click交互方式
			if (
				/* 不能为Check */ !isCheckClick &&
				/* 允许点击展开 */ (root.expandOnClickNode ||
					/* 禁用选项 */ root.disabled ||
					/* 禁止分支选项 */ this.hasDisabledDescendants)
			) {
				root.toggleNode(this.source, !this.isExpanded);
			} else {
				if (root.showCheckbox) root.select(this.source);
			}

			root.oldSource = this.source;
		},

		handlerCheckBoxClick(evt) {
			evt.preventDefault();
			evt.stopPropagation();
			this.handlerItemClick(true);
		},

		renderIcon() {
			if (!this.hasChildren) return;

			const classes = {
				[this.root.iconClass]: true,
				'expand-icon': true,
				'is-expanded': this.isExpanded
			};

			return <div class={classes} onClick={this.handlerIconClick} />;
		},

		renderIndent() {
			const style = { width: this.indentLength + 'px' };

			return <div style={style} />;
		},

		renderCheckbox() {
			if (!this.showCheckbox) return;

			const { root } = this;
			const checkedState = root.forest.checkedStateMap[this.source.id];

			return (
				<ElCheckbox
					style={{ marginRight: '4px', fontSize: '10px' }}
					value={checkedState === CHECKED}
					disabled={this.disabled}
					indeterminate={checkedState === INDETERMINATE}
					nativeOnMousedown={(evt) => evt.preventDefault()}
					nativeOnClick={(evt) => this.handlerCheckBoxClick(evt)}
				/>
			);
		},

		renderSource() {
			return <div class="node-label">{this.source.label}</div>;
		}
	},

	render() {
		const classes = {
			item: true,
			'is-focused': this.isFocused,
			'is-highlight': this.isHighlight && this.isFocused
		};

		return (
			<div class={classes} onClick={() => this.handlerItemClick(false)}>
				{this.renderIndent()}
				{this.renderIcon()}
				{this.renderCheckbox()}
				{this.renderSource()}
			</div>
		);
	}
};
</script>

<style scoped lang="scss">
.item {
	cursor: pointer;
	display: flex;
	align-items: center;
	line-height: 2;
	transition: all 0.08s ease-in-out;

	&:hover {
		background-color: #f5f7fa;
	}
}

.expand-icon {
	cursor: pointer;
	color: #c0c4cc;
	font-size: 12px;
	padding: 6px;
	transform: rotate(0deg);
	transition: transform 0.3s ease-in-out;
}

.node-label {
	font-size: 14px;
	margin-left: 3px;
}

.is-expanded {
	transform: rotate(90deg);
}

.is-highlight {
	background-color: #f5f7fa;
}
</style>
