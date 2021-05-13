<template>
  <v-card :loading="loading" class="mx-auto my-6" :max-width="maxWidth" shaped>
    <template slot="progress">
      <v-progress-linear color="deep-purple" height="10" indeterminate />
    </template>

    <v-img :src="image" height="200" contain />

    <v-card-title>
      <nuxt-link :to="`/catalog/view/${id}`">{{ title }}</nuxt-link>
    </v-card-title>

    <v-card-text>
      <v-row align="center" class="pl-2">
        <v-rating :value="Math.round(rating)" color="amber" dense half-increments readonly size="14" />

        <div class="grey--text ml-1">
          {{ reviews.length ? `${rating} (${reviews.length})` : 'Нет отзывов' }}
        </div>
      </v-row>

      <div class="my-2 subtitle-1">
        {{ price }} &#8381;
      </div>

      <div class="text-truncate">{{ description }}</div>

      <strong :class="stock > 0 ? 'green--text' : 'orange--text'">{{ stock > 0 ? `${stock} в наличии` : 'Нет в наличии' }}</strong>
    </v-card-text>

    <v-divider class="mx-4" />

    <v-card-actions v-if="user">
      <v-btn color="deep-purple lighten-2" text @click="addToShoppingCart(id)">
        Добавить в корзину
      </v-btn>
    </v-card-actions>
    <v-alert :type="alertType" :value="alert" transition="scale-transition" dismissible>
      {{ alertText }}
    </v-alert>
  </v-card>
</template>

<script>
export default {
  props: {
    id: {
      type: Number,
      required: true
    },
    title: {
      type: String,
      default: 'Наименование товара'
    },
    description: {
      type: String,
      default: 'Описание товара'
    },
    image: {
      type: String,
      default: '/img/parallax/material.jpg'
    },
    price: {
      type: Number,
      default: 0
    },
    stock: {
      type: Number,
      default: 0
    },
    maxWidth: {
      type: String,
      default: '320px'
    }
  },
  data: () => ({
    loading: false,
    alert: false,
    alertType: 'success',
    alertText: '',
    reviews: []
  }),
  computed: {
    user() {
      return this.$store.getters['user/data']
    },
    rating() {
      let rating = []

      if (this.reviews.length) {
        this.reviews.map(review => rating.push(review.rating))
        rating = (rating.reduce((a, b) => a + b) / rating.length).toFixed(1)
      }

      return rating
    }
  },
  async mounted() {
    this.reviews = (await this.$axios.$get(`/reviews/${this.id}?getAll=true`)).data ?? []
  },
  methods: {
    addToShoppingCart(productId) {
      this.alert = false
      this.loading = true
    }
  }
}
</script>
