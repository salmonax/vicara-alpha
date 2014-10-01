# require './modules/hash_magic'
# require './task'
# require 'pp'
# require 'date'

class PomParser
  attr_reader :tasks, :days, :full, :total, :jots, :tag_labels, :targets, :today

  # def initialize(f,range={})
  def initialize(raw_pomsheet,range={})
    @raw_pomsheet = raw_pomsheet
    # @file = f
    @tasks = []
    @date_today = Date.today.strftime('%-m/%-d/%Y')
    # @date_today = "9/21/2014"
    @details_today = []
    @range = range
    @days = {}
    @full = { tags: {}, categories: {}, books: {}, sum: 0 }
    @total = 0 
    @jots = {}
    @tag_labels = {}
    @mid_intervals = %w|January February March April May June July August September October November December|
    @big_intervals = %w| Beginning Middle End |
    @targets = init_targets_hash
    @abbreviations = {}
    @category_schema = {}
    build_tasks
  end

  include HashMagic

  def full(range=@range)
    range[:start] = DateTime.new if !range[:start]
    range[:end] = DateTime.now if !range[:end]

    build_tasks(range)
    @full
  end

  def build_tasks(range=@range)
    # line_array = []
    # @file.each { |line| line_array << line.gsub(%r{\r|\n},'')  }
    # line_array = line_array-["\r\n"]

    line_array = @raw_pomsheet.gsub("\r\n","\n").split("\n")

    # pp line_array


    current_date = ""

    current_strptime = nil #Oh brother...

    line_array.each_with_index do |line, i|
      break if !range[:last].nil? and  @total >= range[:last]
      next if comment?(line) #want this to be first, really no-nonsense
      next if skippable?(line)
      break if breakable?(line)
      if is_date?(line) #set date on each date line
        # pp line
        current_date = line
        current_strptime = DateTime.strptime(current_date,'%m/%d/%Y')
        
        # if !(current_strptime < range[:start])
        #   pp current_date
        # end
        
        @days.merge!({ current_date => { output: 0, poms: 0, tags: {}, categories: {} } })
      elsif jottable?(line)  
        jot_down(line)
      elsif category_nester?(line)
        merge_to_category_hash(line,@category_schema)
      elsif tag_label?(line)
        define_tag_label(line)
      elsif monthly_target?(line)
        define_monthly_target(line)
      elsif task?(line)
        task = Task.new(current_date,line)
        @tasks << task
        sum_categories_and_tags(task)
        book = extract_book(task)
        @full[:books].merge!(book) { |k,v1,v2| v1+v2 } if book
        # if book  
        #   pp "   #{book.keys.first} on line #{i}"
        # end

        # @full[:books].merge!(book) { |k,v1,v2| v1+v2 } if book

        add_details_today(current_date,task)
      end
    end
    merge_books_acronyms!
    #fuzzy match would go here
    # p @category_schema
    # @full[:nested] = nestle_flat_hash(@full[:categories],@category_schema)
    ## Uh, divide_in_three suddenly broke for some reason..
    # @full[:categories] = divide_in_three(@full[:categories])
    # @full[:books] = divide_in_three(@full[:books])
  end

  def add_details_today(current_date,task)
    if current_date == @date_today
      @time_and_poms = { "time" => task.entry_time.to_f,
                         "poms" => task.poms.to_f }
      @details_today << @time_and_poms
    end
  end

  def divide_in_three(hash)
    sorted_array = hash.sort_by { |key, value| value}.reverse
    total = hash.values.inject(:+)
    top_level_names = ["Primary","Secondary","Tertiary"]
    new_hash = {}
    tally = 0
    triad = sorted_array.size/3
    sorted_array.each_with_index do |item, i| 
      new_hash[top_level_names[[i-1,0].max/triad]] ||= {}
      new_hash[top_level_names[[i-1,0].max/triad]].merge!({item[0] => item[1]})
    end
    new_hash
  end

  def comment?(line)
    line =~ /^#.*/
  end

  def category_nester?(line)
    line =~ /^[a-zA-Z\s].*:/ and line.split(' ')[-1] != '()' # kludgy check for undone tasks, which can take a () and linger.
  end

  def merge_books_acronyms!
    books_hash = @full[:books]
    new_hash = books_hash.clone
    books_hash.each do |key, value|
      title, acronym = key.split(/\s?[\(\)]/)
      if acronym 
        new_hash[title] = new_hash[acronym]+value
        new_hash.delete(key)
        new_hash.delete(acronym)
      end
    end
    @full[:books] = new_hash
  end

  def task?(line)
    first = line.split(' ').first
    #returns nil if regex fails, false if number is too big.
    #still fails when random number on own line
    first =~ /^\d{1,2}($|.5)/ && first.to_f <= 30
  end

  def monthly_target?(line)
    (@big_intervals+@mid_intervals).include? line.split(' ').first
  end
  def skippable?(line)
    #skip empty, dashed lines, and break indicators
    line.split(" ")[0].nil? or
    line =~ %r{^--} or  
    line.split(" ")[0].upcase == "BREAK"
    #in future: break lines will take the previous end-time as start time and end 30 minutes later
  end
  def tag_label?(line)
    command = line.split(" ")[0]
    command.size == 1 and command !~ /[0-9]/
  end

  def jottable?(line) #quick and dirty check. Parantheses will be optional, like Ruby
    line.split(" ")[1][0] == "(" and line.split(" ")[-1][-1] == ")"
  end

  def breakable?(line)
    #break on //--
    line[0..3] == "//--"
  end

  def is_date?(line)
    line =~ %r|.{1,2}/.{1,2}/.{2,4}|
  end


  def define_monthly_target(line)
    time_period = line.split(' ').first
    target = line.split(' ').last.to_i

    if @big_intervals.include?(time_period)
      @targets[:arcs][time_period] = target
      define_monthlies_from_arc(time_period)
    elsif @mid_intervals.include?(time_period)
      @targets[:months][time_period] = target
    end
  end

  def define_monthlies_from_arc(arc)
    i = @big_intervals.index(arc)
    @mid_intervals[0+i*4..3+i*4].each do |month|
      @targets[:months][month] = @targets[:arcs][arc]
    end
  end

  def init_targets_hash 
    targets = { arcs: {}, months: {} }
    @big_intervals.each do |big_interval|
      targets[:arcs][big_interval] = 0
    end
    @mid_intervals.each do |mid_interval|
      targets[:months][mid_interval] = 0
    end
    targets
  end

  def sum_categories_and_tags(task)
    #start building the hash of daily values
    current_date = task.properties[:date]
    task_poms = task.properties[:poms]
    tag_totals_hash = @days[current_date][:tags]
    category_totals_hash = @days[current_date][:categories]
    @days[current_date][:poms] += task_poms #tally all task poms

    task.properties[:tags].each do |tag|
      # Replace commented to eliminate labels
      tag_branch_label = get_label(tag[0])
      tag_leaf_label = get_modality(tag)
      # tag_branch_label = tag[0]
      # tag_leaf_label = tag

      add_to_key(tag_totals_hash,tag,task_poms)

      @full[:tags][tag_branch_label] = {} if @full[:tags][tag_branch_label].nil? #for nesting
      add_to_key(@full[:tags][tag_branch_label],tag_leaf_label,task_poms)
    end

    @days[current_date][:output] += task.properties[:output]

    # add_to_key(category_totals_hash,task.properties[:category],task_poms) #-> maybe add support for multiple, later
    # add_to_key(@full[:categories],task.properties[:category],task_poms)

    nest_by_comma(task.properties[:category],task_poms,category_totals_hash)

    @total += task_poms
  end

  def today
    #WARNING: date identifier is still just a string!
    @details_today
  end

  def grab_book_title(name)
    prepositions = %w{in and at on by}
    book_title = []
    name.split(',').last.split(' ').reverse.each do |word|
      if word.capitalize == word or word.upcase == word or prepositions.include?(word)
        book_title << word
      else
        # p name if name == "Anti-Oedipus"
        break
      end
    end

    if prepositions.include?(book_title.last) or book_title.last =~ /[rR]ead/
      book_title.pop
    end
    book_title.reverse.join(' ')
  end

  def nest_by_comma(category_raw,poms,category_totals_hash)
    #WARNING: this will fail with nesting of more than one level!
    #WARNING: this is probably the worse single piece of code in the whole fucking program
    categories = category_raw.split(/,\s?/)
    if categories.length > 1
      deepest_totals_hash = category_totals_hash
      deepest_full_hash = @full[:categories]

      extant_category_totals_hash = category_totals_hash[categories.first]
      # Catches a nested hash
      if extant_category_totals_hash.class == Fixnum
        category_totals_hash[categories.first] = { "Misc" => extant_category_totals_hash }
        # add_to_key(category_totals_hash,"Misc",poms)
      end
      if @full[:categories][categories.first].class == Fixnum
        @full[:categories][categories.first] = { "Misc" => @full[:categories][categories.first]}
      end

      categories.each_with_index do |category, i| 
        # pp i.to_s + " " + categories.length.to_s + " " + category
        if i < categories.length-1
          deepest_totals_hash[category] ||= Hash.new { |h,k| h[k] = {} }
          deepest_full_hash[category] ||= Hash.new { |h,k| h[k] = {} }
        else
          # deepest_totals_hash[category]
          add_to_key(deepest_totals_hash,category,poms)
          add_to_key(deepest_full_hash,category,poms)
          # add_to_key()
        end
        deepest_totals_hash = deepest_totals_hash[category]
        deepest_full_hash = deepest_full_hash[category]
        # end
      end

    else
      category = category_raw
      #for daily totals
      if category_totals_hash[category].class != Hash
        add_to_key(category_totals_hash,category,poms)
        # add_to_key(@full[:categories],category,poms)
      else 
        add_to_key(category_totals_hash[category],"Misc",poms)
      end
      # for full totals
      if @full[:categories][category].class != Hash
        add_to_key(@full[:categories],category,poms)
      else
        add_to_key(@full[:categories][category],"Misc",poms)
      end
    end
  end


  def extract_book(task)
    prepositions = %w{with a in and at on by}
    starter = /\b([Ss]tart|[Bb]egin|[Cc]ontinue|[kKeep]) [Rr]eading\b/
    read = /\b[rR]ead(\smore)?\b/
    just_reading_around = /\b[rR]ead\s(about|at|a|over)\b/
    arrow = /->/
    current_date = task.properties[:date]
    task_poms = task.properties[:poms]
    task_name = task.properties[:task]
    task_category = task.properties[:category]
    if task_name =~ arrow #easiest case
      book, progress = task_name.split(/\s*->\s*/)
      # book = grab_book_title(book)
    elsif task_category =~ starter#also easy
      book = task_name
    elsif task_name =~ starter #still pretty easy
      book = task_name.rpartition(starter).last.strip
      book = nil unless book[0].upcase == book[0]
    #now for the hard case...
    elsif task_name =~ read
      unless task_name =~ just_reading_around
        book = task_name.rpartition(read).last.strip
        no_lowers = true
        book.split(' ').each do |word|
          if word[0] =~ /[a-z]/ and !prepositions.include?(word)
            no_lowers = false 
            break
          end
        end
        book = nil unless no_lowers
      end
    end
    #REMEMBER: case to search categories for book titles that already exist!
    hash = { book => task_poms }  if book
  end

  def get_label(tag)
    label = @tag_labels[tag]
    return label.nil? ? tag : label
  end

  def get_modality(tag) #will be settable from pomsheet
    tag.length == 1 ? "Reading" : "Practice"
  end

  def define_tag_label(line)
    target_hash = @tag_labels
    target_key = line.split(' ')[0]
    value = line.split(' ')[1..-1].join(' ')
    add_to_key(target_hash, target_key, value)
  end

  def jot_down(line) #also quick and dirty; breaks with extra parentheses
    target_hash = @jots
    target_key = line.split("(")[0].gsub(%r{\r|\n|\t|\)|\s},'')
    value = [line.split('(')[1].gsub(%r{\r|\n|\t|\)},'')]
    add_to_key(target_hash, target_key, value)
  end
end


# pom_sheet_path = "/home/salmonax/Dropbox/2014 Pomodoro.txt"

# # pom_sheet_path = "../book_problems.txt"
# poms_input = File.open(pom_sheet_path,"r")
# pom_parser = PomParser.new(poms_input)

# # pp pom_parser.full[:books].sort_by{|k,v| v}.reverse
# # pp pom_parser.full({start: DateTime.strptime('7/1/2014','%m/%d/%Y')})
# # pp pom_parser.days

# pp pom_parser.days