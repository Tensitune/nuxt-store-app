<template>
  <div>
    <slot />

    <div v-if="count > limit" class="my-3 text-center">
      <v-pagination v-model="page" :length="Math.round(count / limit)" :total-visible="7" color="secondary" circle />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    count: {
      type: Number,
      required: true
    },
    limit: {
      type: Number,
      required: true
    }
  },
  data: () => ({
    page: 1
  }),
  watch: {
    page(newPage) {
      this.$emit("onPageChange", newPage);
    }
  }
};
</script>
