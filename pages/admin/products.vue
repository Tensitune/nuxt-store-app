<template>
  <v-container>
    <v-sheet class="pa-4 my-6" elevation="4" rounded="lg">
      <v-row align="center">
        <v-col cols="5" align-self="baseline">
          <div class="d-flex align-center">
            <v-combobox
              v-model="product"
              :items="products.rows"
              item-text="title"
              label="Выбрать товар"
              prepend-icon="mdi-archive"
              hide-details
              clearable
              outlined
              dense
            />
            <span v-if="checkProduct" class="ml-2">#{{ product.id }}</span>
          </div>

          <v-img v-if="thumbnail" class="mt-4" :src="thumbnail" height="256" contain />

          <div v-if="checkProduct" class="d-flex align-baseline">
            <v-file-input
              v-model="fileInput"
              :rules="[v => !v || v.size < 4192000 || 'Размер изображения должен быть меньше 4 МБ!']"
              :label="thumbnail ? 'Изменить изображение' : 'Добавить изображение'"
              class="mt-4 mr-2"
              accept="image/png, image/jpeg"
              placeholder="Изображение товара"
              prepend-icon="mdi-camera"
              outlined
              dense
            />
            <v-btn color="deep-purple lighten-2" icon @click="uploadImage">
              <v-icon>mdi-upload</v-icon>
            </v-btn>
          </div>
        </v-col>
        <v-col cols="7">
          <v-form v-if="checkProduct" ref="form" v-model="valid" lazy-validation>
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

              <v-col class="d-flex flex-row" cols="12">
                <v-dialog v-model="productEditDialog" max-width="400px">
                  <template #activator="{ on, attrs }">
                    <v-btn color="deep-purple lighten-2" text v-bind="attrs" v-on="on">
                      <v-icon class="mr-1">mdi-circle-edit-outline</v-icon>
                      Изменить товар
                    </v-btn>
                  </template>

                  <v-card>
                    <v-card-title>Вы хотите изменить товар?</v-card-title>
                    <v-card-actions>
                      <v-spacer />
                      <v-btn color="deep-purple lighten-2" text @click="editProduct">
                        Изменить
                      </v-btn>
                      <v-btn color="blue darken-1" text @click="productEditDialog = false">
                        Закрыть
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-dialog>

                <v-dialog v-model="productDeleteDialog" max-width="400px">
                  <template #activator="{ on, attrs }">
                    <v-btn color="red lighten-1" text v-bind="attrs" v-on="on">
                      <v-icon>mdi-delete</v-icon>
                      Удалить товар
                    </v-btn>
                  </template>

                  <v-card>
                    <v-card-title>Вы хотите удалить товар?</v-card-title>
                    <v-card-actions>
                      <v-spacer />
                      <v-btn color="red lighten-1" text @click="deleteProduct">
                        Удалить
                      </v-btn>
                      <v-btn color="blue darken-1" text @click="productDeleteDialog = false">
                        Закрыть
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-dialog>
              </v-col>
            </v-row>
          </v-form>

          <ButtonProductAdd v-else :categories="categories" />
        </v-col>
      </v-row>
    </v-sheet>
  </v-container>
</template>

<script>
export default {
  middleware: "AdminMiddleware",
  async asyncData({ $axios }) {
    const { data: categories } = await $axios.get("/categories");
    const { data: products } = await $axios.get("/products");
    return { categories, products };
  },
  data: () => ({
    valid: true,
    productEditDialog: false,
    productDeleteDialog: false,
    product: null,
    fileInput: null,
    categories: {
      count: 0,
      rows: []
    },
    products: {
      count: 0,
      rows: []
    },
    requiredRules: v => !!v || "Это поле обязательно для заполнения"
  }),
  computed: {
    checkProduct() {
      return (this.product && typeof this.product === "object");
    },
    thumbnail() {
      if (!this.checkProduct) return "";

      let thumbnail = "";
      try {
        thumbnail = require(`~/assets/products/${this.product.id}.jpg`);
      } catch (err) {
        console.log(`Изображение товара ${this.product.title} (${this.product.id}.jpg) не найдено`);
      }

      return thumbnail;
    }
  },
  methods: {
    async uploadImage() {
      if (!this.checkProduct || !this.fileInput) return;

      const formData = new FormData();
      formData.append("file", this.fileInput);

      await this.$axios.post(`/products/${this.product.id}/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      }).then(res => {
        if (res.data.success) this.$nuxt.$emit("snackbarCall", "Изображение товара успешно загружено!");
      }).catch(err => {
        console.log(err);
      });
    },
    async editProduct() {
      if (!this.checkProduct) return;

      await this.$axios.put(`/products/${this.product.id}`, {
        categoryId: this.product.categoryId,
        title: this.product.title,
        description: this.product.description,
        price: this.product.price,
        stock: this.product.stock,
        isRecommended: this.product.isRecommended
      }).then(res => {
        if (!res.data.success) {
          this.$nuxt.$emit("snackbarCall", "Не удалось изменить товар.", "red", "mdi-alert");
          return;
        }

        this.productEditDialog = false;
        this.$nuxt.$emit("snackbarCall", "Товар успешно изменён!");
      });
    },
    async deleteProduct() {
      if (!this.checkProduct) return;

      await this.$axios.delete(`/products/${this.product.id}`).then(res => {
        if (!res.data.success) {
          this.$nuxt.$emit("snackbarCall", "Не удалось удалить товар.", "red", "mdi-alert");
          return;
        }

        this.products.rows = this.products.rows.filter(item => item.id !== this.product.id);
        this.product = null;

        this.productDeleteDialog = false;
        this.$nuxt.$emit("snackbarCall", "Товар успешно удалён!");
      });
    }
  }
};
</script>
