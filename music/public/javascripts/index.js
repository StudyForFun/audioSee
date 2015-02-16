function $(s){
	return document.querySelectorAll(s);
}

var lis = $("#list li");

for(var i = 0; i< lis.length; i++){
	lis[i].onclick = function(){
		for(var j = 0; j< lis.length;j++){
			lis[j].className = "";
		}
		this.className = "selected";
		visualizer();
		//读取歌曲url
		load("/media/"+this.title);
	}
}

//创建xhr对象
var xhr = new XMLHttpRequest();
//创建音频对象
var ac = new (window.AudioContext||window.webkitAudioContext)();
//创建音频控制对象
var gainNode = ac[ac.createGain?"createGain":"createGainNode"]();
gainNode.connect(ac.destination);

var analyser = ac.createAnalyser();
var size = 128;
analyser.fftSize = size * 2;
analyser.connect(gainNode);


var source = null;

var count = 0;

var box = $("#box")[0];
var height,width;
var canvas= document.createElement("canvas");
var ctx = canvas.getContext("2d");
box.appendChild(canvas);

function resize(){
	height = box.clientHeight;
	width = box.clientWidth;
	canvas.width = width;
	canvas.height = height;
	var line = ctx.createLinearGradient(0,0,0,height);
	line.addColorStop(0,"red");
	line.addColorStop(0.5,"yellow");
	line.addColorStop(1,"green");
	ctx.fillStyle = line;
}

resize();
window.onresize = resize;

function draw(arr){
	ctx.clearRect(0,0,width,height);
	var w = width / size;
	for(var i =0;i<size;i++){
		var h = arr[i] / 256 * height;
		ctx.fillRect(w * i ,height - h, w*0.6, h);
	}
}

//加载歌曲资源
function load(url){
	var n = ++count;
	source && source[source.stop?"stop":"noteOff"]();
	xhr.abort();
	xhr.open("GET",url);
	xhr.responseType = "arraybuffer";
	xhr.onload = function(){
		if(n !== count)return;
		ac.decodeAudioData(xhr.response,function(buffer){
			if(n !== count)return;
			var bufferSource = ac.createBufferSource();
			bufferSource.buffer = buffer;
			bufferSource.connect(analyser);
			bufferSource.connect(gainNode);
			bufferSource.connect(ac.destination);
			bufferSource[bufferSource.start?"start":"noteOn"](0);
			source = bufferSource;
		},function(){
			console.log(error);
		})
	}
	xhr.send();
}


function visualizer(){
	var arr =  new Uint8Array(analyser.frequencyBinCount);
	requestAnimationFrame = window.requestAnimationFrame ||
							window.webkitRequestAnimationFrame ||
							window.mozRequestAnimationFrame;

	function v(){
			analyser.getByteFrequencyData(arr);
			//console.log(arr);
			draw(arr);
			requestAnimationFrame(v);
	}

	requestAnimationFrame(v);
}

//改变音量方法
function changeVolume(percent){
	gainNode.gain.value = percent * percent;
}

$("#volume")[0].onchange = function(){
	changeVolume(this.value/this.max);
}

$("#volume")[0].onchange();
