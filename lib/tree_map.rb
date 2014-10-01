class Treemap
  attr_reader :full, :build_nodes, :build_sums
  def initialize(source_hash)
    @source_hash = source_hash 
    @value_sum_hash = {}
    @treemap = {}
  end

  def full
    { "name" => "All",
      "children" => build_nodes(@source_hash) }
  end

  def recursive_sum(hash)
    total = 0
    hash.each do |k,v|
      unless v.class == Hash
        total += v
      else 
        total += recursive_sum(v)
      end
    end
    total
  end

  def build_nodes(hash)
    leaf_array = []
    hash.each do |k,v|
      key_hash = { "name" => k.to_s }
      unless v.class == Hash
        key_hash["name"] = key_hash["name"] + "(#{v/2.0} hours)"
        value_hash =  { "size" => v }
      else
        sum = recursive_sum(v)

        key_hash["name"] = key_hash["name"] + "(#{sum/2.0} hours)"
        value_hash = { "children" => build_nodes(v) }
      end
      leaf_array.push( key_hash.merge!(value_hash) )
    end
    return leaf_array
  end

end