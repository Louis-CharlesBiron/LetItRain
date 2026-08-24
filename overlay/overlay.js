let rainManager = new RainManager()
log("Let It Rain:%cReady")

chrome.storage.sync.get(res=>{
    rainManager.updateRainbowActive(res.rainbowActive)
    rainManager.updateSettings(parseSettings(res))
    rainManager.updateDebugActive(res.debugActive)

    if (res.overlayActive) rainManager.create()
    else rainManager.delete()
})

chrome.runtime.onMessage.addListener(({type, value})=>{
    if (type === MSG_TYPES.OVERLAY_ON) rainManager.create()
    else if (type === MSG_TYPES.OVERLAY_OFF) rainManager.delete()
    else if (type === MSG_TYPES.OVERLAY_UPDATE_SETTINGS) rainManager.updateSettings(value)
    else if (type === MSG_TYPES.OVERLAY_UPDATE_FPS_SAFE_LIMIT) rainManager.updateFpsSafeLimit(value)
    else if (type === MSG_TYPES.RAINBOW_TOGGLE) rainManager.updateRainbowActive(value)
    else if (type === MSG_TYPES.DEBUG_TOGGLE) rainManager.updateDebugActive(value)
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
        limit: storage.limit,
    }
}