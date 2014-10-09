require './lib/modules/hash_magic'

require './lib/pom_parser'
require './lib/task'
require './lib/meter'
require 'json'
require 'date'

require 'pp'

# pom_sheet_path = "/home/salmonax/Dropbox/2014 Pomodoro.txt"

# poms_input = File.open(pom_sheet_path,"r")
# pom_parser = PomParser.new(poms_input)

raw_pomsheet = File.read("/home/salmonax/Dropbox/Apps/Vicara/2014 Pomodoro.txt")

pom_parser = PomParser.new(raw_pomsheet)

pp pom_parser.days
# pp pom_parser

meter = Meter.new(pom_parser)
pp meter.poms_this_month
# pp meter.poms_this_month