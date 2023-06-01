const __pluginId__ = 'dialog'
const __version__ = 'v0.5'

window.l = async () => {
    const dialogDiv = await customShowDialog()
    for (;;) {
        const msg = await waitInput(dialogDiv)
        if (!msg) break
        await chat([msg])
    }
}

async function waitInput(dialogDiv) {
    const chatInput = dialogDiv.querySelector('#chatInput')
    chatInput.value = ''
    chatInput.focus()
    chatInput.addEventListener('keydown', handleKeyDown)
    function handleKeyDown(event) {
        if (event.key === 'Enter') {
            event.preventDefault()
            const chatInputValue = chatInput.value
            if (!chatInputValue) {
                window.__dialogutils.closeDialog(dialogDiv)
            }
            chatInput.removeEventListener('keydown', handleKeyDown)
            return chatInputValue
        }
    }
}

async function customShowDialog() {
    const bodyElement = `
            <input type="text" id="chatInput">
        `
    return window.__dialogutils.showDialog('Enter Chat', bodyElement)
}

console.log(__pluginId__, __version__)
