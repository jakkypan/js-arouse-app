function pageResize() {
    var $wrapperOuter = $(".wrapper-outer");
    var phoneWidth = $wrapperOuter.width();
    var phoneHeight = $wrapperOuter.height();
    var phoneRatio = phoneWidth / phoneHeight;

    var viewWidth = phoneWidth;
    var $wrapperInner = $(".wrapper-inner");
    if (phoneRatio >= 0.653) { // 640 x 980
        viewWidth = phoneHeight * 0.634; // 640 x 1010
        var viewWidthRatio = Math.round(viewWidth * 100 / phoneWidth).toFixed(2);
        $wrapperInner.css("width", [viewWidthRatio, "%"].join(""));
        $wrapperInner.css("margin-left", [-viewWidthRatio*0.5, "%"].join(""));
    } else {
        $wrapperInner.css("width", "100%");
        $wrapperInner.css("margin-left", "-50%");
    }
    
    window.phoneScale = viewWidth / 320;
    document.body.style.fontSize = [16 * window.phoneScale, "px"].join("");
}

function basePageReady() {
    window.onorientationchange = pageResize;
    window.onresize = pageResize;
    pageResize();
}
function indexPageReady() {
    basePageReady();
}
