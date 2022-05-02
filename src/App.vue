<template>
  <a-modal v-model:visible="visible" :footer="null" :closable="true">
    <template #title>
      <span>Settings</span>
    </template>
    <Basic :userId="userId" :cookie="cookie" :token="token" :server="server" :totalCount="totalCount" :updatedCount="updatedCount" @changeTotalCount="changeTotalCount"></Basic>
    <Customise></Customise>
    <Sync :cookie="cookie" :token="token" :server="server" :totalCount="totalCount"></Sync>
  </a-modal>
</template>

<script>
import axios from 'axios';

import Basic from './components/Basic.vue';
import Customise from './components/Customise.vue';
import Sync from './components/Sync.vue';

const isDevelopment = import.meta.env.DEV;

export default {
  name: "App",
  components: {
    Basic,
    Customise,
    Sync,
  },
  data() {
    return {
      visible: false,
      percent: 0,
      maxCount: 0,
      cookie: "",
      token: "",
      userId: "",
      server: "",
      totalCount: 0,
      updatedCount: 0,
    };
  },
  watch: {
    visible(value) {
      console.log('watch visible', value)
      if (!value) {
        this.hideMainUI()
      }
    }
  },
  async mounted() {
    console.log('refresh flomo plugin');
    if (isDevelopment) {
      import("../temp/setting.json").then((s) => {
        console.log('dev', s);
        this.visible = true
        this.maxCount = s.maxCount;
        this.cookie = s.cookie;
        this.token = s.token;
        this.userId = s.userId;
        this.totalCount = s.totalCount;
      });
    }

    logseq.once('ui:visible:changed', ({ visible }) => {
      visible && (this.visible = true);
      // init
      const s = logseq.settings;
      console.log('prod', s);
      this.maxCount = s.maxCount;
      this.cookie = s.cookie;
      this.token = s.token;
      this.userId = s.userId;
      this.server = s.server;
      axios.defaults.baseURL = s.server;
    })

    logseq.on('ui:visible:changed', async ({ visible }) => {
      console.log('visible', visible)
      if (visible) {
        this.visible = visible;
      }
    })
  },
  methods: {
    hideMainUI() {
      logseq.hideMainUI();
    },
    changeTotalCount(value) {
      console.log('changeTotalCount', this.totalCount)
      const updatedCount = value - this.totalCount
      console.log('updatedCount', updatedCount)
      this.totalCount = value;
      this.updatedCount = updatedCount;
    },
  },
};
</script>

<style scoped lang="less">
button {
  color: v-bind(color);
}

.sync-block {
  padding: 20px 0;
  text-align: center;
}

.sync-button {
  color: #fff;
}
</style>
