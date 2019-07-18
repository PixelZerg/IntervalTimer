var marks = [3, 4, 1, 2];
var int = 10;

// colours
const C_BACKG = '#222';
const C_FORE = '#ccc';

var until = 0;
var t0 = -1;
var count = 0;
var popped = 0;

var q = 0;
var perc = 0;

var c = document.getElementById('c');
var cx = c.getContext('2d');
var a = new AudioContext();

function equalMarks(mark, no){
    marks = [];
    for(var i = 0; i < no; i++){
        marks.push(mark);
    }
}

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
        beep(50,440*2, 1000);
        until = getTimestamp() + int;
    }

    // marks stuff
    if(marks.length>1){
        if(count>cum_marks[1]){
            cum_marks.shift();
            marks.shift();
            popped += 1;
        }
    } else{
        if (perc>100){
            beep(20,440*3,100);
        }
    }
}

function draw(){
    clear();

    // draw circle
    cx.strokeStyle = C_FORE;
    cx.fillStyle = C_FORE;

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
    cx.lineWidth = 15;
    cx.beginPath();
    cx.arc(x,y, r, 0, 2*Math.PI);
    cx.stroke();

    // count
    count = (getTimestamp()-t0)/int;
    cx.font = "40px Arial";
    cx.textAlign = "center";
    cx.fillText(Number(Math.floor(count*10)/10).toFixed(1), x - c.width/3, y + r + 75);

    // question no
    q = (count - cum_marks[0])/marks[0] + popped;
    cx.fillText("Q"+Number(Math.floor(q*10)/10).toFixed(1), x, y + r + 75);

    // test %
    perc = count/cum_marks[cum_marks.length-1]*100;
    cx.fillText(Number(Math.floor(perc*10)/10).toFixed(1)+"%", x + c.width/3, y + r + 75);

}

function init() {
    // variable init
    until = popped = count = q = perc = 0;
    t0 = -1;

    // marks stuff
    cum_marks = [];
    cum = marks[0];
    for(var i = 1; i <= marks.length; i++){
        cum_marks.push(cum);
        cum += marks[i];
    }
    cum_marks.unshift(0);

    interval(function(){
        update();
        draw();
    }, 1000/60); // 60 fps
    run();
}

(function () {
    init();

    function resizeCanvas() {
        c.width = window.innerWidth;
        c.height = window.innerHeight;

        draw();
    }
    window.addEventListener('resize', resizeCanvas, false);
    resizeCanvas();
})();
