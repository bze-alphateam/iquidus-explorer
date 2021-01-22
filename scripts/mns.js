var mongoose = require('mongoose')
	, lib = require('../lib/explorer')
	, db = require('../lib/database')
	, settings = require('../lib/settings')
	, request = require('request')
    , Mns = require('../models/mns');

function exit() {
	mongoose.disconnect();
	process.exit(0);
}

var dbString = 'mongodb://' + settings.dbsettings.user;
dbString = dbString + ':' + settings.dbsettings.password;
dbString = dbString + '@' + settings.dbsettings.address;
dbString = dbString + ':' + settings.dbsettings.port;
dbString = dbString + '/' + settings.dbsettings.database;

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.connect(dbString, function(err) {
	if (err) {
		console.log('Unable to connect to database: %s', dbString);
		console.log('Aborting');
		exit();
	} else {
		request({uri: 'http://127.0.0.1:' + settings.port + '/api/listmasternodes', json: true}, function (error, response, body) {
			lib.syncLoop(body.length, function (loop) {
				var i = loop.iteration();
				db.find_mn(body[i].txhash, function (mn) {
					if (mn) {
						console.log('---- Updating MN -----');
						Mns.updateOne(
							{
								txhash: mn.txhash
							},
							{
								rank: body[i].rank,
								status: body[i].status,
								version: body[i].version,
								lastseen: new Date(body[i].lastseen * 1000),
								lastpaid: new Date(body[i].lastpaid * 1000),
							},
							function () {
								loop.next();
							}
						)
					} else {
						request({uri: 'http://ip-api.com/json/' + body[i].ip, json: true}, function (error, response, geo) {
							console.log('---- Saving new MN -----');
							console.log('http://ip-api.com/json/' + body[i].ip);
							console.log(geo);
							db.create_mn(
								{
									rank: body[i].rank,
									network: body[i].network,
									ip: body[i].ip,
									txhash: body[i].txhash,
									status: body[i].status,
									addr: body[i].addr,
									version: body[i].version,
									lastseen: new Date(body[i].lastseen * 1000),
									lastpaid: new Date(body[i].lastpaid * 1000),
									country: geo.country,
									country_code: geo.countryCode.toLowerCase(),
								},
								function() {
									loop.next();
							});
						});
					}
				})
			}, function() {
				exit();
			});
		});
	}
});
