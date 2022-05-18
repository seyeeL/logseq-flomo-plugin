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
import { end } from 'cheerio/lib/api/traversing';

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
      syncRange: [],
    };
  },
  mounted () {
    this.visible = true;
    const s = logseq.settings || {};
    if (s.syncRange && s.syncRange.length === 2) {
      console.log('syncRange', s.syncRange)
      const [start_date, end_date] = s.syncRange;
      this.syncRange = [dayjs(start_date), dayjs(end_date)]
    } else {
      this.syncRange = [dayjs().subtract(100, 'days'), dayjs()]
    }
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

<style lang="less" >
span.anticon.anticon-question-circle {
  color: #9b9b9b;
}
</style>