require 'sinatra'

get "/" do 
  haml :root
end

get "/start" do
  haml :start, :layout => (request.xhr? ? false : :layout)
end

get "/stop" do
  haml :stop, :layout => (request.xhr? ? false : :layout)
end

__END__

@@ layout
%html
  %head
    %title AJAX Example
    %script{type: "text/javascript", 
            src: "http://code.jquery.com/jquery-2.1.0.min.js"}
  %body
    #message
    =yield

@@ root
:javascript
  $(document).ready(function(){
    $("#start").click(function(){
      $.ajax( {url:"/start", success:function(result) {
          $("#message").html(result);
        }});
      });
    $("#stop").click(function() { 
      $.ajax( {url:"/stop", success:function(result) {
          $("#message").html(result);
        }});
      });
  });
%button#start Start
%button#stop Stop

@@ hmm
#fuck YEAH BABY YEAH

@@ start
It begins.

@@ stop
It has ended.

