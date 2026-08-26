let _mt_i = 0
const MSG_TYPES = {
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
}

let audio = null
chrome.runtime.onMessage.addListener(({type, value})=>{
    if (type === MSG_TYPES.AUDIO_PLAY && typeof value==="string") {
        audio = new Audio(value)
        audio.play().then(()=>chrome.runtime.sendMessage({type:MSG_TYPES.AUDIO_ENABLED}))
    }
    else if (type === MSG_TYPES.AUDIO_STOP && audio) {
        audio.pause()
        audio.remove()
        audio = null
    }
})