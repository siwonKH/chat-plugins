const __pluginId__ = 'updater'
const __version__ = 'v2.10'

let plugins
let importedPluginsId
let importedPlugins = []
let pluginHashes = new Map()

let timestamp

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
    if (!window[pluginObj]) {
        return false
    }
    if (window[pluginObj]._unload) {
        window[pluginObj]._unload()
    } else {
        console.log("Adding '_unload' function is recommended. (report this to plugin Dev.)")
    }
    window[pluginObj] = undefined
    return true
}

async function loadPlugin(plugin) {
    try {
        await import(`${plugin.url}?${timestamp}`)
    } catch (e) {
        console.error(e)
        console.log('Error while importing', `'${plugin.id}'`)
        return false
    }
    return true
}

async function pluginHasUpdate(plugin) {
    const cachedHashedCode = await getPluginHash(plugin.url)
    if (!pluginHashes.has(plugin.id)) {
        pluginHashes.set(plugin.id, cachedHashedCode)
    }
    const hashedCode = await getPluginHash(`${plugin.url}?${timestamp}`)
    return pluginHashes.get(plugin.id) !== hashedCode;
}

async function updatePlugin(pluginId) {
    const plugin = getPlugin(pluginId)
    if (!plugin) {
        console.log('No such plugin', `'${pluginId}'`)
        return
    }

    timestamp = Date.now()

    if (await pluginHasUpdate(plugin)) {
        const unloadSuccess = unloadPlugin(plugin)
        if (!unloadSuccess) {
            console.log(`'${pluginId}'`, 'does not support auto update')
            return
        }
        const loadSuccess = await loadPlugin(plugin)
        if (!loadSuccess) {
            console.log(`'${pluginId}'`, 'load failed')
            return
        }
        pluginHashes.set(plugin.id, getPluginHash(`${plugin.url}?${timestamp}`))
        console.log(`'${pluginId}'`, 'updated!')
    }
}

async function updateAllPlugin() {
    refreshPluginList()
    for (const plugin of importedPlugins) {
        await updatePlugin(plugin.id)
    }
    console.log('Everything up-to-date!', `(${__pluginId__} ${__version__})`)
}

window.__updater = {
    _unload: () => {
        window.updatePlugins = undefined
    },
    _version: __version__
}
window.updatePlugins = updateAllPlugin
updateAllPlugin()
