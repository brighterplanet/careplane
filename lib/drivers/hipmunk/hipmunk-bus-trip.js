var $ = require('jquery');
var BusTrip = require('../../bus-trip');

var HipmunkBusTrip = function(origin, destination, duration) {
  this.origin = origin;
  this.destination = destination;
  this.duration = duration;
};

HipmunkBusTrip.prototype = new BusTrip();

HipmunkBusTrip.parse = function(leg) {
  var stations = $('.place', leg);
  var origin = $(stations[0]).text().match(/\(([^\)]+)\)/)[1];
  var destination = $(stations[1]).text().match(/\(([^\)]+)\)/)[1];

  var durationText = $('.time.total', leg).text();
  var durationMatch = durationText.match(/(\d+)h\s*(\d+)m/);
  var hours = parseInt(durationMatch[1]);
  var minutes = parseInt(durationMatch[2]);
  var duration = (hours * 60 + minutes) * 60;

  return new HipmunkBusTrip(origin, destination, duration);
};

module.exports = HipmunkBusTrip;