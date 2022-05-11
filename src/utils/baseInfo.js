const DEFAULT_SETTINGS = {
  userId: 0,
  cookie: '',
  token: '',
  syncMode: '1',
  exportMode: false,
  maxCount: 0,
  title: "flomo",
  server: "http://localhost:3228"
};

export const getInitalSettings = () => {
  return {
    ...DEFAULT_SETTINGS,
  }
}

export const initializeSettings = () => {
  const settings = logseq.settings
  // settings未初始化时手动初始化
  if (!settings?.initialized) {
    const _settings = getInitalSettings()
    logseq.updateSettings({ ..._settings, initialized: true })
    console.log('[faiz:] === initialize settings success', logseq.settings)
  }
}
