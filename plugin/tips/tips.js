/*****************************************************************
** Author: https://github.com/hellobugme
** A plugin for reveal.js adding a tips feature.
** Version: 0.1
** License: MIT license
**
** usage:
**   target element attributes:
**     [tips]: tips id point to [data-tips], or a string content for tips without [data-tips]
**     [tips-image]: when tips content is a image, use this attribute instead of [tips]
**     [tips-align]: choose from: center, target, target-top, mouse
**     [tips-show]: null or tips-align, add for auto show tips when fragmentshown
**
**   tips element attributes:
**     [data-tips]: tips id
******************************************************************/
(function(){
	window.RevealTips = {
		config: {
			hidden: { color: 'none' },
			shown: { color: 'orange' },
			align: 'target' // center/target/mouse/target-top
		},
		configure: function(options){
			for(var key in options){
				this.config[key] = options[key];
			}
			if(options.hidden){
				for(var id in this.map){
					if(this.map[id].target)
						setStyle(this.map[id].target, this.config.hidden);
				}
			}
		},
		map: {},
		current: null,
		show: function(target, _align){
			this.hide();

			setStyle(target, this.config.shown);

			var id = target.getAttribute('tips');
			if(!id){
				this.current = { target: target };
				return;
			}

			var tips = this.map[id].tips || createTips(target);
			this.current = { target: target, tips: tips };

			this.resize(_align);
		},
		hide: function(){
			if(this.current){
				setStyle(this.current.target, this.config.hidden);
				if(this.current.tips) this.current.tips.style.display = 'none';
				this.current = null;
			}
		},
		resize: function(_align){
			if(this.current){
				var target = this.current.target,
					tips = this.current.tips,
					style = tips.style;
				style.display = 'block';

				var scale = Reveal.getScale(),
					align = _align || target.getAttribute('tips-align') || RevealTips.config.align,
					body = document.body,
					offset = target.getBoundingClientRect(),
					top, left;
				switch(align){
					case 'mouse':
						setScale('50% 0');
						top = event.clientY + 30;
						left = event.clientX - tips.offsetWidth / 2;
					break;
					case 'target':
						setScale('0 0');
						top = (offset.top + target.offsetHeight) * scale;
						left = (offset.left + (target.offsetWidth - tips.offsetWidth) / 2) * scale;
					break;
					case 'target-top':
						setScale('0 0');
						top = (offset.top - tips.offsetHeight) * scale;
						left = (offset.left + (target.offsetWidth - tips.offsetWidth) / 2) * scale;
					break;
					case 'target-center':
						setScale('0 0');
						top = (offset.top + target.offsetHeight) * scale;
						left = (body.offsetWidth - tips.offsetWidth * scale) / 2;
					break;
					default: // 'center'
						setScale('50% 50%');
						top = (body.offsetHeight - tips.offsetHeight) / 2;
						left = (body.offsetWidth - tips.offsetWidth) / 2;
				}
				var m = 4, // margin
					maxTop = body.offsetHeight - tips.offsetHeight - m,
					maxLeft = body.offsetWidth - tips.offsetWidth - m;
				if(top < m) top = m;
				if(top > maxTop) top = maxTop;
				if(left < m) left = m;
				if(left > maxLeft) left = maxLeft;
				style.top = top + 'px';
				style.left = left + 'px';
			}
		}
	};

	// class
	var style = document.createElement('style');
	style.innerHTML = 
		'.tips{ position: absolute; top: 0; left: 0; background-color: rgba(0, 0, 0, 0.9); text-align: center; color: #FFF; padding: 20px; border-radius: 5px; border: 1px solid rgba(255, 255, 255, 0.8); display: none; z-index: 998; font-family: "Microsoft YaHei", "Arial", sans-serif; font-size: 24px; }' + 
		'.tips-target{ cursor: pointer; }' + 
		'.tips-target:hover{ text-decoration:underline }';
	document.head.appendChild(style);

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

	// init
	document.querySelectorAll('[tips-image]').forEach(function(target){
		var src = target.getAttribute('tips-image');
		target.setAttribute('tips', src);
		RevealTips.map[src] = {};

		var size = target.getAttribute('tips-image-size'), style = '';
		if(size){
			style += ' style="';
			size = size.replace(/\s/g, '').split('*');
			if(size.length === 1) size[1] = size[0];
			if(size[0]>0) style += 'width: ' + size[0] + 'px;';
			if(size[1]>0) style += 'height: ' + size[1] + 'px;';
			style += '"';
		}

		createTips(target, '<img src="' + src + '" ' + style + '>');
	});
	document.querySelectorAll('[tips-show]').forEach(function(target){
		var align = target.getAttribute('tips-align'),
			show = target.getAttribute('tips-show');
		if(!align && show) target.setAttribute('tips-align', show);
	});
	document.querySelectorAll('[tips]').forEach(function(target){
		target.classList.add('tips-target');
		setStyle(target, RevealTips.config.hidden);

		var id = target.getAttribute('tips');
		if(!RevealTips.map[id]) RevealTips.map[id] = {};
		RevealTips.map[id].target = target;
	});
	document.querySelectorAll('[data-tips]').forEach(function(tips){
		tips.classList.add('tips');
		document.body.appendChild(tips);

		var id = tips.getAttribute('data-tips');
		if(!RevealTips.map[id]) RevealTips.map[id] = {};
		RevealTips.map[id].tips = tips;
	});

	// inline tips
	function createTips(target, content) {
		var id = target.getAttribute('tips');
		var tips = document.createElement('div');
		tips.setAttribute('data-tips', id);
		tips.classList.add('tips');
		tips.innerHTML = content || id;
		document.body.appendChild(tips);
		RevealTips.map[tips.getAttribute('data-tips')].tips = tips;
		return tips;
	}

	// click
	document.addEventListener( 'click', function( event ) {
		var node = event.target, target, tips;
		while(node && node !== document){
			if(node.className === 'controls') return;
			if(node.getAttribute('tips')) target = node;
			if(node.getAttribute('data-tips')) tips = node;
			node = node.parentNode;
		}
		if(!tips) RevealTips.hide();
		if(target) RevealTips.show(target);
	} );

	// scale tips
	function setScale(origin){
		if(RevealTips.current.target.getAttribute('tips-noscale') !== null) return;
		var tips = RevealTips.current.tips;
		tips.style['transform-origin'] = origin;
		tips.style.transform = 'scale(' + Reveal.getScale() + ')';
	}

	function hide(){ RevealTips.hide(); }
	window.addEventListener('resize', hide);
	Reveal.addEventListener('overviewshown', hide);
	Reveal.addEventListener('slidechanged', hide);
	Reveal.addEventListener('fragmentshown', function(event){
		var autoShow = event.fragment.getAttribute('tips-show');
		if(autoShow !== null) RevealTips.show(event.fragment, autoShow || 'target');
		else hide();
	});
	Reveal.addEventListener('fragmenthidden', hide);

	window.addEventListener('keydown', function(event){
		if(event.keyCode === 13/*ENTER*/ && RevealTips.current){
			hide();
			event.stopPropagation();
			event.preventDefault();
		}
	});
})();