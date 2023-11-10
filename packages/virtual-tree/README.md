# vue-2-virtual-scroll-tree

[//]: # (element-plus中提供了一个虚拟树，针对大量数据的处理做了优化。而elementUi中则缺少此类组件，因此vue-virtual-scroll-tree将提供该项能力。)
ElementPLus provide a [virtualized tree](https://element-plus.org/zh-CN/component/tree-v2.html) to work out a mount of
data. ElementUI don`t has the same component so far.

Therefore,vue-2-virtual-scroll-tree implement it.

# Table of Contents

1. [Advantages](#Advantages)
2. [Installation](#Installation)
3. [Usage](#Usage)
    1. [Import](#Import)
    2. [Basic](#Usage)
    3. [Selection](#Selection)
    4. [Props](#Props)
    5. [Events](#Events)
    6. [Methods](#Methods)

## Advantages

1. only 1 required props,sample and easy to use
2. automatically calculate item size,free hands
3. complex interactive operation,including singles election,multi selection,selection without children,and on...

## Installation

```shell
npm i vue-2-virtual-scroll-tree
```

## Usage

### Import

```vue
import Vue from 'vue'
import Vue2VirtualScrollTree from 'vue2-virtual-scroll-tree'

Vue.use(Vue2VirtualScroll)
```

### Basic

It accepts a option prop that must be a List.The list is a object with required three key respectively are id,parentId
and label.

Then list will be transformed to a tree in rending. example:

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
          { name: 'Root node', parentId: '0', id: 'root' },
          { name: 'Leaf node', parentId: 'root', id: 1 }
        ]
      }
    },

    methods: {
      treeNormalizer(item) {
        return { label: item.name };
      }
    }
  }
</script>
```

you can see there don`t have standard object key in label,instead of name.But the code have no any error report.

This is because vue-2-virtual-scroll-tree can receive a prop named normalizer which type is function.It must return the
standard object key by modifying params from original opt

### Selection

vue-2-virtual-scroll-tree support complex selection.It referred to [vue-treeselect](https://vue-treeselect.js.org/).

There provide several kinds of mode to select on prop valueConsistsOf:

1. ALL: normal mode,return all selected node including associated children nodes
2. ALL_WITH_INDETERMINATE: return all selected node including associated children nodes and half selected breach nodes
3. LEAF_PRIORITY: return all selected node including only leaf nodes,excluding all branch nodes selected in spite of
   each other
4. BRANCH_PRIORITY: return all branch nodes which every child must be selected.if not,return leaf nodes rather than
   self.(it is default)

```vue

<template>
  <div class="container">
    <vue-virtual-scroll-tree
      height="360px"
      v-model="selectMode"
      :showCheckbox="true"
      :options="treeOptions"
      :normalizer="treeNormalizer"
      :valueConsistsOf="'BRANCH_PRIORITY'"
    />
  </div>
</template>

<script>
  export default {
    data() {
      return {
        selectMode: {},
        treeOptions: [
          { name: "Root node", parentId: "0", id: "root" },
          { name: "Leaf node", parentId: "root", id: 1 }
        ]
      };
    },

    methods: {
      treeNormalizer(item) {
        return { label: item.name };
      }
    }
  };
</script>
```

### Props

| prop                              | describe                                        | type            | optional                          | default                         |
|:----------------------------------|-------------------------------------------------|-----------------|-----------------------------------|---------------------------------|
| value / v-model                   | value                                           | string / number | --                                |
| height                            | height                                          | string          | --                                | 300px                           |
| itemWrapClass                     | custom item style                               | string          | --                                | --                              |
| lineWrapShowTip                   | show text tip                                   | boolean         | --                                | true                            |
| highlightCurrent                  | highlight current row                           | boolean         | --                                | true                            |
| defaultExpandAll                  | expand all branch node                          | boolean         | --                                | true                            |
| defaultExpandedKeys               | expand branch node by keys                      | array           | --                                | --                              |
| filterNodeMethod                  | filter node                                     | function        | --                                | --                              |
| iconClass                         | icon in left                                    | string          | --                                | el-icon-caret-right             |
| expandOnClickNode                 | expand row when click node                      | boolean         | --                                | true                            |
| disableBranchNodes                | disable branch node                             | boolean         | --                                | false                           |
| normalizer                        | custom object of options item                   | function        | --                                | --                              |
| defaultParentId                   | tell parentId when struct tree                  | string          | --                                | 0                               |
| matchKeys                         | the label when search                           | string          | --                                | label                           |
| disableFuzzyMatching              | disable fuzzy match                             | boolean         | --                                | false                           |
| flattenSearchResults              | flat search result                              | boolean         | --                                | false                           |
| searchNested                      | Depth search                                    | boolean         | --                                | false                           |
| showCheckbox                      | is can select                                   | boolean         | --                                | false                           |
| disabled                          | disable select                                  | boolean         | --                                | false                           |
| multiple                          | enable multi search                             | boolean         | --                                | true                            |
| autoSelectAncestors               | auo select ancestors（only flat mode）            | boolean         | --                                | false                           |
| autoSelectDescendants             | auo select descendants（only flat mode）          | boolean         | --                                | false                           |
| autoDeselectAncestors             | auo deselect ancestors（only flat mode）          | boolean         | --                                | false                           |
| autoDeselectDescendants           | auo deselect descendants（only flat mode）        | boolean         | --                                | false                           |
| allowSelectingDisabledDescendants | auo select disabled descendants（only flat mode） | boolean         | --                                | false                           |
| flat                              | flat mode                                       | boolean         | --                                | false                           |
| valueFormat                       | format value                                    | string          | [string \| array]   \| id \|array | [id                  \| object] |
| delimiter                         | format value by delimiter                       | string          | --                                | ,                               |
| valueConsistsOf                   | v-model value formatter                         | string          | valueConsistsOf mode              | BRANCH_PRIORITY                 | 
| sortValueBy                       | v-model value sorted                            | string          | sortValueBy mode                  | ORDER_SELECTED                  |

valueConsistsOf mode

| name                   | describe                                                                                                             |
|------------------------|----------------------------------------------------------------------------------------------------------------------|
| ALL                    | normal mode,return all selected node including associated children nodes                                             |
| BRANCH_PRIORITY        | return all branch nodes which every child must be selected.if not,return leaf nodes rather than self.(it is default) |
| LEAF_PRIORITY          | return all selected node including only leaf nodes,excluding all branch nodes selected in spite of each other        |
| ALL_WITH_INDETERMINATE | return all selected node including associated children nodes and half selected breach nodes                          |

sortValueBy mode

| name           | describe                                                                                    |
|----------------|---------------------------------------------------------------------------------------------|
| ORDER_SELECTED | on the basis of you click order                                                             |
| LEVEL          | sorted by level of tree and sorted by INDEX in equal level: Level of option: C 🡒 BB 🡒 AAA |
| INDEX          | sorted by index: Index of option: AAA 🡒 BB 🡒 C                                            |

options above on:

1. A
    1. AA
        1. AAA
    2. AB
2. B
    1. BA
    2. BB
3. c

### Events

| event name    | describe        | params                |
|---------------|-----------------|-----------------------|
| node-click    | click node      | (raw, oldRwa)         |
| icon-click    | click left icon | (expandStatus)        |
| search-change | filter search   | (searchText)          |
| selected      | selected        | (node, nodes, status) |
| deselected    | deselected      | (node)                |

### Methods

| event name     | describe            | params               |
|----------------|---------------------|----------------------|
| getNode        | ge node             | (nodeId)             |
| toggleNode     | toggle node status  | (nodeOrKey, status)  |
| toggleNodes    | toggle nodes status | (nodeOrKeys, status) |
| toggleNodesAll | toggle all nodes    | ()                   |
