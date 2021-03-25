<template>
  <div>
    <v-parallax dark height="500" src="/img/parallax/material.jpg">
      <v-container>
        <v-carousel cycle height="415" hide-delimiters show-arrows-on-hover>
          <v-carousel-item v-for="(slide, i) in [1, 2, 3, 4, 5]" :key="i">
            <v-sheet color="indigo" height="100%">
              <v-row class="fill-height" align="center" justify="center">
                <div class="display-3">Товар {{ slide }}</div>
              </v-row>
            </v-sheet>
          </v-carousel-item>
        </v-carousel>
      </v-container>
    </v-parallax>

    <v-container>
      <div class="text-center">
        <h1>Рекомендуемые товары</h1>
        <v-btn text plain small router to="/catalog/recommended">Все рекомендации</v-btn>
      </div>

      <v-row>
        <v-col cols="6" md="4">
          <CardProduct
            title="Продукт"
            description="Lorem, ipsum dolor sit amet consectetur adipisicing elit. Soluta iste necessitatibus deserunt dolor eligendi eos quod odio, eius repudiandae fuga voluptas, odit repellat ad minus numquam dolorum optio libero! Modi."
            image="/img/parallax/material.jpg"
            price="1000"
            :stock="5"
            :reviews="[{ rating: 5 }, { rating: 3 }]"
          />
        </v-col>
      </v-row>

      <v-spacer />
    </v-container>
  </div>
</template>

<script>
export default {

}
</script>
