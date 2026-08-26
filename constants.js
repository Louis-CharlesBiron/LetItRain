let _mt_i = 0
const DEFAULT_SETTINGS = {
    rate: 45,
    amount: 4,
    color: [174, 194, 204, .35],
    easing: Anim.easeInCubic.name,
    fallTime: 1000,
    width: .75,
    height: 10,
    radius: 2,
    limit: 325,
},
DEFAULT_STORAGE = {
    ...DEFAULT_SETTINGS,
    overlayActive: false,
    fpsSafeLimit: 10,
    statusText: null,
    rainbowActive: false,
    customPreset: null,
    debugActive: false,
    audioActive: false,
},
OVERLAY_SCRIPTS = [
    "overlay/canvasDotEffect.js",
    "constants.js",
    "overlay/RainManager.js",
    "overlay/overlay.js",
],
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
},
STORAGE = chrome.storage.sync,
SAFE_LIMIT_STATUS_TEXT = "Rain turned off due to fps being below limit",
EASINGS = [
    // IN
    "*"+Anim.easeInCubic.name,
    "*"+Anim.easeInCirc.name,
    Anim.easeInExpo.name,
    Anim.easeInQuad.name,
    Anim.easeInQuart.name,
    Anim.easeInQuint.name,
    Anim.easeInSine.name,
    Anim.easeInBack.name,
    Anim.easeInBounce.name,
    Anim.easeInElastic.name,
    // IN OUT
    Anim.easeInOutCubic.name,
    Anim.easeInOutCirc.name,
    Anim.easeInOutExpo.name,
    Anim.easeInOutQuad.name,
    "*"+Anim.easeInOutQuart.name,
    Anim.easeInOutQuint.name,
    "*"+Anim.easeInOutSine.name,
    Anim.easeInOutBack.name,
    Anim.easeInOutBounce.name,
    Anim.easeInOutElastic.name,
    // OUT
    Anim.easeOutCubic.name,
    Anim.easeOutCirc.name,
    Anim.easeOutExpo.name,
    Anim.easeOutQuad.name,
    Anim.easeOutQuart.name,
    Anim.easeOutQuint.name,
    "*"+Anim.easeOutSine.name,
    Anim.easeOutBack.name,
    "*"+Anim.easeOutBounce.name,
    Anim.easeOutElastic.name,
    // OTHER
    "*"+Anim.linear.name
],
RAINBOW_DELAY = 18,
log = text=>{
    console.log(
        "%c"+text, `
        padding: 1.5px 6px;
        border-radius: 4.5px;

        color:rgb(159, 191, 236);
        background: #0f172a;

        font-style: italic;
        font-size: 14px;

        text-shadow: 1px 1px 12px rgba(94, 153, 182, 0.8);`,
        `
        color:rgb(91, 218, 129);
        padding: 1.5px 8px;
        font-size: 13px;
        `
      )
},
SAVE_CUSTOM_PRESET_TEXT = "Save Custom Preset"