const { SlashCommandBuilder } = require('@discordjs/builders');
const Conf = require('./conf/conf');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('display-setting')
        .setDescription('Game settings display'),

    async execute(interaction) {
        let configJSON = fs.readFileSync('./commands/conf/setting.json');
        const cc = new Conf(null).fromString(configJSON.toString());
        await interaction.reply(cc.toStr());

        //const settingArray = [;
        //interaction.reply(`Change saved.\nEasy: ${settingArray[0]} - ${settingArray[0] * 100 - 1}\nNormal: ${settingArray[1]} - ${settingArray[1] * 100 - 1}\nHard: ${settingArray[2]} - ${settingArray[2] * 100 - 1}`);
    }
}