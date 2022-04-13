<script setup>
import { ref } from "vue";

const color = ref("red");

function onClickBackdrop() {
  logseq.hideMainUI();
}

</script>

<template>
  <main
    @click="onClickBackdrop()"
    class="
      backdrop-filter backdrop-blur-md
      fixed
      inset-0
      flex
      items-center
      justify-center
    "
  >
    <button @click="color = color === 'red' ? 'green' : 'red'">
      Color is: {{ color }}
    </button>
  </main>
</template>

<style scoped>
button {
  color: v-bind(color);
}
</style>
