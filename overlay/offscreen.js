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
    AUDIO_VOLUME_UPDATE: _mt_i++,
    AUDIO_FILE_UPDATE: _mt_i++,
}

let audio = null
chrome.runtime.onMessage.addListener(({type, value:filePath, volume})=>{
    const isFilePath = typeof filePath==="string"

    if (type === MSG_TYPES.AUDIO_PLAY && isFilePath) createAudio(filePath, volume)
    else if (type === MSG_TYPES.AUDIO_STOP && audio) stopAudio()
    else if (type === MSG_TYPES.AUDIO_VOLUME_UPDATE && audio) audio.volume = volume/100
    else if (type === MSG_TYPES.AUDIO_FILE_UPDATE && isFilePath) {
        stopAudio()
        createAudio(filePath, volume)
    }
})

function createAudio(filePath, volume) {
    audio = new Audio(filePath)
    audio.loop = true
    if (volume) audio.volume = volume/100
    audio.play().then(()=>chrome.runtime.sendMessage({type:MSG_TYPES.AUDIO_ENABLED}))
}

function stopAudio() {
    if (audio) {
        audio.pause()
        audio.remove()
        audio = null
    }
}