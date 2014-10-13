setInterval(function (){
  updateConnectionDisplay();
},1000);

function p(whatever) { 
  $("#output").append(whatever+"<br>")
}
function r(whatever) {
  $("#output").text(whatever);
}
function k(object) {
  pom_props = Object.keys(object)
  for (var i = 0; i < pom_props.length; i++) {
    p(pom_props[i] + ": " + object[pom_props[i]]);
  }
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

// $("#twenty-four > .block").css("background","white");

function fillTwentyFour(data,color) {
  for (i = 0; i < data.length; i++) {
    // Inner loops subtracts position for extra poms.
    // Should probably check for under 0, over 48
    for (j = 0; j < data[i].poms; j++) { 
      $("#twenty-four > .block:nth-child(" + (data[i].time*2-j) +")").css("background",color);
    }
  }
}

function clearTwentyFour() {
  $("#twenty-four > .block").css("background","rgb(40,40,40)");
}

function setTwentyFour() {
  $.getJSON('/today', function(data){
    fillTwentyFour(data,"rgb(150,150,150");
  });
}
 setTwentyFour();

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

function updateOnDropboxWebhook() {
  clearTwentyFour();
  setTwentyFour();
  $("#poms.shadow").load("/poms_left");
}

var es = new EventSource('/consume');
// postClockStop();
es.onmessage = function(e) {
  // p("message:" + e.data);
  if (e.data == "update_dropbox") {
    // p("Dropbox updated!");
    updateOnDropboxWebhook();
  } else if (e.data == "start_timer") {
      startClock();
    // p("EventSource Start!!!");
  } else if (e.data == "stop_timer") {
      stopClock();
    // p("EventSource Stop!!!!");
  } else {
    // p(e.data);
  }
};

// updateConnectionDisplay();
// $(document).ready(function () {
//   // postClockStop();
//   p("fuck!");
// })

function updateConnectionDisplay() {
  // p("HELLO");
  if (es.readyState == 1)
    $("#connection").text("EventStream Connected")
      .css("color","green");

  else {
    $("#connection").text("EventStream Disconnected")
      .css("color","red");
  }
}


$('#top-half').data({
  clicked: false
});

function postClockStart() { $.post("/timer/start"); }
function postClockStop() { $.post("/timer/stop"); }

function toggleClock() {
  var data = $("#top-half").data();
  if (data.clicked == false) {
    postClockStart();
  } else {
    postClockStop();
  }
}

var clockTimerID, lastStartTime;

function startClock() {
  $("#top-half").data("clicked",true);
  $("#top-half").css({"background": "rgb(0,0,0"});
  lastStartTime = new Date();
  clockTimerID = setInterval(function () { 
    var now = new Date();
    var milliseconds_in_pom = 25*60*1000;
    var elapsed = now-lastStartTime;
    var time_left = milliseconds_in_pom-elapsed;

    // rushed this, so redundant calculations
    var minutes_left = parseInt(time_left/1000/60);
    var seconds_left = ((time_left-(minutes_left*1000*60))/1000).toFixed(0);
    var time_string = minutes_left + ":" + seconds_left;

    $("#poms").text(time_string);
  },1000)
}

function stopClock() {
  $("#top-half").data("clicked",false);
  $("#top-half").css({"background": "transparent"});
  clearInterval(clockTimerID);
}

$("#top-half").on("touch click",toggleClock);


// BEGIN #sandbox mess
function getStats() { 
  $.getJSON('/stats_today', function(data) { 
    var focusData = buildFocusData(data);
    // meterizeTwentyFour(focusData);
    initSandBoxMeter("#top-half",focusData);
    initSandBoxLabels("#top-half",focusData);
    // k(data);
  });
}
getStats();

function meterizeTwentyFour(focusData) {
  $.getJSON('/today', function(data){
    var target_total = 0;
    focusData.forEach(function(meta_block) {
      target_total += meta_block.target;
      // p(target_total); 
      $("#twenty-four > .block:lt(10)").css("background","black");
    });    
  });

}

var colors = [
  {r: 200, g: 75, b: 75},
  {r: 200, g: 125, b: 75},
  {r: 175, g: 175, b: 75},    
  {r: 50, g: 175, b: 100},
  {r: 75, g: 125, b: 200},
  {r: 125, g: 100, b: 200},
  {r: 125, g: 100, b: 200},
  {r: 125, g: 100, b: 200},
];

function buildFocusData(stats) {
  var poms_today = stats["today"];
  var target_today = stats["target"];
  delete stats["date"];
  delete stats["today"];
  // delete stats["vicara"];

  var sorted_stats = Object.keys(stats).sort(function(a,b) {
    return stats[a]-stats[b];
  });
  var focusData = [];
  // pStats();

  // var target_total = 0;
  for (index in sorted_stats) {
    var label = sorted_stats[index];
    var target = stats[label];

    focusData.push({
      label: label,
      target: target,
      done: poms_today
    });
  }

  var active_label = getActiveLabel();
  
  subtractAndDeleteBlocks();
  calculateDone();
  renderFromActive(active_label);


  function getActiveLabel() {
    var poms_left = 0;
    for (var i = 0; i < focusData.length; i++) {
      if (poms_today < focusData[i].target) {
        var poms_left = focusData[i].target-poms_today;
        // $("#poms").text(poms_left);
        return focusData[i].label;
      }
    }
  }

  function renderFromActive(active_label) {
    focusData.forEach(function (d,i) {
      if (d.label == active_label) {
        // $("#poms").text(target_today-poms_today);
        $("#poms").text(d.target-d.done);
        $("#poms").css("color",stringRGB(colors[i]));
      } 
    });
  }

  function subtractAndDeleteBlocks() {
    var last_focus = { target: 0 };
    for (var i = 0; i < focusData.length ; i++) {
      focus = JSON.parse(JSON.stringify(focusData[i]));
      focusData[i].target = focusData[i].target - last_focus.target;
      last_focus = focus;
    }
    focusData = focusData.filter(function(item) { 
      return item.target > 0;
    });
  }

  function calculateDone() {
    var total = 0;
    for (var i = 0; i < focusData.length; i++) {
      focusData[i].done = poms_today-total;
      total += focusData[i].target;
    }
  }
// 
  function pStats() {
    for (label in sorted_stats) {
      p(sorted_stats[label] + ": " + stats[sorted_stats[label]]);
    }
  }

  // pStats();
  return focusData;
}

// $("#poms").load("/poms_left");
// $("#poms").text(pomMeter(poms));

// var focusData = [
//   {target: 5, done: 4},
//   {target: 10, done: 3},
//   {target: 3, done: 1},
//   {target: 4, done: 2}
// ]

// function pomMeter(poms) {
//   return poms.due-poms.done;
// }

// END meter code

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

function initSandBoxMeter(container,data) {
  d3.select(container)
    .append("div").attr("class","meter")
    .selectAll("div").data(data).enter().append("div")
      .attr("class","meta-block")
      .style("width",100/data.length + "%")
      .each(function(d, i) {
        var color = colors[i];
        var doneColor = stringRGB(color,50);
        // var doneColor = stringRGB(colors[5],60);
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

function initSandBoxLabels(container,data) {
  // var meterLabels = ["Yesterday","Average","Target","Record","Vicara"];
  d3.select(container)
    .append("div").attr("class","meter lil-shadow")
    .selectAll("div").data(data).enter().append("div")
      .attr("class","meta-block")
      .style("margin-top","5px")
      .style("width",100/data.length + "%")
      .each(function(d,i) {
        d3.select(this).style("color",stringRGB(colors[i]));
        // d3.select(this).css("color","black");
      })
      .text(function(d) { return d.label[0].toUpperCase()+d.label.slice(1); });
}

var meterLabels = ["Yesterday","Average","Target","Record","Vicara"];
initSandBoxMeter("#sandbox",focusData);
initSandBoxLabels("#sandbox",focusData,meterLabels);
// initSandBoxMeter("#top-half",focusData);
// initSandBoxLabels("#top-half",focusData);


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


function initWeeklies(day_of_month) {
  day_of_week = (day_of_month-1)%7+1;
  for (i = 0; i < 7; i++) {
    $('#weeklies').append("<div class = weekly-header>" + i + " </div>");
    // if ((days_of_week-1) == i) {
    //   $("#weeklies > .weekly-head:nth-child(" + i")").css("background","white");
    // }
  }

  for (i = 0; i < 7; i++) {
    $('#weeklies').append("<div class = weekly-days></div>");
  }

  $('.weekly-header').css("width",100/7 + "%");
  $('.weekly-days').css("width",100/7 + "%");

  for (j = 0; j < 48; j++) {
    $('.weekly-days').append("<div class = weekly-hour>" + j + " </div>");
  }

  $('.weekly-days').css
}

initWeeklies(7);




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





