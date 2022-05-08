<template>
  <h3>STEP 3：同步</h3>
  <p>若 flomo 中的数据量过大，同步将会耗时较长，请耐心等待同步完成。</p>
  <div>
    <a-button type="primary" :loading="syncing" @click="sync">同步</a-button>
  </div>
  <a-progress :percent="progressPercentage" />
</template>

<style>
.item-block {
  margin-bottom: 10px;
}
</style>

<script>
import { defineComponent, ref, toRefs, reactive } from 'vue';
import cheerio from 'cheerio';

import { fetchMemosFromFlomoTag, fetchTagsFromFlomo, getBacklinkedsFromFlomo } from '../utils';

export default defineComponent({
  setup(props) {
    const s = logseq.settings || {};
    const syncData = reactive({
      title: ref(s.title),
      progressPercentage: ref(0),
      updating: ref(false),
      syncing: ref(false),
    });
    const dataRef = toRefs(syncData);
    async function sync() {
      console.log('sync start')
      syncData.syncing = true;
      const { cookie, token, server } = s;
      try {
        const { tags } = await fetchTagsFromFlomo({ cookie, token, server });
        if (tags.length > 0) {
          console.log('tags', tags)
          await handleByTags(tags);
          console.log('sync end')
          logseq.App.showMsg('同步成功', 'success');
          syncData.syncing = false;
        }
      } catch (e) {
        syncData.syncing = false;
        logseq.App.showMsg('连接服务器出错，请检查配置', 'error');
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
        const { cookie, token, server } = s;
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
      const { title } = s;
      console.log(`title ${title}`);
      // const pagePropBlockString = `flomo\nflomo_tag::${pageName}`; // markdown
      const pagePropBlockString = `[[${title}]]\n#+flomo_tag: ${pageName}`; // org
      // const pagePropBlockString = `flomo\n:PROPERTIES:\n:flomo_tag: ${pageName}\n:END:`; // both org md
      let pageBlocksTree = await logseq.Editor.getPageBlocksTree(pageName);
      console.log(`pageBlocksTree ${pageName}`, pageBlocksTree);
      let pagePropBlock
      let pageUuid
      if (pageBlocksTree.length === 0) {
        pagePropBlock = await logseq.Editor.insertBlock(pageName, pagePropBlockString, { isPageBlock: true });
        // pageBlocksTree = await logseq.Editor.getPageBlocksTree(pageName);
        console.log(`pagePropBlock ${pageName}`, pagePropBlock);
        pageUuid = pagePropBlock.uuid
      } else {
        for (let i = 0; i < pageBlocksTree.length; i++) {
          if (pageBlocksTree[i].content.indexOf(`[[${title}]]\n#+flomo_tag: ${pageName}`) !== -1) {
            pageUuid = pageBlocksTree[i].uuid
            break
          }
        }
      }
      if (!pageUuid) {
        pagePropBlock = await logseq.Editor.insertBlock(pageBlocksTree[0].uuid, pagePropBlockString, { isPageBlock: false, sibling: true });
        pageUuid = pagePropBlock.uuid
      }
      await insertBlock(pageUuid, memos, false)
    }
    async function insertBlock(uuid, memos, sibling) {
      const getBlockTree = await logseq.Editor.getBlock(uuid, { includeChildren: true });
      console.log(`insertBlock start: getBlockTree`, getBlockTree);
      let oldTree = getBlockTree?.children
      let before = false
      let n_sibling = sibling
      let n_uuid = uuid
      for (const item of memos) {
        console.log(`memos item`, item);
        let img_block_id
        let oldUuid
        let hasOld = false
        let { content, memo_url, created_at, updated_at, slug, backlinked_count, linked_count, tags, files } = item;
        if (linked_count && tags?.length) continue // 有引用其他标签且带标签，不同步，会展示在被引用的那条标签下
        if (oldTree.length) {
          before = true
          n_uuid = oldTree[0].uuid
          for (let i = 0; i < oldTree.length; i++) {
            if (oldTree[i].content.indexOf(`#+flomo_id: ${slug}`) !== -1) {
              hasOld = true
              console.log(`历史节点已存在uuid  ${oldTree[i].content} `);
              if (oldTree[i].content.indexOf(`#+updated: ${updated_at}`) !== -1) {
                console.log("且时间匹配");
                if (files?.length) {
                  n_sibling = true
                  img_block_id = await handleImgsFromFlomo(files, oldTree[i].uuid)
                }
                if (backlinked_count) {
                  await handleBacklinkedsFromFlomo(slug, img_block_id ? img_block_id : oldTree[i].uuid, n_sibling)
                }
                break
              }
              oldUuid = oldTree[i].uuid //时间不匹配
              break
            }
          }
        }
        if (hasOld && !oldUuid) continue
        if (content.indexOf('<p>') !== -1) {
          content = content.replaceAll('<p>', '').replaceAll('</p>', '\n')
        }
        if (content.indexOf('<strong>') !== -1) {
          content = content.replaceAll('<strong>', '**').replaceAll('</strong>', '**')
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
        const n_content = `${content}\n#+memo_url: ${memo_url}\n#+flomo_id: ${slug}\n#+created: ${created_at}\n#+updated: ${updated_at}`; // org
        // const n_content = `${content}\n:PROPERTIES:\n:memo_url: ${memo_url}\n:flomo_id: ${slug}\n:updated: ${updated_at}\n:END:`; // both org md
        let n_block_id
        if (oldUuid) {
          await logseq.Editor.updateBlock(oldUuid, n_content);
          n_block_id = oldUuid
        } else {
          // console.log('sibling', sibling);
          let n_block = await logseq.Editor.insertBlock(n_uuid, n_content, { sibling, isPageBlock: false, before });
          n_block_id = n_block.uuid
          // add a blank block
          await logseq.Editor.insertBlock(n_block.uuid, '', { sibling: true, isPageBlock: false, before: false });
        }
        console.log('n_block_id', n_block_id)
        if (files?.length) {
          n_sibling = true
          img_block_id = await handleImgsFromFlomo(files, n_block_id)
        }
        if (backlinked_count) {
          await handleBacklinkedsFromFlomo(slug, img_block_id ? img_block_id : n_block_id, n_sibling)
        }
      }
    }
    async function handleImgsFromFlomo(files, n_block_id) {
      let imgContent = ''
      let block_id = n_block_id
      const n_BlockTree = await logseq.Editor.getBlock(n_block_id, { includeChildren: true });
      console.log('n_BlockTree', n_BlockTree)
      for (let i = 0; i < files.length; i++) {
        imgContent = `${imgContent}\n![image](${files[i].url})`
      }
      imgContent = `${imgContent}\n#+isImg: true`
      if (n_BlockTree?.children.length === 0) {
        return await logseq.Editor.insertBlock(block_id, imgContent, { sibling: false, isPageBlock: false, before: false });
      } else if (n_BlockTree?.children?.[0].content.indexOf(`#+isImg: true`) !== -1) {
        await logseq.Editor.updateBlock(n_BlockTree.children[0].uuid, imgContent);
        return n_BlockTree.children[0].uuid
      } else {
        block_id = n_BlockTree.children[0].uuid
        return await logseq.Editor.insertBlock(block_id, imgContent, { sibling: true, isPageBlock: false, before: true });
      }
    }
    async function handleBacklinkedsFromFlomo(slug, n_block_id, sibling) {
      console.log('handleBacklinkedsFromFlomo');
      const { cookie, token, server } = s;
      const { memo } = await getBacklinkedsFromFlomo({ slug, cookie, token, server })
      if (memo?.backlinkeds?.length > 0) {
        const backlinkeds = memo.backlinkeds
        console.log('backlinkeds', backlinkeds)
        const rows = backlinkeds.map((memo) => ({
          ...memo,
          memo_url: `https://flomoapp.com/mine/?memo_id=${memo.slug}`,
        })
        );
        await insertBlock(n_block_id, rows, sibling)
      }
    }
    return {
      sync,
      ...dataRef,
    };
  },
});
</script>
