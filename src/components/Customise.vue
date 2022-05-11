<template>
  <h3 class="customise-header">STEP 2：定制设置 <a-button type="link" @click="toggle">{{collapsed ? '显示' : '隐藏'}}</a-button>
  </h3>
  <div v-if="!collapsed">
    <div class="item-block">
      <h4>标题</h4>
      <p>Page中flomo节点的标题，默认为flomo。</p>
      <div>
        <a-input style="width: 120px" v-model:value="title" @blur="saveTitle" />
      </div>
    </div>
      <div class="item-block">
    <h4>
      同步模式
      <a-tooltip placement="bottom">
      <template #title>
        <span>
          - 标签模式：每一个 tag 作为独立的 page<br>
          - 日记模式：指定时间范围内，把 memos 写入相应的 journal note 中<br>
          - 单页模式：所有的 memos 放一个 page 中
        </span>
      </template>
      <question-circle-outlined />
    </a-tooltip>
    </h4>
    <a-space>
      <a-select
        ref="select"
        v-model:value="syncMode"
        style="width: 120px"
        @change="saveSyncMode"
      >
        <a-select-option value="1">标签模式</a-select-option>
        <a-select-option value="2">日记模式</a-select-option>
        <a-select-option value="3">单页模式</a-select-option>
      </a-select>
      <a-range-picker v-if="syncMode === '2'" v-model:value="syncRange" @change="syncRangeChange"/>
    </a-space>
  </div>
  <div>
    <a-space>
      <a-checkbox v-model:checked="exportMode" @change="saveExportMode">仅导出数据</a-checkbox>
      <a-tooltip placement="top">
        <template #title>
          <span>仅导出flomo笔记，不带有logseq块属性，无法持续更新，用其他markdown工具打开无污染，适用于备份数据。</span>
        </template>
        <question-circle-outlined />
      </a-tooltip>
    </a-space>
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
import { QuestionCircleOutlined } from "@ant-design/icons-vue";

export default defineComponent({
  props: {
    title: {
      type: String,
    },
    maxCount: {
      type: Number,
      default: 0,
    },
    syncRange: {
      type: Array,
    },
  },
  components: {
    QuestionCircleOutlined
  },
  setup(props, content) {
    const s = logseq.settings || {};
    const logseqSettings = reactive({
      exportMode: ref(s.exportMode),
      syncRange: ref(props.syncRange),
      syncMode: ref(s.syncMode),
      maxCount: ref(s.maxCount),
      title: ref(s.title),
      collapsed: ref(true),
    });
    const saveMaxCount = () => {
      logseq.updateSettings({ maxCount: logseqSettings.maxCount });
    };
    const saveTitle = () => {
      logseq.updateSettings({ title: logseqSettings.title });
    };
    const saveExportMode = () => {
      logseq.updateSettings({ exportMode: logseqSettings.exportMode });
    };
    const saveSyncMode = () => {
      logseq.updateSettings({ syncMode: logseqSettings.syncMode });
    };
    const toggle = () => {
      logseqSettings.collapsed = !logseqSettings.collapsed
    };
    const syncRangeChange = (val) => {
      content.emit('syncRangeChange', val);
    }
    const logseqSettingsRef = toRefs(logseqSettings);
    return {
      toggle,
      saveExportMode,
      saveSyncMode,
      saveMaxCount,
      saveTitle,
      syncRangeChange,
      ...logseqSettingsRef,
    };
  },

});
</script>
