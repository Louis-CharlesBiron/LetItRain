const storageManager = new StorageManager()
chrome.management.getSelf(({version})=>version.textContent = "V"+version)
log("To reset the extension settings, run:%c'storageManager.resetStorage()'")

chrome.runtime.onMessage.addListener(({type, value})=>{
    if (type === MSG_TYPES.OVERLAY_TOGGLE) storageManager.updateOverlayActive(value, true)
    else if (type === MSG_TYPES.STATUS) storageManager.updateStatus(value)
})

// Settings menu
let isSettingsOpened = false
const settingsMenuStyle = document.querySelector(".settingsParent").style

settingsButton.onclick=()=>{
    isSettingsOpened = !isSettingsOpened
    if (isSettingsOpened) settingsMenuStyle.top = "0"
    else settingsMenuStyle.top = "calc(-85% - 4px)"
}

chrome.commands.getAll(commands=>rainShortcutInput.value=commands.find(cmd=>cmd.name==="toggle_rain").shortcut)
rainShortcutInput.onclick=()=>chrome.tabs.create({url:"chrome://extensions/shortcuts"})

// Input settings
setRegularNumberInput(rateInput, storageManager.updateRate)
addWheelIncrement(rateInput, [5, 25, 50], storageManager.updateRate)
addWheelIncrement(rateRange, [5, 25, 50], storageManager.updateRate)
rateRange.oninput=e=>storageManager.updateRate(+e.target.value)

setRegularNumberInput(amountInput, storageManager.updateAmount)
addWheelIncrement(amountInput, [1, 5, 10], storageManager.updateAmount)
addWheelIncrement(amountRange, [1, 5, 10], storageManager.updateAmount)
amountRange.oninput=e=>storageManager.updateAmount(+e.target.value)

setRegularNumberInput(widthInput, storageManager.updateWidth)
addWheelIncrement(widthInput, [0.1, 0.25, 1], storageManager.updateWidth)
addWheelIncrement(widthRange, [0.1, 0.25, 1], storageManager.updateWidth)
widthRange.oninput=e=>storageManager.updateWidth(+e.target.value)

setRegularNumberInput(heightInput, storageManager.updateHeight)
addWheelIncrement(heightInput, [1, 5, 10], storageManager.updateHeight)
addWheelIncrement(heightRange, [1, 5, 10], storageManager.updateHeight)
heightRange.oninput=e=>storageManager.updateHeight(+e.target.value)

setRegularNumberInput(fallTimeInput, storageManager.updateFallTime)
addWheelIncrement(fallTimeInput, [100, 500, 1000], storageManager.updateFallTime)
addWheelIncrement(fallTimeRange, [100, 500, 1000], storageManager.updateFallTime)
fallTimeRange.oninput=e=>storageManager.updateFallTime(+e.target.value)

colorInput.onauxclick=e=>e.target.value = Color.random(Color.FORMATS.HEX)
colorInput.oninput=e=>storageManager.updateColor(e.target.value)
addWheelIncrement(colorInput, [3, 10, 25], value=>storageManager.updateColor(value))
addWheelIncrement(alphaRange, [1, 5, 10], value=>storageManager.updateColor(null, value/100))
alphaRange.oninput=e=>storageManager.updateColor(null, +e.target.value/100)

keepCheckbox(overlayCheckbox, null, "overlayActive", DEFAULT_STORAGE.overlayActive, checked=>storageManager.updateOverlayActive(checked))

keepCheckbox(rainbowCheckbox, null, "rainbowActive", DEFAULT_STORAGE.rainbowActive, checked=>storageManager.updateRainbowActive(checked))

setRegularNumberInput(fpsSafeLimitInput, storageManager.updateFpsSafeLimit)
addWheelIncrement(fpsSafeLimitInput, [1, 5, 10], storageManager.updateFpsSafeLimit)

fillSelectOptions(easingSelect, EASINGS)
addWheelIncrement(easingSelect, null, storageManager.updateEasing)
easingSelect.oninput=e=>storageManager.updateEasing(e.target.value)

// Presets
presetLight.onclick=()=>{
    storageManager.updateSettings(45, 1, null, null, 1050)
    storageManager.updateEasing(DEFAULT_STORAGE.easing)
}
presetMild.onclick=()=>{
    storageManager.updateSettings(45, 6, null, null, 850)
    storageManager.updateEasing(DEFAULT_STORAGE.easing)
}
presetHeavy.onclick=()=>{
    storageManager.updateSettings(15, 7, null, null, 500)
    storageManager.updateEasing(DEFAULT_STORAGE.easing)
}
presetReset.onclick=()=>{
    storageManager.updateSettings(45, 1, .75, 10, 1050, [174, 194, 204, .35])
    storageManager.updateEasing(DEFAULT_STORAGE.easing)
}
presetRandom.onclick=()=>{
    const random = CDEUtils.random
    storageManager.updateSettings(
        random(+rateInput.min, +rateInput.max),
        random(+amountInput.min, +amountInput.max),
        random(+widthInput.min, +widthInput.max),
        random(+heightInput.min, +heightInput.max),
        random(+fallTimeInput.min, +fallTimeInput.max),
        Color.random(Color.FORMATS.RGBA, true)
    )
    storageManager.updateEasing(EASINGS[random(0, EASINGS.length)].replaceAll("*",""))
}
