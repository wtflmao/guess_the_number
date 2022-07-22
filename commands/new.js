const { SlashCommandBuilder } = require('discord.js');
const Conf = require('./conf/conf');
const fs = require('fs');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('new')
		.setDescription('Start a new game. ')
		.addStringOption(option =>
			option.setName("mode")
				.setDescription("Difficulty selector")
				.setRequired(true)
				.addChoices(
					{ name: 'Easy', value: '0'},
					{ name: 'Normal', value: '1'},
					{ name: 'Hard', value: '2'})),
	akaNames: ['play', 'start'],

	async execute(interaction) {
		const mode = interaction.options.getString('mode');

		let configJSON = fs.readFileSync('./commands/conf/setting.json');
		const cc = new Conf(null).fromString(configJSON.toString());

		let minNum = 1;
		let maxNum = 2;
		const range = 100;
		if (mode === '0') {
			minNum = cc.easyBase;
			maxNum = cc.easyBase * range - 1;
		} else if (mode === '1') {
			minNum = cc.normalBase;
			maxNum = cc.normalBase * range - 1;
		} else if (mode === '2') {
			minNum = cc.hardBase;
			maxNum = cc.hardBase * range - 1;
		} else {
			console.log("mode exception detected.");
			await interaction.reply("error: mode exception detected");
			return;
		}
		minNum = Math.floor(minNum);
		maxNum = Math.floor(maxNum);

		// randomly generate a number as our correct answer
		const correctAnswer = minNum + Math.floor(Math.random() * (maxNum-minNum)); // possible integer answer lies in [minNum, maxNum]

		// a counter for total guesses
		let guesses = 0;

		// let people know their game has started
		await interaction.reply(`Game Started! Possible MIN:${minNum}, MAX:${maxNum}, you can say 'exit' to exit the game.`);

		// define a UNIX timestamp
		let startingDate = null;

		// create a filter that collects "number" replies
		const filter = m => {
			return (Number(m.content) >= minNum) && (Number(m.content) <= maxNum) && (m.author.id === interaction.user.id)
		} // m is a message object that will be passed through the filter function

		// create a filter that collects "number" replies
		const filterExit = m => {
			return (m.content === "exit") && (m.author.id === interaction.user.id)
		} // m is a message object that will be passed through the filter function

		const collector = interaction.channel.createMessageCollector({
			filter,
			//max: 1, // we only want one winner
			time: 1000 * 300, // 300 secs
		})

		const collectorExit = interaction.channel.createMessageCollector({
			filterExit,
			time: 1000 * 300, // 300 secs
		})

		collector.on('collect', m => {
			guesses++;
			if (guesses === 1) {
				// only starting the timer when the first guess was enclosed
				startingDate = new Date();
			}
			if (Number(m.content) === correctAnswer) {
				m.reply("Yes! You got it.");
				collector.stop();
			} else {
				if (Number(m.content) < correctAnswer) {
					minNum = Number(m.content);
				} else {
					maxNum = Number(m.content);
				}
				m.reply(`Wrong. Now MIN:${minNum}, MAX:${maxNum}`);
			}
		});

		collectorExit.on('collect', m => {
			if ((m.content === "exit") && (m.author.id === interaction.user.id)) {
				collectorExit.stop();
			}
		});

		collector.on('end', collected => {
			if (collected.size === 0) {
				interaction.channel.send(`Nobody's even tried. The correct answer was ${correctAnswer}`)
					.catch(console.error);
					return;
			}

			if (!(Number(collected.last().content) === correctAnswer) || !(collected.last().author.id === interaction.user.id)) {
				return;
			}

			// obtain UNIX timestamp
			const endingDate = new Date();

			const thatMessage = collected.first();
			interaction.channel.send(`<@${thatMessage.author.id}> You won in ${guesses} steps in ${(endingDate-startingDate)/1000.0} seconds.`)
				.catch(console.error);
		})

		collectorExit.on('end', collected => {
			// exit the game
			collector.stop();

			interaction.channel.send(`<@${interaction.user.id}> The game stopped by force.`)
				.catch(console.error);
		})
	},
};