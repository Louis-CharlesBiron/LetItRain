const STORAGE = chrome.storage.sync,
    DEFAULT_STORAGE = {
        rate: 45,
        amount: 4,
        color: [174, 194, 204, .35],
        easing: "easeInCubic",
        fallTime: 1000,
        width: .75,
        height: 10,
        radius: 2,

        overlayActive: false,
        rainActive: false,
    },
    ACTIVE_STORAGE = {...DEFAULT_STORAGE},
    EDITOR_SCRIPTS = [
        "overlay/canvasDotEffect.js",
        "overlay/overlay.js",
        "overlay/rain.js",
    ],
    STORAGE_REGULATOR = getRegulator(params=>{console.log(params);STORAGE.set(params)}, 500)


chrome.management.getSelf(e=>version.textContent="V"+e.version)

function updateRate(value, preventStorage) {
    ACTIVE_STORAGE.rate = rateInput.value = rateRange.value = value
    if (!preventStorage) STORAGE_REGULATOR(ACTIVE_STORAGE)
}

function updateAmount(value, preventStorage) {
    ACTIVE_STORAGE.amount = amountInput.value = amountRange.value = value
    if (!preventStorage) STORAGE_REGULATOR(ACTIVE_STORAGE)
}

function updateWidth(value, preventStorage) {
    ACTIVE_STORAGE.width = widthInput.value = widthRange.value = value
    if (!preventStorage) STORAGE_REGULATOR(ACTIVE_STORAGE)
}

function updateHeight(value, preventStorage) {
    ACTIVE_STORAGE.height = heightInput.value = heightRange.value = value
    if (!preventStorage) STORAGE_REGULATOR(ACTIVE_STORAGE)
}

function updateFallTime(value, preventStorage) {
    ACTIVE_STORAGE.fallTime = fallTimeInput.value = fallTimeRange.value = value
    if (!preventStorage) STORAGE_REGULATOR(ACTIVE_STORAGE)
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
    if (!preventStorage) STORAGE_REGULATOR(ACTIVE_STORAGE)
}

function _resetStorage() {
    STORAGE.set({
        rate: DEFAULT_STORAGE.rate,
        amount: DEFAULT_STORAGE.amount,
        width: DEFAULT_STORAGE.width,
        height: DEFAULT_STORAGE.height,
        fallTime: DEFAULT_STORAGE.fallTime,
        color: DEFAULT_STORAGE.color,
    })
}

// Get storage
STORAGE.get(res=>{
    if (!Object.keys(res).length) _resetStorage()
    else {
        updateRate(res.rate, true)
        updateAmount(res.amount, true)
        updateWidth(res.width, true)
        updateHeight(res.height, true)
        updateFallTime(res.fallTime, true)
        updateColor(res.color.slice(0,3), res.color[3], true)
    }
})

// Input settings
setRegularNumberInput(rateInput, updateRate)
addWheelIncrement(rateInput, [10, 100, 500], updateRate)
addWheelIncrement(rateRange, [10, 100, 500], updateRate)
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
addWheelIncrement(colorInput, [1, 10, 50], value=>updateColor(value))
addWheelIncrement(alphaRange, [1, 5, 10], value=>(null, value/100))
alphaRange.oninput=e=>updateColor(null, +e.target.value/100)

keepCheckbox(overlayCheckbox, null, "overlayActive", DEFAULT_STORAGE.overlayActive, checked=>{
    overlayStatusText.textContent = checked ? "on" : "off"
    if (checked) {
        
    }
})



//openOverlayButton.onclick=()=>
//    chrome.tabs.query({active:true, currentWindow:true}, ([tab])=>{
//        if (tab) chrome.scripting.executeScript({target:{tabId: tab.id}, files:EDITOR_SCRIPTS}).then(()=>
//            chrome.tabs.sendMessage(tab.id, {value:"test"})
//        )
//})




