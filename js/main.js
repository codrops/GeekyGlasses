/**
 * main.js
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * 
 * Copyright 2017, Codrops
 * http://www.codrops.com
 */
;(function(window) {

	'use strict';

	// Helper vars and functions.
	// from http://www.quirksmode.org/js/events_properties.html#position
	function getMousePos(e) {
		var posx = 0, posy = 0;
		if (!e) var e = window.event;
		if (e.pageX || e.pageY) 	{
			posx = e.pageX;
			posy = e.pageY;
		}
		else if (e.clientX || e.clientY) 	{
			posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
			posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
		}
		return { x : posx, y : posy }
	}
	
	// The grid product items.
	var gridItems = [].slice.call(document.querySelectorAll('.grid > .grid__item > .grid__link')),
		// The total amount of items.
		itemsTotal = gridItems.length,
		// Index of the item being currently viewed.
		current = -1,
		// The container for the sunglasses lookthrough preview.
		vision = document.querySelector('.vision'),
		// The white revealer element.
		swoosh = vision.querySelector('.vision__swoosh'),
		// All the previews.
		items = [].slice.call(vision.querySelectorAll('.vision__items > .vision__item')),
		// The navigation container.
		nav = vision.querySelector('nav'),
		// The navigation controls.
		navctrls = {
			prev: nav.querySelector('.nav__arrows > .btn--prev'),
			next: nav.querySelector('.nav__arrows > .btn--next'),
			toggle: nav.querySelector('button.btn--hide')
		},
		// Back to grid view control.
		backCtrl = vision.querySelector('button.btn--grid'),
		// The small preview glasses.
		navItems = nav.querySelectorAll('.nav__items > .nav__item'),
		// Check if navigating.
		isNavigating,
		// The main background image.
		bgEl = vision.querySelector('.vision__background'),
		// Modes ctrls.
		modesCtrls = [].slice.call(vision.querySelectorAll('.modes > button')),
		// Current mode ctrl.
		modesCtrlsCurrent = vision.querySelector('.modes > button.mode--current'),
		// Current mode.
		bgmode = modesCtrlsCurrent.getAttribute('data-bg'),
		// Flass animation elem.
		flash = vision.querySelector('.vision__flash'),
		// Animation end event handler.
		onEndAnimation = function(el, callback) {
			var onEndCallbackFn = function(ev) {
				this.removeEventListener('animationend', onEndCallbackFn);
				if( callback && typeof callback === 'function' ) { callback.call(); }
			};
			el.addEventListener('animationend', onEndCallbackFn);
		},
		win = {width: window.innerWidth, height: window.innerHeight},
		lookCool, glassesOn;

	/**
	 * Init things..
	 */
	function init() {
		initEvents();
	}

	/**
	 * Init/Bind events.
	 */
	function initEvents() {
		// Grid items click will open the lookthrough preview area for the selected item/sunglasses.
		// Need to update the current value.
		gridItems.forEach(function(item, pos) {
			item.addEventListener('click', function(ev) {
				ev.preventDefault();
				// Update current.
				current = pos;
				// Opens the lookthrough preview.
				openPreview();
			});
		});

		// Navigating through the items.
		navctrls.next.addEventListener('click', function() {navigate('next');});
		navctrls.prev.addEventListener('click', function() {navigate('prev');});

		// Glasses on/off.
		navctrls.toggle.addEventListener('click', toggleGlasses);

		// Back to grid view.
		backCtrl.addEventListener('click', closePreview);

		// Changing the bg image.
		modesCtrls.forEach(function(ctrl) {
			ctrl.addEventListener('click', switchMode);
		});
	}

	/**
	 * Opens the lookthrough preview and shows the details for the selected item
	 */
	function openPreview() {
		// Selected item.
		var item = items[current],
			// The item's overlay bgcolor/glasses.
			itemOverlay = item.querySelector('.vision__overlay');

		// Swoosh animates in.
		vision.classList.add('vision--swooshIn');
		// After the swoosh animation:
		onEndAnimation(swoosh, function() {
			initTilt();
			// And loader gets shown.
			vision.classList.add('vision--loading');
			// After some time.. (TODO: ideally when the background image is loaded!)
			setTimeout(function() {
				// Loader gets hidden.
				vision.classList.remove('vision--loading');
				// Swoosh hides and reveals current item's preview.
				vision.classList.add('vision--loaded');
				vision.classList.add('vision--swooshOut');
				// After the swoosh animation:
				onEndAnimation(swoosh, function() {
					// Remove the show class.
					vision.classList.remove('vision--swooshIn');
					vision.classList.remove('vision--swooshOut');
					// Content animates in.
					item.classList.add('vision__item--current');
					// Overlay/lookthrough animation trigger.
					itemOverlay.classList.add('vision__overlay--animIn');

					onEndAnimation(itemOverlay, function() { glassesOn = true; });
				});
			}, 1000);
		});

		// Add current class to the respective navigation item.
		navItems[current].classList.add('nav__item--current');
	}

	/**
	 * Closes the lookthrough preview. Back to grid view.
	 */
	function closePreview() {
		// Selected item.
		var item = items[current],
			// The item's overlay bgcolor/glasses.
			itemOverlay = item.querySelector('.vision__overlay');

		// Swoosh animates in.
		vision.classList.add('vision--swooshIn');
		onEndAnimation(swoosh, function() {
			if( !glassesOn ) {
				navctrls.toggle.classList.remove('btn--active');
				itemOverlay.classList.remove('vision__overlay--hide');
			}
			else {
				glassesOn = false;
			}
			item.classList.remove('vision__item--current');
			itemOverlay.classList.remove('vision__overlay--animIn');
			navItems[current].classList.remove('nav__item--current');

			vision.classList.remove('vision--loaded');
			vision.classList.remove('vision--swooshIn');
			vision.classList.add('vision--swooshOut');
			onEndAnimation(swoosh, function() {
				vision.classList.remove('vision--swooshOut');
			});
		});
	}

	/**
	 * Navigating through the items.
	 */
	function navigate(dir) {
		// Check if navigating
		if( isNavigating ) { return false; }
		isNavigating = true;

		// The current item, its overlay and the  current navItem.
		var currentItem = items[current],
			currentItemOverlay = currentItem.querySelector('.vision__overlay'),
			currentNavItem = navItems[current];

		// Reset the toggle glasses button state.
		if( !glassesOn ) {
			navctrls.toggle.classList.remove('btn--active');
			// And reset the current item's overlay hide class.
			currentItemOverlay.classList.remove('vision__overlay--hide');
			glassesOn = true;
		}

		// Update the current.
		if( dir === 'next' ) {
			current = current < itemsTotal - 1 ? current + 1 : 0; 
		}
		else {
			current = current > 0 ? current - 1 : itemsTotal - 1;
		}

		// The next item, its overlay and the next navItem.
		var nextItem = items[current],
			nextItemOverlay = nextItem.querySelector('.vision__overlay'),
			nextNavItem = navItems[current];

		// Reset current item classes.
		currentItem.classList.remove('vision__item--current');
		currentItemOverlay.classList.remove('vision__overlay--animIn');
		
		// Hide current item.
		currentItemOverlay.classList.add('vision__overlay--animOut');
		// And then reset class and show next item.
		onEndAnimation(currentItemOverlay, function() {
			// reset class.
			currentItemOverlay.classList.remove('vision__overlay--animOut');
		});

		// Show next item.
		nextItemOverlay.classList.add('vision__overlay--animIn');
		// Add current class when all is finished.
		onEndAnimation(nextItemOverlay, function() {
			nextItem.classList.add('vision__item--current');
		});

		// Animate the navigation items.
		currentNavItem.classList.add(dir === 'next' ? 'nav__item--animOutDown' : 'nav__item--animOutUp');
		nextNavItem.classList.add(dir === 'next' ? 'nav__item--animInDown' : 'nav__item--animInUp');
		// Reset classes when the animations end.
		onEndAnimation(currentNavItem.querySelector('.nav__item-slide--title'), function() {
			currentNavItem.classList.remove('nav__item--current');
			nextNavItem.classList.add('nav__item--current');
			currentNavItem.classList.remove(dir === 'next' ? 'nav__item--animOutDown' : 'nav__item--animOutUp');
			nextNavItem.classList.remove(dir === 'next' ? 'nav__item--animInDown' : 'nav__item--animInUp');
			isNavigating = false;
		});
	}

	/**
	 * Toggle the glasses.
	 */
	function toggleGlasses() {
		// The current item's overlay.
		var currentItemOverlay = items[current].querySelector('.vision__overlay');
		// Animate glasses frame in again.
		currentItemOverlay.classList.toggle('vision__overlay--animIn');
		// Hide/Fade out the overlay.
		currentItemOverlay.classList.toggle('vision__overlay--hide');
		// Toggle the button state.
		navctrls.toggle.classList.toggle('btn--active');

		glassesOn = !glassesOn;
	}

	/**
	 * Init the tilt effect.
	 */
	function initTilt() {
		window.addEventListener('mousemove', mousemoveFn);
		window.addEventListener('resize', resizeFn);
	}

	/**
	 * Remove the tilt transform.
	 */
	function removeTilt() {
		bgEl.style.WebkitTransform = bgEl.style.transform = 'translate3d(0,0,0)';
		window.removeEventListener('mousemove', mousemoveFn);
		window.removeEventListener('resize', resizeFn);
	}

	/**
	 * Change bg image.
	 */
	function switchMode(ev) {
		var mode = ev.target.getAttribute('data-bg');
		if( mode === bgmode ) {
			return false
		}
		bgmode = mode;

		flash.classList.add('vision__flash--animIn');
		onEndAnimation(flash, function() {
			vision.querySelector('.vision__background-img--current').classList.remove('vision__background-img--current');
			vision.querySelector('.vision__background-img--' + bgmode).classList.add('vision__background-img--current');
			modesCtrlsCurrent.classList.remove('mode--current');
			modesCtrlsCurrent = ev.target;
			modesCtrlsCurrent.classList.add('mode--current');

			flash.classList.remove('vision__flash--animIn');
			flash.classList.add('vision__flash--animOut');
			onEndAnimation(flash, function() { flash.classList.remove('vision__flash--animOut'); });
		});
	}

	/**
	 * Mousemove event.
	 */
	function mousemoveFn(ev) {
		requestAnimationFrame(function() {
			// Mouse position relative to the document.
			var mousepos = getMousePos(ev),
				// Document scrolls.
				docScrolls = {left : document.body.scrollLeft + document.documentElement.scrollLeft, top : document.body.scrollTop + document.documentElement.scrollTop},
				// Mouse position relative to the main element.
				relmousepos = { x : mousepos.x - docScrolls.left, y : mousepos.y - docScrolls.top },
				// Translation value.
				tVal = {
					x: 0.2*win.width/win.width*relmousepos.x - 0.1*win.width,
					y: 0.2*win.height/win.height*relmousepos.y - 0.1*win.height,
				};

			// Move glasses down if reaching the bottom limit of the page.
			if( glassesOn ) {
				var currentItemOverlay = items[current].querySelector('.vision__overlay');
				if( relmousepos.y > win.height - 40 /* 3em*16 = 48px - a margin of 8 px so that it's always under the navigation */ ) {
					lookCool = true;
					currentItemOverlay.classList.add('vision__overlay--hide');
					currentItemOverlay.classList.add('vision__overlay--animCoolIn');
					currentItemOverlay.classList.remove('vision__overlay--animCoolOut');
				}
				else if( lookCool ){
					lookCool = false;
					currentItemOverlay.classList.remove('vision__overlay--hide');
					currentItemOverlay.classList.remove('vision__overlay--animCoolIn');
					currentItemOverlay.classList.add('vision__overlay--animCoolOut');
					onEndAnimation(currentItemOverlay, function() {currentItemOverlay.classList.remove('vision__overlay--animCoolOut');});
				}
			}

			bgEl.style.WebkitTransform = bgEl.style.transform = 'translate3d(' + -1*tVal.x + 'px, ' + -1*tVal.y + 'px, 0)';
		});
	}

	/**
	 * Resize event.
	 */
	function resizeFn() {
		requestAnimationFrame(function() {
			// Update window sizes.
			win = {width: window.innerWidth, height: window.innerHeight};
		});
	}

	init();

})(window);
