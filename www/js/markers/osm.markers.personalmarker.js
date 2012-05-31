PersonalMarker = L.Marker.extend({ // simple marker without editable functions
  initialize: function(coords, details) {
    this.setLatLng(coords);
    this.addToLayerGroup();
    this.fillDetails(details);
    if (this._pm_name || this._pm_description) {
      var popupHTML = $_('pm_show_popup').innerHTML;
      popupHTML = popupHTML.replace(/\#name/g, this._pm_name);
      popupHTML = popupHTML.replace(/\#description/g, this._pm_description);
      this.bindPopup(popupHTML);
    }
  },
  fillDetails: function(details) {
    if (!details) return;

    this._pm_name = details.name;
    this._pm_description = details.description;
    this._set_pm_icon_color(details.color);
  },
  addToLayerGroup: function() {
    osm.markers._data.points.push(this);
    this.index = osm.markers._data.points.length - 1;

    if (!osm.markers._layerGroup) {
      osm.markers._layerGroup = new L.LayerGroup();
      osm.map.addLayer(osm.markers._layerGroup);
    }
    osm.markers._layerGroup.addLayer(this);
  },
  _set_pm_icon_color: function(colorIndex) {
    if (isNaN(parseFloat(colorIndex)) || !isFinite(colorIndex) ||
      colorIndex < 0 || colorIndex >= osm.markers._icons.length )
      colorIndex = 0;
    this.setIcon(this._pm_icon_object = osm.markers._icons[colorIndex]);
    this._pm_icon_color = colorIndex;
  }
});

PersonalMarkerEditable = PersonalMarker.extend({
  initialize: function(coords, details) {
    this.setLatLng(coords);
    this.setIcon(osm.markers._icons[0]);
    this.fillDetails(details);
    // fix html entities for editable markers
    this._pm_name = osm.markers.decodehtml(this._pm_name);
    this._pm_description = osm.markers.decodehtml(this._pm_description);
    this.addToLayerGroup();
    var popupHTML = $_('pm_edit_popup').innerHTML;
    popupHTML = popupHTML.replace(/\$\$\$/g, 'osm.markers._data.points['+this.index+']');
    popupHTML = popupHTML.replace(/\#\#\#/g, this.index);
    this.bindPopup(popupHTML);
    this.on('click', function(e){e.target.loadEditableMarker(e)});
  },
  saveData: function() {
    var nameEl = $_('marker_name_'+this.index);
    this._pm_name = (nameEl.value==nameEl.defaultValue? '': nameEl.value);

    var nameEl = $_('marker_description_'+this.index);
    this._pm_description = (nameEl.value==nameEl.defaultValue? '': nameEl.value);
  },
  toggleCheck: function(colorIndex) {
    var colorBoxes = $_('marker_popup_'+this.index).getElementsByClassName('colour-picker-button');
    for (var i=0; i < colorBoxes.length; i++) {
      colorBoxes[i].innerHTML = '';
    }
    colorBoxes[colorIndex].innerHTML = '&#x2713;';

    this._set_pm_icon_color(colorIndex);
  },
  loadEditableMarker: function(event) {
    if (this._pm_name) {
      $_('marker_name_'+this.index).value = this._pm_name;
      $_('marker_name_'+this.index).className = 'default-input-focused';
    }
    if (this._pm_description) {
      $_('marker_description_'+this.index).value = this._pm_description;
      $_('marker_description_'+this.index).className = 'default-input-focused';
    }
    if (this._pm_icon_color) {
      this.toggleCheck(this._pm_icon_color);
    }
  },
  remove: function() {
    osm.markers._layerGroup.removeLayer(this);
    delete osm.markers._data.points[this.index];
  }
});
