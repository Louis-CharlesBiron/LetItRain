let _mt_i = 0
const MSG_TYPES = {
    OVERLAY_ON: _mt_i++,
    OVERLAY_OFF: _mt_i++,
    OVERLAY_UPDATE_SETTINGS: _mt_i++,
    OVERLAY_TOGGLE: _mt_i++
}, STORAGE = chrome.storage.sync

chrome.commands.onCommand.addListener(command=>{
    if (command === "toggle_rain") STORAGE.get(res=>{
        const isActive = !res.overlayActive
        sendMessage({type:MSG_TYPES.OVERLAY_TOGGLE, value:isActive})
        sendMessage({type:isActive ? MSG_TYPES.OVERLAY_ON : MSG_TYPES.OVERLAY_OFF}, true)
        STORAGE.set({overlayActive:isActive})
    })
})

function sendMessage(obj, contentTabId) {
    if (contentTabId) {
        if (contentTabId===0) chrome.tabs.query({currentWindow:true, active:true}, ([tab])=>chrome.tabs.sendMessage(tab.id, obj))
        else if (typeof contentTabId==="number") chrome.tabs.get(contentTabId, tab=>chrome.tabs.sendMessage(tab.id, obj))
        else chrome.tabs.query({}, tabs=>{
            const t_ll = tabs.length
            for (let i=0;i<t_ll;i++) chrome.tabs.sendMessage(tabs[i].id, obj)
        })
    }
    else chrome.runtime.sendMessage(obj)
}