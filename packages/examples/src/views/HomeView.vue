<template>
  <div class="home">
    <div style="width: 300px">
      <el-form>
        <el-form-item label="水果">
          <el-select-tree v-model="valued" :options="options" :defaultExpandLevel="3" />
        </el-form-item>

        <el-form-item label="用户">
          <el-button @click="show = !show">展示</el-button>
          <el-select-tree v-show="show" v-model="valuedLocal" :options="list" large />
        </el-form-item>
      </el-form>
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

export default {
  name: "HomeView",

  data() {
    return {
      valued: null,
      valuedLocal: null,
      options: [],
      list: [],
      show: true,
    };
  },

  created() {
    this.options = OPTIONS;

    this.list = Array(100)
      .fill(1)
      .map((_, index) => {
        return {
          disabled: index % 2 === 0,
          id: index * 10 + "",
          label: index * 10 + "",
          children: Array.from({ length: 10 })
            .fill(1)
            .map((v, i) => {
              return {
                id: index + "A" + i,
                label: index + "A" + i,
              };
            }),
        };
      });
  },
};
</script>

<style scoped>
.scroller {
  height: 300px;
}
</style>
