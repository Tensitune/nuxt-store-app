<template>
  <v-container>
    <v-sheet class="pa-4 my-6" elevation="4" rounded="lg">
      <v-row align="center">
        <v-col cols="5" align-self="baseline">
          <v-combobox
            v-model="category"
            :items="categories"
            item-text="title"
            label="Выбрать категорию"
            prepend-icon="mdi-folder"
            hide-details
            clearable
            outlined
            dense
          />
        </v-col>
        <v-col cols="7">
          <v-form v-if="checkCategory" ref="form" v-model="valid" lazy-validation>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="category.title"
                  :rules="[requiredRules, v => (v && v.length <= 50) || 'Длина должна быть не больше 50 символов.']"
                  label="Наименование категории"
                  counter="50"
                  required
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="category.price"
                  :rules="[requiredRules, v => (v && v.length <= 25) || 'Длина должна быть не больше 25 символов.']"
                  label="Иконка категории"
                  counter="25"
                  required
                />
              </v-col>

              <v-col class="d-flex flex-row" cols="12">
                <v-dialog v-model="categoryEditDialog" max-width="400px">
                  <template #activator="{ on, attrs }">
                    <v-btn color="deep-purple lighten-2" text v-bind="attrs" v-on="on">
                      <v-icon class="mr-1">mdi-circle-edit-outline</v-icon>
                      Изменить категорию
                    </v-btn>
                  </template>

                  <v-card>
                    <v-card-title>Вы хотите изменить категорию?</v-card-title>
                    <v-card-actions>
                      <v-spacer />
                      <v-btn color="deep-purple lighten-2" text @click="editCategory">
                        Изменить
                      </v-btn>
                      <v-btn color="blue darken-1" text @click="categoryEditDialog = false">
                        Закрыть
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-dialog>

                <v-dialog v-model="categoryDeleteDialog" max-width="400px">
                  <template #activator="{ on, attrs }">
                    <v-btn color="red lighten-1" text v-bind="attrs" v-on="on">
                      <v-icon>mdi-delete</v-icon>
                      Удалить категорию
                    </v-btn>
                  </template>

                  <v-card>
                    <v-card-title>Вы хотите удалить категорию?</v-card-title>
                    <v-card-actions>
                      <v-spacer />
                      <v-btn color="red lighten-1" text @click="deleteCategory">
                        Удалить
                      </v-btn>
                      <v-btn color="blue darken-1" text @click="categoryDeleteDialog = false">
                        Закрыть
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-dialog>
              </v-col>
            </v-row>
          </v-form>

          <ButtonCategoryAdd v-else />
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
    return { categories };
  },
  data: () => ({
    valid: true,
    categoryEditDialog: false,
    categoryDeleteDialog: false,
    category: null,
    categories: {
      count: 0,
      rows: []
    },
    requiredRules: v => !!v || "Это поле обязательно для заполнения"
  }),
  computed: {
    checkCategory() {
      return (this.category && typeof this.category === "object");
    }
  },
  methods: {
    async editCategory() {
      if (!this.checkCategory) return;

      await this.$axios.put(`/categories/${this.category.id}`, {
        title: this.category.title,
        icon: this.category.icon
      }).then(res => {
        if (!res.data.success) {
          this.$nuxt.$emit("snackbarCall", "Не удалось изменить категорию.", "red", "mdi-alert");
          return;
        }

        this.categoryEditDialog = false;
        this.$nuxt.$emit("snackbarCall", "Категория успешно изменена!");
      });
    },
    async deleteCategory() {
      if (!this.checkCategory) return;

      await this.$axios.delete(`/categories/${this.category.id}`).then(res => {
        if (!res.data.success) {
          this.$nuxt.$emit("snackbarCall", "Не удалось удалить категорию.", "red", "mdi-alert");
          return;
        }

        this.categories = this.categories.filter(item => item.id !== this.category.id);
        this.category = null;

        this.categoryDeleteDialog = false;
        this.$nuxt.$emit("snackbarCall", "Категория успешно удалена!");
      });
    }
  }
};
</script>
