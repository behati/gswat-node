var common = {
    appName:'Inventory Management',
	version:'1.0'
};

module.exports = {
    development:{
        root:require('path').normalize(__dirname + '/..'),
        app:{
            name:'DEV - ' + common.appName
        },
        common:common,
		cipher: ['aes-256-cbc','kadk123lk23a23s3lk4a1s123dklasad3212331sd']
    },
    staging:{
		root:require('path').normalize(__dirname + '/..'),
		app:{
			name:'STAGE ' + common.appName
		},
		common:common,
		cipher: ['aes-256-cbc','kadk123lk23a23s3lk4a1s123dklasad3212331sd']
    },
    production:{
		root:require('path').normalize(__dirname + '/..'),
		app:{
			name:common.appName
		},
		common:common,
		cipher: ['aes-256-cbc','5vRawYJPPhDMAyE4fE4vyBvECdjDSZQvJq2monU1vJM=']
    }
};
