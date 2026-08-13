/**
 * @param {HTMLInputElement} element The checkbox element
 * @param {String?} storageType Either "sync", "local" or "session". Defaults to "sync". 
 * @param {String | Function} storageName The storage key as a string, or a callback returning a string. (element, storageType)=>{return key}
 * @param {Boolean} initChecked Whether the checkbox is initially checked 
 * @param {Function?} actionCB The action callback, triggers on click and at launch. (isChecked, isAtLaunch, storageName) 
 * @returns The click event listener
 */
function keepCheckbox(element, storageType, storageName, initChecked, actionCB) {
    const hasActionCB = typeof actionCB === "function", storage = chrome.storage[storageType||"sync"], key = typeof storageName === "function" ? storageName(element, storageType) : storageName
    storage.get(res=>{
        const isChecked = element.checked = res[key]??initChecked
        if (hasActionCB) actionCB(isChecked, res, key)
    })
    return element.addEventListener("click", ()=>{
        const isChecked = element.checked
        if (hasActionCB) actionCB(isChecked, null, key)
        storage.set({[key]:isChecked})
    })
}

/**
 * Adds a custom wheel increment functionality to the provided input
 * @param {HTMLInputElement | HTMLSelectElement} input The input
 * @param {Number? | Array} step Defines the value of possible increments. [normalStep, ctrlStep, shiftStep]
 * @param {Function?} actionCB A callback called on wheel. (value)=>{}
 */
function addWheelIncrement(input, step=[1,1,1], actionCB) {
    if (typeof step === "number" || !step) step = [step||1, step||1, step||1]
    let callback = null, isFocused = false

    const {nodeName, type} = input,
          isRange = type === "range",
          hasActionCB = typeof actionCB === "function",
          normalStep = step[0],
          ctrlStep = step[1]??normalStep,
          shiftStep = step[2]??ctrlStep

    if (nodeName === "INPUT" && (type === "number" || isRange)) callback=e=>{
        if (!isRange && !isFocused) return 
        e.preventDefault()
        const min = +input.min||0, max = +input.max||Infinity, isFowardStep = e.deltaY>0
        let stepChosen = normalStep, v = +input.value
        if (e.ctrlKey) stepChosen = ctrlStep
        else if (e.shiftKey) stepChosen = shiftStep
        const value = isFowardStep ? v-stepChosen : v+stepChosen
        v = input.value = value < min ? min : value > max ? max : value
        if (hasActionCB) actionCB(+input.value)
    }
    else if (nodeName === "SELECT") callback=e=>{
        const currentIndex = input.selectedIndex, isFowardStep = e.deltaY>0
        let stepChosen = normalStep
        if (e.ctrlKey) stepChosen = ctrlStep
        else if (e.shiftKey) stepChosen = shiftStep

        if (isFowardStep) input.selectedIndex = Math.min(input.options.length-1, currentIndex+stepChosen)
        else input.selectedIndex = Math.max(0, currentIndex-stepChosen)
        if (hasActionCB) actionCB(input.value)
    }
    else if (nodeName === "INPUT" && (type === "color")) callback=e=>{
        const color = new Color(input.value), isFowardStep = e.deltaY>0
        let stepChosen = normalStep
        if (e.ctrlKey) stepChosen = ctrlStep
        else if (e.shiftKey) stepChosen = shiftStep
        if (stepChosen < 3) stepChosen = 3
        const newHue = color.hue+(isFowardStep ? stepChosen : -stepChosen)
        color.hue = newHue <= 0 ? 359 : newHue
        input.value = Color.convertTo(color.rgba, Color.CONVERTABLE_FORMATS.HEX)
        if (hasActionCB) actionCB(input.value)
    }
    else console.warn("addWheelIncrement: Input not supported", input, nodeName)

    input.addEventListener("wheel", callback)
    input.addEventListener("focus", ()=>isFocused = true)
    input.addEventListener("blur", ()=>isFocused = false)
}

/**
 * Sets a regular onInput listener, but with min/max clamping
 * @param {HTMLInputElement} input The input of 'number' type
 * @param {Function?} actionCB A callback called on input. (value)=>{}
 */
function setRegularNumberInput(input, actionCB) {
    const hasActionCB = typeof actionCB === "function", min = +input.min||0, max = +input.max||Infinity
    input.title = `Min: ${min} | Max: ${max}`

    input.addEventListener("input", ()=>{
        const v = +input.value
        // console.log(v, input.value, v > max ? max : v)
        // TODO fix , or . decimal numbers
        input.value = v > max ? max : v
        if (hasActionCB) actionCB(+input.value)
    })
    input.addEventListener("blur", ()=>{
        const v = +input.value
        input.value = v < min ? min : v > max ? max : v
    })
}

function getRegulator(callback, delay) {
    let timeoutId
    return params=>{
        clearTimeout(timeoutId)
        timeoutId = setTimeout(()=>callback(params), delay)
    }
}

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

function parseSettings(activeStorage) {
    return {
        rate: activeStorage.rate,
        amount: activeStorage.amount,
        color: activeStorage.color,
        fallTime: activeStorage.fallTime,
        width: activeStorage.width,
        height: activeStorage.height,

        easing: activeStorage.easing,
        radius: activeStorage.radius,
    }
}