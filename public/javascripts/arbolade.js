var data = {
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

var whatever = ["Hello","Bye","Whatever"];


// $.each(whatever, function(i, value){ 
//     $("#arbolade").append("<div>" + value + "</div>");
// });

function p(whatever) { 
  $("#android").append(whatever);
}

// p(data.children[0].children[0].name);

$("#arbolade")
  .css("position","relative")
  .css("left",40)
  .css("top",40)
  .css("width",290)
  .css("height",290)
  .css("backgroundColor","black");

function rectangle(x,y,w,h,color,text) {
  var n = $("#arbolade > div").length;
  $("#arbolade").append("<div id = 'rect-" + n + "'></div>");
  $("#arbolade > #rect-" + n)
    .css("float","left")
    .css("position","absolute")
    .css("backgroundColor",color)
    .css("color","rgb(180,180,180")
    .css("left",x)
    .css("top",y)
    .css("width",w)
    .css("height",h);
  if (text) { $("#arbolade > #rect-" + n).text(text); } 
}

// p("hello" + $("#arbolade").children('div').length;


// FIRST: vertical fit

var areas = [20,40,60,90];

function manualCells(data) {

  data = data.sort().reverse();


  var data_total = 0;
  for (i = 0; i < data.length; i++) {
    data_total += data[i];
  }

  var container = {};

  container.width = $("#arbolade").width();
  container.height = $("#arbolade").height();
  container.area = container.width*container.height;

  var cells = [];

  // container.area*cells[1].percent/second_width;

  for (i = 0; i < data.length; i++) {
    cells[i] = {}
    cells[i].datum = data[i];
    cells[i].percent = data[i]/data_total;
  }

  //on each rectangle call, add to the x offset and y offset from the width if even, height if odd

  var offset = { x: 0, y: 0 };
  var width = 0, height = 0;

  for (i = 0; i < data.length; i++) {
    if (i%2 == 0) { 
      height = container.height-offset.y;
      width = container.area*cells[i].percent/height;
    }
    else { 
      width = container.width-offset.x;
      height = container.area*cells[i].percent/width;
    }

    var colorValue = (255*cells[i].percent).toFixed(0);
    var colorRGB = "rgb(" + colorValue + "," + colorValue + "," + colorValue + ")";

    rectangle(
      offset.x,
      offset.y,
      width,
      height,
      colorRGB,
      (cells[i].percent*100).toFixed(1)
    );

    if (i%2 == 0) {
      offset.x += width;
    }
    else {
      offset.y += height;
    }

  }

}

function addCells(array,container) {

  $.each(array, function(i,v) { 
    p("Hello");
  });
}

manualCells(areas);

// addCells(areas);



// $.each(areas, function (i,v) {
//   p(i + "<br>");
// });

// p(area_percentages + "<br>");


// rectangle(0,0,100,100,"rgb(100,100,100)");
// rectangle(0,0,100,100,"rgb(50,100,100)");
// rectangle(0,0,100,100,"rgb(40,100,100)");

// p(String($("#arbolade > .rect").length));
