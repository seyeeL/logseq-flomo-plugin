<template>
  <h2>STEP 2：定制设置</h2>
  <!-- <a-row>
    <a-col :span="18"><a-input-number id="inputNumber" v-model:value="maxCount" :min="0" :step="50" /></a-col>
    <a-col :span="6"> <a-button type="link">Save maxCount</a-button></a-col>
  </a-row> -->
  <a-form :model="logseqSettings" name="basic" :label-col="{ span: 5 }" :wrapper-col="{ span: 17 }">
    <a-form-item label="maxCount" name="maxCount" :rules="[{ required: true, message: 'Please input your maxCount!' }]">
      <a-input v-model:value="maxCount" />
    </a-form-item>
  </a-form>
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
