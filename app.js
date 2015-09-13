var express = require('express');
var Promie = require('bluebird');

var models = require('./models');
var Hotel = models.Hotel;
var Restaurant = models.Restaurant;
var Activity = models.Activity;
var swig = require('swig');
var path = require('path');

var app = express();

app.use(express.static(path.join(__dirname , 'public')));

swig.setDefaults({ cache: false });

app.engine('html', swig.renderFile);
app.set('view engine', 'html');



app.get('/', function(req, res, next){
  Promise.all([ Hotel.find(), Restaurant.find(), Activity.find()])
    .then(function(results){
      var data = {
        hotels: results[0],
        restaurants: results[1],
        activities: results[2],
        apiKey: process.env.API_KEY
      };
      data.dropDownItems = function(label, items){
        return {
          items: items,
          label: label
        }
      }
      return data;

    })
    .then(function(data){
      res.render('index', data);
    })
    .catch(function(err){
      next(new Error(err));
    });

});

// app.use(function(err, req, res, next){
  // console.log(err.message);
  // res.send(err.message);

// });


app.listen(3000);
