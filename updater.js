const __pluginId__ = 'updater'
const __version__ = 'v2.1'

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
    try {
        await import(`${plugin.url}?${timestamp}`)
    } catch (e) {
        console.error(e)
        return false
    }
    return true
}

function pluginHasUpdate(plugin) {
    return new Promise(async (resolve) => {
        const hashedCode = await getPluginHash(plugin.url)
        if (!pluginHashes.has(plugin.id)) {
            pluginHashes.set(plugin.id, hashedCode)
            resolve(false)
            return
        }
        if (pluginHashes.get(plugin.id) === hashedCode) {
            resolve(false)
            return
        }
        pluginHashes.set(plugin.id, hashedCode)
        resolve(true)
    })
}

function updatePlugin(pluginId) {
    return new Promise(async (resolve) => {
        const plugin = getPlugin(pluginId)
        if (!plugin) {
            console.log('No such plugin.')
            resolve()
            return
        }

        if (await pluginHasUpdate(plugin)) {
            const unloadSuccess = unloadPlugin(plugin)
            if (!unloadSuccess) {
                console.log(pluginId, 'does not support auto update')
                resolve()
                return
            }
            const loadSuccess = await loadPlugin(plugin)
            if (!loadSuccess) {
                console.log(pluginId, 'load failed')
                resolve()
                return
            }
            console.log(pluginId, 'updated!')
        }
        resolve()
    })
}

async function updateAllPlugin() {
    refreshPluginList()

    for (const plugin of importedPlugins) {
        await updatePlugin(plugin.id)
    }

    return 'Everything up-to-date!'
}

function _unload() {
    window.updatePlugins = undefined
}

window.__updater = { _unload }

window.updatePlugins = updateAllPlugin

console.log(__pluginId__, __version__)
