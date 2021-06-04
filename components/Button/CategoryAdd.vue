<template>
  <v-dialog ref="form" v-model="dialog" max-width="600px">
    <template #activator="{ on, attrs }">
      <v-btn color="green white--text" rounded v-bind="attrs" v-on="on">
        Добавить категорию
      </v-btn>
    </template>
    <v-form ref="form" v-model="valid" lazy-validation>
      <v-card>
        <v-card-title>
          <span class="headline">Добавить категорию</span>
        </v-card-title>

        <v-card-text>
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="category.title"
                :rules="[requiredRules, v => (v && v.length <= 50) || 'Длина должна быть не больше 80 символов.']"
                label="Наименование категории"
                counter="80"
                required
              />
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="category.icon"
                :rules="[requiredRules, v => (v && v.length <= 25) || 'Длина должна быть не больше 25 символов.']"
                label="Иконка категории"
                counter="25"
                required
              />
            </v-col>
          </v-row>

          <h3 v-if="error" class="red--text">{{ error }}</h3>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn color="green" text @click="addCategory">
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
  data: () => ({
    valid: true,
    dialog: false,
    error: "",
    category: {
      title: "",
      icon: ""
    },
    requiredRules: v => !!v || "Это поле обязательно для заполнения"
  }),
  methods: {
    async addCategory() {
      const isValid = this.$refs.form.validate();
      if (!isValid) return;

      await this.$axios.post(`/categories`, this.category).then(res => {
        if (!res.data.success) {
          this.error = res.data.error || "Что-то пошло не так";
          this.$nuxt.$emit("snackbarCall", "Не удалось добавить категорию.", "red", "mdi-alert");

          return;
        }

        this.$refs.form.reset();
        this.dialog = false;

        this.$nuxt.$emit("snackbarCall", "Категория успешно добавлена!");
      }).catch(err => {
        console.log(err);
        this.error = "Что-то пошло не так";
      });
    }
  }
};
</script>
