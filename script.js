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

var until = 0;
var int = 10;
var t0 = -1;

var c = document.getElementById('c');
var cx = c.getContext('2d');

var a = new AudioContext();

function beep(freq, duration){
    v=a.createOscillator();
    u=a.createGain();
    v.connect(u);
    v.frequency.value=freq;
    v.type="sine";
    u.connect(a.destination);
    u.gain.value=50*0.01;
    v.start(a.currentTime);
    v.stop(a.currentTime+duration*0.001);
}

function getTimestamp(){
    return Date.now() / 1000;
}

function clear() {
    //background
    cx.fillStyle = C_BACKG;
    cx.clearRect(0, 0, c.width, c.height);
    cx.fillRect(0, 0, c.width, c.height);
    cx.stroke();
}

function update(){
    if(t0 <= 0){
        t0 = getTimestamp();
    }

    if (getTimestamp() >= until){
        beep(440*2, 1000);
        until = getTimestamp() + int;
    }
}

function draw(){
    clear();

    // draw circle
    cx.strokeStyle = C_FORE;
    cx.fillStyle = C_FORE;
    cx.lineWidth = 15;

    var x = c.width/2;
    var y = c.height/2-50;
    var r = c.height*0.4;

    // sector
    cx.lineWidth = 0.1;
    cx.beginPath();
    cx.moveTo(x, y);
    cx.arc(x,y, r, -Math.PI/2, -Math.PI/2 - 2*Math.PI * (until-getTimestamp())/(int))
    cx.fill();

    // circle outline
    cx.beginPath();
    cx.arc(x,y, r, 0, 2*Math.PI);
    cx.stroke();

    // count
    count = (getTimestamp()-t0)/int;
    cx.font = "40px Arial";
    cx.textAlign = "center";
    cx.fillText(Number(Math.floor(count*10)/10).toFixed(1), x, y + r + 75);
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
        }, 1000/60); // 60 fps
        run();
    }
})();
