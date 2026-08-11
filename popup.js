chrome.management.getSelf(e=>document.getElementById("version").textContent="V"+e.version)

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

colorInput.oninput=e=>updateColor(e.target.value)
addWheelIncrement(alphaRange, [1, 5, 10], value=>(null, value/100))
alphaRange.oninput=e=>updateColor(null, +e.target.value/100)

function updateRate(value) {
    rateInput.value = value
    rateRange.value = value
}

function updateAmount(value) {
    amountInput.value = value
    amountRange.value = value
}

function updateWidth(value) {
    widthInput.value = value
    widthRange.value = value
}

function updateHeight(value) {
    heightInput.value = value
    heightRange.value = value
}

function updateFallTime(value) {
    fallTimeInput.value = value
    fallTimeRange.value = value
}

function updateColor(rgb, a) {
    if (rgb) colorInput.value = rgb
    if (a) alphaRange.value = a*100
}

const EDITOR_SCRIPTS = [
    "overlay/canvasDotEffect.js",
    "overlay/overlay.js",
    "overlay/rain.js",
]

//openOverlayButton.onclick=()=>
//    chrome.tabs.query({active:true, currentWindow:true}, ([tab])=>{
//        if (tab) chrome.scripting.executeScript({target:{tabId: tab.id}, files:EDITOR_SCRIPTS}).then(()=>
//            chrome.tabs.sendMessage(tab.id, {value:"test"})
//        )
//})




