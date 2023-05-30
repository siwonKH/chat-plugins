let dialogX = 50
let dialogY = 50

window.l = async () => {
    for (;;) {
        const chat = await showDialog()
        if (!chat) break
        await c([chat])
    }
}

function showDialog() {
    return new Promise((resolve) => {
        const dialogDiv = document.createElement('div')
        dialogDiv.innerHTML = `
      <div class="draggable">
        <div class="dialog-header" title="Drag to move">Enter Chat</div>
        <input type="text" id="chatInput">
      </div>
    `
        const chatInput = dialogDiv.querySelector('#chatInput')

        Object.assign(dialogDiv.style, {
            position: 'absolute',
            top: `${dialogY}px`,
            left: `${dialogX}px`,
            backgroundColor: '#f9f9f9',
            border: '1px solid #ccc',
            padding: '10px',
            zIndex: '9999',
            boxShadow: '10px 10px 20px rgba(50, 50, 50, .2)'
        })

        const dialogHeader = dialogDiv.querySelector('.dialog-header')
        Object.assign(dialogHeader.style, {
            cursor: 'move'
        })

        document.body.appendChild(dialogDiv)
        makeDraggable(dialogDiv, dialogHeader)
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

function makeDraggable(element, handle) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0
    handle.addEventListener('mousedown', dragMouseDown)

    function dragMouseDown(e) {
        e = e || window.event
        e.preventDefault()
        pos3 = e.clientX
        pos4 = e.clientY
        document.onmouseup = closeDragElement
        document.onmousemove = elementDrag
    }

    function elementDrag(e) {
        e = e || window.event
        e.preventDefault()
        pos1 = pos3 - e.clientX
        pos2 = pos4 - e.clientY
        pos3 = e.clientX
        pos4 = e.clientY
        const newPosX = element.offsetLeft - pos1
        const newPosY = element.offsetTop - pos2
        element.style.top = `${newPosY}px`
        element.style.left = `${newPosX}px`
        dialogX = newPosX
        dialogY = newPosY
    }

    function closeDragElement() {
        document.onmouseup = null
        document.onmousemove = null
    }
}
