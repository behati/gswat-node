var common = {
    appName:'gswat-node',
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
        account: 'devgswatenzo',
        accesskey: 'zAm4nwdwBdH7V/2Lq61zUmy77omV3H6Y8iIqJTrNY4gI+gPWBTi1Grm4fZ3unfEqgw05fSa1rmRmugU9O6/O8A=='
    }
};
