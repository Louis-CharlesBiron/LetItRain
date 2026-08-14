class RainManager {
    static INSTANCE = null
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
            this._CVS = null
            this._rainObj = this.#createRainContainer()
            this._rainInterval = null
            
            return RainManager.INSTANCE = this
        }
    }

    create() {
        if (!this.hasCanvas) {
            this.#injectCSS()
            const fpsCounter = new FPSCounter(), fpsDisplay = document.querySelector("title"), initDisplayText = fpsDisplay.textContent
            const CVS = this._CVS = Canvas.create(null, ()=>fpsDisplay.textContent = fpsCounter.getFps()+" / "+this._rainObj.dots.length+" | "+initDisplayText)
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
            if (!this._rainObj.parent?.id !== this._CVS.id) {
                this._rainObj._parent = null
                this._CVS.add(this._rainObj)
            }
            this.#rainLoop()
            clearInterval(this._rainInterval)
            this._rainInterval = setInterval(this.#rainLoop.bind(this), RainManager.#SETTINGS.rate)
            this._CVS.start()
        }
    }

    stop() {
        clearInterval(this._rainInterval)
        this._rainInterval = null
        this._rainObj.clear()
    }

    #createRainDrop() {// TODO OPTIMIZE
        const random = CDEUtils.random, {radius: baseRadius, radiusRange, widthRange, heightRange, width, height, heightPadding, fallTime, fallTimeRange, color, easing} = RainManager.#SETTINGS

        const [cvsWidth, cvsHeight] = this._CVS.size,
            radius = baseRadius+random(...radiusRange, 2),
            scaling = [width+random(widthRange[0], widthRange[1], 2), height+random(heightRange[0], heightRange[1], 2)],
            fallHeight = heightPadding+baseRadius*scaling[1]

        return new Dot(
            [random(0, cvsWidth), -fallHeight],
            radius,
            color,
            dot=>{
                dot.scale = scaling
                dot.playAnim(new Anim(
                    prog=>dot.y = -fallHeight+(cvsHeight+fallHeight*2)*prog, fallTime+random(fallTimeRange[0], fallTimeRange[1]),
                    typeof easing==="string" ? Anim[easing] : easing,
                    ()=>dot.remove()// object pooling todo?
                ))
            },
            null, true, 
        )
    }

    updateSettings(newSettings) {
        const requireRestart = RainManager.#SETTINGS.rate !== newSettings.rate
        RainManager.#SETTINGS = {...RainManager.#SETTINGS, ...newSettings}
        if (requireRestart && this.isRaining) this.start()
    }

    get hasCanvas() {return Boolean(this._CVS)}
    get isRaining() {return Boolean(this._rainInterval)}
}