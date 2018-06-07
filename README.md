# Canvas-Clock
A simple clock plugin written in vanilla JavaScript with canvas
## Why to use it
You may decorate your web page with something like [this](https://totonaq.github.io/Canvas-Clock/).
## Install
Put the script at the [bottom](https://developer.yahoo.com/performance/rules.html#js_bottom) of your markup.
```html
<script src="[your path]/clock.js"></script>
```
### Usage
Create a container for your clock.
```html
<div class="clock"></div>
```
Call the plugin function and your clock is ready.
```javascript
setclock(".myDiv", {
	timeZone: '-8:00',
	dayLightSavingTime: 'NA',
	timeLabel: true,
	strokes: true,
	strokesSm: false,
	enableSecArrow: false
});

