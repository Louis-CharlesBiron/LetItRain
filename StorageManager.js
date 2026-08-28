class StorageManager {
    static INSTANCE = null
    static STORAGE = STORAGE
    static STORAGE_REGULATOR_DELAY = 500
    static SETTINGS_UPDATE_REGULATOR_DELAY = 18
    static AUDIO_UPDATE_REGULATOR_DELAY = 30
    static AUDIO_VOLUME_EXTRA_STEPS = [5, 10]

    constructor() {
        if (StorageManager.INSTANCE) return StorageManager.INSTANCE
        else {
            this._activeStorage = {...DEFAULT_STORAGE}
            this.get(res=>{
                if (!this.isDefined(res)) this.resetStorage()
                else {
                    const {
                        rate, amount, width, height, fallTime, color, easing, limit,
                        overlayActive, fpsSafeLimit, statusText, customPreset, audioActive, audioVolume,
                    } = res
                    this._storageRegulator = getRegulator(this.set, StorageManager.STORAGE_REGULATOR_DELAY)
                    this._settingsUpdateRegulator = getRegulator(value=>sendMessage({type:MSG_TYPES.OVERLAY_UPDATE_SETTINGS, value}, true), StorageManager.SETTINGS_UPDATE_REGULATOR_DELAY)
                    this._audioVolumeUpdateRegulator = getRegulator(volume=>sendMessage({type:MSG_TYPES.AUDIO_VOLUME_UPDATE, volume}), StorageManager.AUDIO_UPDATE_REGULATOR_DELAY)
                    this._audioFileUpdateRegulator = getRegulator(value=>sendMessage({type:MSG_TYPES.AUDIO_FILE_UPDATE, value}), StorageManager.AUDIO_UPDATE_REGULATOR_DELAY)
                    this._rainbowInterval = null

                    this.#updateOverlayActive(overlayActive, true, true)
                    this.#updateFpsSafeLimit(fpsSafeLimit, true)
                    this.#updateStatus(statusText)
                    this.#updateCustomPreset(customPreset, true)
                    this.#updateAudioActive(audioActive, true)
                    this._activeStorage.audioVolume = audioVolume
                    this.#updateAudioVolume(0, true)

                    this.#updateRate(rate, true)
                    this.#updateAmount(amount, true)
                    this.#updateWidth(width, true)
                    this.#updateHeight(height, true)
                    this.#updateFallTime(fallTime, true)
                    this.#updateColor(color.slice(0,3), color[3], true)
                    this.#updateEasing(easing, true)
                    this.#updateLimit(limit, true)
                }
            })
            
            return StorageManager.INSTANCE = this
        }
    }

    #save() {
        this._storageRegulator(this._activeStorage)
    }

    #updateAttribute() {
        this._settingsUpdateRegulator(parseSettings(this._activeStorage))
        this.#save()
    }

    #updateRate(value, preventStorage) {
        this._activeStorage.rate = rateInput.value = rateRange.value = value
        if (this._activeStorage.audioActive) this._audioFileUpdateRegulator({rate:value, amount:this._activeStorage.amount})
        if (!preventStorage) this.#updateAttribute()
    }
    
    #updateAmount(value, preventStorage) {
        this._activeStorage.amount = amountInput.value = amountRange.value = value
        if (this._activeStorage.audioActive) this._audioFileUpdateRegulator({rate:this._activeStorage.rate, amount:value})
        if (!preventStorage) this.#updateAttribute()
    }
    
    #updateWidth(value, preventStorage) {
        this._activeStorage.width = widthInput.value = widthRange.value = value
        if (!preventStorage) this.#updateAttribute()
    }
    
    #updateHeight(value, preventStorage) {
        this._activeStorage.height = heightInput.value = heightRange.value = value
        if (!preventStorage) this.#updateAttribute()
    }
    
    #updateFallTime(value, preventStorage) {
        this._activeStorage.fallTime = fallTimeInput.value = fallTimeRange.value = value
        if (!preventStorage) this.#updateAttribute()
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
            const displayAlpha = alpha*100
            alphaRange.value = displayAlpha
            alphaDisplay.textContent = displayAlpha|0
            alphaDisplay.style.opacity = alpha
            alphaDisplay.style.right = (.5+(136*(1-alpha)))+"px"
            rgba[3] = alpha
            
        }
        this._activeStorage.color = [...rgba]
        if (!preventStorage) this.#updateAttribute()
    }

    #updateEasing(value, preventStorage) {
        this._activeStorage.easing = easingSelect.value = value
        if (!preventStorage) this.#updateAttribute()
    }

    #updateLimit(value, preventStorage) {
        this._activeStorage.limit = limitInput.value = limitRange.value = value
        if (!preventStorage) this.#updateAttribute()
    }

    #updateOverlayActive(value, uiOnly, isAtLaunch) {
        overlayCheckbox.checked = this._activeStorage.overlayActive = value
        overlayStatusText.textContent = value ? "on" : "off"
        if (value) this.#updateStatus(null)
        if (!isAtLaunch) {
            if (this._activeStorage.audioActive) {
                sendMessage({type:value ? MSG_TYPES.AUDIO_PLAY : MSG_TYPES.AUDIO_STOP, value})
                if (value) this.#updateAudioStatus(true)
            }
            if (!uiOnly) sendMessage({type:value ? MSG_TYPES.OVERLAY_ON : MSG_TYPES.OVERLAY_OFF}, true)
        }
    }

    #updateFpsSafeLimit(value, isAtLaunch) {
        this._activeStorage.fpsSafeLimit = fpsSafeLimitInput.value = value
        if (!isAtLaunch) {
            this.#save()
            sendMessage({type:MSG_TYPES.OVERLAY_UPDATE_FPS_SAFE_LIMIT, value}, true)
        }
    }

    #updateStatus(statusText) {
        statusDisplay.textContent = statusText||""
    }

    #updateRainbowActive(value, isAtLaunch) {
        rainbowCheckbox.checked = this._activeStorage.rainbowActive = value
        if (value) this._rainbowInterval = rainbow(RAINBOW_DELAY)
        else {
            clearInterval(this._rainbowInterval)
            this._rainbowInterval = null
            document.documentElement.style.filter = ""
        }
        if (!isAtLaunch) sendMessage({type:MSG_TYPES.RAINBOW_TOGGLE, value}, true)
    }

    #updateCustomPreset(presetSettings, preventStorage) {
        this._activeStorage.customPreset = presetSettings
        if (!preventStorage) this.#save()
    }

    #updateDebugActive(value, isAtLaunch) {
        debugCheckbox.checked = this._activeStorage.debugActive = value
        debugCheckboxParent.textContent = value ? "Debug (On)" : "Debug"
        debugCheckboxParent.style.fontStyle = value ? "normal" : "italic"
        if (!isAtLaunch) sendMessage({type:MSG_TYPES.DEBUG_TOGGLE, value}, true)
    }

    #updateAudioActive(value, uiOnly) {
        const overlayActive = this._activeStorage.overlayActive
        audioCheckbox.checked = this._activeStorage.audioActive = value
        audioStatusText.textContent = value ? "" : "off"
        if (value) this.#updateAudioVolume()
        if (overlayActive && value && typeof uiOnly==="boolean") this.#updateAudioStatus(true)
        if (overlayActive && !uiOnly) sendMessage({type:value ? MSG_TYPES.AUDIO_PLAY : MSG_TYPES.AUDIO_STOP, value})
    }

    #updateAudioStatus(isRequest) {
        if (isRequest) this.#updateStatus("Waiting for audio...")
        else this.#updateStatus("")
    }

    #updateAudioVolume(increment=0, uiOnly) {
        let volume = this._activeStorage.audioVolume + increment
        this._activeStorage.audioVolume = volume = (volume<0 ? 0 : volume>100 ? 100 : volume)
        if (this._activeStorage.audioActive) {
            audioStatusText.textContent = volume+"%"
            if (!uiOnly) {
                this._audioVolumeUpdateRegulator(volume)
                this.#save()
            }
        }
    }

    #updateSettings(rate, amount, width, height, fallTime, color, easing, limit) {
        if (rate) this.#updateRate(rate)
        if (amount) this.#updateAmount(amount)
        if (width) this.#updateWidth(width)
        if (height) this.#updateHeight(height)
        if (fallTime) this.#updateFallTime(fallTime)
        if (color) this.#updateColor(color.slice(0,3), color[3])
        if (easing) this.#updateEasing(easing)
        if (limit) this.#updateLimit(limit)
    }

    get(callback) {
        StorageManager.STORAGE.get(callback)
    }

    set(obj) {
        StorageManager.STORAGE.set(obj)
    }

    resetStorage() {
        StorageManager.STORAGE.clear()
        StorageManager.STORAGE.set(DEFAULT_STORAGE, ()=>location.reload())
    }

    isDefined(res) {
        return Object.keys(res).length
    }

    get hasCustomPreset() {return Boolean(this._activeStorage.customPreset)}
    get customPreset() {return this._activeStorage.customPreset}
    get activeStorage() {return this._activeStorage}

    get updateRate() {return this.#updateRate.bind(this)}
    get updateAmount() {return this.#updateAmount.bind(this)}
    get updateWidth() {return this.#updateWidth.bind(this)}
    get updateHeight() {return this.#updateHeight.bind(this)}
    get updateFallTime() {return this.#updateFallTime.bind(this)}
    get updateColor() {return this.#updateColor.bind(this)}
    get updateEasing() {return this.#updateEasing.bind(this)}
    get updateLimit() {return this.#updateLimit.bind(this)}

    get updateOverlayActive() {return this.#updateOverlayActive.bind(this)}
    get updateSettings() {return this.#updateSettings.bind(this)}
    get updateFpsSafeLimit() {return this.#updateFpsSafeLimit.bind(this)}
    get updateRainbowActive() {return this.#updateRainbowActive.bind(this)}
    get updateStatus() {return this.#updateStatus.bind(this)}
    get updateCustomPreset() {return this.#updateCustomPreset.bind(this)}
    get updateDebugActive() {return this.#updateDebugActive.bind(this)}
    get updateAudioActive() {return this.#updateAudioActive.bind(this)}
    get updateAudioStatus() {return this.#updateAudioStatus.bind(this)}
    get updateAudioVolume() {return this.#updateAudioVolume.bind(this)}

}