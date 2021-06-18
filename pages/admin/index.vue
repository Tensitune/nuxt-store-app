<template>
  <v-container>
    <v-sheet class="pa-4 my-6" elevation="4" rounded="lg">
      <div class="title mb-4">Панель администратора</div>
      <v-btn v-for="(item, i) of items" :key="i" :to="item.link" class="mx-2" nuxt>
        {{ item.title }}
      </v-btn>
    </v-sheet>
  </v-container>
</template>

<script>
export default {
  middleware: "AdminMiddleware",
  data: () => ({
    items: [
      {
        title: "Редактирование категорий",
        link: "/admin/categories"
      },
      {
        title: "Редактирование товаров",
        link: "/admin/products"
      },
      {
        title: "Управление заказами",
        link: "/admin/orders"
      }
    ]
  })
};
</script>
