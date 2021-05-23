export const state = () => ({
  user: null,
  userCart: []
});

export const mutations = {
  setUser(state, user) {
    state.user = user;
  },
  setCart(state, cart) {
    state.userCart = cart;
  },
  clearCart(state) {
    state.userCart = [];
  },
  removeCartItem(state, productId) {
    if (!state.userCart) return;
    state.userCart = state.userCart.filter(item => item.id !== productId);
  },
  reduceCartQuantity(state, productId) {
    if (!state.userCart) return;
    state.userCart.map(item => {
      if (item.id === productId) item.quantity--;
      return item;
    });
  },
  increaseCartQuantity(state, productId) {
    if (!state.userCart) return;
    state.userCart.map(item => {
      if (item.id === productId) item.quantity++;
      return item;
    });
  }
};

export const actions = {
  nuxtServerInit({ commit }, { req }) {
    if (req.session.user) {
      commit("setUser", req.session.user);
    }
  }
};
