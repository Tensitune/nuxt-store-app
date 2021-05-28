<template>
  <v-container>
    <v-sheet v-if="cart.length" class="pa-4 my-6" elevation="4" rounded="lg">
      <div class="title mb-4">Ваша корзина</div>
      <v-row align="center" justify="center">
        <v-col cols="8">
          <v-form ref="form" v-model="valid" lazy-validation>
            <v-row>
              <v-col class="d-flex" cols="12">
                <v-text-field
                  v-model="email"
                  :rules="[rules.required, rules.email]"
                  label="Почта"
                  hint="Введите адрес эл. почты для отправки чека"
                  persistent-hint
                  required
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="delivery.address"
                  :rules="[rules.required]"
                  label="Адрес доставки"
                  hint="Введите адрес, куда необходимо доставить товары"
                  persistent-hint
                  required
                />
              </v-col>
              <v-col cols="12">
                <v-btn color="deep-purple lighten-2 white--text" @click="checkOut">Оплатить</v-btn>
              </v-col>
            </v-row>
          </v-form>
        </v-col>
        <v-col cols="4" align-self="baseline">
          <v-data-table
            :headers="tableHeaders"
            :items="tableItems"
            hide-default-header
            hide-default-footer
            class="elevation-1"
          />
        </v-col>
      </v-row>
    </v-sheet>

    <v-sheet class="pa-4 my-6" elevation="4" rounded="lg">
      <div class="title mb-4">Товары в корзине</div>
      <v-row v-if="cart.length">
        <v-col v-for="item of cart" :key="item.id" cols="12">
          <v-sheet class="pa-4" elevation="2" outlined>
            <v-row align="center">
              <v-col cols="2">
                <v-img :src="item.thumbnail" height="150" contain />
              </v-col>
              <v-col cols="8">
                <div class="title">{{ item.title }}</div>
                <div class="subtitle-1">{{ formatCurrency(item.price) }}</div>
              </v-col>
              <v-col class="d-flex flex-column" cols="2">
                <v-text-field
                  :value="item.quantity"
                  prepend-icon="mdi-minus"
                  append-outer-icon="mdi-plus"
                  readonly
                  outlined
                  dense
                  @click:prepend="reduceQuantity(item.id)"
                  @click:append-outer="increaseQuantity(item.id)"
                />

                <v-btn color="red lighten-2 white--text" @click="removeItem(item.id)">
                  Удалить
                </v-btn>
              </v-col>
            </v-row>
          </v-sheet>
        </v-col>
      </v-row>

      <div v-else>Нет товаров в корзине</div>
    </v-sheet>
  </v-container>
</template>

<script>
import { mapState } from "vuex";

export default {
  middleware: "AuthMiddleware",
  data: () => ({
    valid: true,
    delivery: {
      price: 500,
      address: ""
    },
    email: "",
    rules: {
      required: v => !!v || "Это поле обязательно для заполнения",
      email: v => {
        const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return pattern.test(v) || "Неверный формат адреса электронной почты.";
      }
    },
    tableHeaders: [
      { align: "left", value: "left" },
      { align: "right", value: "right" }
    ]
  }),
  computed: {
    ...mapState({
      user: state => state.user,
      cart: state => state.userCart
    }),
    tableItems() {
      const deliveryPrice = this.delivery.price || 0;

      let productsTotal = 0;
      if (this.cart) {
        for (const item of this.cart) {
          productsTotal += item.price * item.quantity;
        }
      }

      return [
        { left: "Товары", right: this.formatCurrency(productsTotal) },
        { left: "Доставка", right: this.formatCurrency(deliveryPrice) },
        { left: "Итого", right: this.formatCurrency(productsTotal + deliveryPrice) }
      ];
    }
  },
  methods: {
    checkOut() {
      const isValid = this.$refs.form.validate();
      if (isValid) {
        this.$axios.post("/cart/checkout", {
          email: this.email,
          address: this.delivery.address
        }).then(res => {
          if (res.status === "error") {
            this.error = res.error;
            return;
          }

          this.$refs.form.reset();
          this.$nuxt.$emit("snackbarCall", "Вы успешно провели оплату товаров в корзине!");
          this.$store.commit("setCart", []);
        }).catch(err => {
          console.log(err);
          this.$nuxt.$emit("snackbarCall", "Что-то пошло не так при оплате", "red", "mdi-close-octagon");
        });
      }
    },
    formatCurrency(price) {
      return new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB" }).format(price);
    },
    async reduceQuantity(productId) {
      const cartItem = this.cart.filter(item => item.id === productId)[0];
      if (!cartItem) return;

      if (cartItem.quantity < 2) {
        this.$store.commit("removeCartItem", productId);
        return await this.$axios.delete(`/cart/${productId}`);
      }

      this.$store.commit("reduceCartQuantity", productId);
      await this.$axios.put(`/cart/${productId}`, {
        quantity: cartItem.quantity
      });
    },
    async increaseQuantity(productId) {
      const cartItem = this.cart.filter(item => item.id === productId)[0];
      if (!cartItem) return;

      this.$store.commit("increaseCartQuantity", productId);
      await this.$axios.put(`/cart/${productId}`, {
        quantity: cartItem.quantity
      });
    },
    async removeItem(productId) {
      this.$store.commit("removeCartItem", productId);
      await this.$axios.delete(`/cart/${productId}`);
    }
  }
};
</script>
