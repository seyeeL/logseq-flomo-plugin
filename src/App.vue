<template>
  <a-modal v-model:visible="visible" :footer="null" :closable="true">
    <template #title>
      <span>Sync Settings</span>
    </template>
    <Basic :userId="userId" :cookie="cookie" :token="token" :server="server"></Basic>
    <a-divider />
    <Customise :title="title" :max-count="maxCount"></Customise>
    <a-divider />
    <Sync :cookie="cookie" :token="token" :server="server"></Sync>
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
      maxCount: 0,
      title: '',
      cookie: "",
      token: "",
      userId: "",
      server: "",
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
        this.title = s.title;
        this.cookie = s.cookie;
        this.token = s.token;
        this.userId = s.userId;
      });
    }

    logseq.once('ui:visible:changed', ({ visible }) => {
      visible && (this.visible = true);
      // init
      const s = logseq.settings;
      console.log('prod', s);
      this.maxCount = s.maxCount || 0;
      this.title = s.title || 'flomo';
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
