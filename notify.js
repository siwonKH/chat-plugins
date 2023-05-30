let notification;
let isWindowFocused = true

window.onfocus = function() {
    isWindowFocused = true
}
window.onblur = function() {
    isWindowFocused = false
}

window.__core.onBroadcast((data) => {
    if (data.room === undefined || data.room === window.__basic.getRoom()) {
        if (document.visibilityState === 'hidden' || !isWindowFocused) {
            showNotification('Developer Tab', data.message)
        }
    }
})

function showNotification(title, body) {
    if ('Notification' in window) {
        if (Notification.permission === 'granted') {
            closeNotification()
            createNotification(title, body)
        } else if (Notification.permission !== 'denied') {
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
