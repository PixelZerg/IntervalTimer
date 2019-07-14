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
String.prototype.lpad = function(padString, length) {
    var str = this;
    while (str.length < length)
        str = padString + str;
    return str;
}

// colours
const C_BACKG = '#222';
const C_FORE = '#ccc';
const C_EXPENDING = '#e06c75';

var until = 0; // timestamp (until)
var int = 5;
var count = 0;
var extra = 0;

// var prevExtra = 0;
var t0 = 0;
var isExpending = false;
var expended = 0;

var volume = 100;

var c = document.getElementById('c');
var cx = c.getContext('2d');

var a = new AudioContext();

function beep(vol, freq, duration){
    v=a.createOscillator();
    u=a.createGain();
    v.connect(u);
    v.frequency.value=freq;
    v.type="sine";
    u.connect(a.destination);
    u.gain.value=vol*0.01;
    v.start(a.currentTime);
    v.stop(a.currentTime+duration*0.001);
}

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
    if (getTimestamp() >= until){
        expend();
    }
    if(isExpending){
        expended = getTimestamp()-t0;
        // extra -= expended;
    }
}

function next(){
    count += 1;
    until = getTimestamp() + int;
}

function expend(){
    // if(isExpending){
    //     extra = 0;
    // }
    // if(extra <= 0){
    //     if(prevExtra == 0){
    //         prevExtra = extra;
    //         t0 = getTimestamp();
    //     }
    //     else{
    //         extra = prevExtra - (getTimestamp()-t0);
    //     }
    // }
    if(!isExpending){
    t0 = getTimestamp();
    beep(volume, 440*2, 1000);
    until = t0 + extra;
    isExpending = true;
    }
}

function secondsToStr(s) {
    // past 1h doesn't really work but good enough
    let temp = s;
    const years = Math.floor( temp / 31536000 ),
          days = Math.floor( ( temp %= 31536000 ) / 86400 ),
          hours = Math.floor( ( temp %= 86400 ) / 3600 ),
          minutes = Math.floor( ( temp %= 3600 ) / 60 ),
          seconds = temp % 60;

    if ( days || hours || seconds || minutes ) {
      return ( years ? years + "y " : "" ) +
      ( days ? days + "d " : "" ) +
      ( hours ? hours + ":" : ""  ) +
      ( minutes ? minutes + ":" : "" ) +
      (Number.parseFloat( seconds ).toFixed(0)).lpad("0",2) + "";
    }

    return "00";
}

function draw(){
    clear();

    // sector
    cx.strokeStyle = C_FORE;
    cx.fillStyle = C_FORE;
    var x = c.width/2;
    var y = c.height/2-50;
    var r = c.height*0.4;

    if(isExpending){
        cx.fillStyle = C_EXPENDING;
    }
    cx.lineWidth = 0.1;
    cx.beginPath();
    cx.moveTo(x, y);
    if(!isExpending){
        cx.arc(x,y, r, -Math.PI/2, -Math.PI/2 - 2*Math.PI * (until-getTimestamp())/(int));
    }else{
        if(extra > 0){
            cx.arc(x,y, r, -Math.PI/2, -Math.PI/2 - 2*Math.PI * (until-getTimestamp())/(until-t0));
        }else{
            // smh
        }
    }
    cx.fill();

    // draw circle outline
    cx.strokeStyle = C_FORE;
    cx.fillStyle = C_FORE;
    cx.lineWidth = 10;

    // circle outline
    cx.beginPath();
    cx.arc(x,y, r, 0, 2*Math.PI);
    cx.stroke();

    cx.font = "40px Arial";
    cx.textAlign = "center"; 
    if(!isExpending){
    cx.fillText("#"+count + " +"+secondsToStr(extra), x, y + r + 75);
    }
    else{
        cx.fillText("#"+count + " +"+(extra + (t0-getTimestamp())), x, y + r + 75);
    }
}

function pressed(){
    extra += until - getTimestamp();
    next();    
}

(function () {
    function resizeCanvas() {
        c.width = window.innerWidth;
        c.height = window.innerHeight;

        draw();
    }
    window.addEventListener('resize', resizeCanvas, false);
    resizeCanvas();

    document.addEventListener("keypress", function(event) {
        if (event.keyCode == 13 || event.keyCode == 32) {
            pressed();
        }
    })

    init();
    function init() {
        next();
        interval(function(){
            update();
            draw();
        }, 1000/60); // 60 fps
        run();
        
    }
})();
