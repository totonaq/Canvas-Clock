# Simple-Clock
A simple clock JavaScript plugin
## Why to use it
You may add to your web page something like [this](https://totonaq.github.io/Simple-Clock/).
## Install
Put the script at the [bottom](https://developer.yahoo.com/performance/rules.html#js_bottom) of your markup.
```html
<script src="[your path]/clockPlugin.js"></script>
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
	region: 'NA',
	label: 'Los Angeles',
	labelTime: true,
	strokes: true,
	strokesSm: false,
	dayLightSavingTime: true,
	labelSec: false
});

# Canvas-Clock
