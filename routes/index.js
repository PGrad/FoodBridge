var express = require('express');
var router = express.Router();
var mongo = require('mongodb');

/* GET home page. */
router.get('/', function(req, res, next) {
	console.log(app.locals.user);
	if(app.locals.user != null){
		if (app.locals.user.organization == "Donor"){
			res.redirect("/donor")
		} else {
			res.redirect("/posts")
		}
	}

	res.render('index');
});

router.get('/logout', function(req, res, next) {
	app.locals.user = null;
	res.redirect("/");
});

router.post('/donor/login', function(req, res){
	var accnt = req.db.collection("account");
	accnt.find({email: req.body.email}).toArray(function(err, record){
		if(err){
			console.log("couldn't find record, redirecting");
			res.redirect("../");
		}
		else{
			console.log(record[0].password);
			console.log(req.body.password);
			if(record[0].password == req.body.password){
				console.log("password correct");
				app.locals.user = record[0];
				res.redirect("../donor");
			}
			else{
				console.log("password wrong");
				res.redirect("../");
			}

		}
	})
})

router.post('/charity/login', function(req, res){
	var accnt = req.db.collection("account");
	accnt.find({email: req.body.email}).toArray(function(err, record){
		if(err){
			console.log("couldn't find record, redirecting");
			res.redirect("../");
		}
		else{
			console.log(record[0].password);
			console.log(req.body.password);
			console.log(record[0]);
			if(record[0].password == req.body.password){
				console.log("password correct");
				app.locals.user = record[0];
				res.redirect("../posts");
			}
			else{
				console.log("password wrong");
				res.redirect("../");
			}
		}
	})
});

router.post('/register', function(req, res){
	var orgs = req.db.collection("organization");
	var accnt = req.db.collection("account");
	var account = {
		name: req.body.orgname,
		email: req.body.email,
		password: req.body.password,
		organization: req.body.role,
		address: req.body.address,
		website: req.body.website
	}
	var organization = {
		type: req.body.role,
		name: req.body.orgname,
		email: req.body.email,
		password: req.body.password,
		address: req.body.address,
		website: req.body.website
	}
	console.log(account);
	accnt.find({email: req.body.email} , function(err, record){
		if(err){
			console.log("couldn't find record, redirecting");
			res.redirect("../");
		}
		else{
			if(record.length){
				console.log("Account already made for this email");
			}
			else{
				accnt.insert(account, function(err, data){
				console.log("Inserting account record");
				app.locals.user = account;
				});
			}
		}
	})
	orgs.find({email: req.body.email} , function(err, record){
		if(err){
			console.log("couldn't find record, redirecting");
			res.redirect("../");
		}
		else{
			if(record.length){
				console.log("Account already made for this email");
				res.redirect("../");
			}
			else{
				orgs.insert(organization, function(err, data){
				console.log("Inserting organization record");

				res.redirect("../");
				});
			}
		}
	})
});

router.get('/posts', function(req, res, next) {
	var posts = req.db.collection("order").find({status: "open"}).toArray(function(err, results){
		console.log(app.locals.user);
		res.render('posts', {posts: results.reverse(), user: app.locals.user});
	});
});

router.get('/post/new', function(req, res, next){
	res.render('post/index', {user: app.locals.user});
});

router.post('/post/new', function(req, res, next){
	var newPost = {
		food_type: "none",
		title: req.body.title,
		pickup_location: req.body.location,
		time: req.body.time_type,
		quantity: req.body.quantity,
		rating: 0,
		organization: app.locals.user.name,
		description: req.body.description,
		claimant: "none",
		expired: false,
		phone: req.body.phone,
		status: "open",
		created: new Date()
	};
	console.log(newPost);
	req.db.collection("order").insert(newPost, function(err, records){
  	console.log("Record added as "+records);
	});
	res.redirect('../donor');
});

router.post('/post/update', function(req, res){
	var id = new mongo.ObjectID(req.body.id);
	var stat = req.body.stat;
	var posts = req.db.collection("order");
	console.log(id);
	console.log(stat);
	console.log(req.body);
	posts.find({ _id: id}).toArray(function(err, results){
		if(err){
			console.log(err.status);
		}
		else if(results.length){

			posts.update({_id: id}, {$set: {status: stat}}, function(err, data){
				if(err){
					console.log("err: " + error.status);
				}
				else{
					console.log("changed status");
				}
			})
		}
		else{
			console.log("not updating");
		}
	})

})

router.get('/donor', function(req, res, next) {
  // add logic for specific organizations
  var posts = req.db.collection("order").find({organization: app.locals.user.name}).toArray(function(err, results){
		console.log({posts: results});
  		res.render('donor', {user: app.locals.user, posts: results.reverse()});
  })
});

module.exports = router;

/*{
    "organization": {
        "type": ["vendor", "charity"],
        "name": "string",
        "address": "string",
        "ratings": {},
        "website": "string",
        "description": "string"
    },
    "order": {
        "food_type": "string",
        “title”: “string”
        "pickup_location": "string",
        "time": "time_type",
        "quantity": 0,
        "rating": 0,
        "organization": "organization",
        "description": "string",
        "claimant": "string",
        "expired": "boolean"
    },
    "account": {
        "email": "string",
        "password": "string",
        "organization": "organization",
        "address": "",
        "website": "",
        "description": ""
    }
}
*/
