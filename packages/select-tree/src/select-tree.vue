<script>
import Clickoutside from "element-ui/lib/utils/clickoutside";
import treeselectMixin from "./mixins/treeselectMixin";
import Control from "./control.vue";
import Menu from "./menu";

export default {
  name: "el-select-tree",

  mixins: [treeselectMixin],

  components: { Control, Menu },

  directives: { Clickoutside },

  computed: {
    wrapperClass() {
      return {
        "el-select-tree": true,
      };
    },
  },

  render() {
    const directives = [{ name: "Clickoutside", value: this.handleClickOutside }];

    return (
      <div ref="wrapper" class={this.wrapperClass} {...{ directives }}>
        <Control ref="control" />
        <Menu ref="menu" />
      </div>
    );
  },
};
</script>
