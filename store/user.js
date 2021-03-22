export const state = () => ({
  data: false
})

export const getters = {
  data: state => state.data
}

export const mutations = {
  set(state, user) {
    state.data = user
  }
}
