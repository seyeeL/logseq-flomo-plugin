<template>
  <h3>
    STEP 1：基本设置
     <a-tooltip placement="bottom">
      <template #title>
        <span>因 flomo 服务器设置以及安全原因，目前只能通过 http-proxy 的方法来获取 flomo 中的数据。<br>userId cookie token 请参照该链接方式获取。<br>Proxy
      Server 为自建服务器地址，请填入代理服务器的地址。<br>确认基本设置项无误后，点击刷新，获取到 memos 的数量即为设置成功。</span>
      </template>
      <question-circle-outlined />
    </a-tooltip>
  </h3>
 
  <a-row class="basic-row">
    <a-col :span="6">
      <div class="item-label"><label>userId</label></div>
    </a-col>
    <a-col :span="16">
      <a-input v-model:value="userId" placeholder="Key in your flomo userId" @blur="saveUserId" />
    </a-col>
  </a-row>
  <a-row class="basic-row">
    <a-col :span="6">
      <div class="item-label"><label>cookie</label></div>
    </a-col>
    <a-col :span="16">
      <a-input v-model:value="cookie" placeholder="Key in your flomo cookie" @blur="saveCookie" />
    </a-col>
  </a-row>
  <a-row class="basic-row">
    <a-col :span="6">
      <div class="item-label"><label>token</label></div>
    </a-col>
    <a-col :span="16">
      <a-input v-model:value="token" placeholder="Key in your flomo token" @blur="saveToken" />
    </a-col>
  </a-row>
  <a-row class="basic-row">
    <a-col :span="6">
      <div class="item-label">
        <label>Proxy Server</label>
        <a-tooltip>
          <template #title>
            <span>可下载 <a href="https://github.com/swiftwind0405/flomo-proxy-server/releases" target="_blank">flomo-proxy-server</a> 配合食用<br>默认地址为 http://localhost:3228</span>
          </template>
          <question-circle-outlined style="margin-left: 4px"/>
        </a-tooltip>
      </div>
    </a-col>
    <a-col :span="16">
      <a-input v-model:value="server" placeholder="Proxy Server" @blur="saveServer" />
    </a-col>
  </a-row>
  <a-row class="basic-row">
    <a-col :span="8">
      <div class="item-label"><label>flomo中的memos数量</label></div>
    </a-col>
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
import { ExclamationCircleOutlined, QuestionCircleOutlined } from "@ant-design/icons-vue";

import { loadStatFromFlomo } from '../utils';
import axios from '../utils/axios'

export default defineComponent({
  components: {
    ExclamationCircleOutlined, QuestionCircleOutlined
  },
  setup(props, content) {
    const s = logseq.settings || {};
    const logseqSettings = reactive({
      userId: ref(s.userId),
      cookie: ref(s.cookie),
      token: ref(s.token),
      server: ref(s.server),
      totalCount: ref(0),
    });
    async function refresh() {
      try {
        const { code, stat, message } = await loadStatFromFlomo(logseqSettings);
        if (code === 0) {
          logseqSettings.totalCount = stat.memo_count;
          logseq.App.showMsg("连接服务器成功", 'success');
        } else {
          logseq.App.showMsg(`${message}，请检查配置`, 'error');
        }
      } catch (e) {
        logseq.App.showMsg('连接服务器出错，请检查配置', 'error');
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
      if (logseqSettings.server) {
        axios.defaults.baseURL = logseqSettings.server;
      }
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
