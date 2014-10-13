var real_data = {
 "name": "flare",
 "children": [
  {
   "name": "analytics",
   "children": [
    {
     "name": "cluster",
     "children": [
      {"name": "AgglomerativeCluster", "size": 3938},
      {"name": "CommunityStructure", "size": 3812},
      {"name": "MergeEdge", "size": 743}
     ]
    },
    {
     "name": "graph",
     "children": [
      {"name": "BetweennessCentrality", "size": 3534},
      {"name": "LinkDistance", "size": 5731}
     ]
    }
   ]
  }
 ]
};

var nested_data = {
  "name": "nested",
  // "size": 3000
  "children": [
  {
    "name": "childridden", 
    "children": [{
      "name": "morechillins", "children": [
        {"name":"dookus","size":10},
        {"name":"wookus","size":40}
      ]}, 

      {"name": "woot","size": 20}]
  },
  {"name": "childless", "size": 40},
  {"name": "mmm", "size": 40}
  ]
};

var simple_data = {
  "name": "simple",
  // "size": 3000
  "children": [
  {"name": "whatever", "size": 40},
  {"name": "yep", "size": 40},
  {"name": "mmm", "size": 40}
  ]
};  

function p(whatever) { 
  $("#output").append(whatever+"<br>")
}

function getAreas(data,top) {
  if (top) {
    // p("TOP: " + data.name);
    var top_object = {};
    top_object.values = [];
    top_object.names = [];
    if (data.size) { 
      top_array.values[0] = [data.size]; 
    } else if (data.children) {
      for (var i=0; i < data.children.length; i++) {
        top_object.names[i] = data.children[i].name;
        top_object.values[i] = getAreas(data.children[i],false);
      }
      // p("TOP ARRAY:" + top_array);
      return top_object;
    }
  } else {
    // p("--LEAF NAME: " + data.name);
    var leaf_total = 0;
    if (data.size) {
      leaf_total += data.size; 
    } else if (data.children) {
      // p("THIS MANY CHILLINS: " + data.children.length);
      for(var i=0; i < data.children.length; i++) {
        leaf_total += getAreas(data.children[i],false);
      }
    }
    return leaf_total;
  }
}



// flat_data = getAreas(nested_data,true);
// p(flat_data);


$("#arbolade")
  .css("position","relative")
  .css("left",0)
  .css("top",0)
  .css("width","100%")
  .css("height","100%")
  .css("backgroundColor","black")
  .css("box-sizing","border-box")
  .css("border","1px solid black")
  .css("opacity","0.7");
$("#connection + #arbolade")
  .css("height","50%");

function rectangle(x,y,w,h,color,border,text) {
  var n = $("#arbolade > div").length;
  $("#arbolade").append("<div id = 'rect-" + n + "'></div>");
  $("#arbolade > #rect-" + n)
    .css("font-size","0.7em")
    .css("overflow","hidden")
    .css("box-sizing","border-box")
    .css("border-style","solid")
    .css("border-width",1)
    .css("float","left")
    .css("position","absolute")
    .css("backgroundColor",color)
    .css("border-color",border)
    .css("color","rgb(180,180,180")
    .css("left",x)
    .css("top",y)
    .css("width",w)
    .css("height",h)
    .data({ x: x, y: y, w: w, h: h, clicked: false });
  if (text) { $("#arbolade > #rect-" + n).text(text); } 
}

// p("hello" + $("#arbolade").children('div').length;


// FIRST: vertical fit

var areas = [50,35,40,20,15,90];

function manualCells(data) {
  // this array of objects MAY be better built from getAreas
  var sorter_array = []
  for (var i = 0; i < data.values.length; i++) {
    sorter_array[i] = {};
    sorter_array[i].value = data.values[i];
    sorter_array[i].name = data.names[i];
  }

  sorter_array.sort(function(a,b) { return b.value-a.value});

  data = data.values;
  data = data.sort(function(a,b) { return b-a});

  var data_total = 0;
  for (var i = 0; i < data.length; i++) {
    data_total += data[i];
  }

  var container = {};

  container.width = $("#arbolade").width();
  container.height = $("#arbolade").height();
  container.area = container.width*container.height;

  var cells = [];

  // container.area*cells[1].percent/second_width;

  for (var i = 0; i < data.length; i++) {
    cells[i] = {}
    cells[i].datum = data[i];
    cells[i].percent = data[i]/data_total;
  }

  //on each rectangle call, add to the x offset and y offset from the width if even, height if odd

  var offset = { x: 0, y: 0 };
  var width = 0, height = 0;

  for (var i = 0; i < data.length; i++) {
    // var height_v = 100.0 - offset.y;
    // var width_v = cells[i].percent/(height_v/100)*100;
    // var ratio_v = height_v/width_v

    // var width_h = 100.0 - offset.x;
    // var height_h = cells[i].percent/(width_h/100)*100;
    // var ratio_h = width_h/height_h;

    // var horizontal = (ratio_v <= ratio_h) ? 0 : 1;
    // p(horizontal);

    // var which = "";

    var even = (i%2 == 0)

    if (even) {
      // which = "vertical";
      height = 100.0 - offset.y;
      width = cells[i].percent/(height/100)*100;
    }
    else {
      // p(horizontal);
      // which = "horizontal"; 
      width = 100.0 - offset.x;
      height = cells[i].percent/(width/100)*100;
    }

    var colorValue = (80*cells[i].percent+30).toFixed(0);
    var colorRGB = "rgb(" + colorValue + "," + colorValue + "," + colorValue + ")";
    var borderRGB = "rgb(0,0,0)";

    var label = sorter_array[i].name +" ("+sorter_array[i].value/2 + "h)";

    rectangle(
      offset.x + "%",
      offset.y + "%",
      width  + "%",
      height + "%",
      colorRGB,
      borderRGB,
      // "v: " + ratio_v + " " + "h: " + ratio_h + "horizontal?: " + horizontal + " chosen: " + which 
      label
       // (cells[i].percent*100).toFixed(1) + "%"
    );

    //Add appropriate offset
    if (even) {
      offset.x += parseFloat(width);
    }
    else {
      offset.y += parseFloat(height);
    }
  }

}
// manualCells(flat_data);

// p("hello");

$.getJSON('/data/books', function(data){
  var book_data = getAreas(data,true);
  manualCells(book_data);
});


$("#arbolade").on('touch click',"div",touchCell);

function touchCell() {
  var me = $(this);
  var data = me.data();
  var destAnim;

  // p(data);

  if (data.clicked == false) {
    destAnim = {
      top: 0,
      left: 0,
      width: "100%",
      height: "100%"
    }
  } else {
    destAnim = {
      top: data.y,
      left: data.x,
      width: data.w,
      height: data.h,
      ease:Expo.easeInOut
    }
  }
  // me.css("z-index","2");
  TweenMax.to(me,0.2,destAnim);
  if (data.clicked == false) {
    me.data("clicked",true);
    TweenMax.to(me, 0, {zIndex:"1"});
  } else {
    me.data("clicked",false);
    TweenMax.to(me, 0, {zIndex:"0", delay:0.2});
  }
}

  // TweenMax.to([logo,logo2], 0.5, {
  //   width:"50px", 
  //   height:"50px", 
  //   backgroundColor: "black",
  //   onUpdate:updateHandler,
  //   delay: 0.5
  // });

// rectangle(0,0,100,100,"rgb(100,100,100)");
// rectangle(0,0,100,100,"rgb(50,100,100)");
// rectangle(20,0,"50%","50%","rgb(40,100,100)");

