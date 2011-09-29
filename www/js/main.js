var osm = {cpan: {}, leftpan: {on: true}, mappan: {}, ui: {}, layers:{}};
var search = {};
//var osbpopup = new L.Popup();

function setView(position) {
  osm.map.setView(new L.LatLng(position.coords.latitude, position.coords.longitude), 10);
}

function init() {
  osm.layers.layerOSM = new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom: 18, attribution: 'Map data &copy; OpenStreetMap contributors'});
  osm.map = new L.Map('map', {zoomControl: true, center: new L.LatLng(62.0, 88.0), zoom: (document.width > 1200 ? 3 : 2), layers: [osm.layers.layerOSM]});
  osm.layers.osb = new L.osb();
  osm.map.addLayer(osm.layers.osb);
  osm.layers.search_marker = new L.LayerGroup();
  osm.map.addLayer(osm.layers.search_marker);
  
	osm.map.doubleClickZoom.disable();
	osm.map.on('dblclick', osm.layers.osb.OSBonMapDbClick);
	osm.osbpopup = new L.Popup();
  
  osm.map.addControl(new L.Control.Layers({'OSM':osm.layers.layerOSM}, {'отметки поиска':osm.layers.search_marker, 'Bugs':osm.layers.osb}));
  osm.cpan.joy = document.getElementById('cpanjoy');
  osm.cpan.arrows = document.getElementById('cpanarr');
  osm.leftpan.panel = document.getElementById('leftpan');
  osm.leftpan.content = document.getElementById('content');
  osm.permalink = document.getElementById('permalink');
  osm.mappan.panel = document.getElementById('mappan');
  osm.input = document.getElementById('qsearch');
  osm.map.on('dragend',osm.onPermalink);
  osm.map.on('zoomend',osm.onPermalink);
  osm.onPermalink();
}

osm.cpan.startPan = function(e) {
  this.dragging = true;
  var dist = Math.sqrt(Math.pow(e.layerX - 43, 2) + Math.pow(e.layerY - 43, 2));
  var c = (dist > 25) ? 20 / dist : 1;
  this.panX = ((e.layerX - 43) * c);
  this.panY = ((e.layerY - 43) * c);
  this.joy.style.left = (this.panX + 37) + 'px';
  this.joy.style.top = (this.panY + 37) + 'px';
  osm.map.fire('movestart');
  this.timer = setInterval(function(){osm.cpan.pan(this)}, 33);
  this.arrows.className = 'opanull';
};

osm.cpan.dragPan = function(e) {
  if (this.dragging) {
    var dist = Math.sqrt(Math.pow(e.layerX - 43, 2) + Math.pow(e.layerY - 43, 2));
    if (dist < 25) {
      this.panX = e.layerX - 43;
      this.panY = e.layerY - 43;
    }
    else {
      var c = 20 / dist;
      this.panX = ((e.layerX - 43) * c);
      this.panY = ((e.layerY - 43) * c);
    }
    this.joy.style.left = (this.panX + 37) + 'px';
    this.joy.style.top = (this.panY + 37) + 'px';
  }
};

osm.cpan.pan = function() {
  osm.map._rawPanBy(new L.Point(this.panX, this.panY));
  osm.map.fire('move');
};

osm.cpan.endPan = function(e) {
  clearInterval(this.timer);
  osm.map.fire('moveend');
  this.dragging = false;
  this.joy.style.left = '37px';
  this.joy.style.top = '37px';
  this.arrows.className = '';
};

osm.leftpan.toggle = function() {
  var center = osm.map.getCenter();
  if (this.on) {
    this.on = false;
    document.body.className = 'left-on';
  }
  else {
    this.on = true;
    document.body.className = '';
  }
  osm.map.invalidateSize();
};

search.processResults = function() {
  try {
    if (this.request.readyState == 4) {
      if (this.request.status == 200) {
        if (this.request.responseText == 'no find\n') {
          osm.leftpan.content.innerHTML='Не найдено';
        }
        else {
          var results = eval('(' + this.request.responseText + ')');
          var content = '<ol id="ol-search_result">';
          osm.search_marker.clearLayers();
          var MyIcon = L.Icon.extend({
            iconUrl: '../img/marker.png',
            shadowUrl: '../img/marker-shadow.png',
            iconSize: new L.Point(18, 29),
            shadowSize: new L.Point(29, 29),
            iconAnchor: new L.Point(8, 29),
            popupAnchor: new L.Point(-8, -50)
          });
          var icon = new MyIcon();
          for (var i in results) {
              content += ('<li><a href="" onClick="osm.map.setView(new L.LatLng(' + results[i].lat + ',' + results[i].lon + '), 16); return false;">' + results[i].display_name + '  id='+results[i].id+'  weight='+results[i].weight+'</a></li>');
            marker = new L.Marker(new L.LatLng(results[i].lat, results[i].lon),{icon: icon});
            marker.bindPopup("<b>Адрес:</b><br /> " + results[i].display_name);
            osm.search_marker.addLayer(marker);
          }
          osm.map.setView(new L.LatLng(results[0].lat , results[0].lon), 11);
          content += '</ol>';
          osm.leftpan.content.innerHTML = content;
        }
      }
    }
  }
  catch(e) {
      osm.leftpan.content.innerHTML = 'Ошибка: ' + e.description + '<br /> Ответ поиск.серв.: '+this.request.responseText;
  }
};

search.search = function() {
  if (osm.input.value.length < 1)
    return false;
  mapCenter=osm.map.getCenter();
  this.request = new XMLHttpRequest();
  //this.request.open('GET', 'http://nominatim.openstreetmap.org/search?q=' + encodeURIComponent(osm.input.value) + '&format=json');
  this.request.open('GET', '/api/search?q=' + encodeURIComponent(osm.input.value) + '&lat=' + mapCenter.lat + '&lon=' + mapCenter.lng);
  this.request.onreadystatechange = function(){search.processResults(this)};
  this.request.send(null);
  return false;
};

osm.ui.whereima = function() {
  navigator.geolocation.getCurrentPosition(setView);
};

osm.onPermalink = function () {
  mapCenter=osm.map.getCenter();
  osm.permalink.href = 'http://' + location.host + '?lat=' + mapCenter.lat + '&lon=' + mapCenter.lng + '&zoom=' + osm.map._zoom;
 };