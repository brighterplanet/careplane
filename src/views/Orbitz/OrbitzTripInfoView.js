OrbitzTripInfoView = function(tripElement) {
  this.tripElement = tripElement;
  this.doc = this.tripElement.ownerDocument;
};
OrbitzTripInfoView.prototype = new TripInfoView();

OrbitzTripInfoView.prototype.target = function() {
  return this.tripElement.getElementsByClassName('careplane-info')[0];
};

OrbitzTripInfoView.prototype.content = function() {
  return "\
    <div class=\"careplane-info\">\
      <p>This trip's footprint: <span class=\"careplane-leg-footprint\">...</span></p>\
      <p>Search average: <span class=\"careplane-search-average\">...</span></p>\
      <p class=\"careplane-search-average-analysis\"></p>\
      <section class=\"careplane-methodologies\">\
        <ul class=\"careplane-methodologies-list\"></ul>\
      </section>\
    </div>";
};

OrbitzTripInfoView.prototype.getElement = function(className) {
  return this.target().getElementsByClassName(className)[0];
};
