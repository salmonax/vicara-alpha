/*
 *  Interval Updates and Time Helpers
 *  EventStream, for clock activation broadcasting
 *  Timer Clock
 *  Underchart, for translucent background charts on mobile 
 *  Buttons and Weeklies
 *  Vertical Meter Bars
 *  Key Events, Global
 *  Key Events, Textarea
 *  Key Events, Grepper
 *  Stats and Graph
 *  User-agent Specific Triggers
 *  Minimap
 *  Pomsheet Loaders and Handlers
 *
 *  TwentyFourBar and Desiderata -> turnip.js
 *  Turnip -> turnip.js
 *  Grepped Weeklies -> grepGraph.js
 *  Arbolade -> arbolade.js
 *  Ritmus, a parsley timer -> ritmus.js
 */ 

//BEGIN Interval Updates and Time Helpers
var lastUpdateTime = new Date();
var $MONTHS = ["January", "February","March","April","May","June","July","August","September","October","November","December"];
function getMonthName(number) {
  return $MONTHS[number-1];
}
function getMonthNum(name) { 
  return $MONTHS.indexOf(name)+1;
}

function updateInfo() {
  requestAnimationFrame(updateInfo);
  var currentUpdateTime = new Date();
  if (lastUpdateTime.getSeconds() < currentUpdateTime.getSeconds()) {
    setTimeMarkerPosition();
    // setLeftRight();
    updateConnectionDisplay();
    // showUpdatedTime();
  }
  lastUpdateTime = currentUpdateTime;
}


function showUpdatedTime() {
  var d = new Date();
  minutes = padTime(d.getMinutes());
  seconds = padTime(d.getSeconds());
  milliseconds = padTime(d.getMilliseconds());
  r("Updated: " + d.getHours() + ":"  + minutes + ":" + seconds + ":" + milliseconds); 
}

function padTime(digits) {
  return (digits < 10 ? "0" + digits : digits);
}

//END Interval Updates and Time Helpers

//BEGIN EvenStream
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

//BEGIN Timer Clock
$('#top-half').data({ clicked: false });

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
    var time_string = minutes_left + ":" + padTime(seconds_left);

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

// p("HELLO!!!");

//BEGIN Buttons and Weeklies

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
//END Buttons and Weeklies

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


//BEGIN Key Events, Global
var keyMap = {};


$("*").keydown(keyDownHandler);
$("*").keyup(keyUpHandler);

function keyDownHandler(event) {
  var keyCode = event.keyCode || event.which;
  keyMap[keyCode] = true;
  if (keyCode == 192) { toggleConsole(event) }
  if (keyMap[18] && keyMap[221]) { activateNotes();
  }
  if (keyMap[18] && keyMap[219]) { activatePomsheet(); }
  false //prevents need for event.preventDefault(), woot!
}

function keyUpHandler(event) {
  var keyCode = event.keyCode || event.which;
  delete keyMap[keyCode];
}
function activatePomsheet() {
  // $("#pomsheet-area").load("/stuff",updateMinimap);
  $("#pomsheet-area").val("Pomsheet Activated!");
}
function activateNotes() { 
  $("#pomsheet-area").val("Notes Activated!");
}


function toggleConsole() {
  var display = $("#debug").css("display");
  var output = $("#debug");
  var screen = $("#screen");
  var consoleClosed = {
    display: "none",
    height: "0%",
    // ease:Expo.easeInOut
  };
  var consoleOpen = {
    display: "block",
    height: "30%",
    // ease:Expo.easeInOut
  };

  var screenScrunched = { 
    height: "70%", 
    // ease:Expo.easeInOut 
  };
  var screenUnscrunched = { 
    height: "100%",
    // ease:Expo.easeInOut
  };

  if (display == "block") {
    TweenMax.to(output,0.1,consoleClosed);
    TweenMax.to(screen,0.1,screenUnscrunched);
  } else {
    TweenMax.to(output,0.1,consoleOpen);
    TweenMax.to(screen,0.1,screenScrunched);
  }
  return false;
}
// END Key Events, Global

// BEGIN Key Events, Text Area
var keyTimer = null, 
    duringDelay = 10,
    afterDelay = 1000, 
    typingBuffer = "",
    lastTyped = "";
var startTime, stopTime, duringTime;
var typingGraphData = [];
var lastWordCount = 0;

$("#pomsheet-area").keydown(typingHandler);
function typingHandler(event) {
  //NOTE: returning on enter/space may fix doubling bug
  var keyCode = event.keyCode || event.which;
  var val = this.value,
      start = this.selectionStart,
      end = this.selectionEnd;
  // Handle Tabs
  if (keyCode == 192) { return false; }
  if (keyCode == 9) {
    event.preventDefault();
    this.value = val.substring(0,start) + '\t' + val.substring(end);
    this.selectionStart = this.selectionEnd = start + 1;
    //NOTE: tabs are not mirrored below
    return false;
  } 
  // Handle Before, During, After Typing
  doBeforeEachKey();
  setTimeout(doDuringTyping, duringDelay);

  if (keyTimer) {
    window.clearTimeout(keyTimer);
  }
  else {
    doBeforeTyping();
  }

  keyTimer = window.setTimeout(function() {
    keyTimer = null;
    doAfterTyping();
  }, afterDelay);

  function doBeforeEachKey() { 
    lastTyped = "";
  }

  function doBeforeTyping() {
    startTime = new Date().getTime();
  }

  function doDuringTyping() {
    pushToTypingBuffer();
    outputBufferText();
    showRunningStats();
    updateMinimap();

    function pushToTypingBuffer() {
      lastTyped = $("#pomsheet-area").val()[start];
      if (lastTyped) { typingBuffer = typingBuffer + lastTyped; }
    }
    function outputBufferText() {
      $("#output").text("");
      // p(typingBuffer,true);
    }

    function showRunningStats() {
      outputStats();
    }
  }
  function doAfterTyping() {
    // outputStats();
    clearTypingBuffer();
    clearTypingGraphData();
    clearLastWordCount();
    // outputDoneText();
    function clearTypingBuffer() {
      typingBuffer = "";
    }
    function clearTypingGraphData() {
      typingGraphData = [];
    }
    function clearLastWordCount() {
      lastWordCount = 0;
    }
    function outputDoneText() {
      $("#output").text("Congratulations! You finished");
    }
  }

  function outputStats() {
    var currentTime = new Date().getTime();
    var elapsed_seconds = (currentTime-startTime*1)/1000,
        elapsed_minutes = elapsed_seconds/60,
        chars = typingBuffer.length,
        words = typingBuffer.split(" ").length,
        cps = Math.round(chars/elapsed_seconds*100)/100;
        wpm = Math.round(words/elapsed_minutes);
    r("keyCode: " + event.keyCode);
    p("keyMap: ",true); p(Object.keys(keyMap));
    p("New Word Count: " + words);
    p("Last Word Count: " + lastWordCount);
    p("Chart DIVS (!!): " + typingGraphData.length);
    p("Elapsed (seconds): " + elapsed_seconds);
    p("Elapsed (minutes): " + elapsed_minutes);
    p("Buffer Characters: " + chars);
    p("Buffer Words: " + words);
    p("CPS Typed: " + cps);
    p("WPM Typed: " + wpm);
    // p("typingGraphData: " + typingGraphData);
    if (words > lastWordCount && words > 15) {
      typingGraphData.push(wpm);
      if (words > 20) {
        updateGraph(typingGraphData);
      } else {
        // $("#graph").text("HYEEHAAW!");
        // do a countdown or something
      }
    }
    lastWordCount = words;
  }
}
//END Key Events, Text Area

//BEGIN Key Events, Grepper
var grepDuringDelay = 1000;
$("#pomsheet-grep-input").keydown(grepHandler);
function grepHandler(event) {
  // var grepDuringDelay
  setTimeout(doDuringGrepTyping, grepDuringDelay);
  function doDuringGrepTyping() { 
    var input = $("#pomsheet-grep-input").val();
    // r(input);
    var greppedArray = grepPomsheetFrom(input);
    // p($pomsheetLines);
    var greppedText = greppedArray.join("\n")
    //remove multiple newlines
    greppedText = greppedText.replace(/(\r\n|\r|\n){2,}/g, '$1\n');
    //remove multiple dates
    greppedText = greppedText.replace(/([0-9]{1,2}\/[0-9]{1,2}\/[0-9]{1,4}\w*\n*){2,}/g,'$1')
    //remove leading newlines and end dates
    greppedText = greppedText.replace(/(^\n*|[0-9]{1,2}\/[0-9]{1,2}\/[0-9]{1,4}\w*\n*$)/g,"");

    //WARNING: these calls are the slowest thing here!
    greppedArray = greppedText.split(/\n/);
    updateWeekliesGraph(greppedArray);

    $("#pomsheet-area").val(greppedText);
    updateMinimap();
    // p(greppedText);
  }
  function grepPomsheetFrom(input) {
    //includes dates AND whitespaces, for further stripping
    expression = "([0-9]{1,2}\/[0-9]{1,2}\/[0-9]{1,4}\w*$|^\s*$|" + input + ")" 
    var regex = RegExp(expression);
    output = $.grep($pomsheetLines, function(n,i) { 
      return regex.test(n);
    });
    return output;
  }
}
//END Key Events, Grepper

//BEGIN Stats and Graph
function updateGraph(data) {
  var width = 100/data.length;
  // p(wpm);
  // $("#output").text(data + " " + width);
  var max = Math.max.apply(Math,data);
  var min = Math.min.apply(Math,data);
  var lastWPM = data[data.length-1];
  var barPosition = (lastWPM-min)/(max-min)*100 + "%";
  // p(barPosition + "!!!!!");

  // I shouldn't have to do this; get rid of it at some point
  // Warning: the jQuery append assumes this is happening 
  $("#graphic div").remove();

  d3.select("#graphic")
    .selectAll("div")
      .data(data)
    .enter().append("div")
      .style("width", function(d) {
        return width + "%";
      })
      .style("left", function(d,i) { 
        return width*i + "%";
      })
      .style("height", function(d) { 
        return (d-min)/(max-min)*100 + "%";
      });
  d3.select("#graphic")
    .append("div")
      .style("position","absolute")
      .style("bottom","0px")
      .style("width","100%")
      .style("height",barPosition)
      .style("background","Transparent")
      .style("border-top-style", "solid")
      .style("border-top-width", "2px")
      .style("border-top-color", "rgb(100,100,200)")
      .style("opacity",1);
  $("#graphic").append("<div id='typing-max'>"+max+"</div>");
  $("#graphic").append("<div id='typing-min'>"+min+"</div>");
  $("#typing-max").css({ 
    height: "12px",
    position: "absolute",
    zIndex: 12,
    top: "10px",
    left: "10px",
  });
  $("#typing-min").css({
    height: "12px",
    position: "absolute",
    zIndex: 12,
    bottom: "10px",
    left: "10px"
  });
}
//END Stats and Graph

//BEGIN User Agent-specific triggers
if (navigator.userAgent.match(/iPad/i)) { toggleConsole();}

//END User Agent-specific triggers

//BEGIN Minimap
Draggable.create("#minimap-scroller-container", {
  type:"x,y", 
  edgeResistance:1, 
  bounds: "#minimap-area",
  onDragStart: function() { $("#pomsheet-area").data("isMiniDragging",true); },
  onDrag: dragMiniMap,
  onDragEnd: function() { $("#pomsheet-area").data("isMiniDragging",false); } 
});

function dragMiniMap() {
  var pomsheet = $("#pomsheet-area")[0];
  var minimap = $("#minimap-area")[0];

  var nubPosition = this.y;
  $("#pomsheet-area").data("miniNubY",nubPosition);

  //108px is the height of the scroll nub plus options; refactor
  var nubLowest = (parseInt($("#minimap-container").css("height"))-108);

  var nubPercent = nubPosition/nubLowest;

  var pomsheetHeight = pomsheet.scrollHeight;
  var pomsheetTop = pomsheet.scrollTop;

  var minimapHeight = minimap.scrollHeight;
  var minimapTop = minimap.scrollTop;

  var desiredMinimapTop = minimapHeight*nubPercent;
  
  var desiredPomsheetTop = pomsheetHeight*nubPercent;

  r("nubPercent: ",true); p(nubPercent);
  p("nubY: ",true); p(this.y);
  p("pomsheetHeight: ",true); p(pomsheetHeight);
  p("minimapHeight: ",true); p(minimapHeight);
  p("desiredPomSheetTop: ", true); p(desiredPomsheetTop);
  p("desiredMinimapTop: ",true); p(desiredMinimapTop);

  pomsheet.scrollTop = desiredPomsheetTop;
  minimap.scrollTop = desiredMinimapTop;
}
$("#pomsheet-area").data("isMiniDragging",false);
$("#pomsheet-area").data("miniNubY", 0.0);

$("#pomsheet-area").on("scroll",function() { 
  if ($(this).data("isMiniDragging") == false) {
    var minimap = $("#minimap-area")[0];
    var nubLowest = (parseInt($("#minimap-container").css("height"))-108);
    var minimapHeight = minimap.scrollHeight;
    var pomsheetPercent = this.scrollTop/this.scrollHeight;


    r(pomsheetPercent);
    p($(this).data("miniNubY"));
    p(nubLowest);
    var nubY = $(this).data("miniNubY");
    var nubPosition = nubLowest*pomsheetPercent
    TweenMax.set("#minimap-scroller-container",{ transform: "translateY("+nubPosition+"px)"});

    var desiredMinimapTop = minimapHeight*pomsheetPercent;
    minimap.scrollTop = desiredMinimapTop;

  }
});

function updateMinimap() {
  $("#minimap-area").val($("#pomsheet-area").val());
}
//END Minimap

//BEGIN Pomsheet Loaders and Handlers

$("#pomsheet-area").load("/stuff",pomsheetLoadHandler);

var $pomsheetLines = "";

function setPomsheetArray() { 
  //WARNING: assumes pomsheet is in reverse alphabetical! This should be a sort!
  $pomsheetLines = $("#pomsheet-area").val().split(/\n/);
}
function pomsheetLoadHandler() {
  updateMinimap();

  setPomsheetArray();
  updateWeekliesGraph($pomsheetLines);
}
//END Textarea Loaders

//BEGIN Date Helpers
function daysInMonth(month) {
  now = new Date;
  return new Date(now.getFullYear(),month,0).getDate();
}

function dateFromString(string) { 
  var parts = string.split('/');
  return new Date(parts[2],parts[0]-1,parts[1]);
}

//weekNums are represented as 1-52 (52 being a partial week)
function weekNum(date) {
  // p(typeof date);
  // var date = new Date();
  var first = new Date(date.getFullYear(),0,1);
  return Math.floor((date-first)/1000/60/60/24/7+1);
  // return 5;
}

function dayNum(date) {
  var first = new Date(date.getFullYear(),0,0);
  return Math.floor((date-first)/(1000*60*60*24));
}
//END Date Helpers

setLeftRight();
// setInterval(function() {
//     setTimeMarkerPosition();
//     setLeftRight();
//     updateConnectionDisplay();
//     showUpdatedTime();
// }, 1000);
//*** This triggers a rAF at file-beginning:
// updateInfo();


