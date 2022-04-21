<template>
  <a-modal v-model:visible="visible" :footer="null" :closable="false">
    <template #title>
      <span>Settings</span>
      <sync-outlined class="sync-icon" @click="onSync"/>
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
import { SyncOutlined } from "@ant-design/icons-vue";
import axios from 'axios';

const max_count = 5;   // 限制memo的最大数量
const isLimit = true;  // 是否使用限制数量
const visible = true;
const formState = {
  cookie: `
  填入自己的cookie，注意这里填写的暂不起效，也就是不填也没事
  `,
  x_xsrf_token:  `
  填入自己的token
  `,
  remember: true,
};

function onClickBackdrop() {
  logseq.hideMainUI();
}
function onFinish() {}
function onFinishFailed() {}
async function fetchMemos() {
  const { cookie, x_xsrf_token } = formState;
  const { data } = await axios.get('/flomo/api/user/12120/stat/?tz=8:0', {
    headers: { cookie, x_xsrf_token },
  });
  const { memo_count } = data?.stat || { memo_count : 0 };
  console.log('memo_count', memo_count)
  const res = await Promise.all(
    Array
      .from({length: isLimit ? max_count : memo_count})
      .map((t, i) => axios.get(`/flomo/api/memo/?offset=${50*(i+1)}&tz=8:0`, {
        headers: { cookie, x_xsrf_token },
      }))
  )
  const rows = [];
  res.forEach(item => {
    const { memos } = item?.data || { memo: [] };
    memos.forEach(memo => rows.push(memo));
  })
  console.log('rows', rows);
}
function onSync() {
  fetchMemos();
}
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
