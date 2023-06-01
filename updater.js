const __pluginId__ = 'updater'
const __version__ = 'v2.6t2'

let plugins
let importedPluginsId
let importedPlugins = []
let pluginHashes = new Map()

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
    if (!window[pluginObj]._unload) {
        return false
    }
    window[pluginObj]._unload()
    window[pluginObj] = undefined
    return true
}

async function loadPlugin(plugin) {
    const timestamp = Date.now();
    try {
        await import(`${plugin.url}?${timestamp}`)
    } catch (e) {
        console.error(e)
        return false
    }
    return true
}

async function pluginHasUpdate(plugin) {
    const cachedHashedCode = await getPluginHash(plugin.url)
    if (!pluginHashes.has(plugin.id)) {
        pluginHashes.set(plugin.id, cachedHashedCode)
    }
    const timestamp = Date.now()
    const hashedCode = await getPluginHash(`${plugin.url}?${timestamp}`)
    if (pluginHashes.get(plugin.id) !== hashedCode) {
        pluginHashes.set(plugin.id, hashedCode)
        return true
    }
    return false
}

async function updatePlugin(pluginId) {
    const plugin = getPlugin(pluginId)
    if (!plugin) {
        console.log('No such plugin.')
        return
    }

    if (await pluginHasUpdate(plugin)) {
        const unloadSuccess = unloadPlugin(plugin)
        if (!unloadSuccess) {
            console.log(pluginId, 'does not support auto update')
            return
        }
        const loadSuccess = await loadPlugin(plugin)
        if (!loadSuccess) {
            console.log(pluginId, 'load failed')
            return
        }
        console.log(pluginId, 'updated!')
    }
}

async function updateAllPlugin() {
    refreshPluginList()
    for (const plugin of importedPlugins) {
        await updatePlugin(plugin.id)
    }
    console.log('Everything up-to-date!', `(${__pluginId__} ${__version__})`)
}

function _unload() {
    window.updatePlugins = undefined
}

updateAllPlugin()
window.__updater = { _unload }
window.updatePlugins = updateAllPlugin

console.log(__pluginId__, __version__)
