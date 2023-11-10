# common tools

[//]: # (工作以来常用的经验性工具，单独打包、单独发布、足够轻量。)
Common tools packaged independently, published independently and is lightweight enough.

# Table of Contents
1. [vue-2-virtual-scroll-tree](#vue-2-virtual-scroll-tree)

## vue-2-virtual-scroll-tree

[//]: # (在Vue2和ElementUi项目中，如果处理数据量庞大的树形结构，会导致操作卡顿，影响用户体验。)
Operating huge amount of data in tree will block the page rendering and affect user experience in vue2 and elementUi projects.

[//]: # (为了解决这个问题，ElementPlus中提供了virtual tree选项，但element中暂时不支持。不过好在存在着一些第三方虚拟树可供选择，但存在着一些问题：)
[//]: # (1. 对虚拟列表支持的很好，但虚拟树支持存在较多缺陷)
[//]: # (2. 尽管有一些第三方组件可以支持虚拟树，但对虚拟树可支持的操作有限)
[//]: # (3. 希望面对问题的时候，不至于处于抓瞎的情景)
In order to solve the problem. ElementPlus provide a COMPONENT named virtual-tree,but element does not support yet.
Unfortunately, There have lots of third-party virtual-tool can help, but always product some emergency, example:
1. it can run correctly in virtual list, but virtual tree.
2. Although third-party virtual-tool can support relatively perfect, it also has less function can be used.
3. Hope dealing with problems easily instead of likely blindfold.

[//]: # (为此，实现了vue-2-virtual-scroll-tree，其极大的借鉴了[vue-treeselect]&#40;https://vue-treeselect.js.org/&#41;，当然后续也会推出虚拟下拉选择树的——其不支持虚拟树。)
vue-2-virtual-scroll-tree learn a lot from [vue-treeselect](https://vue-treeselect.js.org/)  it is nice package to solve complex drop down to select problems. 

more details：[vue-2-virtual-scroll-tree](./packages/virtual-tree/README.md)


