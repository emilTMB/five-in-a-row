/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import * as druid from 'druid.druid';
import { hide_gui_list, set_text, set_text_colors, show_gui_list } from '../utils/utils';


interface props {
    druid: DruidClass;
}

export function init(this: props): void {
    Manager.init_gui();
    this.druid = druid.new(this);
    this.druid.new_button('btnHome', () => {
        Scene.load('menu');
    });
    this.druid.new_button('snd', () => toggle_snd());


    update_ui();
}

export function on_input(this: props, action_id: string | hash, action: unknown): void {
    return this.druid.on_input(action_id, action);
}

export function update(this: props, dt: number): void {
    this.druid.update(dt);
}

export function on_message(this: props, message_id: string | hash, message: any, sender: string | hash | url): void {
    Manager.on_message_gui(this, message_id, message, sender);
    this.druid.on_message(message_id, message, sender);
}

export function final(this: props): void {
    this.druid.final();
}

function update_ui() {
    const is_snd = Sound.is_active();
    hide_gui_list(['snd_off']);
    if (!is_snd)
        show_gui_list(['snd_off']);
}

function toggle_snd() {
    Sound.set_active(!Sound.is_active());
    update_ui();
}
