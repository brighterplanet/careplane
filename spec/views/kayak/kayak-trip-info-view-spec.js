require('../trip-info-view-examples');

describe('KayakTripInfoView', function() {
  var KayakTripInfoView = require('views/kayak/kayak-trip-info-view');

  beforeEach(function() {
    this.trip = {
      totalFootprint: 143.2,
      origin: function() { return 'DTW' },
      destination: function() { return 'SFO' }
    };
    this.view = new KayakTripInfoView(document.createElement('div'));
    this.view.init();
  });

  itBehavesLikeA('TripInfoView');
});