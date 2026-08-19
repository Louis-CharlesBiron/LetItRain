class StorageManager {
    static INSTANCE = null
    static STORAGE = STORAGE
    static STORAGE_REGULATOR_DELAY = 500
    static SETTINGS_UPDATE_REGULATOR_DELAY = 18

    constructor() {
        if (StorageManager.INSTANCE) return StorageManager.INSTANCE
        else {
            this._activeStorage = {...DEFAULT_STORAGE}
            this.get(res=>{
                if (!this.isDefined(res)) this.resetStorage()
                else {
                    const {
                        rate, amount, width, height, fallTime, color, easing, 
                        overlayActive, fpsSafeLimit, statusText
                    } = res
                    this._storageRegulator = getRegulator(this.set, StorageManager.STORAGE_REGULATOR_DELAY)
                    this._settingsUpdateRegulator = getRegulator(params=>sendMessage({type:MSG_TYPES.OVERLAY_UPDATE_SETTINGS, value:params}, true), StorageManager.SETTINGS_UPDATE_REGULATOR_DELAY)

                    this.#updateOverlayActive(overlayActive, true)
                    this.#updateFpsSafeLimit(fpsSafeLimit)
                    this.#updateStatus(statusText)

                    this.#updateRate(rate, true)
                    this.#updateAmount(amount, true)
                    this.#updateWidth(width, true)
                    this.#updateHeight(height, true)
                    this.#updateFallTime(fallTime, true)
                    this.#updateColor(color.slice(0,3), color[3], true)
                    this.#updateEasing(easing, true)
                }
            })
            
            return StorageManager.INSTANCE = this
        }
    }

    #save() {
        this._storageRegulator(this._activeStorage)
    }

    #updateAttribute(preventStorage) {
        this._settingsUpdateRegulator(parseSettings(this._activeStorage))
        if (!preventStorage) this.#save()
    }

    #updateRate(value, preventStorage) {
        this._activeStorage.rate = rateInput.value = rateRange.value = value
        this.#updateAttribute(preventStorage)
    }
    
    #updateAmount(value, preventStorage) {
        this._activeStorage.amount = amountInput.value = amountRange.value = value
        this.#updateAttribute(preventStorage)
    }
    
    #updateWidth(value, preventStorage) {
        this._activeStorage.width = widthInput.value = widthRange.value = value
        this.#updateAttribute(preventStorage)
    }
    
    #updateHeight(value, preventStorage) {
        this._activeStorage.height = heightInput.value = heightRange.value = value
        this.#updateAttribute(preventStorage)
    }
    
    #updateFallTime(value, preventStorage) {
        this._activeStorage.fallTime = fallTimeInput.value = fallTimeRange.value = value
        this.#updateAttribute(preventStorage)
    }

    #updateColor(colorValue, alpha, preventStorage) {
        const rgba = [...this._activeStorage.color]
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
        this._activeStorage.color = [...rgba]
        this.#updateAttribute(preventStorage)
    }

    #updateEasing(value, preventStorage) {
        this._activeStorage.easing = easingSelect.value = value
        this.#updateAttribute(preventStorage)
    }

    #updateOverlayActive(value, uiOnly) {
        overlayCheckbox.checked = this._activeStorage.overlayActive = value
        overlayStatusText.textContent = value ? "on" : "off"
        if (value) this.#updateStatus(null)
        if (!uiOnly) sendMessage({type:value ? MSG_TYPES.OVERLAY_ON : MSG_TYPES.OVERLAY_OFF}, true)
    }

    #updateFpsSafeLimit(value) {
        this._activeStorage.fpsSafeLimit = fpsSafeLimitInput.value = value
        this.#save()
        sendMessage({type:MSG_TYPES.OVERLAY_UPDATE_FPS_SAFE_LIMIT, value}, true)
    }

    #updateStatus(statusText) {
        statusDisplay.textContent = statusText||""
    }

    #updateSettings(rate, amount, width, height, fallTime, color) {
        if (rate) this.#updateRate(rate)
        if (amount) this.#updateAmount(amount)
        if (width) this.#updateWidth(width)
        if (height) this.#updateHeight(height)
        if (fallTime) this.#updateFallTime(fallTime)
        if (color) this.#updateColor(color.slice(0,3), color[3])
    }

    get(callback) {
        StorageManager.STORAGE.get(callback)
    }

    set(obj) {
        StorageManager.STORAGE.set(obj)
    }

    resetStorage() {
        StorageManager.STORAGE.clear()
        StorageManager.STORAGE.set(DEFAULT_STORAGE)
    }

    isDefined(res) {
        return Object.keys(res).length
    }

    get updateRate() {return this.#updateRate.bind(this)}
    get updateAmount() {return this.#updateAmount.bind(this)}
    get updateWidth() {return this.#updateWidth.bind(this)}
    get updateHeight() {return this.#updateHeight.bind(this)}
    get updateFallTime() {return this.#updateFallTime.bind(this)}
    get updateColor() {return this.#updateColor.bind(this)}
    get updateOverlayActive() {return this.#updateOverlayActive.bind(this)}
    get updateSettings() {return this.#updateSettings.bind(this)}
    get updateFpsSafeLimit() {return this.#updateFpsSafeLimit.bind(this)}
    get updateStatus() {return this.#updateStatus.bind(this)}
    get updateEasing() {return this.#updateEasing.bind(this)}
}