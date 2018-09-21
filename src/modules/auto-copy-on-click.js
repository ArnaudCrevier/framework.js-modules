/**
 *  @author Deux Huit Huit
 *
 */
(function ($, undefined) {
	
	'use strict';

	var site = $('#site');
	var sels = {
		toCopy: '.js-text-to-copy',
		copyBtn: '.js-copy-on-click-btn',
		message: '.js-confirm-message'
	};
	var timer = null;

	var onClick = function () {
		var delay = 1500;
		
		site.find(sels.toCopy).each(function () {
			var t = $(this);
			t.select();
			document.execCommand('copy');
		});

		App.modules.notify('changeState.update', {
			item: site.find(sels.message),
			state: 'visible',
			action: 'on'
		});

		clearTimeout(timer);
		timer = setTimeout(function () {
			App.modules.notify('changeState.update', {
				item: site.find(sels.message),
				state: 'visible',
				action: 'off'
			});
		}, delay);
	};

	var init = function () {
		site.on(App.device.events.click, sels.copyBtn, onClick);
	};
	
	App.modules.exports('auto-copy-on-click', {
		init: init
	});
	
})(jQuery);
