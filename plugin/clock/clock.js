/*****************************************************************
** Author: https://github.com/hellobugme
** A plugin for reveal.js adding a clock.
** Version: 0.1
** License: MIT license
******************************************************************/
(function(){
	var root = document.createElement('div');
	setStyle(root, 'position: absolute; bottom: 20px; left: 16px; color: #333; font-family: "Arial"; font-size: 14px; z-index: 10000;');
	root.innerHTML = '<div>&gt;</div><span>00:00:00</span>';
	var btn = root.querySelector('div'),
		node = root.querySelector('span');
	setStyle(btn, 'display: inline-block; width: 14px; cursor: pointer; text-align: center;')
	document.body.appendChild(root);

	var _type = 'timer', _seconds = 0;
	var render = {
		clock: function(){
			var time = new Date();
			node.innerHTML = [fill(time.getHours()), fill(time.getMinutes()), fill(time.getSeconds())].join(':');
		},
		timer: function(){
			node.innerHTML = [fill(_seconds/3600>>0), fill(_seconds%3600/60>>0), fill(_seconds%60)].join(':');
		}
	};

	setInterval(function(){
		_seconds++;
		render[_type]();
	}, 1000);

	btn.onclick = function(){
		_type = _type === 'clock' ? 'timer' : 'clock';
		update();
	};

	function update(){
		if(_type === 'clock'){
			node.style.cursor = 'default';
			node.onclick = null;
		}else{
			node.style.cursor = 'pointer';
			node.onclick = function(){
				if(_type === 'timer'){
					_seconds = 0;
					render[_type]();
				}
			};
		}
		render[_type]();
	}

	update();

	// fill num
	function fill(num){
		return (num < 10 ? '0' : '') + num;
	}

	// set style
	function setStyle(target, style){
		var s = style;
		if(typeof style === 'string'){
			s = {};
			if(style.indexOf(':') < 0) style = 'color: ' + style + ';';
			style.split(';').forEach(function(kv){
				kv = kv.trim();
				if(kv.length > 0){
					kv = kv.split(':');
					s[kv[0]] = kv[1].trim();
				}
			});
		}
		target.removeAttribute('style');
		for(var k in s){
			if(k === 'color' && s[k] === 'none') continue;
			target.style[k] = s[k];
		}
	}

	window.RevealClock = {
		setType: function(type){ // clock/timer
			_type = type;
			update();
		}
	};
})();