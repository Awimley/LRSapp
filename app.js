var express = require('express');
var http = require('http');
var path = require('path');
var UglifyJS = require('uglify-js');
var fs = require('fs');
var app = express();
var expressJwt = require('express-jwt');
var jwt = require('jsonwebtoken');

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, '/app_server/views'));
app.set('view engine', 'jade');

app.use(express.favicon());
app.use(express.logger('dev'));
//app.use('/', expressJwt({ secret : 'secret' }));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
// app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'app_client')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

//require('./routes')(app);
require('./app_api/routes')(app);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});