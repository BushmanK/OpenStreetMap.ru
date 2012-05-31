osm.markers.addPoint = function () {
  if (osm.markers._removeHandlers() === 1)
    return;

  osm.map.on('click', osm.markers.createPoint);
  $_('map').style.cursor = 'crosshair';
  osm.markers._drawingMode = 1;
}
osm.markers.createPoint = function(e) {
	osm.map.permalink._popup_marker(e.latlng);
	osm.map.off('click', osm.markers.createPoint);
	$_('map').style.cursor='';
}
osm.markers.personalMap = function() {
  osm.leftpan.toggle(2);
  osm.markers._admin.editable = true;
}

osm.markers._removeHandlers = function() {
  var oldDrawingMode = osm.markers._drawingMode;
  var func, elementId;
  switch(osm.markers._drawingMode){
  case 1:
      func = osm.markers.createPoint;
      elementId = '';
      break;
  case 2:
      func = osm.markers.createPoints;
      elementId = 'multimarkerbutton';
      break;
  case 3:
      func = osm.markers.createPath;
      elementId = 'pathbutton';
      // remove mousemove event if any
      $("#map").unbind("mousemove", osm.markers.mouseMovePath);
//      osm.map.doubleClickZoom.enable();
      osm.markers._newPath.finishEditing(true);
      break;
  default:
    return 0;
  }
  osm.map.off('click', func);
  if (elementId)
    $_(elementId).className = '';
  $_('map').style.cursor='';
  osm.markers._drawingMode = 0;
  return oldDrawingMode;
}

osm.markers.addMultiMarker = function() {
  if (osm.markers._removeHandlers() === 2)
    return;

  osm.map.on('click', osm.markers.createPoints);
  $_('multimarkerbutton').className = 'pm-pressed';
  $_('map').style.cursor = 'crosshair';
  osm.markers._drawingMode = 2;
}
osm.markers.createPoints = function(e) {
  var count = 0;
  var mlen = osm.markers._data.points.length;
  for(var i=0; i < mlen; i++) {
    if (osm.markers._data.points[i])
      count++;
  }
  if (count >= osm.markers._max_markers) {
    alert("Маркеров не может быть больше " + osm.markers._max_markers);
    return;
  }

  var p = new PersonalMarkerEditable(e.latlng);
  p.openPopup();
}

osm.markers.addPath = function() {
  if (osm.markers._removeHandlers() === 3)
    return;

  osm.map.on('click', osm.markers.createPath);
  $_('pathbutton').className = 'pm-pressed';
  $_('map').style.cursor = 'crosshair';
  osm.markers._drawingMode = 3;
  osm.markers._newPath = new PersonalLineEditable([]);
}
osm.markers.createPath = function(e) { // todo: move it to PersonalLine?
  var count = 0;
  var mlen = osm.markers._data.lines.length;
  for(var i=0; i < mlen; i++) {
    if (osm.markers._data.lines[i])
      count+=osm.markers._data.lines[i].getLatLngs().length;
  }
  if (osm.markers._newPath)
  count+=osm.markers._newPath.getLatLngs().length-1;
  if (count >= osm.markers._max_line_points) {
    alert("Суммарно точек в линиях не может быть больше "+
      osm.markers._max_line_points);
    return;
  }
  osm.markers._newPath.addLatLng(e.latlng);
  if (osm.markers._newPath.getLatLngs().length === 1) {
    osm.markers._newPath.addLatLng(e.latlng);
//    osm.map.doubleClickZoom.disable();
    $('#map').mousemove(osm.markers.mouseMovePath);
  }
  if (osm.markers._newPath.getLatLngs().length > 2) {
    var points = osm.markers._newPath.getLatLngs();
    var p1 = osm.map.latLngToLayerPoint(points[points.length-3]);
    var p2 = osm.map.latLngToLayerPoint(points[points.length-2]);
    if (p1.distanceTo(p2)<3) {
      points.pop();
      osm.markers._removeHandlers();
    }
  }
  osm.markers._newPath.refreshPath();
}
osm.markers.mouseMovePath = function(event){
  var points = osm.markers._newPath.getLatLngs();
  var coord = osm.map.mouseEventToLatLng(event);
  points[points.length-1] = coord;
  osm.markers._newPath.redraw();
}
