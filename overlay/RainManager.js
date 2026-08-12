class RainManager {
    static INSTANCE = null
    static #INJECTED_CSS = `
html, body {
    width: 100%;
    height: 100%;
    overflow: auto;
}`
    static #INJECTED_CSS_ID = "lir_styles"

    constructor() {
        if (RainManager.INSTANCE) return RainManager.INSTANCE
        else {
            this._CVS = null
            RainManager.INSTANCE = this
        }
    }

    create() {
        console.log("Canvas overlay created")
        this.#injectCSS()
        this._CVS = Canvas.create()
    }

    delete() {
        console.log("Canvas overlay removed")
        this.#deleteCSS()
        this._CVS.cvs.remove()
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


}

/*const _ = null, fpsCounter = new FPSCounter(), CVS = new Canvas(htmlCanvas, ()=>fpsDisplay.textContent = fpsCounter.getFps()+"FPS")

CVS.setMouseMove(mouse=>mouseDisplay.textContent = mouse.pos)
CVS.setMouseLeave()
CVS.setMouseDown()
CVS.setMouseUp()
CVS.setKeyDown(_, true)
CVS.setKeyUp()
CVS.start()

const RATE = 45,
    AMOUNT = 4,
    EASING = Anim.easeInCubic,//Anim.easeInQuart
    COLOR = [174, 194, 204, .35],
    BASE_FALL_TIME = 1000,
    FALL_TIME_RANGE = [-115, 115],
    BASE_SIZE = [.75, 10],
    WIDTH_RANGE = [-.1, .1],
    HEIGHT_RANGE = [-1, .85],
    HEIGHT_PADDING = 15,
    BASE_RADIUS = 2,
    RADIUS_RANGE = [-.25, 1.5]

console.log(`
Rate: ${RATE}
Amout: ${AMOUNT}
Easing: ${EASING.name}
Color: rgba(${COLOR.map(x=>" "+x).toString().trim()})
Base fall time: ${BASE_FALL_TIME}ms
Fall time range: [${FALL_TIME_RANGE.map(x=>" "+x).toString().trim()}]
Base size: [${BASE_SIZE.map(x=>" "+x).toString().trim()}]
Width range: [${WIDTH_RANGE.map(x=>" "+x).toString().trim()}]
Height range: [${HEIGHT_RANGE.map(x=>" "+x).toString().trim()}]
Height padding: ${HEIGHT_PADDING}
Base radius: ${BASE_RADIUS}
Radius range: [${RADIUS_RANGE.map(x=>" "+x).toString().trim()}]
`.trim())



CVS.add(rain)*/

