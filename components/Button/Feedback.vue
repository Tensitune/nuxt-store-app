<template>
  <v-dialog v-model="dialog" max-width="600px">
    <template #activator="{ on, attrs }">
      <v-btn class="mx-1" text v-bind="attrs" v-on="on">
        <v-icon>mdi-email-outline</v-icon>
        Обратная связь
      </v-btn>
    </template>
    <v-form ref="form" v-model="valid" lazy-validation>
      <v-card :loading="loading">
        <v-card-title>
          <span class="headline">Обратная связь</span>
        </v-card-title>

        <v-card-text>
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="feedback.email"
                :rules="[rules.required, rules.email]"
                label="Почта"
                hint="Введите почту, на которую нужно отправить ответ"
                persistent-hint
                required
              />
            </v-col>
            <v-col cols="12">
              <v-textarea
                v-model="feedback.text"
                :rules="[rules.required]"
                label="Сообщение"
                hint="Сообщите о проблемах на сайте или о проблемах с товаром"
                persistent-hint
                outlined
                auto-grow
                required
              />
            </v-col>
          </v-row>
          <h3 v-if="error" class="red--text">{{ error }}</h3>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn color="blue darken-1" text @click.prevent="sendMessage">
            Отправить
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
    loading: false,
    error: "",
    feedback: {
      email: "",
      text: ""
    },
    rules: {
      required: v => !!v || "Это поле обязательно для заполнения",
      email: v => {
        const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return pattern.test(v) || "Неверный формат адреса электронной почты.";
      }
    }
  }),
  methods: {
    sendMessage() {
      this.error = "";
      this.loading = true;

      const isValid = this.$refs.form.validate();
      if (isValid) {
        this.$axios.$post("/feedback", this.feedback).then(res => {
          if (res.status === "error") {
            this.error = res.error;
            return;
          }

          this.$refs.form.reset();
          this.dialog = false;

          this.$nuxt.$emit("snackbarCall", "Сообщение успешно отправлено");
        }).catch(err => {
          console.log(err);
          this.error = "Что-то пошло не так";
        });
      }

      this.loading = false;
    }
  }
};
</script>
