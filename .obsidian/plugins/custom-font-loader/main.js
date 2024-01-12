/*
THIS IS A GENERATED/BUNDLED FILE BY ESBUILD
if you want to view the source, please visit the github repository of this plugin
*/

var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// main.ts
var main_exports = {};
__export(main_exports, {
  default: () => FontPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian = require("obsidian");
var DEFAULT_SETTINGS = {
  font: "None",
  processed_font: "",
  force_mode: false,
  custom_css_mode: false,
  custom_css: ""
};
function get_default_css(font_family_name) {
  return `:root {
		--font-default: ${font_family_name};
		--default-font: ${font_family_name};
		--font-family-editor: ${font_family_name};
		--font-monospace-default: ${font_family_name},
		--font-interface-override: ${font_family_name},
		--font-text-override: ${font_family_name},
		--font-monospace-override: ${font_family_name},	
	}
	`;
}
function arrayBufferToBase64(buffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
function applyCss(css, css_id) {
  const style = document.createElement("style");
  style.innerHTML = css;
  document.head.appendChild(style);
  const existingStyle = document.getElementById(css_id);
  if (existingStyle) {
    existingStyle.remove();
  }
  style.id = css_id;
}
var FontPlugin = class extends import_obsidian.Plugin {
  async process_font() {
    await this.loadSettings();
    try {
      if (this.settings.font && this.settings.font.toLowerCase() != "none") {
        console.log("loading %s", this.settings.font);
        const font_family_name = this.settings.font.split(".")[0];
        const font_extension_name = this.settings.font.split(".")[1];
        const config_dir = this.app.vault.configDir;
        const plugin_folder_path = `${config_dir}/plugins/custom-font-loader`;
        const css_font_path = `${plugin_folder_path}/${this.settings.font.toLowerCase().replace(".", "_")}.css`;
        if (this.settings.font != this.settings.processed_font || !await this.app.vault.adapter.exists(css_font_path)) {
          new import_obsidian.Notice("Processing Font files");
          const file = `${config_dir}/fonts/${this.settings.font}`;
          const arrayBuffer = await this.app.vault.adapter.readBinary(file);
          const base64 = arrayBufferToBase64(arrayBuffer);
          const css_type_font = {
            "woff": "font/woff",
            "ttf": "font/truetype",
            "woff2": "font/woff2"
          };
          const base64_css = `@font-face{
	font-family: '${font_family_name}';
	src: url(data:${css_type_font[font_extension_name]};base64,${base64});
}`;
          this.app.vault.adapter.write(css_font_path, base64_css);
          console.log("saved font %s into %s", font_family_name, css_font_path);
          this.settings.processed_font = this.settings.font;
          await this.saveSettings();
          console.log("Font CSS Saved into %s", css_font_path);
          await this.process_font();
        } else {
          const content = await this.app.vault.adapter.read(css_font_path);
          let css_string = "";
          if (this.settings.custom_css_mode) {
            css_string = this.settings.custom_css;
          } else {
            css_string = get_default_css(font_family_name);
          }
          if (this.settings.force_mode)
            css_string = css_string + `
					* {
						font-family: ${font_family_name} !important;
					}
						`;
          applyCss(content, "custom_font_base64");
          applyCss(css_string, "custom_font_general");
        }
      } else {
        applyCss("", "custom_font_base64");
        applyCss("", "custom_font_general");
      }
    } catch (error) {
      new import_obsidian.Notice(error);
    }
  }
  async onload() {
    this.process_font();
    this.addSettingTab(new FontSettingTab(this.app, this));
  }
  async onunload() {
    applyCss("", "custom_font_base64");
    applyCss("", "custom_font_general");
  }
  async loadSettings() {
    this.settings = Object.assign(
      {},
      DEFAULT_SETTINGS,
      await this.loadData()
    );
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
};
var FontSettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  async display() {
    const { containerEl } = this;
    containerEl.empty();
    const infoContainer = containerEl.createDiv();
    infoContainer.setText("In Order to set the font, copy your font into '.obsidian/fonts/' directory.");
    const options = [{ name: "none", value: "None" }];
    try {
      const font_folder_path = `${this.app.vault.configDir}/fonts`;
      if (!await this.app.vault.adapter.exists(font_folder_path)) {
        await this.app.vault.adapter.mkdir(font_folder_path);
      }
      if (await this.app.vault.adapter.exists(font_folder_path)) {
        const files = await this.app.vault.adapter.list(font_folder_path);
        for (const file of files.files) {
          const file_name = file.split("/")[2];
          options.push({ name: file_name, value: file_name });
        }
      }
    } catch (error) {
      console.log(error);
    }
    new import_obsidian.Setting(containerEl).setName("Font").setDesc("Choose font").addDropdown((dropdown) => {
      for (const opt of options) {
        dropdown.addOption(opt.name, opt.value);
      }
      dropdown.setValue(this.plugin.settings.font).onChange(async (value) => {
        this.plugin.settings.font = value;
        await this.plugin.saveSettings();
        await this.plugin.process_font();
      });
    });
    new import_obsidian.Setting(containerEl).setName("Force Style").setDesc("This option should only be used if you have installed a community theme and normal mode doesn't work").addToggle((toggle) => {
      toggle.setValue(this.plugin.settings.force_mode);
      toggle.onChange(async (value) => {
        this.plugin.settings.force_mode = value;
        await this.plugin.saveSettings();
        await this.plugin.process_font();
      });
    });
    new import_obsidian.Setting(containerEl).setName("Custom CSS Mode").setDesc("If you want to apply a custom css style rather than default style, choose this.").addToggle((toggle) => {
      toggle.setValue(this.plugin.settings.custom_css_mode);
      toggle.onChange(async (value) => {
        if (this.plugin.settings.custom_css_mode == false) {
          this.plugin.settings.custom_css = "";
        }
        this.plugin.settings.custom_css_mode = value;
        this.plugin.saveSettings();
        this.plugin.process_font();
        this.display();
      });
    });
    if (this.plugin.settings.custom_css_mode) {
      new import_obsidian.Setting(containerEl).setName("Custom CSS Style").setDesc("Input your custom css style").addTextArea((text) => {
        text.onChange(
          async (new_value) => {
            this.plugin.settings.custom_css = new_value;
            await this.plugin.saveSettings();
            await this.plugin.process_font();
          }
        );
        text.setDisabled(!this.plugin.settings.custom_css_mode);
        if (this.plugin.settings.custom_css == "") {
          let font_family_name = "";
          try {
            font_family_name = this.plugin.settings.font.split(".")[0];
          } catch (error) {
            console.log(error);
          }
          text.setValue(get_default_css(font_family_name));
        } else {
          text.setValue(this.plugin.settings.custom_css);
        }
        text.onChanged();
        text.inputEl.style.width = "100%";
        text.inputEl.style.height = "100px";
      });
    }
  }
};
