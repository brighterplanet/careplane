var $ = require('jquery');
var TripInfoView = require('../trip-info-view');

var HipmunkTripInfoView = function($, tripElement) {
  this.$ = $;
  this.tripElement = tripElement;
};
HipmunkTripInfoView.prototype = new TripInfoView();

HipmunkTripInfoView.prototype.target = function() {
  return this.$('.careplane-popup',this.tripElement);
};

HipmunkTripInfoView.prototype.content = function() {
  return "\
    <div class=\"careplane-info careplane-popup\">\
      <p class=\"careplane-search-average-comparison\">...</p>\
      <p class=\"careplane-search-average-analysis\">...</p>\
      <p class=\"careplane-credit\">Calculation by Brighter Planet</p>\
      <section class=\"careplane-methodologies\">\
        <ul class=\"careplane-methodologies-list\"></ul>\
      </section>\
    </div>";
};

HipmunkTripInfoView.prototype.positionRelativeTo = function(other) {
  var offset = this.$(other).offset();
  this.target().css('left', offset.left + 'px');
  this.target().css('top', (parseInt(this.$(other).css('height')) + 10).toString() + 'px');
};

module.exports = HipmunkTripInfoView;
