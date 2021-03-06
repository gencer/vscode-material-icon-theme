import * as vscode from 'vscode';
import * as helpers from './../helpers';
import * as i18n from './../i18n';
import { getDefaultIconOptions, validateHEXColorCode } from '../icons';

interface FolderColor {
    label: string;
    hex: string;
}

const iconPalette: FolderColor[] = [
    { label: 'Grey (Default)', hex: '#90a4ae' },
    { label: 'Blue', hex: '#42a5f5' },
    { label: 'Green', hex: '#7CB342' },
    { label: 'Teal', hex: '#26A69A' },
    { label: 'Red', hex: '#EF5350' },
    { label: 'Orange', hex: '#FF7043' },
    { label: 'Yellow', hex: '#FDD835' },
    { label: 'Custom Color', hex: 'Custom HEX Code' },
];

/** Command to toggle the folder icons. */
export const changeFolderColor = () => {
    return checkFolderColorStatus()
        .then(showQuickPickItems)
        .then(handleQuickPickActions)
        .catch(err => console.log(err));
};

/** Show QuickPick items to select prefered color for the folder icons. */
const showQuickPickItems = (currentColor: string) => {
    const options = iconPalette.map((color): vscode.QuickPickItem => ({
        description: color.label,
        label: isColorActive(color, currentColor) ? '\u2714' : '\u25FB'
    }));

    return vscode.window.showQuickPick(options, {
        placeHolder: i18n.translate('folders.color'),
        ignoreFocusOut: false,
        matchOnDescription: true
    });
};

/** Handle the actions from the QuickPick. */
const handleQuickPickActions = (value: vscode.QuickPickItem) => {
    if (!value || !value.description) return;
    if (value.description === 'Custom Color') {
        vscode.window.showInputBox({
            placeHolder: i18n.translate('folders.hexCode'),
            ignoreFocusOut: true,
            validateInput: validateColorInput
        }).then(value => setColorConfig(value));
    } else {
        const hexCode = iconPalette.find(c => c.label === value.description).hex;
        setColorConfig(hexCode);
    }
};

const validateColorInput = (colorInput: string) => {
    if (!validateHEXColorCode(colorInput)) {
        return i18n.translate('folders.wrongHexCode');
    }
    return null;
};

/** Check status of the folder color */
export const checkFolderColorStatus = (): Promise<string> => {
    const defaultOptions = getDefaultIconOptions();
    return helpers.getMaterialIconsJSON().then((config) =>
        config.options.folderColor === undefined ?
            defaultOptions.folderColor : config.options.folderColor);
};

const setColorConfig = (value: string) => {
    if (value) {
        helpers.setThemeConfig('folders.color', value.toLowerCase(), true);
    }
};

const isColorActive = (color: FolderColor, currentColor: string): boolean => {
    if (color.label === 'Custom Color') {
        return !iconPalette.some(c => c.hex.toLowerCase() === currentColor.toLowerCase());
    }
    return color.hex.toLowerCase() === currentColor.toLowerCase();
};
