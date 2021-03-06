var express = require('express');
var db = require('../../app_server/models/db');
var Flight = require('../../app_server/models/flight');
var User = require('../../app_server/models/user');
var logs = [];
var expressJwt = require('express-jwt');
var jwt = require('jsonwebtoken');
var findMostRecent = function (callback) {
    Flight.find().sort({hobbs_in: -1}).limit(1).exec(callback);
};
var sendJsonResponse = function(res, status, content) {
  console.log(content);
  res.status(status);
  res.json(content);
};

//CRUD=============================================================================================================================================

module.exports.addFlight = function (req, res) {
  var priorFlight, thisFlight, id, flt_date, hobbs_out, hobbs_in, fuel_out, fuel_in, fuel_purch, fuel_cost, oil_added, oil_dipstick, oil_change, comment;
  
  //find Hobbs in, parse everything from body  
  findMostRecent(function(err, doc){
    thisFlight = new Flight ({
      id : (Number(doc[0].id) + 1).toString(),
      hobbs_in : Number(req.body.hobbs_in).toFixed(1),
      flt_date : req.body.flt_date,
      hobbs_out : Number(req.body.hobbs_out).toFixed(1),
      fuel_out : Number(req.body.fuel_out).toFixed(1),
      fuel_in : Number(req.body.fuel_in).toFixed(1),
      fuel_purch : Number(req.body.fuel_purch).toFixed(1),
      fuel_cost : Number(req.body.fuel_cost).toFixed(1),
      oil_added : Number(req.body.oil_added).toFixed(1),
      oil_dipstick : Number(req.body.oil_dipstick).toFixed(1),
      oil_change : Number(req.body.oil_change).toFixed(1),
      comment : req.body.comment
    });

    //PUSH
    thisFlight.save(function (err, thisFlight){
    if (err) {return res.send(err)}
    console.log(thisFlight);
    sendJsonResponse(res, 200, thisFlight);
    });
  });
};

//UPDATE
module.exports.updateFlight = function (req, res) {
  console.log('updating flight');
  if (!req.params.id) {res.send('Location ID invalid')}
  Flight.findById(req.params.id, function (err, doc) {
    if (err) {res.send(err);}
    doc.hobbs_out = req.body.hobbs_out;
    doc.flt_date = req.body.flt_date;
    doc.hobbs_in = Number(req.body.hobbs_in).toFixed(1);
    doc.fuel_out = Number(req.body.fuel_out).toFixed(1);
    doc.fuel_in = Number(req.body.fuel_in).toFixed(1);
    doc.fuel_purch = Number(req.body.fuel_purch.toFixed(1));
    doc.fuel_cost = Number(req.body.fuel_cost).toFixed(1);
    doc.oil_added = Number(req.body.oil_added).toFixed(1);
    doc.oil_dipstick = Number(req.body.oil_dipstick).toFixed(1);
    doc.oil_change = Number(req.body.oil_change).toFixed(1);
    doc.comment = req.body.comment;
    doc.save();

    sendJsonResponse(res, 200, doc);
  });
};
//DELETE
module.exports.deleteFlight = function (req, res) {
  console.log('deleting flight');
  Flight.findByIdAndRemove(req.params.id, function (err, doc){
    console.log('DELETING ' + doc.id);
  });
  sendJsonResponse(res, 204, null);
};

module.exports.getLogs = function (req, res) {
var flights = []
  ,   lastOilChange
  ,   oilChange; 

  Flight.find().sort({hobbs_out:1}).exec(function(err, docs){
    for (i in docs){
      if (docs[i].oil_change == 1) {
        lastOilChange = docs[i].hobbs_out;
        oilChange = 'Oil Changed';
      }
      else { oilChange = '' };
      flights.push({
        _id : docs[i]._id,
        id : Number(docs[i].id),
        hobbsIn : Number(docs[i].hobbs_in).toFixed(1),
        hobbsOut : Number(docs[i].hobbs_out).toFixed(1),
        fuelIn : Number(docs[i].fuel_in).toFixed(1),
        fuelUsed : Number(docs[i].fuel_out - docs[i].fuel_in + docs[i].fuel_purch).toFixed(1),
        hoursFlown : Number((docs[i].hobbs_in - docs[i].hobbs_out)).toFixed(1),
        fuelHour : (Number((docs[i].fuel_out - docs[i].fuel_in + docs[i].fuel_purch).toFixed(1))/Number((docs[i].hobbs_in - docs[i].hobbs_out).toFixed(1))).toFixed(1),
        fltDate : docs[i].flt_date.substring(0,10),
        oilChange : oilChange,
        hoursLastOilChange : (docs[i].hobbs_in - lastOilChange).toFixed(1)
      });
    };
    sendJsonResponse(res, 200, flights);
  });
  return flights;
};

module.exports.findOne = function (req, res) {
  var flight;
  Flight.findById(req.params.id).exec(function(err, doc) {
    if (err) { 
      console.log(err);
      return;
    }
    flight = doc;
    if (flight) {
      sendJsonResponse(res, 200, flight);
      return;
    }
    else {
      sendJsonResponse(res, 404, null);
    }
  });
  console.log(req.params.id);
};

//AUTHENTICATION==========================================================================================================================
//In DB, user is ALWAYS stored lowercase

module.exports.tryLogin = function (req, res) {
  //credentials in req.body
  var username,
      token = {},
      response = {
        message : '',
        user : '',
        token : {}
      };

  User.findOne({ user : req.body.user.toLowerCase()}, function (err, user) {
    if (err) { 
      console.log(err);
      sendJsonResponse(res, 400, err);
    }
    if ( !user ) {
      response.message = 'User not found!';
      sendJsonResponse(res, 404, response);
      return response;
    }
    if (user.password === req.body.password) {
      //Success! (we found a user and the passwords match.)
      response.token = jwt.sign({
        user : user.user, 
        password : user.password,
        exp : Date.now() + 2629000000
        }, 'mysecret');
      response.user = user.user;
      sendJsonResponse(res, 201, response);
      return response;
    }
    response.message = 'User or password invalid, try again!';
    sendJsonResponse(res, 401, response);
    return response;
  });
};

module.exports.verifyUser = function (req, res) {
  User.findOne({ user : req.body.user.toLowerCase()}, function (err, user) {
    var response = false;
    //Returns true or false
    if (err) { 
      console.log(err);
      return 1;
    }
    console.log(req.body.token);
    //token is req.body.token, VERIFY
    try {
      jwt.verify(req.body.token, 'mysecret', function(err, decoded) {
        if (err) {
          console.log(err);
        }
        if (decoded.user === user.user && decoded.password === user.password ) {
          console.log('success!');
          sendJsonResponse(res, 200, true);
          return true;
        }
        return false;
      });
    } catch (err) { //if there was a type error token is empty, verify fails
      return false;
    }
  });
};

