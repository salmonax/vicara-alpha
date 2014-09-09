require 'sinatra'
require 'redcarpet'
require 'dropbox_sdk'

if development?
  require 'sinatra/reloader'
  require 'dotenv'
  Dotenv.load
end

configure do
  enable :sessions
end 

set :session_secret, ENV['SESSION_SECRET']

def authed?
  redirect '/dropbox/auth' if session[:dropbox_token] == nil
end

def get_web_auth
  DropboxOAuth2Flow.new(ENV['APP_KEY'], ENV['APP_SECRET'], "http://#{request.host_with_port}/dropbox/callback", session, :dropbox_auth_csrf_token)
end

def get_dropbox_client
  DropboxClient.new(session[:dropbox_token])
end

# "#{@env['rack.url_scheme']}://#{request.host_with_port}/login"

get "/" do 
  # authed?
  # redirect '/stuff'
  haml :android
  # request.host
end

get "/sandbox" do
  haml :sandbox
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
    redirect to('/stuff')
  end
end

get "/stuff" do
  content_type 'text/plain'
  if request.host != "192.168.43.72"
    authed?
    client = get_dropbox_client
    @file = client.get_file("2014 Pomodoro.txt")
  else
    # grab file directory if testing locally via phonegap
    @file = File.read("/home/salmonax/Dropbox/Apps/Vicara/2014 Pomodoro.txt")
  end
  @file
end

get '/logout' do
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
    %link{rel:"stylesheet", href:"/stylesheets/vicara.css"}
  %body
    =yield
  %script{src:"/javascripts/vicara.js"}

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
#sandbox.gradient
  #bottom-half