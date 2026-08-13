let rainManager = new RainManager()
console.log("INJECTED-INJECTED-INJECTED-INJECTED-INJECTED-INJECTED-INJECTED-INJECTED-INJECTED-INJECTED-")

chrome.runtime.onMessage.addListener(({type, value})=>{
    if (type === MSG_TYPES.OVERLAY.ON) rainManager.create()
    else if (type === MSG_TYPES.OVERLAY.OFF) rainManager.delete()
    else if (type == MSG_TYPES.OVERLAY.UPDATE_SETTINGS) rainManager.updateSettings(value)
})