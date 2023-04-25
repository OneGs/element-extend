<script>
import ElCollapseTransition from 'element-ui/src/transitions/collapse-transition';
import ElCheckbox from 'element-ui/packages/checkbox';
import Emitter from 'element-ui/src/mixins/emitter';
import { onLeftClick } from './utils';
import {CHECKED, INDETERMINATE} from './constants';

let arrowPlaceholder;

const Option = {
  name: 'vue-treeselect--option',

  components: { ElCollapseTransition, ElCheckbox },

  inject: ['instance'],

  mixins: [Emitter],

  props: {
    node: {
      type: Object,
      required: true
    }
  },

  computed: {
    shouldExpand() {
      const { instance, node } = this;

      return node.isBranch && instance.shouldExpand(node) && (!node.childrenStates || !node.childrenStates.isLoading);
    },

    shouldShow() {
      const { instance, node } = this;

      return instance.shouldShowOptionInMenu(node);
    }
  },

  watch: {
    shouldExpand() {
      this.$nextTick(() => {
        setTimeout(() => {
          // wait menu re-render then re-calculate popper
          this.dispatch('ElSelectDropdown', 'updatePopper');
        }, 300);
      });
    }
  },

  methods: {
    renderOption(listItemStyles) {
      const { instance, node } = this;
      const optionClass = {
        'el-select-tree__option': true,
        'el-select-tree__option--disabled': node.isDisabled,
        'el-select-tree__option--selected': instance.isSelected(node),
        'el-select-tree__option--highlight': node.isHighlighted,
        'el-select-tree__option--matched':
          instance.localSearch.active && node.isMatched,
        'is-flat-result': instance.flattenSearchResults || !instance.hasBranchNodes,
        'el-select-tree__option--hide': !this.shouldShow
      };

      return (
        <div
          class={optionClass}
          style={listItemStyles}
          onMouseenter={this.handleMouseEnterOption}
          data-id={node.id}>
          {this.renderArrow()}
          {this.renderLabelContainer([
            this.renderCheckboxContainer([this.renderCheckbox()]),
            this.renderLoadingChildrenTip(),
            this.renderLabel()
          ])}
        </div>
      );
    },

    renderSubOptionsList() {
      if (!this.shouldExpand) return null;

      return (
        <div class="el-select-tree__list">
          {this.renderSubOptions()}
          {this.renderNoChildrenTip()}
          {this.renderLoadingChildrenErrorTip()}
        </div>
      );
    },

    renderArrow() {
      const { instance, node } = this;

      if (instance.shouldFlattenOptions && this.shouldShow) return null;

      if (node.isBranch) {
        const arrowClass = {
          'el-icon-caret-right': true,
          'el-select-tree__icon-item': true,
          'el-select-tree__option-arrow--rotated': this.shouldExpand
        };

        return (
          <div
            class="el-select-tree__option-arrow-container"
            onMousedown={this.handleMouseDownOnArrow}>
            <i class={arrowClass} />
          </div>
        );
      }

      // For leaf nodes, we render a placeholder to keep its label aligned to
      // branch nodes. Unless there is no branch nodes at all (a normal
      // non-tree select).
      if (/* node.isLeaf && */ instance.hasBranchNodes) {
        if (!arrowPlaceholder) {
          arrowPlaceholder = (
            <div class="el-select-tree__option-arrow-placeholder">&nbsp;</div>
          );
        }

        return arrowPlaceholder;
      }

      return null;
    },

    renderLabelContainer(children) {
      return (
        <div
          class="el-select-tree__label-container"
          onMousedown={this.handleMouseDownOnLabelContainer}>
          {children}
        </div>
      );
    },

    renderCheckboxContainer(children) {
      const { instance, node } = this;

      if (instance.single) return null;
      if (instance.disableBranchNodes && node.isBranch) return null;

      return <div class="el-select-tree__checkbox-container">{children}</div>;
    },

    renderCheckbox() {
      const { instance, node } = this;
      const checkedState = instance.forest.checkedStateMap[node.id];

      return (
        <ElCheckbox
          disabled={ node.isDisabled }
          value={ checkedState === CHECKED }
          indeterminate={ checkedState === INDETERMINATE }
          nativeOnMousedown={ (evt) => evt.preventDefault() }
          nativeOnClick={(evt) => evt.preventDefault()}
        />
      );
    },

    renderLabel() {
      const { instance, node } = this;
      const shouldShowCount =
        node.isBranch &&
        (instance.localSearch.active
          ? instance.showCountOnSearchComputed
          : instance.showCount);

      const count = shouldShowCount
        ? instance.localSearch.active
          ? instance.localSearch.countMap[node.id][instance.showCountOf]
          : node.count[instance.showCountOf]
        : NaN;

      const labelClassName = 'el-select-tree__label';
      const countClassName = 'el-select-tree__count';
      const customLabelRenderer = instance.$scopedSlots['option-label'];

      if (customLabelRenderer) {
        return customLabelRenderer({
          node,
          shouldShowCount,
          count,
          labelClassName,
          countClassName
        });
      }

      return (
        <label class={labelClassName}>
          {node.label}
          {shouldShowCount && <span class={countClassName}>({count})</span>}
        </label>
      );
    },

    renderSubOptions() {
      const { node } = this;

      if (!node.childrenStates.isLoaded) return null;

      return node.children.map((childNode) => (
        <Option node={childNode} key={childNode.id} />
      ));
    },

    renderNoChildrenTip() {
      const { instance, node } = this;

      if (!node.childrenStates.isLoaded || node.children.length) return null;

      const listItemStyles = {
        paddingLeft: instance.optionsTipPaddingLeft(node)
      };

      return (
        <span
          type="no-children"
          icon="warning"
          style={listItemStyles}
          class="el-select-tree__tip-text is-left">
          {instance.noChildrenText}
        </span>
      );
    },

    renderLoadingChildrenTip() {
      const { node } = this;

      if (!node.childrenStates || !node.childrenStates.isLoading) return null;

      return (
        <span class="el-select-tree__loading-icon el-icon-loading" />
      );
    },

    renderLoadingChildrenErrorTip() {
      const { instance, node } = this;

      if (!node.childrenStates.loadingError) return null;
      const listItemStyles = {
        paddingLeft: instance.optionsTipPaddingLeft(node)
      };

      return (
        <span
          type="error"
          icon="error"
          style={listItemStyles}
          class="el-select-tree__tip-text is-left">
          {node.childrenStates.loadingError}
          <a
            class="el-select-tree__retry"
            title={instance.retryTitle}
            onMousedown={this.handleMouseDownOnRetry}>
            {instance.retryText}
          </a>
        </span>
      );
    },

    handleMouseEnterOption(evt) {
      const { instance, node } = this;

      if (evt.target !== evt.currentTarget) return;

      instance.setCurrentHighlightedOption(node, false);
    },

    handleMouseDownOnArrow: onLeftClick(
      function handleMouseDownOnOptionArrow() {
        const { instance, node } = this;

        instance.toggleExpanded(node);
      }),

    handleMouseDownOnLabelContainer: onLeftClick(
      function handleMouseDownOnLabelContainer() {
        const { instance, node } = this;

        if (node.isBranch && instance.disableBranchNodes) {
          instance.toggleExpanded(node);
        } else {
          instance.select(node);
        }
      }
    ),

    handleMouseDownOnRetry: onLeftClick(function handleMouseDownOnRetry() {
      const { instance, node } = this;

      instance.loadChildrenOptions(node);
    })
  },

  render() {
    const { node, instance } = this;
    const indentLevel = this.instance.shouldFlattenOptions ? 0 : node.level;
    const listItemClass = {
      'el-select-tree__list-item': true,
      [`el-select-tree__indent-level-${indentLevel}`]: true
    };
    const listItemStyles = {
      paddingLeft: instance.optionsPaddingLeft(node)
    };

    return (
      <div class={listItemClass}>
        {this.renderOption(listItemStyles)}
        {node.isBranch && (
          <ElCollapseTransition>
            {this.renderSubOptionsList()}
          </ElCollapseTransition>
        )}
      </div>
    );
  }
};

export default Option;
</script>
