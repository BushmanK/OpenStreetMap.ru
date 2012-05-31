PersonalLine = L.Polyline.extend({
  initialize: function(points, details) {
    L.Polyline.prototype.initialize.call(this, points, details);
    //this.setLatLngs(points);
    this.addToLayerGroup();
    this.fillDetails(details);
    if (this._pl_name || this._pl_description) {
      var popupHTML = $_('pl_show_popup').innerHTML;
      popupHTML = popupHTML.replace(/\#name/g, this._pl_name);
      popupHTML = popupHTML.replace(/\#description/g, this._pl_description);
      this.bindPopup(popupHTML);
    }
  },
  fillDetails: function(details) {
    if (!details) return;

    this._pl_name = details.name;
    this._pl_description = details.description;
    this._pl_color_index = details.color;
    this._pl_weight = details.weight;
    this._updateLineStyle(); //uncomment after coloring lines - color is incorrect
  },
  _updateLineStyle: function() {
    var properties = {};
    if (this._pl_color_index !== undefined) properties.color = osm.markers._line_color[this._pl_color_index];
    this.setStyle(properties);
  },
  addToLayerGroup: function() {
    osm.markers._data.lines.push(this);
    this.index = osm.markers._data.lines.length - 1;

    if (!osm.markers._layerGroup) {
      osm.markers._layerGroup = new L.LayerGroup();
      osm.map.addLayer(osm.markers._layerGroup);
    }
    osm.markers._layerGroup.addLayer(this);
  }
});
PersonalLineEditable = PersonalLine.extend({
  initialize: function(points, details) {
    PersonalLine.prototype.initialize.call(this, points, details);
    
    this.editing.enable();

    this._pl_name = osm.markers.decodehtml(this._pl_name);
    this._pl_description = osm.markers.decodehtml(this._pl_description);
  },
  refreshPath: function() {
    osm.markers._layerGroup.removeLayer(this);
    osm.markers._layerGroup.addLayer(this);
  },
  remove: function() {
    if (this._popup) this._popup._close();
    osm.markers._layerGroup.removeLayer(this);
    if (this.index !== undefined)
      delete osm.markers._data.lines[this.index];
  },
  finishEditing: function(truncate) {
    var points = this.getLatLngs();
    if (truncate) {
      points.pop();
      this.redraw();
    }
    if (points.length < 2) {
      this.remove();
      return;
    }
    var popupHTML = $_('pl_edit_popup').innerHTML;
    popupHTML = popupHTML.replace(/\$\$\$/g, 'osm.markers._data.lines['+this.index+']');
    popupHTML = popupHTML.replace(/\#\#\#/g, this.index);
    this.bindPopup(popupHTML);
    this.on('click', function(e){e.target.loadEditableLine(e)});
  },
  saveData: function(e) {
    var nameEl = $_('line_name_'+this.index);
    this._pl_name = (nameEl.value==nameEl.defaultValue? '': nameEl.value);

    var nameEl = $_('line_description_'+this.index);
    this._pl_description = (nameEl.value==nameEl.defaultValue? '': nameEl.value);
  },
  loadEditableLine: function(e) {
    if (this._pl_name) {
      $_('line_name_'+this.index).value = this._pl_name;
      $_('line_name_'+this.index).className = 'default-input-focused';
    }
    if (this._pl_description) {
      $_('line_description_'+this.index).value = this._pl_description;
      $_('line_description_'+this.index).className = 'default-input-focused';
    }
    if (this._pl_color_index) {
      this.toggleCheck(this._pl_color_index);
    }
  },
  toggleCheck: function(colorIndex) {
    var colorBoxes = $_('line_popup_'+this.index).getElementsByClassName('colour-picker-button');
    for (var i=0; i < colorBoxes.length; i++) {
      colorBoxes[i].innerHTML = '';
    }
    colorBoxes[colorIndex].innerHTML = '&#x2713;';

    this._pl_color_index = colorIndex;
    this._updateLineStyle();
  }
});
