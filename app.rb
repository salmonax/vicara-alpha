require 'sinatra'
require 'sinatra/cookies'
require 'sinatra/async'
require 'redcarpet'
require 'dropbox_sdk'

require 'date'
require 'json'
require './lib/meter.rb'
require './lib/modules/hash_magic.rb'
require './lib/task.rb'
require './lib/pom_parser.rb'
require './lib/tree_map.rb'

if development?
  require 'sinatra/reloader'
  require 'dotenv'
  Dotenv.load
end

configure do
  enable :sessions
end 

set :session_secret, ENV['SESSION_SECRET']

register Sinatra::Async

def authed?
  session[:dropbox_token] = cookies[:dropbox_token] if cookies[:dropbox_token]
  redirect '/dropbox/auth' if session[:dropbox_token] == nil
end

def get_web_auth
  host_type = (request.host == 'localhost') ? 'http' : 'https'
  DropboxOAuth2Flow.new(ENV['APP_KEY'], ENV['APP_SECRET'], "#{host_type}://#{request.host_with_port}/dropbox/callback", session, :dropbox_auth_csrf_token)
end

def pomsheet
  if request.host != "192.168.43.72" and request.host != "localhost" and request.host != "192.168.42.250"
    authed?
    client = get_dropbox_client
    @file = client.get_file("2014 Pomodoro.txt")
  else
    # grab file directory if testing locally via phonegap
    @file = File.read("/home/salmonax/Dropbox/Apps/Vicara/2014 Pomodoro.txt")
  end
  @file
end

def get_dropbox_client
  DropboxClient.new(session[:dropbox_token])
end

# "#{@env['rack.url_scheme']}://#{request.host_with_port}/login"

get "/" do 
  # authed?
  # redirect '/stuff'
  # pomsheet
  authed? if request.host != "192.168.42.250"
  haml :android
  # request.host
end

get "/sandbox" do
  haml :sandbox
end

get "/input" do
  haml :input
end

get '/dropbox/auth' do
  authorize_url = get_web_auth.start()
  redirect authorize_url
end

get '/dropbox/callback' do
  if params['error'] || !params['state']
    redirect '/dropbox/auth'
  else
    access_token, user_id, url_state = get_web_auth.finish(params)
    session[:dropbox_token] = access_token
    cookies[:dropbox_token] = access_token
    redirect to('/')
  end
end

get '/dropbox/webhook/?' do
  puts params
  params['challenge']
end

connections = []

get '/consume', provides: 'text/event-stream' do
  stream(:keep_open) do |out|
    # store connection for later on
    connections << out
    # remove connection when closed properly
    out.callback { connections.delete(out) }
    # remove connection when closed due to an error
    out.errback do
      logger.warn 'we just lost a connection!'
      connections.delete(out)
    end
  end
end

get '/broadcast/:message' do
  connections.each do |out| 
    out << "data: #{params[:message]}\n\n"
    # out.close
  end
  "Sent #{params[:message]} to all clients."
end


post '/dropbox/webhook/?' do
  changes = request.body.read
  if session[:dropbox_token]
    puts "Signed in!"
    client = DropboxClient.new(session[:dropbox_token])
    puts client.account_info().inspect
  else
    puts "No token; not logged in!"
    puts session.inspect
  end
  connections.each do |out| 
      out << "data: #{changes}\n\n"
  end
  nil
end

aget '/eventmachine' do
    # EM.add_timer(10) { body { "delayed for 4 seconds" } }
    big_job = proc { sleep 5 }
    result = proc { body { 'Hello!' } }
    EM.defer big_job, result
end


get '/treemap' do
  haml :treemap
end

get '/cookies' do
  cookies
end

get '/data/books' do
  content_type :json
  pom_parser = PomParser.new(pomsheet, last: 40)
  books_hash = pom_parser.full[:books]
  Treemap.new(books_hash).full.to_json
end

get "/poms_left" do
  # client = get_dropbox_client
  # raw_pomsheet = client.get_file("2014 Pomodoro.txt")
  raw_pomsheet = pomsheet
  pom_parser = PomParser.new(raw_pomsheet)
  meter = Meter.new(pom_parser)
  "#{meter.poms_left}"
end

get "/today" do
  content_type :json
  pom_parser = PomParser.new(pomsheet)
  pom_parser.today.to_json
end

get "/stuff" do
  content_type 'text/plain'
  # if request.host != "192.168.43.72"
  #   authed?
  #   client = get_dropbox_client
  #   @file = client.get_file("2014 Pomodoro.txt")
  # else
  #   # grab file directory if testing locally via phonegap
  #   @file = File.read("/home/salmonax/Dropbox/Apps/Vicara/2014 Pomodoro.txt")
  # end
  @file = pomsheet
end

get '/weeklies' do
  haml :weeklies
end

get '/logout' do
  response.delete_cookie('dropbox_token')
  session["dropbox_session"] = nil
  session["dropbox_token"] = nil
  session["dropbox_auth_csrf_token"] = nil
  redirect '/'
end

get '/session' do
  session
end

get '/session_fail' do
  "Session not logged in!"
end

__END__

@@ layout
!!!5
%html
  %head
    %script{src:"/javascripts/jquery-2.1.0.min.js"}
    %script{src:"/javascripts/d3.v3.min.js"}
    %script{src:"/javascripts/Draggable.min.js"}
    %script{src:"/javascripts/TweenMax.min.js"}
    %link{rel:"stylesheet", href:"/stylesheets/jquery-ui.min.css"}    
    %link{rel:"stylesheet", href:"/stylesheets/vicara.css"}
  %body
    =yield
  %script{src:"/javascripts/vicara.js"}
  %script{src:"/javascripts/arbolade.js"}
  %script{src:"/javascripts/ritmus.js"}
@@ root
:markdown
  Welcome to Sinatra Minimal, a simple starter kit!
  ==
  Features:
  --
  - redcarpet for inline markdown
  - thin for webserver
  - sessions enabled, dotenv for .env loading
  - rack/guard-livereload for extensionless reloading
  - pushable to Heroku out of the box

@@ sandbox
#sandbox.gradient.draggable
  /#logo.square.draggable HELLO
  /#logo2.square HELLO
  /#whatever HELLO

@@ weeklies
#android.gradient
  #weeklies.container

@@ ritmus
#android.gradient
  #ritmus
