<template>
  <v-dialog ref="form" v-model="dialog" max-width="600px">
    <template #activator="{ on, attrs }">
      <v-btn color="deep-purple lighten-2 white--text" rounded v-bind="attrs" v-on="on">
        Регистрация
      </v-btn>
    </template>
    <v-form ref="form" v-model="valid" lazy-validation>
      <v-card>
        <v-card-title>
          <span class="headline">Регистрация</span>
        </v-card-title>

        <v-card-text>
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="signupData.username"
                :rules="[requiredRules, v => (v && v.length <= 25) || 'Длина должна быть не больше 25 символов.']"
                label="Имя пользователя"
                counter="25"
                required
              />
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="signupData.password"
                :rules="[requiredRules, v => (v && v.length > 3) || 'Длина должна быть больше 3 символов.']"
                :append-icon="passwordVisible ? 'mdi-eye-off' : 'mdi-eye'"
                :type="passwordVisible ? '' : 'password'"
                label="Пароль"
                required
                @click:append="passwordVisible = !passwordVisible"
              />
            </v-col>
            <v-col cols="12">
              <v-text-field v-model="passwordConfirm" label="Подтвержение пароля*" :rules="[requiredRules]" :type="passwordVisible ? '' : 'password'" required />
            </v-col>
            <v-col cols="12" sm="6" md="6">
              <v-text-field
                v-model="signupData.firstname"
                :rules="[requiredRules, v => (v && v.length <= 25) || 'Длина должна быть не больше 25 символов.']"
                label="Имя"
                counter="25"
                required
              />
            </v-col>
            <v-col cols="12" sm="6" md="6">
              <v-text-field
                v-model="signupData.lastname"
                :rules="[requiredRules, v => (v && v.length <= 25) || 'Длина должна быть не больше 25 символов.']"
                label="Фамилия"
                counter="25"
                required
              />
            </v-col>
            <v-col cols="12">
              <VuePhoneNumberInput
                v-model="signupData.phone"
                :translations="translations"
                fetch-country
                no-country-selector
                required
              />
            </v-col>
          </v-row>
          <h3 v-if="error" class="red--text">{{ error }}</h3>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn color="blue darken-1" type="submit" text @click.prevent="signUp">
            Регистрация
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
    passwordVisible: false,
    error: "",
    passwordConfirm: "",
    signupData: {
      username: "",
      password: "",
      firstname: "",
      lastname: "",
      phone: ""
    },
    translations: {
      countrySelectorLabel: "Код страны",
      countrySelectorError: "Выбор страны",
      phoneNumberLabel: "Номер телефона",
      example: "Пример:"
    },
    requiredRules: v => !!v || "Это поле обязательно для заполнения"
  }),
  methods: {
    async signUp() {
      const isValid = this.$refs.form.validate();
      if (!isValid) return;

      await this.$axios.post("/auth/signup", this.signupData).then(res => {
        this.error = "";

        if (!res.data.success) {
          this.error = res.data.error || "Что-то пошло не так";
          return;
        }

        window.location.reload();
      }).catch(err => {
        console.log(err);
        this.error = "Что-то пошло не так";
      });
    }
  }
};
</script>
