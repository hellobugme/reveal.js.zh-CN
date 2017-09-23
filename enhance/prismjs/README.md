# 使用方法

[**Prism**](http://prismjs.com/) 是一个轻量的、可扩展的语法高亮库。

```javascript
Reveal.initialize({
    dependencies: [
        // enhance.js 扩展了一些 Reveal 特性和 API
        { src: 'enhance/enhance.js' },

        // jQuery 可选，用于缓动高亮行，不引入则无动画
        { src: 'enhance/jquery/jquery-2.2.4.js' },

        // prism-wrapper.js 会自动加载 prism.js 和 prism.css，
        // 并扩展 highlightLinesAnimate() 方法
        { src: 'enhance/prismjs/prism-wrapper.js', async: true, callback: function(){
            Reveal.addEventListener( 'prismReady', function(){
                // Prism.highlightLinesAnimate( pre, lines, '', true, false );
            } );
        } }
    ]
});
```

# 实现笔记

**reveal.js** 为保持核心插件轻量，用的语法高亮库是 [**highlight.js**](https://highlightjs.org/)（见 [issues/1852](https://github.com/hakimel/reveal.js/issues/1852)），但 reveal.js 中的 highlight.js 因为打包了很多编程语言的语法高亮，其实一点也不小（441 KB）。

当代码较多时，希望高亮某些行标识出关键语句，但 highlight.js 不具备这个特性，于是自己动手整合了 Prism。

打包了 `Markup`、`CSS`、`JavaScript` 的语法高亮、以及 `Line Highlight`、`Line Numbers`、`Toolbar` 等几个插件后，prism.js 的大小为 39 KB（js 34 KB，css 5 KB）。

下面是一些实现细节。

## 重置样式

因为 reveal.css 对 `pre code` 的设置，导致 Prism 的行号显示不出来，需要重置相关样式（[enhance/prismjs/prism-wrapper.css]()）：

```css
.reveal pre code {
    overflow: visible;
    display: inline;
}
```

## 重写高亮行算法

reveal.js 的缩放分 2 种情况：

* scale > 1：使用 `zoom`
* scale < 1：使用 `transform:scale`

因为 `transform:scale` 会导致模糊，所以优先使用 `zoom`。

但 `zoom` 的缩放受限于浏览器最小文字限制，当缩小到一定程度时，文字不能再变小，就会导致布局错乱。

这是 reveal.js 中相关的代码：

```javascript
// Prefer zoom for scaling up so that content remains crisp.
// Don't use zoom to scale down since that can lead to shifts
// in text layout/line breaks.
if( scale > 1 && features.zoom ) {
    dom.slides.style.zoom = scale;
    dom.slides.style.left = '';
    dom.slides.style.top = '';
    dom.slides.style.bottom = '';
    dom.slides.style.right = '';
    transformSlides( { layout: '' } );
}
// Apply scale transform as a fallback
else {
    dom.slides.style.zoom = '';
    dom.slides.style.left = '50%';
    dom.slides.style.top = '50%';
    dom.slides.style.bottom = 'auto';
    dom.slides.style.right = 'auto';
    transformSlides( { layout: 'translate(-50%, -50%) scale('+ scale +')' } );
}
```

Prism 执行高亮行时，需要计算高亮节点的位置（`top`），这是 prism.js 中的相关代码：

```javascript
function highlightLines(pre, lines, classes) {
    var ranges = lines.replace(/\s+/g, '').split(','),
        offset = +pre.getAttribute('data-line-offset') || 0;
    
    var parseMethod = isLineHeightRounded() ? parseInt : parseFloat;
    var lineHeight = parseMethod(getComputedStyle(pre).lineHeight);
    
    for (var i=0, range; range = ranges[i++];) {
    	range = range.split('-');
    
    	var start = +range[0],
    	    end = +range[1] || start;
    
    	var line = document.createElement('div');
    
    	line.textContent = Array(end - start + 2).join(' \n');
    	line.setAttribute('aria-hidden', 'true');
    	line.className = (classes || '') + ' line-highlight';
    
    	//if the line-numbers plugin is enabled, then there is no reason for this plugin to display the line numbers
    	if(!hasClass(pre, 'line-numbers')) {
            line.setAttribute('data-start', start);
            
            if(end > start) {
            	line.setAttribute('data-end', end);
            }
    	}
    
    	line.style.top = (start - offset - 1) * lineHeight + 'px';
    
    	//allow this to play nicely with the line-numbers plugin
    	if(hasClass(pre, 'line-numbers')) {
            //need to attack to pre as when line-numbers is enabled, the code tag is relatively which screws up the positioning
            pre.appendChild(line);
    	} else {
            (pre.querySelector('code') || pre).appendChild(line);
    	}
    }
}
```


Prism 在 reveal 中使用会出现 2 个问题：

* `zoom` 会导致行高计算不准确，高亮节点定位出错
* `zoom` 会导致行高变化，需要重新计算高亮节点位置

### 解决方法

#### 方法 1：抛弃 zoom

最简单的方法当然是不使用 `zoom`，全部使用 `transform:scale`。

修改 reveal.js 源码为：

```javascript
// if( scale > 1 && features.zoom ) {
if( scale > 1 && features.zoom && !config.notZoom ) {
```

然后初始化时：

```javascript
Reveal.initialize({
    notZoom: true
});
```

**缺点：** scale > 1 也会模糊。

#### 方法 2：`<pre>` 移到 `.slides` 外面

reveal 的缩放是作用于 `.slides` 的，只要把 `<pre>` 移到 `.slides` 外面，自然就会不受到 `zoom` 的影响。

需要捕获幻灯片切换（`slidechanged`）事件，控制 `<pre>` 节点的显示和隐藏。

```html
<div class="reveal">

    <div class="slides"></div>
    
    <pre class="line-numbers" data-line="3" for-slide="1-0" style="z-index: 1; display: none;">
        <code class="language-javascript">
            // code
        </code>
    </pre>
    
</div>

<pre class="line-numbers" data-line="3" for-slide="2-0" style="z-index: 1; position: fixed; top: 0; display: none;">
    <code class="language-javascript">
        // code
    </code>
</pre>

```

```javascript
Reveal.addEventListener( 'ready', updatePres );
Reveal.addEventListener( 'slidechanged', updatePres );

function updatePres( event ){
    var index = event.indexh + '-' + event.indexv;
    document.querySelectorAll( '[for-slide]' ).forEach( function( pre ){
        var isShow = pre.getAttribute( 'for-slide' ) === index;
        pre.style.display = isShow ? 'block' : 'none';
    });
}
```

**缺点：** 需要自己定位、缩放、创建转场动画。

#### 方法 3：重写 prism.js 的高亮行算法

重写 `highlightLines()` 中行高的计算方法：

```javascript
// var lineHeight = parseMethod(getComputedStyle(pre).lineHeight);
var code = pre.querySelector('code'),
    lineCount = code.innerText.match( /\n/g ).length,
    lineHeight = $(code).height() / lineCount;
```

不使用 jQuery：

```javascript
var code = pre.querySelector( 'code' ),
    codeStyle = getComputedStyle( code ),
    paddingTop = parseMethod( codeStyle.paddingTop ),
    paddingBottom = parseMethod( codeStyle.paddingBottom ),
    codeHeight = code.offsetHeight - paddingTop - paddingBottom,
    lineCount = code.innerText.match( /\n/g ).length,
    lineHeight = codeHeight / lineCount;
```

捕获窗口大小变化（`resize`）事件，更新高亮行位置：

```javascript
window.addEventListener( 'resize', function(){

    document.querySelectorAll( '[data-lines]' ).forEach( function( pre ){
    
        pre.querySelectorAll( '.line-highlight' ).forEach( function( line ){
            pre.removeChild( line );
        });
        
        var lines = pre.getAttribute( 'data-lines' );
        highlightLines( pre, lines );
    });
});
```