let _mt_i = 0
const DEFAULT_SETTINGS = {
    rate: 45,
    amount: 4,
    color: [174, 194, 204, .35],
    easing: "easeInCubic",
    fallTime: 1000,
    width: .75,
    height: 10,
    radius: 2,
},
DEFAULT_STORAGE = {
    ...DEFAULT_SETTINGS,
    overlayActive: false,
    overlayTabs: [],
},
OVERLAY_SCRIPTS = [
    "overlay/canvasDotEffect.js",
    "constants.js",
    "overlay/RainManager.js",
    "overlay/overlay.js",
],
MSG_TYPES = {
    OVERLAY: {
        ON: _mt_i++,
        OFF: _mt_i++,
        UPDATE_SETTINGS: _mt_i++,
    },
    RUNTIME: {
        INIT: null,
        OVERLAY_ACTIVE_WATCH: _mt_i++,
        OVERLAY_DIED: _mt_i++,
    }
}