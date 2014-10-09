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
    # if current_date != ""
    #   stats_today = {}
    #   stats_today[:date] = current_date
    #   stats_today[:poms] = @days[current_date][:poms]
      
    #   this_month = Time.now.strftime("%B")
    #   stats_today[:target] = @targets[:months][this_month]

    #   @stats.push stats_today
    # end
  end
end