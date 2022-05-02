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
        // if (tagName.indexOf('/') !== -1) {
        //   continue;
        // }
        if (i > 0) {
          return
        }
        const data = await this.fetchMemosByTag(tagName);
        console.log("handleByTags success:", data);
        this.percent = Math.floor(100 / tags.length) * i;
        if (data?.memos?.length > 0) {
          const rows = this.handleRows(data.memos)
          await this.loadPage(tagName, rows)
        }
      }
    },
    handleRows(memos) {
      const rows = []
      memos.forEach((memo) =>
        rows.push({
          ...memo,
          memo_url: `https://flomoapp.com/mine/?memo_id=${memo.slug}`,
        })
      );
      return rows
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
        const pageName = tag;
        console.log('pageName', pageName)
        let page = await logseq.Editor.getPage(pageName);
        // const pagePropBlockString = { "flomo-tag": tag }; // for both org and markdown
        if (!page) {
          const result = await logseq.Editor.createPage(
            pageName,
            {},
            {
              createFirstBlock: true,
              redirect: false,
              journal: false,
            }
          );
          console.log('createPage', result)
        }
        this.loadPageNotes(pageName, memos, tag)
      } finally {
        this.updating = false;
      }
    },
    async loadPageNotes(pageName, memos, tag) {
      if (!pageName || !memos) return;
      const pagePropBlockString = `flomo\n#+flomo_tag:${pageName}`; // for both org and markdown
      let pageBlocksTree = await logseq.Editor.getPageBlocksTree(pageName);
      console.log("pageBlocksTree", pageBlocksTree);
      let pagePropBlock
      let pageUuid
      if (pageBlocksTree.length) {
        for (let i = 0; i < pageBlocksTree.length; i++) {
          if (pageBlocksTree[i].content.indexOf('flomo_tag') !== -1) {
            pageUuid = pageBlocksTree[i].uuid
            console.log("pageUuid", pageUuid);
            break
          }
        }
      }
      if (!pageUuid) {
        pagePropBlock = await logseq.Editor.insertBlock(pageBlocksTree[0].uuid, pagePropBlockString, { isPageBlock: false });
        console.log("pagePropBlock", pagePropBlock);
        pageUuid = pagePropBlock.uuid
      }
      this.insertBlock(pageUuid, memos, false)
    },
    async insertBlock(uuid, memos, sibling) {
      for (const memo of memos) {
        let { content, memo_url, updated_at, slug } = memo;

        let $ = cheerio.load(content);
        if (content.indexOf('<ol>') !== -1) {
          $('ol').each(function (i, el) {
            // this === el
            $(this).children().each(function (j, ele) {
              let str = j === 0 ? `\n${j + 1}. ${$(this).text()}\n` : `${j + 1}. ${$(this).text()}\n`
              console.log('str', str)
              $(this).html(str)
            })
          })
        }
        if (content.indexOf('<ul>') !== -1) {
          $('ul').each(function (i, el) {
            // this === el
            $(this).children().each(function (j, ele) {
              let str = j === 0 ? `\n* ${$(this).text()}\n` : `* ${$(this).text()}\n`
              console.log('str', str)
              $(this).html(str)
            })
          })
        }
        content = $.text()
        console.log('content', content)
        if (content.indexOf('<p>') !== -1) {
          content = content.replaceAll('<p>', '').replaceAll('</p>', '\n')
          console.log('remove P', content)
        }
        content = content.replace(/\n$/, '')
        const n_content = `${content}\n#+memo_url:${memo_url}\n#+flomo_id:${slug}\n#+updated:${updated_at}`;
        const block = await logseq.Editor.insertBlock(uuid, n_content, { sibling, isPageBlock: false, before: false });
        // add a blank block
        await logseq.Editor.insertBlock(block.uuid, '', { sibling: true, isPageBlock: false, before: false });
        console.log('block', block)
        if (memo.backlinked_count) {
          const backlinkeds = await this.getBacklinkeds(memo.slug)
          console.log('backlinkeds', backlinkeds)
          const rows = this.handleRows(backlinkeds)
          this.insertBlock(block.uuid, rows, false)
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
