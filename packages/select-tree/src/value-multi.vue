<script>
import Input from "./input.vue";
import ElTag from "element-ui/packages/tag";
import { debounce, includes } from "./utils";
import { INPUT_DEBOUNCE_DELAY, KEY_CODES } from "./constants";

const keysThatRequireMenuBeingOpen = [
  KEY_CODES.ENTER,
  KEY_CODES.END,
  KEY_CODES.HOME,
  KEY_CODES.ARROW_LEFT,
  KEY_CODES.ARROW_UP,
  KEY_CODES.ARROW_RIGHT,
  KEY_CODES.ARROW_DOWN,
];

export default {
  name: "vue-treeselect--multi-value",

  components: { ElTag, Input },

  inject: ["instance"],

  computed: {
    collapseTagSize() {
      return ["small", "mini"].indexOf(this.instance.size) > -1 ? "mini" : "small";
    },

    selectedLimitNodes() {
      const { instance } = this;

      return instance.internalValue.slice(0, instance.limit).map(instance.getNode);
    },

    showTag() {
      const { instance } = this;

      return instance.multiple && this.selectedLimitNodes.length;
    },

    readonly() {
      const { instance } = this;

      return !instance.searchable || !instance.menu.isOpen;
    },
  },

  data() {
    return {
      selectedLabel: null,
      inputLength: 20,
    };
  },

  watch: {
    // 根据是否有值
    showTag: {
      handler() {
        this.setInputValue();
      },
    },

    // 有值，不显示placeholder
    selectedLabel: {
      handler() {
        this.setInputValue();
      },
    },

    /**
     * Title for the "×" button when `multiple: true`.
     */
    "instance.trigger.searchQuery": {
      handler(searchQuery) {
        if (searchQuery) return;

        const { instance } = this;
        instance.clearAllText && (this.selectedLabel = null);
      },
    },
  },

  methods: {
    renderTags() {
      const { instance } = this;

      return (
        <div
          ref="tags"
          class="el-select-tree__tags"
          style={{ "max-width": instance.inputWidth - 32 + "px", width: "100%" }}>
          {this.renderMultiTags()}
          {this.renderExceedLimitTip()}
          {this.renderSearchInput()}
        </div>
      );
    },

    renderMultiTags() {
      const { instance } = this;
      const renderLabel = (node) => {
        const customValueLabelRenderer = instance.$scopedSlots["value-label"];
        return customValueLabelRenderer ? customValueLabelRenderer({ node }) : node.label;
      };

      return this.selectedLimitNodes.map((node) => (
        <el-tag
          key={node.id}
          size={this.collapseTagSize}
          type="info"
          closable
          disable-transitions
          onClick={() => this.deleteNode(node)}
          onClose={() => this.deleteNode(node)}>
          <span>{renderLabel(node)}</span>
        </el-tag>
      ));
    },

    renderSearchInput() {
      const { instance } = this;
      const styles = {
        "flex-grow": "1",
        width: this.inputLength / (instance.inputWidth - 32) + "%",
        "max-width": instance.inputWidth - 42 + "px",
      };

      return (
        <input
          ref="searchInput"
          type="text"
          class="el-select__input"
          style={styles}
          value={this.selectedLabel}
          disabled={instance.disabled}
          readonly={this.readonly}
          onKeydown={this.onKeyDown}
          onInput={this.onInput}
          onFocus={this.onFocus}
          onBlur={this.onBlur}
        />
      );
    },

    renderExceedLimitTip() {
      const { instance } = this;
      const count = instance.internalValue.length - instance.limit;

      if (count <= 0) return null;

      return (
        <el-tag closable={false} type="info" key="EXCEED" size={this.collapseTagSize} disable-transitions>
          <span>+{count}</span>
        </el-tag>
      );
    },

    deleteNode(node) {
      const { instance } = this;

      instance.select(node);
    },

    getInput() {
      return this.$refs.input;
    },

    getSearchInput() {
      return this.$refs.searchInput;
    },

    onInput(evt) {
      const { value: searchQuery } = evt.target;

      this.selectedLabel = searchQuery;
      this.debouncedCallback(searchQuery);
    },

    onFocus() {
      const { instance } = this;

      instance.trigger.isFocused = true;
      if (instance.openOnFocus) instance.openMenu();
    },

    onBlur() {
      const { instance } = this;

      instance.trigger.isFocused = false;
    },

    onKeyDown(evt) {
      const { instance } = this;
      // https://css-tricks.com/snippets/javascript/javascript-keycodes/
      // https://stackoverflow.com/questions/4471582/javascript-keycode-vs-which
      const key = "which" in evt ? evt.which : /* istanbul ignore next */ evt.keyCode;

      if (evt.ctrlKey || evt.shiftKey || evt.altKey || evt.metaKey) return;

      if (!instance.menu.isOpen && includes(keysThatRequireMenuBeingOpen, key)) {
        evt.preventDefault();
        return instance.openMenu();
      }

      switch (key) {
        case KEY_CODES.BACKSPACE: {
          if (instance.backspaceRemoves && !this.selectedLabel) {
            instance.removeLastValue();
          }
          break;
        }
        case KEY_CODES.ENTER: {
          evt.preventDefault();
          if (instance.menu.current === null) return;
          const current = instance.getNode(instance.menu.current);
          if (current.isBranch && instance.disableBranchNodes) return;
          instance.select(current);
          break;
        }
        case KEY_CODES.ESCAPE: {
          if (instance.menu.isOpen) {
            instance.closeMenu();
          }
          break;
        }
        case KEY_CODES.END: {
          evt.preventDefault();
          instance.highlightLastOption();
          break;
        }
        case KEY_CODES.HOME: {
          evt.preventDefault();
          instance.highlightFirstOption();
          break;
        }
        case KEY_CODES.ARROW_LEFT: {
          const current = instance.getNode(instance.menu.current);
          if (current.isBranch && instance.shouldExpand(current)) {
            evt.preventDefault();
            instance.toggleExpanded(current);
          } else if (!current.isRootNode && (current.isLeaf || (current.isBranch && !instance.shouldExpand(current)))) {
            evt.preventDefault();
            instance.setCurrentHighlightedOption(current.parentNode);
          }
          break;
        }
        case KEY_CODES.ARROW_UP: {
          evt.preventDefault();
          instance.highlightPrevOption();
          break;
        }
        case KEY_CODES.ARROW_RIGHT: {
          const current = instance.getNode(instance.menu.current);
          if (current.isBranch && !instance.shouldExpand(current)) {
            evt.preventDefault();
            instance.toggleExpanded(current);
          }
          break;
        }
        case KEY_CODES.ARROW_DOWN: {
          evt.preventDefault();
          instance.highlightNextOption();
          break;
        }
        case KEY_CODES.DELETE: {
          if (instance.deleteRemoves && !this.selectedLabel) {
            instance.removeLastValue();
          }
          break;
        }
        default: {
          // istanbul ignore else
          instance.openMenu();
        }
      }
    },

    updateSearchQuery(searchQuery) {
      const { instance } = this;
      instance.trigger.searchQuery = searchQuery;
    },

    setInputValue() {
      const { instance } = this;
      const input = this.getInput();

      input.setValueAndPlaceholder(null, this.showTag || this.selectedLabel ? null : instance.placeholder, true);
    },
  },

  created() {
    this.debouncedCallback = debounce(INPUT_DEBOUNCE_DELAY, (val) => this.updateSearchQuery(val));
  },

  mounted() {
    const { instance } = this;

    const input = this.getInput();
    // 默认值为空，placeholder为设置值
    input.setValueAndPlaceholder(null, this.showTag ? null : instance.placeholder, true);
  },

  render() {
    // const { instance } = this;

    return (
      <div class="el-select-tree__value-multi">
        {this.renderTags()}
        <Input ref="input">{this.$slots.default}</Input>
      </div>
    );
  },
};
</script>
