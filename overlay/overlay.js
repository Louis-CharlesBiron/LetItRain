let rainManager = new RainManager()
console.log("INJECTED-INJECTED-INJECTED-INJECTED-INJECTED-INJECTED-INJECTED-INJECTED-INJECTED-INJECTED-") // TODO

chrome.storage.sync.get(res=>{
    if (res.overlayActive) {
        rainManager.updateSettings(parseSettings(res))
        rainManager.create()
    }
    else rainManager.delete()
})

chrome.runtime.onMessage.addListener(({type, value})=>{
    if (type === MSG_TYPES.OVERLAY_ON) rainManager.create()
    else if (type === MSG_TYPES.OVERLAY_OFF) rainManager.delete()
    else if (type == MSG_TYPES.OVERLAY_UPDATE_SETTINGS) rainManager.updateSettings(value)
})

function parseSettings(storage) {
    return {
        rate: storage.rate,
        amount: storage.amount,
        color: storage.color,
        fallTime: storage.fallTime,
        width: storage.width,
        height: storage.height,
        easing: storage.easing,
        radius: storage.radius,
    }
}