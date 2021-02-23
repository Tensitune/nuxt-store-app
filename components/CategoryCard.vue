<template>
  <NuxtLink class="col-auto" :to="to">
    <div class="card hoverscale">
      <div class="card-body">
        <div align="center">
          <font-awesome-icon :icon="['fas', 'tshirt']" class="fa-2x" style="margin-bottom: 0.2em;" />
          <h5 class="card-title" style="margin-bottom: 0;">{{ title }}</h5>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

<script>
export default {
  name: 'CategoryCard',
  props: ['title', 'to']
}
</script>
