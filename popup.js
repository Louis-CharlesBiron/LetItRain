const RUNTIME = chrome.runtime,
    TABS = chrome.tabs,
    STORAGE = chrome.storage.sync,
    ACTIVE_STORAGE = {...DEFAULT_STORAGE},
    STORAGE_REGULATOR = getRegulator(params=>STORAGE.set(params), 500),
    SETTINGS_UPDATE_REGULATOR = getRegulator(params=>sendMessage({type:MSG_TYPES.OVERLAY.UPDATE_SETTINGS, value:params}, true), 18)

// SETUP
chrome.management.getSelf(e=>version.textContent="V"+e.version)
//RUNTIME.sendMessage({type:MSG_TYPES.RUNTIME.INIT, value:MSG_TYPES.RUNTIME})
//TABS.query({active:true, currentWindow:true}, ([tab])=>console.log("Active Tab: ", tab.id, tab.title))

//chrome.runtime.onMessage.addListener(({type, value})=>{
//    if (type === MSG_TYPES.RUNTIME.OVERLAY_DIED) ACTIVE_STORAGE.overlayTabs = ACTIVE_STORAGE.overlayTabs.filter(x=>x !== value)
//})

function updateRate(value, preventStorage) {
    ACTIVE_STORAGE.rate = rateInput.value = rateRange.value = value
    _updateAttribute(preventStorage)
}

function updateAmount(value, preventStorage) {
    ACTIVE_STORAGE.amount = amountInput.value = amountRange.value = value
    _updateAttribute(preventStorage)
}

function updateWidth(value, preventStorage) {
    ACTIVE_STORAGE.width = widthInput.value = widthRange.value = value
    _updateAttribute(preventStorage)
}

function updateHeight(value, preventStorage) {
    ACTIVE_STORAGE.height = heightInput.value = heightRange.value = value
    _updateAttribute(preventStorage)
}

function updateFallTime(value, preventStorage) {
    ACTIVE_STORAGE.fallTime = fallTimeInput.value = fallTimeRange.value = value
    _updateAttribute(preventStorage)
}

function updateColor(colorValue, alpha, preventStorage) {
    const rgba = [...ACTIVE_STORAGE.color]
    if (colorValue) {
        const [r,g,b] = Color.convertTo(colorValue.length === 3 ? [...colorValue, 1] : colorValue, Color.CONVERTABLE_FORMATS.RGBA)
        rgba[0] = r
        rgba[1] = g
        rgba[2] = b
        colorInput.value = Color.convertTo(rgba, Color.CONVERTABLE_FORMATS.HEX).slice(0, 7)
    }
    if (alpha) {
        alphaRange.value = alpha*100
        rgba[3] = alpha
    }
    ACTIVE_STORAGE.color = [...rgba]
    _updateAttribute(preventStorage)
}

function _updateAttribute(preventStorage) {
    SETTINGS_UPDATE_REGULATOR(parseSettings(ACTIVE_STORAGE))
    if (!preventStorage) STORAGE_REGULATOR(ACTIVE_STORAGE)
}

function _resetStorage() {
    STORAGE.clear()
    STORAGE.set(DEFAULT_STORAGE)
}

// Get storage
STORAGE.get(res=>{
    if (!Object.keys(res).length) _resetStorage()
    else {
        const {rate, amount, width, height, fallTime, color, overlayActive, overlayTabs} = res
        ACTIVE_STORAGE.overlayTabs = overlayTabs
        ACTIVE_STORAGE.overlayActive = overlayActive
        updateRate(rate, true)
        updateAmount(amount, true)
        updateWidth(width, true)
        updateHeight(height, true)
        updateFallTime(fallTime, true)
        updateColor(color.slice(0,3), color[3], true)
        console.log(overlayTabs)
    }
})

// Input settings
setRegularNumberInput(rateInput, updateRate)
addWheelIncrement(rateInput, [5, 25, 50], updateRate)
addWheelIncrement(rateRange, [5, 25, 50], updateRate)
rateRange.oninput=e=>updateRate(+e.target.value)

setRegularNumberInput(amountInput, updateAmount)
addWheelIncrement(amountInput, [1, 5, 10], updateAmount)
addWheelIncrement(amountRange, [1, 5, 10], updateAmount)
amountRange.oninput=e=>updateAmount(+e.target.value)

setRegularNumberInput(widthInput, updateWidth)
addWheelIncrement(widthInput, [0.1, 0.25, 1], updateWidth)
addWheelIncrement(widthRange, [0.1, 0.25, 1], updateWidth)
widthRange.oninput=e=>updateWidth(+e.target.value)

setRegularNumberInput(heightInput, updateHeight)
addWheelIncrement(heightInput, [1, 5, 10], updateHeight)
addWheelIncrement(heightRange, [1, 5, 10], updateHeight)
heightRange.oninput=e=>updateHeight(+e.target.value)

setRegularNumberInput(fallTimeInput, updateFallTime)
addWheelIncrement(fallTimeInput, [100, 500, 1000], updateFallTime)
addWheelIncrement(fallTimeRange, [100, 500, 1000], updateFallTime)
fallTimeRange.oninput=e=>updateFallTime(+e.target.value)

colorInput.onauxclick=e=>e.target.value = Color.random(Color.FORMATS.HEX)
colorInput.oninput=e=>updateColor(e.target.value)
addWheelIncrement(colorInput, [3, 10, 25], value=>updateColor(value))
addWheelIncrement(alphaRange, [1, 5, 10], value=>(null, value/100))
alphaRange.oninput=e=>updateColor(null, +e.target.value/100)

keepCheckbox(overlayCheckbox, null, "overlayActive", DEFAULT_STORAGE.overlayActive, (checked, res)=>{
    ACTIVE_STORAGE.overlayActive = checked
    overlayStatusText.textContent = checked ? "on" : "off"
    sendMessage({type: checked ? MSG_TYPES.OVERLAY.ON : MSG_TYPES.OVERLAY.OFF}, true)
})



