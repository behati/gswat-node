(function(window,$,_,ich){
	_.extend(window.GSWAT.prototype.view_definitions,{
		home: Backbone.View.extend({
			id: 'home',

			title: 'GSWAT Home',

			render: function(){
				this.$el.html(ich.tpl_home());
			}
		})
	});
}(window,jQuery,_,ich));