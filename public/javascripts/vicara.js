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

var focusData = [
  {target: 5, done: 4},
  {target: 10, done: 3},
  {target: 3, done: 1}
]

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
}, 1000);

function timeMarkerPosition() {
  var d = new Date();
  var decimal_time = d.getHours() + (d.getMinutes()+(d.getSeconds()/60))/60;
  return (decimal_time/24*100).toFixed(2);
}

function setTimeMarkerPosition() {
  $("#time-marker").css("left", function() {
    return timeMarkerPosition() + "%";
  });
}

function fillMeter(container,done,color) {
  $(container + " > .block:lt(" + done + ")").css("background",color); 
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


// setTimeout("location.reload(true);",1000);

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
  {target: 3, done: 1}
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

$("#bottom-half").on('touchstart click',addStuff);

function addStuff() { 
   $(this).append("<br>click!!");
}

$("#pomsheet-area").load("/stuff")