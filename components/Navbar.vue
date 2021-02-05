<template>
  <header>
    <NuxtLink class="logo" to="/">Nuxt Store</NuxtLink>
    <nav>
      <ul class="nav-links">
        <li v-for="(item, key) of items" :key="key">
          <NuxtLink :to="item.to" :class="{'active': isRouteActive(item.to)}">{{ item.title }}</NuxtLink>
        </li>
      </ul>
    </nav>
    <a class="btn-login" href="#">Войти</a>
  </header>
</template>

<script>
export default {
  name: 'Navbar',
  data() {
    return {
      items: [
        {
          title: 'Главная',
          to: '/'
        },
        {
          title: 'Каталог',
          to: '/catalog'
        },
        {
          title: 'Магазины',
          to: '/shops'
        },
        {
          title: 'Обратная связь',
          to: '/feedback'
        }
      ]
    }
  },
  methods: {
    isRouteActive(id) {
      if (id === '/') return true
      if (this.$route.path.includes(id) && id !== '/') return true
      return false
    }
  }
}
</script>
