<script>
import ElInput from 'element-ui/packages/input';
import {debounce, includes} from './utils';
import {INPUT_DEBOUNCE_DELAY, KEY_CODES} from './constants';

const keysThatRequireMenuBeingOpen = [
  KEY_CODES.ENTER,
  KEY_CODES.END,
  KEY_CODES.HOME,
  KEY_CODES.ARROW_LEFT,
  KEY_CODES.ARROW_UP,
  KEY_CODES.ARROW_RIGHT,
  KEY_CODES.ARROW_DOWN
];

export default {
  name: 'IInput',

  inject: ['instance'],

  components: {
    ElInput
  },

  data() {
    return {
      initialInputHeight: 0,
      currentPlaceholder: null,
      selectedLabel: null
    };
  },

  computed: {
    readonly() {
      const { instance } = this;

      return !instance.searchable || !instance.menu.isOpen || instance.multiple;
    }
  },

  methods: {
    onKeyDown(evt) {
      const { instance } = this;
      // https://css-tricks.com/snippets/javascript/javascript-keycodes/
      // https://stackoverflow.com/questions/4471582/javascript-keycode-vs-which
      const key =
          'which' in evt ? evt.which : /* istanbul ignore next */ evt.keyCode;

      if (evt.ctrlKey || evt.shiftKey || evt.altKey || evt.metaKey) return;

      if (
        !instance.menu.isOpen &&
          includes(keysThatRequireMenuBeingOpen, key)
      ) {
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
        case KEY_CODES.TAB: {
          if (instance.menu.isOpen) {
            instance.closeMenu();
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
          if (this.selectedLabel && this.selectedLabel.length) {
            this.clear();
          } else if (instance.menu.isOpen) {
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
          } else if (
            !current.isRootNode &&
              (current.isLeaf ||
                  (current.isBranch && !instance.shouldExpand(current)))
          ) {
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

    onFocus() {
      const { instance } = this;

      instance.trigger.isFocused = true;
      if (instance.openOnFocus) instance.openMenu();
    },

    onBlur() {
      const { instance } = this;

      instance.trigger.isFocused = false;
    },

    onInput(searchQuery) {
      this.selectedLabel = searchQuery;
      this.debouncedCallback(searchQuery);
    },

    resetInputHeight() {
      const input = this.$refs.input;
      if (!input) return;

      const { instance } = this;
      const sizeMap = {
        medium: 36,
        small: 32,
        mini: 28
      };
      const inputEle = input.$el.querySelector('input');
      const tags = this.$parent.$refs.tags;
      const tagsHeight = tags ? tags.getBoundingClientRect().height : 0;
      const sizeInMap = sizeMap[instance.selectSize] || 40;
      inputEle.style.height = !instance.hasValue
        ? sizeInMap + 'px'
        : Math.max(
          tags ? (tagsHeight + (tagsHeight > sizeInMap ? 6 : 0)) : 0,
          sizeInMap
        ) + 'px';
    },

    updateSearchQuery(searchQuery) {
      const { instance } = this;
      instance.trigger.searchQuery = searchQuery;
    },

    setValueAndPlaceholder(value, placeholder, force) {
      value && (this.selectedLabel = value);
      placeholder && (this.currentPlaceholder = placeholder);

      if (force) {
        this.selectedLabel = value;
        this.currentPlaceholder = placeholder;
      }
    },

    watchValue2ResetHeight() {
      const needWatch = [
        'instance.forest.selectedNodeIds.length',
        'instance.valueConsistsOf',
        'instance.flat',
        'instance.selectSize'
      ];
      const handler = () => { if (this.instance.multiple) this.$nextTick(() => {this.resetInputHeight();}); };

      needWatch.map((watch) => {
        this.$watch(watch, handler);
      });
    }
  },

  created() {
    const { instance } = this;
    this.currentPlaceholder = instance.placeholder;

    this.debouncedCallback = debounce(
      INPUT_DEBOUNCE_DELAY,
      (val) => this.updateSearchQuery(val)
    );

    this.watchValue2ResetHeight();
  },

  mounted() {
    const { instance } = this;

    this.$nextTick(() => {
      const reference = this.$refs.input;

      if (reference && reference.$el) {
        const sizeMap = {
          medium: 36,
          small: 32,
          mini: 28
        };

        // init Width
        instance.inputWidth = reference.$el.getBoundingClientRect().width;

        // init Height
        const inputElm = reference.$el.querySelector('input');
        this.initialInputHeight = inputElm.getBoundingClientRect().height || sizeMap[instance.selectSize];
        // if (instance.remote && instance.multiple) {
        //   this.resetInputHeight();
        // }
      }
    });
  },

  render() {
    const { instance } = this;
    const classes = {
      'is-focus': instance.trigger.isFocused
    };

    return (
      <ElInput
        ref="input"
        type="text"
        placeholder={ this.currentPlaceholder }
        disabled={ instance.disabled }
        nativeOnKeydown={this.onKeyDown}
        readonly={this.readonly}
        onInput={this.onInput}
        onFocus={this.onFocus}
        onBlur={this.onBlur}
        validate-event={false}
        size={instance.selectSize}
        value={ this.selectedLabel }
        class={classes}>
        <template slot="suffix">
          { this.$slots.default }
        </template>
      </ElInput>
    );
  }
};
</script>
