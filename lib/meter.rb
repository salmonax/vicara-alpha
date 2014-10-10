class Meter
  attr_reader :days_passed, :this_month, :stats, :target_this_month
  def initialize(parser)
    @parser = parser
    @days_passed = california_now.day
    @this_month = california_now.strftime("%B")
    @target_this_month = @parser.targets[:months][@this_month]

  end

  def california_now
    Time.now.utc.getlocal("-07:00")
  end

  def poms_left
    @days_passed*@target_this_month-poms_this_month
  end

  def poms_this_month
    sum = 0 #use inject
    @parser.tasks.each do |task|
      if task.date =~ /#{Time.now.month}\/\d{1,2}\/#{Time.now.year}/
        sum += task.poms
      end
    end
    sum
  end

  def stats
    #NOTE: second worst piece of code in program
    #average is a floored integer
    #max and average are both weekly
    #target is monthly
    all_the_days = []
    yesterday_poms = 0
    poms_this_month = 0
    keys = @parser.days.keys
    keys.sort! do |x, y|
      x_array = x.split('/')
      y_array = y.split('/')
      x_array = x_array.unshift(x_array.pop)
      y_array = y_array.unshift(y_array.pop)
      Time.new(*x_array).utc.to_i <=> Time.new(*y_array).utc.to_i
    end
    average_sum = 0
    max_array = []
    monthly_total = 0

    keys.each_with_index do |date, i|
      today = @parser.days[date]
      terms = date.split('/')

      time_array = date.split('/')
      time_array = time_array.unshift(time_array.pop)
      month_name = Time.new(*time_array).strftime("%B")


      target_this_month = @parser.targets[:months][month_name]

      daily_hash = {}
      daily_hash[:date] = date
      daily_hash[:poms] = today[:poms]
      daily_hash[:yesterday] = yesterday_poms
      daily_hash[:target] = target_this_month

      position_in_month = date.split('/')[1].to_i

      position_in_week = (position_in_month-1)%7+1

      average_sum += today[:poms]
      monthly_total += today[:poms]

      max_array << today[:poms]

      if position_in_week == 1
        average_sum = today[:poms]
        max_array = [today[:poms]]
      end
      if position_in_month == 1
        monthly_total = today[:poms]
      end
      
      daily_hash[:average] = (average_sum/position_in_week)
      daily_hash[:record] = max_array.max
      # daily_hash[:monthly_total] = monthly_total
      # daily_hash[:target_total] = position_in_month*target_this_month
      daily_hash[:vicara] = position_in_month*target_this_month-monthly_total
      # pp date + " " + average_sum.to_s + "/" + position_in_week.to_s + " " + today[:poms].to_s
      # pp "#{date} y: #{daily_hash[:yesterday]} avg: #{daily_hash[:average]} max: #{daily_hash[:record]} target: #{daily_hash[:target]}"

      # pp "#{date} #{monthly_total}"

      all_the_days.push(daily_hash)
      yesterday_poms = today[:poms]
    end
    # pp @days_passed
    # pp @target_this_month
    # pp poms_this_month()
    # nil
    all_the_days
  end
end