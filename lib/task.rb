class Task
  attr_reader :properties, :date, :utc
  def initialize(date,line)
    @date = date
    @properties = extract_properties(line)
    @utc = string_to_utc
    add_instance_variables
  end

  private

  def add_instance_variables
    @properties.each do |k, v|
      instance_variable_set("@#{k}",v) 
      singleton_class.class_eval("attr_accessor :#{k}")
    end
  end

  def string_to_utc
    date = @date.split('/').map { |i| i.to_i }
    time = @properties[:start_time].split(':').map { |i| i.to_i }
    time[0] = [(time[1] == 30 ? 23 : 24),time[0]].min   # temporary kludge for hour values over 24
    @utc = Time.new(date[2],date[0],date[1],time[0],time[1])
  end

  def extract_properties(line)
    time_num = line.split(" ")[0]
    time_num_float = time_num.to_f
    start_time = make_time_string(time_num_float)
    task = line.split(" ")[1..-1]

    if is_tag?(task[0])
      tags = task[0]
      task = task[1..-1]
    else
      tags = 'None'
    end
    poms = task.pop.gsub(%r{\(|\)|\[|\]},'').length
    pom_time = poms/2.0
    end_time = make_time_string(time_num_float+pom_time)
    task = task.join(' ').split(': ')
    category = task.length == 1 ? "None" : task[0]
    task = task.length == 1 ? task[0] : task[1]
    task = task.gsub('"','') if task
    task_hash = { date: date, 
                  start_time: start_time, 
                  end_time: end_time, 
                  entry_time: time_num,
                  tags: parse_tags(tags), 
                  category: category,
                  task: task, 
                  poms: poms,
                  output: outputness(tags)*poms
                }

  end

  def is_tag?(string)
    (string.include?('&') || string.include?('$') || string.upcase == string) && string != 'PDR' && string.include?(':') == false #REALLY shitty TAG check
  end

  def parse_tags(tags)
    return *tags if tags == 'None'
    tags.scan(/./).uniq.map { |tag| tag*tags.count(tag)}
  end

  def outputness(tags)
    (tags.length > tags.split('').uniq.length) ? 1 : 0
  end

  def make_time_string(time_num_float)
    time_num = time_num_float.to_s.split(".")
    if time_num[1] == "5"
      time_num[1] = "30"
    else
      time_num[1] = "00"
    end

    "#{time_num[0]}:#{time_num[1]}"
  end
end