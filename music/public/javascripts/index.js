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

var source = null;

var count = 0;

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

function changeVolume(percent){
	gainNode.gain.value = percent * percent;
}

$("#volume")[0].onchange = function(){
	changeVolume(this.value/this.max);
}

$("#volume")[0].onchange();
