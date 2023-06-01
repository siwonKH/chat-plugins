const __pluginId__ = 'updater'
const __version__ = 'v1.1'

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
    return true
}

async function loadPlugin(plugin) {
    const timestamp = Date.now();
    const hashedCode = await getPluginHash(plugin.url)

    if (!pluginHashes.has(plugin.id)) {
        pluginHashes.set(plugin.id, hashedCode)
        return
    }

    if (pluginHashes.get(plugin.id) !== hashedCode) {
        await import(`${plugin.url}?${timestamp}`)
        pluginHashes.set(plugin.id, hashedCode)
    }
}

function updatePlugin(pluginId) {
    return new Promise(async (resolve) => {
        const plugin = getPlugin(pluginId)
        if (!plugin) {
            console.log('No such plugin.')
            resolve(false)
        }

        const unloadSuccess = unloadPlugin(plugin)
        if (!unloadSuccess) {
            console.log(pluginId, 'does not support auto update')
            resolve(false)
        }

        await loadPlugin(plugin)
        console.log(pluginId, 'updated!')
        resolve(true)
    })
}

function updateAllPlugin() {
    return new Promise(async (resolve) => {
        refreshPluginList()

        for (const plugin of importedPlugins) {
            await updatePlugin(plugin.id)
        }

        resolve('Everything up-to-date!')
    })
}

function _unload() {
    window.updatePlugins = undefined
}

window.__updater = { _unload }

window.updatePlugins = updateAllPlugin

console.log(__pluginId__, __version__)
