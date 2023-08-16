import {
  NO_PARENT_NODE,
  ALL_CHILDREN,
  ALL_DESCENDANTS,
  LEAF_DESCENDANTS,
  LEAF_CHILDREN,
} from "../constants";
import {
  createMap,
  shadowArrayCopy,
  match,
  stringifyOptionPropValue,
} from "../tools";

export default {
  props: {
    height: {
      type: String,
      default: "300px",
    },

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

    expandOnClickNode: {
      type: Boolean,
      default: true,
    },

    // checkbox
    disableBranchNodes: {
      type: Boolean,
      default: false,
    },

    // normalizer
    normalizer: {
      type: Function,
      default: (node) => {
        return {
          id: node.id,
          label: node.label,
          parentId: node.parentId,
        };
      },
    },

    // defaultParentId
    defaultParentId: {
      type: String,
      default: "0",
    },

    /**
     * Which node properties to filter on.
     */
    matchKeys: {
      type: Array,
      default: () => ["label"],
    },

    /**
     * Disable the fuzzy matching functionality?
     */
    disableFuzzyMatching: {
      type: Boolean,
      default: false,
    },

    /**
     * Only show the nodes that match the search value directly, excluding its ancestors.
     *
     * @type {Object}
     */
    flattenSearchResults: {
      type: Boolean,
      default: false,
    },

    /**
     * Search in ancestor nodes too.
     */
    searchNested: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      trigger: {
        // Is the control focused?
        isFocused: false,
        // User entered search query - value of the input.
        searchQuery: "",
      },

      forest: {
        // Treed options
        optionsTreeNode: {},
        // Normalized options.
        normalizedOptions: [],
        // <id, node> map for quick look-up.
        nodeMap: createMap(),
        // <id, checkedState> map, used for multi-select mode.
        checkedStateMap: createMap(),
        // id list of all selected options.
        selectedNodeIds: this.extractCheckedNodeIdsFromValue(),
        // <id, true> map for fast checking:
        //   if (forest.selectedNodeIds.indexOf(id) !== -1) forest.selectedNodeMap[id] === true
        selectedNodeMap: createMap(),
      },

      localSearch: {
        // Has user entered any query to search local options?
        active: false,
        // Has any options matched the search query?
        noResults: true,
        // Has expand children
        showChildren: false,
        // <id, countObject> map for counting matched children/descendants.
        countMap: createMap(),
      },
    };
  },

  watch: {
    options: {
      handler() {
        this.initialize();
      },
      deep: true,
      immediate: true,
    },

    "trigger.searchQuery"() {
      this.handleLocalSearch();

      this.$emit("search-change", this.trigger.searchQuery);
    },
  },

  methods: {
    /* ----------------------------------------------------------------
     * ---------------树形结构的基本处理 START---------------------------
     * ---------------------------------------------------------------- */
    // init
    initialize() {
      const options = shadowArrayCopy(this.options);

      if (Array.isArray(options)) {
        // 根据list构建树，同时初始化必要的信息，logOn2 10mm
        this.forest.optionsTreeNode = this.buildTree(
          options,
          this.defaultParentId,
        );

        // 初始化Index，用于排序 8mm
        this.traverseAllNodesByIndexTrue(
          this.forest.optionsTreeNode,
          (node, index) => {
            node.index = (node.isRootNode ? [] : node.parentNode.index).concat(
              index,
            );

            // cache nodeMap
            this.forest.nodeMap[node.id] = node;
          },
        );

        // 初始化normalizedOptions
        if (this.defaultExpandedKeys.length > 0) {
          this.toggleNodes(this.defaultExpandedKeys, true);
        } else {
          this.updateNormalizeOptions();
        }

        this.fixSelectedNodeIds(this.internalValue);
      } else {
        this.forest.normalizedOptions = [];
      }
    },

    // update render options
    updateNormalizeOptions() {
      this.forest.normalizedOptions = [];
      this.normalize(
        this.forest.optionsTreeNode,
        this.forest.normalizedOptions,
      );
    },

    // only render tree. do not do any modify there.
    normalize(nodes, array) {
      if (!nodes.length) return;

      nodes.forEach((node) => {
        if (
          /* custom filter */ (!this.filterNodeMethod ||
            this.filterNodeMethod(node.raw) === true) &&
          /* search filter */ (!this.localSearch.active ||
            this.shouldOptionBeIncludedInSearchResult(node))
        ) {
          array.push(node);

          // 折叠、展开有待优化
          if (node.hasChildren && node.isExpanded) {
            this.normalize(node.children, array);
          }
        }
      });
    },

    // build tree from options
    buildTree(options, parentId = "0", level = 0, parentNode = NO_PARENT_NODE) {
      const optionsTreeNode = [];
      const isRootNode = parentNode === NO_PARENT_NODE;

      options.forEach((item) => {
        // construct base item
        const {
          id,
          parentId: _parentId,
          label,
          disabled,
        } = this.normalizer(item);

        const node = createMap();
        const isDisabled = this.disabled || disabled || item.disabled;

        // set default info
        node.raw = item;
        node.level = level;
        node.isRootNode = isRootNode;
        node.parentNode = parentNode;
        node.parent = isRootNode ? NO_PARENT_NODE : parentNode.raw;
        this.$set(node, "id", id || item.id); // for node-key
        this.$set(node, "parentId", _parentId || item.parentId); // for construct tree
        this.$set(node, "label", label || item.label); // for render label
        this.$set(node, "isFocused", false); // for isFocused
        this.$set(node, "isMatched", false); // for search match
        this.$set(node, "isDisabled", isDisabled); // for disable option
        this.$set(node, "hasMatchedDescendants", false); // has child matched on search
        this.$set(node, "hasDisabledDescendants", false); // has disabled child on search
        this.$set(node, "isExpandedOnSearch", false); // expand on search
        this.$set(node, "showAllChildrenOnSearch", false); // show all children on search
        this.$set(node, "count", {
          [ALL_CHILDREN]: 0,
          [ALL_DESCENDANTS]: 0,
          [LEAF_CHILDREN]: 0,
          [LEAF_DESCENDANTS]: 0,
        });

        // set searchLabel
        const lowerCased = this.matchKeys.reduce(
          (prev, key) => ({
            ...prev,
            [key]: stringifyOptionPropValue(node[key]).toLocaleLowerCase(),
          }),
          {},
        );
        const nestedSearchLabel = isRootNode
          ? lowerCased.label
          : node.parentNode.nestedSearchLabel + " " + lowerCased.label;
        this.$set(node, "lowerCased", lowerCased); // search case
        this.$set(node, "nestedSearchLabel", nestedSearchLabel); // search nest case

        // tree construct
        if (node.parentId === parentId) {
          node.ancestors = !isRootNode
            ? [parentNode].concat(parentNode.ancestors)
            : []; // set ancestors

          const children = this.buildTree(options, node.id, level + 1, node);

          // set children
          node.children = [];
          if (children.length > 0) {
            node.children = children;
            this.$set(node, "isExpanded", this.defaultExpandAll); // set isExpanded
            this.$set(node, "oldIsExpanded", this.defaultExpandAll); // set oldIsExpanded
          }

          node.hasChildren = !!node.children.length;
          node.isLeaf = !node.hasChildren;
          node.isBranch = node.hasChildren;
          // 设置是否禁用选子级
          this.$set(
            node,
            "hasDisabledDescendants",
            this.disabled || (this.disableBranchNodes && node.isBranch),
          );

          // save
          optionsTreeNode.push(node);
        }
      });

      return optionsTreeNode;
    },

    // create fallback nodes
    createFallbackNode(id) {
      // In case there is a default selected node that is not loaded into the tree yet,
      // we create a fallback node to keep the component working.
      // When the real data is loaded, we'll override this fake node.

      const fallbackNode = {
        raw: { id },
        id,
        label: "none",
        isFallbackNode: true,
        isRootNode: true,
        isLeaf: true,
        isBranch: false,
        isDisabled: false,
        level: 0,
        ancestors: [],
        parentNode: null,
        index: [],
        parent: null,
      };

      return this.$set(this.forest.nodeMap, id, fallbackNode);
    },

    /* ----------------------------------------------------------------
     * --------------- END---------------------------
     * ---------------------------------------------------------------- */

    /* ----------------------------------------------------------------
     * ---------------树的操作函数 START---------------------------
     * ---------------------------------------------------------------- */

    toggleNode(nodeOrKey, status) {
      if (typeof nodeOrKey === "object") {
        nodeOrKey = nodeOrKey.id;
      }

      this.getNode(nodeOrKey).isExpanded = status;
      this.updateNormalizeOptions();
    },

    toggleNodes(nodesOrKeys, status) {
      if (!Array.isArray(nodesOrKeys)) {
        return console.log("参数必须为数组");
      }

      nodesOrKeys.forEach((nodeOrKey) => {
        const key = typeof nodeOrKey === "object" ? nodeOrKey.id : nodeOrKey;
        this.getNode(key).isExpanded = status;
      });
      this.updateNormalizeOptions();
    },

    toggleNodesAll(status) {
      this.traverseAllNodesByIndexTrue(
        this.forest.normalizedOptions,
        (node) => {
          node.isExpanded = status;
        },
      );
      this.updateNormalizeOptions();
    },

    /* ----------------------------------------------------------------
     * --------------- END---------------------------
     * ---------------------------------------------------------------- */

    traverseAllNodesByIndexTrue(optionsTreeNode, cb) {
      optionsTreeNode.forEach((node, index) => {
        if (cb(node, index) !== false && node.hasChildren) {
          this.traverseAllNodesByIndexTrue(node.children, cb);
        }
      });
    },

    traverseAllNodesByIndex(callback) {
      const walk = (parentNode) => {
        if (!parentNode.children || !parentNode.hasChildren) return;

        parentNode.children.forEach((child) => {
          if (callback(child) !== false && child.isBranch) {
            walk(child);
          }
        });
      };

      // To simplify the code logic of traversal,
      // we create a fake root node that holds all the root options.
      walk({ children: this.forest.optionsTreeNode });
    },

    traverseAllNodesDFS(callback) {
      this.traverseAllNodesByIndexTrue(this.forest.optionsTreeNode, callback);
    },

    traverseDescendantsDFS(parentNode, callback) {
      if (!parentNode.isBranch) return;
      parentNode.children.forEach((child, index) => {
        this.traverseDescendantsDFS(child, callback);
        callback(child, index);
      });
    },

    traverseDescendantsBFS(parentNode, callback) {
      if (!parentNode.isBranch) return;
      const queue = parentNode.children.slice();
      while (queue.length) {
        const currNode = queue[0];
        if (currNode.isBranch)
          currNode.children.forEach((item) => queue.push(item));
        callback(currNode);
        queue.shift();
      }
    },

    /* ----------------------------------------------------------------
     * --------------- END ---------------------------
     * ---------------------------------------------------------------- */

    /* ----------------------------------------------------------------
     * ---------------搜索相关 START ---------------------------
     * ---------------------------------------------------------------- */

    handleLocalSearch() {
      const { searchQuery } = this.trigger;

      if (!searchQuery) {
        // reset isExpand or other
        if (this.resetNode === false) {
          this.traverseAllNodesDFS((_) => (_.isExpanded = _.oldIsExpanded));
        }
        this.resetNode = true;

        this.localSearch.active = false;
        this.updateNormalizeOptions(); // update
        return;
      }

      // Reset states.
      this.localSearch.active = true;
      this.localSearch.noResults = true;
      this.localSearch.showChildren = false;

      // start search
      const lowerCasedSearchQuery = searchQuery.trim().toLocaleLowerCase();
      const splitSearchQuery = lowerCasedSearchQuery
        .replace(/\s+/g, " ")
        .split(" ");

      this.traverseAllNodesDFS((node) => {
        // resetNode is used reset isExpanded
        this.resetNode !== false && (node.oldIsExpanded = node.isExpanded);

        // Reset states.
        if (node.isBranch) {
          node.isExpanded = false;
          node.isMatched = false;
          node.isExpandedOnSearch = false;
          node.hasMatchedDescendants = false;
          node.showAllChildrenOnSearch = false;
          this.$set(this.localSearch.countMap, node.id, {
            [ALL_CHILDREN]: 0,
            [ALL_DESCENDANTS]: 0,
            [LEAF_CHILDREN]: 0,
            [LEAF_DESCENDANTS]: 0,
          });
        }

        // default collapse branch
        if (node.isBranch) {
          node.isExpanded = false;

          // match root. then set all children state
          if (!node.isRootNode) {
            node.showAllChildrenOnSearch = this.localSearch.showChildren;
          }
        }

        // search option
        if (this.searchNested && splitSearchQuery.length > 1) {
          node.isMatched = splitSearchQuery.every((filterValue) =>
            match(false, filterValue, node.nestedSearchLabel),
          );
        } else {
          node.isMatched = this.matchKeys.some((matchKey) =>
            match(
              !this.disableFuzzyMatching,
              lowerCasedSearchQuery,
              node.lowerCased[matchKey],
            ),
          );

          // branch node expand default
          if (node.isMatched && node.isBranch) {
            node.isExpandedOnSearch = true;
            node.showAllChildrenOnSearch = true;
          }
        }

        // set search results and update children
        if (node.isMatched) {
          this.localSearch.noResults = false;
          // match root. then tell children it will be show.
          if (node.isRootNode) this.localSearch.showChildren = true;
        }

        // branch node expand default
        if (node.isMatched && node.isBranch) {
          node.isExpandedOnSearch = true;
        }

        // set ancestors has matched child. search up
        if (
          (node.isMatched || (node.isBranch && node.isExpandedOnSearch)) &&
          node.parentNode !== NO_PARENT_NODE
        ) {
          node.ancestors.forEach((ancestor) => {
            ancestor.isExpanded = true;
            ancestor.isExpandedOnSearch = true;
            ancestor.hasMatchedDescendants = true;
            ancestor.showAllChildrenOnSearch = false;
          });
        }
      });

      this.resetNode = false;

      this.updateNormalizeOptions();
    },

    shouldOptionBeIncludedInSearchResult(node) {
      // 0) the searchQuery is none
      if (!this.trigger.searchQuery) return true;
      // 1) This option is matched.
      if (node.isMatched) return true;
      // 2) This option is not matched, but has matched descendant(s).
      if (
        node.isBranch &&
        node.hasMatchedDescendants &&
        !this.flattenSearchResults
      ) {
        return true;
      }
      // 3) This option's parent has no matched descendants,
      //    but after being expanded, all its children should be shown.
      if (!node.isRootNode && node.parentNode.showAllChildrenOnSearch) {
        return true;
      }
      // 4) parentNode matched when deep level
      // if (
      //   node.ancestors &&
      //   node.ancestors.some((ancestor) => ancestor.isExpandedOnSearch)
      // )
      //   return true;
      // 5) The default case.
      return false;
    },

    /* ----------------------------------------------------------------
     * --------------- END ---------------------------
     * ---------------------------------------------------------------- */

    /* ----------------------------------------------------------------
     * ---------------其它操作 START---------------------------
     * ---------------------------------------------------------------- */

    getNode(nodeId) {
      if (nodeId == null) return null;

      return nodeId in this.forest.nodeMap
        ? this.forest.nodeMap[nodeId]
        : this.createFallbackNode(nodeId);
    },

    emitEvent(event, ...params) {
      this.$emit(event, ...params);
    },

    filter(searchQuery) {
      this.trigger.searchQuery = searchQuery;
    },
  },
};
