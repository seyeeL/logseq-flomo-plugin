<template>
  <h2 style="float:left;margin-right:70px">STEP 3：保存设置并同步</h2>
  <div>
    <a-button type="primary" :loading="progressPercentage > 0" @click="sync">Save and Sync</a-button>
  </div>

  <a-progress v-if="progressPercentage > 0" :percent="progressPercentage" />
</template>

<script>
import { defineComponent, ref, toRefs, reactive } from 'vue';
import cheerio from 'cheerio';

import { fetchMemosFromFlomoTag, fetchTagsFromFlomo, getBacklinkedsFromFlomo } from '../utils';

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
    async function sync() {
      console.log('sync start')
      const { cookie, token, server } = syncData;
      const { tags } = await fetchTagsFromFlomo({ cookie, token, server });
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
        if (tagName.indexOf('/') !== -1) {
          continue;
        }
        // 调试用
        // if (i > 0) {
        //   return
        // }
        const { cookie, token, server } = syncData;
        const { memos } = await fetchMemosFromFlomoTag({ tagName, cookie, token, server });
        if (memos?.length > 0) {
          const rows = memos.map((memo) => ({
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
        let puuid
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
          puuid = result.uuid
        } else {
          puuid = page.uuid
        }
        console.log('uuid', puuid)
        loadPageNotes(pageName, memos, puuid)
      } finally {
        syncData.updating = false;
      }
    }
    async function loadPageNotes(pageName, memos) {
      if (!pageName || !memos) return;
      // const pagePropBlockString = `flomo\nflomo_tag::${pageName}`; // markdown 
      const pagePropBlockString = `[[flomo]]\n#+flomo_tag: ${pageName}`; // org
      // const pagePropBlockString = `flomo\n:PROPERTIES:\n:flomo_tag: ${pageName}\n:END:`; // both org md 
      let pageBlocksTree = await logseq.Editor.getPageBlocksTree(pageName);
      console.log("pageBlocksTree", pageBlocksTree);
      let pagePropBlock
      let pageUuid
      if (pageBlocksTree.length === 0) {
        pagePropBlock = await logseq.Editor.insertBlock(pageName, pagePropBlockString, { isPageBlock: true });
        // pageBlocksTree = await logseq.Editor.getPageBlocksTree(pageName);
        console.log("pagePropBlock", pagePropBlock);
        pageUuid = pagePropBlock.uuid
      } else {
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
      const getBlockTree = await logseq.Editor.getBlock(uuid, { includeChildren: true });
      console.log("getBlockTree", getBlockTree);
      let oldTree = getBlockTree?.children
      for (const item of memos) {
        let oldUuid
        let { content, memo_url, updated_at, slug, backlinked_count, linked_count, tags } = item;
        console.log("updated_at", updated_at, slug);
        if (linked_count && tags?.length) continue // 有引用其他标签且带标签，不同步，会展示在被引用的那条标签下
        if (oldTree.length) {
          for (let i = 0; i < oldTree.length; i++) {
            if (oldTree[i].content.indexOf(`#+flomo_id: ${slug}`) !== -1) {
              console.log("历史节点已存在uuid");
              if (oldTree[i].content.indexOf(`#+updated: ${updated_at}`) !== -1) {
                console.log("且时间匹配");
                break
              }
              oldUuid = oldTree[i].uuid //时间不匹配
            }
          }
          if (!oldUuid) continue
          console.log("continue", oldUuid);
        }
        if (content.indexOf('<p>') !== -1) {
          content = content.replaceAll('<p>', '').replaceAll('</p>', '\n')
          console.log('remove P', content)
        }
        let $ = cheerio.load(content);
        if (content.indexOf('<ol>') !== -1) {
          $('ol').each(function (i, el) {
            // this === el
            $(this).children().each(function (j, ele) {
              let str = `${j + 1}. ${$(this).text()}\n`
              console.log('str', str)
              $(this).html(str)
            })
          })
        }
        if (content.indexOf('<ul>') !== -1) {
          $('ul').each(function (i, el) {
            // this === el
            $(this).children().each(function (j, ele) {
              let str = `* ${$(this).text()}\n`
              console.log('str', str)
              $(this).html(str)
            })
          })
        }
        content = $.text()
        console.log('content', content)
        content = content.replace(/\n$/, '')
        // const n_content = `${content}\nmemo_url:: ${memo_url}\nflomo_id:: ${slug}\nupdated:: ${updated_at}`;  // md
        const n_content = `${content}\n#+memo_url: ${memo_url}\n#+flomo_id: ${slug}\n#+updated: ${updated_at}`; // org
        // const n_content = `${content}\n:PROPERTIES:\n:memo_url: ${memo_url}\n:flomo_id: ${slug}\n:updated: ${updated_at}\n:END:`; // both org md 
        let n_block_id
        if (oldUuid) {
          await logseq.Editor.updateBlock(oldUuid, n_content);
          n_block_id = oldUuid
        } else {
          let n_block = await logseq.Editor.insertBlock(uuid, n_content, { sibling, isPageBlock: false, before: false });
          n_block_id = n_block.uuid
          // add a blank block
          await logseq.Editor.insertBlock(n_block.uuid, '', { sibling: true, isPageBlock: false, before: false });
        }
        console.log('n_block_id', n_block_id)
        if (backlinked_count) {
          console.log('处理反链', item);
          const { cookie, token, server } = syncData;
          const { memo } = await getBacklinkedsFromFlomo({ slug, cookie, token, server })
          if (memo?.backlinkeds?.length > 0) {
            const backlinkeds = memo.backlinkeds
            console.log('backlinkeds', backlinkeds)
            const rows = backlinkeds.map((memo) => ({
              ...memo,
              memo_url: `https://flomoapp.com/mine/?memo_id=${memo.slug}`,
            })
            );
            await insertBlock(n_block_id, rows, false)
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
