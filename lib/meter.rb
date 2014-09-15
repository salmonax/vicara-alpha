class Meter
  attr_reader :days_passed, :this_month
  def initialize(parser)
    @parser = parser
    @days_passed = Time.now.day
    @this_month = Time.now.strftime("%B")
    @target_this_month = @parser.targets[:months][@this_month]

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
end