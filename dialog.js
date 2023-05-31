const __pluginId__ = 'dialog'
const __dialogVersion__ = 'v0.2'

window.l = async () => {
    const dialogDiv = await customShowDialog()
    for (;;) {
        const msg = await waitInput(dialogDiv)
        if (!msg) break
        await chat([msg])
    }
}

function waitInput(dialogDiv) {
    return new Promise((resolve) => {
        const chatInput = dialogDiv.querySelector('#chatInput')
        chatInput.focus()
        chatInput.addEventListener('keydown', handleKeyDown)
        function handleKeyDown(event) {
            if (event.key === 'Enter') {
                event.preventDefault()
                const chatInputValue = chatInput.value
                chatInput.value = ''
                if (!chatInputValue) {
                    chatInput.removeEventListener('keydown', handleKeyDown)
                    window.__dialogutils.closeDialog(dialogDiv)
                }
                resolve(chatInputValue)
            }
        }
    })
}

function customShowDialog() {
    return new Promise((resolve) => {
        const bodyElement = `
            <input type="text" id="chatInput">
        `
        const dialogDiv = window.__dialogutils.showDialog('Enter Chat', bodyElement)
        resolve(dialogDiv)
    })
}

console.log(__pluginId__, __dialogVersion__)
