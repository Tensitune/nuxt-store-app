<template>
  <v-container>
    <v-sheet class="pa-4 my-6" elevation="4" rounded="lg">
      <v-row align="center">
        <v-col cols="4">
          <v-img :src="product.thumbnail" height="256" contain />
        </v-col>
        <v-col cols="8">
          <div class="d-flex flex-column">
            <div class="title">{{ product.title }}</div>

            <div class="d-flex flex-row align-center">
              <v-rating :value="ratingValue" color="amber" dense half-increments readonly size="24" />
              <h3 class="mx-1">
                {{ reviews.length ? `${rating}` : "Нет отзывов" }}
              </h3>
              <h4 v-if="reviews.length" class="grey--text">({{ reviewsText }})</h4>
            </div>

            <v-divider class="my-4" />

            <div class="d-flex flex-row align-center mb-4">
              <h3 class="amber--text">{{ price }}</h3>
              <v-divider v-if="user" class="mx-2" vertical />
              <ButtonAddToCart v-if="user" :product-id="product.id" />
            </div>

            <div>{{ product.description }}</div>
          </div>
        </v-col>
      </v-row>
    </v-sheet>

    <v-sheet v-if="user" class="pa-4 mb-6" elevation="4" rounded="lg">
      <v-form>
        <div class="title">{{ userReview ? "Ваш отзыв" : "Написать отзыв" }}</div>
        <v-row>
          <v-col class="pa-0" cols="12">
            <v-rating
              v-model="reviewRating"
              color="amber"
              empty-icon="mdi-star-outline"
              full-icon="mdi-star"
              half-icon="mdi-star-half-full"
              half-increments
              hover
              length="5"
              size="48"
            />
          </v-col>
          <v-col class="py-0" cols="12">
            <v-textarea v-model="reviewText" outlined auto-grow label="Комментарий" />
          </v-col>
        </v-row>

        <div class="d-flex justify-end">
          <v-btn color="deep-purple lighten-2 white--text" rounded @click="writeReview">
            {{ userReview ? "Изменить отзыв" : "Написать отзыв" }}
          </v-btn>
          <v-btn v-if="userReview" color="red lighten-1 white--text ml-1" rounded @click="deleteReview">
            Удалить отзыв
          </v-btn>
        </div>
      </v-form>
    </v-sheet>

    <v-sheet v-if="reviews.length" class="pa-4 mb-3" elevation="4" rounded="lg">
      <div class="title mb-4">Отзывы</div>

      <Pagination :count="reviews.length" :limit="perPage" @onPageChange="onPageChange">
        <v-row>
          <v-col v-for="review of paginationReviews" :key="review.id" cols="12">
            <CardReview :review="review" @onReviewDelete="onReviewDelete" />
          </v-col>
        </v-row>
      </Pagination>
    </v-sheet>
  </v-container>
</template>

<script>
import { mapState } from "vuex";

export default {
  async asyncData({ params, error, $axios }) {
    const product = (await $axios.$get(`/products/${params.id}`)).data;
    if (!product) return error({ statusCode: 404, message: "Товар не найден" });

    const reviews = (await $axios.$get(`/reviews/${params.id}?getAll=true`)).data;
    return { product, reviews };
  },
  data: () => ({
    page: 1,
    perPage: 9,
    reviewRating: 3,
    reviewText: "",
    product: {},
    reviews: []
  }),
  async fetch() {
    this.reviews = (await this.$axios.$get(`/reviews/${this.product.id}?getAll=true`)).data;
  },
  computed: {
    ...mapState({
      user: state => state.user
    }),
    userReview() {
      if (!this.user) return false;
      const review = this.reviews.filter(review => review.userId === this.user.id);
      return review[0] ?? false;
    },
    paginationReviews() {
      return this.reviews.filter(review => (review.id !== this.userReview.id)).slice(this.page - 1, this.page * this.perPage);
    },
    rating() {
      let rating = [];

      if (this.reviews.length) {
        this.reviews.map(review => rating.push(review.rating));
        rating = (rating.reduce((a, b) => a + b) / rating.length).toFixed(1);
      }

      return rating;
    },
    ratingValue() {
      const value = (Math.round(this.rating * 2) / 2).toFixed(1);
      return parseFloat(value);
    },
    reviewsText() {
      let text = this.reviews.length.toString();
      const lastNumber = parseInt(text.slice(-1));

      if (lastNumber === 1) text += " отзыв";
      else if ([2, 3, 4].includes(lastNumber)) text += " отзыва";
      else text += " отзывов";

      return text;
    },
    price() {
      return new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB" }).format(this.product.price);
    }
  },
  mounted() {
    if (!this.userReview) return;
    this.reviewRating = this.userReview.rating;
    this.reviewText = this.userReview.text;
  },
  methods: {
    onPageChange(page) {
      this.page = page;
    },
    async onReviewDelete() {
      await this.$fetch();
    },
    async writeReview() {
      if (this.userReview) {
        if (this.userReview.text === this.reviewText && this.userReview.rating === this.reviewRating) return;

        await this.$axios.$put(`/reviews/${this.userReview.id}`, {
          rating: this.reviewRating,
          text: this.reviewText
        });
        await this.$fetch();

        this.$nuxt.$emit("snackbarCall", "Отзыв успешно изменён!");
      } else {
        await this.$axios.$post(`/reviews/${this.product.id}`, {
          rating: this.reviewRating,
          text: this.reviewText
        });
        await this.$fetch();

        this.$nuxt.$emit("snackbarCall", "Отзыв успешно добавлен!");
      }
    },
    async deleteReview() {
      await this.$axios.$delete(`/reviews/${this.userReview.id}`);
      await this.$fetch();

      this.$nuxt.$emit("snackbarCall", "Отзыв успешно удалён!");

      this.reviewRating = 3;
      this.reviewText = "";
    }
  }
};
</script>
