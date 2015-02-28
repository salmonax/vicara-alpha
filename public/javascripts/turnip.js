//BEGIN TwentyFourBar and Desiderata
function initHorizontalMeterBar(container,target,margin) {
  for (var i = 0; i < target; i++) {
    $("<div class='block'></div>").appendTo(container);
  }
  $(container + " > .block").css("width", function() {
    return 100/target + "%";
  });
}

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
//END TwentyFourBar

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
    var reversedData = data.reverse();
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
    //WARNING: here's some spaghetti that needs to be somewhere else!
    //Note: figure out why I said that
    for (i = 0; i < turnipData.length; i++) {
      target_total += turnipData[i].target;
    }

    setPomsDoneAndNotDone(lastPomsDone,target_total-lastPomsDone);
    //STEP 4: clean up my fucking mess
  });
}

function setPomsDoneAndNotDone(done,notDone) {
  $("#poms-done").text(done);
  $("#poms-not-done").text(notDone);
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
