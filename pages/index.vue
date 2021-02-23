<template>
  <div class="container">
    <section>
      <h1 class="text-center">Все категории</h1>
      <h2 class="text-center">Здесь вы можете найти все, что душе угодно</h2>
      <div v-for="(cat, key) in categories" :key="key" class="row justify-content-center">
        <CategoryCard :title="cat.title" :to="cat.to" />
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'HomePage',
  data() {
    return {
      categories: [
        {
          title: 'Категория 1',
          to: '/categories/cat1'
        },
        {
          title: 'Категория 2',
          to: '/categories/cat2'
        },
        {
          title: 'Категория 3',
          to: '/categories/cat3'
        }
      ]
    }
  }
}
</script>
