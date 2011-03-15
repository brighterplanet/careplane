var Careplane = {
  onLoad: function() {
    this.initialized = true;
    this.drivers = [Kayak, Orbitz];
    this.strings = document.getElementById("careplane-strings");
    this.prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.careplane.");
    var appcontent = document.getElementById("appcontent");   // browser
    if(appcontent)
    appcontent.addEventListener("DOMContentLoaded", this.onPageLoad, true);
  },
  
  onPageLoad: function(ev) {
    var doc = ev.originalTarget;
    var bdoc = top.window.content.document;
    var matchingDrivers = Careplane.drivers.filter(function(driver) {
        return (doc.location.href.search(driver.searchPattern) >= 0 && Careplane.prefs.getBoolPref(driver.name.toLowerCase()));
    });
    if (matchingDrivers.length > 0) {
      var matchingDriver = matchingDrivers[0];
      Careplane.notify(matchingDriver);
      Careplane.attribution();
      var storage = bdoc.createElement('ul');
      storage.setAttribute('id', 'careplane-storage');
      storage.setAttribute('style', 'display: none;');
      bdoc.body.appendChild(storage);
      matchingDriver.scoreFlights(doc);
    }
  },
  
  notify: function(driver) {
    var nb = gBrowser.getNotificationBox();
    var n = nb.getNotificationWithValue('careplane');
    var message = 'Careplane is calculating the carbon footprint of your ' + driver.name + ' flight search results.'; 
    if(n) {
        n.label = message;
    } else {
        const priority = nb.PRIORITY_INFO_LOW;
        nb.appendNotification(message, 'careplane', null, priority, [{accessKey: 'H', callback: driver.hideEmissionEstimates, label: 'Hide footprints'}]);
    }
  },
  
  attribution: function() {
    var copyrightElement = Array.prototype.slice.call(top.window.content.document.getElementById('commonfooter').getElementsByTagName('div')).pop();
    attributionElement = top.window.content.document.createElement('span');
    attributionElement.setAttribute('id', 'careplane-attribution');
    attributionElement.innerHTML = ' &middot; Emission estimates powered by <a href="http://brighterplanet.com">Brighter Planet</a>';
    copyrightElement.appendChild(attributionElement);
  },
  
  fetch: function(url, callback, matcher) {
    var xhr = new XMLHttpRequest()
    xhr.onreadystatechange = function() {
      if (xhr.readyState==4 && xhr.status==200) {
          var response = xhr.responseText;
          var keyDetail = ((matcher) ? response.match(matcher)[1] : false);
          callback(response, keyDetail);
      };
    }
    xhr.open('GET', url, true);
    xhr.overrideMimeType('text/xml');
    xhr.send(null);
  },
  
  insertEmissionEstimate: function(footprint, elementId, totalSegments) {
    var element = top.window.content.document.getElementById(elementId);
    var existingFootprint = Number(element.getAttribute('data-footprint'));
    var newFootprint = existingFootprint + footprint;
    element.setAttribute('data-footprint', newFootprint);
    element.innerHTML = Careplane.formatFootprint(newFootprint);
    var existingSegmentCount = Number(element.getAttribute('data-segments'));
    var newSegmentCount = existingSegmentCount + 1;
    element.setAttribute('data-segments', newSegmentCount);
    if (newSegmentCount == totalSegments) element.style.color = 'black';
  },
  
  formatFootprint: function(footprint) {
    var roundedFootprint = Math.round(footprint * 10) / 10;
    var delimitedFootprint = Careplane.numberWithDelimiter(roundedFootprint);
    var labeledFootprint = delimitedFootprint + ' kg CO<sub>2</sub>e';
    return labeledFootprint;
  },
  
  numberWithDelimiter: function(number) { // hat tip http://kevinvaldek.com/number-with-delimiter-in-javascript
    number = number + '', delimiter = ',';
    var split = number.split('.');
    split[0] = split[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + delimiter);
    return split.join('.');
  }
};
