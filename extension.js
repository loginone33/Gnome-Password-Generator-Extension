import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
import Clutter from 'gi://Clutter';
import St from 'gi://St';
import Gio from 'gi://Gio';
import GObject from 'gi://GObject';
import GLib from 'gi://GLib';

const CHAR_SETS = {
    lower: 'abcdefghijklmnopqrstuvwxyz',
    upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    digits: '0123456789',
    symbols: '!@#$%^&*()-_=+[]{}|;:,.<>?',
};

function getRandomInt(max) {
    return GLib.random_int_range(0, max);
}

function generatePassword(settings) {
    let lower = CHAR_SETS.lower;
    let upper = CHAR_SETS.upper;
    let digits = CHAR_SETS.digits;
    let symbols = CHAR_SETS.symbols;

    if (settings.get_boolean('exclude-ambiguous')) {
        lower = lower.replace(/[lio]/g, '');
        upper = upper.replace(/[ILO]/g, '');
        digits = digits.replace(/[01]/g, '');
        symbols = symbols.replace(/[|]/g, '');
    }

    const sets = [];
    if (settings.get_boolean('use-lower') && lower.length > 0) sets.push(lower);
    if (settings.get_boolean('use-upper') && upper.length > 0) sets.push(upper);
    if (settings.get_boolean('use-digits') && digits.length > 0) sets.push(digits);
    if (settings.get_boolean('use-symbols') && symbols.length > 0) sets.push(symbols);

    if (sets.length === 0)
        return null;

    const length = Math.max(4, Math.min(32, settings.get_int('length')));
    const allChars = sets.join('');
    const password = [];

    for (const set of sets) {
        if (password.length < length)
            password.push(set[getRandomInt(set.length)]);
    }

    while (password.length < length)
        password.push(allChars[getRandomInt(allChars.length)]);

    for (let i = password.length - 1; i > 0; i--) {
        const j = getRandomInt(i + 1);
        [password[i], password[j]] = [password[j], password[i]];
    }

    return password.join('');
}

const PasswordGeneratorButton = GObject.registerClass(
class PasswordGeneratorButton extends PanelMenu.Button {
    _init(path, settings) {
        super._init(0.0, 'Password Generator');

        this._settings = settings;

        const iconFile = Gio.File.new_for_path(`${path}/password-generator-symbolic.svg`);
        this._gicon = new Gio.FileIcon({ file: iconFile });

        this._icon = new St.Icon({
            gicon: this._gicon,
            style_class: 'system-status-icon',
        });
        this.add_child(this._icon);

        this._setupGestures();
        this._buildMenu();
    }

    _setupGestures() {
        this._clickGesture.set_enabled(false);

        const leftClick = new Clutter.ClickGesture({
            required_button: Clutter.BUTTON_PRIMARY,
            recognize_on_press: true,
        });
        leftClick.connect('recognize', () => {
            this._generateAndCopy();
        });
        this.add_action(leftClick);

        const rightClick = new Clutter.ClickGesture({
            required_button: Clutter.BUTTON_SECONDARY,
            recognize_on_press: true,
        });
        rightClick.connect('recognize', () => {
            this.menu.toggle();
        });
        this.add_action(rightClick);
    }

    _buildMenu() {
        const header = new PopupMenu.PopupMenuItem('Password Generator', {
            reactive: false,
            can_focus: false,
        });
        header.label.style = 'font-weight: bold; font-size: 1.05em;';
        this.menu.addMenuItem(header);

        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        this._lengthItem = new PopupMenu.PopupBaseMenuItem({
            reactive: false,
            can_focus: false,
        });

        const lenLabel = new St.Label({
            text: 'Length (4 - 32):',
            y_align: Clutter.ActorAlign.CENTER,
            x_expand: true,
        });
        this._lengthItem.add_child(lenLabel);

        const btnDown = new St.Button({
            label: '−',
            style_class: 'button',
            style: 'padding: 2px 10px; font-weight: bold;',
            can_focus: true,
        });
        btnDown.connect('clicked', () => {
            this._setLength(this._settings.get_int('length') - 1);
        });

        this._lengthEntry = new St.Entry({
            text: String(this._settings.get_int('length')),
            style: 'width: 48px; text-align: center; margin: 0 4px; font-weight: bold;',
            can_focus: true,
        });
        this._lengthEntry.clutter_text.connect('activate', () => {
            const val = parseInt(this._lengthEntry.get_text(), 10);
            if (!isNaN(val))
                this._setLength(val);
            else
                this._lengthEntry.set_text(String(this._settings.get_int('length')));
        });

        const btnUp = new St.Button({
            label: '+',
            style_class: 'button',
            style: 'padding: 2px 10px; font-weight: bold;',
            can_focus: true,
        });
        btnUp.connect('clicked', () => {
            this._setLength(this._settings.get_int('length') + 1);
        });

        this._lengthItem.add_child(btnDown);
        this._lengthItem.add_child(this._lengthEntry);
        this._lengthItem.add_child(btnUp);
        this.menu.addMenuItem(this._lengthItem);

        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        this._swLower = new PopupMenu.PopupSwitchMenuItem('Lowercase (a-z)', this._settings.get_boolean('use-lower'));
        this._swLower.connect('toggled', (_item, state) => {
            this._settings.set_boolean('use-lower', state);
        });
        this.menu.addMenuItem(this._swLower);

        this._swUpper = new PopupMenu.PopupSwitchMenuItem('Uppercase (A-Z)', this._settings.get_boolean('use-upper'));
        this._swUpper.connect('toggled', (_item, state) => {
            this._settings.set_boolean('use-upper', state);
        });
        this.menu.addMenuItem(this._swUpper);

        this._swDigits = new PopupMenu.PopupSwitchMenuItem('Digits (0-9)', this._settings.get_boolean('use-digits'));
        this._swDigits.connect('toggled', (_item, state) => {
            this._settings.set_boolean('use-digits', state);
        });
        this.menu.addMenuItem(this._swDigits);

        this._swSymbols = new PopupMenu.PopupSwitchMenuItem('Special characters (!@#$...)', this._settings.get_boolean('use-symbols'));
        this._swSymbols.connect('toggled', (_item, state) => {
            this._settings.set_boolean('use-symbols', state);
        });
        this.menu.addMenuItem(this._swSymbols);

        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        this._swAmbiguous = new PopupMenu.PopupSwitchMenuItem('Exclude ambiguous characters', this._settings.get_boolean('exclude-ambiguous'));
        this._swAmbiguous.connect('toggled', (_item, state) => {
            this._settings.set_boolean('exclude-ambiguous', state);
        });
        this.menu.addMenuItem(this._swAmbiguous);

        const ambDesc = new PopupMenu.PopupMenuItem('e.g. l, I, 1, o, O, 0, | (hard to distinguish)', {
            reactive: false,
            can_focus: false,
        });
        ambDesc.label.style = 'font-size: 0.85em; opacity: 0.65; padding-left: 20px;';
        this.menu.addMenuItem(ambDesc);
    }

    _setLength(val) {
        const clamped = Math.max(4, Math.min(32, val));
        this._settings.set_int('length', clamped);
        this._lengthEntry.set_text(String(clamped));
    }

    _generateAndCopy() {
        const password = generatePassword(this._settings);

        if (!password) {
            Main.osdWindowManager.showAll(this._gicon, 'Select at least one character set!', null, null);
            return;
        }

        const clipboard = St.Clipboard.get_default();
        clipboard.set_text(St.ClipboardType.CLIPBOARD, password);

        const len = this._settings.get_int('length');
        Main.osdWindowManager.showAll(this._gicon, `Password (${len} chars) copied!`, null, null);
    }
});

export default class PasswordGeneratorExtension extends Extension {
    enable() {
        this._settings = this.getSettings();
        this._button = new PasswordGeneratorButton(this.path, this._settings);
        Main.panel.addToStatusArea(this.uuid, this._button);
    }

    disable() {
        this._button?.destroy();
        this._button = null;
        this._settings = null;
    }
}
