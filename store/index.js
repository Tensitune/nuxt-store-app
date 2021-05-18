export const state = () => ({
  user: false,
  userCart: []
})

export const mutations = {
  setUser(state, data) {
    state.user = data
  },

  setUserCart(state, data) {
    state.userCart = data
  }
}
