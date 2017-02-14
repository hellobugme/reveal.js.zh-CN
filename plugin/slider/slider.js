/*****************************************************************
** Author: https://github.com/hellobugme
** A plugin for reveal.js adding a slider feature.
** Version: 0.1
** License: MIT license
******************************************************************/
(function(){
	function hide(target){
		target.style.display = 'none';
		return target;
	}
	function show(target){
		target.style.display = 'block';
		return target;
	}

	var map = {}, counter = 0;
	document.querySelectorAll('[slider]').forEach(function(slider){
		var items = slider.querySelectorAll('[slider-item]');
		items.forEach(function(item){
			hide(item);
		});

		if(items.length > 0) show(items[0]);
		slider.setAttribute('slider-index', 0);

		var id = slider.getAttribute('slider');
		if(!id){
			id = 'slider_' + (counter++);
			slider.setAttribute('slider', id);
		}
		map[id] = {
			slider: slider,
			items: items
		};
	});

	document.addEventListener('click', function(event){
		if(event.altKey) return;
		var node = event.target;
		while(node && node !== document){
			if(node.getAttribute('slider')){
				RevealSlider.get(node);
				if(event.layerX > node.offsetWidth / 2) RevealSlider.next();
				else RevealSlider.prev();
			}
			node = node.parentNode;
		}
	});

	var events = {};
	window.RevealSlider = {
		addEventListener: function(type, handler){
			if(!events[type]) events[type] = [];
			events[type].push(handler);
		},
		dispatchEvent: function(type, argument){
			if(events[type]){
				argument.type = type;
				events[type].forEach(function(handler){
					handler(argument);
				});
			}
		},
		_cursor: null,
		get: function(target){
			this._cursor = map[typeof target === 'string' ? target : target.getAttribute('slider')];
			return this;
		},
		goto: function(itemIndex){
			var cursor = this._cursor;
			if(cursor){
				if(cursor.items.length < 2) return;
				hide(cursor.items[cursor.slider.getAttribute('slider-index')]);
				show(cursor.items[itemIndex]);
				cursor.slider.setAttribute('slider-index', itemIndex);

				this.dispatchEvent('change', { target: this._cursor.slider });
			}
		},
		next: function(){
			var cursor = this._cursor;
			if(cursor){
				var index = +cursor.slider.getAttribute('slider-index') + 1;
				if(index > cursor.items.length - 1) index = 0;
				this.goto(index);
			}
		},
		prev: function(){
			var cursor = this._cursor;
			if(cursor){
				var index = +cursor.slider.getAttribute('slider-index') - 1;
				if(index < 0) index = cursor.items.length - 1;
				this.goto(index);
			}
		}
	};
})();