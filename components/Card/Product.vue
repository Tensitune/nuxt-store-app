<template>
  <v-card :loading="loading" class="mx-auto my-12" max-width="374">
    <template slot="progress">
      <v-progress-linear color="deep-purple" height="10" indeterminate />
    </template>

    <v-img height="200" :src="image" />

    <v-card-title>{{ title }}</v-card-title>

    <v-card-text>
      <v-row align="center" class="mx-0">
        <v-rating :value="Math.round(rating)" color="amber" dense half-increments readonly size="14" />

        <div class="grey--text ml-4">
          {{ rating }} ({{ reviews.length }})
        </div>
      </v-row>

      <div class="my-4 subtitle-1">
        {{ price }} &#8381;
      </div>

      <div>{{ description }}</div>
    </v-card-text>

    <v-divider class="mx-4" />

    <v-card-actions v-if="user">
      <v-btn color="deep-purple lighten-2" text @click="addToShoppingCart">
        Добавить в корзину
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  props: ['title', 'description', 'image', 'price', 'reviews'],
  data: () => ({
    loading: false,
    selection: 1
  }),
  computed: {
    user() {
      return this.$store.getters['user/data']
    },
    rating() {
      const rating = []
      this.reviews.map(review => rating.push(review.rating))
      return (rating.reduce((a, b) => a + b) / rating.length).toFixed(1)
    }
  },
  methods: {
    addToShoppingCart() {
      this.loading = true
      setTimeout(() => (this.loading = false), 2000)
    }
  }
}
</script>
