<template>
  <v-container>
    <v-sheet v-if="!editMode" class="pa-4 my-6" elevation="4" rounded="lg">
      <div class="d-flex align-center">
        <v-icon class="mr-1" size="32">mdi-account</v-icon>
        <h2>{{ `${user.firstname} ${user.lastname}` }}</h2>

        <v-spacer />

        <v-btn class="px-2" color="deep-purple lighten-2" outlined @click="editMode = true">
          <v-icon>mdi-account-edit</v-icon>
          Редактировать
        </v-btn>
      </div>

      <h3 class="font-weight-regular">Логин: {{ user.username }}</h3>
      <h3 class="font-weight-regular">Номер телефона: {{ user.phone }}</h3>
    </v-sheet>

    <v-sheet v-else class="pa-4 my-6" elevation="4" rounded="lg">
      <v-form ref="form" v-model="valid" lazy-validation>
        <v-row>
          <v-col cols="12">
            <v-text-field
              v-model="profileData.username"
              :rules="[requiredRules, v => (v && v.length <= 25) || 'Длина должна быть не больше 25 символов.']"
              label="Имя пользователя"
              counter="25"
              required
            />
          </v-col>
          <v-col cols="12">
            <v-text-field
              v-model="profileData.password"
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
              v-model="profileData.firstname"
              :rules="[requiredRules, v => (v && v.length <= 25) || 'Длина должна быть не больше 25 символов.']"
              label="Имя"
              counter="25"
              required
            />
          </v-col>
          <v-col cols="12" sm="6" md="6">
            <v-text-field
              v-model="profileData.lastname"
              :rules="[requiredRules, v => (v && v.length <= 25) || 'Длина должна быть не больше 25 символов.']"
              label="Фамилия"
              counter="25"
              required
            />
          </v-col>
          <v-col cols="12">
            <v-text-field
              v-model="profileData.phone"
              :rules="[requiredRules, v => (v && v.length <= 16) || 'Длина должна быть не больше 16 символов.']"
              label="Телефон"
              placeholder="+7(123)45-67-890"
              type="phone"
              counter="16"
              required
            />
          </v-col>
        </v-row>
        <h3 v-if="error" class="red--text">{{ error }}</h3>

        <div class="mt-2">
          <v-btn color="green" type="submit" text @click.prevent="saveProfile">
            Сохранить
          </v-btn>
          <v-btn color="red" text @click="editMode = false">
            Отмена
          </v-btn>
        </div>
      </v-form>
    </v-sheet>
  </v-container>
</template>

<script>
import { mapState } from "vuex";

export default {
  middleware: "AuthMiddleware",
  data: () => ({
    editMode: false,
    valid: true,
    profileData: {
      username: "",
      password: "",
      firstname: "",
      lastname: "",
      phone: ""
    },
    passwordVisible: false,
    error: "",
    passwordConfirm: "",
    requiredRules: v => !!v || "Это поле обязательно для заполнения"
  }),
  computed: {
    ...mapState({
      user: state => state.user
    })
  },
  mounted() {
    this.profileData = {
      username: this.user.username,
      password: this.user.password,
      firstname: this.user.firstname,
      lastname: this.user.lastname,
      phone: this.user.phone
    };
  },
  methods: {
    async saveProfile() {
      const isValid = this.$refs.form.validate();
      if (!isValid) return;

      await this.$axios.put("/auth", this.profileData).then(res => {
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
