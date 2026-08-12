let rainManager = new RainManager()
console.log("INJECTED-INJECTED-INJECTED-INJECTED-INJECTED-INJECTED-INJECTED-INJECTED-INJECTED-INJECTED-")

chrome.runtime.onMessage.addListener(({type, value})=>{
    if (type === MSG_TYPES.OVERLAY.CREATE) rainManager.create()
    else if (type === MSG_TYPES.OVERLAY.DELETE) rainManager.delete()
})


//const rain = new Shape([0,0], [], _, _, 250, (render, dot, ratio)=>{
//    dot.a = CDEUtils.mod(1, ratio, 1-COLOR[3])
//}, _, obj=>setInterval(()=>{
//    for (let i=0;i<AMOUNT;i++) obj.add(createRainDrop())
//}, RATE))
//
//function createRainDrop() {
//    const fallHeight = CVS.size[1],
//        radius = BASE_RADIUS+CDEUtils.random(...RADIUS_RANGE, 2),
//        scaling = [BASE_SIZE[0]+CDEUtils.random(...WIDTH_RANGE, 2), BASE_SIZE[1]+CDEUtils.random(...HEIGHT_RANGE, 2)],
//        height = HEIGHT_PADDING+radius*scaling[1]
//
//    const drop = new Dot(
//        [CDEUtils.random(0, CVS.width), -height],
//        radius,
//        COLOR,
//        dot=>{
//            dot.scale = scaling
//            dot.playAnim(new Anim((prog)=>dot.y = -height+(fallHeight+height*2)*prog, BASE_FALL_TIME+CDEUtils.random(...FALL_TIME_RANGE), EASING, ()=>{
//                dot.remove()
//            }))
//        },
//        _, true
//    )
//
//    return drop
//}