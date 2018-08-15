/**
 *  @author Deux Huit Huit
 *
 *  Auto Invisible ReCaptcha
 *
 *  @requires
 *    https://www.google.com/recaptcha/api.js?onload=GoogleReCaptchaCallback&amp;render=explicit
 *    https://github.com/SagaraZD/google_recaptcha
 *    In the form
 *    <input type="hidden" name="fields[google_recaptcha]" class="js-recaptcha-response" />
 *    On the button
 *    <add class="js-recaptcha" />
 *    <set data-sitekey="{/data/params/recaptcha-sitekey}" />
 *    Optional
 *    <set data-size="invisible" />
 *    <set data-badge="inline" />
 */
(function ($, undefined) {
	'use strict';

	var site = $('#site');
	var options = {
		target: '.js-recaptcha-response',
		trigger: '.js-recaptcha',
		prefix: 'g-recaptcha-'
	};
	var page = null;
	var loaded = false;
	var ids = 0;

	var load = function () {
		if (!loaded || !page) {
			return;
		}
		page.find(options.trigger).each(function () {
			var t = $(this);
			if (t.attr('id')) {
				return;
			}
			var id = options.prefix + (++ids);
			t.attr('id', id);
			var wid = window.grecaptcha.render(id, {
				sitekey: t.attr('data-sitekey'),
				badge: t.attr('data-badge') || 'inline',
				callback: function (result) {
					page.find(options.target).val(result);
					App.mediator.notify('recaptcha.updated', {
						result: result,
						lastTarget: t
					});
				}
			});
			t.data(options.prefix, wid);
		});
	};

	var resolveCaptchaId = function (data) {
		var id = (!!data && data.id) || undefined;
		if (!id && !!data && data.ctn) {
			id = data.ctn.find(options.trigger).data(options.prefix);
		}
		return id;
	};

	var onForceUpdate = function (key, data) {
		try {
			var id = resolveCaptchaId(data);
			if (!!window.grecaptcha) {
				window.grecaptcha.reset(id);
			} else {
				App.log('Recaptcha Lib not found');
			}
		} catch (e) {
			App.log('Recaptcha Force update fail with error');
		}
	};

	var onExecute = function (key, data) {
		try {
			var id = resolveCaptchaId(data);
			if (!!window.grecaptcha) {
				if (!window.grecaptcha.getResponse(id)) {
					window.grecaptcha.execute(id);
					return true;
				} else {
					App.log('Recaptcha already executed');
				}
			} else {
				App.log('Recaptcha Lib not found');
			}
		} catch (e) {
			App.log('Recaptcha executed with error');
		}
		return false;
	};

	var pageEnter = function (key, data) {
		if (!!data.page) {
			page = $(data.page.key());
		} else if (!!data.article) {
			page = $(data.article);
		}
		load();
	};

	var init = function () {
		window.GoogleReCaptchaCallback = function () {
			loaded = true;
			load();
		};
	};

	var actions = function () {
		return {
			page: {
				enter: pageEnter
			},
			articleChanger: {
				enter: pageEnter
			},
			recaptcha: {
				forceUpdate: onForceUpdate,
				execute: onExecute
			}
		};
	};

	App.modules.exports('auto-invisible-recaptcha', {
		init: init,
		actions: actions
	});

})(jQuery);
