<template>
  <a-modal v-model:visible="visible" :footer="null" :closable="true" destroyOnClose @cancel="hideMainUI">
    <template #title>
      <span>Sync Settings</span>
    </template>
    <Basic :userId="userId" :cookie="cookie" :token="token" :server="server"></Basic>
    <a-divider />
    <Customise :title="title" :max-count="maxCount"></Customise>
    <a-divider />
    <Sync :cookie="cookie" :token="token" :server="server" :title="title"></Sync>
  </a-modal>
</template>

<script>
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
  data () {
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
    visible (value) {
      console.log('watch visible', value)
      if (!value) {
        this.hideMainUI()
      }
    }
  },
  async mounted () {
    logseq.on('ui:visible:changed', ({ visible }) => {
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
    })
  },
  methods: {
    hideMainUI () {
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
