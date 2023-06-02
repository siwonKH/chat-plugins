const __pluginId__ = 'notify'
const __version__ = 'v0.8t1'

let notification
let unloaded = false

showNotification(`Notify ${__version__}`, 'Notify loaded.')

window.__core.onBroadcast((data) => {
    if (unloaded) return

    if (data.room === undefined || data.room === window.__basic.getRoom()) {
        if (data.type === 'chat' || data.type === 'hello') {
            if (document.visibilityState === 'hidden') {
                showNotification(`Notify ${__version__}`, data.message)
            }
        }
    }
})

function showNotification(title, body) {
    if ('Notification' in window) {
        if (Notification.permission === 'granted') {
            closeNotification()
            createNotification(title, body)
        } else if (Notification.permission !== 'denied') {
            console.log('Please allow notification.')
            Notification.requestPermission().then((permission) => {
                if (permission === 'granted') {
                    closeNotification()
                    createNotification(title, body)
                }
            })
        }
    }
}

function createNotification(title, body) {
    notification = new Notification(title, {
        body: body,
    });
}

function closeNotification() {
    if (notification) {
        notification.close();
        notification = null;
    }
}

window.__notify = {
    _unload: () => {
        closeNotification()
        showNotification = undefined
        createNotification = undefined
        closeNotification = undefined
        unloaded = true
    }
}

console.log(__pluginId__, __version__)
