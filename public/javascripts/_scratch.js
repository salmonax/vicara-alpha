
// setInterval(function(){
//   $("#bottom-half").text("Width: " + window.innerWidth);
//   $("#bottom-half").append("<br>Height: " + window.innerHeight);
// }, 1000);

// simple auto-refresh ajaxing technique
// refreshes = 0;
// function worker() {
//   $.ajax({
//     url: '/poms_left',
//     success: function(data) {
//       $('#poms.shadow').text(data);
//     },
//     complete: function() {
//       setTimeout(worker,1000);
//     }
//   });
// }
// worker();

// function updateOnFileChange() { 
//   window.location.reload();
// }

// function worker() {
//   $.ajax({
//     url: '/consume',
//     success: function(data) { 
//       p(data);
//     },
//     complete: function() {
//       setTimeout(worker,100);
//     }
//   });
// }
// setTimeout(worker,100);
//--
// $(".draggable").draggable();
// $("#slider").slider({
//     orientation: "horizontal"
// });

// var logo = $('#nurnie');
// TweenLite.to(logo,1, {left:"500px"})


// 
// setTimeout("location.reload(true);",2000);

// $("#bottom-half").on('touchstart click',addStuff);
//--

//early jeeZap scraps
$("#logo2").on('touchstart click',jeeZap);

function jeeZap() {
  var logo = $("#logo");

  var logo2 = $("#logo2");
  TweenMax.to([logo,logo2], 0.5, {
    width:"632px", 
    height:"400px", 
    backgroundColor: "white",
    onUpdate:updateHandler,
    onComplete:completeHandler,
    onCompleteParams:["animation complete!"]
  });
  TweenMax.to([logo,logo2], 0.5, {
    width:"50px", 
    height:"50px", 
    backgroundColor: "black",
    onUpdate:updateHandler,
    delay: 0.5
  });
}

function jeeZap2() { 
  $("#logo").animate({width: "500px",height: "500px"}, 1000);
  $("#logo").animate({width: "50px", height: "50px"}, 1000);
}
function updateHandler() {
  $("#logo").text($("#logo").css("width"))
}
function completeHandler(message) {
  $("#whatever").text(message);
}
//--
initMeter("#first",targets.first,allMargin);
fillMeter("#first",done.first,"rgb(150,120,120");
initMeter("#second",targets.second,allMargin);
fillMeter("#second",done.second,"rgb(120,150,120");
initMeter("#third",targets.third,allMargin);
fillMeter("#third",done.third,"rgb(120,120,150");
//--

//*** dumb meter crap

// $("#top-half").append("<div id=lmeter></div>");
// $("#top-half").append("<div id=rmeter></div>");
// $("#rmeter").css({
//     position: "relative",
//     top: -90,
//     float: "right",
//     height: "80%",
//     width: "15px",
//     background: "rgb(150,0,0)"
//   });
// $("#lmeter").css({
//     position: "relative",
//     top: -90,
//     float: "left",
//     height: "80%",
//     width: "15px",
//     background: "black"
//   });


// initMeterV("#rmeter",poms.debt,allMargin);
// fillMeterV("#rmeter",0,"rgb(100,100,100)");

// initMeterV("#lmeter",10,allMargin);
// fillMeterV("#lmeter",0,"rgb(100,100,100)");


// Draggable.create(".peg", {type:"x,y", edgeResistance:1, bounds: ".slider"});
// Draggable.create("#button-start", {type:"x,y"});

// jeeZap();

//--
var start = new Date;

var targets = {
  first:5,
  second:10,
  third:3,
}

var done = {
  first: 4,
  second: 3,
  third: 1,
}
//--------------- from arbolade ----
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
//-- Original Treemap Chickenscratch
$.getJSON('/data/arbolade', function(data){
  var flattened_data = buildNamesAndValues(data,true); //from arbolade.js
  manualCells(flattened_data);
});

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
