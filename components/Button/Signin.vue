<template>
  <v-dialog v-model="dialog" max-width="600px">
    <template #activator="{ on, attrs }">
      <v-btn color="deep-purple lighten-2" outlined rounded v-bind="attrs" v-on="on">
        Войти
      </v-btn>
    </template>
    <v-card>
      <v-card-title>
        <span class="headline">Войти</span>
      </v-card-title>

      <v-card-text>
        <v-row>
          <v-col cols="12">
            <v-text-field v-model="signinData.username" label="Логин" required />
          </v-col>
          <v-col cols="12">
            <v-text-field
              v-model="signinData.password"
              :append-icon="passwordVisible ? 'mdi-eye-off' : 'mdi-eye'"
              :type="passwordVisible ? '' : 'password'"
              label="Пароль"
              required
              @click:append="passwordVisible = !passwordVisible"
            />
          </v-col>
        </v-row>
        <h3 v-if="error" class="red--text">{{ error }}</h3>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn color="blue darken-1" text @click="signIn">
          Войти
        </v-btn>
        <v-btn color="blue darken-1" text @click="dialog = false">
          Закрыть
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  data: () => ({
    dialog: false,
    error: "",
    passwordVisible: false,
    signinData: {
      username: "",
      password: ""
    }
  }),
  methods: {
    async signIn() {
      await this.$axios.post("/auth/signin", this.signinData).then(res => {
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
