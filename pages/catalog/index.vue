<template>
  <v-container>
    <v-row class="my-3">
      <v-col cols="3">
        <v-card rounded="lg">
          <v-list-item>
            <v-list-item-content>
              <v-menu v-model="menu" :close-on-content-click="false" :nudge-width="200" max-width="500" offset-x>
                <template #activator="{ on, attrs }">
                  <v-btn elevation="0" v-bind="attrs" v-on="on">
                    <v-icon>{{ category.icon }}</v-icon>
                    <div class="text-truncate">{{ category.title }}</div>
                  </v-btn>
                </template>

                <v-card>
                  <v-list-item>
                    <v-list-item-title>
                      <strong>Категории</strong>
                    </v-list-item-title>
                  </v-list-item>

                  <v-divider />

                  <div class="pa-4">
                    <v-chip-group v-model="activeCategory" active-class="primary--text" column>
                      <v-chip filter outlined>Все товары</v-chip>
                      <v-chip v-for="item of categories" :key="item.id" filter outlined>
                        {{ item.title }}
                      </v-chip>
                    </v-chip-group>
                  </div>
                </v-card>
              </v-menu>
            </v-list-item-content>
          </v-list-item>

          <v-divider />

          <v-list-item>
            <v-text-field
              :value="sliderRange[0]"
              class="mt-0 pt-0"
              hide-details
              single-line
              type="number"
              @change="$set(sliderRange, 0, $event)"
            />
            <span class="mx-2">-</span>
            <v-text-field
              :value="sliderRange[1]"
              class="mt-0 pt-0"
              hide-details
              single-line
              type="number"
              @change="$set(sliderRange, 1, $event)"
            />
          </v-list-item>

          <v-divider />

          <v-list-item>
            <v-select v-model="sort" :items="sortItems" class="mt-0 pt-0" hide-details single-line />
          </v-list-item>
        </v-card>
      </v-col>
      <v-col cols="9">
        <v-text-field
          v-model="search"
          append-outer-icon="mdi-magnify"
          label="Поиск"
          solo
          clearable
          @click:append-outer="$fetch"
        />

        <Pagination v-if="products.count && !loading" :count="products.count" :limit="perPage" @onPageChange="onPageChange">
          <v-row>
            <v-col v-for="product of products.rows" :key="product.id" cols="auto">
              <CardProduct :product="product" max-width="425px" />
            </v-col>
          </v-row>
        </Pagination>
        <div v-else-if="loading">
          <v-row>
            <v-col v-for="n in 4" :key="n" cols="6">
              <v-skeleton-loader class="mx-auto" type="card" />
            </v-col>
          </v-row>
        </div>
        <div v-else class="text-center">Товары не найдены</div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  async asyncData({ $axios }) {
    const { data: categories } = await $axios.get("/categories");
    const { data: products } = await $axios.get("/products?page=1&perPage=6&order=price");

    return { categories, products };
  },
  data: () => ({
    menu: false,
    loading: false,
    perPage: 6,
    activeCategory: 0,
    search: "",
    sort: "Сначала недорогие",
    sortItems: ["Сначала недорогие", "Сначала дорогие", "По наименованию"],
    sliderRange: [1, 999999],
    categories: [],
    products: [],
    order: "ASC",
    orderColumn: "price"
  }),
  async fetch() {
    this.loading = true;

    const productsUrl = this.categoryFilter ? `/categories/${this.categoryFilter}` : "/products";
    this.products = (await this.$axios.get(productsUrl + "?title=" + this.searchText + "&page=1&perPage=" + this.perPage + "&priceFrom=" +
      this.sliderRange[0] + "&priceTo=" + this.sliderRange[1] + `&order=${this.orderColumn},${this.order}`)).data;

    this.loading = false;
  },
  computed: {
    category() {
      const tempCategories = [{ id: 0, title: "Все товары", icon: "mdi-folder-outline" }, ...this.categories];
      const category = tempCategories.filter(cat => cat.id === (this.categoryFilter))[0];
      return category || "Категории";
    },
    categoryFilter() {
      return this.activeCategory ?? 0;
    },
    searchText() {
      return this.search ?? "";
    }
  },
  watch: {
    async activeCategory () {
      await this.$fetch();
    },
    async sliderRange() {
      await this.$fetch();
    },
    async sort(val) {
      switch (val) {
        case "Сначала недорогие":
          this.order = "ASC";
          this.orderColumn = "price";
          break;
        case "Сначала дорогие":
          this.order = "DESC";
          this.orderColumn = "price";
          break;
        case "По наименованию":
          this.order = "ASC";
          this.orderColumn = "title";
          break;
        default:
          break;
      }

      await this.$fetch();
    }
  },
  methods: {
    async onPageChange(page) {
      const productsUrl = this.categoryFilter ? `/categories/${this.categoryFilter}` : "/products";
      this.products = (await this.$axios.get(productsUrl + "?title=" + this.searchText + "&page=" + page + "&perPage=" + this.perPage +
        "&priceFrom=" + this.sliderRange[0] + "&priceTo=" + this.sliderRange[1] + `&order=${this.orderColumn},${this.order}`)).data;
    }
  }
};
</script>
