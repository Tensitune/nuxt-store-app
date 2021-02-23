<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container">
      <a class="navbar-brand">Nuxt Store</a>

      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon" />
      </button>

      <div id="navbarSupportedContent" class="collapse navbar-collapse">
        <div class="navbar-nav me-auto mb-2 mb-lg-0">
          <li v-for="(item, key) of items" :key="key" class="nav-item" tag="nuxt-link">
            <NuxtLink :to="item.to" class="nav-link" aria-current="page" :class="{'active': isRouteActive(item.to) }" exact-active-class="active">
              {{ item.title }}
            </NuxtLink>
          </li>
        </div>

        <div class="d-flex">
          <a v-if="!user" class="btn btn-outline-custom" href="/auth/login">
            Войти
          </a>

          <div v-else class="nav-item dropdown">
            <a id="profileDropdown" class="nav-link" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              {{ user.name }}
            </a>

            <ul class="dropdown-menu" aria-labelledby="profileDropdown">
              <li>
                <a class="dropdown-item" href="/auth/logout">
                  Выйти
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </nav>
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
      if (this.$route.path.includes(id)) return true
      return false
    }
  }
}
</script>
