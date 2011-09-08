var Flight = require('../../Flight');

var OrbitzFlight = function(extension, origin, destination, airline, aircraft) {
  this.extension = extension;
  this.origin = origin;
  this.destination = destination;
  this.airline = airline;
  this.aircraft = aircraft;
};
OrbitzFlight.prototype = new Flight();

OrbitzFlight.parse = function(extension, legElement) {
  var origin, destination, airline, aircraft;

  var airCodes = legElement.getElementsByClassName('airCode');
  origin = airCodes[0].getElementsByTagName('span')[0].innerHTML;
  destination = airCodes[1].getElementsByTagName('span')[0].innerHTML;

  var legTable = legElement.getElementsByTagName('table')[0];
  var col3 = legTable.getElementsByClassName('col3')[0];
  var legTitle = col3.getElementsByClassName('legTitle')[0];
  airline = legTitle.innerHTML;
  airline = airline.match(/([^\d]+)/)[1];
  airline = airline.replace(/[\n\r\t]+/,'');
  airline = airline.replace(/[\s]+$/,'');
  airline = airline.replace(/^[\s]+/,'');
  airline = airline.replace('&nbsp;','');

  var extraInfo = legElement.getElementsByClassName('legExtraInfo')[0];
  var aircraftLi = extraInfo.getElementsByTagName('li')[2];
  if(aircraftLi) {
    aircraft = aircraftLi.innerHTML;
  }

  return new OrbitzFlight(extension, origin, destination, airline, aircraft);
};

module.exports = OrbitzFlight;