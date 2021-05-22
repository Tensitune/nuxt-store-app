export const state = () => ({
  user: null,
  userCart: null
});

export const mutations = {
  SET_USER(state, user) {
    state.user = user;
  },

  SET_CART(state, cart) {
    state.userCart = cart;
  }
};

export const actions = {
  nuxtServerInit({ commit }, { req }) {
    if (req.session.user) {
      commit("SET_USER", req.session.user);
    }
  }
};
