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

function setLeftRight() {
  $("#pom-left").text((decimalTime()*2).toFixed(0));
  $("#pom-right").text((48-decimalTime()*2).toFixed(0));
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

// setMeterMargin(allMargin);



// setInterval(function(){
//   $("#bottom-half").text("Width: " + window.innerWidth);
//   $("#bottom-half").append("<br>Height: " + window.innerHeight);
// }, 1000);

// simple auto-refresh ajaxing technique
// refreshes = 0;
// function worker() {
//   $.ajax({
//     url: '/',
//     success: function(data) {
//       $('#bottom-half').text(refreshes++);
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

var focusData = [
  {target: 5, done: 4},
  {target: 10, done: 3},
  {target: 3, done: 1},
  {target: 4, done: 2}
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

d3.select("#sandbox")
  .append("div").attr("id","meter")
  .selectAll("div").data(focusData).enter().append("div")
    .attr("class","meta-block")
    .style("width",100/focusData.length + "%")
    .each(function(d) {
      var color = randRGB();
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
    // .text("HRLLO@")


function addStuff() { 
   $(this).append("<br>click!!");
}

$("#pomsheet-area").load("/stuff")

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

Draggable.create(".peg", {type:"x,y", edgeResistance:1, bounds: ".slider"});

Draggable.create("#button-start", {type:"x,y"})

// jeeZap();

