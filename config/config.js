var common = {
    appName:'GSWAT',
	version:'0.0.1'
};

module.exports = {
    development:{
        root:require('path').normalize(__dirname + '/..'),
        app:{
            name:'DEV - ' + common.appName
        },
        common:common
    },
    staging:{
		root:require('path').normalize(__dirname + '/..'),
		app:{
			name:'STAGE ' + common.appName
		},
		common:common
    },
    production:{
		root:require('path').normalize(__dirname + '/..'),
		app:{
			name:common.appName
		},
		common:common
    },
    azure: {
        account: 'youraccount',
        accesskey: 'yourpassword'
    }
};
