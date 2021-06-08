<template>
  <v-container>
    <v-sheet class="pa-4 my-6" elevation="4" rounded="lg">
      <div class="title mb-4">Ваши заказы</div>

      <Pagination v-if="orders.count" :count="orders.count" :limit="perPage" @onPageChange="onPageChange">
        <v-row>
          <v-col v-for="order of orders.rows" :key="order.id" cols="12">
            <v-sheet class="pa-4" elevation="2" outlined>
              <div class="title">Заказ №{{ order.id }} от {{ convertDatetime(order.orderDate) }}</div>
              <div class="subtitle-1">
                Статус: <span :class="statusCodes[order.status].color + '--text'">{{ statusCodes[order.status].title }}</span>
              </div>
              <div v-if="!loading">
                <v-simple-table v-if="!loading">
                  <template #default>
                    <thead>
                      <tr>
                        <th class="text-left">
                          Наименование товара
                        </th>
                        <th class="text-center">
                          Цена
                        </th>
                        <th class="text-center">
                          Количество
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="item in JSON.parse(order.cartItems)" :key="item.id">
                        <td>{{ products[order.id][item.productId].title }}</td>
                        <td class="text-center">{{ products[order.id][item.productId].price }}</td>
                        <td class="text-center">{{ item.quantity }}</td>
                      </tr>
                    </tbody>
                  </template>
                </v-simple-table>

                <div class="overline text-right">
                  Цена за товары: {{ formatCurrency(getProductsPrice(order)) }}
                </div>
                <div class="overline text-right">
                  Цена за доставку: {{ formatCurrency(deliveryPrice) }}
                </div>
                <div class="overline text-right">
                  Итого: {{ formatCurrency(getProductsPrice(order) + deliveryPrice) }}
                </div>
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
    loading: true,
    deliveryPrice: 500,
    page: 1,
    perPage: 9,
    products: {},
    orders: {
      count: 0,
      rows: []
    },
    statusCodes: {
      0: { title: "Ожидание", color: "red" },
      1: { title: "Отгрузка", color: "yellow" },
      2: { title: "В пути", color: "yellow" },
      3: { title: "Доставлен", color: "green" }
    }
  }),
  async mounted() {
    this.orders = (await this.$axios.get(`/orders?page=1&perPage=${this.perPage}`)).data;
    await this.fetchProducts();

    this.loading = false;
  },
  methods: {
    async fetchProducts() {
      for (const order of this.orders.rows) {
        const orderItems = JSON.parse(order.cartItems);
        this.products[order.id] = {};

        for (const item of orderItems) {
          const { data: product } = await this.$axios.get(`/products/${item.productId}`);
          this.products[order.id][item.productId] = product;
        }
      }
    },
    async onPageChange(page) {
      this.loading = true;

      this.page = page;
      this.orders = (await this.$axios.get(`/orders?page=${this.page}&perPage=${this.perPage}`)).data;
      await this.fetchProducts();

      this.loading = false;
    },
    getProductsPrice(order) {
      let productsPrice = 0;
      for (const item of JSON.parse(order.cartItems)) {
        productsPrice += this.products[order.id][item.productId].price;
      }

      return productsPrice;
    },
    formatCurrency(price) {
      return new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB" }).format(price);
    },
    convertDatetime(datetime) {
      return new Date(datetime).toLocaleString("ru");
    }
  }
};
</script>
