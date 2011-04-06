describe('Kayak', function() {
  describe('.insertAttribution', function() {
    beforeEach(function() {
      loadFixtures('kayak_dtw_sfo.html');
      Kayak.insertAttribution();
    });
    it('inserts a badge in the top area', function() {
      expect($('div#rightads')).toContain('script[src$="badge.js"]');
    });
    it('inserts a text attribution in the footer', function() {
      expect($('span#careplane-attribution')).toHaveText(' · Emission estimates powered by Brighter Planet');
    });
  });
});
