<template>
  <v-dialog ref="form" v-model="dialog" max-width="600px">
    <template #activator="{ on, attrs }">
      <v-btn color="green white--text" rounded v-bind="attrs" v-on="on">
        Добавить товар
      </v-btn>
    </template>
    <v-form ref="form" v-model="valid" lazy-validation>
      <v-card>
        <v-card-title>
          <span class="headline">Добавить товар</span>
        </v-card-title>

        <v-card-text>
          <v-row>
            <v-col cols="12">
              <v-select
                v-model="product.categoryId"
                :items="categories"
                item-text="title"
                item-value="id"
                label="Категория товара"
                hide-details
                outlined
                dense
              />
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="product.title"
                :rules="[requiredRules, v => (v && v.length <= 80) || 'Длина должна быть не больше 80 символов.']"
                label="Наименование товара"
                counter="80"
                required
              />
            </v-col>
            <v-col class="pb-0" cols="12">
              <v-textarea
                v-model="product.description"
                :rules="[requiredRules]"
                label="Описание товара"
                outlined
                required
              />
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="product.price"
                :rules="[requiredRules]"
                label="Цена товара"
                type="number"
                required
              />
            </v-col>
            <v-col class="pb-0" cols="12">
              <v-text-field
                v-model="product.stock"
                :rules="[requiredRules]"
                label="Количество товара на складе"
                type="number"
                required
              />
            </v-col>
            <v-col class="pb-0" cols="12">
              <v-checkbox v-model="product.isRecommended" label="Рекомендовать товар" />
            </v-col>
          </v-row>

          <h3 v-if="error" class="red--text">{{ error }}</h3>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn color="green" text @click="addProduct">
            Добавить
          </v-btn>
          <v-btn color="blue darken-1" text @click="dialog = false">
            Закрыть
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script>
export default {
  props: {
    categories: {
      type: Array,
      required: true
    }
  },
  data: () => ({
    valid: true,
    dialog: false,
    error: "",
    product: {
      categoryId: 1,
      title: "",
      description: "",
      price: 0,
      stock: 0,
      isRecommended: false
    },
    requiredRules: v => !!v || "Это поле обязательно для заполнения"
  }),
  methods: {
    async addProduct() {
      const isValid = this.$refs.form.validate();
      if (!isValid) return;

      await this.$axios.post(`/products`, this.product).then(res => {
        if (!res.data.success) {
          this.error = res.data.error || "Что-то пошло не так";
          this.$nuxt.$emit("snackbarCall", "Не удалось добавить товар.", "red", "mdi-alert");

          return;
        }

        this.$refs.form.reset();
        this.dialog = false;

        this.$nuxt.$emit("snackbarCall", "Товар успешно добавлен!");
      }).catch(err => {
        console.log(err);
        this.error = "Что-то пошло не так";
      });
    }
  }
};
</script>
