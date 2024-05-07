local ____lualib = require("lualib_bundle")
local __TS__ArraySome = ____lualib.__TS__ArraySome
local ____exports = {}
local flow = require("ludobits.m.flow")
local ____GoManager = require("modules.GoManager")
local GoManager = ____GoManager.GoManager
local ____utils = require("game.utils")
local get_random_numbers = ____utils.get_random_numbers
local get_neighbors = ____utils.get_neighbors
function ____exports.Game()
    local get_cell_position, get_item_by_hash, on_clicked, make_cell, get_cell_by_xy, moveCell, swap_cells, check_win, check_line, game_end, update_ui, wait_event, game_size, cell_size, items_offset, cells, gm, scale_ratio, stepCounter, last_clicked_cell
    function get_cell_position(x, y, z)
        if z == nil then
            z = 0
        end
        return vmath.vector3(items_offset.x + cell_size * x + cell_size * 0.5, items_offset.y - cell_size * y - cell_size * 0.5, z)
    end
    function get_item_by_hash(h)
        do
            local i = 0
            while i < #cells do
                local cell = cells[i + 1]
                if cell._hash == h then
                    return cell
                end
                i = i + 1
            end
        end
        return nil
    end
    function on_clicked(h)
        local item = get_item_by_hash(h)
        if not item then
            return log("not hash", h)
        end
        if last_clicked_cell then
            local neighbors = get_neighbors(last_clicked_cell.x, last_clicked_cell.y, game_size)
            local is_neighbor = __TS__ArraySome(
                neighbors,
                function(____, neighbor) return neighbor.x == item.x and neighbor.y == item.y end
            )
            if is_neighbor then
                swap_cells(last_clicked_cell, item)
                last_clicked_cell = nil
                check_win()
            else
                last_clicked_cell = item
            end
        else
            last_clicked_cell = item
        end
    end
    function make_cell(x, y, val)
        local cp = get_cell_position(x, y)
        local _go = gm.make_go("cell", cp)
        label.set_text(
            msg.url(nil, _go, "label"),
            tostring(val) .. ""
        )
        local item = {x = x, y = y, val = val, _hash = _go}
        cells[#cells + 1] = item
        go.set_scale(
            vmath.vector3(scale_ratio, scale_ratio, 1),
            _go
        )
        gm.add_game_item({_hash = _go, is_clickable = true})
    end
    function get_cell_by_xy(x, y)
        do
            local i = 0
            while i < #cells do
                local cell = cells[i + 1]
                if cell.x == x and cell.y == y then
                    return cell
                end
                i = i + 1
            end
        end
        return nil
    end
    function moveCell(_hash, toPos)
        gm.move_to_with_time_hash(_hash, toPos, 0.3)
    end
    function swap_cells(cell1, cell2)
        local cell1Pos = get_cell_position(cell1.x, cell1.y)
        local cell2Pos = get_cell_position(cell2.x, cell2.y)
        moveCell(cell1._hash, cell2Pos)
        moveCell(cell2._hash, cell1Pos)
        local tempX = cell1.x
        local tempY = cell1.y
        cell1.x = cell2.x
        cell1.y = cell2.y
        cell2.x = tempX
        cell2.y = tempY
        stepCounter = stepCounter + 1
        update_ui()
    end
    function check_win()
        do
            local y = 0
            while y < game_size do
                do
                    local x = 0
                    while x < game_size do
                        local cell = get_cell_by_xy(x, y)
                        if cell and check_line(cell, 1, 0) then
                            return game_end(true)
                        end
                        if cell and check_line(cell, 0, 1) then
                            return game_end(true)
                        end
                        x = x + 1
                    end
                end
                y = y + 1
            end
        end
    end
    function check_line(cell, dx, dy)
        local count = 1
        local x = cell.x + dx
        local y = cell.y + dy
        while x >= 0 and x < game_size and y >= 0 and y < game_size do
            local next_cell = get_cell_by_xy(x, y)
            if not next_cell or next_cell.val ~= cell.val then
                break
            end
            count = count + 1
            x = x + dx
            y = y + dy
        end
        x = cell.x - dx
        y = cell.y - dy
        while x >= 0 and x < game_size and y >= 0 and y < game_size do
            local next_cell = get_cell_by_xy(x, y)
            if not next_cell or next_cell.val ~= cell.val then
                break
            end
            count = count + 1
            x = x - dx
            y = y - dy
        end
        return count >= 5
    end
    function game_end(is_win)
        flow.delay(1)
        Manager.send_raw_ui("game_end", {is_win = is_win})
    end
    function update_ui()
        Manager.send_raw_ui("steps", {cnt_step = stepCounter})
    end
    function wait_event()
        while true do
            local message_id, _message, sender = flow.until_any_message()
            gm.do_message(message_id, _message, sender)
            if message_id == ID_MESSAGES.MSG_ON_UP_ITEM then
                local message = _message
                on_clicked(message.item._hash)
            end
        end
    end
    game_size = 9
    local orig_cell_size = 32
    cell_size = 32
    local offset_border = 10
    items_offset = vmath.vector3(offset_border, -150, 0)
    cells = {}
    gm = GoManager()
    scale_ratio = 1
    stepCounter = 0
    local function init()
        cell_size = (540 - offset_border * 2) / game_size
        if cell_size > 100 then
            cell_size = 100
        end
        items_offset.x = 540 / 2 - game_size / 2 * cell_size
        scale_ratio = cell_size / orig_cell_size
        local index = 0
        local numbers = get_random_numbers(game_size * game_size, game_size, 2)
        do
            local y = 0
            while y < game_size do
                do
                    local x = 0
                    while x < game_size do
                        make_cell(x, y, numbers[index + 1])
                        index = index + 1
                        x = x + 1
                    end
                end
                y = y + 1
            end
        end
        update_ui()
        wait_event()
    end
    last_clicked_cell = nil
    init()
    return {}
end
return ____exports
