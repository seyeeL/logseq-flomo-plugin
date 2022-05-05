<template>
  <h3 class="customise-header">STEP 2：定制设置 <a-button type="link" @click="toggle">{{collapsed ? '显示' : '隐藏'}}</a-button>
  </h3>
  <div v-if="!collapsed">
    <div class="item-block">
      <h4>标题</h4>
      <p>Page中flomo节点的标题，默认为flomo。</p>
      <div>
        <a-input style="width: 180px" v-model:value="title" @blur="saveTitle" />
      </div>
    </div>
    <!-- <div class="item-block">
      <h4>最大同步数量</h4>
      <p>限制每次同步的最大数量。默认 0，同步所有 memos。</p>
      <div>
        <a-input-number id="inputNumber" v-model:value="maxCount" :min="0" :step="50" @blur="saveMaxCount" />
      </div>
    </div> -->
  </div>
</template>

<style>
.customise-header {
  display: flex;
  justify-content: space-between;
}
</style>

<script>
import { defineComponent, ref, toRefs, reactive } from 'vue';

export default defineComponent({
  props: {
    title: {
      type: String,
    },
    maxCount: {
      type: Number,
      default: 0,
    },
  },
  setup(props, content) {
    const logseqSettings = reactive({
      maxCount: props.maxCount,
      title: props.title,
      collapsed: ref(true),
    });
    const saveMaxCount = () => {
      logseq.updateSettings({ maxCount: logseqSettings.maxCount });
    };
    const saveTitle = () => {
      logseq.updateSettings({ title: logseqSettings.title });
    };
    const toggle = () => {
      logseqSettings.collapsed = !logseqSettings.collapsed
    };
    const logseqSettingsRef = toRefs(logseqSettings);
    return {
      toggle,
      saveMaxCount,
      saveTitle,
      ...logseqSettingsRef,
    };
  },

});
</script>
