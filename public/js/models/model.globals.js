(function(window,$,_){
	var modal = Backbone.Model.extend({
		defaults: {
			'button'     : 'primary',
			'button-text': 'Confirm',
			'title'      : 'Confirm',
			'message'    : "Please confirm your selection"
		}
	});

	var alert = Backbone.Model.extend({
		defaults: {
			'type'   : 'info',
			'title'  : 'Alert!',
			'message': "This is an alert"
		}
	});

	var header = Backbone.Model.extend({
		defaults: {
			version: '0.0.6',
			name   : 'GSWAT'
		}
	});

	var footer = Backbone.Model.extend({
		defaults: {
			year     : '0',
			copyright: 'GSWAT',
			github   : 'https://github.com/Pure-Battlefield/gswat-node'
		},

		initialize: function(){
			var d = new Date();
			this.set({year: d.getFullYear()});
		}
	});

    var settings = Backbone.Model.extend({
        defaults: {
            'server_list_url'    : '/api/server/list',
            'serverlist'         : [],
            'last_fetch'         : 0
        },
        initialize: function(){
            this.get_servers();
        },
        get_servers: function() {

            var model = this;
            var url = this.get('server_list_url');
            $.ajax({
                type: 'GET',
                url: url,
                success: function (data, status) {

                    model.set({ 'serverlist': [] });

                    if (status != "nocontent") {

                        for (var key in data) {
                            // add the data to the appList array
                            model.get('serverlist').push(data[key]);
                        }
                        var last = model.get('last_fetch');
                        model.set({'last_fetch':last+1 });

                    } else {

                        // No content
                    }

                },
                error: function (error) {
                    PBF.alert({type: 'error',title: 'An error occurred',message: error});
                }

            })
        }
    })

	_.extend(window.GSWAT.prototype.model_definitions,{modal: modal,alert: alert,header: header,footer: footer, settings: settings});
}(window,jQuery,_));