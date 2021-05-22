<template>
  <v-container>
    <div class="text-center pa-4">
      <h2>{{ error.statusCode }}</h2>
      <h3 class="font-weight-regular">{{ errorMessage }}</h3>
      <v-btn v-if="error.statusCode === 404" class="mt-2" color="deep-purple lighten-2 white--text" router to="/">
        Главная
      </v-btn>
    </div>
  </v-container>
</template>
<script>
export default {
  props: {
    error: {
      type: Object,
      required: true
    }
  },
  computed: {
    errorMessage() {
      switch (this.error.statusCode) {
        case 403:
          return "У вас нет доступа к этой странице";
        case 404:
          return "Страница не найдена. Убедитесь, что адрес правильный и страница не перемещена";
        case 500:
          return "Страница не может быть отображена из-за внутренней ошибки";
        default:
          return "Что-то пошло не так";
      }
    }
  }
};
</script>
