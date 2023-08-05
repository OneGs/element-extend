const createMap = () => Object.create(null);

const PROPS = {
  id: "id",
  label: "label",
  parentId: "parentId",
  parentIdValue: "0",
};

export default {
  props: {
    options: {
      type: Array,
      default: () => [],
    },

    nodeKey: {
      type: String,
      default: "id",
    },

    emptyText: {
      type: String,
      default: "暂无数据",
    },

    props: {
      type: Object,
      default: () => ({}),
    },

    highlightCurrent: {
      type: Boolean,
      default: false,
    },

    defaultExpandAll: {
      type: Boolean,
      default: false,
    },

    defaultExpandedKeys: {
      type: Array,
      default: () => [],
    },

    filterNodeMethod: {
      type: Function,
      default: null,
    },

    iconClass: {
      type: String,
      default: "el-icon-caret-right",
    },
  },

  data() {
    return {
      forest: {
        // Treed options
        treeOptions: {},
        // Normalized options.
        normalizedOptions: [],
        // <id, node> map for quick look-up.
        nodeMap: createMap(),
        // <id, checkedState> map, used for multi-select mode.
        checkedStateMap: createMap(),
        // id list of all selected options.
        selectedNodeIds: [],
        // <id, true> map for fast checking:
        //   if (forest.selectedNodeIds.indexOf(id) !== -1) forest.selectedNodeMap[id] === true
        selectedNodeMap: createMap(),
      },

      // 收集prop数据
      $p: {},
    };
  },

  methods: {
    initialize() {
      const options = this.options;

      if (Array.isArray(options)) {
        // 根据list构建树，同时初始化必要的信息
        this.forest.treeOptions = this.array2Tree(
          options,
          this.$p.parentIdValue,
        );

        // 初始化optionsMap
        this.initOptionsMap(this.options);

        // 初始化normalizedOptions
        if (this.defaultExpandedKeys.length > 0) {
          this.toggleNodes(this.defaultExpandedKeys, true);
        } else {
          this.normalize(
            this.forest.treeOptions,
            this.forest.normalizedOptions,
          );
        }
      } else {
        this.forest.normalizedOptions = [];
      }
    },

    initOptionsMap(options) {
      options.forEach((opt) => {
        this.forest.nodeMap[opt[this.nodeKey]] = opt;
      });
    },

    normalize(nodes, array) {
      if (!nodes.length) return;

      nodes.forEach((node) => {
        if (!this.filterNodeMethod || this.filterNodeMethod(node) === true) {
          array.push(node);

          // 折叠、展开有待优化
          if (node._children?.length > 0 && node._isExpanded) {
            this.normalize(node._children, array);
          }
        }
      });
    },

    array2Tree(options, parentId = "0", level = 0) {
      const { parentId: $pParentId, id: $pId } = this.$p;

      const treeOptions = [];
      options.forEach((item) => {
        if (item[$pParentId] === parentId) {
          const children = this.array2Tree(
            options,
            item[$pId],
            level + 1,
            item,
          );
          if (children.length > 0) {
            // 设置children
            item._children = children;
            // 设置是否展开
            this.$set(item, "_isExpanded", this.defaultExpandAll);
          }

          // 需要观测的值
          // 设置是否聚焦
          this.$set(item, "_isFocused", false);
          // 设置层级
          item._level = level;
          // 设置是否有孩子节点
          item._hasChildren = !!item._children?.length;
          item._isLeaf = !item._hasChildren;
          // 设置parent
          item._parent = item;
          treeOptions.push(item);
        }
      });

      return treeOptions;
    },

    iterationTreeOptions(options, cb) {
      options.forEach((option) => {
        const next = cb(option);

        if (next === true && option._hasChildren) {
          this.iterationTreeOptions(option._children, cb);
        }
      });
    },

    updateNormalizeOptions() {
      this.forest.normalizedOptions = [];
      this.normalize(this.forest.treeOptions, this.forest.normalizedOptions);
    },

    toggleNode(nodeOrKey, status) {
      if (typeof nodeOrKey === "object") {
        nodeOrKey = nodeOrKey[this.$p.id];
      }

      this.forest.nodeMap[nodeOrKey]._isExpanded = status;
      this.updateNormalizeOptions();
    },

    toggleNodes(nodesOrKeys, status) {
      if (!Array.isArray(nodesOrKeys)) {
        return console.log("参数必须为数组");
      }

      nodesOrKeys.forEach((nodeOrKey) => {
        const key =
          typeof nodeOrKey === "object" ? nodeOrKey[this.$p.id] : nodeOrKey;
        this.forest.nodeMap[key]._isExpanded = status;
      });
      this.updateNormalizeOptions();
    },

    emitEvent(event, ...params) {
      this.$emit(event, ...params);
    },
  },

  created() {
    this.$p = { ...PROPS, ...this.props };
    this.initialize();
  },
};
