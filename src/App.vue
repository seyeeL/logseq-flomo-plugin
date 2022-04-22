<template>
  <a-modal v-model:visible="visible" :footer="null" :closable="false" width="700">
    <template #title>
      <span>Settings</span>
      <sync-outlined class="sync-icon" @click="onSync"/>
    </template>
    <a-table :dataSource="dataSource" :columns="columns" bordered :row-key="record => record.slug">
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
      const { memo_count } = data?.stat || { memo_count : 0 };
      console.log('memo_count', memo_count)
      const offset = 50;
      const res = await Promise.all(
        Array
          .from({length: Math.ceil((maxCount || memo_count) / offset)})
          .map((t, i) => axios.get(`/flomo/api/memo/?offset=${offset*(i+1)}&tz=8:0`, {
            headers: { cookie, x_xsrf_token },
          }))
      )
      const rows = [];
      res.forEach(item => {
        const { memos } = item?.data || { memo: [] };
        memos.forEach(memo => rows.push({...memo, memo_url: `https://flomoapp.com/mine/?memo_id=${memo.slug}`}));
      })
      console.log('rows', rows);
      this.dataSource = rows;
    }
  },
}
</script>

<style scoped lang="less">
button {
  color: v-bind(color);
}
.sync-icon{
  float: right;
  cursor: pointer;
  margin-top:6px;
}
</style>
