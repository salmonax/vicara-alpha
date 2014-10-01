$('#ritmus')
  .css({
    width: "100%",
    height: "100%",
    backgroundColor: "rgb(100,150,150)"
  });

$('#ritmus')
  .append("<div id = 'ritmus-top'>TOTAL</div>")
  .append("<div id = 'ritmus-left'>WORK</div>")
  .append("<div id = 'ritmus-right'>REST</div>");


$('#ritmus-top')
  .css({
    height: '10%',
    backgroundColor: 'rgb(100,100,100)'
  });

$('#ritmus-left')
  .css({
    backgroundColor: "rgb(150,50,50)"
  });

$('#ritmus-right')
  .css({
    backgroundColor: "rgb(50,50,150)"
  });




$('#ritmus-left, #ritmus-right')
  .css({
    height: '90%',
    width: '50%',
    float: "left"
  });
