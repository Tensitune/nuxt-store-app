<template>
  <v-container>
    <v-sheet class="pa-4 my-6" elevation="4" rounded="lg">
      <div class="title mb-4">Управление заказами</div>

      <Pagination v-if="Array.isArray(orders)" :count="orders.length" :limit="perPage" @onPageChange="onPageChange">
        <v-row>
          <v-col v-for="order of orders" :key="order.id" cols="12">
            <v-sheet class="pa-4" elevation="2" outlined>
              <div class="d-flex align-center">
                <div class="title">Заказ №{{ order.id }}</div>
                <v-spacer />

                <v-dialog v-model="orderEditDialog" max-width="400px">
                  <template #activator="{ on, attrs }">
                    <v-btn icon v-bind="attrs" v-on="on">
                      <v-icon class="mr-1">mdi-circle-edit-outline</v-icon>
                    </v-btn>
                  </template>

                  <v-form ref="form" v-model="valid" lazy-validation>
                    <v-card>
                      <v-card-title>Изменение заказа</v-card-title>

                      <v-card-text>
                        <v-select
                          v-model="status"
                          :items="[statusCodes[0], statusCodes[1], statusCodes[2], statusCodes[3]]"
                          item-text="title"
                          item-value="code"
                          label="Выбрать статус"
                          prepend-icon="mdi-clipboard-edit"
                          hide-details
                          outlined
                          dense
                        />
                      </v-card-text>

                      <v-card-actions>
                        <v-spacer />
                        <v-btn color="deep-purple lighten-2" text @click="editOrder(order.id, status)">
                          Изменить
                        </v-btn>
                        <v-btn color="blue darken-1" text @click="orderEditDialog = false">
                          Закрыть
                        </v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-form>
                </v-dialog>

                <v-dialog v-model="orderDeleteDialog" max-width="400px">
                  <template #activator="{ on, attrs }">
                    <v-btn color="red" icon v-bind="attrs" v-on="on">
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </template>

                  <v-card>
                    <v-card-title>Вы хотите удалить товар?</v-card-title>
                    <v-card-actions>
                      <v-spacer />
                      <v-btn color="red lighten-1" text @click="deleteOrder(order.id)">
                        Удалить
                      </v-btn>
                      <v-btn color="blue darken-1" text @click="orderDeleteDialog = false">
                        Закрыть
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-dialog>
              </div>
              <div class="subtitle-1">
                Статус: <span :class="statusCodes[order.status].color + '--text'">{{ statusCodes[order.status].title }}</span>
              </div>
            </v-sheet>
          </v-col>
        </v-row>
      </Pagination>

      <div v-else>На сайте нет заказов</div>
    </v-sheet>
  </v-container>
</template>

<script>
export default {
  middleware: "AdminMiddleware",
  data: () => ({
    valid: true,
    orderEditDialog: false,
    orderDeleteDialog: false,
    status: 0,
    page: 1,
    perPage: 9,
    orders: [],
    statusCodes: {
      0: { code: 0, title: "Ожидание", color: "red" },
      1: { code: 1, title: "Отгрузка", color: "yellow" },
      2: { code: 2, title: "В пути", color: "yellow" },
      3: { code: 3, title: "Доставлен", color: "green" }
    }
  }),
  async fetch() {
    this.orders = (await this.$axios.get(`/orders?page=${this.page}&perPage=${this.perPage}`)).data;
  },
  async mounted() {
    this.orders = (await this.$axios.get(`/orders?page=${this.page}&perPage=${this.perPage}`)).data;
  },
  methods: {
    async onPageChange(page) {
      this.page = page;
      await this.$fetch();
    },
    async editOrder(orderId, status) {
      console.log(orderId);
      await this.$axios.put(`/orders/${orderId}`, { status }).then(res => {
        if (!res.data.success) {
          this.$nuxt.$emit("snackbarCall", "Не удалось изменить заказ.", "red", "mdi-alert");
          return;
        }

        this.orderEditDialog = false;
        this.$nuxt.$emit("snackbarCall", "Заказ успешно изменён!");
      });
    },
    async deleteOrder(orderId) {
      await this.$axios.delete(`/orders/${orderId}`).then(res => {
        if (!res.data.success) {
          this.$nuxt.$emit("snackbarCall", "Не удалось удалить заказ.", "red", "mdi-alert");
          return;
        }

        this.orders = this.orders.filter(order => order.id !== orderId);

        this.orderDeleteDialog = false;
        this.$nuxt.$emit("snackbarCall", "Заказ успешно удалён!");
      });
    }
  }
};
</script>
