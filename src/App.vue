<template>
  <a-modal v-model:visible="visible" :footer="null" :closable="false">
    <template #title>
      <span>Settings</span>
      <sync-outlined class="sync-icon" />
    </template>
    <a-form :model="formState" name="basic" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }" autocomplete="off"
      @finish="onFinish" @finishFailed="onFinishFailed">
      <a-form-item label="cookie" name="cookie"
        :rules="[{ required: true, message: 'Please input your cookie!' }]">
        <a-input v-model:value="formState.cookie" />
      </a-form-item>
      <a-form-item label="x-xsrf-token" name="x_xsrf_token"
        :rules="[{ required: true, message: 'Please input your x-xsrf-token!' }]">
        <a-input v-model:value="formState.x_xsrf_token" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup>
import { ref } from "vue";
import { SyncOutlined } from "@ant-design/icons-vue";
const visible = true;
const formState = {
  cookie: "",
  x_xsrf_token: "",
  remember: true,
};
function onClickBackdrop() {
  logseq.hideMainUI();
}
function onFinish() {}
function onFinishFailed() {}
</script>


<style scoped lang="less">
button {
  color: v-bind(color);
}
.sync-icon{
  float: right;
  cursor: pointer;
  margin-top:6px;
}
</style>
