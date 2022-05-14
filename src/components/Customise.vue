<template>
  <h3 class="customise-header">STEP 2：定制设置 <a-button type="link" @click="toggle">{{collapsed ? '显示' : '隐藏'}}</a-button>
  </h3>
  <div v-if="!collapsed">
    <a-row class="basic-row">
      <a-col :span="6">
        <div class="item-label">
          <label>标题</label>
          <a-tooltip placement="bottom">
            <template #title>
              <p>Page中flomo节点的标题，默认为flomo。</p>
            </template>
            <question-circle-outlined style="margin-left: 4px" />
          </a-tooltip>
        </div>
      </a-col>
      <a-col :span="16">
        <a-input v-model:value="title" @blur="saveTitle" />
      </a-col>
    </a-row>
    <a-row class="basic-row">
      <a-col :span="6">
        <div class="item-label">
          <label>同步模式</label>
          <a-tooltip placement="bottom">
            <template #title>
              <span>
                - 标签模式：每一个 tag 作为独立的 page<br>
                - 日记模式：指定时间范围内，把 memos 写入相应的 journal note 中<br>
                - 单页模式：所有的 memos 放一个 page 中<br>
                - 仅导出数据：仅导出flomo笔记，不带有logseq块属性，无法持续更新，用其他markdown工具打开无块属性污染，适用于备份数据。
              </span>
            </template>
            <question-circle-outlined style="margin-left: 4px" />
          </a-tooltip>
        </div>
      </a-col>
      <a-col :span="16">
        <a-select ref="select" v-model:value="syncMode" style="width: 160px" @change="saveSyncMode">
          <a-select-option value="1">标签模式</a-select-option>
          <a-select-option value="2">日记模式</a-select-option>
          <a-select-option value="3">单页模式</a-select-option>
        </a-select>
        <a-space style="margin-left: 50px">
          <a-checkbox v-model:checked="exportMode" @change="saveExportMode">仅导出数据</a-checkbox>
          <!-- <a-tooltip placement="top">
            <template #title>
              <span>仅导出flomo笔记，不带有logseq块属性，无法持续更新，用其他markdown工具打开无块属性污染，适用于备份数据。</span>
            </template>
            <question-circle-outlined />
          </a-tooltip> -->
        </a-space>
      </a-col>
    </a-row>
    <a-row class="basic-row" v-if="syncMode === '2'">
      <a-col :span="6">
        <div class="item-label">
          时间范围
        </div>
      </a-col>
      <a-col :span="16">
        <a-range-picker v-model:value="syncRange" @change="syncRangeChange" />
      </a-col>
    </a-row>
    <div>

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
.ant-picker.ant-picker-range {
  width: 100%;
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
  setup (props, content) {
    const s = logseq.settings || {};
    const logseqSettings = reactive({
      exportMode: ref(s.exportMode),
      syncRange: ref(props.syncRange),
      syncMode: ref(s.syncMode),
      maxCount: ref(s.maxCount),
      title: ref(s.title),
      collapsed: ref(false),
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
