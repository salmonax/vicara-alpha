/*
*  Data Building and DOM Functions
*  Arbolade
*  Callbacks and Related
*
* NOTE: this is still a mess and hurting for a third rewrite.
*/

//Begin Data Building and DOM Functions
function rectangle(x,y,w,h,color,border,text,name) {
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
  }).data({ x: x, y: y, w: w, h: h, name: name, clicked: false });
  if (text) { $("#arbolade > #rect-" + n).text(text); } 
}

function buildNamesAndValues(data,top) {
  // build object of structure { values: [], names: [] } D3-style treemap data
  // one zoom-level of hierarchy, so might be renamed buildLayer or something
  if (top) {
    var top_object = {};
    top_object.values = [];
    top_object.names = [];
    if (data.size) { 
      top_object.values[0] = [data.size]; 
    } else if (data.children) {
      for (var i=0; i < data.children.length; i++) {
        top_object.names[i] = data.children[i].name;
        top_object.values[i] = buildNamesAndValues(data.children[i],false);
      }
      return top_object;
    }
  } else {
    var leaf_total = 0;
    if (data.size) {
      leaf_total += data.size; 
    } else if (data.children) {
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
//END Data Building Functions


//BEGIN Arbolade
function arbolade(protoCells) {
  //a layer object could keep totals
  var cells = protoCells;
  var total = calculateTotal();
  calculateCellPercents();
  setCellLabels();
  positionAndSizeCells();
  drawCells();

  //coupled to stringRGB(), needs to be moved elsewhere
  function drawGrip() {

  }
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
        cell.label,
        cell.name
      );
    });
  }

  function cramCellsLeft(squarestNumber) {
    
    cells.forEach(function(cell,i) { 

    });
  }

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
//END Arbolade


//BEGIN Callbacks and Related

$.getJSON('/data/arbolade', function(data){
  initArbolade();

  $("#arbolade-grip").on("touch click",jumpToTopAndReload);
  function jumpToTopAndReload() {
    var topData = $("#arbolade-grip").data("top");
    var parentProtoCells = buildSortedCells(topData);
    $("#arbolade > div").remove();
    arbolade(parentProtoCells);
  }


  $("#arbolade").on("touch click","div",jumpToChildAndReload);
  function jumpToChildAndReload() { 
    var clicked = $(this).data("name");
    // r(clicked);
    var newLayer =  $("#arbolade-grip").data("layer");
    var isMaximized = $(this).data("clicked");
    
    newLayer += (isMaximized ? 1 : -1);
    $("#arbolade-grip").data({ layer: newLayer });

    $("#arbolade-grip").text(clicked);
    //filters children for clicked!
    childLayerData = data.children.filter(function(item) { 
      return item.name == clicked;
    })[0];

    if (childLayerData.children) {
      var protoCells = buildSortedCells(childLayerData);
      // this is where the new layer would be drawn!
      p("AAHHH!!!");
      $("#arbolade > div").remove();
      arbolade(protoCells);
    } else {
      p("No children!!!!!");
    }
  }

  function initArbolade() { 
    var protoCells = buildSortedCells(data);
    $("#arbolade-grip").data({ top: data, layer: 0 });
    $("#arbolade-grip").text(data.name);
    arbolade(protoCells);
  }

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
  TweenMax.to(me,0.2,destAnim);
  if (data.clicked == false) {
    me.data("clicked",true);
    TweenMax.to(me, 0, {zIndex:"1"});
  } else {
    me.data("clicked",false);
    TweenMax.to(me, 0, {zIndex:"0", delay:0.2});
  }
}
//END Callbacks and Related