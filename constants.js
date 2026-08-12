let _mt_i = 0
const DEFAULT_STORAGE = {
    rate: 45,
    amount: 4,
    color: [174, 194, 204, .35],
    easing: "easeInCubic",
    fallTime: 1000,
    width: .75,
    height: 10,
    radius: 2,

    overlayActive: false,
    overlayTabs: [],
    rainActive: false,
},
OVERLAY_SCRIPTS = [
    "overlay/canvasDotEffect.js",
    "constants.js",
    "overlay/RainManager.js",
    "overlay/overlay.js",
],
OVERLAY_STYLES = [
    "src/editor/editor.css"
],
MSG_TYPES = {
    OVERLAY: {
        CREATE: _mt_i++,
        DELETE: _mt_i++,
    },
    RUNTIME: {
        INIT: null,
        OVERLAY_ACTIVE_WATCH: _mt_i++,
        OVERLAY_DIED: _mt_i++,
    }
}