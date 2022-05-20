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
import dayjs from 'dayjs';
import isBetween from "dayjs/plugin/isBetween"; // import relativeTime plugin
dayjs.extend(isBetween); //  use
import { fetchMemosByDate, fetchMemosByTag, fetchAllTags, getBacklinkedMemos, loadStatFromFlomo, fetchMemosByOffset } from '../utils';

export default defineComponent({
  props: {
    syncRange: {
      type: Array,
    },
  },
  setup (props) {
    const s = logseq.settings || {};
    const syncData = reactive({
      title: ref(s.title),
      progressPercentage: ref(0),
      updating: ref(false),
      syncing: ref(false),
    });
    const dataRef = toRefs(syncData);
    async function sync () {
      console.log('sync start')
      syncData.syncing = true;
      const { cookie, token, server, syncMode } = s;
      console.log('同步模式=>', syncMode)
      const [start, end] = props.syncRange
      const start_date = dayjs(start).format('YYYY-MM-DD');
      const end_date = dayjs(end).format('YYYY-MM-DD');
      console.log('DateFormat=>', start_date, end_date)
      try {
        switch (syncMode) {
          case '1': // 标签模式
            const { tags } = await fetchAllTags({ cookie, token, server });
            if (tags.length > 0) {
              console.log('tags', tags)
              await handleByTags(tags);
              console.log('sync end')
              logseq.App.showMsg('同步成功', 'success');
              syncData.progressPercentage = 100;
              syncData.syncing = false;
            }
            break;

          case '2': // 日记模式
            const groupDate = await dealDate(start_date, end_date)
            const interval = parseFloat((100 / groupDate.length).toFixed(2));
            console.log('groupDate', groupDate)
            for (let i = 0; i < groupDate.length; i++) {
              let date = groupDate[i]
              const { memos } = await fetchMemosByDate({ cookie, token, server, start_date: date, end_date: date })
              console.log(`${date} 的 memos`, memos)
              if (memos.length > 0) {
                console.log('memos', memos)
                await handleByDate(date, memos);
                syncData.progressPercentage = Number((i + 1) * interval).toFixed(1);
              }
            }
            console.log('sync end')
            logseq.App.showMsg('同步成功', 'success');
            logseq.updateSettings({ syncRange: [start_date, end_date] });
            syncData.progressPercentage = 100;
            syncData.syncing = false;
            break;

          case '3': // 单页模式
            const { code, stat, message } = await loadStatFromFlomo(s);
            if (code === 0) {
              const memo_count = stat.memo_count
              console.log('memo_count', memo_count)
              // queryTimes 要加 1 的原因是 flomo 获取 memo_count 的接口不及时，因此多请求一次确保数据加载全
              const queryTimes = Math.ceil(memo_count / 50) + 1;
              const interval = parseFloat((95 / queryTimes).toFixed(2));
              let rows = [];
              for (let i = 0; i < queryTimes; i++) {
                // 调试用
                // if (i > 1) {
                //   break
                // }
                let offset = 50 * i
                const { memos } = await fetchMemosByOffset({ cookie, token, server, offset })
                if (memos?.length > 0) {
                  memos.forEach((memo) =>
                    rows.push({
                      ...memo,
                      memo_url: `https://flomoapp.com/mine/?memo_id=${memo.slug}`,
                    })
                  );
                }
                syncData.progressPercentage = Number((i + 1) * interval).toFixed(1);
              }
              console.log("flomo fetch success:", rows);
              await loadPage(s.title, rows)
              syncData.progressPercentage = 100;
              syncData.syncing = false;
            } else {
              logseq.App.showMsg(`${message}，请检查配置`, 'error');
            }
            break;

          default:
            break;
        }
      } catch (e) {
        console.log('catch e', e)
        syncData.syncing = false;
        logseq.App.showMsg('连接服务器出错，请检查配置', 'error');
      }
    }
    function dealDate (start_date, end_date) {
      let groupDate = [];
      let n_start_date = dayjs(start_date).subtract(1, 'day');
      let n_end_date = dayjs(end_date).add(1, 'day');
      for (let start = dayjs(start_date, 'YYYY-MM-DD'); dayjs(start).isBetween(n_start_date, n_end_date); start = start.add(1, 'day')) {
        groupDate.push(dayjs(start).format("YYYY-MM-DD"));
      }
      return groupDate
    }
    async function handleByDate (date, memos) {
      const userConfigs = await logseq.App.getUserConfigs()
      const preferredDateFormat = userConfigs.preferredDateFormat || ''
      console.log('preferredDateFormat=>', preferredDateFormat)
      let formatDate = date
      if (preferredDateFormat) {
        const format = preferredDateFormat
          .replace('yyyy', 'YYYY')
          .replace('dd', 'DD')
          .replace('do', 'Do')
          .replace('EEEE', 'dddd')
          .replace('EEE', 'ddd')
          .replace('EE', 'dd')
          .replace('E', 'dd')
        formatDate = dayjs(date, 'YYYY-MM-DD').format(format)
      }
      console.log('formatDate', formatDate)
      await loadPage(formatDate, memos)
    }
    async function handleByTags (tags) {
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
        const { memos } = await fetchMemosByTag({ tagName, cookie, token, server });
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
    async function loadPage (pageIdentity, memos) {
      console.log(`load page: ${pageIdentity}`);
      const syncMode = s.syncMode;
      if (!pageIdentity || syncData.updating) return;
      syncData.updating = true;
      try {
        let page = await logseq.Editor.getPage(pageIdentity);
        console.log('page', page)
        let puuid
        if (!page) {
          const result = await logseq.Editor.createPage(
            pageIdentity,
            {},
            {
              createFirstBlock: true,
              redirect: false,
              journal: syncMode === '2',
              format: "markdown"
            }
          );
          console.log('createPage', result)
          puuid = result.uuid
        } else {
          puuid = page.uuid
        }
        console.log('uuid', puuid)
        await loadPageNotes(pageIdentity, memos, puuid)
      } finally {
        syncData.updating = false;
      }
    }
    async function loadPageNotes (pageName, memos) {
      if (!pageName || !memos) return;
      const { title } = s;
      console.log(`flomo根节点 ${title}`);
      const syncMode = s.syncMode;
      // const pagePropBlockString = `flomo\nflomo_tag::${pageName}`; // markdown
      const pagePropBlockString = syncMode === '3' ? '' : `[[${title}]]\n#+flomo_tag: ${pageName}`; // org
      // const pagePropBlockString = `flomo\n:PROPERTIES:\n:flomo_tag: ${pageName}\n:END:`; // both org md
      let pageBlocksTree = await logseq.Editor.getPageBlocksTree(pageName);
      console.log(`pageBlocksTree ${pageName}`, pageBlocksTree);
      let pagePropBlock
      let uuid
      // 页面完全为空
      if (pageBlocksTree.length === 0) {
        const firstBlock = await logseq.Editor.insertBlock(pageName, pagePropBlockString, { isPageBlock: true, format: "markdown" });
        console.log(`createFirstBlock ${pageName}`, firstBlock);
        uuid = firstBlock.uuid
      } else if (syncMode === '3') {
        uuid = pageBlocksTree[0].uuid
        await insertBlock(uuid, memos, undefined, pageBlocksTree)
        return
      } else {
        //页面不为空匹配 flomo 一级节点
        for (let i = 0; i < pageBlocksTree.length; i++) {
          if (pageBlocksTree[i].content.indexOf(`[[${title}]]\n#+flomo_tag: ${pageName}`) !== -1) {
            uuid = pageBlocksTree[i].uuid
            break
          }
        }
      }
      // 没匹配到一级节点
      if (!uuid) {
        pagePropBlock = await logseq.Editor.insertBlock(pageBlocksTree[0].uuid, pagePropBlockString, { isPageBlock: false, sibling: true });
        uuid = pagePropBlock.uuid
      }
      await insertBlock(uuid, memos)
    }
    async function insertBlock (uuid, memos, has_img_memo_id, pageBlocksTree) {
      const { exportMode,addTime } = s;
      console.log('导出=>', exportMode,addTime)
      // has_img_memo_id 表示有图片节点的正文节点，一般处理批注节点的时候会传
      const treeId = has_img_memo_id || uuid
      console.log(`insertBlock start: treeId`, treeId);
      let childrenTree
      if (pageBlocksTree) {
        childrenTree = pageBlocksTree
      } else {
        const getBlockTree = await logseq.Editor.getBlock(treeId, { includeChildren: true });
        childrenTree = getBlockTree?.children
      }
      console.log(`childrenTree`, childrenTree);
      let n_uuid = uuid
      for (let j = 0; j < memos.length; j++) {
        const item = memos[j]
        console.log(`memo item`, item);
        let img_block_id
        let oldUuid
        let hasOld = false
        let { content, memo_url, created_at, updated_at, slug, backlinked_count, linked_count, tags, files } = item;
        if (linked_count) continue // 有引用，不同步，会展示在被引用的那条memo下
        if (!exportMode && childrenTree?.length) {
          n_uuid = childrenTree[0].uuid
          for (let i = 0; i < childrenTree.length; i++) {
            if (childrenTree[i].content.indexOf(`#+flomo_id: ${slug}`) !== -1) {
              hasOld = true
              console.log(`历史节点已存在uuid  ${childrenTree[i].content} `);
              if (childrenTree[i].content.indexOf(`#+updated: ${updated_at}`) !== -1) {
                console.log("且时间匹配");
                if (files?.length) {
                  img_block_id = await handleImages(files, childrenTree[i].uuid)
                }
                if (backlinked_count) {
                  await handleBacklinkeds(slug, img_block_id || childrenTree[i].uuid, img_block_id ? childrenTree[i].uuid : false)
                }
                break
              }
              oldUuid = childrenTree[i].uuid //时间不匹配
              break
            }
          }
        }

        if (hasOld && !oldUuid) continue
        if (content) {
          if (content.indexOf('<p>') !== -1) {
            content = content.replaceAll('<p>', '').replaceAll('</p>', '\n')
          }
          if (content.indexOf('<strong>') !== -1) {
            content = content.replaceAll('<strong>', '*').replaceAll('</strong>', '*')
          }
          let $ = cheerio.load(content);
          if (content.indexOf('<ol>') !== -1) {
            $('ol').each(function (i, el) {
              $(this).children().each(function (j, ele) {
                let str = `${j + 1}. ${$(this).text()}\n`
                console.log('str', str)
                $(this).html(str)
              })
            })
          }
          if (content.indexOf('<ul>') !== -1) {
            $('ul').each(function (i, el) {
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
        } else {
          content = ''
        }
        content = addTime?`${created_at.slice(11,16)} ${content}`:content
        // const n_content = `${content}\nmemo_url:: ${memo_url}\nflomo_id:: ${slug}\nupdated:: ${updated_at}`;  // md
        const n_content = exportMode ? content : `${content}\n#+memo_url: ${memo_url}\n#+flomo_id: ${slug}\n#+created: ${created_at}\n#+updated: ${updated_at}`; // org
        // const n_content = `${content}\n:PROPERTIES:\n:memo_url: ${memo_url}\n:flomo_id: ${slug}\n:updated: ${updated_at}\n:END:`; // both org md
        let n_block_id
        if (!exportMode && oldUuid) {
          console.log('oldUuid', oldUuid)
          await logseq.Editor.updateBlock(oldUuid, n_content);
          n_block_id = oldUuid
        } else {
          const before = pageBlocksTree || (childrenTree?.length !== 0 && !has_img_memo_id)
          console.log('before', before, childrenTree?.length, has_img_memo_id);
          const sibling = has_img_memo_id || pageBlocksTree ? true : false
          let n_block = await logseq.Editor.insertBlock(n_uuid, n_content, { sibling, isPageBlock: false, before });
          n_block_id = n_block.uuid
          // add a blank block
          await logseq.Editor.insertBlock(n_block_id, '', { sibling: true, isPageBlock: false, before: false });
        }
        console.log('n_block_id', n_block_id)
        if (files?.length) {
          img_block_id = await handleImages(files, n_block_id)
        }
        if (backlinked_count) {
          await handleBacklinkeds(slug, img_block_id || n_block_id, img_block_id ? n_block_id : false)
        }
      }
    }
    async function handleImages (files, n_block_id) {
      const { exportMode } = s;
      console.log('导出=>', exportMode)
      let imgContent = ''
      let block_id = n_block_id
      const n_BlockTree = await logseq.Editor.getBlock(n_block_id, { includeChildren: true });
      console.log('n_BlockTree', n_BlockTree)
      for (let i = 0; i < files.length; i++) {
        imgContent = `${imgContent}\n![image](${files[i].url})`
      }
      imgContent = exportMode ? `${imgContent}` : `${imgContent}\n#+isImg: true`
      if (n_BlockTree?.children.length === 0) {
        const res = await logseq.Editor.insertBlock(block_id, imgContent, { sibling: false, isPageBlock: false, before: false });
        console.log('res1', res)
        return res.uuid
      } else if (!exportMode && n_BlockTree?.children?.[0].content.indexOf(`#+isImg: true`) !== -1) {
        await logseq.Editor.updateBlock(n_BlockTree.children[0].uuid, imgContent);
        return n_BlockTree.children[0].uuid
      } else {
        block_id = n_BlockTree.children[0].uuid
        const res = await logseq.Editor.insertBlock(block_id, imgContent, { sibling: true, isPageBlock: false, before: true });
        console.log('res2', res)
        return res.uuid
      }
    }
    async function handleBacklinkeds (slug, n_block_id, has_img_memo_id) {
      console.log('handleBacklinkeds', slug, n_block_id, has_img_memo_id);
      const { cookie, token, server } = s;
      const { memo } = await getBacklinkedMemos({ slug, cookie, token, server })
      if (memo?.backlinkeds?.length > 0) {
        const backlinkeds = memo.backlinkeds
        console.log('backlinkeds', backlinkeds)
        const rows = backlinkeds.map((memo) => ({
          ...memo,
          memo_url: `https://flomoapp.com/mine/?memo_id=${memo.slug}`,
        })
        );
        await insertBlock(n_block_id, rows, has_img_memo_id)
      }
    }
    return {
      sync,
      ...dataRef,
    };
  },
});
</script>
