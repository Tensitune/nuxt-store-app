<template>
  <v-app>
    <v-navigation-drawer v-if="!showDrawer" v-model="drawer" :clipped="clipped" fixed app>
      <v-list>
        <v-list-item v-for="(item, i) in items" :key="i" :to="item.to" router exact>
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
      <v-app-bar-nav-icon v-if="!showDrawer" @click.stop="drawer = !drawer" />
      <v-toolbar-title class="mr-1" v-text="title" />

      <template v-if="showDrawer">
        <v-btn v-for="(item, i) in items" :key="i" :to="item.to" class="mx-1" router text>
          <v-icon class="nav-icon">{{ item.icon }}</v-icon>
          <h4>{{ item.title }}</h4>
        </v-btn>
      </template>

      <v-spacer />

      <div v-if="!user">
        <ButtonSignin />
        <ButtonSignup />
      </div>
      <div v-else class="text-center">
        <v-menu offset-y transition="slide-y-transition">
          <template #activator="{ on, attrs }">
            <v-btn color="secondary" text v-bind="attrs" v-on="on">
              <v-icon>mdi-account</v-icon>
              {{ user.username }}
            </v-btn>
          </template>
          <v-list>
            <v-list-item v-if="user.admin" link router to="/admin">
              <v-list-item-title class="d-flex justify-start align-center">
                <v-icon>mdi-shield-account</v-icon>
                Админ-панель
              </v-list-item-title>
            </v-list-item>
            <v-list-item link @click="signOut">
              <v-list-item-title class="d-flex justify-start align-center">
                <v-icon>mdi-logout</v-icon>
                Выйти
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
    </v-app-bar>

    <v-main>
      <Nuxt />
    </v-main>

    <v-footer dark :absolute="!fixed" padless>
      <v-card flat tile class="indigo lighten-1 white--text text-center" width="100%">
        <v-card-text>
          <v-btn v-for="item in footerIcons" :key="item.icon" class="mx-4 white--text" router :href="item.uri" target="_blank" icon>
            <v-icon size="24px">{{ item.icon }}</v-icon>
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
  </v-app>
</template>

<script>
import { mapState } from 'vuex'

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
      },
      {
        icon: 'mdi-cart-outline',
        title: 'Корзина',
        to: '/cart'
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
    ...mapState({
      user: state => state.user.data
    }),
    showDrawer() {
      const disabledSizes = ['xs', 'sm', 'md']
      if (disabledSizes.includes(this.$vuetify.breakpoint.name)) return false
      return true
    }
  },
  mounted() {
    this.$axios.$get('/auth/profile').then(res => {
      if (res.status === 'error') return
      this.$store.commit('user/set', res.data)
    })
  },
  methods: {
    async signOut() {
      await this.$axios.$get('/auth/signout')
      window.location.reload()
    }
  }
}
</script>
