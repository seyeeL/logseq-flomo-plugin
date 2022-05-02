<template>
  <h2>步骤3：同步！</h2>
  <div>
    <a-button type="primary" :loading="progressPercentage > 0" @click="sync">Sync Now</a-button>
  </div>
  <a-progress v-if="progressPercentage > 0" :percent="progressPercentage" />
</template>

<script>
import { defineComponent, ref, toRefs, reactive } from 'vue';
import cheerio from 'cheerio';

import {fetchMemosFromFlomoTag, fetchTagsFromFlomo, getBacklinkedsFromFlomo} from '../utils';

export default defineComponent({
  props: {
    cookie: {
      type: String,
      default: '',
    },
    token: {
      type: String,
      default: '',
    },
    server: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    const syncData = reactive({
      cookie: props.cookie,
      token: props.token,
      server: props.server,
      progressPercentage: ref(0),
      updating: ref(false),
    });
    const dataRef = toRefs(syncData);
    async function sync () {
      console.log('sync start')
      const {cookie, token, server} = syncData;
      const {tags} = await fetchTagsFromFlomo({cookie, token, server});
      if (tags.length > 0) {
        console.log('tags', tags)
        await handleByTags(tags);
        console.log('sync end')
        logseq.App.showMsg('同步成功!', 'success');
        setTimeout(() => {
          syncData.progressPercentage = 0;
        }, 500);
      }
    }
    async function handleByTags(tags) {
      const interval = parseFloat((100 / tags.length).toFixed(2));
      for (let i = 0; i < tags.length; i++) {
        let tagName = tags[i].name
        console.log(`fetch memos of ${tagName} start`);
        // if (tagName.indexOf('/') !== -1) {
        //   continue;
        // }
        const {cookie, token, server} = syncData;
        const {memos} = await fetchMemosFromFlomoTag({tagName, cookie, token, server});
        if (memos?.length > 0) {

          const rows = memos.map((memo) =>({
                ...memo,
                memo_url: `https://flomoapp.com/mine/?memo_id=${memo.slug}`,
              })
          );
          console.log(`fetch memos of ${tagName} end:`, rows);
          await loadPage(tagName, rows)
          syncData.progressPercentage = Number((i + 1) * interval).toFixed(1);
        }
      }
    }

    async function loadPage(tag, memos) {
      console.log(`load page: ${tag}`);
      if (!tag || syncData.updating) return;
      syncData.updating = true;
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
          if (result) {
            await loadPageNotes(pageName, memos, tag)
          }
        }

      } finally {
        syncData.updating = false;
      }
    }
    async function loadPageNotes(pageName, memos, tag) {
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
      await insertBlock(pageUuid, memos, false)
    }
    async function insertBlock(uuid, memos, sibling) {
      for (const item of memos) {
        let { content, memo_url, updated_at, slug, backlinked_count } = item;

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
        if (backlinked_count) {
          console.log('处理反链', item);
          const {cookie, token, server} = syncData;
          const {memo} = await getBacklinkedsFromFlomo({slug, cookie, token, server})
          if (memo?.backlinkeds?.length > 0) {
            const backlinkeds = memo.backlinkeds
            console.log('backlinkeds', backlinkeds)
            const rows = backlinkeds.map((memo) =>({
                  ...memo,
                  memo_url: `https://flomoapp.com/mine/?memo_id=${memo.slug}`,
                })
            );
            await insertBlock(block.uuid, rows, false)
          }
        }
      }
    }
    return {
      sync,
      ...dataRef,
    };
  },

});
</script>
