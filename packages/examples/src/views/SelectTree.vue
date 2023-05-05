<template>
  <div class="home">
    <div>
      <h2>基础用法</h2>
      <div>项目是对vue-select-tree的适配和改造，为满足在element-ui中无缝对接</div>
      <div>在select的基础上添加树形选择功能，并提供了丰富的操作模式</div>

      <h3>常规操作</h3>
      <div>默认情况下为平铺模式，允许选择任何一个层级的节点。</div>
      <div>
        通过options加载选项，符合element-ui设计规范，通过直接设置disabled为true禁用选项，同时也支持在options上将isDisabled设为true来禁用某一项
      </div>
      <el-select-tree :options="options" v-model="valued.temp1" class="select-tree" />
      <el-select-tree :options="options" v-model="valued.temp11" class="select-tree ml-10" disabled />

      <h3>数据显示变更</h3>
      <div>select-tree提供了一些改变选项显示的功能。</div>
      <div>branch-nodes-first可以将分支节点显示在最前面;show-count则可以显示子节点的数量</div>
      <el-select-tree :options="options" v-model="valued.temp2" show-count branch-nodes-first class="select-tree" />

      <h3>显示限制</h3>
      <div>某些情况下，会遇到数据显示超出边界条件的情况。</div>
      <div>
        当options的内容过长超过select宽度，options会通过title进行提示。过多的选项会默认向下撑开，如果不想显示过多内容，允许通过limit限制显示个数。
      </div>
      <el-select-tree multiple :options="options" v-model="valued.temp3" class="select-tree" :limit="2" />
      <el-select-tree multiple :options="largeLenOptions" v-model="valued.temp4" class="select-tree ml-10" />

      <h3>搜索功能</h3>
      <div>tree-select提供了丰富的搜索功能，允许进行复杂搜索。</div>
      <div>search-nested允许进行内嵌搜索，如fr apple。当然你也可以通过searchable为false来禁用搜索功能。</div>
      <el-select-tree :options="options" v-model="valued.temp5" class="select-tree" />
      <el-select-tree :options="options" v-model="valued.temp6" class="select-tree ml-10" :searchable="false" />
      <div>如果想要在搜索时将结果平铺，将flatten-search-results设置为true即可</div>
      <el-select-tree :options="options" v-model="valued.temp6" class="select-tree" flatten-search-results />

      <h2>平面模式和排序值</h2>
      <div>在前面的所有示例中，我们使用了默认的非平坦模式vue-treeselect，这意味着：</div>
      <div>
        <ul>
          <li>每当分支节点被检查时，其所有子节点也将被检查</li>
          <li>每当分支节点被检查时，其所有子节点也将被检查</li>
          <li>每当分支节点被检查时，其所有子节点也将被检查</li>
        </ul>
      </div>
      <div>如果要控制所选选项的显示顺序，请使用sortValueBy道具。该道具有三个选择：</div>
      <div>
        <ul>
          <li>"ORDER_SELECTED" （默认）-选择订单</li>
          <li>"LEVEL" - 选择级别: C 🡒 BB 🡒 AAA</li>
          <li>"INDEX" - 选项索引: AAA 🡒 BB 🡒 C</li>
        </ul>
      </div>
      <el-select-tree :options="options" :multiple="true" v-model="valued.temp7" :value-consists-of="checked" />
      <div>
        <el-radio-group v-model="checked" style="padding: 1rem 0">
          <el-radio v-for="check in checkedOptions" :key="check" :label="check">{{ check }}</el-radio>
        </el-radio-group>
      </div>

      <h2>平面模式和排序值</h2>
      <div>在前面的所有示例中，我们使用了默认的非平坦模式vue-treeselect，这意味着：</div>
      <div>
        <ul>
          <li>每当分支节点被检查时，其所有子节点也将被检查</li>
          <li>每当分支节点检查所有子节点时，分支节点本身也将被检查</li>
        </ul>
      </div>
      <div>
        有时我们不需要那种机制，并且希望分支节点和叶子节点不会相互影响。在这种情况下，应使用平面模式，如下所示。
      </div>
      <div>如果要控制所选选项的显示顺序，请使用sortValueBy道具。该道具有三个选择：</div>
      <div>
        <ul>
          <li>"ORDER_SELECTED" （默认）-选择订单</li>
          <li>"LEVEL" - 选择级别: C 🡒 BB 🡒 AAA</li>
          <li>"INDEX" - 选项索引: AAA 🡒 BB 🡒 C</li>
        </ul>
      </div>
      <el-select-tree flat :options="orderOptions" :multiple="true" v-model="valued.temp8" :sort-value-by="sorted" />
      <div>
        <el-radio-group v-model="sorted" style="padding: 1rem 0">
          <el-radio v-for="check in sortedOptions" :key="check" :label="check">{{ check }}</el-radio>
        </el-radio-group>
      </div>

      <h2>懒加载</h2>
      <div>
        如果您有大量深度嵌套的选项，则可能只希望在初始加载时加载最顶层的选项，而仅在需要时加载其余选项。您可以通过执行以下步骤来实现：
      </div>
      <div>
        <ul>
          <li>通过设置声明一个卸载的分支节点children: null</li>
          <li>添加 loadOptions 道具</li>
          <li>
            每当卸载的分支节点被扩展时， loadOptions({ action, parentNode, callback, instanceId })
            都会被调用，然后您就可以执行从远程服务器请求数据的作业
          </li>
        </ul>
      </div>
      <el-select-tree
        :multiple="true"
        :options="lazyOptions"
        :load-options="loadOptions"
        placeholder="尝试展开任意分支节点"
        v-model="valued.temp9" />

      <h2>自定义键名 & 自定义选项标签 & 自定义值标签</h2>
      <div>
        如果通过AJAX加载的选项数据与vue-treeselect要求的数据结构不同，
        例如，您的数据具有name属性，但vue-treeselect需要label，则可能需要自定义键名。
        在这种情况下，您可以提供一个称为函数的normalizer，在数据初始化期间它将传递给树中的每个节点。
        使用此函数创建并返回转换后的对象。
      </div>
      <el-select-tree
        :options="otherOptions"
        :multiple="true"
        :normalizer="normalizer"
        value-consists-of="ALL"
        v-model="valued.temp10">
        <label
          slot="option-label"
          slot-scope="{ node, shouldShowCount, count, labelClassName, countClassName }"
          :class="labelClassName">
          {{ node.isBranch ? "Branch" : "Leaf" }}: {{ node.label }}
          <span v-if="shouldShowCount" :class="countClassName">({{ count }})</span>
        </label>

        <div slot="value-label" slot-scope="{ node }">{{ node.isBranch ? "Branch" : "Leaf" }}: {{ node.label }}</div>
      </el-select-tree>
    </div>
  </div>
</template>

<script>
const OPTIONS = [
  {
    id: "fruits 1",
    label: "丰富水果 Fruits",
    children: [
      {
        id: "apple",
        label: "苹果 This  Apple 🍎",
        isNew: true,
      },
      {
        id: "grapes",
        label: "葡萄 Grapes 🍇",
        children: [
          {
            id: "corn x",
            label: "玉米 This Corn 🌽",
          },
          {
            id: "carrot x",
            label: "胡萝卜 Carrot 🥕",
            isDisabled: true,
          },
          {
            id: "eggplant x",
            label: "茄子 Eggplant 🍆",
          },
          {
            id: "tomato x",
            label: "西红柿 Tomato 🍅",
          },
        ],
      },
      {
        id: "pear",
        label: "Pear 🍐",
        isDisabled: true,
      },
      {
        id: "strawberry",
        label: "Strawberry 🍓",
      },
      {
        id: "watermelon",
        label: "Watermelon 🍉",
        children: [
          {
            id: "corn2",
            label: "Corn 🌽",
          },
          {
            id: "carrot2",
            label: "Carrot 🥕",
            isDisabled: true,
          },
          {
            id: "eggplant2",
            label: "Eggplant 🍆",
          },
          {
            id: "tomato2",
            label: "Tomato 🍅",
          },
        ],
      },
    ],
  },
  {
    id: "vegetables 1",
    label: "Vegetables",
    children: [
      {
        id: "corn",
        label: "This Corn 🌽",
      },
      {
        id: "carrot",
        label: "Carrot 🥕",
        isDisabled: true,
      },
      {
        id: "eggplant",
        label: "Eggplant 🍆",
      },
      {
        id: "tomato",
        label: "Tomato 🍅",
      },
    ],
  },
];
const simulateAsyncOperation = (fn) => {
  setTimeout(fn, 200);
};

export default {
  name: "HomeView",

  data() {
    return {
      valued: {
        temp8: ["C", "AAA", "BB"],
      },
      options: [],
      largeLenOptions: [],
      orderOptions: [],
      checked: "BRANCH_PRIORITY",
      checkedOptions: ["ALL", "BRANCH_PRIORITY", "LEAF_PRIORITY", "ALL_WITH_INDETERMINATE"],
      sorted: "ORDER_SELECTED",
      sortedOptions: ["ORDER_SELECTED", "LEVEL", "INDEX"],
      lazyOptions: [],
      otherOptions: [],
    };
  },

  methods: {
    loadOptions({ action, parentNode, callback }) {
      if (action === "LOAD_CHILDREN_OPTIONS") {
        switch (parentNode.id) {
          case "success": {
            simulateAsyncOperation(() => {
              parentNode.children = [
                {
                  id: "child",
                  label: "Child option",
                },
              ];
              callback();
            });
            break;
          }
          case "no-children": {
            simulateAsyncOperation(() => {
              // this.$set(parentNode, 'isLeaf', true)
              parentNode.isLeaf = true;
              callback();
            });
            break;
          }
          case "no-children-show-message": {
            simulateAsyncOperation(() => {
              // parentNode.children = null
              callback();
            });
            break;
          }
          case "failure": {
            simulateAsyncOperation(() => {
              callback(new Error("加载失败，网络错误。"));
            });
            break;
          }
          default: /* empty */
        }
      }
    },

    normalizer(node) {
      return {
        id: node.value,
        label: node.name,
        children: node.child,
        isLeaf: node.leaf,
      };
    },
  },

  created() {
    this.options = OPTIONS;

    this.largeLenOptions = [
      {
        id: "apple",
        label:
          "这是无敌超级好吃的陕西省西安市零铺村某某家亲自通过农家肥经过快速通道得到的苹果，黑龙江省齐齐哈尔市讷河市六合镇黎明奶牛场🍎",
      },
      {
        id: "grapes",
        label:
          "这是无敌超级好吃的陕西省西安市零铺村某某家亲自通过农家肥经过快速通道得到的葡萄，黑龙江省齐齐哈尔市讷河市六合镇黎明奶牛场🍇",
      },
      {
        id: "pear",
        label:
          "这是无敌超级好吃的陕西省西安市零铺村某某家亲自通过农家肥经过快速通道得到的梨子，黑龙江省齐齐哈尔市讷河市六合镇黎明奶牛场🍐",
      },
      {
        id: "strawberry",
        label:
          "这是无敌超级好吃的陕西省西安市零铺村某某家亲自通过农家肥经过快速通道得到的草莓，黑龙江省齐齐哈尔市讷河市六合镇黎明奶牛场🍓",
      },
    ];
    this.orderOptions = [
      {
        id: "A",
        label: "A",
        children: [
          {
            id: "AA",
            label: "AA",
          },
          {
            id: "AB",
            label: "AB",
          },
          {
            id: "AC",
            label: "AC",
            children: [{ id: "AAA", label: "AAA" }],
          },
        ],
      },
      {
        id: "B",
        label: "B",
        children: [
          {
            id: "BA",
            label: "BA",
          },
          {
            id: "BB",
            label: "BB",
          },
        ],
      },
      {
        id: "C",
        label: "C",
        children: [
          {
            id: "CA",
            label: "CA",
          },
        ],
      },
    ];
    this.lazyOptions = [
      {
        id: "success",
        label: "存在子选项",
        // Declare an unloaded branch node.
        children: null,
      },
      {
        id: "no-children-show-message",
        label: "没有子选项，显示提示信息",
        children: null,
      },
      {
        id: "no-children",
        label: "没有子选项，不显示提示信息（改为隐藏箭头标识）",
        children: null,
        isLeaf: false,
      },
      {
        id: "failure",
        label: "由于各种原因造成的失败",
        children: null,
      },
      {
        id: "is Leaf",
        label: "允许设置isLeaf为true将节点标记为叶子节点，优先级大children",
        children: null,
        isLeaf: true,
      },
    ];
    this.otherOptions = [
      {
        value: "A",
        name: "A",
        child: [
          {
            value: "AA",
            name: "AA",
            child: [],
          },
          {
            value: "AB",
            name: "AB",
            child: [],
            leaf: true,
          },
        ],
      },
    ];
  },
};
</script>

<style scoped lang="scss">
.home {
  line-height: 2;
}

.select-tree {
  margin-top: 10px;
  width: 360px;
}

.ml-10 {
  margin-left: 10px;
}
</style>
