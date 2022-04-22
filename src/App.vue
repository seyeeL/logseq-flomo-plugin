<template>
  <a-modal v-model:visible="visible" :footer="null" :closable="false" width="700">
    <template #title>
      <span>Settings</span>
    </template>
    <div class="sync-block">
      <a-button class="sync-button" type="primary" :loading="percent > 0 && percent !== 100" @click="onSync">
        <template #icon><SyncOutlined /></template>
        Sync
      </a-button>
    </div>
    <div class="sync-block" v-if="percent > 0 && percent !== 100">
      <a-progress stroke-linecap="square" :percent="percent" type="circle" />
    </div>
    <a-table v-if="percent === 100" :dataSource="dataSource" :columns="columns" bordered :row-key="record => record.slug">
      <template #bodyCell="{ column, text, record }">
        <template v-if="column.dataIndex === 'slug'">
          <span>
            {{ record.slug }}
          </span>
        </template>
        <template v-else-if="column.dataIndex === 'tags'">
          <span>
            <a-tag
              v-for="tag in record.tags"
              :key="tag"
            >
              {{ tag }}
            </a-tag>
          </span>
        </template>
        <template v-else-if="column.dataIndex === 'memo_url'">
          <a @click="onDetailClick(record.memo_url)">{{record.memo_url}}</a>
        </template>
      </template>
    </a-table>
  </a-modal>
</template>

<script>
import axios from 'axios';
import { SyncOutlined } from "@ant-design/icons-vue";

export default {
  name: 'App',
  components: {
    SyncOutlined
  },
  data () {
    return {
      visible: true,
      gear: false,
      percent: 0,
      columns: [
        {
          title: 'slug',
          dataIndex: 'slug',
        },
        {
          title: 'content',
          dataIndex: 'content',
          ellipsis: true,
        },
        {
          title: 'tags',
          dataIndex: 'tags',
          key: 'tags',
        },
        {
          title: 'created_at',
          dataIndex: 'created_at',
        },
        {
          title: 'updated_at',
          dataIndex: 'updated_at',
        },
        {
          title: 'memo_url',
          dataIndex: 'memo_url',
        },
      ],
      dataSource: [],
      maxCount: 0,
      cookie: '',
      x_xsrf_token:  '',
      userId:  '',
    }
  },
  async mounted () {
    import('../temp/setting.json').then(s => {
      // TODO: prod 取插件设置
      // const appUserConfig = await logseq.App.getUserConfigs();
      // const s = logseq.settings;
      this.maxCount = s.maxCount;
      this.cookie = s.cookie;
      this.x_xsrf_token = s.x_xsrf_token;
      this.userId = s.userId;
    })

    // logseq.on('ui:visible:changed', async ({ visible }) => {
    //   if (visible) {
    //     this.visible = visible;
    //   }
    // })
  },
  methods: {
    hideMainUI() {
      this.gear = false;
      logseq.hideMainUI()
    },
    onDetailClick(url) {
      window.open(url,'_blank')
    },
    onSync() {
      this.fetchMemos()
    },
    async fetchMemos() {
      const { cookie, x_xsrf_token, maxCount, userId } = this;
      const { data } = await axios.get(`/flomo/api/user/${userId}/stat/?tz=8:0`, {
        headers: { cookie, x_xsrf_token },
      });
      // const { memo_count } = data?.stat || { memo_count : 0 };
      const memo_count = 5000;
      const offset = 50;
      const queryCount = memo_count >= maxCount && maxCount !== 0 ? maxCount : memo_count;
      // queryTimes 要加 1 的原因是 flomo 获取 memo_count 的接口不及时，因此多请求一次确保数据加载全
      const queryTimes = Math.ceil(queryCount / offset) + 1;
      const rows = [];
      for (let i = 0; i < queryTimes; i++) {
        const { data } = await axios.get(`/flomo/api/memo/?offset=${i*offset}&tz=8:0`, {
          headers: {
            // cookie,
            x_xsrf_token
          },
        });
        this.percent = Math.floor(100 / queryTimes) * i;
        console.log('percent', this.percent)
        if (data?.memos?.length > 0) {
          data.memos.forEach(memo => rows.push({...memo, memo_url: `https://flomoapp.com/mine/?memo_id=${memo.slug}`}));
        }
      }
      console.log('rows', rows);
      this.dataSource = rows;
      this.percent = 100;
    }
  },
}
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
  color: #FFF;
}
</style>
