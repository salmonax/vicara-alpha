// updateWeekliesGraph() is called by the following vicara.js functions:

//  grepHandler()
//  pomsheetLoadHandler()

// Needs at least as much work as Arbolade did before the first rewrite.

function updateWeekliesGraph(lines) {
  var parsleyData = [];
  var i = 0;
  var month = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  // for (i = 0; i < 52; i++) {
    // parsleyData.push(Math.random()*100);
  // }
  parsleyData = buildParsleyData(lines); // !!! HOLY CRAP Parsley's BACK!"
  // p(parsleyData);
  $("#graphic div").remove();
  drawWeekliesGraph(parsleyData.weeklies);
  //NOTE: drawPPD needs to be before drawHorizontalOverlays,
  //because it currently initializes the PPD adjustmentFactor for percent draw
  //Might want to fix this!
  drawPPD(parsleyData.weeklies);
  drawHorizontalOverlays(parsleyData.horizontals);

  //NOTE: this should DEFINITELY not be drawing every update!
  drawMonthsOverlay();
  drawMonthlyTargets(parsleyData);

  function drawPPD(weeklies_array) {
    p("=== drawPPD() ===");
    var i, week,
      max = Math.max.apply(Math,weeklies_array);
      

    var maxPPD_raw = max/7;
    p(maxPPD_raw);
    var maxPPD_rounded = Math.floor(maxPPD_raw);
    var adjustmentFactor = maxPPD_rounded/maxPPD_raw;
    parsleyData.adjustmentFactor = adjustmentFactor;
    parsleyData.maxPPD = maxPPD_rounded;
    var gapHeight = 100/maxPPD_rounded*adjustmentFactor;


    for (i = 0; i <= maxPPD_rounded; i++) {
      $("#graphic").append("<div class = ppd-line id = ppd-"+i+">"+i+"</div>");
      $("#ppd-"+i).css({ bottom: (i*gapHeight) + "%" })
    }
    $(".ppd-line").css({
      borderStyle: "none",
      borderBottomStyle: "solid",
      borderBottomWidth: "1px",
      borderBottomColor: "orange",
      position: "absolute", 
      backgroundColor: "Transparent",
      textAlign: "right",
      height: "auto",
      width: "10px",
      right: "0px",
      opacity: 0.4
    });
  }

  function drawMonthlyTargets(parsleyData) { 
    var i, max,
        width = 100/12;
    p("==drawMonthlyTargets()==");
    targets = parsleyData.targets;
    max = Math.max.apply(Math,parsleyData.weeklies)/7;
    p("+!!!" + max);
    // var max = Math.max.apply(Math,data);
    for (i = 0; i < targets.length; i++) {
      $("#graphic").append("<div id='monthly-target-"+i+"'></div>");
      $("#monthly-target-"+i).css({
        position: "absolute",
        width: width + "%",
        left: width*i + "%",
        height: targets[i]/max*100 + "%",
        background: "green",
        zIndex: "11",
        opacity: 0.2
      });
    }
  }

  function drawWeekliesGraph(data) {
    // p(data.length);
    var max = Math.max.apply(Math,data);

    //PLEASE FIX THIS OR STANDARDIZE:
    //99.7 originally for 52-week correction, but evens out border so left it
    var width = 99.7/52;
    d3.select("#graphic")
      .selectAll("div")
        .data(data)      
      .enter().append("div")
      .style("width", function(d) { 
        return width + "%";
      })
      .style("height", function(d) { 
        return d/max*100 + "%";
      })
      .style("left", function(d,i) {
        return width*i + "%";
      });
      $("#graphic").append("<div id=max>"+max+"</div>")
      $("#graphic > #max").css({position: "absolute", backgroundColor: "Transparent",borderStyle:"none",zIndex: 10});
  }

  function drawHorizontalOverlays() {
    p("=== drawHorizontalOverlays ===");
    // p(parsleyData);
    drawTotals();
    // drawLine("#whatever","100 hours","rgb(200,100,200)",{x: 10, y: 60, w: 40});


    function drawTotals() {
      var i, weekNum, lastWeekNum,
          hours,firstWeek,dayNum,daysElapsed,
          hoursElapsed,ppd,ppdPercent,weeksFromLast;

      p(parsleyData.maxPPD + " ",true); p(parsleyData.adjustmentFactor);

      for (i = 1; i < parsleyData.milestones.weekNums.length; i++) { 

        hours = parsleyData.milestones.hours[i];
        lastHours = parsleyData.milestones.hours[i-1];

        lastDayNum = parsleyData.milestones.dayNums[i-1]
        dayNum = parsleyData.milestones.dayNums[i];
        
        daysElapsed = dayNum-lastDayNum;
        hoursElapsed = hours-lastHours;

        //Hmm.. ppd is screwy, but +1 a day fixes edge cases
        ppd = Math.floor((hoursElapsed*2)/(daysElapsed+1));

        hpd = hoursElapsed/(daysElapsed+1);

        ppdPercent = (ppd/parsleyData.maxPPD*parsleyData.adjustmentFactor*100);


        hpd = Math.floor(hpd) + "h" + padTime(Math.floor((hpd-Math.floor(hpd))*60) + "m/day");

        // p("From Day " + lastDayNum + " to " + dayNum + "; " + hours + " hours, " + (daysElapsed) + " days, " + ppd + "ppd, " + hpd);

        lastPercent = percentFromDay(lastDayNum);
        percent = percentFromDay(dayNum);
        percentWidth = percent-lastPercent;
        weeksFromLast = Math.ceil(daysElapsed/7);

        $("#graphic").append("<div id='total"+hours+"'></div>")
        $("#total"+hours).css({
          position: "absolute",
          height: ppdPercent + "%",
          left: percent + "%",
          borderStyle: "none",
          width: "1px",
          backgroundColor: "red"
        });

        drawLine("#ronk"+hours,daysElapsed + "d","red", 
                { x: lastPercent,
                  y: 100-ppdPercent, 
                  w: percentWidth  });
      }


    }

    function percentFromWeek(weekNum) { 
      return weekNum/52*100;
    }

    function percentFromDay(dayNum) { 
      return dayNum/365*100;
    }

    function drawLine(selector,label,color,coords) { 
      $("#graphic").append("<div id="+selector.substring(1)+">"+label+"</div");
      $("#graphic >" + selector).css({
        position: "absolute",
        left: coords.x + "%",
        bottom: 100-coords.y + "%",
        height: "auto",
        backgroundColor: "Transparent",
        borderStyle: "none",
        borderColor: color,
        borderBottomStyle: "solid",
        color: color,
        width: coords.w + "%",
        zIndex: 2,
        whiteSpace: "nowrap",
        textAlign: "right"
      });
    }

  }


  function drawMonthsOverlay() {
    // alert("This shouldn't be obtrusive!");
    // assumes the graph is cleared, which it shouldn't need to be; kludgy
    var i; 
    var daysThroughYear = 0;
    var last_precise_offset = 0;

    drawMonthLinesAndLabels(); 

    // drawCurrentWeekPosition();
    drawCurrentDayPosition();

    function drawMonthLinesAndLabels() {
      var monthLineColor;
      for (i = 1; i <= 12; i++) {
        monthLineColor = ((i%4 == 0) ? "orange" : "rgb(100,100,200)");
        daysThroughYear += daysInMonth(i);
        simple_offset = 100/12*i;
        precise_offset = daysThroughYear/365*100;
        $("#graphic").append("<div class = 'month-line' id = 'month-"+i+"'></div>");
        $("#month-"+i).css({
          left: (precise_offset) + "%",
          backgroundColor: monthLineColor
        });
        $("#graphic").append("<div class = 'month-label' id = 'label-"+i+"'>"+month[i-1]+"</div>");
        $("#label-"+i).css({
          left: (last_precise_offset) + "% ",
          borderStyle: "none"
        });
        last_precise_offset = precise_offset;
      }
    }
    function drawCurrentWeekPosition() {
      var yearWeekPosition = (weekNum(new Date)-1)/52*100;
      $("#graphic").append("<div id = year-week-position></div>");
      $("#year-week-position").css({ 
        left: yearWeekPosition + "%",
        width: 100/52+"%"
      });
    }
    function drawCurrentDayPosition() {
      var yearDayPosition = dayNum(new Date)/365*100; 
      // p(yearPosition);
      $("#graphic").append("<div id = year-day-position></div>");
      $("#year-day-position").css({
        left: yearDayPosition + "%"
      });
    }
  }
}
//END Grepped Weeklies

