var start = new Date;

var targets = {
  first:5,
  second:8,
  third:3,
}

var done = {
  first: 2,
  second: 3,
  third: 1,
}

/*$( "<p>" + targets.first + "</p>" ).appendTo( "#meter" );
$( "<p>" + targets.second + "</p>" ).appendTo( "#meter" );
$( "<p>" + targets.third + "</p>" ).appendTo( "#meter" );
*/
function setMeterMargin(margin) {
  $(".block").css("margin-right", function() {
    return margin;
  });
  $(".block").css("margin-left", function() {
    return margin;
  });
}

function initMeter(container,target,margin) {
  for (var i = 0; i < target; i++) {
    $("<div class='block'></div>").appendTo(container);
  }

  $(container + " > .block").css("width", function() {
    // return ($(this).parent().width()/target-margin*2);
    return "calc(" + (100/target) + "% - " + margin*2 + "px)";
  });

  $(".block").css("margin-right", function() {
    return margin;
  });
  $(".block").css("margin-left", function() {
    return margin;
  });  
}-

setInterval(function() {
    var d = new Date();
    // $('#timer').text(d);
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

function fillMeter(container,done) {
  $(container + " > .block:lt(" + done + ")").css("opacity",0.4); 
}

var allMargin = 0.5;

setTimeMarkerPosition();
initMeter("#first",targets.first,allMargin);
fillMeter("#first",done.first);
initMeter("#second",targets.second,allMargin);
fillMeter("#second",done.second);
initMeter("#third",targets.third,allMargin);
fillMeter("#third",done.third);

initMeter("#twenty-four",48,allMargin);
setMeterMargin(allMargin);


setInterval(function(){
  $("#bottom-half").text("Width: " + window.innerWidth);
  $("#bottom-half").append("<br>Height: " + window.innerHeight);
}, 1000);