<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" :clipped="clipped" fixed app>
      <v-list>
        <v-list-item
          v-for="(item, i) in items" :key="i"
          :to="item.to"
          router
          exact
        >
          <v-list-item-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title v-text="item.title" />
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar :clipped-left="clipped" dense fixed app>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-toolbar-title class="mr-1" v-text="title" />
      <v-btn v-for="(item, i) in items" :key="i" :to="item.to" class="ml-1 mr-1" router text :href="item.url" target="_blank">
        <v-icon class="nav-icon">{{ item.icon }}</v-icon>
        <h4 v-if="showNavTitle">{{ item.title }}</h4>
      </v-btn>

      <v-btn v-if="user" to="/cart" class="ml-1 mr-1" router text href="/cart" target="_blank">
        <v-icon class="nav-icon">mdi-cart-outline</v-icon>
        <h4 v-if="showNavTitle">Корзина</h4>
      </v-btn>

      <v-spacer />

      <div v-if="!user">
        <ButtonSignin />
        <ButtonSignup />
      </div>
      <div v-else>
        {{ user.username }}
      </div>
    </v-app-bar>

    <v-main>
      <Nuxt />

      <v-footer dark :absolute="!fixed" padless>
        <v-card flat tile class="indigo lighten-1 white--text text-center" width="100%">
          <v-card-text>
            <v-btn v-for="item in footerIcons" :key="item.icon" class="mx-4 white--text" router :href="item.uri" target="_blank" icon>
              <v-icon size="24px">
                {{ item.icon }}
              </v-icon>
            </v-btn>
          </v-card-text>

          <v-card-text class="white--text pt-0">
            Lorem ipsum dolor sit amet consectetur, adipisicing elit. Eaque blanditiis neque ea non, quas perspiciatis vero deserunt fugit atque provident, officia mollitia libero doloremque ex cupiditate, iste sequi ad maiores.
          </v-card-text>

          <v-divider />

          <v-card-text class="white--text">
            {{ new Date().getFullYear() }} — <strong>Fades</strong>
          </v-card-text>
        </v-card>
      </v-footer>
    </v-main>
  </v-app>
</template>

<script>
export default {
  data: () => ({
    title: 'Nuxt Store',
    clipped: true,
    drawer: false,
    fixed: true,
    items: [
      {
        icon: 'mdi-home-outline',
        title: 'Главная',
        to: '/'
      },
      {
        icon: 'mdi-archive-outline',
        title: 'Каталог',
        to: '/catalog'
      },
      {
        icon: 'mdi-shopping-outline',
        title: 'Магазины',
        to: '/shops'
      },
      {
        icon: 'mdi-email-outline',
        title: 'Обратная связь',
        to: '/feedback'
      }
    ],
    footerIcons: [
      { icon: 'mdi-discord', uri: 'https://discord.gg/ETrKUWmCN4' },
      { icon: 'mdi-twitter', uri: '' },
      { icon: 'mdi-vk', uri: '' },
      { icon: 'mdi-instagram', uri: '' }
    ]
  }),
  computed: {
    user() {
      return this.$store.getters['user/data']
    },
    showNavTitle() {
      const disabledSizes = ['xs', 'sm', 'md']
      if (disabledSizes.includes(this.$vuetify.breakpoint.name)) return false
      return true
    }
  },
  mounted() {
    this.$axios.$get('/profile').then(res => {
      if (res.status === 'error') return
      this.$store.commit('user/set', res.user)
    })
  }
}
</script>
