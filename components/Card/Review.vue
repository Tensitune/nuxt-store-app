<template>
  <v-card :max-width="maxWidth" :max-height="maxHeight" :width="width" :height="height" elevation="1" outlined>
    <v-list-item two-line>
      <v-list-item-content>
        <div v-if="reviewUser" class="overline d-flex align-center" style="line-height: 0">
          <v-icon>mdi-account</v-icon>
          <div class="mx-1">{{ reviewUser.username }}</div>
          <v-rating :value="review.rating" class="mb-1" color="amber" dense half-increments readonly size="24" />
        </div>
        <div class="subtitle-1" style="line-height: 1.2rem">{{ review.text }}</div>
      </v-list-item-content>

      <v-list-item-action v-if="user && user.admin">
        <v-dialog v-model="dialog" max-width="400px">
          <template #activator="{ on, attrs }">
            <v-btn color="red lighten-1" icon v-bind="attrs" v-on="on">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </template>

          <v-card>
            <v-card-title>Вы хотите удалить отзыв?</v-card-title>
            <v-card-actions>
              <v-spacer />
              <v-btn color="red lighten-1" text @click="deleteReview">
                Удалить
              </v-btn>
              <v-btn color="blue darken-1" text @click="dialog = false">
                Закрыть
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-list-item-action>
    </v-list-item>
  </v-card>
</template>

<script>
import { mapState } from "vuex";

export default {
  props: {
    review: {
      type: Object,
      required: true
    },
    width: {
      type: String,
      default: "auto"
    },
    height: {
      type: String,
      default: "auto"
    },
    maxWidth: {
      type: String,
      default: "auto"
    },
    maxHeight: {
      type: String,
      default: "auto"
    }
  },
  data: () => ({
    dialog: false,
    reviewUser: null
  }),
  computed: {
    ...mapState({
      user: state => state.user
    })
  },
  async mounted() {
    this.reviewUser = (await this.$axios.get(`/users/${this.review.userId}`)).data;
  },
  methods: {
    async deleteReview() {
      await this.$axios.delete(`/reviews/${this.review.id}`);
      this.dialog = false;

      this.$nuxt.$emit("snackbarCall", "Отзыв успешно удалён!");
      this.$emit("onReviewDelete");
    }
  }
};
</script>
