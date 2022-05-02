<template>
  <h2>步骤2：定制设置</h2>
  <a-row>
    <a-col :span="18"><a-input-number id="inputNumber" v-model:value="maxCount" :min="0" :step="50" /></a-col>
    <a-col :span="6"> <a-button type="link">Save maxCount</a-button></a-col>
  </a-row>
</template>

<script>
import { defineComponent, toRefs, reactive } from 'vue';
export default defineComponent({
  props: {
    maxCount: {
      type: Number,
      default: 0,
    },
  },
  setup(props, content) {
    const logseqSettings = reactive({
      maxCount: props.maxCount,
    });
    const saveMaxCount = () => {
      logseq.updateSettings({ maxCount: logseqSettings.maxCount });
      logseq.App.showMsg('MaxCount saved!', 'success');
    };
    const logseqSettingsRef = toRefs(logseqSettings);
    return {
      ...logseqSettingsRef,
    };
  },

});
</script>
