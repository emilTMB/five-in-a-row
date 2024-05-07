import * as flow from "ludobits.m.flow";
import { GoManager } from "../modules/GoManager";
import { Messages } from "../modules/modules_const";
import { get_random_numbers, get_neighbors } from "./utils";

interface CellData {
  x: number;
  y: number;
  _hash: hash;
  val: number;
}

export function Game() {
  let game_size = 9;
  const orig_cell_size = 32;
  let cell_size = 32;
  const offset_border = 10;
  const items_offset = vmath.vector3(offset_border, -150, 0);
  const cells: CellData[] = [];
  const gm = GoManager();
  let scale_ratio = 1;
  let stepCounter = 0;

  function init() {
    cell_size = (540 - offset_border * 2) / game_size;
    if (cell_size > 100) cell_size = 100;
    items_offset.x = 540 / 2 - (game_size / 2) * cell_size;
    scale_ratio = cell_size / orig_cell_size;

    let index = 0;
    const numbers = get_random_numbers(game_size * game_size, game_size, 2);
    for (let y = 0; y < game_size; y++) {
      for (let x = 0; x < game_size; x++) {
        make_cell(x, y, numbers[index]);
        index++;
      }
    }
    update_ui();
    wait_event();
  }

  function get_cell_position(x: number, y: number, z = 0) {
    return vmath.vector3(
      items_offset.x + cell_size * x + cell_size * 0.5,
      items_offset.y - cell_size * y - cell_size * 0.5,
      z
    );
  }

  function get_item_by_hash(h: hash) {
    for (let i = 0; i < cells.length; i++) {
      const cell = cells[i];
      if (cell._hash == h) return cell;
    }
    return null;
  }

  let last_clicked_cell: CellData | null = null;

  function on_clicked(h: hash) {
    const item = get_item_by_hash(h);
    if (!item) return log("not hash", h);

    if (last_clicked_cell) {
      const neighbors = get_neighbors(
        last_clicked_cell.x,
        last_clicked_cell.y,
        game_size
      );
      const is_neighbor = neighbors.some(
        (neighbor) => neighbor.x === item.x && neighbor.y === item.y
      );
      if (is_neighbor) {
        swap_cells(last_clicked_cell, item);
        last_clicked_cell = null;
        check_win();
      } else {
        last_clicked_cell = item;
      }
    } else {
      last_clicked_cell = item;
    }
  }

  function make_cell(x: number, y: number, val: number) {
    const cp = get_cell_position(x, y);
    const _go = gm.make_go("cell", cp);
    label.set_text(msg.url(undefined, _go, "label"), val + "");
    const item = { x, y, val, _hash: _go };
    cells.push(item);
    go.set_scale(vmath.vector3(scale_ratio, scale_ratio, 1), _go);
    gm.add_game_item({ _hash: _go, is_clickable: true });
  }

  function get_cell_by_xy(x: number, y: number) {
    for (let i = 0; i < cells.length; i++) {
      const cell = cells[i];
      if (cell.x === x && cell.y === y) return cell;
    }
    return null;
  }

  function moveCell(_hash: hash, toPos: vmath.vector3) {
    gm.move_to_with_time_hash(_hash, toPos, 0.3);
  }

  function swap_cells(cell1: CellData, cell2: CellData) {

    const cell1Pos = get_cell_position(cell1.x, cell1.y);
    const cell2Pos = get_cell_position(cell2.x, cell2.y);

    moveCell(cell1._hash, cell2Pos);
    moveCell(cell2._hash, cell1Pos);

    // Обновляем координаты ячеек
    const tempX = cell1.x;
    const tempY = cell1.y;
    cell1.x = cell2.x;
    cell1.y = cell2.y;
    cell2.x = tempX;
    cell2.y = tempY;

    stepCounter++;
    update_ui();
  }

  function check_win() {
    for (let y = 0; y < game_size; y++) {
      for (let x = 0; x < game_size; x++) {
        const cell = get_cell_by_xy(x, y);
        if (cell && check_line(cell, 1, 0)) return game_end(true);
        if (cell && check_line(cell, 0, 1)) return game_end(true);
      }
    }
  }

  function check_line(cell: CellData, dx: number, dy: number) {
    let count = 1;
    let x = cell.x + dx;
    let y = cell.y + dy;
    while (x >= 0 && x < game_size && y >= 0 && y < game_size) {
      const next_cell = get_cell_by_xy(x, y);
      if (!next_cell || next_cell.val !== cell.val) break;
      count++;
      x += dx;
      y += dy;
    }
    x = cell.x - dx;
    y = cell.y - dy;
    while (x >= 0 && x < game_size && y >= 0 && y < game_size) {
      const next_cell = get_cell_by_xy(x, y);
      if (!next_cell || next_cell.val !== cell.val) break;
      count++;
      x -= dx;
      y -= dy;
    }
    return count >= 5;
  }

  function game_end(is_win: boolean) {
    flow.delay(1);
    Manager.send_raw_ui("game_end", { is_win });
  }

  function update_ui() {
    Manager.send_raw_ui("steps", { cnt_step: stepCounter }); 
  }

  function wait_event() {
    while (true) {
      const [message_id, _message, sender] = flow.until_any_message();
      gm.do_message(message_id, _message, sender);
      if (message_id === ID_MESSAGES.MSG_ON_UP_ITEM) {
        const message = _message as Messages["MSG_ON_UP_ITEM"];
        on_clicked(message.item._hash);
      }
    }
  }

  init();

  return {};
}
