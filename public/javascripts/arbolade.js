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

$("#arbolade").css({
  position: "relative",
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "black",
  boxSizing: "border-box",
  border: "1px solid black",
  opacity: "0.7"
});

$("#connection + #arbolade")
  .css("height","50%");

function rectangle(x,y,w,h,color,border,text) {
  var n = $("#arbolade > div").length;
  $("#arbolade").append("<div id = 'rect-" + n + "'></div>");
  $("#arbolade > #rect-" + n).css({
    fontSize: "0.7em",
    overflow: "hidden",
    boxSizing: "border-box",
    borderStyle: "solid",
    borderWidth: 1,
    float: "left",
    position: "absolute",
    color: "rgb(180,180,180)"
  }).css({
    backgroundColor: color,
    borderColor: border,
    left: x,
    top: y,
    width: w, 
    height: h
  }).data({ x: x, y: y, w: w, h: h, clicked: false });
  
  if (text) { $("#arbolade > #rect-" + n).text(text); } 
}

// takes D3-style treemap data,
// converts to object of format { values: [], names: [] }    
// might be renamed buildLevel(data,top),
// as it might be useful to think of this as one zoom-level
// of the hierarchy
function buildNamesAndValues(data,top) {
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
        top_object.values[i] = buildNamesAndValues(data.children[i],false);
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
        leaf_total += buildNamesAndValues(data.children[i],false);
      }
    }
    return leaf_total;
  }
}

function buildSortedCells(data) {
  var namesAndValues = buildNamesAndValues(data,true);
  var sortedObjects = [];
  names = namesAndValues.names;
  namesAndValues.names.forEach(function(d,i) {
    sortedObjects.push({
      name: d,
      value: namesAndValues.values[i]
    })
  });
  return sortedObjects.sort(function(a,b) { return b.value - a.value; });
}

function arbolade(protoCells) {
  //originally there was a layer object that kept the totals
  var cells = protoCells;
  var total = calculateTotal();
  calculateCellPercents();
  setCellLabels();
  positionAndSizeCells();
  drawCells();

  //coupled to stringRGB(), needs to be moved elsewhere
  function drawCells() {
    cells.forEach(function(cell,i) {
      var colorValue = (80*cell.percent/100+30).toFixed(0);
      var colorRGB = "rgb(" + colorValue + "," + colorValue + "," + colorValue + ")";

      // color = randRGB();      
      // colorRGB = stringRGB(color);

      var borderRGB = "rgb(0,0,0)";

      rectangle(
        cell.x + "%",
        cell.y + "%",
        cell.width  + "%",
        cell.height + "%",
        colorRGB,
        borderRGB,
        cell.label
      );
    });
  }

  function cramCellsLeft(thisMany) {
    cells.forEach(function(cell,i) { 
      if (i >= thisMany) {
      }
    });
  }

  // p(" !! " + cramCellsLeft(2))

  function setCellLabels() {
    cells.forEach(function(cell, i) { 
      cell.label = cell.name +" ("+cell.value/2 + "h)";
    });
  }



  function positionAndSizeCells() {
    //WARNING: if you're reading this, width and height need to be rounded!
    var offset = { x: 0, y: 0 };
    cells.forEach(function(cell, i) {
      var direction = (i%2 == 0) ? "left" : "up";
      cell.x = offset.x;
      cell.y = offset.y;
      if (direction == "left") {
        cell.height = 100.0 - cell.y;
        cell.width = cell.percent/(cell.height/100);
        offset.x += parseFloat(cell.width);
      }
      else {
        cell.width = 100.0 - cell.x;
        cell.height = cell.percent/(cell.width/100);
        offset.y += parseFloat(cell.height);
      }
      // p(cell);
    });
  }

  function calculateTotal() {
    var total = 0;
    cells.forEach(function(cell) { total += cell.value; });
    return total;
  }
  function calculateCellPercents() {
    cells.forEach(function(cell) { 
      cell.percent = (cell.value/total*100).toFixed(2);
    });
  }
}


function manualCells(data) {
  // this array of objects MAY be better built from buildNamesAndValues
  var sorter_array = [];
  data.values.forEach(function(d,i) {
    sorter_array[i] = { 
      value: data.values[i], 
      name: data.names[i] 
    };
  });
  sorter_array.sort(function(a,b) { return b.value-a.value});

  data = data.values.sort(function(a,b) { return b-a});

  var data_total = 0;
  for (var i = 0; i < data.length; i++) {
    data_total += data[i];
  }

  var container = {
    width: $("#arbolade").width(),
    height: $("#arbolade").height()
  };
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
    var direction = (i%2 == 0) ? "vertical" : "horizontal";
    // var direction = "vertical";

    if (direction == "vertical") {
      height = 100.0 - offset.y;
      width = cells[i].percent/(height/100)*100;
    }
    else {
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
      label
    );

    //Add appropriate offset
    if (direction == "vertical") {
      offset.x += parseFloat(width);
    }
    else {
      offset.y += parseFloat(height);
    }
  }

}

$.getJSON('/data/arbolade', function(data){
  // var flattened_data = buildNamesAndValues(data,true);
  // manualCells(flattened_data);
  var cells = buildSortedCells(data);
  arbolade(cells);
});


$("#arbolade").on('touch click',"div",touchCell);
// $("#arbolade").on('mouseover touchstart',"div",lightCell);
// $("#arbolade").on('mouseout','div',darkCell);

function lightCell() {
  var me = $(this);
  me.data("backgroundColor", me.css("backgroundColor"));
  me.css("backgroundColor","rgb(60,60,100)");
  // me.css("borderColor","rgb(100,100,100)");
}

//WARNING: borderColor not originally set to anything.
function darkCell() { 
  var me = $(this);
  data = me.data();
  me.css("backgroundColor",data.backgroundColor);
  // me.css("borderColor","rgb(255,255,255)");
  // me.css("borderColor","black");
}

function touchCell() {
  var me = $(this);
  var data = me.data();
  // p(data);
  var destAnim;

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

