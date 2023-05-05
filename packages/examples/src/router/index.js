import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "home",
    redirect: "/select-tree",
    meta: {
      hidden: true,
    },
  },
  {
    path: "/select-tree",
    name: "select-tree",
    component: () => import("@/views/SelectTree.vue"),
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

export default router;

export { routes };
