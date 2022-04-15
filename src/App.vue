<template>
  <a-modal v-model:visible="visible"  :footer="null" :closable="false">
    <template  #title>
      <span>Settings</span>
      <sync-outlined />
    </template >
    <a-form :model="formState" name="basic" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }" autocomplete="off"
      @finish="onFinish" @finishFailed="onFinishFailed">
      <a-form-item label="Username" name="username"
        :rules="[{ required: true, message: 'Please input your username!' }]">
        <a-input v-model:value="formState.username" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup>
import { ref } from "vue";

const visible = true;
const formState = ({
      username: '',
      password: '',
      remember: true,
    });
function onClickBackdrop() {
  logseq.hideMainUI();
}
function onFinish() {
}
function onFinishFailed() {
}

</script>


<style scoped>
button {
  color: v-bind(color);
}
</style>
