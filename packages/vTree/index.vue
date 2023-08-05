<script>
import Item from "./Item.vue";
import treeMixin from "./treeMixin";
import VueVirtualScrollList from "vue-virtual-scroll-list";

export default {
  name: "VTree",

  mixins: [treeMixin],

  provide() {
    return {
      root: this,
    };
  },

  components: {
    VueVirtualScrollList,
  },

  data() {
    return {
      itemComponent: Item,
      treeData: [],
    };
  },

  created() {
    // console.log(this.array2Tree(this.options));
  },

  render() {
    return (
      <div class="v-tree">
        <vue-virtual-scroll-list
          class="v-tree-list"
          data-key={this.nodeKey}
          data-sources={this.forest.normalizedOptions}
          data-component={Item}
        />
      </div>
    );
  },
};
</script>

<style scoped lang="scss">
.v-tree {
  .v-tree-list {
    height: 300px;
    overflow-y: auto;
  }
}
</style>
