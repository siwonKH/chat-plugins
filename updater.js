const __pluginId__ = 'updater'
const __version__ = 'v0.1'

let plugins
let importedPluginsId
let importedPlugins

let pluginHashes = []

function refreshPluginList() {
    plugins = window.__loader.getPlugins()
    importedPluginsId = window.__loader.getImportedPlugins()

    importedPlugins = plugins.filter((p) => importedPluginsId.includes(p.id))
}

async function sha1(message) {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
}

async function checkPluginHash(url) {
    const res = await fetch(url)
    const code = await res.text()
    return await sha1(code)
}

function updateAllPlugin() {
    importedPlugins.forEach(async (plugin) => {
        const hashedCode = await checkPluginHash(plugin.url)
        pluginHashes.push({id: plugin.id, hash: hashedCode})
    })
    console.log(pluginHashes)

    refreshPluginList()
}

refreshPluginList()
window.updatePlugins = updateAllPlugin

console.log(__pluginId__, __version__)
