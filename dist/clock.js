'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

/*jshint esversion: 6 */

(function () {
	'use strict';

	var defaultOpt = {

		diam: 300,
		bgColor: '#fff',
		borderWidth: 3,
		borderColor: '#000',

		centerDiam: 6,
		centerColor: '#000',

		strokes: true,
		strokeMd: true,
		strokeSm: true,
		strokeLgWidth: 3,
		strokeMdWidth: 2,
		strokeSmWidth: 1,
		strokeLengthLg: 20,
		strokeLengthMd: 14,
		strokeLengthSm: 8,
		strokeOffset: 40,
		strokeColor: '#000',

		numerals: 'arabic',
		numeralColor: '#000',
		numeralOffset: 20,
		font: 'normal 16px Arial',

		arrowHWidth: 3,
		arrowHLength: 80,
		arrowMWidth: 2,
		arrowMLength: 100,
		arrowSWidth: 1,
		arrowSLength: 120,
		arrowColor: '#000',
		enableSecArrow: true,
		tailLength: 15,

		timeLabel: false,
		labelFont: 'Arial',
		labelFontSize: 16,
		labelFontWeight: '300',
		labelColor: '#000',
		showDigitSec: false,

		timeZone: false,
		dayLightSavingTime: false
	};

	var draw = void 0,
	    //current div plugin initialized with
	ids = [],
	    //array of divs plugin initialized with
	options = void 0,
	    //current set of parameters
	opts = [],
	    //array of parameters of each clock
	arwCtxs = [],
	    //array of getContext() of arrows
	lblCtxs = [],
	    //array of getContext() of labels

	timeZoneHours = [],
	    timeZoneMins = [],
	    dst = [],
	    digitMin = void 0,
	    digitHour = void 0,


	//diameter and radius of current clock
	diam = void 0,
	    rad = void 0,
	    lineWidth = void 0,
	    //variable for width of clock's border

	//current context for clock face
	ctxFc = void 0;

	function cos(rad) {
		return Math.cos(rad * Math.PI / 180);
	}
	function sin(rad) {
		return Math.sin(rad * Math.PI / 180);
	}
	function getEdge(year, startDay, finishDay, month, hour, weekday) {
		var edge = void 0;

		for (var day = startDay; day <= finishDay; day++) {

			if (new Date(year, month, day, hour).getDay() === weekday) {

				edge = Date.UTC(year, month, day, hour);
			}
		}
		return edge;
	}

	var methods = {
		init: function init() {
			this.createCanvas();
			this.drawCircle();
			this.drawStrokes();
			this.drawNumerals();
			this.setTimeZone();
			this.setDayLightSavingTime();
		},


		//STATE CANVAS

		createCanvas: function createCanvas() {
			diam = options.diam > 100 ? options.diam : 100;

			var canvas = document.createElement('canvas');
			var width = options.diam;
			var height = parseInt(options.labelFontSize);

			var cnvLabel = void 0,
			    ctxLbl = void 0,
			    ctxArw = void 0;

			draw.innerHTML = "<canvas width='" + diam + "' height='" + diam + "'></canvas>" + "<canvas width='" + diam + "' height='" + diam + "'></canvas>";

			draw.style.position = 'relative';

			draw.style.width = diam + 'px';

			var cnvFace = draw.querySelector('canvas');
			var cnvArrows = cnvFace.nextSibling;

			if (options.timeLabel) {
				canvas.width = width;
				canvas.height = height;
				draw.appendChild(canvas);
				cnvLabel = cnvArrows.nextSibling;
				cnvLabel.id = 'time-label-' + ids.length;
			}

			/* 
    * unlike cnvFace this 'action' canvas will 
    * update in requestAnimationFrame function
    */
			cnvArrows.style.position = 'absolute';
			cnvArrows.style.top = 0;
			cnvArrows.style.left = 0;

			cnvFace.id = 'clock-face-' + ids.length;
			cnvArrows.id = 'clock-arrows-' + ids.length;

			if (cnvLabel) {
				ctxLbl = cnvLabel.getContext('2d'); //local
			} else {
				ctxLbl = null;
			}

			ctxFc = cnvFace.getContext('2d'); //global
			ctxArw = cnvArrows.getContext('2d'); //local

			arwCtxs.push(ctxArw);
			lblCtxs.push(ctxLbl);
		},
		drawCircle: function drawCircle() {
			rad = diam / 2;
			ctxFc.beginPath();

			ctxFc.strokeStyle = options.borderColor;

			if (typeof options.borderWidth == 'number' && options.borderWidth > 0) {
				lineWidth = options.borderWidth;
				ctxFc.arc(rad, rad, rad - lineWidth, 0, 2 * Math.PI);
				ctxFc.lineWidth = lineWidth;
				ctxFc.fillStyle = options.bgColor;
				ctxFc.fill();
				ctxFc.stroke();
			} else {
				lineWidth = 0;
				ctxFc.arc(rad, rad, rad, 0, 2 * Math.PI);
				ctxFc.fillStyle = options.bgColor;
				ctxFc.fill();
			}
		},
		drawStrokes: function drawStrokes() {

			var lengthLg = options.strokeLengthLg,
			    lengthMd = options.strokeLengthMd,
			    lengthSm = options.strokeLengthSm;

			if (options.strokes) {

				for (var i = 0; i < 360; i += 6) {

					var x = cos(i) * (rad - 1.5 * lineWidth - options.strokeOffset) + rad;
					var y = sin(i) * (rad - 1.5 * lineWidth - options.strokeOffset) + rad;

					var xto = void 0,
					    yto = void 0;

					ctxFc.beginPath();
					ctxFc.strokeStyle = options.strokeColor;

					if (i % 90 === 0) {

						xto = cos(i) * (rad - lengthLg - 1.5 * lineWidth - options.strokeOffset) + rad;
						yto = sin(i) * (rad - lengthLg - 1.5 * lineWidth - options.strokeOffset) + rad;
						ctxFc.moveTo(x, y);
						ctxFc.lineWidth = options.strokeLgWidth;
						ctxFc.lineTo(xto, yto);
					} else if (i % 30 === 0 && options.strokeMd) {

						xto = cos(i) * (rad - lengthMd - 1.5 * lineWidth - options.strokeOffset) + rad;
						yto = sin(i) * (rad - lengthMd - 1.5 * lineWidth - options.strokeOffset) + rad;
						ctxFc.moveTo(x, y);
						ctxFc.lineWidth = options.strokeMdWidth;
						ctxFc.lineTo(xto, yto);
					} else if (options.strokeSm) {

						xto = cos(i) * (rad - lengthSm - 1.5 * lineWidth - options.strokeOffset) + rad;
						yto = sin(i) * (rad - lengthSm - 1.5 * lineWidth - options.strokeOffset) + rad;
						ctxFc.moveTo(x, y);
						ctxFc.lineWidth = options.strokeSmWidth;
						ctxFc.lineTo(xto, yto);
					}
					ctxFc.stroke();
				}
			}
		},
		drawNumerals: function drawNumerals() {
			if (options.numerals) {

				ctxFc.beginPath();
				var ARABIC = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2];
				var ROMAN = ['III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'I', 'II'];
				var type = void 0;

				for (var i = 0; i < 360; i += 30) {
					var xtxt = cos(i) * (rad - 1.5 * lineWidth - options.numeralOffset) + rad;
					var ytxt = sin(i) * (rad - 1.5 * lineWidth - options.numeralOffset) + rad;

					ctxFc.textAlign = "center";
					ctxFc.textBaseline = "middle";
					ctxFc.font = options.font;

					if (options.numerals === 'roman') {
						type = ROMAN;
					} else {
						type = ARABIC;
					}

					ctxFc.fillStyle = options.numeralColor;

					ctxFc.fillText(type[i / 30], xtxt, ytxt);
				}
			}
		},
		setTimeZone: function setTimeZone() {
			var min = 0,
			    hour = 0,
			    splitted = void 0;

			if (options.timeZone && options.timeZone !== 'current') {

				splitted = options.timeZone.split(':');

				if (!isNaN(splitted[0]) && !isNaN(splitted[1]) && splitted[0] <= 14 && splitted[0] >= -12 && (splitted[1] == 0 || splitted[1] == 30 || splitted[1] == 45)) {

					hour = Number(splitted[0]);
					min = options.timeZone[0] === '-' ? -Number(splitted[1]) : Number(splitted[1]);
				} else {
					hour = 0;
					min = 0;
				}
			} else {
				hour = 0;
				min = 0;
			}
			timeZoneHours.push(hour);
			timeZoneMins.push(min);
		},
		setDayLightSavingTime: function setDayLightSavingTime() {
			var CURRENTYEAR = new Date().getUTCFullYear();
			var NEXTYEAR = new Date().getUTCFullYear() + 1;
			var now = Date.now();

			var EUSPRING = getEdge(CURRENTYEAR, 25, 31, 2, 1, 0);
			var EUAUTUMN = getEdge(CURRENTYEAR, 25, 31, 9, 1, 0);

			var NASPRING = getEdge(CURRENTYEAR, 8, 14, 2, 2, 0);
			var NAAUTUMN = getEdge(CURRENTYEAR, 1, 7, 10, 2, 0);

			var AUSPRING = getEdge(CURRENTYEAR, 1, 7, 9, 16, 5);
			var AUAUTUMN = getEdge(NEXTYEAR, 1, 7, 3, 16, 5);

			var dayLight = 0;

			if (options.dayLightSavingTime === 'EU' && now >= EUSPRING && now <= EUAUTUMN) {

				dayLight = 1;
			} else if (options.dayLightSavingTime === 'NA' && now >= NASPRING && now <= NAAUTUMN) {

				dayLight = 1;
			} else if (options.dayLightSavingTime === 'AUS' && now >= AUSPRING && now <= AUAUTUMN) {

				dayLight = 1;
			} else {
				dayLight = 0;
			}

			dst.push(dayLight);
		},


		//ACTION CANVAS

		getTime: function getTime() {

			var d = new Date();

			var digitSec = d.getUTCSeconds();

			var sec = digitSec * 6;

			opts.forEach(function (options, i) {

				var rad = options.diam / 2;

				/*
     * do not confuse with global rad although 
     * they are almost the same
     */

				var currentMin = options.timeZone === 'current' ? d.getMinutes() : d.getUTCMinutes();

				var currentHour = options.timeZone === 'current' ? d.getHours() : d.getUTCHours();

				digitMin = currentMin + timeZoneMins[i];

				digitHour = currentHour + timeZoneHours[i] + dst[i];

				methods.sanitizeHourMin();

				var min = digitMin * 6;

				var hour = digitHour * 30 + min / 12;

				arwCtxs[i].clearRect(0, 0, options.diam, options.diam);

				var xhour = rad + sin(hour) * options.arrowHLength;
				var yhour = rad - cos(hour) * options.arrowHLength;
				methods.drawArrow(xhour, yhour, options.arrowHWidth, options, arwCtxs[i]);

				var xmin = rad + sin(min) * options.arrowMLength;
				var ymin = rad - cos(min) * options.arrowMLength;
				methods.drawArrow(xmin, ymin, options.arrowMWidth, options, arwCtxs[i]);

				if (options.enableSecArrow) {
					var xsec = rad + sin(sec) * options.arrowSLength;
					var ysec = rad - cos(sec) * options.arrowSLength;

					var xtail = rad - sin(sec) * options.tailLength;
					var ytail = rad + cos(sec) * options.tailLength;

					var tail = {
						xtail: xtail,
						ytail: ytail
					};

					methods.drawArrow(xsec, ysec, options.arrowSWidth, options, arwCtxs[i], tail);
				}

				methods.drawTimeLabel(digitHour, digitMin, digitSec, options, lblCtxs[i]);

				methods.drawClockCenter(options, arwCtxs[i]);
				//console.log(hour + ':' + min + ':' + sec);
			});

			window.requestAnimationFrame(methods.getTime);
		},
		drawArrow: function drawArrow(x, y, width, options, context, sec) {
			context.beginPath();
			context.lineWidth = width;
			context.moveTo(options.diam / 2, options.diam / 2);
			context.lineTo(x, y);

			if (sec) {
				context.moveTo(options.diam / 2, options.diam / 2);
				context.lineTo(sec.xtail, sec.ytail);
			}

			context.strokeStyle = options.arrowColor;
			context.stroke();
			context.closePath();
		},
		drawClockCenter: function drawClockCenter(options, context) {
			/* 
    * clock center should cover arrow intersection what
    * would be impossible with underlying 'state'
    * canvas
    */
			context.beginPath();
			context.arc(options.diam / 2, options.diam / 2, options.centerDiam, 0, 2 * Math.PI);

			context.fillStyle = options.centerColor;

			context.fill();
		},
		sanitizeHourMin: function sanitizeHourMin() {
			if (digitMin < 0) {
				digitMin += 60;
				digitHour--;
			} else if (digitMin > 59) {
				digitMin -= 60;
				digitHour++;
			}

			if (digitHour < 0) {
				digitHour += 24;
			} else if (digitHour > 23) {
				digitHour -= 24;
			}
		},
		drawTimeLabel: function drawTimeLabel(hours, mins, secs, options, context) {
			if (context) {

				mins = mins < 10 ? '0' + mins : mins;
				secs = secs < 10 ? '0' + secs : secs;

				var fontSize = options.labelFontSize;
				var fsInt = parseInt(options.labelFontSize);
				var x = options.diam / 2;
				var y = fsInt / 2;

				context.beginPath();
				context.font = options.labelFontWeight + ' ' + fontSize + ' ' + options.labelFont;
				context.clearRect(0, 0, options.diam, fsInt);
				context.textAlign = 'center';
				context.textBaseline = 'middle';

				if (options.showDigitSec) {
					context.fillText(hours + ':' + mins + ':' + secs, x, y);
				} else {
					context.fillText(hours + ':' + mins, x, y);
				}

				context.fillStyle = options.labelColor;
			}
		}
	};

	var setclock = function setclock(slc, params) {

		draw = document.querySelector(slc);
		options = _extends({}, defaultOpt, params);

		ids.push(slc);
		opts.push(options);

		methods.init();
		methods.getTime();
	};

	window.setclock = setclock;
})();