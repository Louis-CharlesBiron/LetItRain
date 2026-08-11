chrome.management.getSelf(e=>document.getElementById("version").textContent="V"+e.version)

rateInput
rateRange

amountInput
amountRange

colorInput
alphaRange

widthInput
widthRange

heightInput
heightRange

fallTimeInput
fallTimeRange


const EDITOR_SCRIPTS = [
    "overlay/canvasDotEffect.js",
    "overlay/rain.js",
], EDITOR_STYLES = ["overlay/rain.css"]

openOverlayButton.onclick=()=>
    chrome.tabs.query({active:true, currentWindow:true}, ([tab])=>{
        if (tab) chrome.scripting.executeScript({target:{tabId: tab.id}, files:EDITOR_SCRIPTS}).then(()=>
            chrome.tabs.sendMessage(tab.id, {value:"test"})
        )
})




