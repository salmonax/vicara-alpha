require 'json'
require 'date'
require 'pp'

require './lib/modules/hash_magic'

require './lib/pom_parser'
require './lib/task'
require './lib/meter'

# pom_sheet_path = "/home/salmonax/Dropbox/2014 Pomodoro.txt"

# poms_input = File.open(pom_sheet_path,"r")
# pom_parser = PomParser.new(poms_input)

raw_pomsheet = File.read("/home/salmonax/Dropbox/Apps/Vicara/2015 Pomodoro.txt")

pom_parser = PomParser.new(raw_pomsheet,last:40)

pp pom_parser
# pp pom_parser

meter = Meter.new(pom_parser)
# pp meter.stats.reverse

# pp pom_parser.methods - Object.methods
# pp meter.poms_left
# pp meter.poms_this_month