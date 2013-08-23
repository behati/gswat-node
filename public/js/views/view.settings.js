(function(window,$,_,ich){
	_.extend(window.GSWAT.prototype.view_definitions,{
		settings: Backbone.View.extend({
			id: 'settings',

            events: {
                'click #addServerbtn' : 'add_server',
                'click .serverConnectBtn' : 'switch_server'
            },

			title: 'Settings',

			initialize: function(){
                this.model.on("change:last_fetch", this.render, this);
				this.subviews = {};
				//this.subviews.server_settings_view = PBF.get({view: {name: 'server_settings'},model: {name: 'server_model'}});
				var chat_model = PBF.get({model: {name: 'chat_model'}});
				this.subviews.chat_settings = PBF.get({view: {name: 'chat_settings'},model: chat_model});
			},

			render: function(){
                var servers = this.model.get('serverlist');
				this.$el.html(ich.tpl_settings(servers));
				this.render_sub_views();
				this.delegateEvents();
			},
            add_server: function(event) {


            },
            switch_server: function(event) {
                var ele = $(event.currentTarget)
                var id = ele.parent().siblings(':first').text();
                // spaghetti-code splitting
                var s = id.split('- ');
                var key = s[1].split(':');

                var data = {
                    ServerIP: key[0],
                    ServerPort: key[1]
                }

                var view = this;

                $.ajax({
                    type: 'PUT',
                    data: data,
                    url: '/api/server/setactive',
                    success: function(success){
                        $('.serverConnectBtn').removeClass('btn-success');
                        ele.toggleClass('btn-success');
                        $('#content').prepend('<div class="alert alert-success"> <button type="button" class="close" data-dismiss="alert">&times;</button> Successfully connected to ' + s[0] + '</div>').fadeIn(400);
                    },
                    error: function(error) {
                        PBF.alert({type: 'error',title: 'An error occurred:',message: error.responseText});
                    }
                });
            },
			render_sub_views: function(){
				var view = this;
				_.each(view.subviews,function(sub_view){
					view.$el.find('#' + sub_view.id).replaceWith(sub_view.render().el);
					sub_view.delegateEvents();
				});
			}
		}),

		chat_settings: Backbone.View.extend({
			events: {
				'click button.submit'                  : 'submit',
				'change #chat-auto-refresh-field input': 'change_switch',
				'change #toggle-message-types input'   : 'change_filters'
			},

			id: 'chat-settings',

			initialize: function(){
				this.model.on("change:auto_refresh",this.render,this);
			},

			submit: function(event){
				event.preventDefault();
				var val = parseInt(this.$el.find('#chat-interval-field').val());
				if(!isNaN(val) && val >= 1){
					this.model.set({'interval': val});
					PBF.alert({type: 'success',title: 'Success:',message: 'Interval updated!'});
				} else {
					PBF.alert({type: 'error',title: 'Error:',message: 'Please only enter a valid number bigger or equal to 1'});
				}
			},

			change_filters: function(event){
				var inputs = this.$el.find('#toggle-message-types').find('input');
				var filters = {};
				_.each(inputs,function(input){
					input = $(input);
					filters[input.attr('data-field')] = input.is(':checked');
				});
				this.model.set({message_filters: filters});
				PBF.alert({type: 'success',title: 'Success:',message: 'Filter updated!'});
			},

			change_switch: function(event){
				var ele = $(event.currentTarget);
				var val = {};
				val[ele.attr('data-field')] = ele.is(':checked');
				this.model.set(val);
				PBF.alert({type: 'success',title: 'Success:',message: 'Setting updated!'});
			},

			render: function(){
				this.$el.html(ich.tpl_chat_settings(this.model.toJSON()));
				return this;
			}
		}),

		server_settings: Backbone.View.extend({
			events: {
				'click button.submit': 'submit'
			},

			id: 'server-settings',

			initialize: function(){
				this.model.on('update_complete',this.toggle_submit,this);
				this.model.on('change:ServerIP',this.render,this);
			},

			submit: function(event){
				event.preventDefault();
				if(!$(event.currentTarget).hasClass('disabled')){
					this.toggle_submit();
					var form = this.$el.find('form').serializeArray();
					var values = {};
					_.each(form,function(input){
						values[input.name] = input.value;
					});
					this.model.set(values).trigger('submit');
				}
			},

			toggle_submit: function(){
				this.$el.find('button.submit').toggleClass('disabled');
			},

			render: function(){
				this.$el.html(ich.tpl_server_settings(this.model.toJSON()));
				return this;
			}
		})
	});
}(window,jQuery,_,ich));