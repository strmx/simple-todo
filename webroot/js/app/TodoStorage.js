define([!window.localStorage ? 'storage' : undefined], function() {

	function Storage() {
		this.storageId = "TodoApp5555";
	}
	Storage.prototype.loadTaskData = function() {
		var raw = window.localStorage ? localStorage.getItem(this.storageId) : null;
		if (raw) {
			return JSON.parse(raw);
		}
		return {};
	};
	Storage.prototype.saveTaskData = function(tasks) {
		if (window.localStorage) {
			localStorage.setItem(this.storageId, JSON.stringify(tasks));
		}
	};

	return Storage;
});