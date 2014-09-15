module HashMagic

  def nestle_array(array,nested)
    array.each do |line|
      merge_to_category_hash(line,nested)
    end
    nested
  end

  def merge_to_category_hash(line,nested)
    categories = line.split(/\s?:\s?/)
    to_merge = {}
    #puts "#{line}"
    categories.each_with_index do |category, i|
      target_key = categories[i]
      new_value = categories[i+1] ? categories[i+1] : 0

      deep_merge_add(nested, target_key, new_value)
    end
  end

  def deep_merge_add(nested,target_k,new_v,top=true) #this is used build a nested hash from scratch, using an array
    if target_k == "PomParsley" 
      #puts "#{target_k} => #{new_v} MERGES INTO #{nested}"
    end

    if target_k == "PomParsley" and nested == {"Blender Class"=>0, "Corgi"=>0}
      #puts "YOU FOUND ME! I'm about to do a very bad THING!"
    # only merge if it's at the top level!!!
    end
    new_v = {new_v => 0} if new_v.class == String
    if hash_has_key?(nested,target_k)
      #puts "I have the key!"
      if nested.keys.include?(target_k)
        if nested[target_k].class == Hash
          nested[target_k].merge!(new_v)
        else
          nested[target_k] = new_v
        end
      else
        nested.each do |k,v|
          deep_merge_add(v,target_k,new_v,false) if v.class == Hash
        end
      end
    else

        if top 
          #puts "I don't have the key and IMA MERGE ANYWAY!"
          nested.merge!({target_k => new_v}) 
        end
    end
    # if target_k == "PomParsley" 
    #   puts "!! #{target_k} => #{new_v} NOW IN #{nested}"
    # end
  end

  def hash_has_key?(hash,key)
    if hash.keys.include?(key)
      return true
    else
      hash.each do |k,v|
        return hash_has_key?(v,key) if v.class == Hash
      end
    end
    false
  end

  def nestle_flat_hash(flat,nested)
    flat.each { |k,v| merge_at_key(nested,k,v) }
    return nested
  end

  def merge_at_key(nested,target_k,new_v) #this is for restructuring a flat hash to nested
    if hash_has_key?(nested,target_k)
      if nested.keys.include?(target_k) 
        if nested[target_k].class != Hash 
          nested.merge!({target_k => new_v}) { |k,v1,v2| v1+v2 }
        else #if v is hash, it means the key has children, so add a "Misc" category for top-level category activity

          # NOTE: commented code erroneously subtracts value

          # extant_values = nested[target_k].values.inject(:+)
          # nested[target_k].merge!({"Misc" => new_v-extant_values}) { |k,v1,v2| v1+v2 }
          
          nested[target_k].merge!({"Misc" => new_v}) { |k,v1,v2| v1+v2 }
          
          
        end
      else
        nested.each do |k,v|
          merge_at_key(v,target_k,new_v) if v.class == Hash
        end
      end
    else
      nested.merge!({target_k => new_v})
    end
  end

  def add_to_key(target_hash,target_key,value) #could refactor with *target_hashes
    target_hash.merge!({ target_key => value }) { |k, old_v, new_v| old_v + new_v }
  end
  
end