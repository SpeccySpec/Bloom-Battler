///////////////////////////////////
// MAIN SCRIPT FOR BLOOM BATTLER //
// grassimp :) ////////////////////
///////////////////////////////////

//Discord.JS initiation.
const Discord = require('discord.js');
const Voice = require('@discordjs/voice');
const client = new Discord.Client({
	intents: [
		Discord.Intents.FLAGS.GUILDS,
		Discord.Intents.FLAGS.GUILD_MEMBERS,
		Discord.Intents.FLAGS.GUILD_MESSAGES,
		Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
		Discord.Intents.FLAGS.DIRECT_MESSAGES,
		Discord.Intents.FLAGS.GUILD_VOICE_STATES
	],
	partials: [
		'MESSAGE',
		'CHANNEL',
		'REACTION'
	]
});

// Bot Stuff
const utilityFuncs = require('./Packages/utilityFuncs.js');
const charFuncs = require('./Packages/charFuncs.js');
const enemyFuncs = require('./Packages/enemyFuncs.js');
const attackFuncs = require('./Packages/attackFuncs.js');
const turnFuncs = require('./Packages/turnFuncs.js');

const RF = require('./Packages/relicFuncs.js');

// Now for specific commands
const makeLoot = require('./packages/commands/loot/makeloot.js');
const assignLoot = require('./packages/commands/loot/assignloot.js');
const getLoot = require('./packages/commands/loot/getloot.js');
const searchLoot = require('./packages/commands/loot/searchloots.js');
const listLoot = require('./packages/commands/loot/listloots.js');
const deassignLoot = require('./packages/commands/loot/deassignloot.js');
const removeLoot = require('./packages/commands/loot/removeloot.js');

const registerSkillSteps = require('./packages/commands/registerskill.js');

//Canvas, for making custom pictures.
const Canvas = require('canvas');

//FS, for writing files.
const fs = require('fs');

// Voice Shit
const ffmpeg = require('ffmpeg-static');
const ytdl = require('ytdl-core');
const http = require('http');

// Other Required Shit
require('dotenv').config();
const { isBooleanObject } = require('util/types');

// Path to 'data' folder
const dataPath = './data'

// Games
var doGSM = false;

// Elements
const Elements = [
    "strike",
    "slash",
    "pierce",
    "fire",
    "water",
    "ice",
    "electric",
    "wind",
    "earth",
    "grass",
    "psychic",
    "poison",
    "nuclear",
    "metal",
    "curse",
    "bless",
    "almighty",

    "status",
    "heal",
    "passive"
]

const elementEmoji = {
	strike: "<:strike:877132710370480190>",
	slash: "<:slash:877132710345338960> ",
	pierce: "<:pierce:877132710315950101>",
	
	fire: "<:fire:877132709934301216>",
	water: "<:water:877132710471147571>",
	ice: "<:ice:877132710299181076>",
	electric: "<:electric:877132710194348072>",
	wind: "<:wind:877140815649075241>",
	earth: "<:earth:877140476409577482>",
	grass: "<:grass:877140500036075580>",
	psychic: "<:psychic:877140522530140171>",
	poison: "☠️",
	metal: "🔩",
	curse: "👻",
	bless: "<:bless:903369721980813322>",
	nuclear: "☢",
	
	almighty: "💫",
	
	status: "🔰",
	heal: "➕",
	passive: "⏎"
}

// Item
const itemTypes = [
	"weapon",
	"heal",
	"healmp",
	"healhpmp",
	"revive"
]

const itemTypeEmoji = {
	weapon: "🔪",

	heal: "🌀",
	healmp: "⭐",
	healhpmp: "🔰",

	revive: "✨"
}

// Status Effects
const statusEffects = [
    "burn",
	"bleed",
    "freeze",
    "paralyze",
	"dizzy",
	"sleep",
	"despair",
    "poison",
    "brainwash",
	"fear",
	"rage",
	"ego"
]

const statusEmojis = {
    burn: "🔥",
	bleed: "🩸",
    freeze: "❄",
    paralyze: "⚡",
	sleep: "💤",
	dizzy: "💫",
	despair: "💦",
    poison: "☠️",
	dizzy: "💫",
    brainwash: "🦆",
	fear: "👁",
	rage: "💥",
	ego: "🎭"
}

// Enemy Habitats
const enmHabitats = [
	"grasslands",
	"forests",
	"swamps",
	"mountains",
	"caverns",
	"volcanic",
	"icy",
	"unknown"
]

const weathers = [
	"rain",
	"thunder",
	"sunlight",
	"windy",
	"sandstorm",
	"hail"
]

const terrains = [
	"flaming", // 10 damage with 10% chance of burn
	"thunder", // 1.2x to elec
	"grassy",
	"light",
	"psychic",
	"misty",
	"sky",
	
	// boss specific
	"flooded",
	"swamp",
	"glacial",
	"fairydomain",
	"graveyard",
	"factory",
	"blindingradiance"
]

// round cuz i can
function roundNum(num, places) {
	return +(Math.round(num + "e+" + places)  + "e-" + places);
}

//////////////////////////////////////////////
// Buttons and the various different lists. //
//////////////////////////////////////////////

const backId = 'back'
const forwardId = 'forward'
const backButton = new Discord.MessageButton({
	style: 'SECONDARY',
	label: 'Back',
	emoji: '⬅️',
	customId: backId
})
const forwardButton = new Discord.MessageButton({
	style: 'SECONDARY',
	label: 'Forward',
	emoji: '➡️',
	customId: forwardId
})

const sendSkillArray = async(channel, theArray) => {
	const generateEmbed = async start => {
		const current = theArray.slice(start, start + 10)
		return new Discord.MessageEmbed({
			title: `Showing results ${start + 1}-${start + current.length} out of ${theArray.length}`,
			fields: await Promise.all(
				current.map(async arrayDefs => ({
					name: `${arrayDefs.name} (${elementEmoji[arrayDefs.type]})`,
					value: `${arrayDefs.pow} Power, ${arrayDefs.acc}% Accuracy`,
				}))
			)
		})
	}

	const canFitOnOnePage = theArray.length <= 10
	const embedMessage = await channel.send({
		embeds: [await generateEmbed(0)],
		components: canFitOnOnePage ? [] : [new Discord.MessageActionRow({components: [forwardButton]})]
	})

	if (canFitOnOnePage) return

	const collector = embedMessage.createMessageComponentCollector({
		filter: ({user}) => true // fuck you and your (the sequel)
	})

	let currentIndex = 0
	collector.on('collect', async interaction => {
		interaction.customId === backId ? (currentIndex -= 10) : (currentIndex += 10)
		await interaction.update({
			embeds: [await generateEmbed(currentIndex)],
			components: [
				new Discord.MessageActionRow({
					components: [
						...(currentIndex ? [backButton] : []),
						...(currentIndex + 10 < theArray.length ? [forwardButton] : [])
					]
				})
			]
		})
	})
}

const sendCharArray = async(channel, theArray) => {
	const generateEmbed = async start => {
		const current = theArray.slice(start, start + 10)
		return new Discord.MessageEmbed({
			title: `Showing results ${start + 1}-${start + current.length} out of ${theArray.length}`,
			fields: await Promise.all(
				current.map(async arrayDefs => ({
					name: `${arrayDefs.name}`,
					value: `${arrayDefs.hp}/${arrayDefs.maxhp}HP, ${arrayDefs.mp}/${arrayDefs.maxmp}MP`
				}))
			)
		})
	}

	const canFitOnOnePage = theArray.length <= 10
	const embedMessage = await channel.send({
		embeds: [await generateEmbed(0)],
		components: canFitOnOnePage ? [] : [new Discord.MessageActionRow({components: [forwardButton]})]
	})

	if (canFitOnOnePage) return

	const collector = embedMessage.createMessageComponentCollector({
		filter: ({user}) => true // fuck you and your (the sequel)
	})

	let currentIndex = 0
	collector.on('collect', async interaction => {
		interaction.customId === backId ? (currentIndex -= 10) : (currentIndex += 10)
		await interaction.update({
			embeds: [await generateEmbed(currentIndex)],
			components: [
				new Discord.MessageActionRow({
					components: [
						...(currentIndex ? [backButton] : []),
						...(currentIndex + 10 < theArray.length ? [forwardButton] : [])
					]
				})
			]
		})
	})
}

const sendItemArray = async(channel, theArray) => {
	const generateEmbed = async start => {
		const current = theArray.slice(start, start + 10)
		return new Discord.MessageEmbed({
			title: `Showing results ${start + 1}-${start + current.length} out of ${theArray.length}`,
			fields: await Promise.all(
				current.map(async arrayDefs => ({
					name: `${arrayDefs.name}`,
					value: `${itemTypeEmoji[arrayDefs.type.toLowerCase()]}${arrayDefs.type.toUpperCase()}`
				}))
			)
		})
	}

	const canFitOnOnePage = theArray.length <= 10
	const embedMessage = await channel.send({
		embeds: [await generateEmbed(0)],
		components: canFitOnOnePage ? [] : [new Discord.MessageActionRow({components: [forwardButton]})]
	})

	if (canFitOnOnePage) return

	const collector = embedMessage.createMessageComponentCollector({
		filter: ({user}) => true // fuck you and your (the sequel)
	})

	let currentIndex = 0
	collector.on('collect', async interaction => {
		interaction.customId === backId ? (currentIndex -= 10) : (currentIndex += 10)
		await interaction.update({
			embeds: [await generateEmbed(currentIndex)],
			components: [
				new Discord.MessageActionRow({
					components: [
						...(currentIndex ? [backButton] : []),
						...(currentIndex + 10 < theArray.length ? [forwardButton] : [])
					]
				})
			]
		})
	})
}

const sendBasicArray = async(channel, theArray) => {
	const generateEmbed = async start => {
		const current = theArray.slice(start, start + 10)
		return new Discord.MessageEmbed({
			title: `Showing results ${start + 1}-${start + current.length} out of ${theArray.length}`,
			fields: await Promise.all(
				current.map(async arrayDefs => ({
					name: `- ${arrayDefs.name}`,
					value: `_ _`
				}))
			)
		})
	}

	const canFitOnOnePage = theArray.length <= 10
	const embedMessage = await channel.send({
		embeds: [await generateEmbed(0)],
		components: canFitOnOnePage ? [] : [new Discord.MessageActionRow({components: [forwardButton]})]
	})

	if (canFitOnOnePage) return

	const collector = embedMessage.createMessageComponentCollector({
		filter: ({user}) => true // fuck you and your (the sequel)
	})

	let currentIndex = 0
	collector.on('collect', async interaction => {
		interaction.customId === backId ? (currentIndex -= 10) : (currentIndex += 10)
		await interaction.update({
			embeds: [await generateEmbed(currentIndex)],
			components: [
				new Discord.MessageActionRow({
					components: [
						...(currentIndex ? [backButton] : []),
						...(currentIndex + 10 < theArray.length ? [forwardButton] : [])
					]
				})
			]
		})
	})
}

const sendFoodArray = async(channel, theArray, nameArray, ownerArray) => {
	const generateEmbed = async start => {
		let current = theArray.slice(start, start + 10)
		const current2 = nameArray.slice(start, start + 10)
		const current3 = ownerArray.slice(start, start + 10)

		for (const i in current) {
			current[i].name = current2[i]

			if (current3[i] !== 'official') {
				if (isFinite(parseInt(current3[i]))) {
					var userID = client.users.cache.find(user => user.id === current3[i].toString())
					userID = userID.username
				} else
				userID = current3[i]
			} else
			var userID = 'official'

			current[i].owner = userID
		}

		return new Discord.MessageEmbed({
			title: `Showing results ${start + 1}-${start + current.length} out of ${theArray.length}`,
			fields: await Promise.all(
				current.map(async arrayDefs => ({
					name: `- ${arrayDefs.name} *(${arrayDefs.owner !== 'official' ? arrayDefs.owner : `Official`})*`,
					value: `Image: ${arrayDefs.image !== 'image' ? arrayDefs.image : 'Image separate from a link'}`
				}))
			)
		})
	}

	const canFitOnOnePage = theArray.length <= 10
	const embedMessage = await channel.send({
		embeds: [await generateEmbed(0)],
		components: canFitOnOnePage ? [] : [new Discord.MessageActionRow({components: [forwardButton]})]
	})

	if (canFitOnOnePage) return

	const collector = embedMessage.createMessageComponentCollector({
		filter: ({user}) => true // fuck you and your (the sequel)
	})

	let currentIndex = 0
	collector.on('collect', async interaction => {
		interaction.customId === backId ? (currentIndex -= 10) : (currentIndex += 10)
		await interaction.update({
			embeds: [await generateEmbed(currentIndex)],
			components: [
				new Discord.MessageActionRow({
					components: [
						...(currentIndex ? [backButton] : []),
						...(currentIndex + 10 < theArray.length ? [forwardButton] : [])
					]
				})
			]
		})
	})
}

/////////////////////////////////
// Finally, Voice Channel shit //
// LETS G ///////////////////////
/////////////////////////////////

var voiceChannelShit = {}

// Join a VC
async function joinVc(channel, originalChannel) {
	const connection = Voice.joinVoiceChannel({
		channelId: channel.id,
		guildId: channel.guild.id,
		adapterCreator: channel.guild.voiceAdapterCreator,
		selfDeaf: false,
	});

	voiceChannelShit[channel.guild.id] = {
		sendShit: originalChannel,
		connection: connection,
		player: null,
		cursong: {
			name: '',
			url: ''
		},
		queue: []
	}
}

// Download the song so that we can play it! We'll keep this song downloaded so that it can be played instantly if asked for again.
// - NO LONGER DO THIS
/*
async function downloadSong(fileName, url) {
	const songInfo = await ytdl.getInfo(url)

	return new Promise(resolve => {
		if (!ytdl.validateURL(url))
			resolve(true);
		if (fs.existsSync(`./songs/${fileName}.mp3`))
			resolve(true);

		const writeStream = fs.createWriteStream(`./songs/${fileName}.mp3`)

		ytdl(url, { filter : 'audioonly' })
			.pipe(writeStream);

		writeStream.on('finish', resolve);
	})
}
*/

// Add it to the queue.
async function addToQueue(server, url, author) {
	if (ytdl.validateURL(url)) {
		if (!voiceChannelShit[server]) {
			voiceChannelShit[server] = {
				sendShit: null,
				connection: null,
				player: null,
				cursong: {
					name: '',
					url: ''
				},
				queue: []
			}
		}
		
		if (!voiceChannelShit[server].queue)
			voiceChannelShit[server].queue = [];
		
		if (!ytdl.validateURL(url))
			return false;
		
		const songInfo = await ytdl.getInfo(url)
		
		voiceChannelShit[server].queue.push({
			name: songInfo.videoDetails.title,
			url: url,
			request: author
		})

		console.log(`push ${url} to voice channel queue`)
	}
}

// Play the song!
async function playSong(server, url, author, sendToChannel) {
	if (ytdl.validateURL(url)) {
		if (!voiceChannelShit[server]) {
			voiceChannelShit[server] = {
				sendShit: null,
				connection: null,
				player: null,
				playing: false,
				cursong: {
					name: songInfo.videoDetails.title,
					url: url,
					author: author ? author : null
				}
			}
		}
	
		if (voiceChannelShit[server].player || voiceChannelShit[server].player != null)
			voiceChannelShit[server].player.stop();
		
		if (!voiceChannelShit[server].player)
			voiceChannelShit[server].player = Voice.createAudioPlayer();
		
		if (!ytdl.validateURL(url))
			return false;
		
		const songInfo = await ytdl.getInfo(url)
		console.log(`play ${songInfo.videoDetails.title}`)
		
		var title = songInfo.videoDetails.title ? songInfo.videoDetails.title : 'someSong'
		var fileName = songInfo.videoDetails.title.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '')

		if (sendToChannel && voiceChannelShit[server].sendShit) {
			var musicEmbed
			if (author) {
				musicEmbed = new Discord.MessageEmbed()
					.setColor('#bb58fc')
					.setAuthor(`Now playing 🎶`, songInfo.videoDetails.thumbnails[0].url)
					.setTitle(`🎵 Now playing ${songInfo.videoDetails.title}`)
					.setFooter('Song requested by ' + author.username)
			} else {
				musicEmbed = new Discord.MessageEmbed()
					.setColor('#bb58fc')
					.setAuthor(`Now playing 🎶`, songInfo.videoDetails.thumbnails[0].url)
					.setTitle(`🎵 Now playing ${songInfo.videoDetails.title}`)
			}

			voiceChannelShit[server].sendShit.send({embeds: [musicEmbed]});
		}

		voiceChannelShit[server].playing = true
		voiceChannelShit[server].cursong = {
			name: songInfo.videoDetails.title,
			url: url,
			request: author ? author : null
		}

//		if (!fs.existsSync(`./songs/${fileName}.mp3`))
//			await downloadSong(fileName, url);

		const stream = await ytdl(url, { filter : 'audioonly' })
		const resource = Voice.createAudioResource(stream, { inputType: Voice.StreamType.Arbitrary })
		console.log('Got the resource.')
		
		setTimeout(function() {
			console.log('Actually playing the song now')
//			voiceChannelShit[server].player.play(Voice.createAudioResource(`./songs/${fileName}.mp3`));

			voiceChannelShit[server].player.play(resource);
			voiceChannelShit[server].player.on(Voice.AudioPlayerStatus.Idle, () => {
				endSong(server);
			})

			voiceChannelShit[server].connection.subscribe(voiceChannelShit[server].player)
			return true
		}, 50)
	}
}

// End the song.
async function endSong(server, sendString) {
	if (!voiceChannelShit[server]) {
		voiceChannelShit[server] = {
			sendShit: null,
			connection: null,
			player: null,
			playing: false,
			cursong: {
				name: '',
				url: ''
			},
			queue: []
		}
		
		return false
	} else {
		voiceChannelShit[server].playing = false
	}
	
	if (voiceChannelShit[server].player)
		voiceChannelShit[server].player.stop();

	if (voiceChannelShit[server].battlethemes || voiceChannelShit[server].loop) {
		var sendShit = voiceChannelShit[server].battlethemes ? null : true
		
		if (sendShit === true && voiceChannelShit[server].sendShit)
			voiceChannelShit[server].sendShit.send('Looping song.');

		await playSong(server, voiceChannelShit[server].cursong.url, voiceChannelShit[server].cursong.author, sendShit);
	} else if (voiceChannelShit[server].queue) {
		if (voiceChannelShit[server].queue.length <= 0) {
			delete voiceChannelShit[server].queue;
			console.log('end queue')
			
			if (voiceChannelShit[server].sendShit && sendString != "no")
				voiceChannelShit[server].sendShit.send('Oh, no more songs??\nWell, my job here is done! I hope you enjoyed my service!');
			
			leaveVC(server)
		} else {
			await playSong(server, voiceChannelShit[server].queue[0].url, voiceChannelShit[server].queue[0].author, true);
			console.log(`move to next song ${voiceChannelShit[server].queue[0].name}`)

			voiceChannelShit[server].queue.shift()
		}
	}

	return true
}

// Force stop the bot's music channel
function forceStop(server) {
	if (voiceChannelShit[server] && !voiceChannelShit[server].battlethemes)
		return false;

	if (!voiceChannelShit[server]) {
		voiceChannelShit[server] = {
			connection: null,
			player: null,
			cursong: {},
			playing: false
		}
		
		return true
	}
	
	delete voiceChannelShit[server].queue;
	
	voiceChannelShit[server].player.stop();
	return true
}

// Leave the VC
function leaveVC(server) {
	if (voiceChannelShit[server]) {
		if (voiceChannelShit[server].player)
			voiceChannelShit[server].player.stop();

		if (voiceChannelShit[server].connection)
			voiceChannelShit[server].connection.destroy();
		
		delete voiceChannelShit[server]
	}
}

// Battle Themes
async function playThemeType(server, themeType) {
	var servPath = dataPath+'/Server Settings/server.json'
	var servRead = fs.readFileSync(servPath);
	var servFile = JSON.parse(servRead);

	if (!servFile[server]) {
		servFile[server] = {
			prefix: "rpg!",
			limitbreaks: false,
			showtimes: false,
			onemores: false,
			currency: "Bloom Token",
			xprate: 1,
			damageFormula: "persona",
			pvpstuff: {
				none: {},
				metronome: {},
				randskills: {},
				randstats: {},
				charfuck: {}
			},
			themes: {
				battle: [],
				advantage: [],
				disadvantage: [],
				bossfight: [],
				miniboss: [],
				strongfoe: [],
				finalboss: [],
				colosseum: [],
				colosseumstrong: [],
				pvp: [],
				victory: [],
				colosseumvictory: [],
				loss: []
			},
			banned: []
		}
	}

	if (!servFile[server].themes) {
		servFile[server].themes = {
			battle: [],
			advantage: [],
			disadvantage: [],
			bossfight: [],
			miniboss: [],
			strongfoe: [],
			finalboss: [],
			colosseum: [],
			colosseumstrong: [],
			pvp: [],
			victory: [],
			colosseumvictory: [],
			loss: []
		}
	}
	
	fs.writeFileSync(servPath, JSON.stringify(servFile, null, '    '));
	
	if (!voiceChannelShit[server]) {
		voiceChannelShit[server] = {
			connection: null,
			player: null,
			cursong: {
				name: '',
				url: '',
				author: null
			},
		}

		return false
	}

	voiceChannelShit[server].cursong = {
		name: '',
		url: '',
		author: null
	}
	voiceChannelShit[server].queue = []
	
	if (voiceChannelShit[server].connection == null)
		return false;
	
	if (!voiceChannelShit[server].battlethemes)
		return false;
	
	const themes = servFile[server].themes[themeType.toLowerCase()]
	if (themes.length > 0) {
		var themeNum = utilityFuncs.randNum(themes.length-1)
		await playSong(server, themes[themeNum-1])
	}
}

/////////////////////
// Write Functions //
/////////////////////

// Gives a character an affinity.
function writeAffinity(name, type, affinity) {
    var charPath = dataPath+'/characters.json'
    var charRead = fs.readFileSync(charPath);
    var charFile = JSON.parse(charRead);

	if (affinity === "normal") {
		const affinities = ['weak', 'resist', 'block', 'repel', 'drain']
		for (const i in affinities) {
			if (affinities[i] && charFile[name][affinities[i]]) {
				for (const k in charFile[name][affinities[i]]) {
					if (charFile[name][affinities[i]][k].toLowerCase() === type.toLowerCase()) {
						charFile[name][affinities[i]].splice(k);
						break
					}
				}
			}
		}
	} else {
		if (charFile[name][affinity])
			charFile[name][affinity].push(type);
	}

    fs.writeFileSync(charPath, JSON.stringify(charFile, null, '    '));
    console.log(`Written ${name}'s ${type} ${affinity} to "characters.json".`)
}

// Changes the Character's Melee Attack
function writeMelee(name, skillname, type) {
    var charPath = dataPath+'/characters.json'
    var charRead = fs.readFileSync(charPath);
    var charFile = JSON.parse(charRead);

    charFile[name].melee = [skillname, type]

    fs.writeFileSync(charPath, JSON.stringify(charFile, null, '    '));
    console.log(`${name} learned a new melee skill: ${skillname}. It has been written to "characters.json"`)
}

// Gives EXP to a Character.
function giveXP(name, exp, msg) {
    var charPath = dataPath+'/characters.json'
    var charRead = fs.readFileSync(charPath);
    var charFile = JSON.parse(charRead);

    charFile[name].xp += parseInt(exp);
	while (charFile[name].xp >= charFile[name].maxxp)
		charFuncs.lvlUp(charFile[name]);

    fs.writeFileSync(charPath, JSON.stringify(charFile, null, '    '));

    msg.channel.send(`${name} got ${parseInt(exp)}EXP!`);
    console.log(`BattleStatus: ${name} ${charFile[name].xp}/${charFile[name].maxxp}XP`)
}

// Creates a Skill to be used in Battle.
function writeSkill(msg, name, need, bartype, power, accuracy, critical, movetype, status, chance, physorspec, targettype, hitcount, desc) {
    var skillPath = dataPath+'/skills.json'
    var skillRead = fs.readFileSync(skillPath);
    var skillFile = JSON.parse(skillRead);

    skillFile[name] = {
		name: name ? name : "Agi",
        cost: need ? need : 4,
        costtype: bartype ? bartype.toLowerCase() : "mp",
        pow: power ? Math.max(0, power) : 60,
        acc: accuracy ? accuracy : 95,
        crit: critical ? critical : 0,
		hits: hitcount ? hitcount : 1,
        type: movetype ? movetype.toLowerCase() : "fire",
        status: status ? status.toLowerCase() : "none",
        statuschance: chance ? chance : 0,
        atktype: physorspec ? physorspec.toLowerCase() : "magic",
		target: targettype ? targettype.toLowerCase() : "one",
		desc: desc ? desc.toString() : null,
		originalAuthor: msg.author.id
    };
	
	if (!critical || critical == 0)
		delete skillFile[name].crit;
	
	if (!hitcount || hitcount <= 1)
		delete skillFile[name].hits;

	if (!desc || desc === "none" || desc === "null")
		delete skillFile[name].desc;
	
	if (!status || status == "none" || status == 0 || status == "0" || chance == 0) {
		delete skillFile[name].status
		delete skillFile[name].statuschance
	}

    fs.writeFileSync(skillPath, JSON.stringify(skillFile, null, '    '))
    console.log(`Written skillFile["${name}"] to "skills.json".`)
	
	utilityFuncs.orderSkills()
	return true
}

// Creates a status type skill to be used in battle.
function writeStatus(msg, name, need, bartype, statustype, extra1, extra2, desc) {
    var skillPath = dataPath+'/skills.json'
    var skillRead = fs.readFileSync(skillPath);
    var skillFile = JSON.parse(skillRead);

    skillFile[name] = {
		name: name ? name : 'Rakukaja',
        type: 'status',
        cost: need ? need : 12,
        costtype: bartype ? bartype.toLowerCase() : 'mp',
		desc: desc ? desc.toString() : null,
		originalAuthor: msg.author.id
    };

	var statusType = statustype.toLowerCase()
	if (statusType === 'status') {
		skillFile[name].status = extra1.toLowerCase()
		skillFile[name].statuschance = parseInt(extra2)
	} else if (statusType === 'buff') {
		skillFile[name].buff = extra1.toLowerCase()
		skillFile[name].target = extra2.toLowerCase()
	} else if (statusType === 'debuff') {
		skillFile[name].debuff = extra1.toLowerCase()
		skillFile[name].target = extra2.toLowerCase()
	} else if (statusType === 'mimic')
		skillFile[name].mimic = true;
	else if (statusType === 'clone' || statusType === 'harmonics')
		skillFile[name].clone = true;
	else if (statusType === 'shield') {
		skillFile[name].shield = extra1.toLowerCase()
		skillFile[name].target = extra2.toLowerCase()
	} else if (statusType === 'makarakarn' || statusType === 'tetrakarn') {
		skillFile[name][statusType] = true
		skillFile[name].target = extra1.toLowerCase()
	} else if (statusType === 'trap') {
		skillFile[name].trap = true
		skillFile[name].trapType = {
			name: name,
			effect: [extra1.toLowerCase(), extra2.toLowerCase()]
		}

		if (extra1.toLowerCase() == "damage")
			skillFile[name].trapType.effect[2] = parseInt(extra2);
	} else if (statusType === 'weather')
		skillFile[name].weather = extra1.toLowerCase();
	else if (statusType === 'terrain')
		skillFile[name].terrain = extra1.toLowerCase();

	if (!desc || desc === "none" || desc === "null") {
		delete skillFile[name].desc
	}

    fs.writeFileSync(skillPath, JSON.stringify(skillFile, null, '    '))
    console.log(`Written skillFile["${name}"] to "skills.json" as a status skill.`)
	
	utilityFuncs.orderSkills()
	return true
}

// Creates a passive skill to be used in battle.
function writePassive(msg, name, passivetype, extra1, extra2, desc) {
    var skillPath = dataPath+'/skills.json'
    var skillRead = fs.readFileSync(skillPath);
    var skillFile = JSON.parse(skillRead);

    skillFile[name] = {
		name: name ? name : "Regen I",
        type: 'passive',
		desc: desc ? desc.toString() : null,
		originalAuthor: msg.author.id
    };

	if (!desc || desc === "none" || desc === "null") {
		delete skillFile[name].desc
	}
	
	var passiveType = passivetype.toLowerCase()
	if (passiveType === 'damagephys' || passiveType === 'damagemag' || passiveType === 'dodgephys' || passiveType === 'dodgemag' ||
		passiveType === 'healonturn' || passiveType === 'healmponturn' || passiveType === 'regen' || passiveType === 'invig') {
		skillFile[name].passive = passiveType
		skillFile[name].pow = parseInt(extra1)
	} else if (passiveType === 'status') {
		skillFile[name].passive = 'status'
		skillFile[name].status = extra1.toLowerCase()
		skillFile[name].pow = parseInt(extra2)
	} else if (passiveType === 'boost' || passiveType === 'elementboost' || passiveType === 'typeboost') {
		skillFile[name].passive = 'boost'
		skillFile[name].boosttype = extra1.toLowerCase()
		skillFile[name].pow = parseInt(extra2)
	} else if (passiveType === 'counterphys' || passiveType === 'countermag') {
		skillFile[name].passive = passiveType
		skillFile[name].counter = {
			chance: parseInt(extra1),
            skill: {
                name: name,
                pow: parseInt(extra2),
                acc: 95,
                type: "strike",
                atktype: "physical"
            }
		}
	} else if (passiveType === 'swordbreaker') {
		skillFile[name].pow = parseInt(extra1)
		skillFile[name].swordbreaker = true
	}

    fs.writeFileSync(skillPath, JSON.stringify(skillFile, null, '    '))
    console.log(`Written skillFile["${name}"] to "skills.json" as a passive skill.`)
	
	utilityFuncs.orderSkills()
	return true
}

////////////////////
// Read Functions //
////////////////////

// Reads Character Data
function readChar(name) {
    var charPath = dataPath+'/characters.json'
    var charRead = fs.readFileSync(charPath);
    var charFile = JSON.parse(charRead);

    if (charFile[name])
        return charFile[name];
    else
        return false;
}

function getBattleChar(n, server) {
    const btl = readBattle()

    for (const i in btl[server].allies.members) {
        if (btl[server].allies.members[i].name == n)
            return btl[server].allies.members[i];
    }

    return false
}

function getBattleCharNum(n, server) {
    const btl = readBattle()

    for (const i in btl[server].allies.members) {
        if (btl[server].allies.members[i].name == n)
            return i;
    }

    return false
}

// Reads Enemy Definition Data
function readEnm(name) {
    var enmPath = dataPath+'/enemies.json'
    var enmRead = fs.readFileSync(enmPath);
    var enmFile = JSON.parse(enmRead);

    if (enmFile[name]) {
        return enmFile[name]
    } else {
        return false
    }
}

// Reads current Enemy Data
function readEnmStat(n, server) {
    const btl = readBattle()

    for (const enemy in btl[server].enemies.members) {
        if (btl[server].enemies.members[enemy].name == n) {
            return btl[server].enemies.members[enemy]
        }
    }

    return false
}

function readEnmStatNum(n, server) {
    const btl = readBattle()

    for (const enemy in btl[server].enemies.members) {
        if (btl[server].enemies.members[enemy].name == n) {
            return enemy
        }
    }

    return false
}

// Reads Skill Data
function readSkill(name) {
    var skillPath = dataPath+'/skills.json'
    var skillRead = fs.readFileSync(skillPath);
    var skillFile = JSON.parse(skillRead);

    if (skillFile[name])
        return skillFile[name]
    else
        return false;
}

// Reads Battle Data
function readBattle(server) {
    var btlPath = dataPath+'/battle.json'
    var btlRead = fs.readFileSync(btlPath);
    var btlFile = JSON.parse(btlRead);

    return btlFile
}

//////////////////////
// Battle Functions //
//////////////////////

// Do on-turn status effects
function doStatusEffect(fighterDef, btl, server) {
	if (fighterDef.orgiaMode) {
		fighterDef.orgiaMode--;
		if (fighterDef.orgiaMode <= 0) {
			fighterDef.atk /= 2
			fighterDef.mag /= 2
			fighterDef.end *= 2
			fighterDef.status = "sleep"
			fighterDef.statusturns = 3
			delete fighterDef.orgiaMode

            const orgiaEmbed = new Discord.MessageEmbed()
                .setColor('#e36b2b')
                .setTitle(`${fighterDef.name}'s Orgia Mode`)
                .setDescription(`${fighterDef.name}'s orgia mode ran out and they passed out.`)

            client.channels.fetch(btl[server].battlechannel)
                .then(channel => channel.send({embeds: [orgiaEmbed]}))
		}
	}

	if (fighterDef.mimicturns) {
		fighterDef.mimicturns--;
		
		if (fighterDef.mimicturns <= 0) {				
			charFuncs.resetMimic(fighterDef)
			
			var turnOrder = getTurnOrder(btl[server])
			for (let i = 0; i < turnOrder.length; i++) {
				if (turnOrder[i] && turnOrder[i].id == fighterDef.id) {
					btl[server].doturn = i;
					console.log(`Changed turn to ${i} to compensate for agility changes.`);
				}
			}

            const mimicEmbed = new Discord.MessageEmbed()
                .setColor('#e36b2b')
                .setTitle(`${fighterDef.name}'s Mimic`)
                .setDescription(`${fighterDef.name} stopped mimicking their target.`)

            client.channels.fetch(btl[server].battlechannel)
                .then(channel => channel.send({embeds: [mimicEmbed]}))
		}
	}
	
	if (fighterDef.futureSightSkill) {
		fighterDef.futureSightSkill.turns--;
		
		if (fighterDef.futureSightSkill.turns <= 0) {
			const skillDefs = {
				name: fighterDef.futureSightSkill.name ? fighterDef.futureSightSkill.name : "their Future Sight Skill",
				pow: fighterDef.futureSightSkill.pow,
				acc: fighterDef.futureSightSkill.acc ? fighterDef.futureSightSkill.acc : 100,
				type: fighterDef.futureSightSkill.type,
				atktype: fighterDef.futureSightSkill.atktype ? fighterDef.futureSightSkill.atktype : "magic",
				status: fighterDef.futureSightSkill.status ? fighterDef.futureSightSkill.status : "none",
				statuschance: fighterDef.futureSightSkill.statuschance ? fighterDef.futureSightSkill.statuschance : 0,
			}

			const userDefs = fighterDef.futureSightSkill.user
			const embedText = attackFuncs.attackFoe(userDefs.name, fighterDef.name, userDefs, fighterDef, skillDefs, false, server, btl)     

			const DiscordEmbed = new Discord.MessageEmbed()
				.setColor('#e36b2b')
				.setTitle(`${embedText.targetText}`)
				.setDescription(`${embedText.attackText}!\n${embedText.resultText}`)

            client.channels.fetch(btl[server].battlechannel)
                .then(channel => channel.send({embeds: [DiscordEmbed]}))

			delete fighterDef.futureSightSkill
		}
	}

	if (fighterDef.rest) {
		fighterDef.rest = false

		const restEmbed = new Discord.MessageEmbed()
			.setColor('#e36b2b')
			.setTitle(`${fighterDef.name}'s is tired.`)
			.setDescription(`${fighterDef.name} must rest & recharge for this turn.`)

		client.channels.fetch(btl[server].battlechannel)
			.then(channel => channel.send({embeds: [restEmbed]}))
			
		fs.writeFileSync(dataPath+'/battle.json', JSON.stringify(btl, null, '    '));
		return [fighterDef, "skip"]
	}

    if (fighterDef.status && fighterDef.status.toLowerCase() != "none") {
        if (fighterDef.status === "burn" || fighterDef.status === "poison") {
            var dmg = Math.round(fighterDef.maxhp/10)
			if (fighterDef.boss || fighterDef.miniboss)
				dmg = 5;

            fighterDef.hp = Math.max(1, fighterDef.hp - dmg)

            fighterDef.statusturns--;

            const statusEmbed = new Discord.MessageEmbed()
                .setColor('#e36b2b')
                .setTitle(`${fighterDef.name}'s ${fighterDef.status}`)
                .setDescription(`${fighterDef.name} took ${dmg} damage.`)

            client.channels.fetch(btl[server].battlechannel)
                .then(channel => channel.send({embeds: [statusEmbed]}))
				
            if (fighterDef.statusturns == 0) {
                fighterDef.status = "none"
            }

			console.log(`TurnOrder: Done ${fighterDef.name}'s ${fighterDef.status} status effect.`);
		} else if (fighterDef.status === "bleed") {
            var dmg = Math.round(fighterDef.maxhp/10)
			if (fighterDef.boss || fighterDef.miniboss) {
				dmg = 5
			}

            fighterDef.hp -= dmg

            var defeated = "."
            if (fighterDef.hp <= 0) {
				fighterDef.hp = 0
                defeated = " and was defeated!"
            }

            const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#e36b2b')
                .setTitle(`${fighterDef.name} is bleeding out!`)
				.setDescription(`They took ${dmg} damage${defeated}`)

			fighterDef.statusturns--;
            if (fighterDef.statusturns == 0 || fighterDef.hp <= 0)
                fighterDef.status = "none";

            client.channels.fetch(btl[server].battlechannel)
                .then(channel => channel.send({embeds: [DiscordEmbed]}))
				
			console.log(`TurnOrder: Done ${fighterDef.name}'s ${fighterDef.status} status effect.`);

			if (fighterDef.hp <= 0) {
				fs.writeFileSync(dataPath+'/battle.json', JSON.stringify(btl, null, '    '));
				return [fighterDef, "skip"]
			}
		} else if (fighterDef.status === "despair") {
            var dmg = Math.round(fighterDef.maxmp/10)
			if (fighterDef.boss || fighterDef.miniboss)
				dmg = Math.round(fighterDef.maxmp/25);

            fighterDef.mp = Math.max(1, fighterDef.mp - dmg)

            const statusEmbed = new Discord.MessageEmbed()
                .setColor('#e36b2b')
                .setTitle(`${fighterDef.name}'s ${fighterDef.status}`)
                .setDescription(`${fighterDef.name} lost ${dmg} MP.`)
				
			fighterDef.statusturns--;
            if (fighterDef.statusturns == 0) {
                fighterDef.status = "none"
            }

			console.log(`TurnOrder: Done ${fighterDef.name}'s ${fighterDef.status} status effect.`);

            client.channels.fetch(btl[server].battlechannel)
                .then(channel => channel.send({embeds: [statusEmbed]}))
        } else if (fighterDef.status === "freeze") {
			if (fighterDef.boss || fighterDef.miniboss) {
				const statusEmbed = new Discord.MessageEmbed()
					.setColor('#e36b2b')
					.setTitle(`${fighterDef.name} is frozen!`)
					.setDescription("They break out of the ice.")

				client.channels.fetch(btl[server].battlechannel)
					.then(channel => channel.send({embeds: [statusEmbed]}))

				console.log(`TurnOrder: Done ${fighterDef.name}'s ${fighterDef.status} status effect.`);

				fighterDef.status = "none"
				fighterDef.statusturns = 0
			} else {
				const statusEmbed = new Discord.MessageEmbed()
					.setColor('#e36b2b')
					.setTitle(`${fighterDef.name} is frozen!`)
					.setDescription("They can't move!")

				client.channels.fetch(btl[server].battlechannel)
					.then(channel => channel.send({embeds: [statusEmbed]}))

				console.log(`TurnOrder: Done ${fighterDef.name}'s ${fighterDef.status} status effect.`);

				fighterDef.status = "none"
				fighterDef.statusturns = 0

				fs.writeFileSync(dataPath+'/battle.json', JSON.stringify(btl, null, '    '));
				return [fighterDef, "skip"]
			}
        } else if (fighterDef.status === "paralyze") {
			if (fighterDef.boss || fighterDef.miniboss) {
				const statusEmbed = new Discord.MessageEmbed()
					.setColor('#e36b2b')
					.setTitle(`${fighterDef.name} is paralyzed!`)
					.setDescription("They shake off the effect.")

				client.channels.fetch(btl[server].battlechannel)
					.then(channel => channel.send({embeds: [statusEmbed]}))
					
				console.log(`TurnOrder: Done ${fighterDef.name}'s ${fighterDef.status} status effect.`);

				fighterDef.status = "none"
				fighterDef.statusturns = 0
			} else {
				const statusEmbed = new Discord.MessageEmbed()
					.setColor('#e36b2b')
					.setTitle(`${fighterDef.name} is paralyzed!`)
					.setDescription("They can't move!")

				client.channels.fetch(btl[server].battlechannel)
					.then(channel => channel.send({embeds: [statusEmbed]}))
					
				console.log(`TurnOrder: Done ${fighterDef.name}'s ${fighterDef.status} status effect.`);

				fighterDef.status = "none"
				fighterDef.statusturns = 0

				fs.writeFileSync(dataPath+'/battle.json', JSON.stringify(btl, null, '    '));
				return [fighterDef, "skip"]
			}
        } else if (fighterDef.status === "sleep") {
			if (fighterDef.boss || fighterDef.statusturns <= 1) {
				const statusEmbed = new Discord.MessageEmbed()
					.setColor('#e36b2b')
					.setTitle(`${fighterDef.name} is asleep.`)
					.setDescription("They wake up.")

				client.channels.fetch(btl[server].battlechannel)
					.then(channel => channel.send({embeds: [statusEmbed]}))

				console.log(`TurnOrder: Done ${fighterDef.name}'s ${fighterDef.status} status effect.`);

				fighterDef.status = "none"
				fighterDef.statusturns = 0
			} else {
				var heal = Math.floor(fighterDef.maxhp/20)
				var healmp = Math.floor(fighterDef.maxmp/20)
				fighterDef.statusturns--;
				
				fighterDef.hp = Math.min(fighterDef.maxhp, fighterDef.hp + heal)
				fighterDef.mp = Math.min(fighterDef.maxmp, fighterDef.mp + healmp)

				const statusEmbed = new Discord.MessageEmbed()
					.setColor('#e36b2b')
					.setTitle(`${fighterDef.name} is asleep...`)
					.setDescription(`Their HP was restored by ${heal} & MP by ${healmp}.`)

				client.channels.fetch(btl[server].battlechannel)
					.then(channel => channel.send({embeds: [statusEmbed]}))

				console.log(`TurnOrder: Done ${fighterDef.name}'s ${fighterDef.status} status effect.`);

				fs.writeFileSync(dataPath+'/battle.json', JSON.stringify(btl, null, '    '));
				return [fighterDef, "skip"]
			}
        } else if (fighterDef.status === "fear") {
			if (Math.random() <= 0.5 && !fighterDef.boss && !fighterDef.miniboss) {
				const statusEmbed = new Discord.MessageEmbed()
					.setColor('#e36b2b')
					.setTitle(`${fighterDef.name} is fearful!`)
					.setDescription("They're too scared to move!")

				client.channels.fetch(btl[server].battlechannel)
					.then(channel => channel.send({embeds: [statusEmbed]}))
					
				console.log(`TurnOrder: Done ${fighterDef.name}'s ${fighterDef.status} status effect.`);

				return [fighterDef, "skip"]
			} else {
				const statusEmbed = new Discord.MessageEmbed()
					.setColor('#e36b2b')
					.setTitle(`${fighterDef.name} is fearful!`)
					.setDescription("They muster the courage to attack.")
					
				client.channels.fetch(btl[server].battlechannel)
					.then(channel => channel.send({embeds: [statusEmbed]}))
					
				fighterDef.status = "none"
				fighterDef.statusturns = 0
					
				console.log(`TurnOrder: Done ${fighterDef.name} is cured of fear`);

				fs.writeFileSync(dataPath+'/battle.json', JSON.stringify(btl, null, '    '));
				return [fighterDef, "continue"]
			}
        } else if (fighterDef.status === "dizzy") {
            const statusEmbed = new Discord.MessageEmbed()
                .setColor('#e36b2b')
                .setTitle(`${fighterDef.name} is dizzy!`)
				
			console.log(`TurnOrder: Notified of ${fighterDef.name}'s ${fighterDef.status} status effect.`);

			fighterDef.statusturns--;
            if (fighterDef.statusturns == 0) {
                fighterDef.status = "none"
				statusEmbed.setDescription("They were cured of their status.")
			} else if (fighterDef.boss || fighterDef.miniboss) {
				fighterDef.status = "none"
				statusEmbed.setDescription("They shook off their status effect.")
			} else
				statusEmbed.setDescription("The accuracy of their moves are halved.");
			
            client.channels.fetch(btl[server].battlechannel)
                .then(channel => channel.send({embeds: [statusEmbed]}))

			fs.writeFileSync(dataPath+'/battle.json', JSON.stringify(btl, null, '    '));
            return [fighterDef, "continue"]
        } else if (fighterDef.status === "ego") {
            const statusEmbed = new Discord.MessageEmbed()
                .setColor('#e36b2b')
                .setTitle(`${fighterDef.name} is egotistical!`)

            client.channels.fetch(btl[server].battlechannel)
                .then(channel => channel.send({embeds: [statusEmbed]}))
				
			console.log(`TurnOrder: Notified of ${fighterDef.name}'s ${fighterDef.status} status effect.`);

			fighterDef.statusturns--;
            if (fighterDef.statusturns == 0)
                fighterDef.status = "none";

			fs.writeFileSync(dataPath+'/battle.json', JSON.stringify(btl, null, '    '));
            return [fighterDef, "continue"]
        } else if (fighterDef.status === "brainwash") {
			var skillPath = dataPath+'/skills.json'
			var skillRead = fs.readFileSync(skillPath);
			var skillFile = JSON.parse(skillRead);

			var possibleSkills = [];
			for (const i in fighterDef.skills) {
				var skillDefs = skillFile[fighterDef.skills[i]]
				
				if (!skillDefs.passive && skillDefs.type != "passive") {
					var costType = skillDefs.costtype ? skillDefs.costtype.toLowerCase() : 'mp'

					switch(costType) {
						case 'hp':
							if (fighterDef.hp > skillDefs.cost)
								possibleSkills.push(fighterDef.skills[i]);
							
							break
							
						case 'hppercent':
							if (fighterDef.hp > (fighterDef.maxhp/100*skillDefs.cost))
								possibleSkills.push(fighterDef.skills[i]);
							
							break
							
						case 'mppercent':
							if (fighterDef.mp >= (fighterDef.maxmp/100*skillDefs.cost))
								possibleSkills.push(fighterDef.skills[i]);
							
							break
							
						default:
							if (fighterDef.mp >= skillDefs.cost)
								possibleSkills.push(fighterDef.skills[i]);
					}
				}
			}
			
			var skillDefs
			if (possibleSkills.length <= 0) {
				skillDefs = {
					name: fighterDef.melee[0],
					type: fighterDef.melee[1],
					pow: 10,
					crit: 10,
					acc: 90
				}
			} else {
				skillDefs = skillFile[possibleSkills[Math.round(Math.random() * (possibleSkills.length-1))]]
			}

			var targets = []
			var targType = skillDefs.target ? skillDefs.target.toLowerCase() : 'one'
			switch(targType) {
				case 'ally':
					if (charFuncs.isOpposingSide(fighterDef, btl[server])) {
						var targNum = Math.round(Math.random() * (btl[server].allies.members.length - 1))
						targets.push(btl[server].allies.members[targNum])
					} else {
						var targNum = Math.round(Math.random() * (btl[server].enemies.members.length - 1))
						targets.push(btl[server].enemies.members[targNum])
					}
					
					break
			
				case 'allopposing':
					if (charFuncs.isOpposingSide(fighterDef, btl[server])) {
						for (const i in btl[server].enemies.members)
							targets.push(btl[server].enemies.members[i]);
					} else {
						for (const i in btl[server].allies.members)
							targets.push(btl[server].allies.members[i]);
					}
					
					break
			
				case 'allallies':
					if (charFuncs.isOpposingSide(fighterDef, btl[server])) {
						for (const i in btl[server].allies.members)
							targets.push(btl[server].allies.members[i]);
					} else {
						for (const i in btl[server].enemies.members)
							targets.push(btl[server].enemies.members[i]);
					}
					
					break
					
				case 'everyone':
					for (const i in btl[server].allies.members)
						targets.push(btl[server].allies.members[i]);
					for (const i in btl[server].enemies.members)
						targets.push(btl[server].enemies.members[i]);
					
					break

				case 'caster':
					targets.push(fighterDef)					
					break
				
				default: 
					if (charFuncs.isOpposingSide(fighterDef, btl[server])) {
						var targNum = utilityFuncs.randNum(btl[server].enemies.members.length - 1)
						targets.push(btl[server].enemies.members[targNum])
					} else {
						var targNum = utilityFuncs.randNum(btl[server].allies.members.length - 1)
						targets.push(btl[server].allies.members[targNum])
					}
			}

			var embedTexts = []
			for (const i in targets) {
				var targDefs = targets[i]
				const targName = targets[i].name
				
				if (targDefs.hp > 0) {
					var embedTxt = attackFuncs.attackFoe(fighterDef.name, targName, fighterDef, targDefs, skillDefs, false, server, btl)
					if (embedTxt.oneMore == true && turnFuncs.oneMores(server)) {
						btl[message.guild.id].onemore = true
					}

					embedTexts.push(embedTxt)
				}
			}
			
			embedText = {
				targetText: `${fighterDef.name} => ???`,
				attackText: `**${fighterDef.name} is brainwashed!**\n${fighterDef.name} used ${skillDefs.name}!`,
				resultText: ''
			}
			
			for (const i in embedTexts)
				embedText.resultText += `\n${embedTexts[i].resultText}`;

			if (skillDefs.resistremove) {
				embedText.resultText += `\n${fighterDef.name} lost all resisting affinities toward ${skillDefs.resistremove} type skills.`
				
				const affinities = ["resist", "block", "repel", "drain"]
				for (const i in affinities) {
					for (const k in fighterDef[affinities[i]]) {
						if (fighterDef[affinities[i]][k] === skillDefs.resistremove) {
							fighterDef[affinities[i]].splice(k)
						}
					}
				}
			}
			
			if (skillDefs.sacrifice) {
				embedText.resultText += `\n${fighterDef.name} sacrificed themselves in the process.`;
				fighterDef.hp = 0
			}

			const DiscordEmbed = new Discord.MessageEmbed()
				.setColor('#e36b2b')
				.setTitle(`${embedText.targetText}`)
				.setDescription(`${embedText.attackText}!\n${embedText.resultText}`)

			fighterDef.statusturns--;
            if (fighterDef.statusturns == 0 || fighterDef.hp <= 0 || fighterDef.boss || fighterDef.miniboss)
                fighterDef.status = "none";

            client.channels.fetch(btl[server].battlechannel)
                .then(channel => channel.send({embeds: [DiscordEmbed]}))
				
			console.log(`TurnOrder: Done ${fighterDef.name}'s ${fighterDef.status} status effect.`);

			fs.writeFileSync(dataPath+'/battle.json', JSON.stringify(btl, null, '    '));
            return [fighterDef, "skip"]
		} else if (fighterDef.status === "rage") {
			var targ;
            if (charFuncs.isOpposingSide(fighterDef, btl[server])) {
				var targNum = Math.round(Math.random() * (btl[server].allies.members.length - 1))
				targ = btl[server].allies.members[targNum]
			} else {
				var targNum = Math.round(Math.random() * (btl[server].enemies.members.length - 1))
				targ = btl[server].enemies.members[targNum]
			}
			
			var embedText = attackFuncs.meleeFoe(fighterDef, targ, server, true, btl)
			const DiscordEmbed = new Discord.MessageEmbed()
				.setColor('#fcba03')
				.setTitle(`${embedText.targetText}`)
				.setDescription(`*${fighterDef.name} is enraged!*\n${embedText.attackText}!\n${embedText.resultText}`)

			fighterDef.statusturns--;
            if (fighterDef.statusturns == 0 || fighterDef.hp <= 0 || fighterDef.boss || fighterDef.miniboss)
                fighterDef.status = "none";

            client.channels.fetch(btl[server].battlechannel)
                .then(channel => channel.send({embeds: [DiscordEmbed]}))
				
			console.log(`TurnOrder: Done ${fighterDef.name}'s ${fighterDef.status} status effect.`);

			fs.writeFileSync(dataPath+'/battle.json', JSON.stringify(btl, null, '    '));
            return [fighterDef, "skip"]
        }
    }

	fs.writeFileSync(dataPath+'/battle.json', JSON.stringify(btl, null, '    '));
    return [fighterDef, "continue"]
}

//////////////////////////
// Turn Order functions //
//////////////////////////

// Get the turn order
function getTurnOrder(serverBtl) {
	var tempTurnOrder = [];
	for (const i in serverBtl.allies.members) {
		tempTurnOrder.push(serverBtl.allies.members[i])
	}
		
	for (const i in serverBtl.enemies.members) {
		tempTurnOrder.push(serverBtl.enemies.members[i])
			
		if (serverBtl.enemies.members[i].boss || serverBtl.enemies.members[i].miniboss) {
			tempTurnOrder.push(serverBtl.enemies.members[i])
		}
	}

	tempTurnOrder.sort(function(a, b){return b.agl - a.agl})
	
	console.log("TurnOrder: Generated temporary turn order to be used:")
	for (const i in tempTurnOrder) {
		console.log(`${i}: ${tempTurnOrder[i].name}`)
	}
	
	return tempTurnOrder
}

// Sends the Turn Brief
function sendTurnBrief(btl, channel) {
	console.log("StartTurn: Preparing Turn Brief")
	
	console.log("StartTurn: Getting Character Turn")
	const turnOrder = getTurnOrder(btl[channel.guild.id])
	const charDefs = turnOrder[btl[channel.guild.id].doturn]
	
	var allySide = btl[channel.guild.id].allies.members
	var opposingSide = btl[channel.guild.id].enemies.members
	if (charFuncs.isOpposingSide(charDefs, btl[channel.guild.id])) {
		allySide = btl[channel.guild.id].enemies.members
		opposingSide = btl[channel.guild.id].allies.members
	}

	var charNum = 0
    var allies = ``
    for (const i in allySide) {
        const ally = allySide[i]
        if (ally.hp > 0) {
			allies += `${ally.negotiated ? '💖' : ''}${ally.golden ? '<:golden:903369740142116887>' : ''}${ally.leader ? "👑" : ''}**${i}**: `
			if (ally.status != "none") {allies += `(${statusEmojis[ally.status]}) `}
			if (turnFuncs.oneMores(channel.guild.id) && ally.down) {allies += "🡇"}
			allies += `${ally.name} *(${ally.hp}/${ally.maxhp}HP) (${ally.mp}/${ally.maxmp}MP)`
			
			if (charFuncs.hasPassive(ally, "affinitypoint") && ally.affinitypoint && ally.affinitypoint > 0)
				allies += ` (${ally.affinitypoint}✰)*`;
			else
				allies += "*";
			
			allies += "\n"
		} else
            allies += `~~**${i}**: ${ally.name} *(DOWN)*~~\n`;
		
		if (charDefs.id == ally.id)
			charNum = i;
    }

    var targets = ""
	var allDown = false
	var downCount = 0
    for (const i in opposingSide) {
        const enemy = opposingSide[i]
        if (enemy.hp > 0) {
			targets += `${enemy.negotiated ? '💖' : ''}${enemy.golden ? '<:golden:903369740142116887>' : ''}${enemy.leader ? "👑" : ''}**${i}**: `

			if (enemy.status != "none") 
				targets += `(${statusEmojis[enemy.status]}) `;

			if (turnFuncs.oneMores(channel.guild.id) && enemy.down) {
				targets += "🡇"; 
				downCount++;
			}
			
			if (enemy.enemy && enemy.limitbreak) {
				if (enemy.lb >= enemy.limitbreak.cost)
					targets += '<:warning:878094052208296007>';
			} else if (!enemy.enemy && enemy.lb1) {
				if (enemy.lb >= enemy.lb1.cost)
					targets += '<:warning:878094052208296007>';
			}

			targets += `${enemy.name} *(${enemy.hp}/${enemy.maxhp}HP) (${enemy.mp}/${enemy.maxmp}MP)`
			
			if (charFuncs.hasPassive(enemy, "affinitypoint") && enemy.affinitypoint && enemy.affinitypoint > 0)
				targets += ` (${enemy.affinitypoint}✰)*`;
			else
				targets += "*";
			
			targets += "\n"
		} else
            targets += `~~**${i}**: ${enemy.name} *(DOWN)*~~\n`;
    }
	
	if (downCount == opposingSide.length)
		allDown = true;

	var skills = ""
	for (const i in charDefs.skills) {
		const skillDefs = readSkill(charDefs.skills[i]);
		
		if (!skillDefs.passive && skillDefs.type != "passive") {
			skills += `${elementEmoji[skillDefs.type.toLowerCase()]}${charDefs.skills[i]}\n`
		}
	}
	
	skills += "\n\n**Items**\n"
	var hasItems = false
	
	var party = btl[channel.guild.id].parties[btl[channel.guild.id].battleteam]
	if (charFuncs.isOpposingSide(charDefs, btl[channel.guild.id]))
		party = (btl[channel.guild.id].battleteam2.toLowerCase() != "none") ? btl[channel.guild.id].parties[btl[channel.guild.id].battleteam2] : null;

	var itemPath = dataPath+'/items.json'
	var itemRead = fs.readFileSync(itemPath);
	var itemFile = JSON.parse(itemRead);
	
	if (party && party.items) {
		for (const i in party.items) {
			skills += `${itemFile[i].name}: ${party.items[i]}\n`
			hasItems = true
		}
	}
	
	if (hasItems == false) {
		skills += "No Items."
	}

    var hpBrief = `__${charDefs.hp}/${charDefs.maxhp}HP__\n__${charDefs.mp}/${charDefs.maxmp}MP__`
	var otherBrief = `rpg!usemelee ${charNum} <Target Number>\nrpg!usemove ${charNum} <Target Number> <Skill>\nrpg!useitem ${charNum} <Item Name> <Target Number>\nrpg!guard ${charNum}\nrpg!tactics ${charNum} <Run/Negotiate/Backup> <Target>`

	if (turnFuncs.limitBreaks(channel.guild.id)) {
		hpBrief += `\n__${charDefs.lb}%__ LB Meter Filled`
        if (charDefs.lb1 && charDefs.lb > charDefs.lb1.cost) {
            otherBrief += `\nrpg!limitbreak ${charNum} <Target Number>`
        }
	}
	
	const weather = btl[channel.guild.id].changeweather ? btl[channel.guild.id].changeweather.weather : btl[channel.guild.id].weather
	const terrain = btl[channel.guild.id].changeterrain ? btl[channel.guild.id].changeterrain.terrain : btl[channel.guild.id].terrain
	
	if (weather != "clear" || terrain != "normal") {
		hpBrief += `\n<:warning:878094052208296007> `
		if (weather != "clear" && terrain === "normal")
			hpBrief += `${weather.toUpperCase()} weather`;
		else if (weather === "clear" && terrain != "normal")
			hpBrief += `${terrain.toUpperCase()} terrain`;
		else if (weather != "clear" && terrain != "normal")
			hpBrief += `${weather.toUpperCase()} weather, ${terrain.toUpperCase()} terrain`;
	}

	if (allDown && turnFuncs.oneMores(channel.guild.id))
		otherBrief += `\nrpg!allout ${charNum}`;

	if (btl[channel.guild.id].canshowtime && charFuncs.hasShowTime(charDefs))
		otherBrief += `\nrpg!showtime ${charNum} <Ally Number>`;

    let harassedUser = client.users.fetch(charDefs.owner)
    harassedUser.then(function(user) {
        const DiscordEmbed = new Discord.MessageEmbed()
            .setColor('#0099ff')
			.setTitle(`Turn ${btl[channel.guild.id].turn} - ${charDefs.name}'s turn!`)
			.setDescription(`*${hpBrief}*`)
            .addFields(
                { name: `Enemies`, value: `${targets}`, inline: true },
                { name: `Allies`, value: `${allies}`, inline: true },
                { name: `Skills`, value: `${skills}`, inline: true },
                { name: `Actions`, value: `${otherBrief}`, inline: false },
            )
        channel.send({content: `${user}`, embeds: [DiscordEmbed]});
    })
}

function advanceTurn(btl, server) {
    // Begin with doing checks to see if they should end the battle.
	// Clear clones & undead too.
	// Do end of turn events too

    // Should the player side win?
    var enemiesLeft = 0;
    for (const enm in btl[server].enemies.members) {
        const enemy = btl[server].enemies.members[enm]
        if (enemy.hp > 0 && !enemy.negotiated) {
            enemiesLeft = enemiesLeft + 1
        } else {
			enemy.status = "none"
			enemy.statusturns = 0
			enemy.lb = 0

			if (enemy.clone || enemy.undead) {
				btl[server].enemies.members.splice(enm, 1)
			}
		}
    }

    // Should the Enemy Side win?
    var playersLeft = 0;
    for (const player in btl[server].allies.members) {
        const p = btl[server].allies.members[player]
        if (p.hp > 0) {
            playersLeft = playersLeft + 1
        } else {
			p.status = "none";
			p.statusturns = 0;
			p.lb = 0;

			if (p.clone || p.undead) {
				btl[server].allies.members.splice(player, 1)
			}
		}
    }

	// LOl we have a draw here folks cause 	WE SUCK ASSs
	// In PVP, it is a draw, but in regular battles, the enemies always win.
	if (enemiesLeft <= 0 && playersLeft <= 0) {
		if (btl[server].pvp) {
			drawBattle(btl, server)
			return
		} else {
			loseBattle(btl, server)
			return
		}
	// The Enemies won
    } else if (playersLeft <= 0) {
        loseBattle(btl, server)
        return
	// The Players Won
	} else if (enemiesLeft <= 0) {
        winBattle(btl, server)
        return
    }
	
	// Advance the turn. + ONEMORE CHECK
    var defs;
	var tempTurnOrder = getTurnOrder(btl[server]);
	if (btl[server].onemore && turnFuncs.oneMores(server)) {
		delete btl[server].onemore
		
		defs = tempTurnOrder[btl[server].doturn]
		
		// Should we skip this turn because the character is dead or negotiated
		var skipTurn = false
		if (defs.hp <= 0)
			skipTurn = true;
		if (defs.negotiated)
			skipTurn = true;

		if (skipTurn) {
			advanceTurn(btl, server) // just rerun it lol
			return false
		} else {
			client.channels.fetch(btl[server].battlechannel)
				.then(channel => channel.send("**𝐎𝐍𝐄 𝐌𝐎𝐑𝐄!**"))
		}
	} else {
		while (!defs || defs.hp <= 0 || defs.negotiated) {
			console.log("TurnOrder: Generated temporary turn order to be used:")
			for (const i in tempTurnOrder)
				console.log(`${i}: ${tempTurnOrder[i].name}`)

			if (btl[server].doturn <= -1) {
				btl[server].doturn = 0
				console.log('TurnOrder: First turn');
			} else {
				if (tempTurnOrder[btl[server].doturn+1]) {
					btl[server].doturn++;
					console.log('TurnOrder: Next Turn');
				} else {
					console.log('TurnOrder: Reset Turn Order');
					btl[server].turn++;
					btl[server].doturn = 0
				}
			}

			defs = tempTurnOrder[btl[server].doturn]
			
			// now revert the defs
			for (const i in btl[server].allies.members) {
				if (defs.id == btl[server].allies.members[i].id) {
					defs = btl[server].allies.members[i]
					console.log('Ally Side Defs found')
				}
			}
			
			for (const i in btl[server].enemies.members) {
				if (defs.id == btl[server].enemies.members[i].id) {
					defs = btl[server].enemies.members[i]
					console.log('Opposing Side Defs found')
				}
			}		
			
			// Should we skip this turn because the character is dead or negotiated
			var skipTurn = false
			if (defs.hp <= 0)
				skipTurn = true;
			if (defs.negotiated)
				skipTurn = true;

			if (!skipTurn)
				break;
			else
				console.log('Skip this turn because this character is dead!');
		}
	}

    // Send channel, also handles passives, status effects and shit
    if (btl[server].battling == true) {
		var result = [{}, "continue"];

		var skillPath = dataPath+'/skills.json'
		var skillRead = fs.readFileSync(skillPath);
		var skillFile = JSON.parse(skillRead);
		var itemPath = dataPath+'/items.json'
		var itemRead = fs.readFileSync(itemPath);
		var itemFile = JSON.parse(itemRead);
		
		var fighterDefs = defs
		
		if (turnFuncs.oneMores(server) && fighterDefs.down)
			delete fighterDefs.down;
		
		console.log(`StartTurn: Starting Turn for ${fighterDefs.name}`)
		result = doStatusEffect(fighterDefs, btl, server)

		console.log(`StartTurn: Checking ${fighterDefs.name}'s skills for passives`)
		for (const i in fighterDefs.skills) {
			const skillDefs = skillFile[fighterDefs.skills[i]]
			
			if (!skillFile[fighterDefs.skills[i]]) {
				console.log(fighterDefs.skills[i] + " doesn't exist")
				continue
			}

			if (skillDefs && skillDefs.type && skillDefs.type === "passive" && fighterDefs.hp > 0) {
				if (skillDefs.passive === "healonturn") {
					fighterDefs.hp = Math.min(fighterDefs.maxhp, fighterDefs.hp + skillDefs.pow)
					client.channels.fetch(btl[server].battlechannel)
						.then(channel => channel.send(`${fighterDefs.name}'s ${skillDefs.name} allowed them to heal themselves by ${skillDefs.pow}!`))
				}

				if (skillDefs.passive === "healmponturn") {
					fighterDefs.mp = Math.min(fighterDefs.maxmp, fighterDefs.mp + skillDefs.pow)
					client.channels.fetch(btl[server].battlechannel)
						.then(channel => channel.send(`${fighterDefs.name}'s ${skillDefs.name} allowed them to restore their MP by ${skillDefs.pow}!`))
				}
				
				if (skillDefs.passive === "regen") {
					fighterDefs.hp = Math.round(Math.min(fighterDefs.maxhp, fighterDefs.hp + fighterDefs.maxhp/100*skillDefs.pow))
					client.channels.fetch(btl[server].battlechannel)
						.then(channel => channel.send(`${fighterDefs.name}'s ${skillDefs.name} allowed them to heal themselves by ${Math.round((fighterDefs.maxhp/100)*skillDefs.pow)}!`))
				}

				if (skillDefs.passive === "invig") {
					fighterDefs.mp = Math.round(Math.min(fighterDefs.maxmp, fighterDefs.mp + fighterDefs.maxmp/100*skillDefs.pow))
					client.channels.fetch(btl[server].battlechannel)
						.then(channel => channel.send(`${fighterDefs.name}'s ${skillDefs.name} allowed them to restore their MP by ${Math.round(fighterDefs.maxmp/100*skillDefs.pow)}!`))
				}
			}
		}
		
		const weather = btl[server].changeweather ? btl[server].changeweather.weather : btl[server].weather
		const terrain = btl[server].changeterrain ? btl[server].changeterrain.terrain : btl[server].terrain
		
		if (terrain === "grassy") {
			var healAmount = Math.round(fighterDefs.maxhp/10)
			if (fighterDefs.miniboss || fighterDefs.boss || fighterDefs.diety)
				healAmount = 20;

			fighterDefs.hp = Math.min(fighterDefs.maxhp, fighterDefs.hp + healAmount)
			client.channels.fetch(btl[server].battlechannel)
				.then(channel => channel.send(`The Grassy Terrain restored ${fighterDefs.name}'s HP by ${healAmount}!`))
		}

		if (btl[server].changeweather) {
			btl[server].changeweather.weathertime--;
			
			if (btl[server].changeweather.weathertime <= 0) {
				client.channels.fetch(btl[server].battlechannel)
					.then(channel => channel.send(`The ${btl[server].changeweather.weather} weather subsided.`))

				delete btl[server].changeweather
			}
		}

		if (btl[server].changeterrain) {
			btl[server].changeterrain.terraintime--;
			
			if (btl[server].changeterrain.terraintime <= 0) {
				client.channels.fetch(btl[server].battlechannel)
					.then(channel => channel.send(`The ${btl[server].changeterrain.terrain} weather subsided.`))

				delete btl[server].changeterrain
			}
		}
		
		if (fighterDefs.weapon) {
			if (itemFile[fighterDefs.weapon] && itemFile[fighterDefs.weapon].skill) {
				const itemDefs = itemFile[fighterDefs.weapon]
				const itemSkill = itemFile[fighterDefs.weapon].skill
				if (!charFuncs.knowsSkill(fighterDefs, itemSkill)) {
					fighterDefs.skills.push(itemSkill)
				}
			}
		}

		fighterDefs.guard = false

		if (result[1] && result[1] === "continue") {
			setTimeout(function() {
				if (fighterDefs.enemy || fighterDefs.npc) {
					client.channels.fetch(btl[server].battlechannel)
						.then(channel => enemyMove(fighterDefs.id, btl, channel))
				} else {
					client.channels.fetch(btl[server].battlechannel)
						.then(channel => sendTurnBrief(btl, channel))
				}
			}, 2000);
		} else if (result[1] && result[1] === "skip") {
			setTimeout(function() {
				advanceTurn(btl, server)
			}, 5000);
		}
    }

    fs.writeFileSync(dataPath+'/battle.json', JSON.stringify(btl, null, '    '), function (err) { if (err) throw err });

    return btl
}

function sendCharStats(user, charDefs) {
	var charAffs = "";
	for (const i in charDefs.weak) {charAffs += `${charDefs.weak[i]} weakness.\n`}
	for (const i in charDefs.resist) {charAffs += `${charDefs.resist[i]} resist.\n`}
	for (const i in charDefs.block) {charAffs += `${charDefs.block[i]} block.\n`}
	for (const i in charDefs.repel) {charAffs += `${charDefs.repel[i]} repel.\n`}
	for (const i in charDefs.drain) {charAffs += `${charDefs.drain[i]} drain.\n`}
	if (charAffs === "") {charAffs = "No Affinities that battle."}
	
	var charPassives = ''
	for (const i in charDefs.skills) {
		var skillDefs = readSkill(charDefs.skills[i])
		
		if (skillDefs && skillDefs.passive)
			charPassives += skillDefs.name;
	}

	if (charPassives === '') {charPassives = 'No Passives that battle.'}

	var DiscordEmbed = new Discord.MessageEmbed()
		.setColor('#9c39ed')
		.setTitle(`These were ${charDefs.name}'s stats in that RandStats battle.`)
		.addFields(
			{ name: 'Stats', value: `${charDefs.maxhp}HP\n${charDefs.maxmp}MP\n${charDefs.atk}ATK\n${charDefs.mag}MAG\n${charDefs.prc}PRC\n${charDefs.end}END\n${charDefs.chr}CHR\n${charDefs.int}INT\n${charDefs.agl}AGL\n${charDefs.luk}LUK`, inline: true },
			{ name: 'Affinities', value: charAffs, inline: true },
			{ name: 'Passive Skills', value: charPassives, inline: true }
		)

	return user.send({embeds: [DiscordEmbed]})
}

function drawBattle(btl, server) {
	var drawQuotes = [
		"You're a bunch of idiots.",
		"How did you even...???",
		"That one point, down the drain.",
		"Good job guys, nobody wins. Nobody gets the glory.",
		"Some fighters...",
		"Uhm you look like an uhm mbguhhum uhmuh um uhmhimhumhu",
		"I will find you, and crush your skull until your brain spills out."
	]

	var DiscordEmbed = new Discord.MessageEmbed()
		.setColor('#9c39ed')
		.setTitle("A draw!")
		.setDescription(`${drawQuotes[Math.round(Math.random() * drawQuotes.length-1)]}`)

	client.channels.fetch(btl[server].battlechannel)
		.then(channel => channel.send({embeds: [DiscordEmbed]}))
		
	for (const i in btl[server].allies.members) {
		const charDefs = btl[server].allies.members[i]
	
		if ((btl[server].pvpmode === 'randstats' || btl[server].pvpmode === 'charfuck') && charDefs.owner) {			
			var owner = client.users.fetch(charDefs.owner)
			owner.then(function(owner) {
				sendCharStats(owner, charDefs)
			})
		}
	}
		
	for (const i in btl[server].enemies.members) {
		const charDefs = btl[server].enemies.members[i]
	
		if ((btl[server].pvpmode === 'randstats' || btl[server].pvpmode === 'charfuck') && charDefs.owner) {			
			var owner = client.users.fetch(charDefs.owner)
			owner.then(function(owner) {
				sendCharStats(owner, charDefs)
			})
		}
	}
			
	btl[server].allies.members = [];
	btl[server].enemies.members = [];
	btl[server].battling = false;
	btl[server].battleteam = "none";
	btl[server].battleteam2 = "none";
	btl[server].battlechannel = "none";
	btl[server].doturn = 0;
	btl[server].turn = 1;
	btl[server].pvp = false;
	if (btl[server].colosseum[0] == true) {
		btl[server].colosseum[0] = false;
		btl[server].colosseum[1] = 0;
		btl[server].colosseum[2] = "none";
	}

	fs.writeFile(dataPath+'/battle.json', JSON.stringify(btl, null, '    '), function(err) { if (err) throw err });			
	return true
}

function nextWave(btl, server) {
    if (btl[server].colosseum[0] == true) {
        if (btl[server].trials[btl[server].colosseum[2]][btl[server].colosseum[1] + 1]) {
            btl[server].colosseum[1] = btl[server].colosseum[1] + 1
            btl[server].enemies.members = [];
			
            var bossWave = false;
			var miniBossWave = false;
			var battlerID = btl[server].allies.members.length
            for (const trial in btl[server].trials[btl[server].colosseum[2]][btl[server].colosseum[1]]) {
                if (readEnm(btl[server].trials[btl[server].colosseum[2]][btl[server].colosseum[1]][trial])) {
                    var enemyDefs = enemyFuncs.genEnm(btl[server].trials[btl[server].colosseum[2]][btl[server].colosseum[1]][trial], server)
					enemyDefs.id = battlerID;
					
					btl[server].enemies.members.push(enemyDefs);

					if (enemyDefs.miniboss)
						miniBossWave = true;
					else if (enemyDefs.boss) 
						bossWave = true;

                    console.log(`BattleStatus: ${btl[server].trials[btl[server].colosseum[2]][btl[server].colosseum[1]][trial]} generated.`);
                    battlerID++;
                } else {
                    client.channels.fetch(btl[server].battlechannel)
                        .then(channel => channel.send(`${btl[server].trials[btl[server].colosseum[2]][btl[server].colosseum[1]][trial]} in the trial of ${btl[server].colosseum[2]} is an invalid enemy.`))
                }
            }

            fs.writeFileSync(dataPath+'/battle.json', JSON.stringify(btl, null, '    '));

            var DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#9c39ed')
                .setTitle(`Team ${btl[server].battleteam} defeated the enemies!`)
				.setDescription('The next wave is coming!')
                .setFooter(`Wave ${btl[server].colosseum[1]}`);

            if (miniBossWave == true) {
                DiscordEmbed.setDescription('The next wave is coming!\nA powerful enemy arises.')
                DiscordEmbed.setFooter(`Wave ${btl[server].colosseum[1]} - Mini Boss Wave`);
            } else if (bossWave == true) {
                DiscordEmbed.setDescription('The next wave is coming!\nA strong enemy resonates within...')
                DiscordEmbed.setFooter(`Wave ${btl[server].colosseum[1]} - Boss Wave`);
				
				playThemeType(server, "colosseumstrong")
            }

            client.channels.fetch(btl[server].battlechannel)
                .then(channel => channel.send({embeds: [DiscordEmbed]}))

            console.log('BattleStatus: Next Wave.');

            advanceTurn(btl, server)
            fs.writeFileSync(dataPath+'/battle.json', JSON.stringify(btl, null, '    '));
        } else {
            console.log('BattleStatus: Defeated all enemies');
            const discordEmbed = new Discord.MessageEmbed()
                .setColor('#d613cc')
                .addFields(
                    { name: `Team ${btl[server].battleteam} won!`, value: 'You defeated the enemies and completed the trial! Well done!', inline: false },
                )
            client.channels.fetch(btl[server].battlechannel)
                .then(channel => channel.send({embeds: [DiscordEmbed]}))
				
			playThemeType(server, "victorycolosseum")

            turnFuncs.clearBTL(btl[server])
            fs.writeFileSync(dataPath+'/battle.json', JSON.stringify(btl, null, '    '));
        }

        return true
    }
}
	
function winBattle(btl, server) {
    var charPath = dataPath+'/characters.json'
    var charRead = fs.readFileSync(charPath);
    var charFile = JSON.parse(charRead);
	
	var servPath = dataPath+'/Server Settings/server.json'
	var servRead = fs.readFileSync(servPath);
	var servFile = JSON.parse(servRead);
	
	if (btl[server].pvp) {
        if (!servFile[server]) {
            servFile[server] = {
                prefix: "rpg!",
				limitbreaks: false,
				showtimes: false,
				onemores: false,
				currency: "Bloom Token",
				xprate: 1,
				damageFormula: "persona",
				pvpstuff: {
					none: {},
					metronome: {},
					randskills: {},
					randstats: {},
					charfuck: {}
				},
				themes: {
					battle: [],
					advantage: [],
					disadvantage: [],
					bossfight: [],
					miniboss: [],
					strongfoe: [],
					finalboss: [],
					colosseum: [],
					colosseumstrong: [],
					pvp: [],
					victory: [],
					colosseumvictory: [],
					loss: []
				},
				banned: []
            }
        }
		
		var pointTxt = ''
		for (const i in btl[server].allies.members) {
			if (!servFile[server].pvpstuff || servFile[server].pvpstuff.legnth <= 3) {
				servFile[server].pvpstuff = {
					none: {},
					metronome: {},
					randskills: {},
					randstats: {},
					charfuck: {}
				}
			}
			
			var pvpDefs = servFile[server].pvpstuff[btl[server].pvpmode]
			const charDefs = btl[server].allies.members[i]
			
			if (charDefs.owner) {
				if (!pvpDefs[charDefs.owner]) {
					pvpDefs[charDefs.owner] = {
						points: 0
					}
				}

				if (!pvpDefs[charDefs.owner].points) {
					pvpDefs[charDefs.owner].points = 0
				}
			
				pvpDefs[charDefs.owner].points++;
				pointTxt += `${charDefs.name} got a point for winning`
				
				if (charDefs.hp > 0) {
					if (charDefs.hp < 21) {
						pointTxt += ' & clutching out at low hp'
						pvpDefs[charDefs.owner].points++;
					}
				}

				if (server.toString() === "874635107300933682") {
					pvpDefs[charDefs.owner].points++
				}

				pointTxt += '.\n'
				
				if ((btl[server].pvpmode === 'randstats' || btl[server].pvpmode === 'charfuck') && charDefs.owner) {			
					var owner = client.users.fetch(charDefs.owner)
					owner.then(function(owner) {
						sendCharStats(owner, charDefs)
					})
				}
			}
		}
		
		for (const i in btl[server].enemies.members) {
			const charDefs = btl[server].enemies.members[i]
		
			if ((btl[server].pvpmode === 'randstats' || btl[server].pvpmode === 'charfuck') && charDefs.owner) {			
				var owner = client.users.fetch(charDefs.owner)
				owner.then(function(owner) {
					sendCharStats(owner, charDefs)
				})
			}
		}
		
		if (server.toString() === "874635107300933682") {
			pointTxt += "**OFFICIAL SERVER BONUS** (+1)"
		}

		var DiscordEmbed = new Discord.MessageEmbed()
			.setColor('#9c39ed')
			.setTitle(`Team ${btl[server].battleteam} wins!`)
			.setDescription(`${pointTxt}`)

		client.channels.fetch(btl[server].battlechannel)
			.then(channel => channel.send({embeds: [DiscordEmbed]}))
		
		fs.writeFileSync(servPath, JSON.stringify(servFile, null, '    '));
			
		turnFuncs.clearBTL(btl[server])
		
		forceStop();

		fs.writeFile(dataPath+'/battle.json', JSON.stringify(btl, null, '    '), function (err) { if (err) throw err });			
		return true
	}

    if (btl[server].colosseum[0] == true) {
		nextWave(btl, server)
        return true
    }

    // XP and Rings
    var totalXP = 0;
    var totalRings = 0;
	var isBigBoss = false;
    for (const enemy in btl[server].enemies.members) {
		const enmStats = btl[server].enemies.members[enemy]
		const enmDefs = readEnm(btl[server].enemies.members[enemy].name)

        var enmXP = Math.round(parseInt(enmDefs.awardxp) * parseFloat(servFile[server].xprate))
		var enmRings = Math.round(Math.random() * 100)

		if (enmDefs.diety || enmDefs.bigboss)
			isBigBoss = true;

		if (isBigBoss)
            enmRings += Math.round(Math.random() * 1500);
        else if (enmDefs.boss || enmDefs.miniboss)
            enmRings += Math.round(Math.random() * 600);

		if (enmStats.negotiated) {
			enmRings *= 3
			enmXP /= 3
		}
		
		if (enmStats.golden) {
			enmRings *= 3
			enmXP *= 5
		}

		totalXP += enmXP
		totalRings += enmRings
    }

    // Reset Battle stuff and award XP
    for (const i in btl[server].allies.members) {
		const battlerDefs = btl[server].allies.members[i] // Character inbattle
		const charDefs = charFile[btl[server].allies.members[i].truename] // Character to transfer shit to
		
		// Reset Mimic
		charFuncs.resetMimic(battlerDefs)
		charFuncs.resetMimic(charDefs)
		
		// Trust Levels
		for (const k in btl[server].allies.members) {
			const allyDefs = btl[server].allies.members[k]
			charFuncs.trustUp(charDefs, allyDefs, 5, server)
		}

		// Award XP now
		charDefs.xp += totalXP;
		console.log(`BattleStatus: ${charDefs.name} got ${totalXP}XP. (${charDefs.xp}/${charDefs.maxxp}XP)`)
		client.channels.fetch(btl[server].battlechannel)
			.then(channel => channel.send(`${charDefs.name} got **${totalXP}EXP**!`))

		var shouldLevelUp = false;
		if (charDefs.xp >= charDefs.maxxp)
			shouldLevelUp = true;

		if (shouldLevelUp == true) {
			var levelCount = 0
			while (charDefs.xp >= charDefs.maxxp) {
				charFuncs.lvlUp(charDefs)
				levelCount++;
			}

			console.log(`BattleStatus: ${charDefs.name} levelled up ${levelCount} time(s)`)
			
			var lvlQuote = ""
			if (charDefs.lvlquote && charDefs.lvlquote.length > 0) {
				var possibleQuote = Math.round(Math.random() * (charDefs.lvlquote.length-1))
				lvlQuote = `*${charDefs.name}: "${charDefs.lvlquote[possibleQuote]}"*\n\n`
			}

			const DiscordEmbed = new Discord.MessageEmbed()
				.setColor('#b4eb34')
				.setTitle(`${charDefs.name} levelled up!`)
				.setDescription(`${lvlQuote}Level ${charDefs.level}\n${charDefs.maxhp}HP\n${charDefs.maxmp}MP\n\n${charDefs.atk}ATK\n${charDefs.mag}MAG\n${charDefs.prc}PRC\n${charDefs.end}END\n${charDefs.chr}CHR\n${charDefs.int}INT\n${charDefs.agl}AGL\n${charDefs.luk}LUK`)
			
			client.channels.fetch(btl[server].battlechannel)
				.then(channel => channel.send({embeds: [DiscordEmbed]}))
		}
		
		// Full HP if this is a diety/big boss whatever
		if (isBigBoss == true) {
			charDefs.hp = charDefs.maxhp
			charDefs.mp = charDefs.maxmp
		} else {
			charDefs.hp = battlerDefs.hp
			charDefs.mp = battlerDefs.mp
		}
		
		// Values to copy
		charDefs.weapon = battlerDefs.weapon
		charDefs.trust = battlerDefs.trust
    }

    // Award Rings
    if (totalRings > 0) {
        btl[server].parties[btl[server].battleteam].rings = (btl[server].parties[btl[server].battleteam].rings + totalRings)
    }
	
	// Item Drops
	let additionalText = ``
	let itemList = ``
	
	for (const enemy in btl[server].enemies.members) {
		var lootPath = dataPath+'/Loot/lootTables.json'
		var lootRead = fs.readFileSync(lootPath);
		var lootFile = JSON.parse(lootRead);
		var btlPath = dataPath+'/battle.json'
		var btlRead = fs.readFileSync(btlPath);
		var btlFile = JSON.parse(btlRead);

		const enmDefs = readEnm(btl[server].enemies.members[enemy].name)

		if (enmDefs.loot || enmDefs.loot !== '' || enmDefs.loot !== undefined) {
			if (lootFile[enmDefs.loot]) {
				console.log('BattleStatus: Opening Loot')

				let itemInput = lootFile[enmDefs.loot].items
				let chanceInput = lootFile[enmDefs.loot].itemChances

				for (const loot in itemInput) {
					var itemChance = chanceInput[loot]
					
					if (btl[server].enemies.members[enemy].golden)
						itemChance *= 4;

					if (Math.random() * 100 < itemChance) {
						console.log(`BattleStatus: Successfully gathered ${itemInput[loot]}`)
						itemList += `\n- ${itemInput[loot]} from ${btl[server].enemies.members[enemy].name}`

						if (btl[server].parties[btl[server].battleteam].items == [])
							btl[server].parties[btl[server].battleteam].items = {};

						if (!btl[server].parties[btl[server].battleteam].items[itemInput[loot]])
							btl[server].parties[btl[server].battleteam].items[itemInput[loot]] = 0;
						
						btl[server].parties[btl[server].battleteam].items[itemInput[loot]] += 1
					}
				}
			}

			fs.writeFileSync(btlPath, JSON.stringify(btl, null, '    '));

			if (itemList.length > 1)
				additionalText = `\n\nThe party also got:${itemList}`;
		}
	}

    console.log('BattleStatus: Defeated all enemies');
    const dEmbed = new Discord.MessageEmbed()
        .setColor('#d613cc')
        .setTitle(`Team ${btl[server].battleteam} won!`)
		.setDescription(`You defeated all the enemies!\nThe party obtained ${totalRings} ${servFile[server].currency}s!${additionalText}`)
    client.channels.fetch(btl[server].battlechannel)
        .then(channel => channel.send({embeds: [dEmbed]}))

	playThemeType(server, "victory")
	setTimeout(function() {
		forceStop();
	}, 20000)

	turnFuncs.clearBTL(btl[server])
    fs.writeFile(dataPath+'/battle.json', JSON.stringify(btl, null, '    '), function (err) {if (err) throw err});
    fs.writeFile(charPath, JSON.stringify(charFile, null, '    '), function (err) {if (err) throw err});
}

function loseBattle(btl, server) {
	var servPath = dataPath+'/Server Settings/server.json'
	var servRead = fs.readFileSync(servPath);
	var servFile = JSON.parse(servRead);

	if (btl[server].pvp) {
        if (!servFile[server]) {
            servFile[server] = {
                prefix: "rpg!",
				limitbreaks: false,
				showtimes: false,
				onemores: false,
				currency: "Bloom Token",
				xprate: 1,
				damageFormula: "persona",
				pvpstuff: {},
				themes: {
					battle: [],
					advantage: [],
					disadvantage: [],
					bossfight: [],
					miniboss: [],
					strongfoe: [],
					finalboss: [],
					colosseum: [],
					colosseumstrong: [],
					pvp: [],
					victory: [],
					colosseumvictory: [],
					loss: []
				},
				banned: []
            }
        }
		
		var pointTxt = ''
		for (const i in btl[server].enemies.members) {
			if (!servFile[server].pvpstuff || servFile[server].pvpstuff <= 2) {
				servFile[server].pvpstuff = {
					none: {},
					metronome: {},
					randskills: {},
					randstats: {},
					charfuck: {}
				}
			}

			var pvpDefs = servFile[server].pvpstuff[btl[server].pvpmode]
			const charDefs = btl[server].enemies.members[i]
			
			if (charDefs.owner) {
				if (!pvpDefs[charDefs.owner]) {
					pvpDefs[charDefs.owner] = {
						points: 0
					}
				}

				if (!pvpDefs[charDefs.owner].points) {
					pvpDefs[charDefs.owner].points = 0
				}
			
				pvpDefs[charDefs.owner].points++;
				pointTxt += `${charDefs.name} got a point for winning`
				
				if (charDefs.hp > 0) {
					if (charDefs.hp < 21) {
						pointTxt += ' & clutching out at low hp'
						pvpDefs[charDefs.owner].points++;
					}
				}

				if (server.toString() === "874635107300933682") {
					pvpDefs[charDefs.owner].points++
				}
				
				pointTxt += '.\n'
				
				if ((btl[server].pvpmode === 'randstats' || btl[server].pvpmode === 'charfuck') && charDefs.owner) {			
					var owner = client.users.fetch(charDefs.owner)
					owner.then(function(owner) {
						sendCharStats(owner, charDefs)
					})
				}
			}
		}
		
		for (const i in btl[server].allies.members) {
			const charDefs = btl[server].allies.members[i]
		
			if ((btl[server].pvpmode === 'randstats' || btl[server].pvpmode === 'charfuck') && charDefs.owner) {			
				var owner = client.users.fetch(charDefs.owner)
				owner.then(function(owner) {
					sendCharStats(owner, charDefs)
				})
			}
		}
		
		if (server.toString() === "874635107300933682")
			pointTxt += "**OFFICIAL SERVER BONUS** (+1)"
		
		fs.writeFileSync(servPath, JSON.stringify(servFile, null, '    '));
		
		var DiscordEmbed = new Discord.MessageEmbed()
			.setColor('#9c39ed')
			.setTitle(`Team ${btl[server].battleteam2} wins!`)
			.setDescription(`${pointTxt}`)

		client.channels.fetch(btl[server].battlechannel)
			.then(channel => channel.send({embeds: [DiscordEmbed]}))
			
		forceStop();
		turnFuncs.clearBTL(btl[server])
		fs.writeFile(dataPath+'/battle.json', JSON.stringify(btl, null, '    '), function (err) { if (err) throw err });
		return true
	}

    var charPath = dataPath+'/characters.json'
    var charRead = fs.readFileSync(charPath);
    var charFile = JSON.parse(charRead);
    for (const ally in btl[server].allies.members) {
		const charDefs = btl[server].allies.members[ally]
        const name = charDefs.name

		charFuncs.resetMimic(charDefs)

        if (charFile[name]) {
            charFile[name].hp = Math.round(charFile[name].maxhp)
			charFile[name].mp = Math.round(charFile[name].maxmp)
        }

		charFile[name].weapon = charDefs.weapon
		charFile[name].trust = charDefs.trust
    }

    var totalRings = Math.round((btl[server].parties[btl[server].battleteam].rings / 2) + (Math.random() * (btl[server].parties[btl[server].battleteam].rings / 3)))

    btl[server].parties[btl[server].battleteam].items = {}
    btl[server].parties[btl[server].battleteam].rings = btl[server].parties[btl[server].battleteam].rings - totalRings

    console.log('BattleStatus: Defeated by enemies');
    const discordEmbed = new Discord.MessageEmbed()
        .setColor('#d613cc')
        .setTitle(`Team ${btl[server].battleteam} was defeated...`)
		.setDescription(`The party dropped all of their items, and ${totalRings} ${servFile[server].currency}s.`)
    
	client.channels.fetch(btl[server].battlechannel)
        .then(channel => channel.send({embeds: [discordEmbed]}))

	playThemeType(server, "loss")
	setTimeout(function() {
		forceStop();
	}, 20000)

    turnFuncs.clearBTL(btl[server])
    fs.writeFile(dataPath+'/battle.json', JSON.stringify(btl, null, '    '), function (err) { if (err) throw err });
    fs.writeFile(charPath, JSON.stringify(charFile, null, '    '), function (err) {if (err) throw err});
}

// Running away
function runFromBattle(btl, server) {
    var charPath = dataPath+'/characters.json'
    var charRead = fs.readFileSync(charPath);
    var charFile = JSON.parse(charRead);
	
	var servPath = dataPath+'/Server Settings/server.json'
	var servRead = fs.readFileSync(servPath);
	var servFile = JSON.parse(servRead);

    // XP and Rings
    var totalXP = 0;
    var totalRings = Math.round(Math.random() * 100);
    for (const enemy in btl[server].enemies.members) {
		if (btl[server].enemies.members[enemy].hp <= 0) {
			const enmDefs = readEnm(btl[server].enemies.members[enemy].name)
			var enmXP = Math.round(parseInt(enmDefs.awardxp) * parseFloat(servFile[server].xprate))

			if (btl[server].enemies.members[enemy].golden)
				enmXP *= 3

			totalXP += enmXP
		}
    }

    // Reset Battle stuff and award XP
    for (const i in btl[server].allies.members) {
		const battlerDefs = btl[server].allies.members[i] // Character inbattle
		const charDefs = charFile[btl[server].allies.members[i].truename] // Character to transfer shit to
		
		// Reset Mimic
		charFuncs.resetMimic(battlerDefs)
		charFuncs.resetMimic(charDefs)
		
		// Trust Levels
		for (const k in btl[server].allies.members) {
			const allyDefs = btl[server].allies.members[k]
			charFuncs.trustUp(charDefs, allyDefs, 5, server)
		}

		// Award XP now
		charDefs.xp += totalXP;
		console.log(`BattleStatus: ${charDefs.name} got ${totalXP}XP. (${charDefs.xp}/${charDefs.maxxp}XP)`)
		client.channels.fetch(btl[server].battlechannel)
			.then(channel => channel.send(`${charDefs.name} got **${totalXP}EXP**!`))

		var shouldLevelUp = false;
		if (charDefs.xp >= charDefs.maxxp)
			shouldLevelUp = true;

		if (shouldLevelUp == true) {
			var levelCount = 0
			while (charDefs.xp >= charDefs.maxxp) {
				charFuncs.lvlUp(charDefs)
				levelCount++;
			}

			console.log(`BattleStatus: ${charDefs.name} levelled up ${levelCount} time(s)`)
			
			var lvlQuote = ""
			if (charDefs.lvlquote && charDefs.lvlquote.length > 0) {
				var possibleQuote = Math.round(Math.random() * (charDefs.lvlquote.length-1))
				lvlQuote = `*${charDefs.name}: "${charDefs.lvlquote[possibleQuote]}"*\n\n`
			}

			const DiscordEmbed = new Discord.MessageEmbed()
				.setColor('#b4eb34')
				.setTitle(`${charDefs.name} levelled up!`)
				.setDescription(`${lvlQuote}Level ${charDefs.level}\n${charDefs.maxhp}HP\n${charDefs.maxmp}MP\n\n${charDefs.atk}ATK\n${charDefs.mag}MAG\n${charDefs.prc}PRC\n${charDefs.end}END\n${charDefs.chr}CHR\n${charDefs.int}INT\n${charDefs.agl}AGL\n${charDefs.luk}LUK`)
			
			client.channels.fetch(btl[server].battlechannel)
				.then(channel => channel.send({embeds: [DiscordEmbed]}))
		}
		
		// Values to copy
		charDefs.weapon = battlerDefs.weapon
		charDefs.trust = battlerDefs.trust
    }

    // Drop Rings
    if (totalRings > 0)
        btl[server].parties[btl[server].battleteam].rings -= totalRings
	
	// Item Drops
	let additionalText = ``
	let itemList = ``
	for (const enemy in btl[server].enemies.members) {
		if (btl[server].enemies.members[enemy].hp > 0)
			continue;

		var lootPath = dataPath+'/Loot/lootTables.json'
		var lootRead = fs.readFileSync(lootPath);
		var lootFile = JSON.parse(lootRead);

		const enmDefs = readEnm(btl[server].enemies.members[enemy].name)

		if (enmDefs.loot || enmDefs.loot !== '' || enmDefs.loot !== undefined) {
			if (lootFile[enmDefs.loot]) {
				let itemInput = lootFile[enmDefs.loot].items
				let chanceInput = lootFile[enmDefs.loot].itemChances

				for (const loot in itemInput) {
					if (Math.random() * 100 < chanceInput[loot]) {
						console.log(`BattleStatus: Successfully gathered ${itemInput[loot]}`)
						itemList += `\n- ${itemInput[loot]} from ${btl[server].enemies.members[enemy].name}`
					}
				}
			}

			if (itemList.length > 1)
				additionalText = `\n\nThe enemies ran away with:${itemList}`;
		}
	}

    console.log('BattleStatus: Ran from battle');
    const dEmbed = new Discord.MessageEmbed()
        .setColor('#d613cc')
        .setTitle(`Team ${btl[server].battleteam} ran!`)
		.setDescription(`You ran away!\nThe party dropped ${totalRings} ${servFile[server].currency}s!${additionalText}`)
    client.channels.fetch(btl[server].battlechannel)
        .then(channel => channel.send({embeds: [dEmbed]}))

	forceStop();

	turnFuncs.clearBTL(btl[server])
    fs.writeFile(dataPath+'/battle.json', JSON.stringify(btl, null, '    '), function (err) {if (err) throw err});
    fs.writeFile(charPath, JSON.stringify(charFile, null, '    '), function (err) {if (err) throw err});
}

function doNegotiation(charDefs, enmDefs, i, channel, btl) {
	var negotiationTxt = enmDefs.negotiateOptions[i].action
	negotiationTxt = negotiationTxt.replace("PLAYER", charDefs.name)

	if (!enmDefs.negotiatePercent)
		enmDefs.negotiatePercent = 0

	enmDefs.negotiatePercent += enmDefs.negotiateOptions[i].convince

	var completelyConvinced = ''
	if (enmDefs.negotiatePercent >= 100) {
		const partyDefs = btl[channel.guild.id].parties[btl[channel.guild.id].battleteam]
		if (!partyDefs.negotiates)
			partyDefs.negotiates = {};

		if (!partyDefs.negotiateAllies)
			partyDefs.negotiateAllies = {};

		if (!partyDefs.negotiates[enmDefs.name])
			partyDefs.negotiates[enmDefs.name] = 1;
		else
			partyDefs.negotiates[enmDefs.name]++;

		completelyConvinced = `\n${enmDefs.name} is pacified. You let it go. **(${partyDefs.negotiates[enmDefs.name]}/${enmDefs.negotiateDefs.required} Negotiates)**`
		enmDefs.negotiated = true
	}

    const DiscordEmbed = new Discord.MessageEmbed()
        .setColor('#d613cc')
        .setTitle(`${charDefs.name} => ${enmDefs.name}`)
		.setDescription(`${negotiationTxt}\n*${enmDefs.name} is being pacified. **+${enmDefs.negotiateOptions[i].convince}%***${completelyConvinced}`)
	channel.send({embeds: [DiscordEmbed]})
}

function enemyMove(enmID, btl, channel) {
	var userDefs
	for (const i in btl[channel.guild.id].allies.members) {
		if (enmID == btl[channel.guild.id].allies.members[i].id) {
			userDefs = btl[channel.guild.id].allies.members[i]
			console.log('Ally Side Defs found')
		}
	}

	for (const i in btl[channel.guild.id].enemies.members) {
		if (enmID == btl[channel.guild.id].enemies.members[i].id) {
			userDefs = btl[channel.guild.id].enemies.members[i]
			console.log('Opposing Side Defs found')
		}
	}
	
	var enmName = userDefs.name
	
	var allySide = btl[channel.guild.id].allies.members
	var opposingSide = btl[channel.guild.id].enemies.members
	if (charFuncs.isOpposingSide(userDefs, btl[channel.guild.id])) {
		allySide = btl[channel.guild.id].enemies.members
		opposingSide = btl[channel.guild.id].allies.members
	}
	
	/*
	var possibleSkills = [];
	for (const i in userDefs.skills) {
		var skillDefs = readSkill(userDefs.skills[i])
		
		if (!skillDefs.passive && skillDefs.type != "passive") {
			if (userDefs.status === "ego") {
				if (skillDefs.type != "heal") {possibleSkills.push(userDefs.skills[i])}
			} else {
				possibleSkills.push(userDefs.skills[i])
			}
		}
	}
	
	var useskill;
	var skill;
	if (possibleSkills.length > 0) {
		skill = Math.round(Math.random() * (possibleSkills.length - 1))
		if (possibleSkills[skill]) {
			useskill = possibleSkills[skill]
		}
	} else {
		skill = userDefs.melee[0]
		useskill = userDefs.melee[0]
	}
	*/
	
	var thinkerFunc = enemyFuncs.thinkerFunc(userDefs, allySide, opposingSide)
	let useSkill = thinkerFunc[0], oppDefs = thinkerFunc[1], oppNum = thinkerFunc[2]

	const skillPath = dataPath+'/skills.json'
	const skillRead = fs.readFileSync(skillPath);
	const skillFile = JSON.parse(skillRead);

	var skillName = useSkill
	var skillDefs = skillFile[useSkill] ? skillFile[useSkill] : {name: userDefs.melee[0], pow: 30, type: userDefs.melee[1], crit: 20, atktype: "physical", melee: true}

	var itemPath = dataPath+'/items.json'
	var itemRead = fs.readFileSync(itemPath);
	var itemFile = JSON.parse(itemRead);

	if (userDefs.boss && userDefs.limitbreak) {
		if (userDefs.lb >= userDefs.limitbreak.cost) {
			if (Math.random() < 0.5) {
				console.log(`EnemyAI: ${enmName} is breaking their limits!`)
				const lbSkill = userDefs.limitbreak

				const skillDefs = {
					name: lbSkill.name,
					pow: lbSkill.pow,
					acc: 9999,
					crit: 0,
					type: "almighty",
					status: lbSkill.status ? lbSkill.status : "none",
					statuschance: lbSkill.statuschance ? lbSkill.statuschance : 0,
					atktype: "magic",
					hits: lbSkill.hits ? lbSkill.hits : null,
					target: lbSkill.target ? lbSkill.target : "one",
					drain: lbSkill.drain ? lbSkill.drain : null,
					affinitypow: lbSkill.affinitypow ? lbSkill.affinitypow : null,
					limitbreak: true
				};
				
				if (userDefs.atk > userDefs.mag)
					skillDefs.atktype = "physical";

   				var embedText = {}
				if (skillDefs.target === "allopposing") {
					var embedTexts = []
					for (const i in opposingSide) {
						var targDefs = opposingSide[i]

						if (userDefs.hp > 0) {
							var embedTxt = attackFuncs.attackFoe(enmName, targDefs.name, userDefs, targDefs, skillDefs, false, channel.guild.id, btl);
							embedTexts.push(embedTxt)
						}
						
						embedText = {
							targetText: `${userDefs.name} => All Opposing`,
							attackText: `${enmName} used ${skillDefs.name} on the opposing side!`,
							resultText: ''
						}
						
						for (const i in embedTexts)
							embedText.resultText += `\n${embedTexts[i].resultText}`;
					}
				} else
					embedText = attackFuncs.attackFoe(enmName, oppDefs.name, userDefs, oppDefs, skillDefs, false, channel.guild.id, btl);

				const DiscordEmbed = new Discord.MessageEmbed()
					.setColor('#fcba03')
					.setTitle(`${embedText.targetText}`)
					.setDescription(`**LIMIT BREAK!!!**\n${embedText.attackText}!\n${embedText.resultText}`)
					.setFooter(`${enmName}'s turn`);
				channel.send({embeds: [DiscordEmbed]});
				
				userDefs.lb = 0

				if (btl[channel.guild.id].battling == true) {
					btl = advanceTurn(btl, channel.guild.id)
				}

				fs.writeFileSync(dataPath+'/battle.json', JSON.stringify(btl, null, '    '));
				return
			}
		}
	}

	if (skillDefs.copyskill) {
		var possibleSkills = []
		for (const val in allySide) {
			if (allySide[val].id != userDefs.id) {
				for (const i in allySide[val].skills) {
					var skillDefs = skillFile[allySide[val].skills[i]]
					if (skillDefs.type != "heal" && (skillDefs.type != "status" && !skillDefs.buff) && skillFile[val].type != "passive") {
						possibleSkills.push(val)
					}
				}
			}
		}
		
		if (possibleSkills.length > 0) {
			var skillVal = possibleSkills[Math.round(Math.random() * (possibleSkills.length-1))]
			var copySkill = skillFile[skillVal]
			
			console.log(`Chosen skill ${skillVal} of ${possibleSkills.length-1} skills`)
			
			if (!copySkill.name) {copySkill.name = skillVal} 

			skillDefs = utilityFuncs.cloneObj(copySkill)
			skillDefs.name += ` (${skillName})`
			
			skillName = skillVal
		} else {
			skillDefs = skillFile["Lunge"]
			skillName = "Lunge"
		}
	}
	
	if (skillDefs.metronome) {
		var possibleSkill = []
		for (const val in skillFile) {
			if (skillFile[val].type != "heal" && (skillFile[val].type != "status" && !skillFile[val].buff) && skillFile[val].type != "passive") {
				possibleSkill.push(val)
			}
		}

		var skillVal = possibleSkill[Math.round(Math.random() * (possibleSkill.length-1))]
		var metronomeSkill = skillFile[skillVal]
		
		console.log(`Chosen skill ${skillVal} of ${possibleSkill.length-1} skills`)
		
		if (!metronomeSkill.name) {metronomeSkill.name = skillVal} 

		skillDefs = utilityFuncs.cloneObj(metronomeSkill)
		skillDefs.name += ` (${skillName})`
		
		skillName = skillVal
	}

	if (skillDefs.cost && skillDefs.costtype) {
		if (skillDefs.costtype === "hp") {
			if (userDefs.hp <= skillDefs.cost) {
				var embedText = attackFuncs.meleeFoe(userDefs, oppDefs, channel.guild.id, null, btl)
				const DiscordEmbed = new Discord.MessageEmbed()
					.setColor('#fcba03')
					.setTitle(`${embedText.targetText}`)
					.setDescription(`\n${embedText.attackText}!\n${embedText.resultText}`)
					.setFooter(`${enmName}'s turn`);
				channel.send({embeds: [DiscordEmbed]});
				
				fs.writeFileSync(dataPath+'/battle.json', JSON.stringify(btl, null, '    '));
	
				if (btl[channel.guild.id].battling == true) {
					setTimeout(function() {
						advanceTurn(btl, channel.guild.id)
					}, 1500)
				}
				
				return
			}
		} else if (skillDefs.costtype === "mp") {
			if (userDefs.mp < skillDefs.cost) {
				var embedText = attackFuncs.meleeFoe(userDefs, oppDefs, channel.guild.id, null, btl)
				const DiscordEmbed = new Discord.MessageEmbed()
					.setColor('#fcba03')
					.setTitle(`${embedText.targetText}`)
					.setDescription(`\n${embedText.attackText}!\n${embedText.resultText}`)
					.setFooter(`${enmName}'s turn`);
				channel.send({embeds: [DiscordEmbed]});
				
				fs.writeFileSync(dataPath+'/battle.json', JSON.stringify(btl, null, '    '));
	
				if (btl[channel.guild.id].battling == true) {
					setTimeout(function() {
						advanceTurn(btl, channel.guild.id)
					}, 1500)
				}
				
				return
			}
		} else if (skillDefs.costtype === "mppercent") {
			if (userDefs.mp < ((userDefs.maxmp / 100) * skillDefs.cost)) {
				var embedText = attackFuncs.meleeFoe(userDefs, oppDefs, channel.guild.id, null, btl)
				const DiscordEmbed = new Discord.MessageEmbed()
					.setColor('#fcba03')
					.setTitle(`${embedText.targetText}`)
					.setDescription(`\n${embedText.attackText}!\n${embedText.resultText}`)
					.setFooter(`${enmName}'s turn`);
				channel.send({embeds: [DiscordEmbed]});            
				
				fs.writeFileSync(dataPath+'/battle.json', JSON.stringify(btl, null, '    '));
	
				if (btl[channel.guild.id].battling == true) {
					setTimeout(function() {
						advanceTurn(btl, channel.guild.id)
					}, 1500)
				}
				
				return
			}
		}
	}

	// Heal Skills target allies
	if (skillDefs.type == "heal") {
		if (skillDefs.healall || skillDefs.target && skillDefs.target === "allallies") {
			if (skillDefs.fullheal) {
				for (const i in allySide) {
					var partyDef = allySide[i]
					if (partyDef.hp > 0) {
						partyDef.hp = partyDef.maxhp
					}
				}

				const DiscordEmbed = new Discord.MessageEmbed()
					.setColor('#e36b2b')
					.setTitle(`${enmName} => Party`)
					.setDescription(`${enmName} used ${skillName}!\nThe Party's HP was fully restored.`)
					.setFooter(`${enmName}'s turn`);
				channel.send({embeds: [DiscordEmbed]});
			} else if (skillDefs.statusheal) {
				for (const i in allySide) {
					var partyDef = allySide[i]
					if (partyDef.hp > 0) {
						partyDef.status = "none";
						partyDef.statusturns = 0;
					}
				}

				const DiscordEmbed = new Discord.MessageEmbed()
					.setColor('#e36b2b')
					.setTitle(`${enmName} => Party`)
					.setDescription(`${enmName} used ${skillName}!\nThe Party was cured of their status ailments.`)
					.setFooter(`${enmName}'s turn`);
				channel.send({embeds: [DiscordEmbed]});
			} else if (skillDefs.healmp) {
				var txt = ``
				for (const i in allySide) {
					var partyDef = allySide[i]
					partyDef.mp = Math.min(partyDef.maxmp, partyDef.mp + skillDefs.pow)
					txt = txt + `\n${partyDef.name}'s MP was restored by ${skillDefs.pow}. (${partyDef.mp}/${partyDef.maxmp}MP)`
				}

				const DiscordEmbed = new Discord.MessageEmbed()
					.setColor('#e36b2b')
					.setTitle(`${enmName} => Party`)
					.setDescription(`${enmName} used ${skillName}!\nThe Party's MP was restored by ${skillDefs.pow}\n${txt}`)
					.setFooter(`${enmName}'s turn`);
				channel.send({embeds: [DiscordEmbed]});
			} else {
				var txt = ``;
				for (const i in allySide) {
					var partyDef = allySide[i]
					if (partyDef.hp > 0) {
						partyDef.hp = Math.min(partyDef.maxhp, partyDef.hp + skillDefs.pow)
						txt = txt + `\n${partyDef.name}'s HP was restored by ${skillDefs.pow}. (${partyDef.hp}/${partyDef.maxhp}HP)`
					}
				}

				const DiscordEmbed = new Discord.MessageEmbed()
					.setColor('#e36b2b')
					.setTitle(`${enmName} => Party`)
					.setDescription(`${enmName} used ${skillName}!\nThe Party's HP was restored by ${skillDefs.pow}\n${txt}`)
					.setFooter(`${enmName}'s turn`);
				channel.send({embeds: [DiscordEmbed]});
			}
		} else {
			var allyDefs = userDefs
			var allyName = enmName

			if (skillDefs.revive) {
				for (const i in allySide) {
					if (allySide[i].hp <= 0) {
						allyDefs = allySide[i]
					}
				}

				allyDefs.hp = Math.floor(allyDefs.maxhp / skillDefs.revive)

				const DiscordEmbed = new Discord.MessageEmbed()
					.setColor('#e36b2b')
					.setTitle(`${enmName} => ${allyName}`)
					.setDescription(`${enmName} used ${skillName}!\n${allyName} was revived by ${enmName}!`)
					.setFooter(`${enmName}'s turn`);
				channel.send({embeds: [DiscordEmbed]});
			} else if (skillDefs.fullheal) {
				allyDefs.hp = allyDefs.maxhp

				const DiscordEmbed = new Discord.MessageEmbed()
					.setColor('#e36b2b')
					.setTitle(`${enmName} => ${allyName}`)
					.setDescription(`${enmName} used ${skillName}!\n${allyName}'s HP was fully restored!`)
					.setFooter(`${enmName}'s turn`);
				channel.send({embeds: [DiscordEmbed]});
			} else if (skillDefs.statusheal) {
				allyDefs.status = "none";
				allyDefs.statusturns = 0;

				const DiscordEmbed = new Discord.MessageEmbed()
					.setColor('#e36b2b')
					.setTitle(`${enmName} => ${allyName}`)
					.setDescription(`${enmName} used ${skillName}!\n${allyName} was cured of their status!`)
					.setFooter(`${enmName}'s turn`);
				channel.send({embeds: [DiscordEmbed]});
			} else if (skillDefs.healmp) {
				allyDefs.mp = Math.min(allyDefs.maxmp, allyDefs.mp + skillDefs.pow)

				const DiscordEmbed = new Discord.MessageEmbed()
					.setColor('#e36b2b')
					.setTitle(`${enmName} => ${allyName}`)
					.setDescription(`${enmName} used ${skillName}!\n${allyName}'s MP was restored by ${skillDefs.pow}!`)
					.setFooter(`${enmName}'s turn`);
				channel.send({embeds: [DiscordEmbed]});
			} else {
				allyDefs.hp = Math.min(allyDefs.maxhp, allyDefs.hp + skillDefs.pow)

				const DiscordEmbed = new Discord.MessageEmbed()
					.setColor('#e36b2b')
					.setTitle(`${enmName} => ${allyName}`)
					.setDescription(`${enmName} used ${skillName}!\n${allyName}'s HP was restored by ${skillDefs.pow}!`)
					.setFooter(`${enmName}'s turn`);
				channel.send({embeds: [DiscordEmbed]});
			}
		}
	} else if (skillDefs.type === "status") {
		if (skillDefs.shield) {
			userDefs.shield = skillName;

			const DiscordEmbed = new Discord.MessageEmbed()
				.setColor('#e36b2b')
				.setTitle(`${enmName} => Self`)
				.setDescription(`${enmName} used ${skillName}!\n${enmName} is protected from attacks with a ${skillDefs.shield}!`)
			channel.send({embeds: [DiscordEmbed]})
		} else if (skillDefs.makarakarn) {
			userDefs.makarakarn = skillName;

			const DiscordEmbed = new Discord.MessageEmbed()
				.setColor('#e36b2b')
				.setTitle(`${enmName} => Self`)
				.setDescription(`${enmName} used ${skillName}!\n${enmName} is protected from magic attacks with ${skillName}!`)
			channel.send({embeds: [DiscordEmbed]})
		} else if (skillDefs.tetrakarn) {
			userDefs.tetrakarn = skillName;

			const DiscordEmbed = new Discord.MessageEmbed()
				.setColor('#e36b2b')
				.setTitle(`${enmName} => Self`)
				.setDescription(`${enmName} used ${skillName}!\n${enmName} is protected from physical attacks with ${skillName}!`)
			channel.send({embeds: [DiscordEmbed]})
		} else if (skillDefs.trap) {
			userDefs.trapType = {
				name: skillName,
				effect: skillDefs.effect
			}

			const DiscordEmbed = new Discord.MessageEmbed()
				.setColor('#e36b2b')
				.setTitle(`${enmName} => Self`)
				.setDescription(`${enmName} used ${skillName}!\n${enmName} is preparing to trap a foe with ${skillName}!`)
			channel.send({embeds: [DiscordEmbed]})
		} else if (skillDefs.orgiamode) {
			userDefs.orgiaMode = skillDefs.orgiamode
			userDefs.atk *= 2
			userDefs.mag *= 2
			userDefs.end /= 2

			const DiscordEmbed = new Discord.MessageEmbed()
				.setColor('#e36b2b')
				.setTitle(`${enmName} => Self`)
				.setDescription(`${enmName} used ${skillName}!\n${enmName}'s ATK and MAG stats are doubled, but their END stat is halved.!`)
			channel.send({embeds: [DiscordEmbed]})
		} else if (skillDefs.status && skillDefs.statuschance) {
			if (skillDefs.statuschance > 0) {
				var targChance = (skillDefs.statuschance + (userDefs.chr - oppDefs.luk)) / 100;
				var chance = Math.random();

				var finaltext = `${enmName} used ${skillName} on ${oppDefs.name}!`;
				if (chance > targChance || skillDefs.statuschance >= 100) {
					finaltext += ' ' + attackFuncs.inflictStatus(oppDefs, skillDefs)
				} else {
					finaltext = finaltext + " But they dodged it!"

					if (userDefs.missquote && userDefs.missquote.length > 0) {
						var possibleQuote = Math.round(Math.random() * (userDefs.missquote.length-1))
						finaltext += `\n*${enmName}: "${userDefs.missquote[possibleQuote]}"*`
					}
					if (oppDefs.dodgequote && oppDefs.dodgequote.length > 0) {
						var possibleQuote = Math.round(Math.random() * (oppDefs.dodgequote.length-1))
						finaltext += `\n*${oppDefs.name}: "${oppDefs.dodgequote[possibleQuote]}"*`
					}
				}

				const DiscordEmbed = new Discord.MessageEmbed()
					.setColor('#e36b2b')
					.setTitle(`${enmName} => ${oppDefs.name}`)
					.setDescription(`${finaltext}`)
					.setFooter(`${enmName}'s turn`);
				channel.send({embeds: [DiscordEmbed]})
			} else {
				const DiscordEmbed = new Discord.MessageEmbed()
					.setColor('#e36b2b')
					.setTitle(`${enmName} => ${charName}`)
					.setDescription(`${enmName} tried to use ${skillName} on ${oppDefs.name}, but it failed!\n(Error! There is no "statuschance" defined for this skill.)`)
					.setFooter(`${enmName}'s turn`);
				channel.send({embeds: [DiscordEmbed]})
			}
		} else if (skillDefs.buff) {
			if (skillDefs.target == "allallies") {
				for (const i in allySide) {
					var charDefs = allySide[i]
					if (skillDefs.buff == "all") {
						charDefs.buffs.atk = Math.min(3, charDefs.buffs.atk+1)
						charDefs.buffs.mag = Math.min(3, charDefs.buffs.mag+1)
						charDefs.buffs.end = Math.min(3, charDefs.buffs.end+1)
						charDefs.buffs.prc = Math.min(3, charDefs.buffs.prc+1)
						charDefs.buffs.agl = Math.min(3, charDefs.buffs.agl+1)
					} else {
						charDefs.buffs[skillDefs.buff] = Math.min(3, charDefs.buffs[skillDefs.buff]+1)
					}
				}
				
				const DiscordEmbed = new Discord.MessageEmbed()
					.setColor('#e36b2b')
					.setTitle(`${enmName} => All Allies`)
					.setDescription(`${enmName} used ${skillDefs.name}!\n${enmName} buffed their allies' ${(skillDefs.buff == "all") ? "Stats" : skillDefs.buff.toUpperCase()}!`)
					.setFooter(`${enmName}'s turn`);
				channel.send({embeds: [DiscordEmbed]})
			} else {
				if (skillDefs.buff == "all") {
					userDefs.buffs.atk = Math.min(3, userDefs.buffs.atk+1)
					userDefs.buffs.mag = Math.min(3, userDefs.buffs.mag+1)
					userDefs.buffs.end = Math.min(3, userDefs.buffs.end+1)
					userDefs.buffs.prc = Math.min(3, userDefs.buffs.prc+1)
					userDefs.buffs.agl = Math.min(3, userDefs.buffs.agl+1)
				} else {
					userDefs.buffs[skillDefs.buff] = Math.min(3, userDefs.buffs[skillDefs.buff]+1)
				}
				
				const DiscordEmbed = new Discord.MessageEmbed()
					.setColor('#e36b2b')
					.setTitle(`${enmName} => Self`)
					.setDescription(`${enmName} used ${skillDefs.name}!\n${enmName} buffed their own ${(skillDefs.buff == "all") ? "Stats" : skillDefs.buff.toUpperCase()}!`)
					.setFooter(`${enmName}'s turn`);
				channel.send({embeds: [DiscordEmbed]})
			}
		} else if (skillDefs.debuff) {
			if (skillDefs.target == "allopposing") {
				for (const i in opposingSide) {
					var charDefs = opposingSide[i]
					if (skillDefs.debuff == "all") {
						charDefs.buffs.atk = Math.max(-3, charDefs.buffs.atk-1)
						charDefs.buffs.mag = Math.max(-3, charDefs.buffs.mag-1)
						charDefs.buffs.end = Math.max(-3, charDefs.buffs.end-1)
						charDefs.buffs.prc = Math.max(-3, charDefs.buffs.prc-1)
						charDefs.buffs.agl = Math.max(-3, charDefs.buffs.agl-1)
					} else {
						charDefs.buffs[skillDefs.debuff] = Math.max(-3, charDefs.buffs[skillDefs.debuff]-1)
					}
				}
				
				const DiscordEmbed = new Discord.MessageEmbed()
					.setColor('#e36b2b')
					.setTitle(`${enmName} => All Opposing`)
					.setDescription(`${enmName} used ${skillDefs.name}!\n${enmName} debuffed their opposing side's ${(skillDefs.debuff == "all") ? "Stats" : skillDefs.debuff.toUpperCase()}!`)
					.setFooter(`${enmName}'s turn`);
				channel.send({embeds: [DiscordEmbed]})
			} else {
				if (skillDefs.debuff == "all") {
					oppDefs.buffs.atk = Math.max(-3, oppDefs.buffs.atk-1)
					oppDefs.buffs.mag = Math.max(-3, oppDefs.buffs.mag-1)
					oppDefs.buffs.end = Math.max(-3, oppDefs.buffs.end-1)
					oppDefs.buffs.prc = Math.max(-3, oppDefs.buffs.prc-1)
					oppDefs.buffs.agl = Math.max(-3, oppDefs.buffs.agl-1)
				} else {
					oppDefs.buffs[skillDefs.debuff] = Math.max(-3, oppDefs.buffs[skillDefs.debuff]-1)
				}
				
				const DiscordEmbed = new Discord.MessageEmbed()
					.setColor('#e36b2b')
					.setTitle(`${enmName} => ${oppDefs.name}`)
					.setDescription(`${enmName} used ${skillDefs.name}!\n${enmName} debuffed the ${oppDefs.name}'s ${(skillDefs.debuff == "all") ? "Stats" : skillDefs.debuff.toUpperCase()}`)
					.setFooter(`${enmName}'s turn`);
				channel.send({embeds: [DiscordEmbed]})
			}
		} else if (skillDefs.futuresight) {
			oppDefs.futureSightSkill = skillDefs.futuresight
			oppDefs.futureSightSkill.user = userDefs

			const DiscordEmbed = new Discord.MessageEmbed()
				.setColor('#e36b2b')
				.setTitle(`${enmName} => ${oppDefs.name}`)
				.setDescription(`${enmName} used ${skillDefs.name}!\n${oppDefs.name} is going to be affected by ${enmName}'s future attack.`)
			channel.send({embeds: [DiscordEmbed]})
		} else if (skillDefs.clone) {
			var cloneDefs = utilityFuncs.cloneObj(charDefs)
			cloneDefs.hp = 100
			cloneDefs.maxhp = 100
			cloneDefs.mp = 80
			cloneDefs.maxmp = 80
			cloneDefs.npc = true
			
			var battlerID = 0
			for (const i in allySide) {
				battlerID++;
			}
			for (const i in opposingSide) {
				battlerID++;
			}
			
			cloneDefs.id = battlerID
			cloneDefs.clone = true
			delete cloneDefs.xp
			delete cloneDefs.maxxp
			
			allySide.push(cloneDefs)
			const DiscordEmbed = new Discord.MessageEmbed()
				.setColor('#e36b2b')
				.setTitle(`${charName} => Self`)
				.setDescription(`${charName} cloned themselves!`)
			channel.send({embeds: [DiscordEmbed]})
		} else if (skillDefs.weather) {
			var weatherMessage = {
				rain: 'It begun to rain!',
				thunder: 'Thunder begun, coming out of nowhere!',
				sunlight: 'The sun shone brightly.',
				windy: 'It just got very windy!',
				sandstorm: 'A sandstorm is brimming.',
				hail: 'Hail begins falling.'
			}

			if (weatherMessage[skillDefs.weather]) {
				btl[channel.guild.id].changeweather = {
					weather: skillDefs.weather,
					weathertime: skillDefs.turns ? skillDefs.turns : 3,
				}

				const DiscordEmbed = new Discord.MessageEmbed()
					.setColor('#e36b2b')
					.setTitle(`${enmName} => Battlefield`)
					.setDescription(`${enmName} used ${skillName}!\n${weatherMessage[skillDefs.weather]}`)
				channel.send({embeds: [DiscordEmbed]})
			} else {
				const DiscordEmbed = new Discord.MessageEmbed()
					.setColor('#e36b2b')
					.setTitle(`${enmName} => Battlefield`)
					.setDescription(`${enmName} used ${skillName}!\nBut it failed.`)
				channel.send({embeds: [DiscordEmbed]})
			}
		} else if (skillDefs.terrain) {
			btl[channel.guild.id].changeterrain = {
				terrain: skillDefs.terrain,
				terraintime: skillDefs.turns ? skillDefs.turns : 3,
			}

			const DiscordEmbed = new Discord.MessageEmbed()
				.setColor('#e36b2b')
				.setTitle(`${enmName} => Battlefield`)
				.setDescription(`${enmName} used ${skillName}!\n*${skillDefs.terrain.toUpperCase()}* terrain has begun!`)
			channel.send({embeds: [DiscordEmbed]})
		}
	} else {
		var DiscordEmbed = attackFuncs.attackWithSkill(userDefs, oppNum, allySide, opposingSide, btl, skillDefs, channel.guild.id)
		channel.send({embeds: [DiscordEmbed]})
	}

	if (skillDefs.cost && skillDefs.costtype) {
		if (skillDefs.costtype === "hp" && !userDefs.boss && !userDefs.miniboss) {
			userDefs.hp = Math.max(1, userDefs.hp - skillDefs.cost)
		} else if (skillDefs.costtype === "hppercent" && !userDefs.boss && !userDefs.miniboss) {
			userDefs.hp = Math.round(Math.max(1, userDefs.hp - ((userDefs.maxhp / 100) * skillDefs.cost)))
		} else if (skillDefs.costtype === "mp") {
			userDefs.mp = Math.max(0, userDefs.mp - skillDefs.cost)
		} else if (skillDefs.costtype === "mppercent") {
			userDefs.mp = Math.round(Math.max(0, userDefs.mp - ((userDefs.maxmp / 100) * skillDefs.cost)))
		}
	}

	fs.writeFileSync(dataPath+'/battle.json', JSON.stringify(btl, null, '    '));
	if (btl[channel.guild.id].battling == true) {
		setTimeout(function() {
			advanceTurn(btl, channel.guild.id)
		}, 2500)
	}
}

//Start up the bot
const statusList = [
    "rpg!help",
    "rpg!startenemybattle",
    "rpg!registerskill",
	"rpg!registerchar",
	"rpg!startcolosseum",
	"rpg!startpvp",
    "Screaming",
    "Enjoying using me?",
    "peepeepoopoo.",
    "zzzzzzzzzzzzzzzzzzzzzzzzzzzz",
    '"Submissive Ass" - Verwex',
    'I ran out of quotes... Reloading...',
    "Gettin' Freaky on a Friday Night Yeah",
    '@everyone. Amazing.',
    "Imagine being a person, couldn't be me",
    "Burning down the Forest.",
    '"GOD IS TOO POWERFUL" - DJ Prower',
    "Simply don't get hit.",
    "I'm out of breath here...",
    "Bulbasaur.",
    "cries in a corner",
	"Women are real.",
	"What is 2021 humour anymore?",
	"Just try me.",
	"I suck.",
	"you like a fool."
];

client.once('ready', () => {
    console.log('Bloom Battler is now online!\nThe "Data" file is for json info.\nThe "Packages" file is for extra functions.\nEnjoy your time with the bot!');

    setInterval(() => {
        const index = Math.floor(Math.random() * (statusList.length - 1) + 1);
        client.user.setActivity(statusList[index], { type: 'PLAYING' });
    }, 10000);

    setInterval(() => {
        var relicPath = dataPath+'/RelicSearch/relicData.json'
        var relicRead = fs.readFileSync(relicPath);
        var relicData = JSON.parse(relicRead);
        for (const player in relicData) {
            relicData[player].findcooldown = relicData[player].findcooldown - 1

            if (relicData[player].findcooldown <= 0) {
                relicData[player].rolls = 10;
                relicData[player].findcooldown = 60;
                relicData[player].canfind = true;
            }
        }

        fs.writeFile(relicPath, JSON.stringify(relicData, null, '    '), function (err) {
            if (err) throw err;
        });
    }, 60000);

    setInterval(() => {
        var relicPath = dataPath+'/RelicSearch/relicFight.json'
        var relicRead = fs.readFileSync(relicPath);
        var relicFight = JSON.parse(relicRead);

        for (const key in relicFight) {
            if (relicFight[key].fighting == true) {
				if (relicFight[key].finish)
					delete relicFight[key];
				else {
					var readyMove = 0;
					for (const i in relicFight[key].fighters) {
						if (relicFight[key].fighters[i].move || relicFight[key].fighters[i].bot) {
							readyMove += 1
						}
					}

					if (readyMove >= relicFight[key].fighters.length) {
						var txt = ``

						const moves = ["phys", "mag", "guard"]
						for (const i in relicFight[key].fighters) {
							if (relicFight[key].fighters[i] && relicFight[key].fighters[i].bot)
								relicFight[key].fighters[i].move = moves[Math.round(Math.random() * (moves.length - 1))];
						}

						for (const i in relicFight[key].fighters) {
							if (relicFight[key].fighters[i].move === "guard") {
								relicFight[key].fighters[i].guard = true;
								txt += `🛡 ${relicFight[key].fighters[i].name} **guards**!\n`
							}
						}

						txt += "\n" + RF.atkState(relicFight, key)

						if (txt === ``) 
							txt = 'No actions...?';

						var fighters = ``;
						for (const i in relicFight[key].fighters) {
							fighters = fighters + `${relicFight[key].fighters[i].name} ❤${Math.max(0, relicFight[key].fighters[i].hp)}\n`;
							relicFight[key].fighters[i].guard = null;
						}

						// Events
						var eventTable = [
							{
								txt: 'A group of small gremins swarm in',
								func: function(rb) {
									for (let i = 0; i < 3; i++) {
										var charDefs = RF.genChar('Gremlin', null, 6, 6, 6)
										charDefs.hp = 5
										rb.fighters.push(charDefs)
									}
								}
							},

							{
								txt: 'Poison clouds drift in, damaging the fighters',
								func: function(rb) {
									for (const i in rb.fighters) {
										txt += `\n${rb.fighters[i].name} (☁10)`;
										rb.fighters[i].hp -= 10;
									}
								}
							},

							{
								txt: 'Everyone feels revitalised and had 3 defense boosts.',
								func: function(rb) {
									for (const i in rb.fighters) {
										txt += `\n${rb.fighters[i].name} (🛡^^^)`;
										rb.fighters[i].buffs.def += 3;
									}
								}
							},

							{
								txt: 'Everyone breathes deeply and restores 30HP.',
								func: function(rb) {
									for (const i in rb.fighters) {
										txt += `\n${rb.fighters[i].name} (❤30)`;
										rb.fighters[i].hp += 30;
									}
								}
							},

							{
								txt: 'An earthquake strikes the arena!',
								func: function(rb) {
									for (const i in rb.fighters) {
										txt += `\n${rb.fighters[i].name} (💫15)`;
										rb.fighters[i].hp -= 15;
									}
								}
							},

							{
								txt: 'A tidal wave washes over the arena.',
								func: function(rb) {
									for (const i in rb.fighters) {
										txt += `\n${rb.fighters[i].name} (💧7) (🛡vv)`;
										rb.fighters[i].hp -= 7;
										rb.fighters[i].buffs.def -= 2;
									}
								}
							},

							{
								txt: "It's raining!",
								func: function(rb) {
									for (const i in rb.fighters) {
										txt += `\n${rb.fighters[i].name} (👊v) (✨v) (🛡v)`;
										rb.fighters[i].buffs.atk--;
										rb.fighters[i].buffs.mag--;
										rb.fighters[i].buffs.def--;
									}
								}
							},
						]

						if (Math.random() < 0.2) {
							var eventVal = eventTable[utilityFuncs.randNum(eventTable.length-1)]

							txt += eventVal.txt
							eventVal.func(relicFight[key])
						}

						if (fighters === ``) 
							fighters = 'No fighters...?';

						var newFighterArray = []
						for (const i in relicFight[key].fighters) {
							if (relicFight[key].fighters[i].hp > 0)
								newFighterArray.push(relicFight[key].fighters[i]);
						}

						var result = 0; // 0 - continue, 1 - win, 2 - tie
						if (newFighterArray.length == 1)
							result = 1;
						else if (newFighterArray.length <= 0)
							result = 2;

						relicFight[key].fighters = newFighterArray

						var embed = new Discord.MessageEmbed()
							.setColor('#c2907e')
							.setTitle('Relic Battle!')
							.setDescription(`${txt}`)
							.addFields(
								{ name: `--------------------------------------`, value: `${fighters}`, inline: true },
							)
							.setFooter('Relic Battle!');

						client.channels.fetch(relicFight[key].battlechannel)
							.then(channel => channel.messages.fetch(relicFight[key].message)
								.then(message => message.edit({embeds: [embed]})))

						if (result > 0) {
							if (result == 1) {
								client.channels.fetch(relicFight[key].battlechannel)
									.then(channel => channel.send(`🏆 ${newFighterArray[0].name} is the last survivor! **They have won!** 🏆`))
							} else if (result == 2) {
								client.channels.fetch(relicFight[key].battlechannel)
									.then(channel => channel.send(`❓ **It's a tie...** ❓`))
							}
							
							relicFight[key].finish = true
						}
					}
                }

				fs.writeFileSync(relicPath, JSON.stringify(relicFight, null, '    '));
            }
        }
    }, 2000);
})

//Commands
client.on('messageCreate', async message => {
    // DMs.
    if (message.channel.type === 'dm') {
        if (doGSM === true) {
            const gsmPath = dataPath+'/guessMyWord.json'
            const gsmRead = fs.readFileSync(gsmPath);
            const gsm = JSON.parse(gsmRead);

            if (message.author.id === gsm.init.id && gsm.words && gsm.setword == null) {
                var gotWord = false;
                var i = 0;
                for (i = 0; i < gsm.words.length; i++) {
                    if (gsm.words[i].toLowerCase() === message.content.toLowerCase()) {
                        gsm.setword = gsm.words[i]
                        gotWord = true
						
						message.author.send(`You have chosen your word, it is now **${gsm.init.username}**'s turn to guess.`)

                        let userget = client.users.fetch(gsm.challenger.id);
                        userget.then(function(user) {
                            user.send(`${gsm.init.username} has chosen a word. Choose from:`)
                            user.send(`**${gsm.words[0]}**`)
                            user.send(`**${gsm.words[1]}**`)
                            user.send(`**${gsm.words[2]}**`)
                        });
                    }
                }

                if (gotWord == false)
                    message.author.send("Invalid Word.");
            } else if (message.author.id === gsm.challenger.id && gsm.words && gsm.setword) {
                if (gsm.setword.toLowerCase() === message.content.toLowerCase()) {
                    let userget = client.users.fetch(gsm.challenger.id);
                    userget.then(function(user) {
                        user.send(`You beat **${gsm.init.username}**! Well done!`)
                    });


                    let userget2 = client.users.fetch(gsm.init.id);
                    userget2.then(function(user) {
                        user.send(`**${gsm.challenger.username}** guessed your word! Too bad!`)
                    });
                } else {
                    let userget = client.users.fetch(gsm.challenger.id);
                    userget.then(function(user) {
                        user.send(`You lost to **${gsm.init.username}**! Too bad! The word was __**${gsm.setword}**__`)
                    });


                    let userget2 = client.users.fetch(gsm.init.id);
                    userget2.then(function (user) {
                        user.send(`**${gsm.challenger.username}** failed! Well done! They chose __*${message.content}*__`)
                    });
                }

                doGSM = false
            }

            fs.writeFileSync(gsmPath, JSON.stringify(gsm, null, '    '));
        }

        const unoPath = dataPath+'/Uno/unoGames.json'
        const unoRead = fs.readFileSync(unoPath);
        const uno = JSON.parse(unoRead);
        for (const i in uno) {
            if (uno[i] && uno[i].playing) {
                for (const j in uno[i].players) {
                    if (j == message.author.id) {
                        var msg = message.content.toLowerCase().split(/ +/)

                        var card = ["red", "0"]
                        if (msg.includes("red")) {
                            card[0] = "red"
                        } else if (msg.includes("yellow")) {
                            card[0] = "yellow"
                        } else if (msg.includes("blue")) {
                            card[0] = "blue"
                        } else if (msg.includes("green")) {
                            card[0] = "green"
                        } else {
                            card[0] = "black"
                        }

                        var k;
                        var chosen = false;
                        for (k = 0; k <= 9; k++) {
                            if (msg.includes(k.toString())) {
                                card[1] = k.toString();
                                chosen = true;
                            }
                        }

                        if (chosen == false) {
                            if (msg.includes("reverse")) {
                                card[1] = "reverse";
                            } else if (msg.includes("skip")) {
                                card[1] = "skip";
                            } else if (msg.includes("wild")) {
                                card[1] = "wild";
                            } else if (msg.includes("+2")) {
                                card[1] = "+2";
                            } else if (msg.includes("+4")) {
                                card[1] = "+4";
                            }
                        }

                        if (uno[i].players[j].cards) {
                            for (const k in uno[i].players[j].cards) {
                                if (uno[i].players[j].cards[k] == card) {
                                    if ((card[0] == "black") || (uno[i].lastcard[0] == card[0])) {
                                        uno[i].lastcard = card

                                        if (card[0] == "black") {
                                            client.channels.fetch(uno[i].channel)
                                                .then(channel => channel.send(`${uno[i].players.name} has played a ${card[1]}!`))

                                            uno[i].danger = card[1]
                                        } else {
                                            client.channels.fetch(uno[i].channel)
                                                .then(channel => channel.send(`${uno[i].players.name} has played a ${card[0]} ${card[1]}!`))

                                            if (card[1] == "+2" || card[1] == "skip" || card[1] == "reverse")
                                                uno[i].danger = card[1];
                                        }

                                        var newTable = []
                                        if (uno[i].players[j].cards[k] != card)
                                            newTable.push(uno[i].players[j].cards[k]);

                                        uno[i].players[j].cards[k] = newTable

                                        if (newTable.length == 1) {
                                            if (!msg.includes("uno")) {
                                                drawCard(uno[i].players[j])
                                                drawCard(uno[i].players[j])

                                                client.channels.fetch(uno[i].channel)
                                                    .then(channel => channel.send(`${uno[i].players.name} failed to say Uno! They picked up two cards.`))
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
	}

    // Now normal commands.
    var servPath = dataPath+'/Server Settings/server.json'
    var servRead = fs.readFileSync(servPath);
    var servFile = JSON.parse(servRead);

    if (message && message.guild && message.guild.id) {
        if (!servFile[message.guild.id]) {
            servFile[message.guild.id] = {
                prefix: "rpg!",		
				limitbreaks: false,		
				showtimes: false,
				onemores: false,
				currency: "Bloom Token",
				xprate: 1,
				damageFormula: "persona",
				pvpstuff: {
					none: {},
					metronome: {},
					randskills: {},
					randstats: {},
					charfuck: {}
				},
				themes: {
					battle: [],
					advantage: [],
					disadvantage: [],
					bossfight: [],
					miniboss: [],
					strongfoe: [],
					finalboss: [],
					colosseum: [],
					colosseumstrong: [],
					pvp: [],
					victory: [],
					colosseumvictory: [],
					loss: []
				},
				banned: []
            }

            fs.writeFileSync(servPath, JSON.stringify(servFile, null, '    '));
        }
    }

    const prefix = servFile[message.guild.id].prefix
	
	if (message.mentions.users.first()) {
		var bloomBattler = message.mentions.users.first();

		if (bloomBattler.id == "776480348757557308") {
			var content = message.content.toLowerCase()

			if (content.includes("hello") || content.includes("hi") || content.includes("hewwo") || content.includes("heya")) {
				message.channel.send('Hiiii! :)');
				return false;
			} else if (content.includes("privet")) { // russian
				message.channel.send("Privet!!! Ya plokho znayu russkiy, no starayus', da?");
				return false;
			} else if (content.includes("cześć") || content.includes("czesc") || content.includes("siema")) { // polish
				message.channel.send("Czesc!!! Nie znam zadnego polskiego, ale przynajmniej probuje, prawda?");
				return false;
			} else if (content.includes("konnichiwa") || content.includes("kon'nichiwa") || content.includes("konichiwa")) { // japanese
				message.channel.send("Kon'nichiwa! Nihongo wa amari yoku wakarimasenga, sukunakutomo yatte mimasu yo ne? Watashi wa itsuka manabu koto ga dekita to omoimasu.");
				return false;
			} else if (content.includes("hola")) { // spanish
				message.channel.send("Hola, no hablo español, pero algún día podría aprender.")
				return false;
			} else if (content.includes("how") && content.includes("are") && content.includes("you")) {
				message.channel.send("I'm doing great!");
				return false;
			} else if ((content.includes("i") && content.includes("love") && content.includes("you")) || (content.includes("will") && content.includes("you") && content.includes("marry"))) {
				message.channel.send("I... I... I've never had anyone propose to me before... uhm...\nhttps://c.tenor.com/VrfSZUjiWn4AAAAC/shy-anime.gif");
				return false;
			} else if (content.includes("lettuce")) {
				message.channel.send('https://media2.giphy.com/media/uj9l4ULaFx7erdZvei/200.gif');
				return false;
			}
		}
	}

    if (!message.content.toLowerCase().startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();

    //////////
    // Help //
    //////////
    if (command === 'help') {
		const arg = message.content.slice(prefix.length).trim().split(/ +/);
		const helpCommand = arg[1] ? arg[1].toLowerCase() : ''
		
		var DiscordEmbed;
		switch(helpCommand) {
			case 'fun':
				DiscordEmbed = new Discord.MessageEmbed()
					.setColor('#0099ff')
					.setTitle('These are just for fun!')
					.addFields(
						{ name: `${prefix}ping`, value: 'Pong.', inline: true },
						{ name: `${prefix}diceroll`, value: '(Args <Amount> <Sides>)\nRolls the specified amount of dice with the specified amount of sides.', inline: true },
						{ name: `${prefix}scenario`, value: "(Args <Optional: Person>)\nI'll think of a little scenario with you and whoever you specify...", inline: true },
						{ name: `${prefix}guessmyword`, value: '(Args <Person>)\nThe pinged persom must guess your word! Good luck to both of you.', inline: true },
						{ name: `${prefix}quote`, value: "I'll recite one of the quotes I remember... I don't remember many.", inline: true },
						{ name: `${prefix}ship`, value: '(Args <Person> <Person> <Person>...) Ships any number of people of your choice based on certain variables. Supports as many people as one wants, should you pick at least two people.', inline: true },
						{ name: `${prefix}icecream`, value: "(Args <Amount Of Scoops> <Optional: Repeat Scoop Flavors>)\nI'll make an ice cream of any amount of scoop with randomized flavors. You can do up to 100 scoops.", inline: true },
						{ name: `${prefix}pizza`, value: "(Args <Amount Of Toppings> <Optional: Amount of Condiments> <Optional: Include Cheese> <Optional: Include Sauce> <Optional: Repeat Toppings> <Optional: Repeat Condiments>)\nI'll make a pizza of any amount of toppings and condiments. You can do up to 100 toppings and 20 condiments", inline: true },
					)
				message.channel.send({embeds: [DiscordEmbed]})
				break

			case 'relics':
				DiscordEmbed = new Discord.MessageEmbed()
					.setColor('#0099ff')
					.setTitle('Search for relics, remeniscent of other universes.')
					.addFields(
						{ name: `${prefix}relicsearch`, value: 'Begin your search for relics, from many different universes, scattered around here. You can use these later.', inline: true },
						{ name: `${prefix}getrelic`, value: '(Args <Relic>)\nCheck for a relic.', inline: true },
						{ name: `${prefix}equip`, value: '(Args <Relic>)\nEquip an obtained relic.', inline: true },
						{ name: `${prefix}relicbattle`, value: "(Args <Optional: Ping your Opponents>)\nBattle for victory! Use your equipped relic to defeat all that stand in your way.\nPing one a opponent for a 1v1 stand-off where you'll use your relic's stats to prevail.\nPing two or more opponents for a crazy FFA duel! Guard strategically for victory.\nPing nobody for a bossfight against me: a cheater.\n\nI hope you enjoy the Relics!", inline: false },
					)
				message.channel.send({embeds: [DiscordEmbed]})
				break
			
			case 'battle':
				DiscordEmbed = new Discord.MessageEmbed()
					.setColor('#0099ff')
					.setTitle('Battle Commands')
					.setDescription("These are commands that are to do with the **core battle system** of the bot.")
					.addFields(
						{ name: `${prefix}guide`, value: "(Args <Page>) Some spider girl gave me a book, so I'll read it out to you.", inline: true },
						{ name: `${prefix}registerchar`, value: '(Args <Name> <Base HP> <Base MP> <STR> <MAG> <PRC> <END> <CHR> <INT> <AGL> <LUK>)\nCreates a character to be used in battle.\nFor balancing purposes, Base HP should be 50 or below, Base MP should be 35 or below, and all other stats should be 10 or below.', inline: false },
						{ name: `${prefix}getchar`, value: '(Args <Character Name>)\nGets the info of a character, including Current HP & MP, EXP and more.', inline: true },
						{ name: `${prefix}setmelee`, value: '(Args <CharName> <Skill Name> <Type>)\nGives your character a new Melee Skill.', inline: true },
						{ name: `${prefix}learnskill`, value: '(Args <CharName> <Skill Name> <Skill Name> <...>)\nGives your character a new Skill.', inline: true },
						{ name: `${prefix}setleaderskill`, value: '(Args <CharName> <Skill Name> <Type>)\nGives your character a Leader Skill - A passive skill that activates when you are the leader..', inline: true },
						{ name: `${prefix}setaffinity`, value: '(Args <CharName> <Type> <Affinity>)\nGives your character a new Affinity.', inline: true },
						{ name: `${prefix}setquote`, value: '(Args <CharName> <Action> "<Quote>")\nGives your character a flashy quote to say whenever an action is done!', inline: true },
						{ name: `${prefix}clearquotes`, value: "(Args <CharName> <Action>)\nClears the quotes for a specific action.", inline: true },
						{ name: `${prefix}showquotes`, value: "(Args <CharName> <Optional: Action>)\nShows the quotes for all or a specific action.", inline: true },
						{ name: `${prefix}setpet`, value: '(Args <CharName> <PetName>)\nGives your character a pet to take on adventures with them.', inline: true },
						{ name: `${prefix}removepet`, value: '(Args <CharName>)\nPuts away their pet.', inline: true },
						{ name: `${prefix}registerskill`, value: "(Args <Name> <Cost> <HP/MP/HP%/MP%> <Pow> <Acc> <Crt> <Type> <Aff> <Aff Chn> <Phys? Spec?>)\nCreates a skill to be used in battle. If you're not careful, they could be very overpowered.", inline: false },
						{ name: `${prefix}searchskills`, value: "(Args <Search Parameter>)\nSearch for Skills that include the word specified.", inline: true},
						{ name: `${prefix}getskill`, value: "(Args <Skill Name>)\nI'll grab the info of the move's stats for you!", inline: true },
						{ name: `${prefix}setlb`, value: "(Args <CharName> <LB Name> <Power> <LBMeter%> <Status> <StatusChance> <LB Level>)\nSets a character's Limit Break Skill, which can only be used once their Limit Meter is at a specified amount.", inline: true },
						{ name: `${prefix}journal`, value: "(Args <EnemyName>)\nI have next to me the public monster encyclopedia. I'll tell you everything i know about it.", inline: true },
						{ name: `${prefix}startenemybattle`, value: "(Args <Team> <...>)\nThis command is Admin Only. Starts a battle with the specified enemies.", inline: true },
						{ name: `${prefix}startcolosseum`, value: "(Args <Team> <Trial Name>)\nThis command is Admin Only. Starts the specified trial.", inline: true },
						{ name: `${prefix}startpvp`, value: "(Args <Team 1> <Team 2> <Gamemode?>)\nThis command is Admin Only. Starts a PVP battle. There are server leaderboards too!", inline: true },
						{ name: `${prefix}endbattle`, value: 'This command is Admin Only. Ends the current battle that is in progress.', inline: true },
					)
				message.channel.send({embeds: [DiscordEmbed]})
				break

			case 'moderation':
				DiscordEmbed = new Discord.MessageEmbed()
					.setColor('#0099ff')
					.setTitle('You can change many things here, such as prefixes, parties, stuff to do with the battle system, and more')
					.addFields(
						{ name: `${prefix}makeparty`, value: '(Args <Characters> <...>)\nCreates a party, with the first player specified as leader.', inline: false },
						{ name: `${prefix}partyname`, value: "(Args <Name>) Changes the party's name.", inline: true },
						{ name: `${prefix}addtoparty`, value: "(Args <Party> <Character>) Adds a character to the party.", inline: true },
						{ name: `${prefix}kickfromparty`, value: "(Args <Party> <Character>) Kicks a character from the party.", inline: true },
						{ name: `${prefix}backup`, value: "(Args <Party> <Character>) Puts this character in backup.", inline: true },
						{ name: `${prefix}getparty`, value: '(Args <Party Name>)\nGets all the members of a specified party.', inline: true },
						{ name: `${prefix}prefix`, value: `(Args <New Prefix>)\nThis command is Admin Only. Changes the prefix for the entire server. \n**Currently "${prefix}"**`, inline: true },
						{ name: `${prefix}limitbreaks`, value: `\nThis command is Admin Only. Implements a custom Limit Break mechanic. \n**Currently "${(servFile[message.guild.id].limitbreaks == true) ? "enabled" : "disabled"}"**`, inline: true },
						{ name: `${prefix}onemores`, value: `\nThis command is Admin Only. Implements the "One More" mechanic from the Persona Series. \n**Currently "${(servFile[message.guild.id].onemores == true) ? "enabled" : "disabled"}"**`, inline: true },
						{ name: `${prefix}showtimes`, value: `\nThis command is Admin Only. Implements the "Showtime" mechanic from Persona 5 Royal. \n**Currently "${(servFile[message.guild.id].showtimes == true) ? "enabled" : "disabled"}"**`, inline: true },
						{ name: `${prefix}damageformula`, value: `\nThis command is Admin Only. Sets the damage formula, method of damage calculation when dealing damage. \n**Currently "${servFile[message.guild.id].damageFormula}"**`, inline: true },
						{ name: `${prefix}settings`, value: "Display this server's current settings.", inline: true },
						{ name: `${prefix}invite`, value: "If you want to, you can invite me to other servers. I'm a buggy mess right now, though.", inline: true },
					)
				message.channel.send({embeds: [DiscordEmbed]})
				break

			case 'music':
				DiscordEmbed = new Discord.MessageEmbed()
					.setColor('#0099ff')
					.setTitle('You can change many things here, such as prefixes, parties, stuff to do with the battle system, and more')
					.addFields(
						{ name: `${prefix}joinvc`, value: '(Args <Optional: VC ID>)\nJoins me to a vc to play music :)', inline: true },
						{ name: `${prefix}playsong`, value: '(Args <Youtube Video Link>)\nAdds this video to the song queue.', inline: true },
						{ name: `${prefix}autoplay`, value: 'Will ensure that the bot plays battle themes.', inline: true },
						{ name: `${prefix}setbattletheme`, value: '(Args <Theme Type> <Youtube Video Link)\nWill set this theme to be played by the bot if in a vc.', inline: true },
					)
				message.channel.send({embeds: [DiscordEmbed]})
				break

			case 'loot':
				DiscordEmbed = new Discord.MessageEmbed()
					.setColor('#0099ff')
					.setTitle('These are the commands that have to do with **Loot Tables** and enemy drops')
					.addFields(
						{ name: `${prefix}makeloot`, value: '(Args <Name> <Items, Drop Chances, ...>)\nCreates a loot table that can be assigned to enemies after a battle victory.', inline: true },
						{ name: `${prefix}removeloot`, value: '(Args <Loot Table>)\nRemoves a loot table and unsets it for everything.', inline: true },
						{ name: `${prefix}assignloot`, value: '(Args <Name> <Loot Table>)\nAssigns a loot table to a certain enemy type.', inline: true },
						{ name: `${prefix}deassignloot`, value: '(Args <Enemy Name>)\nRemoves a loot table from a certain enemy type.', inline: true },
						{ name: `${prefix}getloot`, value: '(Args <Loot Table / Enemy Name>)\nGets the loot table you want to look into.', inline: true },
						{ name: `${prefix}searchloots`, value: '(Args <Search Parameter>)\nSearch for Loot Tables that include the word specified', inline: true },
						{ name: `${prefix}listloots`, value: 'Will let you see a list of available loot tables', inline: true },
					)
				message.channel.send({embeds: [DiscordEmbed]})
				break
				
			case 'chests':
				DiscordEmbed = new Discord.MessageEmbed()
					.setColor('#0099ff')
					.setTitle('These are the commands that have to do with **Chests** because people have to store stuff somewhere')
					.addFields(
						{ name: `${prefix}makechest`, value: '(Args <Name> <Channel> <Spoiler> <Optional: Loot Table, Items...>)\nCreates a chest that characters can open, gather items from and put them in.', inline: true },
						{ name: `${prefix}removechest`, value: '(Args <Name>)\nWill remove a chest and delete every item inside of it.', inline: true },
						{ name: `${prefix}getchest`, value: "(Args <Name>)\nWill display some information about a specific chest.", inline: true },
						{ name: `${prefix}searchchests`, value: "(Args <Search Parameter>)\nWill search for chests based on the word specified, in a server you type into.", inline: true },
						{ name: `${prefix}listchests`, value: "Will show you a list of chests, in a server you type into.", inline: true },
						{ name: `${prefix}chestlocation`, value: "(Args <Name> <Channel>)\nWill change a chest's location.", inline: true },
						{ name: `${prefix}renamechest`, value: "(Args <Name> <New Name>)\nWill change a chest's name to what you want it to be.", inline: true },
						{ name: `${prefix}spoilerchest`, value: '(Args <Name>)\nWill change if a chest is spoilered or not.', inline: true },
						{ name: `${prefix}encounterchest`, value: '(Args <Name>)\nWill make a chest opened for the first time.', inline: true },
						{ name: `${prefix}chestloot`, value: "(Args <Name> <New Name>)\nWill change a chest's loot table and items within.", inline: true },
						{ name: `${prefix}removechestloot`, value: "(Args <Name>)\nWill remove a chest's loot table, and items related to it within.", inline: true },
						{ name: `${prefix}chestitems`, value: "(Args <Name> <Optional: Items>)\nWill set a chest's base items to put into a chest.", inline: true },
						{ name: `${prefix}removechestitems`, value: "(Args <Name>)\nWill remove a chest's base items.", inline: true },
						{ name: `${prefix}lockchest`, value: "(Args <Name> <Item>)\nWill lock a chest with an item.", inline: true },
						{ name: `${prefix}removelock`, value: "(Args <Name>)\nWill remove a chest's lock.", inline: true },
						{ name: `${prefix}openchest`, value: "(Args <Chest Name> <Party>)\nOpens a created chest with the specified party.", inline: true },
						{ name: `${prefix}closechest`, value: "(Args <Chest Name>)\nCloses a created chest if it is open.", inline: true },
						{ name: `${prefix}takeitem`, value: "(Args <Chest Name> <Item> <Optional: Quantity>)\nTake items from a chest, should it be open.", inline: true },
						{ name: `${prefix}putitem`, value: "(Args <Chest Name> <Item> <Optional: Quantity>)\nTake items from a party, and put them inside of a chest, should it be open.", inline: true },
					)
				message.channel.send({embeds: [DiscordEmbed]})
				break

			case 'food':
				DiscordEmbed = new Discord.MessageEmbed()
					.setColor('#0099ff')
					.setTitle('You can make yourself some food however you like, or even make your own food with the official ones.')
					.addFields(
						{ name: `${prefix}makefood`, value: "(Args <Name> <Category> <Image Link / Attachment>)\nI will make your very own food available to the ice cream generator.", inline: false },
						{ name: `${prefix}foodtemplate`, value: "Get yourself a textbook example of what to make for a certain food category.", inline: true },
						{ name: `${prefix}removefood`, value: "(Args <Category> <Name>)\nIf you don't want your food to be there, I can make it gone.", inline: true },
						{ name: `${prefix}renamefood`, value: "(Args <Category> <Name> <New Name>)\nI will change the name of your food from one to another.", inline: true },
						{ name: `${prefix}foodimage`, value: "(Args <Category> <Name> <Image Link / Attachment>)\nI will change the look of your chosen food.", inline: true },
						{ name: `${prefix}foodprivacy`, value: "I can make your stuff with your food private if you want to.", inline: false },
						{ name: `${prefix}listfood`, value: `(Args <Category> <'official'/'users'/__<User ID / User Mention>__/'me'/'all'>)\nWill make a list of food in a certain category.`, inline: true },
						{ name: `${prefix}searchfood`, value: `(Args <Category> <Search Parameter(s)>)\nWill search within a certain food category given the search parameter.`, inline: true },
						{ name: `${prefix}icecream`, value: "(Args <Amount Of Scoops> <Optional: Repeat Scoop Flavors>)\nI'll make an ice cream of any amount of scoop with randomized flavors. You can do up to 100 scoops.", inline: false },
						{ name: `${prefix}pizza`, value: "(Args <Amount Of Toppings> <Optional: Amount of Condiments> <Optional: Include Cheese> <Optional: Include Sauce> <Optional: Repeat Toppings> <Optional: Repeat Condiments>)\nI'll make a pizza of any amount of toppings and condiments. You can do up to 100 toppings and 20 condiments", inline: true },
					)
				message.channel.send({embeds: [DiscordEmbed]})
				break

			default:
				const file = new Discord.MessageAttachment('./images/enemies/grassimp.png');
				DiscordEmbed = new Discord.MessageEmbed()
					.setColor('#0099ff')
					.setTitle('Hello! I am Bloom Battler!')
					.setDescription("I'm a barely functional discord bot that will add Turn-Based RPG Battling to your Discord Server! With me, you can create characters, skills, items, enemies and more! I also have a few other fun things that I can do.\n\nBut enough with the chit-chat, let me show you just what I have the capability to do!")
					.setThumbnail('attachment://grassimp.png')
					.addFields(
						{ name: 'Fun', value: 'Commands that are made for fun!', inline: true },
						{ name: 'Food', value: 'Everyone has to eat food (and drink) to survive afterall.', inline: true },
						{ name: 'Relics', value: 'Begin the search for very cool relics! Cool, I promise!', inline: true },
						{ name: 'Battle', value: 'The Main section of this bot. Here, you can creat characters and skills and stuff to use in-battle, and start the battles too!', inline: true },
						{ name: 'Loot', value: 'Because enemies dropping items has got to be very important!', inline: true },
						{ name: 'Chests', value: 'Because one has to store their items somewhere.', inline: true },
						{ name: 'Music', value: 'Does it get quiet in the server? Why dont I spice it up with some music! Battle music, chill music, whatever you need!', inline: true },
						{ name: 'Moderation', value: 'Because every Discord Bot needs server moderation.', inline: true },
					)
				message.channel.send({embeds: [DiscordEmbed], files: [file]})
        }
    }

    //////////////////
    // Fun Commands //
    //////////////////
    if (command === 'ping') {
		var pingVal = Date.now() - message.createdTimestamp
		var latencyVal = Math.round(client.ws.ping)
		
		var hit = "There! I hit it!"
		if (pingVal > 50 || pingVal < -50 || latencyVal < 20) {
			hit = "Darn, guess I missed."
		}

        message.channel.send(`🏓 Allow me to swing! \nLatency is ${pingVal}ms. API Latency is ${latencyVal}ms\n${hit}`);
    }

    if (command === 'diceroll') {
        const arg = message.content.slice(prefix.length).trim().split(/ +/);
        if (!arg[1] || arg[1] === ' ' || arg[1] === 'null') {
            const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle(`${prefix}diceroll`)
				.setDescription('(Args <Sides> <Dice Count>)\nRolls the specified amount of dice with the specified amount of sides.')
            message.channel.send({embeds: [DiscordEmbed]})
            return false
        }

        const num1 = parseInt(arg[1]);
        if (arg[2]) {
            const num2 = parseInt(arg[2]);
			
			if (num1 < 1) {
                message.channel.send(`Your 1st number (${num1}) has got to be a number above 1.`);
				return false
			} else if (num2 < 1) {
                message.channel.send(`Your 2nd number (${num2}) has got to be a number above 1.`);
				return false
			} else if (num1 > 300) {
                message.channel.send(`Your 1st number (${num1}) has got to be a number below 300.`);
				return false
			} else if (num2 > 300) {
                message.channel.send(`Your 2nd number (${num2}) has got to be a number below 300.`);
				return false
			}
			
			var totalNum = 0;
			var resultsNums = [];
			for (let i = 0; i < num2; i++) {
				const resultNum = Math.ceil(Math.random() * num1)
				resultsNums.push(resultNum)
				totalNum += resultNum;
			};
			
			resultsNums.sort(function(a, b) {return a + b})
			
			var resultsTxt = `(${resultsNums})`

			message.channel.send(`Your result after multiple rolls is ${totalNum} ${resultsTxt} after rolling a ${num2}d${num1}.`)
        } else {
			if (num1 < 1) {
                message.channel.send(`Your number (${num1}) has got to be a number above 1.`);
				return false
			}

            var resultNum = Math.ceil(Math.random() * num1)
            message.channel.send(`Your result is ${resultNum} after rolling a d${num1}.`);
        };
    };

    //rpg!scenario stuff
    const tradePkmn = [
        "Bulbasaur",
        "Charmander",
        "Squirtle",
        "Vulpix",
        "Cyndaquil",
        "Chikorita",
        "Arcanine",
		"Dragonite",
		"Dreepy",
		"Mimikyu",
		"Dracovish",
		"Pikachu",
		"Pichu",
		"Eevee"
    ]

    const soloScenarios = [
        `is lonely. They need some friends, so they go out for a search. They're unlucky.`,
        `is getting beat up by some strong anime character.`,
        `"Omae wa mou, shinderu."\nBloom Battler "Nani!?"`,
        `explores the dark web. They found a fedora.`,
        `: Stand Master「Edge」\n*The ability to summon a Fedora.*`,
        `dies.`,
        `is being mean to me :(`,
        `shines as bright as the sky itself ;)`,
        `is scary.`,
        `is being bullied.`,
        `is edgy.`,
        `has a cute pet by their side!`,
        `is short! Hehe! Short!\nPFFFHAHAHAHAHAHAHAAHHAH!`,
        `is a tad too tall...`,
        `has discovered Super Saiyan Blue!`,
        `is ugly.`,
		`is bored, and so, plays with their ${tradePkmn[Math.round(Math.random() * tradePkmn.length)]}.`
    ]

    const duoScenarios = [
        `decide it's finally time to marry eachother. The wedding hall is filled to the brim with your friends.`,
        `are fighting a strong monster! Together, you prevail!`,
        `are rivals, playing chess to figure out who's strongest.`,
        `secretly have a crush on eachother, but you don't have the courage.`,
        `are in the middle of a Pokemon battle! Who prevails is up to you.`,
        `trades a ${tradePkmn[Math.round(Math.random() * tradePkmn.length)]} for a ${tradePkmn[Math.round(Math.random() * tradePkmn.length)]}.`,
        `play a competitve video game together: Super Smash Bros!`,
        `play a competitve video game together: Mario Kart 8!`,
        `play a competitve video game together: Kirby's Dream Course!`,
        `play a cooperative video game together: New Super Mario Bros U!`,
        `play a cooperative video game together: Miitopia!`,
        `play a cooperative video game together: Pokemon: Let's Go!`,
        `sing together in a concert!\nSo good!`,
        `sleep together. Awiie!\nSo cute!`,
        `go on a world-wide adventure!\nSo endeavouring!`,
        `are scared of eachother.`,
        `go trick or treating during halloween!`,
        `are in love with eachother during college. They don't get to get together however, because they never get to see eachother.\n💔 *So sad*... 💔`,
        `are in love with eachother during college. They get together during college, and marry eachother after!\n💖 So kawaii! 💖`,
        `cheer eachother up in a hard spot. So nice!`,
        `travel through space to get to Mars! As they land, they discover many locations, single celled organisms and overall, just have fun!\nSo endearing!`,
        `are sister and brother.`,
        `are brother and sister.`,
        `are agressive towards eachother, as one is a bully, bullying the other.\nAfter 4 years of constant conflict, a friend talks them to their senses, and now, the two are best of friends! 🤔 So unexpected! 🤔`,
        `lean in for a kiss, and kiss! Hehe!\n💏 So Kawaii 💏`,
        `'s pets get along very well together!`,
        `stick together during college. Everyone else seems so scary, as if they were from a foreign world.`,
        `teach eachother sign language.`,
        `are very cute together! 💖`,
        `are very ugly together! \n:(`,
    ]

    if (command === 'scenario') {
        const arg = message.content.slice(prefix.length).trim().split(/ +/);

        if (arg[1]) {
            if (message.mentions.users.first()) {
                const taggedUser = message.mentions.users.first();
                var sceneText = `${message.author.username} & ${taggedUser.username} `

				var scenario = duoScenarios[Math.round(Math.random() * (duoScenarios.length - 1))]
				sceneText = sceneText + scenario
				const DiscordEmbed = new Discord.MessageEmbed()
					.setColor('#0099ff')
					.setTitle(`${message.author.username} & ${taggedUser.username}`)
					.setDescription(`${sceneText}`)
					.setFooter('rpg!scenario');
				message.channel.send({embeds: [DiscordEmbed]})
            } else {
                const DiscordEmbed = new Discord.MessageEmbed()
                    .setColor('#0099ff')
                    .setTitle(`${message.author.username} & ${arg[1]}`)
					.setDescription(`${message.author.username} & ${arg[1]} are not related in any way.`)
                message.channel.send({embeds: [DiscordEmbed]})
            }
        } else {
            var sceneText = `${message.author.username} `
            var scenario = soloScenarios[Math.round(Math.random() * (soloScenarios.length - 1))]
            sceneText = sceneText + scenario
            const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle(`${message.author.username}`)
				.setDescription(`${sceneText}`)
            message.channel.send({embeds: [DiscordEmbed]})
            return true
        }
    };

    const gsmWords = [
        "Edge",
        "Heartbroken",
        "Sonic",
        "Speed",
        "Pokemon",
        "Friends",
        "Coin",
        "Money",
        "Gay",
        "Pansexual",
        "Sex",
        "Shy",
        "Short",
        "Tall",
        "Kill",
        "Genocide",
        "Murder",
        "Hollow",
        "Empty",
        "Fully",
        "Inflation",
        "Anything",
        "Else",
        "Code",
        "DNA",
        "Fudge",
        "Lose",
        "Cry",
        "End",
        "Spectrum",
        "Guess",
        "My",
        "Word",
        "Mental",
        "Physical",
        "Ailment",
        "Burn",
        "Freeze",
        "Paralyse",
        "Crying",
        "Cycles",
        "Death",
        "Birthday",
        "Party",
        "Macrocosm",
        "Universe",
        "Supercontinent",
        "Continent",
        "USA",
        "UK",
        "England",
        "Africa",
        "Asia",
        "Anime",
        "Cafe",
        "France",
        "Greed",
        "Relic",
        "Forgotten",
        "Crossroads",
        "Green",
        "Path",
		"City",
		"Tears",
		"Hollow",
		"Knight",
		"Sadness",
		"Pain",
		"Suffering",
		"Depressing",
		"Death",
		"Drive",
		"McDonalds",
		"KFC",
		"Hamburger",
		"Cheeseburger",
		"BigMac",
		"Whopper"
    ]

    if (command === 'guessmyword' || command === 'gsm') {
        if (doGSM == true) {
            message.channel.send("A game is already running.");
            return
        }
        if (!message.mentions.users.first()) {
            message.channel.send("You need to select someone");
            return
        }
        const gsmPath = dataPath+'/guessMyWord.json'
        const gsmRead = fs.readFileSync(gsmPath);
        const gsm = JSON.parse(gsmRead);

        gsm.init = message.author;
        gsm.challenger = message.mentions.users.first();
        gsm.words = [];
        gsm.setword = null;

        var i;
        for (i = 0; i < 3; i++) {
            gsm.words.push(gsmWords[Math.round(Math.random() * (gsmWords.length - 1))])
        }

        message.author.send(`Choose from the **${gsm.words.length}** words:`)
        var k;
        for (k = 0; k < gsm.words.length; k++) {
            message.author.send(`**${gsm.words[k]}**`)
        }

        message.mentions.users.first().send(`**${message.author.username}** has challenged you to a game of "Guess My Word"! Please wait.`)

        doGSM = true
        fs.writeFileSync(gsmPath, JSON.stringify(gsm, null, '    '));
    }

    const quotes = [
        "*The world isn't perfect. But it's there for us, doing the best it can....that's what makes it so damn beautiful.*\n-Roy Mustang, Full Metal Alchemist",
        "*To know sorrow is not terrifying. What is terrifying is to know you can't go back to happiness you could have.*\n-Matsumoto Rangiku, Bleach",
        "*We are all like fireworks: we climb, we shine and always go our separate ways and become further apart. But even when that time comes, let's not disappear like a firework and continue to shine.. forever.*\n-Hitsugaya Toshiro, Bleach",
        "*Those who stand at the top determine what's wrong and what's right! This very place is neutral ground! Justice will prevail, you say? But of course it will! Whoever wins this war becomes justice!*\n-Don Quixote Doflamingo, One Piece",
        "*Fear is not evil. It tells you what weakness is. And once you know your weakness, you can become stronger as well as kinder.*\n-Gildarts Clive, Fairy Tail",
        "*Whatever you lose, you'll find it again. But what you throw away you'll never get back.*\n-Kenshin Himura, Rurouni Kenshin: Meiji Kenkaku Romantan",
        "*You’ll laugh at your fears when you find out who you are.*\n-Piccolo, Dragon Ball",
        "*Before creation… must come destruction!*\n-Beerus, Dragon Ball",
        "*We do have a lot in common. The same earth, the same air, the same sky. Maybe if we started looking at what’s the same, instead of looking at what’s different, well, who knows?*\n-Meowth, Pokemon",
        "*If she leaves you for another, there’s always her mother.*\n-𝓟𝓸𝓲𝓷𝓽𝔂 𝓑𝓸𝓲, One of the various servers used to test me",
        "*The important thing is not how long you live. It’s what you accomplish with your life.*\n-Grovyle, Pokemon Mystery Dungeon: Explorers of Time/Darkness/Sky",
		"*Bwa Bo brop*\n-Cowardly Maya, Persona 3"
    ]

    if (command === 'rq' || command === 'randquote' || command === 'randomquote' || command === 'quote') {
        var quoteText = quotes[Math.round(Math.random() * (quotes.length - 1))]
        const DiscordEmbed = new Discord.MessageEmbed()
            .setColor('#ffffff')
            .setDescription(`${quoteText}`)
            .setFooter(`${prefix}${command}`);
        message.channel.send({embeds: [DiscordEmbed]})
        return true
    }

    if (command === 'mafia' || command === 'werewolf') {
        const mafiaPath = dataPath+'/Mafia/Mafia.json'
        const mafiaRead = fs.readFileSync(mafiaPath);
        const mafiaFile = JSON.parse(mafiaRead);

        if (!mafiaFile[message.guild.id]) {
            mafiaFile[message.guild.id] = {
                state: "waiting",
                players: [],
                killers: [],
                protector: 0,
            }
        }

        mafiaFile[message.guild.id].state = "waiting";

        const DiscordEmbed = new Discord.MessageEmbed()
            .setColor('#ffffff')
            .setTitle("Werewolf (or Mafia)")
            .setDescription(`A game of trust or betrayal.\nOne will be elected as the "Werewolf" or "Mafia Leader", as the others try to find out just who would kill them.\n\n*(React with the emoji (🔪) to join.)*`)
            .setFooter("Werewolf/Mafia");

        message.channel.send({embeds: [DiscordEmbed]}).then(message => {
			message.react("🔪")
		})

        fs.writeFileSync(mafiaPath, JSON.stringify(mafiaFile, null, '    '));
    }

    if (command === 'startmafia' || command === 'startwerewolf' || command === 'sw') {
        const mafiaPath = dataPath+'/Mafia/Mafia.json'
        const mafiaRead = fs.readFileSync(mafiaPath);
        const mafiaFile = JSON.parse(mafiaRead);

        if (mafiaFile[message.guild.id].state != "waiting") {
            return false // dont say anything
        }

        if (mafiaFile[message.guild.id].players.length < 6) {
            message.channel.send("Not enough players! **6** is required!")
            return false
        }

        var mafia1 = Math.round(Math.random() * mafiaFile[message.guild.id].players.length)
        var mafia2 = Math.round(Math.random() * mafiaFile[message.guild.id].players.length)
        while (mafia1 == mafia2) {
            mafia2 = Math.round(Math.random() * mafiaFile[message.guild.id].players.length)
        }

        mafiaFile[message.guild.id].killers.push(mafiaFile[message.guild.id].players[mafia1])
        mafiaFile[message.guild.id].killers.push(mafiaFile[message.guild.id].players[mafia2])

        for (const i in mafiaFile[message.guild.id].players) {
            let userget = client.users.fetch(mafiaFile[message.guild.id].players[i].id);
            userget.then(function (user) {
                if (i == mafia1 || i == mafia2) {
                    user.send("**You are the __Minority__ (Werewolf/Mafia). You must kill the __Majority__.**\n*Don't tell anyone!*")
                } else {
                    user.send("**You are the __Majority__ (Villager). You, as a villager, must survive and discover the __Minoriy__.**\n*Don't tell anyone!*")
                }
            });
        }

        mafiaFile[message.guild.id].state = "choose"
        fs.writeFileSync(mafiaPath, JSON.stringify(mafiaFile, null, '    '));

        for (const i in mafiaFile[message.guild.id].killers) {
            let userget = client.users.fetch(mafiaFile[message.guild.id].killers[i].id);
            userget.then(function (user) {
                user.send("Decide on someone to kill together.")
            });
        }
    }

    if (command === 'uno') {
        const unoPath = dataPath+'/Uno/unoGames.json'
        const unoRead = fs.readFileSync(unoPath);
        const uno = JSON.parse(unoRead);

        if (!uno[message.guild.id]) {
            uno[message.guild.id] = {
				awaiting: true,
                playing: false,
                players: [],
				lastcard: ["none", 0],
				danger: "none",
				order: "down"
            }
        }

        uno[message.guild.id].awaiting = true;

        const DiscordEmbed = new Discord.MessageEmbed()
            .setColor('#ffffff')
            .setTitle('Uno - The card game made to destroy.')
            .setDescription('You know this game.\n\n*(React with the emoji (🃏) to join.)*')
            .setFooter("Uno");

        message.channel.send({embeds: [DiscordEmbed]}).then(message => {
			message.react("🃏")
		})

        fs.writeFileSync(unoPath, JSON.stringify(uno, null, '    '));
    }

	if (command === 'ship') {
		const arg = message.content.slice(prefix.length).trim().split(/ +/);

		if (!arg[1]) {
			message.channel.send(`Please specify at least one person who you want to ship yourself with, or two if you want to ship two different people.`)
			return false
		}
		
		// Undefined
		var allUndefined = true;
		for (const i in arg) {
			if (i < 1)
				continue;

			if (arg[i].toLowerCase() != 'undefined')
				allUndefined = false;
		}
		
		if (allUndefined) {
			// Getting Candidates
			var resulttext = "**Candidates:** \n"
			for (const i in arg) {
				if (i < 1)
					continue;
				
				resulttext = resulttext + `:small_orange_diamond: ${arg[i]} \n`
			}

			const DiscordEmbed = new Discord.MessageEmbed()
				.setColor('#ff06aa')
				.setTitle('undefined')
				.setDescription(`${resulttext}\n**NaN%** ${':black_medium_square:'.repeat(10)}`)
				.setFooter('undefined')
			message.channel.send({embeds: [DiscordEmbed]})
			
			return false
		}

		function getFromMention(mention) {
			if (!mention) return;
		
			if (mention.startsWith('<@!') && mention.endsWith('>')) {
				mention = mention.slice(3, -1);
		
				return client.users.cache.get(mention);
			}
		}

		for (i in arg) {
			if (arg[i].startsWith('<@!') && arg[i].endsWith('>')) {
				arg[i] = getFromMention(arg[i])
				arg[i] = arg[i].username
			}
		}

		if (!arg[2]) {
			arg[2] = arg[1]
			arg[1] = message.author.username
		}

		let shipCandidates = []
		shipCandidates = arg
		shipCandidates.shift()

		// Converting Mentions
		for (i in shipCandidates) {
			if (shipCandidates[i].mention)
				console.log("true");
		}

		// Getting Candidates
		var resulttext = "**Candidates:** \n"
		for (i in shipCandidates)
			resulttext = resulttext + `:small_orange_diamond: ${shipCandidates[i]} \n`
		
		//Splicing Name
		var splicedName = ""
		for (i in shipCandidates) {
			var nameToCut
			nameToCut = shipCandidates[i].slice(Math.floor(shipCandidates[i].length / shipCandidates.length * i), Math.round(shipCandidates[i].length / shipCandidates.length * (i + 1)))
			splicedName += nameToCut
		}

		// Filtering Duplicates
		var filtered = new Set(shipCandidates);
		shipCandidates = [...filtered]

		//Fetching Love
		var shipPath = dataPath+'/Ship/shipParameters.json'
		var shipRead = fs.readFileSync(shipPath);
		var shipFile = JSON.parse(shipRead);

		var loveParameters = []
		var loveResults = []
		var loveCloseness = 0
		var finalLoveCloseness = 0

		for (i in shipCandidates) {
			if (!shipFile[shipCandidates[i]]) {
				shipFile[shipCandidates[i]] = {
					loveParameter: Math.round(Math.random() * 100),
				}

				fs.writeFileSync(shipPath, JSON.stringify(shipFile, null, '    '));
			}

			var candidate = shipFile[shipCandidates[i]]

			loveParameters.push(candidate.loveParameter)
		}

		for (i in loveParameters) {
			var secondID = parseInt(i) + 1

			if (loveParameters.length > 1) {
				if (loveParameters[secondID] != undefined) {
					loveResults.push(loveParameters[i])
					loveResults.push(loveParameters[secondID])
					loveResults.sort((a,b) => a - b)

					loveCloseness = loveResults[1] - loveResults[0]
					finalLoveCloseness += 100 - loveCloseness
					loveResults = []
				}
			} else
				finalLoveCloseness += loveParameters[i]
		}

		if (loveParameters.length > 1)
			finalLoveCloseness /= (shipCandidates.length - 1)

		const love = Math.round(finalLoveCloseness);
        const loveIndex = Math.floor(love / 10);
        const loveLevel = ":white_medium_square:".repeat(loveIndex) + ":black_medium_square:".repeat(10 - loveIndex);

		//footer reactions
		var footerConditions = [
			`${(love <= 0) ? true : false}`,
			`${(love <= 10 && love > 0) ? true : false}`,
			`${(love <= 20 && love > 10) ? true : false}`,
			`${(love <= 30 && love > 20) ? true : false}`,
			`${(love <= 40 && love > 30) ? true : false}`,
			`${(love <= 50 && love > 40) ? true : false}`,
			`${(love <= 60 && love > 50) ? true : false}`,
			`${(love <= 70 && love > 60) ? true : false}`,
			`${(love <= 80 && love > 70) ? true : false}`,
			`${(love <= 90 && love > 80) ? true : false}`,
			`${(love <= 99 && love > 90) ? true : false}`
		]
		var footerText = ""
		
		const footerTexts = [
			[
				"This one, for sure, isn't happening.",
				"Forget about even trying with this.",
				"lol suck!"
			],
			
			[
				"This one won't work out at all.",
				"bruh.",
				"This is sad"
			],
			
			[
				"There's no chance this one's happening.",
				'Here is a cookie for your troubles: "🍪"',
				"Sad."
			],
			
			[
				"Possible, but don't get your hopes up.",
				"try harder lol",
				"Well this is... unfortunate."
			],
			
			[
				"Maybe if you try hard enough...",
				"In another timeline, this would work!",
				"Perhaps they'll be together if you hope"
			],
			
			[
				"Interesting outcome.",
				"I see, I see.",
				"Almost."
			],
			
			[
				"This ship's not tooooo bad.",
				"nice NICE",
				"Very cool"
			],
			
			[
				"I like where this is going.",
				"This could go places!",
				"Avoid the fanfic sites."
			],
			
			[
				"This one could turn into something...",
				"They have a high chance of being together!!",
				"Fanfic time."
			],
			
			[
				"Awww, they fit so well together!",
				"They're so nice together.",
				"Cute couple.",
			],
			
			[
				"Almost, almost!",
				"Just barely!",
				"So close."
			]
		]

		for (i in footerConditions) {
			if (footerConditions[i].endsWith('true')) {
				footerText = footerTexts[i][Math.round(Math.random() * footerTexts[i].length-1)]
			}
		}

		if (love === 69)
			footerText = 'Nice. ( ͡° ͜ʖ ͡°)'

		if (love === 100)
			footerText = 'OTP!'

		// Send Embed

		const DiscordEmbed = new Discord.MessageEmbed()
            .setColor('#ff06aa')
            .setTitle(`${splicedName}`)
			.setDescription(`${resulttext}\n**${love}%** ${loveLevel}`)
			.setFooter(`${footerText}`)
		message.channel.send({embeds: [DiscordEmbed]})
	}
	
	if (command === 'icecream') {
		let iceCreamFlavors = []
		let iceCreamIDs = []
			
		const arg = message.content.slice(prefix.length).trim().split(/ +/);

		if (!arg[1]) {
			const DiscordEmbed = new Discord.MessageEmbed()
				.setColor('#0099ff')
				.setTitle(`${prefix}icecream`)
				.setDescription("(Args <Amount Of Scoops> <Optional: Repeat Scoop Flavors>)\nI'll make an ice cream of any amount of scoop with randomized flavors. You can do up to 100 scoops.\n\n Alternatively, you can also use:\n(Args <Scoop Flavors>)\n that if you want to specify flavors on an ice cream.")
			message.channel.send({embeds: [DiscordEmbed]})
			return false
		}

		var foodPath = dataPath+'/foodConfig.json'
		var foodRead = fs.readFileSync(foodPath);
		var foodFile = JSON.parse(foodRead);

		let scoopNumber
		let repeatscoops

		let users = await message.guild.members.fetch().catch(console.error);
		let list = users.map(m => m.id)

		//Official Ice Creams
		for (const flavor in foodFile['official']['iceCream']['flavors']) {
			iceCreamFlavors.push(flavor)
			iceCreamIDs.push('official')
		}
		//User-Based
		for (const i in list) {
			if (foodFile[list[i]] && foodFile[list[i]]['iceCream'] && foodFile[list[i]]['iceCream']['flavors']) {
				var user = list[i]
				for (const flavor in foodFile[list[i]]['iceCream']['flavors']) {
					iceCreamFlavors.push(flavor)
					iceCreamIDs.push(user)
				}
			}
		}

		if (isFinite(parseInt(arg[1]))) {

			if (parseFloat(arg[1]) > 100) {
				message.channel.send(`<:warning:878094052208296007>That's way too much. Please use a number of scoops below or equal to 100. Changing the value to 100.`)
				arg[1] = 100
			} else if (parseFloat(arg[1]) < 0) {
				arg[1] = 0
			}

			scoopNumber = parseInt(arg[1])
			repeatscoops = `true`

			if (arg[2] !== `false` || !arg[2])
				repeatscoops = `true`
			else
				repeatscoops = 'false'

			if (scoopNumber > 10)
				message.channel.send(`Please wait until your ice cream is done.`)
		} else {

			let input = message.content.slice(prefix.length).trim()
			input = input.slice(command.length).trim()

			const regex = new RegExp('"[^"]+"|[\\S]+', 'g');
			let arguments = [];
			input.match(regex).forEach(element => {
				if (!element) return;
				return arguments.push(element.replace(/"/g, ''));
			});

			if (arguments.length > 100) {
				message.channel.send(`<:warning:878094052208296007>That's way too much. Please specify the scoop flavors, but make their amount below or equal to 100. Changing the amount to 100.`)
				arguments.length = 100
			}

			if (arguments[0] == "None") {
				arguments = []
			}

			let invalidFlavors = ''

			for (const i in arguments) {
				if (iceCreamFlavors.indexOf(arguments[i]) < 0) {
					invalidFlavors += `\n- ${arguments[i]}`
					arguments[i] = ''
				}
			}
			const filterArray=(a,b)=>{return a.filter((e)=>{return e!=b})}
			arguments = filterArray(arguments,'')

			if (invalidFlavors.length > 0)
				message.channel.send(`<:warning:878094052208296007>**Your invalid flavors are:**${invalidFlavors}`)

			scoopNumber = arguments
			repeatscoops = `true`

			if (scoopNumber.length > 10)
				message.channel.send(`Please wait until your ice cream is done.`)
		}

		getIceCream(scoopNumber, repeatscoops, message, iceCreamIDs)

		async function getIceCream(scoops, repeatScoops, message) {
			let iceCreamResults = []
			let iceCreamIDList = []
			var iceCreamFlavorList = ''

			if (!isFinite(scoops)) {
				for (const i in scoops) {
					scoops[i].slice(1,scoops[i].length - 1)

					iceCreamResults.push(scoops[i])

					var failureLevel = 0
					var userRandTable = []

					//if this flavor exists in your personal list
					if (Math.round(Math.random() * 100) <= 40) { //which will look into 40% of the time
						if (foodFile[message.author.id] && foodFile[message.author.id]['iceCream']['flavors'][scoops[i]])
						iceCreamIDList.push(message.author.id)
						else
						failureLevel = 1
					} else
					failureLevel = 1
					
					//if not, then it will search through the user list first
					if (failureLevel == 1) {
						for (const userID in foodFile) {
							for (const a in list) {
								if (list[a] == userID && foodFile[userID]['iceCream'] && foodFile[userID]['iceCream']['flavors']) {
									for (const flavor in foodFile[userID]['iceCream']['flavors']) {
										if (flavor == scoops[i])
										userRandTable.push(userID)
									}
								}
							}
						}

						console.log(userRandTable)

						//and pick a random ID
						if (userRandTable.length > 0)
						iceCreamIDList.push(userRandTable[Math.floor(Math.random() * userRandTable.length)])
						else	//and if that fails, we will resort to the official flavors
						iceCreamIDList.push('official')
					}

					iceCreamFlavorList += `\n- ${scoops[i]} *(${iceCreamIDList[i] !== 'official' ? client.users.cache.get(iceCreamIDList[i]) : 'Official'})*`
				}

				scoops = scoops.length
			} else {
				var iceCreamInput = [...iceCreamFlavors]
				var IDInput = [...iceCreamIDs]
				iceCreamResults = []
				iceCreamFlavorList = ''
			
				for (var i = 1; i <= scoops; i++) {
			
					if (iceCreamInput.length < 1) {
						iceCreamInput = [...iceCreamFlavors]
						IDInput = [...iceCreamIDs]
						console.log(`Oops. Ran out of ice cream flavors. Repeating the list.`)
					}
			
					var flavorNum = Math.floor(Math.random() * iceCreamInput.length)
			
					iceCreamResults.push(iceCreamInput[flavorNum])
					iceCreamIDList.push(IDInput[flavorNum])
					iceCreamFlavorList += `\n- ${iceCreamInput[flavorNum]} *(${IDInput[flavorNum] !== 'official' ? client.users.cache.get(IDInput[flavorNum]) : 'Official'})*`
			
					if (repeatScoops == 'false') {
						iceCreamInput.splice(flavorNum, 1)
						IDInput.splice(flavorNum, 1)
					}
				}
			}
		
			console.log(`Flavors: ${iceCreamResults}\nIDs: ${iceCreamIDList}`)
		
			var filtered = new Set(iceCreamResults);
			var iceCreamFiltered = [...filtered]
			var iceCreamName = iceCreamFiltered.join(' ');
		
			///////////
			// IMAGE //
			///////////
		
			const canvas = Canvas.createCanvas(201, 240 + (62 * iceCreamResults.length));
			const context = canvas.getContext('2d');
		
			// Since the image takes time to load, you should await it
			const cone = await Canvas.loadImage('./images/foodgenerators/icecream/cone.png')
		
			// This uses the canvas dimensions to stretch the image onto the entire canvas
			var coneY = canvas.height - 240
			context.drawImage(cone, 20, coneY, 161, 231);
		
			var lastScoopY
			for (var i = 1; i <= scoops; i++) {
				var scoop

				if (iceCreamIDList[iceCreamIDList.length - i] == 'official')
					try {
						scoop = await Canvas.loadImage(`./images/foodgenerators/icecream/scoopflavors/${iceCreamResults[iceCreamResults.length - i]}.png`)
					} catch (error) {
						scoop = await Canvas.loadImage(`./images/foodgenerators/icecream/error_scoop.png`)
					}
				else {
					try {
						scoop = await Canvas.loadImage(foodFile[iceCreamIDList[iceCreamIDList.length - i]]['iceCream']['flavors'][iceCreamResults[iceCreamResults.length - i]].image)
					} catch (error) {
						scoop = await Canvas.loadImage(`./images/foodgenerators/icecream/error_scoop.png`)
					}
				}
		
				lastScoopY = coneY - 57 - 62 * (i-1)
				context.drawImage(scoop, 20, lastScoopY, 161, 155);
			}
		
			// Use the helpful Attachment class structure to process the file for you
			const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'icecream-result.png');
		
			//////////////////
			// Last Touches //
			//////////////////
		
			if (iceCreamResults.length > 8) {
				embed = new Discord.MessageEmbed()
					.setColor('#F0B2ED')
					.setTitle(`Current Ice Cream Flavors:`)
					.setDescription(`${iceCreamFlavorList}`)
					.setFooter(`Ice Cream`);
		
				message.author.send({embeds: [embed]})
				iceCreamFlavorList = `*Too many scoops in this field.\nYou should get a DM with the flavor list.*`
			}
		
			if (scoops < 1) {
				scoops = 0
				iceCreamFlavorList = `\nNone`
				iceCreamName = `Cone Only`
			}
		
			if (iceCreamName.length > 128)
				iceCreamName = "Title too long to process."

			console.log(scoops)
		
			embed = new Discord.MessageEmbed()
					.setColor('#F0B2ED')
					.setTitle(`${iceCreamName} ${iceCreamName == "Title too long to process." ? '' : 'Ice Cream'}`)
					.addFields(
						{ name: 'Scoops', value: `${scoops}`, inline: true },
						{ name: 'Flavors', value: `${iceCreamFlavorList}`, inline: false },
					)
					.setImage(`attachment://icecream-result.png`)
					.setFooter(`Ice Cream`);
		
			return message.channel.send({embeds: [embed], files: [attachment]})
		}
	}

	if (command == 'foodprivacy') {
		var foodPath = dataPath+'/foodConfig.json'
		var foodRead = fs.readFileSync(foodPath);
		var foodFile = JSON.parse(foodRead);

		if (!foodFile[message.author.id]) {
			foodFile[message.author.id] = {}

			fs.writeFileSync(foodPath, JSON.stringify(foodFile, null, '    '));
		}

		if (!foodFile[message.author.id]['privacy']) {
			foodFile[message.author.id]['privacy'] = {
				globalBlock: false
			}

			fs.writeFileSync(foodPath, JSON.stringify(foodFile, null, '    '));
		}

		if (!foodFile[message.author.id]['privacy'][message.guild.id]) {
			foodFile[message.author.id]['privacy'][message.guild.id] = {
				blockedServer: false,
				blockedCategories: [],
				blockedChannels: []
			}

			fs.writeFileSync(foodPath, JSON.stringify(foodFile, null, '    '));
		}

		const arg = message.content.slice(prefix.length).trim().split(/ +/);
		
		if ((arg[1] !== 'global' && arg[1] !== 'server' && arg[1] !== 'category' && arg[1] !== 'channel') || !arg[1] ) {

			const isGlobalBlock = foodFile[message.author.id]['privacy'].globalBlock == true ? 'Yes' : 'No'
			const isServerBlock = foodFile[message.author.id]['privacy'][message.guild.id].blockedServer == true ? 'Yes' : 'No'

			let categoryBlock = ``

			for (i in foodFile[message.author.id]['privacy'][message.guild.id].blockedCategories) {
				var categoryID = foodFile[message.author.id]['privacy'][message.guild.id].blockedCategories[i]
				var category = message.guild.channels.cache.get(categoryID)
				categoryBlock += `\n- ${category.name} *(${category.isText() ? 'Thread Parent' : 'Category'})*`
			}

			if (categoryBlock == ``)
			categoryBlock = `None`

			let channelBlock = ``

			for (i in foodFile[message.author.id]['privacy'][message.guild.id].blockedChannels) {
				var channelID = foodFile[message.author.id]['privacy'][message.guild.id].blockedChannels[i]
				var channel = message.guild.channels.cache.get(channelID)
				channelBlock += `\n- ${channel.name} *(${channel.isThread() ? 'Thread' : 'Channel'})*`
			}

			if (channelBlock == ``)
			channelBlock = `None`

			embed = new Discord.MessageEmbed()
			.setColor('#0099ff')
			.setTitle(`Food Privacy for ${message.author.username}`)
			.setDescription(`If you want to set privacy, try:\n**${prefix}${command} global** - for setting the global privacy\n**${prefix}${command} server** - for setting the current server's privacy\n**${prefix}${command} category** - for setting the privacy of a category you're in\n**${prefix}${command} channel** - for setting the privacy of a channel you're in\n\n_ _`)
			.addFields(
				{ name: 'Globally private', value: `${isGlobalBlock}`, inline: true },
				{ name: `Private everywhere in ${message.guild.name}`, value: `${isServerBlock}`, inline: true },
				{ name: `Private ${message.guild.name} categories/thread parents`, value: `${categoryBlock}`, inline: false },
				{ name: `Private ${message.guild.name} channels/threads`, value: `${channelBlock}`, inline: false },
			)

			return message.channel.send({embeds: [embed]})
		}

		if (arg[1] == 'global') {
			foodFile[message.author.id]['privacy'].globalBlock = !foodFile[message.author.id]['privacy'].globalBlock
			fs.writeFileSync(foodPath, JSON.stringify(foodFile, null, '    '));

			message.channel.send(`Your food lists are ${foodFile[message.author.id]['privacy'].globalBlock == true ? 'now private globally.' : 'no longer globally private.'}`)
		}

		if (arg[1] == 'server') {
			foodFile[message.author.id]['privacy'][message.guild.id].blockedServer = !foodFile[message.author.id]['privacy'][message.guild.id].blockedServer
			fs.writeFileSync(foodPath, JSON.stringify(foodFile, null, '    '));

			message.channel.send(`Your food lists are ${foodFile[message.author.id]['privacy'][message.guild.id].blockedServer ? 'now private for this server.' : 'no longer private for this server.'}`)
		}

		if (arg[1] == 'category') {
			
			var categoryID = message.channel.parentId

			if (categoryID == null)
			return message.channel.send(`There isn't a category this channel is appended to.`)

			var addOrReduce = "add"
			
			for (i in foodFile[message.author.id]['privacy'][message.guild.id].blockedCategories) {
				if (foodFile[message.author.id]['privacy'][message.guild.id].blockedCategories[i] == categoryID)
				addOrReduce = "reduce"
			}

			if (addOrReduce == 'add') {
				foodFile[message.author.id]['privacy'][message.guild.id].blockedCategories.push(categoryID)
				message.channel.send(`Your food lists are now private for the **${message.channel.parent.name}** ${message.channel.parent.isText() ? 'thread parent' : 'category'}.`)
			} else {
				foodFile[message.author.id]['privacy'][message.guild.id].blockedCategories.splice(foodFile[message.author.id]['privacy'][message.guild.id].blockedCategories.indexOf(categoryID), 1)
				message.channel.send(`Your food lists are no longer private for the **${message.channel.parent.name}** ${message.channel.parent.isText() ? 'thread parent' : 'category'}.`)
			}

			fs.writeFileSync(foodPath, JSON.stringify(foodFile, null, '    '));
		}

		if (arg[1] == 'channel') {
			
			var channelID = message.channel.id

			var addOrReduce = "add"
			
			for (i in foodFile[message.author.id]['privacy'][message.guild.id].blockedChannels) {
				if (foodFile[message.author.id]['privacy'][message.guild.id].blockedChannels[i] == channelID)
				addOrReduce = "reduce"
			}

			if (addOrReduce == 'add') {
				foodFile[message.author.id]['privacy'][message.guild.id].blockedChannels.push(channelID)
				message.channel.send(`Your food lists are now private for the **${message.channel.name}** ${message.channel.isThread() ? 'thread' : 'channel'}.`)
			} else {
				foodFile[message.author.id]['privacy'][message.guild.id].blockedChannels.splice(foodFile[message.author.id]['privacy'][message.guild.id].blockedChannels.indexOf(channelID), 1)
				message.channel.send(`Your food lists are no longer private for the **${message.channel.name}** ${message.channel.isThread() ? 'thread' : 'channel'}.`)
			}

			fs.writeFileSync(foodPath, JSON.stringify(foodFile, null, '    '));
		}
	}

	if (command == 'listfood') {
		const arg = message.content.slice(prefix.length).trim().split(/ +/);

		if (!arg[1] || (arg[1] && !arg[2])) {
			const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle(`${prefix}listfood`)
				.setDescription(`(Args <Category> <'official'/'users'/__<User ID / User Mention>__/'me'/'all'>)\nWill make a list of food in a certain categorys.`)
            message.channel.send({embeds: [DiscordEmbed]})
            return false
		}

		var foodPath = dataPath+'/foodConfig.json'
		var foodRead = fs.readFileSync(foodPath);
		var foodFile = JSON.parse(foodRead);

		var skillTxt = []
		var nameTxt = []
		var ownerTxt = []

		if ((arg[1] && arg[1].toLowerCase() !== 'ic_flavor' && arg[1].toLowerCase() !== 'pi_sauce' && arg[1].toLowerCase() !== 'pi_cheese' && arg[1].toLowerCase() !== 'pi_topping'
		&& arg[1].toLowerCase() !== 'pi_condiment') || !arg[1]) {
		const DiscordEmbed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle(`Invalid`)
			.setDescription(`This is not a valid food category. Please use:`)
			.addFields(
				{ name: `ic_flavor`, value: `This is for ice cream flavors.`, inline: true },
				{ name: `pi_sauce`, value: `This is for pizza sauces.`, inline: true },
				{ name: `pi_cheese`, value: `This is for pizza cheeses.`, inline: true },
				{ name: `pi_topping`, value: `This is for pizza toppings.`, inline: true },
				{ name: `pi_condiment`, value: `This is for pizza condiments.`, inline: true },
			)
        message.channel.send({embeds: [DiscordEmbed]})
        return false
		}

		var category = arg[1].toLowerCase()

		var catText = ''

		var begmean = ''
		var midmean = ''

		if (category.startsWith(`ic_`)) {
			begmean = 'iceCream'

			if (category.includes(`flavor`)) {
				midmean = 'flavors'
				catText = 'ice cream flavors'
			}
		}else if (category.startsWith(`pi_`)) {
			begmean = 'pizza'

			if (category.includes(`sauce`)) {
				midmean = 'sauces'
				catText = 'pizza sauces'
			} else if (category.includes(`cheese`)) {
				midmean = 'cheeses'
				catText = 'pizza cheeses'
			} else if (category.includes(`topping`)) {
				midmean = 'toppings'
				catText = 'pizza toppings'
			} else if (category.includes(`condiment`)) {
				midmean = 'condiments'
				catText = 'pizza condiments'
			}
		}

		//this is for official ice cream
		if (arg[2] == 'official' || arg[2] == 'all') {
			for (const i in foodFile['official'][begmean][midmean]) {
				skillTxt.push(foodFile['official'][begmean][midmean][i])
				nameTxt.push(i)
				ownerTxt.push('official')
			}
		}
		//and now, for user-based ice cream
		let users = await message.guild.members.fetch().catch(console.error);
		let list = users.map(m => m.id)
		//firstly, the all and users options
		if (arg[2] == 'all' || arg[2] == 'users') {
			for (const userID in foodFile) {
				for (const i in list) {
					if (list[i] == userID) {

						var skip = false

						//global block
						if (foodFile[userID]['privacy'].globalBlock == true)
						skip = true

						//server block
						if (foodFile[userID]['privacy'][message.guild.id].blockedServer == true)
						skip = true

						//category block
						for (const categories in foodFile[userID]['privacy'][message.guild.id].blockedCategories) {
							if (message.channel.parentId == foodFile[userID]['privacy'][message.guild.id].blockedCategories[categories])
							skip = true
						}

						//channel block
						for (const channels in foodFile[userID]['privacy'][message.guild.id].blockedChannels) {
							if (message.channel.id == foodFile[userID]['privacy'][message.guild.id].blockedChannels[channels])
							skip = true
						}

						if (skip == false) {
							for (const i in foodFile[userID][begmean][midmean]) {
								skillTxt.push(foodFile[userID][begmean][midmean][i])
								nameTxt.push(i)
								ownerTxt.push(userID)
							}
						}
					}
				}
			}
			if (skillTxt.length < 2)
			return message.channel.send(`There aren't any user-based ${catText} available to the public yet.`)
		}

		if (arg[2] == 'me') {
			var userID = message.author.id
			var userName = message.author.username

			if (!foodFile[userID] || !foodFile[userID][begmean] || !foodFile[userID][begmean][midmean] || foodFile[userID][begmean][midmean] == {})
			return message.channel.send(`You don't have any ${catText} set.`)

			for (const i in foodFile[userID][begmean][midmean]) {
				skillTxt.push(foodFile[userID][begmean][midmean][i])
				nameTxt.push(i)
				ownerTxt.push(userID)
			}
		}

		if (arg[2] !== 'all' && arg[2] !== 'users' && arg[2] !== 'official' && arg[2] !== 'me' && arg[2]) {
			if (message.mentions.users.first())
			arg[3] = message.mentions.users.first()
			else {
			arg[3] = client.users.cache.find(user => user.id === arg[2].toString())

			if (arg[3] == undefined)
			return message.channel.send(`Please provide a valid member ID, or mention someone.`)
			}

			var userID = arg[3].id
			var userName = arg[3].username

			if (!foodFile[userID] || !foodFile[userID][begmean] || !foodFile[userID][begmean][midmean] || foodFile[userID][begmean][midmean] == {})
			return message.channel.send(`${userName} doesn't have any ${catText} set.`)

			var skip = false

			if (userID !== message.author.id) {
				//global block
				if (foodFile[userID]['privacy'].globalBlock == true)
				skip = true

				//server block
				if (foodFile[userID]['privacy'][message.guild.id].blockedServer == true)
				skip = true

				//category block
				for (const categories in foodFile[userID]['privacy'][message.guild.id].blockedCategories) {
					if (message.channel.parentId == foodFile[userID]['privacy'][message.guild.id].blockedCategories[categories])
					skip = true
				}

				//channel block
				for (const channels in foodFile[userID]['privacy'][message.guild.id].blockedChannels) {
					if (message.channel.id == foodFile[userID]['privacy'][message.guild.id].blockedChannels[channels])
					skip = true
				}
			}

			if (skip == true)
			return message.channel.send(`${userName}'s list is private.`)

			if (skip == false) {
				for (const i in foodFile[userID][begmean][midmean]) {
					skillTxt.push(foodFile[userID][begmean][midmean][i])
					nameTxt.push(i)
					ownerTxt.push(userID)
				}
			}
		}

		sendFoodArray(message.channel, skillTxt, nameTxt, ownerTxt)
	}

	if (command == 'searchfood') {
		const arg = message.content.slice(prefix.length).trim().split(/ +/);

		if (!arg[1]) {
			const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle(`${prefix}searchfood`)
				.setDescription(`(Args <Category> <Search Parameter(s)>)\nWill search within a certain food category given the search parameter.`)
            message.channel.send({embeds: [DiscordEmbed]})
            return false
		}

		var foodPath = dataPath+'/foodConfig.json'
		var foodRead = fs.readFileSync(foodPath);
		var foodFile = JSON.parse(foodRead);

		var skillTxt = []
		var nameTxt = []
		var ownerTxt = []

		let input = message.content.slice(prefix.length).trim()
		input = input.slice(command.length).trim()

		const regex = new RegExp('"[^"]+"|[\\S]+', 'g');
		let arguments = [];
		input.match(regex).forEach(element => {
			if (!element) return;
			return arguments.push(element.replace(/"/g, ''));
		});

		if ((arguments[0] && arguments[0].toLowerCase() !== 'ic_flavor' && arguments[0].toLowerCase() !== 'pi_sauce' && arguments[0].toLowerCase() !== 'pi_cheese' && arguments[0].toLowerCase() !== 'pi_topping'
		&& arguments[0].toLowerCase() !== 'pi_condiment') || !arguments[0]) {
		const DiscordEmbed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle(`Invalid`)
			.setDescription(`This is not a valid food category. Please use:`)
			.addFields(
				{ name: `ic_flavor`, value: `This is for ice cream flavors.`, inline: true },
				{ name: `pi_sauce`, value: `This is for pizza sauces.`, inline: true },
				{ name: `pi_cheese`, value: `This is for pizza cheeses.`, inline: true },
				{ name: `pi_topping`, value: `This is for pizza toppings.`, inline: true },
				{ name: `pi_condiment`, value: `This is for pizza condiments.`, inline: true },
			)
        message.channel.send({embeds: [DiscordEmbed]})
        return false
		}

		if (!arguments[1]) {
			message.channel.send(`Please specify a search parameter.`)
		}

		let searchP = arguments[1]
		var category = arguments[0]

		var catText = ''

		var begmean = ''
		var midmean = ''

		if (category.startsWith(`ic_`)) {
			begmean = 'iceCream'

			if (category.includes(`flavor`)) {
				midmean = 'flavors'
				catText = 'flavor'
			}
		}else if (category.startsWith(`pi_`)) {
			begmean = 'pizza'

			if (category.includes(`sauce`)) {
				midmean = 'sauces'
				catText = 'sauce'
			} else if (category.includes(`cheese`)) {
				midmean = 'cheeses'
				catText = 'cheese'
			} else if (category.includes(`topping`)) {
				midmean = 'toppings'
				catText = 'topping'
			} else if (category.includes(`condiment`)) {
				midmean = 'condiments'
				catText = 'condiment'
			}
		}

		//this is for official ice cream
		for (const i in foodFile['official'][begmean][midmean]) {
			if (i.includes(searchP)) {
				skillTxt.push(foodFile['official'][begmean][midmean][i])
				nameTxt.push(i)
				ownerTxt.push('official')
			}
		}
		//and now, for user-based ice cream
		let users = await message.guild.members.fetch().catch(console.error);
		let list = users.map(m => m.id)

		for (const userID in foodFile) {
			for (const i in list) {
				if (list[i] == userID) {

					var skip = false

					//global block
					if (foodFile[userID]['privacy'].globalBlock == true)
					skip = true

					//server block
					if (foodFile[userID]['privacy'][message.guild.id].blockedServer == true)
					skip = true

					//category block
					for (const categories in foodFile[userID]['privacy'][message.guild.id].blockedCategories) {
						if (message.channel.parentId == foodFile[userID]['privacy'][message.guild.id].blockedCategories[categories])
						skip = true
					}

					//channel block
					for (const channels in foodFile[userID]['privacy'][message.guild.id].blockedChannels) {
						if (message.channel.id == foodFile[userID]['privacy'][message.guild.id].blockedChannels[channels])
						skip = true
					}

					if (skip == false) {
						for (const i in foodFile[userID][begmean][midmean]) {
							if (i.includes(searchP)) {
								skillTxt.push(foodFile[userID][begmean][midmean][i])
								nameTxt.push(i)
								ownerTxt.push(userID)
							}
						}
					}
				}
			}
		}

		if (skillTxt.length < 1)
			return message.channel.send(`There aren't any ${catText} with **${searchP}** yet.`)
		
		sendFoodArray(message.channel, skillTxt, nameTxt, ownerTxt)
	}

	if (command == 'makefood') {
		const arg = message.content.slice(prefix.length).trim().split(/ +/);

		if (!arg[1]) {
			const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle(`${prefix}makefood`)
				.setDescription(`(Args <Name> <Category> <Image Link / Attachment>)\nI will make your very own ice cream flavor available to the ice cream generator.\n\n**Name:** It can be pretty much any name you want.`
				+`\n**Category:** There are some categories. If you want to see them, just type a random name after the command and nothing else.\n**Image:** You are going to be fine with it as long as it is an image file/link. **Almost however.**\n`
				+`You see, the bigger the image in size, the longer things will load for everyone, making a huge delay. This means that a 10 MB file would take way longer than a 5 KB file. Huge stuff.\n`
				+`There is of course no legitimate limit on the size, but for everyone's sanity, it is recommended to stick to the template's size or smaller.\n\n You can grab templates with the ${prefix}foodtemplate command.`)
            message.channel.send({embeds: [DiscordEmbed]})
            return false
		}

		if (message.mentions.roles.first() || message.mentions.users.first() || message.mentions.channels.first() || message.content.includes(`@everyone`) || message.content.includes(`@here`))
		return message.channel.send(`You really gotta be mean, huh?`)

		let input = message.content.slice(prefix.length).trim()
		input = input.slice(command.length).trim()

		const regex = new RegExp('"[^"]+"|[\\S]+', 'g');
		let arguments = [];
		input.match(regex).forEach(element => {
			if (!element) return;
			return arguments.push(element.replace(/"/g, ''));
		});

		if ((arguments[1] && arguments[1].toLowerCase() !== 'ic_flavor' && arguments[1].toLowerCase() !== 'pi_sauce' && arguments[1].toLowerCase() !== 'pi_cheese' && arguments[1].toLowerCase() !== 'pi_topping'
		&& arguments[1].toLowerCase() !== 'pi_condiment') || !arguments[1]) {
		const DiscordEmbed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle(`Invalid`)
			.setDescription(`This is not a valid food category. Please use:`)
			.addFields(
				{ name: `ic_flavor`, value: `This is for ice cream flavors.`, inline: true },
				{ name: `pi_sauce`, value: `This is for pizza sauces.`, inline: true },
				{ name: `pi_cheese`, value: `This is for pizza cheeses.`, inline: true },
				{ name: `pi_topping`, value: `This is for pizza toppings.`, inline: true },
				{ name: `pi_condiment`, value: `This is for pizza condiments.`, inline: true },
			)
        message.channel.send({embeds: [DiscordEmbed]})
        return false
		}

		var name = arguments[0]
		var category = arguments[1].toLowerCase()
		var imageFile

		if (message.attachments.first() && 
		(   message.attachments.first().url.endsWith('.png') || message.attachments.first().url.endsWith('.jpg') || message.attachments.first().url.endsWith('.jpeg') ||
			message.attachments.first().url.endsWith('.bmp') || message.attachments.first().url.endsWith('.gif') || message.attachments.first().url.endsWith('.apng') ||
			message.attachments.first().url.endsWith('.tif') || message.attachments.first().url.endsWith('.tiff')   ))
		imageFile = message.attachments.first().url;
		else if (arguments[2]) {

			if (arguments[2].startsWith('<'))
			arguments[2] = arguments[2].slice(1, -1)

			if ((arguments[2].startsWith('http') || arguments[2].startsWith('https')) && 
			(   arguments[2].endsWith('.png') || arguments[2].endsWith('.jpg') || arguments[2].endsWith('.jpeg') ||
				arguments[2].endsWith('.bmp') || arguments[2].endsWith('.gif') || arguments[2].endsWith('.apng') ||
				arguments[2].endsWith('.tif') || arguments[2].endsWith('.tiff')   ))
			imageFile = arguments[2];
			else
				return message.channel.send("Please send a valid URL or image.");
		} else
			return message.channel.send("Please send a valid URL or image.");

		var foodPath = dataPath+'/foodConfig.json'
		var foodRead = fs.readFileSync(foodPath);
		var foodFile = JSON.parse(foodRead);

		if (!foodFile[message.author.id]) {
			foodFile[message.author.id] = {}

			fs.writeFileSync(foodPath, JSON.stringify(foodFile, null, '    '));
		}

		var catText = ''
		var smalltext = ''

		var begmean = ''
		var midmean = ''

		if (category.startsWith(`ic_`)) {
			begmean = 'iceCream'

			if (category.includes(`flavor`)) {
				midmean = 'flavors'
				catText = 'an ice cream flavor'
				smalltext = 'flavor'
			}
		}else if (category.startsWith(`pi_`)) {
			begmean = 'pizza'

			if (category.includes(`sauce`)) {
				midmean = 'sauces'
				catText = 'a pizza sauce'
				smalltext = 'sauce'
			} else if (category.includes(`cheese`)) {
				midmean = 'cheeses'
				catText = 'a pizza cheese'
				smalltext = 'cheese'
			} else if (category.includes(`topping`)) {
				midmean = 'toppings'
				catText = 'a pizza topping'
				smalltext = 'topping'
			} else if (category.includes(`condiment`)) {
				midmean = 'condiments'
				catText = 'a pizza condiment'
				smalltext = 'condiment'
			}
		}

		if (!foodFile[message.author.id][begmean]) {
			foodFile[message.author.id][begmean] = {}

			fs.writeFileSync(foodPath, JSON.stringify(foodFile, null, '    '));
		}

		if (!foodFile[message.author.id][begmean][midmean]) {
			foodFile[message.author.id][begmean][midmean] = {}

			fs.writeFileSync(foodPath, JSON.stringify(foodFile, null, '    '));
		}

		if (foodFile[message.author.id][begmean][midmean][name])
		return message.channel.send(`The **${name}** ${smalltext} already exists in your list.`)

		foodFile[message.author.id][begmean][midmean][name] = {
			image: imageFile
		}

		fs.writeFileSync(foodPath, JSON.stringify(foodFile, null, '    '));

		message.channel.send(`**${name}** registered as ${catText}.`)
	}

	if (command == 'foodtemplate') {
		const arg = message.content.slice(prefix.length).trim().split(/ +/);

		if (!arg[1]) {
			const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle(`${prefix}foodtemplate`)
				.setDescription(`(Args <Category>)\nGet yourself a textbook example of what to make for a certain food category.`)
            message.channel.send({embeds: [DiscordEmbed]})
            return false
		}

		if ((arg[1] && arg[1].toLowerCase() !== 'ic_flavor' && arg[1].toLowerCase() !== 'pi_sauce' && arg[1].toLowerCase() !== 'pi_cheese' && arg[1].toLowerCase() !== 'pi_topping'
		&& arg[1].toLowerCase() !== 'pi_condiment') || !arg[1]) {
		const DiscordEmbed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle(`Invalid`)
			.setDescription(`This is not a valid food category. Please use:`)
			.addFields(
				{ name: `ic_flavor`, value: `This is for ice cream flavors.`, inline: true },
				{ name: `pi_sauce`, value: `This is for pizza sauces.`, inline: true },
				{ name: `pi_cheese`, value: `This is for pizza cheeses.`, inline: true },
				{ name: `pi_topping`, value: `This is for pizza toppings.`, inline: true },
				{ name: `pi_condiment`, value: `This is for pizza condiments.`, inline: true },
			)
        message.channel.send({embeds: [DiscordEmbed]})
        return false
		}

		var category = arg[1]

		var catText = ''
		var attachment

		if (category.startsWith(`ic_`)) {
			if (category.includes(`flavor`)) {
				catText = 'Ice Cream Flavor'
				attachment = new Discord.MessageAttachment(`./images/foodgenerators/icecream/scoopflavors/Vanilla.png`, 'template.png');
			}
		}else if (category.startsWith(`pi_`)) {
			if (category.includes(`sauce`)) {
				catText = 'Pizza Sauce'
				attachment = new Discord.MessageAttachment(`./images/foodgenerators/pizza/sauces/Traditional.png`, 'template.png');
			} else if (category.includes(`cheese`)) {
				catText = 'Pizza Cheese'
				attachment = new Discord.MessageAttachment(`./images/foodgenerators/pizza/cheeses/Cheddar.png`, 'template.png');
			} else if (category.includes(`topping`)) {
				catText = 'Pizza Topping'
				attachment = new Discord.MessageAttachment(`./images/foodgenerators/pizza/toppings/Champignons.png`, 'template.png');
			} else if (category.includes(`condiment`)) {
				catText = 'Pizza Condiment'
				attachment = new Discord.MessageAttachment(`./images/foodgenerators/pizza/condiments/Ketchup.png`, 'template.png');
			}
		}

		const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle(`${catText} Template`)
				.setDescription(`You don't have to follow the template to a tee but it is a textbook example.`)
				.setImage('attachment://template.png')
		return message.channel.send({embeds: [DiscordEmbed], files: [attachment]})
	}

	if (command == 'removefood') {
		const arg = message.content.slice(prefix.length).trim().split(/ +/);

		if (!arg[1]) {
			const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle(`${prefix}removefood`)
				.setDescription(`(Args <Category> <Name>)\nIf you don't want your flavor to be there, I can make it gone.`)
            message.channel.send({embeds: [DiscordEmbed]})
            return false
		}

		if (message.mentions.roles.first() || message.mentions.users.first() || message.mentions.channels.first() || message.content.includes(`@everyone`) || message.content.includes(`@here`))
		return message.channel.send(`You really gotta be mean, huh?`)

		let input = message.content.slice(prefix.length).trim()
		input = input.slice(command.length).trim()

		const regex = new RegExp('"[^"]+"|[\\S]+', 'g');
		let arguments = [];
		input.match(regex).forEach(element => {
			if (!element) return;
			return arguments.push(element.replace(/"/g, ''));
		});

		if ((arguments[0] && arguments[0].toLowerCase() !== 'ic_flavor' && arguments[0].toLowerCase() !== 'pi_sauce' && arguments[0].toLowerCase() !== 'pi_cheese' && arguments[0].toLowerCase() !== 'pi_topping'
		&& arguments[0].toLowerCase() !== 'pi_condiment') || !arguments[0]) {
		const DiscordEmbed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle(`Invalid`)
			.setDescription(`This is not a valid food category. Please use:`)
			.addFields(
				{ name: `ic_flavor`, value: `This is for ice cream flavors.`, inline: true },
				{ name: `pi_sauce`, value: `This is for pizza sauces.`, inline: true },
				{ name: `pi_cheese`, value: `This is for pizza cheeses.`, inline: true },
				{ name: `pi_topping`, value: `This is for pizza toppings.`, inline: true },
				{ name: `pi_condiment`, value: `This is for pizza condiments.`, inline: true },
			)
        message.channel.send({embeds: [DiscordEmbed]})
        return false
		}

		var name = arguments[1]
		var category = arguments[0].toLowerCase()

		var foodPath = dataPath+'/foodConfig.json'
		var foodRead = fs.readFileSync(foodPath);
		var foodFile = JSON.parse(foodRead);

		var catText = ''

		var begmean = ''
		var midmean = ''

		if (category.startsWith(`ic_`)) {
			begmean = 'iceCream'

			if (category.includes(`flavor`)) {
				midmean = 'flavors'
				catText = 'flavor'
			}
		}else if (category.startsWith(`pi_`)) {
			begmean = 'pizza'

			if (category.includes(`sauce`)) {
				midmean = 'sauces'
				catText = 'sauce'
			} else if (category.includes(`cheese`)) {
				midmean = 'cheeses'
				catText = 'cheese'
			} else if (category.includes(`topping`)) {
				midmean = 'toppings'
				catText = 'topping'
			} else if (category.includes(`condiment`)) {
				midmean = 'condiments'
				catText = 'condiment'
			}
		}

		if (!foodFile[message.author.id] || !foodFile[message.author.id][begmean] || !foodFile[message.author.id][begmean][midmean])
		return message.channel.send(`You don't have any ${catText}s set.`)

		if (!foodFile[message.author.id][begmean][midmean][name])
		return message.channel.send(`The **${name}** ${catText} doesn't exist in your list.`)

		var length = 0

		for (const i in foodFile[message.author.id][begmean][midmean])
		length++

		if (length > 1) {
			delete foodFile[message.author.id][begmean][midmean][name]
			fs.writeFileSync(foodPath, JSON.stringify(foodFile, null, '    '));
		} else {
			delete foodFile[message.author.id][begmean][midmean]
			fs.writeFileSync(foodPath, JSON.stringify(foodFile, null, '    '));
		}

		message.channel.send(`Removed the **${name}** ${catText}.`)
	}

	if (command == 'renamefood') {
		const arg = message.content.slice(prefix.length).trim().split(/ +/);

		if (!arg[1]) {
			const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle(`${prefix}renamefood`)
				.setDescription(`(Args <Category> <Name> <New Name>)\nI will change the name of your ice cream flavor from one to another.`)
            message.channel.send({embeds: [DiscordEmbed]})
            return false
		}

		if (message.mentions.roles.first() || message.mentions.users.first() || message.mentions.channels.first() || message.content.includes(`@everyone`) || message.content.includes(`@here`))
		return message.channel.send(`You really gotta be mean, huh?`)

		let input = message.content.slice(prefix.length).trim()
		input = input.slice(command.length).trim()

		const regex = new RegExp('"[^"]+"|[\\S]+', 'g');
		let arguments = [];
		input.match(regex).forEach(element => {
			if (!element) return;
			return arguments.push(element.replace(/"/g, ''));
		});

		if ((arguments[0] && arguments[0].toLowerCase() !== 'ic_flavor' && arguments[0].toLowerCase() !== 'pi_sauce' && arguments[0].toLowerCase() !== 'pi_cheese' && arguments[0].toLowerCase() !== 'pi_topping'
		&& arguments[0].toLowerCase() !== 'pi_condiment') || !arguments[0]) {
		const DiscordEmbed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle(`Invalid`)
			.setDescription(`This is not a valid food category. Please use:`)
			.addFields(
				{ name: `ic_flavor`, value: `This is for ice cream flavors.`, inline: true },
				{ name: `pi_sauce`, value: `This is for pizza sauces.`, inline: true },
				{ name: `pi_cheese`, value: `This is for pizza cheeses.`, inline: true },
				{ name: `pi_topping`, value: `This is for pizza toppings.`, inline: true },
				{ name: `pi_condiment`, value: `This is for pizza condiments.`, inline: true },
			)
        message.channel.send({embeds: [DiscordEmbed]})
        return false
		}

		var category = arguments[0]
		var name = arguments[1]
		
		if (!arguments[2])
		return message.channel.send(`Please specify the new name for that flavor.`)

		var newname = arguments[2]

		var foodPath = dataPath+'/foodConfig.json'
		var foodRead = fs.readFileSync(foodPath);
		var foodFile = JSON.parse(foodRead);

		var catText = ''

		var begmean = ''
		var midmean = ''

		if (category.startsWith(`ic_`)) {
			begmean = 'iceCream'

			if (category.includes(`flavor`)) {
				midmean = 'flavors'
				catText = 'flavor'
			}
		}else if (category.startsWith(`pi_`)) {
			begmean = 'pizza'

			if (category.includes(`sauce`)) {
				midmean = 'sauces'
				catText = 'sauce'
			} else if (category.includes(`cheese`)) {
				midmean = 'cheeses'
				catText = 'cheese'
			} else if (category.includes(`topping`)) {
				midmean = 'toppings'
				catText = 'topping'
			} else if (category.includes(`condiment`)) {
				midmean = 'condiments'
				catText = 'condiment'
			}
		}

		if (!foodFile[message.author.id] || !foodFile[message.author.id][begmean] || !foodFile[message.author.id][begmean][midmean])
		return message.channel.send(`You don't have any ${catText}s set.`)

		if (!foodFile[message.author.id][begmean][midmean][name])
		return message.channel.send(`**${name}** does not exist in your ${catText} list.`)

		if (foodFile[message.author.id][begmean][midmean][newname])
		return message.channel.send(`**${newname}** already exists. Please change it to another name.`)

		foodFile[message.author.id][begmean][midmean][newname] = foodFile[message.author.id][begmean][midmean][name]
		delete foodFile[message.author.id][begmean][midmean][name]

		fs.writeFileSync(foodPath, JSON.stringify(foodFile, null, '    '));

		message.channel.send(`Changed the name of the **${name}** ${catText} to **${newname}**`)
	}

	if (command == 'foodimage') {
		const arg = message.content.slice(prefix.length).trim().split(/ +/);

		if (!arg[1]) {
			const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle(`${prefix}foodimage`)
				.setDescription(`(Args <Category> <Name> <Image Link / Attachment>)\nI will change the look of your chosen ice cream flavor.`)
            message.channel.send({embeds: [DiscordEmbed]})
            return false
		}

		if (message.mentions.roles.first() || message.mentions.users.first() || message.mentions.channels.first() || message.content.includes(`@everyone`) || message.content.includes(`@here`))
		return message.channel.send(`You really gotta be mean, huh?`)

		let input = message.content.slice(prefix.length).trim()
		input = input.slice(command.length).trim()

		const regex = new RegExp('"[^"]+"|[\\S]+', 'g');
		let arguments = [];
		input.match(regex).forEach(element => {
			if (!element) return;
			return arguments.push(element.replace(/"/g, ''));
		});

		if ((arguments[0] && arguments[0].toLowerCase() !== 'ic_flavor' && arguments[0].toLowerCase() !== 'pi_sauce' && arguments[0].toLowerCase() !== 'pi_cheese' && arguments[0].toLowerCase() !== 'pi_topping'
		&& arguments[0].toLowerCase() !== 'pi_condiment') || !arguments[0]) {
		const DiscordEmbed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle(`Invalid`)
			.setDescription(`This is not a valid food category. Please use:`)
			.addFields(
				{ name: `ic_flavor`, value: `This is for ice cream flavors.`, inline: true },
				{ name: `pi_sauce`, value: `This is for pizza sauces.`, inline: true },
				{ name: `pi_cheese`, value: `This is for pizza cheeses.`, inline: true },
				{ name: `pi_topping`, value: `This is for pizza toppings.`, inline: true },
				{ name: `pi_condiment`, value: `This is for pizza condiments.`, inline: true },
			)
        message.channel.send({embeds: [DiscordEmbed]})
        return false
		}

		var name = arguments[1]
		var category = arguments[0]
		var imageFile

		if (message.attachments.first() && 
		(   message.attachments.first().url.endsWith('.png') || message.attachments.first().url.endsWith('.jpg') || message.attachments.first().url.endsWith('.jpeg') ||
			message.attachments.first().url.endsWith('.bmp') || message.attachments.first().url.endsWith('.gif') || message.attachments.first().url.endsWith('.apng') ||
			message.attachments.first().url.endsWith('.tif') || message.attachments.first().url.endsWith('.tiff')   ))
		imageFile = message.attachments.first().url;
		else if (arguments[2]) {

			if (arguments[2].startsWith('<'))
			arguments[2] = arguments[2].slice(1, -1)

			if ((arguments[2].startsWith('http') || arguments[2].startsWith('https')) && 
			(   arguments[2].endsWith('.png') || arguments[2].endsWith('.jpg') || arguments[2].endsWith('.jpeg') ||
				arguments[2].endsWith('.bmp') || arguments[2].endsWith('.gif') || arguments[2].endsWith('.apng') ||
				arguments[2].endsWith('.tif') || arguments[2].endsWith('.tiff')   ))
			imageFile = arguments[2];
			else
				return message.channel.send("Please send a valid URL or image.");
		} else
			return message.channel.send("Please send a valid URL or image.");

		var foodPath = dataPath+'/foodConfig.json'
		var foodRead = fs.readFileSync(foodPath);
		var foodFile = JSON.parse(foodRead);

		var catText = ''

		var begmean = ''
		var midmean = ''

		if (category.startsWith(`ic_`)) {
			begmean = 'iceCream'

			if (category.includes(`flavor`)) {
				midmean = 'flavors'
				catText = 'flavor'
			}
		}else if (category.startsWith(`pi_`)) {
			begmean = 'pizza'

			if (category.includes(`sauce`)) {
				midmean = 'sauces'
				catText = 'sauce'
			} else if (category.includes(`cheese`)) {
				midmean = 'cheeses'
				catText = 'cheese'
			} else if (category.includes(`topping`)) {
				midmean = 'toppings'
				catText = 'topping'
			} else if (category.includes(`condiment`)) {
				midmean = 'condiments'
				catText = 'condiment'
			}
		}

		if (!foodFile[message.author.id] || !foodFile[message.author.id][begmean] || !foodFile[message.author.id][begmean][midmean])
		return message.channel.send(`You don't have any ${catText}s set.`)

		if (!foodFile[message.author.id][begmean][midmean][name])
		return message.channel.send(`**${name}** does not exist in your ${catText} list.`)

		foodFile[message.author.id][begmean][midmean][name].image = imageFile

		fs.writeFileSync(foodPath, JSON.stringify(foodFile, null, '    '));

		message.channel.send(`Changed the look of the **${name}** ${catText}.`)
	}

	if (command == 'pizza') {
		const crusts = []
		let crustIDs = []

		const sauces = []
		let sauceIDs = []
			
		const cheeses = []
		let cheeseIDs = []
			
		const toppingTypes = []
		let toppingIDs = []
			
		const condimentTypes = []
		let condimentIDs = []

		const arg = message.content.slice(prefix.length).trim().split(/ +/);

		if (!arg[1]) {
			const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle(`${prefix}pizza`)
				.setDescription(`(Args <Amount Of Toppings> <Optional: Amount of Condiments> <Optional: Include Cheese> <Optional: Include Sauce> <Optional: Repeat Toppings> <Optional: Repeat Condiments>)\nI'll make a pizza of any amount of toppings and condiments. You can do up to 100 toppings and 20 condiments.\n\n Alternatively, you can also use:\n(Args <Crust> <Optional: Sauce> <Optional: Cheese>)\n to start making your very own pizza.`)
            message.channel.send({embeds: [DiscordEmbed]})
            return false
		}

		var foodPath = dataPath+'/foodConfig.json'
		var foodRead = fs.readFileSync(foodPath);
		var foodFile = JSON.parse(foodRead);

		let users = await message.guild.members.fetch().catch(console.error);
		let list = users.map(m => m.id)

		//Official Pizza Shit
		for (const flavor in foodFile['official']['pizza']['crusts']) {
			crusts.push(flavor)
			crustIDs.push('official')
		}
		for (const flavor in foodFile['official']['pizza']['sauces']) {
			sauces.push(flavor)
			sauceIDs.push('official')
		}
		for (const flavor in foodFile['official']['pizza']['cheeses']) {
			cheeses.push(flavor)
			cheeseIDs.push('official')
		}
		for (const flavor in foodFile['official']['pizza']['toppings']) {
			toppingTypes.push(flavor)
			toppingIDs.push('official')
		}
		for (const flavor in foodFile['official']['pizza']['condiments']) {
			condimentTypes.push(flavor)
			condimentIDs.push('official')
		}
		//User-Based
		for (const i in list) {
			if (foodFile[list[i]] && foodFile[list[i]]['pizza']) {
				var user = list[i]
				for (const flavor in foodFile[list[i]]['pizza']['crusts']) {
					crusts.push(flavor)
					crustIDs.push(user)
				}
				for (const flavor in foodFile[list[i]]['pizza']['sauces']) {
					sauces.push(flavor)
					sauceIDs.push(user)
				}
				for (const flavor in foodFile[list[i]]['pizza']['cheeses']) {
					cheeses.push(flavor)
					cheeseIDs.push(user)
				}
				for (const flavor in foodFile[list[i]]['pizza']['toppings']) {
					toppingTypes.push(flavor)
					toppingIDs.push(user)
				}
				for (const flavor in foodFile[list[i]]['pizza']['condiments']) {
					condimentTypes.push(flavor)
					condimentIDs.push(user)
				}
			}
		}

		let toppingNumber
		let repeatToppings
		let sauceNumber
		let repeatSauces
		let allowCheese
		let allowSauce

		if (isFinite(parseInt(arg[1]))) {
			if (parseFloat(arg[1]) > 100) {
				message.channel.send(`<:warning:878094052208296007>That's way too much. Please use a number of toppings below or equal to 100. Changing the value to 100`)
				return false
			} else if (parseFloat(arg[1]) < 0) {
				arg[1] = 0
			}

			if (!arg[2])
				arg[2] = 0

			if (parseFloat(arg[2]) > 20) {
				message.channel.send(`<:warning:878094052208296007>That's way too much. Please use a number of condiments below or equal to 20. Changing the value to 20.`)
				arg[2] = 20
			} else if (parseFloat(arg[2]) < 0) {
				arg[2] = 0
			}

			toppingNumber = Math.round(parseInt(arg[1]))
			repeatToppings = `true`
			sauceNumber = Math.round(parseInt(arg[2]))
			repeatSauces = `true`
			allowCheese = 'true'
			allowSauce = 'true'

			if (arg[3] !== `false` || !arg[3])
				allowCheese = `true`
			else
				allowCheese = 'false'

			if (arg[4] !== `false` || !arg[4])
				allowSauce = `true`
			else
				allowSauce = 'false'

			if (arg[5] !== `false` || !arg[5])
				repeatToppings = `true`
			else
				repeatToppings = 'false'

			if (arg[6] !== `false` || !arg[6])
				repeatSauces = `true`
			else
				repeatSauces = 'false'

			if (toppingNumber > 10)
				message.channel.send(`Please wait until your pizza is done.`)

			getPizzaByNumber(toppingNumber, repeatToppings, sauceNumber, repeatSauces, allowCheese, allowSauce, message)
		} else {
			let input = message.content.slice(prefix.length).trim()
			input = input.slice(command.length).trim()

			const regex = new RegExp('"[^"]+"|[\\S]+', 'g');
			let arguments = [];
			input.match(regex).forEach(element => {
				if (!element) return;
				return arguments.push(element.replace(/"/g, ''));
			});

			//assigning variables
			let crustPick = arguments[0]
			let saucePick = arguments[1]
			let cheesePick = arguments[2]

			let toppingPick
			let condimentPick

			var whatwentwrong = ``

			if (crusts.indexOf(crustPick) < 0 && crustPick !== 'None') {
				whatwentwrong += (`\n-${crustPick} is not a valid crust. Defaulting to 'Standard'.`)
				crustPick = 'None'
			}

			if (sauces.indexOf(saucePick) < 0 && saucePick !== 'None') {
				whatwentwrong += (`\n-${saucePick} is not a valid sauce. Defaulting to 'None'.`)
				saucePick = 'None'
			}


			if (cheeses.indexOf(cheesePick) < 0 && cheesePick !== 'None') {
				whatwentwrong += (`\n-${cheesePick} is not a valid cheese. Defaulting to 'None'.`)
				cheesePick = 'None'
			}

			if (whatwentwrong.length > 3)
			message.channel.send(`<:warning:878094052208296007>What went wrong:${whatwentwrong}`)
			.then(msg => {
				setTimeout(() => msg.delete(), 5000)
			})

			var onetoListenTo = message.author.id
			var contentOfMessage

			message.channel.send(`👍 Now please, specify the toppings. You have 5 minutes.\nIf you don't want any toppigns, please type 'None'.`)
			.then(msg => {
				setTimeout(() => msg.delete(), 10000)
			})

			const filter = m => m.author.id === onetoListenTo && !m.content.startsWith(prefix)
			const collectorTopping = message.channel.createMessageCollector({ filter, time: 300000, max: 1 });

			collectorTopping.on('collect', m => {
				console.log(`Collected ${m.content}`);
				contentOfMessage = m.content.toString()
			});

			collectorTopping.on('end', collected => {
				if (collected.size == 0) {
					return message.channel.send(`I'm sorry, ${client.users.cache.get(onetoListenTo)}, but you didn't type in time. Please try again.`)
					.then(msg => {
						setTimeout(() => msg.delete(), 5000)
					})
				}

				let input = contentOfMessage.trim()

				const regex = new RegExp('"[^"]+"|[\\S]+', 'g');
				let arguments = [];
				input.match(regex).forEach(element => {
					if (!element) return;
					return arguments.push(element.replace(/"/g, ''));
				});

				toppingPick = [...arguments]

				if (toppingPick[0] == 'None')
				toppingPick = []

				if (toppingPick.length > 100) {
					message.channel.send(`<:warning:878094052208296007>That's way too much. Please make their amount below or equal to 100. Changing the amount to 100.`)
					.then(msg => {
						setTimeout(() => msg.delete(), 5000)
					})
					toppingPick.length = 100
				}

				let invalidToppings = ''

				for (const i in toppingPick) {
					if (toppingTypes.indexOf(toppingPick[i]) < 0) {
						invalidToppings += `\n- ${toppingPick[i]}`
						toppingPick[i] = ''
					}
				}
				const filterArray=(a,b)=>{return a.filter((e)=>{return e!=b})}
				toppingPick = filterArray(toppingPick,'')

				if (invalidToppings.length > 0) {
					message.channel.send(`<:warning:878094052208296007>**Your invalid toppings are:**${invalidToppings}`)
					.then(msg => {
						setTimeout(() => msg.delete(), 5000)
					})
				}

				message.channel.send(`👍 Now please, specify the condiments. You have 5 minutes.\nIf you don't want any toppings, please type 'None'.`)
				.then(msg => {
					setTimeout(() => msg.delete(), 10000)
				})

				const collectorCondiment = message.channel.createMessageCollector({ filter, time: 300000, max: 1 });

				collectorCondiment.on('collect', m => {
					console.log(`Collected ${m.content}`);
					contentOfMessage = m.content.toString()
				});

				collectorCondiment.on('end', collected => {
					if (collected.size == 0) {
						return message.channel.send(`I'm sorry, ${client.users.cache.get(onetoListenTo)}, but you didn't type in time. Please try again.`)
						.then(msg => {
							setTimeout(() => msg.delete(), 5000)
						})
					}

					let input = contentOfMessage.trim()

					const regex = new RegExp('"[^"]+"|[\\S]+', 'g');
					let arguments = [];
					input.match(regex).forEach(element => {
						if (!element) return;
						return arguments.push(element.replace(/"/g, ''));
					});

					condimentPick = [...arguments]

					if (condimentPick[0] == 'None')
					condimentPick = []

					if (condimentPick.length > 20) {
						message.channel.send(`<:warning:878094052208296007>That's way too much. Please make their amount below or equal to 20. Changing the amount to 20.`)
						.then(msg => {
							setTimeout(() => msg.delete(), 5000)
						})
						condimentPick.length = 20
					}
	
					let invalidCondiments = ''
	
					for (const i in condimentPick) {
						if (condimentTypes.indexOf(condimentPick[i]) < 0) {
							invalidCondiments += `\n- ${condimentPick[i]}`
							condimentPick[i] = ''
						}
					}
					const filterArray=(a,b)=>{return a.filter((e)=>{return e!=b})}
					condimentPick = filterArray(condimentPick,'')
	
					if (invalidCondiments.length > 0) {
						message.channel.send(`<:warning:878094052208296007>**Your invalid condiments are:**${invalidCondiments}`)
						.then(msg => {
							setTimeout(() => msg.delete(), 5000)
						})
					}

					if (toppingPick.length > 10)
					message.channel.send(`Please wait until your pizza is done.`)

					getPizzaByLetter(crustPick,saucePick,cheesePick,toppingPick,condimentPick,message)
				});
			});
		}

		async function getPizzaByNumber(toppings, repeatToppings, condiments, repeatCondiments, allowCheese, allowSauce, message) {
			
			var crustNumber = Math.floor(Math.random() * crusts.length)
			var crust = crusts[crustNumber]
			var crustID = crustIDs[crustNumber]
			
			if (allowSauce == 'true') {
				var sauceNumber = Math.floor(Math.random() * sauces.length)
				var sauce = sauces[sauceNumber]
				var sauceID = sauceIDs[sauceNumber]
			}
			else
				var sauce = "No Sauce"
		
			if (allowCheese == 'true') {
				var cheeseNumber = Math.floor(Math.random() * cheeses.length)
				var cheese = cheeses[cheeseNumber]
				var cheeseID = cheeseIDs[cheeseNumber]
			}
			else
				var cheese = "No Cheese"
		
			//Toppings
			var toppingInput = [...toppingTypes]
			let toppingIDList = []
			var TIDInput = [...toppingIDs]
			let toppingResults = []
			var toppingList = ''
		
			for (var i = 1; i <= toppings; i++) {
		
				if (toppingInput.length < 1) {
					toppingInput = [...toppingTypes]
					TIDInput = [...toppingIDs]
					console.log(`Oops. Ran out of pizza toppings. Repeating the list.`)
				}
		
				var toppingNum = Math.floor(Math.random() * toppingInput.length)
		
				toppingResults.push(toppingInput[toppingNum])
				toppingIDList.push(TIDInput[toppingNum])
				toppingList += `\n- ${toppingInput[toppingNum]} *(${TIDInput[toppingNum] !== 'official' ? client.users.cache.get(TIDInput[toppingNum]) : 'Official'})*`
		
				if (repeatToppings == 'false') {
					toppingInput.splice(toppingNum, 1)
					TIDInput.splice(toppingNum, 1)
				}
			}
		
			console.log(`Toppings: ${toppingResults}\nIDs: ${toppingIDList}`)
		
			var filteredA = new Set(toppingResults);
			var toppingsFilteres = [...filteredA]
			var toppingName = toppingsFilteres.join(' ');
		
			//Condiments
			var condimentInput = [...condimentTypes]
			let condimentResults = []
			let condimentIDList = []
			var CIDInput = [...condimentIDs]
			var condimentList = ''
		
			for (var i = 1; i <= condiments; i++) {
		
				if (condimentInput.length < 1) {
					condimentInput = [...condimentTypes]
					CIDInput = [...condimentIDs]
					console.log(`Oops. Ran out of pizza condiments. Repeating the list.`)
				}
		
				var condimentNum = Math.floor(Math.random() * condimentInput.length)
		
				condimentResults.push(condimentInput[condimentNum])
				condimentIDList.push(CIDInput[condimentNum])
				condimentList += `\n- ${condimentInput[condimentNum]} *(${CIDInput[condimentNum] !== 'official' ? client.users.cache.get(CIDInput[condimentNum]) : 'Official'})*`
		
				if (repeatCondiments == 'false') {
					condimentInput.splice(condimentNum, 1)
					CIDInput.splice(condimentNum, 1)
				}
			}
		
			console.log(`Condiments: ${condimentResults}\nIDs: ${condimentIDList}`)
		
			///////////
			// IMAGE //
			///////////
		
			const canvas = Canvas.createCanvas(180, 180);
			const context = canvas.getContext('2d');
		
			function drawRotated(degrees, image){
				context.save();
			
				context.translate(canvas.width/2,canvas.height/2);
			
				context.rotate(degrees*Math.PI/180);
			
				context.drawImage(image,-image.width/2,-image.width/2);
			
				context.restore();
			}
		
			//crust
			var crustDraw

			if (crustID == 'official')
				try {
					crustDraw = await Canvas.loadImage(`./images/foodgenerators/pizza/crusts/${crust}.png`)
				} catch (error) {
					crustDraw = await Canvas.loadImage(`./images/foodgenerators/pizza/error_crust.png`)
				}
			else {
				try {
					crustDraw = await Canvas.loadImage(foodFile[crustID]['pizza']['crusts'][crust].image)
				} catch (error) {
					crustDraw = await Canvas.loadImage(`./images/foodgenerators/pizza/error_crust.png`)
				}
			}
			drawRotated(0, crustDraw)
			//sauce
			if (allowSauce == 'true') {
				var sauceDraw

				if (sauceID == 'official')
					try {
						sauceDraw = await Canvas.loadImage(`./images/foodgenerators/pizza/sauces/${sauce}.png`)
					} catch (error) {
						sauceDraw = await Canvas.loadImage(`./images/foodgenerators/pizza/error_sauce.png`)
					}
				else {
					try {
						sauceDraw = await Canvas.loadImage(foodFile[sauceID]['pizza']['sauces'][sauce].image)
					} catch (error) {
						sauceDraw = await Canvas.loadImage(`./images/foodgenerators/pizza/error_sauce.png`)
					}
				}
				drawRotated(Math.random() * 360, sauceDraw)
			}
			//cheese
			if (allowCheese == 'true') {
				var cheeseDraw

				if (sauceID == 'official')
					try {
						cheeseDraw = await Canvas.loadImage(`./images/foodgenerators/pizza/cheeses/${cheese}.png`)
					} catch (error) {
						cheeseDraw = await Canvas.loadImage(`./images/foodgenerators/pizza/error_cheese.png`)
					}
				else {
					try {
						cheeseDraw = await Canvas.loadImage(foodFile[cheeseID]['pizza']['cheeses'][cheese].image)
					} catch (error) {
						cheeseDraw = await Canvas.loadImage(`./images/foodgenerators/pizza/error_cheese.png`)
					}
				}
				drawRotated(Math.random() * 360, cheeseDraw)
			}
			//toppings
			for (var i = 1; i <= toppings; i++) {
				var toppingDraw

				if (toppingIDList[toppingIDList.length - i] == 'official')
					try {
						toppingDraw = await Canvas.loadImage(`./images/foodgenerators/pizza/toppings/${toppingResults[toppingResults.length - i]}.png`)
					} catch (error) {
						toppingDraw = await Canvas.loadImage(`./images/foodgenerators/pizza/error_topping.png`)
					}
				else {
					try {
						toppingDraw = await Canvas.loadImage(foodFile[toppingIDList[toppingIDList.length - i]]['pizza']['toppings'][toppingResults[toppingResults.length - i]].image)
					} catch (error) {
						toppingDraw = await Canvas.loadImage(`./images/foodgenerators/pizza/error_topping.png`)
					}
				}
				drawRotated(Math.random() * 360, toppingDraw)
			}
			//condiments
			for (var i = 1; i <= condiments; i++) {
				var condimentDraw

				if (condimentIDList[condimentIDList.length - i] == 'official')
					try {
						condimentDraw = await Canvas.loadImage(`./images/foodgenerators/pizza/condiments/${condimentResults[condimentResults.length - i]}.png`)
					} catch (error) {
						condimentDraw = await Canvas.loadImage(`./images/foodgenerators/pizza/error_condiment.png`)
					}
				else {
					try {
						condimentDraw = await Canvas.loadImage(foodFile[condimentIDList[condimentIDList.length - i]]['pizza']['condiments'][condimentResults[condimentResults.length - i]].image)
					} catch (error) {
						condimentDraw = await Canvas.loadImage(`./images/foodgenerators/pizza/error_condiment.png`)
					}
				}
				drawRotated(Math.random() * 360, condimentDraw)
			}
		
			const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'pizza-result.png');
		
			//////////////////
			// Last Touches //
			//////////////////
		
			if (toppingResults.length > 8) {
				embed = new Discord.MessageEmbed()
					.setColor('#F0B2ED')
					.setTitle(`Current Pizza Toppings:`)
					.setDescription(`${toppingList}`)
					.setFooter(`Pizza`);
		
				message.author.send({embeds: [embed]})
				toppingList = `*Too many toppings in this field.\nYou should get a DM with the topping list.*`
			}
		
			if (condimentResults.length > 8) {
				embed = new Discord.MessageEmbed()
					.setColor('#F0B2ED')
					.setTitle(`Current Pizza Condiments:`)
					.setDescription(`${condimentList}`)
					.setFooter(`Pizza`);
		
				message.author.send({embeds: [embed]})
				condimentList = `*Too many condiments in this field.\nYou should get a DM with the condiment list.*`
			}
		
			if (toppings < 1) {
				toppingList = `\nNone`
				toppingName = `${cheese}`
			}
		
			if (condiments < 1)
				condimentList = `\nNone`
		
			if (toppingName.length > 128)
				toppingName = "Title too long to process."
		
			embed = new Discord.MessageEmbed()
					.setColor('#FF6100')
					.setTitle(`${toppingName} ${toppingName == "Title too long to process." ? '' : 'Pizza'}`)
					.addFields(
						{ name: 'Crust', value: `${crust} ${crustID == undefined ? '' : (crustID == 'official' ? '*(Official)*' : `*(${client.users.cache.get(crustID)})*`)}`, inline: true },
						{ name: 'Sauce', value: `${sauce} ${sauceID == undefined ? '' : (sauceID == 'official' ? '*(Official)*' : `*(${client.users.cache.get(sauceID)})*`)}`, inline: true },
						{ name: 'Cheese', value: `${cheese} ${cheeseID == undefined ? '' : (cheeseID == 'official' ? '*(Official)*' : `*(${client.users.cache.get(cheeseID)})*`)}`, inline: true },
						{ name: 'Topping Number', value: `${toppings}`, inline: false },
						{ name: 'Toppings', value: `${toppingList}`, inline: true },
						{ name: 'Condiment Number', value: `${condiments}`, inline: false },
						{ name: 'Condiments', value: `${condimentList}`, inline: true },
					)
					.setImage(`attachment://pizza-result.png`)
					.setFooter(`Pizza`);
		
			return message.channel.send({embeds: [embed], files: [attachment]})
		}

		async function getPizzaByLetter(crust, sauce, cheese, toppings, condiments, message) {

			if (crust == 'None') {
				crust = 'Standard'
				var crustID = 'official'
			} else {
				var crustID
				var failureLevelC = 0
				var userRandTable = []

				//if this flavor exists in your personal list
				if (Math.round(Math.random() * 100) <= 40) { //which will look into 40% of the time
					if (foodFile[message.author.id] && foodFile[message.author.id]['pizza'] && foodFile[message.author.id]['pizza']['crusts'] && foodFile[message.author.id]['pizza']['crusts'][crust])
					crustID = message.author.id
					else
					failureLevelC = 1
				} else
				failureLevelC = 1
					
				//if not, then it will search through the user list first
				if (failureLevelC == 1) {
					for (const userID in foodFile) {
						for (const a in list) {
							if (list[a] == userID && foodFile[userID]['pizza'] && foodFile[userID]['pizza']['crusts']) {
								for (const flavor in foodFile[userID]['pizza']['crusts']) {
									if (flavor == crust)
									userRandTable.push(userID)
								}
							}
						}
					}

					console.log(userRandTable)

					//and pick a random ID
					if (userRandTable.length > 0)
					crustID = userRandTable[Math.floor(Math.random() * userRandTable.length)]
					else	//and if that fails, we will resort to the official flavors
					crustID = 'official'
				}
			}


			if (sauce == 'None')
				sauce = 'No Sauce'
			else {
				var sauceID
				var failureLevelS = 0
				var userRandTable = []

				//if this flavor exists in your personal list
				if (Math.round(Math.random() * 100) <= 40) { //which will look into 40% of the time
					if (foodFile[message.author.id] && foodFile[message.author.id]['pizza'] && foodFile[message.author.id]['pizza']['sauces'] && foodFile[message.author.id]['pizza']['sauces'][sauce])
					sauceID = message.author.id
					else
					failureLevelS = 1
				} else
				failureLevelS = 1
					
				//if not, then it will search through the user list first
				if (failureLevelS == 1) {
					for (const userID in foodFile) {
						for (const a in list) {
							if (list[a] == userID && foodFile[userID]['pizza'] && foodFile[userID]['pizza']['sauces']) {
								for (const flavor in foodFile[userID]['pizza']['sauces']) {
									if (flavor == sauce)
									userRandTable.push(userID)
								}
							}
						}
					}

					console.log(userRandTable)

					//and pick a random ID
					if (userRandTable.length > 0)
					sauceID = userRandTable[Math.floor(Math.random() * userRandTable.length)]
					else	//and if that fails, we will resort to the official flavors
					sauceID = 'official'
				}
			}

			if (cheese == 'None')
				cheese = 'No Cheese'
			else {
				var cheeseID
				var failureLevel = 0
				var userRandTable = []

				//if this flavor exists in your personal list
				if (Math.round(Math.random() * 100) <= 40) { //which will look into 40% of the time
					if (foodFile[message.author.id] && foodFile[message.author.id]['pizza'] && foodFile[message.author.id]['pizza']['cheeses'] && foodFile[message.author.id]['pizza']['cheeses'][cheese])
					cheeseID = message.author.id
					else
					failureLevel = 1
				} else
				failureLevel = 1
					
				//if not, then it will search through the user list first
				if (failureLevel == 1) {
					for (const userID in foodFile) {
						for (const a in list) {
							if (list[a] == userID && foodFile[userID]['pizza'] && foodFile[userID]['pizza']['cheeses']) {
								for (const flavor in foodFile[userID]['pizza']['cheeses']) {
									if (flavor == cheese)
									userRandTable.push(userID)
								}
							}
						}
					}

					console.log(userRandTable)

					//and pick a random ID
					if (userRandTable.length > 0)
					cheeseID = userRandTable[Math.floor(Math.random() * userRandTable.length)]
					else	//and if that fails, we will resort to the official flavors
					cheeseID = 'official'
				}
			}

			let toppingResults = []
			let toppingIDList = []
			var toppingList = ''
			
			for (const i in toppings) {
				toppings[i].slice(1,toppings[i].length - 1)

				toppingResults.push(toppings[i])

				var failureLevelT = 0
				var userRandTable = []

				//if this flavor exists in your personal list
				if (Math.round(Math.random() * 100) <= 40) { //which will look into 40% of the time
					if (foodFile[message.author.id] && foodFile[message.author.id]['pizza'] && foodFile[message.author.id]['pizza']['toppings'] && foodFile[message.author.id]['pizza']['toppings'][toppings[i]])
					toppingIDList.push(message.author.id)
					else
					failureLevelT = 1
				} else
				failureLevelT = 1
					
				//if not, then it will search through the user list first
				if (failureLevelT == 1) {
					for (const userID in foodFile) {
						for (const a in list) {
							if (list[a] == userID && foodFile[userID]['pizza'] && foodFile[userID]['pizza']['toppings']) {
								for (const flavor in foodFile[userID]['pizza']['toppings']) {
									if (flavor == toppings[i])
									userRandTable.push(userID)
								}
							}
						}
					}

					console.log(userRandTable)

					//and pick a random ID
					if (userRandTable.length > 0)
					toppingIDList.push(userRandTable[Math.floor(Math.random() * userRandTable.length)])
					else	//and if that fails, we will resort to the official flavors
					toppingIDList.push('official')
				}

				toppingList += `\n- ${toppings[i]} *(${toppingIDList[i] !== 'official' ? client.users.cache.get(toppingIDList[i]) : 'Official'})*`
			}
			toppings = toppings.length

			console.log(`Toppings: ${toppingResults}\nIDs: ${toppingIDList}`)
		
			var filteredA = new Set(toppingResults);
			var toppingsFilteres = [...filteredA]
			var toppingName = toppingsFilteres.join(' ');
		
			//Condiments
			let condimentResults = []
			let condimentIDList = []
			var condimentList = ''
			
			for (const i in condiments) {
				condiments[i].slice(1,condiments[i].length - 1)

				condimentResults.push(condiments[i])

				var failureLevelC = 0
				var userRandTable = []

				//if this flavor exists in your personal list
				if (Math.round(Math.random() * 100) <= 40) { //which will look into 40% of the time
					if (foodFile[message.author.id] && foodFile[message.author.id]['pizza'] && foodFile[message.author.id]['pizza']['condiments'] && foodFile[message.author.id]['pizza']['condiments'][condiments[i]])
					condimentIDList.push(message.author.id)
					else
					failureLevelC = 1
				} else
				failureLevelC = 1
					
				//if not, then it will search through the user list first
				if (failureLevelC == 1) {
					for (const userID in foodFile) {
						for (const a in list) {
							if (list[a] == userID && foodFile[userID]['pizza'] && foodFile[userID]['pizza']['condiments']) {
								for (const flavor in foodFile[userID]['pizza']['condiments']) {
									if (flavor == condiments[i])
									userRandTable.push(userID)
								}
							}
						}
					}

					console.log(userRandTable)

					//and pick a random ID
					if (userRandTable.length > 0)
					condimentIDList.push(userRandTable[Math.floor(Math.random() * userRandTable.length)])
					else	//and if that fails, we will resort to the official flavors
					condimentIDList.push('official')
				}

				condimentList += `\n- ${condiments[i]} *(${toppingIDList[i] !== 'official' ? client.users.cache.get(toppingIDList[i]) : 'Official'})*`
			}
			condiments = condiments.length

			console.log(`Condiments: ${condimentResults}\nIDs: ${condimentIDList}`)

			///////////
			// IMAGE //
			///////////
		
			const canvas = Canvas.createCanvas(180, 180);
			const context = canvas.getContext('2d');
		
			function drawRotated(degrees, image){
				context.save();
			
				context.translate(canvas.width/2,canvas.height/2);
			
				context.rotate(degrees*Math.PI/180);
			
				context.drawImage(image,-image.width/2,-image.width/2);
			
				context.restore();
			}
		
			//crust
			var crustDraw

			if (crustID == 'official')
				try {
					crustDraw = await Canvas.loadImage(`./images/foodgenerators/pizza/crusts/${crust}.png`)
				} catch (error) {
					crustDraw = await Canvas.loadImage(`./images/foodgenerators/pizza/error_crust.png`)
				}
			else {
				try {
					crustDraw = await Canvas.loadImage(foodFile[crustID]['pizza']['crusts'][crust].image)
				} catch (error) {
					crustDraw = await Canvas.loadImage(`./images/foodgenerators/pizza/error_crust.png`)
				}
			}
			drawRotated(0, crustDraw)
			//sauce
			if (sauce !== 'No Sauce') {
				var sauceDraw

				if (sauceID == 'official')
					try {
						sauceDraw = await Canvas.loadImage(`./images/foodgenerators/pizza/sauces/${sauce}.png`)
					} catch (error) {
						sauceDraw = await Canvas.loadImage(`./images/foodgenerators/pizza/error_sauce.png`)
					}
				else {
					try {
						sauceDraw = await Canvas.loadImage(foodFile[sauceID]['pizza']['sauces'][sauce].image)
					} catch (error) {
						sauceDraw = await Canvas.loadImage(`./images/foodgenerators/pizza/error_sauce.png`)
					}
				}
				drawRotated(Math.random() * 360, sauceDraw)
			}
			//cheese
			if (cheese !== 'No Cheese') {
				var cheeseDraw

				if (cheeseID == 'official')
					try {
						cheeseDraw = await Canvas.loadImage(`./images/foodgenerators/pizza/cheeses/${cheese}.png`)
					} catch (error) {
						cheeseDraw = await Canvas.loadImage(`./images/foodgenerators/pizza/error_cheese.png`)
					}
				else {
					try {
						cheeseDraw = await Canvas.loadImage(foodFile[cheeseID]['pizza']['cheeses'][cheese].image)
					} catch (error) {
						cheeseDraw = await Canvas.loadImage(`./images/foodgenerators/pizza/error_cheese.png`)
					}
				}
				drawRotated(Math.random() * 360, cheeseDraw)
			}
			//toppings
			for (var i = 1; i <= toppings; i++) {
				var toppingDraw

				if (toppingIDList[toppingIDList.length - i] == 'official')
					try {
						toppingDraw = await Canvas.loadImage(`./images/foodgenerators/pizza/toppings/${toppingResults[toppingResults.length - i]}.png`)
					} catch (error) {
						toppingDraw = await Canvas.loadImage(`./images/foodgenerators/pizza/error_topping.png`)
					}
				else {
					try {
						toppingDraw = await Canvas.loadImage(foodFile[toppingIDList[toppingIDList.length - i]]['pizza']['toppings'][toppingResults[toppingResults.length - i]].image)
					} catch (error) {
						toppingDraw = await Canvas.loadImage(`./images/foodgenerators/pizza/error_topping.png`)
					}
				}
				drawRotated(Math.random() * 360, toppingDraw)
			}
			//condiments
			for (var i = 1; i <= condiments; i++) {
				var condimentDraw

				if (condimentIDList[condimentIDList.length - i] == 'official')
					try {
						condimentDraw = await Canvas.loadImage(`./images/foodgenerators/pizza/condiments/${condimentResults[condimentResults.length - i]}.png`)
					} catch (error) {
						condimentDraw = await Canvas.loadImage(`./images/foodgenerators/pizza/error_condiment.png`)
					}
				else {
					try {
						condimentDraw = await Canvas.loadImage(foodFile[condimentIDList[condimentIDList.length - i]]['pizza']['condiments'][condimentResults[condimentResults.length - i]].image)
					} catch (error) {
						condimentDraw = await Canvas.loadImage(`./images/foodgenerators/pizza/error_condiment.png`)
					}
				}
				drawRotated(Math.random() * 360, condimentDraw)
			}
		
			const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'pizza-result.png');

			//////////////////
			// Last Touches //
			//////////////////
		
			if (toppingResults.length > 8) {
				embed = new Discord.MessageEmbed()
					.setColor('#F0B2ED')
					.setTitle(`Current Pizza Toppings:`)
					.setDescription(`${toppingList}`)
					.setFooter(`Pizza`);
		
				message.author.send({embeds: [embed]})
				toppingList = `*Too many toppings in this field.\nYou should get a DM with the topping list.*`
			}
		
			if (condimentResults.length > 8) {
				embed = new Discord.MessageEmbed()
					.setColor('#F0B2ED')
					.setTitle(`Current Pizza Condiments:`)
					.setDescription(`${condimentList}`)
					.setFooter(`Pizza`);
		
				message.author.send({embeds: [embed]})
				condimentList = `*Too many condiments in this field.\nYou should get a DM with the condiment list.*`
			}
		
			if (toppings < 1) {
				toppingList = `\nNone`
				toppingName = `${cheese}`
			}
		
			if (condiments < 1)
				condimentList = `\nNone`
		
			if (toppingName.length > 128)
				toppingName = "Title too long to process."
		
			embed = new Discord.MessageEmbed()
					.setColor('#FF6100')
					.setTitle(`${toppingName} ${toppingName == "Title too long to process." ? '' : 'Pizza'}`)
					.addFields(
						{ name: 'Crust', value: `${crust} ${crustID == undefined ? '' : (crustID == 'official' ? '*(Official)*' : `*(${client.users.cache.get(crustID)})*`)}`, inline: true },
						{ name: 'Sauce', value: `${sauce} ${sauceID == undefined ? '' : (sauceID == 'official' ? '*(Official)*' : `*(${client.users.cache.get(sauceID)})*`)}`, inline: true },
						{ name: 'Cheese', value: `${cheese} ${cheeseID == undefined ? '' : (cheeseID == 'official' ? '*(Official)*' : `*(${client.users.cache.get(cheeseID)})*`)}`, inline: true },
						{ name: 'Topping Number', value: `${toppings}`, inline: false },
						{ name: 'Toppings', value: `${toppingList}`, inline: true },
						{ name: 'Condiment Number', value: `${condiments}`, inline: false },
						{ name: 'Condiments', value: `${condimentList}`, inline: true },
					)
					.setImage(`attachment://pizza-result.png`)
					.setFooter(`Pizza`);
		
			return message.channel.send({embeds: [embed], files: [attachment]})
		}
	}

    ///////////////////
    // Relic Search! //
    ///////////////////
    if (command === 'relicsearch') {
        var relicPath = dataPath+'/RelicSearch/relicData.json'
        var relicRead = fs.readFileSync(relicPath);
        var relicData = JSON.parse(relicRead);

        if (!relicData[message.author.id]) {
            relicData[message.author.id] = {
                rolls: 10,
                canfind: true,
                findcooldown: 60,
                stars: 0,
                relics: []
            }

            fs.writeFileSync(relicPath, JSON.stringify(relicData, null, '    '));
        }

        if (relicData[message.author.id].rolls <= 0) {
            message.channel.send(`**${message.author.username}**, you've ran out of searches!\nThe next time you'll get searches... will be in **${relicData[message.author.id].findcooldown} minutes**.`)
            return false
        } else {
            relicData[message.author.id].rolls = relicData[message.author.id].rolls - 1
            fs.writeFileSync(relicPath, JSON.stringify(relicData, null, '    '));
        }

        relicPath = dataPath+'/RelicSearch/relicDefs.json'
        relicRead = fs.readFileSync(relicPath);
        var relicDefs = JSON.parse(relicRead);

        var itemArr = []
        var getItem;
        for (const itemName in relicDefs) {
            if (relicDefs[itemName].rarity >= 5) {
                itemArr.push(`${itemName}`)
            } else if (relicDefs[itemName].rarity == 4) {
                itemArr.push(`${itemName}`)
                itemArr.push(`${itemName}`)
            } else if (relicDefs[itemName].rarity == 3) {
                itemArr.push(`${itemName}`)
                itemArr.push(`${itemName}`)
                itemArr.push(`${itemName}`)
            } else if (relicDefs[itemName].rarity == 2) {
                itemArr.push(`${itemName}`)
                itemArr.push(`${itemName}`)
                itemArr.push(`${itemName}`)
                itemArr.push(`${itemName}`)
                itemArr.push(`${itemName}`)
            } else if (relicDefs[itemName].rarity == 1) {
                itemArr.push(`${itemName}`)
                itemArr.push(`${itemName}`)
                itemArr.push(`${itemName}`)
                itemArr.push(`${itemName}`)
                itemArr.push(`${itemName}`)
                itemArr.push(`${itemName}`)
                itemArr.push(`${itemName}`)
                itemArr.push(`${itemName}`)
                itemArr.push(`${itemName}`)
                itemArr.push(`${itemName}`)
            }
        }

        getItem = relicDefs[itemArr[Math.round(Math.random() * (itemArr.length-1))]]

        var itemName = `${getItem.name}`
        var itemStars = "⭐"
        if (getItem.rarity == 5) {
            var itemStars = "🌟🌟🌟🌟🌟"
        } else if (getItem.rarity == 4) {
            var itemStars = "✨✨✨✨"
        } else if (getItem.rarity == 3) {
            var itemStars = "⭐⭐⭐"
        } else if (getItem.rarity == 2) {
            var itemStars = "⭐⭐"
        }
        var itemSeries = `${getItem.series}`
        var itemAtk = getItem.atk
        var itemDef = getItem.def
        var itemMag = getItem.mag
        const DiscordEmbed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle(`${itemName}`)
            .setDescription(`${itemStars}\n${itemSeries}\n\n${itemAtk}ATK\n${itemMag}MAG\n${itemDef}DEF\n(React with any emoji to pick up.)`)
            .setImage(`${getItem.img}`)
            .setFooter('Relic Search');
        message.channel.send({embeds: [DiscordEmbed]})
    }

    if (command === 'checkrelics' || command === 'cr' || command === 'rr') {
        var relicPath = dataPath+'/RelicSearch/relicData.json'
        var relicRead = fs.readFileSync(relicPath);
        var relicData = JSON.parse(relicRead);
        var relicPath2 = dataPath+'/RelicSearch/relicDefs.json'
        var relicRead2 = fs.readFileSync(relicPath2);
        var relicDefs = JSON.parse(relicRead2);

        if (!relicData[message.author.id] || !relicData[message.author.id].relics) {
            message.channel.send("No relics!")
            return
        }

        var m = ``;
        for (const i in relicData[message.author.id].relics) {
            const relic = relicData[message.author.id].relics[i]
            const relicDef = relicDefs[relic]

            var stars = "⭐"
            if (relicDef.rarity == 5) {
                stars = "🌟🌟🌟🌟🌟"
            } else if (relicDef.rarity == 4) {
                stars = "✨✨✨✨"
            } else if (relicDef.rarity == 3) {
                stars = "⭐⭐⭐"
            } else if (relicDef.rarity == 2) {
                stars = "⭐⭐"
            }

            m = m + `\n**${relic}** (${stars})`

            if (relicData[message.author.id].userelic == relic) {
                m = m + " 👈"
            }
        }

        if (m === ``) {m = "No relics!"}

        const DiscordEmbed = new Discord.MessageEmbed()
            .setColor('#e36b2b')
            .setTitle(`${message.author.username}'s relics`)
            .setDescription(`${m}`)
        message.channel.send({embeds: [DiscordEmbed]})
    }

    if (command === 'getrelic') {
        var relicPath = dataPath+'/RelicSearch/relicDefs.json'
        var relicRead = fs.readFileSync(relicPath);
        var relicDefs = JSON.parse(relicRead);
        var relicPath2 = dataPath+'/RelicSearch/relicData.json'
        var relicRead2 = fs.readFileSync(relicPath2);
        var relicData = JSON.parse(relicRead2);

        const argument = message.content.slice(13)
        var arg = argument

        if (relicDefs[arg]) {
            const getItem = relicDefs[arg]

            var itemName = `${getItem.name}`
            var itemStars = "⭐"
            if (getItem.rarity == 5) {
                var itemStars = "🌟🌟🌟🌟🌟"
            } else if (getItem.rarity == 4) {
                var itemStars = "✨✨✨✨"
            } else if (getItem.rarity == 3) {
                var itemStars = "⭐⭐⭐"
            } else if (getItem.rarity == 2) {
                var itemStars = "⭐⭐"
            }
            var itemSeries = `${getItem.series}`
            var itemAtk = getItem.atk
            var itemDef = getItem.def
            var itemMag = getItem.mag
            var owned = "Not Owned"
            for (const relic in relicData[message.author.id].relics) {
                if (relicData[message.author.id].relics[relic] === arg) {
                    owned = "**Owned**"
                }
            }

            if (relicData[message.author.id].userelic === arg) {
                owned = owned + " and **equipped**"
            }

            const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle(`${itemName}`)
                .setDescription(`${itemStars}\n${itemSeries}\n\n${itemAtk}ATK\n${itemMag}MAG\n${itemDef}DEF\n${owned}`)
                .setImage(`${getItem.img}`)
                .setFooter('Searching for Relics.');
            message.channel.send({embeds: [DiscordEmbed]})
        } else {
            message.channel.send(`${arg} is an Invalid Relic.`)
        }
    }

    if (command === 'equip') {
        const argument = message.content.slice(10)
        var arg = argument

        var relicPath = dataPath+'/RelicSearch/relicData.json'
        var relicRead = fs.readFileSync(relicPath);
        var relicData = JSON.parse(relicRead);

        if (!relicData[message.author.id] || !relicData[message.author.id].relics) {
            message.channel.send("No relics!")
            return
        }

        var equip = ``;
        for (const i in relicData[message.author.id].relics) {
            if (arg === relicData[message.author.id].relics[i]) {
                equip = relicData[message.author.id].relics[i]
            }
        }

        if (equip === ``) {
            message.channel.send(`${arg}: Either doesn't exist, or you do not have this relic.`)
        } else {
            relicData[message.author.id].userelic = equip
            message.channel.send(`Equipped the **${equip}**.`)

            fs.writeFile(relicPath, JSON.stringify(relicData, null, '    '), function (err) {
                if (err) throw err;
            });
        }
    }

    if (command === 'relicbattle' || command === 'rb') {
		var relicPath = dataPath+'/RelicSearch/relicFight.json';
		var relicRead = fs.readFileSync(relicPath);
		var relicFight = JSON.parse(relicRead);
		var relicEquipPath = dataPath+'/RelicSearch/relicData.json';
		var relicEquipRead = fs.readFileSync(relicEquipPath);
		var relicData = JSON.parse(relicEquipRead);
		var relicDefsPath = dataPath+'/RelicSearch/relicDefs.json';
		var relicDefsRead = fs.readFileSync(relicDefsPath);
		var relicDefs = JSON.parse(relicDefsRead);
		
		var DiscordEmbed = {}

        if (!message.mentions.users.first()) {
            message.channel.send("Very well, I'll train you. \nPS: I'm a cheater.")

            var player = message.author;
            var enemy = message.mentions.users.first();
			
			if (relicFight[message.channel.id])
				return message.channel.send('There is a battle happening in this channel already!')

            if (!relicData[player.id].userelic) {
                message.channel.send("You don't have an equipped relic!")
                return false
            }

            if (!relicFight[message.channel.id]) {
                relicFight[message.channel.id] = {
                    fighting: false,
                    turn: 0,
                    fighters: [],
                    message: "none",
                    battlechannel: "none"
                }
            }

            relicFight[message.channel.id].fighting = true
            relicFight[message.channel.id].fighters = [];

			// You
			var charDefs = RF.genChar(player.username, player.id, relicDefs[relicData[player.id].userelic].atk, relicDefs[relicData[player.id].userelic].mag, relicDefs[relicData[player.id].userelic].def)
            relicFight[message.channel.id].fighters.push(charDefs)

			// The Foe
			charDefs = RF.genChar('Bloom Battler', null, 25, 25, 4)
			charDefs.hp = 200
            relicFight[message.channel.id].fighters.push(charDefs)

			// The Channel you're battling in
            relicFight[message.channel.id].battlechannel = message.channel.id

            fs.writeFileSync(relicPath, JSON.stringify(relicFight, null, '    '));

            var fighters = ``
            for (const i in relicFight[message.channel.id].fighters)
                fighters = fighters + `${relicFight[message.channel.id].fighters[i].name} ❤️${relicFight[message.channel.id].fighters[i].hp}\n`

            DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#c2907e')
                .setTitle('Relic Battle!')
                .setDescription('(React with an emoji to make your move!)')
                .addFields(
                    { name: `--------------------------------------`, value: `${fighters}`, inline: true },
                )
                .setFooter('Relic Battle!');
        } else {
            const arg = message.content.slice(prefix.length).trim().split(/ +/);
			
			if (relicFight[message.channel.id])
				return message.channel.send('There is a battle happening in this channel already!')

			if (!relicData[player.id].userelic)
				return message.channel.send("You don't have an equipped relic!");

			if (!relicFight[message.channel.id]) {
				relicFight[message.channel.id] = {
					fighting: false,
					turn: 0,
					fighters: [],
					message: "none",
					battlechannel: "none"
				}
			}

			relicFight[message.channel.id].fighting = true
			relicFight[message.channel.id].fighters = [];
			relicFight[message.channel.id].battlechannel = message.channel.id;

			// You
			var charDefs = RF.genChar(player.username, player.id, relicDefs[relicData[player.id].userelic].atk, relicDefs[relicData[player.id].userelic].mag, relicDefs[relicData[player.id].userelic].def)
			relicFight[message.channel.id].fighters.push(charDefs)

			// The Foes
			for (const i in arg) {
				if (i > 0) {
					var enemy;
					if (arg[i].startsWith('<@') && arg[i].endsWith('>')) {
						var mention = arg[i].slice(2, -1);

						if (mention.startsWith('!')) {
							mention = mention.slice(1);
						}

						enemy = client.users.cache.get(mention);
					} else {
						message.channel.send(`Argument "${arg[i]}" isn't a valid user!`)
						return false
					}

					if (!enemy || !enemy.id) {
						message.channel.send(`Argument "${arg[i]}" isn't a valid user!`)
						return false
					}

					if (!enemy.bot) {
						if (!relicData[enemy.id].userelic) {
							message.channel.send(`**${enemy.username}** doesn't have an equipped relic!`)
							return false
						}
					}

					
					if (enemy.bot)
						charDefs = RF.genChar(enemy.username, null, Math.round(Math.random() * 20), Math.round(Math.random() * 20), Math.round(Math.random() * 20));
					else
						charDefs = RF.genChar(enemy.username, enemy.id, relicDefs[relicData[enemy.id].userelic].atk, relicDefs[relicData[enemy.id].userelic].mag, relicDefs[relicData[enemy.id].userelic].def);

					relicFight[message.channel.id].fighters.push(charDefs)
				}
			}

			fs.writeFileSync(relicPath, JSON.stringify(relicFight, null, '    '));

			var fighters = ``
			for (const i in relicFight[message.channel.id].fighters)
				fighters = fighters + `${relicFight[message.channel.id].fighters[i].name} ❤️${relicFight[message.channel.id].fighters[i].hp}\n`

			DiscordEmbed = new Discord.MessageEmbed()
				.setColor('#c2907e')
				.setTitle('Relic Battle!')
				.setDescription('*(React with an emoji to make your move!)*')
				.addFields(
					{ name: '--------------------------------------', value: `${fighters}`, inline: true },
				)
				.setFooter('Relic Battle!');
		}

		message.channel.send({embeds: [DiscordEmbed]}).then(message => {
			var relicPath = dataPath+'/RelicSearch/relicFight.json';
			var relicRead = fs.readFileSync(relicPath);
			var relicFight = JSON.parse(relicRead);

			relicFight[message.channel.id].message = message.id
			message.react("👊")
			message.react("✨")
			message.react("🛡️")
			message.react("💨")

			fs.writeFile(relicPath, JSON.stringify(relicFight, null, '    '), function (err) {
				if (err) throw err;
			});
		});
    }

	/*
	const petGifs = []
		
	if (command === 'pet' || command === 'pat') {
	}
	*/
	
	///////////
	// Shops //
	///////////
    if (command === 'openshop') {
		if (utilityFuncs.isBanned(message.author.id, message.guild.id) && !utilityFuncs.RPGBotAdmin(message.author.id))
			return message.channel.send("I've been told you were banned from using the RPG sections of the bot, sorry!")
		
        if (!message.member.permissions.serialize().ADMINISTRATOR)
            return message.channel.send("You lack sufficient permissions, I'm so sorry!");

        const arg = message.content.slice(prefix.length).trim().split(/ +/);
        if (!arg[1]) {
            const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle(`${prefix}openshop`)
				.setDescription('(Args <Name> <Channel> <Items...>)\nCreates a shop that characters can buy items from.')
            message.channel.send({embeds: [DiscordEmbed]})
            return false
        }

		if (!arg[2] || !client.channels.cache.get(arg[2]))
			return message.channel.send("Please specify a valid channel.");

		const shopChannel = client.channels.cache.get(arg[2])
		var shopPath = dataPath+'/shops.json'
		var shopRead = fs.readFileSync(shopPath);
		var shopFile = JSON.parse(shopRead);
        var itemPath = dataPath+'/items.json'
        var itemRead = fs.readFileSync(itemPath);
        var itemFile = JSON.parse(itemRead);
        var servPath = dataPath+'/Server Settings/server.json'
        var servRead = fs.readFileSync(servPath);
        var servFile = JSON.parse(servRead);
		
        if (!servFile[message.guild.id]) {
            servFile[message.guild.id] = {
				prefix: "rpg!",
				limitbreaks: false,
				showtimes: false,
				onemores: false,
				currency: "Bloom Token",
				xprate: 1,
				damageFormula: "persona",
				pvpstuff: {
					none: {},
					metronome: {},
					randskills: {},
					randstats: {},
					charfuck: {}
				},
				themes: {
					battle: [],
					advantage: [],
					disadvantage: [],
					bossfight: [],
					miniboss: [],
					strongfoe: [],
					finalboss: [],
					colosseum: [],
					colosseumstrong: [],
					pvp: [],
					victory: [],
					colosseumvictory: [],
					loss: []
				},
				banned: []
			}
        }
		
		if (!shopFile[message.guild.id])
			shopFile[message.guild.id] = {};

		shopFile[message.guild.id][shopChannel.id] = {
			name: arg[1],
			items: [],
			party: "none"
		}

		for (const i in arg) {
			if (i > 2) {
				if (!itemFile[arg[i]])
					message.channel.send(`${arg[i]} isn't a valid item.`);
				
				shopFile[message.guild.id][shopChannel.id].items.push(arg[i])
			}
		}

		fs.writeFileSync(shopPath, JSON.stringify(shopFile, null, '    '));
		
		var itemString = ''
		for (const i in shopFile[message.guild.id][shopChannel.id].items) {
			var itemDefs = itemFile[shopFile[message.guild.id][shopChannel.id].items[i]]
			itemString += `\n**${itemDefs.name}**\nCosts ${itemDefs.cost} ${servFile[message.guild.id].currency}s.\n*${itemDefs.desc}*\n`
		}

		var itemEmbed = new Discord.MessageEmbed()
			.setColor('#c2907e')
			.setTitle(`${shopFile[message.guild.id][shopChannel.id].name}`)
			.setDescription(`*The shop has been opened!*\n${itemString}`)
		shopChannel.send({embeds: [itemEmbed]})
	}

    if (command === 'entershop') {
		if (utilityFuncs.isBanned(message.author.id, message.guild.id) && !utilityFuncs.RPGBotAdmin(message.author.id)) {
			message.channel.send("I've been told you were banned from using the RPG sections of the bot, sorry!")
			return false
		}
		
        if (!message.member.permissions.serialize().ADMINISTRATOR) {
            message.channel.send("You lack sufficient permissions, I'm so sorry!");
            return
        }

        const arg = message.content.slice(prefix.length).trim().split(/ +/);
        if (!arg[1]) {
            const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle(`${prefix}entershop`)
				.setDescription('(Args <Party>)\nEnters a created shop with the specified party.')
            message.channel.send({embeds: [DiscordEmbed]})
            return false
        }
		
		var shopPath = dataPath+'/shops.json'
		var shopRead = fs.readFileSync(shopPath);
		var shopFile = JSON.parse(shopRead);   
		var btlPath = dataPath+'/battle.json'
		var btlRead = fs.readFileSync(btlPath);
		var btl = JSON.parse(btlRead);
		
		var shop = shopFile[message.guild.id][message.channel.id]
		var servBtl = btl[message.guild.id]

		if (servBtl.parties[arg[1]]) {
			shop.party = arg[1]
			fs.writeFileSync(shopPath, JSON.stringify(shopFile, null, '    '));

			message.channel.send(`Team ${arg[2]} entered the shop.`)
			message.delete()
		} else {
			message.channel.send("Invalid Party!")
			return false
		}
	}

    if (command === 'leaveshop') {
		var shopPath = dataPath+'/shops.json'
		var shopRead = fs.readFileSync(shopPath);
		var shopFile = JSON.parse(shopRead);
		var shop = shopFile[message.guild.id][message.channel.id];
		
        if (!message.member.permissions.serialize().ADMINISTRATOR) {
            message.channel.send("You lack sufficient permissions, I'm so sorry!");
            return
        }

		message.channel.send(`Team ${shop.party} left the shop.`)
		message.delete()

		shop.party = "none"
		fs.writeFileSync(shopPath, JSON.stringify(shopFile, null, '    '));
	}

    if (command === 'buyitem') {
        const arg = message.content.slice(prefix.length).trim().split(/ +/);
        if (!arg[1]) {
            const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle(`${prefix}buyitem`)
				.setDescription('(Args <Item> <Quantity>)\nBuys an amount of the specified item.')
            message.channel.send({embeds: [DiscordEmbed]})
            return false
        }

		// so much shit ffs
		var shopPath = dataPath+'/shops.json'
        var itemPath = dataPath+'/items.json'
        var servPath = dataPath+'/Server Settings/server.json'
		var btlPath = dataPath+'/battle.json'
		var shopRead = fs.readFileSync(shopPath);
        var itemRead = fs.readFileSync(itemPath);
        var servRead = fs.readFileSync(servPath);
		var btlRead = fs.readFileSync(btlPath);
		var shopFile = JSON.parse(shopRead);
        var itemFile = JSON.parse(itemRead);
        var servFile = JSON.parse(servRead);
		var btl = JSON.parse(btlRead);
		
		if (!shopFile[message.guild.id][message.channel.id].party || shopFile[message.guild.id][message.channel.id].party === "none") {
			message.channel.send("There's nobody in the shop!")
			message.delete()
			return false
		}
		
		if (!itemFile[arg[1]]) {
			message.channel.send("This item doesn't exist!")
			message.delete()
			return false
		}
		
		var hasItem = false
		for (const i in shopFile[message.guild.id][message.channel.id].items) {
			var itemName = shopFile[message.guild.id][message.channel.id].items[i]
			if (arg[1] == itemName) {
				hasItem = true
			}
		}
		
		if (hasItem == false) {
			message.channel.send("The shop isn't selling this item.")
			message.delete()
			return false
		}
		
		var totalCost = 0;
		var totalQuantity = arg[2] ? parseInt(arg[2]) : 1
		for (var i = 1; i < totalQuantity; i++)
			totalCost += itemFile[arg[1]].cost;
		
		var party = btl[message.guild.id].parties[shopFile[message.guild.id][message.channel.id].party]
		
		if (party.rings < totalCost) {
			message.channel.send(`The party doesn't have enough ${servFile[message.guild.id].currency}s! (Need ${totalCost})`)
			message.delete()
			return false
		}
		
		var itemName = itemFile[arg[1]].name

		if (totalQuantity > 1)
			message.channel.send(`Team ${shopFile[message.guild.id][message.channel.id].party} bought **${totalQuantity} ${itemName}s**.\n*(${party.rings -= totalCost} ${servFile[message.guild.id].currency}s left.)*`);
		else
			message.channel.send(`Team ${shopFile[message.guild.id][message.channel.id].party} bought a **${itemName}**.\n*(${party.rings -= totalCost} ${servFile[message.guild.id].currency}s left.)*`);
		
		party.rings -= totalCost
		if (!party.items[arg[1]])
			party.items[arg[1]] = 0;
		
		party.items[arg[1]] += totalQuantity
		fs.writeFileSync(btlPath, JSON.stringify(btl, null, '    '));
	}

	//////////
	// Loot //
	//////////

	if (command === 'makeloot')
		makeLoot.initialize(message, prefix);

	if (command === 'assignloot')
		assignLoot.initialize(message, prefix);

	if (command === 'getloot')
		getLoot.initialize(message, prefix);

	if (command === 'searchloots')
		searchLoot.initialize(message, prefix);

	if (command === 'listloots')
		listLoot.initialize(message, prefix);

	if (command === 'deassignloot')
		deassignLoot.initialize(message, prefix);

	if (command === 'removeloot')
		removeLoot.initialize(message, prefix);

	////////////
	// Chests //
	////////////

	if (command == 'makechest') {
		if (utilityFuncs.isBanned(message.author.id, message.guild.id) && !utilityFuncs.RPGBotAdmin(message.author.id)) {
			message.channel.send("I've been told you were banned from using the RPG sections of the bot, sorry!")
			return false
		}
		
        if (!message.member.permissions.serialize().ADMINISTRATOR) {
            message.channel.send("You lack sufficient permissions, I'm so sorry!");
            return
        }

        const arg = message.content.slice(prefix.length).trim().split(/ +/);
        if (!arg[1]) {
            const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle(`${prefix}makechest`)
				.setDescription('(Args <Name> <Channel> <Spoiler> <Optional: Loot Table, Items...>)\nCreates a chest that characters can open, gather items from and put them in.')
            message.channel.send({embeds: [DiscordEmbed]})
            return false
        }

		if (!arg[2] || !client.channels.cache.get(arg[2])) {
			message.channel.send("Please specify a valid channel.")
			return false
		}

		if (!arg[3]) {
			message.channel.send("Please specify if this chest should be left as a spoiler or not.")
			return false
		}

		var chestPath = dataPath+'/chests.json'
		var chestRead = fs.readFileSync(chestPath);
		var chestFile = JSON.parse(chestRead);
        var itemPath = dataPath+'/items.json'
        var itemRead = fs.readFileSync(itemPath);
        var itemFile = JSON.parse(itemRead);
		var lootPath = dataPath+'/Loot/lootTables.json'
		var lootRead = fs.readFileSync(lootPath);
		var lootFile = JSON.parse(lootRead);

		const chestName = arg[1]
		const chestChannel = client.channels.cache.get(arg[2])
		const underSpoiler = arg[3]
		let chosenLoot = ''
		let chosenItems = []

		if (!chestChannel.isText() && !chestChannel.isThread()) {
			message.channel.send(`${chestChannel.name} is not a text channel. Please change the location.`)
			return false
		}

		for (const i in arg) {
			if (i > 3) {
				if (!lootFile[arg[i]]) {
					if (!itemFile[arg[i]]) {
						message.channel.send(`<:warning:878094052208296007>${arg[i]} is not a valid item, neither is it a valid loot table`)
					} else {
						chosenItems.push(itemFile[arg[i]].name)
					}
				} else {
					chosenLoot = lootFile[arg[i]].name
				}
			}
		}

		if (!chestFile[message.guild.id]) {
			chestFile[message.guild.id] = {}
		}

		if (!chestFile[message.guild.id][chestChannel.id]) {
			chestFile[message.guild.id][chestChannel.id] = {}
		}

		chestFile[message.guild.id][chestChannel.id][chestName] = {
			name: chestName,
			inputLoot: chosenLoot,
			inputItems: chosenItems,
			itemsFromLoot: {},
			items: {},
			party: "",
			locked: false,
			lockOpener: "",
			spoiler: (underSpoiler == 'true'?true:false),
			encountered: false
		}

		////////putting items inside
		//Loot

		let currentItems = {}

		if (chosenLoot !== '') {
			let itemInput = lootFile[chosenLoot].items
			let chanceInput = lootFile[chosenLoot].itemChances

			for (const loot in itemInput) {
				if (Math.random() * 100 < chanceInput[loot]) {
					console.log(`Successfully put ${itemInput[loot]} inside of a chest`)

					if (!chestFile[message.guild.id][chestChannel.id][chestName].items[itemInput[loot]]) {
						chestFile[message.guild.id][chestChannel.id][chestName].items[itemInput[loot]] = 0
					}
						
					chestFile[message.guild.id][chestChannel.id][chestName].items[itemInput[loot]] += 1

					if (!chestFile[message.guild.id][chestChannel.id][chestName].itemsFromLoot[itemInput[loot]]) {
						chestFile[message.guild.id][chestChannel.id][chestName].itemsFromLoot[itemInput[loot]] = 0
					}
						
					chestFile[message.guild.id][chestChannel.id][chestName].itemsFromLoot[itemInput[loot]] += 1

					if (!currentItems[itemInput[loot]]) {
						currentItems[itemInput[loot]] = 0
					}

					currentItems[itemInput[loot]] += 1
				}
			}
		}	
		//real items
		let pickedItems = 'None'

		if (chosenItems !== [])
			pickedItems = ''

		for (const i in chosenItems) {
			pickedItems += `\n- ${chosenItems[i]}`

			if (!chestFile[message.guild.id][chestChannel.id][chestName].items[chosenItems[i]]) {
				chestFile[message.guild.id][chestChannel.id][chestName].items[chosenItems[i]] = 0
			}

			chestFile[message.guild.id][chestChannel.id][chestName].items[chosenItems[i]] += 1

			if (!currentItems[chosenItems[i]]) {
				currentItems[chosenItems[i]] = 0
			}

			currentItems[chosenItems[i]] += 1
		}

		fs.writeFileSync(chestPath, JSON.stringify(chestFile, null, '    '));

		//embed

		console.log(currentItems)

		let spoilerText = 'No'
		let lootText = 'None'
		let itemText = ''

		for (const i in currentItems)
			itemText += `\n- ${i}: ${currentItems[i]}`

		if (underSpoiler == 'true')
			spoilerText = 'Yes'

		if (chosenLoot !== '')
			lootText = chosenLoot

		if (pickedItems == '')
			pickedItems = `None`

		if (itemText == '')
			itemText = `None`

		if (underSpoiler == 'true') {
			message.delete()
			var chestEmbed = new Discord.MessageEmbed()
			.setColor('#c2907e')
			.setTitle(`Contents of ${chestName}!`)
			.setFields(
				{name: `Loot Table`, value: lootText, inline: false},
				{name: `Base Items`, value: pickedItems, inline: false},
				{name: `Current Items`, value: itemText, inline: false}
			)
			message.author.send({embeds: [chestEmbed]})

			lootText = '*Spoilered. You should get a DM with the chest contents.*'
			pickedItems = '*Spoilered. You should get a DM with the chest contents.*'
			itemText = '*Spoilered. You should get a DM with the chest contents.*'
		}

		var chestEmbed = new Discord.MessageEmbed()
			.setColor('#c2907e')
			.setTitle(`A new chest has been created!`)
			.setFields(
				{name: `Name`, value: chestName, inline: true},
				{name: `Channel`, value: chestChannel.name, inline: true},
				{name: `Spoiler`, value: spoilerText, inline: true},
				{name: `Loot Table`, value: lootText, inline: false},
				{name: `Chosen Items`, value: pickedItems, inline: false},
				{name: `Current Items`, value: itemText, inline: false}
			)
		message.channel.send({embeds: [chestEmbed]})
	}

	if (command == 'spoilerchest') {
		if (utilityFuncs.isBanned(message.author.id, message.guild.id) && !utilityFuncs.RPGBotAdmin(message.author.id)) {
			message.channel.send("I've been told you were banned from using the RPG sections of the bot, sorry!")
			return false
		}
		
        if (!message.member.permissions.serialize().ADMINISTRATOR) {
            message.channel.send("You lack sufficient permissions, I'm so sorry!");
            return
        }

        const arg = message.content.slice(prefix.length).trim().split(/ +/);
        if (!arg[1]) {
            const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle(`${prefix}spoilerchest`)
				.setDescription('(Args <Name>)\nWill change if a chest is spoilered or not.')
            message.channel.send({embeds: [DiscordEmbed]})
            return false
        }

		const success = utilityFuncs.getChest(arg[1],message)
		if (success == false) {
			message.channel.send(`${arg[1]} is not a valid chest.`)
			return false
		}

		var chestPath = dataPath+'/chests.json'
		var chestRead = fs.readFileSync(chestPath);
		var chestFile = JSON.parse(chestRead);

		for (const channelID in chestFile[message.guild.id]) {
			for (const chest in chestFile[message.guild.id][channelID]) {
				if (chestFile[message.guild.id][channelID][arg[1]]) {
					chestFile[message.guild.id][channelID][arg[1]].spoiler = !chestFile[message.guild.id][channelID][arg[1]].spoiler

					if (chestFile[message.guild.id][channelID][arg[1]].spoiler !== true)
						message.channel.send(`${arg[1]} is **no longer spoilered**. Everyone is free to see the chest without opening it for the first time.`)
					else
						message.channel.send(`${arg[1]} is **now spoilered**. Only ones with permissions are free to see the chest without opening it for the first time.`)
				}
			}
		}
		fs.writeFileSync(chestPath, JSON.stringify(chestFile, null, '    '));
	}

	if (command == 'encounterchest') {
		if (utilityFuncs.isBanned(message.author.id, message.guild.id) && !utilityFuncs.RPGBotAdmin(message.author.id)) {
			message.channel.send("I've been told you were banned from using the RPG sections of the bot, sorry!")
			return false
		}
		
        if (!message.member.permissions.serialize().ADMINISTRATOR) {
            message.channel.send("You lack sufficient permissions, I'm so sorry!");
            return
        }

        const arg = message.content.slice(prefix.length).trim().split(/ +/);
        if (!arg[1]) {
            const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle(`${prefix}encounterchest`)
				.setDescription('(Args <Name>)\nWill make a chest opened for the first time.')
            message.channel.send({embeds: [DiscordEmbed]})
            return false
        }

		const success = utilityFuncs.getChest(arg[1],message)
		if (success == false) {
			message.channel.send(`${arg[1]} is not a valid chest.`)
			return false
		}

		var chestPath = dataPath+'/chests.json'
		var chestRead = fs.readFileSync(chestPath);
		var chestFile = JSON.parse(chestRead);

		for (const channelID in chestFile[message.guild.id]) {
			for (const chest in chestFile[message.guild.id][channelID]) {
				if (chestFile[message.guild.id][channelID][arg[1]]) {
					chestFile[message.guild.id][channelID][arg[1]].encountered = true

					message.react('👍')
				}
			}
		}
		fs.writeFileSync(chestPath, JSON.stringify(chestFile, null, '    '));
	}

	if (command == 'removechest') {
		if (utilityFuncs.isBanned(message.author.id, message.guild.id) && !utilityFuncs.RPGBotAdmin(message.author.id)) {
			message.channel.send("I've been told you were banned from using the RPG sections of the bot, sorry!")
			return false
		}
		
        if (!message.member.permissions.serialize().ADMINISTRATOR) {
            message.channel.send("You lack sufficient permissions, I'm so sorry!");
            return
        }

        const arg = message.content.slice(prefix.length).trim().split(/ +/);
        if (!arg[1]) {
            const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle(`${prefix}removechest`)
				.setDescription('(Args <Name>)\nWill remove a chest and delete every item inside of it.')
            message.channel.send({embeds: [DiscordEmbed]})
            return false
        }

		const success = utilityFuncs.getChest(arg[1],message)
		if (success == false) {
			message.channel.send(`${arg[1]} is not a valid chest.`)
			return false
		}

		var chestPath = dataPath+'/chests.json'
		var chestRead = fs.readFileSync(chestPath);
		var chestFile = JSON.parse(chestRead);

		for (const channelID in chestFile[message.guild.id]) {
			for (const chest in chestFile[message.guild.id][channelID]) {
				if (chestFile[message.guild.id][channelID][arg[1]]) {
					delete chestFile[message.guild.id][channelID][arg[1]]

					message.react('👍')
				}
			}
		}
		fs.writeFileSync(chestPath, JSON.stringify(chestFile, null, '    '));
	}

	if (command == 'chestlocation') {
		if (utilityFuncs.isBanned(message.author.id, message.guild.id) && !utilityFuncs.RPGBotAdmin(message.author.id)) {
			message.channel.send("I've been told you were banned from using the RPG sections of the bot, sorry!")
			return false
		}
		
        if (!message.member.permissions.serialize().ADMINISTRATOR) {
            message.channel.send("You lack sufficient permissions, I'm so sorry!");
            return
        }

        const arg = message.content.slice(prefix.length).trim().split(/ +/);
        if (!arg[1]) {
            const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle(`${prefix}chestlocation`)
				.setDescription("(Args <Name> <Channel>)\nWill change a chest's location.")
            message.channel.send({embeds: [DiscordEmbed]})
            return false
        }

		if (!arg[2] || !client.channels.cache.get(arg[2])) {
			message.channel.send("Please specify a valid channel.")
			return false
		}

		const chestChannel = client.channels.cache.get(arg[2])
		const success = utilityFuncs.getChest(arg[1],message)

		if (success == false) {
			message.channel.send(`${arg[1]} is not a valid chest.`)
			return false
		}

		if (!chestChannel.isText() && !chestChannel.isThread()) {
			message.channel.send(`${chestChannel.name} is not a text channel. Please change the location.`)
			return false
		}

		var chestPath = dataPath+'/chests.json'
		var chestRead = fs.readFileSync(chestPath);
		var chestFile = JSON.parse(chestRead);

		if (!chestFile[message.guild.id][chestChannel.id])
			chestFile[message.guild.id][chestChannel.id] = {}

		for (const channelID in chestFile[message.guild.id]) {
			for (const chest in chestFile[message.guild.id][channelID]) {
				if (chestFile[message.guild.id][channelID][arg[1]]) {
					if (channelID == chestChannel.id) {
						message.channel.send(`The new location shouldn't be the same location. Please choose a different location.`)
						return false
					}

					chestFile[message.guild.id][chestChannel.id][arg[1]] = chestFile[message.guild.id][channelID][arg[1]]
					delete chestFile[message.guild.id][channelID][arg[1]]

					message.channel.send(`${chest} has successfully switched location to ${chestChannel.name}.`)
					fs.writeFileSync(chestPath, JSON.stringify(chestFile, null, '    '));
					return true
				}
			}
		}
	}

	if (command == 'renamechest') {
		if (utilityFuncs.isBanned(message.author.id, message.guild.id) && !utilityFuncs.RPGBotAdmin(message.author.id)) {
			message.channel.send("I've been told you were banned from using the RPG sections of the bot, sorry!")
			return false
		}
		
        if (!message.member.permissions.serialize().ADMINISTRATOR) {
            message.channel.send("You lack sufficient permissions, I'm so sorry!");
            return
        }

        const arg = message.content.slice(prefix.length).trim().split(/ +/);
        if (!arg[1]) {
            const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle(`${prefix}renamechest`)
				.setDescription("(Args <Name> <New Name>)\nWill change a chest's name to what you want it to be.")
            message.channel.send({embeds: [DiscordEmbed]})
            return false
        }

		if (!arg[2]) {
			message.channel.send("Please specify a new name for this chest.")
			return false
		}

		const success = utilityFuncs.getChest(arg[1],message)

		if (success == false) {
			message.channel.send(`${arg[1]} is not a valid chest.`)
			return false
		}

		if (arg[2] == arg[1]) {
			message.channel.send(`You can't rename a chest to the same thing. Please change the new name.`)
			return false
		}

		var chestPath = dataPath+'/chests.json'
		var chestRead = fs.readFileSync(chestPath);
		var chestFile = JSON.parse(chestRead);

		for (const channelID in chestFile[message.guild.id]) {
			for (const chest in chestFile[message.guild.id][channelID]) {
				if (chestFile[message.guild.id][channelID][arg[1]]) {
					chestFile[message.guild.id][channelID][arg[2]] = chestFile[message.guild.id][channelID][arg[1]]
					delete chestFile[message.guild.id][channelID][arg[1]]

					message.channel.send(`${arg[1]} has been successfully renamed to ${arg[2]}`)
					fs.writeFileSync(chestPath, JSON.stringify(chestFile, null, '    '));
					return true
				}
			}
		}
	}

	if (command == 'chestloot') {
		if (utilityFuncs.isBanned(message.author.id, message.guild.id) && !utilityFuncs.RPGBotAdmin(message.author.id)) {
			message.channel.send("I've been told you were banned from using the RPG sections of the bot, sorry!")
			return false
		}
		
        if (!message.member.permissions.serialize().ADMINISTRATOR) {
            message.channel.send("You lack sufficient permissions, I'm so sorry!");
            return
        }

        const arg = message.content.slice(prefix.length).trim().split(/ +/);
        if (!arg[1]) {
            const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle(`${prefix}chestloot`)
				.setDescription("(Args <Name> <New Name>)\nWill change a chest's loot table and items within.")
            message.channel.send({embeds: [DiscordEmbed]})
            return false
        }

		if (!arg[2]) {
			message.channel.send("Please specify a valid loot table.")
			return false
		}

		const success = utilityFuncs.getChest(arg[1],message)

		if (success == false) {
			message.channel.send(`${arg[1]} is not a valid chest.`)
			return false
		}

		var lootPath = dataPath+'/Loot/lootTables.json'
		var lootRead = fs.readFileSync(lootPath);
		var lootFile = JSON.parse(lootRead);
		var chestPath = dataPath+'/chests.json'
		var chestRead = fs.readFileSync(chestPath);
		var chestFile = JSON.parse(chestRead);
	
		if (!lootFile[arg[2]]) {
			message.channel.send(`${arg[2]} is not a loot table.`)
			return false
		}

		for (const channelID in chestFile[message.guild.id]) {
			for (const chest in chestFile[message.guild.id][channelID]) {
				if (chestFile[message.guild.id][channelID][arg[1]]) {
					for (const item in chestFile[message.guild.id][channelID][arg[1]].itemsFromLoot) {

						console.log(item)
						if (chestFile[message.guild.id][channelID][arg[1]].items[item] > 0) {
							chestFile[message.guild.id][channelID][arg[1]].items[item] -= chestFile[message.guild.id][channelID][arg[1]].itemsFromLoot[item]
						}
						
						if (chestFile[message.guild.id][channelID][arg[1]].items[item] <= 0) {
							delete chestFile[message.guild.id][channelID][arg[1]].items[item]
						}
					}

					chestFile[message.guild.id][channelID][arg[1]].itemsFromLoot = {}
					
					chestFile[message.guild.id][channelID][arg[1]].inputLoot = lootFile[arg[2]].name

					let itemInput = lootFile[arg[2]].items
					let chanceInput = lootFile[arg[2]].itemChances

					for (const loot in itemInput) {
						if (Math.random() * 100 < chanceInput[loot]) {
							console.log(`Successfully put ${itemInput[loot]} inside of a chest`)

							if (!chestFile[message.guild.id][channelID][arg[1]].items[itemInput[loot]]) {
								chestFile[message.guild.id][channelID][arg[1]].items[itemInput[loot]] = 0
							}
								
							chestFile[message.guild.id][channelID][arg[1]].items[itemInput[loot]] += 1

							if (!chestFile[message.guild.id][channelID][arg[1]].itemsFromLoot[itemInput[loot]]) {
								chestFile[message.guild.id][channelID][arg[1]].itemsFromLoot[itemInput[loot]] = 0
							}
								
							chestFile[message.guild.id][channelID][arg[1]].itemsFromLoot[itemInput[loot]] += 1
						}
					}

					let newItems = ''
					for (const i in chestFile[message.guild.id][channelID][arg[1]].items) {
						newItems += `\n- ${i}: ${chestFile[message.guild.id][channelID][arg[1]].items[i]}`
					}

					if (newItems.length < 1)
						newItems = '\nNone'

					var chestEmbed = new Discord.MessageEmbed()
						.setColor('#c2907e')
						.setTitle(`The loot table has changed for ${arg[1]}!`)
						.setDescription(`Items:${newItems}`)

					if (chestFile[message.guild.id][channelID][arg[1]].spoiler == false)
						message.channel.send({embeds: [chestEmbed]})
					else {
						message.delete()
						message.author.send({embeds: [chestEmbed]})
					}

					fs.writeFileSync(chestPath, JSON.stringify(chestFile, null, '    '));
					return true
				}
			}
		}
	}

	if (command == 'removechestloot') {
		if (utilityFuncs.isBanned(message.author.id, message.guild.id) && !utilityFuncs.RPGBotAdmin(message.author.id)) {
			message.channel.send("I've been told you were banned from using the RPG sections of the bot, sorry!")
			return false
		}
		
        if (!message.member.permissions.serialize().ADMINISTRATOR) {
            message.channel.send("You lack sufficient permissions, I'm so sorry!");
            return
        }

        const arg = message.content.slice(prefix.length).trim().split(/ +/);
        if (!arg[1]) {
            const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle(`${prefix}removechestloot`)
				.setDescription("(Args <Name>)\nWill remove a chest's loot table, and items related to it within.")
            message.channel.send({embeds: [DiscordEmbed]})
            return false
        }

		const success = utilityFuncs.getChest(arg[1],message)

		if (success == false) {
			message.channel.send(`${arg[1]} is not a valid chest.`)
			return false
		}

		var chestPath = dataPath+'/chests.json'
		var chestRead = fs.readFileSync(chestPath);
		var chestFile = JSON.parse(chestRead);

		for (const channelID in chestFile[message.guild.id]) {
			for (const chest in chestFile[message.guild.id][channelID]) {
				if (chestFile[message.guild.id][channelID][arg[1]]) {
					if (chestFile[message.guild.id][channelID][arg[1]].inputLoot == "") {
						message.channel.send(`${arg[1]} does not have a chest loot specified.`)
						return false
					}

					for (const item in chestFile[message.guild.id][channelID][arg[1]].itemsFromLoot) {

						console.log(item)
						if (chestFile[message.guild.id][channelID][arg[1]].items[item] > 0) {
							chestFile[message.guild.id][channelID][arg[1]].items[item] -= chestFile[message.guild.id][channelID][arg[1]].itemsFromLoot[item]
						}
						
						if (chestFile[message.guild.id][channelID][arg[1]].items[item] <= 0) {
							delete chestFile[message.guild.id][channelID][arg[1]].items[item]
						}
					}

					chestFile[message.guild.id][channelID][arg[1]].itemsFromLoot = {}
					chestFile[message.guild.id][channelID][arg[1]].inputLoot = ""

					let newItems = ''
					for (const i in chestFile[message.guild.id][channelID][arg[1]].items) {
						newItems += `\n- ${i}: ${chestFile[message.guild.id][channelID][arg[1]].items[i]}`
					}

					if (newItems.length < 1)
						newItems = '\nNone'

					var chestEmbed = new Discord.MessageEmbed()
						.setColor('#c2907e')
						.setTitle(`The loot table has been removed for ${arg[1]}!`)
						.setDescription(`Items:${newItems}`)

					if (chestFile[message.guild.id][channelID][arg[1]].spoiler == false)
						message.channel.send({embeds: [chestEmbed]})
					else {
						message.delete()
						message.author.send({embeds: [chestEmbed]})
					}

					fs.writeFileSync(chestPath, JSON.stringify(chestFile, null, '    '));
					return true
				}
			}
		}
	}

	if (command == 'chestitems') {
		if (utilityFuncs.isBanned(message.author.id, message.guild.id) && !utilityFuncs.RPGBotAdmin(message.author.id)) {
			message.channel.send("I've been told you were banned from using the RPG sections of the bot, sorry!")
			return false
		}
		
        if (!message.member.permissions.serialize().ADMINISTRATOR) {
            message.channel.send("You lack sufficient permissions, I'm so sorry!");
            return
        }

        const arg = message.content.slice(prefix.length).trim().split(/ +/);
        if (!arg[1]) {
            const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle(`${prefix}chestitems`)
				.setDescription("(Args <Name> <Optional: Items>)\nWill set a chest's base items to put into a chest.")
            message.channel.send({embeds: [DiscordEmbed]})
            return false
        }

		const success = utilityFuncs.getChest(arg[1],message)

		if (success == false) {
			message.channel.send(`${arg[1]} is not a valid chest.`)
			return false
		}

		var chestPath = dataPath+'/chests.json'
		var chestRead = fs.readFileSync(chestPath);
		var chestFile = JSON.parse(chestRead);
		var itemPath = dataPath+'/items.json'
        var itemRead = fs.readFileSync(itemPath);
        var itemFile = JSON.parse(itemRead);

		let incorrectItems = ""
		let chosenItems = []

		for (const i in arg) {
			if (i > 1) {
				if (!itemFile[arg[i]]) {
					incorrectItems += `\n- ${[arg[i]]}`
				} else {
					chosenItems.push(itemFile[arg[i]].name)
				}
			}
		}

		if (incorrectItems.length > 0)
			message.channel.send(`<:warning:878094052208296007>**Your invalid items are:**${incorrectItems}`);

			for (const channelID in chestFile[message.guild.id]) {
				for (const chest in chestFile[message.guild.id][channelID]) {
					if (chestFile[message.guild.id][channelID][arg[1]]) {
	
						for (const i in chestFile[message.guild.id][channelID][arg[1]].inputItems) {
							var item = chestFile[message.guild.id][channelID][arg[1]].inputItems[i]

							if (chestFile[message.guild.id][channelID][arg[1]].items[item] > 0)
								chestFile[message.guild.id][channelID][arg[1]].items[item]--
							
							if (chestFile[message.guild.id][channelID][arg[1]].items[item] <= 0)
								delete chestFile[message.guild.id][channelID][arg[1]].items[item]
						}
	
						chestFile[message.guild.id][channelID][arg[1]].inputItems = chosenItems

						for (const i in chosenItems) {
							if (!chestFile[message.guild.id][channelID][arg[1]].items[chosenItems[i]]) {
								chestFile[message.guild.id][channelID][arg[1]].items[chosenItems[i]] = 0
							}
									
							chestFile[message.guild.id][channelID][arg[1]].items[chosenItems[i]] += 1
						}

						let newItems = ''
						for (const i in chestFile[message.guild.id][channelID][arg[1]].items) {
							newItems += `\n- ${i}: ${chestFile[message.guild.id][channelID][arg[1]].items[i]}`
						}

						if (newItems.length < 1)
						newItems = '\nNone'
	
						var chestEmbed = new Discord.MessageEmbed()
							.setColor('#c2907e')
							.setTitle(`The base items have been changed for ${arg[1]}!`)
							.setDescription(`Items:${newItems}`)
	
						if (chestFile[message.guild.id][channelID][arg[1]].spoiler == false)
							message.channel.send({embeds: [chestEmbed]})
						else {
							message.delete()
							message.author.send({embeds: [chestEmbed]})
						}
	
						fs.writeFileSync(chestPath, JSON.stringify(chestFile, null, '    '));
						return true
					}
				}
			}
	}

	if (command == 'removechestitems') {
		if (utilityFuncs.isBanned(message.author.id, message.guild.id) && !utilityFuncs.RPGBotAdmin(message.author.id)) {
			message.channel.send("I've been told you were banned from using the RPG sections of the bot, sorry!")
			return false
		}
		
        if (!message.member.permissions.serialize().ADMINISTRATOR) {
            message.channel.send("You lack sufficient permissions, I'm so sorry!");
            return
        }

        const arg = message.content.slice(prefix.length).trim().split(/ +/);
        if (!arg[1]) {
            const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle(`${prefix}removechestitems`)
				.setDescription("(Args <Name>)\nWill remove a chest's base items.")
            message.channel.send({embeds: [DiscordEmbed]})
            return false
        }

		const success = utilityFuncs.getChest(arg[1],message)

		if (success == false) {
			message.channel.send(`${arg[1]} is not a valid chest.`)
			return false
		}

		var chestPath = dataPath+'/chests.json'
		var chestRead = fs.readFileSync(chestPath);
		var chestFile = JSON.parse(chestRead);

		for (const channelID in chestFile[message.guild.id]) {
			for (const chest in chestFile[message.guild.id][channelID]) {
				if (chestFile[message.guild.id][channelID][arg[1]]) {

					if (chestFile[message.guild.id][channelID][arg[1]].inputItems == []) {
						message.channel.send(`${arg[1]} already doesn't have base items to begin with.`)
						return false
					}

					for (const i in chestFile[message.guild.id][channelID][arg[1]].inputItems) {
						var item = chestFile[message.guild.id][channelID][arg[1]].inputItems[i]

						if (chestFile[message.guild.id][channelID][arg[1]].items[item] > 0)
							chestFile[message.guild.id][channelID][arg[1]].items[item]--
						
						if (chestFile[message.guild.id][channelID][arg[1]].items[item] <= 0)
							delete chestFile[message.guild.id][channelID][arg[1]].items[item]
					}

					chestFile[message.guild.id][channelID][arg[1]].inputItems = []

					let newItems = ''
					for (const i in chestFile[message.guild.id][channelID][arg[1]].items) {
						newItems += `\n- ${i}: ${chestFile[message.guild.id][channelID][arg[1]].items[i]}`
					}

					if (newItems.length < 1)
					newItems = '\nNone'

					var chestEmbed = new Discord.MessageEmbed()
						.setColor('#c2907e')
						.setTitle(`The base items have been removed for ${arg[1]}!`)
						.setDescription(`Items:${newItems}`)

					if (chestFile[message.guild.id][channelID][arg[1]].spoiler == false)
						message.channel.send({embeds: [chestEmbed]})
					else {
						message.delete()
						message.author.send({embeds: [chestEmbed]})
					}

					fs.writeFileSync(chestPath, JSON.stringify(chestFile, null, '    '));
					return true
				}
			}
		}
	}

	if (command == 'lockchest') {
		if (utilityFuncs.isBanned(message.author.id, message.guild.id) && !utilityFuncs.RPGBotAdmin(message.author.id)) {
			message.channel.send("I've been told you were banned from using the RPG sections of the bot, sorry!")
			return false
		}
		
        if (!message.member.permissions.serialize().ADMINISTRATOR) {
            message.channel.send("You lack sufficient permissions, I'm so sorry!");
            return
        }

        const arg = message.content.slice(prefix.length).trim().split(/ +/);
        if (!arg[1]) {
            const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle(`${prefix}lockchest`)
				.setDescription("(Args <Name> <Item>)\nWill lock a chest with an item.")
            message.channel.send({embeds: [DiscordEmbed]})
            return false
        }

		if (!arg[2]) {
			message.channel.send(`Please specify an item to lock your chest with.`)
			return false
		}

		const success = utilityFuncs.getChest(arg[1],message)

		if (success == false) {
			message.channel.send(`${arg[1]} is not a valid chest.`)
			return false
		}

		var chestPath = dataPath+'/chests.json'
		var chestRead = fs.readFileSync(chestPath);
		var chestFile = JSON.parse(chestRead);
		var itemPath = dataPath+'/items.json'
        var itemRead = fs.readFileSync(itemPath);
        var itemFile = JSON.parse(itemRead);

		if (!itemFile[arg[2]]) {
			message.channel.send(`${arg[2]} is not a valid item.`)
			return false
		}

		for (const channelID in chestFile[message.guild.id]) {
			for (const chest in chestFile[message.guild.id][channelID]) {
				if (chestFile[message.guild.id][channelID][arg[1]]) {

					chestFile[message.guild.id][channelID][arg[1]].locked = true
					chestFile[message.guild.id][channelID][arg[1]].lockOpener = arg[2]

					fs.writeFileSync(chestPath, JSON.stringify(chestFile, null, '    '));

					if (chestFile[message.guild.id][channelID][arg[1]].spoiler = true)
						message.delete()

					message.channel.send(`${arg[1]} has been locked${chestFile[message.guild.id][channelID][arg[1]].spoiler !== true ? ` with a ${arg[2]}` : `.`}`)

					return true
				}
			}
		}
	}

	if (command == 'removelock') {
		if (utilityFuncs.isBanned(message.author.id, message.guild.id) && !utilityFuncs.RPGBotAdmin(message.author.id)) {
			message.channel.send("I've been told you were banned from using the RPG sections of the bot, sorry!")
			return false
		}
		
        if (!message.member.permissions.serialize().ADMINISTRATOR) {
            message.channel.send("You lack sufficient permissions, I'm so sorry!");
            return
        }

        const arg = message.content.slice(prefix.length).trim().split(/ +/);
        if (!arg[1]) {
            const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle(`${prefix}removelock`)
				.setDescription("(Args <Name>)\nWill remove a chest's lock.")
            message.channel.send({embeds: [DiscordEmbed]})
            return false
        }

		const success = utilityFuncs.getChest(arg[1],message)

		if (success == false) {
			message.channel.send(`${arg[1]} is not a valid chest.`)
			return false
		}

		var chestPath = dataPath+'/chests.json'
		var chestRead = fs.readFileSync(chestPath);
		var chestFile = JSON.parse(chestRead);

		for (const channelID in chestFile[message.guild.id]) {
			for (const chest in chestFile[message.guild.id][channelID]) {
				if (chestFile[message.guild.id][channelID][arg[1]]) {
					if (chestFile[message.guild.id][channelID][arg[1]].lockOpener == "") {
						message.channel.send(`${arg[1]} doesn't have a lock.`)
						return false
					}

					chestFile[message.guild.id][channelID][arg[1]].locked = false
					chestFile[message.guild.id][channelID][arg[1]].lockOpener = ""

					fs.writeFileSync(chestPath, JSON.stringify(chestFile, null, '    '));

					if (chestFile[message.guild.id][channelID][arg[1]].spoiler = true)
						message.delete()

					message.channel.send(`${arg[1]} is no longer locked.`)

					return true
				}
			}
		}
	}

	if (command == 'getchest') {
		const arg = message.content.slice(prefix.length).trim().split(/ +/);
        if (!arg[1]) {
            const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle(`${prefix}getchest`)
				.setDescription("(Args <Name>)\nWill display some information about a specific chest.")
            message.channel.send({embeds: [DiscordEmbed]})
            return false
        }

		const success = utilityFuncs.getChest(arg[1],message)

		if (success == false) {
			message.channel.send(`${arg[1]} is not a valid chest.`)
			return false
		}

		var chestPath = dataPath+'/chests.json'
		var chestRead = fs.readFileSync(chestPath);
		var chestFile = JSON.parse(chestRead);

		var canSkip = false
		if (message.member.permissions.serialize().ADMINISTRATOR || utilityFuncs.RPGBotAdmin(message.author.id))
			canSkip = true

		for (const channelID in chestFile[message.guild.id]) {
			for (const chest in chestFile[message.guild.id][channelID]) {
				if (chestFile[message.guild.id][channelID][arg[1]]) {
					if (chestFile[message.guild.id][channelID][arg[1]].spoiler == true && chestFile[message.guild.id][channelID][arg[1]].encountered == false && canSkip == false) {
						var DiscordEmbed = new Discord.MessageEmbed()
						.setColor('#c2907e')
						.setTitle(`${arg[1]}`)
						.setDescription("You can't look in there yet. Please open it first before you can access the information.")
	
					return message.channel.send({embeds: [DiscordEmbed]})
					}

					var chestChannel = client.channels.cache.get(channelID)
					let spoilerText = (chestFile[message.guild.id][channelID][arg[1]].spoiler == true ? `Yes` : `No`)
					let lootText = chestFile[message.guild.id][channelID][arg[1]].inputLoot
					if (lootText == "")
						lootText = 'None'
					let pickedItems = ''
					for (const i in chestFile[message.guild.id][channelID][arg[1]].inputItems) {
						pickedItems += `\n- ${chestFile[message.guild.id][channelID][arg[1]].inputItems[i]}`
					}
					if (pickedItems == '')
					pickedItems = `None`

					let itemText = ''
					for (const i in chestFile[message.guild.id][channelID][arg[1]].items) {
						itemText += `\n- ${i}: ${chestFile[message.guild.id][channelID][arg[1]].items[i]}`
					}
					if (itemText == '')
						itemText = `None`
					
					let lockText = (chestFile[message.guild.id][channelID][arg[1]].locked == true ? `Yes` : `No`)
					let keyText = (chestFile[message.guild.id][channelID][arg[1]].lockOpener !== "" ? chestFile[message.guild.id][channelID][arg[1]].lockOpener : `None`)

					var chestEmbed = new Discord.MessageEmbed()
					.setColor('#c2907e')
					.setTitle(`${arg[1]}`)
					.setFields(
						{name: `Channel`, value: chestChannel.name, inline: true},
						{name: `Spoiler`, value: spoilerText, inline: true},
						{name: `Locked`, value: lockText, inline: false},
						{name: `Lock Key`, value: keyText, inline: false},
						{name: `Loot Table`, value: lootText, inline: false},
						{name: `Base Items`, value: pickedItems, inline: false},
						{name: `Current Items`, value: itemText, inline: false}
					)
					if (chestFile[message.guild.id][channelID][arg[1]].spoiler == true && chestFile[message.guild.id][channelID][arg[1]].encountered == false && (message.member.permissions.serialize().ADMINISTRATOR || utilityFuncs.RPGBotAdmin(message.author.id))) {
						message.react(`👍`)
						message.author.send({embeds: [chestEmbed]})
					} else
						message.channel.send({embeds: [chestEmbed]})
				}
			}
		}
	}

	if (command == 'searchchests') {
		const arg = message.content.slice(prefix.length).trim().split(/ +/);
        if (!arg[1]) {
            const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle(`${prefix}searchchests`)
				.setDescription("(Args <Search Parameter>)\nWill search for chests based on the word specified, in a server you type into.")
            message.channel.send({embeds: [DiscordEmbed]})
            return false
        }

		var chestPath = dataPath+'/chests.json'
		var chestRead = fs.readFileSync(chestPath);
		var chestFile = JSON.parse(chestRead);

		var skillTxt = []
		for (const channelID in chestFile[message.guild.id]) {
			for (const chest in chestFile[message.guild.id][channelID]) {
				if (chest.includes(arg[1])) {
					skillTxt.push(chestFile[message.guild.id][channelID][chest])
				}
			}
		}

		sendBasicArray(message.channel, skillTxt)
	}

	if (command == 'listchests') {
		var chestPath = dataPath+'/chests.json'
		var chestRead = fs.readFileSync(chestPath);
		var chestFile = JSON.parse(chestRead);
		
		var skillTxt = []
		for (const channelID in chestFile[message.guild.id]) {
			for (const chest in chestFile[message.guild.id][channelID]) {
				skillTxt.push(chestFile[message.guild.id][channelID][chest])
			}
		}
		
		sendBasicArray(message.channel, skillTxt)
	}

	if (command == 'openchest') {
		message.delete()

		if (utilityFuncs.isBanned(message.author.id, message.guild.id) && !utilityFuncs.RPGBotAdmin(message.author.id)) {
			message.channel.send("I've been told you were banned from using the RPG sections of the bot, sorry!")
			return false
		}
		
        if (!message.member.permissions.serialize().ADMINISTRATOR) {
            message.channel.send("You lack sufficient permissions, I'm so sorry!");
            return
        }

        const arg = message.content.slice(prefix.length).trim().split(/ +/);
        if (!arg[1]) {
            const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle(`${prefix}openchest`)
				.setDescription('(Args <Chest Name> <Party>)\nOpens a created chest with the specified party.')
            message.channel.send({embeds: [DiscordEmbed]})
            return false
        }

		if (!arg[2]) {
            message.channel.send("Please specify a correct party.");
            return
        }

		var chestPath = dataPath+'/chests.json'
		var chestRead = fs.readFileSync(chestPath);
		var chestFile = JSON.parse(chestRead);
		var btlPath = dataPath+'/battle.json'
		var btlRead = fs.readFileSync(btlPath);
		var btl = JSON.parse(btlRead);

		if (!chestFile[message.guild.id][message.channel.id][arg[1]]) {
			message.channel.send(`${arg[1]} does not exist in this channel. Please try somewhere else.`);
            return
		}

		if (!btl[message.guild.id].parties[arg[2]]) {
			message.channel.send("Invalid Party!")
			return false
		}

		var chestInput = chestFile[message.guild.id][message.channel.id][arg[1]]
		var partyInput = btl[message.guild.id].parties[arg[2]]

		let canOpen = false

		if (chestInput.locked == false) {
			canOpen = true
		} else if (chestInput.locked == true) {
			for (const i in partyInput.items) {
				if (chestInput.lockOpener == i) {
					canOpen = true
				}
			}
		}

		if (canOpen == false) {
			message.channel.send("You can't open this chest because you don't have the right item to open it with.")
			return false
		}

		chestInput.party = arg[2]
		chestInput.encountered = true
		fs.writeFileSync(chestPath, JSON.stringify(chestFile, null, '    '));

		let itemText = ''
		for (const i in chestInput.items) {
			itemText += `\n- ${i}: ${chestInput.items[i]}`
		}
		if (itemText == '')
			itemText = `None`

		var chestEmbed = new Discord.MessageEmbed()
			.setColor('#c2907e')
			.setTitle(`${arg[2]} has successfully opened ${arg[1]}`)
			.setFields(
				{name: `Items`, value: itemText, inline: false}
			)
		message.channel.send({embeds: [chestEmbed]})
	}

	if (command == 'closechest') {
		message.delete()

		if (utilityFuncs.isBanned(message.author.id, message.guild.id) && !utilityFuncs.RPGBotAdmin(message.author.id)) {
			message.channel.send("I've been told you were banned from using the RPG sections of the bot, sorry!")
			return false
		}
		
        if (!message.member.permissions.serialize().ADMINISTRATOR) {
            message.channel.send("You lack sufficient permissions, I'm so sorry!");
            return
        }

		const arg = message.content.slice(prefix.length).trim().split(/ +/);
        if (!arg[1]) {
            const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle(`${prefix}closechest`)
				.setDescription('(Args <Chest Name>)\nCloses a created chest if it is open.')
            message.channel.send({embeds: [DiscordEmbed]})
            return false
        }

		var chestPath = dataPath+'/chests.json'
		var chestRead = fs.readFileSync(chestPath);
		var chestFile = JSON.parse(chestRead);
		var btlPath = dataPath+'/battle.json'
		var btlRead = fs.readFileSync(btlPath);
		var btl = JSON.parse(btlRead);

		if (!chestFile[message.guild.id][message.channel.id][arg[1]]) {
			message.channel.send(`${arg[1]} does not exist in this channel. Please try somewhere else.`);
            return
		}

		var chestInput = chestFile[message.guild.id][message.channel.id][arg[1]]

		if (chestInput.party == "") {
			message.channel.send(`${arg[1]} is not open yet. Please open it first.`);
            return
		}

		message.channel.send(`${chestInput.party} has closed ${arg[1]}.`)
		chestInput.party = ""
		fs.writeFileSync(chestPath, JSON.stringify(chestFile, null, '    '));
	}

	if (command == 'takeitem') {
		message.delete()

		if (utilityFuncs.isBanned(message.author.id, message.guild.id) && !utilityFuncs.RPGBotAdmin(message.author.id)) {
			message.channel.send("I've been told you were banned from using the RPG sections of the bot, sorry!")
			return false
		}

		const arg = message.content.slice(prefix.length).trim().split(/ +/);
        if (!arg[1]) {
            const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle(`${prefix}takeitem`)
				.setDescription(`(Args <Chest Name> <Item> <Optional: Quantity>)\nTake items from a chest, should it be open.\n\nYou can also do:\n${prefix}takeitem all to take all the items from the chest.`)
            message.channel.send({embeds: [DiscordEmbed]})
            return false
        }

		if (!arg[2]) {
			message.channel.send("Please specify what item you want to take, or if you want to take all of them.")
			return false
		}

		var chestPath = dataPath+'/chests.json'
		var chestRead = fs.readFileSync(chestPath);
		var chestFile = JSON.parse(chestRead);
		var itemPath = dataPath+'/items.json'
		var itemRead = fs.readFileSync(itemPath);
		var itemFile = JSON.parse(itemRead);
		var btlPath = dataPath+'/battle.json'
		var btlRead = fs.readFileSync(btlPath);
		var btl = JSON.parse(btlRead);

		if (!chestFile[message.guild.id][message.channel.id][arg[1]]) {
			message.channel.send(`${arg[1]} does not exist in this channel. Please try somewhere else.`);
            return
		}

		var chestInput = chestFile[message.guild.id][message.channel.id][arg[1]]

		if (chestInput.party == "") {
			message.channel.send(`${arg[1]} is not open yet. Please open it first.`);
            return
		}

		var partyInput = btl[message.guild.id].parties[chestInput.party]

		if (arg[2] == 'All') {
			for (const item in itemFile) {
				for (const chestItem in chestInput.items) {
					if (chestItem == itemFile[item].name) {
						if (!partyInput.items[item]) {
							partyInput.items[item] = 0
						}

						partyInput.items[item] += chestInput.items[chestItem]
					}
				}
			}
			fs.writeFileSync(btlPath, JSON.stringify(btl, null, '    '));

			chestInput.items = {}

			fs.writeFileSync(chestPath, JSON.stringify(chestFile, null, '    '));
		} else {
			let quantity = 1

			if (!arg[3])
			quantity = 1

			quantity = parseInt(arg[3])

			if (!isFinite(parseInt(arg[3])))
			quantity = 1

			if (parseInt(arg[3]) < 1)
			quantity = 1

			if (!itemFile[arg[2]]) {
				message.channel.send(`${arg[2]} is not a valid item.`);
            	return
			}

			let canTake = false

			for (i in chestInput.items) {
				if (itemFile[arg[2]].name == i)
				canTake = true
			}

			if (canTake == false) {
				message.channel.send(`${arg[2]} is not in this chest yet.`);
            	return
			}

			if (quantity > chestInput.items[itemFile[arg[2]].name])
			quantity = chestInput.items[itemFile[arg[2]].name]

			chestInput.items[itemFile[arg[2]].name] -= quantity

			if (chestInput.items[itemFile[arg[2]].name] < 1)
			delete chestInput.items[itemFile[arg[2]].name]

			fs.writeFileSync(chestPath, JSON.stringify(chestFile, null, '    '));

			if (!partyInput.items[arg[2]]) {
				partyInput.items[arg[2]] = 0
			}

			partyInput.items[arg[2]] += quantity

			fs.writeFileSync(btlPath, JSON.stringify(btl, null, '    '));
		}

		let itemText = ''
		for (const i in chestInput.items) {
			itemText += `\n- ${i}: ${chestInput.items[i]}`
		}
		if (itemText == '')
			itemText = `None`

		var chestEmbed = new Discord.MessageEmbed()
			.setColor('#c2907e')
			.setTitle(`${chestInput.party} has successfully taken items from ${chestInput.name}`)
			.setFields(
				{name: `Items`, value: itemText, inline: false}
			)
		message.channel.send({embeds: [chestEmbed]})
	}

	if (command == 'putitem') {
		message.delete()

		if (utilityFuncs.isBanned(message.author.id, message.guild.id) && !utilityFuncs.RPGBotAdmin(message.author.id)) {
			message.channel.send("I've been told you were banned from using the RPG sections of the bot, sorry!")
			return false
		}

		const arg = message.content.slice(prefix.length).trim().split(/ +/);
        if (!arg[1]) {
            const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle(`${prefix}putitem`)
				.setDescription(`(Args <Chest Name> <Item> <Optional: Quantity>)\nTake items from a party, and put them inside of a chest, should it be open.\n\nYou can also do:\n${prefix}putitem all to put all the items from the party into a chest.`)
            message.channel.send({embeds: [DiscordEmbed]})
            return false
        }

		if (!arg[2]) {
			message.channel.send("Please specify what item you want to take, or if you want to take all of them.")
			return false
		}

		var chestPath = dataPath+'/chests.json'
		var chestRead = fs.readFileSync(chestPath);
		var chestFile = JSON.parse(chestRead);
		var itemPath = dataPath+'/items.json'
		var itemRead = fs.readFileSync(itemPath);
		var itemFile = JSON.parse(itemRead);
		var btlPath = dataPath+'/battle.json'
		var btlRead = fs.readFileSync(btlPath);
		var btl = JSON.parse(btlRead);

		if (!chestFile[message.guild.id][message.channel.id][arg[1]]) {
			message.channel.send(`${arg[1]} does not exist in this channel. Please try somewhere else.`);
            return
		}

		var chestInput = chestFile[message.guild.id][message.channel.id][arg[1]]

		if (chestInput.party == "") {
			message.channel.send(`${arg[1]} is not open yet. Please open it first.`);
            return
		}

		var partyInput = btl[message.guild.id].parties[chestInput.party]

		if (arg[2] == 'All') {
			for (const item in itemFile) {
				for (const partyItem in partyInput.items) {
					if (item == partyItem) {
						if (!chestInput.items[itemFile[item].name]) {
							chestInput.items[itemFile[item].name] = 0
						}

						chestInput.items[itemFile[item].name] += partyInput.items[partyItem]
					}
				}
			}

			fs.writeFileSync(chestPath, JSON.stringify(chestFile, null, '    '));

			partyInput.items = {}

			fs.writeFileSync(btlPath, JSON.stringify(btl, null, '    '));
		} else {
			let quantity = 1

			if (!arg[3])
			quantity = 1

			quantity = parseInt(arg[3])

			if (!isFinite(parseInt(arg[3])))
			quantity = 1

			if (parseInt(arg[3]) < 1)
			quantity = 1

			if (!itemFile[arg[2]]) {
				message.channel.send(`${arg[2]} is not a valid item.`);
            	return
			}

			let canPut = false

			for (i in partyInput.items) {
				if (arg[2] == i)
				canPut = true
			}

			if (canPut == false) {
				message.channel.send(`${arg[2]} is not an item in ${chestInput.party}'s inventory.`);
            	return
			}

			if (quantity > partyInput.items[arg[2]])
			quantity = partyInput.items[arg[2]]

			partyInput.items[arg[2]] -= quantity

			if (partyInput.items[arg[2]] < 1)
			delete partyInput.items[arg[2]]

			fs.writeFileSync(btlPath, JSON.stringify(btl, null, '    '));

			if (!chestInput.items[itemFile[arg[2]].name]) {
				chestInput.items[itemFile[arg[2]].name] = 0
			}

			chestInput.items[itemFile[arg[2]].name] += quantity

			fs.writeFileSync(chestPath, JSON.stringify(chestFile, null, '    '));
		}

		let itemText = ''
		for (const i in chestInput.items) {
			itemText += `\n- ${i}: ${chestInput.items[i]}`
		}
		if (itemText == '')
			itemText = `None`

		var chestEmbed = new Discord.MessageEmbed()
			.setColor('#c2907e')
			.setTitle(`${chestInput.party} has successfully put items from ${chestInput.name}`)
			.setFields(
				{name: `Items`, value: itemText, inline: false}
			)
		message.channel.send({embeds: [chestEmbed]})
	}

	/////////////////////
    // Battle Commands //
    /////////////////////
	if (command === 'guide') {
		const arg = message.content.slice(prefix.length).trim().split(/ +/);
		var pageNum = parseInt(arg[1])
		
		var guidePath = dataPath+'/guide.json'
		var guideRead = fs.readFileSync(guidePath);
		var guide = JSON.parse(guideRead);
        var charPath = dataPath+'/characters.json';
        var charRead = fs.readFileSync(charPath);
        var charFile = JSON.parse(charRead);
		var skillPath = dataPath+'/skills.json';
		var skillRead = fs.readFileSync(skillPath);
		var skillFile = JSON.parse(skillRead);
		
		if (!guide[pageNum])
			pageNum = 0;

		if (guide[pageNum]) {
			const guideTxt = guide[pageNum]
			const DiscordEmbed = new Discord.MessageEmbed()
				
			if (guideTxt.color)
				DiscordEmbed.setColor(guideTxt.color.toLowerCase);
			
			if (guideTxt.title)
				DiscordEmbed.setTitle(guideTxt.title);
			
			if (guideTxt.desc)
				DiscordEmbed.setDescription(guideTxt.desc);
			
			if (guideTxt.fields) {
				DiscordEmbed.addFields()

				for (const i in guideTxt.fields) {
					var titleTxt = guideTxt.fields[i].title ? guideTxt.fields[i].title : `Section ${i}`
					var descTxt = guideTxt.fields[i].text ? guideTxt.fields[i].text : 'Description Text'
					var inline = guideTxt.fields[i].inline ? true : false
					
					if (descTxt.includes('%RANDOMSKILL%')) {
						var possibleSkills = []
						for (const val in skillFile) {
							if (skillFile[val].type != "heal" && (skillFile[val].type != "status" && !skillFile[val].buff) && skillFile[val].type != "passive" && val != "Metronome") {
								possibleSkills.push(val)
							}
						}

						var skillVal = possibleSkills[Math.round(Math.random() * (possibleSkills.length-1))]
						skillDefs = skillFile[skillVal]

						descTxt = descTxt.replace('%RANDOMSKILL%', `${elementEmoji[skillDefs.type]}${skillDefs.name ? skillDefs.name : skillVal}\n`)
					}
					
					DiscordEmbed.fields.push({name: titleTxt, value: descTxt, inline: inline})
				}
			}
			
			message.reply({embeds: [DiscordEmbed]})
		}
	}

    if (command === 'registerskill') {
		if (utilityFuncs.isBanned(message.author.id, message.guild.id) && !utilityFuncs.RPGBotAdmin(message.author.id)) {
			message.channel.send("I've been told you were banned from using the RPG sections of the bot, sorry!")
			return false
		}


        const arg = message.content.slice(prefix.length).trim().split(/ +/);
        if (!arg[1]) {
            const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .addFields(
                    { name: `${prefix}registerskill`, value: `(Args <Name> <Cost> <CostType> <Power> <Accuracy> <Critical Hit Chance> <Element> <Status Affliction> <Status Chance> <Physical/Magic> <Target> <Hits> "<Desc>")\nCreates a skill to be used in battle. \nThese skills have certain properties that can change how they're used.\n\nAllow me to explain`, inline: false },
                    { name: 'Cost', value: "To be used in combination with the next one.", inline: true },
                    { name: 'CostType', value: "HP, MP, HP% or MP%. For example, if I set cost to 5, and costtype to MP%, it would take 5% of my MP.", inline: true },
                    { name: 'Power', value: "Self Explanitory. \nA little insight on how damage is calculated, somewhat similar to the Persona series.", inline: true },
                    { name: 'Accuracy', value: "A chance out of 100 that the move lands. Modified by user perception and enemy agility.", inline: true },
                    { name: 'Critical Hit Chance', value: "The chance that this move is a critical hit out of 100. Modified by user and enemy luck.", inline: true },
                    { name: 'Element', value: "The element this skill is. This is either Strike, Slash, Pierce, Fire, Water, Ice, Electric, Wind, Earth, Grass, Psychic, Poison, Nuclear, Metal, Curse, Bless, Almighty, Heal, Status or Passive. All fighters will have their own weaknesses and resistances.", inline: true },
                    { name: 'Status Affliction', value: "The status effect this skill can inflict.", inline: true },
                    { name: 'Status Chance', value: "Chance this skill has to inflict a status effect (will do nothing if 'Status Affliction' is 'none'.", inline: true },
                    { name: 'Physical or Magic?', value: "If this skill is physical it will use the user's Strength stat, otherwise, Magic.", inline: true },
                    { name: 'Target', value: "Whether this targets all foes or one foe, maybe even all allies depending on the skill. The target types are 'one', 'allopposing', 'allallies', 'caster', 'everyone'", inline: true },
                    { name: 'Hit Count', value: "The amount of hits this move does. Generally, moves with more hits have less power.", inline: true },
                    { name: 'Description', value: "This Skills's description. Try to explain what the move does, so your friends can imagine it! Enclose this value in quotation marks.", inline: true },
                )
            message.channel.send({embeds: [DiscordEmbed]})
            return false
        }
		
        if (message.content.includes("@everyone") || message.content.includes("@here") || message.mentions.users.first())
            return message.channel.send(`You're really mean, you know that?`);

        if (!utilityFuncs.RPGBotAdmin(message.author.id) && message.author.id != readSkill(arg[1]).originalAuthor) {
            if (readSkill(arg[1]))
                return message.channel.send("This skill exists already, and you aren't it's original author, therefore, You have insufficient permissions to overwrite it.");
        }


		if (!arg[2])
			return registerSkillSteps.step1(arg[1], client, message.channel, message.author)
			
		if (!arg[7])
			return message.channel.send("Please specify a type.");

        if (utilityFuncs.validType(arg[7].toLowerCase())) {
			if (!arg[10])
				return message.channel.send('Please specify either "Physical" or "Magic" for argument 10.');

            var skilltype = "physical"
            if (arg[10].toLowerCase() === "magic" ||
                arg[10].toLowerCase() === "ranged" ||
                arg[10].toLowerCase() === "special" ||
                arg[10].toLowerCase() === "mag" ||
                arg[10].toLowerCase() === "spec" ||
				parseInt(arg[10]) == 2) {
					skilltype = "magic"
            }

			if (!arg[3])
				return message.channel.send("Please specify HP or MP for argument 3.");

            var costType = "mp"
            if (arg[3].toLowerCase() === "hp" || arg[3].toLowerCase() === "health") {
                costType = "hp"
            } else if (arg[3].toLowerCase() === "mp%" || arg[3].toLowerCase() === "mppercent" || arg[3].toLowerCase() === "percentofmp") {
                costType = "mppercent"
            } else if (arg[3].toLowerCase() === "hp%" || arg[3].toLowerCase() === "hppercent" || arg[3].toLowerCase() === "percentofhp") {
                costType = "hppercent"
            }

            var targType = "one"
            if (arg[11].toLowerCase() === "allenemies" || arg[11].toLowerCase() === "allfoes" || arg[11].toLowerCase() === "allopposing") {
                targType = "allopposing"
            } else if (arg[11].toLowerCase() === "allallies" || arg[11].toLowerCase() === "allfriends" || arg[11].toLowerCase() === "allplayers") {
                targType = "allallies"
            } else if (arg[11].toLowerCase() === "all" || arg[11].toLowerCase() === "everyone" || arg[11].toLowerCase() === "fuckyou") {
                targType = "everyone"
            } else if (arg[11].toLowerCase() === "me" || arg[11].toLowerCase() === "user" || arg[11].toLowerCase() === "caster") {
                targType = "caster"
            }
			
			var skillDesc = message.content.slice(prefix.length).trim().split('"')[1]

            writeSkill(message, arg[1], parseInt(arg[2]), costType, parseInt(arg[4]), parseInt(arg[5]), parseInt(arg[6]), arg[7].toLowerCase(), arg[8], parseInt(arg[9]), skilltype, targType, parseInt(arg[12]), skillDesc)
            if (readSkill(arg[1])) {
                const skillName = arg[1]
                const skillDefs = readSkill(skillName)
                message.channel.send(`${skillName} is good to go!`);

				var finalText = ``;
				if (skillDefs.pow && skillDefs.type != "heal" && skillDefs.type != "status") {
					finalText += `Has **${skillDefs.pow}** Power`;
					if (skillDefs.hits && skillDefs.hits > 1) {finalText += ` and hits **${skillDefs.hits}** times.`}

					finalText += "\n";
					switch(skillDefs.target) {
						case "allopposing":
							finalText += "Attacks **all foes**.\n";
							break;
						case "allallies":
							finalText += "Attacks **all allies**.\n";
							break;
						case "everyone":
							finalText += "Attacks **all fighters**.\n";
							break;
						case "caster":
							finalText += "Attacks **the user**.\n";
							break;
						default:
							finalText += "Attacks **one foe**.\n";
					}
				}

				if (skillDefs.cost && skillDefs.costtype) {
					switch(skillDefs.costtype) {
						case "hp":
							finalText += `Costs **${skillDefs.cost}HP**.\n`;
							break;
						case "hppercent":
							finalText += `Costs **${skillDefs.cost}% of the user's Max HP**.\n`;
							break;
						case "mppercent":
							finalText += `Costs **${skillDefs.cost}% of the user's Max MP**.\n`;
							break;
						default:
							finalText += `Costs **${skillDefs.cost}MP**.\n`;
					}
				}
				
				if (skillDefs.acc && skillDefs.type != "heal" && skillDefs.type != "status" && skillDefs.type != "passive") {
					finalText += `Has **${skillDefs.acc}%** Accuracy.\n`;
				}

				if (skillDefs.drain) {
					if (skillDefs.drain > 1) {
						finalText += `Drains 1/${skillDefs.drain} of damage dealt.\n`;
					} else {
						finalText += `Drains all damage dealt.\n`;
					}
				}

				if (skillDefs.crit) {
					finalText += `**${skillDefs.crit}%**☄\n`;
				}

				if (skillDefs.status && skillDefs.status !== "none") {
					if (skillDefs.statuschance) {
						finalText += `Has a **${skillDefs.statuschance}%** chance of inflicting **${skillDefs.status}**.\n`;
					} else if (!skillDefs.statuschance || skillDefs.statuschance >= 100) {
						finalText += `Guaranteed to inflict **${skillDefs.status}**.\n`;
					}
				}

				if (skillDefs.type === "status") {
					if (skillDefs.autoguard && skillDefs.protectitem) {
						finalText += `Protects **one** party member with ${skillDefs.protectitem}.\n`;
					} else if (skillDefs.autoguardall && skillDefs.protectitem) {
						finalText += `Protects **all** party members with ${skillDefs.protectitem}.\n`;
					}
				}

				if (skillDefs.atktype) {
					var attackArray = skillDefs.atktype.split('');
					attackArray[0] = attackArray[0].toUpperCase()
					
					var attackString = attackArray.join('');
					finalText += `**${attackString}** attack.\n`;
				}

				if (skillDefs.mimic)
					finalText += `\nMimics **one ally/foe**.`;

				if (skillDefs.copyskill)
					finalText += `\nUses a **randomly known ally skill**.`;

				if (skillDefs.sketch)
					finalText += "\nCopies a **random skill of the opponent's**.";

				if (skillDefs.metronome)
					finalText += `\nUses a **randomly defined skill**.`;
				
				if (skillDefs.futuresight)
					finalText += `\nWill deal damage in **${skillDefs.futuresight.turns} turns**.`;
				
				if (skillDefs.desc)
					finalText += `\n*${skillDefs.desc}*`;

				const DiscordEmbed = new Discord.MessageEmbed()
					.setColor('#4b02c9')
					.setTitle(`${elementEmoji[skillDefs.type]} ${skillName}`)
					.setDescription(`${finalText}`)
                message.channel.send({embeds: [DiscordEmbed]});
            } else {
                message.channel.send(`There's been an issue creating your skill!`);
                return
            }
        } else {
            message.channel.send(`${arg[5]} is not a valid type.`)
        }
    }

    if (command === 'registerstatus') {
		if (utilityFuncs.isBanned(message.author.id, message.guild.id) && !utilityFuncs.RPGBotAdmin(message.author.id)) {
			message.channel.send("I've been told you were banned from using the RPG sections of the bot, sorry!")
			return false
		}

        const arg = message.content.slice(prefix.length).trim().split(/ +/);
        if (arg[1] == null) {
            const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
				.setTitle(`${prefix}registerstatus`)
				.setDescription(`(Args <Name> <Cost> <CostType> <Status Type> <Extra Value 1> <Extra Value 2> "<Desc>")\nCreates a skill to be used in battle. \nThese skills have certain properties that can change how they're used.\n\nAllow me to explain`)
                .addFields(
                    { name: 'Cost', value: "To be used in combination with the next one.", inline: true },
                    { name: 'CostType', value: "HP, MP, HP% or MP%. For example, if I set cost to 5, and costtype to MP%, it would take 5% of my MP.", inline: true },
                    { name: 'Status Type', value: "This is the thing this status skill will do. Input things such as 'buff', 'debuff', 'mimic', 'status', 'clone', 'makarakarn', 'tetrakarn', 'shield' & 'trap' for this. The value of this will change how Extra Value 1 and Extra Value 2 are used.", inline: true },
                    { name: 'Extra Value 1', value: "A value that affects the usage of the skill. For example, if 'Status Type' is 'status', this would be the status effect to inflict.", inline: true },
					{ name: 'Extra Value 2', value: "A value that affects the usage of the skill. For example, if 'Status Type' is 'status', this would be the chance the status is inflicted.", inline: true },
                    { name: 'Description', value: "This Skills's description. Try to explain what the move does, so your friends can imagine it! Enclose this value in quotation marks.", inline: true },
                )
            message.channel.send({embeds: [DiscordEmbed]})
            return false
        }
		
        if (message.content.includes("@everyone") || message.content.includes("@here") || message.mentions.users.first()) {
            message.channel.send("You're really mean, you know that?");
            return false
        }

        if (!utilityFuncs.RPGBotAdmin(message.author.id) && message.author.id != readSkill(arg[1]).originalAuthor) {
            if (readSkill(arg[1]))
                return message.channel.send("This skill exists already, and you aren't it's original author, therefore, You have insufficient permissions to overwrite it.");
        }
			
		if (!arg[4]) {
			message.channel.send('Please specify a status type.')
		}

		var costType = "mp"
		if (arg[3].toLowerCase() === "hp" || arg[3].toLowerCase() === "health") {
			costType = "hp"
		} else if (arg[3].toLowerCase() === "mp%" || arg[3].toLowerCase() === "mppercent" || arg[3].toLowerCase() === "percentofmp") {
			costType = "mppercent"
		} else if (arg[3].toLowerCase() === "hp%" || arg[3].toLowerCase() === "hppercent" || arg[3].toLowerCase() === "percentofhp") {
			costType = "hppercent"
		}
		
		var skillDesc = message.content.slice(prefix.length).trim().split('"')[1]

		writeStatus(message, arg[1], parseInt(arg[2]), costType, arg[4].toLowerCase(), arg[5], arg[6], skillDesc)
		if (readSkill(arg[1])) {
			const skillName = arg[1]
			const skillDefs = readSkill(skillName)
			message.channel.send(`${skillName} is good to go!`);

			var finalText = ``;
			if (skillDefs.cost && skillDefs.costtype) {
				switch(skillDefs.costtype) {
					case "hp":
						finalText += `Costs **${skillDefs.cost}HP**.\n`;
						break;
					case "hppercent":
						finalText += `Costs **${skillDefs.cost}% of the user's Max HP**.\n`;
						break;
					case "mppercent":
						finalText += `Costs **${skillDefs.cost}% of the user's Max MP**.\n`;
						break;
					default:
						finalText += `Costs **${skillDefs.cost}MP**.\n`;
				}
			}

			if (skillDefs.status && skillDefs.status !== "none") {
				if (skillDefs.statuschance) {
					finalText += `Has a **${skillDefs.statuschance}%** chance of inflicting **${skillDefs.status}**.\n`;
				} else if (!skillDefs.statuschance || skillDefs.statuschance >= 100) {
					finalText += `Guaranteed to inflict **${skillDefs.status}**.\n`;
				}
			}

			if (skillDefs.type === "status") {
				if (skillDefs.autoguard && skillDefs.protectitem) {
					finalText += `Protects **one** party member with ${skillDefs.protectitem}.\n`;
				} else if (skillDefs.autoguardall && skillDefs.protectitem) {
					finalText += `Protects **all** party members with ${skillDefs.protectitem}.\n`;
				} else if (skillDefs.mimic) {				
					finalText += `\nMimics **one ally/foe**.`;
				}
			}

			if (skillDefs.copyskill) {				
				finalText += `\nUses a **randomly known ally skill**.`;
			}

			if (skillDefs.sketch) {				
				finalText += "\nCopies a **random skill of the opponent's**.";
			}

			if (skillDefs.metronome) {				
				finalText += `\nUses a **randomly defined skill**.`;
			}
			
			if (skillDefs.futuresight) {				
				finalText += `\nWill deal damage in **${skillDefs.futuresight.turns} turns**.`;
			}
			
			if (skillDefs.desc) {				
				finalText += `\n*${skillDefs.desc}*`;
			}

			const DiscordEmbed = new Discord.MessageEmbed()
				.setColor('#4b02c9')
				.setTitle(`${elementEmoji[skillDefs.type]} ${skillName}`)
				.setDescription(`${finalText}`)
			message.channel.send({embeds: [DiscordEmbed]});
		} else {
			message.channel.send(`There's been an issue creating your skill!`);
			return
		}
    }

    if (command === 'registerpassive') {
		if (utilityFuncs.isBanned(message.author.id, message.guild.id) && !utilityFuncs.RPGBotAdmin(message.author.id)) {
			message.channel.send("I've been told you were banned from using the RPG sections of the bot, sorry!")
			return false
		}

        const arg = message.content.slice(prefix.length).trim().split(/ +/);
        if (arg[1] == null) {
            const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
				.setTitle(`${prefix}registerpassive`)
				.setDescription(`(Args <Name> <Passive Type> <Extra Value 1> <Extra Value 2> "<Desc>")\nCreates a skill to be used in battle. \nThese skills have certain properties that can change how they're used.\n\nAllow me to explain`)
                .addFields(
                    { name: 'Passive Type', value: "This is the thing this passive skill will do. Input things such as 'boost', 'damagephys', 'healonturn', 'healmponturn', 'counterphys', 'dodgephys' & 'affinitypoint'", inline: true },
                    { name: 'Extra Value 1', value: "A value that affects the usage of the skill. For example, if 'Passive Type' is 'counterphys', this would be the chance the attack is countered.", inline: true },
					{ name: 'Extra Value 2', value: "A value that affects the usage of the skill. For example, if 'Passive Type Type' is 'counterphys', this would be the power of the counterattack.", inline: true },
                    { name: 'Description', value: "This Skills's description. Try to explain what the move does, so your friends can imagine it! Enclose this value in quotation marks.", inline: true },
                )
            message.channel.send({embeds: [DiscordEmbed]})
            return false
        }
		
        if (message.content.includes("@everyone") || message.content.includes("@here") || message.mentions.users.first()) {
            message.channel.send("You're really mean, you know that?");
            return false
        }

        if (!utilityFuncs.RPGBotAdmin(message.author.id) && message.author.id != readSkill(arg[1]).originalAuthor) {
            if (readSkill(arg[1]))
                return message.channel.send("This skill exists already, and you aren't it's original author, therefore, You have insufficient permissions to overwrite it.");
        }
			
		if (!arg[2]) {
			message.channel.send('Please specify a passive type.')
		}
		
		var skillDesc = message.content.slice(prefix.length).trim().split('"')[1]

		writePassive(message, arg[1], arg[2].toLowerCase(), arg[3].toLowerCase(), arg[4], skillDesc)
		if (readSkill(arg[1])) {
			const skillName = arg[1]
			const skillDefs = readSkill(skillName)
			message.channel.send(`${skillName} is good to go!`);

			var finalText = ``;				
			if (skillDefs.desc) {				
				finalText += `\n*${skillDefs.desc}*`;
			}

			const DiscordEmbed = new Discord.MessageEmbed()
				.setColor('#4b02c9')
				.setTitle(`${elementEmoji[skillDefs.type]} ${skillName}`)
				.setDescription(`${finalText}`)
			message.channel.send({embeds: [DiscordEmbed]});
		} else {
			message.channel.send(`There's been an issue creating your skill!`);
			return
		}
    }

    if (command === 'listskills') {
        var skillPath = dataPath+'/skills.json'
        var skillRead = fs.readFileSync(skillPath);
        var skillFile = JSON.parse(skillRead);
		
		var user = message.mentions.users.first() ? message.mentions.users.first() : null

		var skillArray = []
        const arg = message.content.slice(prefix.length).trim().split(/ +/);
        if (!arg[1] || arg[1] === ' ' || arg[1] === 'null' || user) {
			for (const i in skillFile) {
				if (user) {
					if (skillFile[i].originalAuthor && user.id === skillFile[i].originalAuthor)
						skillArray.push(skillFile[i]);
				} else
					skillArray.push(skillFile[i]);
			}

			if (skillArray.length <= 0)
				return message.channel.send('No skills by this person.');

			sendSkillArray(message.channel, skillArray);
        } else if (utilityFuncs.validType(arg[1].toLowerCase())) {
			for (const i in skillFile) {
				if (skillFile[i].type === arg[1].toLowerCase())
					skillArray.push(skillFile[i]);
			}

			sendSkillArray(message.channel, skillArray);
		} else
			message.channel.send("Invalid move type.");
	}

    if (command === 'searchskills') {
        const arg = message.content.slice(prefix.length).trim().split(/ +/);
        if (!arg[1] || arg[1] === ' ' || arg[1] === 'null') {
            const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
				.setTitle("rpg!searchskills")
				.setDescription("(Args <Search>)\nSearches for a skill including this word, phrase or letter.")
            message.channel.send({embeds: [DiscordEmbed]})
            return false
        }

        var skillPath = dataPath+'/skills.json'
        var skillRead = fs.readFileSync(skillPath);
        var skillFile = JSON.parse(skillRead);

        var skillTxt = []
        for (const skillName in skillFile) {
            if (skillName.includes(arg[1]))
                skillTxt.push(skillFile[skillName]);
        }

		sendSkillArray(message.channel, skillTxt)
    }

    if (command === 'listelements') {
		const DiscordEmbed = new Discord.MessageEmbed()
			.setColor('#0099ff')
			.setTitle('List of usable elements:')

		var elementTxt = ''
		for (const i in Elements)
			elementTxt += `${elementEmoji[Elements[i]]} **${[Elements[i]]}**\n`;
		
		DiscordEmbed.setDescription(elementTxt)
		message.channel.send({embeds: [DiscordEmbed]})
	}

    if (command === 'liststatus') {
		const DiscordEmbed = new Discord.MessageEmbed()
			.setColor('#0099ff')
			.setTitle('List of status effects:')
			.setDescription('Status affects will affect fighters in-battle and can be fatal if not cured.')
			.addFields()
			
		var statusDesc = {
			burn: '💥Take 1/10th of max HP damage each turn until cured.',
			bleed: '💥Take 1/10th of max HP damage each until cured.',
			freeze: '💥Immobilized for one turn',
			paralyze: '💥Immobilized for one turn',
			dizzy: '🌀Accuracy of all skills halved for 3 turns.',
			sleep: '🌀Immobilized for 2 turns, restore 1/20th of HP & MP while affected.',
			despair: '🌀Lose 1/10th of max MP every turn until cured.',
			poison: '💥Take 1/10th of max HP damage each turn until cured.',
			brainwash: '🌀Use a random move on the incorrect target for 2 turns.',
			fear: '🌀50% chance to be immobilized but cured from the status.',
			rage: '🌀Forced to use stronger melee attack on a random target for 2 turns.',
			ego: '🌀Unnable to use heal skills.'
		}

		for (const i in statusEffects)
			DiscordEmbed.fields.push({name: `${statusEmojis[statusEffects[i].toLowerCase()]}${statusEffects[i]}`, value: statusDesc[statusEffects[i].toLowerCase()], inline: true})

		message.channel.send({embeds: [DiscordEmbed]})
	}

    if (command === 'getskill') {
        const arg = message.content.slice(prefix.length).trim().split(/ +/);
        var skillPath = dataPath+'/skills.json'
        var skillRead = fs.readFileSync(skillPath);
        var skillFile = JSON.parse(skillRead);

        const skillName = arg[1]

        if (skillFile[arg[1]]) {
            const skillDefs = skillFile[skillName];

            var finalText = ``;
			if (skillDefs.pow && skillDefs.type != "heal" && skillDefs.type != "status" && skillDefs.type != "passive") {
				if (skillDefs.ohko)
					finalText += 'Defeats the foe in **one shot**';
				else
					finalText += `Has **${skillDefs.pow}** Power`;

				if (skillDefs.hits && skillDefs.hits > 1) 
					finalText += ` and hits **${skillDefs.hits}** times.`;

				finalText += "\n";
				switch(skillDefs.target) {
					case "allopposing":
						finalText += "Attacks **all foes**.\n";
						break;
					case "allallies":
						finalText += "Attacks **all allies**.\n";
						break;
					case "everyone":
						finalText += "Attacks **all fighters**.\n";
						break;
					case "caster":
						finalText += "Attacks **the user**.\n";
						break;
					default:
						finalText += "Attacks **one foe**.\n";
				}
			}

            if (skillDefs.cost && skillDefs.costtype) {
				switch(skillDefs.costtype) {
					case "hp":
						finalText += `Costs **${skillDefs.cost}HP**.\n`;
						break;
					case "hppercent":
						finalText += `Costs **${skillDefs.cost}% of the user's Max HP**.\n`;
						break;
					case "mppercent":
						finalText += `Costs **${skillDefs.cost}% of the user's Max MP**.\n`;
						break;
					default:
						finalText += `Costs **${skillDefs.cost}MP**.\n`;
                }
            }
			
			if (skillDefs.acc && skillDefs.type != "heal" && skillDefs.type != "status" && skillDefs.type != "passive") {
				finalText += `Has **${skillDefs.acc}%** Accuracy.\n`;
			}

			if (skillDefs.drain) {
				if (skillDefs.drain > 1) {
					finalText += `Drains 1/${skillDefs.drain} of damage dealt.\n`;
				} else {
					finalText += `Drains all damage dealt.\n`;
				}
			}

            if (skillDefs.crit) {
                finalText += `**${skillDefs.crit}%**☄\n`;
            }

            if (skillDefs.status && skillDefs.status !== "none") {
                if (skillDefs.statuschance) {
                    finalText += `Has a **${skillDefs.statuschance}%** chance of inflicting **${skillDefs.status}**.\n`;
                } else if (!skillDefs.statuschance || skillDefs.statuschance >= 100) {
                    finalText += `Guaranteed to inflict **${skillDefs.status}**.\n`;
                }
            }

            if (skillDefs.type === "status") {
                if (skillDefs.autoguard && skillDefs.protectitem)
                    finalText += `Protects **one** party member with ${skillDefs.protectitem}.\n`;
                else if (skillDefs.autoguardall && skillDefs.protectitem)
                    finalText += `Protects **all** party members with ${skillDefs.protectitem}.\n`;
            }

			if (skillDefs.atktype) {
				var attackArray = skillDefs.atktype.split('');
				attackArray[0] = attackArray[0].toUpperCase()
				
				var attackString = attackArray.join('');
				finalText += `**${attackString}** attack.\n`;
			}

			if (skillDefs.mimic)
				finalText += `\nMimics **one ally/foe**.`;

			if (skillDefs.copyskill)
				finalText += `\nUses a **randomly known ally skill**.`;

			if (skillDefs.sketch)
				finalText += "\nCopies a **random skill of the opponent's**.";

			if (skillDefs.metronome)
				finalText += `\nUses a **randomly defined skill**.`;
			
			if (skillDefs.futuresight)
				finalText += `\nWill deal damage in **${skillDefs.futuresight.turns} turns**.`;
			
			if (skillDefs.desc)
				finalText += `\n*${skillDefs.desc}*`;
			
			finalText += '\n\n**Known By**:'

			var charPath = dataPath+'/characters.json'
			var charRead = fs.readFileSync(charPath);
			var charFile = JSON.parse(charRead);
			var enmPath = dataPath+'/enemies.json'
			var enmRead = fs.readFileSync(enmPath);
			var enmFile = JSON.parse(enmRead);
			
			var knownBy = ""

			for (const i in charFile) {
				for (const k in charFile[i].skills) {
					if (charFile[i].skills[k] == skillName) {
						if (knownBy != "") {knownBy += ", "}
						knownBy += `${i}`
					}
				}
			}

			for (const i in enmFile) {
				for (const k in enmFile[i].skills) {
					if (enmFile[i].skills[k] == skillName) {
						if (knownBy != "") {knownBy += ", "}
						knownBy += `${i}`
					}
				}
			}

			finalText += `\n${knownBy}`

			var userTxt = ''
			if (skillDefs.originalAuthor) {
				if (skillDefs.originalAuthor === 'Default')
					userTxt = 'Default/Official';
				else {
					var user = await client.users.fetch(skillDefs.originalAuthor);
					userTxt = user.username;
				}
			} else
				userTxt = 'Default/Official';

            const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#4b02c9')
				.setTitle(`${elementEmoji[skillDefs.type]} ${skillDefs.name ? skillDefs.name : skillName} *(${userTxt})*`)
				.setDescription(`${finalText}`)
            message.channel.send({content: `Here's the info for ${skillName}:`, embeds: [DiscordEmbed]});
        } else {
            message.channel.send(`${arg[1]} is an invalid skill!`);
        }
    }

    if (command === 'registeritem') {
		if (utilityFuncs.isBanned(message.author.id, message.guild.id) && !utilityFuncs.RPGBotAdmin(message.author.id))
			return message.channel.send("I've been told you were banned from using the RPG sections of the bot, sorry!");

        const arg = message.content.slice(prefix.length).trim().split(/ +/);
        if (!arg[1]) {
            const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
				.setTitle(`${prefix}registeritem`)
				.setDescription(`(Args <Name> <Currency Cost> <Item Type> <Extra Value 1> <Extra Value 2> <Extra Value 3> <Extra Value 4> <Description>)\nCreates an item to be used in battle. They can be used in battle to grant certain effects or restore health.\n\nAllow me to explain`)
                .addFields(
                    { name: 'Currency Cost', value: "How much of this server's currency this item costs in **shops**.", inline: true },
                    { name: 'Item Type', value: `The effect this item has. Right now, there's "weapon", "heal", "healmp", "healhpmp" & "revive".`, inline: true },
                    { name: 'Extra Value 1', value: 'The value of this should change depending on Item Type. For example, this value should be the ATK buff for "weapon" or the restore amount for the heal types.', inline: true },
                    { name: 'Extra Value 2', value: 'The value of this should change depending on Item Type. For example, this value should be the MAG buff for "weapon".', inline: true },
                    { name: 'Extra Value 3', value: 'The value of this should change depending on Item Type. For example, this value should be the END buff for "weapon".', inline: true },
                    { name: 'Extra Value 4', value: 'The value of this should change depending on Item Type. For example, this value should be the skill granted for "weapon".', inline: true },
                    { name: 'Description', value: "This Item's description. Try to explain what the item does and how it is used, so your friends can imagine it! Enclose this value in quotation marks.", inline: true },
                )

			return message.channel.send({embeds: [DiscordEmbed]})
        }
		
        if (message.content.includes("@everyone") || message.content.includes("@here") || message.mentions.users.first())
            return message.channel.send(`You're really mean, you know that?`);
		
        var itemPath = dataPath+'/items.json'
        var itemRead = fs.readFileSync(itemPath);
        var itemFile = JSON.parse(itemRead);

        if (!utilityFuncs.RPGBotAdmin(message.author.id)) {
            if (itemFile[arg[1]])
                return message.channel.send("This item exists already. You have insufficient permissions to overwrite it.");
        }

		if (!arg[2])
			message.channel.send('Please specify the cost.');
		else if (!arg[3])
			message.channel.send('Please specify the item type.');
			
		var splicedTxt = message.content.slice(prefix.length).trim().split('"')
		var itemDesc = splicedTxt ? splicedTxt[1] : ''

        itemFile[arg[1]] = {
			name: arg[1],
			cost: parseInt(arg[2]),
			type: arg[3].toLowerCase(),
			desc: itemDesc
		}
		
		if (arg[3].toLowerCase() === "weapon") {
			if (arg[4] && parseInt(arg[4]))
				itemFile[arg[1]].atk = parseInt(arg[4])
			if (arg[5] && parseInt(arg[5]))
				itemFile[arg[1]].mag = parseInt(arg[5])
			if (arg[6] && parseInt(arg[6]))
				itemFile[arg[1]].def = parseInt(arg[6])
			if (arg[7])
				itemFile[arg[1]].skill = arg[7]
		} else if (arg[3].toLowerCase() === "heal" || arg[3].toLowerCase() === "healmp") {
			if (arg[4] && parseInt(arg[4]))
				itemFile[arg[1]].heal = parseInt(arg[4])
			else
				itemFile[arg[1]].heal = 60
		} else if (arg[3].toLowerCase() === "healhpmp") {
			if (arg[4] && parseInt(arg[4]))
				itemFile[arg[1]].healhp = parseInt(arg[4])
			else
				itemFile[arg[1]].healhp = 60
			
			if (arg[5] && parseInt(arg[5]))
				itemFile[arg[1]].healmp = parseInt(arg[5])
			else
				itemFile[arg[1]].healmp = 40
		} else if (arg[3].toLowerCase() === "revive") {
			if (arg[4] && parseInt(arg[4]))
				itemFile[arg[1]].revive = parseInt(arg[4])
			else
				itemFile[arg[1]].revive = 2
		}
		
		fs.writeFileSync(itemPath, JSON.stringify(itemFile, null, '    '));
		
		const DiscordEmbed = new Discord.MessageEmbed()
			.setColor('#4b02c9')
			.setTitle(`${itemFile[arg[1]].name ? itemFile[arg[1]].name : arg[1]}`)
			.setDescription(`*${itemFile[arg[1]].desc}*`)
		message.channel.send({content: `${arg[1]} is ready to go!`, embeds: [DiscordEmbed]});
    }

    if (command === 'getitem') {
        const arg = message.content.slice(prefix.length).trim().split(/ +/);
        var itemPath = dataPath+'/items.json'
        var itemRead = fs.readFileSync(itemPath);
        var itemFile = JSON.parse(itemRead);

        if (itemFile[arg[1]]) {
            const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#4b02c9')
				.setTitle(`${itemFile[arg[1]].name ? itemFile[arg[1]].name : arg[1]}`)
				.setDescription(`*${itemFile[arg[1]].desc}*`)
            message.channel.send({embeds: [DiscordEmbed]});
        } else {
            message.channel.send(`${arg[1]} is an invalid item!`);
        }
    }
	
    if (command === 'listitems') {
        var itemPath = dataPath+'/items.json'
        var itemRead = fs.readFileSync(itemPath);
        var itemFile = JSON.parse(itemRead);

		var itemArray = []
        const arg = message.content.slice(prefix.length).trim().split(/ +/);
        if (!arg[1] || arg[1] === ' ' || arg[1] === 'null') {
			for (const i in itemFile)
				itemArray.push(itemFile[i]);

			sendItemArray(message.channel, itemArray);
        } else {
			for (const i in itemFile) {
				if (itemFile[i].name && itemFile[i].name.includes(arg[1]))
					itemArray.push(itemFile[i]);
			}
			
			if (itemArray.length <= 0)
				return message.channel.send("No found items.")

			sendItemArray(message.channel, itemArray);
		}
	}

	if (command === 'fullheal') {
		if (!utilityFuncs.RPGBotAdmin(message.author.id)) {
			message.channel.send("You have insufficient permissions to do this.")
			return false
		}

		if (utilityFuncs.isBanned(message.author.id, message.guild.id) && !utilityFuncs.RPGBotAdmin(message.author.id)) {
			message.channel.send("I've been told you were banned from using the RPG sections of the bot, sorry!")
			return false
		}

        const arg = message.content.slice(prefix.length).trim().split(/ +/);
		
		var charPath = dataPath+'/characters.json'
		var charRead = fs.readFileSync(charPath);
		var charFile = JSON.parse(charRead);
		
        for (const i in charFile) {
			charFile[i].hp = charFile[i].maxhp
			charFile[i].mp = charFile[i].maxmp
		}
		
		fs.writeFileSync(charPath, JSON.stringify(charFile, null, '    '));
		message.react('👍')
	}
	
	if (command === 'orderskills') {
		if (!utilityFuncs.RPGBotAdmin(message.author.id)) {
			message.channel.send("You have insufficient permissions to do this.")
			return false
		}
		
		utilityFuncs.orderSkills();
		message.react('👍');
	}

    if (command === 'registerchar') {
		if (utilityFuncs.isBanned(message.author.id, message.guild.id) && !utilityFuncs.RPGBotAdmin(message.author.id)) {
			message.channel.send("I've been told you were banned from using the RPG sections of the bot, sorry!")
			return false
		}

        const arg = message.content.slice(prefix.length).trim().split(/ +/);
        if (arg[1] == null) {
            const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
				.setTitle(`${prefix}registerchar`)
				.setDescription("(Args <Name> <Base HP> <Base MP> <Strength> <Magic> <Perception> <Endurance> <Charisma> <Inteligence> <Agility> <Luck>)\nCreates a character to be used in battle.\nFor balancing purposes, Base HP should be 50 or below, Base MP should be 35 or below, and all other stats should be 10 or below.\nHP+MP should be less than 65, and the sum of all other stats should be below 45.\n\nOh right! I should explain what each stat does, huh.")
                .addFields(
                    { name: 'Strength', value: "Affects the power of physical attacks.", inline: true },
                    { name: 'Magic', value: "Affects the power of Magical, Special, Ranged or Non-Contact moves.", inline: true },
                    { name: 'Perception', value: "Affects the chance of a move landing.", inline: true },
                    { name: 'Endurance', value: "Lowers the power of an attack that targets you.", inline: true },
                    { name: 'Charisma', value: "Raises the chances of inflicting a mental status ailment.", inline: true },
                    { name: 'Inteligence', value: "More MP & Lower XP for each level up", inline: true },
                    { name: 'Agility', value: "Raises the chance of you dodging an attack that targets you.", inline: true },
                    { name: 'Luck', value: "Raises the chance of landing a critical hit, as well as the chance of inflicting a physical status ailment.", inline: true },
                )
                .setFooter('rpg!registerchar');
            message.channel.send({embeds: [DiscordEmbed]})
            return false
        }
	
        if (message.content.includes("@everyone") || message.content.includes("@here") || message.mentions.users.first()) {
            message.channel.send(`You're really mean, you know that?`);
            return false
        }

        if (!utilityFuncs.RPGBotAdmin(message.author.id)) {
            if (readChar(arg[1]) && message.author.id != readChar(arg[1]).owner)
                return message.channel.send("This character exists already. You have insufficient permissions to overwrite it.");
        }

		// Balance Checks
		if (parseInt(arg[2]) > 50)
			return message.channel.send('This is too much base HP.');
		else if (parseInt(arg[3]) > 50)
			return message.channel.send('This is too much base MP.');
		else if ((parseInt(arg[2]) + parseInt(arg[3])) > 65)
			return message.channel.send('Base HP + Base MP should be below 65. ' + (parseInt(arg[2]) + parseInt(arg[3])) + ' is not below 65.')
		else {
			var BST = 0;
			for (i = 4; i <= 11; i++) {
				if (parseInt(arg[i]) > 10) {
					message.channel.send('One of your 8 stats are over 10.')
					return false
				} else {
					BST += parseInt(arg[i])
				}
			}

			if (BST > 45)
				return message.channel.send(`<:warning:878094052208296007>${BST}BST is more than 45. Use 45BST and below.`);
			else if (BST < 23)
				message.channel.send(`<:warning:878094052208296007>You're asking for pain. (${BST} BST)`);
			else if (BST < 40)
				message.channel.send(`<:warning:878094052208296007>Your Base Stat Total is below 40! (${BST})\nYou may be underpowered!`)
		}

        charFuncs.writeChar(message.author, arg[1], parseInt(arg[2]), parseInt(arg[3]), parseInt(arg[4]), parseInt(arg[5]), parseInt(arg[6]), parseInt(arg[7]), parseInt(arg[8]), parseInt(arg[9]), parseInt(arg[10]), parseInt(arg[11]))
        if (readChar(arg[1])) {
            const charName = arg[1]
            const charDefs = readChar(charName)
            const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#f2c055')
				.setTitle(`${charName}'s Stats:`)
                .setDescription(`${charDefs.hp}/${charDefs.maxhp}HP\n${charDefs.mp}/${charDefs.maxmp}MP\n\n${charDefs.atk}ATK\n${charDefs.mag}MAG\n${charDefs.prc}PRC\n${charDefs.end}END\n${charDefs.chr}CHR\n${charDefs.int}INT\n${charDefs.agl}AGL\n${charDefs.luk}LUK`)
            message.channel.send({content: `👍 ${charName} has been registered!`, embeds: [DiscordEmbed]});
        } else {
            message.channel.send(`${arg[1]} isn't a valid character.`);
            return
        }
    }
	
	if (command === 'updatechars') {
		if (utilityFuncs.isBanned(message.author.id, message.guild.id) && !utilityFuncs.RPGBotAdmin(message.author.id)) {
			message.channel.send("I've been told you were banned from using the RPG sections of the bot, sorry!")
			return false
		}
		
		message.channel.send("This will take a while, so be patient! I will react with 👍 once I'm done.")

		setTimeout(function() {
			var charPath = dataPath+'/characters.json'
			var charRead = fs.readFileSync(charPath);
			var charFile = JSON.parse(charRead);
			
			for (const i in charFile) {
				// Stat Updates
				var newCharDefs = utilityFuncs.cloneObj(charFile[i])

				newCharDefs.level = 1
				newCharDefs.xp = 0
				newCharDefs.maxxp = 100

				newCharDefs.hp = newCharDefs.basehp
				newCharDefs.mp = newCharDefs.basemp
				newCharDefs.maxhp = newCharDefs.basehp
				newCharDefs.maxmp = newCharDefs.basemp

				newCharDefs.atk = newCharDefs.baseatk
				newCharDefs.mag = newCharDefs.basemag
				newCharDefs.prc = newCharDefs.baseprc
				newCharDefs.end = newCharDefs.baseend
				newCharDefs.chr = newCharDefs.basechr
				newCharDefs.int = newCharDefs.baseint
				newCharDefs.agl = newCharDefs.baseagl
				newCharDefs.luk = newCharDefs.baseluk

				for (k = 1; k < charFile[i].level; k++) {
					charFuncs.lvlUp(newCharDefs)
					newCharDefs.xp = 0
				}

				newCharDefs.xp = charFile[i].xp
				charFile[i] = utilityFuncs.cloneObj(newCharDefs)
				
				// Trust
				if (!charFile[i].trust)
					charFile[i].trust = {};
				
				// Bio
				if (!charFile[i].bio) {
					charFile[i].bio = {
						species: "",
						age: "",
						info: "",
						
						height: "",
						weight: "",
						
						backstory: "",
						likes: "",
						dislikes: "",
						fears: "",
						
						voice: "",
						theme: ""
					}
				}
				
				var bioDef = [
					'species',
					'age',
					'info',
					'backstory',
					'height',
					'weight',
					'likes',
					'dislikes',
					'fears',
					'voice',
					'theme'
				]
				
				for (const val in bioDef) {
					if (!charFile[i].bio[bioDef[val]]) {
						charFile[i].bio[bioDef[val]] = ""
					}
				}
			}
			
			fs.writeFileSync(charPath, JSON.stringify(charFile, null, '    '));
			message.react('👍')
		}, 1000)
	}

    if (command === 'settransformation' || command === 'transformation') {
		if (utilityFuncs.isBanned(message.author.id, message.guild.id) && !utilityFuncs.RPGBotAdmin(message.author.id)) {
			message.channel.send("I've been told you were banned from using the RPG sections of the bot, sorry!")
			return false
		}

        const arg = message.content.slice(prefix.length).trim().split(/ +/);
        if (arg[1] == null) {
            const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
				.setTitle(`${prefix}${command}`)
				.setDescription(`(Args <Character Name> <Transformaton Name> <Requirement> <Automatic?> <HP Buff> <Strength Buff> <Magic Buff> <Perception Buff> <Endurance Buff> <Charisma Buff> <Inteligence Buff> <Agility Buff> <Luck Buff>)\nAllows the specified character to transform mid-battle! Usually, there's a requirement for the transformation.\n\nOh right! I should explain what each new stat does, huh. Essentially, it's the same as a character, except... less BST. There are multible requirement IDs, including but not limited to:\n"allydown"\n"onlystanding"\n"belowhalfhp"\n"outofmp"\n"leaderdown"\n"trusteddown"`)
                .setFooter(`${prefix}${command}`);
            message.channel.send({embeds: [DiscordEmbed]})
            return false
        }
	
        if (message.content.includes("@everyone") || message.content.includes("@here") || message.mentions.users.first()) {
            message.channel.send(`You're really mean, you know that?`);
            return false
        }
		
		// Balance Checks
		if (parseInt(arg[5]) > 20) {
			message.channel.send('This is too much of a HP buff. Try below 20.')
			return false
		} else {
			var BST = 0;
			for (i = 6; i <= 12; i++)
				BST += parseInt(arg[i]);
			if (BST > 15)
				return message.channel.send(`<:warning:878094052208296007>${BST} is more than 15. 15 is the Maximum for Transformations.`);
		}
		
		var charPath = dataPath+'/characters.json'
		var charRead = fs.readFileSync(charPath);
		var charFile = JSON.parse(charRead);
		
		if (!charFile[arg[1]])
			return message.channel.send(`${arg[1]} is an invalid character.`);
		
		var charDefs = charFile[arg[1]]

		var reqTable = ['allydown', 'onlystanding', 'belowhalfhp', 'outofmp', 'leaderdown', 'trusteddown']

		if (!arg[3])
			return message.channel.send('Please specify a requirement value (See with no arguments)')
		
		if (arg[3].toLowerCase()) {
			var validArg;
			var argument = arg[3].toLowerCase()
		
			for (const i in reqTable) {
				if (reqTable[i] && argument == reqTable[i].toLowerCase()) {
					validArg = true;
					break
				}
			}
			
			if (!validArg)
				return message.channel.send('Please specify a valid requirement value (See with no arguments)');
		}
		
		var auto = false;
		if (!arg[4])
			return message.channel.send('Please specify an automatic value (true or false)');
		
		if (arg[4].toLowerCase() == 'true' || arg[4].toLowerCase() == 'yes')
			auto = true;

		/*
		var name = message.content.slice(prefix.length).trim().split('"');
		if (!name[1])
			return message.channel.send('Please surround the transformation name in Quotation Marks ("")');
		*/

        charFuncs.makeTransformation(charDefs, arg[2], arg[3].toLowerCase(), auto, parseInt(arg[5]), parseInt(arg[6]), parseInt(arg[7]), parseInt(arg[8]), parseInt(arg[9]), parseInt(arg[10]), parseInt(arg[11]), parseInt(arg[12]), parseInt(arg[13]))
        fs.writeFileSync(charPath, JSON.stringify(charFile, null, '    '));

		if (charDefs.transformations[arg[2]]) {
			var transDefs = charDefs.transformations[arg[2]]

            const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#f2c055')
				.setTitle(`${charDefs.name}'s ${transDefs.name} Transformation's Stats:`)
                .setDescription(`${transDefs.hp}HP++\n\n${transDefs.atk}ATK++\n${transDefs.mag}MAG++\n${transDefs.prc}PRC++\n${transDefs.end}END++\n${transDefs.chr}CHR++\n${transDefs.int}INT++\n${transDefs.agl}AGL++\n${transDefs.luk}LUK++`)
            message.channel.send({content: `👍 ${charDefs.name}'s ${transDefs.name} transformation has been registered!`, embeds: [DiscordEmbed]});
        } else {
            message.channel.send(`${arg[1]} isn't a valid character.`);
            return
        }
    }

    if (command === 'setaffinity') {
		if (utilityFuncs.isBanned(message.author.id, message.guild.id) && !utilityFuncs.RPGBotAdmin(message.author.id)) {
			message.channel.send("I've been told you were banned from using the RPG sections of the bot, sorry!")
			return false
		}

        const arg = message.content.slice(prefix.length).trim().split(/ +/);

        if (readChar(arg[1])) {
            if (!utilityFuncs.RPGBotAdmin(message.author.id)) {
                const charDefs = readChar(arg[1])
                if (message.author.id != charDefs.owner) {
                    message.channel.send("You can't edit someone else's character!");
                    return false
                }
            }
			
			if (!utilityFuncs.validType(arg[2].toLowerCase()))
				return message.channel.send(`${arg[2].toLowerCase()} isn't a valid type.`);

			if (!arg[3])
				return message.channel.send('Specify the affinity.\nTry one of the following:```diff\n- Weak\n- Resist\n- Block\n- Repel\n- Drain\n- None```');

            if (arg[3].toLowerCase() == "normal" || arg[3].toLowerCase() == "weak" || arg[3].toLowerCase() == "resist" || arg[3].toLowerCase() == "block" || arg[3].toLowerCase() == "repel" || arg[3].toLowerCase() == "drain") {
                writeAffinity(arg[1], arg[2].toLowerCase(), arg[3].toLowerCase())
                message.channel.send(`👍 ${arg[1]}'s affinity towards ${arg[2]} is now ${arg[3]}`);
            } else {
                message.channel.send("This isn't a valid affinity! Try:`'weak' 'resist' 'block' 'repel' 'drain'")
            }
        } else {
            message.channel.send(`${arg[1]} isn't a valid character.`);
        }
    }

    if (command === 'changestats') {
		if (utilityFuncs.isBanned(message.author.id, message.guild.id) && !utilityFuncs.RPGBotAdmin(message.author.id)) {
			message.channel.send("I've been told you were banned from using the RPG sections of the bot, sorry!")
			return false
		}

        const arg = message.content.slice(prefix.length).trim().split(/ +/);
        if (arg[1] == null) {
            const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
				.setTitle(`${prefix}changestats`)
				.setDescription("(Args <Name> <Base HP> <Base MP> <Strength> <Magic> <Perception> <Endurance> <Charisma> <Inteligence> <Agility> <Luck>)\nChanges the stats of an existing character.\nFor balancing purposes, Base HP should be 50 or below, Base MP should be 35 or below, and all other stats should be 10 or below.\nI'm not going to stop you if you want to mess around with me however, just don't make it unfair for others.\n\nOh right! I should explain what each stat does, huh.")
                .addFields(
                    { name: 'Strength', value: "Affects the power of physical attacks.", inline: true },
                    { name: 'Magic', value: "Affects the power of Magical, Special, Ranged or Non-Contact moves.", inline: true },
                    { name: 'Perception', value: "Affects the chance of a move landing.", inline: true },
                    { name: 'Endurance', value: "Lowers the power of an attack that targets you.", inline: true },
                    { name: 'Charisma', value: "Raises the chances of inflicting a mental status ailment.", inline: true },
                    { name: 'Inteligence', value: "More MP & Lower XP for each level up", inline: true },
                    { name: 'Agility', value: "Raises the chance of you dodging an attack that targets you.", inline: true },
                    { name: 'Luck', value: "Raises the chance of landing a critical hit, as well as the chance of inflicting a physical status ailment.", inline: true },
                )
            message.channel.send({embeds: [DiscordEmbed]})
            return false
        }
		
		var charPath = dataPath+'/characters.json'
		var charRead = fs.readFileSync(charPath);
		var charFile = JSON.parse(charRead);
		
		if (!charFile[arg[1]]) {
			message.channel.send("This is a nonexistant character.")
			return false
		}
		
		// Balance Checks
		if (parseInt(arg[2]) > 50) {
			message.channel.send('This is too much base HP.')
			return false
		} else if (parseInt(arg[3]) > 50) {
			message.channel.send('This is too much base MP.')
			return false
		} else if ((parseInt(arg[2]) + parseInt(arg[3])) > 65) {
			message.channel.send('Base HP + Base MP should be below 65.')
			return false
		} else {
			var BST = 0;
			for (i = 4; i <= 11; i++) {
				if (parseInt(arg[i]) > 10) {
					message.channel.send('One of your 8 stats are over 10.')
					return false
				} else {
					BST += parseInt(arg[i])
				}
			}
			
			if (BST > 45) {
				message.channel.send('Your Base Stat Total should be 45 or under.')
				return false
			} else if (BST < 25) {
				message.channel.send(`<:warning:878094052208296007>You're asking for pain. (${BST} BST)`)
			} else if (BST < 40) {
				message.channel.send(`<:warning:878094052208296007>Your Base Stat Total is below 40! (${BST})\nYou may be underpowered!`)
			}
		}
		
		var oldLvl = charFile[arg[1]].level
		var oldXP = charFile[arg[1]].xp

		charFile[arg[1]].level = 1
		charFile[arg[1]].basehp = parseInt(arg[2])
		charFile[arg[1]].basemp = parseInt(arg[3])
		charFile[arg[1]].baseatk = parseInt(arg[4])
		charFile[arg[1]].basemag = parseInt(arg[5])
		charFile[arg[1]].baseprc = parseInt(arg[6])
		charFile[arg[1]].baseend = parseInt(arg[7])
		charFile[arg[1]].basechr = parseInt(arg[8])
		charFile[arg[1]].baseint = parseInt(arg[9])
		charFile[arg[1]].baseagl = parseInt(arg[10])
		charFile[arg[1]].baseluk = parseInt(arg[11])

		charFile[arg[1]].maxhp = parseInt(arg[2])
		charFile[arg[1]].maxmp = parseInt(arg[3])
		charFile[arg[1]].atk = parseInt(arg[4])
		charFile[arg[1]].mag = parseInt(arg[5])
		charFile[arg[1]].prc = parseInt(arg[6])
		charFile[arg[1]].end = parseInt(arg[7])
		charFile[arg[1]].chr = parseInt(arg[8])
		charFile[arg[1]].int = parseInt(arg[9])
		charFile[arg[1]].agl = parseInt(arg[10])
		charFile[arg[1]].luk = parseInt(arg[11])
		
		charFile[arg[1]].maxxp = 100
		
		for (let i = 1; i < oldLvl; i++) {
			charFuncs.lvlUp(charFile[arg[1]])
			charFile[arg[1]].xp = 0
		}
		
		charFile[arg[1]].level = oldLvl
		charFile[arg[1]].xp = oldXP
		
		charFile[arg[1]].hp = Math.min(charFile[arg[1]].maxhp, charFile[arg[1]].hp)
		charFile[arg[1]].mp = Math.min(charFile[arg[1]].maxmp, charFile[arg[1]].mp)

		const charName = arg[1]
		const charDefs = charFile[arg[1]]
		const DiscordEmbed = new Discord.MessageEmbed()
			.setColor('#f2c055')
			.setTitle(`${charName}'s Stats:`)
			.setDescription(`Level ${charDefs.level}\n${charDefs.hp}/${charDefs.maxhp}HP\n${charDefs.mp}/${charDefs.maxmp}MP\n\n${charDefs.atk}ATK\n${charDefs.mag}MAG\n${charDefs.prc}PRC\n${charDefs.end}END\n${charDefs.chr}CHR\n${charDefs.int}INT\n${charDefs.agl}AGL\n${charDefs.luk}LUK`)
		message.channel.send({content: `👍 ${charName}'s stats were changed.`, embeds: [DiscordEmbed]});
		
		fs.writeFileSync(charPath, JSON.stringify(charFile, null, '    '));
    }

    if (command === 'trustxp') {
		if (utilityFuncs.isBanned(message.author.id, message.guild.id) && !utilityFuncs.RPGBotAdmin(message.author.id)) {
			message.channel.send("I've been told you were banned from using the RPG sections of the bot, sorry!")
			return false
		}

        const arg = message.content.slice(prefix.length).trim().split(/ +/);
		
		var charPath = dataPath+'/characters.json'
		var charRead = fs.readFileSync(charPath);
		var charFile = JSON.parse(charRead);
		if (charFile[arg[1]] && charFile[arg[2]]) {
			charFuncs.trustUp(charFile[arg[1]], charFile[arg[2]], parseInt(arg[3]), message.guild.id)
			fs.writeFileSync(charPath, JSON.stringify(charFile, null, '    '));
			message.react('👍')

			setTimeout(function() {
				message.delete()
			}, 2000)
		} else {
			message.channel.send("One of two characters are nonexistant.")
			message.delete()
		}
	}

    if (command === 'givexp') {
		if (utilityFuncs.isBanned(message.author.id, message.guild.id) && !utilityFuncs.RPGBotAdmin(message.author.id)) {
			message.channel.send("I've been told you were banned from using the RPG sections of the bot, sorry!")
			return false
		}

        const arg = message.content.slice(prefix.length).trim().split(/ +/);
        if (readChar(arg[1])) {
            const charName = arg[1]
            const charDefs = readChar(charName)
            if (!utilityFuncs.RPGBotAdmin(message.author.id)) {
                if (message.author.id != charDefs.owner) {
                    message.channel.send("You can't edit someone else's character!")
                    return false
                }
            }

            if (arg[2]) {
                giveXP(charName, parseInt(arg[2]), message)
            } else {
                message.channel.send(`XP not defined.`);
                return false
            }
        } else {
            message.channel.send(`${arg[1]} isn't a valid character.`);
            return
        }
    }

    if (command === 'levelup') {
		if (utilityFuncs.isBanned(message.author.id, message.guild.id) && !utilityFuncs.RPGBotAdmin(message.author.id)) {
			message.channel.send("I've been told you were banned from using the RPG sections of the bot, sorry!")
			return false
		}

        const arg = message.content.slice(prefix.length).trim().split(/ +/);
		var charPath = dataPath+'/characters.json'
		var charRead = fs.readFileSync(charPath);
		var charFile = JSON.parse(charRead);

        if (charFile[arg[1]]) {
			var charDefs = charFile[arg[1]];
            if (!utilityFuncs.RPGBotAdmin(message.author.id)) {
                if (message.author.id != charDefs.owner) {
                    message.channel.send("You can't edit someone else's character!")
                    return false
                }
            }

			var lvlQuote = ""
			if (charDefs.lvlquote && charDefs.lvlquote.length > 0) {
				var possibleQuote = Math.round(Math.random() * (charDefs.lvlquote.length-1))
				lvlQuote = `*${arg[1]}: "${charDefs.lvlquote[possibleQuote]}"*\n\n`
			}

            if (arg[2] && parseInt(arg[2]) > 1) {
				for (i = 1; i <= parseInt(arg[2]); i++) {
					charDefs.xp = charDefs.maxxp
					charFuncs.lvlUp(charDefs);
				}
				
				const DiscordEmbed = new Discord.MessageEmbed()
					.setColor('#b4eb34')
					.setTitle(`👍 ${arg[1]} levelled up ${parseInt(arg[2])} times!`)
					.setDescription(`${lvlQuote}Level ${charDefs.level}\n${charDefs.maxhp}HP\n${charDefs.maxmp}MP\n\n${charDefs.atk}ATK\n${charDefs.mag}MAG\n${charDefs.prc}PRC\n${charDefs.end}END\n${charDefs.chr}CHR\n${charDefs.int}INT\n${charDefs.agl}AGL\n${charDefs.luk}LUK`)
				message.channel.send({embeds: [DiscordEmbed]})
            } else {
				charDefs.xp = charDefs.maxxp
                charFuncs.lvlUp(charDefs);
				
				const DiscordEmbed = new Discord.MessageEmbed()
					.setColor('#b4eb34')
					.setTitle(`👍 ${arg[1]} levelled up!`)
					.setDescription(`${lvlQuote}Level ${charDefs.level}\n${charDefs.maxhp}HP\n${charDefs.maxmp}MP\n\n${charDefs.atk}ATK\n${charDefs.mag}MAG\n${charDefs.prc}PRC\n${charDefs.end}END\n${charDefs.chr}CHR\n${charDefs.int}INT\n${charDefs.agl}AGL\n${charDefs.luk}LUK`)
				message.channel.send({embeds: [DiscordEmbed]})
            }

			fs.writeFileSync(charPath, JSON.stringify(charFile, null, '    '));
        } else {
            message.channel.send(`${arg[1]} isn't a valid character.`);
            return
        }
    }

    if (command === 'setmelee') {
		if (utilityFuncs.isBanned(message.author.id, message.guild.id) && !utilityFuncs.RPGBotAdmin(message.author.id)) {
			message.channel.send("I've been told you were banned from using the RPG sections of the bot, sorry!")
			return false
		}

        const arg = message.content.slice(prefix.length).trim().split(/ +/);
		var charPath = dataPath+'/characters.json'
		var charRead = fs.readFileSync(charPath);
		var charFile = JSON.parse(charRead);

        if (readChar(arg[1])) {
            if (!utilityFuncs.RPGBotAdmin(message.author.id)) {
                const charDefs = readChar(arg[1])
                if (message.author.id != charDefs.owner)
                    return message.channel.send("You can't edit someone else's character!");
            }

            if (arg[2] && arg[3] && utilityFuncs.validType(arg[3].toLowerCase())) {
				var type = arg[3].toLowerCase()
				if (type != 'strike' && type != 'slash' && type != 'pierce')
					return message.channel.send('You can only have "Strike", "Slash" or "Pierce" type melee skills.');
	
                writeMelee(arg[1], arg[2], arg[3].toLowerCase())
                message.channel.send(`👍 ${arg[1]}'s Melee Skill was changed to ${arg[2]} with the type of ${arg[3]}.`);
            } else {
                message.channel.send(`You need to define a Melee Skill and it's type!`);
            }
        } else
            return message.channel.send(`${arg[1]} isn't a valid character.`);
    }

    if (command === 'learnskill') {
		if (utilityFuncs.isBanned(message.author.id, message.guild.id) && !utilityFuncs.RPGBotAdmin(message.author.id)) {
			message.channel.send("I've been told you were banned from using the RPG sections of the bot, sorry!")
			return false
		}

        const arg = message.content.slice(prefix.length).trim().split(/ +/);
        if (arg[1] == null) {
            const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#4b02c9')
				.setTitle(`${prefix}learnskill`)
				.setDescription('(Args <Name> <Skill> <Skill 2> <...>)\nAllow characters to learn new skills.')
            return message.channel.send({embeds: [DiscordEmbed]})
        }

		var charPath = dataPath+'/characters.json'
		var charRead = fs.readFileSync(charPath);
		var charFile = JSON.parse(charRead);
        if (charFile[arg[1]]) {
			const charDefs = charFile[arg[1]]
            if (!utilityFuncs.RPGBotAdmin(message.author.id)) {
                if (message.author.id != charDefs.owner) {
                    message.channel.send("You can't edit someone else's character!")
                    return false
                }
            }

			var skillPath = dataPath+'/skills.json'
			var skillRead = fs.readFileSync(skillPath);
			var skillFile = JSON.parse(skillRead);
			var learnString = `👍 ${arg[1]} learned `
			for (let i = 2; i < arg.length; i++) {
				if (i > 1) {
					if (charFuncs.knowsSkill(charDefs, arg[i]))
						return message.channel.send(`${arg[1]} already knows ${arg[i]}!`);

					if (skillFile[arg[i]]) {
						learnString += (skillFile[arg[i]].name ? skillFile[arg[i]].name : arg[i])
						charDefs.skills.push(arg[i])

						if (i == arg.length-2)
							learnString += ' and '
						else if (i >= arg.length-1)
							learnString += '!'
						else
							learnString += ', '
					} else
						return message.channel.send(`${arg[i]} isn't a valid skill.`);
				}
            }

			if (charDefs.skills.length > 8)
				return message.channel.send("You cannot have more than 8 skills!");

			message.channel.send(learnString);
			fs.writeFileSync(charPath, JSON.stringify(charFile, null, '    '));
        } else
            return message.channel.send(`${arg[1]} isn't a valid character.`);
    }
	
    if (command === 'replaceskill') {
		if (utilityFuncs.isBanned(message.author.id, message.guild.id) && !utilityFuncs.RPGBotAdmin(message.author.id)) {
			message.channel.send("I've been told you were banned from using the RPG sections of the bot, sorry!")
			return false
		}

        var arg = message.content.slice(prefix.length).trim().split(/ +/);
        var charPath = dataPath+'/characters.json'
        var charRead = fs.readFileSync(charPath);
        var charFile = JSON.parse(charRead);
		
		if (!charFile[arg[1]])
			return message.channel.send(`${arg[1]} is an invalid character.`)
		
		if (!charFuncs.knowsSkill(charFile[arg[1]], arg[2]))
			return message.channel.send(`${arg[1]} doesn't know this skill!`);
		
		if (!readSkill(arg[3]))
			return message.channel.send(`${arg[3]} is an invalid skill.`);
		
		// Now replace the skill.
		for (const i in charFile[arg[1]].skills) {
			if (charFile[arg[1]].skills[i] === arg[2]) {
				charFile[arg[1]].skills[i] = arg[3];
				break
			}
		}
		
		message.react('👍')
		fs.writeFileSync(charPath, JSON.stringify(charFile, null, '    '));
	}
	
	// Leader Passive
    if (command === 'setleaderskill') {
		if (utilityFuncs.isBanned(message.author.id, message.guild.id) && !utilityFuncs.RPGBotAdmin(message.author.id)) {
			message.channel.send("I've been told you were banned from using the RPG sections of the bot, sorry!")
			return false
		}

        var arg = message.content.slice(prefix.length).trim().split(/ +/);
        var charPath = dataPath+'/characters.json'
        var charRead = fs.readFileSync(charPath);
        var charFile = JSON.parse(charRead);

        if (arg[1] == null) {
            const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
				.setTitle(`${prefix}setleaderskill`)
				.setDescription("(Args <CharName> <Name> <Type> <Element/Action> <Percent>) A buff for the party that activates only when this character is the ''leader'' (first in the party)")
                .setFooter(`${prefix}setleaderskill`);
            
			return message.channel.send({embeds: [DiscordEmbed]});
        }
		
		if (charFile[arg[1]]) {
			const charDefs = charFile[arg[1]];

            if (!message.member.permissions.serialize().ADMINISTRATOR) {
                if (message.author.id != charDefs.owner)
                    return message.channel.send("You can't edit someone else's character!");
            }
		
			if (!arg[2] || !arg[3] || !arg[4] || !arg[5])
				return message.channel.send("You're missing the required arguments.");
			
			switch(arg[3].toLowerCase()) {
				case "boost":
				case "discount":
					if (!utilityFuncs.validType(arg[4].toLowerCase()) && arg[4].toLowerCase() != "heal" && arg[4].toLowerCase() != "magic" && arg[4].toLowerCase() != "physical")
						return message.channel.send('Invalid element.');

					if (parseInt(arg[5]) >= 100 || parseInt(arg[5]) <= 0)
						return message.channel.send(`${arg[5]} is an invalid % to ${arg[3].toLowerCase}!`)

					charDefs.leaderSkill = {
						name: arg[2],
						type: arg[3].toLowerCase(),
						target: arg[4].toLowerCase(),
						percent: parseFloat(arg[5])
					}

					break
					
				case "buff":
					var input = arg[4].toLowerCase()
					if (input != 'atk' && input != 'end' && input != 'mag' && input != 'prc' && input != 'agl' && input != 'all')
						return message.channel.send('Invalid stat.');

					if (parseInt(arg[5]) > 3 || parseInt(arg[5]) <= 0)
						return message.channel.send(`${arg[5]} is an invalid amount to buff!`)

					charDefs.leaderSkill = {
						name: arg[2],
						type: arg[3].toLowerCase(),
						target: arg[4].toLowerCase(),
						percent: parseFloat(arg[5])
					}

					break
					
				default:
					return message.channel.send('Invalid Leader Skill Type.')
			}
			
			message.react('👍');
			fs.writeFileSync(charPath, JSON.stringify(charFile, null, '    '));
		} else
			return message.channel.send('Invalid character.');
	}

    // Set LB
    // (CharName, LBName, Power, LB% Required, Status Effect, Status Effect Chance, Limit Break Level)
    if (command === 'setlb') {
		if (utilityFuncs.isBanned(message.author.id, message.guild.id) && !utilityFuncs.RPGBotAdmin(message.author.id)) {
			message.channel.send("I've been told you were banned from using the RPG sections of the bot, sorry!")
			return false
		}

        var arg = message.content.slice(prefix.length).trim().split(/ +/);
        var charPath = dataPath+'/characters.json'
        var charRead = fs.readFileSync(charPath);
        var charFile = JSON.parse(charRead);

        if (arg[1] == null) {
            const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
				.setTitle(`${prefix}setlb`)
				.setDescription("(Args <CharName> <Limit Break Name> <Power> <Percentage of LB meter> <Status Effect?> <Status Effect Chance?> <Limit Break Level> <Class>)\nSets a Limit Break Skill to be used when the Limit Break Meter is filled enough.")
                .addFields(
                    { name: 'Power', value: "Same as regular skills.\nHere, the strongest attacking stat determines whether it's Physical or Magical.", inline: true },
                    { name: 'LB%', value: "All non-melee attacks build up your Limit Break Meter. This meter is required for this attack.", inline: true },
                    { name: 'Status Effect', value: `Can be set to "none" if you don't want a status effect.`, inline: true },
                    { name: 'Status Effect Chance', value: "Can be set to 0 if you don't want a status effect.", inline: true },
                    { name: 'Limit Break Level', value: "1-4, idealy should progressively get stronger. LB% MUST be higher than the last level.", inline: true },
                    { name: 'Limit Break Class', value: "The class of Limit Break Skill. Right now, there's 'atk' & 'heal'. Stick to one class.", inline: true },
                )
                .setFooter(`${prefix}setlb`);
            message.channel.send({embeds: [DiscordEmbed]})
            return false
        }
		
		if (!arg[8]) {
            message.channel.send("Missing LB Skill Class")
            return
		}

		if (charFile[arg[1]]) {
			for (let i = 1; i <= 5; i++) {
				if (charFile[arg[1]][`lb${i}`] && !charFile[arg[1]][`lb${i}`].class) {
					charFile[arg[1]][`lb${i}`].class = "atk"
				}
			}
		}

        if (charFile[arg[1]]) {
            var charDefs = charFile[arg[1]]

            if (parseInt(arg[7]) == 1) {
                if (parseInt(arg[4]) < 100) {
                    message.channel.send('Limit Meter Requirement Must Be over 100%!')
                    return
                }

				if (parseInt(arg[3]) > 550) {
                    message.channel.send('Limit Break power should be less than 550 for level 1.')
                    return
                }

				charDefs.lb1 = {
					name: arg[2],
					class: arg[8].toLowerCase(),
					pow: parseInt(arg[3]),
					cost: parseInt(arg[4]),
					status: arg[5].toLowerCase(), 
					statuschance: parseInt(arg[6])
				}

                message.channel.send(`${arg[2]} registered and set as ${arg[1]}'s Limit Break Level ${arg[7]}. ${arg[1]}'s Limit Break Class is ${arg[8]}.`)
            } else if (parseInt(arg[7]) == 2) {
                if (parseInt(arg[4]) < 150) {
                    message.channel.send("Limit Meter Requirement Must Be over 150%!")
                    return
                }

				if (parseInt(arg[3]) > 800) {
                    message.channel.send('Limit Break power should be less than 800 for level 2.')
                    return
                }

                var i;
                for (i = 1; i < 2; i++) {
                    if (!charDefs["lb" + i]) {
						message.channel.send(`Set a Level ${i} before moving onto level 2.`)
						return
					}

                    if (charDefs["lb" + i].class && charDefs["lb" + i].class != arg[8].toLowerCase()) {
						message.channel.send(`Your Limit Break Class is ${charDefs["lb" + i].class}. You cannot change class.`)
						return
					}

                    if (parseInt(arg[4]) < charDefs["lb" + i][2]) {
                        message.channel.send(`Limit Meter Requirement Must Be over the previous ones! (${parseInt(arg[4])}% < ${charDefs["lb" + i]}% for Limit Break Level ${i})`)
                        return
                    }
                }

				charDefs.lb2 = {
					name: arg[2],
					class: arg[8].toLowerCase(),
					pow: parseInt(arg[3]),
					cost: parseInt(arg[4]),
					status: arg[5].toLowerCase(), 
					statuschance: parseInt(arg[6])
				}

                message.channel.send(`${arg[2]} registered and set as ${arg[1]}'s Limit Break Level ${arg[7]}.`)
            } else if (parseInt(arg[7]) == 3) {
                if (parseInt(arg[4]) < 200) {
                    message.channel.send("Limit Meter Requirement Must Be over 200%!")
                    return
                }

				if (parseInt(arg[3]) > 1000) {
                    message.channel.send('Limit Break power should be less than 1000 for level 3.')
                    return
                }

                var i;
                for (i = 1; i < 3; i++) {
                    if (!charDefs["lb" + i]) {
						message.channel.send(`Set a Level ${i} before moving onto level 3.`)
						return
					}

                    if (charDefs["lb" + i].class && charDefs["lb" + i].class != arg[8].toLowerCase()) {
						message.channel.send(`Your Limit Break Class is ${charDefs["lb" + i].class}. You cannot change class.`)
						return
					}

                    if (parseInt(arg[4]) < charDefs["lb" + i][2]) {
                        message.channel.send(`Limit Meter Requirement Must Be over the previous ones! (${parseInt(arg[4])}% < ${charDefs["lb" + i]}% for Limit Break Level ${i})`)
                        return
                    }
                }

				charDefs.lb3 = {
					name: arg[2],
					class: arg[8].toLowerCase(),
					pow: parseInt(arg[3]),
					cost: parseInt(arg[4]),
					status: arg[5].toLowerCase(), 
					statuschance: parseInt(arg[6])
				}

                message.channel.send(`${arg[2]} registered and set as ${arg[1]}'s Limit Break Level ${arg[7]}.`)
            } else if (parseInt(arg[7]) == 4) {
                if (parseInt(arg[4]) < 250) {
                    message.channel.send("Limit Meter Requirement Must Be over 250%!")
                    return
                }

				if (parseInt(arg[3]) > 1250) {
                    message.channel.send('Limit Break power should be less than 1250 for level 4.')
                    return
                }

                var i;
                for (i = 1; i < 4; i++) {
                    if (!charDefs["lb" + i]) {
						message.channel.send(`Set a Level ${i} before moving onto level 4.`)
						return
					}

                    if (charDefs["lb" + i].class && charDefs["lb" + i].class != arg[8].toLowerCase()) {
						message.channel.send(`Your Limit Break Class is ${charDefs["lb" + i].class}. You cannot change class.`)
						return
					}

                    if (parseInt(arg[4]) < charDefs["lb" + i][2]) {
                        message.channel.send(`Limit Meter Requirement Must Be over the previous ones! (${parseInt(arg[4])}% < ${charDefs["lb" + i]}% for Limit Break Level ${i})`)
                        return
                    }
                }

				charDefs.lb4 = {
					name: arg[2],
					class: arg[8].toLowerCase(),
					pow: parseInt(arg[3]),
					cost: parseInt(arg[4]),
					status: arg[5].toLowerCase(),
					statuschance: parseInt(arg[6])
				}

                message.channel.send(`${arg[2]} registered and set as ${arg[1]}'s Limit Break Level ${arg[7]}.`)
            }

            fs.writeFileSync(charPath, JSON.stringify(charFile, null, '    '));
        } else {
            message.channel.send(`${arg[1]} isn't a valid character.`);
            return
        }
    }
	
	if (command === 'setquote') {
		if (utilityFuncs.isBanned(message.author.id, message.guild.id) && !utilityFuncs.RPGBotAdmin(message.author.id)) {
			message.channel.send("I've been told you were banned from using the RPG sections of the bot, sorry!")
			return false
		}

        const arg = message.content.slice(prefix.length).trim().split(/ +/);
        var charPath = dataPath+'/characters.json';
        var charRead = fs.readFileSync(charPath);
        var charFile = JSON.parse(charRead);

        if (charFile[arg[1]]) {
            const charDefs = charFile[arg[1]]
            if (!utilityFuncs.RPGBotAdmin(message.author.id)) {
                if (message.author.id != charDefs.owner) {
                    message.channel.send("You can't edit someone else's character!");
                    return false
                }
            }
			
			if (!charDefs.meleequote) {charDefs.meleequote = []}
			if (!charDefs.physquote) {charDefs.physquote = []}
			if (!charDefs.magquote) {charDefs.magquote = []}
			if (!charDefs.strongquote) {charDefs.strongquote = []}
			if (!charDefs.critquote) {charDefs.critquote = []}
			if (!charDefs.missquote) {charDefs.missquote = []}
			if (!charDefs.dodgequote) {charDefs.dodgequote = []}
			if (!charDefs.weakquote) {charDefs.weakquote = []}
			if (!charDefs.resistquote) {charDefs.resistquote = []}
			if (!charDefs.blockquote) {charDefs.blockquote = []}
			if (!charDefs.repelquote) {charDefs.repelquote = []}
			if (!charDefs.drainquote) {charDefs.drainquote = []}
			if (!charDefs.hurtquote) {charDefs.hurtquote = []}
			if (!charDefs.killquote) {charDefs.killquote = []}
			if (!charDefs.deathquote) {charDefs.deathquote = []}
			if (!charDefs.allydeathquote) {charDefs.allydeathquote = []}
			if (!charDefs.lbquote) {charDefs.lbquote = []}
			if (!charDefs.healquote) {charDefs.healquote = []}
			if (!charDefs.helpedquote) {charDefs.helpedquote = []}
			if (!charDefs.lvlquote) {charDefs.lvlquote = []}

			var quote = message.content.slice(prefix.length).trim().split('"');
			
			if (!quote[1]) {
				quote = message.content.slice(prefix.length).trim().split("'");
				
				if (!quote[1]) {
					message.channel.send(`No quote supplied. Make sure you're using "" or '' instead of “”.`)
					return false
				}
			}

			const quoteType = arg[2].toLowerCase();
			if (quoteType === "melee" || quoteType === "meleeattack") {
				charDefs.meleequote.push(quote[1]);
			} else if (quoteType === "phys" || quoteType === "physical" || quoteType ===  "physattack") {
				charDefs.physquote.push(quote[1]);
			} else if (quoteType === "mag" || quoteType === "magic" || quoteType ===  "magicattack") {
				charDefs.magquote.push(quote[1]);
			} else if (quoteType === "supereffective" || quoteType === "strong" || quoteType === "effective") {
				charDefs.strongquote.push(quote[1]);
			} else if (quoteType === "crit" || quoteType === "critical") {
				charDefs.critquote.push(quote[1]);
			} else if (quoteType === "weak" || quoteType === "weakness") {
				charDefs.weakquote.push(quote[1]);
			} else if (quoteType === "miss" || quoteType === "enemydodge" || quoteType ===  "huh?") {
				charDefs.missquote.push(quote[1]);
			} else if (quoteType === "dodge" || quoteType === "evade") {
				charDefs.dodgequote.push(quote[1]);
			} else if (quoteType === "resist") {
				charDefs.resistquote.push(quote[1]);
			} else if (quoteType === "block") {
				charDefs.blockquote.push(quote[1]);
			} else if (quoteType === "repel") {
				charDefs.repelquote.push(quote[1]);
			} else if (quoteType === "drain") {
				charDefs.drainquote.push(quote[1]);
			} else if (quoteType === "hurt" || quoteType === "damaged" || quoteType === "hit" || quoteType === "punted" || quoteType === "smacked") {
				charDefs.hurtquote.push(quote[1]);
			} else if (quoteType === "kill" || quoteType === "murder" || quoteType ===  "win") {
				charDefs.killquote.push(quote[1]);
			} else if (quoteType === "death" || quoteType === "dead" || quoteType ===  "ded" || quoteType === "defeat") {
				charDefs.deathquote.push(quote[1]);
			} else if (quoteType === "allydeath" || quoteType === "allydead") {
				charDefs.allydeathquote.push(quote[1]);
			} else if (quoteType === "heal" || quoteType === "restore" || quoteType === "help") {
				charDefs.healquote.push(quote[1]);
			} else if (quoteType === "healed" || quoteType === "restored" || quoteType ===  "assisted" || quoteType ===  "helped") {
				charDefs.helpedquote.push(quote[1]);
			} else if (quoteType === "lb" || quoteType === "limitbreak" || quoteType ===  "limit") {
				charDefs.lbquote.push(quote[1]);
			} else if (quoteType === "lvl" || quoteType === "level" || quoteType ===  "lvlup" || quoteType ===  "levelup" || quoteType ===  "maxxp") {
				charDefs.lvlquote.push(quote[1]);
			} else {
				message.channel.send("Invalid quote type! Try the following:```diff\n- Melee\n- Phys\n- Mag\n- SuperEffective\n- Crit\n- Hurt\n- Weakness\n- Resist\n- Block\n- Repel\n- Drain\n- Kill\n- Death\n- Heal\n- Healed\n- Limitbreak\n- Lvlup```Have Fun!")
				return false
			}

            fs.writeFileSync(charPath, JSON.stringify(charFile, null, '    '));
			message.react('👍')
        } else {
            message.channel.send(`${arg[1]} isn't a valid character.`);
        }
    }
	
	if (command === 'clearquotes') {
		if (utilityFuncs.isBanned(message.author.id, message.guild.id) && !utilityFuncs.RPGBotAdmin(message.author.id)) {
			message.channel.send("I've been told you were banned from using the RPG sections of the bot, sorry!")
			return false
		}

        const arg = message.content.slice(prefix.length).trim().split(/ +/);
        var charPath = dataPath+'/characters.json'
        var charRead = fs.readFileSync(charPath);
        var charFile = JSON.parse(charRead);

        if (charFile[arg[1]]) {
            const charDefs = charFile[arg[1]]
            if (!utilityFuncs.RPGBotAdmin(message.author.id)) {
                if (message.author.id != charDefs.owner) {
                    message.channel.send("You can't edit someone else's character!");
                    return false
                }
            }
			
			if (!charDefs.meleequote) {charDefs.meleequote = []}
			if (!charDefs.physquote) {charDefs.physquote = []}
			if (!charDefs.magquote) {charDefs.magquote = []}
			if (!charDefs.strongquote) {charDefs.strongquote = []}
			if (!charDefs.critquote) {charDefs.critquote = []}
			if (!charDefs.missquote) {charDefs.missquote = []}
			if (!charDefs.dodgequote) {charDefs.dodgequote = []}
			if (!charDefs.weakquote) {charDefs.weakquote = []}
			if (!charDefs.blockquote) {charDefs.blockquote = []}
			if (!charDefs.repelquote) {charDefs.repelquote = []}
			if (!charDefs.drainquote) {charDefs.drainquote = []}
			if (!charDefs.hurtquote) {charDefs.hurtquote = []}
			if (!charDefs.killquote) {charDefs.killquote = []}
			if (!charDefs.deathquote) {charDefs.deathquote = []}
			if (!charDefs.allydeathquote) {charDefs.allydeathquote = []}
			if (!charDefs.lbquote) {charDefs.lbquote = []}
			if (!charDefs.healquote) {charDefs.healquote = []}
			if (!charDefs.helpedquote) {charDefs.helpedquote = []}
			if (!charDefs.lvlquote) {charDefs.lvlquote = []}

			const quoteType = arg[2].toLowerCase()
			if (quoteType === "melee" || quoteType === "meleeattack") {
				charDefs.meleequote = [];
			} else if (quoteType === "phys" || quoteType === "physical" || quoteType ===  "physattack") {
				charDefs.physquote = [];
			} else if (quoteType === "mag" || quoteType === "magic" || quoteType ===  "magicattack") {
				charDefs.magquote = [];
			} else if (quoteType === "hitweak" || quoteType === "strong") {
				charDefs.strongquote = [];
			} else if (quoteType === "crit" || quoteType === "critical") {
				charDefs.critquote = [];
			} else if (quoteType === "weak" || quoteType === "weakness") {
				charDefs.weakquote = [];
			} else if (quoteType === "miss" || quoteType === "enemydodge" || quoteType ===  "huh?") {
				charDefs.missquote = [];
			} else if (quoteType === "dodge" || quoteType === "evade") {
				charDefs.dodgequote = [];
			} else if (quoteType === "resist") {
				charDefs.resistquote = [];
			} else if (quoteType === "block") {
				charDefs.blockquote = [];
			} else if (quoteType === "repel") {
				charDefs.repelquote = [];
			} else if (quoteType === "drain") {
				charDefs.drainquote = [];
			} else if (quoteType === "hurt" || quoteType === "damaged" || quoteType === "hit" || quoteType === "punted" || quoteType === "smacked") {
				charDefs.hurtquote = [];
			} else if (quoteType === "kill" || quoteType === "murder" || quoteType ===  "win") {
				charDefs.killquote = [];
			} else if (quoteType === "death" || quoteType === "dead" || quoteType ===  "ded" || quoteType === "defeat") {
				charDefs.deathquote = [];
			} else if (quoteType === "heal" || quoteType === "restore" || quoteType === "help") {
				charDefs.healquote = [];
			} else if (quoteType === "healed" || quoteType === "restored" || quoteType ===  "assisted" || quoteType ===  "helped") {
				charDefs.helpedquote = [];
			} else if (quoteType === "lb" || quoteType === "limitbreak" || quoteType ===  "limit") {
				charDefs.lbquote = [];
			} else if (quoteType === "lvl" || quoteType === "level" || quoteType ===  "lvlup" || quoteType ===  "levelup" || quoteType ===  "maxxp") {
				charDefs.lvlquote = [];
			} else {
				message.channel.send("Invalid quote type! Try the following:```diff\n- Melee\n- Phys\n- Mag\n- SuperEffective\n- Crit\n- Hurt\n- Weakness\n- Resist\n- Block\n- Repel\n- Drain\n- Kill\n- Death\n- Heal\n- Healed\n- Limitbreak\n- Lvlup```Have Fun!")
				return false
			}

            fs.writeFileSync(charPath, JSON.stringify(charFile, null, '    '));
			message.react('👍')
        } else {
            message.channel.send(`${arg[1]} isn't a valid character.`);
        }
    }
	
	if (command === 'showquotes') {
        const arg = message.content.slice(prefix.length).trim().split(/ +/);
        var charPath = dataPath+'/characters.json'
        var charRead = fs.readFileSync(charPath);
        var charFile = JSON.parse(charRead);

        if (charFile[arg[1]]) {
            const charDefs = charFile[arg[1]]
			if (!charDefs.meleequote) {charDefs.meleequote = []}
			if (!charDefs.physquote) {charDefs.physquote = []}
			if (!charDefs.magquote) {charDefs.magquote = []}
			if (!charDefs.missquote) {charDefs.missquote = []}
			if (!charDefs.dodgequote) {charDefs.dodgequote = []}
			if (!charDefs.blockquote) {charDefs.blockquote = []}
			if (!charDefs.repelquote) {charDefs.repelquote = []}
			if (!charDefs.drainquote) {charDefs.drainquote = []}
			if (!charDefs.hurtquote) {charDefs.hurtquote = []}
			if (!charDefs.killquote) {charDefs.killquote = []}
			if (!charDefs.deathquote) {charDefs.deathquote = []}
			if (!charDefs.allydeathquote) {charDefs.allydeathquote = []}
			if (!charDefs.lbquote) {charDefs.lbquote = []}
			if (!charDefs.healquote) {charDefs.healquote = []}
			if (!charDefs.helpedquote) {charDefs.helpedquote = []}
			if (!charDefs.lvlquote) {charDefs.lvlquote = []}
			
			var quoteText = {
				melee: "",
				phys: "",
				mag: "",
				weak: "",
				crit: "",
				weakness: "",
				miss: "",
				dodge: "",
				resist: "",
				block: "",
				repel: "",
				drain: "",
				hurt: "",
				kill: "",
				death: "",
				allydeath: "",
				lb: "",
				heal: "",
				healed: "",
				lvl: ""
			}
			
			for (const i in charDefs.meleequote) {quoteText.melee += `*"${charDefs.meleequote[i]}"*\n`}
			for (const i in charDefs.physquote) {quoteText.phys += `*"${charDefs.physquote[i]}"*\n`}
			for (const i in charDefs.magquote) {quoteText.mag += `*"${charDefs.magquote[i]}"*\n`}
			for (const i in charDefs.strongquote) {quoteText.weak += `*"${charDefs.strongquote[i]}"*\n`}
			for (const i in charDefs.critquote) {quoteText.crit += `*"${charDefs.critquote[i]}"*\n`}
			for (const i in charDefs.weakquote) {quoteText.weakness += `*"${charDefs.weakquote[i]}"*\n`}
			for (const i in charDefs.missquote) {quoteText.miss += `*"${charDefs.missquote[i]}"*\n`}
			for (const i in charDefs.dodgequote) {quoteText.dodge += `*"${charDefs.dodgequote[i]}"*\n`}
			for (const i in charDefs.resistquote) {quoteText.resist += `*"${charDefs.resistquote[i]}"*\n`}
			for (const i in charDefs.blockquote) {quoteText.block += `*"${charDefs.blockquote[i]}"*\n`}
			for (const i in charDefs.repelquote) {quoteText.repel += `*"${charDefs.repelquote[i]}"*\n`}
			for (const i in charDefs.drainquote) {quoteText.drain += `*"${charDefs.drainquote[i]}"*\n`}
			for (const i in charDefs.hurtquote) {quoteText.hurt += `*"${charDefs.hurtquote[i]}"*\n`}
			for (const i in charDefs.killquote) {quoteText.kill += `*"${charDefs.killquote[i]}"*\n`}
			for (const i in charDefs.deathquote) {quoteText.death += `*"${charDefs.deathquote[i]}"*\n`}
			for (const i in charDefs.allydeathquote) {quoteText.allydeath += `*"${charDefs.allydeathquote[i]}"*\n`}
			for (const i in charDefs.lbquote) {quoteText.lb += `*"${charDefs.lbquote[i]}"*\n`}
			for (const i in charDefs.healquote) {quoteText.heal += `*"${charDefs.healquote[i]}"*\n`}
			for (const i in charDefs.helpedquote) {quoteText.healed += `*"${charDefs.helpedquote[i]}"*\n`}
			for (const i in charDefs.lvlquote) {quoteText.lvl += `*"${charDefs.lvlquote[i]}"*\n`}
			
			for (const i in quoteText) {
				if (quoteText[i] === "") {
					quoteText[i] = "No Quotes."
				}
				
				if (quoteText[i].length > 200 && !arg[2]) {
					quoteText[i] = "Too many Quotes in this field. Please view individually."
				}
			}
			
			const quoteType = arg[2] ? arg[2].toLowerCase() : "none"
			if (quoteType === "melee" || quoteType === "meleeattack") {
				const DiscordEmbed = new Discord.MessageEmbed()
					.setColor('#4b02c9')
					.setTitle(`${arg[1]}: Melee Attack`)
					.setDescription(`${quoteText.melee}`)
				message.channel.send({embeds: [DiscordEmbed]});
			} else if (quoteType === "phys" || quoteType === "physical" || quoteType ===  "physattack") {
				const DiscordEmbed = new Discord.MessageEmbed()
					.setColor('#4b02c9')
					.setTitle(`${arg[1]}: ${arg[2]}`)
					.setDescription(`${quoteText.physical}`)
				message.channel.send({embeds: [DiscordEmbed]});
			} else if (quoteType === "mag" || quoteType === "magic" || quoteType ===  "magicattack") {
				const DiscordEmbed = new Discord.MessageEmbed()
					.setColor('#4b02c9')
					.setTitle(`${arg[1]}: ${arg[2]}`)
					.setDescription(`${quoteText.mag}`)
				message.channel.send({embeds: [DiscordEmbed]});
			} else if (quoteType === "hitweak" || quoteType === "strong") {
				const DiscordEmbed = new Discord.MessageEmbed()
					.setColor('#4b02c9')
					.setTitle(`${arg[1]}: ${arg[2]}`)
					.setDescription(`${quoteText.weak}`)
				message.channel.send({embeds: [DiscordEmbed]});
			} else if (quoteType === "crit" || quoteType === "critical") {
				const DiscordEmbed = new Discord.MessageEmbed()
					.setColor('#4b02c9')
					.setTitle(`${arg[1]}: ${arg[2]}`)
					.setDescription(`${quoteText.crit}`)
				message.channel.send({embeds: [DiscordEmbed]});
			} else if (quoteType === "weak" || quoteType === "weakness") {
				const DiscordEmbed = new Discord.MessageEmbed()
					.setColor('#4b02c9')
					.setTitle(`${arg[1]}: ${arg[2]}`)
					.setDescription(`${quoteText.weakness}`)
				message.channel.send({embeds: [DiscordEmbed]});
			} else if (quoteType === "miss" || quoteType === "enemydodge" || quoteType ===  "huh?") {
				const DiscordEmbed = new Discord.MessageEmbed()
					.setColor('#4b02c9')
					.setTitle(`${arg[1]}: ${arg[2]}`)
					.setDescription(`${quoteText.miss}`)
				message.channel.send({embeds: [DiscordEmbed]});
			} else if (quoteType === "dodge" || quoteType === "evade") {
				const DiscordEmbed = new Discord.MessageEmbed()
					.setColor('#4b02c9')
					.setTitle(`${arg[1]}: ${arg[2]}`)
					.setDescription(`${quoteText.dodge}`)
				message.channel.send({embeds: [DiscordEmbed]});
			} else if (quoteType === "resist") {
				const DiscordEmbed = new Discord.MessageEmbed()
					.setColor('#4b02c9')
					.setTitle(`${arg[1]}: ${arg[2]}`)
					.setDescription(`${quoteText.resist}`)
				message.channel.send({embeds: [DiscordEmbed]});
			} else if (quoteType === "block") {
				const DiscordEmbed = new Discord.MessageEmbed()
					.setColor('#4b02c9')
					.setTitle(`${arg[1]}: ${arg[2]}`)
					.setDescription(`${quoteText.block}`)
				message.channel.send({embeds: [DiscordEmbed]});
			} else if (quoteType === "repel") {
				const DiscordEmbed = new Discord.MessageEmbed()
					.setColor('#4b02c9')
					.setTitle(`${arg[1]}: ${arg[2]}`)
					.setDescription(`${quoteText.repel}`)
				message.channel.send({embeds: [DiscordEmbed]});
			} else if (quoteType === "drain") {
				const DiscordEmbed = new Discord.MessageEmbed()
					.setColor('#4b02c9')
					.setTitle(`${arg[1]}: ${arg[2]}`)
					.setDescription(`${quoteText.drain}`)
				message.channel.send({embeds: [DiscordEmbed]});
			} else if (quoteType === "hurt" || quoteType === "damaged" || quoteType === "hit" || quoteType === "punted" || quoteType === "smacked") {
				const DiscordEmbed = new Discord.MessageEmbed()
					.setColor('#4b02c9')
					.setTitle(`${arg[1]}: ${arg[2]}`)
					.setDescription(`${quoteText.hurt}`)
				message.channel.send({embeds: [DiscordEmbed]});
			} else if (quoteType === "kill" || quoteType === "murder" || quoteType ===  "win") {
				const DiscordEmbed = new Discord.MessageEmbed()
					.setColor('#4b02c9')
					.setTitle(`${arg[1]}: ${arg[2]}`)
					.setDescription(`${quoteText.kill}`)
				message.channel.send({embeds: [DiscordEmbed]});
			} else if (quoteType === "death" || quoteType === "dead" || quoteType ===  "ded" || quoteType === "defeat") {
				const DiscordEmbed = new Discord.MessageEmbed()
					.setColor('#4b02c9')
					.setTitle(`${arg[1]}: Death from enemy`)
					.setDescription(`${quoteText.death}`)
				message.channel.send({embeds: [DiscordEmbed]});
			} else if (quoteType === "allydeath" || quoteType === "allydead") {
				const DiscordEmbed = new Discord.MessageEmbed()
					.setColor('#4b02c9')
					.setTitle(`${arg[1]}: Trusted ally dies from enemy`)
					.setDescription(`${quoteText.allydeath}`)
				message.channel.send({embeds: [DiscordEmbed]});
			} else if (quoteType === "heal" || quoteType === "restore" || quoteType === "help") {
				const DiscordEmbed = new Discord.MessageEmbed()
					.setColor('#4b02c9')
					.setTitle(`${arg[1]}: Healing Allies`)
					.setDescription(`${quoteText.heal}`)
				message.channel.send({embeds: [DiscordEmbed]});
			} else if (quoteType === "healed" || quoteType === "restored" || quoteType ===  "assisted" || quoteType ===  "helped") {
				const DiscordEmbed = new Discord.MessageEmbed()
					.setColor('#4b02c9')
					.setTitle(`${arg[1]}: Healed by ally`)
					.setDescription(`${quoteText.healed}`)
				message.channel.send({embeds: [DiscordEmbed]});
			} else if (quoteType === "lb" || quoteType === "limitbreak" || quoteType ===  "limit") {
				const DiscordEmbed = new Discord.MessageEmbed()
					.setColor('#4b02c9')
					.setTitle(`${arg[1]}: Using Limit Break`)
					.setDescription(`${quoteText.lb}`)
				message.channel.send({embeds: [DiscordEmbed]});
			} else if (quoteType === "lvl" || quoteType === "level" || quoteType ===  "lvlup" || quoteType ===  "levelup" || quoteType ===  "maxxp") {
				const DiscordEmbed = new Discord.MessageEmbed()
					.setColor('#4b02c9')
					.setTitle(`${arg[1]}: Levelling Up`)
					.setDescription(`${quoteText.lvl}`)
				message.channel.send({embeds: [DiscordEmbed]});
			} else {
				const DiscordEmbed = new Discord.MessageEmbed()
					.setColor('#4b02c9')
					.setTitle(`${arg[1]}: All Quotes`)
					.setDescription(`This is ${arg[1]}'s list of quotes. You can set them with "rpg!setquote"`)
					.addFields(
						{ name: 'Melee Attack', value: `${quoteText.melee}`, inline: true },
						{ name: 'Physical Attack', value: `${quoteText.phys}`, inline: true },
						{ name: 'Magical Attack', value: `${quoteText.mag}`, inline: true },
						{ name: 'Struck a Weakness', value: `${quoteText.weak}`, inline: true },
						{ name: 'Missed Attack', value: `${quoteText.miss}`, inline: true },
						{ name: 'Dodge Attack', value: `${quoteText.dodge}`, inline: true },
						{ name: 'Struck a Critical Hit', value: `${quoteText.crit}`, inline: true },
						{ name: 'Weak to an Attack', value: `${quoteText.weakness}`, inline: true },
						{ name: 'Resisted an Attack', value: `${quoteText.resist}`, inline: true },
						{ name: 'Blocked an Attack', value: `${quoteText.block}`, inline: true },
						{ name: 'Repelled an Attack', value: `${quoteText.repel}`, inline: true },
						{ name: 'Drained an Attack', value: `${quoteText.drain}`, inline: true },
						{ name: 'Hurt by an Attack', value: `${quoteText.hurt}`, inline: true },
						{ name: 'Defeat Enemy', value: `${quoteText.kill}`, inline: true },
						{ name: 'Defeated by Enemy', value: `${quoteText.death}`, inline: true },
						{ name: 'Trusted ally defeated by Enemy', value: `${quoteText.allydeath}`, inline: true },
						{ name: 'Heal Ally', value: `${quoteText.heal}`, inline: true },
						{ name: 'Healed by Ally', value: `${quoteText.healed}`, inline: true },
						{ name: 'Limit Break Skill', value: `${quoteText.lb}`, inline: true },
						{ name: 'Level Up', value: `${quoteText.lvl}`, inline: true },
					)
				message.channel.send({embeds: [DiscordEmbed]});
				return false
			}
		}
	}

    if (command === 'setpet') {
		if (utilityFuncs.isBanned(message.author.id, message.guild.id) && !utilityFuncs.RPGBotAdmin(message.author.id)) {
			message.channel.send("I've been told you were banned from using the RPG sections of the bot, sorry!")
			return false
		}

        var arg = message.content.slice(prefix.length).trim().split(/ +/);
        var charPath = dataPath+'/characters.json'
        var charRead = fs.readFileSync(charPath);
        var charFile = JSON.parse(charRead);
		
		if (!charFile[arg[1]])
			return message.channel.send(`${arg[1]} is not a valid character.`);
		
		if (charFile[arg[1]].npcchar)
			return message.channel.send(`${arg[1]} is an npc character.`);
		
		if (!charFile[arg[2]])
			return message.channel.send(`${arg[1]} is not a valid npc character to have as a pet.`);
		
		if (!charFile[arg[2]].npcchar)
			return message.channel.send(`${arg[1]} is not an npc character.`);
		
		charFile[arg[1]].pet = arg[2]
		charFile[arg[2]].petowner = arg[1]
		fs.writeFileSync(charPath, JSON.stringify(charFile, null, '    '));
		
		message.channel.send(`${arg[2]} will now be carried on adventures with ${arg[1]}`);
	}

    if (command === 'removepet' || command === 'returnpet') {
		if (utilityFuncs.isBanned(message.author.id, message.guild.id) && !utilityFuncs.RPGBotAdmin(message.author.id)) {
			message.channel.send("I've been told you were banned from using the RPG sections of the bot, sorry!")
			return false
		}

        var arg = message.content.slice(prefix.length).trim().split(/ +/);
        var charPath = dataPath+'/characters.json'
        var charRead = fs.readFileSync(charPath);
        var charFile = JSON.parse(charRead);
		
		if (!charFile[arg[1]])
			return message.channel.send(`${arg[1]} is not a valid character.`);
		
		if (!charFile[arg[1]].pet)
			return message.channel.send(`${arg[1]} has no pet.`);
		
		if (charFile[arg[1]].npcchar)
			return message.channel.send(`${arg[1]} is an npc character.`);
		
		var petChar = charFile[arg[1]].pet

		message.channel.send(`${petChar} will no-longer be carried on adventures ${arg[1]}`);
		
		if (charFile[petChar])
			delete charFile[petChar].petowner;
		
		delete charFile[arg[1]].pet

		fs.writeFileSync(charPath, JSON.stringify(charFile, null, '    '));
	}
	
	if (command === 'setbioinfo') {
		if (utilityFuncs.isBanned(message.author.id, message.guild.id) && !utilityFuncs.RPGBotAdmin(message.author.id)) {
			message.channel.send("I've been told you were banned from using the RPG sections of the bot, sorry!")
			return false
		}

        const arg = message.content.slice(prefix.length).trim().split(/ +/);
        var charPath = dataPath+'/characters.json'
        var charRead = fs.readFileSync(charPath);
        var charFile = JSON.parse(charRead);

        if (charFile[arg[1]]) {
            const charDefs = charFile[arg[1]]
            if (!utilityFuncs.RPGBotAdmin(message.author.id)) {
                if (message.author.id != charDefs.owner) {
                    message.channel.send("You can't edit someone else's character!");
                    return false
                }
            }
			
			const bioSetting = arg[2].toLowerCase()

			if (!charDefs.bio) {
				charDefs.bio = {
					age: "",
					species: "",
					info: "",
					backstory: "",
					voice: "",
					weight: "",
					height: "",
					theme: "",
					likes: "",
					dislikes: "",
					fears: "",
					appearance: ""
				}
			}

			if (arg[2]) {
				const quote = message.content.slice(prefix.length).trim().split('"');

				if (bioSetting === "age") {
					if (!arg[3])
						return message.channel.send('No age supplied');

					charDefs.bio.age = parseInt(arg[3]);
				} else if (bioSetting === "appearance") {
					if (message.attachments.first())
						charDefs.bio.appearance = message.attachments.first().url;
					else if (arg[3]) {
						if (arg[3].includes('https://imgur.com/') || arg[3].includes('https://media.discordapp.net/attachments/') || arg[3].includes('https://cdn.discordapp.com/attachments/'))
							charDefs.bio.appearance = arg[3];
						else
							return message.channel.send("Please send a valid URL or image.");
					} else
						return message.channel.send("Please send a valid URL or image.");
				} else if (bioSetting === "species") {
					if (!arg[3])
						return message.channel.send('No species supplied');

					if (!quote[1])
						charDefs.bio.species = arg[3]
					else
						charDefs.bio.species = quote[1]
					
					if (!arg[3] || !quote[1])
						return message.channel.send("Invalid Species Field.")
				} else {
					if (!quote[1])
						return message.channel.send("Invalid Field.");

					charDefs.bio[bioSetting] = quote[1];
				}

				fs.writeFileSync(charPath, JSON.stringify(charFile, null, '    '));
				message.react('👍')
			} else
				message.channel.send("Invalid Field, or lack of argument. Try one of these:```diff\n- Age\n- Species\n- Info\n- Backstory\n- Voice\n- Theme\n- Likes\n- Dislikes\n- Fears\n- Appearance```");
        } else {
            message.channel.send(`${arg[1]} isn't a valid character.`);
        }
    }
	
    if (command === 'listchars') {
        var charPath = dataPath+'/characters.json'
        var charRead = fs.readFileSync(charPath);
        var charFile = JSON.parse(charRead);
		
		var user = message.mentions.users.first() ? message.mentions.users.first() : null

		var charArray = []
        const arg = message.content.slice(prefix.length).trim().split(/ +/);
        if (!arg[1] || arg[1] === ' ' || arg[1] === 'null') {
			for (const i in charFile) {
				if (user) {
					if (charFile[i].owner == user.id)
						charArray.push(charFile[i]);
				} else {
					charArray.push(charFile[i]);
				}
			}

			sendCharArray(message.channel, charArray);
        } else {
			for (const i in charFile) {
				if (charFile[i].name && charFile[i].name.includes(arg[1])) {
					if (user) {
						if (charFile[i].id == user.id) {
							charArray.push(charFile[i]);
						}
					} else {
						charArray.push(charFile[i]);
					}
				}
			}
			
			if (charArray.length <= 0)
				return message.channel.send("No found characters.")

			sendCharArray(message.channel, charArray);
		}
	}

    if (command === 'getchar') {
        const arg = message.content.slice(prefix.length).trim().split(/ +/);

        var charPath = dataPath+'/characters.json';
        var charRead = fs.readFileSync(charPath);
        var charFile = JSON.parse(charRead);
		var skillPath = dataPath+'/skills.json';
		var skillRead = fs.readFileSync(skillPath);
		var skillFile = JSON.parse(skillRead);

        if (charFile[arg[1]]) {
            const charName = arg[1]
            const charDefs = utilityFuncs.cloneObj(charFile[arg[1]])

            var i;
            var charSkills = ``;
            for (i = 0; i < charDefs.skills.length; i++) {
				if (skillFile[charDefs.skills[i]])
					charSkills += `${elementEmoji[skillFile[charDefs.skills[i]].type]}${skillFile[charDefs.skills[i]].name ? skillFile[charDefs.skills[i]].name : charDefs.skills[i]}\n`;
				else
					charSkills += '🛑Invalid Skill\n'
			}

            if (charSkills === ``)
				charSkills = "none";

            var charLBs = ``;
            for (i = 0; i <= 4; i++) {
                if (charDefs["lb" + i]) {
                    if (charDefs["lb" + i].name && charDefs["lb" + i].name.toLowerCase() != "none") {
						charLBs += `\n**${i}**:`
						var lbSkill = charDefs["lb" + i]

                        charLBs += `**${lbSkill.name}** *(${lbSkill.class ? lbSkill.class.toUpperCase() : "ATK"} Class)*\n**${lbSkill.pow}** Power, ${lbSkill.cost} LB%.`
						
						if (lbSkill.target && lbSkill.target === "allopposing")
							charLBs += `\nTargets **all foes**.`
						if (lbSkill.hits)
							charLBs += `\n**${lbSkill.hits}** hits.`
						if (lbSkill.drain)
							charLBs += `\nDrains **1/${lbSkill.drain}** of the damage dealt.`
						
						charLBs += '\n'
                    }
                }
            }

            if (charLBs === ``)
				charLBs = "None.";

            var charAffs = "";
            for (const i in charDefs.weak) {charAffs += `${elementEmoji[charDefs.weak[i]]} <:effective:876899270731628584>\n`}
            for (const i in charDefs.resist) {charAffs += `${elementEmoji[charDefs.resist[i]]} <:resist:877132670784647238>\n`}
            for (const i in charDefs.block) {charAffs += `${elementEmoji[charDefs.block[i]]} <:block:879801928282939452>\n`}
            for (const i in charDefs.repel) {charAffs += `${elementEmoji[charDefs.repel[i]]} <:repel:879801953725595649>\n`}
            for (const i in charDefs.drain) {charAffs += `${elementEmoji[charDefs.drain[i]]} <:drain:879801979138895904>\n`}
            if (charAffs === ``) {charAffs = "None."}
			
			var leaderSkill = 'None.';
			if (charDefs.leaderSkill) {
				var skillTxt = {
					boost: 'Boosts the specified type.',
					discount: 'Takes away the amount of cost specified to the specified type.',
					buff: 'Start the battle with the specified stat buff'
				}
				
				var usesPercent = {
					buff: false,
					
					boost: true,
					discount: true
				}

				var skill = charDefs.leaderSkill
				leaderSkill = `**${skill.name}**\n*${skillTxt[skill.type]}\n${skill.percent}${(usesPercent[skill.type] == true) ? '%' : ''} ${skill.type} toward ${skill.target.toUpperCase()}*`;
			}

			var isNPC = charDefs.npcchar ? true : false;
			
			const DiscordEmbed = new Discord.MessageEmbed()
				.setColor('#12de6a')
			
			if (arg[2]) {
				var toLevel = parseInt(arg[2])
				
				if (toLevel > 99 || toLevel < 1)
					return message.channel.send("You can't go over 99 or less than 1.")
				
				if (toLevel > charDefs.level) {
					var levelsLeft = toLevel-charDefs.level
					for (i = 1; i <= levelsLeft; i++) {
						charDefs.xp = charDefs.maxxp
						charFuncs.lvlUp(charDefs);
					}
				} else if (toLevel < charDefs.level) {
					var levelsLeft = charDefs.level-toLevel
					for (i = 1; i <= levelsLeft; i++) {
						charDefs.xp = 0
						charFuncs.lvlDown(charDefs);
					}
				}
			}

			var title = `${charName} `
			if (isNPC)
				title += `*(NPC)*`;
			else {
				var user = await client.users.fetch(charDefs.owner);
				title += `*(${user.username})*`
			}
			
			if (arg[2])
				title += ` *(At level ${arg[2]})*`;
			
			DiscordEmbed.setTitle(title)

			DiscordEmbed.addFields(
				{ name: 'Stats', value: `Level ${charDefs.level}\n${charDefs.xp}/${charDefs.maxxp}XP\n\n${charDefs.hp}/${charDefs.maxhp}HP (${charDefs.basehp} Base)\n${charDefs.mp}/${charDefs.maxmp}MP (${charDefs.basemp} Base)\n\n${charDefs.atk}ATK (${charDefs.baseatk} Base)\n${charDefs.mag}MAG (${charDefs.basemag} Base)\n${charDefs.prc}PRC (${charDefs.baseprc} Base)\n${charDefs.end}END (${charDefs.baseend} Base)\n${charDefs.chr}CHR (${charDefs.basechr} Base)\n${charDefs.int}INT (${charDefs.baseint} Base)\n${charDefs.agl}AGL (${charDefs.baseagl} Base)\n${charDefs.luk}LUK (${charDefs.baseluk} Base)`, inline: true },
				{ name: 'Skills', value: `**Melee Attack**\n${elementEmoji[charDefs.melee[1]]}${charDefs.melee[0]}\n\n**Skills**\n${charSkills}`, inline: true },
				{ name: 'Limit Break Capabilities', value: `${charLBs}`, inline: true },
				{ name: 'Affinities', value: `${charAffs}`, inline: true },
				{ name: 'Leader Skill', value: `${leaderSkill}`, inline: true }
			)
			message.channel.send({embeds: [DiscordEmbed]});
        } else {
			if (!arg[1])
				return message.channel.send('Please specify a character to find.');
			else
				return message.channel.send("There's been an issue finding your character!");
        }
    }
	
    if (command === 'getbio') {
        const arg = message.content.slice(prefix.length).trim().split(/ +/);
		
        var charPath = dataPath+'/characters.json'
        var charRead = fs.readFileSync(charPath);
        var charFile = JSON.parse(charRead);
        if (charFile[arg[1]]) {
            const charName = arg[1]
            const charDefs = charFile[arg[1]]
			
			var bioTxt = `<Name> ${charName}\n`

			if (charDefs.bio.species != "")
				bioTxt += `<Species> ${charDefs.bio.species}\n`
			else
				bioTxt += '<Species> N/A\n'

			if (charDefs.bio.age != "")
				bioTxt += `<Age> ${charDefs.bio.age}\n`
			else
				bioTxt += '<Age> N/A\n'

			if (charDefs.bio.height != "")
				bioTxt += `<Height> ${charDefs.bio.height}\n`
			else
				bioTxt += "<Height> ?'?\n"

			if (charDefs.bio.weight != "")
				bioTxt += `<Weight> ${charDefs.bio.weight}\n`
			else
				bioTxt += "<Weight> ???lbs (Pounds)\n"
			
			if (charDefs.bio.info != "")
				bioTxt += `<Info> ${charDefs.bio.info}\n`
			
			bioTxt += '\n'

			if (charDefs.bio.backstory != "")
				bioTxt += `<Backstory> ${charDefs.bio.backstory}\n`

			if (charDefs.bio.likes != "")
				bioTxt += `<Likes> ${charDefs.bio.likes}\n`

			if (charDefs.bio.dislikes != "")
				bioTxt += `<Dislikes> ${charDefs.bio.dislikes}\n`

			if (charDefs.bio.fears != "")
				bioTxt += `<Fears> ${charDefs.bio.fears}\n`
			
			bioTxt += '\n'
			
			var charTrust = ''
			for (const i in charDefs.trust) {
				var trustVal = charDefs.trust[i]
				var percent = (trustVal.value/trustVal.nextLevel)*100
				percent = roundNum(percent, 2)
				
				charTrust += `**${i}**: *${percent}/100%* Trust, Trust Level *${trustVal.level}*\n`
			}
			
			if (charTrust != '')
				bioTxt += `<Trust> \n${charTrust}`;
			
			bioTxt += '\n'

			if (charDefs.bio.voice != "")
				bioTxt += `<Headcanon Voice> ${charDefs.bio.voice}\n`

			if (charDefs.bio.theme != "")
				bioTxt += `<Battle Themes> ${charDefs.bio.theme}`

			const DiscordEmbed = new Discord.MessageEmbed()
				.setColor('#12de6a')
				.setTitle(`${charName}'s Bio`)
				.setDescription(bioTxt)
				
			if (charDefs.bio.appearance)
                DiscordEmbed.setThumbnail(charDefs.bio.appearance);

			message.channel.send({embeds: [DiscordEmbed]});
        } else
            return message.channel.send(`There's been an issue finding your character!`);
    }

    if (command === 'journal') {
        const arg = message.content.slice(prefix.length).trim().split(/ +/);

        if (readEnm(arg[1])) {
            const enmName = arg[1]
            const enmDefs = readEnm(enmName)
			
			const seenEnm = enemyFuncs.encounteredEnemy(enmName, message.guild.id)
			if (seenEnm == false) {
				var DiscordEmbed = new Discord.MessageEmbed()
					.setColor('#12de6a')
					.setTitle(`${enmName}`)
					.setDescription("This enemy hasn't been seen yet, encounter it in battle to reveal it's stats & affinities.")

				return message.channel.send({embeds: [DiscordEmbed]})
			}

            var enmSkills = ``;
            for (i = 0; i < enmDefs.skills.length; i++) {
				const skillDefs = readSkill(enmDefs.skills[i])
                enmSkills += `${elementEmoji[skillDefs.type]}${skillDefs.name}\n`
            }

            if (enmSkills === ``)
				enmSkills = "none";

            var enmLB = ``;
            if (enmDefs.lb) {
                if (enmDefs.lb.name && enmDefs.lb.name.toLowerCase() != "none") {
					var lbSkill = enmDefs.lb
					enmLB += `**${lbSkill.name}** *(ATK Class)*\n**${lbSkill.pow}** Power, ${lbSkill.cost} LB%.`

					if (lbSkill.target && lbSkill.target === "allopposing")
						enmLB += `\nTargets **all foes**.`
					if (lbSkill.hits)
						enmLB += `\n**${lbSkill.hits}** hits.`
					if (lbSkill.drain)
						enmLB += `\nDrains **1/${lbSkill.drain}** of the damage dealt.`
                }
            }

            if (enmLB === ``) 
				enmLB = "No Limit Break Skill.";

			var charAffs = "";
			for (const i in enmDefs.weak) {charAffs += `${elementEmoji[enmDefs.weak[i]]} <:effective:876899270731628584>\n`}
			for (const i in enmDefs.resist) {charAffs += `${elementEmoji[enmDefs.resist[i]]} <:resist:877132670784647238>\n`}
			for (const i in enmDefs.block) {charAffs += `${elementEmoji[enmDefs.block[i]]} <:block:879801928282939452>\n`}
			for (const i in enmDefs.repel) {charAffs += `${elementEmoji[enmDefs.repel[i]]} <:repel:879801953725595649>\n`}
			for (const i in enmDefs.drain) {charAffs += `${elementEmoji[enmDefs.drain[i]]} <:drain:879801979138895904>\n`}
			if (charAffs === ``) {charAffs = "None."}

			var enmLoot = ``
			if (!enmDefs.loot || enmDefs.loot == '' || enmDefs.loot == undefined)
				enmLoot = `No possible loot.`
			
			if (enmDefs.loot) {
				var lootPath = dataPath+'/Loot/lootTables.json'
				var lootRead = fs.readFileSync(lootPath);
				var lootFile = JSON.parse(lootRead);

				let lootVar=0;

				do {
					enmLoot += `- ${lootFile[enmDefs.loot].items[lootVar]}\n`
					lootVar++
				} while (lootVar < lootFile[enmDefs.loot].items.length) //how tf did a for loop not work with it????????
			}

            var DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#12de6a')
                .setTitle(`${enmName}`)
                .setDescription(`${enmDefs.journal}`)
                .addFields(
                    { name: `${enmName}'s Stats:`, value: `Level ${enmDefs.level}\nWorth ${enmDefs.awardxp}XP\n\n${enmDefs.hp} Max HP\n${enmDefs.mp} Max MP\n\n${enmDefs.atk}ATK\n${enmDefs.mag}MAG\n${enmDefs.prc}PRC\n${enmDefs.end}END\n${enmDefs.chr}CHR\n${enmDefs.int}INT\n${enmDefs.agl}AGL\n${enmDefs.luk}LUK`, inline: true },
                    { name: `${enmName}'s Skills:`, value: `${enmSkills}`, inline: true },
					{ name: `${enmName}'s Affinities:`, value: `${charAffs}`, inline: true },
					{ name: `${enmName}'s Possible Loot:`, value: `${enmLoot}`, inline: true },
                )
			
			if (enmLB != "No Limit Break Skill.")
				DiscordEmbed.fields.push({ name: `${enmName}'s Limit Break Capability:`, value: `${enmLB}`, inline: true });
			
            if (enmDefs.image) {
				const file = new Discord.MessageAttachment(`./images/enemies/${enmDefs.image}`);
                DiscordEmbed.setThumbnail(`attachment://${enmDefs.image}`)
				message.channel.send({embeds: [DiscordEmbed], files: [file]});
			} else
				message.channel.send({embeds: [DiscordEmbed]});
        } else {
            message.channel.send(`Invalid Enemy.`);
            return
        }
    }

    /////////////////////////////
    // In Battle Stuff!
    /////////////////////////////
    if (command === 'startenemybattle') {
        const btl = readBattle(message.guild.id);

        if (!message.member.permissions.serialize().ADMINISTRATOR)
            return message.channel.send("You lack sufficient permissions, I'm so sorry!");

        const arg = message.content.slice(prefix.length).trim().split(/ +/);

        console.log('BattleStatus: Starting Battle');

        var charPath = dataPath+'/characters.json'
        var charRead = fs.readFileSync(charPath);
        var charFile = JSON.parse(charRead);
		
		var battlerID = 0;

        if (!btl[message.guild.id]) {
            btl[message.guild.id] = {
                battling: false,
                colosseum: [
                    false,
                    0,
                    "none"
                ],
                trials: {},
                parties: {},
				allies: {
					members: [],
					backup: []
				},
                enemies: {
                    members: [],
                    items: {},
                    rings: 0
                },
                battleteam: "none",
                battleteam2: "none",
                battlechannel: "none",
                doturn: 0,
                turn: 0,
                turnorder: [],
				pvp: false,
				pvpmode: "none"
            }
        }
		
		if (btl[message.guild.id].battling == true)
			return message.channel.send(`You can't reset a battle!`);

        if (btl[message.guild.id].parties == {})
            return message.channel.send(`There are no parties avaliable! \n__Check ${prefix}makeparty__`);

        if (!btl[message.guild.id].parties[arg[1]])
            return message.channel.send(`${arg[1]} is an invalid party.`);
		
        btl[message.guild.id].allies.members = [];
        for (const k in btl[message.guild.id].parties[arg[1]].members) {
			var charDefs = charFile[btl[message.guild.id].parties[arg[1]].members[k]]
            delete charDefs.lb
            delete charDefs.guard
			delete charDefs.status
			delete charDefs.statusturns

			if (!charDefs.name)
				charDefs.name = btl[message.guild.id].parties[arg[1]].members[k];

			var battlerDefs = charFuncs.genChar(charDefs, (k <= 0) ? true : false)
			battlerDefs.id = battlerID

			btl[message.guild.id].allies.members.push(battlerDefs)
			battlerID++;
        }

		if (!btl[message.guild.id].allies.backup)
			btl[message.guild.id].allies.backup = []

        for (const k in btl[message.guild.id].parties[arg[1]].backup) {
			var charDefs = charFile[btl[message.guild.id].parties[arg[1]].backup[k]]
            delete charDefs.lb
            delete charDefs.guard
			delete charDefs.status
			delete charDefs.statusturns

			if (!charDefs.name)
				charDefs.name = btl[message.guild.id].parties[arg[1]].members[k];

			var battlerDefs = charFuncs.genChar(charDefs, false)
			battlerDefs.id = battlerID

			btl[message.guild.id].allies.backup.push(battlerDefs)
			battlerID++;
        }
		       
		var servPath = dataPath+'/Server Settings/server.json'
        var servRead = fs.readFileSync(servPath);
        var servFile = JSON.parse(servRead);
		
		if (!servFile[message.guild.id].encountered)
			servFile[message.guild.id].encountered = [];

        btl[message.guild.id].enemies.members = [];
        for (let i = 2; i < arg.length; i++) {
            if (readEnm(arg[i])) {
                var enemyDefs = enemyFuncs.genEnm(arg[i], message.guild.id)
				enemyDefs.id = battlerID
				btl[message.guild.id].enemies.members.push(enemyDefs)
				
				if (!enemyFuncs.encounteredEnemy(arg[i], message.guild.id))
					servFile[message.guild.id].encountered.push(arg[i]);

                console.log(`BattleStatus: ${arg[i]} generated.`);
				battlerID++;
            } else {
                message.channel.send(`${arg[i]} is an invalid enemy.`)
                return false
            }
        }
		
		fs.writeFileSync(servPath, JSON.stringify(servFile, null, '    '));

        // Set up Battle Vars
		turnFuncs.setUpBattleVars(btl[message.guild.id])
		btl[message.guild.id].battleteam = arg[1]
		btl[message.guild.id].battlechannel = message.channel.id

        fs.writeFileSync(charPath, JSON.stringify(charFile, null, '    '));
        fs.writeFileSync(dataPath+'/battle.json', JSON.stringify(btl, null, '    '));

        message.channel.send(`Team ${arg[1]} encountered some enemies!`);
        console.log('BattleStatus: Battle has Begun.');
		
		var themeType = "battle"
		for (const i in btl[message.guild.id].enemies.members) {
			enemyDefs = btl[message.guild.id].enemies.members[i]
			if (enemyDefs.miniboss)
				themeType = "miniboss";
			else if (enemyDefs.boss)
				themeType = "bossfight";
			else if (enemyDefs.finalboss)
				themeType = "finalboss"
			else {
				// Check for Strong Foe
				var BST = 0
				const stats = ["atk", "mag", "end", "chr", "int", "luk", "prc", "agl"]
				for (const k in stats)
					BST += enemyDefs[stats[k]];

				var strongestChar = [0, 0]
				for (const k in btl[message.guild.id].allies.members) {
					var charDefs = btl[message.guild.id].allies.members[k]
				
					var charBST = 0
					const stats = ["atk", "mag", "end", "chr", "int", "luk", "prc", "agl"]
					for (const key in stats)
						charBST += charDefs[stats[key]];
					
					if (charBST > strongestChar[1]) {
						strongestChar[0] = k
						strongestChar[1] = charBST
					}
				}
				
				if (BST > strongestChar+20)
					themeType = "strongfoe"
				else if (BST > strongestChar+10)
					themeType = "disadvantage"
				else if (BST < strongestChar-10)
					themeType = "disadvantage"
			}
		}

		playThemeType(message.guild.id, themeType)
		
		// Start with leaderskill shit
		charFuncs.startBattleLeaderSkill(btl[message.guild.id].allies.members)

        // rid of the message
        message.delete();

        // Start with the first turn!
        setTimeout(function() {
			advanceTurn(btl, message.guild.id)
        }, 500)
    }
	
	if (command === 'setencounteredenemy' || command === 'setencountered' || command === 'encounter') {
        if (!message.member.permissions.serialize().ADMINISTRATOR) {
            message.channel.send("You lack sufficient permissions, I'm so sorry!");
            return
        }

        const arg = message.content.slice(prefix.length).trim().split(/ +/);

		if (readEnm(arg[1])) {
			if (!servFile[message.guild.id].encountered) 
				servFile[message.guild.id].encountered = [];

			if (!enemyFuncs.encounteredEnemy(arg[1], message.guild.id))
				servFile[message.guild.id].encountered.push(arg[1]);
			
			fs.writeFileSync(servPath, JSON.stringify(servFile, null, '    '));
			message.react('👍')
		} else
			message.channel.send(arg[1] + ' is an invalid Enemy.');
	}

    if (command === 'startcolosseum') {
        const btl = readBattle(message.guild.id);

        if (btl[message.guild.id].battling == true) {
            message.channel.send(`You can't reset a battle!`);
            return
        }

        if (!message.member.permissions.serialize().ADMINISTRATOR) {
            message.channel.send("You lack sufficient permissions, I'm so sorry!");
            return
        }

        const arg = message.content.slice(prefix.length).trim().split(/ +/);

        console.log('BattleStatus: Starting Battle in Colosseum');

        var charPath = dataPath+'/characters.json'
        var charRead = fs.readFileSync(charPath);
        var charFile = JSON.parse(charRead);

        if (!btl[message.guild.id]) {
            btl[message.guild.id] = {
                battling: false,
                colosseum: [
                    false,
                    0,
                    "none"
                ],
                trials: {},
                parties: {},
				allies: {
					members: []
				},
                enemies: {
                    members: [],
                    items: {},
                    rings: 0
                },
                battleteam: "none",
                battleteam2: "none",
                battlechannel: "none",
                doturn: 0,
                turn: 0,
                turnorder: [],
				weather: "clear",
				terrain: "none",
				pvp: false,
				pvpmode: "none"
            }
        }

        if (btl[message.guild.id].parties == {}) {
            message.channel.send(`There are no parties avaliable! \n__Check ${prefix}makeparty__`)
            return
        }

        if (!btl[message.guild.id].parties[arg[1]]) {
            message.channel.send(`${arg[1]} is an invalid party.`)
            return
        }
		
		var battlerID = 0;

        btl[message.guild.id].allies.members = [];
        for (const k in btl[message.guild.id].parties[arg[1]].members) {
			var charDefs = charFile[btl[message.guild.id].parties[arg[1]].members[k]]

			// Reset some effects
            delete charDefs.lb
            delete charDefs.guard
			delete charDefs.status
			delete charDefs.statusturns

			if (!charDefs.name) {
				charDefs.name = btl[message.guild.id].parties[arg[1]].members[k]
			}
			
			// Generate Character
			var battlerDefs = charFuncs.genChar(charDefs, (k <= 0) ? true : false)
			battlerDefs.id = battlerID

			btl[message.guild.id].allies.members.push(battlerDefs)
			battlerID++;
        }

		if (!btl[message.guild.id].allies.backup)
			btl[message.guild.id].allies.backup = []

        for (const k in btl[message.guild.id].parties[arg[1]].backup) {
			var charDefs = charFile[btl[message.guild.id].parties[arg[1]].backup[k]]
            delete charDefs.lb
            delete charDefs.guard
			delete charDefs.status
			delete charDefs.statusturns

			if (!charDefs.name)
				charDefs.name = btl[message.guild.id].parties[arg[1]].members[k];

			var battlerDefs = charFuncs.genChar(charDefs, false)
			battlerDefs.id = battlerID

			btl[message.guild.id].allies.backup.push(battlerDefs)
			battlerID++;
        }

        btl[message.guild.id].enemies.members = [];
		const trialWave = btl[message.guild.id].trials[arg[2]][0]
        for (const i in trialWave) {
            if (readEnm(trialWave[i])) {
                var enemyDefs = enemyFuncs.genEnm(trialWave[i], message.guild.id)
				enemyDefs.id = battlerID
				
				btl[message.guild.id].enemies.members.push(enemyDefs)
				battlerID++;

                console.log(`BattleStatus: ${trialWave[i]} generated.`);
            } else {
                message.channel.send(`${trialWave[i]} in the trial of ${arg[2]} is an invalid enemy.`)
                return false
            }
        }

        // Set up Battle Vars
		turnFuncs.setUpBattleVars(btl[message.guild.id])
        btl[message.guild.id].battlechannel = message.channel.id;
        btl[message.guild.id].battleteam = arg[1];
        btl[message.guild.id].colosseum[0] = true;
        btl[message.guild.id].colosseum[1] = 0;
        btl[message.guild.id].colosseum[2] = arg[2];
        fs.writeFileSync(dataPath+'/battle.json', JSON.stringify(btl, null, '    '));

        message.channel.send(`The trial of ${arg[2]} has begun. Team ${arg[1]} encountered the first wave!`);
        console.log('BattleStatus: Battle has Begun.');
		
		playThemeType(message.guild.id, "colosseum")

		// Start with leaderskill shit
		charFuncs.startBattleLeaderSkill(btl[message.guild.id].allies.members)

        // rid of the message
        message.delete();

        // Start with the first turn!
        setTimeout(function() {
			advanceTurn(btl, message.guild.id)
        }, 500)
    }
	
	// PVP
    if (command === 'leaderboards' || command === 'leaders' || command === 'winners') {
        const arg = message.content.slice(prefix.length).trim().split(/ +/);

		if (!servFile[message.guild.id].pvpstuff || servFile[message.guild.id].pvpstuff.legnth <= 2) {
			servFile[message.guild.id].pvpstuff = {
				none: {},
				metronome: {},
				randskills: {},
				randstats: {},
				charfuck: {}
			} 
			
			fs.writeFileSync(servPath, JSON.stringify(servFile, null, '    '));
		}

		var gamemode = "none"
		if (arg[1]) {
			if (arg[1].toLowerCase() === "metronome" || arg[1].toLowerCase() === "randskills" || arg[1].toLowerCase() === "randstats" || arg[1].toLowerCase() === "charfuck") {
				gamemode = arg[1].toLowerCase()
			}
		}

		var leaderBoard = []
		for (const i in servFile[message.guild.id].pvpstuff[gamemode]) {
			leaderBoard.push([i, servFile[message.guild.id].pvpstuff[gamemode][i]])
		}
	
		leaderBoard.sort(function(a, b) {return b[1].points - a[1].points});
		
		var leaderText = ""    
		for (const i in leaderBoard) {
			let boardUser = client.users.fetch(leaderBoard[i][0])
			boardUser.then(function(user) {
				leaderText += `${+i+1}: ${user.username} (${leaderBoard[i][1].points} points)\n`;
			})
		}
		
		if (gamemode === "none") {gamemode = "regular"}
		
		setTimeout(function() {
			if (leaderText == "") {leaderText = "No Users on the leaderboard."}
			
			const DiscordEmbed = new Discord.MessageEmbed()
				.setColor('#b4eb34')
				.setTitle(`${message.guild.name}'s ${gamemode} leaderboard`)
				.setDescription(`${leaderText}`)
			message.channel.send({embeds: [DiscordEmbed]})
		},	500)
	}

    if (command === 'startpvp' || command === 'pvp') {
        const btl = readBattle(message.guild.id);
        if (btl[message.channel.guild]) {
            if (btl[message.guild.id].battling == true) {
                message.channel.send(`You can't reset a battle!`);
                return
            }
        }

        if (!message.member.permissions.serialize().ADMINISTRATOR) {
            message.channel.send("You lack sufficient permissions, I'm so sorry!");
            return
        }

        const arg = message.content.slice(prefix.length).trim().split(/ +/);

        console.log('BattleStatus: Starting Battle in PVP Mode');
        var charPath = dataPath+'/characters.json'
        var charRead = fs.readFileSync(charPath);
        var charFile = JSON.parse(charRead);

        if (!btl[message.guild.id]) {
            btl[message.guild.id] = {
                battling: false,
                colosseum: [
                    false,
                    0,
                    "none"
                ],
                trials: {},
                parties: {},
				allies: {
					members: [],
					enemies: []
				},
                enemies: {
                    members: [],
                    items: {},
                    rings: 0
                },
                battleteam: "none",
                battleteam2: "none",
                battlechannel: "none",
                doturn: 0,
                turn: 0,
                turnorder: [],
				pvp: false,
				pvpmode: "none"
            }
        }
		
		btl[message.guild.id].pvp = true

        if (btl[message.guild.id].parties == {})
            return message.channel.send(`There are no parties avaliable! \n__Check ${prefix}makeparty__`);

        if (!btl[message.guild.id].parties[arg[1]] || !btl[message.guild.id].parties[arg[2]])
            return message.channel.send('One of two parties are invalid.');

        if (btl[message.guild.id].parties[arg[1]] === btl[message.guild.id].parties[arg[2]]) 
            return message.channel.send("You can't battle yourselves!");
		
		if (btl[message.guild.id].parties[arg[1]].length > 4)
			return message.channel.send('4 people must be in a party at maximum for PVP!');
		
		var battlerID = 0;
        btl[message.guild.id].allies.members = [];
        for (const k in btl[message.guild.id].parties[arg[1]].members) {
			var charDefs = charFile[btl[message.guild.id].parties[arg[1]].members[k]]
            delete charDefs.lb
            delete charDefs.guard
			delete charDefs.status
			delete charDefs.statusturns

			if (!charDefs.name) {
				charDefs.name = btl[message.guild.id].parties[arg[1]].members[k]
			}

			var battlerDefs = charFuncs.genChar(charDefs)
			battlerDefs.team = "allies"
			battlerDefs.id = battlerID

			btl[message.guild.id].allies.members.push(battlerDefs)
			battlerID++;
        }

        btl[message.guild.id].enemies.members = [];
        for (const k in btl[message.guild.id].parties[arg[2]].members) {
			var charDefs = charFile[btl[message.guild.id].parties[arg[2]].members[k]]
            delete charDefs.lb
            delete charDefs.guard
			delete charDefs.status
			delete charDefs.statusturns

			if (!charDefs.name) {
				charDefs.name = btl[message.guild.id].parties[arg[2]].members[k]
			}

			var battlerDefs = charFuncs.genChar(charDefs)
			battlerDefs.team = "enemies"
			battlerDefs.id = battlerID

			btl[message.guild.id].enemies.members.push(battlerDefs)
			battlerID++;
        }
		
		// Owner Check
		var ownerFighters = {}
		for (const i in btl[message.guild.id].allies.members) {
			if (btl[message.guild.id].allies.members[i].owner) {
				if (ownerFighters[btl[message.guild.id].allies.members[i].owner]) {
					let charOwner = client.users.fetch(btl[message.guild.id].allies.members[i].owner)
					charOwner.then(function(user) {
						message.channel.send(`${user}: Cannot Control more than 1 character in a PVP battle.`)
					})

					return false
				} else {
					ownerFighters[btl[message.guild.id].allies.members[i].owner] = true
				}
			}
		}

		for (const i in btl[message.guild.id].enemies.members) {
			if (btl[message.guild.id].enemies.members[i].owner) {
				if (ownerFighters[btl[message.guild.id].enemies.members[i].owner]) {
					let charOwner = client.users.fetch(btl[message.guild.id].enemies.members[i].owner)
					charOwner.then(function(user) {
						message.channel.send(`${user}: Cannot Control more than 1 character in a PVP battle.`)
					})

					return false
				} else {
					ownerFighters[btl[message.guild.id].enemies.members[i].owner] = true
				}
			}
		}

        // Set up Battle Vars
		turnFuncs.setUpBattleVars(btl[message.guild.id])
        btl[message.guild.id].pvp = true;
        btl[message.guild.id].battleteam = arg[1];
        btl[message.guild.id].battleteam2 = arg[2];
        btl[message.guild.id].battlechannel = message.channel.id;

        client.user.setActivity("a PVP battle.", { type: 'WATCHING' });

		// Start with leaderskill shit
		charFuncs.startBattleLeaderSkill(btl[message.guild.id].allies.members)
		charFuncs.startBattleLeaderSkill(btl[message.guild.id].enemies.members)
		
		if (arg[3]) {
			var gameMode = arg[3].toLowerCase()
			var battlers = []
			for (const i in btl[message.guild.id].allies.members) {
				battlers.push(btl[message.guild.id].allies.members[i])
			}
			for (const i in btl[message.guild.id].enemies.members) {
				battlers.push(btl[message.guild.id].enemies.members[i])
			}

			// for certain skillbased gamemodes
			var skillPath = dataPath+'/skills.json'
			var skillRead = fs.readFileSync(skillPath);
			var skillFile = JSON.parse(skillRead);

			for (const i in battlers) {
				var charDefs = battlers[i]
				if (gameMode === "metronome") {
					console.log('BattleStatus: Gamemode is Metronome')

					charDefs.skills = ["Metronome"]
					btl[message.guild.id].pvpmode = "metronome"
				} else if (gameMode === "randskills" || gameMode === "randomskills") {
					console.log('BattleStatus: Gamemode is RandSkills')
					charDefs.skills = []

					var possibleSkills = []
					for (const val in skillFile)
						possibleSkills.push(val);

					for (let k = 0; k < 8; k++) {
						const skillName = possibleSkills[Math.round(Math.random() * (possibleSkills.length-1))]
						charDefs.skills.push(skillName)
					}
					
					btl[message.guild.id].pvpmode = "randskills"
				} else if (gameMode === "randstats" || gameMode === "randomstats" || gameMode === "statfuck") {
					console.log('BattleStatus: Gamemode is RandStats');

					const stats = ["atk", "mag", "end", "chr", "int", "luk", "prc", "agl"]
					for (const k in stats) {
						var statNum = Math.floor(Math.random()*99)
						charDefs[stats[k]] = statNum
					}
					
					charDefs.weak = [];
					charDefs.resist = [];
					charDefs.block = [];
					charDefs.repel = [];
					charDefs.drain = [];
					
					const affinities = ["weak", "weak", "weak", "normal", "normal", "normal", "normal", "resist", "resist", "block", "repel", "drain"]
					for (const k in Elements) {
						var statusNum = Math.floor(Math.random() * (affinities.length-1))

						if (affinities[statusNum] != "normal") 
							charDefs[affinities[statusNum]].push(Elements[k]);
					}
					
					btl[message.guild.id].pvpmode = "randstats"
				} else if (gameMode === "charfuck" || gameMode === "randall") {
					console.log('BattleStatus: Gamemode is CharFuck');

					charDefs.skills = []

					var possibleSkills = []
					for (const val in skillFile)
						possibleSkills.push(val);

					for (let k = 0; k < 8; k++) {
						const skillName = possibleSkills[Math.round(Math.random() * (possibleSkills.length-1))]
						charDefs.skills.push(skillName)
					}
					
					charDefs.maxhp = 300 + Math.floor(Math.random()*300)
					charDefs.maxmp = 300 + Math.floor(Math.random()*400)
					charDefs.hp = charDefs.maxhp
					charDefs.mp = charDefs.maxmp

					const stats = ["atk", "mag", "end", "chr", "int", "luk", "prc", "agl"]
					for (const k in stats) {
						var statNum = Math.floor(Math.random()*99)
						charDefs[stats[k]] = statNum
					}
					
					charDefs.weak = [];
					charDefs.resist = [];
					charDefs.block = [];
					charDefs.repel = [];
					charDefs.drain = [];
					
					const affinities = ["weak", "weak", "weak", "normal", "normal", "normal", "normal", "resist", "resist", "block", "repel", "drain"]
					for (const k in Elements) {
						if (Elements[k] === "status" || Elements[k] === "heal" || Elements[k] === "passive" || Elements[k] === "almighty")
							continue;
		
						var statusNum = Math.floor(Math.random() * (affinities.length-1))

						if (affinities[statusNum] != "normal") 
							charDefs[affinities[statusNum]].push(Elements[k]);
					}

					btl[message.guild.id].pvpmode = "charfuck"
				} else {
					btl[message.guild.id].pvpmode = "none"
				}
			}
		} else
			btl[message.guild.id].pvpmode = "none";

        fs.writeFileSync(charPath, JSON.stringify(charFile, null, '    '));
        fs.writeFileSync(dataPath+'/battle.json', JSON.stringify(btl, null, '    '));
        message.channel.send(`PVP between Team ${arg[1]} & Team ${arg[2]} has begun.`);
        console.log('BattleStatus: PVP Battle has Begun.');
		
		playThemeType(message.guild.id, "pvp")

        // rid of the message
        message.delete();

        // Start with the first turn!
        setTimeout(function() {
			advanceTurn(btl, message.guild.id)
        }, 500)
    }

    if (command === 'usemelee' || command === 'meleeatk' || command === 'melee') {
        const btl = readBattle(message.guild.id);
        const arg = message.content.slice(prefix.length).trim().split(/ +/);

        if (btl[message.guild.id].battling == false) {
            message.channel.send(`You can't cast a move out of battle!`);
            return
        }

		var defs
		const tempTurnOrder = getTurnOrder(btl[message.guild.id])
		if (btl[message.guild.id].allies.members[arg[1]]
			&& !btl[message.guild.id].allies.members[arg[1]].enemy
			&& (btl[message.guild.id].allies.members[arg[1]].owner == message.author.id || message.member.permissions.serialize().ADMINISTRATOR)
			&& tempTurnOrder[btl[message.guild.id].doturn].id == btl[message.guild.id].allies.members[arg[1]].id) {
				console.log("Found Character. (On ally side)")
				defs = btl[message.guild.id].allies.members[arg[1]]
		}
		if (btl[message.guild.id].enemies.members[arg[1]] 
			&& !btl[message.guild.id].enemies.members[arg[1]].enemy 
			&& (btl[message.guild.id].enemies.members[arg[1]].owner == message.author.id || message.member.permissions.serialize().ADMINISTRATOR)
			&& tempTurnOrder[btl[message.guild.id].doturn].id == btl[message.guild.id].enemies.members[arg[1]].id) {
				console.log("Found Character. (On enemy side)")
				defs = btl[message.guild.id].enemies.members[arg[1]]
		}
		
		if (!defs) {
			message.channel.send("Invalid Position: Either you don't own this character or this character does not exist.")
			message.delete()
			return false
		}

        if (btl[message.guild.id].battling == true) {
            if (tempTurnOrder[btl[message.guild.id].doturn].name != defs.name) {
                message.channel.send(`It's not ${defs.name}'s turn!`);
                message.delete()
                return
            }
        }

        if (defs) {
            var charDefs = defs
			var charName = charDefs.name
		
			var allySide = btl[message.guild.id].allies.members
			var opposingSide = btl[message.guild.id].enemies.members
			if (charFuncs.isOpposingSide(charDefs, btl[message.guild.id])) {
				allySide = btl[message.guild.id].enemies.members
				opposingSide = btl[message.guild.id].allies.members
			}

            if (!message.member.permissions.serialize().ADMINISTRATOR) {
                if (message.author.id != charDefs.owner) {
                    message.channel.send("You can't control someone else's character!")
                    return false
                }
            }
			
			var preText = ""
			if (charDefs.meleequote && charDefs.meleequote.length > 0) {
				var possibleQuote = Math.round(Math.random() * (charDefs.meleequote.length-1))
				preText = `*${charDefs.name}: "${charDefs.meleequote[possibleQuote]}"*\n`
			}
			
            if (opposingSide[parseInt(arg[2])]) {
				var enmDefs = opposingSide[parseInt(arg[2])]				
				if (enmDefs.hp <= 0) {
					message.channel.send("You can't attack a dead foe!")
					message.delete()
					return false
				}
				
				if (turnFuncs.showTimes(message.guild.id)) {
					btl[message.guild.id].canshowtime = false
				}

				var useText = attackFuncs.meleeFoe(charDefs, enmDefs, message.guild.id, null, btl)

                const DiscordEmbed = new Discord.MessageEmbed()
                    .setColor('#e36b2b')
					.setTitle(`${useText.targetText}`)
                    .setDescription(`${preText}${useText.attackText}\n${useText.resultText}`)
                    .setFooter(`${charName}'s turn`);
                message.channel.send({embeds: [DiscordEmbed]});

                if (btl[message.guild.id].battling == true) {
                    setTimeout(function() {
                        advanceTurn(btl, message.guild.id)
					
						setTimeout(function() {
							message.delete();
						}, 500)
                    }, 1500)
                }
            } else {
                message.channel.send(`This enemy isn't in battle!`);
                message.delete();
                return
            }

            fs.writeFileSync(dataPath+'/battle.json', JSON.stringify(btl, null, '    '));
        } else {
            message.channel.send(`There's been an issue finding your character!`);
            return
        }
    }

    if (command === 'usemove' || command === 'useskill') {
        const btl = readBattle(message.guild.id);
        const arg = message.content.slice(prefix.length).trim().split(/ +/);

        var itemPath = dataPath+'/items.json'
        var itemRead = fs.readFileSync(itemPath);
        var itemFile = JSON.parse(itemRead);
		
		var skillPath = dataPath+'/skills.json'
        var skillRead = fs.readFileSync(skillPath);
        var skillFile = JSON.parse(skillRead);

		var charPath = dataPath+'/characters.json'
		var charRead = fs.readFileSync(charPath);
		var charFile = JSON.parse(charRead);
		
        if (btl[message.guild.id].battling == false) {			
			if (charFile[arg[1]]) {
				var skillDefs = skillFile[arg[2]]
				if (!skillDefs.name) {skillDefs.name = arg[2]}

				var charDefs = charFile[arg[1]]

				if (skillDefs.cost) {
					if (skillDefs.costtype && skillDefs.costtype === "hp") {
						if (charDefs.hp <= skillDefs.cost) {
							message.channel.send(`Not enough HP! (Need ${skillDefs.cost}HP)`)
							return
						}
					} else if (skillDefs.costtype && skillDefs.costtype === "hppercent") {
						if (charDefs.hp <= ((charDefs.maxhp/100)*skillDefs.cost)) {
							message.channel.send(`Not enough HP! (Need ${Math.round((charDefs.maxhp / 100) * skillDefs.cost)}HP)`)
							return
						}
					} else if (skillDefs.costtype && skillDefs.costtype === "mppercent") {
						if (charDefs.mp < ((charDefs.maxmp / 100) * skillDefs.cost)) {
							message.channel.send(`Not enough MP! (Need ${Math.round((charDefs.maxmp / 100) * skillDefs.cost)}MP)`)
							return
						}
					} else {
						if (charDefs.mp < skillDefs.cost) {
							message.channel.send(`Not enough MP! (Need ${skillDefs.cost}MP)`)
							return
						}
					}
				}

				var finalText = ""
				if (skillDefs.type === "heal") {
					if (skillDefs.healmp) {
						finalText = `${arg[1]} used ${arg[2]} on £{arg[3]} to restore ${skillDefs.pow}MP.`;
						charFile[arg[3]].mp = Math.max(charFile[arg[3]].maxmp, charFile[arg[3]].mp+skillDefs.pow)
					} else {
						finalText = `${arg[1]} used ${arg[2]} on £{arg[3]} to restore ${skillDefs.pow}HP.`;
						charFile[arg[3]].hp = Math.max(charFile[arg[3]].maxhp, charFile[arg[3]].hp+skillDefs.pow)
					}
				} else {
					if (!skillDefs.target || skillDefs.target === "one") {
						finalText = `${arg[1]} used ${arg[2]}.`;
					} else if (!skillDefs.target || skillDefs.target === "caster") {
						finalText = `${arg[1]} used ${arg[2]} on themselves.`;
					} else if (skillDefs.target === "allopposing" || skillDefs.target === "allallies") {
						finalText = `${arg[1]} used ${arg[2]} directly infront of them.`;
					} else if (skillDefs.target === "everyone") {
						finalText = `${arg[1]} used ${arg[2]} on their surroundings.`;
					}
				}
				
				if (skillDefs.cost) {
					if (skillDefs.costtype && skillDefs.costtype == "hp") {
						finalText += ` (-${skillDefs.cost}HP)`
						charDefs.hp -= skillDefs.cost
					} else if (skillDefs.costtype && skillDefs.costtype == "hppercent") {
						finalText += ` (-${Math.round((charDefs.maxhp / 100) * skillDefs.cost)}HP)`
						charDefs.hp -= Math.round((charDefs.maxhp / 100) * skillDefs.cost)
					} else if (skillDefs.costtype && skillDefs.costtype == "mppercent") {
						finalText += ` (-${Math.round((charDefs.maxmp / 100) * skillDefs.cost)}MP)`
						charDefs.mp -= Math.round((charDefs.maxmp / 100) * skillDefs.cost)
					} else {
						finalText += ` (-${skillDefs.cost}MP)`
						charDefs.mp -= skillDefs.cost
					}
				}
				
				message.channel.send(`${finalText}`)
				fs.writeFileSync(charPath, JSON.stringify(charFile, null, '    '));
			}

			message.delete()
            return false
        }

		var defs
		const tempTurnOrder = getTurnOrder(btl[message.guild.id])
		if (btl[message.guild.id].allies.members[arg[1]]
			&& !btl[message.guild.id].allies.members[arg[1]].enemy
			&& (btl[message.guild.id].allies.members[arg[1]].owner == message.author.id || message.member.permissions.serialize().ADMINISTRATOR)
			&& tempTurnOrder[btl[message.guild.id].doturn].id == btl[message.guild.id].allies.members[arg[1]].id) {
				console.log("Found Character. (On ally side)")
				defs = btl[message.guild.id].allies.members[arg[1]]
		}
		if (btl[message.guild.id].enemies.members[arg[1]] 
			&& !btl[message.guild.id].enemies.members[arg[1]].enemy 
			&& (btl[message.guild.id].enemies.members[arg[1]].owner == message.author.id || message.member.permissions.serialize().ADMINISTRATOR)
			&& tempTurnOrder[btl[message.guild.id].doturn].id == btl[message.guild.id].enemies.members[arg[1]].id) {
				console.log("Found Character. (On enemy side)")
				defs = btl[message.guild.id].enemies.members[arg[1]]
		}
		
		if (!defs) {
			message.channel.send("Invalid Position: Either you don't own this character or this character does not exist.")
			message.delete()
			return false
		}

        if (btl[message.guild.id].battling == true) {
            if (tempTurnOrder[btl[message.guild.id].doturn].name != defs.name) {
                message.channel.send(`It's not ${defs.name}'s turn!`);
                message.delete()
                return
            }
        }

        if (defs) {
            var charDefs = defs
			var charName = charDefs.name

			var allySide = btl[message.guild.id].allies.members
			var opposingSide = btl[message.guild.id].enemies.members
			if (charFuncs.isOpposingSide(charDefs, btl[message.guild.id])) {
				allySide = btl[message.guild.id].enemies.members
				opposingSide = btl[message.guild.id].allies.members
			}

            if (!message.member.permissions.serialize().ADMINISTRATOR) {
                if (message.author.id != charDefs.owner) {
                    message.channel.send("You can't control someone else's character!")
					message.delete()
                    return false
                }
            }

            var skillName = arg[3]
            var skillDefs = skillFile[skillName]
			
			if (!charFuncs.knowsSkill(charDefs, skillName)) {
				message.channel.send(`${charName} doesn't know this skill!`)
				message.delete()
				return false
			}
			
			if (skillDefs.type == "passive" || skillDefs.passive) {
				message.channel.send("You can't use a passive skill!")
				message.delete()
				return false
			}
			
			if (skillDefs.type == "heal" && charDefs.status === "ego") {
				message.channel.send("You can't heal while afflicted with Ego!")
				message.delete()
				return false
			}
			
			// Copy Skill
			if (skillDefs.copyskill) {
				var possibleSkills = []
				for (const val in allySide) {
					if (allySide[val].id != charDefs.id) {
						for (const i in allySide[val].skills) {
							var skillDefs = skillFile[allySide[val].skills[i]]
							if (skillDefs.type != "heal" && skillDefs.type != "status" && skillDefs.type != "passive") {
								possibleSkills.push(allySide[val].skills[i])
							}
						}
					}
				}
				
				if (possibleSkills.length > 0) {
					var skillVal = possibleSkills[Math.round(Math.random() * (possibleSkills.length-1))]
					
					skillDefs = skillFile[skillVal]
					if (!skillDefs.name) {skillDefs.name = `${skillVal}`}
					
					console.log(`Chosen skill ${skillVal} of ${possibleSkills.length-1} skills`)

					skillDefs.name += ` (${skillName})`
					skillName = skillVal
				} else {
					message.channel.send("This skill will fail! Don't use it.")
					message.delete()
					return false
				}
			}
			
			// Metronome
			if (skillDefs.metronome) {
				var possibleSkills = []
				for (const val in skillFile) {
					if (skillFile[val].type != "heal" && (skillFile[val].type != "status" && !skillFile[val].buff) && skillFile[val].type != "passive" && val != "Metronome") {
						possibleSkills.push(val)
					}
				}

				var skillVal = possibleSkills[Math.round(Math.random() * (possibleSkills.length-1))]
				skillDefs = skillFile[skillVal]

				console.log(`Metronome: Chosen skill ${skillVal} of ${possibleSkills.length-1} skills`)
				if (!skillDefs.name) {
					skillDefs.name = `${skillVal} (skillName)`
				} else {
					skillDefs.name += ` (${skillName})`
				}
				
				skillName = skillVal
			}
			
			// NeedLessThan
			if (skillDefs.needlessthan) {
				switch(skillDefs.costtype) {
					case "mp":
						if (charDefs.mp > skillDefs.needlessthan) {
							message.channel.send(`This move will fail, don't use it! (${charDefs.mp}MP > ${skillDefs.needlessthan}MP)`)
							message.delete()
							return
						}
						
						break

					case "mppercent":
						if (charDefs.mp > (charDefs.maxmp/100)*skillDefs.needlessthan) {
							message.channel.send(`This move will fail, don't use it! (${charDefs.mp}MP > ${(charDefs.maxmp/100)*skillDefs.needlessthan}MP)`)
							message.delete()
							return
						}
						
						break

					case "hppercent":
						if (charDefs.hp > (charDefs.maxhp/100)*skillDefs.needlessthan) {
							message.channel.send(`This move will fail, don't use it! (${charDefs.hp}HP > ${(charDefs.maxhp/100)*skillDefs.needlessthan}HP)`)
							message.delete()
							return
						}
						
						break

					default:
						if (charDefs.hp > skillDefs.needlessthan) {
							message.channel.send(`This move will fail, don't use it! (${charDefs.hp}HP > ${skillDefs.needlessthan}HP)`)
							message.delete()
							return
						}
				}
			}
			
			var DiscordEmbed;

			btl[message.guild.id].canshowtime = false

            // Heal Skills target allies
            if (skillDefs.type == "heal") {
				var healQuote = ""
				if (charDefs.healquote && charDefs.healquote.length > 0) {
					var possibleQuote = Math.round(Math.random() * (charDefs.healquote.length-1))
					healQuote = `*${charDefs.name}: "${charDefs.healquote[possibleQuote]}"*\n`
				}
				
				var healedQuote = ""

				var affinityMessage = ``;
                if (skillDefs.healall || skillDefs.target && skillDefs.target === "allallies") {
					if (healQuote.includes('%ALLY%'))
						healQuote = healQuote.replace('%ALLY%', 'Allies')

                    if (skillDefs.fullheal) {
                        for (const i in allySide) {
                            var partyDef = allySide[i]
                            if (partyDef.hp > 0) {
                                partyDef.hp = partyDef.maxhp
							
								affinityMessage += turnFuncs.healPassives(partyDef)
							
								if (partyDef.helpedquote && partyDef.helpedquote.length > 0) {
									var possibleQuote = Math.round(Math.random() * (partyDef.helpedquote.length-1))
									var theQuote = `\n*${partyDef.name}: "${partyDef.helpedquote[possibleQuote]}"*`

									if (theQuote.includes('%ALLY%'))
										theQuote = theQuote.replace('%ALLY%', charName)

									healedQuote += theQuote
								}
								
								charFuncs.trustUp(partyDef, charDefs, 5, message.guild.id)
                            }
                        }

                        DiscordEmbed = new Discord.MessageEmbed()
                            .setColor('#e36b2b')
							.setTitle(`${charName} => Party`)
							.setDescription(`${healQuote}${charName} used ${skillName}!\nThe Party's HP was fully restored.${healedQuote} ${affinityMessage}`)
                            .setFooter(`${charName}'s turn`);
                    } else if (skillDefs.statusheal) {
                        for (const i in allySide) {
                            var partyDef = allySide[i]
                            if (partyDef.hp > 0) {
                                partyDef.status = "none";
                                partyDef.statusturns = 0;
							
								affinityMessage += turnFuncs.healPassives(partyDef)
							
								if (partyDef.helpedquote && partyDef.helpedquote.length > 0) {
									var possibleQuote = Math.round(Math.random() * (partyDef.helpedquote.length-1))
									var theQuote = `\n*${partyDef.name}: "${partyDef.helpedquote[possibleQuote]}"*`

									if (theQuote.includes('%ALLY%'))
										theQuote = theQuote.replace('%ALLY%', charName)

									healedQuote += theQuote
								}
								
								charFuncs.trustUp(partyDef, charDefs, 5, message.guild.id)
                            }
                        }

						DiscordEmbed = new Discord.MessageEmbed()
                            .setColor('#e36b2b')
							.setTitle(`${charName} => Party`)
							.setDescription(`${healQuote}${charName} used ${skillName}!\nThe Party was cured of their status ailments.${healedQuote} ${affinityMessage}`)
                            .setFooter(`${charName}'s turn`);
                    } else if (skillDefs.healmp) {
                        var txt = ``
                        for (const i in allySide) {
                            var partyDef = allySide[i]								

							var heal = skillDefs.pow
							
							// Trust Level 10+ will have 10% increased healing.
							if (!btl[message.guild.id].pvp) {
								if (charDefs.id != partyDef.id && charDefs.trust[partyDef.truename] && charDefs.trust[partyDef.truename].level >= 10) {
									heal *= 1.1
								}
							}

							// Magic Buffs incease/decrease healing.
							if (charDefs.buffs.mag) {
								var aff = 1+parseFloat(charDefs.buffs.mag/10)
								heal *= aff
							}

                            partyDef.mp = Math.round(Math.min(partyDef.maxmp, partyDef.mp + heal))
                            txt += `\n${partyDef.name}'s MP was restored by ${Math.round(heal)}. (${partyDef.mp}/${partyDef.maxmp}MP)`
							
							txt += turnFuncs.healPassives(partyDef)
							
							if (partyDef.helpedquote && partyDef.helpedquote.length > 0) {
								var possibleQuote = Math.round(Math.random() * (partyDef.helpedquote.length-1))
								var theQuote = `\n*${partyDef.name}: "${partyDef.helpedquote[possibleQuote]}"*`

								if (theQuote.includes('%ALLY%'))
									theQuote = theQuote.replace('%ALLY%', charName)
								
								txt += theQuote
							}
							
							charFuncs.trustUp(partyDef, charDefs, 5, message.guild.id)
                        }

						DiscordEmbed = new Discord.MessageEmbed()
                            .setColor('#e36b2b')
							.setTitle(`${charName} => Party`)
							.setDescription(`${healQuote}${charName} used ${skillName}!\nThe Party's MP was restored by ${skillDefs.pow}!\n${txt}`)
                            .setFooter(`${charName}'s turn`);
                    } else {
                        var txt = ``;
                        for (const i in allySide) {
                            var partyDef = allySide[i]
                            if (partyDef.hp > 0) {
								// Trust Level 10+ will have 10% increased healing.
								var heal = skillDefs.pow
								if (!btl[message.guild.id].pvp) {
									if (charDefs.id != partyDef.id && charDefs.trust[partyDef.truename] && charDefs.trust[partyDef.truename].level >= 10) {
										heal *= 1.1
									}
								}

								// Magic Buffs incease/decrease healing.
								if (charDefs.buffs.mag) {
									var aff = 1+parseFloat(charDefs.buffs.mag/10)
									heal *= aff
								}
		
								partyDef.hp = Math.round(Math.min(partyDef.maxhp, partyDef.hp + heal))
								
                                txt += `\n${partyDef.name}'s HP was restored by ${Math.round(heal)}. (${partyDef.hp}/${partyDef.maxhp}HP)`							
								txt += turnFuncs.healPassives(partyDef)
							
								if (partyDef.helpedquote && partyDef.helpedquote.length > 0) {
									var possibleQuote = Math.round(Math.random() * (partyDef.helpedquote.length-1))
									var theQuote = `\n*${partyDef.name}: "${partyDef.helpedquote[possibleQuote]}"*`

									if (theQuote.includes('%ALLY%'))
										theQuote = theQuote.replace('%ALLY%', charName)

									txt += theQuote
								}
								
								charFuncs.trustUp(partyDef, charDefs, 5, message.guild.id)
                            }
                        }

                        DiscordEmbed = new Discord.MessageEmbed()
                            .setColor('#e36b2b')
							.setTitle(`${charName} => Party`)
							.setDescription(`${healQuote}${charName} used ${skillName}!\nThe Party's HP!\n${txt}`)
                            .setFooter(`${charName}'s turn`);
                    }
                } else {
//					var closerQuote = ''

					var charDefs2 = charDefs
					var charName2 = charName
                    if (skillDefs.target != 'caster') {
						if (allySide[arg[2]]) {
							charDefs2 = allySide[arg[2]]
							charName2 = allySide[arg[2]].name
						} else {
							message.channel.send(`${arg[2]} is a nonexistant battler number.`)
							message.delete()
							return
						}
					}

					if (healQuote.includes('%ALLY%'))
						healQuote = healQuote.replace('%ALLY%', charName)

					if (skillDefs.revive) {
						if (charDefs2.hp > 0) {
							message.channel.send(`You can't revive an alive character!`)
							message.delete()
							return
						}

						charDefs2.hp = Math.floor(charDefs2.maxhp / skillDefs.revive)
						
						if (charDefs2.helpedquote && charDefs2.helpedquote.length > 0) {
							var possibleQuote = Math.round(Math.random() * (charDefs2.helpedquote.length-1))
							var theQuote = `\n*${charDefs2.name}: "${charDefs2.helpedquote[possibleQuote]}"*`

							if (theQuote.includes('%ALLY%'))
								theQuote = theQuote.replace('%ALLY%', charName)

							healedQuote += theQuote
						}

						// Trust Levels
						charFuncs.trustUp(charDefs2, charDefs, 20, message.guild.id)

						DiscordEmbed = new Discord.MessageEmbed()
							.setColor('#e36b2b')
							.setTitle(`${charName} => ${charName2}`)
							.setDescription(`${healQuote}${charName} used ${skillName}!\n${charName2} was revived by ${charName}!${healedQuote}`)
							.setFooter(`${charName}'s turn`);
					} else if (skillDefs.fullheal) {
						if (charDefs2.hp < 0) {
							message.channel.send(`You can't heal a dead character!`)
							message.delete()
							return
						}

						charDefs2.hp = charDefs2.maxhp
						var passives = turnFuncs.healPassives(charDefs2)
						
						if (charDefs2.helpedquote && charDefs2.helpedquote.length > 0) {
							var possibleQuote = Math.round(Math.random() * (charDefs2.helpedquote.length-1))
							var theQuote = `\n*${charDefs2.name}: "${charDefs2.helpedquote[possibleQuote]}"*`

							if (theQuote.includes('%ALLY%'))
								theQuote = theQuote.replace('%ALLY%', charName)

							healedQuote += theQuote
						}

						// Trust Levels
						charFuncs.trustUp(charDefs2, charDefs, 15, message.guild.id)

						DiscordEmbed = new Discord.MessageEmbed()
							.setColor('#e36b2b')
							.setTitle(`${charName} => ${charName2}`)
							.setDescription(`${healQuote}${charName} used ${skillName}!\n${charName2}'s HP was fully restored!\n${passives}${healedQuote}`)
							.setFooter(`${charName}'s turn`);
					} else if (skillDefs.statusheal) {
						if (charDefs2.hp < 0) {
							message.channel.send(`You can't cure a dead character!`)
							message.delete()
							return
						}

						charDefs2.status = "none";
						charDefs2.statusturns = 0;
						var passives = turnFuncs.healPassives(charDefs2)
						
						if (charDefs2.helpedquote && charDefs2.helpedquote.length > 0) {
							var possibleQuote = Math.round(Math.random() * (charDefs2.helpedquote.length-1))
							var theQuote = `\n*${charDefs2.name}: "${charDefs2.helpedquote[possibleQuote]}"*`

							if (theQuote.includes('%ALLY%'))
								theQuote = theQuote.replace('%ALLY%', charName)

							healedQuote += theQuote
						}

						// Trust Levels
						charFuncs.trustUp(charDefs2, charDefs, 15, message.guild.id)

						DiscordEmbed = new Discord.MessageEmbed()
							.setColor('#e36b2b')
							.setTitle(`${charName} => ${charName2}`)
							.setDescription(`${healQuote}${charName} used ${skillName}!\n${charName2} was cured of their status!\n${passives}${healedQuote}`)
							.setFooter(`${charName}'s turn`);
					} else if (skillDefs.healmp) {
						// Trust Level 10+ will have 10% increased healing.
						var heal = skillDefs.pow
						if (!btl[message.guild.id].pvp) {
							if (charDefs.id != charDefs2.id && charDefs.trust[charDefs2.truename] && charDefs.trust[charDefs2.truename].level >= 10) {
								heal *= 1.1
							}
						}

						// Magic Buffs incease/decrease healing.
						if (charDefs.buffs.mag) {
							var aff = 1+parseFloat(charDefs.buffs.mag/10)
							heal *= aff
						}

						charDefs2.mp = Math.min(charDefs2.maxmp, charDefs2.mp + Math.round(heal))
						var passives = turnFuncs.healPassives(charDefs2)
						
						if (charDefs2.helpedquote && charDefs2.helpedquote.length > 0) {
							var possibleQuote = Math.round(Math.random() * (charDefs2.helpedquote.length-1))
							var theQuote = `\n*${charDefs2.name}: "${charDefs2.helpedquote[possibleQuote]}"*`

							if (theQuote.includes('%ALLY%'))
								theQuote = theQuote.replace('%ALLY%', charName)

							healedQuote += theQuote
						}

						// Trust Levels
						charFuncs.trustUp(charDefs2, charDefs, 15)

						DiscordEmbed = new Discord.MessageEmbed()
							.setColor('#e36b2b')
							.setTitle(`${charName} => ${charName2}`)
							.setDescription(`${healQuote}${charName} used ${skillName}!\n${charName2}'s MP was restored by ${Math.round(heal)}! ${passives}${healedQuote}`)
							.setFooter(`${charName}'s turn`);
					} else if (skillDefs.mptohp) {
						charDefs2.hp = Math.min(charDefs2.maxhp, charDefs2.hp + charDefs.mp)
						charDefs2.mp = 0

						var passives = turnFuncs.healPassives(charDefs2)
						
						if (charDefs2.helpedquote && charDefs2.helpedquote.length > 0) {
							var possibleQuote = Math.round(Math.random() * (charDefs2.helpedquote.length-1))
							var theQuote = `\n*${charDefs2.name}: "${charDefs2.helpedquote[possibleQuote]}"*`

							if (theQuote.includes('%ALLY%'))
								theQuote = theQuote.replace('%ALLY%', charName)

							healedQuote += theQuote
						}

						// Trust Levels
						charFuncs.trustUp(charDefs2, charDefs, 15)

						DiscordEmbed = new Discord.MessageEmbed()
							.setColor('#e36b2b')
							.setTitle(`${charName} => ${charName2}`)
							.setDescription(`${healQuote}${charName} used ${skillName}!\n${charName2}'s remaining MP was converted into HP. ${passives}${healedQuote}`)
							.setFooter(`${charName}'s turn`);
					} else {
						if (charDefs2.hp <= 0) {
							message.channel.send(`You can't heal a dead character!`)
							message.delete()
							return
						}

						// Trust Level 10+ will have 10% increased healing.
						var heal = skillDefs.pow
						if (!btl[message.guild.id].pvp) {
							if (charDefs.id != charDefs2.id && charDefs.trust[charDefs2.truename] && charDefs.trust[charDefs2.truename].level >= 10) {
								heal *= 1.1
							}
						}

						// Magic Buffs incease/decrease healing.
						if (charDefs.buffs.mag) {
							var aff = 1+parseFloat(charDefs.buffs.mag/10)
							heal *= aff
						}

						charDefs2.hp = Math.min(charDefs2.maxhp, charDefs2.hp + Math.round(heal))
						var passivesMsg = turnFuncs.healPassives(charDefs2)
						
						if (charDefs2.helpedquote && charDefs2.helpedquote.length > 0) {
							var possibleQuote = Math.round(Math.random() * (charDefs2.helpedquote.length-1))
							var theQuote = `\n*${charDefs2.name}: "${charDefs2.helpedquote[possibleQuote]}"*`

							if (theQuote.includes('%ALLY%'))
								theQuote = theQuote.replace('%ALLY%', charName)

							healedQuote += theQuote
						}

						// Trust Levels
						charFuncs.trustUp(charDefs2, charDefs, 15, message.guild.id)

						DiscordEmbed = new Discord.MessageEmbed()
							.setColor('#e36b2b')
							.setTitle(`${charName} => ${charName2}`)
							.setDescription(`${charName} used ${skillName}!\n${charName2}'s HP was restored by ${Math.round(heal)}! ${passivesMsg}${healedQuote}`)
							.setFooter(`${charName}'s turn`);
					}
                }
				
				if (skillDefs.pow && turnFuncs.limitBreaks(message.guild.id)) {
					charDefs.lb += Math.max(0, Math.floor(skillDefs.pow/10))
				}
            } else if (skillDefs.type === "status") {
                if (skillDefs.analyse) {
                    if (opposingSide[parseInt(arg[2])]) {
                        var enmStats = opposingSide[parseInt(arg[2])]
                        const enmName = enmStats.name
						
						if (readEnm(enmName)) {
							const enmDefs = readEnm(enmName)
							DiscordEmbed = new Discord.MessageEmbed()
								.setColor('#e36b2b')
								.addFields(
									{ name: `${charName} => ${enmName}`, value: `${charName} used ${skillName}!`, inline: false },
									{ name: `${enmName} was analysed!`, value: `${enmDefs.hp} Max HP\n${enmDefs.atk} Strength\n${enmDefs.mag} Magic\n${enmDefs.prc} Perception\n${enmDefs.end} Endurance\n${enmDefs.chr} Charisma\n${enmDefs.int} Intelligence\n${enmDefs.agl} Agility\n${enmDefs.luk} Luck\n*"${enmDefs.journal}"*`, inline: false },
								)
								.setFooter(`${charName}'s turn`);
						} else {
							DiscordEmbed = new Discord.MessageEmbed()
								.setColor('#e36b2b')
								.addFields(
									{ name: `${charName} => ${enmName}`, value: `${charName} used ${skillName}!`, inline: false },
									{ name: `${enmName} was analysed!`, value: `${enmStats.maxhp} Max HP\n${enmStats.atk} Strength\n${enmStats.mag} Magic\n${enmStats.prc} Perception\n${enmStats.end} Endurance\n${enmStats.chr} Charisma\n${enmStats.int} Intelligence\n${enmStats.agl} Agility\n${enmStats.luk} Luck\n*"${enmDefs.bio.info}"*`, inline: false },
								)
								.setFooter(`${charName}'s turn`);
						}
                    } else {
                        message.channel.send("This enemy isn't in battle!")
                    }
                } else if (skillDefs.shield || skillDefs.makarakarn || skillDefs.tetrakarn || skillDefs.trap) {
					var healedQuote = ""

					var effect = 'shield'
					if (skillDefs.makarakarn)
						effect = 'makarakarn';
					else if (skillDefs.tetrakarn)
						effect = 'tetrakarn';
					else if (skillDefs.trap)
						effect = 'trap';

					if (skillDefs.target === "caster" || !arg[2]) {
                        charDefs[effect] = skillName

						if (effect === 'trap') {
							delete charDefs[effect]
							charDefs.trapType = {
								name: skillName,
								effect: skillDefs.effect
							}
						}

                        DiscordEmbed = new Discord.MessageEmbed()
                            .setColor('#e36b2b')
							.setTitle(`${charName} => Self`)
							.setDescription(`${charName} used ${skillName}!\n${charName} was protected by ${skillName}.`)
                            .setFooter(`${charName}'s turn`);
					} else {
						if (skillDefs.target == 'allallies') {
							for (const i in allySide) {
								allySide[i][effect] = skillName
								if (effect === 'trap') {
									delete allySide[i][effect]
									allySide[i].trapType = {
										name: skillName,
										effect: skillDefs.effect
									}
								}

								var charName2 = allySide[i].name
									
								if (allySide[i].helpedquote && allySide[i].helpedquote.length > 0) {
									var possibleQuote = Math.round(Math.random() * (allySide[i].helpedquote.length-1))
									var theQuote = `\n*${charName2}: "${allySide[i].helpedquote[possibleQuote]}"*`

									if (theQuote.includes('%ALLY%'))
										theQuote = theQuote.replace('%ALLY%', charName)

									healedQuote += theQuote
								}

								charFuncs.trustUp(allySide[i], charDefs, 5, message.guild.id)
							}

							DiscordEmbed = new Discord.MessageEmbed()
								.setColor('#e36b2b')
								.setTitle(`${charName} => Allies`)
								.setDescription(`${charName} used ${skillName}!\nTheir allies were protected by ${skillName}.\n${healedQuote}`)
								.setFooter(`${charName}'s turn`);
						} else if (allySide[arg[2]]) {
							allySide[arg[2]][effect] = skillName
							if (effect === 'trap') {
								delete allySide[arg[2]][effect]
								allySide[arg[2]].trapType = {
									name: skillName,
									effect: skillDefs.effect
								}
							}

							var charName2 = allySide[arg[2]].name
							if (allySide[arg[2]].helpedquote && allySide[arg[2]].helpedquote.length > 0) {
								var possibleQuote = Math.round(Math.random() * (allySide[arg[2]].helpedquote.length-1))
								var theQuote = `\n*${charName2}: "${allySide[arg[2]].helpedquote[possibleQuote]}"*`

								if (theQuote.includes('%ALLY%'))
									theQuote = theQuote.replace('%ALLY%', charName)

								healedQuote += theQuote
							}

							charFuncs.trustUp(allySide[arg[2]], charDefs, 15, message.guild.id)

							DiscordEmbed = new Discord.MessageEmbed()
								.setColor('#e36b2b')
								.setTitle(`${charName} => ${charName2}`)
								.setDescription(`${charName} used ${skillName}!\n${charName2} was protected by ${skillName}.${healedQuote}`)
								.setFooter(`${charName}'s turn`);
						} else {
							message.channel.send("Invalid Ally Position")
							message.delete()
							return false
						}
					}
				} else if (skillDefs.orgiamode) {
					charDefs.orgiaMode = skillDefs.orgiamode
					charDefs.atk *= 2
					charDefs.mag *= 2
					charDefs.end /= 2

					DiscordEmbed = new Discord.MessageEmbed()
						.setColor('#e36b2b')
						.setTitle(`${charName} => Self`)
						.setDescription(`${charName} used ${skillName}!\n${charName}'s ATK and MAG stats are doubled, but their END stat is halved.!`)
                } else if (skillDefs.status && skillDefs.statuschance) {
                    var enmDefs = opposingSide[parseInt(arg[2])]
                    if (skillDefs.statuschance > 0 || enmDefs.status === "none") {
                        var targ = (skillDefs.statuschance + (charDefs.chr - enmDefs.luk)) / 100;
                        var chance = Math.random();

						const movestatus = skillDefs.status

                        var finaltext = `${charName} used ${skillName} on ${enmDefs.name}!\n`;
                        if (chance <= targ || skillDefs.statuschance >= 100)
                            finaltext += attackFuncs.inflictStatus(enmDefs, skillDefs);
							if (charDefs.critquote && charDefs.critquote.length > 0) {
								var possibleQuote = utilityFuncs.randInt(charDefs.critquote.length-1)
								var critQuote = `\n*${charName}: "${charDefs.critquote[possibleQuote]}"*`
								
								var possibleAlly = utilityFuncs.randInt(allySide.length-1)
								if (allySide[possibleAlly] && critQuote.includes('%ALLY%'))
									critQuote.replace('%ALLY%', allySide[possibleAlly].name);
								
								finaltext += critQuote
							}
							if (enmDefs.hitquote && enmDefs.hitquote.length > 0) {
								var possibleQuote = utilityFuncs.randInt(enmDefs.hitquote.length-1)
								finaltext += `\n*${enmName}: "${enmDefs.hitquote[possibleQuote]}"*`
							}
                        else {
                            finaltext += " But they dodged it!"

							if (charDefs.missquote && charDefs.missquote.length > 0) {
								var possibleQuote = Math.round(Math.random() * (charDefs.missquote.length-1))
								finaltext += `\n*${charName}: "${charDefs.missquote[possibleQuote]}"*`
							}
							if (enmDefs.dodgequote && enmDefs.dodgequote.length > 0) {
								var possibleQuote = Math.round(Math.random() * (enmDefs.dodgequote.length-1))
								finaltext += `\n*${enmName}: "${enmDefs.dodgequote[possibleQuote]}"*`
							}
						}

                        DiscordEmbed = new Discord.MessageEmbed()
                            .setColor('#e36b2b')
                            .setTitle(`${charName} => ${enmName}`)
							.setDescription(`${finaltext}`)
                            .setFooter(`${charName}'s turn`);
                    } else {
                        message.channel.send("This move will fail, don't use it!")
						message.delete()
						return false
					}
				} else if (skillDefs.buff) {
					if (skillDefs.target == "allallies") {
						for (const i in allySide) {
							var charDefs2 = allySide[i]
							if (skillDefs.buff == "all") {
								charDefs2.buffs.atk = Math.min(3, charDefs2.buffs.atk+1)
								charDefs2.buffs.mag = Math.min(3, charDefs2.buffs.mag+1)
								charDefs2.buffs.end = Math.min(3, charDefs2.buffs.end+1)
								charDefs2.buffs.prc = Math.min(3, charDefs2.buffs.prc+1)
								charDefs2.buffs.agl = Math.min(3, charDefs2.buffs.agl+1)
							} else {
								charDefs2.buffs[skillDefs.buff] = Math.min(3, charDefs2.buffs[skillDefs.buff]+1)
							}
						}
			
						DiscordEmbed = new Discord.MessageEmbed()
							.setColor('#e36b2b')
							.setTitle(`${charName} => All Allies`)
							.setDescription(`${charName} buffed their allies' ${(skillDefs.buff == "all") ? "Stats" : skillDefs.buff.toUpperCase()}!`)
							.setFooter(`${charName}'s turn`);
					} else {
						var charDefs2 = allySide[arg[2]]
						if (skillDefs.buff == "all") {
							charDefs2.buffs.atk = Math.min(3, charDefs2.buffs.atk+1)
							charDefs2.buffs.mag = Math.min(3, charDefs2.buffs.mag+1)
							charDefs2.buffs.end = Math.min(3, charDefs2.buffs.end+1)
							charDefs2.buffs.prc = Math.min(3, charDefs2.buffs.prc+1)
							charDefs2.buffs.agl = Math.min(3, charDefs2.buffs.agl+1)
						} else {
							charDefs2.buffs[skillDefs.buff] = Math.min(3, charDefs2.buffs[skillDefs.buff]+1)
						}
			
						DiscordEmbed = new Discord.MessageEmbed()
							.setColor('#e36b2b')
							.setTitle(`${charName} => ${charDefs2.name}`)
							.setDescription(`${charName} buffed ${charDefs2.name}'s ${(skillDefs.buff == "all") ? "Stats" : skillDefs.buff.toUpperCase()}!`)
							.setFooter(`${charName}'s turn`);
					}
				} else if (skillDefs.debuff) {
					if (skillDefs.target == "allopposing") {
						for (const i in opposingSide) {
							var charDefs2 = opposingSide[i]
							if (skillDefs.debuff == "all") {
								charFuncs.buffStat(charDefs2, 'atk', -1)
								charFuncs.buffStat(charDefs2, 'mag', -1)
								charFuncs.buffStat(charDefs2, 'end', -1)
								charFuncs.buffStat(charDefs2, 'agl', -1)
								charFuncs.buffStat(charDefs2, 'prc', -1)
							} else
								charFuncs.buffStat(charDefs2, skillDefs.debuff, -1);
						}
			
						DiscordEmbed = new Discord.MessageEmbed()
							.setColor('#e36b2b')
							.setTitle(`${charName} => All Opposing`)
							.setDescription(`${charName} debuffed the opposing side's ${(skillDefs.debuff == "all") ? "Stats" : skillDefs.debuff.toUpperCase()}!`)
							.setFooter(`${charName}'s turn`);
					} else {
						var charDefs2 = opposingSide[arg[2]]
						if (skillDefs.debuff == "all") {
							charDefs2.buffs.atk = Math.max(-3, charDefs2.buffs.atk-1)
							charDefs2.buffs.mag = Math.max(-3, charDefs2.buffs.mag-1)
							charDefs2.buffs.end = Math.max(-3, charDefs2.buffs.end-1)
							charDefs2.buffs.prc = Math.max(-3, charDefs2.buffs.prc-1)
							charDefs2.buffs.agl = Math.max(-3, charDefs2.buffs.agl-1)
						} else
							charDefs2.buffs[skillDefs.debuff] = Math.max(3, charDefs2.buffs[skillDefs.debuff]-1);
			
						DiscordEmbed = new Discord.MessageEmbed()
							.setColor('#e36b2b')
							.setTitle(`${charName} => ${charDefs2.name}`)
							.setDescription(`${charName} debuffed ${charDefs2.name}'s ${(skillDefs.debuff == "all") ? "Stats" : skillDefs.debuff.toUpperCase()}!`)
							.setFooter(`${charName}'s turn`);
					}
				} else if (skillDefs.mimic) {
					if (charDefs.transformation){
						message.channel.send("This skill will fail! Don't use it! (Unable to mimic during transformation)")
						message.delete()
						return false
					}

					if (arg[4]) {
						var copyDefs
						if (arg[4].toLowerCase() == "ally" || arg[4].toLowerCase() == "allies" || arg[4].toLowerCase() == "friends")
							copyDefs = allySide[arg[2]];
						else
							copyDefs = opposingSide[arg[2]];

						if (!copyDefs) {
							message.channel.send("Invalid Mimic Target.")
							message.delete()
							return false
						}
						
						if (charDefs.id == copyDefs.id) {
							message.channel.send("You can't transform into yourself!")
							message.delete()
							return false
						}
						
						if (copyDefs.hp <= 0) {
							message.channel.send("You can't transform into downed allies!")
							message.delete()
							return false
						}
						
						if (copyDefs.boss) {
							message.channel.send("You can't mimic a boss!")
							message.delete()
							return false
						}

						DiscordEmbed = new Discord.MessageEmbed()
							.setColor('#e36b2b')
							.setTitle(`${charName} => ${copyDefs.name}`)
							.setDescription(`${charName} transformed into ${copyDefs.name}!`)

						charDefs.oldDefs = utilityFuncs.cloneObj(charDefs)
						charFuncs.mimic(charDefs, copyDefs, 2)

						if (skillDefs.mimic.returnskill)
							charDefs.skills.push(skillDefs.mimic.returnskill);
					} else {
						message.channel.send("A fourth argument is required for this skill!!! (ally/foe)")
						message.delete()
						return false
					}
				} else if (skillDefs.unmimic) {
					if (charDefs.mimic) {
						charFuncs.resetMimic(charDefs)

						DiscordEmbed = new Discord.MessageEmbed()
							.setColor('#e36b2b')
							.setTitle(`${charName} => Self`)
							.setDescription(`${charName} is no-longer mimicking their target.`)
					} else {
						message.channel.send("This character isn't mimicking anything.")
						message.delete()
						return false
					}
				} else if (skillDefs.futuresight) {
					var oppDefs = opposingSide[arg[2]]
					
					if (oppDefs) {
						oppDefs.futureSightSkill = skillDefs.futuresight
						oppDefs.futureSightSkill.user = charDefs

						DiscordEmbed = new Discord.MessageEmbed()
							.setColor('#e36b2b')
							.setTitle(`${charName} => ${oppDefs.name}`)
							.setDescription(`${charName} used ${skillDefs.name}!\n${oppDefs.name} is going to be affected by ${charName}'s future attack.`)
					} else {
						message.channel.send("Invalid enemy.")
						message.delete()
						return false
					}
				} else if (skillDefs.clone) {
					var cloneDefs = utilityFuncs.cloneObj(charDefs)
					cloneDefs.hp = 100
					cloneDefs.maxhp = 100
					cloneDefs.mp = 80
					cloneDefs.maxmp = 80
					cloneDefs.npc = true
					
					for (const i in cloneDefs.skills) {
						if (cloneDefs.skills[i] === arg[3].toLowerCase())
							cloneDefs.skills.splice(i)
					}

					var battlerID = 1
					for (const i in allySide) {
						battlerID++;
					}
					for (const i in opposingSide) {
						battlerID++;
					}

					cloneDefs.id = battlerID
					cloneDefs.clone = true
					delete cloneDefs.xp
					delete cloneDefs.maxxp
					delete cloneDefs.owner
					delete cloneDefs.lb
					delete cloneDefs.lb1
					delete cloneDefs.lb2
					delete cloneDefs.lb3
					delete cloneDefs.lb4
					
					allySide.push(cloneDefs)
					DiscordEmbed = new Discord.MessageEmbed()
						.setColor('#e36b2b')
						.setTitle(`${charName} => Self`)
						.setDescription(`${charName} used ${skillDefs.name}!\n${charName} cloned themselves!`)
				} else if (skillDefs.heartswap) {
					var oppDefs = opposingSide[arg[2]]
					
					const stats = ["atkbuff", "magbuff", "endbuff", "prcbuff", "aglbuff"]
					for (const i in stats) {
						var stat1 = charDefs[stats[i]]
						var stat2 = oppDefs[stats[i]]

						charDefs[stats[i]] = stat2
						oppDefs[stats[i]] = stat1
					}
					
					DiscordEmbed = new Discord.MessageEmbed()
						.setColor('#e36b2b')
						.setTitle(`${charName} => ${oppDefs.name}`)
						.setDescription(`${charName} used ${skillDefs.name}!\n${charName} swapped stat buffs with ${oppDefs.name}!`)
				} else if (skillDefs.weather) {
					var weatherMessage = {
						rain: 'It begun to rain!',
						thunder: 'Thunder begun, coming out of nowhere!',
						sunlight: 'The sun shone brightly.',
						windy: 'It just got very windy!',
						sandstorm: 'A sandstorm is brimming.',
						hail: 'Hail begins falling.'
					}

					if (weatherMessage[skillDefs.weather]) {
						btl[message.guild.id].weather = skillDefs.weather

						DiscordEmbed = new Discord.MessageEmbed()
							.setColor('#e36b2b')
							.setTitle(`${charName} => Battlefield`)
							.setDescription(`${charName} used ${skillName}!\n${weatherMessage[skillDefs.weather]}`)
					} else {
						return message.channel.send("This move will fail! Don't use it!")
					}
				} else if (skillDefs.terrain) {
					btl[message.guild.id].terrain = skillDefs.terrain

					DiscordEmbed = new Discord.MessageEmbed()
						.setColor('#e36b2b')
						.setTitle(`${charName} => Battlefield`)
						.setDescription(`${charName} used ${skillName}!\n*${skillDefs.terrain.toUpperCase()}* terrain has begun!`)
                } else {
                    message.channel.send(`This doesn't work yet!`)
					message.delete()
                    return false
                }
            } else {
				var server = message.guild.id

				/*
				for (const i in allySide) {
					if (allySide[i].trust[charName] && allySide[i].trust[charName].level >= 2 && Math.Random() < 0.2) {
						message.channel.send(`${charName} wants to show off for ${allySide[i].name}!`);
						skillDefs.pow *= 1.1
					}
				}
				*/

				DiscordEmbed = attackFuncs.attackWithSkill(charDefs, arg[2], allySide, opposingSide, btl, skillDefs, server)
			}
			
			// Leader Skill
			var skillCost = skillDefs.cost ? skillDefs.cost : 0;
			console.log(`used ${skillCost}${skillDefs.costtype}`);

			for (const i in allySide) {
				if (allySide[i].leader) {
					if (allySide[i].leaderSkill && allySide[i].leaderSkill.type === "discount") {
						if (allySide[i].leaderSkill.target === skillDefs.type ||
							allySide[i].leaderSkill.target === "all" ||
							allySide[i].leaderSkill.target === "magic" && skillDefs.atktype === "magic" ||
							allySide[i].leaderSkill.target === "physical" && skillDefs.atktype === "physical") {
								var skillDeduct = Math.round((skillCost/100)*allySide[i].leaderSkill.percent)
								console.log(`take away ${allySide[i].leaderSkill.percent}% - ${skillDeduct}`)

								skillCost -= skillDeduct
								console.log(`leaderskill reduced to ${skillCost}${skillDefs.costtype}`)
						}
					}
				}
			}

			// Can use skill?
			console.log(`${skillCost}${skillDefs.costtype}`)

			if (skillCost > 0) {
				if (skillDefs.costtype && skillDefs.costtype === "hp") {
					if (charDefs.hp <= skillCost) {
						return message.channel.send(`Not enough HP! (Need ${skillCost}HP)`)
					} else if (!charDefs.boss) {
						charDefs.hp -= skillCost
					}
				} else if (skillDefs.costtype && skillDefs.costtype === "hppercent") {
					if (charDefs.hp <= ((charDefs.maxhp/100)*skillCost)) {
						return message.channel.send(`Not enough HP! (Need ${Math.round((charDefs.maxhp / 100) * skillCost)}HP)`)
					} else if (!charDefs.boss) {
						charDefs.hp -= ((charDefs.maxhp / 100) * skillCost)
					}
				} else if (skillDefs.costtype && skillDefs.costtype === "mppercent") {
					if (charDefs.mp < ((charDefs.maxmp / 100)*skillCost)) {
						return message.channel.send(`Not enough MP! (Need ${Math.round((charDefs.maxmp / 100) * skillCost)}MP)`)
					} else {
						charDefs.mp -= ((charDefs.maxmp / 100) * skillCost)
					}
				} else {
					if (charDefs.mp < skillCost) {
						return message.channel.send(`Not enough MP! (Need ${skillCost}MP)`)
					} else {
						charDefs.mp -= skillCost
					}
				}
			}
			
			if (charDefs.hp < 1)
				charDefs.hp = 1

			charDefs.hp = Math.round(charDefs.hp)
			charDefs.mp = Math.round(charDefs.mp)
			
			if (DiscordEmbed)
				message.channel.send({embeds: [DiscordEmbed]});
			else
				return message.channel.send('Something went wrong, so I stopped your movement. Try something else.');
			
			// Pets
			if (charDefs.pet && charDefs.pet != null && charFile[charDefs.pet]) {
				var targChance = 0.1
				if (charFile[charDefs.pet].trust[charName] && charFile[charDefs.pet].trust[charName].level >= 45)
					targChance = 1;
				else if (charFile[charDefs.pet].trust[charName] && charFile[charDefs.pet].trust[charName].level >= 20)
					targChance = 0.7;
				else if (charFile[charDefs.pet].trust[charName] && charFile[charDefs.pet].trust[charName].level >= 10)
					targChance = 0.3;
				
				var randChance = Math.random()
				
				console.log(`PetAttack: ${randChance} < ${targChance}?`)
				
				if (randChance <= targChance) {
					var possibleSkills = [];
					for (const i in charFile[charDefs.pet].skills) {
						var skillDefs = skillFile[charFile[charDefs.pet].skills[i]]
						
						if (skillDefs && !skillDefs.passive && skillDefs.type != "passive" && skillDefs.target === "one")
							possibleSkills.push(charFile[charDefs.pet].skills[i]);
					}
					
					var skillDefs
					if (possibleSkills.length <= 0) {
						skillDefs = {
							name: charFile[charDefs.pet].melee[0],
							type: charFile[charDefs.pet].melee[1],
							pow: 30,
							crit: 10,
							acc: 90
						}
					} else
						skillDefs = skillFile[possibleSkills[Math.round(Math.random() * (possibleSkills.length-1))]];

					var targNum = Math.round(Math.random() * (opposingSide.length-1))	
					if (opposingSide[targNum]) {
						while (opposingSide[targNum].hp <= 0)
							targNum = Math.round(Math.random() * (opposingSide.length-1));
					}

					var attackerDefs = charFuncs.genChar(charFile[charDefs.pet])
					
					var DiscordEmbed = attackFuncs.attackWithSkill(attackerDefs, targNum, allySide, opposingSide, btl, skillDefs, message.guild.id)
					DiscordEmbed.setFooter(`${charDefs.name}'s pet`)
					
//					charFuncs.trustUp(charDefs, attackerDefs, 5, message.guild.id)
					message.channel.send({embeds: [DiscordEmbed]})
				}
			}
				
			
			fs.writeFileSync(dataPath+'/battle.json', JSON.stringify(btl, null, '    '));
            
            if (btl[message.guild.id].battling == true) {
                setTimeout(function() {
                    advanceTurn(btl, message.guild.id)
					
					setTimeout(function() {
						message.delete();
					}, 500)
                }, 1500)
            }
        } else {
            message.channel.send(`There's been an issue finding your character!`);
            return
        }
    }

    if (command === 'useitem') {
        const btl = readBattle(message.guild.id);
        const arg = message.content.slice(prefix.length).trim().split(/ +/);

        if (btl[message.guild.id].battling == false) {
            message.channel.send(`You can't use an item out of battle, as that's not coded in yet.`);
            return
        }

        var itemPath = dataPath+'/items.json'
        var itemRead = fs.readFileSync(itemPath);
        var itemFile = JSON.parse(itemRead);

        if (!itemFile[arg[2]]) {
            message.channel.send(`**${arg[2]}** isn't a valid item.`);
            message.delete()
            return
        }

		var defs
		const tempTurnOrder = getTurnOrder(btl[message.guild.id])
		if (btl[message.guild.id].allies.members[arg[1]]
			&& !btl[message.guild.id].allies.members[arg[1]].enemy
			&& (btl[message.guild.id].allies.members[arg[1]].owner == message.author.id || message.member.permissions.serialize().ADMINISTRATOR)
			&& tempTurnOrder[btl[message.guild.id].doturn].id == btl[message.guild.id].allies.members[arg[1]].id) {
				console.log("Found Character. (On ally side)")
				defs = btl[message.guild.id].allies.members[arg[1]]
		}
		if (btl[message.guild.id].enemies.members[arg[1]] 
			&& !btl[message.guild.id].enemies.members[arg[1]].enemy 
			&& (btl[message.guild.id].enemies.members[arg[1]].owner == message.author.id || message.member.permissions.serialize().ADMINISTRATOR)
			&& tempTurnOrder[btl[message.guild.id].doturn].id == btl[message.guild.id].enemies.members[arg[1]].id) {
				console.log("Found Character. (On enemy side)")
				defs = btl[message.guild.id].enemies.members[arg[1]]
		}
		
		if (!defs) {
			message.channel.send("Invalid Position: Either you don't own this character or this character does not exist.")
			message.delete()
			return false
		}

        if (btl[message.guild.id].battling == true) {
            if (tempTurnOrder[btl[message.guild.id].doturn].name != defs.name) {
                message.channel.send(`It's not ${defs.name}'s turn!`);
                message.delete()
                return
            }
        }

        if (defs) {
            var charDefs = defs
			var charName = charDefs.name
			
			var allySide = btl[message.guild.id].allies.members
			var opposingSide = btl[message.guild.id].enemies.members
			if (charFuncs.isOpposingSide(charDefs, btl[message.guild.id])) {
				allySide = btl[message.guild.id].enemies.members
				opposingSide = btl[message.guild.id].allies.members
			}
			
			charFighters = allySide

            if (!message.member.permissions.serialize().ADMINISTRATOR) {
                if (message.author.id != charDefs.owner) {
                    message.channel.send("You can't control someone else's character!");
                    message.delete();
                    return false
                }
            }

            const itemName = arg[2]
            const itemDefs = itemFile[itemName]

            var party = []
			if (charFuncs.isOpposingSide(charDefs, btl[message.guild.id])) {
				party = btl[message.guild.id].parties[btl[message.guild.id].battleteam2]
			} else {
				party = btl[message.guild.id].parties[btl[message.guild.id].battleteam]
			}
			
			btl[message.guild.id].canshowtime = false

            if (itemDefs.type === "weapon") {
				if (!charDefs.weapon) {
					charDefs.weapon = "none"
				}

				if (charDefs.weapon == itemName) {				
					charDefs.weapon = "none"

					const DiscordEmbed = new Discord.MessageEmbed()
						.setColor('#fcba03')
						.addFields(
							{ name: `${charName} => Self`, value: `${charName} unequipped the **${itemName}** and put it in the bag.`, inline: false },
						)
						.setFooter(`${charName}'s turn`);
					message.channel.send({embeds: [DiscordEmbed]});
					
					party.items[arg[2]]++
				} else {
					if (!party.items[itemName] || party.items[itemName] <= 0) {
						message.channel.send("You don't have any of this item!");
						message.delete();
						return false
					}
				
					charDefs.weapon = itemName

					var weaponInfo = ``
					if (itemDefs.atk) {
						weaponInfo = weaponInfo + `\n*ATK: ${charDefs.atk}**+${itemDefs.atk}***`
					}
					if (itemDefs.mag) {
						weaponInfo = weaponInfo + `\n*MAG: ${charDefs.mag}**+${itemDefs.mag}***`
					}
					if (itemDefs.def) {
						weaponInfo = weaponInfo + `\n*END: ${charDefs.end}**+${itemDefs.def}***`
					}

					const DiscordEmbed = new Discord.MessageEmbed()
						.setColor('#fcba03')
						.addFields(
							{ name: `${charName} => Self`, value: `${charName} equipped the **${itemName}**!\n${weaponInfo}`, inline: false },
						)
						.setFooter(`${charName}'s turn`);
					message.channel.send({embeds: [DiscordEmbed]});
					
					party.items[arg[2]]--
				}
            } else if (itemDefs.type === "heal") {
				if (!party.items[itemName] || party.items[itemName] <= 0) {
					message.channel.send("You don't have any of this item!");
					message.delete();
					return false
				}

                var charDefs2 = charFighters[arg[3]]

                if (charFighters[arg[3]]) {
                    if (charDefs2.hp <= 0) {
                        message.channel.send(`${charDefs2.name} is defeated! You cannot heal defeated characters!`)
                        message.delete()
                        return false
                    }
                } else {
                    message.channel.send(`${arg[3] ? arg[3] : "<Undefined>"} is not a valid character position.`)
                    message.delete()
                    return false
                }

                charDefs2.hp = Math.min(charDefs2.maxhp, charDefs2.hp + (itemDefs.heal ? itemDefs.heal : 50))
				charFuncs.trustUp(charDefs2, charDefs, 20, message.guild.id)

                const DiscordEmbed = new Discord.MessageEmbed()
                    .setColor('#fcba03')
                    .addFields(
                        { name: `${charName} => ${charDefs2.name}`, value: `${charName} used the *${itemName}* on **${charDefs2.name}**!`, inline: false },
                        { name: `${charDefs2.name}'s HP was restored by ${itemDefs.heal ? itemDefs.heal : 50}!`, value: `${charDefs2.name}'s HP: ${charDefs2.hp}/${charDefs2.maxhp}`, inline: false },
                    )
                    .setFooter(`${charName}'s turn`);
                message.channel.send({embeds: [DiscordEmbed]});
				
				party.items[arg[2]]--
            } else if (itemDefs.type === "healmp") {
                var charDefs2 = charFighters[arg[3]]

                if (charFighters[arg[3]]) {
                    if (charDefs2.hp <= 0) {
                        message.channel.send(`${charDefs2.name} is defeated! You cannot heal defeated characters!`)
                        message.delete()
                        return false
                    }
                } else {
                    message.channel.send(`${arg[3] ? arg[3] : "<Undefined>"} is not a valid character position.`)
                    message.delete()
                    return false
                }

                charDefs2.mp = Math.min(charDefs2.maxmp, charDefs2.mp + (itemDefs.heal ? itemDefs.heal : 50))
				charFuncs.trustUp(charDefs2, charDefs, 20, message.guild.id)

                const DiscordEmbed = new Discord.MessageEmbed()
                    .setColor('#fcba03')
                    .addFields(
                        { name: `${charName} => ${charDefs2.name}`, value: `${charName} used the *${itemName}* on **${charDefs2.name}**!`, inline: false },
                        { name: `${charDefs2.name}'s MP was restored by ${itemDefs.heal ? itemDefs.heal : 50}!`, value: `${charDefs2.name}'s MP: ${charDefs2.mp}/${charDefs2.maxmp}`, inline: false },
                    )
                    .setFooter(`${charName}'s turn`);
                message.channel.send({embeds: [DiscordEmbed]});
				
				party.items[arg[2]]--
            } else if (itemDefs.type === "healhpmp") {
                var charDefs2 = charFighters[arg[3]]

                if (charFighters[arg[3]]) {
                    if (charDefs2.hp <= 0) {
                        message.channel.send(`${charDefs2.name} is defeated! You cannot heal defeated characters!`)
                        message.delete()
                        return false
                    }
                } else {
                    message.channel.send(`${arg[3] ? arg[3] : "<Undefined>"} is not a valid character position.`)
                    message.delete()
                    return false
                }

                charDefs2.hp = Math.min(charDefs2.maxhp, charDefs2.hp + (itemDefs.healhp ? itemDefs.healhp : 50))
                charDefs2.mp = Math.min(charDefs2.maxmp, charDefs2.mp + (itemDefs.healmp ? itemDefs.healmp : 35))
				charFuncs.trustUp(charDefs2, charDefs, 20, message.guild.id)

                const DiscordEmbed = new Discord.MessageEmbed()
                    .setColor('#fcba03')
                    .addFields(
                        { name: `${charName} => ${charDefs2.name}`, value: `${charName} used the *${itemName}* on **${charDefs2.name}**!`, inline: false },
                        { name: `${charDefs2.name}'s HP was restored by ${itemDefs.healhp ? itemDefs.healhp : 50}, and MP by ${itemDefs.healmp ? itemDefs.healmp : 35}!`, value: `${charDefs2.name}'s HP: ${charDefs2.hp}/${charDefs2.maxhp}\n${arg[3]}'s MP: ${charDefs2.mp}/${charDefs2.maxmp}`, inline: false },
                    )
                    .setFooter(`${charName}'s turn`);
                message.channel.send({embeds: [DiscordEmbed]});
				
				party.items[arg[2]]--
            } else if (itemDefs.type === "revive") {
                var charDefs2 = charFighters[arg[3]]

                if (charFighters[arg[3]]) {
                    if (charDefs2.hp > 0) {
                        message.channel.send(`${charDefs2.name} is alive, so you cannot use this item on them.`)
                        message.delete()
                        return false
                    }
                } else {
                    message.channel.send(`${arg[3] ? arg[3] : "<Undefined>"} is not a valid character position.`)
                    message.delete()
                    return false
                }

                charDefs2.hp = Math.round(charDefs2.maxhp/itemDefs.revive)
				charFuncs.trustUp(charDefs2, charDefs, 20, message.guild.id)

                const DiscordEmbed = new Discord.MessageEmbed()
                    .setColor('#fcba03')
                    .setTitle(`${charName} => ${charDefs2.name}`)
					.setDescription(`${charName} used the *${itemName}* on **${charDefs2.name}**!\n${charDefs2.name} was revived!`)
                    .setFooter(`${charName}'s turn`);
                message.channel.send({embeds: [DiscordEmbed]});
				
				party.items[arg[2]]--
            }

            fs.writeFileSync(dataPath+'/battle.json', JSON.stringify(btl, null, '    '));

            if (btl[message.guild.id].battling == true) {
                setTimeout(function() {
                    advanceTurn(btl, message.guild.id)
					
					setTimeout(function() {
						message.delete();
					}, 500)
                }, 1500)
            }
        } else {
            message.channel.send("Inputs are either an invalid character or invalid item.")
        }
    }

    if (command === 'guard') {
        const btl = readBattle(message.guild.id);
        var arg = message.content.slice(prefix.length).trim().split(/ +/);

        if (btl[message.guild.id].battling == false) {
            message.channel.send(`You can't cast a move out of battle!`);
            return
        }
		
		if (arg[1] == null) {
			arg[1] = btl[message.guild.id].doturn
		}

		var defs
		const tempTurnOrder = getTurnOrder(btl[message.guild.id])
		if (btl[message.guild.id].allies.members[arg[1]]
			&& !btl[message.guild.id].allies.members[arg[1]].enemy
			&& (btl[message.guild.id].allies.members[arg[1]].owner == message.author.id || message.member.permissions.serialize().ADMINISTRATOR)
			&& tempTurnOrder[btl[message.guild.id].doturn].id == btl[message.guild.id].allies.members[arg[1]].id) {
				console.log("Found Character. (On ally side)")
				defs = btl[message.guild.id].allies.members[arg[1]]
		}
		if (btl[message.guild.id].enemies.members[arg[1]] 
			&& !btl[message.guild.id].enemies.members[arg[1]].enemy 
			&& (btl[message.guild.id].enemies.members[arg[1]].owner == message.author.id || message.member.permissions.serialize().ADMINISTRATOR)
			&& tempTurnOrder[btl[message.guild.id].doturn].id == btl[message.guild.id].enemies.members[arg[1]].id) {
				console.log("Found Character. (On enemy side)")
				defs = btl[message.guild.id].enemies.members[arg[1]]
		}
		
		if (!defs) {
			message.channel.send("Invalid Position: Either you don't own this character or this character does not exist.")
			message.delete()
			return false
		}

        if (btl[message.guild.id].battling == true) {
            if (tempTurnOrder[btl[message.guild.id].doturn].name != defs.name) {
                message.channel.send(`It's not ${defs.name}'s turn!`);
                message.delete()
                return
            }
        }

        if (defs) {
            var charDefs = defs
			var charName = charDefs.name
		
			var allySide = btl[message.guild.id].allies.members
			var opposingSide = btl[message.guild.id].enemies.members
			if (charFuncs.isOpposingSide(charDefs, btl[message.guild.id])) {
				allySide = btl[message.guild.id].enemies.members
				opposingSide = btl[message.guild.id].allies.members
			}

            if (!message.member.permissions.serialize().ADMINISTRATOR) {
                if (message.author.id != charDefs.owner) {
                    message.channel.send("You can't control someone else's character!");
                    message.delete();
                    return false
                }
            }

			btl[message.guild.id].canshowtime = false

            // Guard.
            charDefs.guard = true;

            const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#fcba03')
                .setTitle(`${charName} => Self`)
				.setDescription(`${charName} guards!\n*(Damage dealt to ${charName} is halved until hit, or it is ${charName}'s turn again.)*`)
                .setFooter(`${charName}'s turn`);
            message.channel.send({embeds: [DiscordEmbed]});

            // Guarding gives 20% LB
            charDefs.lb = charDefs.lb + 20

            if (btl[message.guild.id].battling == true) {
                setTimeout(function() {
                    advanceTurn(btl, message.guild.id)
					
					setTimeout(function() {
						message.delete();
					}, 500)
                }, 1500)
            }

            fs.writeFileSync(dataPath+'/battle.json', JSON.stringify(btl, null, '    '));
        }
    }

    if (command === 'tactics') {
        const btl = readBattle(message.guild.id);
        const arg = message.content.slice(prefix.length).trim().split(/ +/);

        if (btl[message.guild.id].battling == false) {
            message.channel.send("You can't use tactics out of battle!");
            return
        }

        var itemPath = dataPath+'/items.json'
        var itemRead = fs.readFileSync(itemPath);
        var itemFile = JSON.parse(itemRead);

		var defs
		const tempTurnOrder = getTurnOrder(btl[message.guild.id])
		if (btl[message.guild.id].allies.members[arg[1]]
			&& !btl[message.guild.id].allies.members[arg[1]].enemy
			&& (btl[message.guild.id].allies.members[arg[1]].owner == message.author.id || message.member.permissions.serialize().ADMINISTRATOR)
			&& tempTurnOrder[btl[message.guild.id].doturn].id == btl[message.guild.id].allies.members[arg[1]].id) {
				console.log("Found Character. (On ally side)")
				defs = btl[message.guild.id].allies.members[arg[1]]
		}
		if (btl[message.guild.id].enemies.members[arg[1]] 
			&& !btl[message.guild.id].enemies.members[arg[1]].enemy 
			&& (btl[message.guild.id].enemies.members[arg[1]].owner == message.author.id || message.member.permissions.serialize().ADMINISTRATOR)
			&& tempTurnOrder[btl[message.guild.id].doturn].id == btl[message.guild.id].enemies.members[arg[1]].id) {
				console.log("Found Character. (On enemy side)")
				defs = btl[message.guild.id].enemies.members[arg[1]]
		}
		
		if (!defs) {
			message.channel.send("Invalid Position: Either you don't own this character or this character does not exist.")
			message.delete()
			return false
		}

        if (btl[message.guild.id].battling == true) {
            if (tempTurnOrder[btl[message.guild.id].doturn].name != defs.name) {
                message.channel.send(`It's not ${defs.name}'s turn!`);
                message.delete()
                return
            }
        }

        if (defs) {
            var charDefs = defs
			var charName = charDefs.name

			var allyDefs = btl[message.guild.id].allies
			var oppDefs = btl[message.guild.id].enemies
			if (charFuncs.isOpposingSide(charDefs, btl[message.guild.id])) {
				allyDefs = btl[message.guild.id].enemies
				oppDefs = btl[message.guild.id].allies
			}

			var allySide = allyDefs.members
			var opposingSide = oppDefs.members

			if (arg[2]) {
				var inputVal = arg[2].toLowerCase();
				var DiscordEmbed = {};

				switch(inputVal) {
					case 'run':
						var avgSpd = 0
						for (const i in opposingSide) {
							if (opposingSide[i].hp > 0)
								avgSpd += opposingSide[i].agl;
							
							if (btl[message.guild.id].pvp)
								return message.channel.send('You cannot run in PVP!');
							
							if (opposingSide[i].miniboss || opposingSide[i].boss || opposingSide[i].finalboss || opposingSide[i].dietyboss)
								return message.channel.send("You can't run from bosses!");
						}
						avgSpd /= opposingSide.length

						if (attackFuncs.missCheck(charDefs.agl, avgSpd, 90)) {
							message.channel.send('You got away!')
							runFromBattle(btl, message.guild.id)
							return
						} else {
							message.channel.send("You couldn't get away...")

							setTimeout(function() {
								advanceTurn(btl, message.guild.id)
								
								setTimeout(function() {
									message.delete();
								}, 500)
							}, 1500)
						}
						break

					case 'convince':
					case 'spare':
					case 'mercy':
					case 'negotiate':
						if (btl[message.guild.id].pvp)
							return message.channel.send('You cannot negotiate in PVP!');

						if (!opposingSide[arg[3]])
							return message.channel.send(`${arg[3]} is an invalid position.`);

						if (!opposingSide[arg[3]].enemy)
							return message.channel.send('You must negotiate with an enemy, not a player!');

						var oppDefs = opposingSide[arg[3]]
						if (!oppDefs.negotiatePercent)
							oppDefs.negotiatePercent = 0
						else {
							if (oppDefs.negotiatePercent >= 100) {
								oppDefs.negotiated = true
								DiscordEmbed = new Discord.MessageEmbed()
									.setColor('#fcba03')
									.setTitle(`${charName} => ${oppDefs.name}`)
									.setDescription(`${oppDefs.name} is spared!`)
									.addFields()

								fs.writeFileSync(dataPath+'/battle.json', JSON.stringify(btl, null, '    '));
								message.channel.send({embeds: [DiscordEmbed]})

								setTimeout(function() {
									advanceTurn(btl, message.guild.id)

									setTimeout(function() {
										message.delete();
									}, 500)
								}, 1500)
								
								return
							}
						}

						if (!oppDefs.negotiateOptions)
							return message.channel.send("You can't think of anything to calm this enemy with.")
						
						DiscordEmbed = new Discord.MessageEmbed()
							.setColor('#fcba03')
							.setTitle(`${charName} => ${oppDefs.name}`)
							.setDescription(`Negotiate with ${oppDefs.name} to calm it down. So far, it is ***${oppDefs.negotiatePercent}%* pacified**. Input a number from 0-${oppDefs.negotiateOptions.length-1}`)
							.addFields()

						for (const i in oppDefs.negotiateOptions)
							DiscordEmbed.fields.push({name: `${i}: ${oppDefs.negotiateOptions[i].name}`, value: oppDefs.negotiateOptions[i].desc, inline: true});

						// Await a responce
						message.channel.send({embeds: [DiscordEmbed]})

						var givenResponce = false
						var collector = message.channel.createMessageCollector({ time: 15000 });
						collector.on('collect', m => {
							if (m.author.id == message.author.id && oppDefs.negotiateOptions[parseInt(m.content)]) {
								doNegotiation(charDefs, oppDefs, parseInt(m.content), m.channel, btl)
								fs.writeFileSync(dataPath+'/battle.json', JSON.stringify(btl, null, '    '));

								setTimeout(function() {
									advanceTurn(btl, message.guild.id)

									setTimeout(function() {
										message.delete();
										m.delete();
									}, 500)
								}, 1500)

								givenResponce = true
								collector.stop()
							}
						});
						collector.on('end', c => {
							if (givenResponce == false) {
								message.channel.send('No response given.')
								sendTurnBrief(btl, message.channel)
							}
						})

						break
						
					case 'backup':
						if (btl[message.guild.id].pvp)
							return message.channel.send('You cannot switch party members in PVP!');
						
						if (!charDefs.leader)
							return message.channel.send("You can't do this while you're not the leader.");

						if (!allyDefs.backup || allyDefs.backup.length < 0)
							return message.channel.send("There's nobody in backup!");
						
						if (!allySide[parseInt(arg[3])])
							return message.channel.send('This is an invalid character to replace!')
						
						var switchDefs = allySide[parseInt(arg[3])]
						
						if (charDefs.id == switchDefs.id)
							return message.channel.send('You cannot switch out yourself!')

						if (switchDefs.hp <= 0)
							return message.channel.send("You can't switch out downed allies!")
						
						if (switchDefs.orgiaMode)
							return message.channel.send("This character is in the middle of their Orgia Mode!")

						DiscordEmbed = new Discord.MessageEmbed()
							.setColor('#fcba03')
							.setTitle(`${charName} => Party`)
							.setDescription("Switch out teammates who seem like they're about to faint.")
							.addFields()

						for (const i in allyDefs.backup) {
							var backDefs = allyDefs.backup[i]
							DiscordEmbed.fields.push({name: `${i}: ${backDefs.name}`, value: `${backDefs.hp}/${backDefs.maxhp}HP\n${backDefs.mp}/${backDefs.maxmp}MP`, inline: true});
						}

						// Await a responce
						message.channel.send({embeds: [DiscordEmbed]})

						var givenResponce = false
						var collector = message.channel.createMessageCollector({ time: 15000 });
						collector.on('collect', m => {
							if (m.author.id == message.author.id) {
								if (allyDefs.backup[parseInt(m.content)]) {
									if (allyDefs.backup[parseInt(m.content)].hp <= 0) {
										message.channel.send("You can't switch in downed allies!");
										message.delete()
										m.delete()
									} else {
										charFuncs.resetMimic(allySide[parseInt(arg[3])])
										
										delete allySide[parseInt(arg[3])].trap
										delete allySide[parseInt(arg[3])].trapType
										delete allySide[parseInt(arg[3])].shield
										
										for (const i in allySide[parseInt(arg[3])].buffs)
											allySide[parseInt(arg[3])].buffs[i] = 0;

										var curDefs = utilityFuncs.cloneObj(allySide[parseInt(arg[3])])
										var newDefs = utilityFuncs.cloneObj(allyDefs.backup[parseInt(m.content)])

										newDefs.id = curDefs.id

										allySide[parseInt(arg[3])] = utilityFuncs.cloneObj(newDefs)
										allyDefs.backup[parseInt(m.content)] = utilityFuncs.cloneObj(curDefs)
										
										DiscordEmbed = new Discord.MessageEmbed()
											.setColor('#fcba03')
											.setTitle(`${charName} => ${curDefs.name}, ${newDefs.name}`)
											.setDescription(`${charName} decides to switch out ${curDefs.name} for ${newDefs.name}\nTry your best, ${newDefs.name}!`)
										message.channel.send({embeds: [DiscordEmbed]})

										fs.writeFileSync(dataPath+'/battle.json', JSON.stringify(btl, null, '    '));

										setTimeout(function() {
											advanceTurn(btl, message.guild.id)

											setTimeout(function() {
												message.delete();
												m.delete();
											}, 500)
										}, 1500)
									}
								} else {
									message.channel.send('This is an invalid character.')
									message.delete()
									m.delete()
								}

								givenResponce = true
								collector.stop()
							}
						});
						collector.on('end', c => {
							if (givenResponce == false) {
								message.channel.send('No response given.')
								sendTurnBrief(btl, message.channel)
							}
						})

						break						
					
					default:
						return message.channel.send("That's an invalid tactic!")
				}
			
				fs.writeFileSync(dataPath+'/battle.json', JSON.stringify(btl, null, '    '));
			}
		}
	}

    if (command === 'limitbreak' || command === 'uselimitbreak' || command === 'lb') {
        const btl = readBattle(message.guild.id);
        const arg = message.content.slice(prefix.length).trim().split(/ +/);

        if (btl[message.guild.id].battling == false) {
            message.channel.send("You can't use a Limit Break Skill out of battle!");
            return
        }

		if (!turnFuncs.limitBreaks(message.guild.id)) {
            message.channel.send(`${message.guild.name} does not have Limit Break Skills enabled.`);
            return
        }

        var itemPath = dataPath+'/items.json'
        var itemRead = fs.readFileSync(itemPath);
        var itemFile = JSON.parse(itemRead);

		var defs
		const tempTurnOrder = getTurnOrder(btl[message.guild.id])
		if (btl[message.guild.id].allies.members[arg[1]]
			&& !btl[message.guild.id].allies.members[arg[1]].enemy
			&& (btl[message.guild.id].allies.members[arg[1]].owner == message.author.id || message.member.permissions.serialize().ADMINISTRATOR)
			&& tempTurnOrder[btl[message.guild.id].doturn].id == btl[message.guild.id].allies.members[arg[1]].id) {
				console.log("Found Character. (On ally side)")
				defs = btl[message.guild.id].allies.members[arg[1]]
		}
		if (btl[message.guild.id].enemies.members[arg[1]] 
			&& !btl[message.guild.id].enemies.members[arg[1]].enemy 
			&& (btl[message.guild.id].enemies.members[arg[1]].owner == message.author.id || message.member.permissions.serialize().ADMINISTRATOR)
			&& tempTurnOrder[btl[message.guild.id].doturn].id == btl[message.guild.id].enemies.members[arg[1]].id) {
				console.log("Found Character. (On enemy side)")
				defs = btl[message.guild.id].enemies.members[arg[1]]
		}
		
		if (!defs) {
			message.channel.send("Invalid Position: Either you don't own this character or this character does not exist.")
			message.delete()
			return false
		}

        if (btl[message.guild.id].battling == true) {
            if (tempTurnOrder[btl[message.guild.id].doturn].name != defs.name) {
                message.channel.send(`It's not ${defs.name}'s turn!`);
                message.delete()
                return
            }
        }

        if (defs) {
            var charDefs = defs
			var charName = charDefs.name
		
			var allySide = btl[message.guild.id].allies.members
			var opposingSide = btl[message.guild.id].enemies.members
			if (charFuncs.isOpposingSide(charDefs, btl[message.guild.id])) {
				allySide = btl[message.guild.id].enemies.members
				opposingSide = btl[message.guild.id].allies.members
			}

            if (!message.member.permissions.serialize().ADMINISTRATOR) {
                if (message.author.id != charDefs.owner) {
                    message.channel.send("You can't control someone else's character!");
                    message.delete();
                    return false
                }
            }

			charFuncs.resetMimic(charDefs);

            if (!charDefs.weapon)
                charDefs.weapon = "none";

            const weaponDefs = itemFile[charDefs.weapon] ? itemFile[charDefs.weapon] : itemFile["none"]

            // Check LBs
            var lbSkill;
            if (charDefs.lb1) {
                if (charDefs.lb < charDefs.lb1.cost) {
                    message.channel.send(`${charName} doesn't have enough of their LB meter filled (${charDefs.lb}/{$charDefs.lb1[2]}`);
                    message.delete();
                    return false
                }

                for (i = 0; i <= 4; i++) {
                    if (charDefs["lb" + i]) {
                        if (charDefs["lb" + i].name && charDefs["lb" + i].name.toLowerCase() != "none" && charDefs.lb >= charDefs["lb" + i].cost) {
                            lbSkill = charDefs["lb" + i];
							lbSkill.level = i
                        }
                    }
                }
            } else {
                message.channel.send(`${charName} doesn't have any Limit Breaking capabilities.`)
                message.delete()
                return false
            }
			
			const skillDefs = {
				name: lbSkill.name,
				class: lbSkill.class ? lbSkill.class : "atk",
				level: lbSkill.level,
				pow: lbSkill.pow,
				acc: 9999,
				crit: 0,
				type: "almighty",
				status: lbSkill.status,
				statuschance: lbSkill.statuschance,
				atktype: "magic",
				target: lbSkill.target ? lbSkill.target : "one",
				hits: lbSkill.hits ? lbSkill.hits : null,
				drain: lbSkill.drain ? lbSkill.drain : null,
				affinitypow: lbSkill.affinitypow ? lbSkill.affinitypow : null,
				limitbreak: true
			};

			
			btl[message.guild.id].canshowtime = false

			// Limit Break Skills use the strongest attacking stat.
			if (charDefs.atk >= charDefs.mag)
				skillDefs.atktype = "physical";
			
			var preText = ""
			if (charDefs.lbquote && charDefs.lbquote.length > 0) {
				var possibleQuote = Math.round(Math.random() * (charDefs.lbquote.length-1))
				preText = `*${charDefs.name}: "${charDefs.lbquote[possibleQuote]}"*\n`
			}
			
			charDefs.lb -= lbSkill.cost
			
			// Use leftover LB%/2 to enhance power
			if (!lbSkill.hits || lbSkill.hits > 2)
				skillDefs.pow += Math.round(charDefs.lb/3);
			
			if (skillDefs.class && skillDefs.class === "heal") {
				var healTxt = ''
				for (const i in allySide) {
					if (skillDefs.level >= 3 && allySide[i].hp <= 0) {	
						allySide[i].hp = allySide[i].maxhp

						// heal MP
						var healmp = Math.round(skillDefs.pow/2)
						var mpToFull = allySide[i].maxmp-allySide[i].mp
						if (healmp > mpToFull) 
							healmp = mpToFull;
						
						allySide[i].mp += healmp
						allySide[i].status = "none"
						allySide[i].statusturns = 0
						
						healTxt += `${allySide[i].name} was revived. Their MP was restored by ${healmp}.`
					} else {
						if (allySide[i].hp > 0) {
							// heal HP
							var heal = skillDefs.pow
							var hpToFull = allySide[i].maxhp-allySide[i].hp
							if (heal > hpToFull) 
								heal = hpToFull;
							
							// heal MP
							var healmp = Math.round(skillDefs.pow/2)
							var mpToFull = allySide[i].maxmp-allySide[i].mp
							if (healmp > mpToFull) 
								healmp = mpToFull;
							
							allySide[i].hp += heal
							allySide[i].mp += healmp
							allySide[i].status = "none"
							allySide[i].statusturns = 0
							
							healTxt += `${allySide[i].name}'s HP was restored by ${heal}, and MP was restored by ${healmp}. Their status effects were also cured.`
						}
					}
					
					if (allySide[i].hp > 0)
						healTxt += turnFuncs.healPassives(allySide[i]);
		
					healTxt += '\n'
					
					if (allySide[i].healedquote && allySide[i].healedquote.length > 0) {
						var possibleQuote = Math.round(Math.random() * (allySide[i].healedquote.length-1))
						healTxt += `*${allySide[i].name}: "${allySide[i].healedquote[possibleQuote]}"*\n`
					}
				}

				const DiscordEmbed = new Discord.MessageEmbed()
					.setColor('#fcba03')
					.setTitle(`${charName} => All Allies`)
					.setDescription(`**LIMIT BREAK!!!**\n${preText}${charName} used ${skillDefs.name} to heal their allies!\n${healTxt}`)
					.setFooter(`${charName}'s turn`);
				message.channel.send({embeds: [DiscordEmbed]});
			} else {
	            if (opposingSide[parseInt(arg[2])]) {
					var enmDefs = opposingSide[parseInt(arg[2])]
					const enmName = enmDefs.name
					var embedText = attackFuncs.attackFoe(charName, enmName, charDefs, enmDefs, skillDefs, false, message.guild.id, btl)

					const DiscordEmbed = new Discord.MessageEmbed()
						.setColor('#fcba03')
						.setTitle(`${embedText.targetText}`)
						.setDescription(`**LIMIT BREAK!!!**\n${preText}${embedText.attackText}!\n${embedText.resultText}`)
						.setFooter(`${charName}'s turn`);
					message.channel.send({embeds: [DiscordEmbed]});
				} else {
					message.channel.send(`This enemy isn't in battle!`);
					message.delete();
					return
				}
            }

            // Use Up ALL the LB meter.
            charDefs.lb = 0

            if (btl[message.guild.id].battling == true) {
                setTimeout(function() {
                    advanceTurn(btl, message.guild.id)
					
					setTimeout(function() {
						message.delete();
					}, 500)
                }, 1500)
            }

            fs.writeFileSync(dataPath+'/battle.json', JSON.stringify(btl, null, '    '));
        } else {
            message.channel.send(`There's been an issue finding your character!`);
            return
        }
    }

    if (command === 'awardenemyxp') {
        const arg = message.content.slice(prefix.length).trim().split(/ +/);
        if (readChar(arg[1])) {
            const charName = arg[1]
            const charDefs = readChar(arg[1])
            if (!utilityFuncs.RPGBotAdmin(message.author.id)) {
                if (message.author.id != charDefs.owner) {
                    message.channel.send("You can't edit someone else's character!")
                    return false
                }
            }

            if (readEnm(arg[2])) {
                const enmDefs = readEnm(arg[2])
                giveXP(charName, parseInt(enmDefs.awardxp), message)
            } else {
                message.channel.send(`${arg[2]} isn't a valid enemy.`);
                return false
            }
        } else {
            message.channel.send(`${arg[1]} isn't a valid character.`);
            return
        }
    }

    if (command === 'endbattle') {
        var btl = readBattle(message.guild.id)
        if (btl[message.guild.id].battling == false) {
            message.channel.send(`There's no battle in progress right now.`);
            return
        }
        if (!message.member.permissions.serialize().ADMINISTRATOR) {
            message.channel.send("You have insufficient permissions to use this command.")
            return false
        }
		
		turnFuncs.clearBTL(btl[message.guild.id])

        fs.writeFileSync(dataPath+'/battle.json', JSON.stringify(btl, null, '    '));
        message.react('👍')
    }

    ///////////////////////////
    // Battle Themes Channel //
    ///////////////////////////
	if (command === 'battlethemechannel' || command === 'themechannel' || command === 'joinvc' || command === 'setvc') {
		const arg = message.content.slice(prefix.length).trim().split(/ +/);
		
		var channel;
		if (!arg[1]) {
			if (message.member.voice.channel) {
				await joinVc(message.member.voice.channel, message.channel)
				channel = message.member.voice.channel
			 } else {
				message.channel.send("Join a voice channel or specify it's ID please.")
				return false
			}
		} else {
			if (client.channels.cache.get(arg[1])) {
				await joinVc(client.channels.cache.get(arg[1]), message.channel)
				channel = client.channels.cache.get(arg[1])
			} else {
				message.channel.send("Invalid Channel.")
				return false
			}
		}
		
		const connection = Voice.joinVoiceChannel({
			channelId: channel.id,
			guildId: channel.guild.id,
			adapterCreator: channel.guild.voiceAdapterCreator,
			selfDeaf: false,
		});

		voiceChannelShit[message.guild.id] = {
			sendShit: message.channel,
			connection: connection,
			player: null,
			cursong: {
				name: '',
				url: ''
			},
			queue: []
		}

		message.react('👍')
	}

	if (command === 'playsong') {
		if (message.member.voice.channel)
			joinVc(message.member.voice.channel, message.channel)
		else
			return message.channel.send('Join a VC first!')

		const arg = message.content.slice(prefix.length).trim().split(/ +/);
		if (arg[1]) {
			if (!voiceChannelShit[message.guild.id].playing) {
				await playSong(message.guild.id, arg[1], message.author, true);
				message.reply('Playing song!');
			} else {
				addToQueue(message.guild.id, arg[1], message.author);
				message.reply('Added to song queue.');
			}
		} else {
			message.channel.send('Invalid Song.')
		}
	}

	if (command === 'loop') {
        if (!message.member.permissions.serialize().ADMINISTRATOR) {
            message.channel.send("You have insufficient permissions to use this command.")
            return false
        }

		if (!voiceChannelShit[message.guild.id])
			return message.channel.send("Join me to a VC first!")
		
		if (voiceChannelShit[message.guild.id].loop)
			voiceChannelShit[message.guild.id].loop = false;
		else
			voiceChannelShit[message.guild.id].loop = true;

		message.react('👍')
	}

	if (command === 'skip') {
        if (!message.member.permissions.serialize().ADMINISTRATOR)
            return message.channel.send("You have insufficient permissions to use this command.");

		if (!voiceChannelShit[message.guild.id])
			return message.channel.send("Join me to a VC first!");
		
		if (voiceChannelShit[message.guild.id].loop)
			delete voiceChannelShit[message.guild.id].loop;
		
		if (voiceChannelShit[message.guild.id].battlethemes)
			delete voiceChannelShit[message.guild.id].battlethemes;
		
		endSong(message.guild.id)
		message.react('👍')
	}

	if (command === 'disconnect' || command === 'exit' || command === 'leave' || command === 'fuckoff') {
        if (!message.member.permissions.serialize().ADMINISTRATOR) {
            message.channel.send("You have insufficient permissions to use this command.")
            return false
        }
		
		if (command === 'fuckoff')
			message.channel.send("<:cry:880846027677126686> I-I'm sorry if I dissapointed you...")
		
		forceStop(message.guild.id)
		leaveVC(message.guild.id)
		message.react('👍')
	}
	
	if (command === 'getqueue') {
		if (!voiceChannelShit[message.guild.id])
			return message.channel.send("Join me to a VC first!");
		
		if (!voiceChannelShit[message.guild.id].connection)
			message.channel.send("Join me to a VC first!")
		
		if (!voiceChannelShit[message.guild.id].queue || voiceChannelShit[message.guild.id].queue.length <= 0) {
			const DiscordEmbed = new Discord.MessageEmbed()
				.setTitle('Song Queue')
				.setDescription('No songs, why not add some?')
				
			message.channel.send({embeds: [DiscordEmbed]})
			return false
		}
		
		var queueText = ''
		for (const i in voiceChannelShit[message.guild.id].queue) {
			if (i <= 0)
				queueText += `**NEXT SONG**: ${voiceChannelShit[message.guild.id].queue[i].name} - ${voiceChannelShit[message.guild.id].queue[i].url}\n\n`;
			else
				queueText += `*${i}: ${voiceChannelShit[message.guild.id].queue[i].name} - ${voiceChannelShit[message.guild.id].queue[i].url}*\n`;
		}
		
		const DiscordEmbed = new Discord.MessageEmbed()
			.setTitle('Song Queue')
			.setDescription(queueText)
			
		message.channel.send({embeds: [DiscordEmbed]})
	}

	if (command === 'autothemes') {
        if (!message.member.permissions.serialize().ADMINISTRATOR) {
            message.channel.send("You lack sufficient permissions, I'm so sorry!");
            return
        }
		
		if (!voiceChannelShit[message.guild.id]) {
			if (message.member.voice.channel)
				await joinVc(message.member.voice.channel, message.channel)
			else
				return message.channel.send('Join a VC first!')
		}
		
		voiceChannelShit[message.guild.id].battlethemes = true
		message.react('👍')
	}

	if (command === 'setbattletheme' || command === 'settheme') {
        var servPath = dataPath+'/Server Settings/server.json'
        var servRead = fs.readFileSync(servPath);
        var servFile = JSON.parse(servRead);

        if (!servFile[message.guild.id]) {
            servFile[message.guild.id] = {
				prefix: "rpg!",
				limitbreaks: false,
				showtimes: false,
				onemores: false,
				currency: "Bloom Token",
				xprate: 1,
				damageFormula: "persona",
				pvpstuff: {
					none: {},
					metronome: {},
					randskills: {},
					randstats: {},
					charfuck: {}
				},
				themes: {
					battle: [],
					advantage: [],
					disadvantage: [],
					bossfight: [],
					miniboss: [],
					strongfoe: [],
					finalboss: [],
					colosseum: [],
					colosseumstrong: [],
					pvp: [],
					victory: [],
					colosseumvictory: [],
					loss: []
				},
				banned: []
			}
        }	

		if (!servFile[message.guild.id].themes) {
			servFile[message.guild.id].themes = {
				battle: [],
				advantage: [],
				disadvantage: [],
				bossfight: [],
				miniboss: [],
				strongfoe: [],
				finalboss: [],
				colosseum: [],
				colosseumstrong: [],
				pvp: [],
				victory: [],
				colosseumvictory: [],
				loss: []
			}
		}
		
		const arg = message.content.slice(prefix.length).trim().split(/ +/);
		
		if (servFile[message.guild.id].themes[arg[1].toLowerCase()]) {
			servFile[message.guild.id].themes[arg[1].toLowerCase()].push(arg[2]);
			message.react('👍')
			
			fs.writeFileSync(servPath, JSON.stringify(servFile, null, '    '));
		} else
			message.channel.send("Invalid Battle Theme Type");
	}

	if (command === 'getbattlethemes' || command === 'getthemes') {
        var servPath = dataPath+'/Server Settings/server.json'
        var servRead = fs.readFileSync(servPath);
        var servFile = JSON.parse(servRead);

        if (!servFile[message.guild.id]) {
            servFile[message.guild.id] = {
				prefix: "rpg!",
				limitbreaks: false,
				showtimes: false,
				onemores: false,
				currency: "Bloom Token",
				xprate: 1,
				damageFormula: "persona",
				pvpstuff: {
					none: {},
					metronome: {},
					randskills: {},
					randstats: {},
					charfuck: {}
				},
				themes: {
					battle: [],
					advantage: [],
					disadvantage: [],
					bossfight: [],
					miniboss: [],
					strongfoe: [],
					finalboss: [],
					colosseum: [],
					colosseumstrong: [],
					pvp: [],
					victory: [],
					colosseumvictory: [],
					loss: []
				},
				banned: []
			}
        }	

		if (!servFile[message.guild.id].themes) {
			servFile[message.guild.id].themes = {
				battle: [],
				advantage: [],
				disadvantage: [],
				bossfight: [],
				miniboss: [],
				strongfoe: [],
				finalboss: [],
				colosseum: [],
				colosseumstrong: [],
				pvp: [],
				victory: [],
				colosseumvictory: [],
				loss: []
			}
		}

		var DiscordEmbed = new Discord.MessageEmbed()
			.setColor('#e36b2b')
			.setTitle(`${message.guild.name}'s battle themes`)
			.setDescription('Here are the battle themes for this server. To have them play during battle, use rpg!joinvc and rpg!autothemes')
			.addFields()
			
		for (const i in servFile[message.guild.id].themes) {
			var songTxt = '';
			var themes = servFile[message.guild.id].themes[i];
			for (const k in themes)
				songTxt += `\n${themes[k]}`;
			
			if (songTxt === '')
				songTxt = 'No Themes, try suggesting some!';
			
			DiscordEmbed.fields.push({ name: i, value: songTxt, inline: true })
		}
		
		message.channel.send({embeds: [DiscordEmbed]})
	}

    /////////////////////////////////////////////
    // Moderation and Changes to Battle System //
    /////////////////////////////////////////////
    if (command === 'makeparty' || command === 'startparty') {
        if (!message.member.permissions.serialize().ADMINISTRATOR)
            return message.channel.send("You lack sufficient permissions, I'm so sorry!");

        const arg = message.content.slice(prefix.length).trim().split(/ +/);
        const btl = readBattle(message.guild.id);
        if (!btl[message.guild.id]) {
            btl[message.guild.id] = {
                battling: false,
                colosseum: [
                    false,
                    0,
                    "none"
                ],
                trials: {},
                parties: {},
				allies: {
					members: []
				},
                enemies: {
                    members: [],
                    items: {},
                    rings: 0
                },
                battleteam: "none",
                battleteam2: "none",
                battlechannel: "none",
                doturn: 0,
                turn: 0,
                turnorder: [],
				pvp: false,
				pvpmode: "none"
            }
        }

        btl[message.guild.id].parties[arg[1]] = {
            members: [],
            items: {},
            rings: 0
        }

        var i;
        for (i = 1; i < arg.length; i++) {
			if (readChar(arg[i]))
				btl[message.guild.id].parties[arg[1]].members.push(arg[i]);
			else
				return message.channel.send(`${arg[i]} is an invalid character.`);
        }

        message.channel.send(`Created Team ${arg[1]}! You can use them in Battle, PVP Matches and More, enjoy!`)
        fs.writeFileSync(dataPath+'/battle.json', JSON.stringify(btl, null, '    '));
    }

    if (command === 'addtoparty') {
        const arg = message.content.slice(prefix.length).trim().split(/ +/);
        const btl = readBattle(message.guild.id);

        if (!btl[message.guild.id]) {
            btl[message.guild.id] = {
                battling: false,
                colosseum: [
                    false,
                    0,
                    "none"
                ],
                trials: {},
                parties: {},
				allies: {
					members: []
				},
                enemies: {
                    members: [],
                    items: {},
                    rings: 0
                },
                battleteam: "none",
                battleteam2: "none",
                battlechannel: "none",
                doturn: 0,
                turn: 0,
                turnorder: [],
				pvp: false,
				pvpmode: "none"
            }
        }

        if (!btl[message.guild.id].parties[arg[1]])
			return message.channel.send("This is an invalid party!");

		var partyDefs = btl[message.guild.id].parties[arg[1]]
        if (!message.member.permissions.serialize().ADMINISTRATOR && partyDefs.members[0].owner != message.author.id)
            return message.channel.send("You lack sufficient permissions, I'm so sorry!");

		if (!readChar(arg[2]))
			return message.channel.send(`${arg[2]} is an invalid character.`);

		partyDefs.members.push(arg[2])

        message.channel.send(`Added ${arg[2]} to Team ${arg[1]}!`)
        fs.writeFileSync(dataPath+'/battle.json', JSON.stringify(btl, null, '    '));
    }

    if (command === 'kickfromparty') {
        const arg = message.content.slice(prefix.length).trim().split(/ +/);
        const btl = readBattle(message.guild.id);

        if (!btl[message.guild.id]) {
            btl[message.guild.id] = {
                battling: false,
                colosseum: [
                    false,
                    0,
                    "none"
                ],
                trials: {},
                parties: {},
				allies: {
					members: []
				},
                enemies: {
                    members: [],
                    items: {},
                    rings: 0
                },
                battleteam: "none",
                battleteam2: "none",
                battlechannel: "none",
                doturn: 0,
                turn: 0,
                turnorder: [],
				pvp: false,
				pvpmode: "none"
            }
        }

        if (!btl[message.guild.id].parties[arg[1]])
			return message.channel.send("This is an invalid party!");
		
		var partyDefs = btl[message.guild.id].parties[arg[1]]
        if (!message.member.permissions.serialize().ADMINISTRATOR && partyDefs.members[0].owner != message.author.id)
            return message.channel.send("You lack sufficient permissions, I'm so sorry!");

		if (!readChar(arg[2]))
			message.channel.send(`${arg[2]} is an invalid character.`);

		for (const i in partyDefs.members) {
			var charName = partyDefs.members[i]
		
			if (charName === arg[2]) {
				partyDefs.members.splice(i, 1)
				break
			}
		}
			
        message.channel.send(`Removed ${arg[2]} from party ${arg[1]}.`)
        fs.writeFileSync(dataPath+'/battle.json', JSON.stringify(btl, null, '    '));
    }

    if (command === 'backup' || command === 'setbackup') {
        const arg = message.content.slice(prefix.length).trim().split(/ +/);
        const btl = readBattle(message.guild.id);

        if (!btl[message.guild.id]) {
            btl[message.guild.id] = {
                battling: false,
                colosseum: [
                    false,
                    0,
                    "none"
                ],
                trials: {},
                parties: {},
				allies: {
					members: []
				},
                enemies: {
                    members: [],
                    items: {},
                    rings: 0
                },
                battleteam: "none",
                battleteam2: "none",
                battlechannel: "none",
                doturn: 0,
                turn: 0,
                turnorder: [],
				pvp: false,
				pvpmode: "none"
            }
        }

        if (!btl[message.guild.id].parties[arg[1]])
			return message.channel.send("This is an invalid party!");

		var partyDefs = btl[message.guild.id].parties[arg[1]]
        if (!message.member.permissions.serialize().ADMINISTRATOR && partyDefs.members[0].owner != message.author.id)
            return message.channel.send("You lack sufficient permissions, I'm so sorry!");

		if (!readChar(arg[2]))
			message.channel.send(`${arg[2]} is an invalid character.`);

		var removedMember = false
		for (const i in partyDefs.members) {
			var charName = partyDefs.members[i]

			if (charName === arg[2]) {
				partyDefs.members.splice(i, 1)
				removedMember = true
				break
			}
		}
		
		if (removedMember == false)
			return message.channel.send("This member doesn't exist within the party!")
		else {
			partyDefs.member.push(arg[2])
			message.channel.send(`Added ${arg[2]} to the party's backup.`)
			fs.writeFileSync(dataPath+'/battle.json', JSON.stringify(btl, null, '    '));
		}
    }
	
    if (command === 'partyname' || command === 'teamname' || command === 'setpartyname') {
        const arg = message.content.slice(prefix.length).trim().split(/ +/);

        const btl = readBattle(message.guild.id);

        if (!btl[message.guild.id]) {
            btl[message.guild.id] = {
                battling: false,
                colosseum: [
                    false,
                    0,
                    "none"
                ],
                trials: {},
                parties: {},
				allies: {
					members: []
				},
                enemies: {
                    members: [],
                    items: {},
                    rings: 0
                },
                battleteam: "none",
                battleteam2: "none",
                battlechannel: "none",
                doturn: 0,
                turn: 0,
                turnorder: [],
				pvp: false,
				pvpmode: "none"
            }
        }

        if (btl[message.guild.id].parties[arg[1]]) {
			btl[message.guild.id].parties[arg[2]] = {
				members: [],
				items: {},
				rings: 0
			}

            for (const i in btl[message.guild.id].parties[arg[1]])
				btl[message.guild.id].parties[arg[2]][i] = btl[message.guild.id].parties[arg[1]][i];
			
			delete btl[message.guild.id].parties[arg[1]]
			
			fs.writeFileSync(dataPath+'/battle.json', JSON.stringify(btl, null, '    '));
            message.channel.send(`Team ${arg[1]}'s name was changed to Team ${arg[2]}.`)
		} else
            message.channel.send("Invalid Party.");
	}

    if (command === 'getparty' || command === 'getteam') {
        const arg = message.content.slice(prefix.length).trim().split(/ +/);

        const btl = readBattle(message.guild.id);

        if (!btl[message.guild.id]) {
            btl[message.guild.id] = {
                battling: false,
                colosseum: [
                    false,
                    0,
                    "none"
                ],
                trials: {},
                parties: {},
				allies: {
					members: []
				},
                enemies: {
                    members: [],
                    items: {},
                    rings: 0
                },
                battleteam: "none",
                battleteam2: "none",
                battlechannel: "none",
                doturn: 0,
                turn: 0,
                turnorder: [],
				pvp: false,
				pvpmode: "none"
            }
        }

        if (btl[message.guild.id].parties[arg[1]]) {
			var party = btl[message.guild.id].parties[arg[1]]

            var m = '';
            for (const i in btl[message.guild.id].parties[arg[1]].members)
                m += `\n${btl[message.guild.id].parties[arg[1]].members[i]}`;

			if (m === '')
				m = 'Empty.';

            var b = '';
            for (const i in btl[message.guild.id].parties[arg[1]].backup)
                b += `\n${btl[message.guild.id].parties[arg[1]].backup[i]}`;

			if (b === '')
				b = 'No backup.';

			var itemPath = dataPath+'/items.json'
			var itemRead = fs.readFileSync(itemPath);
			var itemFile = JSON.parse(itemRead);

			var items = '';
			if (party.items) {
				for (const i in party.items)
					items += `${itemFile[i].name}: ${party.items[i]}\n`;
			}

			if (items === '')
				items = 'No items.';

            const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#e36b2b')
				.setTitle(`Team ${arg[1]}`)
                .addFields(
                    { name: 'Members', value: m, inline: true },
                    { name: 'Items', value: items, inline: true },
                    { name: 'Backup', value: b, inline: false }
                )
            message.channel.send({embeds: [DiscordEmbed]})
        } else {
            message.channel.send("Invalid Party.")
        }
    }

    if (command === 'maketrial') {
        if (!message.member.permissions.serialize().ADMINISTRATOR)
            return message.channel.send("You lack sufficient permissions, I'm so sorry!");
		
		const arg = message.content.slice(prefix.length).trim().split(/ +/);
		
		var btl = readBattle();
		btl[message.guild.id].trials[arg[1]] = [
			["Miniscle"]
		]
		
        fs.writeFileSync(dataPath+'/battle.json', JSON.stringify(btl, null, '    '));
		
		message.channel.send(`Created Trial ${arg[1]}, You can edit them with ${prefix}setwave!`);
	}
	
    if (command === 'setwave') {
        if (!message.member.permissions.serialize().ADMINISTRATOR)
            return message.channel.send("You lack sufficient permissions, I'm so sorry!");

		const arg = message.content.slice(prefix.length).trim().split(/ +/);

		if (!arg[1] || arg[1] === ' ' || arg[1] === 'null') {
            const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
				.setTitle(`${prefix}searchskills`)
				.setDescription(`(Args <Trial Name> <Wave Number> <...>)\nCreates a wave of enemies for the specified Trial.\n**The Trial has to exist though!** *(You can make it exist with ${prefix}maketrial.)*`);

			return message.channel.send({embeds: [DiscordEmbed]})
        }
		
		var btl = readBattle();
		if (btl[message.guild.id].trials[arg[1]]) {
			var trialDefs = []
			for (let i = 3; i < arg.length; i++) {
				if (readEnm(arg[i])) {
					trialDefs.push(arg[i])
				} else {
					message.channel.send(`${arg[i]} is an invalid enemy.`)
					return false
				}
			}
			
			if (!btl[message.guild.id].trials[arg[1]][parseInt(arg[2])-1]) {
				message.channel.send("This wave does not exist, therefore, I have just slotted it in as the next wave for you.")
				btl[message.guild.id].trials[arg[1]].push(trialDefs)
			} else {
				btl[message.guild.id].trials[arg[1]][parseInt(arg[2])-1] = trialDefs
			}

			fs.writeFileSync(dataPath+'/battle.json', JSON.stringify(btl, null, '    '));
			
			message.channel.send("Thank you for waiting!!!\nHere's the trial so far:")
			const trialEmbed = new Discord.MessageEmbed()
				.setColor('#0099ff')
				.setTitle(`Trial of ${arg[1]}`)
				.addFields()
				
			var trialDefinitions = btl[message.guild.id].trials[arg[1]]
			for (const i in trialDefinitions) {
				var trialEnemies = ""
				for (const k in trialDefinitions[i]) {
					trialEnemies += `${trialDefinitions[i][k]}\n`
				}
				
				trialEmbed.fields.push({name: `Wave ${+i+1}`, value: `${trialEnemies}`, inline: true})
			}
			
			message.channel.send({embeds: [trialEmbed]})
		} else {
			message.channel.send("This trial does not exist.")
		}
	}

    if (command === 'gettrial') {
		var btl = readBattle();
		const arg = message.content.slice(prefix.length).trim().split(/ +/);
		if (btl[message.guild.id].trials[arg[1]]) {
			const trialEmbed = new Discord.MessageEmbed()
				.setColor('#0099ff')
				.setTitle(`Trial of ${arg[1]}`)
				.setDescription("Here are the waves of the trial.")
				.addFields()
				
			const trialDefs = btl[message.guild.id].trials[arg[1]]
			for (const i in trialDefs) {
				var trialEnemies = ""
				for (const k in trialDefs[i]) {
					trialEnemies += `${trialDefs[i][k]}\n`
				}
				
				trialEmbed.fields.push({name: `Wave ${+i+1}`, value: `${trialEnemies}`, inline: true})
			}
			
			message.channel.send({embeds: [trialEmbed]})
		} else {
			message.channel.send("This is an invalid trial!")
		}
	}

    if (command === 'prefix') {
        if (!message.member.permissions.serialize().ADMINISTRATOR)
            return message.channel.send("You lack sufficient permissions, I'm so sorry!");

        var servPath = dataPath+'/Server Settings/server.json'
        var servRead = fs.readFileSync(servPath);
        var servFile = JSON.parse(servRead);

        if (!servFile[message.guild.id]) {
            servFile[message.guild.id] = {
				prefix: "rpg!",
				limitbreaks: false,
				showtimes: false,
				onemores: false,
				currency: "Bloom Token",
				xprate: 1,
				damageFormula: "persona",
				pvpstuff: {
					none: {},
					metronome: {},
					randskills: {},
					randstats: {},
					charfuck: {}
				},
				themes: {
					battle: [],
					advantage: [],
					disadvantage: [],
					bossfight: [],
					miniboss: [],
					strongfoe: [],
					finalboss: [],
					colosseum: [],
					colosseumstrong: [],
					pvp: [],
					victory: [],
					colosseumvictory: [],
					loss: []
				},
				banned: []
			}
        }

        const arg = message.content.slice(prefix.length).trim().split(/ +/);
        servFile[message.guild.id].prefix = arg[1]
        fs.writeFileSync(servPath, JSON.stringify(servFile, null, '    '));

        message.channel.send(`The prefix has been changed to __**${arg[1]}**__! An example of using a command like this would be "${arg[1]}help"`)
    }

    if (command === 'limitbreaks' || command === 'lbs') {
        if (!message.member.permissions.serialize().ADMINISTRATOR)
            return message.channel.send("You lack sufficient permissions, I'm so sorry!");

        var servPath = dataPath+'/Server Settings/server.json'
        var servRead = fs.readFileSync(servPath);
        var servFile = JSON.parse(servRead);

        if (!servFile[message.guild.id]) {
            servFile[message.guild.id] = {
				prefix: "rpg!",
				limitbreaks: false,
				showtimes: false,
				onemores: false,
				currency: "Bloom Token",
				xprate: 1,
				damageFormula: "persona",
				pvpstuff: {
					none: {},
					metronome: {},
					randskills: {},
					randstats: {},
					charfuck: {}
				},
				themes: {
					battle: [],
					advantage: [],
					disadvantage: [],
					bossfight: [],
					miniboss: [],
					strongfoe: [],
					finalboss: [],
					colosseum: [],
					colosseumstrong: [],
					pvp: [],
					victory: [],
					colosseumvictory: [],
					loss: []
				},
				banned: []
			}
        }

        servFile[message.guild.id].limitbreaks = (servFile[message.guild.id].limitbreaks == true) ? false : true
        fs.writeFileSync(servPath, JSON.stringify(servFile, null, '    '));

        message.channel.send(`Limit Breaks have been toggled ${(servFile[message.guild.id].limitbreaks == true) ? "on" : "off"}`)
	}

    if (command === 'onemores') {
        if (!message.member.permissions.serialize().ADMINISTRATOR)
            return message.channel.send("You lack sufficient permissions, I'm so sorry!");

        var servPath = dataPath+'/Server Settings/server.json'
        var servRead = fs.readFileSync(servPath);
        var servFile = JSON.parse(servRead);

        if (!servFile[message.guild.id]) {
            servFile[message.guild.id] = {
				prefix: "rpg!",
				limitbreaks: false,
				showtimes: false,
				onemores: false,
				currency: "Bloom Token",
				xprate: 1,
				damageFormula: "persona",
				pvpstuff: {
					none: {},
					metronome: {},
					randskills: {},
					randstats: {},
					charfuck: {}
				},
				themes: {
					battle: [],
					advantage: [],
					disadvantage: [],
					bossfight: [],
					miniboss: [],
					strongfoe: [],
					finalboss: [],
					colosseum: [],
					colosseumstrong: [],
					pvp: [],
					victory: [],
					colosseumvictory: [],
					loss: []
				},
				banned: []
			}
        }

        servFile[message.guild.id].onemores = (servFile[message.guild.id].onemores == true) ? false : true
        fs.writeFileSync(servPath, JSON.stringify(servFile, null, '    '));

        message.channel.send(`One Mores have been toggled ${(servFile[message.guild.id].onemores == true) ? "on" : "off"}`)
	}

    if (command === 'showtimes') {
        if (!message.member.permissions.serialize().ADMINISTRATOR)
            return message.channel.send("You lack sufficient permissions, I'm so sorry!");

        var servPath = dataPath+'/Server Settings/server.json'
        var servRead = fs.readFileSync(servPath);
        var servFile = JSON.parse(servRead);

        if (!servFile[message.guild.id]) {
            servFile[message.guild.id] = {
				prefix: "rpg!",
				limitbreaks: false,
				showtimes: false,
				onemores: false,
				currency: "Bloom Token",
				xprate: 1,
				damageFormula: "persona",
				pvpstuff: {
					none: {},
					metronome: {},
					randskills: {},
					randstats: {},
					charfuck: {}
				},
				themes: {
					battle: [],
					advantage: [],
					disadvantage: [],
					bossfight: [],
					miniboss: [],
					strongfoe: [],
					finalboss: [],
					colosseum: [],
					colosseumstrong: [],
					pvp: [],
					victory: [],
					colosseumvictory: [],
					loss: []
				},
				banned: []
			}
        }

        servFile[message.guild.id].showtimes = (servFile[message.guild.id].showtimes == true) ? false : true
        fs.writeFileSync(servPath, JSON.stringify(servFile, null, '    '));

        message.channel.send(`Showtime Attacks have been toggled ${(servFile[message.guild.id].showtimes == true) ? "on" : "off"}`)
	}

    if (command === 'currency') {
        if (!message.member.permissions.serialize().ADMINISTRATOR)
            return message.channel.send("You lack sufficient permissions, I'm so sorry!");

        var servPath = dataPath+'/Server Settings/server.json'
        var servRead = fs.readFileSync(servPath);
        var servFile = JSON.parse(servRead);

        if (!servFile[message.guild.id]) {
            servFile[message.guild.id] = {
				prefix: "rpg!",
				limitbreaks: false,
				showtimes: false,
				onemores: false,
				currency: "Bloom Token",
				xprate: 1,
				damageFormula: "persona",
				pvpstuff: {
					none: {},
					metronome: {},
					randskills: {},
					randstats: {},
					charfuck: {}
				},
				themes: {
					battle: [],
					advantage: [],
					disadvantage: [],
					bossfight: [],
					miniboss: [],
					strongfoe: [],
					finalboss: [],
					colosseum: [],
					colosseumstrong: [],
					pvp: [],
					victory: [],
					colosseumvictory: [],
					loss: []
				},
				banned: []
			}
        }

        const arg = message.content.slice(prefix.length).trim().split(/ +/);
        if (!arg[1])
            return message.channel.send("Please specify the currency.");
		
		if (message.mentions.users.first())
            return message.channel.send("Don't ping others with this, that's just mean.");
        else if (arg[1].toLowerCase() == 'dick')
            return message.channel.send("Not funny enough to let you do this, you clown.");
        else if (arg[1].toLowerCase() == 'balls')
            return message.channel.send("You're either ballin', playing with balls, or being stopped by Bloom Battler... you sick human being.");
        else if (arg[1].toLowerCase() == 'vagina')
            return message.channel.send("Yeah okay... No.");
        else if (arg[1].toLowerCase() == 'women' || arg[1].toLowerCase() == 'woman')
            return message.channel.send("This is no harem.");
        else if (arg[1].toLowerCase() == 'sex' || arg[1].toLowerCase() == 'ass' || arg[1].toLowerCase() == 'doggy-style' || arg[1].toLowerCase() == 'doggystyle')
            return message.channel.send("No you can't have sex with a robot, even if they had the capability to.");
        else {
			var currencyText = arg[1].toLowerCase()
			const inapropriateWords = ['dick', 'balls', 'penis', 'vagina', 'pussy', 'fuck', 'shit', 'nigga', 'n-word', 'rape', 'porn', 'hentai', 'ass', 'tit', 'breast']

			for (const i in inapropriateWords) {
				if (currencyText === inapropriateWords[i]) {
					message.channel.send("This word is too inapropriate. Sorry.");
					return
				}
			}
		}

        servFile[message.guild.id].currency = arg[1]

        fs.writeFileSync(servPath, JSON.stringify(servFile, null, '    '));

        message.channel.send(`The currency in this server is now set to ${arg[1]}`)
	}

	if (command === 'xprate') {
        if (!message.member.permissions.serialize().ADMINISTRATOR) {
            message.channel.send("You lack sufficient permissions, I'm so sorry!");
            return
        }

        var servPath = dataPath+'/Server Settings/server.json'
        var servRead = fs.readFileSync(servPath);
        var servFile = JSON.parse(servRead);

        if (!servFile[message.guild.id]) {
            servFile[message.guild.id] = {
				prefix: "rpg!",
				limitbreaks: false,
				showtimes: false,
				onemores: false,
				currency: "Bloom Token",
				xprate: 1,
				damageFormula: "persona",
				pvpstuff: {
					none: {},
					metronome: {},
					randskills: {},
					randstats: {},
					charfuck: {}
				},
				themes: {
					battle: [],
					advantage: [],
					disadvantage: [],
					bossfight: [],
					miniboss: [],
					strongfoe: [],
					finalboss: [],
					colosseum: [],
					colosseumstrong: [],
					pvp: [],
					victory: [],
					colosseumvictory: [],
					loss: []
				},
				banned: []
			}
        }

        const arg = message.content.slice(prefix.length).trim().split(/ +/);

		if (isFinite(parseFloat(arg[1]))) {
			servFile[message.guild.id].xprate = parseFloat(arg[1])
			fs.writeFileSync(servPath, JSON.stringify(servFile, null, '    '));
	
			message.channel.send(`XP Rate has been changed to ${servFile[message.guild.id].xprate}x`)
		} else
			message.channel.send(`Please ensure the XP Rate is a full or decimal number!`)
	}
	
	if (command === 'goldchance' || command === 'goldenchance' || command === 'shinychance') {
        if (!message.member.permissions.serialize().ADMINISTRATOR)
            return message.channel.send("You lack sufficient permissions, I'm so sorry!");

        var servPath = dataPath+'/Server Settings/server.json'
        var servRead = fs.readFileSync(servPath);
        var servFile = JSON.parse(servRead);

        if (!servFile[message.guild.id]) {
            servFile[message.guild.id] = {
				prefix: "rpg!",
				limitbreaks: false,
				showtimes: false,
				onemores: false,
				currency: "Bloom Token",
				xprate: 1,
				goldChance: 0.1,
				damageFormula: "persona",
				pvpstuff: {
					none: {},
					metronome: {},
					randskills: {},
					randstats: {},
					charfuck: {}
				},
				themes: {
					battle: [],
					advantage: [],
					disadvantage: [],
					bossfight: [],
					miniboss: [],
					strongfoe: [],
					finalboss: [],
					colosseum: [],
					colosseumstrong: [],
					pvp: [],
					victory: [],
					colosseumvictory: [],
					loss: []
				},
				banned: []
			}
        }

        const arg = message.content.slice(prefix.length).trim().split(/ +/);

		if (isFinite(parseFloat(arg[1])) && parseFloat(arg[1]) <= 100) {
			servFile[message.guild.id].goldChance = parseFloat(arg[1])
			fs.writeFileSync(servPath, JSON.stringify(servFile, null, '    '));

			message.channel.send(`Golden Chance has been changed to ${servFile[message.guild.id].goldChance}%`)
		} else
			message.channel.send('Please ensure the Golden Chance is a full or decimal percentage number below or equal to 100!')
	}

    if (command === 'damageformula' || command === 'damagetype') {
        if (!message.member.permissions.serialize().ADMINISTRATOR)
            return message.channel.send("You lack sufficient permissions, I'm so sorry!");

        var servPath = dataPath+'/Server Settings/server.json'
        var servRead = fs.readFileSync(servPath);
        var servFile = JSON.parse(servRead);

        if (!servFile[message.guild.id]) {
            servFile[message.guild.id] = {
				prefix: "rpg!",
				limitbreaks: false,
				showtimes: false,
				onemores: false,
				currency: "Bloom Token",
				xprate: 1,
				damageFormula: "persona",
				pvpstuff: {
					none: {},
					metronome: {},
					randskills: {},
					randstats: {},
					charfuck: {}
				},
				themes: {
					battle: [],
					advantage: [],
					disadvantage: [],
					bossfight: [],
					miniboss: [],
					strongfoe: [],
					finalboss: [],
					colosseum: [],
					colosseumstrong: [],
					pvp: [],
					victory: [],
					colosseumvictory: [],
					loss: []
				},
				banned: []
			}
        }

        const arg = message.content.slice(prefix.length).trim().split(/ +/);
        if (!arg[1])
            return message.channel.send("Please specify the currency.");
		
		switch(arg[1].toLowerCase()) {
			case 'persona':
				servFile[message.guild.id].damageFormula = 'persona'
				message.channel.send("Damage formula changed to Persona's.\n`5 * √(Attack/Endurance * Skill Power)`")
				break
			
			case 'pokemon':
				servFile[message.guild.id].damageFormula = 'pokemon'
				message.channel.send("Damage formula changed to Pokemon's.\n`(((2*level)/5+2)*Power*Attack/Endurance)/50+2`")
				break
			
			default:
				return message.channel.send('Invalid damage formula')
		}

        fs.writeFileSync(servPath, JSON.stringify(servFile, null, '    '));
	}

    if (command === 'ban') {
        if (!message.member.permissions.serialize().ADMINISTRATOR)
            return message.channel.send('You lack sufficient permissions. Probably a good thing.');
		
		if (!message.mentions.users.first())
            return message.channel.send('Specify the user to ban.');
		
		var bannedUser = message.mentions.users.first()
		
		if (bannedUser.id === message.author.id)
            return message.channel.send("I didn't know you hated me that much... Don't ban yourself.");
		
        var servPath = dataPath+'/Server Settings/server.json'
        var servRead = fs.readFileSync(servPath);
        var servFile = JSON.parse(servRead);

        if (!servFile[message.guild.id]) {
            servFile[message.guild.id] = {
				prefix: "rpg!",
				limitbreaks: false,
				showtimes: false,
				onemores: false,
				currency: "Bloom Token",
				xprate: 1,
				damageFormula: "persona",
				pvpstuff: {
					none: {},
					metronome: {},
					randskills: {},
					randstats: {},
					charfuck: {}
				},
				themes: {
					battle: [],
					advantage: [],
					disadvantage: [],
					bossfight: [],
					miniboss: [],
					strongfoe: [],
					finalboss: [],
					colosseum: [],
					colosseumstrong: [],
					pvp: [],
					victory: [],
					colosseumvictory: [],
					loss: []
				},
				banned: []
			}
        }
		
		if (!servFile[message.guild.id])
			servFile[message.guild.id].banned = [];
		
		var reason;
		if (message.content.includes('"'))
			reason = message.content.slice(prefix.length).trim().split('"');
		
		servFile[message.guild.id].banned.push(bannedUser.id)
		bannedUser.send(`You were banned from using the RPG section of me in ${message.guild.name}.\n${reason ? reason[1] : "Thank you for understanding."}`)
		
        fs.writeFileSync(servPath, JSON.stringify(servFile, null, '    '));
	}

    if (command === 'unban') {
        if (!message.member.permissions.serialize().ADMINISTRATOR) {
            message.channel.send('You lack sufficient permissions. Probably a good thing.');
            return
        }
		
		if (!message.mentions.users.first()) {
            message.channel.send('Specify the user to unban.');
            return
        }
		
		var bannedUser = message.mentions.users.first()
		
        var servPath = dataPath+'/Server Settings/server.json'
        var servRead = fs.readFileSync(servPath);
        var servFile = JSON.parse(servRead);

        if (!servFile[message.guild.id]) {
            servFile[message.guild.id] = {
				prefix: "rpg!",
				limitbreaks: false,
				showtimes: false,
				onemores: false,
				currency: "Bloom Token",
				xprate: 1,
				damageFormula: "persona",
				pvpstuff: {
					none: {},
					metronome: {},
					randskills: {},
					randstats: {},
					charfuck: {}
				},
				themes: {
					battle: [],
					advantage: [],
					disadvantage: [],
					bossfight: [],
					miniboss: [],
					strongfoe: [],
					finalboss: [],
					colosseum: [],
					colosseumstrong: [],
					pvp: [],
					victory: [],
					colosseumvictory: [],
					loss: []
				},
				banned: []
			}
        }
		
		if (!servFile[message.guild.id])
			servFile[message.guild.id].banned = [];
		
		var unBanned = false
		for (const i in servFile[message.guild.id].banned) {
			var ID = servFile[message.guild.id].banned[i]
			if (bannedUser.id === ID) {
				servFile[message.guild.id].banned.splice(i, 1)
				unBanned = true
				break
			}
		}
		
		if (unBanned)
			message.channel.send("Unbanned the user.");
		else
			message.channel.send("This user was never banned in the first place!");
		
        fs.writeFileSync(servPath, JSON.stringify(servFile, null, '    '));
	}

    if (command === 'settings') {
        var servPath = dataPath+'/Server Settings/server.json'
        var servRead = fs.readFileSync(servPath);
        var servFile = JSON.parse(servRead);

        if (!servFile[message.guild.id]) {
            servFile[message.guild.id] = {
				prefix: "rpg!",
				limitbreaks: false,
				showtimes: false,
				onemores: false,
				currency: "Bloom Token",
				xprate: 1,
				damageFormula: "persona",
				pvpstuff: {
					none: {},
					metronome: {},
					randskills: {},
					randstats: {},
					charfuck: {}
				},
				themes: {
					battle: [],
					advantage: [],
					disadvantage: [],
					bossfight: [],
					miniboss: [],
					strongfoe: [],
					finalboss: [],
					colosseum: [],
					colosseumstrong: [],
					pvp: [],
					victory: [],
					colosseumvictory: [],
					loss: []
				},
				banned: []
			}
        }
		
		const DiscordEmbed = new Discord.MessageEmbed()
			.setColor('#0099ff')
			.setTitle(`${message.guild.name}'s Settings`)
			.addFields()
		
		const servStuff = servFile[message.guild.id]

		var mechanics = '**'
		var mechanicDesc = ''

		// Mechanics
		if (servStuff.limitbreaks == false) {
			mechanics += 'No Limit Breaks\n'
			mechanicDesc += 'n'
		} else {
			mechanics += 'Limit Breaks Enabled\n'
			mechanicDesc += 'y'
		}

		if (servStuff.showtimes == false) {
			mechanics += 'No Showtimes\n'
			mechanicDesc += 'n'
		} else {
			mechanics += 'Showtimes Enabled\n'
			mechanicDesc += 'y'
		}

		if (servStuff.onemores == false) {
			mechanics += 'No One Mores\n'
			mechanicDesc += 'n'
		} else {
			mechanics += 'One Mores & All Out Attacks Enabled.\n'
			mechanicDesc += 'y'
		}
		
		mechanics += '**'
		
		var mechanicDescriptions = {
			nnn: "A fair, clean fight.",
			ynn: "Just Limit Breaks. Interesting choice.",
			nyn: "Just Show-Times. One-Mores would be chaotic.",
			nny: "Someone likes to strategize.",
			yyn: "Uhh... Okay.",
			nyy: "Personaaa!",
			yny: "This is P5R descrimination.",
			yyy: "Welcome to your special hell.",
		}
		
		DiscordEmbed.fields.push({name: 'Mechanics', value: `${mechanics}\n\n*${mechanicDescriptions[mechanicDesc]}*`, inline: false})
		
		// Prefix
		DiscordEmbed.fields.push({name: 'Prefix', value: `${servStuff.prefix}`, inline: true})
		
		// Currency
		DiscordEmbed.fields.push({name: 'Currency', value: `${servStuff.currency}, ${servStuff.currency}s`, inline: true})

		// XP Rate
		DiscordEmbed.fields.push({name: 'XP Rate', value: `${servStuff.xprate}x`, inline: true})
		
		// Damage Formula
		var damageFormulas = {
			persona: '5*√(Attack/Endurance * Skill Power)',
			pokemon: '(((2*level)/5+2)*Power*Attack/Endurance)/50+2'
		}

		var dmgArray = servStuff.damageFormula.split('');
		dmgArray[0] = dmgArray[0].toUpperCase()
		var dmgString = dmgArray.join('');
		
		DiscordEmbed.fields.push({name: 'Damage Formula', value: dmgString + '\n`' + damageFormulas[servStuff.damageFormula] + '`', inline: false})
		
		if (!servStuff.goldChance) {
			servStuff.goldChance = 0.1
			fs.writeFileSync(servPath, JSON.stringify(servFile, null, '    '));
		}

		// XP Rate
		DiscordEmbed.fields.push({name: 'Golden Chance', value: `${servStuff.goldChance}%`, inline: true})

        message.channel.send({embeds: [DiscordEmbed]})
	}

    if (command === 'invite') {
        const DiscordEmbed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle(`${prefix}invite`)
            .setDescription("You want to invite me to other servers!? I'm genuinely surprised, because I'm probably a buggy mess right now...\n\nAlright, let's do this, I guess.\n*Click 'Invite' to get started.*")
            .setAuthor('Invite', 'https://media.wired.com/photos/5a593a7ff11e325008172bc2/125:94/w_2393,h_1800,c_limit/pulsar-831502910.jpg', 'https://discord.com/oauth2/authorize?client_id=776480348757557308&scope=bot&permissions=1275456598')
        message.channel.send({embeds: [DiscordEmbed]})
    }
});

client.on('messageReactionAdd', async (reaction, user) => {
	if (reaction.partial) {
		try {
			await reaction.fetch();
		} catch (error) {
			console.error('Something went wrong when fetching the message:', error);
			return;
		}
	}

    var relicPath = dataPath+'/RelicSearch/relicData.json'
    var relicRead = fs.readFileSync(relicPath);
    var relicData = JSON.parse(relicRead);

    var message = reaction.message;

    if (user.bot) { return false }

    if (!relicData[user.id]) {
        relicData[user.id] = {
            rolls: 10,
            canfind: true,
            findcooldown: 60,
            stars: 0,
            relics: []
        }

        fs.writeFileSync(relicPath, JSON.stringify(relicData, null, '    '));
    }

    if (message.embeds[0] && message.embeds[0].footer) {
        if (message.embeds[0].footer.text === 'Relic Search') {
            if ((Date.now() - message.createdTimestamp) < 12000000) {
                if (relicData[user.id].canfind == true) {
                    var relicPath2 = dataPath+'/RelicSearch/relicDefs.json'
                    var relicRead2 = fs.readFileSync(relicPath2);
                    var relicDefs = JSON.parse(relicRead2);

                    message.channel.send(`${user.username} found ${message.embeds[0].title}, obtaining ${relicDefs[message.embeds[0].title].rarity * 2} stars!`)
                    relicData[user.id].relics.push(`${message.embeds[0].title}`)
                    relicData[user.id].canfind = false

                    if (!relicData[user.id].stars) { relicData[user.id].stars = 0 }
                    relicData[user.id].stars += Math.round(relicDefs[message.embeds[0].title].rarity * 2)

                    fs.writeFile(relicPath, JSON.stringify(relicData, null, '    '), function (err) {
                        if (err) throw err;
                    });

                    reaction.remove();
                    message.delete();
                } else {
                    message.channel.send(`${user.username} cannot find relics for another **${relicData[user.id].findcooldown} minutes**!`);
                }
            }
        } else if (message.embeds[0].footer.text === 'Relic Battle!') {
            var relicPath2 = dataPath+'/RelicSearch/relicFight.json'
            var relicRead2 = fs.readFileSync(relicPath2);
            var relicFight = JSON.parse(relicRead2);

            for (const i in relicFight[message.channel.id].fighters) {
                if (relicFight[message.channel.id].fighters[i].name === user.username && !relicFight[message.channel.id].fighters[i].bot) {
                    relicFight[message.channel.id].fighters[i].guard = null
                    if (reaction.emoji.name === "👊") {
                        relicFight[message.channel.id].fighters[i].move = "phys";
                    } else if (reaction.emoji.name === "✨") {
                        relicFight[message.channel.id].fighters[i].move = "mag";
                    } else if (reaction.emoji.name === "🛡️") {
                        relicFight[message.channel.id].fighters[i].move = "guard";
                    }
                }
            }
			
			reaction.users.remove(user.id)
            fs.writeFileSync(relicPath2, JSON.stringify(relicFight, null, '    '));
        } else if (message.embeds[0].footer.text === "Werewolf/Mafia") {
            const mafiaPath = dataPath+'/Mafia/Mafia.json'
            const mafiaRead = fs.readFileSync(mafiaPath);
            const mafiaFile = JSON.parse(mafiaRead);

            if (!mafiaFile[message.guild.id]) {
                mafiaFile[message.guild.id] = {
                    state: "waiting",
                    players: [],
                    killers: [],
                    protector: 0,
                }
            }

            if (reaction.emoji.name === "🔪") {
                mafiaFile[message.guild.id].players.push(user)
            }

            fs.writeFileSync(mafiaPath, JSON.stringify(mafiaFile, null, '    '));
        } else if (message.embeds[0].footer.text === "Uno") {
            const unoPath = dataPath+'/Uno/unoGames.json'
            const unoRead = fs.readFileSync(unoPath);
            const uno = JSON.parse(unoRead);

            if (reaction.emoji.name === "🃏") {
                uno[message.guild.id].players.push({
					name: user.username,
					id: user.id,
					cards: [],
					uno: false
				})
            }
			
			var descText = "Players:\n"
			for (const i in uno[message.guild.id].players) {
				descText += `${uno[message.guild.id].players[i].name}\n`
			}
				
			const DiscordEmbed = new Discord.MessageEmbed()
				.setColor('#ffffff')
				.setTitle("Uno!")
				.setDescription(`You know this game.\n\n*(React with the emoji (🃏) to join.)*\n\n${descText}`)
				.setFooter("Uno");
			message.edit({embeds:[DiscordEmbed]})

            fs.writeFileSync(unoPath, JSON.stringify(uno, null, '    '));
        }
    }
});

client.on('threadCreate', async thread => {
	if (thread.joinable) await thread.join();
})

process.on('unhandledRejection', error => {
	console.error('Unhandled promise rejection:', error);
});

client.login('bot-id');