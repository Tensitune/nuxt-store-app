<template>
  <div>
    <v-parallax height="500" src="/img/parallax/material.jpg">
      <v-container>
        <v-carousel cycle hide-delimiter-background>
          <v-carousel-item v-for="product of recommendedProducts" :key="product.id">
            <v-row class="my-6" align="center" justify="center">
              <v-col cols="auto">
                <CardProduct
                  :id="product.id"
                  :title="product.title"
                  :description="product.description"
                  :image="product.thumbnail"
                  :price="product.price"
                  :stock="product.stock"
                  max-width="90%"
                />
              </v-col>
            </v-row>
          </v-carousel-item>
        </v-carousel>
      </v-container>
    </v-parallax>

    <v-container>
      <div class="text-center">
        <h1>Популярные товары</h1>
        <v-btn text plain small router to="/catalog">Все товары</v-btn>
      </div>

      <v-row v-if="popularProducts" class="my-3" justify="center" align="center">
        <v-col v-for="product of popularProducts" :key="product.id" cols="auto">
          <CardProduct
            :id="product.id"
            :title="product.title"
            :description="product.description"
            :image="product.thumbnail"
            :price="product.price"
            :stock="product.stock"
            max-width="360px"
          />
        </v-col>
      </v-row>
      <div v-else>Товары не найдены</div>

      <v-spacer />
    </v-container>
  </div>
</template>

<script>
export default {
  async asyncData({ $axios }) {
    const recommendedProducts = (await $axios.$get('/products?page=1&perPage=9')).data ?? []
    const popularProducts = (await $axios.$get('/products/popular')).data ?? []
    return { recommendedProducts, popularProducts }
  }
}
</script>
