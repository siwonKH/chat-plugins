const __pluginId__ = 'notify'
const __version__ = 'v0.4t2'

let notification

let isWindowFocused = true
window.onfocus = function() {
    isWindowFocused = true
}
window.onblur = function() {
    isWindowFocused = false
}

showNotification('Developer Tab', `${__pluginId__}. ${__version__}`)

window.__core.onBroadcast((data) => {
    if (data.room === undefined || data.room === window.__basic.getRoom()) {
        if (data.type === 'chat' || data.type === 'hello') {
            if (document.visibilityState === 'hidden' || !isWindowFocused) {
                showNotification('Notify', data.message)
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

console.log(__pluginId__, __version__)
