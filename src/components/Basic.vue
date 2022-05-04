<template>
  <h3>STEP 1：基本设置</h3>
  <p>因flomo服务器设置以及安全原因，目前只能通过http-proxy的方法来获取flomo中的数据。userId cookie token 请参照该链接方式获取。Proxy Server为自建服务器地址，请填入代理服务器的地址。确认基本设置项无误后，点击刷新按钮，获取到memos的数量即为设置成功。</p>
  <a-row class="basic-row">
    <a-col :span="6"><div class="item-label"><label>userId</label></div></a-col>
    <a-col :span="16"><a-input v-model:value="userId" placeholder="Key in your Flomo userId" @blur="saveUserId" /></a-col>
  </a-row>
  <a-row class="basic-row">
    <a-col :span="6"><div class="item-label"><label>cookie</label></div></a-col>
    <a-col :span="16"><a-input v-model:value="cookie" placeholder="Key in your Flomo cookie" @blur="saveCookie" /></a-col>
  </a-row>
  <a-row class="basic-row">
    <a-col :span="6"><div class="item-label"><label>token</label></div></a-col>
    <a-col :span="16"><a-input v-model:value="token" placeholder="Key in your Flomo token" @blur="saveToken" /></a-col>
  </a-row>
  <a-row class="basic-row">
    <a-col :span="6"><div class="item-label"><label>Proxy Server</label></div></a-col>
    <a-col :span="16"><a-input v-model:value="server" placeholder="Proxy Server" @blur="saveServer" /></a-col>
  </a-row>
  <a-row class="basic-row">
    <a-col :span="8"><div class="item-label"><label>Flomo中的memos数量</label></div></a-col>
    <a-col :span="16">
      {{totalCount}}
      <a-button type="link" @click="refresh">刷新</a-button>
    </a-col>
  </a-row>
</template>
<style>
.item-label {
  display: inline-block;
  flex-grow: 0;
  overflow: hidden;
  white-space: nowrap;
  text-align: right;
  vertical-align: middle;
}
.item-label > label {
  position: relative;
  display: inline-flex;
  align-items: center;
  max-width: 100%;
  height: 32px;
  color: rgba(0, 0, 0, 0.85);
  font-size: 14px;
}
.basic-row {
  margin-bottom: 20px;
}
</style>

<script>
import { defineComponent, ref, toRef, toRefs, reactive } from 'vue';
import { ExclamationCircleOutlined } from "@ant-design/icons-vue";

import { loadStatFromFlomo } from '../utils';
export default defineComponent({
  components: {
    ExclamationCircleOutlined,
  },
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
  },
  setup(props, content) {
    const logseqSettings = reactive({
      userId: props.userId,
      cookie: props.cookie,
      token: props.token,
      server: props.server,
      totalCount: ref(0),
    });
    async function refresh() {
      const { code, stat, message } = await loadStatFromFlomo(logseqSettings);
      if (code === 0) {
        logseqSettings.totalCount = stat.memo_count;
        logseq.App.showMsg("连接服务器成功", 'success');
      } else {
        logseq.App.showMsg(`${message}，请检查参数`, 'error');
      }
    }
    const saveUserId = () => {
      console.log('saveUserId', logseqSettings.userId)
      logseq.updateSettings({ userId: logseqSettings.userId });
    };
    const saveCookie = () => {
      logseq.updateSettings({ cookie: logseqSettings.cookie });
    };
    const saveToken = () => {
      logseq.updateSettings({ token: logseqSettings.token });
    };
    const saveServer = () => {
      logseq.updateSettings({ server: logseqSettings.server });
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
