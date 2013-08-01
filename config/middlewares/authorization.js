/*
 *  Generic require login routing middleware
 */

exports.requiresLogin = function(req,res,next){
	if(!req.isAuthenticated()){
		return res.send(401,{error:'Please login'});
	}
	next();
};

/*
 *  User authorizations routing middleware
 */

exports.user = {
	hasAuthorization: function(req,res,next){
		if(req.profile.id != req.user.id){
			return res.redirect('/users/' + req.profile.id);
		}
		next();
	}
};