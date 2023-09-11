# 虚拟树

element-plus中提供了一个虚拟树，针对大量数据的处理做了优化。而elementUi中则缺少此类组件，因此vue-virtual-scroll-tree将提供该项能力。

## 基础用法

options接受一个数组列表，每一行数据包含了父子关系，vue-virtual-scroll-tree内部会自动将其转化未一棵树从而渲染。

默认的父子关系为：{ id, parentId, label } 中的parentId，利用normalizer则可以自定义这些值。

```vue

<template>
  <div class="container">
    <vue-virtual-scroll-tree
        height="360px"
        :options="treeOptions"
        :normalizer="treeNormalizer"
    />
  </div>
</template>

<script>
  export default {
    data() {
      return {
        treeOptions: [
          {name: '根节点', parentId: '0', id: 'root'},
          {name: '叶子节点', parentId: 'root', id: 1}
        ]
      }
    },

    methods: {
      treeNormalizer() {
        return {label: item.name};
      }
    }
  }
</script>
```

## 选择模式

vue-virtual-scroll-tree分为单选和多选两种模式。

单选相对简单，允许独立选择分支节点和叶子节点。

多选模式则会复杂很多，比如选择模式有常规模式和平铺模式。常规模式为选中分支节点，子节点会相对应的被选中；选中子节点对应父节点也会选中。

而平铺模式则无论选择分支节点还是子节点都不会互相影响，完全独立。

另外，vue-virtual-scroll-tree还提供对v-model提供了不同选择类型：

1. 分支优先：当子节点全部选中时，只返回分支节点（默认）
2. 叶子优先：当子节点全部选中时，只返回叶子节点，不返回分支节点
3. 所有选中：标准模式，返回选中节点
4. 所有选中以及半选中：标准模式，返回选中节点同时返回半选中的分支节点

以及对选中值的排序：

1. 按选择顺序：字面意思，选择时决定顺序（默认）
2. 按层级深度：层级越高排序越靠后，同级按显示循序排序
3. 按索引：按字母从小到到排序 A->B，中文排序则会存在问题

## 过滤搜索

对于大量的数据，如果没有搜索功能，让用户去自己找相比是灾难性的。

vue-virtual-scroll-tree支持强大的搜索功能。默认开启模糊搜索，即不完全匹配，而是根据输入的字符截取搜索。

同时支持嵌入搜索，可以先输入”根节点“，输入空格后，再接子级需要的查询的值，”叶子节点“。

## 属性

| 参数                                | 说明                   | 类型              | 可选值                                                         | 默认值                 |
|:----------------------------------|----------------------|-----------------|-------------------------------------------------------------|---------------------|
| value / v-model                   | 绑定值                  | string / number | --                                                          |
| height                            | 高度                   | string          | --                                                          | 300px               |
| itemWrapClass                     | 行绑定样式                | string          | --                                                          | --                  |
| lineWrapShowTip                   | 是否显示tip              | boolean         | --                                                          | true                |
| highlightCurrent                  | 是否高亮当前行              | boolean         | --                                                          | true                |
| defaultExpandAll                  | 默认展开所有节点             | boolean         | --                                                          | true                |
| defaultExpandedKeys               | 默认展开的节点keys          | array           | --                                                          | --                  |
| filterNodeMethod                  | 对节点进行过滤              | function        | --                                                          | --                  |
| iconClass                         | 左侧展开图标class          | string          | --                                                          | el-icon-caret-right |
| expandOnClickNode                 | 点击node是否是展开节点        | boolean         | --                                                          | true                |
| disableBranchNodes                | 禁用所有的分支节点            | boolean         | --                                                          | false               |
| normalizer                        | 自定义关键字               | function        | --                                                          | --                  |
| defaultParentId                   | 默认的parentId值，用于寻找根节点 | string          | --                                                          | 0                   |
| matchKeys                         | 过滤字段，搜索时过滤用          | string          | --                                                          | label               |
| disableFuzzyMatching              | 禁用模糊匹配               | boolean         | --                                                          | false               |
| flattenSearchResults              | 是否平铺搜索的结果            | boolean         | --                                                          | false               |
| searchNested                      | 是否内嵌搜索               | boolean         | --                                                          | false               |
| showCheckbox                      | 是否显示选择框              | boolean         | --                                                          | false               |
| disabled                          | 是否禁用选择框              | boolean         | --                                                          | false               |
| multiple                          | 是否多选                 | boolean         | --                                                          | true                |
| autoSelectAncestors               | 自动选择祖先（限平铺模式）        | boolean         | --                                                          | false               |
| autoSelectDescendants             | 自动选择后代（限平铺模式）        | boolean         | --                                                          | false               |
| autoDeselectAncestors             | 自动反选祖先（限平铺模式）        | boolean         | --                                                          | false               |
| autoDeselectDescendants           | 自动反选后代（限平铺模式）        | boolean         | --                                                          | false               |
| allowSelectingDisabledDescendants | 自动选择被禁用节点（限平铺模式）     | boolean         | --                                                          | false               |
| flat                              | 平铺模式                 | boolean         | --                                                          | false               |
| valueFormat                       | 值格式化                 | string          | [id                                                         | object]             |[string | array] | id|array |
| delimiter                         | 格式化分隔符               | string          | --                                                          | ,                   |
| valueConsistsOf                   | 值组织方式                | string          | ALL, BRANCH_PRIORITY, LEAF_PRIORITY, ALL_WITH_INDETERMINATE | BRANCH_PRIORITY     | 
| sortValueBy                       | 值排序方式                | string          | ORDER_SELECTED, LEVEL, INDEX                                | ORDER_SELECTED      |

## events

| 事件名称          | 说明       | 回调参数                  |
|---------------|----------|-----------------------|
| node-click    | 点击node   | (raw, oldRwa)         |
| icon-click    | 点击左侧展开图标 | (expandStatus)        |
| search-change | 搜索过滤     | (searchText)          |
| selected      | 节点选中     | (node, nodes, status) |
| deselected    | 节点取消     | (node)                |

## methods

| 事件名称           | 说明     | 参数                   |
|----------------|--------|----------------------|
| getNode        | 获取node | (nodeId)             |
| toggleNode     | 点击node | (nodeOrKey, status)  |
| toggleNodes    | 点击node | (nodeOrKeys, status) |
| toggleNodesAll | 点击node | ()                   |

## Q&A

1. 如何做options的单个更新？而非全局更新？

vue-virtual-scroll-tree内部对options进行了深度监测，options变化则会重新进行渲染整棵树。

Vue在dom更新事会做diff比较，那么仅仅是单个值的变化的开销集中在运行上，而非dom的更新，这个速度是很快的。

除了单个更新，如果要添加，则直接将新的数据推入到options即可。删除也很简单，splice即可，但开销可能会相对较高。
