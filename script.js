function interval(fn, duration){
    this.baseline = undefined

    this.run = function(){
        if(this.baseline === undefined){
        this.baseline = new Date().getTime()
        }
        fn()
        var end = new Date().getTime()
        this.baseline += duration

        var nextTick = duration - (end - this.baseline)
        if(nextTick<0){
        nextTick = 0
        }
        (function(i){
            i.timer = setTimeout(function(){
            i.run(end)
        }, nextTick)
        }(this))
    }

    this.stop = function(){
        clearTimeout(this.timer)
    }
}

// colours
const C_BACKG = '#222';
const C_FORE = '#ccc';

var df = 1000/60; // 60 = fps
var t0 = -1;
var t = 0; // time in seconds
var until = 0;

var c = document.getElementById('c');
var cx = c.getContext('2d');

var beepPending = false;

function clear() {
    //background
    cx.fillStyle = C_BACKG;
    cx.clearRect(0, 0, c.width, c.height);
    cx.fillRect(0, 0, c.width, c.height);
    cx.stroke();
}

function getTimestamp(){
    return Date.now() / 1000;
}

function update(){
    if(t0 <= 0){
        t0 = getTimestamp();
    }

    if (until <= 0){
        // beep
        until = 1;
        console.log(t);
    }
    // console.log(t);

    until -= getTimestamp() - t0 - t;
    t = getTimestamp() - t0;
}

function draw(){
    clear();
}


(function () {
    function resizeCanvas() {
        c.width = window.innerWidth;
        c.height = window.innerHeight;

        draw();
    }
    window.addEventListener('resize', resizeCanvas, false);
    resizeCanvas();

    init();
    function init() {
        interval(function(){
            update();
            draw();
        }, df);
        run();
        
    }
})();
