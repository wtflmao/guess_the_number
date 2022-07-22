const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');
const Conf = require('./conf/conf');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setting')
        .setDescription('Game settings')
        .addIntegerOption(option =>
            option.setName('value')
                .setDescription("Difficulty multiplier value, from 1 to 1000, 1 by default.")
                .setRequired(true)),
    akaNames: ['config'],

    async execute(interaction) {

        if (!interaction.member.roles.cache.some(role => role.id === '999960036904276008')) {// role: GuessTheNumberMod
            await interaction.reply("You don't have enough permission to run this command, plz contact bot admin for further assistance.");
            return;
        }

        let a = interaction.options.getInteger('value');
        if (!(a >= 1) || !(a <= 1000)) {
            await interaction.reply(`It should be between 1 and 1000. Your input is ${a}`);
            return;
        }

        const c = new Conf(a, 1 * a, 100 * a, 10000 * a);
        //console.log(c);
        fs.writeFile('./commands/conf/setting.json', c.toStr(), (err) => {
            if (err) throw err;
        });

        await interaction.reply(c.toStr());


    }
}