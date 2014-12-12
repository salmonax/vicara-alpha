  //!!!! NOTE: this resembles PomParsley the most.
// This is called in grepGraph.js, by updateWeekliesGraph()

  function buildParsleyData(lines) {  
    var line, week;
    var parsleyData = {};

    //WARNING: this should be a SORT after the data structure is decided
    // it presumes dates are in reverse order!
    // lines = lines.reverse(); 

    parsleyData = buildParsleyTotals();

    return parsleyData;

    function buildLineData() {
      for (i = 0; i < lines.length; i++) {
        line = lines[i];

        //!!!! Building the horizontal stuff
      }
    }

    function buildParsleyTotals() {
      r("=== buildParsleyTotals() ===");
      var currentDate, lineArray, range, target,chunkPosition, monthNum, i, j;

      var weekTotals = [],
          targets = {},
          targetsArray = [],
          yearTotal = 0,
          pomCounter = 0,
          milestone_dates = [],
          milestone_hours = [0,20,40,80,160,360,720];

      milestone_hours = [0,20,40,100,200,300,400,500,600,700,800,900,1000,1100,1200,1300,1400];

      
      for (i = 0; i < 52; i++) { weekTotals.push(0); }

      //WARNING: iterating backwards, but assigning
      // date as though appearing first!
      for (i = lines.length; i > 0; i--) {
        line = lines[i];

        if (isDate(line)) {
          pushMilestoneDate((yearTotal/2),currentDate);
          currentDate = line;
          week = weekNumFromLine(line)-1;
        } else if (isTask(line)) {
          pomCounter = countPoms(line);
          weekTotals[week] += pomCounter;
          yearTotal += pomCounter;
        } else if (isTarget(line)) {
          lineArray = line.split(/\s/);
          range = lineArray[0];
          target = lineArray[1];
          chunkPosition = ["Beginning","Middle","End"].indexOf(range);
          if (chunkPosition >= 0) {
            for (j = 1; j <= 4; j++) {
              monthNum = chunkPosition*4+j;
              range = getMonthName(monthNum);
              // if (!targetsArray[monthNum]) {
              //   targetsArray[monthNum] = target;
              // }
              if (!targets[range]) {
                targets[range] = target;
                // p("b: "+ monthNum,true); p(" " + range);
                targetsArray[monthNum-1] = target;
              }
            }
          } else {
            monthNum = getMonthNum(range);
            targets[range] = target;
            // p("n: "+ monthNum, true); p(" " + range);
            targetsArray[monthNum-1] = target;
          } 
        }
      }
      p(targets);
      p(targetsArray);
      p((yearTotal/2) + " hours");
      // p(milestone_dates);
      // p(milestone_hours);
      return { weeklies: weekTotals,
               milestones: {
                hours: milestone_hours,
                dates: milestone_dates,
                weekNums: datesToWeekNums(),
                dayNums: datesToDayNums()
               },
               targets: targetsArray
             };

      function datesToWeekNums() {
        var weekNums = [];
        var date;

        for (i = 0; i < milestone_dates.length; i++) { 
          date = milestone_dates[i];
          weekNums[i] = weekNumFromLine(date);
        }

        return weekNums;
      }

      function datesToDayNums() { 
        var dayNums = [];
        var date;

        for (i = 0; i < milestone_dates.length; i++) {
          date = milestone_dates[i];
          dayNums[i] = dayNumFromLine(date)
        }

        return dayNums;
      }

      function pushMilestoneDate(count,date) {
        if (!date || !count) { return; }
        
        var i;

        for (i = 0; i < milestone_hours.length; i++ ) { 
          if (count >= milestone_hours[i] && 
             (count < milestone_hours[i+1] || (i+1) == milestone_hours.length) && 
             (milestone_dates.length == i)) {
            milestone_dates[i] = date;
          }
        }
      }
      
    }

    function isTarget(line) { 
      return /^(January|February|March|April|May|June|July|August|September|October|November|December|Beginning|Middle|End)\s\d+$/.test(line);
    }

    function isDate(line) {
      return /[0-9]{1,2}\/[0-9]{1,2}\/[0-9]{1,4}\w*$/.test(line);
    }

    function isTask(line) {
      return /^([0-9]|[01][0-9]|2[0-4])(\.[0,5]|[\s,\t]).*[\s,\t]((?:\[|\()?X(\]|\))?)+$/.test(line);
    }

    function countPoms(line) {
      //This can probably be much shorter.
      return line.match(/((\[|\()?X(\]|\))?)+$/)[0].replace(/(\[|\]|\(|\))/g,"").length
    }
    function weekNumFromLine(line) {
      return weekNum(dateFromString(line));
    }
    function dayNumFromLine(line) { 
      return dayNum(dateFromString(line));
    }
  }