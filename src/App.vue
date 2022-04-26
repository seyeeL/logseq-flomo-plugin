<template>
  <a-modal v-model:visible="visible" :footer="null" :closable="false" width="700">
    <template #title>
      <span>Settings</span>
    </template>
    <div class="sync-block">
      <a-button class="sync-button" type="primary" :loading="percent > 0 && percent !== 100" @click="onSync">
        <template #icon>
          <SyncOutlined/>
        </template>
        Sync
      </a-button>
    </div>
    <div class="sync-block" v-if="percent > 0 && percent !== 100">
      <a-progress stroke-linecap="square" :percent="percent" type="circle"/>
    </div>
    <a-table v-if="percent === 100" :dataSource="dataSource" :columns="columns" bordered
             :row-key="record => record.slug">
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
          <a @click="onDetailClick(record.memo_url)">{{ record.memo_url }}</a>
        </template>
      </template>
    </a-table>
  </a-modal>
</template>

<script>
import axios from 'axios';
import {SyncOutlined} from "@ant-design/icons-vue";
import _ from "lodash";

const isDevelopment = import.meta.env.DEV

axios.defaults.withCredentials = true;
axios.defaults.baseURL = 'https://flomoapp.com';
axios.defaults.headers = {
  'accept': 'application/json, text/plain, */*',
  'accept-encoding': 'gzip, deflate, br',
  'user-agent': 'Chrome/98.0.4758.80 Safari/537.36 Edg/98.0.1108.43',
  'referer': 'https://flomoapp.com/mine?tag=inbox',
  'x-requested-with': 'XMLHttpRequest',
};

export default {
  name: "App",
  components: {
    SyncOutlined,
  },
  data() {
    return {
      visible: false,
      gear: false,
      percent: 0,
      columns: [
        {
          title: "slug",
          dataIndex: "slug",
        },
        {
          title: "content",
          dataIndex: "content",
          ellipsis: true,
        },
        {
          title: "tags",
          dataIndex: "tags",
          key: "tags",
        },
        {
          title: "created_at",
          dataIndex: "created_at",
        },
        {
          title: "updated_at",
          dataIndex: "updated_at",
        },
        {
          title: "memo_url",
          dataIndex: "memo_url",
        },
      ],
      dataSource: [],
      maxCount: 0,
      cookie: "",
      x_xsrf_token: "",
      userId: "",
      syncTags: [],
    };
  },
  async mounted() {
    const setUserData = (s) => {
      this.maxCount = s.maxCount;
      this.cookie = s.cookie;
      this.x_xsrf_token = s.x_xsrf_token;
      this.userId = s.userId;
    };
    if (isDevelopment) {
      // import("../temp/setting.json").then((s) => {
      //   console.log('dev', s);
      //   setUserData(s);
      // });
    } else {
      const appUserConfig = await logseq.App.getUserConfigs();
      const s = logseq.settings;
      console.log('prod', s);
      setUserData(s);
    }
    console.log('this', this.maxCount)
    const {cookie, x_xsrf_token} = this;
    console.log('x_xsrf_token', x_xsrf_token)
    console.log('cookie', cookie)
    fetch('https://flomoapp.com/api/tag', {
      method: 'GET',
      mode: "cors", // same-origin，no-cors
      referrer: 'https://flomoapp.com/mine?tag=inbox',
      credentials: 'include',
      headers: {
        'accept': 'application/json, text/plain, */*',
        'accept-encoding': 'gzip, deflate, br',
        'user-agent': 'Chrome/98.0.4758.80 Safari/537.36 Edg/98.0.1108.43',
        'x-requested-with': 'XMLHttpRequest',
        'cookie': this.cookie,
        'x_xsrf_token': this.x_xsrf_token,
      },
    }).then(res => {
      console.log('res', res)
    })
    // const {data} = await axios.get(`/flomo/api/tag`, {
    //   headers: {cookie, x_xsrf_token},
    // });
    // console.log("flomo tags success:", data.tags);

    logseq.on('ui:visible:changed', async ({visible}) => {
      console.log('visible', visible)
      if (visible) {
        this.visible = visible;
      }
    })
  },
  methods: {
    hideMainUI() {
      this.gear = false;
      logseq.hideMainUI();
    },
    onDetailClick(url) {
      window.open(url, "_blank");
    },
    onSync() {
      // this.fetchMemos()
      this.fetchTags();
    },
    async fetchMemos() {
      const {cookie, x_xsrf_token, maxCount, userId} = this;
      const {data} = await axios.get(
          `/api/user/${userId}/stat/?tz=8:0`,
          {
            headers: {cookie, x_xsrf_token},
          }
      );
      const {memo_count} = data?.stat || {memo_count: 0};
      const offset = 50;
      const queryCount =
          memo_count >= maxCount && maxCount !== 0 ? maxCount : memo_count;
      // queryTimes 要加 1 的原因是 flomo 获取 memo_count 的接口不及时，因此多请求一次确保数据加载全
      const queryTimes = Math.ceil(queryCount / offset) + 1;
      const rows = [];
      for (let i = 0; i < queryTimes; i++) {
        const {data} = await axios.get(
            `/api/memo/?offset=${i * offset}&tz=8:0`,
            {
              headers: {
                cookie,
                x_xsrf_token,
              },
            }
        );
        this.percent = Math.floor(100 / queryTimes) * i;
        if (data?.memos?.length > 0) {
          data.memos.forEach((memo) =>
              rows.push({
                ...memo,
                memo_url: `https://flomoapp.com/mine/?memo_id=${memo.slug}`,
              })
          );
        }
      }
      console.log("flomo fetch success:", rows);
      this.dataSource = rows;
      this.percent = 100;
    },
    async fetchTags() {
      const {cookie, x_xsrf_token} = this;
      const {data} = await axios.get(`/flomo/api/tag`, {
        headers: {cookie, x_xsrf_token},
      });
      console.log("flomo tags success:", data.tags);
    },
    handleTags(tags) {
      tags.forEach((item) => {
        if (item.name.search("/")) {
          return;
        }
        this.fetchMemosByTag(item.name);
        this.syncTags.push(item.name);
      });
    },
    async fetchMemosByTag(tagName) {
      const {cookie, x_xsrf_token} = this;
      const {data} = await axios.get(
          `/flomo/api/memo/?tag=${tagName}&tz=8:0`,
          {
            headers: {cookie, x_xsrf_token},
          }
      );
      console.log("fetchMemosByTag success:", data);
    },
    async fetchTags() {
      const {cookie, x_xsrf_token} = this;
      const {data} = await axios.get(`/flomo/api/tag`, {
        headers: {cookie, x_xsrf_token},
      });
      console.log("flomo tags success:", data);
    },
    async loadPage(rows) {
      if (!uri || this.updating) return;
      this.updating = true;
      try {
        // let { title: hypothesisTitle, noteMap } = this.getPageNotes(uri)
        let tag = rows.tags[0];
        let content = rows.content;
        const logseqTitle = await this.findPageName(uri);

        //If page isn't found, create new one with hypothesisTitle. This approach allows for the title to be changed by the user
        const pageTitle = logseqTitle ? logseqTitle : "flomo" + tag;
        logseq.App.pushState("page", {name: pageTitle});
        await delay(300);
        const page = await logseq.Editor.getCurrentPage();
        if (pageTitle !== page.originalName) throw new Error("page error");
        await this.loadPageNotes(page, tag, content);
      } finally {
        this.updating = false;
      }
    },
    async findPageName(tag) {
      const finds = (
          await logseq.DB.datascriptQuery(`
      [:find (pull ?b [*])
       :where
       [?b :block/properties ?p]
       [?b :block/name _]
       [(get ?p :flomo-tag) ?t]
       [(= "${tag}" ?t)]]
       `)
      ).flat();
      if (finds.length > 1) {
        //TODO: throw error
        throw new Error("Multiple pages has the same title");
      } else if (finds == 0) {
        //throw new Error("Page doesn't exist")
        return;
      } else return finds[0]["original-name"];
    },
    async loadPageNotes(page, tag, content) {
      if (!page || !uri) return;

      // hypothesis-uri is the prop by which the plugin identifies each page
      // hypothesis-naming-scheme is added for improved backwards compatability for later updates
      const pagePropBlockString = `:PROPERTIES:\n:flomo-tag: ${tag}\n:END:`; // for both org and markdown
      let pageBlocksTree = await logseq.Editor.getCurrentPageBlocksTree();
      console.log("pageBlocksTree", pageBlocksTree);
      // let pagePropBlock = pageBlocksTree[0];
      // if (!pagePropBlock) {
      //   pagePropBlock = await logseq.Editor.insertBlock(page.name, pagePropBlockString, { isPageBlock: true, properties: { preBlock: true } });
      //   pageBlocksTree = [pagePropBlock];
      // }
      // const blocks = pageBlocksTree.slice(1);
      // const blockMap = new Map(flatten(blocks).map(b => [b.properties.fid, b]));
      // const n_b = [...noteMap.values()].filter(n => !blockMap.has(n.properties.fid));
      // for (const n of n_b) {
      //   const { fid, updated } = n.properties;
      //   const content = `${n.content}\n:PROPERTIES:\n:fid:${fid}\n:updated:${updated}\n:END:`;
      //   const { parent, after } = n;
      //   const source = blockMap.get(parent ?? after);
      //   const block = await logseq.Editor.insertBlock(source?.uuid ?? page.name, content, { sibling: !parent, isPageBlock: !source });
      //   blockMap.set(fid, block);
      // }
      // await logseq.Editor.updateBlock(pagePropBlock.uuid, pagePropBlockString);
    },
  },
};
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
  color: #fff;
}
</style>
