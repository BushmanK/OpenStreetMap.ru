osm.markers.saveMap = function() {
  osm.markers._removeHandlers();
  var postData = {};
  var mapName = $_("pmap_name").value;
  var mapDescription = $_("pmap_description").value;
  postData.points = [];
  postData.lines = [];
  var mlen = osm.markers._data.points.length;
  for(var i = 0; i < mlen; i++) {
    var point = osm.markers._data.points[i];
    if (!point) continue;
    var coords = point.getLatLng();
    postData.points.push({
      lat:          coords.lat,
      lon:          coords.lng,
      name:         point._pm_name,
      description:  point._pm_description,
      color:        point._pm_icon_color
    });
  }
  var llen = osm.markers._data.lines.length;
  for(var i = 0; i < llen; i++) {
    var line = osm.markers._data.lines[i];
    if (!line) continue;
    var lineData = {
      name:       line._pl_name,
      description:line._pl_description,
      color:      line._pl_color_index,
      points:     []
    };
    var lPoints = line.getLatLngs();
    var lplen = lPoints.length;
    for(var j = 0; j < lplen; j++)
      lineData.points.push([lPoints[j].lat, lPoints[j].lng]);

    postData.lines.push(lineData);
  }
  if (postData.points.length == 0 && postData.lines.length == 0) {
    $_("pm_status").innerHTML = "Нет данных для сохранения!"
  } else {
    $_("pm_status").innerHTML = "Сохранение...";
    $.ajax({
      url: "mymap.php",
      type: "POST",
      data: {
        action:       "save",
        name:         mapName,
        description:  mapDescription,
        data:         postData,
        hash:         osm.markers._admin.hash,
        id:           osm.markers._admin.id
      },
      dataType: 'json',
      success: function(json, text, jqXHR){
        if (json.id) {
          osm.markers._admin.id = json.id;
          osm.markers._admin.hash = json.hash;
        }
        $_("pm_status").innerHTML = "Сохранено<br>"+
          "<a href='/?mapid="+osm.markers._admin.id+"'>Ссылка на просмотр</a><br>"+
          "<a href='/?mapid="+osm.markers._admin.id+"&hash="+osm.markers._admin.hash+"'>Ссылка на редактирование</a><br>"+
          "<a href='/mymap.php?id="+osm.markers._admin.id+"&format=gpx'>Скачать GPX</a>";
      }
    }).fail(function (jqXHR,textStatus) {
      $_("pm_status").innerHTML = "Ошибка при сохранении!";
    });
  }
}

osm.markers.readMap = function() {
  var url = document.URL;
  var results = url.match(/\Wmapid=(\d+)/);
  if (!results)
    return;
  var mapid = results[1];
  results = url.match(/\Whash=([0-9a-fA-F]{32})/);
  var adminhash = "";
  if (results)
    adminhash = results[1];
  $.ajax({
    url: "mymap.php",
    type: "POST",
    data: {
      action: "load",
      id:     mapid,
      hash:   adminhash
    },
    dataType: 'json',
    success: function(json, text, jqXHR){
      if (!json.service.existing) { alert("Карта не существует"); return; }
      osm.markers._admin.editable = json.service.editing;
      osm.markers._admin.hash = adminhash;
      osm.markers._admin.id = mapid;
      if (osm.markers._admin.editable)
        osm.leftpan.toggle(2);
      
      $_("pmap_name").value = json.info.name;
      $_("pmap_description").value = json.info.description;
      var latlngs = new Array();
      var p;
      if (json.data.points)
        for(var i=0;i<json.data.points.length;i++) {
          var point = json.data.points[i];
          var coords = new L.LatLng(point.lat, point.lon);
          latlngs.push(coords);
          if (osm.markers._admin.editable)
            p = new PersonalMarkerEditable(coords, point);
          else
            p = new PersonalMarker(coords, point);
        }
      if (json.data.lines)
        for(var i=0;i<json.data.lines.length;i++) {
          var line = json.data.lines[i];
          var coords = [];
          for(var j=0;j<line.points.length; j++) {
            var point = new L.LatLng(line.points[j][0], line.points[j][1]);
            coords.push(point);
            latlngs.push(point);
          }
          if (osm.markers._admin.editable) {
            p = new PersonalLineEditable(coords, line);
            p.finishEditing(false);
          }
          else
            p = new PersonalLine(coords, line);
        }
      if (latlngs.length>1)
        osm.map.fitBounds(new L.LatLngBounds(latlngs));
      else if (latlngs.length==1) {
        osm.map.panTo(latlngs[0]);
        if (p._popup) {// TODO: remove for Leaflet 0.4
          p.openPopup();
          if (p instanceof PersonalMarkerEditable)
            p.loadEditableMarker();
        }
      }
      
      // add info to view panel - if there is any data
      if (!osm.markers._admin.editable) {
        var found = false;
        if ($_("pmap_name").value)
          found = true;
        if ($_("pmap_description").value)
          found = true;
        $("#pmapview_name").text($_("pmap_name").value);
        $("#pmapview_description").text($_("pmap_description").value);
        var textpoints = "";
        for (var i=0;i<osm.markers._data.points.length;i++)
          if (osm.markers._data.points[i]) {
            var point = osm.markers._data.points[i];
            var textpoint = "";
            if (point._pm_name)
              textpoint+="<b>"+point._pm_name+"</b><br>";
            if (point._pm_description)
              textpoint+=point._pm_description;
            if (textpoint) {
              found = true;
              textpoints+="<li><img src='"+point._pm_icon_object.iconUrl+"' alt='.'>"+textpoint+"</li>";
            }
          }
        $("#pmapview_points").html(textpoints);
        
        if (found)
          osm.leftpan.toggle(4);
      }
    }
  }).fail(function (jqXHR, textStatus) {
    alert("Произошла ошибка при чтении карты");
  });
}
