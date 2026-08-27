let _mt_i = 0
const STORAGE = chrome.storage.sync,
MSG_TYPES = {
    OVERLAY_ON: _mt_i++,
    OVERLAY_OFF: _mt_i++,
    OVERLAY_UPDATE_SETTINGS: _mt_i++,
    OVERLAY_TOGGLE: _mt_i++,
    OVERLAY_UPDATE_FPS_SAFE_LIMIT: _mt_i++,
    STATUS: _mt_i++,
    RAINBOW_TOGGLE: _mt_i++,
    DEBUG_TOGGLE: _mt_i++,
    AUDIO_PLAY: _mt_i++,
    AUDIO_STOP: _mt_i++,
    AUDIO_TOGGLE: _mt_i++,
    AUDIO_ENABLED: _mt_i++,
    AUDIO_VOLUME_UPDATE: _mt_i++,
}

chrome.commands.onCommand.addListener(command=>{
    if (command === "toggle_rain") STORAGE.get(res=>{
        const isActive = !res.overlayActive
        sendMessage({type:MSG_TYPES.OVERLAY_TOGGLE, value:isActive})
        sendMessage({type:isActive ? MSG_TYPES.OVERLAY_ON : MSG_TYPES.OVERLAY_OFF}, true)
        STORAGE.set({overlayActive:isActive})
    })
    else if (command === "toggle_audio") STORAGE.get(res=>{
        const isActive = !res.audioActive
        sendMessage({type:MSG_TYPES.AUDIO_TOGGLE, value:isActive})
        toggleAudio(isActive, res.overlayActive, res.audioVolume)
        STORAGE.set({audioActive:isActive})
    })
})

chrome.runtime.onMessage.addListener(({type, value})=>{
    if (type === MSG_TYPES.AUDIO_PLAY || type === MSG_TYPES.AUDIO_STOP) STORAGE.get(res=>toggleAudio(value, res.overlayActive, res.audioVolume))
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

function toggleAudio(audioActive, overlayActive, volume) {
    const audioFile = chrome.runtime.getURL("assets/audio/rain1.mp3")

    if (audioActive && overlayActive) chrome.runtime.getContexts({contextTypes:["OFFSCREEN_DOCUMENT"]}).then(docs=>{
            if (docs.length) sendMessage({type:MSG_TYPES.AUDIO_PLAY, value:audioFile, volume})
            else chrome.offscreen.createDocument({url:"overlay/offscreen.html", reasons:["AUDIO_PLAYBACK"], justification:"Play rain sounds if the option is enabled"}).then(()=>
                sendMessage({type:MSG_TYPES.AUDIO_PLAY, value:audioFile, volume})
            )
        })
    else if (!audioActive) sendMessage({type:MSG_TYPES.AUDIO_STOP})
}