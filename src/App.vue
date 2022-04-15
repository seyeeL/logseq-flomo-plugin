<template>
  <a-modal v-model:visible="visible" title="" :footer="null">
    <div>
      这是设置弹窗
    </div>
  </a-modal>
</template>

<script setup>
import { ref } from "vue";

const visible = true;

function onClickBackdrop() {
  logseq.hideMainUI();
}

</script>


<style scoped>
button {
  color: v-bind(color);
}
</style>
