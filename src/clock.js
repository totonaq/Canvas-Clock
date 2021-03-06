/*jshint esversion: 6 */

(function() {
	'use strict'

	let defaultOpt = {

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
		strokeLgLength: 20,
		strokeMdLength: 14,
		strokeSmLength: 8,
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
	
	let draw, //current div plugin initialized with
		ids = [], //array of divs plugin initialized with
		options, //current set of parameters
		opts = [], //array of parameters of each clock
		arwCtxs = [], //array of getContext() of arrows
		lblCtxs = [], //array of getContext() of labels

		timeZoneHours = [],
		timeZoneMins = [],
		dst = [],
		digitMin,
		digitHour,
		
		//diameter and radius of current clock
		diam, 
		rad, 
	
		lineWidth, //variable for width of clock's border

		//current context for clock face
		ctxFc; 

		

	function cos(rad) {
		return Math.cos(rad * Math.PI / 180);
	}
	function sin(rad) {
		return Math.sin(rad * Math.PI / 180);
	}
	function getEdge(year, startDay, finishDay, month, hour, weekday) {
		let edge;
		
		for (let day = startDay; day <= finishDay; day++) {
			
			if (new Date(year, month, day, hour).getDay() === weekday) {

				edge = Date.UTC(year, month, day, hour);

			}
		}
		return edge;
	}

	let methods = {
		init() {
			this.createCanvas();
			this.drawCircle();
			this.drawStrokes();
			this.drawNumerals();
			this.setTimeZone();
			this.setDayLightSavingTime();

		},

	//STATE CANVAS

		createCanvas() {
			diam = options.diam > 100 ? options.diam : 100;

			const canvas = document.createElement('canvas');
			let width = options.diam;
			let height = parseInt(options.labelFontSize);

			let cnvLabel, ctxLbl, ctxArw;
			
			draw.innerHTML = 
				"<canvas width='" + diam + 
				"' height='" + diam + "'></canvas>" + 
				"<canvas width='" + diam + 
				"' height='" + diam + "'></canvas>";

			draw.style.position = 'relative';
			
			draw.style.width = diam + 'px';

			
			let cnvFace = draw.querySelector('canvas');
			let cnvArrows = cnvFace.nextSibling;

			if ( options.timeLabel ) {
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
			
			if ( cnvLabel ) {
				ctxLbl = cnvLabel.getContext('2d'); //local
			} else {
				ctxLbl = null;
			}
			
			ctxFc = cnvFace.getContext('2d'); //global
			ctxArw = cnvArrows.getContext('2d'); //local

			arwCtxs.push(ctxArw);
			lblCtxs.push(ctxLbl);

		},

		drawCircle() {
			rad = diam/2;
			ctxFc.beginPath();
		
			ctxFc.strokeStyle = options.borderColor;

			if ( typeof options.borderWidth == 'number' && options.borderWidth > 0 ) {
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

		drawStrokes() {

			let lengthLg = options.strokeLgLength,
				lengthMd = options.strokeMdLength,
				lengthSm = options.strokeSmLength;

			if ( options.strokes ) {

				
				
				for ( let i = 0; i < 360; i += 6 ) {

					let x = cos(i) * (rad - 1.5 * lineWidth - options.strokeOffset) + rad;
					let y = sin(i) * (rad - 1.5 * lineWidth - options.strokeOffset) + rad;

					let xto, yto;

					ctxFc.beginPath();
					ctxFc.strokeStyle = options.strokeColor;

					if ( i % 90 === 0 ) {

						xto = cos(i) * (rad - lengthLg - 1.5 * lineWidth - options.strokeOffset) + rad;
						yto = sin(i) * (rad - lengthLg - 1.5 * lineWidth - options.strokeOffset) + rad;
						ctxFc.moveTo(x, y);
						ctxFc.lineWidth = options.strokeLgWidth;
						ctxFc.lineTo(xto, yto);

					} else if ( i % 30 === 0 && options.strokeMd ) {
						
						xto = cos(i) * (rad - lengthMd - 1.5 * lineWidth - options.strokeOffset) + rad;
						yto = sin(i) * (rad - lengthMd - 1.5 * lineWidth - options.strokeOffset) + rad;
						ctxFc.moveTo(x, y);
						ctxFc.lineWidth = options.strokeMdWidth;
						ctxFc.lineTo(xto, yto);
					
					} else if ( options.strokeSm ) {

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

		drawNumerals() {
			if ( options.numerals ) {

				ctxFc.beginPath();
				const ARABIC = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2];
				const ROMAN = ['III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'I', 'II'];
				let type;

				for ( let i = 0; i < 360; i += 30 ) {
					let xtxt = cos(i) * (rad - 1.5 * lineWidth - options.numeralOffset) + rad;
					let ytxt = sin(i) * (rad - 1.5 * lineWidth - options.numeralOffset) + rad;

					ctxFc.textAlign = "center";
					ctxFc.textBaseline = "middle";
					ctxFc.font = options.font;

					if ( options.numerals === 'roman' ) {
						type = ROMAN;
					} else {
						type = ARABIC;
					}

					ctxFc.fillStyle = options.numeralColor;

					ctxFc.fillText(type[i/30], xtxt, ytxt);
					
				}
			
			}
			
		},

		setTimeZone() {
			let min = 0, hour = 0, splitted;

			if ( options.timeZone && options.timeZone !== 'current' ) {

				splitted = options.timeZone.split(':');

				if ( !isNaN(splitted[0]) && 
						!isNaN(splitted[1]) &&
						splitted[0] <= 14 && 
						splitted[0] >= -12 &&
						(splitted[1] == 0 || 
						splitted[1] == 30 || 
						splitted[1] == 45) ) {

					hour = Number(splitted[0]);
					min = options.timeZone[0] === '-' ? -Number(splitted[1]) : Number(splitted[1]);
				}
				else {
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

		setDayLightSavingTime() {
			const CURRENTYEAR = new Date().getUTCFullYear();
 			
			const now = Date.now();

			const EUSPRING = getEdge(CURRENTYEAR, 25, 31, 2, 1, 0);
			const EUAUTUMN = getEdge(CURRENTYEAR, 25, 31, 9, 1, 0);

			const NASPRING = getEdge(CURRENTYEAR, 8, 14, 2, 2, 0);
			const NAAUTUMN = getEdge(CURRENTYEAR, 1, 7, 10, 2, 0);

			const AUSPRING = getEdge(CURRENTYEAR, 1, 7, 9, 7, 5);
			const AUAUTUMN = getEdge(CURRENTYEAR, 1, 7, 3, 1, 5);

			let dayLight = 0;
			if (!options.dayLightSavingTime) {
				dayLight = 0;
			} else if ( options.dayLightSavingTime === 'EU' ) {
				if (now >= EUSPRING && now <= EUAUTUMN) {
					dayLight = 1;
				} else {
					dayLight = 0;
				}

			} else if ( options.dayLightSavingTime === 'NA' ) {
				if (now >= NASPRING && now <= NAAUTUMN) {
					dayLight = 1;
				} else {
					dayLight = 0
				}

			} else if ( options.dayLightSavingTime === 'AUS' && now >= AUSPRING || now <= AUAUTUMN ) {
				if (now >= AUSPRING || now <= AUAUTUMN) {
					dayLight = 1;
				} else {
					dayLight = 10
				}
			}
			
			dst.push(dayLight);

		},

	//ACTION CANVAS
		
		getTime() {

			let d = new Date();

			let digitSec = d.getUTCSeconds();

			let sec = digitSec * 6;
			

			opts.forEach((options, i) => {

				let rad = options.diam / 2;

				/*
				 * do not confuse with global rad although 
				 * they are almost the same
				 */

				let currentMin = options.timeZone === 
				'current'? d.getMinutes() : d.getUTCMinutes();

				let currentHour = options.timeZone === 
				'current'? d.getHours() : d.getUTCHours();


				digitMin = currentMin + timeZoneMins[i];

				digitHour = currentHour + 
					timeZoneHours[i] + 
					dst[i];

				methods.sanitizeHourMin();


				let min = digitMin * 6;

				let hour = digitHour * 30 + min/12;

				arwCtxs[i].clearRect(0, 0, options.diam, options.diam);

				let xhour = rad + sin(hour) * options.arrowHLength;
				let yhour = rad - cos(hour) * options.arrowHLength;
				methods.drawArrow(xhour, yhour, options.arrowHWidth, options, arwCtxs[i]);

				let xmin = rad + sin(min) * options.arrowMLength;
				let ymin = rad - cos(min) * options.arrowMLength;
				methods.drawArrow(xmin, ymin, options.arrowMWidth, options, arwCtxs[i]);

				if ( options.enableSecArrow ) {
					let xsec = rad + sin(sec) * options.arrowSLength;
					let ysec = rad - cos(sec) * options.arrowSLength;

					let xtail = rad - sin(sec) * options.tailLength;
					let ytail = rad + cos(sec) * options.tailLength;

					let tail = {
						xtail,
						ytail
					};

					methods.drawArrow(xsec, ysec, options.arrowSWidth, options, arwCtxs[i], tail);
				}
				

				methods.drawTimeLabel(digitHour, digitMin, digitSec, options, lblCtxs[i]);

				methods.drawClockCenter(options, arwCtxs[i]);
				//console.log(hour + ':' + min + ':' + sec);
			});
			
			window.requestAnimationFrame(methods.getTime);
		},

		drawArrow(x, y, width, options, context, sec) {
			context.beginPath();
			context.lineWidth = width;
			context.moveTo(options.diam / 2, options.diam / 2);
			context.lineTo(x, y);

			if ( sec ) {
				context.moveTo(options.diam / 2, options.diam / 2);
				context.lineTo(sec.xtail, sec.ytail);
			}
			
			context.strokeStyle = options.arrowColor;
			context.stroke();
			context.closePath();
			
		},

		drawClockCenter(options, context) {
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

		sanitizeHourMin() {
			if ( digitMin < 0 ) {
				digitMin += 60;
				digitHour--;
			} else if ( digitMin > 59 ) {
				digitMin -= 60;
				digitHour++;
			}

			if ( digitHour < 0 ) {
				digitHour += 24;
			} else if ( digitHour > 23 ) {
				digitHour -= 24;
			}

		},

		drawTimeLabel(hours, mins, secs, options, context) {
			if (context) {

				mins = mins < 10 ? '0' + mins : mins;
				secs = secs < 10 ? '0' + secs : secs;

				let fontSize = options.labelFontSize;
				let fsInt = parseInt(options.labelFontSize);
				let x = options.diam / 2;
				let y = fsInt / 2;
		
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

	let setclock = (slc, params) => {

		draw = document.querySelector(slc);
		options = Object.assign({}, defaultOpt, params);

		ids.push(slc);
		opts.push(options);

		methods.init();
		methods.getTime();
			
	};
	
	window.setclock = setclock;

}());