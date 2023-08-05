<script>
export default {
  name: "Item",

  inject: ["root"],

  props: {
    source: {
      type: Object,
      default: () => ({}),
    },
  },

  computed: {
    nodeLevel() {
      return this.source._level;
    },

    hasChildren() {
      return this.source._hasChildren;
    },

    indentLength() {
      return this.hasChildren ? 12 * this.nodeLevel : 12 * this.nodeLevel + 24;
    },

    isExpanded() {
      return this.source._isExpanded;
    },

    isFocused() {
      return this.source._isFocused;
    },

    isHighlight() {
      return this.root.highlightCurrent;
    },
  },

  created() {},

  methods: {
    handlerIconClick() {
      this.source._isExpanded = !this.source._isExpanded;
      this.root.updateNormalizeOptions();
      this.root.emitEvent("icon-click");
    },

    handlerItemClick() {
      if (this.root.oldSource) {
        this.root.oldSource._isFocused = false;
      }

      this.source._isFocused = true;
      this.root.emitEvent("node-click", this.source, this.root.oldSource);

      this.root.oldSource = this.source;
    },

    renderIcon() {
      if (!this.hasChildren) return;

      const classes = {
        [this.root.iconClass]: true,
        "expand-icon": true,
        "is-expanded": this.isExpanded,
      };

      return <div class={classes} onClick={this.handlerIconClick} />;
    },

    renderIndent() {
      const style = { width: this.indentLength + "px" };

      return <div style={style} />;
    },

    renderSource() {
      return <div class="node-label">{this.source.taskName}</div>;
    },
  },

  render() {
    const classes = {
      item: true,
      "is-focused": this.isFocused,
      "is-highlight": this.isHighlight && this.isFocused,
    };

    return (
      <div class={classes} onClick={this.handlerItemClick}>
        {this.renderIndent()}
        {this.renderIcon()}
        {this.renderSource()}
      </div>
    );
  },
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
