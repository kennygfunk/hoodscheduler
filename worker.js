var express = require('express');
var router = express.Router();
var Twit = require('twit');
var ig = require('instagram-node').instagram();
var Firebase = require('firebase');

var dataRef = new Firebase('https://hoodapp.firebaseio.com/news');
var todaysDateRef;

// Client IDs, Tokens, Secrets
var twConfig = {
    consumer_key: 'bhuMfuPGp0qQsKftVI4qrKKTx',
    consumer_secret: 'Mazcsq3gI1umrhY9HKAGGnrzgw0wRGPx3EJRqfBeR34PdzKysA',
    access_token: '874117766-TAPhWRq8SZTiwKFuaKncKqPFmVXS0HDTogS0mp6B',
    access_token_secret: '2n8y4c6w1ElVymrQ7GWrUvsd3xvAOunCvjiygpSQFbytx'
  };

 // Instagram Params
ig.use({ client_id: '05652b69ce2c4833a06f265f8de61d78',
         client_secret: 'bc9e8e3201db468e966aedf5b2d46c98' });

// instantiate Twit module
var twitter = new Twit(twConfig);

var USER_TIMELINE_URL = 'statuses/user_timeline';
var TWEET_COUNT = 25;
var USER = 'ddbsanfrancisco';

// Twitter params
var twParams = {
  screen_name: USER, // the user id passed in as part of the route
  count: TWEET_COUNT // how many tweets to return
};

var igParams = {
  count : 25
};

var d = Date.now();
var todaysDate = new Date(d).setHours(0,0,0,0);

// Set data for single day
// var todaysDate = 1447228800000; // Nov 11
// console.log('todays date', todaysDate);

// see if todays date exists
dataRef.once('value', function(snapshot) {
  var dateSnapshot = snapshot.child(todaysDate).exists();
  if (dateSnapshot) {
    console.log('RECORD EXISTS');
    todaysDateRef = dataRef.child(todaysDate);
    // clear it out
    todaysDateRef.remove();
    todaysDateRef = dataRef.child(todaysDate);
  } else {
    // its not there so create it
    todaysDateRef = dataRef.child(todaysDate);
  }
  getData(todaysDate);
});

// populateMonthData('Sept');
function populateMonthData(month) {
  // Database content filler
  for(var i = 1; i < 31; i++) {
    var todaysDate = new Date(month+' '+i+' 2015').getTime();
    getData(todaysDate);
  }
}


function getData(today) {

  // request data
  ig.user_media_recent('315641205', igParams, function(err, medias, pagination, remaining, limit) {

    // Save data
    var instagrams = medias,
        i = 0, len = instagrams.length;

    for(i; i < len; i++) { //iterate through tweets
      
      var instaDay = new Date(parseInt(instagrams[i].created_time) * 1000).setHours(0,0,0,0);
      console.log('current instagrams date without time', instaDay);

      if (new Date(today).toDateString() === new Date(instaDay).toDateString()) { // dates match
        console.log('WE HAVE A MATCH FOR INSTAGRAM');
        todaysDateRef = dataRef.child(today);
        
        todaysDateRef.push(instagrams[i]);
        todaysDateRef.setPriority(0 - today);
      };
    }
  });

  // request data 
  twitter.get(USER_TIMELINE_URL, twParams, function (err, data, resp) {

    // save data
    var tweets = data,
        i = 0, len = tweets.length;

    for(i; i < len; i++) { //iterate through tweets

      var twitterDay = new Date( Date.parse(tweets[i].created_at) ).setHours(0,0,0,0);
      console.log('current twitter date without time', twitterDay);

      if (new Date(today).toDateString() === new Date(twitterDay).toDateString()) { // dates match
        console.log('WE HAVE A MATCH FOR TWITTER');
        todaysDateRef = dataRef.child(today);
        console.log(0 - today);
        
        todaysDateRef.push(tweets[i]);
        todaysDateRef.setPriority(0 - today);
      }
    }
  });
}
