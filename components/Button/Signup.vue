<template>
  <v-dialog ref="form" v-model="dialog" max-width="600px">
    <template #activator="{ on, attrs }">
      <v-btn color="primary" rounded v-bind="attrs" v-on="on">
        Регистрация
      </v-btn>
    </template>
    <v-card>
      <v-card-title>
        <span class="headline">Регистрация</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12">
              <v-text-field v-model="signupData.username" label="Имя пользователя*" counter="25" :rules="requiredRules" required />
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="signupData.password"
                :append-icon="passwordVisible ? 'mdi-eye-off' : 'mdi-eye'"
                :rules="requiredRules"
                :type="passwordVisible ? '' : 'password'"
                label="Пароль*"
                required
                @click:append="passwordVisible = !passwordVisible"
              />
            </v-col>
            <v-col cols="12">
              <v-text-field v-model="passwordConfirm" label="Подтвержение пароля*" :rules="requiredRules" :type="passwordVisible ? '' : 'password'" required />
            </v-col>
            <v-col cols="12" sm="6" md="6">
              <v-text-field v-model="signupData.firstname" label="Имя*" counter="25" :rules="requiredRules" required />
            </v-col>
            <v-col cols="12" sm="6" md="6">
              <v-text-field v-model="signupData.lastname" label="Фамилия*" counter="25" :rules="requiredRules" required />
            </v-col>
            <v-col cols="12">
              <v-text-field v-model="signupData.phone" label="Телефон" counter="16" />
            </v-col>
            <v-col cols="12">
              <v-text-field v-model="signupData.address" label="Адрес" counter="255" />
            </v-col>
          </v-row>
        </v-container>
        <h3 v-if="error" class="red--text">{{ error }}</h3>
        <small>* - указывает на обязательное поле</small>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="blue darken-1" text @click="dialog = false; loading = false;">
          Закрыть
        </v-btn>
        <v-btn color="blue darken-1" type="submit" :loading="loading" text @click="signUp">
          Регистрация
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  data: () => ({
    dialog: false,
    loading: false,
    passwordVisible: false,
    error: '',
    signupData: {
      username: '',
      password: '',
      firstname: '',
      lastname: '',
      phone: '',
      address: ''
    },
    passwordConfirm: '',
    requiredRules: [
      v => !!v || 'Это поле обязательно для заполнения'
    ]
  }),
  methods: {
    signUp() {
      this.loading = true

      this.$axios.post('/auth/signup', this.signupData).then(res => {
        this.error = ''
        this.loading = false

        if (res.data.status === 'error') {
          this.error = res.data.error
          return
        }

        window.location.reload()
      }).catch(err => {
        console.log(err)
        this.error = 'Что-то пошло не так'
        this.loading = false
      })
    }
  }
}
</script>
