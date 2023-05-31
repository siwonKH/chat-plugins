const __pluginId__ = 'dialogutils'
const __dialogVersion__ = 'v0.6'

let initialDialogX = 20
let initialDialogY = 20

const showDialog = (title = 'Example title', body = '<p>Hello</p>', headerStyle = {}, bodyStyle = {}) => {
    const rand = Math.floor(Math.random() * 9000) + 1000

    const dialogDiv = document.createElement('div')
    dialogDiv.innerHTML = `
        <div class="dialog-header-${rand}">
            <div>${title}</div>
            <div><button class="dialog-close-${rand}">X</button></div>
        </div>
        ${body}
    `
    document.body.appendChild(dialogDiv)

    Object.assign(dialogDiv.style, {
        position: 'absolute',
        top: '50px',
        left: '50px',
        backgroundColor: '#f9f9f9',
        color: 'black',
        border: '1px solid #ccc',
        padding: '3px 10px 10px 10px',
        zIndex: '9999',
        boxShadow: '10px 10px 20px rgba(50, 50, 50, .2)',
        ...bodyStyle
    })

    const dialogHeader = dialogDiv.querySelector(`.dialog-header-${rand}`)
    Object.assign(dialogHeader.style, {
        cursor: 'move',
        color: 'black',
        display: 'flex',
        justifyContent: 'space-between',
        ...headerStyle
    })

    const dialogCloser = dialogDiv.querySelector(`.dialog-close-${rand}`)
    dialogCloser.onclick = () => {
        closeDialog(dialogDiv)
    }

    makeDraggable(dialogDiv, dialogHeader)
    return dialogDiv
}

function closeDialog(dialogDiv) {
    document.body.removeChild(dialogDiv)
}

function makeDraggable(element, handle) {
    initialDialogX += 30
    initialDialogY += 30
    if (initialDialogX > 500) {
        initialDialogX = 50
        initialDialogY = 50
    }
    console.log(initialDialogX, initialDialogY)
    let dialogX = initialDialogX
    let dialogY = initialDialogY

    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0
    handle.addEventListener('mousedown', dragMouseDown)

    function dragMouseDown(e) {
        e.preventDefault()
        pos3 = e.clientX
        pos4 = e.clientY
        document.onmouseup = closeDragElement
        document.onmousemove = elementDrag
    }

    function elementDrag(e) {
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

window.__dialogutils = {
    showDialog,
    closeDialog
}

console.log(__pluginId__, __dialogVersion__)
