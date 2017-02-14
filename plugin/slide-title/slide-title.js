/*****************************************************************
** Author: https://github.com/hellobugme
** A plugin for reveal.js adding slide title.
** Version: 0.1
** License: MIT license
**
** usage:
**   add `data-title="your title"` to `section` elements
**   add `no-title` to exception
** e.g:
**   <section data-title="for all vertical slide">
**     <section>My Title will be "for all vertical slide"</section>
**     <section no-title>I have no title</section>
**     <section data-title="for myself">I have my own title</section>
**   </section>
******************************************************************/
(function(){
	// class
	var style = document.createElement('style');
	style.innerHTML = '.section-title { font-size: 100%; color: #bbb; margin: 20px !important; }';
	document.head.appendChild(style);

	// title node
	var titleNode = document.createElement('div');
	titleNode.className = 'section-title';
	var revealNode = document.querySelector('.reveal');
	revealNode.insertBefore(titleNode, revealNode.childNodes[0]);

	var opacity = 0;
	function show(){
		opacity += 0.1;
		if(opacity >= 1) opacity = 1;
		titleNode.style.opacity = opacity;
		if(opacity < 1) setTimeout(show, 50);
	}

	function setTitle(section){
		var title = '';
		if(section && section.getAttribute('no-title') === null)
			title = section.getAttribute('data-title') || section.parentNode.getAttribute('data-title');
		titleNode.innerHTML = title || '';
	}
	Reveal.addEventListener('ready', function(event){ setTitle(event.currentSlide); });
	Reveal.addEventListener('slidechanged', function(event){ setTitle(event.currentSlide); });
})();