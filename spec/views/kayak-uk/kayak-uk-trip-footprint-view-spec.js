require('../trip-footprint-view-examples');

describe('KayakUkTripFootprintView', function() {
  var KayakUKTripFootprintView = require('views/kayak-uk/kayak-uk-trip-footprint-view');

  beforeEach(function() {
    loadFixtures('kayak_uk_lhr_txl_flight.html');
    this.view = new KayakUKTripFootprintView($('.flightresult').get(0));
    this.view.init();
  });

  itBehavesLikeA('TripFootprintView');
});