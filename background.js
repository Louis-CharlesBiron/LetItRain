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
    AUDIO_FILE_UPDATE: _mt_i++,
},
OFFSCREEN_PATH = "overlay/offscreen.html",
MAX_RATE = 600,
AUDIO_FOLDER = "assets/audio/"
AUDIO_FILES = [
    "rain1.mp3",
    "rain2.wav",
    "rain3.wav",
    "rain4.wav",
    "rain5.mp3",
    "rain6.mp3",
]
AUDIO_RANGES = [
    22000,
    30000,
    41000,
    69000,
    110000,
    165000,
]

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
        toggleAudio(isActive, res)
        STORAGE.set({audioActive:isActive})
    })
})

chrome.runtime.onMessage.addListener(({type, value})=>{
    if (type === MSG_TYPES.AUDIO_PLAY || type === MSG_TYPES.AUDIO_STOP) STORAGE.get(res=>toggleAudio(value, res))
    else if (type === MSG_TYPES.AUDIO_FILE_UPDATE) {
        const {rate, amount} = value, newAudioFile = getAudioFile(rate, amount)
        if (currentAudioFile === newAudioFile) return;
        currentAudioFile = newAudioFile
        sendMessage({type:MSG_TYPES.AUDIO_FILE_UPDATE, value:currentAudioFile})
    }
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

let currentAudioFile = null
function toggleAudio(audioActive, res) {
    currentAudioFile = getAudioFile(res.rate, res.amount)
    if (audioActive && res.overlayActive) chrome.runtime.getContexts({contextTypes:["OFFSCREEN_DOCUMENT"]}).then(docs=>{
            if (docs.length) sendMessage({type:MSG_TYPES.AUDIO_PLAY, value:currentAudioFile, volume:res.volume})
            else chrome.offscreen.createDocument({url:OFFSCREEN_PATH, reasons:["AUDIO_PLAYBACK"], justification:"Play rain sounds if the option is enabled"}).then(()=>
                sendMessage({type:MSG_TYPES.AUDIO_PLAY, value:currentAudioFile, volume:res.volume})
            )
        })
    else if (!audioActive) sendMessage({type:MSG_TYPES.AUDIO_STOP})
}

function getAudioFile(rate, amount) {
    return chrome.runtime.getURL(AUDIO_FOLDER+AUDIO_FILES[AUDIO_RANGES.indexOf(getRange((((MAX_RATE+1)-rate)*10)*amount, AUDIO_RANGES))])
}

/**
 * Given a number and ranges, returns the index of the range including the given number
 * @param {Number} num: the number included in researched range
 * @param {Number[]} nums: the ranges limit [5, 10, 15] -> 0..5 6..10 11..15
 * @returns: index of the range in the given 'nums' array
 */   
function getRange(num, nums) {
    return nums.reduce((a,b)=>a<num?b:a,-1)
}