class RainManager {
    static INSTANCE = null
    static #FPS_SAFE_LIMIT = 22
    static SAFE_BUFFER_TIME = 1500
    static TURNING_OFF = -1
    static #INJECTED_CSS = `
html, body {
    width: 100%;
    height: 100%;
    overflow: auto;
}
canvas[_cvsde=true] {
    z-index: 99999999999999999999999999999 !important
}`
    static #INJECTED_CSS_ID = "lir_styles"
    static #SETTINGS = {
        ...DEFAULT_SETTINGS,
        fallTimeRange: [-115, 115],
        widthRange: [-.1, .1],
        heightRange: [-1, .85],
        radiusRange: [-.25, 1.5],
        heightPadding: 15,
    }

    constructor() {
        if (RainManager.INSTANCE) return RainManager.INSTANCE
        else {
            this._FPSCounter = null
            this._CVS = null
            this._startTime = null
            this._rainObj = this.#createRainContainer()
            this._rainInterval = null
            return RainManager.INSTANCE = this
        }
    }

    #loop() {
        const fps = this._FPSCounter.getFps(), startTime = this._startTime

        const fpsDisplay = document.querySelector("title")

        if (startTime === RainManager.TURNING_OFF) return;
        else if (!startTime) this._startTime = this._CVS.timeStamp
        else if (fps < RainManager.#FPS_SAFE_LIMIT && (this._CVS.timeStamp-startTime) > RainManager.SAFE_BUFFER_TIME) this.#toggleOff()
        
        fpsDisplay.textContent = fps+" / "+this._rainObj.dots.length
    }

    #toggleOff() {
        this._startTime = RainManager.TURNING_OFF
        this.delete()
        chrome.runtime.sendMessage({type:MSG_TYPES.OVERLAY_TOGGLE, value:false})
        chrome.runtime.sendMessage({type:MSG_TYPES.STATUS, value:SAFE_LIMIT_STATUS_TEXT})
        STORAGE.set({overlayActive:false, statusText:SAFE_LIMIT_STATUS_TEXT})
    }

    create() {
        if (!this.hasCanvas) {
            this.#injectCSS()
            this._FPSCounter = new FPSCounter()
            const CVS = this._CVS = Canvas.create(null, this.#loop.bind(this))

            CVS.setMouseMove()
            CVS.setMouseLeave()
            CVS.setMouseDown()
            CVS.setMouseUp()
            this.start()
        }
    }


    delete() {
        if (this.hasCanvas) {
            this.stop()
            this.#deleteCSS()
            this._CVS.cvs.remove()
            this._CVS = null
            this._FPSCounter = null
        }
    }

    #injectCSS() {
        const styleElement = document.createElement("style")
        styleElement.id = RainManager.#INJECTED_CSS_ID
        styleElement.appendChild(document.createTextNode(RainManager.#INJECTED_CSS))
        document.documentElement.appendChild(styleElement)
    }

    #deleteCSS() {
        const styleElement = document.getElementById(RainManager.#INJECTED_CSS_ID)
        if (styleElement) styleElement.remove()
    }

    #createRainContainer() {
        const mod = CDEUtils.mod, clamp = CDEUtils.clamp
        return new Shape(null, null, null, null, 350, (render, dot, ratio, parentSetupResults, mouse, distance, parent, isActive)=>{
            if (isActive) dot.a = mod(dot.initColor[3], clamp(ratio-.15, 0, 1), -(dot.initColor[3]))
        })
    }

    #rainLoop() {
        const rainObj = this._rainObj, amount = RainManager.#SETTINGS.amount
        for (let i=0;i<amount;i++) rainObj.add(this.#createRainDrop())
    }

    start() {
        if (this.hasCanvas) {
            const CVS = this._CVS
            if (!this._rainObj.parent?.id !== CVS.id) {
                this._rainObj._parent = null
                CVS.add(this._rainObj)
            }
            this.#rainLoop()
            clearInterval(this._rainInterval)
            this._rainInterval = setInterval(this.#rainLoop.bind(this), RainManager.#SETTINGS.rate)
            CVS.start()
        }
    }

    stop() {
        this._startTime = null
        this._CVS.stop()
        clearInterval(this._rainInterval)
        this._rainInterval = null
        this._rainObj.clear()
    }

    #createRainDrop() {// TODO OPTIMIZE
        const random = CDEUtils.random, {radius: baseRadius, radiusRange, widthRange, heightRange, width, height, heightPadding, fallTime, fallTimeRange, color, easing} = RainManager.#SETTINGS

        const [cvsWidth, cvsHeight] = this._CVS.size,
            radius = baseRadius+random(...radiusRange, 2),
            scaling = [width+random(widthRange[0], widthRange[1], 2), height+random(heightRange[0], heightRange[1], 2)],
            fallHeight = heightPadding+baseRadius*scaling[1],
            totalFall = -fallHeight+(cvsHeight+fallHeight*2)

        return new Dot(
            [random(0, cvsWidth), -fallHeight],
            radius,
            color,
            dot=>{
                dot.scale = scaling
                dot.playAnim(new Anim(
                    prog=>dot.y = totalFall*prog,
                    fallTime+random(fallTimeRange[0], fallTimeRange[1]),
                    typeof easing==="string" ? Anim[easing] : easing,
                    ()=>dot.remove()// object pooling todo?
                ))
            },
            null, true
        )
    }

    updateSettings(newSettings) {
        const requireRestart = RainManager.#SETTINGS.rate !== newSettings.rate
        RainManager.#SETTINGS = {...RainManager.#SETTINGS, ...newSettings}
        if (requireRestart && this.isRaining) this.start()
    }

    updateFpsSafeLimit(fpsSafeLimit) {
        RainManager.#FPS_SAFE_LIMIT = fpsSafeLimit
    }

    get hasCanvas() {return Boolean(this._CVS)}
    get isRaining() {return Boolean(this._rainInterval)}
}