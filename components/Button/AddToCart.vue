<template>
  <v-dialog v-model="dialog" max-width="600px" :disabled="disabled">
    <template #activator="{ on, attrs }">
      <v-btn color="deep-purple lighten-2" text v-bind="attrs" v-on="on">
        Добавить в корзину
      </v-btn>
    </template>
    <v-form ref="form" v-model="valid" lazy-validation>
      <v-card>
        <v-card-title>
          <span class="headline">Добавить в корзину</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="quantity"
                  :rules="[...requiredRules, ...numberRules, v => (v && v.length <= 9) || 'Длина не должна превышать 9 цифр.']"
                  counter="9"
                  label="Количество"
                  type="number"
                  required
                />
              </v-col>
            </v-row>
          </v-container>
          <h3 v-if="error" class="red--text">{{ error }}</h3>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="blue darken-1" text @click="dialog = false">
            Закрыть
          </v-btn>
          <v-btn color="blue darken-1" text @click.prevent="addToShoppingCart">
            Добавить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script>
export default {
  props: {
    productId: {
      type: Number,
      required: true
    }
  },
  data: () => ({
    disabled: false,
    dialog: false,
    quantity: 0,
    error: '',
    requiredRules: [
      v => !!v || 'Это поле обязательно для заполнения'
    ],
    numberRules: [
      v => !(/-\D/.test(v)) || 'Только цифры',
      v => v > 0 || 'Число должно быть больше 0'
    ]
  }),
  methods: {
    addToShoppingCart() {
      this.loading = true

      const isValid = this.$refs.form.validate()
      if (isValid) {
        this.$axios.$post('/cart', {
          productId: this.productId,
          quantity: this.quantity
        }).then(res => {
          this.loading = false

          if (res.status === 'error') {
            this.error = res.error
            return
          }

          this.$refs.form.reset()
          this.disabled = true
          this.dialog = false
        }).catch(err => {
          console.log(err)
          this.loading = false
          this.error = 'Что-то пошло не так'
        })

        return
      }

      this.loading = false
    }
  }
}
</script>
