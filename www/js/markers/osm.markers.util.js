MarkerIcon = L.Icon.Default.extend({
  createIcon: function() {
    var img = this._createIcon(this.options.markerColor);
    this._setIconStyles(img, 'icon');
    return img;
  }
});

osm.markers = {
  _drawingMode: 0,// 0 - nothing, 1 - marker (single, permalink), 2 - multimarker, 3 - line
  _layerGroup: 0,
  _newPath: 0, 
  _data: {
    points: [],
    lines: []
  },
  _color_array: [
    {image:'icon',   color:'#0033FF', text:'white'},
    {image:'red',    color:'#F21D53', text:'white'},
    {image:'green',  color:'#22DD44', text:'black'},
    {image:'yellow', color:'#F1E415', text:'black'},
    {image:'violet', color:'#9B5BA0', text:'white'},
    {image:'orange', color:'#E48530', text:'black'}
  ],
  _icons: [],
  _line_color: [],
  _admin: {
    hash: '',
    id: -1,
    editable: false
  }
}
osm.markers.initialize = function() {
  osm.markers._layerGroup = new L.LayerGroup();
  osm.map.addLayer(osm.markers._layerGroup);
  // color generation enhanced
  var icons = [];
  var lines = [];
  var buttons="";
  var replacable = "<div class='colour-picker-button' style='background:{{bg}};color:{{text}}' onClick='$$$.toggleCheck({{i}});'>&#x2713;</div>";
  for (var i=0;i<osm.markers._color_array.length;i++) {
    var c = osm.markers._color_array[i];
    icons.push(new MarkerIcon({markerColor:c.image}));
    lines.push(c.color);
    var str = replacable.replace(/{{bg}}/, c.color).replace(/{{text}}/,c.text).replace(/{{i}}/,i);
    if (i!=0) str = str.replace("&#x2713;","");
    buttons+=str;
  }
  osm.markers._icons = icons;
  osm.markers._line_color = lines;
  $(".colour-picker").each(function(){$(this).html(buttons)});
}
osm.markers.decodehtml = function(s) {
  if(s) return $("<div/>").html(s).text(); else return s;
}
// TODO: when IE whould support placeholder attribute for input elements - remove that
osm.markers.focusDefaultInput = function(el) {
  if(el.value==el.defaultValue) {
    el.value='';
  }
  el.className = 'default-input-focused';
}
osm.markers.blurDefaultInput = function(el) {
  if(el.value=='') {
    el.value=el.defaultValue;
    el.className = 'default-input';
  }
}

