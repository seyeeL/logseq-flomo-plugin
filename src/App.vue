<template>
  <a-modal v-model:visible="visible" :footer="null" :closable="false" width="700">
    <template #title>
      <span>Settings</span>
    </template>
    <div class="sync-block">
      <a-button class="sync-button" type="primary" :loading="percent > 0 && percent !== 100" @click="onSync">
        <template #icon>
          <SyncOutlined />
        </template>
        Sync
      </a-button>
    </div>
    <div class="sync-block" v-if="percent > 0 && percent !== 100">
      <a-progress stroke-linecap="square" :percent="percent" type="circle" />
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
            <a-tag v-for="tag in record.tags" :key="tag">
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
import { SyncOutlined } from "@ant-design/icons-vue";
import _ from "lodash";
import cheerio from 'cheerio' // https://github.com/cheeriojs/cheerio/wiki/Chinese-README
const isDevelopment = import.meta.env.DEV;

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
  watch: {
    visible(value) {
      console.log('watch visible', value)
      if (!value) {
        this.hideMainUI()
      }
    }
  },
  async mounted() {
    console.log('mounted');
    const setUserData = (s) => {
      this.maxCount = s.maxCount;
      this.cookie = s.cookie;
      this.x_xsrf_token = s.x_xsrf_token;
      this.userId = s.userId;

      // 把地址设为Proxy server地址，默认地址为flomo的server地址
      if (!isDevelopment) {
        axios.defaults.baseURL = s.server || "https://flomoapp.com";
      }
    };
    if (isDevelopment) {
      import("../temp/setting.json").then((s) => {
        console.log('dev', s);
        setUserData(s);
      });
      this.visible = true
    } else {
      // const appUserConfig = await logseq.App.getUserConfigs();
      const s = logseq.settings;
      console.log('prod', s);
      setUserData(s);
    }

    logseq.on('ui:visible:changed', async ({ visible }) => {
      console.log('visible', visible)
      if (visible) {
        this.visible = visible;
      }
    })
  },
  methods: {
    hideMainUI() {
      // this.gear = false;
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
      const { cookie, x_xsrf_token, maxCount, userId } = this;
      console.log('cookie', cookie)
      const { data } = await axios.get(
        `/api/user/${userId}/stat/?tz=8:0`,
        {
          headers: { fuck_cookie: cookie, x_xsrf_token },
        }
      );
      const { memo_count } = data?.stat || { memo_count: 0 };
      const offset = 50;
      const queryCount =
        memo_count >= maxCount && maxCount !== 0 ? maxCount : memo_count;
      // queryTimes 要加 1 的原因是 flomo 获取 memo_count 的接口不及时，因此多请求一次确保数据加载全
      const queryTimes = Math.ceil(queryCount / offset) + 1;
      const rows = [];
      for (let i = 0; i < queryTimes; i++) {
        const { data } = await axios.get(
          `/api/memo/?offset=${i * offset}&tz=8:0`,
          {
            headers: {
              fuck_cookie: cookie,
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
      const { cookie, x_xsrf_token } = this;
      console.log('cookie', cookie)
      const { data } = await axios.get(`/api/tag`, {
        headers: { fuck_cookie: cookie, x_xsrf_token },
      });
      console.log("flomo tags success:", data.tags);
      this.handleByTags(data.tags)
    },
    async handleByTags(tags) {
      for (let i = 0; i < tags.length; i++) {
        let tagName = tags[i].name
        if (tagName.indexOf('/') !== -1) {
          continue;
        }
        const data = await this.fetchMemosByTag(tagName);
        const rows = []
        console.log("handleByTags success:", data);
        this.percent = Math.floor(100 / tags.length) * i;
        if (data?.memos?.length > 0) {
          data.memos.forEach((memo) =>
            rows.push({
              ...memo,
              memo_url: `https://flomoapp.com/mine/?memo_id=${memo.slug}`,
            })
          );
          await this.loadPage(tagName, rows)
        }
      }
    },
    async fetchMemosByTag(tagName) {
      const { cookie, x_xsrf_token } = this;
      const { data } = await axios.get(
        `/api/memo/?tag=${tagName}&tz=8:0`,
        {
          headers: { fuck_cookie: cookie, x_xsrf_token },
        }
      );
      console.log("fetchMemosByTag success:", data);
      return data
    },
    async loadPage(tag, memos) {
      if (!tag || this.updating) return;
      this.updating = true;
      try {
        const pageName = "flomo/" + tag;
        console.log('pageName', pageName)
        let page = await logseq.Editor.getPage(pageName);
        const pagePropBlockString = { "flomo-tag": tag }; // for both org and markdown
        if (!page) {
          const result = await logseq.Editor.createPage(
            pageName,
            pagePropBlockString,
            {
              createFirstBlock: true,
              redirect: false,
              journal: false,
            }
          );
          console.log('createPage', result)
          // await this.loadPageNotes(pageName, memos, tag);
        }
        this.loadPageNotes(pageName, memos, tag)
      } finally {
        this.updating = false;
      }
    },
    async findPageName(tag) {
      console.log('findPageName', logseq.DB.datascriptQuery(`
      [:find (pull ?b [*])
       :where
       [?b :block/properties ?p]
       [?b :block/name _]
       [(get ?p :flomo-tag) ?t]
       [(= "${tag}" ?t)]]
       `))
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
        throw new Error("Multiple pages has the same title");
      } else if (finds == 0) {
        //throw new Error("Page doesn't exist")
        return;
      } else return finds[0]["original-name"];
    },
    async loadPageNotes(pageName, memos, tag) {
      if (!pageName || !memos) return;
      const pagePropBlockString = `:PROPERTIES:\n:flomo-tag: ${tag}\n:END:`; // for both org and markdown
      let pageBlocksTree = await logseq.Editor.getPageBlocksTree(pageName);
      console.log("pageBlocksTree", pageBlocksTree);
      let pagePropBlock = pageBlocksTree[0];
      if (!pagePropBlock) {
        pagePropBlock = await logseq.Editor.insertBlock(pageName, pagePropBlockString, { isPageBlock: true, properties: { preBlock: true } });
        pageBlocksTree = [pagePropBlock];
      }
      let pageUuid = pageBlocksTree[0].uuid
      // const blocks = pageBlocksTree.slice(1);
      // console.log('blocks', blocks)
      this.insertBlock(pageUuid, memos, true)
      // await logseq.Editor.updateBlock(pagePropBlock.uuid, pagePropBlockString);
    },
    async insertBlock(uuid, memos, sibling) {
      const regex = /<ol>(<ol>.*?<\/ol>|.)*?<\/ol>|<ul>(<ul>.*?<\/ul>|.)*?<\/ul>/g;
      for (const memo of memos) {
        let { content, memo_url, updated_at, slug } = memo;
        if (content.indexOf('<ol>') !== -1 || content.indexOf('<ul>') !== -1) {
          let $ = cheerio.load(content);
          let list_content = $('li').map(function (i, el) {
            // this === el
            return `${i + 1}. ${$(this).text()}`;
          }).get().join('\n');
          content = content.replace(regex, list_content)
          console.log('content', content)
        }
        if (content.indexOf('<p>') !== -1) {
          content = content.replaceAll('<p>', '').replaceAll('</p>', '\n')
          console.log('remove P', content)
        }
        const n_content = `${content} [link](${memo_url})\n:PROPERTIES:\nmemo_url:: ${memo_url}\nfid::${slug}\nupdated::${updated_at}\n:END:`;
        // const { parent, after } = n;
        // const source = blockMap.get(parent ?? after);
        const block = await logseq.Editor.insertBlock(uuid, n_content, { sibling, isPageBlock: false });
        // add a blank block
        await logseq.Editor.insertBlock(block.uuid, '', { sibling: true, isPageBlock: false });
        // blockMap.set(hid, block);
        console.log('block', block)
        if (memo.backlinked_count) {
          const backlinkeds = await this.getBacklinkeds(memo.slug)
          console.log('backlinkeds', backlinkeds)
          this.insertBlock(block.uuid, backlinkeds, false)
        }
      }
    },
    async getBacklinkeds(slug) {
      const { cookie, x_xsrf_token } = this;
      const { data } = await axios.get(
        `/api/memo/${slug}?tz=8:0`,
        {
          headers: {
            fuck_cookie: cookie,
            x_xsrf_token,
          },
        }
      );
      return data.memo.backlinkeds
    }
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
