<template>
  <a-modal v-model:visible="visible" :footer="null" :closable="true" @afterClose="hideMainUI">
    <template #title>
      <span>Sync Settings</span>
    </template>
    <Basic></Basic>
    <a-divider />
    <Customise></Customise>
    <a-divider />
    <Sync></Sync>
  </a-modal>
</template>

<script>
import Basic from './components/Basic.vue';
import Customise from './components/Customise.vue';
import Sync from './components/Sync.vue';

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
    };
  },
  mounted () {
    this.visible = true;
  },
  methods: {
    hideMainUI () {
      logseq.hideMainUI();
    },
  },
};
</script>