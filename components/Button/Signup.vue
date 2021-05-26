<template>
  <v-dialog ref="form" v-model="dialog" max-width="600px">
    <template #activator="{ on, attrs }">
      <v-btn color="primary" rounded v-bind="attrs" v-on="on">
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
                label="Имя пользователя*"
                counter="25"
                :rules="[requiredRules, v => (v && v.length <= 25) || 'Длина имени пользователя должна быть не больше 25 символов.']"
                required
              />
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="signupData.password"
                :append-icon="passwordVisible ? 'mdi-eye-off' : 'mdi-eye'"
                :rules="[requiredRules, v => (v && v.length > 3) || 'Длина пароля должна быть больше 3 символов.']"
                :type="passwordVisible ? '' : 'password'"
                label="Пароль*"
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
                label="Имя*"
                counter="25"
                :rules="[requiredRules, v => (v && v.length <= 25) || 'Длина имени должна быть не больше 25 символов.']"
                required
              />
            </v-col>
            <v-col cols="12" sm="6" md="6">
              <v-text-field
                v-model="signupData.lastname"
                label="Фамилия*"
                counter="25"
                :rules="[requiredRules, v => (v && v.length <= 25) || 'Длина фамилии должна быть не больше 25 символов.']"
                required
              />
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="signupData.phone"
                label="Телефон"
                placeholder="+7(123)45-67-890"
                type="phone"
                counter="16"
                :rules="[v => (v && v.length <= 16) || 'Длина номера телефона должна быть не больше 16 символов.']"
              />
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="signupData.address"
                label="Адрес"
                counter="255"
                :rules="[v => (v && v.length <= 255) || 'Длина адреса должна быть не больше 255 символов.']"
              />
            </v-col>
          </v-row>
          <h3 v-if="error" class="red--text">{{ error }}</h3>
          <small>* - указывает на обязательное поле</small>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn color="blue darken-1" type="submit" :loading="loading" text @click.prevent="signUp">
            Регистрация
          </v-btn>
          <v-btn color="blue darken-1" text @click="dialog = false; loading = false;">
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
    passwordVisible: false,
    error: "",
    signupData: {
      username: "",
      password: "",
      firstname: "",
      lastname: "",
      phone: "",
      address: ""
    },
    passwordConfirm: "",
    requiredRules: v => !!v || "Это поле обязательно для заполнения"
  }),
  methods: {
    signUp() {
      this.loading = true;

      const isValid = this.$refs.form.validate();
      if (isValid) {
        this.$axios.post("/auth/signup", this.signupData).then(res => {
          this.error = "";
          this.loading = false;

          if (res.status === "error") {
            this.error = res.error;
            return;
          }

          window.location.reload();
        }).catch(err => {
          console.log(err);
          this.error = "Что-то пошло не так";
          this.loading = false;
        });

        return;
      }

      this.loading = false;
    }
  }
};
</script>
