<template>
  <v-card class="mx-auto" :max-width="maxWidth" :max-height="maxHeight" :width="width" :height="height" elevation="4" shaped>
    <template slot="progress">
      <v-progress-linear color="deep-purple" height="10" indeterminate />
    </template>

    <v-img :src="product.thumbnail" height="200" contain />

    <v-card-title>
      <nuxt-link :to="`/catalog/view/${product.id}`">{{ product.title }}</nuxt-link>
    </v-card-title>

    <v-card-text>
      <v-row align="center" class="pl-2">
        <v-rating :value="Math.round(rating)" color="amber" dense half-increments readonly size="14" />
        <div class="grey--text ml-1">
          {{ reviews.length ? `${rating} (${reviews.length})` : 'Нет отзывов' }}
        </div>
      </v-row>

      <div class="my-2 subtitle-1">
        {{ product.price }} &#8381;
      </div>

      <div class="text-truncate">{{ product.description }}</div>

      <strong :class="product.stock > 0 ? 'green--text' : 'orange--text'">
        {{ product.stock > 0 ? `${product.stock} в наличии` : 'Нет в наличии' }}
      </strong>
    </v-card-text>

    <v-divider class="mx-4" />

    <v-card-actions v-if="user">
      <ButtonAddToCart :product-id="product.id" />
    </v-card-actions>
  </v-card>
</template>

<script>
import { mapState } from 'vuex'

export default {
  props: {
    product: {
      type: Object,
      required: true
    },
    width: {
      type: String,
      default: 'auto'
    },
    height: {
      type: String,
      default: 'auto'
    },
    maxWidth: {
      type: String,
      default: 'auto'
    },
    maxHeight: {
      type: String,
      default: 'auto'
    }
  },
  data: () => ({
    reviews: []
  }),
  computed: {
    ...mapState({
      user: state => state.user.data
    }),
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
    this.reviews = (await this.$axios.$get(`/reviews/${this.product.id}?getAll=true`)).data
  }
}
</script>
