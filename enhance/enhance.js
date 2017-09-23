/*****************************************************************
** Author: https://github.com/hellobugme
** Enhance reveal.js Features & APIs
** Version: 0.1
** License: MIT license
**
** -Global
**    $extend( target, source, deep )
**    $toArray( arraylike )
**    $attrs( element, attrs )
**    $addStyle( css, id )
**    $typeof( object )
**
** -Reveal Features:
**    History:
**      Back   : Ctrl + Z
**      Forward: Ctrl + Shift + Z
**
** -Reveal Methods:
**    getHSlides()
**    getVSlides()
**    dispatchEvent( type, args )
**    getStageStatus()
**
** -Reveal Events:
**    stageResize
**
** -Slide Properties
**    type   // hslide/vslide
**    indexh
**    indexv
**    vslides
**    hslide
******************************************************************/
;( function() {

	window.$addStyle = function( css, id ) {
		var style = document.createElement( 'style' );
		style.innerText = css;
		if( id ){
			style.id = id;
		}
		document.head.appendChild( style );
		return style;
	}

	window.$extend = function( a, b, deep ) {
		if( typeof b === 'object' && b !== null ){
		    for( var i in b ){
		        if( deep === true
		        		&& typeof b[ i ] === 'object' && b[ i ] !== null
		        		&& typeof a[ i ] === 'object' && a[ i ] !== null ){
		        	$extend( a[ i ], b[ i ] );
		   		} else {
		            a[ i ] = b[ i ];
		   		}
		    }
		}
		return a;
	};

	window.$toArray = function( o ) {
		return Array.prototype.slice.call( o );
	}

	window.$attrs = function( element, attrs ){
        if( element && typeof attrs === 'object' && attrs !== null ){
            for( var a in attrs ){
                element.setAttribute( a, attrs[ a ] );
            }
        }
        return element;
    };

    window.$typeof = function( o ){
    	return Object.prototype.toString.call( o );
    };


    var config = Reveal.getConfig();
    var dom = {
			wrapper: document.querySelector( '.reveal' ),
			slides : document.querySelector( '.reveal .slides' )
		};

    function dispatchEvent( type, args ) {
    	var event = document.createEvent( 'HTMLEvents', 1, 2 );
    	event.initEvent( type, true, true );
    	$extend( event, args );
    	dom.wrapper.dispatchEvent( event );

    	// If we're in an iframe, post each reveal.js event to the
    	// parent window. Used by the notes plugin
    	if( config.postMessageEvents && window.parent !== window.self ) {
    		window.parent.postMessage( JSON.stringify({ namespace: 'reveal', eventName: type, state: getState() }), '*' );
    	}
    }

	// horizontal & vertical slides
	var hslides = [], vslides = [];
	$toArray(dom.slides.children).forEach( function( hslide ){
		if( hslide.tagName.toLowerCase() === 'section' ){
			hslide.type = 'hslide';
			hslide.indexh = hslides.length;
			hslide.indexv = 0;
			hslides.push( hslide );

			var _vslides = [];
			$toArray(hslide.children).forEach( function( vslide ){
				if( vslide.tagName.toLowerCase() === 'section' ){
					vslide.type = 'vslide';
					vslide.hslide = hslide;
					vslide.indexh = hslide.indexh;
					vslide.indexv = _vslides.length;
					_vslides.push( vslide );
				}
			});

			if( _vslides.length > 0 ){
				hslide.vslides = _vslides;
				vslides = vslides.concat( _vslides );
			}
		}
	});
	hslides.first = hslides[ 0 ];
	hslides.last = hslides[ hslides.length - 1 ];

	// history
	Reveal.getConfig().history = true;
	window.addEventListener( 'keypress', function( event ){
		var Z = 26;
		if( event.ctrlKey && event.keyCode === Z ){
			if( event.shiftKey ){
				window.history.forward();
			} else {
				window.history.back();
			}
			event.preventDefault();
			event.stopPropagation();
		}
	});
	Reveal.registerKeyboardShortcut('Ctrl + Z', 'Back');
	Reveal.registerKeyboardShortcut('Ctrl + Shift + Z', 'Forward');

	// stage
	var stageConfig = {
		WIDTH : config.width,
		HEIGHT: config.height
	};
	function getStageStatus(){
		var pageWidth  = window.innerWidth,
		    pageHeight = window.innerHeight,
		    scaleW = pageWidth / stageConfig.WIDTH,
		    scaleH = pageHeight / stageConfig.HEIGHT,
		    scale, width, height, left, top;

		if( scaleW > scaleH ){
		    scale = scaleH;
		    width = stageConfig.WIDTH * scale;
		    height = pageHeight;
		    left = ( pageWidth - width ) / 2;
		    top = 0;
		} else {
		    scale = scaleW;
		    width = pageWidth;
		    height = stageConfig.HEIGHT * scale;
		    left = 0;
		    top = ( pageHeight - height ) / 2;
		}

		return {
			WIDTH  : stageConfig.WIDTH,
			HEIGHT : stageConfig.HEIGHT,
			scale  : scale,
			width  : width,
			height : height,
			top    : top,
			left   : left
		};
	}
	function stageResize(){
		Reveal.dispatchEvent( 'stageResize', {
			stageStatus: getStageStatus()
		});
	}
	Reveal.addEventListener( 'ready', stageResize);
	window.addEventListener( 'resize', stageResize);

	// exports
	$extend( Reveal, {
		// events
		dispatchEvent: dispatchEvent,

		// elements
		getHSlides: function(){
			return hslides;
		},
		getVSlides: function(){
			return vslides;
		},

		// stage
		initStage: function( setting ){
			$extend( stageConfig, setting );
		},
		getStageStatus: getStageStatus
	});

} )();