
chrome.runtime.onMessage.addListener(msg=>{
    console.log(msg)
    console.log("Overaly created")
    const CVS = Canvas.create()
    console.log(CVS)
})





/*
const _ = null, fpsCounter = new FPSCounter(), CVS = new Canvas(htmlCanvas, ()=>fpsDisplay.textContent = fpsCounter.getFps()+"FPS")

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

const rain = new Shape([0,0], [], _, _, 250, (render, dot, ratio)=>{
    dot.a = CDEUtils.mod(1, ratio, 1-COLOR[3])
}, _, obj=>setInterval(()=>{
    for (let i=0;i<AMOUNT;i++) obj.add(createRainDrop())
}, RATE))

function createRainDrop() {
    const fallHeight = CVS.size[1],
        radius = BASE_RADIUS+CDEUtils.random(...RADIUS_RANGE, 2),
        scaling = [BASE_SIZE[0]+CDEUtils.random(...WIDTH_RANGE, 2), BASE_SIZE[1]+CDEUtils.random(...HEIGHT_RANGE, 2)],
        height = HEIGHT_PADDING+radius*scaling[1]

    const drop = new Dot(
        [CDEUtils.random(0, CVS.width), -height],
        radius,
        COLOR,
        dot=>{
            dot.scale = scaling
            dot.playAnim(new Anim((prog)=>dot.y = -height+(fallHeight+height*2)*prog, BASE_FALL_TIME+CDEUtils.random(...FALL_TIME_RANGE), EASING, ()=>{
                dot.remove()
            }))
        },
        _, true
    )

    return drop
}

CVS.add(rain)*/