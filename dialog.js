window.l = async () => {
    for (;;) {
        const msg = await customShowDialog()
        if (!msg) break
        await chat([msg])
    }
}

function customShowDialog() {
    return new Promise((resolve) => {
        const bodyElement = `
            <input type="text" id="chatInput">
        `
        const dialogDiv = window.__dialogutils.showDialog('Enter Chat', bodyElement)

        const chatInput = dialogDiv.querySelector('#chatInput')
        chatInput.focus()
        chatInput.addEventListener('keydown', handleKeyDown)
        function handleKeyDown(event) {
            if (event.key === 'Enter') {
                event.preventDefault()
                document.body.removeChild(dialogDiv)
                chatInput.removeEventListener('keydown', handleKeyDown)
                resolve(chatInput.value)
            }
        }
    })
}
