const RT_SIZE = 1<<16, RT_MASK = RT_SIZE-1, RANDOM_TABLE = (()=>{
    const table = new Float32Array(RT_SIZE), random = Math.random
    for (let i=0;i<RT_SIZE;i++) table[i] = random()
    return table
})()

let lir_rIndex = 0
function random(min, max, decimals=0) {
    const randomNumber = RANDOM_TABLE[lir_rIndex++&RT_MASK]
    max+=(decimals?0:1)
    if (decimals) {
        const precision = 10**decimals
        return Math.round((randomNumber*(max-min)+min)*precision)/precision
    } else return (randomNumber*(max-min)+min)>>0
}

class RainManager {
    static INSTANCE = null
    static #RAINBOW_ACTIVE = false
    static #FPS_SAFE_LIMIT = 22
    static SAFE_BUFFER_TIME = 3000
    static POINTER_LIMIT = 350
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
            this._rainbowColorCache = null
            return RainManager.INSTANCE = this
        }
    }

    #loop() {
        const fps = this._FPSCounter.getFps(), startTime = this._startTime

        const fpsDisplay = document.querySelector("title")

        if (startTime === RainManager.TURNING_OFF) return;
        else if (!startTime) this._startTime = this._CVS.timeStamp
        else if (fps < RainManager.#FPS_SAFE_LIMIT && (this._CVS.timeStamp-startTime) > RainManager.SAFE_BUFFER_TIME) this.#toggleOff(fps)
        
        fpsDisplay.textContent = fps+" / "+this._rainObj.dots.length

        if (RainManager.#RAINBOW_ACTIVE) {
            const SETTINGS = RainManager.#SETTINGS, a = SETTINGS.color[3]
            this._rainbowColorCache.hue += 1.75
            SETTINGS.color = this._rainbowColorCache.rgba
            SETTINGS.color[3] = a
        }
    }

    #toggleOff(fpsLimit) {
        if (fpsLimit) log(SAFE_LIMIT_STATUS_TEXT+".%c("+fpsLimit+"<"+RainManager.#FPS_SAFE_LIMIT+")")
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
            CVS.onVisibilityChangeCB=()=>this._startTime = null


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
        return new Shape(null, null, null, null, RainManager.POINTER_LIMIT, (render, dot, ratio, parentSetupResults, mouse, distance, parent, isActive)=>{
            if (isActive) {
                const initA = dot.initColor[3]
                dot.a = mod(initA, clamp(ratio-.15, 0, 1), -initA)
            }
        })
    }

    #rainLoop(rainObj) {
        const amount = RainManager.#SETTINGS.amount, add = rainObj.add.bind(rainObj)
        for (let i=0;i<amount;i++) add(new Dot(null, null, null, 
            dot=>{
                const CVS = this._CVS,
                {radius: baseRadius, radiusRange, widthRange, heightRange, width, height, heightPadding, fallTime, fallTimeRange, color, easing} = RainManager.#SETTINGS,
                [cvsWidth, cvsHeight] = CVS.size,
                radius = baseRadius+random(...radiusRange, 2),
                scaling = [width+random(widthRange[0], widthRange[1], 2), height+random(heightRange[0], heightRange[1], 2)],
                scaledHeight = heightPadding+radius*scaling[1],
                totalFall = -scaledHeight+(cvsHeight+scaledHeight*2),
                isBouncyEasing = easing.includes("Back") || easing.includes("Bounce") || easing.includes("Elastic"),
                scalingY = scaling[1],
                isWithing = CVS.isWithin.bind(CVS)
                
                dot.pos = [random(0, cvsWidth), -scaledHeight]
                dot.radius = radius
                dot.color = color
                dot.scale = scaling

                dot.clearAnims()
                dot.playAnim(new Anim(
                    prog=>{
                        dot.y = totalFall*prog
                        if (!isBouncyEasing && !isWithing(dot.pos, scalingY)) dot.remove()
                    },
                    fallTime+random(fallTimeRange[0], fallTimeRange[1]),
                    Anim[easing],
                    ()=>dot.remove()
                ))
            },
        null, true))
    }

    start() {
        if (this.hasCanvas) {
            const CVS = this._CVS, rainObj = this._rainObj
            if (!rainObj.parent?.id !== CVS.id) {
                rainObj._parent = null
                CVS.add(rainObj)
            }
            this.#rainLoop(rainObj)
            clearInterval(this._rainInterval)
            this._rainInterval = setInterval(()=>this.#rainLoop(rainObj), RainManager.#SETTINGS.rate)
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

    updateSettings(newSettings) {
        const requireRestart = RainManager.#SETTINGS.rate !== newSettings.rate
        RainManager.#SETTINGS = {...RainManager.#SETTINGS, ...newSettings}
        if (RainManager.#RAINBOW_ACTIVE) this._rainbowColorCache = new Color(RainManager.#SETTINGS.color)
        if (requireRestart && this.isRaining) this.start()
    }

    updateFpsSafeLimit(fpsSafeLimit) {
        RainManager.#FPS_SAFE_LIMIT = fpsSafeLimit
    }

    updateRainbowActive(rainbowActive) {
        RainManager.#RAINBOW_ACTIVE = rainbowActive
        this._rainbowColorCache = rainbowActive ? new Color(RainManager.#SETTINGS.color) : null
    }

    get hasCanvas() {return Boolean(this._CVS)}
    get isRaining() {return Boolean(this._rainInterval)}
}