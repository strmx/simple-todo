define(['jquery', 'underscore', 'app/TodoStorage'], function($, _, TodoStorage) {

	/**
	 * Todo Application
	 * class
	 * @param {$} appRoot [.todo]
	 */

	function TodoApp(appRoot) {
		this.appRoot = appRoot;
		this.listRoot = appRoot.find('.task-list ul').eq(0);
		this.storage = new TodoStorage();
		this.tasksData = this.storage.loadTaskData();
		this.tasks = {};
		/**
		 * Filter mode - [*|active|completed]
		 * @type {String}
		 */
		this.filter = '*';
		// view
		var taskTemplate = '<li class="task"><input type="checkbox" id="<%= id %>" name="<%= id %>" value="done" <%= checked %>><span class="box checkable <%= checked %>"></span><span class="checkable label <%= checked %>"><%= text %></span><span class="close-x"></span></li>';
		this.taskTemplater = _.template(taskTemplate);
		this.viewAllButton = appRoot.find('.view-all');
		this.viewActiveButton = appRoot.find('.view-active');
		this.viewCompletedButton = appRoot.find('.view-completed');
		this.viewButtons = appRoot.find('.status-bar a');

		this.leftCountElement = appRoot.find('.task-left');
		this.completeCountElement = appRoot.find('.task-complete');
		//
		// bind listeners
		appRoot.find('.add-button').click($.proxy(this.createTask, this));
		this.viewAllButton.click($.proxy(this.filterAll, this));
		this.viewActiveButton.click($.proxy(this.filterActive, this));
		this.viewCompletedButton.click($.proxy(this.filterCompleted, this));

		this.restoreState();
	}
	TodoApp.prototype.restoreState = function() {
		var id, data;
		for (id in this.tasksData) {
			data = this.tasksData[id];
			this.createTaskView(data);
		}

		this.applyFilter();
		this.updateStatus();
		this.updateHeight(true);
	}
	TodoApp.prototype.filterAll = function(e) {
		this.viewButtons.removeClass('active');
		this.viewAllButton.addClass('active');
		this.filter = '*';
		this.applyFilter();
		this.updateHeight();
		e.preventDefault();
	}
	TodoApp.prototype.filterActive = function(e) {
		this.viewButtons.removeClass('active');
		this.viewActiveButton.addClass('active');
		this.filter = 'active';
		this.applyFilter();
		this.updateHeight();
		e.preventDefault();
	}
	TodoApp.prototype.filterCompleted = function(e) {
		this.viewButtons.removeClass('active');
		this.viewCompletedButton.addClass('active');
		this.filter = 'completed';
		this.applyFilter();
		this.updateHeight();
		e.preventDefault();
	}
	TodoApp.prototype.applyFilter = function() {
		var id, task, done, displayValue, filter = this.filter;
		for (id in this.tasks) {
			task = this.tasks[id];
			done = task.done;
			if ((filter === 'active' && done) || (filter === 'completed' && !done)) {
				displayValue = 'none';
			} else {
				displayValue = 'block';
			}
			task.element.css('display', displayValue);
		}
	}
	TodoApp.prototype.editTask = function(e, task) {
		var taskLabel = prompt("Edit the task", task.text);
		if (!taskLabel) {
			return;
		}
		task.text = taskLabel;
		task.data.text = taskLabel;
		task.label.text(taskLabel);

		this.save();
		e.preventDefault();
	}
	TodoApp.prototype.createTask = function(e) {
		var taskLabel = prompt("what needs to be done?", "task");
		if (!taskLabel) {
			return;
		}
		//
		// create new task
		var taskData = {
			id: 'T' + new Date().getTime().toString(27).toUpperCase(),
			text: taskLabel,
			done: false
		};
		this.tasksData[taskData.id] = taskData;
		this.createTaskView(taskData);

		this.save();
		this.updateStatus();
		this.applyFilter();
		this.updateHeight();
		e.preventDefault();
	};
	TodoApp.prototype.createTaskView = function(data) {
		var task = $.extend({
			data: data
		}, data),
			element = $(this.taskTemplater($.extend({
				checked: data.done ? 'checked' : ''
			}, data)));

		this.listRoot.prepend(element);
		task.element = element;
		task.input = element.find('input[type="checkbox"]').eq(0);
		task.box = element.find('.box').eq(0);
		task.label = element.find('.label').eq(0);
		task.checkable = element.find('.checkable');
		task.close_btn = element.find('.close-x').eq(0);
		this.tasks[task.id] = task;
		//
		// bind listeners
		task.box.on('click', (function(task, self) {
			return function(e) {
				self.toggleTaskDone(e, task);
			};
		})(task, this));
		task.close_btn.on('click', (function(task, self) {
			return function(e) {
				self.removeTask(e, task);
			};
		})(task, this));
		task.label.on('dblclick', (function(task, self) {
			return function(e) {
				task.label.blur();
				self.editTask(e, task);
			};
		})(task, this));
	}
	TodoApp.prototype.toggleTaskDone = function(e, task) {
		var input = task.input,
			isDone = !input.prop('checked');
		task.done = isDone;
		task.data.done = isDone;

		if (isDone) {
			task.checkable.addClass('checked');
		} else {
			task.checkable.removeClass('checked');
		}
		input.prop('checked', isDone);
		input.change();

		this.save();
		this.updateStatus();
		this.applyFilter();
		this.updateHeight();
		e.preventDefault();
	};
	TodoApp.prototype.removeTask = function(e, task) {
		task.box.off();
		task.close_btn.off();
		task.element.remove();
		delete this.tasks[task.id];
		delete this.tasksData[task.id];

		this.save();
		this.updateStatus();
		this.updateHeight();
		e.preventDefault();
	};
	TodoApp.prototype.updateStatus = function() {
		var id, task, leftCount = 0,
			doneCount = 0;
		for (id in this.tasks) {
			task = this.tasks[id];
			if (task.done) {
				doneCount++;
			} else {
				leftCount++;
			}
		}
		this.leftCountElement.text(leftCount);
		this.completeCountElement.text(doneCount);
	};
	TodoApp.prototype.updateHeight = function(withoutAnimation) {
		var id, el, height = 0;
		for (id in this.tasks) {
			el = this.tasks[id].element;
			if (el.css('display') === 'block') {
				height += el.height();
			}
		}
		this.listRoot.stop();
		this.listRoot.animate({
			'height': height
		}, withoutAnimation ? 0 : 100);
	};
	TodoApp.prototype.save = function() {
		this.storage.saveTaskData(this.tasksData);
	};

	return TodoApp;
});