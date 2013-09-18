require.config({
	baseUrl: 'js',
	paths: {
		jquery: 'vendor/jquery-1.10.2.min',
		underscore: 'vendor/underscore-min',
		cookie: 'vendor/jquery.cookie',
		json: 'vendor/json2',
		storage: 'vendor/storage'
	},
	shim: {
		underscore: {
			exports: '_'
		},
		json: {
			exports: 'JSON'
		}
	}
});


require([!window.JSON ? 'json' : undefined], function() {

	require(["jquery", 'app/TodoApp'], function($, TodoApp) {
	
		$(function() {
			var todoApp = new TodoApp($('.todo').eq(0));
		});
	});
});