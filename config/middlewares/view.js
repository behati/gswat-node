module.exports = function(config){
	return function(req,res,next){
		res.locals.appName = config.app.name;
		res.locals.version = config.common.version;
		res.locals.title = 'NodeJS Web App';
		res.locals.req = req;
		next();
	}
};