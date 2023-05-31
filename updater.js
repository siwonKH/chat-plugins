const __pluginId__ = 'updater'
const __version__ = 'v0.4t1'

let plugins
let importedPluginsId
let importedPlugins

let pluginHashes = new Map()

function init() {
    refreshPluginList()

    importedPlugins.forEach(async (plugin) => {
        const hashedCode = await getPluginHash(plugin.url)
        pluginHashes.set(plugin.id, hashedCode)
    })
}

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

async function getPluginHash(url) {
    const res = await fetch(url)
    const code = await res.text()
    return await sha1(code)
}

function updateAllPlugin() {
    return new Promise((resolve) => {
        refreshPluginList()

        const timestamp = new Date().getTime();

        // for (const importedPlugin of importedPlugins) {
        //     const hashedCode = await getPluginHash(plugin.url)
        //
        //     if (pluginHashes.get(plugin.id) !== hashedCode) {
        //         await import(`${plugin.url}?${timestamp}`)
        //         console.log('updated', plugin.id)
        //         pluginHashes.set(plugin.id, hashedCode)
        //     }
        // }

        importedPlugins.forEach(async (plugin) => {
            const hashedCode = await getPluginHash(plugin.url)
            if (pluginHashes.get(plugin.id) !== hashedCode) {
                await import(`${plugin.url}?${timestamp}`)
                console.log('updated', plugin.id)
                pluginHashes.set(plugin.id, hashedCode)
            }
        })

        resolve('Everything up-to-date!')
    })
}

init()

window.updatePlugins = updateAllPlugin

console.log(__pluginId__, __version__)
