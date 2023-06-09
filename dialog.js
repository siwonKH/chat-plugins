const __pluginId__ = 'dialog'
const __version__ = 'v0.14'

window.loopChat = () => {
    customShowDialog()
        .then(async (dialogDiv) => {
            for (;;) {
                const msg = await waitInput(dialogDiv)
                if (!msg) break
                await chat([msg])
            }
        })
    return 'Showing dialog to current document'
}

window.l = window.loopChat

function waitInput(dialogDiv) {
    return new Promise((resolve) => {
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
                resolve(chatInputValue)
            }
        }

        const authorInput = dialogDiv.querySelector('#authorInput')
        authorInput.addEventListener('keydown', handleKeyDownForAuthor)
        function handleKeyDownForAuthor(event) {
            if (event.key === 'Enter') {
                event.preventDefault()
                const authorInputValue = authorInput.value
                if (authorInputValue) {
                    authorInput.removeEventListener('keydown', handleKeyDownForAuthor)
                    author([authorInputValue])
                    authorInput.style.display = 'none'
                    chatInput.focus()
                    console.log('author:', authorInputValue)
                }
            }
        }
    })
}

function customShowDialog() {
    return new Promise((resolve) => {
        const bodyElement = `
            <input type="text" id="chatInput">
            <input type="text" id="authorInput" placeholder="author">
        `
        const dialogDiv = window.__dialogutils.showDialog(`Chat (${__version__})`, bodyElement)
        resolve(dialogDiv)
    })
}

window.__dialog = {
    _unload: () => {
        window.l = undefined
        window.loopChat = undefined
    }
}

console.log(__pluginId__, __version__)
