<template>
  <h2>步骤1：基本设置</h2>
  <a-row>
    <a-col :span="18"><a-input v-model:value="userId" placeholder="Key in your Flomo userId" /></a-col>
    <a-col :span="6"> <a-button type="link" @click="saveUserId">Save userId</a-button></a-col>
  </a-row>
  <a-row>
    <a-col :span="18"><a-input v-model:value="cookie" placeholder="Key in your Flomo cookie" /></a-col>
    <a-col :span="6"> <a-button type="link" @click="saveCookie">Save cookie</a-button></a-col>
  </a-row>
  <a-row>
    <a-col :span="18"><a-input v-model:value="token" placeholder="Key in your Flomo token" /></a-col>
    <a-col :span="6"> <a-button type="link" @click="saveToken">Save token</a-button></a-col>
  </a-row>
  <a-row>
    <a-col :span="18"><a-input v-model:value="server" placeholder="Proxy Server" /></a-col>
    <a-col :span="6"> <a-button type="link" @click="saveServer">Save Server</a-button></a-col>
  </a-row>
  <a-row>
    <a-col :span="18">
      <div>
        <a-badge :count="totalCount" :overflowCount="99999" :number-style="{ backgroundColor: '#52c41a' }" /> 当前memos数量
      </div>
      <div>
        <a-badge :count="updatedCount" :overflowCount="99999" /> 需要同步的memos数量
      </div>
    </a-col>
    <a-col :span="6"> <a-button type="link" @click="refresh">Refresh</a-button></a-col>
  </a-row>
</template>

<script>
import { defineComponent, ref, toRef, toRefs, reactive } from 'vue';
import {loadStatFromFlomo} from '../utils';
export default defineComponent({
  props: {
    userId: {
      type: String,
      default: '',
    },
    cookie: {
      type: String,
      default: '',
    },
    token: {
      type: String,
      default: '',
    },
    server: {
      type: String,
      default: '',
    },
    totalCount: {
      type: Number,
      default: 0,
    },
    updatedCount: {
      type: Number,
      default: 0,
    },

  },
  setup(props, content) {
    const logseqSettings = reactive({
      userId: props.userId,
      cookie: props.cookie,
      token: props.token,
      server: props.server,
    });
    async function refresh() {
      const {code ,stat, message} = await loadStatFromFlomo(logseqSettings);
      if (code === 0) {
        const totalCount = stat.memo_count;
        logseq.updateSettings({ totalCount });
        content.emit('changeTotalCount', totalCount);
      } else {
        logseq.App.showMsg(`${message}，请检查参数`, 'error');
      }
    }
    const saveUserId = () => {
      logseq.updateSettings({ userId: logseqSettings.userId });
      logseq.App.showMsg('UserId saved!', 'success');
    };
    const saveCookie = () => {
      logseq.updateSettings({ cookie: logseqSettings.cookie });
      logseq.App.showMsg('Cookie saved!', 'success');
    };
    const saveToken = () => {
      logseq.updateSettings({ token: logseqSettings.token });
      logseq.App.showMsg('Token saved!', 'success');
    };
    const saveServer = () => {
      logseq.updateSettings({ server: logseqSettings.server });
      logseq.App.showMsg('Server saved!', 'success');
    };
    const logseqSettingsRef = toRefs(logseqSettings);
    return {
      refresh,
      saveCookie,
      saveUserId,
      saveToken,
      saveServer,
      ...logseqSettingsRef,
    };
  },

});
</script>
