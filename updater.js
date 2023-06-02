const __pluginId__ = 'updater'
const __version__ = 'v2.23t1'

let plugins
let importedPluginsId
let importedPlugins = []
let pluginHashes = new Map()

let timestamp
let intervalId

const logStyle = [
    `%c${__pluginId__} ${__version__}`, `
  display: inline-block;
  background-color: #221A03;
  color: #FEFEFE;
  font-weight: bold;
  padding: 0px 3px;
  border-radius: 3px;`
]

function log(message) {
    console.log(...logStyle, message)
}

function getPlugin(pluginId) {
    return plugins.find((p) => p.id === pluginId)
}

function refreshPluginList() {
    plugins = window.__loader.getPlugins()
    importedPluginsId = window.__loader.getImportedPlugins()
    importedPlugins = []
    for (const importedPluginId of importedPluginsId) {
        importedPlugins.push(getPlugin(importedPluginId))
    }
    importedPlugins.push(importedPlugins.splice(importedPlugins.indexOf(getPlugin(__pluginId__)), 1)[0]);
}

async function sha1(message) {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
}

async function getPluginHash(url) {
    const res = await fetch(url)
    const code = await res.text()
    return await sha1(code)
}

function unloadPlugin(plugin) {
    const pluginObj = '__' + plugin.id
    if (window[pluginObj]) {
        if (window[pluginObj]._unload) {
            window[pluginObj]._unload()
            window[pluginObj] = undefined
            return true
        }
    }
    return false
}

async function loadPlugin(plugin) {
    try {
        await import(`${plugin.url}?${timestamp}`)
    } catch (e) {
        console.error(e)
        return false
    }
    return true
}

async function pluginHasUpdate(plugin) {
    if (!pluginHashes.has(plugin.id)) {
        const cachedHashedCode = await getPluginHash(plugin.url)
        pluginHashes.set(plugin.id, cachedHashedCode)
    }
    const hashedCode = await getPluginHash(`${plugin.url}?${timestamp}`)
    return pluginHashes.get(plugin.id) !== hashedCode;
}

async function updatePlugin(plugin) {
    timestamp = Date.now()

    if (await pluginHasUpdate(plugin)) {
        pluginHashes.set(plugin.id, await getPluginHash(`${plugin.url}?${timestamp}`))

        const unloadSuccess = unloadPlugin(plugin)
        if (!unloadSuccess) {
            log(`'${plugin.id}'` + " has a update. but doesn't support auto update")
            return
        }
        const loadSuccess = await loadPlugin(plugin)
        if (!loadSuccess) {
            log(`'${plugin.id}'` + ' load failed')
            return
        }
        log(`'${plugin.id}'` + ' updated!')
    }
}

async function updateAllPlugin() {
    refreshPluginList()
    for (const plugin of importedPlugins) {
        await updatePlugin(plugin)
    }
}

function enableAutoUpdate() {
    intervalId = setInterval(updateAllPlugin, 20000)
}

function disableAutoUpdate() {
    clearInterval(intervalId)
    intervalId = undefined
}

function toggleAutoUpdate() {
    if (intervalId) {
        enableAutoUpdate()
        log('Auto update ON')
    }
    else {
        disableAutoUpdate()
        log('Auto update OFF')
    }
}

async function init() {
    await updateAllPlugin()
    enableAutoUpdate()
}
setTimeout(async () => {
    log('loaded')
    await init()
}, 500)

window.__updater = {
    _unload: () => {
        disableAutoUpdate()
        window.updatePlugins = undefined
    },
    _version: __version__
}

window.updatePlugins = () => {
    return new Promise(async (resolve) => {
        resolve()
        await updateAllPlugin()
        log('Everything up-to-date!')
    })
}

window.toggleAutoUpdate = toggleAutoUpdate
