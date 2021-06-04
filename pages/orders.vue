<template>
  <v-container>
    <v-sheet class="pa-4 my-6" elevation="4" rounded="lg">
      <div class="title mb-4">Ваши заказы</div>

      <Pagination v-if="orders" :count="orders.length" :limit="perPage" @onPageChange="onPageChange">
        <v-row>
          <v-col v-for="order of orders" :key="order.id" cols="12">
            <v-sheet class="pa-4" elevation="2" outlined>
              <div class="title">Заказ №{{ order.id }}</div>
              <div class="subtitle-1">
                Статус: <span :class="statusCodes[order.status].color + '--text'">{{ statusCodes[order.status].title }}</span>
              </div>
            </v-sheet>
          </v-col>
        </v-row>
      </Pagination>

      <div v-else>Вы не делали никаких заказов</div>
    </v-sheet>
  </v-container>
</template>

<script>
export default {
  middleware: "AuthMiddleware",
  data: () => ({
    orders: [],
    statusCodes: {
      0: { title: "Ожидание", color: "red" },
      1: { title: "Отгрузка", color: "yellow" },
      2: { title: "В пути", color: "yellow" },
      3: { title: "Доставлен", color: "green" }
    }
  }),
  async mounted() {
    this.orders = (await this.$axios.get("/orders")).data;
  }
};
</script>
