<script>
import Input from "./input.vue";

export default {
  name: "vue-treeselect--single-value",

  inject: ["instance"],

  components: {
    Input,
  },

  watch: {
    // 根据选中值，变化显示
    "instance.forest.selectedNodeIds": {
      handler(val) {
        const { instance } = this;

        const input = this.getInput();
        input.setValueAndPlaceholder(
          this.getSelectedLabel(),
          !val.length && instance.placeholder,
          !this.getSelectedLabel(),
        );
      },
    },

    // 根据menu的显隐，判断当前值的显示
    "instance.menu.isOpen": {
      handler(val) {
        const { instance } = this;
        const input = this.getInput();

        if (val) {
          // 打开，value置为空，placeholder置为选择值（或空）
          input.setValueAndPlaceholder(null, instance.placeholder, true);
        } else {
          this.getSelectedLabel()
            ? // 关闭，存在选中值，value还原为选中值，placeholder还原
              input.setValueAndPlaceholder(this.getSelectedLabel(), instance.placeholder, true)
            : // 不存在值，value还原为空，placeholder还原
              input.setValueAndPlaceholder(null, instance.placeholder, true);
        }
      },
    },
  },

  methods: {
    renderSingleValueLabel() {
      const { instance } = this;
      const node = instance.selectedNodes[0];

      const customValueLabelRenderer = instance.$scopedSlots["value-label"];
      return customValueLabelRenderer ? customValueLabelRenderer({ node }) : node && node.label;
    },

    getSelectedLabel() {
      return this.renderSingleValueLabel();
    },

    getInput() {
      return this.$refs.input;
    },
  },

  mounted() {
    const { instance } = this;

    const input = this.getInput();
    input.setValueAndPlaceholder(this.getSelectedLabel(), instance.placeholder);
  },

  render() {
    return <Input ref="input">{this.$slots.default}</Input>;
  },
};
</script>
