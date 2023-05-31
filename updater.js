const plugins = window.__loader.getPlugins()
const importedPluginsId = window.__loader.getImportedPlugins()

const importedPlugins = plugins.filter((p) => importedPluginsId.includes(p.id))

async function sha1(message) {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
}

function updateAllPlugin() {
    importedPlugins.forEach(async (plugin) => {
        const res = await fetch(plugin.url)
        const hashedCode = await sha1(res.text())
        console.log(plugin.url, hashedCode)
    })
}

window.updatePlugins = updateAllPlugin
