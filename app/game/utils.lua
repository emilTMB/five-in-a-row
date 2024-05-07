local ____exports = {}
function ____exports.get_random_numbers(count, max_value, repeats)
    local list = {}
    do
        local i = 0
        while i < count do
            list[#list + 1] = math.floor(math.random() * max_value) + 1
            i = i + 1
        end
    end
    do
        local i = 0
        while i < repeats do
            local r = math.floor(math.random() * #list)
            list[#list + 1] = list[r + 1]
            i = i + 1
        end
    end
    return list
end
function ____exports.get_neighbors(x, y, size)
    local neighbors = {}
    do
        local i = x - 1
        while i <= x + 1 do
            do
                local j = y - 1
                while j <= y + 1 do
                    if i >= 0 and i < size and j >= 0 and j < size and not (i == x and j == y) then
                        neighbors[#neighbors + 1] = {x = i, y = j}
                    end
                    j = j + 1
                end
            end
            i = i + 1
        end
    end
    return neighbors
end
return ____exports
