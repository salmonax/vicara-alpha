//BEGIN Print Helpers
function r(whatever) {
  $("#output").text(whatever);
}

function printString(whatever,noBreak) { 
    $("#output").append(whatever);
    if (!noBreak) { $("#output").append("<br>") }
}
function printObject(object,noBreak) {
  var pom_props = Object.keys(object);
  printString("{ ", true);
  for (var i = 0; i < pom_props.length; i++) {
    printString(pom_props[i] + ": ", true);
    p(object[pom_props[i]],true);
    if (i < (pom_props.length-1)) { printString(", ",true); }
  }
  printString(" }", true);
  if (!noBreak) { $("#output").append("<br>") }
}
function printArray(array,noBreak) {
  printString("[",true);
  for (var i = 0; i < array.length; i++) { 
    p(array[i],true);
    if (i < (array.length-1)) printString(", ", true); 
  }
  printString("]",true);
  if (!noBreak) { $("#output").append("<br>") }
}

function p(variable,noBreak) { 
  if (variable instanceof Object) {
    if (variable instanceof Array) {
      printArray(variable,noBreak);
    }
    else {
      printObject(variable,noBreak);
    }
  }
  else {
    printString(variable,noBreak); 
  }
}
//END Print Helpers

//BEGIN  Color Helpers

function randColor(offset) { 
  //rejigger this to take parameters to take multiplier and offset
  return +(Math.random() * 50 + 20).toFixed(0);
}
function randRGB() {
  return { r: randColor(), g: randColor(), b: randColor() } 
}

function stringRGB(colorObj,offset) { 
  offset = offset || 0; 
  return "rgb(" + (colorObj.r+offset) + "," + (colorObj.g+offset) + "," + (colorObj.b+offset) + ")";
}

//END Color Helpers


//BEGIN TwentyFourBar and desiderata
function initHorizontalMeterBar(container,target,margin) {
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

setTimeMarkerPosition();

var allMargin = 0;
initHorizontalMeterBar("#twenty-four",48,allMargin);

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
//END TwentyFourBar and desiderata


//BEGIN EvenStream

setInterval(function (){
  updateConnectionDisplay();
},1000);


function updateOnDropboxWebhook() {
  clearTwentyFour();
  setTwentyFour();
  $("#poms.shadow").load("/poms_left");
}

var es = new EventSource('/consume');
es.onmessage = function(e) {
  if (e.data == "update_dropbox") {
    updateOnDropboxWebhook();
  } else if (e.data == "start_timer") {
      startClock();
  } else if (e.data == "stop_timer") {
      stopClock();
  }
};

function updateConnectionDisplay() {
  if (es.readyState == 1)
    $("#connection").text("EventStream Connected")
      .css("color","green");

  else {
    $("#connection").text("EventStream Disconnected")
      .css("color","red");
  }
}

//END EventStream

//BEGIN Clock
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
  var count = $("#poms").data().count;

  $("#top-half").data("clicked",false);
  $("#top-half").css({"background": "transparent"});
 
  clearInterval(clockTimerID);
  $("#poms").text(count);
}

$("#top-half").on("touch click",toggleClock);
//END Clock

// BEGIN Turnip, the max/average/minimum velocity pacer
var turnipColors = [
  {r: 200, g: 75, b: 75},
  {r: 200, g: 125, b: 75},
  {r: 175, g: 175, b: 75},    
  {r: 50, g: 175, b: 100},
  {r: 75, g: 125, b: 200},
  {r: 125, g: 100, b: 200},
  {r: 125, g: 100, b: 200},
  {r: 125, g: 100, b: 200},
];

function getRawTurnipStats() { 
  $.getJSON('/stats_today', function(data) { 
    var turnipData = buildTurnipData(data);
    turnipizeTwentyFour(turnipData);
    initTurnipBar("#top-half",turnipData);
    initTurnipBarLabels("#top-half",turnipData);
    // drawUnderlayerChart(turnipData);
    // k(data);
  });
}
getRawTurnipStats();

function turnipizeTwentyFour(turnipData) {
  $.getJSON('/today', function(data){
    var target_total = 0;
    var nowIndex = Math.round(decimalTime()*2);
    var i;

    var total = 0

    //STEP 1: get the cumulative total into each data object
    for (i=0;i < data.length; i++) {
      total += data[i].poms
      data[i].total = total
    }
    //STEP 2: reverse through and lt from greatest to least,
    //        extract the correct color from the turnipData block
    var reversedData = data.reverse()
    var lastTaskIndex = reversedData[0].time*2;
    var lastPomsDone = reversedData[0].total;
    reversedData.forEach(function(task, i) {
      var taskIndex = task.time*2; 
      var pomsDone = task.total;
      var turnipIndex = getTurnipIndexAt(turnipData,pomsDone); 
      var turnipColor= turnipColors[turnipIndex];
      var turnipColorRGB = stringRGB(turnipColor);
      var turnipBrightRGB = stringRGB(turnipColor,50);
      var turnipBorderRGB = stringRGB(turnipColor,-100);
      // var turnipBrightRGB = "white";
      // p("color block " + taskIndex + " to color of block " + turnipIndex);
      $("#twenty-four > .block:lt("+taskIndex+")").css({
        backgroundColor: turnipColorRGB,
        borderColor: turnipBorderRGB
      });
      $("#twenty-four > .block:nth-child("+taskIndex+")").css("background",turnipBrightRGB);
    });
    //STEP 3: add right portion with nth-child via iteration
    for (i = nowIndex; i < 48; i++) {
      var blocksAfterLast = i-nowIndex;
      var turnipAfterLast = getTurnipIndexAt(turnipData,lastPomsDone+blocksAfterLast);
      var colorAfterLast = turnipColors[turnipAfterLast];
      var colorAfterLastRGB = stringRGB(colorAfterLast);
      var colorAfterLastBrightRGB = stringRGB(colorAfterLast,50);
      var colorAfterLastBorderRGB = stringRGB(colorAfterLast,-100);
      // p("here: " + i + " " + blocksAfterLast);
      $("#twenty-four > .block:nth-child("+(i+1)+")").css({
        backgroundColor: colorAfterLastRGB,
        borderColor: colorAfterLastBorderRGB
      });
    }
    // p(lastTaskIndex);
    //STEP 4: clean up my fucking mess
  });
}

function getTurnipIndexAt(turnipData,pomsDone) {
  var turnipTotal = 0;
  var i;
  for (var i = 0 ; i < turnipData.length; i++) {
    turnipTotal += turnipData[i].target
    if (turnipTotal > pomsDone) { break; }
  }
  return i;
}


function buildTurnipData(stats) {
  var poms_today = stats["today"];
  var target_today = stats["target"];
  delete stats["date"];
  delete stats["today"];
  // delete stats["vicara"];

  var sorted_stats = Object.keys(stats).sort(function(a,b) {
    return stats[a]-stats[b];
  });

  var turnipData = [];
  // pStats();

  // var target_total = 0;
  for (index in sorted_stats) {
    var label = sorted_stats[index];
    var target = stats[label];

    turnipData.push({
      label: label,
      target: target,
      done: poms_today
    });
  }

  var running_label = getRunningTurnipLabel();
  
  subtractAndDeleteBlocks();
  calculateDone();
  renderFromActive(running_label);


  function getRunningTurnipLabel() {
    var poms_left = 0;
    for (var i = 0; i < turnipData.length; i++) {
      if (poms_today < turnipData[i].target) {
        var poms_left = turnipData[i].target-poms_today;
        // $("#poms").text(poms_left);
        return turnipData[i].label;
      }
    }
  }

  function renderFromActive(active_label) {
    turnipData.forEach(function (d,i) {
      if (d.label == active_label) {
        // $("#poms").text(target_today-poms_today);
        var count = d.target-d.done;
        $("#poms").text(count);
        $("#poms").data("count",count);
        $("#poms").css("color",stringRGB(turnipColors[i]));
      } 
    });
  }

  function subtractAndDeleteBlocks() {
    var last_focus = { target: 0 };
    for (var i = 0; i < turnipData.length ; i++) {
      focus = JSON.parse(JSON.stringify(turnipData[i]));
      turnipData[i].target = turnipData[i].target - last_focus.target;
      last_focus = focus;
    }
    turnipData = turnipData.filter(function(item) { 
      return item.target > 0;
    });
  }

  function calculateDone() {
    var total = 0;
    for (var i = 0; i < turnipData.length; i++) {
      turnipData[i].done = poms_today-total;
      total += turnipData[i].target;
    }
  }
// 
  function pStats() {
    for (label in sorted_stats) {
      p(sorted_stats[label] + ": " + stats[sorted_stats[label]]);
    }
  }
  return turnipData;
}

function initTurnipBar(container,data) {
  d3.select(container)
    .append("div").attr("class","meter")
    .selectAll("div").data(data).enter().append("div")
      .attr("class","meta-block")
      .style("width",100/data.length + "%")
      .each(function(d, i) {
        var color = turnipColors[i];
        var doneColor = stringRGB(color,50);
        // var doneColor = stringRGB(turnipColors[5],60);
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

function initTurnipBarLabels(container,data) {
  d3.select(container)
    .append("div").attr("class","meter lil-shadow")
    .selectAll("div").data(data).enter().append("div")
      .attr("class","meta-block")
      .style("margin-top","5px")
      .style("width",100/data.length + "%")
      .each(function(d,i) {
        d3.select(this).style("color",stringRGB(turnipColors[i]));
        // d3.select(this).css("color","black");
      })
      .text(function(d) { return d.label[0].toUpperCase()+d.label.slice(1); });
}
//END Turnip


//BEGIN UnderChart
function drawUnderChart(turnipData) {
  var results = [0,20,40,60,0]
  for (i = 0; i < results.length; i++) {
    var width = 100/7;
    var offset = i*width;
    $("#weekly-chart").append("<div class=day-block></div>");
    $("#weekly-chart > .day-block:nth-child("+(i+1)+")").css({
      position: "absolute",
      top: results[i] + "%", 
      left: "0", right: "0", bottom: "0",
      left: offset + "%",
      width: width + "%",
      height: "auto",
      backgroundColor: "rgb(0,150,150)",
      opacity: 0.2
    });

  }
}
//END UnderChart

var meterLabels = ["Yesterday","Average","Target","Record","Vicara"];


$("#pomsheet-area").load("/stuff");


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


//BEGIN Vertical Meter Bars
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
//END Vertical Meter Bars