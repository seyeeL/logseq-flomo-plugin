<template>
  <a-modal v-model:visible="visible" :footer="null" :closable="true" @cancel="hideMainUI">
    <template #title>
      <span>Sync Settings</span>
    </template>
    <Basic></Basic>
    <a-divider />
    <Customise :syncRange="syncRange" @syncRangeChange="syncRangeChange"></Customise>
    <a-divider />
    <Sync :syncRange="syncRange"></Sync>
  </a-modal>
</template>

<script>
import Basic from './components/Basic.vue';
import Customise from './components/Customise.vue';
import Sync from './components/Sync.vue';
import dayjs from 'dayjs';

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
      syncRange: [dayjs().subtract(100, 'days'), dayjs()],
    };
  },
  mounted () {
    this.visible = true;
  },
  methods: {
    hideMainUI () {
      logseq.hideMainUI();
    },
    syncRangeChange (val) {
      this.syncRange = val;
    },
  },
};
</script>