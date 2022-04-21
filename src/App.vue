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
  cookie: "amplitude_id_fef1e872c952688acd962d30aa545b9eflomoapp.com=eyJkZXZpY2VJZCI6ImQ3MDZiYTYwLTA1YjYtNGMwNC04YTMxLWM5NTM1ZTQ5YmEzZlIiLCJ1c2VySWQiOm51bGwsIm9wdE91dCI6ZmFsc2UsInNlc3Npb25JZCI6MTYyNTIwNTI3NDU3OSwibGFzdEV2ZW50VGltZSI6MTYyNTIwNTI3NDU4MCwiZXZlbnRJZCI6MSwiaWRlbnRpZnlJZCI6MCwic2VxdWVuY2VOdW1iZXIiOjF9; XSRF-TOKEN=eyJpdiI6ImJpYmJTSlVLa2RVbEFTWlRDNU1iUGc9PSIsInZhbHVlIjoiYjdkQ1wvMTZoTnh1d3c5OE5DYzhcL2hnU0hXQ3oxZzRIczJCSGxNTGZjcytsY1hiMlJNVWNMNzVmTWlQSktjdUppIiwibWFjIjoiZjI1NTQzOGU4MmU0NjNlYzg4ODczNDA0ZjhkZDdhY2Q5MTQyYmM5YTA5NjIyY2Q5OTZhNzM4OWY1ZmJjNTI1ZiJ9; flomo_session=eyJpdiI6Ik42TG5wNFlieStMdVMxeVp0T1Ura0E9PSIsInZhbHVlIjoiODJRODhZSTVnUFNTSkxTSHhRQXk5OW1QcHQ0TnpqZnRSSlNvMzlsMzJ3eUZBS3YwMjZzNlRORHNkczRNN09mdyIsIm1hYyI6IjVkNWQ4YWNmZDk1OWJiNWI3YjA2OTgyOWM5NzA0ODZlYWVkOTljMzY2NjhiN2QwODQ5YzE1Y2E5NTFlZGFlNmYifQ==",
  x_xsrf_token: "eyJpdiI6ImtSNERXSmpZS0JPeGIzWkR2ZWt0bUE9PSIsInZhbHVlIjoienNTWnJpSVZvcmtZN3hDdURWbkdGNGVXdThPK3RkdmhCUkNRRnRpVWRqSVcwaHpyQjdqOEFveUVqNXVNczFqdSIsIm1hYyI6ImQwYmNjNGFmMzFjMDliZGZlY2RlMDQyYTBkMGJlZmY0NGYyZDdkNzMzZjVkMTI5OTFhOTQzNGFkNzFjOWYyOTAifQ%3D%3D",
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
