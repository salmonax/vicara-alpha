function p(whatever) { 
  $("#output").append(whatever+"<br>")
}

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

function initMeter(container,target,margin) {
  for (var i = 0; i < target; i++) {
    $("<div class='block'></div>").appendTo(container);
  }
  $(container + " > .block").css("width", function() {
    return 100/target + "%";
  });
}

setInterval(function() {
    setTimeMarkerPosition();
    setLeftRight();
}, 1000);

// This is awful; temporary. Long-poll or whatever will take care of crap like this.
setInterval(function() {
    setTwentyFour();
}, 10000);

function decimalTime() {
  var d = new Date();
  var decimal_time = d.getHours() + (d.getMinutes()+(d.getSeconds()/60))/60;
  return decimal_time;  
}

function timeMarkerPosition() {
  return (decimalTime()/24*100).toFixed(2);
}

function setTimeMarkerPosition() {
  $("#time-marker").css("left", function() {
    return timeMarkerPosition() + "%";
  });
}

function fillMeter(container,done,color) {
  $(container + " > .block:lt(" + done + ")").css("background",color); 
}

var pom_left = (decimalTime()*2).toFixed(0);
var pom_right = (48-decimalTime()*2).toFixed(0);

function setLeftRight() {
  $("#pom-left").text(pom_left);
  $("#pom-right").text(pom_right);
}



var allMargin = 0;

setTimeMarkerPosition();

initMeter("#first",targets.first,allMargin);
fillMeter("#first",done.first,"rgb(150,120,120");
initMeter("#second",targets.second,allMargin);
fillMeter("#second",done.second,"rgb(120,150,120");
initMeter("#third",targets.third,allMargin);
fillMeter("#third",done.third,"rgb(120,120,150");

initMeter("#twenty-four",48,allMargin);

function fillTwentyFour(data,color) {
  for (i = 0; i < data.length; i++) {
    // Inner loops subtracts position for extra poms. Needs check for under 0, over 48
    for (j = 0; j < data[i].poms; j++) { 
      $("#twenty-four > .block:nth-child(" + (data[i].time*2-j) +")").css("background",color);
    }
  }
}

function setTwentyFour() {
  $.getJSON('/today', function(data){
    fillTwentyFour(data,"rgb(150,150,150");
  });
}

 setTwentyFour();

// var entry_times = '[{"time":1.0,"poms":1.0}]';
// fillTwentyFour(entry_times,"rgb(150,150,150");




// setMeterMargin(allMargin);



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

// var data = [4, 8, 15, 16, 23, 42];

// var x = d3.scale.linear()
//   .domain([0, d3.max(data)])
//   .range([0,420]);

// d3.select("#sandbox")
//   .selectAll("div")
//     .data(data)
//   .enter().append("div")
//     .style("background-color","red")
//     .style("margin-bottom","0.2em")
//     .style("width", function(d) { return x(d) + "px"; })
//     .text(function(d) { return d; });



// BEGIN #sandbox mess
var poms = {};
poms.dailies = [9,6,3,2,0];
poms.target = 8;
poms.record = 9;
poms.average = 5; //not including today
poms.due = 40; //including today
poms.done = 20; 
poms.yesterday = 2;
poms.today = 0;
poms.debt = poms.due-poms.done

$("#poms.shadow").load("/poms_left");
// $("#poms.shadow").text(pomMeter(poms));

var focusData = [
  {target: 5, done: 4},
  {target: 10, done: 3},
  {target: 3, done: 1},
  {target: 4, done: 2}
]

function pomMeter(poms) {
  return poms.due-poms.done;
}

var bars = {};
bars.yesterday = poms.yesterday; 
bars.average = poms.average - poms.yesterday;
bars.target = poms.target - poms.average;
bars.record = poms.record - poms.target;
bars.debt = poms.debt - poms.record;


var focusData = [
  {target: bars.yesterday, done: 0},
  {target: bars.average, done: 0},
  {target: bars.target, done: 0},
  {target: bars.record, done: 0},
  {target: bars.debt, done: 0}

]


function randColor() { 
  return +(Math.random() * 200 + 55).toFixed(0);
}
function randRGB() {
  return { r: randColor(), g: randColor(), b: randColor() } 
}

function stringRGB(colorObj,offset) { 
  offset = offset || 0; 
  return "rgb(" + (colorObj.r+offset) + "," + (colorObj.g+offset) + "," + (colorObj.b+offset) + ")";
}

var colors = [
  {r: 200, g: 125, b: 75},
  {r: 175, g: 175, b: 75},    
  {r: 50, g: 175, b: 100},
  {r: 75, g: 125, b: 200},
  {r: 125, g: 100, b: 200},
];

function initSandBoxMeter(container) {
  d3.select(container)
    .append("div").attr("class","meter")
    .selectAll("div").data(focusData).enter().append("div")
      .attr("class","meta-block")
      .style("width",100/focusData.length + "%")
      .each(function(d, i) {
        var color = colors[i];
        var doneColor = stringRGB(color,50);
        var baseColor = stringRGB(color);
        var borderColor = stringRGB(color,-50);
        for(i=0;i < d.target;i++) {
          d3.select(this).append("div")
            .attr("class","block")
            .style("width",100/d.target + "%")
            .style("background", i < d.done ? doneColor : baseColor)
            .style("border","1px solid " + borderColor);
        }
      });
}

function initSandBoxLabels(container) {
  var meterLabels = ["Yesterday","Average","Target","Record","Vicara"];
  d3.select(container)
    .append("div").attr("class","meter lil-shadow")
    .selectAll("div").data(meterLabels).enter().append("div")
      .attr("class","meta-block")
      .style("margin-top","5px")
      .style("width",100/focusData.length + "%")
      .each(function(d,i) {
        d3.select(this).style("color",stringRGB(colors[i]));
        // d3.select(this).css("color","black");
      })
      .text(function(d) { return d; });
}

initSandBoxMeter("#sandbox");
initSandBoxLabels("#sandbox");
initSandBoxMeter("#top-half");
initSandBoxLabels("#top-half");


function addStuff() { 
   $(this).append("<br>click!!");
}

$("#pomsheet-area").load("/stuff");

// $(".draggable").draggable();
// $("#slider").slider({
//     orientation: "horizontal"
// });

// var logo = $('#nurnie');
// TweenLite.to(logo,1, {left:"500px"})


// 
// setTimeout("location.reload(true);",2000);

$("#bottom-half").on('touchstart click',addStuff);
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

//END #sandbox mess

var daily_data = {}
daily_data.tags = ["R","RR","WW","W",">"];
daily_data.categories = ["Read","Journal Writing","Vicara"]

function makeButtons(data,container_id) {
  $("#top-half").append("<div id =" + container_id + "></div>");
  $.each(data, function(i,l) { 
    $("#" + container_id).append("<div class = 'tag-button'>" + l + "</div>");
  });
}

makeButtons(daily_data.tags,"tag-buttons");
makeButtons(daily_data.categories,"category-buttons");

$("#input-start").on("touchstart click", function() {
  $("#tag-buttons").css({
      "display": "block"
    });
});

$("#tag-buttons > .tag-button").on("touchstart click", function() { 
  $("#category-buttons").css({
    "display" : "block"
  });
  $("#pomsheet-input").val($(this).text());
});

$("#category-buttons > .tag-button").on("touchstart click", function() { 
  $("#category-buttons").css({
    "display" : "block"
  });
  var text = $(this).text();
  $("#pomsheet-input").val(text);
});


function initWeeklies() {
  for (i = 0; i < 14; i++) { 
    $('#weeklies').append("<div class = weekly-header>" + (i+1) + " </div>");
  }

  for (i = 0; i < 14; i++) {
    $('#weeklies').append("<div class = weekly-days></div>");
  }

  $('.weekly-header').css("width",100/14 + "%");
  $('.weekly-days').css("width",100/14 + "%");

  for (j = 0; j < 24; j++) {
    $('.weekly-days').append("<div class = weekly-hour>" + j + " </div>");
  }

  $('.weekly-days').css
}

initWeeklies();


// refactor this
function initMeterV(container,target,margin) {
  for (var i = 0; i < target; i++) {
    $("<div class='vblock'></div>").appendTo(container);
  }
  $(container + " > .vblock").css({
    height: (100/target + "%"),
    border: "1px solid gray"
  });
}

function fillMeterV(container,done,color) {
  $(container + " > .vblock:lt(" + done + ")").css("background",color); 
}

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

Draggable.create(".peg", {type:"x,y", edgeResistance:1, bounds: ".slider"});
Draggable.create("#button-start", {type:"x,y"});

// jeeZap();





