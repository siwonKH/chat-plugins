if (window.__core === undefined)
    throw new Error('Please import core plugin first.')

if (window.__loader === undefined)
    throw new Error('Please import loader plugin first.')

if (window.__dialogutils === undefined)
    throw new Error('Please import "dialogutils" plugin first.')

let dialog = null

window.pgui = () => {
    if (dialog !== null) {
        window.__dialogutils.closeDialog(dialog)
        dialog = null
    }

    const plugins = window.__loader.getPlugins()
    const importedPlugins = window.__loader.getImportedPlugins()
    plugins.forEach(plugin => {
        if (importedPlugins.some(importedPlugin => importedPlugin === plugin.id)) {
            plugin.already = true
        } else plugin.alreay = false
    })

    dialog = window.__dialogutils.showDialog(
        `플러그인 관리 (총: ${plugins.length})`,
        `
      <div style="display: flex; flex-direction: column; gap: 5px; margin-top: 10px;">
        ${plugins.map((v) => `
          <div style="display: flex; gap: 10px; justify-content: space-between;">
            <span>${v.id} - ${v.author}<br/> - ${v.name}</span>
            <button style="color: white; background-color: ${v.already ? '#9c9c9c' : 'black'}; padding: 3px; cursor: pointer;" onclick="loadPlugin('${v.id}')">플러그인 로딩</button>
          </div>
        `).join('')}
      </div>
    `)
}

function loadPlugin (plugin) {
    window.pload([plugin])
    window.__dialogutils.closeDialog(dialog)
    dialog = null
    window.pgui()
}