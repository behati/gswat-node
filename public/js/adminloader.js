$(function (window, $, yepnope) {
	"use strict";
	var ichUrl = '/js/libraries/icanhaz-0.10.5.js';
	var load_files = [
		// Libraries
		'/js/libraries/mustache-0.7.3.js',
		ichUrl,
		'/js/libraries/jquery-ui-1.10.3.custom.min.js',
		'/js/libraries/bootstrap.min.js',
		'/js/libraries/moment-2.0.0.min.js',
		'/js/libraries/underscore-1.5.1.min.js',
		'/js/libraries/backbone-1.0.0.min.js',
		'/js/libraries/backbone.validate.js',
		// CSS
		'/css/ui-lightness/jquery-ui-1.10.3.custom.min.css',
		'/css/font-awesome.min.css',
		// Core
		'/js/main.js',
		'/js/lib.js',
		'/js/router.js',
		// Models & Views
		'/js/views/view.account.js',
'/js/views/view.chat.js',
'/js/views/view.globals.js',
'/js/views/view.home.js',
'/js/views/view.map-rotation.js',
'/js/views/view.settings.js',
'/js/models/model.account.js',
'/js/models/model.chat.js',
'/js/models/model.globals.js',
'/js/models/model.map-rotation.js',
'/js/models/model.server.js'

	];
	var increment = 100 / load_files.length;
	yepnope({
		load: load_files,
		callback: function(url,r,i){
			if(url === ichUrl){
				ich.grabTemplates();
			}
			$('#progress-bar-inner').stop().animate({width: ((increment * (parseInt(i) + 1)) + '%')})
		},
		complete: function(){
			window.setTimeout(function(){
				$('#loading').slideUp(function(){
					var PBF = new window.GSWAT();
					$(this).remove();
					_.extend(window,{PBF:PBF});
					PBF.init({CDN : '/'});
				});
			},1000);
		}
	});
}(window,$,yepnope));