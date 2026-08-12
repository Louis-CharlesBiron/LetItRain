const MSG_TYPES = {RUNTIME:null},
    TABS = chrome.tabs,
    STORAGE = chrome.storage.sync,
    RUNTIME = chrome.runtime

chrome.runtime.onMessage.addListener(({type, value})=>{
    if (type === null) MSG_TYPES.RUNTIME = value
    else if (MSG_TYPES.RUNTIME) {
        if (type === MSG_TYPES.RUNTIME.OVERLAY_ACTIVE_WATCH) watchActiveOverlay(value)
    }
})

function watchActiveOverlay(tabId) {
    const onUpdated = (id, {status})=>{
        if (status === "loading" && id === tabId) {
            RUNTIME.sendMessage({type:MSG_TYPES.RUNTIME.OVERLAY_DIED, value:tabId})
            STORAGE.get(res=>STORAGE.set({overlayTabs:res.overlayTabs.filter(x=>x!==tabId)}))
            TABS.onUpdated.removeListener(onUpdated)
        }
    },
    onRemoved = (id)=>{
        if (id === tabId) {
            RUNTIME.sendMessage({type:MSG_TYPES.RUNTIME.OVERLAY_DIED, value:tabId})
            STORAGE.get(res=>STORAGE.set({overlayTabs:res.overlayTabs.filter(x=>x!==tabId)}))
            TABS.onRemoved.removeListener(onRemoved)
        }
    }

    TABS.onUpdated.addListener(onUpdated)
    TABS.onRemoved.addListener(onRemoved)
}







