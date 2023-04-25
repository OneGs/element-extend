<template>
  <div class="home">
    <div style="width: 300px">
      <el-form>
        <el-form-item label="水果">
          <el-select-tree v-model="valued" :options="options" />
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
const OPTIONS = [
  {
    id: "fruits 1",
    label: "Fruits",
    children: [
      {
        id: "apple",
        label: "This  Apple 🍎",
        isNew: true,
      },
      {
        id: "grapes",
        label: "Grapes 🍇",
        isDisabled: true,
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
      options: [],
    };
  },

  created() {
    this.options = OPTIONS;
  },
};
</script>
