const __pluginId__ = 'dialogutils'
const __dialogVersion__ = 'v0.15'

let initialDialogX = 20
let initialDialogY = 20

let dialogIndex = 1000000

const showDialog = (title = 'Example title', body = '<p>Hello</p>', headerStyle = {}, bodyStyle = {}) => {
    dialogIndex += 1
    if (dialogIndex > 9999999) {
        dialogIndex = 1000000
    }

    const dialogDiv = document.createElement('div')
    dialogDiv.innerHTML = `
        <div class="dialog-header-${dialogIndex}">
            <div>${title}</div>
            <div><button class="dialog-close-${dialogIndex}">X</button></div>
        </div>
        ${body}
    `
    dialogDiv.classList.add("dialog")

    document.body.appendChild(dialogDiv)

    Object.assign(dialogDiv.style, {
        position: 'absolute',
        top: '50px',
        left: '50px',
        backgroundColor: '#f9f9f9',
        color: 'black',
        border: '1px solid #ccc',
        padding: '3px 10px 10px 10px',
        zIndex: `${dialogIndex}`,
        boxShadow: '10px 10px 20px rgba(50, 50, 50, .2)',
        ...bodyStyle
    })

    const dialogHeader = dialogDiv.querySelector(`.dialog-header-${dialogIndex}`)
    Object.assign(dialogHeader.style, {
        cursor: 'move',
        color: 'black',
        display: 'flex',
        justifyContent: 'space-between',
        ...headerStyle
    })

    const dialogCloser = dialogDiv.querySelector(`.dialog-close-${dialogIndex}`)
    dialogCloser.onclick = () => {
        closeDialog(dialogDiv)
    }

    makeDraggable(dialogDiv, dialogHeader)
    return dialogDiv
}

function makeDraggable(element, handle) {
    initialDialogX += 30
    initialDialogY += 30
    if (initialDialogX > 350) {
        initialDialogX = 50
        initialDialogY = initialDialogY - 300 + 30
        if (initialDialogY > 350) {
            initialDialogY = 50
        }
    }
    element.style.top = `${initialDialogX}px`
    element.style.left = `${initialDialogY}px`

    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0
    handle.addEventListener('mousedown', dragMouseDown)

    function dragMouseDown(e) {
        e.preventDefault()
        if (element.style.zIndex !== `${dialogIndex}`) {
            dialogIndex += 1
            element.style.zIndex = `${dialogIndex}`
        }

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
    }

    function closeDragElement() {
        document.onmouseup = null
        document.onmousemove = null
    }
}

function closeDialog(dialogDiv) {
    document.body.removeChild(dialogDiv)
}

function closeAllDialog() {
    const dialogs = document.querySelectorAll('.dialog')
    dialogs.forEach((dialog) => {
        document.body.removeChild(dialog)
    })
    dialogIndex = 1000000
}

window.__dialogutils = {
    showDialog,
    closeDialog,
    closeAllDialog
}

window.clearDialog = window.__dialogutils.closeAllDialog

console.log(__pluginId__, __dialogVersion__)
