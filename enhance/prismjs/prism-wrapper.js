/*****************************************************************
** Author: https://github.com/hellobugme
** A plugin for reveal.js.
** Version: 0.1
** License: MIT license
*
** required jquery & enhance.js
******************************************************************/
;( function() {

	// load js & css
	var script = document.currentScript || $toArray( document.getElementsByTagName( "script" ) ).pop();
    var path = script.src.replace( 'prism-wrapper.js', '' );

    head.load( [
        path + 'prism.css',
        path + 'prism-wrapper.css',
        path + 'prism.js'
    ], function() {

        // Some browsers round the line-height, others don't.
        // We need to test for it to position the elements properly.
        var isLineHeightRounded = (function() {
            var res;
            return function() {
                if(typeof res === 'undefined') {
                    var d = document.createElement('div');
                    d.style.fontSize = '13px';
                    d.style.lineHeight = '1.5';
                    d.style.padding = 0;
                    d.style.border = 0;
                    d.innerHTML = '&nbsp;<br />&nbsp;';
                    document.body.appendChild(d);
                    // Browsers that round the line-height should have offsetHeight === 38
                    // The others should have 39.
                    res = d.offsetHeight === 38;
                    document.body.removeChild(d);
                }
                return res;
            }
        }());

        Prism.highlightLinesAnimate = function( pre, lines, classes, noScroll, noAnimate ){
            // get one .line-highlight, remove others
            var allLines = $toArray( pre.querySelectorAll( '.line-highlight' ) );
            var line = allLines.shift();
            allLines.forEach( function( line ){
                pre.removeChild( line );
            });

            if( !line ){
                var line = document.createElement('div');
                line.textContent = Array(2).join(' \n');
                line.setAttribute('aria-hidden', 'true');
                line.classList.add('line-highlight');
                line.style.top = '0';
                //allow this to play nicely with the line-numbers plugin
                if( ( ' ' + pre.className + ' ' ).indexOf( ' line-numbers ' ) > -1 ) {
                    //need to attack to pre as when line-numbers is enabled, the code tag is relatively which screws up the positioning
                    pre.appendChild(line);
                } else {
                    (pre.querySelector('code') || pre).appendChild(line);
                }
            }

            if( classes && classes.trim() ){
                line.className = 'line-highlight';
                classes.replace( /\s+/g, ' ' ).split(' ').forEach( function( c ){
                    line.classList.add( c );
                });
            }
            
            var offset = +pre.getAttribute('data-line-offset') || 0;

            var parseMethod = isLineHeightRounded() ? parseInt : parseFloat;
            // fix: after slides zoomed, lineHeight was wrong
            // var lineHeight = parseMethod(getComputedStyle(pre).lineHeight);
            var code = pre.querySelector( 'code' ),
                codeStyle = getComputedStyle( code ),
                paddingTop = parseMethod( codeStyle.paddingTop ),
                paddingBottom = parseMethod( codeStyle.paddingBottom ),
                codeHeight = code.offsetHeight - paddingTop - paddingBottom,
                lineCount = code.innerText.match( /\n/g ).length,
                lineHeight = codeHeight / lineCount;
            // by jquery
            // var code = pre.querySelector('code'),
            //     lineCount = code.innerText.match( /\n/g ).length,
            //     lineHeight = $(code).height() / lineCount;

            var range = lines.toString().split('-');

            var start = +range[0],
                end = +range[1] || start;

            if( window.jQuery && !noAnimate ){
                $(line).animate( {
                    top: (start - offset - 1) * lineHeight,
                    height: ( end - start + 1 ) * lineHeight
                } );

                if( !noScroll ){
                    $(pre).animate( { scrollTop: ( start - 2) * lineHeight } );
                }
            } else {
                line.style.top = (start - offset - 1) * lineHeight + 'px';
                line.style.height = ( end - start + 1 ) * lineHeight + 'px';

                if( !noScroll ){
                    pre.scrollTop = ( start - 2) * lineHeight;
                }
            }
            
            pre.setAttribute( 'animate-highlight-lines', lines );
            pre.setAttribute( 'animate-highlight-classes', classes || '' );
            pre.setAttribute( 'animate-highlight-noScroll', !!noScroll || false );
        };

        window.addEventListener( 'resize', function(){
            document.querySelectorAll( '[animate-highlight-lines]' ).forEach( function( pre ){
                var lines = pre.getAttribute( 'animate-highlight-lines' ),
                    classes = pre.getAttribute( 'animate-highlight-classes' ),
                    noScroll = pre.getAttribute( 'animate-highlight-noScroll' ) === 'true';
                Prism.highlightLinesAnimate( pre, lines, classes, noScroll, true );
            });
        });

        Prism.hooks.add('complete', function(env) {
            Reveal.dispatchEvent( 'prismReady' );
        });

    } );

} )();