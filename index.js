///////////////////////////////////
// MAIN SCRIPT FOR BLOOM BATTLER //
// grassimp :) ////////////////////
///////////////////////////////////

//Discord.JS initiation.
const Discord = require('discord.js');
const Voice = require('@discordjs/voice');
const Builders = require('@discordjs/builders');
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

// Path to 'data' folder
const dataPath = './data'

// Path to 'packages' folder
const packPath = './Packages'

// Bot Stuff
const utilityFuncs = require(packPath + '/utilityFuncs.js');
const charFuncs = require(packPath + '/charFuncs.js');
const enemyFuncs = require(packPath + '/enemyFuncs.js');
const attackFuncs = require(packPath + '/attackFuncs.js');
const turnFuncs = require(packPath + '/turnFuncs.js');
const skillFuncs = require(packPath + '/skillFuncs.js');

const RF = require(packPath + '/relicFuncs.js');

// Now for specific commands
const makeLoot = require(packPath + '/commands/loot/makeloot.js');
const assignLoot = require(packPath + '/commands/loot/assignloot.js');
const getLoot = require(packPath + '/commands/loot/getloot.js');
const searchLoot = require(packPath + '/commands/loot/searchloots.js');
const listLoot = require(packPath + '/commands/loot/listloots.js');
const deassignLoot = require(packPath + '/commands/loot/deassignloot.js');
const removeLoot = require(packPath + '/commands/loot/removeloot.js');

const registerSkillSteps = require(packPath + '/commands/registerskill.js');

//Canvas, for making custom pictures.
const Canvas = require('canvas');

//FS, for writing files.
const fs = require('fs');

//Request, for requesting files
const request = require('request');

// Voice Shit
const ffmpeg = require('ffmpeg-static');
const ytdl = require('ytdl-core');
const http = require('http');

// Daily Quote - Resets at midnight
let dailyQuote = 'none'

let tempQuote = fs.readFileSync(dataPath+'/dailyquote.txt', {flag: 'as+'});
if (tempQuote && tempQuote != '')
	dailyQuote = tempQuote.toString();

// Daily Skill - Resets at midnight
let dailySkill = 'none'

let tempSkill = fs.readFileSync(dataPath+'/dailyskill.txt', {flag: 'as+'});
if (tempSkill && tempSkill != '')
	dailySkill = tempSkill.toString();

// Midnight Moment
function midnightInMS() {
    return new Date().setHours(24, 0, 0, 0) - new Date().getTime()
}

setTimeout(function() {
	dailyQuote = 'none';
	dailySkill = 'none';

	fs.writeFileSync(dataPath+'/dailyquote.txt', '');
	fs.writeFileSync(dataPath+'/dailyskill.txt', '');

	setTimeout(function() {
		dailyQuote = 'none';
		dailySkill = 'none';

		fs.writeFileSync(dataPath+'/dailyquote.txt', '');
		fs.writeFileSync(dataPath+'/dailyskill.txt', '');
	}, midnightInMS());
}, midnightInMS());

// Other Required Shit
require('dotenv').config();
const { isBooleanObject } = require('util/types');

// Games
let doGSM = false;

// Blacksmith
let blackSmith = {}

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
	"gravity",
	"sound",
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
	poison: "<:poison:906759861742760016>",
	metal: "<:metal:906748877955268638>",
	curse: "<:curse:906748923354443856>",
	bless: "<:bless:903369721980813322>",
	nuclear: "<:nuclear:906877350447300648>",
	gravity: "🌍",
	sound: "🎵",
	
	almighty: "<:almighty:906748842450509894>",
	
	status: "<:status:906877331711344721>",
	heal: "<:heal:906758309351161907>",
	passive: "<:passive:906874477210648576>"
}

// Item
const itemTypes = [
	"skill",
	"heal",
	"healmp",
	"healhpmp",
	"revive",
	"material",
	"pacify"
]

const itemTypeEmoji = {
	skill: '🎇',

	heal: "🌀",
	healmp: "⭐",
	healhpmp: "🔰",

	revive: "✨",
	material: '🛠',
	pacify: '🎵',
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
	"ego",
	"silence",
	"dazed",
	"hunger",
	"illness",
	"infatuation",
	"mirror",
	"blind",
	"confusion"
]

const statusEmojis = {
    burn: "🔥",
	bleed: "<:bleed:906903499462307870>",
    freeze: "❄",
    paralyze: "⚡",
	sleep: "💤",
	dizzy: "💫",
	despair: "💦",
    poison: "<:poison:906903499961434132>",
	dizzy: "💫",
    brainwash: "🦆",
	fear: "👁",
	rage: "<:rage:906903500053696532>",
	ego: "🎭",
	silence: '<:silence:905238069207240734>',
	dazed: '✨',
	hunger: '🍪',
	illness: '🤢',
	infatuation: '❣️',
	mirror: '<:mirror:929864689406582784>',
	blind: '🕶️',
	confusion: '☄️'
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
	"blindingradiance",
	"eternaldarkness"
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
		components: [new Discord.MessageActionRow({components: [backButton, forwardButton]})]
	})

	if (canFitOnOnePage) return

	const collector = embedMessage.createMessageComponentCollector({
		filter: ({user}) => true // fuck you and your (the sequel)
	})

	let currentIndex = 0;
	collector.on('collect', async interaction => {
		if (interaction.customId === backId) {
			if (currentIndex - 10 < 0) {
				currentIndex = theArray.length-10
			} else {
				currentIndex -= 10
			}
		} else {
			if (currentIndex + 10 >= theArray.length) {
				currentIndex = 0
			} else {
				currentIndex += 10
			}
		}

		await interaction.update({
			embeds: [await generateEmbed(currentIndex)],
			components: [
				new Discord.MessageActionRow({components: [backButton, forwardButton]})
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
					name: `${elementEmoji[arrayDefs.mainElement] ? elementEmoji[arrayDefs.mainElement] : '🛑'}${arrayDefs.name}`,
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
					name: `${itemTypeEmoji[arrayDefs.type.toLowerCase()]}${arrayDefs.name}`,
					value: `${arrayDefs.cost ? arrayDefs.cost : '0'} Cost.`
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

const sendWeaponArray = async(channel, theArray) => {
	const generateEmbed = async start => {
		const current = theArray.slice(start, start + 10)
		return new Discord.MessageEmbed({
			title: `Showing results ${start + 1}-${start + current.length} out of ${theArray.length}`,
			fields: await Promise.all(
				current.map(async arrayDefs => ({
					name: `${arrayDefs.element ? elementEmoji[arrayDefs.element.toLowerCase()] : ''}${arrayDefs.name}`,
					value: `${arrayDefs.melee ? arrayDefs.melee : '???'} Power Melee Attack`
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

const sendArmorArray = async(channel, theArray) => {
	const generateEmbed = async start => {
		const current = theArray.slice(start, start + 10)
		return new Discord.MessageEmbed({
			title: `Showing results ${start + 1}-${start + current.length} out of ${theArray.length}`,
			fields: await Promise.all(
				current.map(async arrayDefs => ({
					name: `${arrayDefs.element ? elementEmoji[arrayDefs.element.toLowerCase()] : ''}${arrayDefs.name}`,
					value: `Defensive skill: ${arrayDefs.skill ? arrayDefs.skill : 'none'}`
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

			let userID = ''
			if (current3[i] !== 'official') {
				if (isFinite(parseInt(current3[i]))) {
					userID = client.users.cache.find(user => user.id === current3[i].toString())
					userID = userID.username
				} else
					userID = current3[i]
			} else 
				userID = 'official'

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

const sendCharmArray = async(channel, theArray) => {
	const generateEmbed = async start => {
		const current = theArray.slice(start, start + 6)
		return new Discord.MessageEmbed({
			title: `Showing results ${start + 1}-${start + current.length} out of ${theArray.length}`,
			fields: await Promise.all(
				current.map(async arrayDefs => ({
					name: `${arrayDefs.name}`,
					value: `**${arrayDefs.notches} Notches**\n*${arrayDefs.desc}*`
				}))
			)
		})
	}

	const canFitOnOnePage = theArray.length <= 6
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
		interaction.customId === backId ? (currentIndex -= 6) : (currentIndex += 6)
		await interaction.update({
			embeds: [await generateEmbed(currentIndex)],
			components: [
				new Discord.MessageActionRow({
					components: [
						...(currentIndex ? [backButton] : []),
						...(currentIndex + 6 < theArray.length ? [forwardButton] : [])
					]
				})
			]
		})
	})
}

const sendEnemyArray = async(channel, theArray) => {
	const generateEmbed = async start => {
		const current = theArray.slice(start, start + 6)
		return new Discord.MessageEmbed({
			title: `Showing results ${start + 1}-${start + current.length} out of ${theArray.length}`,
			fields: await Promise.all(
				current.map(async arrayDefs => ({
					name: `${arrayDefs[1] ? '' : '||'}${(arrayDefs[0].boss || arrayDefs[0].miniboss || arrayDefs[0].bigboss || arrayDefs[0].deity) ? '<:warning:878094052208296007>' : ''}${arrayDefs[0].name}${arrayDefs[1] ? '' : '||'}`,
					value: `${arrayDefs[1] ? '' : '||'}${arrayDefs[0].hp}HP, ${arrayDefs[0].mp}MP${arrayDefs[1] ? '' : '||'}`
				}))
			)
		})
	}

	const canFitOnOnePage = theArray.length <= 6
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
		interaction.customId === backId ? (currentIndex -= 6) : (currentIndex += 6)
		await interaction.update({
			embeds: [await generateEmbed(currentIndex)],
			components: [
				new Discord.MessageActionRow({
					components: [
						...(currentIndex ? [backButton] : []),
						...(currentIndex + 6 < theArray.length ? [forwardButton] : [])
					]
				})
			]
		})
	})
}

const sendParties = async(channel, theArray) => {
	const generateEmbed = async start => {
		const current = theArray.slice(start, start + 10)
		return new Discord.MessageEmbed({
			title: `Showing results ${start + 1}-${start + current.length} out of ${theArray.length}`,
			fields: await Promise.all(
				current.map(async arrayDefs => (arrayDefs))
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

function sendInvite(channel) {
	const DiscordEmbed = new Discord.MessageEmbed()
		.setColor('#0099ff')
		.setTitle('Invite')
		.setDescription("You want to invite me to other servers!? I'm genuinely surprised, because I'm probably a buggy mess right now...\n\nAlright, let's do this, I guess.\n*Click 'Invite' to get started.*")
		.setAuthor('Bloom Battler', 'https://media.wired.com/photos/5a593a7ff11e325008172bc2/125:94/w_2393,h_1800,c_limit/pulsar-831502910.jpg')

	const row = new Discord.MessageActionRow()
		.addComponents(
			new Discord.MessageButton()
				.setLabel('Invite')
				.setStyle('LINK')
				.setURL('https://discord.com/oauth2/authorize?client_id=776480348757557308&scope=bot&permissions=1275456598')
		);
	
	channel.send({embeds: [DiscordEmbed], components: [row]})
}

// Download a File from a Url
function downloadUrl(file) {
    request.get(file.url)
        .on('error', console.error)
        .pipe(fs.createWriteStream(`./images/enemies/${file.name}`));
}

/////////////////////////////////
// Finally, Voice Channel shit //
// LETS G ///////////////////////
/////////////////////////////////

let voiceChannelShit = {}

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
		
		let title = songInfo.videoDetails.title ? songInfo.videoDetails.title : 'someSong'
		let fileName = songInfo.videoDetails.title.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '')

		if (sendToChannel && voiceChannelShit[server].sendShit) {
			let musicEmbed
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
		let sendShit = voiceChannelShit[server].battlethemes ? null : true
		
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
	let servPath = dataPath+'/Server Settings/server.json'
	let servRead = fs.readFileSync(servPath, {flag: 'as+'});
	let servFile = JSON.parse(servRead);

	if (!servFile[server]) {
		servFile[server] = {
			prefix: "rpg!",
			limitbreaks: false,
			showtimes: false,
			onemores: false,
			currency: "Bloom Token",
			xprate: 1,
			damageFormula: "persona",
			levelUpFormula: "original",
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
		let themeNum = utilityFuncs.randNum(themes.length-1)
		await playSong(server, themes[themeNum-1])
	}
}

/////////////////////
// Write Functions //
/////////////////////

// Gives a character an affinity.
function writeAffinity(charDefs, type, affinity) {
	const affinities = ['superweak', 'weak', 'resist', 'block', 'repel', 'drain']

	if (affinity === 'normal' || affinity === 'none') {
		for (const i in affinities) {
			if (affinities[i] && charDefs[affinities[i]]) {
				for (const k in charDefs[affinities[i]]) {
					if (charDefs[affinities[i]][k].toLowerCase() === type.toLowerCase()) {
						charDefs[affinities[i]].splice(k, 1);
						break
					}
				}
			}
		}
	} else {
		if (charDefs[affinity])
			charDefs[affinity].push(type);
		else
			charDefs[affinity] = [type]
	}
}

// Changes the Character's Melee Attack
function writeMelee(charDefs, skillname, type) {
    charDefs.melee = [skillname, type]
}

// Gives EXP to a Character.
function giveXP(name, exp, msg) {
    let charPath = dataPath+'/characters.json'
    let charRead = fs.readFileSync(charPath, {flag: 'as+'});
    let charFile = JSON.parse(charRead);

    charFile[name].xp += parseInt(exp);
	while (charFile[name].xp >= charFile[name].maxxp)
		charFuncs.lvlUp(charFile[name], false, msg.guild.id);

    fs.writeFileSync(charPath, JSON.stringify(charFile, null, '    '));

	let xpPercent = Math.floor((charFile[name].xp/charFile[name].maxxp)*100)
	let xpSquares = xpPercent/5
	let xpStr = `[${'🟦'.repeat(xpSquares)}${'⬛'.repeat(20 - xpSquares)}]`

    msg.channel.send(`${name} got ${parseInt(exp)}EXP!\n${xpStr}`);
    console.log(`BattleStatus: ${name} ${charFile[name].xp}/${charFile[name].maxxp}XP`)
}

// Apply Extra Effects to an existing skill
function applyExtra(skill, extra1, extra2, extra3) {
	if (extra1 === 'ohko') {
		skill[extra1] = true;
		switch(skill.target) {
			case 'everyone':
				if (skill.acc >= 80)
					skill.levelLock = 99;
				else if (skill.acc >= 35)
					skill.levelLock = 80;
				else
					skill.levelLock = 55;
				break;

			case 'allopposing':
				if (skill.acc >= 80)
					skill.levelLock = 90;
				else if (skill.acc >= 35)
					skill.levelLock = 65;
				else
					skill.levelLock = 40;
				break;
			
			default:
				if (skill.acc >= 80)
					skill.levelLock = 80;
				else if (skill.acc >= 35)
					skill.levelLock = 40;
				else
					skill.levelLock = 20;
		}
	} else if (extra1 === 'sacrifice')
		skill.sacrifice = true;
	else if (extra1 === 'buff' || extra1 === 'debuff' || extra1 === 'debuffuser') {
		skill[extra1] = extra2.toLowerCase();
		skill.buffchance = parseInt(extra3);
		
		if (extra1 === 'buff' || extra1 === 'debuff')
			skill.levelLock += 7;
	} else if (extra1 === 'dualbuff' || extra1 === 'dualdebuff') {
		skill[extra1] = [extra2.toLowerCase(), extra3.toLowerCase()];
		skill.levelLock += 15;
	} else if (extra1 === 'takemp') {
		skill.takemp = parseInt(extra2);
		skill.levelLock += 5;
	} else if (extra1 === 'healverse') {
		skill.verse = ['heal', parseInt(extra2)];
		skill.levelLock += 10;
	} else if (extra1 === 'powerverse') {
		skill.verse = ['power', parseInt(extra2)];
		skill.levelLock += 10;
	} else if (extra1 === 'spreadverse') {
		skill.verse = ['spread', parseInt(extra2)];
		skill.levelLock += 15;
	} else if (skill.type === 'mp' && extra1 === 'healmp')
		skill.healmp = true;
	else if (extra1 === 'steal') {
		skill.steal = parseInt(extra2);
		skill.levelLock += (extra1 === 'steal') ? 20 : 8;
	} else if (extra1 === 'powerbuff') {
		if (utilityFuncs.validStat(extra2))
			skill.powerbuff = [extra2.toLowerCase(), parseInt(extra3)];
	} else if (extra1 === 'multistatus') {
		if (skill.status && typeof skill.status === 'string')
			skill.status = [skill.status]
		else if (typeof skill.status === 'object')
			skill.status = [skill.status[0]]
		else
			skill.status = []

		if (utilityFuncs.validStatus(extra2)) skill.status.push(extra2);
		if (utilityFuncs.validStatus(extra3)) skill.status.push(extra3);
	} else if (extra1 === 'statcalc') {
		if (utilityFuncs.validStat(extra2.toLowerCase()))
			skill.statCalc = extra2.toLowerCase();
	} else if (extra1 === 'hpcalc' || extra1 === 'mpcalc' || extra1 === 'feint' || extra1 === 'rest' || extra1 === 'stealmp' || extra1 === 'lonewolf') {
		skill[extra1] = true;
		
		if (extra1 === 'feint' || extra1 === 'stealmp')
			skill.levelLock = Math.min(99, skill.levelLock+15);
	} else if (extra1 === 'rollout') {
		skill.rollout = parseFloat(extra2);

		if (skill.rollout >= 75)
			skill.levelLock = Math.min(99, skill.levelLock+60);
		else if (skill.rollout >= 50)
			skill.levelLock = Math.min(99, skill.levelLock+45);
		else if (skill.rollout >= 25)
			skill.levelLock = Math.min(99, skill.levelLock+30);
		else
			skill.levelLock = Math.min(99, skill.levelLock+15);
	} else if (extra1 === 'forcetech') {
		if (utilityFuncs.validStatus(extra2)) {
			if (utilityFuncs.validStatus(extra3))
				skill.forceTech = [extra2, extra3];
			else
				skill.forceTech = [extra2];
		} else {
			return false
		}
	} else
		return false;

	return true;
}

function applyHealExtra(skill, extra1, extra2, extra3) {
	if (extra1 === 'sacrifice' || extra1 === 'healmp' || extra1 === 'regenerate' || extra1 === 'statusheal' || extra1 === 'recarmdra' || extra1 === 'fullheal')
		skill[extra1] = true;
	else
		return false;

	return true;
}

// Creates a Skill to be used in Battle.
function writeSkill(msg, name, nameWithSpaces, need, bartype, power, accuracy, critical, movetype, status, chance, physorspec, targettype, hitcount, extra1, extra2, extra3, desc) {
    let skillPath = dataPath+'/skills.json'
    let skillRead = fs.readFileSync(skillPath, {flag: 'as+'});
    let skillFile = JSON.parse(skillRead);

    skillFile[name] = {
		name: nameWithSpaces ? nameWithSpaces : name,
        cost: need ? need : 0,
        costtype: bartype ? bartype.toLowerCase() : "mp",
        pow: power ? Math.min(2000, Math.max(0, power)) : 60,
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
	
	let totalDmg = skillFile[name].pow*skillFile[name].hits
	if (totalDmg >= 2000)
		return msg.channel.send(`The Power cap for skills is 2000! A skill of ${skillFile[name].hits} hits can have a maximum of ${2000/skillFile[name].hits} power!`);
	
	if (!need || need <= 0) {
		delete skillFile[name].cost
		delete skillFile[name].costType
	}
	
	if (!critical || critical == 0)
		delete skillFile[name].crit;
	
	if (!hitcount || hitcount <= 1)
		delete skillFile[name].hits;
	
	if (hitcount && hitcount > 100)
		skillFile[name].hits = 99

	if (!desc || desc === "none" || desc === "null")
		delete skillFile[name].desc;
	
	if (!status || status == "none" || status == 0 || status == "0" || chance == 0) {
		delete skillFile[name].status
		delete skillFile[name].statuschance
	}

	// Level Lock
	if (skillFile[name].pow <= 60)
		delete skillFile[name].levelLock;
	else if (skillFile[name].pow <= 120)
		skillFile[name].levelLock = 10;
	else if (skillFile[name].pow < 350)
		skillFile[name].levelLock = 20;
	else if (skillFile[name].pow < 450)
		skillFile[name].levelLock = 40;
	else if (skillFile[name].pow < 600)
		skillFile[name].levelLock = 50;
	else if (skillFile[name].pow < 750)
		skillFile[name].levelLock = 65;
	else if (skillFile[name].pow < 800)
		skillFile[name].levelLock = 75;
	else if (skillFile[name].pow < 900)
		skillFile[name].levelLock = 80;
	else if (skillFile[name].pow < 1000)
		skillFile[name].levelLock = 85;
	else if (skillFile[name].pow < 1200)
		skillFile[name].levelLock = 90;
	else
		skillFile[name].levelLock = 95;
	
	// Extra Effects
	if (extra1 && extra1 != 'none') {
		if (!applyExtra(skillFile[name], extra1, extra2, extra3))
			msg.channel.send('The Extra Effect you inputted was invalid! The skill will still be registered.');
	}

    fs.writeFileSync(skillPath, JSON.stringify(skillFile, null, '    '))
    console.log(`Written skillFile["${name}"] to "skills.json".`)
	return true
}

// Creates a Healing Skill to be used in Battle.
function writeHeal(msg, name, nameWithSpaces, need, bartype, power, targettype, extra1, extra2, extra3, desc) {
    let skillPath = dataPath+'/skills.json'
    let skillRead = fs.readFileSync(skillPath, {flag: 'as+'});
    let skillFile = JSON.parse(skillRead);

    skillFile[name] = {
		name: nameWithSpaces ? nameWithSpaces : name,
        type: "heal",
        cost: need ? need : 0,
        costtype: bartype ? bartype.toLowerCase() : "mp",
        pow: power ? Math.max(0, power) : 60,
        atktype: "magic",
		target: targettype ? targettype.toLowerCase() : "one",
		desc: desc ? desc.toString() : null,
		originalAuthor: msg.author.id
    };
	
	if (!need || need <= 0) {
		delete skillFile[name].cost
		delete skillFile[name].costType
	}

	if (!desc || desc === "none" || desc === "null")
		delete skillFile[name].desc;

	// Level Lock
	skillFile[name].levelLock = Math.round(power/10);

	// Extra Effects
	if (extra1 && extra1 != 'none') {
		if (!applyHealExtra(skillFile[name], extra1, extra2, extra3))
			msg.channel.send('The Extra Effect you inputted was invalid! The skill will still be registered.');
	}

    fs.writeFileSync(skillPath, JSON.stringify(skillFile, null, '    '))
    console.log(`Written skillFile["${name}"] to "skills.json" as a heal skill.`)
	return true
}

// Creates a status type skill to be used in battle.
function writeStatus(msg, name, name2, need, bartype, statustype, extra1, extra2, extra3, desc) {
    let skillPath = dataPath+'/skills.json'
    let skillRead = fs.readFileSync(skillPath, {flag: 'as+'});
    let skillFile = JSON.parse(skillRead);

    skillFile[name] = {
		name: name2 ? name2 : name,
        type: 'status',
        cost: need ? need : 12,
        costtype: bartype ? bartype.toLowerCase() : 'mp',
		desc: desc ? desc.toString() : null,
		originalAuthor: msg.author.id
    };

	let statusType = statustype.toLowerCase()
	if (statusType === 'status') {
		if (!utilityFuncs.validStatus(extra1)) return msg.channel.send(`${extra1} is an invalid status effect.`);

		skillFile[name].status = extra1.toLowerCase()
		skillFile[name].statuschance = parseInt(extra2)
		skillFile[name].levelLock = 10
	} else if (statusType === 'multistatus') {
		skill.status = []
		if (utilityFuncs.validStatus(extra1)) skill.status.push(extra1);
		if (utilityFuncs.validStatus(extra2)) skill.status.push(extra2);
		if (utilityFuncs.validStatus(extra3)) skill.status.push(extra3);
		
		if (skill.status.length <= 0)
			return msg.channel.send('All 3 status effects were invalid.');
		
		skillFile[name].levelLock = 25
	} else if (statusType === 'buff') {
		skillFile[name].buff = extra1.toLowerCase()
		skillFile[name].target = extra2.toLowerCase()
		skillFile[name].buffCount = parseInt(extra3)
		
		if (skillFile[name].buffCount <= 1) {
			delete skillFile[name].buffCount
			skillFile[name].levelLock = 10
		}

		if (skillFile[name].buffCount >= 6) {
			skillFile[name].buffCount = 6
			skillFile[name].levelLock = 60
		}
	} else if (statusType === 'debuff') {
		skillFile[name].debuff = extra1.toLowerCase()
		skillFile[name].target = extra2.toLowerCase()
		skillFile[name].levelLock = 10
	} else if (statusType === 'dualbuff' || statusType === 'dualdebuff') {
		skillFile[name][statusType] = [extra1.toLowerCase(), extra2.toLowerCase()];
		skillFile[name].target = extra3.toLowerCase();
		skillFile[name].levelLock = 40;
	} else if (statusType === 'mimic') {
		skillFile[name].mimic = true;
		skillFile[name].levelLock = 50;
	} else if (statusType === 'clone' || statusType === 'harmonics') {
		skillFile[name].clone = true;
		skillFile[name].levelLock = 50;
	} else if (statusType === 'shield') {
		skillFile[name].shield = extra1.toLowerCase()
		skillFile[name].target = extra2.toLowerCase()
		skillFile[name].levelLock = 25
	} else if (statusType === 'makarakarn' || statusType === 'tetrakarn') {
		skillFile[name][statusType] = true
		skillFile[name].target = extra1.toLowerCase()
		skillFile[name].levelLock = 40
	} else if (statusType === 'trap') {
		skillFile[name].trap = true
		skillFile[name].trapType = {
			name: name,
			effect: [extra1.toLowerCase(), extra2.toLowerCase()]
		}
		skillFile[name].levelLock = 30;

		if (extra1.toLowerCase() == "damage") {
			skillFile[name].trapType.effect[2] = parseInt(extra2);
			skillFile[name].levelLock = 40
		}
	} else if (statusType === 'weather')
		skillFile[name].weather = extra1.toLowerCase();
	else if (statusType === 'terrain')
		skillFile[name].terrain = extra1.toLowerCase();
	else if (statusType === 'reincarnate') {
		skillFile[name].reincarnate = true
		skillFile[name].levelLock = 50
	} else if (statusType === 'futuresight' || statusType === 'delayed' || statusType === 'future') {
		skillFile[name].futuresight = {
			pow: parseInt(extra1),
			acc: 90,
			type: extra2.toLowerCase(),
			atktype: "magic",
			turns: parseInt(extra3)
		}
		skillFile[name].levelLock = 50
	} else
		return msg.channel.send('You inputted an invalid status type.');

	if (!desc || desc === "none" || desc === "null")
		delete skillFile[name].desc;

    fs.writeFileSync(skillPath, JSON.stringify(skillFile, null, '    '))
    console.log(`Written skillFile["${name}"] to "skills.json" as a status skill.`)
	return true
}

// Creates a passive skill to be used in battle.
function writePassive(msg, name, name2, passivetype, extra1, extra2, desc) {
    let skillPath = dataPath+'/skills.json'
    let skillRead = fs.readFileSync(skillPath, {flag: 'as+'});
    let skillFile = JSON.parse(skillRead);

    skillFile[name] = {
		name: name2 ? name2 : name,
        type: 'passive',
		desc: desc ? desc.toString() : null,
		originalAuthor: msg.author.id
    };

	if (!desc || desc === "none" || desc === "null") {
		delete skillFile[name].desc
	}
	
	let passiveType = passivetype.toLowerCase()
	if (passiveType === 'damagephys' || passiveType === 'damagemag' || passiveType === 'dodgephys' || passiveType === 'dodgemag' ||
		passiveType === 'healonturn' || passiveType === 'healmponturn' || passiveType === 'regen' || passiveType === 'invig') {
		skillFile[name].passive = passiveType
		skillFile[name].pow = parseInt(extra1)
	} else if (passiveType === 'status') {
		skillFile[name].passive = 'status'
		skillFile[name].status = extra1.toLowerCase()
		skillFile[name].statuschance = parseInt(extra2)
		skillFile[name].pow = parseInt(extra2)
	} else if (passiveType === 'boost' || passiveType === 'elementboost' || passiveType === 'typeboost') {
		skillFile[name].passive = 'boost'
		skillFile[name].boosttype = extra1.toLowerCase()
		skillFile[name].pow = parseFloat(extra2)
	} else if (passiveType === 'extrahit' || passiveType === 'multihit') {
		skillFile[name].passive = 'extrahit'
		skillFile[name].pow = parseInt(extra1)
		skillFile[name].acc = parseInt(extra2)
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
	} else if (passiveType === 'affinitycutter') {
		skillFile[name].pow = parseInt(extra1)
		skillFile[name].affinitycutter = true

		// Balancing
		if (skillFile[name].pow > 50)
			skillFile[name].pow = 50;
	} else if (passiveType === 'affinityslicer') {
		skillFile[name].pow = parseInt(extra1)
		skillFile[name].affinityslicer = true

		// Balancing
		if (skillFile[name].pow > 50)
			skillFile[name].pow = 50;
	} else if (passiveType === 'alterpain') {
		skillFile[name].pow = parseInt(extra1);
		skillFile[name].alterpain = true;

		// Balancing
		if (skillFile[name].pow > 20)
			skillFile[name].pow = 20;
	} else if (passiveType === 'guardboost' || passiveType === 'sacrificial') {
		skillFile[name].pow = parseInt(extra1);
		skillFile[name][passiveType] = true;

		// Balancing
		if (skillFile[name].pow > 60)
			skillFile[name].pow = 60;
	} else if (passiveType === 'attackall' || passiveType === 'magicmelee' || passiveType === 'sacrifice' || passiveType === 'guarddodge')
		skillFile[name][passiveType] = true;
	else
		return msg.channel.send('You inputted an invalid passive type.');

	skillFile[name].passive = passiveType

	fs.writeFileSync(skillPath, JSON.stringify(skillFile, null, '    '))
    console.log(`Written skillFile["${name}"] to "skills.json" as a passive skill.`)
	return true
}

////////////////////
// Read Functions //
////////////////////

// Reads Character Data
function readChar(name) {
    let charPath = dataPath+'/characters.json'
    let charRead = fs.readFileSync(charPath, {flag: 'as+'});
    let charFile = JSON.parse(charRead);

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
function readEnm(name, server) {
    let enmPath = dataPath+'/Enemies/enemies-' + server + '.json'
    let enmRead = fs.readFileSync(enmPath, {flag: 'as+'});
    let enmFile = JSON.parse(enmRead);

    if (enmFile[server][name]) {
        return enmFile[server][name]
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
    let skillPath = dataPath+'/skills.json'
    let skillRead = fs.readFileSync(skillPath, {flag: 'as+'});
    let skillFile = JSON.parse(skillRead);

    if (skillFile[name])
        return skillFile[name]
    else
        return false;
}

// Reads Battle Data
function readBattle(server) {
    let btlPath = dataPath+'/Battles/battle-' + server + '.json'
    let btlRead = fs.readFileSync(btlPath, {flag: 'as+'});
    let btlFile = JSON.parse(btlRead);
	
	if (!btlFile)
		btlFile = {}

    return btlFile
}

//////////////////////
// Battle Functions //
//////////////////////

// Do on-turn status effects
function doStatusEffect(fighterDef, btl, server) {
	if (fighterDef.mindcharge) {
		if (fighterDef.justcharged)
			delete fighterDef.justcharged
		else
			delete fighterDef.mindcharge
	}

	if (fighterDef.powercharge) {
		if (fighterDef.justcharged)
			delete fighterDef.justcharged
		else
			delete fighterDef.powercharge
	}

	if (fighterDef.healVerse) {
		fighterDef.healVerse.turns -= 1
		if (fighterDef.healVerse.turns <= 0) {
            const healVerseEmbed = new Discord.MessageEmbed()
                .setColor('#e36b2b')
                .setTitle(`${fighterDef.healVerse.skillname}`)
                .setDescription(`${fighterDef.healVerse.username}'s ${fighterDef.healVerse.skillname} wore off for ${fighterDef.name}.`)

			delete fighterDef.healVerse

            client.channels.fetch(btl[server].battlechannel)
                .then(channel => channel.send({embeds: [healVerseEmbed]}))
		}
	}

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
                .setDescription(`${fighterDef.name}'s orgia mode ran out and they fell asleep`)

            client.channels.fetch(btl[server].battlechannel)
                .then(channel => channel.send({embeds: [orgiaEmbed]}))
		}
	}

	if (fighterDef.mimicturns) {
		fighterDef.mimicturns--;
		
		if (fighterDef.mimicturns <= 0) {				
			charFuncs.resetMimic(fighterDef)

            const mimicEmbed = new Discord.MessageEmbed()
                .setColor('#e36b2b')
                .setTitle(`${fighterDef.name}'s Mimic`)
                .setDescription(`${fighterDef.name} stopped mimicking their target.`)

            client.channels.fetch(btl[server].battlechannel)
                .then(channel => channel.send({embeds: [mimicEmbed]}))
		}
	}

	if (fighterDef.forceMove) {	
		let allySide = btl[server].allies.members
		let opposingSide = btl[server].enemies.members
		if (charFuncs.isOpposingSide(fighterDef, btl[server])) {
			allySide = btl[server].enemies.members
			opposingSide = btl[server].allies.members
		}

		var DiscordEmbed = attackFuncs.attackWithSkill(fighterDef, fighterDef.forceMove[1], allySide, opposingSide, btl, fighterDef.forceMove[2], server)
		client.channels.fetch(btl[server].battlechannel)
			.then(channel => channel.send({embeds: [DiscordEmbed]}))
	}
	
	if (fighterDef.futureSightSkill) {
		fighterDef.futureSightSkill.turns--;
		
		if (fighterDef.futureSightSkill.turns <= 0) {
			let skillData = fighterDef.futureSightSkill;

			const skillDefs = {
				name: skillData.name ? skillData.name : "their Future Sight Skill",
				target: skillData.target ? skillData.target : "one",
				pow: skillData.pow,
				acc: skillData.acc ? skillData.acc : 95,
				type: skillData.type,
				atktype: skillData.atktype ? skillData.atktype : "magic",
				status: skillData.status ? skillData.status : "none",
				statuschance: skillData.statuschance ? skillData.statuschance : 0,
				ohko: skillData.ohko ? true : false,
				sacrifice: skillData.sacrifice ? true : false
			}

			const userDefs = skillData.user
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

	let forceSkip = false;
	if (fighterDef.rest) {
		delete fighterDef.rest;

		const restEmbed = new Discord.MessageEmbed()
			.setColor('#e36b2b')
			.setTitle(`${fighterDef.name} is tired.`)
			.setDescription(`${fighterDef.name} must rest & recharge for this turn.`)

		client.channels.fetch(btl[server].battlechannel)
			.then(channel => channel.send({embeds: [restEmbed]}))

		forceSkip = true;
	}

	if (fighterDef.infatuation) {
		let chance = Math.round(Math.random()*100)
		
		if (chance <= 50) {
			forceSkip = true;

            var DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#e36b2b')
                .setTitle(`${fighterDef.name}'s Infatuation`)
                .setDescription(`${fighterDef.name} is stopped in their tracks by Infatuation.`)

            client.channels.fetch(btl[server].battlechannel)
                .then(channel => channel.send({embeds: [DiscordEmbed]}))
		}
		
		fighterDef.infatuation -= 1
		if (fighterDef.infatuation <= 0) {
            var DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#e36b2b')
                .setTitle(`${fighterDef.name}'s Infatuation`)
                .setDescription(`${fighterDef.name} recovers from infatuation.`)

            client.channels.fetch(btl[server].battlechannel)
                .then(channel => channel.send({embeds: [DiscordEmbed]}))
			
			delete fighterDef.infatuation
		}
	}

	if (fighterDef.confusion) {
		let chance = Math.round(Math.random()*100)
		
		if (chance <= 50) {
			forceSkip = true;

			let dmg = Math.round((Math.random()*fighterDef.atk)*2)
            var DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#e36b2b')
                .setTitle(`${fighterDef.name}'s Confusion`)
                .setDescription(`${fighterDef.name} is confused and strikes themselves for ${dmg} damage.`)
			fighterDef.hp -= dmg;

            client.channels.fetch(btl[server].battlechannel)
                .then(channel => channel.send({embeds: [DiscordEmbed]}))
		}

		fighterDef.confusion -= 1
		if (fighterDef.confusion <= 0) {
            var DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#e36b2b')
                .setTitle(`${fighterDef.name}'s Confusion`)
                .setDescription(`${fighterDef.name} recovers from confusion.`)

            client.channels.fetch(btl[server].battlechannel)
                .then(channel => channel.send({embeds: [DiscordEmbed]}))
			
			delete fighterDef.confusion
		}
	}

    if (fighterDef.status && fighterDef.status.toLowerCase() != "none") {
        if (fighterDef.status === "burn" || fighterDef.status === "poison" || fighterDef.status === "illness") {
            let dmg = Math.round(fighterDef.maxhp/10)
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

            if (fighterDef.statusturns == 0 || fighterDef.hp <= 1)
                fighterDef.status = "none";

			console.log(`TurnOrder: Done ${fighterDef.name}'s ${fighterDef.status} status effect.`);
		} else if (fighterDef.status === "bleed") {
            let dmg = Math.round(fighterDef.maxhp/10)
			if (fighterDef.boss || fighterDef.miniboss)
				dmg = 5;

            fighterDef.hp -= dmg

            let defeated = "."
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
				fs.writeFileSync(dataPath+'/Battles/battle-' + server + '.json', JSON.stringify(btl, null, '    '));
				return [fighterDef, "skip"]
			}
		} else if (fighterDef.status === "despair") {
            let dmg = Math.round(fighterDef.maxmp/10)
			if (fighterDef.boss || fighterDef.miniboss)
				dmg = Math.round(fighterDef.maxmp/25);

			let dmgText = `${fighterDef.name} lost ${dmg} MP`;

            fighterDef.mp = Math.max(0, fighterDef.mp - dmg)
			if (fighterDef.mp <= 0) {
				fighterDef.hp = 0
				dmgText += ' and was defeated!'
			} else
				dmgText += '.';

            const statusEmbed = new Discord.MessageEmbed()
                .setColor('#e36b2b')
                .setTitle(`${fighterDef.name}'s Despair`)
                .setDescription(dmgText);

			fighterDef.statusturns--;
            if (fighterDef.statusturns == 0 || fighterDef.mp <= 1)
                fighterDef.status = "none";

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

				fs.writeFileSync(dataPath+'/Battles/battle-' + server + '.json', JSON.stringify(btl, null, '    '));
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

				fs.writeFileSync(dataPath+'/Battles/battle-' + server + '.json', JSON.stringify(btl, null, '    '));
				return [fighterDef, "skip"]
			}
        } else if (fighterDef.status === "mirror") {
			if (fighterDef.boss || fighterDef.miniboss) {
				const statusEmbed = new Discord.MessageEmbed()
					.setColor('#e36b2b')
					.setTitle(`${fighterDef.name} is encased in a mirror!`)
					.setDescription("They shake off the effect.")

				client.channels.fetch(btl[server].battlechannel)
					.then(channel => channel.send({embeds: [statusEmbed]}))

				console.log(`TurnOrder: Done ${fighterDef.name}'s ${fighterDef.status} status effect.`);

				fighterDef.status = "none"
				fighterDef.statusturns = 0
			} else {
				const statusEmbed = new Discord.MessageEmbed()
					.setColor('#e36b2b')
					.setTitle(`${fighterDef.name} is encased in a mirror!`)
					.setDescription("They can't move!")

				client.channels.fetch(btl[server].battlechannel)
					.then(channel => channel.send({embeds: [statusEmbed]}))
					
				console.log(`TurnOrder: Done ${fighterDef.name}'s ${fighterDef.status} status effect.`);

				fighterDef.statusturns--;
				if (fighterDef.statusturns == 0 || fighterDef.mp <= 1)
					fighterDef.status = "none";

				fs.writeFileSync(dataPath+'/Battles/battle-' + server + '.json', JSON.stringify(btl, null, '    '));
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
				let heal = Math.floor(fighterDef.maxhp/20)
				let healmp = Math.floor(fighterDef.maxmp/20)
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

				fs.writeFileSync(dataPath+'/Battles/battle-' + server + '.json', JSON.stringify(btl, null, '    '));
				return [fighterDef, "skip"]
			}
        } else if (fighterDef.status === "fear") {
			if (Math.round(Math.random()*100) < 50 && !fighterDef.boss && !fighterDef.miniboss) {
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

				fs.writeFileSync(dataPath+'/Battles/battle-' + server + '.json', JSON.stringify(btl, null, '    '));
				return [fighterDef, forceSkip ? "skip" : "continue"]
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

			fs.writeFileSync(dataPath+'/Battles/battle-' + server + '.json', JSON.stringify(btl, null, '    '));
            return [fighterDef, forceSkip ? "skip" : "continue"]
        } else if (fighterDef.status === "ego" || fighterDef.status === "silence" || fighterDef.status === "dazed") {
            const statusEmbed = new Discord.MessageEmbed()
                .setColor('#e36b2b')
                .setTitle(`${fighterDef.name} is afflicted with ${fighterDef.status}!`)

            client.channels.fetch(btl[server].battlechannel)
                .then(channel => channel.send({embeds: [statusEmbed]}))
				
			console.log(`TurnOrder: Notified of ${fighterDef.name}'s ${fighterDef.status} status effect.`);

			fighterDef.statusturns--;
            if (fighterDef.statusturns == 0)
                fighterDef.status = "none";

			fs.writeFileSync(dataPath+'/Battles/battle-' + server + '.json', JSON.stringify(btl, null, '    '));
            return [fighterDef, forceSkip ? "skip" : "continue"]
        } else if (fighterDef.status === "hunger") {
			if (fighterDef.statusturns > 1) {
				const statusEmbed = new Discord.MessageEmbed()
					.setColor('#e36b2b')
					.setTitle(`${fighterDef.name} is hungry...`)

				client.channels.fetch(btl[server].battlechannel)
					.then(channel => channel.send({embeds: [statusEmbed]}))
					
				console.log(`TurnOrder: Notified of ${fighterDef.name}'s ${fighterDef.status} status effect.`);

				fighterDef.statusturns--;
			} else {
				const statusEmbed = new Discord.MessageEmbed()
					.setColor('#e36b2b')
					.setTitle(`${fighterDef.name} is cured of hunger.`)

				client.channels.fetch(btl[server].battlechannel)
					.then(channel => channel.send({embeds: [statusEmbed]}))

				fighterDef.status = "none"
				fighterDef.statusturns = 0
				
				fighterDef.atk = Math.round(fighterDef.atk*2)
				fighterDef.mag = Math.round(fighterDef.mag*2)
				fighterDef.prc = Math.round(fighterDef.prc*2)
				fighterDef.agl = Math.round(fighterDef.agl*2)
			}

			fs.writeFileSync(dataPath+'/Battles/battle-' + server + '.json', JSON.stringify(btl, null, '    '));
            return [fighterDef, forceSkip ? "skip" : "continue"]
        } else if (fighterDef.status === "brainwash") {
			let skillPath = dataPath+'/skills.json'
			let skillRead = fs.readFileSync(skillPath, {flag: 'as+'});
			let skillFile = JSON.parse(skillRead);

			if (fighterDef.boss || fighterDef.miniboss) {
				fighterDef.status = "none"
				fighterDef.statusturns = 0

				const DiscordEmbed = new Discord.MessageEmbed()
					.setColor('#e36b2b')
					.setTitle(`${fighterDef.name} shook out of their status effect!`)
					.setDescription(`${fighterDef.name}'s brainwash went away`)

				client.channels.fetch(btl[server].battlechannel)
					.then(channel => channel.send({embeds: [DiscordEmbed]}))

				console.log(`TurnOrder: Done ${fighterDef.name}'s ${fighterDef.status} status effect.`);

				fs.writeFileSync(dataPath+`/Battles/battle-${server}.json`, JSON.stringify(btl, null, '    '));
				return [fighterDef, forceSkip ? "skip" : "continue"]
			}

			let possibleSkills = [];
			for (const i in fighterDef.skills) {
				let skillDefs = skillFile[fighterDef.skills[i]]
				
				if (!skillDefs.passive && skillDefs.type != "passive") {
					let costType = skillDefs.costtype ? skillDefs.costtype.toLowerCase() : 'mp'

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
			
			let skillDefs
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

			let targets = []
			let targType = skillDefs.target ? skillDefs.target.toLowerCase() : 'one'
			switch(targType) {
				case 'ally':
					if (charFuncs.isOpposingSide(fighterDef, btl[server])) {
						let targNum = Math.round(Math.random() * (btl[server].allies.members.length - 1))
						targets.push(btl[server].allies.members[targNum])
					} else {
						let targNum = Math.round(Math.random() * (btl[server].enemies.members.length - 1))
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
						let targNum = utilityFuncs.randNum(btl[server].enemies.members.length - 1)
						targets.push(btl[server].enemies.members[targNum])
					} else {
						let targNum = utilityFuncs.randNum(btl[server].allies.members.length - 1)
						targets.push(btl[server].allies.members[targNum])
					}
			}

			let embedTexts = []
			for (const i in targets) {
				let targDefs = targets[i]
				const targName = targets[i].name
				
				if (targDefs.hp > 0) {
					let embedTxt = attackFuncs.attackFoe(fighterDef.name, targName, fighterDef, targDefs, skillDefs, false, server, btl)
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
							fighterDef[affinities[i]].splice(k, 1)
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

			fs.writeFileSync(dataPath+'/Battles/battle-' + server + '.json', JSON.stringify(btl, null, '    '));
            return [fighterDef, "skip"]
		} else if (fighterDef.status === "rage") {
			let targ;
            if (charFuncs.isOpposingSide(fighterDef, btl[server])) {
				let targNum = Math.round(Math.random() * (btl[server].allies.members.length - 1))
				targ = btl[server].allies.members[targNum]
			} else {
				let targNum = Math.round(Math.random() * (btl[server].enemies.members.length - 1))
				targ = btl[server].enemies.members[targNum]
			}
			
			let embedText = attackFuncs.meleeFoe(fighterDef, targ, server, true, btl)
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

			fs.writeFileSync(dataPath+'/Battles/battle-' + server + '.json', JSON.stringify(btl, null, '    '));
            return [fighterDef, "skip"]
        }
    }

	fs.writeFileSync(dataPath+'/Battles/battle-' + server + '.json', JSON.stringify(btl, null, '    '));
    return [fighterDef, forceSkip ? "skip" : "continue"]
}

// other shit
function genCharFromPet(charDefs) {
	let battlerDefs = {
		name: charDefs.name,
		truename: charDefs.name,
		petChar: true,

		melee: ["Strike Attack", "strike"],
		level: charDefs.level,

		hp: 100,
		mp: 80,
		maxhp: 100,
		maxmp: 80,
		lb: 0,

		xp: 0,
		maxxp: 100,

		status: "none",
		statusturns: 0,

		atk: charDefs.atk,
		mag: charDefs.mag,
		prc: charDefs.prc,
		end: charDefs.end,
		chr: charDefs.chr,
		int: charDefs.int,
		agl: charDefs.agl,
		luk: charDefs.luk,
		weapon: 'none',
		guard: false,

		buffs: {
			atk: 0,
			mag: 0,
			prc: 0,
			end: 0,
			agl: 0,
			
			crit: 0
		},

		weak: [],
		resist: [],
		block: [],
		repel: [],
		drain: [],
		skills: [charDefs.skill],

		trust: {},

		charms: []
	}
	
	return battlerDefs
}

function petMove(message, client, btl, partyName, petDefs, allySide, oppSide) {
    let servPath = dataPath+'/Server Settings/server.json'
    let servRead = fs.readFileSync(servPath, {flag: 'as+'});
    let servFile = JSON.parse(servRead);

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
				levelUpFormula: "original",
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

    const prefix = servFile[message.guild.id] ? servFile[message.guild.id].prefix : 'rpg!'
	const arg = message.content.slice(prefix.length).trim().split(/ +/);

	let skillPath = dataPath+'/skills.json'
	let skillRead = fs.readFileSync(skillPath, {flag: 'as+'});
	let skillFile = JSON.parse(skillRead);
			
	var DiscordEmbed;
	
	if (arg[0] == 'petmove' || arg[0] == 'petskill') {
		let charDefs = genCharFromPet(petDefs)
		let charName = petDefs.name

		if (charDefs) {
			let skillName = petDefs.skill
			let skillDefs = skillFile[skillName]
			
			// Copy Skill
			if (skillDefs.copyskill) {
				let possibleSkills = []
				for (const val in allySide) {
					if (allySide[val].id != charDefs.id) {
						for (const i in allySide[val].skills) {
							let skillDefs = skillFile[allySide[val].skills[i]]
							if (skillDefs.type != "heal" && skillDefs.type != "status" && skillDefs.type != "passive") {
								possibleSkills.push(allySide[val].skills[i])
							}
						}
					}
				}
				
				if (possibleSkills.length > 0) {
					let skillVal = possibleSkills[Math.round(Math.random() * (possibleSkills.length-1))]
					
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
				let possibleSkills = []
				for (const val in skillFile) {
					if (skillFile[val].type != "heal" && (skillFile[val].type != "status" && !skillFile[val].buff) && skillFile[val].type != "passive" && val != "Metronome") {
						possibleSkills.push(val)
					}
				}

				let skillVal = possibleSkills[Math.round(Math.random() * (possibleSkills.length-1))]
				skillDefs = skillFile[skillVal]

				console.log(`Metronome: Chosen skill ${skillVal} of ${possibleSkills.length-1} skills`)
				if (!skillDefs.name) {
					skillDefs.name = `${skillVal} (skillName)`
				} else {
					skillDefs.name += ` (${skillName})`
				}
				
				skillName = skillVal
			}

			btl[message.guild.id].canshowtime = false

			// Heal Skills target allies
			if (skillDefs.type == "heal") {
				let healedQuote = ""

				let affinityMessage = ``;
				if (skillDefs.healall || skillDefs.target && skillDefs.target === "allallies") {
					if (skillDefs.fullheal) {
						for (const i in allySide) {
							let partyDef = allySide[i]
							if (partyDef.hp > 0) {
								partyDef.hp = partyDef.maxhp
							
								affinityMessage += turnFuncs.healPassives(partyDef)
							
								if (partyDef.helpedquote && partyDef.helpedquote.length > 0) {
									let possibleQuote = Math.round(Math.random() * (partyDef.helpedquote.length-1))
									let theQuote = `\n*${partyDef.name}: "${partyDef.helpedquote[possibleQuote]}"*`

									if (theQuote.includes('%ALLY%'))
										theQuote = theQuote.replace('%ALLY%', petDefs.name)

									healedQuote += theQuote
								}
							}
						}

						DiscordEmbed = new Discord.MessageEmbed()
							.setColor('#e36b2b')
							.setTitle(`${petDefs.name} => Party`)
							.setDescription(`${petDefs.name} used ${skillName}!\nThe Party's HP was fully restored.${healedQuote} ${affinityMessage}`)
							.setFooter(`${petDefs.name}'s turn`);
					} else if (skillDefs.statusheal) {
						for (const i in allySide) {
							let partyDef = allySide[i]
							if (partyDef.hp > 0) {
								if (partyDef.status === "hunger") {
									partyDef.atk = Math.round(partyDef.atk*2)
									partyDef.mag = Math.round(partyDef.mag*2)
									partyDef.prc = Math.round(partyDef.prc*2)
									partyDef.agl = Math.round(partyDef.agl*2)
								}

								partyDef.status = "none";
								partyDef.statusturns = 0;
							
								affinityMessage += turnFuncs.healPassives(partyDef)
							
								if (partyDef.helpedquote && partyDef.helpedquote.length > 0) {
									let possibleQuote = Math.round(Math.random() * (partyDef.helpedquote.length-1))
									let theQuote = `\n*${partyDef.name}: "${partyDef.helpedquote[possibleQuote]}"*`

									if (theQuote.includes('%ALLY%'))
										theQuote = theQuote.replace('%ALLY%', petDefs.name)

									healedQuote += theQuote
								}
							}
						}

						DiscordEmbed = new Discord.MessageEmbed()
							.setColor('#e36b2b')
							.setTitle(`${petDefs.name} => Party`)
							.setDescription(`${petDefs.name} used ${skillName}!\nThe Party was cured of their status ailments.${healedQuote} ${affinityMessage}`)
							.setFooter(`${petDefs.name}'s turn`);
					} else if (skillDefs.healmp) {
						let txt = ``
						for (const i in allySide) {
							let partyDef = allySide[i]								

							let heal = (skillDefs.pow-8) + Math.round(Math.random()*16)

							partyDef.mp = Math.round(Math.min(partyDef.maxmp, partyDef.mp + heal))
							txt += `\n${partyDef.name}'s MP was restored by ${Math.round(heal)}. (${partyDef.mp}/${partyDef.maxmp}MP)`
							
							txt += turnFuncs.healPassives(partyDef)
							
							if (partyDef.helpedquote && partyDef.helpedquote.length > 0) {
								let possibleQuote = Math.round(Math.random() * (partyDef.helpedquote.length-1))
								let theQuote = `\n*${partyDef.name}: "${partyDef.helpedquote[possibleQuote]}"*`

								if (theQuote.includes('%ALLY%'))
									theQuote = theQuote.replace('%ALLY%', petDefs.name)
								
								txt += theQuote
							}
						}

						DiscordEmbed = new Discord.MessageEmbed()
							.setColor('#e36b2b')
							.setTitle(`${petDefs.name} => Party`)
							.setDescription(`${petDefs.name} used ${skillName}!\nThe Party's MP was restored by ${skillDefs.pow}!\n${txt}`)
							.setFooter(`${petDefs.name}'s turn`);
					} else {
						let txt = ``;
						for (const i in allySide) {
							let partyDef = allySide[i]
							if (partyDef.hp > 0) {
								let healAmount = Math.round(heal-8 + Math.round(Math.random()*16))
								partyDef.hp = Math.round(Math.min(partyDef.maxhp, partyDef.hp + healAmount))

								txt += `\n${partyDef.name}'s HP was restored by ${healAmount}. (${partyDef.hp}/${partyDef.maxhp}HP)`							
								txt += turnFuncs.healPassives(partyDef)
							
								if (partyDef.helpedquote && partyDef.helpedquote.length > 0) {
									let possibleQuote = Math.round(Math.random() * (partyDef.helpedquote.length-1))
									let theQuote = `\n*${partyDef.name}: "${partyDef.helpedquote[possibleQuote]}"*`

									if (theQuote.includes('%ALLY%'))
										theQuote = theQuote.replace('%ALLY%', petDefs.name)

									txt += theQuote
								}
								
								charFuncs.trustUp(partyDef, charDefs, 20, message.guild.id, client)
							}
						}

						DiscordEmbed = new Discord.MessageEmbed()
							.setColor('#e36b2b')
							.setTitle(`${petDefs.name} => Party`)
							.setDescription(`${petDefs.name} used ${skillName}!\nThe Party's HP!\n${txt}`)
							.setFooter(`${petDefs.name}'s turn`);
					}
				} else {
					if (skillDefs.target == 'caster') 
						return message.channel.send("You can't use caster skills as a pet!")

					let charDefs2
					let charName2
					if (allySide[arg[1]]) {
						charDefs2 = allySide[arg[1]]
						charName2 = allySide[arg[1]].name
					} else {
						message.channel.send(`${arg[1]} is a nonexistant battler number.`)
						message.delete()
						return
					}

					if (skillDefs.revive) {
						if (charDefs2.hp > 0) {
							message.channel.send(`You can't revive an alive character!`)
							message.delete()
							return
						}

						charDefs2.hp = Math.floor(charDefs2.maxhp / skillDefs.revive)
						
						if (charDefs2.helpedquote && charDefs2.helpedquote.length > 0) {
							let possibleQuote = Math.round(Math.random() * (charDefs2.helpedquote.length-1))
							let theQuote = `\n*${charDefs2.name}: "${charDefs2.helpedquote[possibleQuote]}"*`

							while (theQuote.includes('%ALLY%'))
								theQuote = theQuote.replace('%ALLY%', petDefs.name)

							healedQuote += theQuote
						}

						DiscordEmbed = new Discord.MessageEmbed()
							.setColor('#e36b2b')
							.setTitle(`${petDefs.name} => ${charName2}`)
							.setDescription(`${petDefs.name} used ${skillName}!\n${charName2} was revived by ${petDefs.name}!${healedQuote}`)
							.setFooter(`${petDefs.name}'s turn`);
					} else if (skillDefs.fullheal) {
						if (charDefs2.hp < 0) {
							message.channel.send(`You can't heal a dead character!`)
							message.delete()
							return
						}

						charDefs2.hp = charDefs2.maxhp
						let passives = turnFuncs.healPassives(charDefs2)
						
						if (charDefs2.helpedquote && charDefs2.helpedquote.length > 0) {
							let possibleQuote = Math.round(Math.random() * (charDefs2.helpedquote.length-1))
							let theQuote = `\n*${charDefs2.name}: "${charDefs2.helpedquote[possibleQuote]}"*`

							while (theQuote.includes('%ALLY%'))
								theQuote = theQuote.replace('%ALLY%', petDefs.name)

							healedQuote += theQuote
						}

						DiscordEmbed = new Discord.MessageEmbed()
							.setColor('#e36b2b')
							.setTitle(`${petDefs.name} => ${charName2}`)
							.setDescription(`${petDefs.name} used ${skillName}!\n${charName2}'s HP was fully restored!\n${passives}${healedQuote}`)
							.setFooter(`${petDefs.name}'s turn`);
					} else if (skillDefs.statusheal) {
						if (charDefs2.hp < 0) {
							message.channel.send(`You can't cure a dead character!`)
							message.delete()
							return
						}

						if (charDefs2.status === "hunger") {
							charDefs2.atk = Math.round(charDefs2.atk*2)
							charDefs2.mag = Math.round(charDefs2.mag*2)
							charDefs2.prc = Math.round(charDefs2.prc*2)
							charDefs2.agl = Math.round(charDefs2.agl*2)
						}

						charDefs2.status = "none";
						charDefs2.statusturns = 0;
						let passives = turnFuncs.healPassives(charDefs2)
						
						if (charDefs2.helpedquote && charDefs2.helpedquote.length > 0) {
							let possibleQuote = Math.round(Math.random() * (charDefs2.helpedquote.length-1))
							let theQuote = `\n*${charDefs2.name}: "${charDefs2.helpedquote[possibleQuote]}"*`

							while (theQuote.includes('%ALLY%'))
								theQuote = theQuote.replace('%ALLY%', petDefs.name)

							healedQuote += theQuote
						}

						DiscordEmbed = new Discord.MessageEmbed()
							.setColor('#e36b2b')
							.setTitle(`${petDefs.name} => ${charName2}`)
							.setDescription(`${petDefs.name} used ${skillName}!\n${charName2} was cured of their status!\n${passives}${healedQuote}`)
							.setFooter(`${petDefs.name}'s turn`);
					} else if (skillDefs.healmp) {
						charDefs2.mp = Math.min(charDefs2.maxmp, charDefs2.mp + Math.round(heal-8 + Math.round(Math.random()*16)))
						let passives = turnFuncs.healPassives(charDefs2)
						
						if (charDefs2.helpedquote && charDefs2.helpedquote.length > 0) {
							let possibleQuote = Math.round(Math.random() * (charDefs2.helpedquote.length-1))
							let theQuote = `\n*${charDefs2.name}: "${charDefs2.helpedquote[possibleQuote]}"*`

							while (theQuote.includes('%ALLY%'))
								theQuote = theQuote.replace('%ALLY%', petDefs.name)

							healedQuote += theQuote
						}

						DiscordEmbed = new Discord.MessageEmbed()
							.setColor('#e36b2b')
							.setTitle(`${petDefs.name} => ${charName2}`)
							.setDescription(`${petDefs.name} used ${skillName}!\n${charName2}'s MP was restored by ${Math.round(heal)}! ${passives}${healedQuote}`)
							.setFooter(`${petDefs.name}'s turn`);
					} else {
						if (charDefs2.hp <= 0) {
							message.channel.send(`You can't heal a dead character!`)
							message.delete()
							return
						}

						charDefs2.hp = Math.min(charDefs2.maxhp, charDefs2.hp + Math.round(heal-8 + Math.round(Math.random()*16)))
						let passivesMsg = turnFuncs.healPassives(charDefs2)
						
						if (charDefs2.helpedquote && charDefs2.helpedquote.length > 0) {
							let possibleQuote = Math.round(Math.random() * (charDefs2.helpedquote.length-1))
							let theQuote = `\n*${charDefs2.name}: "${charDefs2.helpedquote[possibleQuote]}"*`

							while (theQuote.includes('%ALLY%'))
								theQuote = theQuote.replace('%ALLY%', petDefs.name)

							healedQuote += theQuote
						}

						DiscordEmbed = new Discord.MessageEmbed()
							.setColor('#e36b2b')
							.setTitle(`${petDefs.name} => ${charName2}`)
							.setDescription(`${petDefs.name} used ${skillName}!\n${charName2}'s HP was restored by ${Math.round(heal)}! ${passivesMsg}${healedQuote}`)
							.setFooter(`${petDefs.name}'s turn`);
					}
				}
			} else if (skillDefs.type === "status") {
				if (skillDefs.splash) {
					DiscordEmbed = new Discord.MessageEmbed()
						.setColor('#e36b2b')
						.setTitle(`${petDefs.name} => Self`)
						.setDescription(`${petDefs.name} used ${skillName}!\n${petDefs.name} flops around!\n...If only this had an effect.`)
                } else if (skillDefs.shield || skillDefs.makarakarn || skillDefs.tetrakarn || skillDefs.trap) {
					let healedQuote = ""

					let effect = 'shield'
					if (skillDefs.makarakarn)
						effect = 'makarakarn';
					else if (skillDefs.tetrakarn)
						effect = 'tetrakarn';
					else if (skillDefs.trap)
						effect = 'trap';

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

							let charName2 = allySide[i].name
								
							if (allySide[i].helpedquote && allySide[i].helpedquote.length > 0) {
								let possibleQuote = Math.round(Math.random() * (allySide[i].helpedquote.length-1))
								let theQuote = `\n*${charName2}: "${allySide[i].helpedquote[possibleQuote]}"*`

								while (theQuote.includes('%ALLY%'))
									theQuote = theQuote.replace('%ALLY%', petDefs.name)

								healedQuote += theQuote
							}
						}

						DiscordEmbed = new Discord.MessageEmbed()
							.setColor('#e36b2b')
							.setTitle(`${petDefs.name} => Allies`)
							.setDescription(`${petDefs.name} used ${skillName}!\nTheir allies were protected by ${skillName}.\n${healedQuote}`)
							.setFooter(`${petDefs.name}'s turn`);
					} else if (allySide[arg[1]]) {
						allySide[arg[1]][effect] = skillName
						if (effect === 'trap') {
							delete allySide[arg[1]][effect]
							allySide[arg[1]].trapType = {
								name: skillName,
								effect: skillDefs.effect
							}
						}

						let charName2 = allySide[arg[1]].name
						if (allySide[arg[1]].helpedquote && allySide[arg[1]].helpedquote.length > 0) {
							let possibleQuote = Math.round(Math.random() * (allySide[arg[1]].helpedquote.length-1))
							let theQuote = `\n*${charName2}: "${allySide[arg[1]].helpedquote[possibleQuote]}"*`

							while (theQuote.includes('%ALLY%'))
								theQuote = theQuote.replace('%ALLY%', petDefs.name)

							healedQuote += theQuote
						}

						DiscordEmbed = new Discord.MessageEmbed()
							.setColor('#e36b2b')
							.setTitle(`${petDefs.name} => ${charName2}`)
							.setDescription(`${petDefs.name} used ${skillName}!\n${charName2} was protected by ${skillName}.${healedQuote}`)
							.setFooter(`${petDefs.name}'s turn`);
					} else {
						message.channel.send("Invalid Ally Position")
						message.delete()
						return false
					}
				} else if (skillDefs.status && skillDefs.statuschance) {
					let enmDefs = oppSide[parseInt(arg[1])]
					let enmName = enmDefs.name
					if (skillDefs.statuschance > 0 || enmDefs.status === "none") {
						let targ = (skillDefs.statuschance + (petDefs.chr - enmDefs.luk));
						if (attackFuncs.physStatus(skillDefs.status))
							targ = (skillDefs.statuschance + (petDefs.luk - enmDefs.luk));

						let chance = Math.round(Math.random()*100);

						const movestatus = skillDefs.status

						let finaltext = `${petDefs.name} used ${skillName} on ${enmDefs.name}!\n`;
						if (chance <= targ || skillDefs.statuschance >= 100) {
							finaltext += attackFuncs.inflictStatus(enmDefs, skillDefs);
							if (enmDefs.hitquote && enmDefs.hitquote.length > 0) {
								let possibleQuote = utilityFuncs.randNum(enmDefs.hitquote.length-1)
								finaltext += `\n*${enmName}: "${enmDefs.hitquote[possibleQuote]}"*`
							}
						} else {
							finaltext += " But they dodged it!"
							if (enmDefs.dodgequote && enmDefs.dodgequote.length > 0) {
								let possibleQuote = Math.round(Math.random() * (enmDefs.dodgequote.length-1))
								finaltext += `\n*${enmName}: "${enmDefs.dodgequote[possibleQuote]}"*`
							}
						}

						DiscordEmbed = new Discord.MessageEmbed()
							.setColor('#e36b2b')
							.setTitle(`${petDefs.name} => ${enmName}`)
							.setDescription(`${finaltext}`)
							.setFooter(`${petDefs.name}'s turn`);
					} else {
						message.channel.send("This move will fail, don't use it!")
						message.delete()
						return false
					}
				} else if (skillDefs.buff) {
					let buffCount = skillDefs.buffCount ? skillDefs.buffCount : 1
					let buffTxt = ['', '', ' twice', ' three times', ' four times', ' five times', ' completely']

					if (skillDefs.target == "allallies") {
						for (let i = 0; i < buffCount; i++) {
							for (const i in allySide) {
								let charDefs2 = allySide[i]
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
						}
			
						DiscordEmbed = new Discord.MessageEmbed()
							.setColor('#e36b2b')
							.setTitle(`${petDefs.name} => All Allies`)
							.setDescription(`${petDefs.name} buffed their allies' ${(skillDefs.buff == "all") ? "Stats" : skillDefs.buff.toUpperCase()}${buffTxt[buffCount]}!`)
							.setFooter(`${petDefs.name}'s turn`);
					} else {
						if (!allySide[arg[1]])
							return message.channel.send('Invalid ally!')
						let charDefs2 = allySide[arg[1]]

						for (let i = 0; i < buffCount; i++) {
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
							.setTitle(`${petDefs.name} => ${charDefs2.name}`)
							.setDescription(`${petDefs.name} buffed ${charDefs2.name}'s ${(skillDefs.buff == "all") ? "Stats" : skillDefs.buff.toUpperCase()}${buffTxt[buffCount]}!`)
							.setFooter(`${petDefs.name}'s turn`);
					}
				} else if (skillDefs.debuff) {
					if (skillDefs.target == "allopposing") {
						for (const i in oppSide) {
							let charDefs2 = oppSide[i]
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
							.setTitle(`${petDefs.name} => All Opposing`)
							.setDescription(`${petDefs.name} debuffed the opposing side's ${(skillDefs.debuff == "all") ? "Stats" : skillDefs.debuff.toUpperCase()}!`)
							.setFooter(`${petDefs.name}'s turn`);
					} else {
						if (!oppSide[arg[1]])
							return message.channel.send('Invalid opponent!')

						let charDefs2 = oppSide[arg[1]]
						if (skillDefs.debuff == "all") {
							charDefs2.buffs.atk = Math.max(-3, charDefs2.buffs.atk-1)
							charDefs2.buffs.mag = Math.max(-3, charDefs2.buffs.mag-1)
							charDefs2.buffs.end = Math.max(-3, charDefs2.buffs.end-1)
							charDefs2.buffs.prc = Math.max(-3, charDefs2.buffs.prc-1)
							charDefs2.buffs.agl = Math.max(-3, charDefs2.buffs.agl-1)
						} else
							charDefs2.buffs[skillDefs.debuff] = Math.max(-3, charDefs2.buffs[skillDefs.debuff]-1);
			
						DiscordEmbed = new Discord.MessageEmbed()
							.setColor('#e36b2b')
							.setTitle(`${petDefs.name} => ${charDefs2.name}`)
							.setDescription(`${petDefs.name} debuffed ${charDefs2.name}'s ${(skillDefs.debuff == "all") ? "Stats" : skillDefs.debuff.toUpperCase()}!`)
							.setFooter(`${petDefs.name}'s turn`);
					}
				} else if (skillDefs.dualbuff) {
					let statStuff = '';
					if (skillDefs.target == "allallies") {
						for (const i in allySide) {
							let charDefs2 = allySide[i]

							for (const k in skillDefs.dualbuff) {
								charDefs2.buffs[skillDefs.dualbuff[k]] = Math.min(3, charDefs2.buffs[skillDefs.dualbuff[k]]+1);
								statStuff += `${skillDefs.dualbuff[k]}`
								
								if (i == skillDefs.dualbuff.length-2)
									statStuff += ' and '
								else if (i >= skillDefs.dualbuff.length-1)
									statStuff += '!'
								else
									statStuff += ', '
							}
						}
			
						DiscordEmbed = new Discord.MessageEmbed()
							.setColor('#e36b2b')
							.setTitle(`${petDefs.name} => All Allies`)
							.setDescription(`${petDefs.name} buffed their allies' ${statStuff}!`)
							.setFooter(`${petDefs.name}'s turn`);
					} else {
						if (!allySide[arg[1]])
							return message.channel.send('Invalid ally!')
						let charDefs2 = allySide[arg[1]]

						for (const k in skillDefs.dualbuff) {
							charDefs2.buffs[skillDefs.dualbuff[k]] = Math.min(3, charDefs2.buffs[skillDefs.dualbuff[k]]+1);
							statStuff += `${skillDefs.dualbuff[k]}`
							
							if (i == skillDefs.dualbuff.length-2)
								statStuff += ' and '
							else if (i >= skillDefs.dualbuff.length-1)
								statStuff += '!'
							else
								statStuff += ', '
						}
			
						DiscordEmbed = new Discord.MessageEmbed()
							.setColor('#e36b2b')
							.setTitle(`${petDefs.name} => ${charDefs2.name}`)
							.setDescription(`${petDefs.name} buffed ${charDefs2.name}'s ${statStuff}!`)
							.setFooter(`${petDefs.name}'s turn`);
					}
				} else if (skillDefs.dekaja) {
					let debuffStats = ['atk', 'mag', 'end', 'agl', 'prc']
					if (skillDefs.target == "allopposing") {
						for (const i in oppSide) {
							let charDefs2 = oppSide[i]
							for (const k in debuffStats) {
								if (charDefs2.buffs[debuffStats[k]] > 0)
									charDefs2.buffs[debuffStats[k]] = 0;
							}
						}
			
						DiscordEmbed = new Discord.MessageEmbed()
							.setColor('#e36b2b')
							.setTitle(`${petDefs.name} => All Opposing`)
							.setDescription(`${petDefs.name} reverted the foes' stats to normal!`)
							.setFooter(`${petDefs.name}'s turn`);
					} else {
						if (!oppSide[arg[1]])
							return message.channel.send('Invalid opponent!')

						let charDefs2 = oppSide[arg[1]]
						for (const k in debuffStats) {
							if (charDefs2.buffs[debuffStats[k]] > 0)
								charDefs2.buffs[debuffStats[k]] = 0;
						}

						DiscordEmbed = new Discord.MessageEmbed()
							.setColor('#e36b2b')
							.setTitle(`${petDefs.name} => ${charDefs2.name}`)
							.setDescription(`${petDefs.name} reverted ${charDefs2.name}'s stats to normal!`)
							.setFooter(`${petDefs.name}'s turn`);
					}
				} else if (skillDefs.futuresight) {
					let oppDefs = oppSide[arg[1]]
					
					if (oppDefs) {
						oppDefs.futureSightSkill = skillDefs.futuresight
						oppDefs.futureSightSkill.user = charDefs

						DiscordEmbed = new Discord.MessageEmbed()
							.setColor('#e36b2b')
							.setTitle(`${petDefs.name} => ${oppDefs.name}`)
							.setDescription(`${petDefs.name} used ${skillDefs.name}!\n${oppDefs.name} is going to be affected by ${petDefs.name}'s future attack.`)
					} else {
						message.channel.send("Invalid enemy.")
						message.delete()
						return false
					}
				} else if (skillDefs.weather) {
					let weatherMessage = {
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
							.setTitle(`${petDefs.name} => Battlefield`)
							.setDescription(`${petDefs.name} used ${skillName}!\n${weatherMessage[skillDefs.weather]}`)
					} else {
						return message.channel.send("This move will fail! Don't use it!")
					}
				} else if (skillDefs.terrain) {
					btl[message.guild.id].terrain = skillDefs.terrain

					DiscordEmbed = new Discord.MessageEmbed()
						.setColor('#e36b2b')
						.setTitle(`${petDefs.name} => Battlefield`)
						.setDescription(`${petDefs.name} used ${skillName}!\n*${skillDefs.terrain.toUpperCase()}* terrain has begun!`)
				} else {
					message.channel.send(`This doesn't work yet!`)
					message.delete()
					return false
				}
			} else {
				let server = message.guild.id
				DiscordEmbed = attackFuncs.attackWithSkill(charDefs, arg[1], allySide, oppSide, btl, skillDefs, server)
			}

			if (DiscordEmbed)
				message.channel.send({embeds: [DiscordEmbed]});
			else
				return message.channel.send('Something went wrong, so I stopped your movement. Try something else.');

			fs.writeFileSync(dataPath+`/Battles/battle-${message.guild.id}.json`, JSON.stringify(btl, null, '    '));

			setTimeout(function() {
				advanceTurn(btl, message.guild.id, true)

				setTimeout(function() {
					message.delete();
				}, 500)
			}, 1500)
		} else
			return message.channel.send(`There's been an issue finding your character!`);

		return true
	} else if (arg[0] == 'pacify') {
		if (btl[message.guild.id].pvp)
			return message.channel.send('You cannot negotiate in PVP!');

		if (!oppSide[arg[1]])
			return message.channel.send(`${arg[3]} is an invalid position.`);

		if (!oppSide[arg[1]].enemy)
			return message.channel.send('You must negotiate with an enemy, not a player!');

		let oppDefs = oppSide[arg[1]]
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

				fs.writeFileSync(dataPath+`/Battles/battle-${message.guild.id}.json`, JSON.stringify(btl, null, '    '));
				message.channel.send({embeds: [DiscordEmbed]})

				setTimeout(function() {
					advanceTurn(btl, message.guild.id, true)

					setTimeout(function() {
						message.delete();
					}, 500)
				}, 1500)
			}
		}

		if (!oppDefs.negotiateOptions)
			return message.channel.send(`${petDefs.name} can't think of anything to calm this enemy with.`)
		
		DiscordEmbed = new Discord.MessageEmbed()
			.setColor('#fcba03')
			.setTitle(`${petDefs.name} => ${oppDefs.name}`)
			.setDescription(`Negotiate with ${oppDefs.name} to calm it down. So far, it is ***${oppDefs.negotiatePercent}%* pacified**. Input a number from 0-${oppDefs.negotiateOptions.length-1}`)
			.addFields()

		for (const i in oppDefs.negotiateOptions)
			DiscordEmbed.fields.push({name: `${i}: ${oppDefs.negotiateOptions[i].name}`, value: oppDefs.negotiateOptions[i].desc, inline: true});

		// Await a responce
		message.channel.send({embeds: [DiscordEmbed]})

		var givenResponce = false
		var collector = message.channel.createMessageCollector({ time: 999999 });
		collector.on('collect', m => {
			if (m.author.id == message.author.id && oppDefs.negotiateOptions[parseInt(m.content)]) {
				doNegotiation(petDefs, oppDefs, parseInt(m.content), m.channel, btl)
				fs.writeFileSync(dataPath+`/Battles/battle-${message.guild.id}.json`, JSON.stringify(btl, null, '    '));

				setTimeout(function() {
					advanceTurn(btl, message.guild.id, true)

					setTimeout(function() {
						message.delete();
						m.delete();
					}, 500)
				}, 1500)

				givenResponce = true
				collector.stop()
			}
		});

		return true
	} else if (arg[0] == 'switchpet') {
		if (!btl[message.guild.id].parties[partyName].negotiateAllies[arg[1]])
			return message.channel.send(`Team ${partyName} has not recruited a ${arg[1]} yet.`)

		var DiscordEmbed = new Discord.MessageEmbed()
			.setColor('#fcba03')
			.setTitle(`${petDefs.name} => ${arg[1]}`)
			.setDescription(`${petDefs.name} steps back from the spot of group pet, to let ${arg[1]} take their place!`)
		message.channel.send({embeds: [DiscordEmbed]})

		btl[message.guild.id].parties[partyName].curPet = arg[1]
		fs.writeFileSync(dataPath+`/Battles/battle-${message.guild.id}.json`, JSON.stringify(btl, null, '    '));

		setTimeout(function() {
			advanceTurn(btl, message.guild.id, true)

			setTimeout(function() {
				message.delete();
			}, 500)
		}, 1500)

		return true
	}
}

//////////////////////////
// Turn Order functions //
//////////////////////////

// Get the turn order
function getTurnOrder(serverBtl) {
	const terrain = serverBtl.changeterrain ? serverBtl.changeterrain.terrain : serverBtl.terrain

	let tempTurnOrder = [];
	for (const i in serverBtl.allies.members) {
		tempTurnOrder.push(serverBtl.allies.members[i]);

		if (serverBtl.allies.members[i].boss || serverBtl.allies.members[i].miniboss) {
			tempTurnOrder.push(serverBtl.allies.members[i])
		}
	}
		
	for (const i in serverBtl.enemies.members) {
		tempTurnOrder.push(serverBtl.enemies.members[i])

		if (serverBtl.enemies.members[i].boss || serverBtl.enemies.members[i].miniboss) {
			tempTurnOrder.push(serverBtl.enemies.members[i])
		}
	}

	if (terrain === 'psychic')
		tempTurnOrder.sort(function(a, b){return a.agl - b.agl});
	else
		tempTurnOrder.sort(function(a, b){return b.agl - a.agl});
	
	console.log("TurnOrder: Generated temporary turn order to be used:")
	for (const i in tempTurnOrder)
		console.log(`${i}: ${tempTurnOrder[i].name}`);
	
	let realTurnOrder = []
	for (const i in tempTurnOrder)
		realTurnOrder[i] = tempTurnOrder[i].id
	
	return realTurnOrder
}

function getBattlerFromID(btl, id, owner) {
	var charDefs
	for (const i in btl.allies.members) {
		if (btl.allies.members[i].id === id) {
			console.log(`Found ${btl.allies.members[i].name} from ID${id}`)
			charDefs = btl.allies.members[i];
			break;
		}
	}
	
	for (const i in btl.enemies.members) {
		if (btl.enemies.members[i].id === id) {
			console.log(`Found ${btl.enemies.members[i].name} from ID${id}`)
			charDefs = btl.enemies.members[i];
			break;
		}
	}
	
	if (owner) {
		if (owner === charDefs.owner || utilityFuncs.RPGBotAdmin(owner))
			return charDefs;
		
		console.log(`<@${owner}> does not own ${charDefs.name}`)
		return undefined;
	} else
		return charDefs;
}

// Sends the Turn Brief
function sendTurnBrief(btl, channel) {
	console.log("StartTurn: Preparing Turn Brief")
	
	console.log("StartTurn: Getting Character Turn")
	const turnOrder = btl[channel.guild.id].turnorder
	const charDefs = getBattlerFromID(btl[channel.guild.id], turnOrder[btl[channel.guild.id].doturn])

	let allySide = btl[channel.guild.id].allies.members
	let opposingSide = btl[channel.guild.id].enemies.members
	if (charFuncs.isOpposingSide(charDefs, btl[channel.guild.id])) {
		allySide = btl[channel.guild.id].enemies.members
		opposingSide = btl[channel.guild.id].allies.members
	}

	let charNum = 0
    let allies = ``
    for (const i in allySide) {
        const ally = allySide[i]
        if (ally.hp > 0) {
			allies += `${ally.negotiated ? '💖' : ''}${ally.golden ? '<:golden:903369740142116887>' : ''}${ally.leader ? "👑" : ''}**${i}**: `
			if (ally.status != "none") {allies += `(${statusEmojis[ally.status]}) `}
			if (turnFuncs.oneMores(channel.guild.id) && ally.down) {allies += "🡇"}
			allies += `${ally.name} *(${ally.hp}/${ally.maxhp}HP) (${ally.mp}/${ally.maxmp}MP)`
			
			if ((charFuncs.hasPassive(ally, "affinitypoint") || charFuncs.hasPassive(ally, "teamworkpoint")) && ally.affinitypoint && ally.affinitypoint > 0)
				allies += ` (${ally.affinitypoint}✰)*`;
			else
				allies += "*";
			
			allies += "\n"
		} else
            allies += `~~**${i}**: ${ally.name} *(DOWN)*~~\n`;
		
		if (charDefs.id == ally.id)
			charNum = i;
    }

    let targets = ""
	let allDown = false
	let downCount = 0
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
			
			if ((charFuncs.hasPassive(enemy, "affinitypoint") || charFuncs.hasPassive(enemy, "teamworkpoint")) && enemy.affinitypoint && enemy.affinitypoint > 0)
				targets += ` (${enemy.affinitypoint}✰)*`;
			else
				targets += "*";
			
			targets += "\n"
		} else
            targets += `~~**${i}**: ${enemy.name} *(DOWN)*~~\n`;
    }
	
	if (downCount == opposingSide.length)
		allDown = true;

	let skills = ""
	for (const i in charDefs.skills) {
		const skillDefs = readSkill(charDefs.skills[i]);
		
		if (!skillDefs.passive && skillDefs.type != "passive") {
			skills += `${elementEmoji[skillDefs.type.toLowerCase()]}${charDefs.skills[i]}\n`
		}
	}
	
	skills += "\n\n**Items**\n"
	let hasItems = false
	
	let party = btl[channel.guild.id].parties[btl[channel.guild.id].battleteam]
	if (charFuncs.isOpposingSide(charDefs, btl[channel.guild.id]))
		party = (btl[channel.guild.id].battleteam2.toLowerCase() != "none") ? btl[channel.guild.id].parties[btl[channel.guild.id].battleteam2] : null;

	let itemPath = dataPath+'/items.json'
	let itemRead = fs.readFileSync(itemPath, {flag: 'as+'});
	let itemFile = JSON.parse(itemRead);
	
	if (party && party.items) {
		for (const i in party.items) {
			if (itemFile[i] && itemFile[i].type != 'material') {
				skills += `${itemTypeEmoji[itemFile[i].type.toLowerCase()]}${itemFile[i].name}: ${party.items[i]}\n`
				hasItems = true
			}
		}
	}
	
	if (!hasItems)
		skills += "No Items.";

    let hpBrief = `__${charDefs.hp}/${charDefs.maxhp}HP__\n__${charDefs.mp}/${charDefs.maxmp}${charDefs.mpMeter[1]}__`
	let otherBrief = `rpg!usemelee ${charNum} <Target Number>`
	
	if (!btl[channel.guild.id].testing) {
		otherBrief += `\nrpg!useitem ${charNum} <Item Name> <Target Number>\nrpg!guard ${charNum}`
		
		if (charDefs.leader)
			otherBrief += `\nrpg!tactics ${charNum} <Run/Negotiate/Backup> <Target>`
		else
			otherBrief += `\nrpg!tactics ${charNum} <Run/Negotiate> <Target>`

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
	}

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

function petTurn(btl, channel, partyName, charDefs, allySide, opposingSide, petDefs) {
	let charNum = 0
    let allies = ``
    for (const i in allySide) {
        const ally = allySide[i]
        if (ally.hp > 0) {
			allies += `${ally.negotiated ? '💖' : ''}${ally.golden ? '<:golden:903369740142116887>' : ''}${ally.leader ? "👑" : ''}**${i}**: `
			if (ally.status != "none") {allies += `(${statusEmojis[ally.status]}) `}
			if (turnFuncs.oneMores(channel.guild.id) && ally.down) {allies += "🡇"}
			allies += `${ally.name} *(${ally.hp}/${ally.maxhp}HP) (${ally.mp}/${ally.maxmp}MP)`
			
			if ((charFuncs.hasPassive(ally, "affinitypoint") || charFuncs.hasPassive(ally, "teamworkpoint")) && ally.affinitypoint && ally.affinitypoint > 0)
				allies += ` (${ally.affinitypoint}✰)*`;
			else
				allies += "*";
			
			allies += "\n"
		} else
            allies += `~~**${i}**: ${ally.name} *(DOWN)*~~\n`;
		
		if (charDefs.id == ally.id)
			charNum = i;
    }

    let targets = ""
	let allDown = false
	let downCount = 0
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
			
			if ((charFuncs.hasPassive(enemy, "affinitypoint") || charFuncs.hasPassive(enemy, "teamworkpoint")) && enemy.affinitypoint && enemy.affinitypoint > 0)
				targets += ` (${enemy.affinitypoint}✰)*`;
			else
				targets += "*";
			
			targets += "\n"
		} else
            targets += `~~**${i}**: ${enemy.name} *(DOWN)*~~\n`;
    }

	let skills = ""
	const skillDefs = readSkill(petDefs.skill);
	if (!skillDefs.passive && skillDefs.type != "passive")
		skills += `${elementEmoji[skillDefs.type.toLowerCase()]}${petDefs.skill}\n`;

    let harassedUser = client.users.fetch(charDefs.owner)
    harassedUser.then(function(user) {
        const DiscordEmbed = new Discord.MessageEmbed()
            .setColor('#0099ff')
			.setTitle(`Turn ${btl[channel.guild.id].turn} - ${petDefs.name}'s turn!`)
			.setDescription(`*${petDefs.name} is eager to help! **${charDefs.name}**, tell them to do something!*`)
            .addFields(
                { name: `Enemies`, value: `${targets}`, inline: true },
                { name: `Allies`, value: `${allies}`, inline: true },
                { name: `Skills`, value: `${skills}`, inline: true },
                { name: `Actions`, value: '\nrpg!petskill <Target>\nrpg!pacify <Target>\nrpg!switchpet <Pet Name>', inline: false },
            )
		channel.send({content: `${user}`, embeds: [DiscordEmbed]});

		var givenResponce = false
		var collector = channel.createMessageCollector({ time: 120000 });
		collector.on('collect', m => {
			if (m.author.id == charDefs.owner || utilityFuncs.RPGBotAdmin(m.author.id)) {
				if (petMove(m, client, btl, partyName, petDefs, allySide, opposingSide) == true) {
					givenResponce = true
					collector.stop()
				}
			}
		});
		collector.on('end', c => {
			if (givenResponce == false) {
				channel.send('No response given.')
				petTurn(btl, channel, partyName, charDefs, allySide, opposingSide, petDefs)
			}
		})
    })
}

// Clear reincarnates
function clearClones(btl) {
	for (const i in btl.allies.members) {
		if (btl.allies.members[i].undead || btl.allies.members[i].clone)
			delete btl.allies.members[i];
	}
	
	for (const i in btl.enemies.members) {
		if (btl.enemies.members[i].undead || btl.enemies.members[i].clone)
			delete btl.enemies.members[i];
	}
}

function advanceTurn(btl, server, ignorePet) {
	delete btl[server].petattack;

    // Begin with doing checks to see if they should end the battle.
	// Clear clones & undead too.
	// Do end of turn events too.

    // Should the player side win?
	
	let allFighters = []

	let enemy;
    var enemiesLeft = 0;
    for (const enm in btl[server].enemies.members) {
        enemy = btl[server].enemies.members[enm]
        if (enemy.hp > 0 && !enemy.negotiated) {
            enemiesLeft = enemiesLeft + 1
        } else {
			if (enemy.mimic = true)
				charFuncs.resetMimic(enemy);
			
			if (charFuncs.equippedCharm(enemy, "PureVision"))
				enemy.buffs.prc = 0;

			if (enemy.status == "hunger") {
				enemy.atk *= 2
				enemy.end *= 2
				enemy.mag *= 2
				enemy.prc *= 2
			}

			enemy.status = "none";
			enemy.statusturns = 0;
			enemy.lb = 0;
			
			if (enemy.healVerse)
				delete enemy.healVerse

			if (enemy.clone || enemy.undead) {
				delete btl[server].enemies.members[enm];
				return;
			}
			
			if (btl[server].testing) {
				client.channels.fetch(btl[server].battlechannel)
					.then(channel => channel.send('Your testing is over.'))

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

				delete btl[server].testing;

				fs.writeFile(dataPath+'/Battles/battle-' + server + '.json', JSON.stringify(btl, null, '    '), function(err) { if (err) throw err });	
				return
			}
		}
    }

    // Should the Enemy Side win?
	let p;
    var playersLeft = 0;
    for (const player in btl[server].allies.members) {
        p = btl[server].allies.members[player]
        if (p.hp > 0) {
            playersLeft = playersLeft + 1
        } else {
			if (p.mimic = true)
				charFuncs.resetMimic(p);
			
			if (charFuncs.equippedCharm(p, "PureVision"))
				p.buffs.prc = 0;

			if (p.status == "hunger") {
				p.atk *= 2
				p.end *= 2
				p.mag *= 2
				p.prc *= 2
			}

			p.status = "none";
			p.statusturns = 0;
			p.lb = 0;

			if (p.healVerse)
				delete p.healVerse

			if (p.clone || p.undead) {
				delete btl[server].allies.members[player];
				return;
			}
		}
    }

	if (!btl[server].testing) {
		// LOl we have a draw here folks cause 	WE SUCK ASSs
		// In PVP, it is a draw, but in regular battles, the enemies always win.
		if (enemiesLeft <= 0 && playersLeft <= 0) {
			clearClones(btl[server]);
			if (btl[server].pvp) {
				console.log("Draw this battle!")
				drawBattle(btl, server)
				return
			} else {
				console.log("Lose this battle!")
				loseBattle(btl, server)
				return
			}
		// The Enemies won
		} else if (playersLeft <= 0) {
			console.log("Lose this battle!")
			clearClones(btl[server]);
			loseBattle(btl, server);
			return
		// The Players Won
		} else if (enemiesLeft <= 0) {
			console.log("Win this battle!")
			clearClones(btl[server]);
			winBattle(btl, server);
			return
		}
	}
	
	// Advance the turn. + ONEMORE CHECK
    let defs;
	let shouldInfect = false;
	let infectTeam = "";
	
	btl[server].turnorder = getTurnOrder(btl[server]);
	if (btl[server].onemore && turnFuncs.oneMores(server)) {
		delete btl[server].onemore
		
		// Use ID
		defs = getBattlerFromID(btl[server], btl[server].turnorder[btl[server].doturn])
		
		// Should we skip this turn because the character is dead or negotiated
		var skipTurn = false
		if (!defs.hp || defs.hp <= 0)
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

			defs = getBattlerFromID(btl[server], btl[server].turnorder[btl[server].doturn])
			if (defs && defs.leader && !ignorePet) {
				let partyName = btl[server].battleteam
				let allyParty = btl[server].parties[btl[server].battleteam]
				let allySide = btl[server].allies.members
				let oppSide = btl[server].enemies.members
				if (charFuncs.isOpposingSide(defs, btl[server])) {
					allyParty = btl[server].parties[btl[server].battleteam2]
					partyName = btl[server].battleteam2
					allySide = btl[server].allies.members
					oppSide = btl[server].enemies.members
				}

				if (allyParty && allyParty.curPet && allyParty.negotiateAllies[allyParty.curPet]) {
					btl[server].petattack = true;
					fs.writeFileSync(dataPath+`/Battles/battle-${server}.json`, JSON.stringify(btl, null, '    '), function (err) { if (err) throw err });
			
					setTimeout(function() {
						client.channels.fetch(btl[server].battlechannel)
							.then(channel => petTurn(btl, channel, partyName, defs, allySide, oppSide, allyParty.negotiateAllies[allyParty.curPet]))
					}, 2000);

					return
				}
			}

			// now revert the defs
			defs = getBattlerFromID(btl[server], btl[server].turnorder[(btl[server].doturn && btl[server].doturn >= 0) ? btl[server].doturn : 0])

			if (defs && defs.status && defs.status === 'illness') {
				let chance = Math.round(Math.random()*100);

				if (chance <= 33) {
					shouldInfect = true;
					infectTeam = defs.team;
				}
			}

			if (btl[server].doturn <= -1) {
				btl[server].doturn = 0
				console.log('TurnOrder: First turn');
			} else {
				if (btl[server].turnorder[btl[server].doturn+1] != undefined) {
					btl[server].doturn++;
					console.log(`TurnOrder: Next Turn - Turn ${btl[server].doturn}`);
				} else {
					console.log('TurnOrder: Reset Turn Order');
					btl[server].doturn = 0;
					btl[server].turn++;
				}
			}

			defs = getBattlerFromID(btl[server], btl[server].turnorder[btl[server].doturn])

			// Should we skip this turn because the character is dead or negotiated
			let skipTurn = false
			if (!defs.hp || defs.hp <= 0)
				skipTurn = true;
			if (defs.negotiated)
				skipTurn = true;

			if (!skipTurn)
				break;
			else
				console.log('Skip this turn because this character is dead!');
		}
	}
	
	if (btl[server].testing && (defs.enemy || defs.npc)) {
		client.channels.fetch(btl[server].battlechannel)
			.then(channel => channel.send('Your testing is over.'))

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

		delete btl[server].testing;

		fs.writeFile(dataPath+'/Battles/battle-' + server + '.json', JSON.stringify(btl, null, '    '), function(err) { if (err) throw err });	
		return
	}
	
	console.log(defs)

    // Send channel, also handles passives, status effects and shit
    if (btl[server].battling == true) {
		let result = [{}, "continue"];

		let skillPath = dataPath+'/skills.json'
		let skillRead = fs.readFileSync(skillPath, {flag: 'as+'});
		let skillFile = JSON.parse(skillRead);
		let itemPath = dataPath+'/items.json'
		let itemRead = fs.readFileSync(itemPath, {flag: 'as+'});
		let itemFile = JSON.parse(itemRead);

		var fighterDefs = defs;

		if (shouldInfect && fighterDefs === infectTeam) {
			fighterDefs.status = "illness";
			fighterDefs.statuschance = 3;

			client.channels.fetch(btl[server].battlechannel)
				.then(channel => channel.send(`The illness spread to ${fighterDefs.name}!`))
		}
		
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
		
		/*
			Terrains and weathers
			- Grassy heals by 1/10th, or just 20 HP for bosses
			- Hail and Sandstorm damage. Sandstorm also lowers perception.
		*/

		const weather = btl[server].changeweather ? btl[server].changeweather.weather : btl[server].weather
		const terrain = btl[server].changeterrain ? btl[server].changeterrain.terrain : btl[server].terrain

		switch(weather) {
			case 'hail':
				if (!fighterDefs.mainElement || fighterDefs.mainElement != 'ice') {
					let dmgAmount = Math.round(fighterDefs.maxhp/10)
					if (fighterDefs.miniboss || fighterDefs.boss || fighterDefs.diety)
						dmgAmount = 15;

					fighterDefs.hp = Math.max(0, fighterDefs.hp - dmgAmount)
					client.channels.fetch(btl[server].battlechannel)
						.then(channel => channel.send(`The Hail damaged ${fighterDefs.name}, dealing ${dmgAmount} damage!`))
				}

				break;

			case 'sandstorm':
				if (!fighterDefs.mainElement || fighterDefs.mainElement != 'earth') {
					let dmgAmount = Math.round(fighterDefs.maxhp/20)
					if (fighterDefs.miniboss || fighterDefs.boss || fighterDefs.diety)
						dmgAmount = 5;

					charFuncs.buffStat(fighterDefs, 'prc', -1)
					fighterDefs.hp = Math.max(0, fighterDefs.hp - dmgAmount)
					client.channels.fetch(btl[server].battlechannel)
						.then(channel => channel.send(`The Sandstorm damaged ${fighterDefs.name}, dealing ${dmgAmount} damage, and lowering their PRC!`))
				}

				break;
		}

		switch(terrain) {
			case 'grassy':
				let healAmount = Math.round(fighterDefs.maxhp/10)
				if (fighterDefs.miniboss || fighterDefs.boss || fighterDefs.diety)
					healAmount = 20;

				fighterDefs.hp = Math.min(fighterDefs.maxhp, fighterDefs.hp + healAmount)
				client.channels.fetch(btl[server].battlechannel)
					.then(channel => channel.send(`The Grassy Terrain restored ${fighterDefs.name}'s HP by ${healAmount}!`))
		}

		/* 
			Other on-turn things
			- regenheal skills restore health by the specified amount.
		*/

		if (fighterDefs.regenHeal) {
			fighterDefs.hp = Math.min(fighterDefs.maxhp, fighterDefs.regenHeal[0]);

			client.channels.fetch(btl[server].battlechannel)
				.then(channel => channel.send(`${fighterDefs.name}'s regenerating aura restores their health by ${fighterDefs.regenHeal[0]}.`))

			fighterDefs.regenHeal[1] -= 1
			if (fighterDefs.healVerse.turns <= 0)
				delete fighterDefs.regenHeal;
		}

		if (btl[server].changeweather) {
			btl[server].changeweather.weathertime--;
			
			if (btl[server].changeweather.weathertime <= 0) {
				let theWeather = btl[server].changeweather.weather
				client.channels.fetch(btl[server].battlechannel)
					.then(channel => channel.send(`The ${theWeather} weather subsided.`))

				delete btl[server].changeweather
			}
		}

		if (btl[server].changeterrain) {
			btl[server].changeterrain.terraintime--;
			
			if (btl[server].changeterrain.terraintime <= 0) {
				let theTerrain = btl[server].changeterrain.terrain
				client.channels.fetch(btl[server].battlechannel)
					.then(channel => channel.send(`The ${theTerrain} weather subsided.`))

				delete btl[server].changeterrain
			}
		}
		
		let partyDefs = btl[server].parties[btl[server].battleteam];
		if (charFuncs.isOpposingSide(fighterDefs, btl[server]))
			partyDefs = btl[server].parties[btl[server].battleteam2];

		fighterDefs.guard = false;
		if (result[1] && result[1] === "continue" && fighterDefs.hp > 0) {
			setTimeout(function() {
				if (fighterDefs.enemy || fighterDefs.npc) {
					client.channels.fetch(btl[server].battlechannel)
						.then(channel => enemyMove(fighterDefs.id, btl, channel))
				} else {
					client.channels.fetch(btl[server].battlechannel)
						.then(channel => sendTurnBrief(btl, channel))
				}
			}, 1000);
		} else if (result[1] && result[1] === "skip") {
			setTimeout(function() {
				advanceTurn(btl, server)
			}, 1000);
		}
    }

    fs.writeFileSync(`${dataPath}/Battles/battle-${server}.json`, JSON.stringify(btl, null, '    '), function (err) { if (err) throw err });

    return btl
}

function sendCharStats(user, charDefs) {
	let charAffs = "";
	for (const i in charDefs.superweak) {charAffs += `${charDefs.superweak[i]} super weakness.\n`}
	for (const i in charDefs.weak) {charAffs += `${charDefs.weak[i]} weakness.\n`}
	for (const i in charDefs.resist) {charAffs += `${charDefs.resist[i]} resist.\n`}
	for (const i in charDefs.block) {charAffs += `${charDefs.block[i]} block.\n`}
	for (const i in charDefs.repel) {charAffs += `${charDefs.repel[i]} repel.\n`}
	for (const i in charDefs.drain) {charAffs += `${charDefs.drain[i]} drain.\n`}
	if (charAffs === "") {charAffs = "No Affinities that battle."}
	
	let charPassives = ''
	for (const i in charDefs.skills) {
		let skillDefs = readSkill(charDefs.skills[i])
		
		if (skillDefs && skillDefs.passive)
			charPassives += '\n' + skillDefs.name;
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
	let drawQuotes = [
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
			let owner = client.users.fetch(charDefs.owner)
			owner.then(function(owner) {
				sendCharStats(owner, charDefs)
			})
		}
	}
		
	for (const i in btl[server].enemies.members) {
		const charDefs = btl[server].enemies.members[i]
	
		if ((btl[server].pvpmode === 'randstats' || btl[server].pvpmode === 'charfuck') && charDefs.owner) {			
			let owner = client.users.fetch(charDefs.owner)
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

	fs.writeFile(dataPath+'/Battles/battle-' + server + '.json', JSON.stringify(btl, null, '    '), function(err) { if (err) throw err });			
	return true
}

function nextWave(btl, server) {
    if (btl[server].colosseum[0] == true) {
		let trialObj = btl[server].trials[btl[server].colosseum[2]]
		if (trialObj.endless) {
			// Level Up
			if (!btl[server].colosseum[3]) {
				btl[server].colosseum[3] = {
					curLvl: 1,
					lvlLeft: 2,
					upperBound: 0,
					lowerBound: 0
				}
			}
			
			btl[server].colosseum[1]++;
			
			btl[server].colosseum[3].curLvl++;
			btl[server].colosseum[3].lvlLeft--;
			
			for (const i in btl[server].allies.members)
				charFuncs.lvlUp(btl[server].allies.members[i], false, server);
			for (const i in btl[server].allies.backup)
				charFuncs.lvlUp(btl[server].allies.backup[i], false, server);
			
			btl[server].colosseum[3].upperBound++;
			if (!trialObj.waves[btl[server].colosseum[3].upperBound])
				btl[server].colosseum[3].upperBound--;

			if (btl[server].colosseum[3].lvlLeft <= 0) {
				btl[server].colosseum[3].lowerBound++;
				if (!trialObj.waves[btl[server].colosseum[3].lowerBound])
					btl[server].colosseum[3].lowerBound--;

				btl[server].colosseum[3].lvlLeft = 2
			}

			// Randomize Waves
			let waveNum = utilityFuncs.randBetweenNums(btl[server].colosseum[3].lowerBound, btl[server].colosseum[3].upperBound)				
			btl[server].enemies.members = [];

			// Spawn Wave
			let bossWave = false;
			let miniBossWave = false;
			let battlerID = btl[server].allies.members.length
			for (const trial in trialObj.waves[waveNum]) {
				let enmName = trialObj.waves[waveNum][trial]
				if (readEnm(enmName, server)) {
					let enemyDefs = enemyFuncs.genEnm(enmName, server)
					enemyDefs.id = battlerID;
					

					btl[server].enemies.members.push(enemyDefs);
					if (enemyDefs.miniboss)
						miniBossWave = true;
					else if (enemyDefs.boss) 
						bossWave = true;

					console.log(`BattleStatus: ${enmName} generated.`);
					battlerID++;
				} else {
					client.channels.fetch(btl[server].battlechannel)
						.then(channel => channel.send(`${enmName} in the trial of ${btl[server].colosseum[2]} is an invalid enemy.`))
				}
			}
			
			btl[server].turnorder = getTurnOrder(btl[server])
			fs.writeFileSync(dataPath+'/Battles/battle-' + server + '.json', JSON.stringify(btl, null, '    '));

			var DiscordEmbed = new Discord.MessageEmbed()
				.setColor('#9c39ed')
				.setTitle(`Team ${btl[server].battleteam} defeated the enemies!`)
				.setDescription('They levelled up **once**!\nBut before long, the next wave is arrives!')
				.setFooter(`Wave ${btl[server].colosseum[1]}`);

			if (miniBossWave == true) {
				DiscordEmbed.setDescription('They levelled up **once**!\nBut before long, the next wave is arrives!\nA powerful enemy arises.')
				DiscordEmbed.setFooter(`Wave ${btl[server].colosseum[1]} - Mini Boss Wave`);
			} else if (bossWave == true) {
				DiscordEmbed.setDescription('They levelled up **once**!\nBut before long, the next wave is arrives!\nA strong enemy resonates within...')
				DiscordEmbed.setFooter(`Wave ${btl[server].colosseum[1]} - Boss Wave`);

				playThemeType(server, "colosseumstrong")
			}

			client.channels.fetch(btl[server].battlechannel)
				.then(channel => channel.send({embeds: [DiscordEmbed]}))

			console.log('BattleStatus: Next Randomized Wave, ID ' + waveNum);

			advanceTurn(btl, server)
			fs.writeFileSync(dataPath+'/Battles/battle-' + server + '.json', JSON.stringify(btl, null, '    '));
		} else {
			if (trialObj.waves[btl[server].colosseum[1] + 1]) {
				btl[server].colosseum[1]++;
				btl[server].enemies.members = [];

				let bossWave = false;
				let miniBossWave = false;
				let battlerID = btl[server].allies.members.length
				for (const trial in trialObj.waves[btl[server].colosseum[1]]) {
					let enmName = trialObj.waves[btl[server].colosseum[1]][trial]
					if (readEnm(enmName, server)) {
						let enemyDefs = enemyFuncs.genEnm(enmName, server)
						enemyDefs.id = battlerID;
						
						btl[server].enemies.members.push(enemyDefs);

						if (enemyDefs.miniboss)
							miniBossWave = true;
						else if (enemyDefs.boss) 
							bossWave = true;

						console.log(`BattleStatus: ${enmName} generated.`);
						battlerID++;
					} else {
						client.channels.fetch(btl[server].battlechannel)
							.then(channel => channel.send(`${enmName} in the trial of ${btl[server].colosseum[2]} is an invalid enemy.`))
					}
				}

				btl[server].turnorder = getTurnOrder(btl[server])
				fs.writeFileSync(dataPath+'/Battles/battle-' + server + '.json', JSON.stringify(btl, null, '    '));

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
				fs.writeFileSync(dataPath+'/Battles/battle-' + server + '.json', JSON.stringify(btl, null, '    '));
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
				fs.writeFileSync(dataPath+'/Battles/battle-' + server + '.json', JSON.stringify(btl, null, '    '));
			}
		}

        return true
    }
}

function loseColosseum(btl, server) {
	var DiscordEmbed
	let trialObj = btl[server].trials[btl[server].colosseum[2]]
	if (trialObj.endless) {
		let partyDefs = btl[server].parties[btl[server].battleteam]
		if (!partyDefs.endless) {
			partyDefs.endless = {
				highscores: 0,
				saves: 0
			}
		}
		
		partyDefs.endless.saves = btl[server].allies.members[0].level-1
		partyDefs.endless.highscores[btl[server].colosseum[2]] = parseInt(btl[server].colosseum[1]);

		discordEmbed = new Discord.MessageEmbed()
			.setColor('#d613cc')
			.setTitle(`Team ${btl[server].battleteam} lost!`)
			.setDescription(`You lost on wave ${btl[server].colosseum[1]}!\n**Your progress has been saved.** Input rpg!startcolosseum ${btl[server].battleteam} ${btl[server].colosseum[2]} ${btl[server].colosseum[1]} to try again, from this wave.`)
	} else {
		discordEmbed = new Discord.MessageEmbed()
			.setColor('#d613cc')
			.setTitle(`Team ${btl[server].battleteam} lost!`)
			.setDescription(`You lost on wave ${btl[server].colosseum[1]}!\nBetter luck next time...`)
	}

	client.channels.fetch(btl[server].battlechannel)
		.then(channel => channel.send({embeds: [discordEmbed]}))
	playThemeType(server, "loss")

	turnFuncs.clearBTL(btl[server])
	fs.writeFileSync(dataPath+'/Battles/battle-' + server + '.json', JSON.stringify(btl, null, '    '));
}
	
function winBattle(btl, server) {
    let charPath = dataPath+'/characters.json'
    let charRead = fs.readFileSync(charPath, {flag: 'as+'});
    let charFile = JSON.parse(charRead);
	
	let servPath = dataPath+'/Server Settings/server.json'
	let servRead = fs.readFileSync(servPath, {flag: 'as+'});
	let servFile = JSON.parse(servRead);
	
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
				levelUpFormula: "original",
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
		
		let pointTxt = ''
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
			
			let pvpDefs = servFile[server].pvpstuff[btl[server].pvpmode]
			const charDefs = btl[server].allies.members[i]
			
			if (charDefs.owner && btl[server].ranked == true) {
				if (!pvpDefs[charDefs.owner]) {
					pvpDefs[charDefs.owner] = {
						points: 0
					}
				}

				if (!pvpDefs[charDefs.owner].points)
					pvpDefs[charDefs.owner].points = 0;
			
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
			}
				
			if ((btl[server].pvpmode === 'randstats' || btl[server].pvpmode === 'charfuck') && charDefs.owner) {			
				let owner = client.users.fetch(charDefs.owner)
				owner.then(function(owner) {
					sendCharStats(owner, charDefs)
				})
			}
		}
		
		for (const i in btl[server].enemies.members) {
			const charDefs = btl[server].enemies.members[i]
		
			if ((btl[server].pvpmode === 'randstats' || btl[server].pvpmode === 'charfuck') && charDefs.owner) {			
				let owner = client.users.fetch(charDefs.owner)
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
			.setDescription(`${btl[server].ranked ? pointTxt : "Well Done!"}`)

		client.channels.fetch(btl[server].battlechannel)
			.then(channel => channel.send({embeds: [DiscordEmbed]}))
		
		fs.writeFileSync(servPath, JSON.stringify(servFile, null, '    '));
			
		turnFuncs.clearBTL(btl[server])
		
		forceStop();

		fs.writeFile(dataPath+'/Battles/battle-' + server + '.json', JSON.stringify(btl, null, '    '), function (err) { if (err) throw err });			
		return true
	}

    if (btl[server].colosseum[0] == true) {
		nextWave(btl, server)
        return true
    }

    // XP and Rings
    let totalXP = 0;
    let totalRings = 0;
	let isBigBoss = false;
    for (const enemy in btl[server].enemies.members) {
		const enmStats = btl[server].enemies.members[enemy]
		const enmDefs = readEnm(btl[server].enemies.members[enemy].name, server)

		if (enmDefs.diety || enmDefs.bigboss)
			isBigBoss = true;

        let enmXP = Math.round(parseInt(enmDefs.awardxp) * parseFloat(servFile[server].xprate))
		let enmRings = 100+Math.round(Math.random() * 100)
		if (isBigBoss)
            enmRings = 1000+Math.round(Math.random() * 500);
        else if (enmDefs.boss || enmDefs.miniboss)
            enmRings = 600+Math.round(Math.random() * 400);

		if (enmStats.negotiated) {
			enmRings *= 2
			enmXP = Math.round(enmXP*0.6)
		}
		
		if (enmStats.golden) {
			enmRings *= 3
			enmXP *= 5
		}

		totalXP += Math.round(enmXP)
		totalRings += Math.round(enmRings)
    }

	for (const i in btl[server].allies.members) {
		let charDefs = btl[server].allies.members[i]
		if (parseFloat(servFile[server].xprate) > 0)
			totalXP += Math.round(charDefs.int*2.5);

		if (charFuncs.equippedCharm(charDefs, "GatheringSwarm"))
			totalRings = Math.round(totalRings*1.3);

		if (charFuncs.equippedCharm(charDefs, "FragileGreed") || charFuncs.equippedCharm(charDefs, "UnbreakableGreed"))
			totalRings = Math.round(totalRings*1.7);
	}
	
	let partyDefs = {
		members: [],
		backup: []
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
			charFuncs.trustUp(charDefs, allyDefs, 60, server, client)
		}
		for (const k in btl[server].allies.backup) {
			const allyDefs = btl[server].allies.backup[k]
			charFuncs.trustUp(charDefs, allyDefs, 60, server, client)
		}

		// Award XP now
		charDefs.xp = Math.round(charDefs.xp + totalXP);
		console.log(`BattleStatus: ${charDefs.name} got ${totalXP}XP. (${charDefs.xp}/${charDefs.maxxp}XP)`)

		let xpPercent = Math.floor((charDefs.xp/charDefs.maxxp)*100)
		let xpSquares = xpPercent/10
		let xpStr = `[${'🟦'.repeat(Math.max(0, xpSquares))}${'⬛'.repeat(Math.max(0, 10 - xpSquares))}]`

		client.channels.fetch(btl[server].battlechannel)
			.then(channel => channel.send(`${charDefs.name} got **${totalXP}EXP**!\n${xpStr}`))

		let shouldLevelUp = false;
		if (charDefs.xp >= charDefs.maxxp)
			shouldLevelUp = true;

		if (shouldLevelUp == true) {
			let levelCount = 0
			while (charDefs.xp >= charDefs.maxxp) {
				if (battlerDefs.lvlUpQueue)
					charDefs.lvlUpQueue = battlerDefs.lvlUpQueue;

				charFuncs.lvlUp(charDefs, false, server)
				levelCount++;
			}

			console.log(`BattleStatus: ${charDefs.name} levelled up ${levelCount} time(s)`)
			
			let lvlQuote = ""
			if (charDefs.lvlquote && charDefs.lvlquote.length > 0) {
				let possibleQuote = Math.round(Math.random() * (charDefs.lvlquote.length-1))
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
		charDefs.trust = battlerDefs.trust;

		partyDefs.members.push(battlerDefs.truename)
    }
	
	// Backup Members get halved XP
    for (const i in btl[server].allies.backup) {
		const battlerDefs = btl[server].allies.backup[i] // Character inbattle
		const charDefs = charFile[battlerDefs.truename] // Character to transfer shit to
		
		// Reset Mimic
		charFuncs.resetMimic(battlerDefs)
		charFuncs.resetMimic(charDefs)
		
		// Trust Levels
		for (const k in btl[server].allies.members) {
			const allyDefs = btl[server].allies.members[k]
			charFuncs.trustUp(charDefs, allyDefs, 30, server, client)
		}
		for (const k in btl[server].allies.backup) {
			const allyDefs = btl[server].allies.backup[k]
			charFuncs.trustUp(charDefs, allyDefs, 30, server, client)
		}

		// Award XP now
		charDefs.xp = Math.round(charDefs.xp + totalXP/2);
		console.log(`BattleStatus: ${charDefs.name} got ${totalXP/2}XP. (${charDefs.xp}/${charDefs.maxxp}XP)`)

		let xpPercent = Math.floor((charDefs.xp/charDefs.maxxp)*100)
		let xpSquares = xpPercent/5
		let xpStr = `[${'🟦'.repeat(Math.max(0, xpSquares))}${'⬛'.repeat(Math.max(0, 20 - xpSquares))}]`

		client.channels.fetch(btl[server].battlechannel)
			.then(channel => channel.send(`${charDefs.name} got **${Math.round(totalXP/2)}EXP**!\n${xpStr}`))

		let shouldLevelUp = false;
		if (charDefs.xp >= charDefs.maxxp)
			shouldLevelUp = true;

		if (shouldLevelUp == true) {
			let levelCount = 0
			while (charDefs.xp >= charDefs.maxxp) {
				charFuncs.lvlUp(charDefs, false, server)
				levelCount++;
			}

			console.log(`BattleStatus: ${charDefs.name} levelled up ${levelCount} time(s)`)
			
			let lvlQuote = ""
			if (charDefs.lvlquote && charDefs.lvlquote.length > 0) {
				let possibleQuote = Math.round(Math.random() * (charDefs.lvlquote.length-1))
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
		charDefs.trust = battlerDefs.trust;

		partyDefs.backup.push(battlerDefs.truename)
    }
	
	btl[server].parties[btl[server].battleteam].members = partyDefs.members
	btl[server].parties[btl[server].battleteam].backup = partyDefs.backup

    // Award Rings
    if (totalRings > 0)
        btl[server].parties[btl[server].battleteam].rings = (btl[server].parties[btl[server].battleteam].rings + totalRings);
	
	// Item Drops
	let additionalText = ``
	let itemList = ``
	
	for (const enemy in btl[server].enemies.members) {
		let lootPath = `${dataPath}/Loot/lootTables-${server}.json`
		let lootRead = fs.readFileSync(lootPath, {flag: 'as+'});
		let lootFile = JSON.parse(lootRead);

		const enmDefs = readEnm(btl[server].enemies.members[enemy].name, server)

		if (enmDefs.loot || enmDefs.loot !== '' || enmDefs.loot !== undefined) {
			if (lootFile[enmDefs.loot]) {
				console.log('BattleStatus: Opening Loot')

				let itemInput = lootFile[enmDefs.loot].items
				let chanceInput = lootFile[enmDefs.loot].itemChances

				for (const loot in itemInput) {
					let itemChance = chanceInput[loot]
					
					if (btl[server].enemies.members[enemy].golden)
						itemChance *= 4;

					if (Math.round(Math.random()*100) <= itemChance) {
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
    fs.writeFile(dataPath+'/Battles/battle-' + server + '.json', JSON.stringify(btl, null, '    '), function (err) {if (err) throw err});
    fs.writeFile(charPath, JSON.stringify(charFile, null, '    '), function (err) {if (err) throw err});
}

function loseBattle(btl, server) {
	let servPath = dataPath+'/Server Settings/server.json'
	let servRead = fs.readFileSync(servPath, {flag: 'as+'});
	let servFile = JSON.parse(servRead);

	// Colosseum
    if (btl[server].colosseum[0] == true) {
		loseColosseum(btl, server)
        return true
    }

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
				levelUpFormula: "original",
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
		
		let pointTxt = ''
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

			let pvpDefs = servFile[server].pvpstuff[btl[server].pvpmode]
			const charDefs = btl[server].enemies.members[i]
			
			if (charDefs.owner && btl[server].ranked == true) {
				if (!pvpDefs[charDefs.owner]) {
					pvpDefs[charDefs.owner] = {
						points: 0
					}
				}

				if (!pvpDefs[charDefs.owner].points)
					pvpDefs[charDefs.owner].points = 0;
			
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
			}
				
			if ((btl[server].pvpmode === 'randstats' || btl[server].pvpmode === 'charfuck') && charDefs.owner) {			
				let owner = client.users.fetch(charDefs.owner)
				owner.then(function(owner) {
					sendCharStats(owner, charDefs)
				})
			}
		}
		
		for (const i in btl[server].allies.members) {
			const charDefs = btl[server].allies.members[i]
		
			if ((btl[server].pvpmode === 'randstats' || btl[server].pvpmode === 'charfuck') && charDefs.owner) {			
				let owner = client.users.fetch(charDefs.owner)
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
			.setDescription(`${btl[server].ranked ? pointTxt : "Well Done!"}`)

		client.channels.fetch(btl[server].battlechannel)
			.then(channel => channel.send({embeds: [DiscordEmbed]}))
			
		forceStop();
		turnFuncs.clearBTL(btl[server])
		fs.writeFile(dataPath+'/Battles/battle-' + server + '.json', JSON.stringify(btl, null, '    '), function (err) { if (err) throw err });
		return true
	}

    let charPath = dataPath+'/characters.json'
    let charRead = fs.readFileSync(charPath, {flag: 'as+'});
    let charFile = JSON.parse(charRead);
	
	// Reset Members
    for (const ally in btl[server].allies.members) {
		const charDefs = btl[server].allies.members[ally]
        const name = charDefs.name

		charFuncs.resetMimic(charDefs)

        if (charFile[name]) {
            charFile[name].hp = Math.round(charFile[name].maxhp)
			charFile[name].mp = Math.round(charFile[name].maxmp)
			charFile[name].trust = charDefs.trust
        }
    }
	
	// Reset Backup
    for (const ally in btl[server].allies.backup) {
		const charDefs = btl[server].allies.backup[ally]
        const name = charDefs.name

		charFuncs.resetMimic(charDefs)

        if (charFile[name]) {
            charFile[name].hp = Math.round(charFile[name].maxhp)
			charFile[name].mp = Math.round(charFile[name].maxmp)
			charFile[name].trust = charDefs.trust
        }
    }

	// Remove Rings
    let totalRings = Math.round((btl[server].parties[btl[server].battleteam].rings / 2) + (Math.random() * (btl[server].parties[btl[server].battleteam].rings / 3)))

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
    fs.writeFile(dataPath+'/Battles/battle-' + server + '.json', JSON.stringify(btl, null, '    '), function (err) { if (err) throw err });
    fs.writeFile(charPath, JSON.stringify(charFile, null, '    '), function (err) {if (err) throw err});
}

// Running away
function runFromBattle(btl, server) {
    let charPath = dataPath+'/characters.json'
    let charRead = fs.readFileSync(charPath, {flag: 'as+'});
    let charFile = JSON.parse(charRead);
	
	let servPath = dataPath+'/Server Settings/server.json'
	let servRead = fs.readFileSync(servPath, {flag: 'as+'});
	let servFile = JSON.parse(servRead);

	// Colosseum
    if (btl[server].colosseum[0] == true) {
		loseColosseum(btl, server)
        return true
    }

    // XP and Rings
    let totalXP = 0;
    let totalRings = Math.round(Math.random() * 100);
    for (const enemy in btl[server].enemies.members) {
		if (btl[server].enemies.members[enemy].hp <= 0) {
			const enmDefs = readEnm(btl[server].enemies.members[enemy].name, server)
			let enmXP = Math.round(parseInt(enmDefs.awardxp) * parseFloat(servFile[server].xprate))

			if (btl[server].enemies.members[enemy].golden)
				enmXP *= 3

			totalXP += enmXP
		}
    }

	for (const i in btl[server].allies.members)
		totalXP += Math.round(btl[server].allies.members[i].int*1.3);

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
			charFuncs.trustUp(charDefs, allyDefs, 30, server, client)
		}

		// Award XP now
		charDefs.xp += totalXP;
		console.log(`BattleStatus: ${charDefs.name} got ${totalXP}XP. (${charDefs.xp}/${charDefs.maxxp}XP)`)
		client.channels.fetch(btl[server].battlechannel)
			.then(channel => channel.send(`${charDefs.name} got **${totalXP}EXP**!`))

		let shouldLevelUp = false;
		if (charDefs.xp >= charDefs.maxxp)
			shouldLevelUp = true;

		if (shouldLevelUp == true) {
			let levelCount = 0
			while (charDefs.xp >= charDefs.maxxp) {
				charFuncs.lvlUp(charDefs, false, server)
				levelCount++;
			}

			console.log(`BattleStatus: ${charDefs.name} levelled up ${levelCount} time(s)`)
			
			let lvlQuote = ""
			if (charDefs.lvlquote && charDefs.lvlquote.length > 0) {
				let possibleQuote = Math.round(Math.random() * (charDefs.lvlquote.length-1))
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

		let lootPath = `${dataPath}/Loot/lootTables-${server}.json`
		let lootRead = fs.readFileSync(lootPath, {flag: 'as+'});
		let lootFile = JSON.parse(lootRead);

		const enmDefs = readEnm(btl[server].enemies.members[enemy].name, server)

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
    fs.writeFile(dataPath+'/Battles/battle-' + server + '.json', JSON.stringify(btl, null, '    '), function (err) {if (err) throw err});
    fs.writeFile(charPath, JSON.stringify(charFile, null, '    '), function (err) {if (err) throw err});
}

function specialNegotiation(charDefs, enmDefs, i, channel, btl, negDefs) {
	let negotiationTxt = negDefs.action ? negDefs.action : 'thing happens';
	
	let pacifyThing = false

	while (negotiationTxt.includes("%PLAYER%"))
		negotiationTxt = negotiationTxt.replace("%PLAYER%", charDefs.name);
	while (negotiationTxt.includes("%ENEMY%"))
		negotiationTxt = negotiationTxt.replace("%ENEMY%", enmDefs.name);

	let spec = negDefs.special.toLowerCase()
	switch(spec) {
		case 'math':
			let num1 = Math.max(4, utilityFuncs.randNum(20));
			let num2 = utilityFuncs.randNum(10);
			let sign = utilityFuncs.randBetweenNums(0, 3);
			let signs = ['+', '-', '×', '÷']
			negotiationTxt += `\n\n**Solve ${num1}${signs[sign] ? signs[sign] : '+'}${num2}!**`

			const DiscordEmbed = new Discord.MessageEmbed()
				.setColor('#d613cc')
				.setTitle(`${charDefs.name} => ${enmDefs.name}`)
				.setDescription(negotiationTxt)
			channel.send({embeds: [DiscordEmbed]})

			var givenResponce = false
			let msgCol = channel.createMessageCollector({ time: 15000 });
			msgCol.on('collect', m => {
				if (m.author.id == charDefs.owner) {
					givenResponce = true;
					msgCol.stop();

					let correct = false
					let num = parseFloat(m.content)
					switch(sign) {
						case 1:
							if (num == num1-num2)
								correct = true;
							break;
						case 2:
							if (num == num1*num2)
								correct = true;
							break;
						case 3:
							if (num == num1/num2)
								correct = true;
							break;
						default:
							if (num == num1+num2)
								correct = true;
					}
					
					if (correct == true) {
						negotiationTxt = `${charDefs.name} gives a correct answer, and ${enmDefs.name} is satisified.`;
						let convinceAmount = negDefs.convince
						if (charFuncs.hasPassive(charDefs, "kindheart")) {
							convinceAmount += Math.round((convinceAmount/100)*25)
						} else if (charFuncs.hasPassive(charDefs, "kindsoul")) {
							convinceAmount += Math.round((convinceAmount/100)*50)
						}
						
						enmDefs.negotiatePercent += convinceAmount;

						let completelyConvinced = ''
						if (enmDefs.negotiatePercent >= 100) {
							const partyDefs = btl[channel.guild.id].parties[btl[channel.guild.id].battleteam]
							if (!partyDefs.negotiates)
								partyDefs.negotiates = {};

							if (!partyDefs.negotiateAllies || partyDefs.negotiateAllies == [])
								partyDefs.negotiateAllies = {};

							if (!partyDefs.negotiates[enmDefs.name])
								partyDefs.negotiates[enmDefs.name] = 1;
							else
								partyDefs.negotiates[enmDefs.name]++;

							if (enmDefs.negotiateDefs && enmDefs.negotiateDefs.required && enmDefs.negotiateDefs.qualities) {
								completelyConvinced = `\n${enmDefs.name} is pacified. You let it go.`
								enmDefs.negotiated = true

								if (partyDefs.negotiates[enmDefs.name] <= enmDefs.negotiateDefs.required)
									completelyConvinced += `**(${partyDefs.negotiates[enmDefs.name]}/${enmDefs.negotiateDefs.required} Negotiates)**`
								else
									completelyConvinced += `**(${partyDefs.negotiates[enmDefs.name]} Negotiates)**`

								if (partyDefs.negotiates[enmDefs.name] == enmDefs.negotiateDefs.required) {
									completelyConvinced += '\n...but it returns to the group, it seems to like you!'

									let enemyDefs = enemyFuncs.makePet(enmDefs)
									enemyDefs.name = enmDefs.name

									partyDefs.negotiateAllies[enmDefs.name] = enemyDefs
									pacifyThing = true;
								}
							} else {
								completelyConvinced = `\n${enmDefs.name} stops attacking.`
								enmDefs.negotiated = true
							}
						}

						const DiscordEmbed = new Discord.MessageEmbed()
							.setColor('#d613cc')
							.setTitle(`${charDefs.name} => ${enmDefs.name}`)
							.setDescription(`${negotiationTxt}\n*${enmDefs.name} is being pacified. **+${convinceAmount}%***${completelyConvinced}`)
						channel.send({embeds: [DiscordEmbed]})
					} else {
						const DiscordEmbed = new Discord.MessageEmbed()
							.setColor('#d613cc')
							.setTitle(`${charDefs.name} => ${enmDefs.name}`)
							.setDescription(`${charDefs.name} gives an incorrect answer, better luck next time!`)
						channel.send({embeds: [DiscordEmbed]})
					}
							
					fs.writeFileSync(dataPath+'/Battles/battle-' + channel.guild.id + '.json', JSON.stringify(btl, null, '    '));

					if (btl[channel.guild.id].colosseum[0] == true && pacifyThing) {
						channel.send(`Do you want to keep the ${enmDefs.golden ? '<:golden:903369740142116887>' : ''}${enmDefs.name} as the current pet?`)
						var givenResponce2 = false
						var collector = channel.createMessageCollector({ time: 15000 });
						let refMsg
						collector.on('collect', message => {
							refMsg = message;
							if (message.author.id == charDefs.owner) {
								if (message.content.toLowerCase() == 'yes' || message.content.toLowerCase() == 'y') {
									givenResponce2 = true;
									collector.stop();

									btl[channel.guild.id].parties[btl[channel.guild.id].battleteam].curPet = enmDefs.name
									channel.send(`${enmDefs.golden ? '<:golden:903369740142116887>' : ''}${enmDefs.name} will be used.`)
								} else {
									collector.stop();
								}
							}
						});
						collector.on('end', c => {
							if (givenResponce2 == false)
								channel.send(`${enmDefs.golden ? '<:golden:903369740142116887>' : ''}${enmDefs.name} will not be used.`);

							setTimeout(function() {
								advanceTurn(btl, channel.guild.id)

								setTimeout(function() {
									if (refMsg) refMsg.delete();
								}, 500)
							}, 1500)
						});
					} else {
						setTimeout(function() {
							advanceTurn(btl, channel.guild.id)

							setTimeout(function() {
								m.delete();
							}, 500)
						}, 1500)
					}
					
					return true
				}
			});
			msgCol.on('end', c => {
				if (givenResponce == false) {
					channel.send('No response given.')
					sendTurnBrief(btl, channel)
				}
			});

			break

		default: 
			enmDefs[spec] = true;

			let theEmbed = new Discord.MessageEmbed()
				.setColor('#d613cc')
				.setTitle(`${charDefs.name} => ${enmDefs.name}`)
				.setDescription(negotiationTxt)
			channel.send({embeds: [theEmbed]});
			return true;
	}
}

function doNegotiation(charDefs, enmDefs, i, channel, btl) {
	let negDefs = enmDefs.negotiateOptions[i]
	let negotiationTxt = negDefs.action ? negDefs.action : 'thing happens';

	while (negotiationTxt.includes("%PLAYER%"))
		negotiationTxt = negotiationTxt.replace("%PLAYER%", charDefs.name);

	while (negotiationTxt.includes("%ENEMY%"))
		negotiationTxt = negotiationTxt.replace("%ENEMY%", enmDefs.name);

	if (!enmDefs.negotiatePercent)
		enmDefs.negotiatePercent = 0
	
	let pacifyThing = false;

	if (negDefs.require) {
		if (enmDefs[negDefs.require[0].toLowerCase()] && enmDefs[negDefs.require[0].toLowerCase()] == true) {
			if (negDefs.special && negDefs.special != 'none' && specialNegotiation(charDefs, enmDefs, i, channel, btl, negDefs)) {
				return true;
			} else {
				let convinceAmount = negDefs.convince
				if (charFuncs.hasPassive(charDefs, "kindheart")) {
					convinceAmount += Math.round((convinceAmount/100)*25)
				} else if (charFuncs.hasPassive(charDefs, "kindsoul")) {
					convinceAmount += Math.round((convinceAmount/100)*50)
				}

				enmDefs.negotiatePercent += convinceAmount
				negotiationTxt = negDefs.require[1];

				while (negotiationTxt.includes("%PLAYER%"))
					negotiationTxt = negotiationTxt.replace("%PLAYER%", charDefs.name);

				while (negotiationTxt.includes("%ENEMY%"))
					negotiationTxt = negotiationTxt.replace("%ENEMY%", enmDefs.name);

				let completelyConvinced = ''
				if (enmDefs.negotiatePercent >= 100) {
					const partyDefs = btl[channel.guild.id].parties[btl[channel.guild.id].battleteam]
					if (!partyDefs.negotiates)
						partyDefs.negotiates = {};

					if (!partyDefs.negotiateAllies || partyDefs.negotiateAllies == [])
						partyDefs.negotiateAllies = {};

					if (!partyDefs.negotiates[enmDefs.name])
						partyDefs.negotiates[enmDefs.name] = 1;
					else
						partyDefs.negotiates[enmDefs.name]++;

					if (enmDefs.negotiateDefs && enmDefs.negotiateDefs.required && enmDefs.negotiateDefs.qualities) {
						completelyConvinced = `\n${enmDefs.name} is pacified. You let it go.`
						enmDefs.negotiated = true

						if (partyDefs.negotiates[enmDefs.name] <= enmDefs.negotiateDefs.required)
							completelyConvinced += `**(${partyDefs.negotiates[enmDefs.name]}/${enmDefs.negotiateDefs.required} Negotiates)**`
						else
							completelyConvinced += `**(${partyDefs.negotiates[enmDefs.name]} Negotiates)**`

						if (partyDefs.negotiates[enmDefs.name] == enmDefs.negotiateDefs.required) {
							completelyConvinced += '\n...but it returns to the group, it seems to like you!'

							let enemyDefs = enemyFuncs.makePet(enmDefs)
							enemyDefs.name = enmDefs.name

							partyDefs.negotiateAllies[enmDefs.name] = enemyDefs
							pacifyThing = true;
						}
					} else {
						completelyConvinced = `\n${enmDefs.name} stops attacking.`
						enmDefs.negotiated = true
					}
				}

				var DiscordEmbed = new Discord.MessageEmbed()
					.setColor('#d613cc')
					.setTitle(`${charDefs.name} => ${enmDefs.name}`)
					.setDescription(`${negotiationTxt}\n*${enmDefs.name} is being pacified. **+${convinceAmount}%***${completelyConvinced}`)
				channel.send({embeds: [DiscordEmbed]})
				
				if (btl[channel.guild.id].colosseum[0] == true && pacifyThing) {
					channel.send(`Do you want to keep the ${enmDefs.golden ? '<:golden:903369740142116887>' : ''}${enmDefs.name} as the current pet?`)
					
					var givenResponce2 = false
					var collector = channel.createMessageCollector({ time: 15000 });
					let refMsg
					collector.on('collect', message => {
						refMsg = message
						if (message.author.id == charDefs.owner) {
							if (message.content.toLowerCase() == 'yes' || message.content.toLowerCase() == 'y') {
								givenResponce2 = true;
								collector.stop();

								btl[channel.guild.id].parties[btl[channel.guild.id].battleteam].curPet = enmDefs.name
								channel.send(`${enmDefs.golden ? '<:golden:903369740142116887>' : ''}${enmDefs.name} will be used.`)
							} else {
								collector.stop();
							}
						}
					});
					collector.on('end', c => {
						if (givenResponce2 == false)
							channel.send(`${enmDefs.golden ? '<:golden:903369740142116887>' : ''}${enmDefs.name} will not be used.`);

						setTimeout(function() {
							advanceTurn(btl, channel.guild.id)

							setTimeout(function() {
								if (refMsg) refMsg.delete();
							}, 500)
						}, 1500)
					});
					
					return false;
				} else 
					return true;
			}
		} else {
			negotiationTxt = negDefs.require[2]
			while (negotiationTxt.includes("%PLAYER%"))
				negotiationTxt = negotiationTxt.replace("%PLAYER%", charDefs.name);

			while (negotiationTxt.includes("%ENEMY%"))
				negotiationTxt = negotiationTxt.replace("%ENEMY%", enmDefs.name);

			var DiscordEmbed = new Discord.MessageEmbed()
				.setColor('#d613cc')
				.setTitle(`${charDefs.name} => ${enmDefs.name}`)
				.setDescription(negotiationTxt)
			channel.send({embeds: [DiscordEmbed]})
			return true;
		}
	} else if (negDefs.special && negDefs.special != 'none') {
		if (specialNegotiation(charDefs, enmDefs, i, channel, btl, negDefs))
			return true;
	} else {
		let convinceAmount = negDefs.convince
		if (charFuncs.hasPassive(charDefs, "kindheart")) {
			convinceAmount += Math.round((convinceAmount/100)*25)
		} else if (charFuncs.hasPassive(charDefs, "kindsoul")) {
			convinceAmount += Math.round((convinceAmount/100)*50)
		}

		enmDefs.negotiatePercent += convinceAmount;

		let completelyConvinced = ''
		if (enmDefs.negotiatePercent >= 100) {
			const partyDefs = btl[channel.guild.id].parties[btl[channel.guild.id].battleteam]
			if (!partyDefs.negotiates)
				partyDefs.negotiates = {};

			if (!partyDefs.negotiateAllies || partyDefs.negotiateAllies == [])
				partyDefs.negotiateAllies = {};

			if (!partyDefs.negotiates[enmDefs.name])
				partyDefs.negotiates[enmDefs.name] = 1;
			else
				partyDefs.negotiates[enmDefs.name]++;

			if (enmDefs.negotiateDefs && enmDefs.negotiateDefs.required && enmDefs.negotiateDefs.qualities) {
				completelyConvinced = `\n${enmDefs.name} is pacified. You let it go.`
				enmDefs.negotiated = true

				if (partyDefs.negotiates[enmDefs.name] <= enmDefs.negotiateDefs.required)
					completelyConvinced += `**(${partyDefs.negotiates[enmDefs.name]}/${enmDefs.negotiateDefs.required} Negotiates)**`
				else
					completelyConvinced += `**(${partyDefs.negotiates[enmDefs.name]} Negotiates)**`

				if (partyDefs.negotiates[enmDefs.name] == enmDefs.negotiateDefs.required) {
					completelyConvinced += '\n...but it returns to the group, it seems to like you!'

					let enemyDefs = enemyFuncs.makePet(enmDefs)
					enemyDefs.name = enmDefs.name

					partyDefs.negotiateAllies[enmDefs.name] = enemyDefs
					
					pacifyThing = true;
				}
			} else {
				completelyConvinced = `\n${enmDefs.name} stops attacking.`
				enmDefs.negotiated = true
			}
		}

		const DiscordEmbed = new Discord.MessageEmbed()
			.setColor('#d613cc')
			.setTitle(`${charDefs.name} => ${enmDefs.name}`)
			.setDescription(`${negotiationTxt}\n*${enmDefs.name} is being pacified. **+${convinceAmount}%***${completelyConvinced}`)
		channel.send({embeds: [DiscordEmbed]})					
		
		if (btl[channel.guild.id].colosseum[0] == true && pacifyThing) {
			channel.send(`Do you want to keep the ${enmDefs.golden ? '<:golden:903369740142116887>' : ''}${enmDefs.name} as the current pet?`)
			
			var givenResponce2 = false
			var collector = channel.createMessageCollector({ time: 15000 });
			let refMsg
			collector.on('collect', message => {
				refMsg = message
				if (message.author.id == charDefs.owner) {
					if (message.content.toLowerCase() == 'yes' || message.content.toLowerCase() == 'y') {
						givenResponce2 = true;
						collector.stop();

						btl[channel.guild.id].parties[btl[channel.guild.id].battleteam].curPet = enmDefs.name
						channel.send(`${enmDefs.golden ? '<:golden:903369740142116887>' : ''}${enmDefs.name} will be used.`)
					} else {
						collector.stop();
					}
				}
			});
			collector.on('end', c => {
				if (givenResponce2 == false)
					channel.send(`${enmDefs.golden ? '<:golden:903369740142116887>' : ''}${enmDefs.name} will not be used.`);

				setTimeout(function() {
					advanceTurn(btl, channel.guild.id)

					setTimeout(function() {
						if (refMsg) refMsg.delete();
					}, 500)
				}, 1500)
			});
			
			return false;
		} else
			return true;
	}
}

function enemyMove(enmID, btl, channel) {
	console.log('enemyMove(): Search for ID ' + enmID)

	let userDefs
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
	
	let enmName = userDefs.name
	
	let allySide = btl[channel.guild.id].allies.members
	let opposingSide = btl[channel.guild.id].enemies.members
	if (charFuncs.isOpposingSide(userDefs, btl[channel.guild.id])) {
		allySide = btl[channel.guild.id].enemies.members
		opposingSide = btl[channel.guild.id].allies.members
	}
	
	/*
	let possibleSkills = [];
	for (const i in userDefs.skills) {
		let skillDefs = readSkill(userDefs.skills[i])
		
		if (!skillDefs.passive && skillDefs.type != "passive") {
			if (userDefs.status === "ego") {
				if (skillDefs.type != "heal") {possibleSkills.push(userDefs.skills[i])}
			} else {
				possibleSkills.push(userDefs.skills[i])
			}
		}
	}
	
	let useskill;
	let skill;
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
	
	let thinkerFunc = enemyFuncs.thinkerFunc(userDefs, allySide, opposingSide)
	let useSkill = thinkerFunc[0], oppDefs = thinkerFunc[1], oppNum = thinkerFunc[2]

	const skillPath = dataPath+'/skills.json'
	const skillRead = fs.readFileSync(skillPath, {flag: 'as+'});
	const skillFile = JSON.parse(skillRead);

	let skillName = useSkill
	let skillDefs = skillFile[useSkill] ? skillFile[useSkill] : {name: userDefs.melee[0], pow: 30, type: userDefs.melee[1], crit: 20, atktype: "physical", melee: true}
	
	if ((userDefs.status === 'silence' && (!skillDefs.atktype || skillDefs.atktype === 'magic')) || userDefs.status === 'dazed' && skillDefs.atktype === 'physical') {
		let embedText = attackFuncs.meleeFoe(userDefs, oppDefs, channel.guild.id, null, btl)
		const DiscordEmbed = new Discord.MessageEmbed()
			.setColor('#fcba03')
			.setTitle(`${embedText.targetText}`)
			.setDescription(`\n${embedText.attackText}!\n${embedText.resultText}`)
			.setFooter(`${enmName}'s turn`);
		channel.send({embeds: [DiscordEmbed]});
		
		fs.writeFileSync(dataPath+'/Battles/battle-' + channel.guild.id + '.json', JSON.stringify(btl, null, '    '));

		if (btl[channel.guild.id].battling == true) {
			setTimeout(function() {
				advanceTurn(btl, channel.guild.id)
			}, 1500)
		}
		
		return
	}

	let itemPath = dataPath+'/items.json'
	let itemRead = fs.readFileSync(itemPath, {flag: 'as+'});
	let itemFile = JSON.parse(itemRead);

	if (userDefs.boss && userDefs.limitbreak) {
		if (userDefs.lb >= userDefs.limitbreak.cost) {
			if (Math.round(Math.random()*100) < 50) {
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

   				let embedText = {}
				if (skillDefs.target === "allopposing") {
					let embedTexts = []
					for (const i in opposingSide) {
						let targDefs = opposingSide[i]

						if (userDefs.hp > 0) {
							let embedTxt = attackFuncs.attackFoe(enmName, targDefs.name, userDefs, targDefs, skillDefs, false, channel.guild.id, btl);
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

				fs.writeFileSync(dataPath+'/Battles/battle-' + channel.guild.id + '.json', JSON.stringify(btl, null, '    '));
				return
			}
		}
	}

	if (skillDefs.copyskill) {
		let possibleSkills = []
		for (const val in allySide) {
			if (allySide[val].id != userDefs.id) {
				for (const i in allySide[val].skills) {
					let skillDefs = skillFile[allySide[val].skills[i]]
					if (skillDefs && skillDefs.type != "heal" && (skillDefs.type != "status" && !skillDefs.buff) && skillFile[val].type != "passive") {
						possibleSkills.push(val)
					}
				}
			}
		}
		
		if (possibleSkills.length > 0) {
			let skillVal = possibleSkills[Math.round(Math.random() * (possibleSkills.length-1))]
			let copySkill = skillFile[skillVal]
			
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
		let possibleSkill = []
		for (const val in skillFile) {
			if (skillFile[val].type != "heal" && (skillFile[val].type != "status" && !skillFile[val].buff) && skillFile[val].type != "passive") {
				possibleSkill.push(val)
			}
		}

		let skillVal = possibleSkill[Math.round(Math.random() * (possibleSkill.length-1))]
		let metronomeSkill = skillFile[skillVal]
		
		console.log(`Chosen skill ${skillVal} of ${possibleSkill.length-1} skills`)
		
		if (!metronomeSkill.name) {metronomeSkill.name = skillVal} 

		skillDefs = utilityFuncs.cloneObj(metronomeSkill)
		skillDefs.name += ` (${skillName})`
		
		skillName = skillVal
	}

	if (skillDefs.cost && skillDefs.costtype) {
		if (skillDefs.costtype === "hp" && ! userDefs.boss && ! userDefs.miniboss && ! userDefs.bigboss) {
			if (userDefs.hp <= skillDefs.cost) {
				let embedText = attackFuncs.meleeFoe(userDefs, oppDefs, channel.guild.id, null, btl)
				const DiscordEmbed = new Discord.MessageEmbed()
					.setColor('#fcba03')
					.setTitle(`${embedText.targetText}`)
					.setDescription(`\n${embedText.attackText}!\n${embedText.resultText}`)
					.setFooter(`${enmName}'s turn`);
				channel.send({embeds: [DiscordEmbed]});
				
				fs.writeFileSync(dataPath+'/Battles/battle-' + channel.guild.id + '.json', JSON.stringify(btl, null, '    '));
	
				if (btl[channel.guild.id].battling == true) {
					setTimeout(function() {
						advanceTurn(btl, channel.guild.id)
					}, 1500)
				}
				
				return
			}
		} else if (skillDefs.costtype === "mp") {
			if (userDefs.mp < skillDefs.cost) {
				let embedText = attackFuncs.meleeFoe(userDefs, oppDefs, channel.guild.id, null, btl)
				const DiscordEmbed = new Discord.MessageEmbed()
					.setColor('#fcba03')
					.setTitle(`${embedText.targetText}`)
					.setDescription(`\n${embedText.attackText}!\n${embedText.resultText}`)
					.setFooter(`${enmName}'s turn`);
				channel.send({embeds: [DiscordEmbed]});
				
				fs.writeFileSync(dataPath+'/Battles/battle-' + channel.guild.id + '.json', JSON.stringify(btl, null, '    '));
	
				if (btl[channel.guild.id].battling == true) {
					setTimeout(function() {
						advanceTurn(btl, channel.guild.id)
					}, 1500)
				}
				
				return
			}
		} else if (skillDefs.costtype === "mppercent") {
			if (userDefs.mp < ((userDefs.maxmp / 100) * skillDefs.cost)) {
				let embedText = attackFuncs.meleeFoe(userDefs, oppDefs, channel.guild.id, null, btl)
				const DiscordEmbed = new Discord.MessageEmbed()
					.setColor('#fcba03')
					.setTitle(`${embedText.targetText}`)
					.setDescription(`\n${embedText.attackText}!\n${embedText.resultText}`)
					.setFooter(`${enmName}'s turn`);
				channel.send({embeds: [DiscordEmbed]});            
				
				fs.writeFileSync(dataPath+'/Battles/battle-' + channel.guild.id + '.json', JSON.stringify(btl, null, '    '));
	
				if (btl[channel.guild.id].battling == true) {
					setTimeout(function() {
						advanceTurn(btl, channel.guild.id)
					}, 1500)
				}
				
				return
			}
		} else if (!userDefs.boss && ! userDefs.miniboss && ! userDefs.bigboss) {
			if (userDefs.hp < ((userDefs.maxhp / 100) * skillDefs.cost)) {
				let embedText = attackFuncs.meleeFoe(userDefs, oppDefs, channel.guild.id, null, btl)
				const DiscordEmbed = new Discord.MessageEmbed()
					.setColor('#fcba03')
					.setTitle(`${embedText.targetText}`)
					.setDescription(`\n${embedText.attackText}!\n${embedText.resultText}`)
					.setFooter(`${enmName}'s turn`);
				channel.send({embeds: [DiscordEmbed]});            
				
				fs.writeFileSync(dataPath+'/Battles/battle-' + channel.guild.id + '.json', JSON.stringify(btl, null, '    '));
	
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
					let partyDef = allySide[i]
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
					let partyDef = allySide[i]
					if (partyDef.hp > 0) {
						if (partyDef.status === "hunger") {
							partyDef.atk = Math.round(partyDef.atk*2)
							partyDef.mag = Math.round(partyDef.mag*2)
							partyDef.prc = Math.round(partyDef.prc*2)
							partyDef.agl = Math.round(partyDef.agl*2)
						}

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
				let txt = ``
				for (const i in allySide) {
					let partyDef = allySide[i]
					partyDef.mp = Math.min(partyDef.maxmp, partyDef.mp + skillDefs.pow)
					txt += `\n${partyDef.name}'s MP was restored by ${skillDefs.pow}. (${partyDef.mp}/${partyDef.maxmp}MP)`
				}

				const DiscordEmbed = new Discord.MessageEmbed()
					.setColor('#e36b2b')
					.setTitle(`${enmName} => Party`)
					.setDescription(`${enmName} used ${skillName}!\nThe Party's MP was restored by ${skillDefs.pow}\n${txt}`)
					.setFooter(`${enmName}'s turn`);
				channel.send({embeds: [DiscordEmbed]});
			} else {
				let txt = ``;
				for (const i in allySide) {
					let partyDef = allySide[i]
					if (partyDef.hp > 0) {
						partyDef.hp = Math.min(partyDef.maxhp, partyDef.hp + skillDefs.pow)
						txt += `\n${partyDef.name}'s HP was restored by ${skillDefs.pow}. (${partyDef.hp}/${partyDef.maxhp}HP)`
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
			let allyDefs = userDefs
			let allyName = enmName

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
				if (allyDefs.status === "hunger") {
					allyDefs.atk = Math.round(allyDefs.atk*2)
					allyDefs.mag = Math.round(allyDefs.mag*2)
					allyDefs.prc = Math.round(allyDefs.prc*2)
					allyDefs.agl = Math.round(allyDefs.agl*2)
				}

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
		if (skillDefs.splash) {
			const DiscordEmbed = new Discord.MessageEmbed()
				.setColor('#e36b2b')
				.setTitle(`${enmName} => Self`)
				.setDescription(`${enmName} used ${skillName}!\n${enmName} flops around!\n...If only this had an effect.`)
			channel.send({embeds: [DiscordEmbed]})
        } else if (skillDefs.shield) {
			allySide[oppNum].shield = skillName;

			const DiscordEmbed = new Discord.MessageEmbed()
				.setColor('#e36b2b')
				.setTitle(`${enmName} => ${allySide[oppNum].name}`)
				.setDescription(`${enmName} used ${skillName}!\n${allySide[oppNum].name} is protected from attacks with a ${skillDefs.shield}!`)
			channel.send({embeds: [DiscordEmbed]})
		} else if (skillDefs.makarakarn) {
			allySide[oppNum].makarakarn = skillName;

			const DiscordEmbed = new Discord.MessageEmbed()
				.setColor('#e36b2b')
				.setTitle(`${enmName} => ${allySide[oppNum].name}`)
				.setDescription(`${enmName} used ${skillName}!\n${allySide[oppNum].name} is protected from magic attacks with ${skillName}!`)
			channel.send({embeds: [DiscordEmbed]})
		} else if (skillDefs.tetrakarn) {
			allySide[oppNum].tetrakarn = skillName;

			const DiscordEmbed = new Discord.MessageEmbed()
				.setColor('#e36b2b')
				.setTitle(`${enmName} => ${allySide[oppNum].name}`)
				.setDescription(`${enmName} used ${skillName}!\n${allySide[oppNum].name} is protected from physical attacks with ${skillName}!`)
			channel.send({embeds: [DiscordEmbed]})
		} else if (skillDefs.trap) {
			allySide[oppNum].trapType = {
				name: skillName,
				effect: skillDefs.effect
			}

			const DiscordEmbed = new Discord.MessageEmbed()
				.setColor('#e36b2b')
				.setTitle(`${enmName} => ${allySide[oppNum].name}`)
				.setDescription(`${enmName} used ${skillName}!\n${allySide[oppNum].name} is preparing to trap a foe with ${skillName}!`)
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
				let statusChance = Math.round(skillDefs.statuschance);
				if (userDefs.mainElement === 'status')
					statusChance *= 1.1;

				let targChance = (statusChance + (userDefs.chr - oppDefs.luk));
				if (attackFuncs.physStatus(skillDefs.status))
					targChance = (statusChance + (userDefs.luk - oppDefs.luk));

				let chance = Math.round(Math.random()*100);

				let finaltext = `${enmName} used ${skillName} on ${oppDefs.name}!`;
				if (chance > targChance || statusChance >= 100) {
					finaltext += ' ' + attackFuncs.inflictStatus(oppDefs, skillDefs)
				} else {
					finaltext += " But they dodged it!"

					if (userDefs.missquote && userDefs.missquote.length > 0) {
						let possibleQuote = Math.round(Math.random() * (userDefs.missquote.length-1))
						finaltext += `\n*${enmName}: "${userDefs.missquote[possibleQuote]}"*`
					}
					if (oppDefs.dodgequote && oppDefs.dodgequote.length > 0) {
						let possibleQuote = Math.round(Math.random() * (oppDefs.dodgequote.length-1))
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
			let buffCount = skillDefs.buffCount ? skillDefs.buffCount : 1
			let buffTxt = ['', '', ' twice', ' three times', ' four times', ' five times', ' completely']

			if (skillDefs.target == "allallies") {
				for (let i = 0; i < buffCount; i++) {
					for (const i in allySide) {
						let charDefs = allySide[i]
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
				}
				
				const DiscordEmbed = new Discord.MessageEmbed()
					.setColor('#e36b2b')
					.setTitle(`${enmName} => All Allies`)
					.setDescription(`${enmName} used ${skillDefs.name}!\n${enmName} buffed their allies' ${(skillDefs.buff == "all") ? "Stats" : skillDefs.buff.toUpperCase()}${buffTxt[buffCount]}!`)
					.setFooter(`${enmName}'s turn`);
				channel.send({embeds: [DiscordEmbed]})
			} else {
				for (let i = 0; i < buffCount; i++) {
					if (skillDefs.buff == "all") {
						userDefs.buffs.atk = Math.min(3, userDefs.buffs.atk+1)
						userDefs.buffs.mag = Math.min(3, userDefs.buffs.mag+1)
						userDefs.buffs.end = Math.min(3, userDefs.buffs.end+1)
						userDefs.buffs.prc = Math.min(3, userDefs.buffs.prc+1)
						userDefs.buffs.agl = Math.min(3, userDefs.buffs.agl+1)
					} else {
						userDefs.buffs[skillDefs.buff] = Math.min(3, userDefs.buffs[skillDefs.buff]+1)
					}
				}
				
				const DiscordEmbed = new Discord.MessageEmbed()
					.setColor('#e36b2b')
					.setTitle(`${enmName} => Self`)
					.setDescription(`${enmName} used ${skillDefs.name}!\n${enmName} buffed their own ${(skillDefs.buff == "all") ? "Stats" : skillDefs.buff.toUpperCase()}${buffTxt[buffCount]}!`)
					.setFooter(`${enmName}'s turn`);
				channel.send({embeds: [DiscordEmbed]})
			}
		} else if (skillDefs.debuff) {
			if (skillDefs.target == "allopposing") {
				for (const i in opposingSide) {
					let charDefs = opposingSide[i]
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
				} else
					oppDefs.buffs[skillDefs.debuff] = Math.max(-3, oppDefs.buffs[skillDefs.debuff]-1)
				
				const DiscordEmbed = new Discord.MessageEmbed()
					.setColor('#e36b2b')
					.setTitle(`${enmName} => ${oppDefs.name}`)
					.setDescription(`${enmName} used ${skillDefs.name}!\n${enmName} debuffed the ${oppDefs.name}'s ${(skillDefs.debuff == "all") ? "Stats" : skillDefs.debuff.toUpperCase()}`)
					.setFooter(`${enmName}'s turn`);
				channel.send({embeds: [DiscordEmbed]})
			}
		} else if (skillDefs.dualbuff) {
			let statStuff = '';
			if (skillDefs.target == "allallies") {
				for (const i in allySide) {
					let charDefs2 = allySide[i]

					for (const k in skillDefs.dualbuff) {
						charDefs2.buffs[skillDefs.dualbuff[k]] = Math.min(3, charDefs2.buffs[skillDefs.dualbuff[k]]+1);
						statStuff += `${skillDefs.dualbuff[k]}`
						
						if (i == skillDefs.dualbuff.length-2)
							statStuff += ' and '
						else if (i >= skillDefs.dualbuff.length-1)
							statStuff += '!'
						else
							statStuff += ', '
					}
				}

				const DiscordEmbed = new Discord.MessageEmbed()
					.setColor('#e36b2b')
					.setTitle(`${enmName} => All Allies`)
					.setDescription(`${enmName} buffed their allies' ${statStuff}!`)
					.setFooter(`${enmName}'s turn`);
				channel.send({embeds: [DiscordEmbed]})
			} else {
				for (const k in skillDefs.dualbuff) {
					userDefs.buffs[skillDefs.dualbuff[k]] = Math.min(3, userDefs.buffs[skillDefs.dualbuff[k]]+1);
					statStuff += `${skillDefs.dualbuff[k]}`
					
					if (i == skillDefs.dualbuff.length-2)
						statStuff += ' and '
					else if (i >= skillDefs.dualbuff.length-1)
						statStuff += '!'
					else
						statStuff += ', '
				}

				const DiscordEmbed = new Discord.MessageEmbed()
					.setColor('#e36b2b')
					.setTitle(`${enmName} => Self`)
					.setDescription(`${enmName} buffed their own ${statStuff}!`)
					.setFooter(`${enmName}'s turn`);
				channel.send({embeds: [DiscordEmbed]})
			}
		} else if (skillDefs.dekaja) {
			let debuffStats = ['atk', 'mag', 'end', 'agl', 'prc']
			if (skillDefs.target == "allopposing") {
				for (const i in opposingSide) {
					let charDefs2 = oppSide[i]
					for (const k in debuffStats) {
						if (charDefs2.buffs[debuffStats[k]] > 0)
							charDefs2.buffs[debuffStats[k]] = 0;
					}
				}
	
				DiscordEmbed = new Discord.MessageEmbed()
					.setColor('#e36b2b')
					.setTitle(`${enmName} => All Opposing`)
					.setDescription(`${enmName} reverted the foes' stats to normal!`)
					.setFooter(`${enmName}'s turn`);
			} else {
				for (const k in debuffStats) {
					if (oppDefs.buffs[debuffStats[k]] > 0)
						oppDefs.buffs[debuffStats[k]] = 0;
				}

				DiscordEmbed = new Discord.MessageEmbed()
					.setColor('#e36b2b')
					.setTitle(`${enmName} => ${oppDefs.name}`)
					.setDescription(`${enmName} reverted ${oppDefs.name}'s stats to normal!`)
					.setFooter(`${enmName}'s turn`);
			}
		} else if (skillDefs.futuresight) {
			oppDefs.futureSightSkill = skillDefs.futuresight
			oppDefs.futureSightSkill.user = userDefs
			
			if (userDefs.mainElement === 'status')
				oppDefs.futureSightSkill.pow = Math.round(oppDefs.futureSightSkill.pow*1.1);

			const DiscordEmbed = new Discord.MessageEmbed()
				.setColor('#e36b2b')
				.setTitle(`${enmName} => ${oppDefs.name}`)
				.setDescription(`${enmName} used ${skillDefs.name}!\n${oppDefs.name} is going to be affected by ${enmName}'s future attack.`)
			channel.send({embeds: [DiscordEmbed]})
		} else if (skillDefs.clone) {
			let cloneDefs = utilityFuncs.cloneObj(userDefs)
			cloneDefs.hp = 100
			cloneDefs.maxhp = 100
			cloneDefs.mp = 80
			cloneDefs.maxmp = 80
			cloneDefs.npc = true
			
			let battlerID = 0
			for (const i in allySide)
				battlerID++;
			for (const i in opposingSide)
				battlerID++;
			
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
		} else if (skillDefs.mimic) {
			const DiscordEmbed = new Discord.MessageEmbed()
				.setColor('#e36b2b')
				.setTitle(`${enmName} => ${oppDefs.name}`)
				.setDescription(`${enmName} transformed into ${oppDefs.name}!`)
			channel.send({embeds: [DiscordEmbed]})

			userDefs.oldDefs = utilityFuncs.cloneObj(userDefs)
			charFuncs.mimic(userDefs, oppDefs, 2)

//			if (skillDefs.mimic.returnskill)
//				userDefs.skills.push(skillDefs.mimic.returnskill);
		} else if (skillDefs.unmimic) {
			charFuncs.resetMimic(userDefs)

			const DiscordEmbed = new Discord.MessageEmbed()
				.setColor('#e36b2b')
				.setTitle(`${enmName} => Self`)
				.setDescription(`${enmName} is no-longer mimicking their target.`);
			channel.send({embeds: [DiscordEmbed]})
		} else if (skillDefs.weather) {
			let weatherMessage = {
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
		} else if (skillDefs.reincarnate) {
			for (const i in allySide) {
				if (allySide[i].undead && allySide[i].hp > 0) {
					const DiscordEmbed = new Discord.MessageEmbed()
						.setColor('#e36b2b')
						.setTitle(`${enmName} => Self`)
						.setDescription(`${enmName} used ${skillName}!\nBut it failed!`)
					channel.send({embeds: [DiscordEmbed]})

					if (btl[channel.guild.id].battling == true) {
						setTimeout(function() {
							advanceTurn(btl, channel.guild.id)
						}, 2500)
					}

					return
				}
			}

			// ok go
			let newChar = utilityFuncs.cloneObj(userDefs)

			//Starting Name
			newChar.maxhp = Math.round(userDefs.maxhp / 4)
			newChar.hp = newChar.maxhp
			newChar.maxmp = Math.round(userDefs.maxmp / 3)
			newChar.mp = newChar.maxmp
			newChar.level = Math.floor(Math.random() * (20 - 1) + 1)
			
			if (userDefs.boss || userDefs.miniboss) {
				newChar.maxhp = Math.round(userDefs.maxhp / 9)
				newChar.hp = newChar.maxhp

				newChar.mp = 30
				newChar.maxmp = 30
			}

			//Assign it a name
			let statusOfLivingList = [
				'Demon', 'Fallen', 'Undead', 'Ghouly', 'Skeleton', 'Dead', 'Zombie', 'Soulless', 'Ghostly', 'Spectral',
				'Impious', 'Ungodly', 'Reincarnated', 'Unfresh', 'Unholy', 'Revenant', 'Rotter', 'Recovering', 'Dying',
				'Necrotic', 'Non-living', 'Not-dead', 'Nympg', 'Geist', 'Poltergeist', 'Stillborn', 'Exanimated'
			]
			let speciesList = [
				'Hedgehog', 'Fox', 'Echidna', 'Bat', 'Crocodile', 'Bee', 'Wasp', 'Skunk',
				'Panda', 'Bearcat', 'Bear', 'Polar_Bear', 'Tanuki', 'Raccoon',
				'Raccoon_Dog', 'Axolotl', 'Pig', 'Cow', 'Chicken', 'Rooster', 'Mole', 'Shark', 'Snake',
				'Python', 'Cobra', 'Boa', 'Viper', 'Rattlesnake', 'Cod', 'Tuna', 'Seahorse',
				'Flounder', 'Spot', 'Snapper', 'Dolphin', 'Seal', 'Walrus', 'Cat', 'Dog', 'Chihuahua', 'Lion',
				'Tiger', 'Elephant', 'Giraffe', 'Hawk', 'Parrot', 'Zebra', 'Kangaroo', 'Spider',
				'Dragon', 'Ender_Dragon', 'Zombie', 'Wolf', 'Arctic_Wolf', 'Fox', 'Rabbit', 'Altarian',
				'Lizard', 'Gecko', 'Chameleon', 'Slime', 'Creature', 'Hybrid', 'Abomination', 
				'Amalgamation', 'Sheep', 'Ram', 'Lamb', 'Llama', 'Jacob_Sheep', 'Velociraptor', 'Raptor', 'Eagle',
				'Ghost', 'Winteriz', 'Spirit', 'Husk', 'AI', 'Robot', 'Cyborg',
				'Ocelot', 'Piglin', 'Salmon', 'Snow_Golem', 'Snowman', 'Iron_Golem', 'Mooshroom', 'Strider',
				'Tropical_Fish', 'Fish', 'Turtle', 'Tortoise', 'Skeleton', 'Strider', 'Drowned',
				'Illusioner', 'Killer_Bunny', 'Pufferfish', 'Donkey', 'Horse', 'Mule',
				'Skeleton_Horse', 'Goat', 'Pigman', 'Evoker', 'Vindicator', 'Ravager', 'Vex',
				'Guardian', 'Phantom', 'Blaze', 'Wither', 'Witch',
				'Hoglin', 'Warden', 'Jellyfish', 'Crab', 'Shrimp', 'Albatross', 'Duck',
				'Goose', 'Swan', 'Swallow', 'Sparrow', 'Vulture', 'Thylacine', 'Tenrec', 'Armadillo', 
				'Sloth', 'Grizzly_Bear', 'Fennec', 'Ostrich', 'Weasel', 'Otter', 'Deer', 'Buffalo',
				'Water_Buffalo', 'Orca', 'Whale', 'Pika', 'Degu', 'Okapi', 'Bush', 'Tree', 'Chipmunk', 
				'Squirrel', 'Lemming', 'Woodchuck', 'Flying_Squirrel', 'Koala', 'Monkey', 'Gorilla',
				'Orangutan', 'Beaver', 'Ibis', 'Mongoose', 'Tamandua', 'Scorpio'
			]

			let name1 = statusOfLivingList[Math.floor(Math.random() * (statusOfLivingList.length - 1))]
			let name2 = speciesList[Math.floor(Math.random() * (speciesList.length - 1))]

			newChar.name = `${name1} ${name2}`

			//Assign the new member an ID
			let battlerID = 0
			for (const i in allySide)
				battlerID++;
			for (const i in opposingSide)
				battlerID++;

			newChar.id = battlerID

			// Assign Stats
			const stats = ["atk", "mag", "end", "chr", "int", "luk", "prc", "agl"]
			for (const k in stats) {
				let statNum = utilityFuncs.randNum(33)
				newChar[stats[k]] = statNum
			}

			// Assigning Skills
			newChar.skills = []

			let possibleSkills = ["Agilao", "Bufula", "Zionga", "Garula", "Hanama", "Aques", "Psio", "Jino", "Diarama", "Makakaja", "Tarukaja"]
			for (let k = 0; k < 2; k++) {
				const skillName = possibleSkills[Math.round(Math.random() * (possibleSkills.length-1))]
				newChar.skills.push(skillName)
			}

			// Assigning Affinities
			newChar.superweak = [];
			newChar.weak = [];
			newChar.resist = [];
			newChar.block = [];
			newChar.repel = [];
			newChar.drain = [];

			const affinities = ["superweak", "weak", "weak", "weak", "normal", "normal", "normal", "normal", "normal", "normal", "normal", "normal", "normal", "resist", "resist", "block", "repel", "drain"]
			for (const k in Elements) {
				if (Elements[k].type != "heal" && Elements[k].type != "status" && Elements[k].type != "passive" && Elements[k].type != "almighty"){
					let statusNum = Math.floor(Math.random() * (affinities.length-1))
					if (affinities[statusNum] != "normal") {newChar[affinities[statusNum]].push(Elements[k])}
				}
			}

			//Getting random shit
			newChar.trueName = newChar.name
			newChar.team = userDefs.team
			newChar.buffs = {
				atk: 0,
				mag: 0,
				end: 0,
				agl: 0,
				prc: 0
			}
			newChar.status = "none"
			newChar.melee = ["Strike Attack", "strike"]
			newChar.npc = true
			newChar.undead = true
			newChar.trust = {}
			delete newChar.leader
			delete newChar.miniboss
			delete newChar.boss
			delete newChar.finalboss
			delete newChar.deity

			allySide.push(newChar)

			const DiscordEmbed = new Discord.MessageEmbed()
				.setColor('#e36b2b')
				.setTitle(`${enmName} => Self`)
				.setDescription(`${enmName} used ${skillDefs.name}!\n${enmName} reincarnated a ${newChar.name} from the dead! `)
			channel.send({embeds: [DiscordEmbed]})
		} else if (skillDefs.mindcharge) {
			userDefs.mindcharge = true;
			userDefs.justcharged = true;

			const DiscordEmbed = new Discord.MessageEmbed()
				.setColor('#e36b2b')
				.setTitle(`${enmName} => Self`)
				.setDescription(`${enmName} used ${skillName}!\n${enmName} focuses to boost their magic by 2.5x.`)
			channel.send({embeds: [DiscordEmbed]})
		} else if (skillDefs.powercharge) {
			userDefs.powercharge = true;
			userDefs.justcharged = true;

			const DiscordEmbed = new Discord.MessageEmbed()
				.setColor('#e36b2b')
				.setTitle(`${enmName} => Self`)
				.setDescription(`${enmName} used ${skillName}!\n${enmName} tenses to boost their strength by 2.5x.`)
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

	fs.writeFileSync(dataPath+'/Battles/battle-' + channel.guild.id + '.json', JSON.stringify(btl, null, '    '));
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
    "zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz",
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
        let relicPath = dataPath+'/RelicSearch/relicData.json'
        let relicRead = fs.readFileSync(relicPath, {flag: 'as+'});
        let relicData = JSON.parse(relicRead);
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
        let relicPath = dataPath+'/RelicSearch/relicFight.json'
        let relicRead = fs.readFileSync(relicPath, {flag: 'as+'});
        let relicFight = JSON.parse(relicRead);

        for (const key in relicFight) {
            if (relicFight[key].fighting == true) {
				if (relicFight[key].finish)
					delete relicFight[key];
				else {
					let readyMove = 0;
					for (const i in relicFight[key].fighters) {
						if (relicFight[key].fighters[i].move || relicFight[key].fighters[i].bot) {
							readyMove += 1
						}
					}

					if (readyMove >= relicFight[key].fighters.length) {
						let txt = ``

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

						let fighters = ``;
						for (const i in relicFight[key].fighters) {
							fighters = fighters + `${relicFight[key].fighters[i].name} ❤${Math.max(0, relicFight[key].fighters[i].hp)}\n`;
							relicFight[key].fighters[i].guard = null;
						}

						// Events
						let eventTable = [
							{
								txt: 'A group of small gremins swarm in',
								func: function(rb) {
									for (let i = 0; i < 3; i++) {
										let charDefs = RF.genChar('Gremlin', null, 6, 6, 6)
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
							let eventVal = eventTable[utilityFuncs.randNum(eventTable.length-1)]

							txt += eventVal.txt
							eventVal.func(relicFight[key])
						}

						if (fighters === ``) 
							fighters = 'No fighters...?';

						let newFighterArray = []
						for (const i in relicFight[key].fighters) {
							if (relicFight[key].fighters[i].hp > 0)
								newFighterArray.push(relicFight[key].fighters[i]);
						}

						let result = 0; // 0 - continue, 1 - win, 2 - tie
						if (newFighterArray.length == 1)
							result = 1;
						else if (newFighterArray.length <= 0)
							result = 2;

						relicFight[key].fighters = newFighterArray

						let embed = new Discord.MessageEmbed()
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
            const gsmRead = fs.readFileSync(gsmPath, {flag: 'as+'});
            const gsm = JSON.parse(gsmRead);

            if (message.author.id === gsm.init.id && gsm.words && gsm.setword == null) {
                let gotWord = false;
                let i = 0;
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
        const unoRead = fs.readFileSync(unoPath, {flag: 'as+'});
        const uno = JSON.parse(unoRead);
        for (const i in uno) {
            if (uno[i] && uno[i].playing) {
                for (const j in uno[i].players) {
                    if (j == message.author.id) {
                        let msg = message.content.toLowerCase().split(/ +/)

                        let card = ["red", "0"]
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

                        let k;
                        let chosen = false;
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

                                        let newTable = []
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
    let servPath = dataPath+'/Server Settings/server.json'
    let servRead = fs.readFileSync(servPath, {flag: 'as+'});
    let servFile = JSON.parse(servRead);

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
				levelUpFormula: "original",
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

    const prefix = (message.guild && servFile[message.guild.id]) ? servFile[message.guild.id].prefix : 'rpg!'
	
	if (message.mentions.users.first()) {
		let bloomBattler = message.mentions.users.first();

		if (bloomBattler.id == "776480348757557308") {
			let content = message.content.toLowerCase()

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
	
	//////////////////
	// File Set-Ups //
	//////////////////

	// Set up Battle JSONs for this server
	if (message.guild && message.guild.id) {
		let btlPath = dataPath+'/Battles/battle-' + message.guild.id + '.json'
		let btlCheck = fs.readFileSync(btlPath, {flag: 'as+'});
		
		if (btlCheck == '') {
			btlCheck = '{}'
			fs.writeFileSync(btlPath, btlCheck);
		}

		let enmPath = `${dataPath}/Enemies/enemies-${message.guild.id}.json`
		let enmCheck = fs.readFileSync(enmPath, {flag: 'as+'});

		if (enmCheck == '') {
			enmCheck = '{}'
			fs.writeFileSync(enmPath, enmCheck);
		}
	}

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
						{ name: `${prefix}randomship`, value: '(Args <Count>) Ships any random 2 characters together.', inline: true },
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
			
			case 'characters':
				DiscordEmbed = new Discord.MessageEmbed()
					.setColor('#0099ff')
					.setTitle('Battle Commands')
					.setDescription("Want to make a Character? Well you've come to the right place!")
					.addFields(
						{ name: `${prefix}registerchar`, value: '(Args <Name> <Base HP> <Base MP> <STR> <MAG> <PRC> <END> <CHR> <INT> <AGL> <LUK>)\nCreates a character to be used in battle.\nFor balancing purposes, Base HP should be 50 or below, Base MP should be 35 or below, and all other stats should be 10 or below.', inline: false },
						{ name: `${prefix}mainelement`, value: "(Args <Name> <Element>)\nSets your character's main element. This element will have a slight buff in power.", inline: true },
						{ name: `${prefix}mpmeter`, value: "(Args <Name> <Full> <Abreviated>)\nChanges your character's MP Meter to something else. The abreviated form will be shown among stats.", inline: true },
						{ name: `${prefix}setmelee`, value: '(Args <Name> <Skill Name> <Type>)\nGives your character a new Melee Skill.', inline: true },
						{ name: `${prefix}learnskill`, value: '(Args <Name> <Skill Name> <Skill Name> <...>)\nGives your character a new Skill.', inline: true },
						{ name: `${prefix}setleaderskill`, value: '(Args <Name> <Skill Name> <Type>)\nGives your character a Leader Skill - A passive skill that activates when you are the leader..', inline: true },
						{ name: `${prefix}setaffinity`, value: '(Args <Name> <Type> <Affinity>)\nGives your character a new Affinity.', inline: true },
						{ name: `${prefix}setquote`, value: '(Args <Name> <Action> "<Quote>")\nGives your character a flashy quote to say whenever an action is done!', inline: true },
						{ name: `${prefix}clearquotes`, value: "(Args <Name> <Action>)\nClears the quotes for a specific action.", inline: true },
						{ name: `${prefix}showquotes`, value: "(Args <Name> <Optional: Action>)\nShows the quotes for all or a specific action.", inline: true },
						{ name: `${prefix}getchar`, value: '(Args <Name>)\nGets the info of a character, including Current HP & MP, EXP and more.', inline: true },
					)
				message.channel.send({embeds: [DiscordEmbed]})
				break
			
			case 'battle':
				if (!arg[2]) {
					message.channel.send("This embed is super long, so, it's been split into pages. Please enter a number from 1-3 after ''battle''.");
					return
				} else {
					let pageNum = parseInt(arg[2])
					
					if (pageNum <= 1) {
						DiscordEmbed = new Discord.MessageEmbed()
							.setColor('#0099ff')
							.setTitle('Battle Commands')
							.setDescription("These are commands that are to do with the **core battle system** of the bot.")
							.addFields(
								{ name: `${prefix}guide`, value: "(Args <Page>) Some spider girl gave me a book, so I'll read it out to you.", inline: true },
								{ name: `${prefix}setpet`, value: '(Args <CharName> <PartyName> <PetName>)\nGives your party a pet to take on adventures with them.', inline: true },
								{ name: `${prefix}removepet`, value: '(Args <PartyName> <PetName>)\nPuts away their pet.', inline: true },
								{ name: `${prefix}registerskill`, value: "(Args <Name> <Cost> <HP/MP/HP%/MP%> <Pow> <Acc> <Crt> <Type> <Aff> <Aff Chn> <Phys? Spec?> <Targ> <Hits> <Extra1> <Extra2> ''<Desc>'')\nCreates a skill to be used in battle. If you're not careful, they could be very overpowered.", inline: true },
								{ name: `${prefix}editskill`, value: "(Args <Name> <Parameter> <Value>)\nEdits an existing skill. If you're not careful, it could be very overpowered.", inline: true },
								{ name: `${prefix}listskills`, value: "(Args <Category> <Value>)\nList Skills within a specific category.", inline: true},
								{ name: `${prefix}searchskills`, value: "(Args <Search Parameter>)\nSearch for Skills that include the word specified.", inline: true},
								{ name: `${prefix}getskill`, value: "(Args <Skill Name>)\nI'll grab the info of the move's stats for you!", inline: true },
								{ name: `${prefix}setlb`, value: "(Args <CharName> <LB Name> <Power> <LBMeter%> <Status> <StatusChance> <LB Level>)\nSets a character's Limit Break Skill, which can only be used once their Limit Meter is at a specified amount.", inline: true },
								{ name: `${prefix}journal`, value: "(Args <EnemyName>)\nI have next to me the public monster encyclopedia. I'll tell you everything i know about it.", inline: true },
							)
					} else if (pageNum >= 2) {
						DiscordEmbed = new Discord.MessageEmbed()
							.setColor('#0099ff')
							.setTitle('Battle Commands')
							.setDescription("These are commands that are to do with the **core battle system** of the bot.")
							.addFields(
								{ name: `${prefix}registerweapon`, value: "(Args <Name> <Currency Cost> <Element> <Melee ATK Power> <ATK Buff> <MAG Buff> <Skill> ''<Desc>'')\nCreates a weapon to be found by parties and equipped by it's members.", inline: true },
								{ name: `${prefix}registerarmor`, value: "(Args <Name> <Currency Cost> <Element> <END Buff> <Skill> ''<Desc>'')\nCreates a set of armor to be found by parties and equipped by it's members.", inline: true },
								{ name: `${prefix}getweapon`, value: "(Args <Weapon Name>)\nI'll grab the info of the weapon's stats for you!", inline: true },
								{ name: `${prefix}getarmor`, value: "(Args <Armor Name>)\nI'll grab the info of the armor's stats for you!", inline: true },
								{ name: `${prefix}listweapons`, value: "Lists all the weapons registered.", inline: true },
								{ name: `${prefix}listarmors`, value: "Lists all the armors registered.", inline: true },
								{ name: `${prefix}testbattle`, value: "(Args <Character> <Enemy>)\nBegin a test battle with your character to see how much damage you'd do against the enemy!", inline: true },
								{ name: `${prefix}startenemybattle`, value: "(Args <Team> <Can Run?> <Weather> <Terrain> <...>)\nThis command is Admin Only. Starts a battle with the specified enemies.", inline: true },
								{ name: `${prefix}startcolosseum`, value: "(Args <Team> <Trial Name>)\nThis command is Admin Only. Starts the specified trial.", inline: true },
								{ name: `${prefix}startpvp`, value: "(Args <Team 1> <Team 2> <Gamemode?> <Ranked?>)\nThis command is Admin Only. Starts a PVP battle. There are server leaderboards too!", inline: true },
								{ name: `${prefix}endbattle`, value: 'This command is Admin Only. Ends the current battle that is in progress.', inline: true },
							)
					}

					message.channel.send({content: `Page ${pageNum}`, embeds: [DiscordEmbed]})
				}
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
						{ name: 'Characters', value: 'Change up your Characters, and also look at other characters!', inline: true },
						{ name: 'Battle', value: "Unsure how to use the battle system? I'll help you!", inline: true },
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
		let pingVal = Date.now() - message.createdTimestamp
		let latencyVal = Math.round(client.ws.ping)
		
		let hit = "There! I hit it!"
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

			if (num1 < 1)
                return message.channel.send(`Your 1st number (${num1}) has got to be a number above 1.`);
			else if (num2 < 1)
                return message.channel.send(`Your 2nd number (${num2}) has got to be a number above 1.`);
			else if (num1 > 300)
                return message.channel.send(`Your 1st number (${num1}) has got to be a number below 300.`);
			else if (num2 > 300)
                return message.channel.send(`Your 2nd number (${num2}) has got to be a number below 300.`);

			let totalNum = 0;
			let resultsNums = [];
			for (let i = 0; i < num2; i++) {
				const resultNum = Math.ceil(Math.random() * num1)
				resultsNums.push(resultNum)
				totalNum += resultNum;
			};

			resultsNums.sort(function(a, b) {return a + b})

			let resultsTxt = `(${resultsNums})`

			let endTxt = `Your result after multiple rolls is ${totalNum} ${resultsTxt} after rolling a ${num2}d${num1}.`
			if (totalNum == 69)
				endTxt += ' Therefore, I have a [prize](https://www.youtube.com/watch?v=ub82Xb1C8os) for you :)';

			const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle(`${prefix}diceroll`)
				.setDescription(endTxt)
			message.channel.send({embeds: [DiscordEmbed]})
        } else {
			if (num1 < 1)
                return message.channel.send(`Your number (${num1}) has got to be a number above 1.`);

            let resultNum = Math.ceil(Math.random() * num1)
			const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle(`${prefix}diceroll`)
				.setDescription(`Your result is ${resultNum} after rolling a d${num1}.`)
			message.channel.send({embeds: [DiscordEmbed]})
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
                let sceneText = `${message.author.username} & ${taggedUser.username} `

				let scenario = duoScenarios[Math.round(Math.random() * (duoScenarios.length - 1))]
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
            let sceneText = `${message.author.username} `
            let scenario = soloScenarios[Math.round(Math.random() * (soloScenarios.length - 1))]
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
        const gsmRead = fs.readFileSync(gsmPath, {flag: 'as+'});
        const gsm = JSON.parse(gsmRead);

        gsm.init = message.author;
        gsm.challenger = message.mentions.users.first();
        gsm.words = [];
        gsm.setword = null;

        let i;
        for (i = 0; i < 3; i++) {
            gsm.words.push(gsmWords[Math.round(Math.random() * (gsmWords.length - 1))])
        }

        message.author.send(`Choose from the **${gsm.words.length}** words:`)
        let k;
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
		"*Bwa Bo brop*\n-Cowardly Maya, Persona 3",
		"*When you don't try your best, it would seem like any normal time, but when you do try your best, It could be life changing*\n-Harcvuk, One of the various servers used to test me.",
		"*You may think what you are doing, isn't enough. But don't let that get you down. You already made way more than you had before. Be proud of your progress in life.*\n-Verwex, One of the various servers used to test me."
    ]

    if (command === 'rq' || command === 'randquote' || command === 'randomquote' || command === 'quote') {
        let quoteText = quotes[Math.round(Math.random() * (quotes.length - 1))]
        const DiscordEmbed = new Discord.MessageEmbed()
            .setColor('#ffffff')
            .setDescription(`${quoteText}`)
            .setFooter(`${prefix}${command}`);
        message.channel.send({embeds: [DiscordEmbed]})
        return true
    }

    if (command === 'mafia' || command === 'werewolf') {
        const mafiaPath = dataPath+'/Mafia/Mafia.json'
        const mafiaRead = fs.readFileSync(mafiaPath, {flag: 'as+'});
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
        const mafiaRead = fs.readFileSync(mafiaPath, {flag: 'as+'});
        const mafiaFile = JSON.parse(mafiaRead);

        if (mafiaFile[message.guild.id].state != "waiting")
            return false // dont say anything

        if (mafiaFile[message.guild.id].players.length < 6)
            return message.channel.send("Not enough players! **6** is required!");

        let mafia1 = Math.round(Math.random() * mafiaFile[message.guild.id].players.length)
        let mafia2 = Math.round(Math.random() * mafiaFile[message.guild.id].players.length)
        while (mafia1 == mafia2)
            mafia2 = Math.round(Math.random() * mafiaFile[message.guild.id].players.length);

        mafiaFile[message.guild.id].killers.push(mafiaFile[message.guild.id].players[mafia1])
        mafiaFile[message.guild.id].killers.push(mafiaFile[message.guild.id].players[mafia2])

        for (const i in mafiaFile[message.guild.id].players) {
            let userget = client.users.fetch(mafiaFile[message.guild.id].players[i].id);
            userget.then(function (user) {
                if (i == mafia1 || i == mafia2)
                    user.send("**You are the __Minority__ (Werewolf/Mafia). You must kill the __Majority__.**\n*Don't tell anyone!*")
                else
                    user.send("**You are the __Majority__ (Villager). You, as a villager, must survive and discover the __Minoriy__.**\n*Don't tell anyone!*")
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
        const unoRead = fs.readFileSync(unoPath, {flag: 'as+'});
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
		let allUndefined = true;
		for (const i in arg) {
			if (i < 1)
				continue;

			if (arg[i].toLowerCase() != 'undefined')
				allUndefined = false;
		}
		
		if (allUndefined) {
			// Getting Candidates
			let resulttext = "**Candidates:** \n"
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
		let resulttext = "**Candidates:** \n"
		for (i in shipCandidates)
			resulttext = resulttext + `:small_orange_diamond: ${shipCandidates[i]} \n`
		
		//Splicing Name
		let splicedName = ""
		for (i in shipCandidates) {
			let nameToCut
			nameToCut = shipCandidates[i].slice(Math.floor(shipCandidates[i].length / shipCandidates.length * i), Math.round(shipCandidates[i].length / shipCandidates.length * (i + 1)))
			splicedName += nameToCut
		}

		// Filtering Duplicates
		let filtered = new Set(shipCandidates);
		shipCandidates = [...filtered]

		//Fetching Love
		let shipPath = dataPath+'/Ship/shipParameters.json'
		let shipRead = fs.readFileSync(shipPath, {flag: 'as+'});
		let shipFile = JSON.parse(shipRead);

		let loveParameters = []
		let loveResults = []
		let loveCloseness = 0
		let finalLoveCloseness = 0

		for (i in shipCandidates) {
			if (!shipFile[shipCandidates[i]]) {
				shipFile[shipCandidates[i]] = {
					loveParameter: Math.round(Math.random() * 100),
				}

				fs.writeFileSync(shipPath, JSON.stringify(shipFile, null, '    '));
			}

			let candidate = shipFile[shipCandidates[i]]

			loveParameters.push(candidate.loveParameter)
		}

		for (i in loveParameters) {
			let secondID = parseInt(i) + 1

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
		let footerConditions = [
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
		let footerText = ""
		
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

	if (command === 'randomship') {    
		let charPath = dataPath+'/characters.json'
		let charRead = fs.readFileSync(charPath, {flag: 'as+'});
		let charFile = JSON.parse(charRead);
		let arg = message.content.slice(prefix.length).trim().split(/ +/);
		
		let possibleChars = []
		for (const i in charFile) {
			if (!charFile[i].hidden)
				possibleChars.push(charFile[i].name);
		}

		let shipCount = arg[1] ? parseInt(arg[1]) : 2
		
		arg = []
		for (i = 0; i <= Math.min(2, shipCount); i++) {
			if (i <= 0) continue;
			arg.push(possibleChars[utilityFuncs.randBetweenNums(0, possibleChars.length-1)]);
		}

		let shipCandidates = []
		
		for (const i in arg)
			shipCandidates.push(arg[i]);

		// Getting Candidates
		let resulttext = "**Candidates:** \n"
		for (i in shipCandidates)
			resulttext += `:small_orange_diamond: ${shipCandidates[i]} \n`
		
		//Splicing Name
		let splicedName = ""
		for (i in shipCandidates) {
			let nameToCut
			nameToCut = shipCandidates[i].slice(Math.floor(shipCandidates[i].length / shipCandidates.length * i), Math.round(shipCandidates[i].length / shipCandidates.length * (i + 1)))
			splicedName += nameToCut
		}

		// Filtering Duplicates
		let filtered = new Set(shipCandidates);
		shipCandidates = [...filtered]

		//Fetching Love
		let shipPath = dataPath+'/Ship/shipParameters.json'
		let shipRead = fs.readFileSync(shipPath, {flag: 'as+'});
		let shipFile = JSON.parse(shipRead);

		let loveParameters = []
		let loveResults = []
		let loveCloseness = 0
		let finalLoveCloseness = 0

		for (i in shipCandidates) {
			if (!shipFile[shipCandidates[i]]) {
				shipFile[shipCandidates[i]] = {
					loveParameter: Math.round(Math.random() * 100),
				}

				fs.writeFileSync(shipPath, JSON.stringify(shipFile, null, '    '));
			}

			let candidate = shipFile[shipCandidates[i]]

			loveParameters.push(candidate.loveParameter)
		}

		for (i in loveParameters) {
			let secondID = parseInt(i) + 1

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
		let footerConditions = [
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
		let footerText = ""
		
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
			footerText = 'OTP... Randomly??? Zamn!'

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

		let foodPath = dataPath+'/foodConfig.json'
		let foodRead = fs.readFileSync(foodPath, {flag: 'as+'});
		let foodFile = JSON.parse(foodRead);

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
				let user = list[i]
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
			let iceCreamFlavorList = ''

			if (!isFinite(scoops)) {
				for (const i in scoops) {
					scoops[i].slice(1,scoops[i].length - 1)

					iceCreamResults.push(scoops[i])

					let failureLevel = 0
					let userRandTable = []

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
				let iceCreamInput = [...iceCreamFlavors]
				let IDInput = [...iceCreamIDs]
				iceCreamResults = []
				iceCreamFlavorList = ''
			
				for (let i = 1; i <= scoops; i++) {
			
					if (iceCreamInput.length < 1) {
						iceCreamInput = [...iceCreamFlavors]
						IDInput = [...iceCreamIDs]
						console.log(`Oops. Ran out of ice cream flavors. Repeating the list.`)
					}
			
					let flavorNum = Math.floor(Math.random() * iceCreamInput.length)
			
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
		
			let filtered = new Set(iceCreamResults);
			let iceCreamFiltered = [...filtered]
			let iceCreamName = iceCreamFiltered.join(' ');
		
			///////////
			// IMAGE //
			///////////
		
			const canvas = Canvas.createCanvas(201, 240 + (62 * iceCreamResults.length));
			const context = canvas.getContext('2d');
		
			// Since the image takes time to load, you should await it
			const cone = await Canvas.loadImage('./images/foodgenerators/icecream/cone.png')
		
			// This uses the canvas dimensions to stretch the image onto the entire canvas
			let coneY = canvas.height - 240
			context.drawImage(cone, 20, coneY, 161, 231);
		
			let lastScoopY
			for (let i = 1; i <= scoops; i++) {
				let scoop

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
		let foodPath = dataPath+'/foodConfig.json'
		let foodRead = fs.readFileSync(foodPath, {flag: 'as+'});
		let foodFile = JSON.parse(foodRead);

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
				let categoryID = foodFile[message.author.id]['privacy'][message.guild.id].blockedCategories[i]
				let category = message.guild.channels.cache.get(categoryID)
				categoryBlock += `\n- ${category.name} *(${category.isText() ? 'Thread Parent' : 'Category'})*`
			}

			if (categoryBlock == ``)
			categoryBlock = `None`

			let channelBlock = ``

			for (i in foodFile[message.author.id]['privacy'][message.guild.id].blockedChannels) {
				let channelID = foodFile[message.author.id]['privacy'][message.guild.id].blockedChannels[i]
				let channel = message.guild.channels.cache.get(channelID)
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
			
			let categoryID = message.channel.parentId

			if (categoryID == null)
			return message.channel.send(`There isn't a category this channel is appended to.`)

			let addOrReduce = "add"
			
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
			
			let channelID = message.channel.id

			let addOrReduce = "add"
			
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

		let foodPath = dataPath+'/foodConfig.json'
		let foodRead = fs.readFileSync(foodPath, {flag: 'as+'});
		let foodFile = JSON.parse(foodRead);

		let skillTxt = []
		let nameTxt = []
		let ownerTxt = []

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

		let category = arg[1].toLowerCase()

		let catText = ''

		let begmean = ''
		let midmean = ''

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

						let skip = false

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
			let userID = message.author.id
			let userName = message.author.username

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

			let userID = arg[3].id
			let userName = arg[3].username

			if (!foodFile[userID] || !foodFile[userID][begmean] || !foodFile[userID][begmean][midmean] || foodFile[userID][begmean][midmean] == {})
			return message.channel.send(`${userName} doesn't have any ${catText} set.`)

			let skip = false

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

		let foodPath = dataPath+'/foodConfig.json'
		let foodRead = fs.readFileSync(foodPath, {flag: 'as+'});
		let foodFile = JSON.parse(foodRead);

		let skillTxt = []
		let nameTxt = []
		let ownerTxt = []

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
		let category = arguments[0]

		let catText = ''

		let begmean = ''
		let midmean = ''

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

					let skip = false

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

		let name = arguments[0]
		let category = arguments[1].toLowerCase()
		let imageFile

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

		let foodPath = dataPath+'/foodConfig.json'
		let foodRead = fs.readFileSync(foodPath, {flag: 'as+'});
		let foodFile = JSON.parse(foodRead);

		if (!foodFile[message.author.id]) {
			foodFile[message.author.id] = {}

			fs.writeFileSync(foodPath, JSON.stringify(foodFile, null, '    '));
		}

		let catText = ''
		let smalltext = ''

		let begmean = ''
		let midmean = ''

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

		let category = arg[1]

		let catText = ''
		let attachment

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

		let name = arguments[1]
		let category = arguments[0].toLowerCase()

		let foodPath = dataPath+'/foodConfig.json'
		let foodRead = fs.readFileSync(foodPath, {flag: 'as+'});
		let foodFile = JSON.parse(foodRead);

		let catText = ''

		let begmean = ''
		let midmean = ''

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

		let length = 0

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

		let category = arguments[0]
		let name = arguments[1]
		
		if (!arguments[2])
		return message.channel.send(`Please specify the new name for that flavor.`)

		let newname = arguments[2]

		let foodPath = dataPath+'/foodConfig.json'
		let foodRead = fs.readFileSync(foodPath, {flag: 'as+'});
		let foodFile = JSON.parse(foodRead);

		let catText = ''

		let begmean = ''
		let midmean = ''

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

		let name = arguments[1]
		let category = arguments[0]
		let imageFile

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

		let foodPath = dataPath+'/foodConfig.json'
		let foodRead = fs.readFileSync(foodPath, {flag: 'as+'});
		let foodFile = JSON.parse(foodRead);

		let catText = ''

		let begmean = ''
		let midmean = ''

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

		let foodPath = dataPath+'/foodConfig.json'
		let foodRead = fs.readFileSync(foodPath, {flag: 'as+'});
		let foodFile = JSON.parse(foodRead);

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
				let user = list[i]
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

			let whatwentwrong = ``

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
			message.channel.send(`<:warning:878094052208296007>What went wrong:${whatwentwrong}`).then(msg => {
				setTimeout(() => msg.delete(), 5000)
			})

			let onetoListenTo = message.author.id
			let contentOfMessage

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
			
			let crustNumber = Math.floor(Math.random() * crusts.length)
			let crust = crusts[crustNumber]
			let crustID = crustIDs[crustNumber]
			
			let sauce = "No Sauce"
			if (allowSauce == 'true') {
				let sauceNumber = Math.floor(Math.random() * sauces.length)
				sauce = sauces[sauceNumber]
				let sauceID = sauceIDs[sauceNumber]
			}
		
			let cheese = "No Cheese"
			if (allowCheese == 'true') {
				let cheeseNumber = Math.floor(Math.random() * cheeses.length)
				cheese = cheeses[cheeseNumber]
				let cheeseID = cheeseIDs[cheeseNumber]
			}
				
		
			//Toppings
			let toppingInput = [...toppingTypes]
			let toppingIDList = []
			let TIDInput = [...toppingIDs]
			let toppingResults = []
			let toppingList = ''
		
			for (let i = 1; i <= toppings; i++) {
				if (toppingInput.length < 1) {
					toppingInput = [...toppingTypes]
					TIDInput = [...toppingIDs]
					console.log(`Oops. Ran out of pizza toppings. Repeating the list.`)
				}
		
				let toppingNum = Math.floor(Math.random() * toppingInput.length)
		
				toppingResults.push(toppingInput[toppingNum])
				toppingIDList.push(TIDInput[toppingNum])
				toppingList += `\n- ${toppingInput[toppingNum]} *(${TIDInput[toppingNum] !== 'official' ? client.users.cache.get(TIDInput[toppingNum]) : 'Official'})*`
		
				if (repeatToppings == 'false') {
					toppingInput.splice(toppingNum, 1)
					TIDInput.splice(toppingNum, 1)
				}
			}
		
			console.log(`Toppings: ${toppingResults}\nIDs: ${toppingIDList}`)
		
			let filteredA = new Set(toppingResults);
			let toppingsFilteres = [...filteredA]
			let toppingName = toppingsFilteres.join(' ');
		
			//Condiments
			let condimentInput = [...condimentTypes]
			let condimentResults = []
			let condimentIDList = []
			let CIDInput = [...condimentIDs]
			let condimentList = ''
		
			for (let i = 1; i <= condiments; i++) {
		
				if (condimentInput.length < 1) {
					condimentInput = [...condimentTypes]
					CIDInput = [...condimentIDs]
					console.log(`Oops. Ran out of pizza condiments. Repeating the list.`)
				}
		
				let condimentNum = Math.floor(Math.random() * condimentInput.length)
		
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
			let crustDraw

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
				let sauceDraw

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
				let cheeseDraw

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
			for (let i = 1; i <= toppings; i++) {
				let toppingDraw

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
			for (let i = 1; i <= condiments; i++) {
				let condimentDraw

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
				let crustID = 'official'
			} else {
				let crustID
				let failureLevelC = 0
				let userRandTable = []

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
				let sauceID
				let failureLevelS = 0
				let userRandTable = []

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
				let cheeseID
				let failureLevel = 0
				let userRandTable = []

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
			let toppingList = ''
			
			for (const i in toppings) {
				toppings[i].slice(1,toppings[i].length - 1)

				toppingResults.push(toppings[i])

				let failureLevelT = 0
				let userRandTable = []

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
		
			let filteredA = new Set(toppingResults);
			let toppingsFilteres = [...filteredA]
			let toppingName = toppingsFilteres.join(' ');
		
			//Condiments
			let condimentResults = []
			let condimentIDList = []
			let condimentList = ''
			
			for (const i in condiments) {
				condiments[i].slice(1,condiments[i].length - 1)

				condimentResults.push(condiments[i])

				let failureLevelC = 0
				let userRandTable = []

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
			let crustDraw

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
				let sauceDraw

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
				let cheeseDraw

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
			for (let i = 1; i <= toppings; i++) {
				let toppingDraw

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
			for (let i = 1; i <= condiments; i++) {
				let condimentDraw

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
        let relicPath = dataPath+'/RelicSearch/relicData.json'
        let relicRead = fs.readFileSync(relicPath, {flag: 'as+'});
        let relicData = JSON.parse(relicRead);

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
        relicRead = fs.readFileSync(relicPath, {flag: 'as+'});
        let relicDefs = JSON.parse(relicRead);

        let itemArr = []
        let getItem;
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

        let itemName = `${getItem.name}`
        let itemStars = "⭐"
        if (getItem.rarity == 5) {
            let itemStars = "🌟🌟🌟🌟🌟"
        } else if (getItem.rarity == 4) {
            let itemStars = "✨✨✨✨"
        } else if (getItem.rarity == 3) {
            let itemStars = "⭐⭐⭐"
        } else if (getItem.rarity == 2) {
            let itemStars = "⭐⭐"
        }
        let itemSeries = `${getItem.series}`
        let itemAtk = getItem.atk
        let itemDef = getItem.def
        let itemMag = getItem.mag
        const DiscordEmbed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle(`${itemName}`)
            .setDescription(`${itemStars}\n${itemSeries}\n\n${itemAtk}ATK\n${itemMag}MAG\n${itemDef}DEF\n(React with any emoji to pick up.)`)
            .setImage(`${getItem.img}`)
            .setFooter('Relic Search');
        message.channel.send({embeds: [DiscordEmbed]})
    }

    if (command === 'checkrelics' || command === 'cr' || command === 'rr') {
        let relicPath = dataPath+'/RelicSearch/relicData.json'
        let relicRead = fs.readFileSync(relicPath, {flag: 'as+'});
        let relicData = JSON.parse(relicRead);
        let relicPath2 = dataPath+'/RelicSearch/relicDefs.json'
        let relicRead2 = fs.readFileSync(relicPath2, {flag: 'as+'});
        let relicDefs = JSON.parse(relicRead2);

        if (!relicData[message.author.id] || !relicData[message.author.id].relics) {
            message.channel.send("No relics!")
            return
        }

        let m = ``;
        for (const i in relicData[message.author.id].relics) {
            const relic = relicData[message.author.id].relics[i]
            const relicDef = relicDefs[relic]

            let stars = "⭐"
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
        let relicPath = dataPath+'/RelicSearch/relicDefs.json'
        let relicRead = fs.readFileSync(relicPath, {flag: 'as+'});
        let relicDefs = JSON.parse(relicRead);
        let relicPath2 = dataPath+'/RelicSearch/relicData.json'
        let relicRead2 = fs.readFileSync(relicPath2, {flag: 'as+'});
        let relicData = JSON.parse(relicRead2);

        const argument = message.content.slice(13)
        let arg = argument

        if (relicDefs[arg]) {
            const getItem = relicDefs[arg]

            let itemName = `${getItem.name}`
            let itemStars = "⭐"
            if (getItem.rarity == 5) {
                let itemStars = "🌟🌟🌟🌟🌟"
            } else if (getItem.rarity == 4) {
                let itemStars = "✨✨✨✨"
            } else if (getItem.rarity == 3) {
                let itemStars = "⭐⭐⭐"
            } else if (getItem.rarity == 2) {
                let itemStars = "⭐⭐"
            }
            let itemSeries = `${getItem.series}`
            let itemAtk = getItem.atk
            let itemDef = getItem.def
            let itemMag = getItem.mag
            let owned = "Not Owned"
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
        const argument = message.content.slice(prefix.length+5)
        let arg = argument

        let relicPath = dataPath+'/RelicSearch/relicData.json'
        let relicRead = fs.readFileSync(relicPath, {flag: 'as+'});
        let relicData = JSON.parse(relicRead);

        if (!relicData[message.author.id] || !relicData[message.author.id].relics) {
            message.channel.send("No relics!")
            return
        }

        let equip = ``;
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
		let relicPath = dataPath+'/RelicSearch/relicFight.json';
		let relicRead = fs.readFileSync(relicPath, {flag: 'as+'});
		let relicFight = JSON.parse(relicRead);
		let relicEquipPath = dataPath+'/RelicSearch/relicData.json';
		let relicEquipRead = fs.readFileSync(relicEquipPath, {flag: 'as+'});
		let relicData = JSON.parse(relicEquipRead);
		let relicDefsPath = dataPath+'/RelicSearch/relicDefs.json';
		let relicDefsRead = fs.readFileSync(relicDefsPath, {flag: 'as+'});
		let relicDefs = JSON.parse(relicDefsRead);
		
		var DiscordEmbed = {}

        if (!message.mentions.users.first()) {
            message.channel.send("Very well, I'll train you. \nPS: I'm a cheater.")

            let player = message.author;
            let enemy = message.mentions.users.first();
			
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
			let charDefs = RF.genChar(player.username, player.id, relicDefs[relicData[player.id].userelic].atk, relicDefs[relicData[player.id].userelic].mag, relicDefs[relicData[player.id].userelic].def)
            relicFight[message.channel.id].fighters.push(charDefs)

			// The Foe
			charDefs = RF.genChar('Bloom Battler', null, 25, 25, 4)
			charDefs.hp = 200
            relicFight[message.channel.id].fighters.push(charDefs)

			// The Channel you're battling in
            relicFight[message.channel.id].battlechannel = message.channel.id

            fs.writeFileSync(relicPath, JSON.stringify(relicFight, null, '    '));

            let fighters = ``
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

			if (!relicData[message.author.id].userelic)
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
			let charDefs = RF.genChar(message.author.username, message.author.id, relicDefs[relicData[message.author.id].userelic].atk, relicDefs[relicData[message.author.id].userelic].mag, relicDefs[relicData[message.author.id].userelic].def)
			relicFight[message.channel.id].fighters.push(charDefs)

			// The Foes
			for (const i in arg) {
				if (i > 0) {
					let enemy;
					if (arg[i].startsWith('<@') && arg[i].endsWith('>')) {
						let mention = arg[i].slice(2, -1);

						if (mention.startsWith('!'))
							mention = mention.slice(1);

						enemy = client.users.cache.get(mention);
					} else 
						return message.channel.send(`Argument "${arg[i]}" isn't a valid user!`);

					if (!enemy || !enemy.id) return message.channel.send(`Argument "${arg[i]}" isn't a valid user!`);

					if (!enemy.bot) {
						if (!relicData[enemy.id].userelic) return essage.channel.send(`**${enemy.username}** doesn't have an equipped relic!`);
					}
					
					if (enemy.bot)
						charDefs = RF.genChar(enemy.username, null, Math.round(Math.random() * 20), Math.round(Math.random() * 20), Math.round(Math.random() * 20));
					else
						charDefs = RF.genChar(enemy.username, enemy.id, relicDefs[relicData[enemy.id].userelic].atk, relicDefs[relicData[enemy.id].userelic].mag, relicDefs[relicData[enemy.id].userelic].def);

					relicFight[message.channel.id].fighters.push(charDefs)
				}
			}

			fs.writeFileSync(relicPath, JSON.stringify(relicFight, null, '    '));

			let fighters = ``
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
			let relicPath = dataPath+'/RelicSearch/relicFight.json';
			let relicRead = fs.readFileSync(relicPath, {flag: 'as+'});
			let relicFight = JSON.parse(relicRead);

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
		let shopPath = `${dataPath}/Shops/shops-${message.guild.id}.json`
		let shopRead = fs.readFileSync(shopPath, {flag: 'as+'});
		let shopFile = JSON.parse(shopRead);
        let itemPath = dataPath+'/items.json'
        let itemRead = fs.readFileSync(itemPath, {flag: 'as+'});
        let itemFile = JSON.parse(itemRead);
        let servPath = dataPath+'/Server Settings/server.json'
        let servRead = fs.readFileSync(servPath, {flag: 'as+'});
        let servFile = JSON.parse(servRead);
		
        if (!servFile[message.guild.id]) {
            servFile[message.guild.id] = {
				prefix: "rpg!",
				limitbreaks: false,
				showtimes: false,
				onemores: false,
				currency: "Bloom Token",
				xprate: 1,
				damageFormula: "persona",
				levelUpFormula: "original",
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
		
		let itemString = ''
		for (const i in shopFile[message.guild.id][shopChannel.id].items) {
			let itemDefs = itemFile[shopFile[message.guild.id][shopChannel.id].items[i]]
			itemString += `\n**${itemDefs.name}**\nCosts ${itemDefs.cost} ${servFile[message.guild.id].currency}s.\n*${itemDefs.desc}*\n`
		}

		let itemEmbed = new Discord.MessageEmbed()
			.setColor('#c2907e')
			.setTitle(`${shopFile[message.guild.id][shopChannel.id].name}`)
			.setDescription(`*The shop has been opened!*\n${itemString}`)
		shopChannel.send({embeds: [itemEmbed]})
	}

    if (command === 'entershop') {
		if (utilityFuncs.isBanned(message.author.id, message.guild.id) && !utilityFuncs.RPGBotAdmin(message.author.id))
			return message.channel.send("I've been told you were banned from using the RPG sections of the bot, sorry!");
		
        if (!message.member.permissions.serialize().ADMINISTRATOR)
            return message.channel.send("You lack sufficient permissions, I'm so sorry!");

        const arg = message.content.slice(prefix.length).trim().split(/ +/);
        if (!arg[1]) {
            const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle(`${prefix}entershop`)
				.setDescription('(Args <Party>)\nEnters a created shop with the specified party.')
            message.channel.send({embeds: [DiscordEmbed]})
            return false
        }
		
		let shopPath = `${dataPath}/Shops/shops-${message.guild.id}.json`
		let shopRead = fs.readFileSync(shopPath, {flag: 'as+'});
		let shopFile = JSON.parse(shopRead);   
		let btlPath = dataPath+'/Battles/battle-' + message.guild.id + '.json'
		let btlRead = fs.readFileSync(btlPath, {flag: 'as+'});
		let btl = JSON.parse(btlRead);
        let itemPath = dataPath+'/items.json'
        let itemRead = fs.readFileSync(itemPath, {flag: 'as+'});
        let itemFile = JSON.parse(itemRead);
        let servPath = dataPath+'/Server Settings/server.json'
        let servRead = fs.readFileSync(servPath, {flag: 'as+'});
        let servFile = JSON.parse(servRead);
		
        if (!servFile[message.guild.id]) {
            servFile[message.guild.id] = {
				prefix: "rpg!",
				limitbreaks: false,
				showtimes: false,
				onemores: false,
				currency: "Bloom Token",
				xprate: 1,
				damageFormula: "persona",
				levelUpFormula: "original",
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
		
		let shop = shopFile[message.guild.id][message.channel.id]
		let servBtl = btl[message.guild.id]

		if (servBtl.parties[arg[1]]) {
			shop.party = arg[1]
			fs.writeFileSync(shopPath, JSON.stringify(shopFile, null, '    '));
		
			let itemString = `${servBtl.parties[arg[1]].rings} ${servFile[message.guild.id].currency}s\n\n`
			for (const i in shop.items) {
				let itemDefs = itemFile[shop.items[i]]
				itemString += `\n**${itemDefs.name}**\nCosts ${itemDefs.cost} ${servFile[message.guild.id].currency}s.\n*${itemDefs.desc}*\n`
			}

			let itemEmbed = new Discord.MessageEmbed()
				.setColor('#c2907e')
				.setTitle(`${shop.name}`)
				.setDescription(`*The shop has been opened!*\n${itemString}`)

			message.channel.send({content:`Team ${arg[1]} entered the shop.`,embeds:[itemEmbed]})
			message.delete()
		} else {
			message.channel.send("Invalid Party!")
			return false
		}
	}

    if (command === 'leaveshop') {
		let shopPath = `${dataPath}/Shops/shops-${message.guild.id}.json`
		let shopRead = fs.readFileSync(shopPath, {flag: 'as+'});
		let shopFile = JSON.parse(shopRead);
		let shop = shopFile[message.guild.id][message.channel.id];
		
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
		let shopPath = `${dataPath}/Shops/shops-${message.guild.id}.json`
        let itemPath = dataPath+'/items.json'
        let servPath = dataPath+'/Server Settings/server.json'
		let btlPath = dataPath+'/Battles/battle-' + message.guild.id + '.json'
		let shopRead = fs.readFileSync(shopPath, {flag: 'as+'});
        let itemRead = fs.readFileSync(itemPath, {flag: 'as+'});
        let servRead = fs.readFileSync(servPath, {flag: 'as+'});
		let btlRead = fs.readFileSync(btlPath, {flag: 'as+'});
		let shopFile = JSON.parse(shopRead);
        let itemFile = JSON.parse(itemRead);
        let servFile = JSON.parse(servRead);
		let btl = JSON.parse(btlRead);
		
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
		
		let hasItem = false
		for (const i in shopFile[message.guild.id][message.channel.id].items) {
			let itemName = shopFile[message.guild.id][message.channel.id].items[i]
			if (arg[1] == itemName) {
				hasItem = true
			}
		}
		
		if (hasItem == false) {
			message.channel.send("The shop isn't selling this item.")
			message.delete()
			return false
		}
		
		let totalCost = 0;
		let totalQuantity = arg[2] ? parseInt(arg[2]) : 1
		for (i = 1; i <= parseInt(arg[2]); i++)
			totalCost += itemFile[arg[1]].cost;
		
		let party = btl[message.guild.id].parties[shopFile[message.guild.id][message.channel.id].party]
		
		if (party.rings < totalCost) {
			message.channel.send(`The party doesn't have enough ${servFile[message.guild.id].currency}s! (Need ${totalCost})`)
			message.delete()
			return false
		}
		
		let itemName = itemFile[arg[1]].name
		
		party.rings -= totalCost
		if (!party.items[arg[1]])
			party.items[arg[1]] = 0;

		if (totalQuantity > 1)
			message.channel.send(`Team ${shopFile[message.guild.id][message.channel.id].party} bought **${totalQuantity} ${itemName}s**.\n*(${party.rings} ${servFile[message.guild.id].currency}s left.)*`);
		else
			message.channel.send(`Team ${shopFile[message.guild.id][message.channel.id].party} bought a **${itemName}**.\n*(${party.rings} ${servFile[message.guild.id].currency}s left.)*`);
		
		party.items[arg[1]] += totalQuantity
		fs.writeFileSync(btlPath, JSON.stringify(btl, null, '    '));
	}
	
	/////////////////
	// Blacksmiths //
	/////////////////
    if (command === 'registerblacksmith') {
		if (utilityFuncs.isBanned(message.author.id, message.guild.id) && !utilityFuncs.RPGBotAdmin(message.author.id))
			return message.channel.send("I've been told you were banned from using the RPG sections of the bot, sorry!")
		
        if (!message.member.permissions.serialize().ADMINISTRATOR)
            return message.channel.send("You lack sufficient permissions, I'm so sorry!");

        const arg = message.content.slice(prefix.length).trim().split(/ +/);
        if (!arg[1]) {
            const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle(`${prefix}${command}`)
				.setDescription('(Args <Name> <Channel ID>)\nCreates a blacksmith that characters may create and enhance weapons with.')
            message.channel.send({embeds: [DiscordEmbed]})
            return false
        }

		if (!arg[2] || !client.channels.cache.get(arg[2]))
			return message.channel.send("Please specify a valid channel.");

		const shopChannel = client.channels.cache.get(arg[2])
		let blacksmithPath = `${dataPath}/BlackSmiths/blacksmith-${arg[2]}.json`
		let blacksmithRead = fs.readFileSync(blacksmithPath, {flag: 'as+'});
		
		if (blacksmithRead == '' || blacksmithRead == ' ')
			blacksmithRead = '{}';

		let blacksmithFile = JSON.parse(blacksmithRead);
        let itemPath = dataPath+'/items.json'
        let itemRead = fs.readFileSync(itemPath, {flag: 'as+'});
        let itemFile = JSON.parse(itemRead);
        let servPath = dataPath+'/Server Settings/server.json'
        let servRead = fs.readFileSync(servPath, {flag: 'as+'});
        let servFile = JSON.parse(servRead);
		
        if (!servFile[message.guild.id]) {
            servFile[message.guild.id] = {
				prefix: "rpg!",
				limitbreaks: false,
				showtimes: false,
				onemores: false,
				currency: "Bloom Token",
				xprate: 1,
				damageFormula: "persona",
				levelUpFormula: "original",
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

		blacksmithFile = {
			name: arg[1],
			party: 'none',
			state: 'closed',
			text: {
				blacksmith: `??? - ${arg[1]}`,
				enter: ["Hey, welcome to the blacksmith's. We do weapons, armors and more!"],
				weapon: ["Would you like me to create some weapons, or enhance an existing one?"],
				armor: ["Would you like me to create some armors, or enhance an existing one?"],

				createWeapon: ["Which weapon do you think suits you?", "Any of these seem useful?"],
				enhanceWeapon: ["Want to get stronger? Why don't you enhance a weapon."],
				createArmor: ["Which set of armor do you think suits you?", "Any of these seem useful?"],
				enhanceArmor: ["Want to get stronger? Why don't you enhance an armor."],

				lackMaterial: ["You seem to lack the materials I need to do this, sorry."],
				lackMoney: ["You seem to be a little short on the money I want. Sorry."],

				decompose: ["I can also scrap some of your stuff back into materials, but I won't be able to salvage all of it."]
			}
		}

		fs.writeFileSync(blacksmithPath, JSON.stringify(blacksmithFile, null, '    '));

		let itemEmbed = new Discord.MessageEmbed()
			.setColor('#c2907e')
			.setTitle(`${blacksmithFile.name}`)
			.setDescription(`*The blacksmith has been opened!*`)
		shopChannel.send({embeds: [itemEmbed]})
	}
	
    if (command === 'enterblacksmith') {
		let blacksmithPath = `${dataPath}/BlackSmiths/${message.guild.id}/blacksmith-${arg[2]}.json`
		let blacksmithRead = fs.readFileSync(blacksmithPath, {flag: 'as+'});
		let blacksmithFile = JSON.parse(blacksmithRead);
		let btlPath = dataPath+'/Battles/battle-' + message.guild.id + '.json'
		let btlRead = fs.readFileSync(btlPath, {flag: 'as+'});
		let btl = JSON.parse(btlRead);
        let itemPath = dataPath+'/items.json'
        let itemRead = fs.readFileSync(itemPath, {flag: 'as+'});
        let itemFile = JSON.parse(itemRead);
        let servPath = dataPath+'/Server Settings/server.json'
        let servRead = fs.readFileSync(servPath, {flag: 'as+'});
        let servFile = JSON.parse(servRead);
		
        if (!servFile[message.guild.id]) {
            servFile[message.guild.id] = {
				prefix: "rpg!",
				limitbreaks: false,
				showtimes: false,
				onemores: false,
				currency: "Bloom Token",
				xprate: 1,
				damageFormula: "persona",
				levelUpFormula: "original",
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
        if (!arg[1]) {
            const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle(`${prefix}entershop`)
				.setDescription('(Args <Party>)\nEnters a created shop with the specified party.')
            message.channel.send({embeds: [DiscordEmbed]})
            return false
        };
		
		if (!btl[message.guild.id].parties[arg[1]])
			return message.channel.send('No valid party was provided.')

		if (!blacksmithFile.name)
			return message.channel.send("There's no blacksmith here...");

		if (blackSmith[message.channel.id])
			return message.channel.send("Someone's in the blacksmith's already.")
		
		blacksmithFile.party = arg[1]
		blacksmithFile.state = 'enter'

		let bEmbed = new Discord.MessageEmbed()
			.setColor('#c2907e')
			.setTitle(`${blacksmithFile.blacksmith}`)
			.setDescription(`"${blacksmithFile.enter[Math.round(Math.random()*blacksmithFile.enter.length-1)]}"`)

		blackSmith[message.channel.id] = message.channel.send({embeds: [bEmbed]})
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

		let chestPath = dataPath+'/chests.json'
		let chestRead = fs.readFileSync(chestPath, {flag: 'as+'});
		let chestFile = JSON.parse(chestRead);
        let itemPath = dataPath+'/items.json'
        let itemRead = fs.readFileSync(itemPath, {flag: 'as+'});
        let itemFile = JSON.parse(itemRead);
		let lootPath = `${dataPath}/Loot/lootTables-${message.guild.id}.json`
		let lootRead = fs.readFileSync(lootPath, {flag: 'as+'});
		let lootFile = JSON.parse(lootRead);

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

		if (!chestFile[message.guild.id])
			chestFile[message.guild.id] = {};

		if (!chestFile[message.guild.id][chestChannel.id])
			chestFile[message.guild.id][chestChannel.id] = {};

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
			let chestEmbed = new Discord.MessageEmbed()
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

		let chestEmbed = new Discord.MessageEmbed()
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

		let chestPath = dataPath+'/chests.json'
		let chestRead = fs.readFileSync(chestPath, {flag: 'as+'});
		let chestFile = JSON.parse(chestRead);

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

		let chestPath = dataPath+'/chests.json'
		let chestRead = fs.readFileSync(chestPath, {flag: 'as+'});
		let chestFile = JSON.parse(chestRead);

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

		let chestPath = dataPath+'/chests.json'
		let chestRead = fs.readFileSync(chestPath, {flag: 'as+'});
		let chestFile = JSON.parse(chestRead);

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

		let chestPath = dataPath+'/chests.json'
		let chestRead = fs.readFileSync(chestPath, {flag: 'as+'});
		let chestFile = JSON.parse(chestRead);

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

		if (!arg[2])
			return message.channel.send("Please specify a new name for this chest.");

		if (!utilityFuncs.getChest(arg[1],message))
			message.channel.send(`${arg[1]} is not a valid chest.`);

		if (arg[2] == arg[1]) {
			message.channel.send(`You can't rename a chest to the same thing. Please change the new name.`)
			return false
		}

		let chestPath = dataPath+'/chests.json'
		let chestRead = fs.readFileSync(chestPath, {flag: 'as+'});
		let chestFile = JSON.parse(chestRead);

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

		if (!utilityFuncs.getChest(arg[1],message))
			return message.channel.send(`${arg[1]} is not a valid chest.`);

		let lootPath = `${dataPath}/Loot/lootTables-${message.guild.id}.json`
		let lootRead = fs.readFileSync(lootPath, {flag: 'as+'});
		let lootFile = JSON.parse(lootRead);
		let chestPath = dataPath+'/chests.json'
		let chestRead = fs.readFileSync(chestPath, {flag: 'as+'});
		let chestFile = JSON.parse(chestRead);
	
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

					let chestEmbed = new Discord.MessageEmbed()
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

		if (!utilityFuncs.getChest(arg[1],message))
			return message.channel.send(`${arg[1]} is not a valid chest.`);

		let chestPath = dataPath+'/chests.json'
		let chestRead = fs.readFileSync(chestPath, {flag: 'as+'});
		let chestFile = JSON.parse(chestRead);

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

					let chestEmbed = new Discord.MessageEmbed()
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

		if (!utilityFuncs.getChest(arg[1],message))
			return message.channel.send(`${arg[1]} is not a valid chest.`);

		let chestPath = dataPath+'/chests.json'
		let chestRead = fs.readFileSync(chestPath, {flag: 'as+'});
		let chestFile = JSON.parse(chestRead);
		let itemPath = dataPath+'/items.json'
        let itemRead = fs.readFileSync(itemPath, {flag: 'as+'});
        let itemFile = JSON.parse(itemRead);

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
							let item = chestFile[message.guild.id][channelID][arg[1]].inputItems[i]

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
	
						let chestEmbed = new Discord.MessageEmbed()
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

		if (!utilityFuncs.getChest(arg[1],message))
			return message.channel.send(`${arg[1]} is not a valid chest.`)

		let chestPath = dataPath+'/chests.json'
		let chestRead = fs.readFileSync(chestPath, {flag: 'as+'});
		let chestFile = JSON.parse(chestRead);

		for (const channelID in chestFile[message.guild.id]) {
			for (const chest in chestFile[message.guild.id][channelID]) {
				if (chestFile[message.guild.id][channelID][arg[1]]) {

					if (chestFile[message.guild.id][channelID][arg[1]].inputItems == [])
						return message.channel.send(`${arg[1]} already doesn't have base items to begin with.`);

					for (const i in chestFile[message.guild.id][channelID][arg[1]].inputItems) {
						let item = chestFile[message.guild.id][channelID][arg[1]].inputItems[i]

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

					let chestEmbed = new Discord.MessageEmbed()
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

		let chestPath = dataPath+'/chests.json'
		let chestRead = fs.readFileSync(chestPath, {flag: 'as+'});
		let chestFile = JSON.parse(chestRead);
		let itemPath = dataPath+'/items.json'
        let itemRead = fs.readFileSync(itemPath, {flag: 'as+'});
        let itemFile = JSON.parse(itemRead);

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

		let chestPath = dataPath+'/chests.json'
		let chestRead = fs.readFileSync(chestPath, {flag: 'as+'});
		let chestFile = JSON.parse(chestRead);

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

		let chestPath = dataPath+'/chests.json'
		let chestRead = fs.readFileSync(chestPath, {flag: 'as+'});
		let chestFile = JSON.parse(chestRead);

		let canSkip = false
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

					let chestChannel = client.channels.cache.get(channelID)
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

					let chestEmbed = new Discord.MessageEmbed()
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

		let chestPath = dataPath+'/chests.json'
		let chestRead = fs.readFileSync(chestPath, {flag: 'as+'});
		let chestFile = JSON.parse(chestRead);

		let skillTxt = []
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
		let chestPath = dataPath+'/chests.json'
		let chestRead = fs.readFileSync(chestPath, {flag: 'as+'});
		let chestFile = JSON.parse(chestRead);
		
		let skillTxt = []
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

		let chestPath = dataPath+'/chests.json'
		let chestRead = fs.readFileSync(chestPath, {flag: 'as+'});
		let chestFile = JSON.parse(chestRead);
		let btlPath = dataPath+'/Battles/battle-' + message.guild.id + '.json'
		let btlRead = fs.readFileSync(btlPath, {flag: 'as+'});
		let btl = JSON.parse(btlRead);

		if (!chestFile[message.guild.id][message.channel.id][arg[1]]) {
			message.channel.send(`${arg[1]} does not exist in this channel. Please try somewhere else.`);
            return
		}

		if (!btl[message.guild.id].parties[arg[2]]) {
			message.channel.send("Invalid Party!")
			return false
		}

		let chestInput = chestFile[message.guild.id][message.channel.id][arg[1]]
		let partyInput = btl[message.guild.id].parties[arg[2]]

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

		let chestEmbed = new Discord.MessageEmbed()
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

		let chestPath = dataPath+'/chests.json'
		let chestRead = fs.readFileSync(chestPath, {flag: 'as+'});
		let chestFile = JSON.parse(chestRead);
		let btlPath = dataPath+'/Battles/battle-' + message.guild.id + '.json'
		let btlRead = fs.readFileSync(btlPath, {flag: 'as+'});
		let btl = JSON.parse(btlRead);

		if (!chestFile[message.guild.id][message.channel.id][arg[1]]) {
			message.channel.send(`${arg[1]} does not exist in this channel. Please try somewhere else.`);
            return
		}

		let chestInput = chestFile[message.guild.id][message.channel.id][arg[1]]

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

		let chestPath = dataPath+'/chests.json'
		let chestRead = fs.readFileSync(chestPath, {flag: 'as+'});
		let chestFile = JSON.parse(chestRead);
		let itemPath = dataPath+'/items.json'
		let itemRead = fs.readFileSync(itemPath, {flag: 'as+'});
		let itemFile = JSON.parse(itemRead);
		let btlPath = dataPath+'/Battles/battle-' + message.guild.id + '.json'
		let btlRead = fs.readFileSync(btlPath, {flag: 'as+'});
		let btl = JSON.parse(btlRead);

		if (!chestFile[message.guild.id][message.channel.id][arg[1]]) {
			message.channel.send(`${arg[1]} does not exist in this channel. Please try somewhere else.`);
            return
		}

		let chestInput = chestFile[message.guild.id][message.channel.id][arg[1]]

		if (chestInput.party == "") {
			message.channel.send(`${arg[1]} is not open yet. Please open it first.`);
            return
		}

		let partyInput = btl[message.guild.id].parties[chestInput.party]

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

		let chestEmbed = new Discord.MessageEmbed()
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

		let chestPath = dataPath+'/chests.json'
		let chestRead = fs.readFileSync(chestPath, {flag: 'as+'});
		let chestFile = JSON.parse(chestRead);
		let itemPath = dataPath+'/items.json'
		let itemRead = fs.readFileSync(itemPath, {flag: 'as+'});
		let itemFile = JSON.parse(itemRead);
		let btlPath = dataPath+'/Battles/battle-' + message.guild.id + '.json'
		let btlRead = fs.readFileSync(btlPath, {flag: 'as+'});
		let btl = JSON.parse(btlRead);

		if (!chestFile[message.guild.id][message.channel.id][arg[1]]) {
			message.channel.send(`${arg[1]} does not exist in this channel. Please try somewhere else.`);
            return
		}

		let chestInput = chestFile[message.guild.id][message.channel.id][arg[1]]

		if (chestInput.party == "") {
			message.channel.send(`${arg[1]} is not open yet. Please open it first.`);
            return
		}

		let partyInput = btl[message.guild.id].parties[chestInput.party]

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

		let chestEmbed = new Discord.MessageEmbed()
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
		let pageNum = parseInt(arg[1])
		
		let guidePath = dataPath+'/guide.json'
		let guideRead = fs.readFileSync(guidePath, {flag: 'as+'});
		let guide = JSON.parse(guideRead);
        let charPath = dataPath+'/characters.json';
        let charRead = fs.readFileSync(charPath, {flag: 'as+'});
        let charFile = JSON.parse(charRead);
		let skillPath = dataPath+'/skills.json';
		let skillRead = fs.readFileSync(skillPath, {flag: 'as+'});
		let skillFile = JSON.parse(skillRead);
		
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
					let titleTxt = guideTxt.fields[i].title ? guideTxt.fields[i].title : `Section ${i}`
					let descTxt = guideTxt.fields[i].text ? guideTxt.fields[i].text : 'Description Text'
					let inline = guideTxt.fields[i].inline ? true : false
					
					if (descTxt.includes('%RANDOMSKILL%')) {
						let possibleSkills = []
						for (const val in skillFile) {
							if (skillFile[val].type != "heal" && (skillFile[val].type != "status" && !skillFile[val].buff) && skillFile[val].type != "passive" && val != "Metronome") {
								possibleSkills.push(val)
							}
						}

						let skillVal = possibleSkills[Math.round(Math.random() * (possibleSkills.length-1))]
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
		if (utilityFuncs.isBanned(message.author.id, message.guild.id) && !utilityFuncs.RPGBotAdmin(message.author.id))
			return message.channel.send("I've been told you were banned from using the RPG sections of the bot, sorry!");

        const arg = message.content.slice(prefix.length).trim().split(/ +/);
        if (!arg[1]) {
            const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .addFields(
                    { name: `${prefix}registerskill`, value: `(Args <Name> <Cost> <CostType> <Power> <Accuracy> <Critical Hit Chance> <Element> <Status Affliction> <Status Chance> <Physical/Magic> <Target> <Hits> <Extra 1> <Extra 2> <Extra 3> "<Desc>")\nCreates a skill to be used in battle. \nThese skills have certain properties that can change how they're used.\n\nAllow me to explain`, inline: false },
                    { name: 'Cost', value: "To be used in combination with the next one.", inline: true },
                    { name: 'CostType', value: "HP, MP, HP% or MP%. For example, if I set cost to 5, and costtype to MP%, it would take 5% of my MP.", inline: true },
                    { name: 'Power', value: "Self Explanitory. \nA little insight on how damage is calculated, somewhat similar to the Persona series.", inline: true },
                    { name: 'Accuracy', value: "A chance out of 100 that the move lands. Modified by user perception and enemy agility.", inline: true },
                    { name: 'Critical Hit Chance', value: "The chance that this move is a critical hit out of 100. Modified by user and enemy luck.", inline: true },
                    { name: 'Element', value: "The element this skill is. This is either Strike, Slash, Pierce, Fire, Water, Ice, Electric, Wind, Earth, Grass, Psychic, Poison, Nuclear, Metal, Curse, Bless, Almighty, Heal, with Status and Passive relegated to alternate commands.", inline: true },
                    { name: 'Status Affliction', value: "The status effect this skill can inflict.", inline: true },
                    { name: 'Status Chance', value: "Chance this skill has to inflict a status effect (will do nothing if 'Status Affliction' is 'none'.", inline: true },
                    { name: 'Physical or Magic?', value: "If this skill is physical it will use the user's Strength stat, otherwise, Magic.", inline: true },
                    { name: 'Target', value: "Whether this targets all foes or one foe, maybe even all allies depending on the skill. The target types are 'one', 'allopposing', 'ally', 'allallies', 'caster' and 'everyone'", inline: true },
                    { name: 'Hit Count', value: 'The amount of hits this move does. Generally, moves with more hits have less power.', inline: true },
                    { name: 'Extra Effect 1', value: `Some skills have extra effects upon hit. Effects such as "debuff", "buff", "debuffuser", "ohko", "stealmp", "metronome", "sacrifice" and "feint" can be used here. Heal skills have different effects so these will not work.\n*You can list these effects with ${prefix}listatkeffects.*`, inline: true },
                    { name: 'Extra Effect 2', value: 'Some extra effects need extra values to make it work. For the buff related things, this is the stat to debuff.', inline: true },
                    { name: 'Extra Effect 3', value: 'Some extra effects need extra values to make it work. For the buff related things, this is the chance this skill debuffs.', inline: true },
                    { name: 'Description', value: "This Skills's description. Try to explain what the move does, so your friends can imagine it! Enclose this value in quotation marks.", inline: true },
                )
            message.channel.send({embeds: [DiscordEmbed]})
            return false
        }
		
        if (message.content.includes("@everyone") || message.content.includes("@here") || message.mentions.users.first())
            return message.channel.send("You're really mean, you know that?");
		
		if (arg[1].length > 50)
			return message.channel.send(`${arg[1]} is too long!`);

        if (!utilityFuncs.RPGBotAdmin(message.author.id) && message.author.id != readSkill(arg[1]).originalAuthor) {
            if (readSkill(arg[1]))
                return message.channel.send("This skill exists already, and you aren't it's original author, therefore, You have insufficient permissions to overwrite it.");
        }

		if (!arg[2])
			return registerSkillSteps.step1(arg[1], client, message.channel, message.author)
			
		if (!arg[7])
			return message.channel.send("Please specify a type.");

        if (utilityFuncs.validType(arg[7].toLowerCase())) {
			if (arg[7].toLowerCase() === 'status')
				return message.channel.send(`Don't define Status Type Skills here. Check ${prefix}registerstatus`)
			if (arg[7].toLowerCase() === 'passive')
				return message.channel.send(`Don't define Passive Type Skills here. Check ${prefix}registerpassive`)

			if (!arg[10])
				return message.channel.send('Please specify either "Physical" or "Magic" for argument 10.');

            let skilltype = "physical"
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

            let costType = "mp"
            if (arg[3].toLowerCase() === "hp" || arg[3].toLowerCase() === "health") {
                costType = "hp"
            } else if (arg[3].toLowerCase() === "mp%" || arg[3].toLowerCase() === "mppercent" || arg[3].toLowerCase() === "percentofmp") {
                costType = "mppercent"
            } else if (arg[3].toLowerCase() === "hp%" || arg[3].toLowerCase() === "hppercent" || arg[3].toLowerCase() === "percentofhp") {
                costType = "hppercent"
            } else if (arg[3].toLowerCase() === "currency" || arg[3].toLowerCase() === "money") {
                costType = "money"
            }

            let targType = "one"
            if (arg[11].toLowerCase() === "allenemies" || arg[11].toLowerCase() === "allfoes" || arg[11].toLowerCase() === "allopposing") {
                targType = "allopposing"
            } else if (arg[11].toLowerCase() === "ally" || arg[11].toLowerCase() === "friend" || arg[11].toLowerCase() === "player") {
                targType = "ally"
            } else if (arg[11].toLowerCase() === "allallies" || arg[11].toLowerCase() === "allfriends" || arg[11].toLowerCase() === "allplayers") {
                targType = "allallies"
            } else if (arg[11].toLowerCase() === "all" || arg[11].toLowerCase() === "everyone" || arg[11].toLowerCase() === "fuckyou") {
                targType = "everyone"
            } else if (arg[11].toLowerCase() === "me" || arg[11].toLowerCase() === "user" || arg[11].toLowerCase() === "caster") {
                targType = "caster"
            } else if (arg[11].toLowerCase() === "rand" || arg[11].toLowerCase() === "random" || arg[11].toLowerCase() === "?") {
                targType = "random"
            } else if (arg[11].toLowerCase() === "randopp" || arg[11].toLowerCase() === "randomtarget" || arg[11].toLowerCase() === "randomopposing") {
                targType = "randomopposing"
            }
			
			let skillDesc = message.content.slice(prefix.length).trim().split('"')[1]
			
			// Name
			/*
			const isUpperCase = (string) => /^[A-Z]*$/.test(string)

			let newName = arg[1].split('');
			for (let i = 1; i < arg[1].length; i++) {
				let charStr = arg[1].charAt(i)
				if (isUpperCase(charStr)) {
					newName.splice(i, 0, ' ')
				}
			}
			
			newName = newName.join('')
			*/

            writeSkill(message, arg[1], arg[1], parseInt(arg[2]), costType, parseInt(arg[4]), parseInt(arg[5]), parseInt(arg[6]), arg[7].toLowerCase(), arg[8], parseInt(arg[9]), skilltype, targType, parseInt(arg[12]), arg[13], arg[14], arg[15], skillDesc)
			if (readSkill(arg[1])) {
				const skillName = arg[1]
				const skillDefs = readSkill(skillName)

				let finalText = skillFuncs.skillDesc(skillDefs, arg[1], message.guild.id)

				const DiscordEmbed = new Discord.MessageEmbed()
					.setColor('#4b02c9')
					.setTitle(`${elementEmoji[skillDefs.type]} ${skillName}`)
					.setDescription(`${finalText}`)
				message.channel.send({content: `${skillName} is good to go!`, embeds: [DiscordEmbed]});
			} else {
				message.channel.send(`There's been an issue creating your skill!`);
				return
			}
        } else {
            message.channel.send(`${arg[5]} is not a valid type.`)
        }
    }

    if (command === 'registerheal') {
		if (utilityFuncs.isBanned(message.author.id, message.guild.id) && !utilityFuncs.RPGBotAdmin(message.author.id))
			return message.channel.send("I've been told you were banned from using the RPG sections of the bot, sorry!");

        const arg = message.content.slice(prefix.length).trim().split(/ +/);
        if (!arg[1]) {
            const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .addFields(
                    { name: `${prefix}registerheal`, value: `(Args <Name> <Cost> <CostType> <Power> <Target> <Extra 1> <Extra 2> <Extra 3> "<Desc>")\nCreates a skill to be used in battle. \nThese skills have certain properties that can change how they're used.\n\nAllow me to explain`, inline: false },
                    { name: 'Cost', value: "To be used in combination with the next one.", inline: true },
                    { name: 'CostType', value: "HP, MP, HP% or MP%. For example, if I set cost to 5, and costtype to MP%, it would take 5% of my MP.", inline: true },
                    { name: 'Power', value: "Self Explanitory. \nHeal Skills can heal from -8 to +8 away from this value, and is affected by trust.", inline: true },
                    { name: 'Target', value: "Whether this targets all allies or one ally, maybe even everyone depending on the skill. The target types are 'ally', 'allallies', 'one', 'allopposing', 'caster', 'everyone', 'random' and 'randomoppoisng'", inline: true },
                    { name: 'Extra Effect 1', value: `Some skills have extra effects upon hit. Effects such as "healmp", "statusheal" & "recarmdra" can be used here. Heal skills have different effects so these will not work.\n*You can list these effects with ${prefix}listhealextras.*`, inline: true },
                    { name: 'Extra Effect 2', value: 'Some extra effects need extra values to make it work. This is the 1st argument.', inline: true },
                    { name: 'Extra Effect 3', value: 'Some extra effects need extra values to make it work. This is the 2nd argument.', inline: true },
                    { name: 'Description', value: "This Skills's description. Try to explain what the move does, so your friends can imagine it! Enclose this value in quotation marks.", inline: true },
                )
            message.channel.send({embeds: [DiscordEmbed]})
            return false
        }
		
        if (message.content.includes("@everyone") || message.content.includes("@here") || message.mentions.users.first())
            return message.channel.send("You're really mean, you know that?");
		
		if (arg[1].length > 50)
			return message.channel.send(`${arg[1]} is too long!`);

        if (!utilityFuncs.RPGBotAdmin(message.author.id) && message.author.id != readSkill(arg[1]).originalAuthor) {
            if (readSkill(arg[1]))
                return message.channel.send("This skill exists already, and you aren't it's original author, therefore, You have insufficient permissions to overwrite it.");
        }

		if (!arg[3])
			return message.channel.send("Please specify HP or MP for argument 3.");

		let costType = "mp"
		if (arg[3].toLowerCase() === "hp" || arg[3].toLowerCase() === "health") {
			costType = "hp"
		} else if (arg[3].toLowerCase() === "mp%" || arg[3].toLowerCase() === "mppercent" || arg[3].toLowerCase() === "percentofmp") {
			costType = "mppercent"
		} else if (arg[3].toLowerCase() === "hp%" || arg[3].toLowerCase() === "hppercent" || arg[3].toLowerCase() === "percentofhp") {
			costType = "hppercent"
		} else if (arg[3].toLowerCase() === "currency" || arg[3].toLowerCase() === "money") {
			costType = "money"
		}

		let targType = "one"
		if (arg[5].toLowerCase() === "allenemies" || arg[5].toLowerCase() === "allfoes" || arg[5].toLowerCase() === "allopposing") {
			targType = "allopposing"
		} else if (arg[5].toLowerCase() === "ally" || arg[5].toLowerCase() === "friend" || arg[5].toLowerCase() === "player") {
			targType = "ally"
		} else if (arg[5].toLowerCase() === "allallies" || arg[5].toLowerCase() === "allfriends" || arg[5].toLowerCase() === "allplayers") {
			targType = "allallies"
		} else if (arg[5].toLowerCase() === "all" || arg[5].toLowerCase() === "everyone" || arg[5].toLowerCase() === "fuckyou") {
			targType = "everyone"
		} else if (arg[5].toLowerCase() === "me" || arg[5].toLowerCase() === "user" || arg[5].toLowerCase() === "caster") {
			targType = "caster"
		} else if (arg[5].toLowerCase() === "rand" || arg[5].toLowerCase() === "random" || arg[5].toLowerCase() === "?") {
			targType = "random"
		} else if (arg[5].toLowerCase() === "randopp" || arg[5].toLowerCase() === "randomtarget" || arg[5].toLowerCase() === "randomopposing") {
			targType = "randomopposing"
		}
			
		let skillDesc = message.content.slice(prefix.length).trim().split('"')[1]

		writeHeal(message, arg[1], arg[1], parseInt(arg[2]), costType, parseInt(arg[4]), targType, arg[6], arg[7], arg[8], skillDesc)
		if (readSkill(arg[1])) {
			const skillName = arg[1]
			const skillDefs = readSkill(skillName)

			let finalText = skillFuncs.skillDesc(skillDefs, arg[1], message.guild.id)

			const DiscordEmbed = new Discord.MessageEmbed()
				.setColor('#4b02c9')
				.setTitle(`${elementEmoji[skillDefs.type]} ${skillName}`)
				.setDescription(`${finalText}`)
			message.channel.send({content: `${skillName} is good to go!`, embeds: [DiscordEmbed]});
		} else {
			message.channel.send(`There's been an issue creating your skill!`);
			return
		}
    }

    if (command === 'registerstatus') {
		if (utilityFuncs.isBanned(message.author.id, message.guild.id) && !utilityFuncs.RPGBotAdmin(message.author.id))
			return message.channel.send("I've been told you were banned from using the RPG sections of the bot, sorry!");

        const arg = message.content.slice(prefix.length).trim().split(/ +/);
        if (arg[1] == null) {
            const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
				.setTitle(`${prefix}registerstatus`)
				.setDescription(`(Args <Name> <Cost> <CostType> <Status Type> <Extra Value 1> <Extra Value 2> <Extra Value 3> "<Desc>")\nCreates a skill to be used in battle. \nThese skills have certain properties that can change how they're used.\n\nAllow me to explain`)
                .addFields(
                    { name: 'Cost', value: 'To be used in combination with the next one. Use numbers.', inline: true },
                    { name: 'CostType', value: 'HP, MP, HP% or MP%. For example, if I set cost to 5, and costtype to MP%, it would take 5% of my MP.', inline: true },
                    { name: 'Status Type', value: "This is the thing this status skill will do. Input things such as 'buff', 'debuff', 'mimic', 'status', 'clone', 'makarakarn', 'tetrakarn', 'shield' & 'trap' for this. The value of this will change how Extra Value 1 and Extra Value 2 are used.", inline: true },
                    { name: 'Extra Value 1', value: `A value that affects the usage of the skill. For example, if 'Status Type' is 'buff', this would be the stat to buff. You can list the rest with ${prefix}liststatusextras`, inline: true },
					{ name: 'Extra Value 2', value: "A value that affects the usage of the skill. For example, if 'Status Type' is 'buff', this would be the target of the buffs (ally, allallies, ect)", inline: true },
					{ name: 'Extra Value 3', value: "A value that affects the usage of the skill. For example, if 'Status Type' is 'buff', this would be the amount of buffs given", inline: true },
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

		let costType = "mp"
		if (arg[3].toLowerCase() === "hp" || arg[3].toLowerCase() === "health") {
			costType = "hp"
		} else if (arg[3].toLowerCase() === "mp%" || arg[3].toLowerCase() === "mppercent" || arg[3].toLowerCase() === "percentofmp") {
			costType = "mppercent"
		} else if (arg[3].toLowerCase() === "hp%" || arg[3].toLowerCase() === "hppercent" || arg[3].toLowerCase() === "percentofhp") {
			costType = "hppercent"
		}
		
		let skillDesc = message.content.slice(prefix.length).trim().split('"')[1]	

		// Name
		/*
		const isUpperCase = (string) => /^[A-Z]*$/.test(string)

		let newName = arg[1].split('');
		for (let i = 1; i < arg[1].length; i++) {
			let charStr = arg[1].charAt(i)
			if (isUpperCase(charStr)) {
				newName.splice(i, 0, ' ')
			}
		}

		newName = newName.join('')
		*/

		let statusType = arg[4].toLowerCase()
		if (statusType === 'buff' || statusType === 'debuff') {
			let buffType = arg[5].toLowerCase()
			if (buffType != 'atk' && buffType != 'mag' && buffType != 'end' && buffType != 'agl' && buffType != 'prc' && buffType != 'crit' && buffType != 'all')
				return message.channel.send(`${buffType} is an invalid stat ${statusType}.`);
		}

		writeStatus(message, arg[1], arg[1], parseInt(arg[2]), costType, arg[4].toLowerCase(), arg[5], arg[6], arg[7], skillDesc)
		if (readSkill(arg[1])) {
			const skillName = arg[1]
			const skillDefs = readSkill(skillName)

			let finalText = skillFuncs.skillDesc(skillDefs, arg[1], message.guild.id)

			const DiscordEmbed = new Discord.MessageEmbed()
				.setColor('#4b02c9')
				.setTitle(`${elementEmoji[skillDefs.type]} ${skillName}`)
				.setDescription(`${finalText}`)
			message.channel.send({content: `${skillName} is good to go!`, embeds: [DiscordEmbed]});
		} else {
			message.channel.send(`There's been an issue creating your skill!`);
			return
		}
    }

    if (command === 'registerpassive') {
		if (utilityFuncs.isBanned(message.author.id, message.guild.id) && !utilityFuncs.RPGBotAdmin(message.author.id))
			return message.channel.send("I've been told you were banned from using the RPG sections of the bot, sorry!");

        const arg = message.content.slice(prefix.length).trim().split(/ +/);
        if (arg[1] == null) {
            const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
				.setTitle(`${prefix}registerpassive`)
				.setDescription(`(Args <Name> <Passive Type> <Extra Value 1> <Extra Value 2> "<Desc>")\nCreates a skill to be used in battle. \nThese skills have certain properties that can change how they're used.\n\nAllow me to explain`)
                .addFields(
                    { name: 'Passive Type', value: "This is the thing this passive skill will do. Input things such as 'boost', 'damagephys', 'healonturn', 'healmponturn', 'counterphys', 'dodgephys', 'multi' & 'affinityslicer'", inline: true },
                    { name: 'Extra Value 1', value: `A value that affects the usage of the skill. For example, if 'Passive Type' is 'counterphys', this would be the chance the attack is countered. You can list the rest of the passive types with ${prefix}listpassivetypes.`, inline: true },
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
		
		let skillDesc = message.content.slice(prefix.length).trim().split('"')[1]

		// Name
		/*
		const isUpperCase = (string) => /^[A-Z]*$/.test(string)

		let newName = arg[1].split('');
		for (let i = 1; i < arg[1].length; i++) {
			let charStr = arg[1].charAt(i)
			if (isUpperCase(charStr)) {
				newName.splice(i, 0, ' ')
			}
		}
		
		newName = newName.join('')
		*/

		writePassive(message, arg[1], arg[1], arg[2].toLowerCase(), arg[3].toLowerCase(), arg[4], skillDesc)
		if (readSkill(arg[1])) {
			const skillName = arg[1]
			const skillDefs = readSkill(skillName)
			message.channel.send(`${skillName} is good to go!`);

			let finalText = ``;				
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

    if (command === 'editskill') {		
		if (utilityFuncs.isBanned(message.author.id, message.guild.id) && !utilityFuncs.RPGBotAdmin(message.author.id))
			return message.channel.send("I've been told you were banned from using the RPG sections of the bot, sorry!");

        const arg = message.content.slice(prefix.length).trim().split(/ +/);
        if (!arg[1]) {
            const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .addFields(
                    { name: `${prefix}editskill`, value: `(Args <Name> <Attribute> <Value>)\nEdit an existing skill to your liking.`, inline: false },
                    { name: 'TrueName', value: "The way the skill will be referred as when attacking or getting skill data.", inline: true },
                    { name: 'Name', value: "The skill's name", inline: true },
                    { name: 'Cost', value: "To be used in combination with the next one.", inline: true },
                    { name: 'CostType', value: "HP, MP, HP% or MP%. For example, if I set cost to 5, and costtype to MP%, it would take 5% of my MP.", inline: true },
                    { name: 'Pow', value: "Self Explanitory. \nA little insight on how damage is calculated, somewhat similar to the Persona series.", inline: true },
                    { name: 'Acc', value: "A chance out of 100 that the move lands. Modified by user perception and enemy agility.", inline: true },
                    { name: 'Crit', value: "The chance that this move is a critical hit out of 100. Modified by user and enemy luck.", inline: true },
                    { name: 'Type', value: "The element this skill is. This is either Strike, Slash, Pierce, Fire, Water, Ice, Electric, Wind, Earth, Grass, Psychic, Poison, Nuclear, Metal, Curse, Bless, Almighty, Heal, Status or Passive. All fighters will have their own weaknesses and resistances.", inline: true },
                    { name: 'Status', value: "The status effect this skill can inflict.", inline: true },
                    { name: 'StatusChance', value: "Chance this skill has to inflict a status effect (will do nothing if 'Status Affliction' is 'none'.", inline: true },
                    { name: 'AtkType', value: "If this skill is physical it will use the user's Strength stat, otherwise, Magic.", inline: true },
                    { name: 'Target', value: "Whether this targets all foes or one foe, maybe even all allies depending on the skill. The target types are 'one', 'allopposing', 'ally', 'allallies', 'caster', 'everyone' and 'random'.", inline: true },
                    { name: 'Hits', value: "The amount of hits this move does. Generally, moves with more hits have less power.", inline: true },
                    { name: 'Desc', value: "This Skills's description. Try to explain what the move does, so your friends can imagine it! Enclose this value in quotation marks.", inline: true },
                )
            message.channel.send({embeds: [DiscordEmbed]})
            return false
        }

        if (!utilityFuncs.RPGBotAdmin(message.author.id) && message.author.id != readSkill(arg[1]).originalAuthor) {
            if (readSkill(arg[1])) return message.channel.send("This skill exists already, and you aren't it's original author, therefore, You have insufficient permissions to overwrite it.");
        }

        let skillPath = dataPath+'/skills.json'
        let skillRead = fs.readFileSync(skillPath, {flag: 'as+'});
        let skillFile = JSON.parse(skillRead);
		
		if (!skillFile[arg[1]]) return message.channel.send(`${arg[1]} is an invalid skill!`)
		if (arg[2] === 'name' && skillFile[arg[3]]) return message.channel.send(`${arg[3]} exists, so you can't change ${arg[1]}'s name to that.`)
		if (!arg[2]) return message.channel.send("You're missing a valid argument for the skill's attribute")
		
		let attr = arg[2].toLowerCase()
		if (attr === 'cost' || attr === 'pow' || attr === 'acc' || attr === 'crit' || attr === 'statuschance' || attr === 'affinitypow')
			skillFile[arg[1]][attr] = Math.max(1, parseInt(arg[3]));
		else if (attr === 'hits')
			skillFile[arg[1]].hits = Math.max(1, Math.min(99, parseInt(arg[3])));
		else if (attr === 'costtype' || attr === 'status' || attr === 'target' || attr === 'atktype')
			skillFile[arg[1]][attr] = arg[3].toLowerCase();
		else if (attr === 'type') {
			if (utilityFuncs.validType(arg[3].toLowerCase()))
				skillFile[arg[1]].type = arg[3].toLowerCase();
		} else if (attr === 'name' || attr === 'desc') {
			let quotationMarks = message.content.slice(prefix.length).trim().split('"')[1]
			skillFile[arg[1]][attr] = quotationMarks
		} else if (attr === 'levellock' || attr === 'level') {
			let lockLvl = parseInt(arg[3])

			if (lockLvl && typeof lockLvl === 'string' && lockLvl.toLowerCase() === 'none')
				delete skillFile[arg[1]].levelLock
			else {
				if (lockLvl > 100 || lockLvl < 1)
					return message.channel.send('This level is invalid!')
				
				skillFile[arg[1]].levelLock = lockLvl

				if (lockLvl <= 1) delete skillFile[arg[1]].levelLock;
			}
		} else if (attr === 'buffchance') {
			skillFile[arg[1]].buffChance = parseFloat(arg[3])
		} else if (attr === 'debuffchance') {
			skillFile[arg[1]].debuffChance = parseFloat(arg[3])
		} else if (attr === 'truename' || attr === 'codename') {
			if (skillFile[arg[3]]) {
				return message.channel.send(`A skill called ${arg[3]} (${skillFile[arg[3]].name}) already exists!`)
			} else {
				skillFile[arg[3]] = utilityFuncs.cloneObj(skillFile[arg[1]])
				delete skillFile[arg[1]]
			}
		} else
			return message.channel.send("This field either can't be edited or doesn't exist.")

		message.react('👍')
		fs.writeFileSync(skillPath, JSON.stringify(skillFile, null, '    '))
	}

    if (command === 'unregisterskill' || command === 'deleteskill' || command === 'purgeskill') {
        const arg = message.content.slice(prefix.length).trim().split(/ +/);

        let enmPath = dataPath+'/Enemies/enemies-' + message.guild.id + '.json';
        let enmRead = fs.readFileSync(enmPath, {flag: 'as+'});
        let enmJSON = JSON.parse(enmRead);
		let enmFile = enmJSON[message.guild.id];

        let skillPath = dataPath+'/skills.json'
        let skillRead = fs.readFileSync(skillPath, {flag: 'as+'});
        let skillFile = JSON.parse(skillRead);

		let charPath = dataPath+'/characters.json'
		let charRead = fs.readFileSync(charPath, {flag: 'as+'});
		let charFile = JSON.parse(charRead);

        if (skillFile[arg[1]]) {
			if (!utilityFuncs.RPGBotAdmin(message.author.id) && message.author.id != skillFile[arg[1]].originalAuthor)
				return message.channel.send("You have insufficient permissions to delete this skill as you don't own it.");

			message.channel.send(`Are you **sure** you want to delete ${skillFile[arg[1]].name}? You will NEVER get this back, so please, ensure you _WANT_ to delete this skill.\n**Y/N**`);

			var givenResponce = false
			var collector = message.channel.createMessageCollector({ time: 15000 });
			collector.on('collect', m => {
				if (m.author.id == message.author.id) {
					if (m.content.toLowerCase() === 'yes' || m.content.toLowerCase() === 'y') {
						message.channel.send(`${skillFile[arg[1]].name} has been erased from existance. The characters and enemies that know this skill should be checked in order to ensure that they do not have an invalid skill.`)
						delete skillFile[arg[1]];

						fs.writeFileSync(skillPath, JSON.stringify(skillFile, null, '    '))
					} else
						message.channel.send(`${skillFile[arg[1]].name} will not be deleted.`);

					givenResponce = true
					collector.stop()
				}
			});
			collector.on('end', c => {
				if (givenResponce == false)
					message.channel.send(`No response given.\n${skillFile[arg[1]].name} will not be deleted.`);
			});
		} else {
            message.channel.send(`${arg[1]} is an invalid skill.`);
            return
        }
    }

    if (command === 'applyextra') {
		if (utilityFuncs.isBanned(message.author.id, message.guild.id) && !utilityFuncs.RPGBotAdmin(message.author.id))
			return message.channel.send("I've been told you were banned from using the RPG sections of the bot, sorry!");

        const arg = message.content.slice(prefix.length).trim().split(/ +/);
        if (!arg[1]) {
            const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
				.setTitle(`${prefix}applyextra`)
				.setDescription(`(Args <Name> <Extra1> <Extra2> <Extra3>)\nApply an Extra Effect to an attacking skill. You can use ${prefix}listatkeffects to determine.`)
            message.channel.send({embeds: [DiscordEmbed]})
            return false
        }

        if (!utilityFuncs.RPGBotAdmin(message.author.id) && message.author.id != readSkill(arg[1]).originalAuthor) {
            if (readSkill(arg[1])) return message.channel.send("This skill exists already, and you aren't it's original author, therefore, You have insufficient permissions to overwrite it.");
        }

        let skillPath = dataPath+'/skills.json'
        let skillRead = fs.readFileSync(skillPath, {flag: 'as+'});
        let skillFile = JSON.parse(skillRead);
		
		if (!skillFile[arg[1]]) return message.channel.send(`${arg[1]} is an invalid skill!`)
		if (!arg[2]) return message.channel.send('Please enter a valid extra effect.')
		
		if (applyExtra(skillFile[arg[1]], arg[2].toLowerCase(), arg[3], arg[4])) {
			message.react('👍')
			fs.writeFileSync(skillPath, JSON.stringify(skillFile, null, '    '))
		} else
			return message.channel.send('The extra effect you inputted is invalid.')
	}
	
    if (command === 'evoskill') {		
		if (utilityFuncs.isBanned(message.author.id, message.guild.id) && !utilityFuncs.RPGBotAdmin(message.author.id))
			return message.channel.send("I've been told you were banned from using the RPG sections of the bot, sorry!");

        const arg = message.content.slice(prefix.length).trim().split(/ +/);
        if (!arg[1]) {
            const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle(`${prefix}${command}`)
				.setDescription("(Args <SkillName> <Evo-SkillName> <Level> <Auto Pre-Skill>)\nChange a skill's evo-skill: skills that other skills evolve into at a certain level.")
            message.channel.send({embeds: [DiscordEmbed]})
            return false
        }

        if (!utilityFuncs.RPGBotAdmin(message.author.id) && message.author.id != readSkill(arg[1]).originalAuthor) {
            if (readSkill(arg[1])) return message.channel.send("This skill exists already, and you aren't it's original author, therefore, You have insufficient permissions to overwrite it.");
        }

        let skillPath = dataPath+'/skills.json'
        let skillRead = fs.readFileSync(skillPath, {flag: 'as+'});
        let skillFile = JSON.parse(skillRead);
		
		if (!skillFile[arg[1]]) return message.channel.send(`${arg[1]} is an invalid skill!`)
		if (!arg[2]) return message.channel.send("You're missing a valid argument for the skill's evo-skill")
			
		if (arg[2].toLowerCase() === 'none') {
			delete skillFile[arg[1]].evoSkill;

			message.react('👍')
			fs.writeFileSync(skillPath, JSON.stringify(skillFile, null, '    '))
			return
		}

		if (!skillFile[arg[2]]) return message.channel.send(`${arg[2]} is an invalid skill!`)
		if (!arg[3]) return message.channel.send("You're missing a valid argument for the skill's evo-skill level")
		
		skillFile[arg[1]].evoSkill = [arg[2], parseInt(arg[3])]

		if (arg[4]) {
			let yes = arg[4].toLowerCase()
			if (yes === 'y' || yes === 'yes' || yes === 'true')
				skillFile[arg[2]].preSkill = [arg[1], parseInt(arg[3])-1];
		}

		message.react('👍')
		fs.writeFileSync(skillPath, JSON.stringify(skillFile, null, '    '))
	}

    if (command === 'preskill') {		
		if (utilityFuncs.isBanned(message.author.id, message.guild.id) && !utilityFuncs.RPGBotAdmin(message.author.id))
			return message.channel.send("I've been told you were banned from using the RPG sections of the bot, sorry!");

        const arg = message.content.slice(prefix.length).trim().split(/ +/);
        if (!arg[1]) {
            const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle(`${prefix}${command}`)
				.setDescription("(Args <SkillName> <Pre-SkillName> <Level> <Auto-EvoSkill>)\nChange a skill's pre-skill: skills that other skills revert to at a certain level.")
            message.channel.send({embeds: [DiscordEmbed]})
            return false
        }

        if (!utilityFuncs.RPGBotAdmin(message.author.id) && message.author.id != readSkill(arg[1]).originalAuthor) {
            if (readSkill(arg[1])) return message.channel.send("This skill exists already, and you aren't it's original author, therefore, You have insufficient permissions to overwrite it.");
        }

        let skillPath = dataPath+'/skills.json'
        let skillRead = fs.readFileSync(skillPath, {flag: 'as+'});
        let skillFile = JSON.parse(skillRead);
		
		if (!skillFile[arg[1]]) return message.channel.send(`${arg[1]} is an invalid skill!`)
		if (!arg[2]) return message.channel.send("You're missing a valid argument for the skill's pre-skill")

		if (arg[2].toLowerCase() === 'none') {
			delete skillFile[arg[1]].preSkill;

			message.react('👍')
			fs.writeFileSync(skillPath, JSON.stringify(skillFile, null, '    '))
			return
		}

		if (arg[2].toLowerCase() === 'remove') {
			skillFile[arg[1]].preSkill = ['remove', parseInt(arg[3])];

			message.react('👍')
			fs.writeFileSync(skillPath, JSON.stringify(skillFile, null, '    '))
			return
		}

		if (!skillFile[arg[2]]) return message.channel.send(`${arg[2]} is an invalid skill!`)
		if (!arg[3]) return message.channel.send("You're missing a valid argument for the skill's pre-skill level")
		
		skillFile[arg[1]].preSkill = [arg[2], parseInt(arg[3])]

		if (arg[4]) {
			let yes = arg[4].toLowerCase()
			if (yes === 'y' || yes === 'yes' || yes === 'true')
				skillFile[arg[2]].evoSkill = [arg[1], parseInt(arg[3])+1];
		}

		message.react('👍')
		fs.writeFileSync(skillPath, JSON.stringify(skillFile, null, '    '))
	}

    if (command === 'listskills') {
        let skillPath = dataPath+'/skills.json'
        let skillRead = fs.readFileSync(skillPath, {flag: 'as+'});
        let skillFile = JSON.parse(skillRead);
		
		let user = message.mentions.users.first() ? message.mentions.users.first() : null

		let skillArray = []
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
				if (skillFile[i].type === arg[1].toLowerCase()) {
					if (arg[2] && (arg[2].toLowerCase() === 'physical' || arg[2].toLowerCase() === 'magic')) {
						if (skillFile[i].atktype === arg[2].toLowerCase())
							skillArray.push(skillFile[i]);
					} else
						skillArray.push(skillFile[i]);
				}
			}

			setTimeout(function() {
				sendSkillArray(message.channel, skillArray);
			}, 200)
		} else if (utilityFuncs.validTarg(arg[1].toLowerCase())) {
			for (const i in skillFile) {
				if (skillFile[i].target === arg[1].toLowerCase())
					skillArray.push(skillFile[i]);
			}

			if (skillArray.length <= 0)
				return message.channel.send('No skills with this target type.')

			sendSkillArray(message.channel, skillArray);
		} else if (utilityFuncs.validStatus(arg[1].toLowerCase())) {
			for (const i in skillFile) {
				if (skillFile[i].status && skillFile[i].status === arg[1].toLowerCase())
					skillArray.push(skillFile[i]);
			}

			if (skillArray.length <= 0)
				return message.channel.send('No skills with this status effect.');

			sendSkillArray(message.channel, skillArray);
		} else if (arg[1].toLowerCase() === "physical" || arg[1].toLowerCase() === "magic") {
			for (const i in skillFile) {
				if (skillFile[i].atktype === arg[1].toLowerCase())
					skillArray.push(skillFile[i]);
			}

			if (skillArray.length <= 0)
				return message.channel.send('No skills of this kind.');

			sendSkillArray(message.channel, skillArray);
		} else {
			for (const i in skillFile) {
				if (skillFile[i][arg[1]]) {
					if (arg[2]) {
						if (arg[2] === skillFile[i][arg[1]].toString())
							skillArray.push(skillFile[i]);
					} else
						skillArray.push(skillFile[i]);
				}
			}

			if (skillArray.length <= 0)
				return message.channel.send('No skills of this kind.');

			sendSkillArray(message.channel, skillArray);
		}
	}

    if (command === 'searchskills') {
        const arg = message.content.slice(prefix.length).trim().split(/ +/);
        if (!arg[1] || arg[1] === ' ' || arg[1] === 'null') {
            const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
				.setTitle(`${prefix}searchskills`)
				.setDescription("(Args <Search>)\nSearches for a skill including this word, phrase or letter.")
            message.channel.send({embeds: [DiscordEmbed]})
            return false
        }

        let skillPath = dataPath+'/skills.json'
        let skillRead = fs.readFileSync(skillPath, {flag: 'as+'});
        let skillFile = JSON.parse(skillRead);

        let skillTxt = []
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

		let elementTxt = ''
		for (const i in Elements)
			elementTxt += `${elementEmoji[Elements[i]]} **${[Elements[i]]}**\n`;
		
		DiscordEmbed.setDescription(elementTxt)
		message.channel.send({embeds: [DiscordEmbed]})
	}

    if (command === 'listatkeffects') {
		const DiscordEmbed = new Discord.MessageEmbed()
			.setColor('#0099ff')
			.setTitle('List of attacking extras:')
			.setDescription('Extra effects to buff your attacking skills')
			.addFields()

		let atkDesc = {
			ohko: '<Skill Accuracy>% Chance to instantly down the target.',
			rest: 'Force the target to skip their next turn after using this skill.',
			stealmp: 'Turns the attack into a skill that steals <Power> MP from the target.',
			sacrifice: 'Downs the user after casting this skill.',
			buff: '(Args <Stat> <Buff Chance>)\nBuffs <Stat> for the caster. Not all stats can be buffed & debuffed, only **ATK**, **MAG**, **END**, **AGL** & **PRC** can be buffed.',
			debuffuser: '(Args <Stat> <Debuff Chance>)\nDebuffs <Stat> for the caster. Not all stats can be buffed & debuffed, only **ATK**, **MAG**, **END**, **AGL** & **PRC** can be debuffed.',
			debuff: '(Args <Stat> <Debuff Chance>)\nDebuffs <Stat> for the target if it hits. Not all stats can be buffed & debuffed, only **ATK**, **MAG**, **END**, **AGL** & **PRC** can be debuffed.',
			dualbuff: '(Args <Stat 1> <Stat 2>)\nBuffs <Stat 1> AND <Stat 2> for the caster once. Not all stats can be buffed & debuffed, only **ATK**, **MAG**, **END**, **AGL** & **PRC** can be debuffed.',
			dualdebuff: '(Args <Stat 1> <Stat 2>)\nDebuffs <Stat 1> AND <Stat 2> for the target once. Not all stats can be buffed & debuffed, only **ATK**, **MAG**, **END**, **AGL** & **PRC** can be debuffed.',
			takemp: '(Args <MP>)\nSteals <MP> MP from the target.',
			healverse: '(Args <Percent>)\nLays a healing aura on the target. When your allies attack that foe, they will heal themselves for <Percent>% of damage dealt.',
			powerverse: '(Args <Percent>)\nLays an orange aura on the target. When your allies attack that foe, LB% gained will be boosted by <Percent>. This skill has no effect when Limit Breaks are toggled off.',
			healmp: '(Heal Skills Only)\nHeals MP instead of HP.',
			steal: "(Args <Chance>)\n<Chance>% chance to steal an item from the foe's item table. Has no effect on player characters or enemies that can't drop anything.",
			multistatus: '(Args <Status 2> <Status 3>)\nIn addition to the original status effect, this skill will have a chance of inflicting one or two more status effects.',
			statcalc: '(Args <Stat>)\nUse <Stat> to calculate damage instead of ATK or MAG.',
			hpcalc: 'Current HP can boost or decrease damage by up to 50%.',
			mpcalc: 'Current MP can boost or decrease damage by up to 50%.',
			feint: 'Bypass shielding skills like Makarakarn and Tetrakarn.',
			rollout: "(Args <Power Boost per Use>%)\nBoost the skill's power by <Power Boost per Use>% every consecutive use. The caster is locked into using the skill repetedly until they miss, power reaches 2x it's original amount, or the skill is used 4 times in a row.",
			forcetech: '(Args <Status 1> <Optional: Status 2>)\nForces a skill to tech off of different status effects instead of the preset ones.'
		}

		for (const i in atkDesc)
			DiscordEmbed.fields.push({name: i.toUpperCase(), value: atkDesc[i], inline: true})

		message.channel.send({embeds: [DiscordEmbed]})
	}

    if (command === 'liststatusextras') {
		const DiscordEmbed = new Discord.MessageEmbed()
			.setColor('#0099ff')
			.setTitle('List of status extras:')
			.setDescription('Types of Status Type Skills that fighters can learn.')
			.addFields()

		let statusDesc = {
			status: '(Args <Status> <Chance>) <Chance>% chance to inflict <Status> on your target.',
			buff: '(Args <Stat> <Target> <Amount of Buffs>) Buffs <Stat> for <Target> <Amount of Buffs> times. Not all stats can be buffed & debuffed, only **ATK**, **MAG**, **END**, **AGL** & **PRC** can be buffed. Enter **ALL** to buff all stats.',
			debuff: '(Args <Stat> <Target>) Debuffs <Stat> for <Target> once. Not all stats can be buffed & debuffed, only **ATK**, **MAG**, **END**, **AGL** & **PRC** can be debuffed. Enter **ALL** to debuff all stats.',
			mimic: 'The fighter morphs into a foe or ally of their choice.',
			clone: 'The fighter clones themselves. The clone will have weaker stats.',
			shield: '(Args <Name of Shield> <Target>) The user protects <Target> with a shield called <Name of Shield>.',
			makarakarn: '(Args <Target>) The user protects <Target> with a shield that repels magic attacks.',
			tetrakarn: '(Args <Target>) The user protects <Target> with a shield that repels physical attacks.',
			trap: "(Args <Trap Type> <Extra Argument>) The user protects themselves with a trap that is set off once a physical attack strikes them. <Extra Arguement> differs based on <Trap Type>```diff\n+ Debuff: Debuffable Status.\n+ Status: Valid Status Effect\n+ Damage: Fixed Damage.```",
			weather: "(Args <Weather>) The weather is changed, which might affect battles.```diff\n- Rain: Water Damage x1.2. Fire Damage x0.8.\n- Thunder: Paralysis Chance x1.25.\n- Sunlight: Fire Damage x1.2. Water Damage x0.8.\n- Windy: Wind Damage x1.1, Dizziness Chance x1.1.\n- Sandstorm or Hail: Everyone takes 1/10th of max HP.```",
			terrain: "(Args <Terrain>) The terrain is changed, which might affect battles.```diff\n- Flaming: 10 damage each turn, with a chance to inflict burning.\n- Thunder: Electric Damage x1.2\n- Icy: Ice Damage x1.2\n- Light: Bless Damage x1.2\n- Psychic: Turn Order reversed.\n- Misty: Removes the possibility to become afflicted by a status effect.\n- Sky: Wind Damage x1.2```",
			reincarnate: 'The fighter summons an undead animal. They will have weak stats and skills.',
			futuresight: '(Args <Power> <Type> <Turns>) This skill becomes an attacking skill that strikes the foe in <Turns> turns.',
			multistatus: '(Args <Status Effect> <Status Effect> <Status Effect>) This skill can inflict more than one status effect.',
			dualbuff: '(Args <Stat 1> <Stat 2> <Target>) Buffs <Stat 1> AND <Stat 2> for <Target> once. Not all stats can be buffed & debuffed, only **ATK**, **MAG**, **END**, **AGL** & **PRC** can be debuffed.',
			dualdebuff: '(Args <Stat 1> <Stat 2> <Target>) Debuffs <Stat 1> AND <Stat 2> for <Target> once. Not all stats can be buffed & debuffed, only **ATK**, **MAG**, **END**, **AGL** & **PRC** can be debuffed.'
		}

		for (const i in statusDesc)
			DiscordEmbed.fields.push({name: i.toUpperCase(), value: statusDesc[i], inline: true})

		message.channel.send({embeds: [DiscordEmbed]})
	}

    if (command === 'listpassivetypes') {
		const DiscordEmbed = new Discord.MessageEmbed()
			.setColor('#0099ff')
			.setTitle('List of passive types:')
			.setDescription('Types of Passive Skills that fighters can learn.')
			.addFields()

		let passiveDesc = {
			damagephys: '(Args <Damage>) Damages fighters using physical attacks against the user by <Damage>.',
			damagemag: '(Args <Damage>) Damages fighters using magical attacks against the user by <Damage>.',
			dodgephys: '(Args <Chance>) Increased chance of dodging a physical attack.',
			dodgemag: '(Args <Chance>) Increased chance of dodging a magical attack.',
			healonturn: '(Args <HP>) Heals <HP> amount of HP per turn.',
			healmponturn: '(Args <MP>) Heals <MP> amount of MP per turn.',
			regen: '(Args <Percent>) Heals <Percent>% of max HP per turn.',
			invig: '(Args <Percent>) Heals <Percent>% of max MP per turn.',
			status: '(Args <Status Effect> <Chance>) Has a <Chance>% chance of inflicting <Status Effect> on a fighter if they use a physical attack.',
			boost: '(Args <Element> <Percent>) Boosts attack that are <Element> type by <Percent>%.',
			extrahit: '(Args <Hits> <Chance>) Has a <Chance>% chance to make a move that is single-hit hit <Hits> extra times.',
			counterphys: '(Args <Chance> <Power>) Has a <Chance>% chance to counter a physical skill with another of <Power> power.',
			countermag: '(Args <Chance> <Power>) Has a <Chance>% chance to counter a magic skill with another of <Power> power.',
			swordbreaker: '(Args <Chance>) <Chance>% chance to physical attacks that hit the user to a resist.',
			affinitycutter: '(Args <Chance>) <Chance>% chance to bypass resist affinities.',
			affinityslicer: "(Args <Chance>) <Chance>% chance to bypass all affinities, turning them into a resist or better.```diff\n+ Drain, Repel, Block ---> Resist\n+ Resist ---> Normal```",
			magicmelee: 'Use MAG stat for melee attacks',
			guardboost: '(Args <Percent>) Take this value away from the default 0.6x mult to reduce damage further.',
			guarddodge: 'Boost agility when dodging attacks while guarding.',
			sacrificial: '(Args <Percent>) Boost the power of sacrifice skills by <Percent>%.'
		}

		for (const i in passiveDesc)
			DiscordEmbed.fields.push({name: i.toUpperCase(), value: passiveDesc[i], inline: true})

		message.channel.send({embeds: [DiscordEmbed]})
	}

    if (command === 'liststatus') {
		const DiscordEmbed = new Discord.MessageEmbed()
			.setColor('#0099ff')
			.setTitle('List of status effects:')
			.setDescription('Status affects will affect fighters in-battle and can be fatal if not cured.')
			.addFields()
		
		let elementTechs = {
			burn: ['water', 'earth', 'nuclear'],
			bleed: ['slash', 'poison', 'nuclear', 'heal'],
			freeze: ['strike', 'fire', 'earth'],
			paralyze: ['strike', 'slash', 'pierce'],
			dizzy: ['psychic', 'earth', 'wind'],
			sleep: ['all'],
			despair: ['psychic', 'curse', 'grass'],
			poison: ['slash', 'pierce', 'wind'],
			brainwash: ['psychic', 'bless', 'curse'],
			fear: ['psychic', 'curse', 'ice'],
			rage: ['bless', 'ice', 'psychic'],
			ego: ['ice', 'pierce', 'sound'],
			silence: ['sound', 'poison', 'nuclear'],
			dazed: ['strike', 'wind', 'water'],
			hunger: ['strike', 'pierce', 'earth'],
			illness: ['slash', 'poison', 'nuclear'],
			mirror: ['strike', 'slash', 'pierce'],
			blind: ['curse', 'bless', 'gravity']
		}

		let statusDesc = {
			burn: '💥Take 1/10th of max HP damage each turn until cured, or you reach one hp. Halves ATK stat.',
			bleed: '💥Take 1/10th of max HP damage each until cured, or the inflicted is defeated.',
			freeze: '💥Immobilized for one turn.',
			paralyze: '💥Immobilized for one turn.',
			poison: '💥Take 1/10th of max HP damage each turn until cured, or you reach one hp. Halves MAG stat.',
			dizzy: '🌀Accuracy of all skills halved for 3 turns.',
			sleep: '🌀Immobilized for 2 turns, restore 1/20th of HP & MP while affected.',
			despair: '🌀Lose 1/10th of max MP every turn until cured. Downs the inflicted once they reach 0MP.',
			brainwash: '🌀Use a random move on the incorrect target for 2 turns.',
			fear: '🌀50% chance to be immobilized but cured from the status.',
			rage: '🌀Forced to use stronger melee attack on a random target for 2 turns.',
			ego: '🌀Unnable to use heal skills for 3 turns.',
			silence: '🌀Unable to use any magical skills for 2 turns.',
			dazed: '💥Unable to use any physical skills for 2 turns.',
			hunger: '💥ATK, MAG, AGL & PRC halved.',
			illness: '💥Take 1/10th of max HP damage each turn until cured, or the inflicted is defeated. 1/3 chance to infect another party member next to you. Spreads amongst backup if in backup.',
			infatuation: '🌀50% chance to hault attack. Stacks with other status effects.',
			confusion: '🌀50% chance to damage self when attacking. Stacks with other status effects.',
			mirror: '💥Immobilized for 3 turns. Repel magic skills.',
			blind: '💥PRC and AGL halved.',
		}

		for (const i in statusEffects) {
			let techTxt = ''
			for (const k in elementTechs[statusEffects[i]]) {
				if (elementTechs[statusEffects[i]][k] === 'all') {
					techTxt = 'ALL';
					break;
				} else
					techTxt += elementEmoji[elementTechs[statusEffects[i]][k]];
			}
			
			if (techTxt === '') techTxt = 'NOTHING'

			DiscordEmbed.fields.push({name: `${statusEmojis[statusEffects[i].toLowerCase()]}${statusEffects[i]}`, value: `_${techTxt} tech off of ${statusEmojis[statusEffects[i].toLowerCase()]}._\n${statusDesc[statusEffects[i].toLowerCase()]}`, inline: true})
		}

		message.channel.send({embeds: [DiscordEmbed]})
	}

    if (command === 'getskill') {
        const arg = message.content.slice(prefix.length).trim().split(/ +/);
        if (!arg[1]) {
            const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle(`${prefix}${command}`)
				.setDescription("(Args <SkillName>)\nGets a skill, and lists it's info.")
            message.channel.send({embeds: [DiscordEmbed]})
            return false
        }

        let skillPath = dataPath+'/skills.json'
        let skillRead = fs.readFileSync(skillPath, {flag: 'as+'});
        let skillFile = JSON.parse(skillRead);

        const skillName = arg[1]

        if (skillFile[arg[1]]) {
            const skillDefs = skillFile[arg[1]];
			let finalText = skillFuncs.skillDesc(skillDefs, arg[1], message.guild.id)

			let userTxt = ''
			if (skillDefs.originalAuthor) {
				if (skillDefs.originalAuthor === 'Default')
					userTxt = 'Default/Official';
				else {
					let user = await client.users.fetch(skillDefs.originalAuthor);
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

    if (command === 'randskill') {
        let skillPath = dataPath+'/skills.json'
        let skillRead = fs.readFileSync(skillPath, {flag: 'as+'});
        let skillFile = JSON.parse(skillRead);
		
		let possibleSkills = []
		for (const val in skillFile) {
			if (skillFile[val].type != "heal" && (skillFile[val].type != "status" && !skillFile[val].buff) && skillFile[val].type != "passive" && val != "Metronome") {
				possibleSkills.push(val)
			}
		}

		let skillName = possibleSkills[Math.round(Math.random() * (possibleSkills.length-1))]
		
		const skillDefs = skillFile[skillName]
		let finalText = skillFuncs.skillDesc(skillDefs, skillName, message.guild.id)

		let userTxt = ''
		if (skillDefs.originalAuthor) {
			if (skillDefs.originalAuthor === 'Default')
				userTxt = 'Default/Official';
			else {
				let user = await client.users.fetch(skillDefs.originalAuthor);
				userTxt = user.username;
			}
		} else
			userTxt = 'Default/Official';

		const DiscordEmbed = new Discord.MessageEmbed()
			.setColor('#4b02c9')
			.setTitle(`${elementEmoji[skillDefs.type]} ${skillDefs.name ? skillDefs.name : skillName} *(${userTxt})*`)
			.setDescription(`${finalText}`)
		message.channel.send({content: `${message.author}, you rolled ${elementEmoji[skillDefs.type]}${skillDefs.name ? skillDefs.name : skillName}!`, embeds: [DiscordEmbed]});
    }

    if (command === 'dailyskill') {
        let skillPath = dataPath+'/skills.json'
        let skillRead = fs.readFileSync(skillPath, {flag: 'as+'});
        let skillFile = JSON.parse(skillRead);
		
		if (!dailySkill)
			dailySkill = 'none';

		let notice = 'Here is the daily skill, again.'
		if (dailySkill === 'none') {
			let possibleSkills = [];
			for (const i in skillFile)
				possibleSkills.push(i);
			
			let skillName = possibleSkills[utilityFuncs.randNum(possibleSkills.length-1)];
			dailySkill = skillName.toString();
			
			let authorTxt = skillFile[skillName].originalAuthor ? `<@${skillFile[skillName].originalAuthor}>` : '<@776480348757557308>'
			notice = `${authorTxt}, your skill is the daily skill for today!`;
		}

		setTimeout(function() {
			if (skillFile[dailySkill]) {
				const skillDefs = skillFile[dailySkill];
				let finalText = skillFuncs.skillDesc(skillDefs, dailySkill, message.guild.id)
				
				let today = new Date();
				let dd = String(today.getDate()).padStart(2, '0');
				let mm = String(today.getMonth() + 1).padStart(2, '0');
				let yyyy = today.getFullYear();

				today = mm + '/' + dd + '/' + yyyy;
				
				if (mm === '12' && dd === '24')
					today = 'Christmas Eve';
				else if (mm === '12' && dd === '25')
					today = 'Christmas';
				else if (mm === '12' && dd === '26')
					today = 'Boxing Day';
				else if (mm === '12' && dd === '31')
					today = "New Years' Eve";
				else if (mm === '1' && dd === '1')
					today = 'New Years';
				else if (mm === '4' && dd === '1')
					today = "April Fools' day";
				else if (mm === '4' && dd === '17' && yyyy == '2022')
					today = 'Easter (2022)';
				else if (mm === '6' && dd === '2')
					today = "<@516359709779820544>'s birthday";
				else if (mm === '10' && dd === '31')
					today = 'Halloween';

				const DiscordEmbed = new Discord.MessageEmbed()
					.setColor('#4b02c9')
					.setTitle(`${elementEmoji[skillDefs.type]} ${skillDefs.name ? skillDefs.name : skillName} - __${today}__`)
					.setDescription(`${finalText}`)
				message.channel.send({content: notice, embeds: [DiscordEmbed]});			

				let dailyRead = fs.readFileSync(dataPath+'/dailyskill.txt', {flag: 'as+'});

				dailyRead = dailySkill.toString();
				fs.writeFileSync(dataPath+'/dailyskill.txt', dailyRead);
			} else
				message.channel.send(`${arg[1]} is an invalid skill!`);
		}, 500);
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
                    { name: 'Item Type', value: `The effect this item has. Right now, there's "heal", "healmp", "healhpmp" & "revive".`, inline: true },
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
		
        let itemPath = dataPath+'/items.json'
        let itemRead = fs.readFileSync(itemPath, {flag: 'as+'});
        let itemFile = JSON.parse(itemRead);
        let skillPath = dataPath+'/skills.json'
        let skillRead = fs.readFileSync(skillPath, {flag: 'as+'});
        let skillFile = JSON.parse(skillRead);

        if (!utilityFuncs.RPGBotAdmin(message.author.id)) {
            if (itemFile[arg[1]] && message.author.id != itemFile[arg[1]].originalAuthor)
                return message.channel.send("This item exists already, and you do not own it, therefore, you have insufficient permissions to overwrite it.");
        }

		if (!arg[2])
			message.channel.send('Please specify the cost.');
		else if (!arg[3])
			message.channel.send('Please specify the item type.');
			
		let splicedTxt = message.content.slice(prefix.length).trim().split('"')
		let itemDesc = splicedTxt ? splicedTxt[1] : ''

        itemFile[arg[1]] = {
			name: arg[1],
			cost: parseInt(arg[2]),
			type: arg[3].toLowerCase(),
			desc: itemDesc,
			originalAuthor: message.author.id
		}
		
		if (arg[3].toLowerCase() === "heal" || arg[3].toLowerCase() === "healmp") {
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
		} else if (arg[3].toLowerCase() === "skill") {
			if (skillFile[arg[4]])
				itemFile[arg[1]].skill = arg[4]
			else
				return message.channel.send(`${arg[4]} is an invalid skill!`)
		} else if (arg[3].toLowerCase() === "pacify") {
			if (parseInt(arg[4]) && parseInt(arg[4]) >= 0 && parseInt(arg[4]) < 100)
				itemFile[arg[1]].pacify = parseInt(arg[4])
			else
				return message.channel.send(`${arg[4]} is an invalid amount to pacify by!`)
		} else if (arg[3].toLowerCase() === "material") {
			// nothing lol
		} else
			return message.channel.send("That's an invalid item type!");

		fs.writeFileSync(itemPath, JSON.stringify(itemFile, null, '    '));
		
		const DiscordEmbed = new Discord.MessageEmbed()
			.setColor('#4b02c9')
			.setTitle(`${itemFile[arg[1]].name ? itemFile[arg[1]].name : arg[1]}`)
			.setDescription(`*${itemFile[arg[1]].desc}*`)
		message.channel.send({content: `${arg[1]} is ready to go!`, embeds: [DiscordEmbed]});
    }

    if (command === 'registerweapon') {
		if (utilityFuncs.isBanned(message.author.id, message.guild.id) && !utilityFuncs.RPGBotAdmin(message.author.id))
			return message.channel.send("I've been told you were banned from using the RPG sections of the bot, sorry!");

        const arg = message.content.slice(prefix.length).trim().split(/ +/);
        if (!arg[1]) {
            const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
				.setTitle(`${prefix}${command}`)
				.setDescription('(Args <Name> <Currency Cost> <Element> <Melee Power> <ATK Buff> <MAG Buff> <Skill> "<Description>")\nCreates a weapon to be equipped. They can be used in battle to grant certain effects or restore health.\n\nAllow me to explain')
                .addFields(
                    { name: 'Currency Cost', value: "How much of this server's currency this item costs in **shops**.", inline: true },
                    { name: 'Element', value: "The main element of this weapon. It must be a valid one. It will changed the equippee's melee attack's power.", inline: true },
                    { name: 'Melee Attack', value: 'The power of the melee attack. Like a skill, too high of a value can make this value too overpowered. For reference, melee attacks without a weapon have 30 power.', inline: true },
                    { name: 'ATK Buff', value: "The buff for the strength stat. When this weapon is equipped, the user's ATK stat is buffed by this value.", inline: true },
                    { name: 'MAG Buff', value: "The buff for the magic stat. When this weapon is equipped, the user's MAG stat is buffed by this value.", inline: true },
                    { name: 'Skill', value: "A skill that can be obtained by using this weapon.", inline: true },
                    { name: 'Description', value: "This Weapon's description. Try to explain what the weapon does and how it is used, so your friends can imagine it! Enclose this value in quotation marks.", inline: true },
                )

			return message.channel.send({embeds: [DiscordEmbed]})
        }

        if (message.content.includes("@everyone") || message.content.includes("@here") || message.mentions.users.first())
            return message.channel.send(`You're really mean, you know that?`);
		
        let weapPath = dataPath+'/Equipment/weapons.json'
        let weapRead = fs.readFileSync(weapPath, {flag: 'as+'});
        let weapFile = JSON.parse(weapRead);
        let skillPath = dataPath+'/skills.json'
        let skillRead = fs.readFileSync(skillPath, {flag: 'as+'});
        let skillFile = JSON.parse(skillRead);

        if (!utilityFuncs.RPGBotAdmin(message.author.id)) {
            if (weapFile[arg[1]] && message.author.id != weapFile[arg[1]].originalAuthor)
                return message.channel.send("This item exists already, and you do not own it, therefore, you have insufficient permissions to overwrite it.");
        }

		if (!arg[2])
			message.channel.send('Please specify the cost.');
			
		let splicedTxt = message.content.slice(prefix.length).trim().split('"')
		let weapDesc = splicedTxt ? splicedTxt[1] : ''

        weapFile[arg[1]] = {
			name: arg[1],
			cost: parseInt(arg[2]),
			element: arg[3].toLowerCase(),
			desc: weapDesc,
			skill: arg[7],
			originalAuthor: message.author.id
		}
		
		let melBuff = parseInt(arg[4])
		let atkBuff = parseInt(arg[5])
		let magBuff = parseInt(arg[6])
		
		if (melBuff > 0)
			weapFile[arg[1]].melee = melBuff
		if (atkBuff > 0)
			weapFile[arg[1]].atk = atkBuff
		if (magBuff > 0)
			weapFile[arg[1]].mag = magBuff

		fs.writeFileSync(weapPath, JSON.stringify(weapFile, null, '    '));

		const DiscordEmbed = new Discord.MessageEmbed()
			.setColor('#4b02c9')
			.setTitle(`${weapFile[arg[1]].name ? weapFile[arg[1]].name : arg[1]}`)
			.setDescription(`*${weapFile[arg[1]].desc}*`)
		message.channel.send({content: `${arg[1]} is ready to go!`, embeds: [DiscordEmbed]});
    }

    if (command === 'registerarmor') {
		if (utilityFuncs.isBanned(message.author.id, message.guild.id) && !utilityFuncs.RPGBotAdmin(message.author.id))
			return message.channel.send("I've been told you were banned from using the RPG sections of the bot, sorry!");

        const arg = message.content.slice(prefix.length).trim().split(/ +/);
        if (!arg[1]) {
            const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
				.setTitle(`${prefix}${command}`)
				.setDescription('(Args <Name> <Currency Cost> <Element> <END Buff> <Skill> "<Description>")\nCreates a weapon to be equipped. These things are usually used for defensive or healing purposes.\n\nAllow me to explain')
                .addFields(
                    { name: 'Currency Cost', value: "How much of this server's currency this item costs in **shops**.", inline: true },
                    { name: 'Element', value: "The main element of this set of armor. It must be a valid one.", inline: true },
                    { name: 'END Buff', value: "The buff for the endurance stat. When this armor is equipped, the user's END stat is buffed by this value.", inline: true },
                    { name: 'Skill', value: "A skill that can be obtained by using this armor.", inline: true },
                    { name: 'Description', value: "This set of Armor's description. Try to explain what the armor does and how it is used, so your friends can imagine it! Enclose this value in quotation marks.", inline: true },
                )

			return message.channel.send({embeds: [DiscordEmbed]})
        }

        if (message.content.includes("@everyone") || message.content.includes("@here") || message.mentions.users.first())
            return message.channel.send(`You're really mean, you know that?`);
		
        let armrPath = dataPath+'/Equipment/armors.json'
        let armrRead = fs.readFileSync(armrPath, {flag: 'as+'});
        let armrFile = JSON.parse(armrRead);
        let skillPath = dataPath+'/skills.json'
        let skillRead = fs.readFileSync(skillPath, {flag: 'as+'});
        let skillFile = JSON.parse(skillRead);

        if (!utilityFuncs.RPGBotAdmin(message.author.id)) {
            if (armrFile[arg[1]] && message.author.id != armrFile[arg[1]].originalAuthor)
                return message.channel.send("This set of armor exists already, and you do not own it, therefore, you have insufficient permissions to overwrite it.");
        }

		if (!arg[2])
			message.channel.send('Please specify the cost.');
			
		let splicedTxt = message.content.slice(prefix.length).trim().split('"')
		let weapDesc = splicedTxt ? splicedTxt[1] : ''

        armrFile[arg[1]] = {
			name: arg[1],
			cost: parseInt(arg[2]),
			element: arg[3].toLowerCase(),
			desc: weapDesc,
			skill: arg[5],
			originalAuthor: message.author.id
		}
		
		let defBuff = parseInt(arg[4])
		if (defBuff > 0)
			armrFile[arg[1]].def = defBuff

		fs.writeFileSync(armrPath, JSON.stringify(armrFile, null, '    '));
		
		const DiscordEmbed = new Discord.MessageEmbed()
			.setColor('#4b02c9')
			.setTitle(`${armrFile[arg[1]].name ? armrFile[arg[1]].name : arg[1]}`)
			.setDescription(`*${armrFile[arg[1]].desc}*`)
		message.channel.send({content: `${armrFile[arg[1]].name ? armrFile[arg[1]].name : arg[1]} is ready to go!`, embeds: [DiscordEmbed]});
    }
	
	if (command === 'makefusion' || command === 'makecraft' || command === 'makerecipe') {
		if (utilityFuncs.isBanned(message.author.id, message.guild.id) && !utilityFuncs.RPGBotAdmin(message.author.id))
			return message.channel.send("I've been told you were banned from using the RPG sections of the bot, sorry!");

        const arg = message.content.slice(prefix.length).trim().split(/ +/);
        if (!arg[1]) {
            const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
				.setTitle(`${prefix}${command}`)
				.setDescription("(Args <Target Item> <Item 1> <Quantity> <Item 2> <Quantity> <Ect.>)\nCertain items can be fused or crafted together to make another! Sometimes it could be more than one of the same item to make a stronger variant.")

			return message.channel.send({embeds: [DiscordEmbed]})
        }
		
        if (message.content.includes("@everyone") || message.content.includes("@here") || message.mentions.users.first())
            return message.channel.send(`You're really mean, you know that?`);
		
        let itemPath = dataPath+'/items.json'
        let itemRead = fs.readFileSync(itemPath, {flag: 'as+'});
        let itemFile = JSON.parse(itemRead);
		
		if (itemFile[arg[1]]) {
			let itemDefs = itemFile[arg[1]];
			if (message.author.id != itemDefs.originalAuthor)
				return message.channel.send('Apologies, but you do not own this item, therefore, you cannot assign a fusion to it.');

			itemDefs.fusion = {}

			let theItem = ""
			for (let i = 2; i <= arg.length-1; i++) {
				if (!(i & 1)) {
					theItem = arg[i]
				} else {
					itemDefs.fusion[theItem] = parseInt(arg[i])
				}
			}
			
			message.channel.send(`${arg[1]} now has a fusion/crafting recipe!`)
			fs.writeFileSync(itemPath, JSON.stringify(itemFile, null, '    '));			
		} else
			return message.channel.send(`${arg[1]} is an invalid item.`)
	}
	
	if (command === 'fuseitem' || command === 'craftitem') {
		if (utilityFuncs.isBanned(message.author.id, message.guild.id) && !utilityFuncs.RPGBotAdmin(message.author.id))
			return message.channel.send("I've been told you were banned from using the RPG sections of the bot, sorry!");

        const arg = message.content.slice(prefix.length).trim().split(/ +/);
        if (!arg[1]) {
            const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
				.setTitle(`${prefix}${command}`)
				.setDescription("(Args <Team> <Crafted Item>)\nUse a team's items to craft an item.")

			return message.channel.send({embeds: [DiscordEmbed]})
        }
		
        let itemPath = dataPath+'/items.json'
        let itemRead = fs.readFileSync(itemPath, {flag: 'as+'});
        let itemFile = JSON.parse(itemRead);
		let btlPath = `${dataPath}/Battles/battle-${message.guild.id}.json`
		let btlRead = fs.readFileSync(btlPath, {flag: 'as+'});
		let btl = JSON.parse(btlRead);
		
		if (itemFile[arg[2]]) {
			let itemDefs = itemFile[arg[2]];

			if (!itemDefs.fusion || itemDefs.fusion === {})
				return message.channel.send(`${arg[2]} cannot be created.`)

			let partyDefs = btl[message.guild.id].parties[arg[1]];
			
			// Check if the party has the items required.
			let notEnough = false;
			for (const i in itemDefs.fusion) {
				if (partyDefs.items[i] && partyDefs.items[i] >= itemDefs.fusion[i]) {
					partyDefs.items[i] -= itemDefs.fusion[i];
					if (partyDefs.items[i] <= 0) delete partyDefs.items[i];
				} else {
					notEnough = true;
					break;
				}
			}
			
			if (notEnough == true) {
				let itemsRequired = '```diff'
				for (const i in itemDefs.fusion)
					itemsRequired += `\n${itemFile[i] ? itemFile[i].name : i} x${itemDefs.fusion[i]} (${partyDefs.items[i] ? partyDefs.items[i] : '0'}/${itemDefs.fusion[i]})`;
				
				itemsRequired += '```'

				var DiscordEmbed = new Discord.MessageEmbed()
					.setColor('#ff0033')
					.setTitle('Item Crafting')
					.setDescription(`Team ${arg[1]} don't have enough items!${itemsRequired}`)
				message.channel.send({embeds: [DiscordEmbed]})
				
				return;
			}
			
			if (!partyDefs.items[arg[2]])
				partyDefs.items[arg[2]] = 1;
			else
				partyDefs.items[arg[2]]++;

			var DiscordEmbed = new Discord.MessageEmbed()
				.setColor('#ffda47')
				.setTitle('Item Crafting')
				.setDescription(`Team ${arg[1]} made an ${arg[2]}!`)
			message.channel.send({embeds: [DiscordEmbed]})
			fs.writeFileSync(btlPath, JSON.stringify(btl, null, '    '));	
		} else
			return message.channel.send(`${arg[2]} is an invalid item.`)
	}

    if (command === 'getitem') {
        let itemPath = dataPath+'/items.json'
        let itemRead = fs.readFileSync(itemPath, {flag: 'as+'});
        let itemFile = JSON.parse(itemRead);
		
		let servPath = dataPath+'/Server Settings/server.json'
        let servRead = fs.readFileSync(servPath, {flag: 'as+'});
        let servFile = JSON.parse(servRead);
        let servDefs = servFile[message.guild.id];

        const arg = message.content.slice(prefix.length).trim().split(/ +/);
        if (!arg[1]) {
            const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle(`${prefix}${command}`)
				.setDescription("(Args <ItemName>)\nList the functions of an item including functions, descriptions and fusions.")
            message.channel.send({embeds: [DiscordEmbed]})
            return false
        }

        if (itemFile[arg[1]]) {
			let itemDefs = itemFile[arg[1]];

			let descTxt = ''

			if (itemDefs.cost)
				descTxt += `Costs **${itemDefs.cost} ${servDefs.currency}**s.\n`;
			
			switch(itemDefs.type) {
				case 'material':
					descTxt += `A **type of material** used in **item fusion** or **equipment upgrading**.`;
			}
			
			if (itemDefs.desc)
				descTxt += `\n\n*${itemDefs.desc}*`;
			
			if (itemDefs.fusion) {
				descTxt += '\n\n_To fuse, require:';
				
				for (const i in itemFile[arg[1]].fusion)
					descTxt += `\n${itemDefs.fusion[i]} ${i}s`;
				
				descTxt += '_';
			}

			let userTxt = ''
			if (itemDefs.originalAuthor) {
				if (itemDefs.originalAuthor === 'Default')
					userTxt = 'Default/Official';
				else {
					let user = await client.users.fetch(itemDefs.originalAuthor);
					userTxt = user.username;
				}
			} else
				userTxt = 'Default/Official';

            const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#4b02c9')
				.setTitle(`${itemTypeEmoji[itemDefs.type.toLowerCase()]}${itemDefs.name ? itemDefs.name : arg[1]} *(${userTxt})*`)
				.setDescription(descTxt)
            message.channel.send({embeds: [DiscordEmbed]});
        } else {
            message.channel.send(`${arg[1]} is an invalid item!`);
        }
    }
	
    if (command === 'listitems') {
        let itemPath = dataPath+'/items.json'
        let itemRead = fs.readFileSync(itemPath, {flag: 'as+'});
        let itemFile = JSON.parse(itemRead);

		let itemArray = []
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

    if (command === 'obtainitem') {
        let itemPath = dataPath+'/items.json'
        let itemRead = fs.readFileSync(itemPath, {flag: 'as+'});
        let itemFile = JSON.parse(itemRead);
		let btlPath = dataPath+'/Battles/battle-' + message.guild.id + '.json'
		let btlRead = fs.readFileSync(btlPath, {flag: 'as+'});
		let btl = JSON.parse(btlRead);

        const arg = message.content.slice(prefix.length).trim().split(/ +/);
        if (!arg[1]) {
            const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle(`${prefix}${command}`)
				.setDescription('(Args <PartyName> <ItemName> <Quantity>)\nAllow the party to find an item.')
            message.channel.send({embeds: [DiscordEmbed]})
            return false
        }

        if (itemFile[arg[2]]) {
			let itemDefs = itemFile[arg[2]];
			
			if (!btl[message.guild.id].parties[arg[1]])
				return message.channel.send(`${arg[1]} is an invalid party!`);

			if (!btl[message.guild.id].parties[arg[1]].items)
				btl[message.guild.id].parties[arg[1]].items = {};
			
			var DiscordEmbed
			if (!btl[message.guild.id].parties[arg[1]].items[arg[2]]) {
				btl[message.guild.id].parties[arg[1]].items[arg[2]] = parseInt(arg[3]);
			} else {
				btl[message.guild.id].parties[arg[1]].items[arg[2]] += parseInt(arg[3]);
			}
			
			if (!arg[3] || parseInt(arg[3]) <= 1) {
				DiscordEmbed = new Discord.MessageEmbed()
					.setColor('#4b02c9')
					.setTitle(`Team ${arg[1]} found an ${itemDefs.name ? itemDefs.name : arg[2]}!`)
					.setDescription('very awesom');
			} else {
				DiscordEmbed = new Discord.MessageEmbed()
					.setColor('#4b02c9')
					.setTitle(`Team ${arg[1]} found ${arg[3]} ${itemDefs.name ? itemDefs.name : arg[2]}s!`)
					.setDescription('the funny awesome');
			}

			fs.writeFileSync(dataPath+`/Battles/battle-${message.guild.id}.json`, JSON.stringify(btl, null, '    '));
            message.channel.send({embeds: [DiscordEmbed]});
        } else
            message.channel.send(`${arg[2]} is an invalid item!`);
    }

    if (command === 'transferitems') {
        let itemPath = dataPath+'/items.json'
        let itemRead = fs.readFileSync(itemPath, {flag: 'as+'});
        let itemFile = JSON.parse(itemRead);
		let btlPath = dataPath+'/Battles/battle-' + message.guild.id + '.json'
		let btlRead = fs.readFileSync(btlPath, {flag: 'as+'});
		let btl = JSON.parse(btlRead);

        const arg = message.content.slice(prefix.length).trim().split(/ +/);
        if (!arg[1]) {
            const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle(`${prefix}${command}`)
				.setDescription('(Args <PartyName> <PartyName2> <Item>)\nTransfer all items (or one item) to another party.')
            message.channel.send({embeds: [DiscordEmbed]})
            return false
        }

		if (!btl[message.guild.id].parties[arg[1]])
			return message.channel.send(`${arg[1]} is an invalid party!`);

		if (!btl[message.guild.id].parties[arg[2]])
			return message.channel.send(`${arg[2]} is an invalid party!`);

		if (!btl[message.guild.id].parties[arg[1]].items || btl[message.guild.id].parties[arg[1]].items == {})
			return message.channel.send(`Team ${arg[1]} has no items.`);
		
		if (!arg[3]) {
			for (const i in btl[message.guild.id].parties[arg[1]].items) {
				if (!btl[message.guild.id].parties[arg[2]].items[i])
					btl[message.guild.id].parties[arg[2]].items[i] = btl[message.guild.id].parties[arg[1]].items[i];
				else
					btl[message.guild.id].parties[arg[2]].items[i] += btl[message.guild.id].parties[arg[1]].items[i];
			}
		} else {
			if (!btl[message.guild.id].parties[arg[1]].items[arg[3]])
				return message.channel.send(`Team ${arg[1]} has no ${arg[3]}s.`)
			
			if (!btl[message.guild.id].parties[arg[2]].items[arg[3]])
				btl[message.guild.id].parties[arg[2]].items[arg[3]] = btl[message.guild.id].parties[arg[1]].items[arg[3]];
			else
				btl[message.guild.id].parties[arg[2]].items[i] += btl[message.guild.id].parties[arg[1]].items[arg[3]];
		}

		message.react('👍')
		fs.writeFileSync(dataPath+`/Battles/battle-${message.guild.id}.json`, JSON.stringify(btl, null, '    '));
		message.channel.send({embeds: [DiscordEmbed]});
    }

    if (command === 'getweapon') {
        let weapPath = dataPath+'/Equipment/weapons.json'
        let weapRead = fs.readFileSync(weapPath, {flag: 'as+'});
        let weapFile = JSON.parse(weapRead);

		let servPath = dataPath+'/Server Settings/server.json'
        let servRead = fs.readFileSync(servPath, {flag: 'as+'});
        let servFile = JSON.parse(servRead);
        let servDefs = servFile[message.guild.id];

        const arg = message.content.slice(prefix.length).trim().split(/ +/);
        if (!arg[1]) {
            const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle(`${prefix}${command}`)
				.setDescription("(Args <WeaponName>)\nList the capabilities of a weapon.")
            message.channel.send({embeds: [DiscordEmbed]})
            return false
        }

        if (weapFile[arg[1]]) {
			let weapDefs = weapFile[arg[1]];
			let descTxt = ''

			if (weapDefs.cost)
				descTxt += `Costs **${weapDefs.cost} ${servDefs.currency}**s.\n`;
			
			if (weapDefs.atk)
				descTxt += `**+${weapDefs.atk}**ATK\n`;
			if (weapDefs.mag)
				descTxt += `**+${weapDefs.mag}**MAG\n`;
			if (weapDefs.skill)
				descTxt += `Grants **${weapDefs.skill}**\n`;
			
			if (weapDefs.desc)
				descTxt += `\n\n*${weapDefs.desc}*`;

			let userTxt = ''
			if (weapDefs.originalAuthor) {
				if (weapDefs.originalAuthor === 'Default')
					userTxt = 'Default/Official';
				else {
					let user = await client.users.fetch(weapDefs.originalAuthor);
					userTxt = user.username;
				}
			} else
				userTxt = 'Default/Official';

            const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#4b02c9')
				.setTitle(`${weapDefs.name ? weapDefs.name : arg[1]}, at level 1. *(${userTxt})*`)
				.setDescription(descTxt);
            message.channel.send({embeds: [DiscordEmbed]});
        } else {
            message.channel.send(`${arg[1]} is an invalid weapon!`);
        }
    }
	
    if (command === 'listweapons') {
        let weapPath = dataPath+'/Equipment/weapons.json'
        let weapRead = fs.readFileSync(weapPath, {flag: 'as+'});
        let weapFile = JSON.parse(weapRead);

		let itemArray = []
        const arg = message.content.slice(prefix.length).trim().split(/ +/);
        if (!arg[1] || arg[1] === ' ' || arg[1] === 'null') {
			for (const i in weapFile)
				itemArray.push(weapFile[i]);

			sendWeaponArray(message.channel, itemArray);
        } else {
			for (const i in weapFile) {
				if (weapFile[i].name && weapFile[i].name.includes(arg[1]))
					itemArray.push(weapFile[i]);
			}
			
			if (itemArray.length <= 0)
				return message.channel.send("No found items.")

			sendWeaponArray(message.channel, itemArray);
		}
	}

    if (command === 'getarmor') {
        let armrPath = dataPath+'/Equipment/armors.json'
        let armrRead = fs.readFileSync(armrPath, {flag: 'as+'});
        let armrFile = JSON.parse(armrRead);
		
		let servPath = dataPath+'/Server Settings/server.json'
        let servRead = fs.readFileSync(servPath, {flag: 'as+'});
        let servFile = JSON.parse(servRead);
        let servDefs = servFile[message.guild.id];

        const arg = message.content.slice(prefix.length).trim().split(/ +/);
        if (!arg[1]) {
            const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle(`${prefix}${command}`)
				.setDescription("(Args <ArmorName>)\nList the capabilities of a set of armor.")
            message.channel.send({embeds: [DiscordEmbed]})
            return false
        }

        if (armrFile[arg[1]]) {
			let armrDefs = armrFile[arg[1]];
			let descTxt = '';

			if (armrDefs.cost)
				descTxt += `Costs **${armrDefs.cost} ${servDefs.currency}**s.\n`;

			if (armrDefs.end)
				descTxt += `**+${armrDefs.end}**END\n`;
			if (armrDefs.skill)
				descTxt += `Grants **${armrDefs.skill}**\n`;
			
			if (armrDefs.desc)
				descTxt += `\n\n*${armrDefs.desc}*`;

			let userTxt = ''
			if (armrDefs.originalAuthor) {
				if (armrDefs.originalAuthor === 'Default')
					userTxt = 'Default/Official';
				else {
					let user = await client.users.fetch(armrDefs.originalAuthor);
					userTxt = user.username;
				}
			} else
				userTxt = 'Default/Official';

            const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#4b02c9')
				.setTitle(`${armrDefs.name ? armrDefs.name : arg[1]}, at level 1. *(${userTxt})*`)
				.setDescription(descTxt);
            message.channel.send({embeds: [DiscordEmbed]});
        } else {
            message.channel.send(`${arg[1]} is an invalid weapon!`);
        }
    }
	
    if (command === 'listarmors') {
        let armrPath = dataPath+'/Equipment/armors.json'
        let armrRead = fs.readFileSync(armrPath, {flag: 'as+'});
        let armrFile = JSON.parse(armrRead);

		let itemArray = []
        const arg = message.content.slice(prefix.length).trim().split(/ +/);
        if (!arg[1] || arg[1] === ' ' || arg[1] === 'null') {
			for (const i in armrFile)
				itemArray.push(armrFile[i]);

			sendArmorArray(message.channel, itemArray);
        } else {
			for (const i in armrFile) {
				if (armrFile[i].name && armrFile[i].name.includes(arg[1]))
					itemArray.push(armrFile[i]);
			}
			
			if (itemArray.length <= 0)
				return message.channel.send("No found items.")

			sendArmorArray(message.channel, itemArray);
		}
	}
	
    if (command === 'listcharms') {
        let charmPath = dataPath+'/charms.json'
        let charmRead = fs.readFileSync(charmPath, {flag: 'as+'});
        let charmFile = JSON.parse(charmRead);

		let itemArray = []
        const arg = message.content.slice(prefix.length).trim().split(/ +/);
        if (!arg[1] || arg[1] === ' ' || arg[1] === 'null') {
			for (const i in charmFile)
				itemArray.push(charmFile[i]);

			sendCharmArray(message.channel, itemArray);
        } else {
			for (const i in charmFile) {
				if (charmFile[i].name && charmFile[i].name.includes(arg[1]))
					itemArray.push(charmFile[i]);
			}
			
			if (itemArray.length <= 0)
				return message.channel.send('No found charms.')

			sendCharmArray(message.channel, itemArray);
		}
	}

    if (command === 'obtainweapon') {
        let weapPath = dataPath+'/Equipment/weapons.json'
        let weapRead = fs.readFileSync(weapPath, {flag: 'as+'});
        let weapFile = JSON.parse(weapRead);
		let btlPath = dataPath+'/Battles/battle-' + message.guild.id + '.json'
		let btlRead = fs.readFileSync(btlPath, {flag: 'as+'});
		let btl = JSON.parse(btlRead);

        const arg = message.content.slice(prefix.length).trim().split(/ +/);
        if (!arg[1]) {
            const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle(`${prefix}${command}`)
				.setDescription("(Args <PartyName> <WeaponName>)\nAllow the party to find a weapon.")
            message.channel.send({embeds: [DiscordEmbed]})
            return false
        }

        if (weapFile[arg[2]]) {
			let weapDefs = weapFile[arg[2]];
			
			if (!btl[message.guild.id].parties[arg[1]])
				return message.channel.send(`${arg[1]} is an invalid party!`);

			if (!btl[message.guild.id].parties[arg[1]].weapons)
				btl[message.guild.id].parties[arg[1]].weapons = {};
			
			btl[message.guild.id].parties[arg[1]].weapons[arg[2]] = {
				level: 1,
				atk: weapDefs.atk ? weapDefs.atk : 0,
				mag: weapDefs.mag ? weapDefs.mag : 0,
				end: weapDefs.end ? weapDefs.end : 0,
				skill: weapDefs.skill ? weapDefs.skill : null,
				desc: weapDefs.desc ? weapDefs.desc : null
			}
			fs.writeFileSync(dataPath+`/Battles/battle-${message.guild.id}.json`, JSON.stringify(btl, null, '    '));

            const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#4b02c9')
				.setTitle(`Team ${arg[1]} found a ${weapDefs.name ? weapDefs.name : arg[2]}`)
				.setDescription('very cool');
            message.channel.send({embeds: [DiscordEmbed]});
        } else
            message.channel.send(`${arg[2]} is an invalid weapon!`);
    }

    if (command === 'obtainarmor') {
        let armrPath = dataPath+'/Equipment/armors.json'
        let armrRead = fs.readFileSync(armrPath, {flag: 'as+'});
        let armrFile = JSON.parse(armrRead);
		let btlPath = dataPath+'/Battles/battle-' + message.guild.id + '.json'
		let btlRead = fs.readFileSync(btlPath, {flag: 'as+'});
		let btl = JSON.parse(btlRead);

        const arg = message.content.slice(prefix.length).trim().split(/ +/);
        if (!arg[1]) {
            const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle(`${prefix}${command}`)
				.setDescription("(Args <PartyName> <ArmorName>)\nAllow the party to find a set of armor.")
            message.channel.send({embeds: [DiscordEmbed]})
            return false
        }

        if (armrFile[arg[2]]) {
			let armrDefs = armrFile[arg[2]];
			let descTxt = ''

			if (!btl[message.guild.id].parties[arg[1]])
				return message.channel.send(`${arg[1]} is an invalid party!`);

			if (!btl[message.guild.id].parties[arg[1]].armors)
				btl[message.guild.id].parties[arg[1]].armors = {};
			
			btl[message.guild.id].parties[arg[1]].armors[arg[2]] = {
				level: 1,
				atk: armrDefs.atk ? armrDefs.atk : 0,
				mag: armrDefs.mag ? armrDefs.mag : 0,
				end: armrDefs.end ? armrDefs.end : 0,
				skill: armrDefs.skill ? armrDefs.skill : null,
				desc: armrDefs.desc ? armrDefs.desc : null
			}
			fs.writeFileSync(dataPath+`/Battles/battle-${message.guild.id}.json`, JSON.stringify(btl, null, '    '));

            const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#4b02c9')
				.setTitle(`Team ${arg[1]} found a ${armrDefs.name ? armrDefs.name : arg[2]}`)
				.setDescription('dun dun dun duuun');
            message.channel.send({embeds: [DiscordEmbed]});
        } else
            message.channel.send(`${arg[2]} is an invalid weapon!`);
    }

    if (command === 'equipweapon') {
		if (utilityFuncs.isBanned(message.author.id, message.guild.id) && !utilityFuncs.RPGBotAdmin(message.author.id))
			return message.channel.send("I've been told you were banned from using the RPG sections of the bot, sorry!");

        const arg = message.content.slice(prefix.length).trim().split(/ +/);
        if (arg[1] == null) {
            const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#4b02c9')
				.setTitle(`${prefix}${command}`)
				.setDescription('(Args <CharName> <PartyName> <WeaponName>)\nIf the party has this weapon, the specified character can equip it.')
            return message.channel.send({embeds: [DiscordEmbed]})
        }

		let charPath = dataPath+'/characters.json'
		let charRead = fs.readFileSync(charPath, {flag: 'as+'});
		let charFile = JSON.parse(charRead);
		let btlPath = dataPath+'/Battles/battle-' + message.guild.id + '.json'
		let btlRead = fs.readFileSync(btlPath, {flag: 'as+'});
		let btl = JSON.parse(btlRead);

        if (btl[message.guild.id].parties[arg[2]]) {
			let partyDefs = btl[message.guild.id].parties[arg[2]];
			
			if (!charFile[arg[1]])
				return message.channel.send(`${arg[1]} is an invalid character!`);
			
			let inParty = false;
			for (const i in partyDefs.members) {
				if (partyDefs.members[i] === arg[1])
					inParty = true;
			}

			if (inParty == false)
				return message.channel.send(`${arg[1]} isn't in Team ${arg[2]}.`);

			let charDefs = charFile[arg[1]]

			if (!partyDefs.weapons)
				return message.channel.send(`Team ${arg[2]} doesn't have any weapons.`);

			if (!partyDefs.weapons[arg[3]])
				return message.channel.send(`Team ${arg[2]} doesn't have a ${arg[3]}.`);
			
			if (partyDefs.weapons[arg[3]].equipped)
				return message.channel.send(`${partyDefs.weapons[arg[3]].equipped} already has this weapon equipped.`);
			
			partyDefs.weapons[arg[3]].equipped = arg[1];
			message.channel.send(`👍 ${arg[1]} equipped the ${arg[3]}`);
			fs.writeFileSync(dataPath+`/Battles/battle-${message.guild.id}.json`, JSON.stringify(btl, null, '    '))
        } else
            return message.channel.send(`${arg[2]} isn't a valid party.`);
    }

    if (command === 'unequipweapon' || command === 'removeweapon') {
		if (utilityFuncs.isBanned(message.author.id, message.guild.id) && !utilityFuncs.RPGBotAdmin(message.author.id))
			return message.channel.send("I've been told you were banned from using the RPG sections of the bot, sorry!");

        const arg = message.content.slice(prefix.length).trim().split(/ +/);
        if (arg[1] == null) {
            const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#4b02c9')
				.setTitle(`${prefix}${command}`)
				.setDescription('(Args <CharName> <PartyName> <WeaponName>)\nIf the party has this weapon, the specified character can unequip it.')
            return message.channel.send({embeds: [DiscordEmbed]})
        }

		let charPath = dataPath+'/characters.json'
		let charRead = fs.readFileSync(charPath, {flag: 'as+'});
		let charFile = JSON.parse(charRead);
		let btlPath = dataPath+'/Battles/battle-' + message.guild.id + '.json'
		let btlRead = fs.readFileSync(btlPath, {flag: 'as+'});
		let btl = JSON.parse(btlRead);

        if (btl[message.guild.id].parties[arg[2]]) {
			let partyDefs = btl[message.guild.id].parties[arg[2]];
			
			if (!charFile[arg[1]])
				return message.channel.send(`${arg[1]} is an invalid character!`);
			
			let inParty = false;
			for (const i in partyDefs.members) {
				if (partyDefs.members[i] === arg[1])
					inParty = true;
			}

			if (inParty == false)
				return message.channel.send(`${arg[1]} isn't in Team ${arg[2]}.`);

			let charDefs = charFile[arg[1]]

			if (!partyDefs.weapons)
				return message.channel.send(`Team ${arg[2]} doesn't have any weapons.`);

			if (!partyDefs.weapons[arg[3]])
				return message.channel.send(`Team ${arg[2]} doesn't have a ${arg[3]}.`);

			delete partyDefs.weapons[arg[3]].equipped;
			message.channel.send(`👍 ${arg[1]} unequipped the ${arg[3]}`);
			fs.writeFileSync(dataPath+`/Battles/battle-${message.guild.id}.json`, JSON.stringify(btl, null, '    '))
        } else
            return message.channel.send(`${arg[2]} isn't a valid party.`);
    }

    if (command === 'equiparmor') {
		if (utilityFuncs.isBanned(message.author.id, message.guild.id) && !utilityFuncs.RPGBotAdmin(message.author.id))
			return message.channel.send("I've been told you were banned from using the RPG sections of the bot, sorry!");

        const arg = message.content.slice(prefix.length).trim().split(/ +/);
        if (arg[1] == null) {
            const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#4b02c9')
				.setTitle(`${prefix}${command}`)
				.setDescription('(Args <CharName> <PartyName> <ARmorName>)\nIf the party has this set of armor, the specified character can equip it.')
            return message.channel.send({embeds: [DiscordEmbed]})
        }

		let charPath = dataPath+'/characters.json'
		let charRead = fs.readFileSync(charPath, {flag: 'as+'});
		let charFile = JSON.parse(charRead);
		let btlPath = dataPath+'/Battles/battle-' + message.guild.id + '.json'
		let btlRead = fs.readFileSync(btlPath, {flag: 'as+'});
		let btl = JSON.parse(btlRead);

        if (btl[message.guild.id].parties[arg[2]]) {
			let partyDefs = btl[message.guild.id].parties[arg[2]];

			if (!charFile[arg[1]])
				return message.channel.send(`${arg[1]} is an invalid character!`);

			let inParty = false;
			for (const i in partyDefs.members) {
				if (partyDefs.members[i] === arg[1])
					inParty = true;
			}

			if (inParty == false)
				return message.channel.send(`${arg[1]} isn't in Team ${arg[2]}.`);

			let charDefs = charFile[arg[1]]

			if (!partyDefs.armors)
				return message.channel.send(`Team ${arg[2]} doesn't have any armors.`);

			if (!partyDefs.armors[arg[3]])
				return message.channel.send(`Team ${arg[2]} doesn't have a ${arg[3]}.`);
			
			if (partyDefs.armors[arg[3]].equipped)
				return message.channel.send(`${partyDefs.armors[arg[3]].equipped} already has this set of armor equipped.`);
			
			partyDefs.armors[arg[3]].equipped = arg[1];
			message.channel.send(`👍 ${arg[1]} equipped the ${arg[3]}`);
			fs.writeFileSync(dataPath+`/Battles/battle-${message.guild.id}.json`, JSON.stringify(btl, null, '    '))
        } else
            return message.channel.send(`${arg[2]} isn't a valid party.`);
    }

    if (command === 'unequiparmor' || command === 'removearmor') {
		if (utilityFuncs.isBanned(message.author.id, message.guild.id) && !utilityFuncs.RPGBotAdmin(message.author.id))
			return message.channel.send("I've been told you were banned from using the RPG sections of the bot, sorry!");

        const arg = message.content.slice(prefix.length).trim().split(/ +/);
        if (arg[1] == null) {
            const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#4b02c9')
				.setTitle(`${prefix}${command}`)
				.setDescription('(Args <CharName> <PartyName> <ArmorName>)\nIf the party has this set of armor, the specified character can equip it.')
            return message.channel.send({embeds: [DiscordEmbed]})
        }

		let charPath = dataPath+'/characters.json'
		let charRead = fs.readFileSync(charPath, {flag: 'as+'});
		let charFile = JSON.parse(charRead);
		let btlPath = dataPath+'/Battles/battle-' + message.guild.id + '.json'
		let btlRead = fs.readFileSync(btlPath, {flag: 'as+'});
		let btl = JSON.parse(btlRead);

        if (btl[message.guild.id].parties[arg[2]]) {
			let partyDefs = btl[message.guild.id].parties[arg[2]];
			
			if (!charFile[arg[1]])
				return message.channel.send(`${arg[1]} is an invalid character!`);
			
			let inParty = false;
			for (const i in partyDefs.members) {
				if (partyDefs.members[i] === arg[1])
					inParty = true;
			}

			if (inParty == false)
				return message.channel.send(`${arg[1]} isn't in Team ${arg[2]}.`);

			let charDefs = charFile[arg[1]]

			if (!partyDefs.armors)
				return message.channel.send(`Team ${arg[2]} doesn't have any armors.`);

			if (!partyDefs.armors[arg[3]])
				return message.channel.send(`Team ${arg[2]} doesn't have a ${arg[3]}.`);

			delete partyDefs.armors[arg[3]].equipped;
			message.channel.send(`👍 ${arg[1]} unequipped the ${arg[3]}`);
			fs.writeFileSync(dataPath+`/Battles/battle-${message.guild.id}.json`, JSON.stringify(btl, null, '    '))
        } else
            return message.channel.send(`${arg[2]} isn't a valid party.`);
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
		
		let charPath = dataPath+'/characters.json'
		let charRead = fs.readFileSync(charPath, {flag: 'as+'});
		let charFile = JSON.parse(charRead);
		if (!arg[1]) {
			for (const i in charFile) {
				charFile[i].hp = charFile[i].maxhp
				charFile[i].mp = charFile[i].maxmp
			}
		} else {
			let btlPath = `${dataPath}/Battles/battle-${message.guild.id}.json`
			let btlRead = fs.readFileSync(btlPath, {flag: 'as+'});
			let btl = JSON.parse(btlRead);

			if (!btl[message.guild.id].parties[arg[1]])
				return message.channel.send(`${arg[1]} is a nonexistant team!`)

			if (btl[message.guild.id].parties[arg[1]].members.length <= 0)
				return message.channel.send(`${arg[1]} is an empty party!`)

			for (const i in btl[message.guild.id].parties[arg[1]].members) {
				let name = btl[message.guild.id].parties[arg[1]].members[i];

				if (charFile[name]) {
					charFile[name].hp = charFile[name].maxhp
					charFile[name].mp = charFile[name].maxmp
				}
			}
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
	
	/*
		CHARACTER Functions
	*/

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
                    { name: 'Magic', value: "Affects the power of magical attacks.", inline: true },
                    { name: 'Perception', value: "Affects the chance of a move landing, positively, against foes who are slower than your perception.", inline: true },
                    { name: 'Endurance', value: "Lowers the power of an attack that targets you. Also increaases HP gain upon level up.", inline: true },
                    { name: 'Charisma', value: "Raises the chances of inflicting a mental status ailment.", inline: true },
                    { name: 'Inteligence', value: "Increases MP gain upon level up, and also allows the party to gain slightly more XP.", inline: true },
                    { name: 'Agility', value: "Raises the chance of you dodging an attack that targets you. Also allows you to move faster in the turn order.", inline: true },
                    { name: 'Luck', value: "Raises the chance of landing a critical hit, as well as the chance of inflicting a physical status ailment. Also lowers the chance of being afflicted with any status ailment, and getting hit by a critical hit.", inline: true },
                )
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
			let BST = 0;
			let highStats = 0;
			let lowStats = 0;
			let midStats = 0;
			for (i = 4; i <= 11; i++) {
				if (parseInt(arg[i]) > 10)
					return message.channel.send('One of your 8 stats are over 10.');
				else if (parseInt(arg[i]) <= 0)
					return message.channel.send('One of your 8 stats are less than 0.');
				else {
					let statNum = parseInt(arg[i])
					if (statNum <= 3) {
						lowStats++;
					} else if (statNum <= 6) {
						midStats++;
					} else {
						highStats++;
//						if (highStats >= 3)
//							return message.channel.send('You should have less than 3 high stats.')
					}

					BST += statNum
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
                    { name: 'Magic', value: "Affects the power of magical attacks.", inline: true },
                    { name: 'Perception', value: "Affects the chance of a move landing, positively, against foes who are slower than your perception.", inline: true },
                    { name: 'Endurance', value: "Lowers the power of an attack that targets you. Also increaases HP gain upon level up.", inline: true },
                    { name: 'Charisma', value: "Raises the chances of inflicting a mental status ailment.", inline: true },
                    { name: 'Inteligence', value: "Increases MP gain upon level up, and also allows the party to gain slightly more XP.", inline: true },
                    { name: 'Agility', value: "Raises the chance of you dodging an attack that targets you. Also allows you to move faster in the turn order.", inline: true },
                    { name: 'Luck', value: "Raises the chance of landing a critical hit, as well as the chance of inflicting a physical status ailment. Also lowers the chance of being afflicted with any status ailment, and getting hit by a critical hit.", inline: true },
                )
            message.channel.send({embeds: [DiscordEmbed]})
            return false
        }
		
		let charPath = dataPath+'/characters.json'
		let charRead = fs.readFileSync(charPath, {flag: 'as+'});
		let charFile = JSON.parse(charRead);
		
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
			let BST = 0;
			for (i = 4; i <= 11; i++) {
				if (parseInt(arg[i]) > 10)
					return message.channel.send('One of your 8 stats are over 10.');
				else if (parseInt(arg[i]) <= 0)
					return message.channel.send('One of your 8 stats are less than 0.');
				else {
					let statNum = parseInt(arg[i])
					BST += statNum
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
		
		let oldLvl = charFile[arg[1]].level
		let oldXP = charFile[arg[1]].xp

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
			charFuncs.lvlUp(charFile[arg[1]], false, message.guild.id)
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
	
	if (command === 'updatechars') {
		if (utilityFuncs.isBanned(message.author.id, message.guild.id) && !utilityFuncs.RPGBotAdmin(message.author.id))
			return message.channel.send("I've been told you were banned from using the RPG sections of the bot, sorry!");
            
		if (!utilityFuncs.RPGBotAdmin(message.author.id))
			return message.channel.send('No.');
		
		message.channel.send("This will take a while, so be patient! I will react with 👍 once I'm done.")

		setTimeout(function() {
			let charPath = dataPath+'/characters.json'
			let charRead = fs.readFileSync(charPath, {flag: 'as+'});
			let charFile = JSON.parse(charRead);
			
			for (const i in charFile) {
				// Stat Updates
				let newCharDefs = utilityFuncs.cloneObj(charFile[i])

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
					charFuncs.lvlUp(newCharDefs, false, message.guild.id)
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
						gender: "other",
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
				
				let bioDef = [
					'species',
					'gender',
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

				// Charms
				if (!charFile[i].charms)
					charFile[i].charms = []
				if (!charFile[i].curCharms)
					charFile[i].curCharms = []

				// Main Element
				if (!charFile[i].mainElement)
					charFile[i].mainElement = 'strike'

				// MP Meter
				if (!charFile[i].mpMeter)
					charFile[i].mpMeter = ['Magic Points', 'MP'];
				
				// AutoLearn
				let newAutoLearn = utilityFuncs.cloneObj(charFile[i].autoLearn);
				
				charFile[i].autoLearn = {}
				for (const k in newAutoLearn)
					charFile[i].autoLearn[newAutoLearn[k]] = true;
			}
			
			fs.writeFileSync(charPath, JSON.stringify(charFile, null, '    '));
			message.react('👍')
		}, 1000);
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
				.setDescription(`(Args <Character Name> <Transformaton Name> <Requirement> <HP Buff> <Strength Buff> <Magic Buff> <Perception Buff> <Endurance Buff> <Charisma Buff> <Inteligence Buff> <Agility Buff> <Luck Buff>)\nAllows the specified character to transform mid-battle! Usually, there's a requirement for the transformation.\n\nOh right! I should explain what each new stat does, huh. Essentially, it's the same as a character, except... less BST. There are multible requirement IDs, including but not limited to:\n"allydown"\n"onlystanding"\n"belowhalfhp"\n"outofmp"\n"leaderdown"\n"trusteddown"`)
                .setFooter(`${prefix}${command}`);
            message.channel.send({embeds: [DiscordEmbed]})
            return false
        }
	
        if (message.content.includes("@everyone") || message.content.includes("@here") || message.mentions.users.first()) {
            message.channel.send(`You're really mean, you know that?`);
            return false
        }
		
		// Balance Checks
		if (parseInt(arg[4]) > 20) {
			message.channel.send('This is too much of a HP buff. Try below 20.')
			return false
		} else {
			let BST = 0;
			let allowedMore = 0;
			for (i = 5; i <= 12; i++) {
				if (parseInt(arg[i]) > 10) return message.channel.send(`${arg[i]} is too much of a stat buff!`);
				if (parseInt(arg[i]) < -20) return message.channel.send(`${arg[i]} is too much of a stat debuff!`);

				if (parseInt(arg[i]) < 0)
					allowedMore = -parseInt(arg[i])/2

				if (parseInt(arg[i]) > 0)
					BST += parseInt(arg[i]);
			}

			if (BST > Math.round(Math.min(25, 15+allowedMore)))
				return message.channel.send(`<:warning:878094052208296007>${BST} is more than ${Math.round(Math.min(25, 15+allowedMore))}. 15 is the Maximum for Transformations, but gets modified if you have negative stats..`);
		}
		
		let charPath = dataPath+'/characters.json'
		let charRead = fs.readFileSync(charPath, {flag: 'as+'});
		let charFile = JSON.parse(charRead);
		
		if (!charFile[arg[1]])
			return message.channel.send(`${arg[1]} is an invalid character.`);
		
		let charDefs = charFile[arg[1]]

		let reqTable = ['allydown', 'onlystanding', 'belowhalfhp', 'outofmp', 'leaderdown', 'trusteddown']

		if (!arg[3])
			return message.channel.send('Please specify a requirement value (See with no arguments)')
		
		if (arg[3].toLowerCase()) {
			let validArg;
			let argument = arg[3].toLowerCase()
		
			for (const i in reqTable) {
				if (reqTable[i] && argument == reqTable[i].toLowerCase()) {
					validArg = true;
					break
				}
			}
			
			if (!validArg)
				return message.channel.send('Please specify a valid requirement value (See with no arguments)');
		}

        charFuncs.makeTransformation(charDefs, arg[2], arg[3].toLowerCase(), parseInt(arg[4]), parseInt(arg[5]), parseInt(arg[6]), parseInt(arg[7]), parseInt(arg[8]), parseInt(arg[9]), parseInt(arg[10]), parseInt(arg[11]), parseInt(arg[12]))
        fs.writeFileSync(charPath, JSON.stringify(charFile, null, '    '));

		if (charDefs.transformations[arg[2]]) {
			let transDefs = charDefs.transformations[arg[2]]

            const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#f2c055')
				.setTitle(`${charDefs.name}'s ${transDefs.name} Transformation's Stats:`)
                .setDescription(`${transDefs.hp}HP++\n\n${transDefs.atk}ATK++\n${transDefs.mag}MAG++\n${transDefs.prc}PRC++\n${transDefs.end}END++\n${transDefs.chr}CHR++\n${transDefs.int}INT++\n${transDefs.agl}AGL++\n${transDefs.luk}LUK++`)
            message.channel.send({content: `👍 ${charDefs.name}'s ${transDefs.name} transformation has been registered!`, embeds: [DiscordEmbed]});
        } else
            return message.channel.send('Something went wrong... try again, maybe?');
    }

    if (command === 'edittransformation') {
		if (utilityFuncs.isBanned(message.author.id, message.guild.id) && !utilityFuncs.RPGBotAdmin(message.author.id)) {
			message.channel.send("I've been told you were banned from using the RPG sections of the bot, sorry!")
			return false
		}

        const arg = message.content.slice(prefix.length).trim().split(/ +/);
        if (arg[1] == null) {
            const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
				.setTitle(`${prefix}${command}`)
				.setDescription(`(Args <Character Name> "<Transformaton Name>" <Requirement> <HP Buff> <Strength Buff> <Magic Buff> <Perception Buff> <Endurance Buff> <Charisma Buff> <Inteligence Buff> <Agility Buff> <Luck Buff>)\nEdits the stats and requirements of a transformation.`)
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
			let BST = 0;
			for (i = 5; i <= 12; i++)
				BST += Math.max(0, parseInt(arg[i]));
			if (BST > 15)
				return message.channel.send(`<:warning:878094052208296007>${BST} is more than 15. 15 is the Maximum for Transformations.`);
		}
		
		let charPath = dataPath+'/characters.json'
		let charRead = fs.readFileSync(charPath, {flag: 'as+'});
		let charFile = JSON.parse(charRead);
		
		if (!charFile[arg[1]])
			return message.channel.send(`${arg[1]} is an invalid character.`);
		
		let charDefs = charFile[arg[1]]
		
		if (!charDefs.transformations[arg[1]])
			return message.channel.send(`${arg[2]} is an invalid transformation for ${arg[1]}.`)

		let reqTable = ['allydown', 'onlystanding', 'belowhalfhp', 'outofmp', 'leaderdown', 'trusteddown']

		if (!arg[3])
			return message.channel.send('Please specify a requirement value (See with no arguments)')
		
		if (arg[3].toLowerCase()) {
			let validArg;
			let argument = arg[3].toLowerCase()
		
			for (const i in reqTable) {
				if (reqTable[i] && argument == reqTable[i].toLowerCase()) {
					validArg = true;
					break
				}
			}
			
			if (!validArg)
				return message.channel.send('Please specify a valid requirement value (See with no arguments)');
		}

		let name = message.content.slice(prefix.length).trim().split('"');
		if (!name[1])
			return message.channel.send('Please surround the transformation name in Quotation Marks ("")');

        charDefs.transformation[arg[2]].name = name;
		charDefs.transformation[arg[2]].requirement = arg[3].toLowerCase();
		charDefs.transformation[arg[2]].hp = parseInt(arg[4]);
		charDefs.transformation[arg[2]].atk = parseInt(arg[5]);
		charDefs.transformation[arg[2]].mag = parseInt(arg[6]);
		charDefs.transformation[arg[2]].prc = parseInt(arg[7]);
		charDefs.transformation[arg[2]].end = parseInt(arg[8]);
		charDefs.transformation[arg[2]].chr = parseInt(arg[9]);
		charDefs.transformation[arg[2]].int = parseInt(arg[10]);
		charDefs.transformation[arg[2]].agl = parseInt(arg[11]);
		charDefs.transformation[arg[2]].luk = parseInt(arg[12]);
		fs.writeFileSync(charPath, JSON.stringify(charFile, null, '    '));

		if (charDefs.transformations[arg[2]]) {
			let transDefs = charDefs.transformations[arg[2]]

            const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#f2c055')
				.setTitle(`${charDefs.name}'s ${transDefs.name} Transformation's Stats:`)
                .setDescription(`${transDefs.hp}HP++\n\n${transDefs.atk}ATK++\n${transDefs.mag}MAG++\n${transDefs.prc}PRC++\n${transDefs.end}END++\n${transDefs.chr}CHR++\n${transDefs.int}INT++\n${transDefs.agl}AGL++\n${transDefs.luk}LUK++`)
            message.channel.send({content: `👍 ${charDefs.name}'s ${transDefs.name} transformation has been edited!`, embeds: [DiscordEmbed]});
        } else
            return message.channel.send('Something went wrong... try again, maybe?');
    }

    if (command === 'nickname') {
		if (utilityFuncs.isBanned(message.author.id, message.guild.id) && !utilityFuncs.RPGBotAdmin(message.author.id))
			return message.channel.send("I've been told you were banned from using the RPG sections of the bot, sorry!");

        const arg = message.content.slice(prefix.length).trim().split(/ +/);
        if (arg[1] == null) {
            const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#4b02c9')
				.setTitle(`${prefix}nickname`)
				.setDescription(`(Args <Name> "<Nickname>")\nSets this character's nickname. This is mostly cosmetic and basically serves no purpose.`)
            return message.channel.send({embeds: [DiscordEmbed]})
        }

		let charPath = dataPath+'/characters.json'
		let charRead = fs.readFileSync(charPath, {flag: 'as+'});
		let charFile = JSON.parse(charRead);

        if (charFile[arg[1]]) {
			const charDefs = charFile[arg[1]]
            if (!utilityFuncs.RPGBotAdmin(message.author.id)) {
                if (charDefs.owner && message.author.id != charDefs.owner) {
                    message.channel.send("You can't edit someone else's character!")
                    return false
                }
            }

			if (!arg[2])
				return message.channel.send("You're missing a 2nd argument.")

			let quotationMarks = message.content.slice(prefix.length).trim().split('"')[1]
			charDefs.nickname = quotationMarks

			message.channel.send(`👍 ${arg[1]}'s nickname is set to ${quotationMarks}`);
			fs.writeFileSync(charPath, JSON.stringify(charFile, null, '    '));
        } else
            return message.channel.send(`${arg[1]} isn't a valid character.`);
    }

    if (command === 'hidechar') {
		if (utilityFuncs.isBanned(message.author.id, message.guild.id) && !utilityFuncs.RPGBotAdmin(message.author.id))
			return message.channel.send("I've been told you were banned from using the RPG sections of the bot, sorry!");

        const arg = message.content.slice(prefix.length).trim().split(/ +/);
        if (arg[1] == null) {
            const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#4b02c9')
				.setTitle(`${prefix}hidechar`)
				.setDescription("(Args <Name>)\nHides your character from being pulled in any random generators, and being listed with skill commands.")
            return message.channel.send({embeds: [DiscordEmbed]})
        }

		let charPath = dataPath+'/characters.json'
		let charRead = fs.readFileSync(charPath, {flag: 'as+'});
		let charFile = JSON.parse(charRead);

        if (charFile[arg[1]]) {
			const charDefs = charFile[arg[1]]
            if (!utilityFuncs.RPGBotAdmin(message.author.id)) {
                if (charDefs.owner && message.author.id != charDefs.owner) {
                    message.channel.send("You can't edit someone else's character!")
                    return false
                }
            }

			charDefs.hidden = !charDefs.hidden

			message.channel.send(`👍 ${arg[1]}'s invisibility has been toggled to ${charDefs.hidden}.`);
			fs.writeFileSync(charPath, JSON.stringify(charFile, null, '    '));
        } else
            return message.channel.send(`${arg[1]} isn't a valid character.`);
    }

    if (command === 'mpmeter') {
		if (utilityFuncs.isBanned(message.author.id, message.guild.id) && !utilityFuncs.RPGBotAdmin(message.author.id))
			return message.channel.send("I've been told you were banned from using the RPG sections of the bot, sorry!");

        const arg = message.content.slice(prefix.length).trim().split(/ +/);
        if (arg[1] == null) {
            const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#4b02c9')
				.setTitle(`${prefix}mpmeter`)
				.setDescription("(Args <Name> <Meter Name> <Abreviated>)\nSets this character's MP meter to something else. There is no use for this and it is purely cosmetic.")
            return message.channel.send({embeds: [DiscordEmbed]})
        }

		let charPath = dataPath+'/characters.json'
		let charRead = fs.readFileSync(charPath, {flag: 'as+'});
		let charFile = JSON.parse(charRead);

        if (charFile[arg[1]]) {
			const charDefs = charFile[arg[1]]
            if (!utilityFuncs.RPGBotAdmin(message.author.id)) {
                if (charDefs.owner && message.author.id != charDefs.owner) {
                    message.channel.send("You can't edit someone else's character!")
                    return false
                }
            }

			if (!arg[2])
				return message.channel.send("You're missing a 2nd argument.")

			if (!arg[3])
				return message.channel.send("You're missing a 3rd argument.")

			charDefs.mpMeter = [arg[2], arg[3].toUpperCase()]

			message.channel.send(`👍 ${arg[1]}'s MP meter was changed to a ${arg[3].toUpperCase()} meter. ${arg[1]} uses ${arg[2]} now.`);
			fs.writeFileSync(charPath, JSON.stringify(charFile, null, '    '));
        } else
            return message.channel.send(`${arg[1]} isn't a valid character.`);
    }

    if (command === 'mainelement') {
		if (utilityFuncs.isBanned(message.author.id, message.guild.id) && !utilityFuncs.RPGBotAdmin(message.author.id))
			return message.channel.send("I've been told you were banned from using the RPG sections of the bot, sorry!");

        const arg = message.content.slice(prefix.length).trim().split(/ +/);
        if (arg[1] == null) {
            const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#4b02c9')
				.setTitle(`${prefix}mainelement`)
				.setDescription("(Args <Name> <Element>)\nSets this character's main element, therefore giving it a slight power buff.")
            return message.channel.send({embeds: [DiscordEmbed]})
        }

		let charPath = dataPath+'/characters.json'
		let charRead = fs.readFileSync(charPath, {flag: 'as+'});
		let charFile = JSON.parse(charRead);
		let enmPath = dataPath+'/Enemies/enemies-' + message.guild.id + '.json'
		let enmRead = fs.readFileSync(enmPath, {flag: 'as+'});
		let enmFile = JSON.parse(enmRead);
		
		if (!enmFile[message.guild.id]) {
			enmFile[message.guild.id] = {}
			fs.writeFileSync(enmPath, JSON.stringify(enmFile, null, '    '));
		}

        if (charFile[arg[1]] || enmFile[message.guild.id][arg[1]]) {
			const charDefs = charFile[arg[1]] ? charFile[arg[1]] : enmFile[message.guild.id][arg[1]]
            if (!utilityFuncs.RPGBotAdmin(message.author.id)) {
                if ((charDefs.owner && message.author.id != charDefs.owner) || (charDefs.creator && message.author.id != charDefs.creator && !message.member.permissions.serialize().ADMINISTRATOR)) {
                    message.channel.send("You can't edit someone else's character!")
                    return false
                }
            }

			if (!arg[2])
				return message.channel.send("You're missing a 2nd argument.")

			if (!utilityFuncs.validType(arg[2].toLowerCase()))
				return message.channel.send(`${arg[2]} is an invalid element.`)
			
			if (arg[2].toLowerCase() === 'almighty' || arg[2].toLowerCase() === 'passive')
				return message.channel.send(`${arg[2]} can't be used!`)

			charDefs.mainElement = arg[2].toLowerCase()

			message.channel.send(`👍 ${arg[1]}'s main element is set to ${arg[2]}`);
			fs.writeFileSync(charPath, JSON.stringify(charFile, null, '    '));
        } else
            return message.channel.send(`${arg[1]} isn't a valid character.`);
    }

    if (command === 'setaffinity') {
		if (utilityFuncs.isBanned(message.author.id, message.guild.id) && !utilityFuncs.RPGBotAdmin(message.author.id)) {
			message.channel.send("I've been told you were banned from using the RPG sections of the bot, sorry!")
			return false
		}

        const arg = message.content.slice(prefix.length).trim().split(/ +/);

		let charPath = dataPath+'/characters.json'
		let charRead = fs.readFileSync(charPath, {flag: 'as+'});
		let charFile = JSON.parse(charRead);
		let enmPath = dataPath+'/Enemies/enemies-' + message.guild.id + '.json'
		let enmRead = fs.readFileSync(enmPath, {flag: 'as+'});
		let enmFile = JSON.parse(enmRead);

        if (charFile[arg[1]] || enmFile[message.guild.id][arg[1]]) {
			const charDefs = charFile[arg[1]] ? charFile[arg[1]] : enmFile[message.guild.id][arg[1]]
            if (!utilityFuncs.RPGBotAdmin(message.author.id)) {
                if ((charDefs.owner && message.author.id != charDefs.owner) || (charDefs.creator && message.author.id != charDefs.creator && !message.member.permissions.serialize().ADMINISTRATOR)) {
                    message.channel.send("You can't edit someone else's character!")
                    return false
                }
            }
			
			if (!arg[2])
				message.channel.send('Please, specify the element.');
			
			if (!utilityFuncs.validType(arg[2].toLowerCase()))
				return message.channel.send(`${arg[2].toLowerCase()} isn't a valid element.`);
			
			if (arg[2].toLowerCase() == 'almighty')
				return message.channel.send("You can't set almighty affinities!")

			if (!arg[3])
				return message.channel.send('Specify the affinity.\nTry one of the following:```diff\n- Weak\n- Resist\n- Block\n- Repel\n- Drain\n- None```');

            if (arg[3].toLowerCase() == "normal" || arg[3].toLowerCase() == "weak" || arg[3].toLowerCase() == "superweak" || arg[3].toLowerCase() == "resist" || arg[3].toLowerCase() == "block" || arg[3].toLowerCase() == "repel" || arg[3].toLowerCase() == "drain") {
                writeAffinity(charDefs, arg[2].toLowerCase(), arg[3].toLowerCase())
                message.channel.send(`👍 ${arg[1]}'s affinity towards ${arg[2]} is now ${arg[3]}`);
				
				fs.writeFileSync(charPath, JSON.stringify(charFile, null, '    '));
				fs.writeFileSync(enmPath, JSON.stringify(enmFile, null, '    '));
            } else {
                message.channel.send("This isn't a valid affinity! Try:`'weak' 'resist' 'block' 'repel' 'drain'")
            }
        } else {
            message.channel.send(`${arg[1]} isn't a valid character.`);
        }
    }

    if (command === 'trustxp') {
		if (utilityFuncs.isBanned(message.author.id, message.guild.id) && !utilityFuncs.RPGBotAdmin(message.author.id)) {
			message.channel.send("I've been told you were banned from using the RPG sections of the bot, sorry!")
			return false
		}

        const arg = message.content.slice(prefix.length).trim().split(/ +/);
		
		let charPath = dataPath+'/characters.json'
		let charRead = fs.readFileSync(charPath, {flag: 'as+'});
		let charFile = JSON.parse(charRead);
		if (charFile[arg[1]] && charFile[arg[2]]) {
			if (parseInt(arg[3]) > 999999) message.channel.send('The value added was lowered to 999999, as adding too much at one time would slow me down!');

			charFuncs.trustUp(charFile[arg[1]], charFile[arg[2]], Math.min(999999, parseInt(arg[3])), message.guild.id, client)
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

            if (arg[2])
                giveXP(charName, Math.min(99999999, parseInt(arg[2])), message);
            else
                return message.channel.send(`XP not defined.`);
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
		let charPath = dataPath+'/characters.json'
		let charRead = fs.readFileSync(charPath, {flag: 'as+'});
		let charFile = JSON.parse(charRead);

        if (charFile[arg[1]]) {
			let charDefs = charFile[arg[1]];
            if (!utilityFuncs.RPGBotAdmin(message.author.id)) {
                if (message.author.id != charDefs.owner) {
                    message.channel.send("You can't edit someone else's character!")
                    return false
                }
            }

			let lvlQuote = ""
			if (charDefs.lvlquote && charDefs.lvlquote.length > 0) {
				let possibleQuote = Math.round(Math.random() * (charDefs.lvlquote.length-1))
				lvlQuote = `*${arg[1]}: "${charDefs.lvlquote[possibleQuote]}"*\n\n`
			}

            if (arg[2] && parseInt(arg[2]) > 1) {
				if (parseInt(arg[2]) > 99)
					return message.channel.send("That's too many level ups!");

				for (i = 1; i <= parseInt(arg[2]); i++) {
					charDefs.xp = charDefs.maxxp
					charFuncs.lvlUp(charDefs, false, message.guild.id);
				}
				
				const DiscordEmbed = new Discord.MessageEmbed()
					.setColor('#b4eb34')
					.setTitle(`👍 ${arg[1]} levelled up ${parseInt(arg[2])} times!`)
					.setDescription(`${lvlQuote}Level ${charDefs.level}\n${charDefs.maxhp}HP\n${charDefs.maxmp}MP\n\n${charDefs.atk}ATK\n${charDefs.mag}MAG\n${charDefs.prc}PRC\n${charDefs.end}END\n${charDefs.chr}CHR\n${charDefs.int}INT\n${charDefs.agl}AGL\n${charDefs.luk}LUK`)
				message.channel.send({embeds: [DiscordEmbed]})
            } else {
				charDefs.xp = charDefs.maxxp
                charFuncs.lvlUp(charDefs, false, message.guild.id);
				
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

    if (command === 'leveldown') {
		if (utilityFuncs.isBanned(message.author.id, message.guild.id) && !utilityFuncs.RPGBotAdmin(message.author.id)) {
			message.channel.send("I've been told you were banned from using the RPG sections of the bot, sorry!")
			return false
		}

        const arg = message.content.slice(prefix.length).trim().split(/ +/);
		let charPath = dataPath+'/characters.json'
		let charRead = fs.readFileSync(charPath, {flag: 'as+'});
		let charFile = JSON.parse(charRead);

        if (charFile[arg[1]]) {
			let charDefs = charFile[arg[1]];
            if (!utilityFuncs.RPGBotAdmin(message.author.id)) {
                if (message.author.id != charDefs.owner) {
                    message.channel.send("You can't edit someone else's character!")
                    return false
                }
            }

            if (arg[2] && parseInt(arg[2]) > 1) {
				for (i = 1; i <= parseInt(arg[2]); i++) {
					charDefs.xp = 0
					charFuncs.lvlDown(charDefs, message.guild.id);
				}

				const DiscordEmbed = new Discord.MessageEmbed()
					.setColor('#b4eb34')
					.setTitle(`👍 ${arg[1]} levelled down ${parseInt(arg[2])} times!`)
					.setDescription(`Level ${charDefs.level}\n${charDefs.maxhp}HP\n${charDefs.maxmp}MP\n\n${charDefs.atk}ATK\n${charDefs.mag}MAG\n${charDefs.prc}PRC\n${charDefs.end}END\n${charDefs.chr}CHR\n${charDefs.int}INT\n${charDefs.agl}AGL\n${charDefs.luk}LUK`)
				message.channel.send({embeds: [DiscordEmbed]})
            } else {
				charDefs.xp = 0
                charFuncs.lvlDown(charDefs, message.guild.id);
				
				const DiscordEmbed = new Discord.MessageEmbed()
					.setColor('#b4eb34')
					.setTitle(`👍 ${arg[1]} levelled down!`)
					.setDescription(`Level ${charDefs.level}\n${charDefs.maxhp}HP\n${charDefs.maxmp}MP\n\n${charDefs.atk}ATK\n${charDefs.mag}MAG\n${charDefs.prc}PRC\n${charDefs.end}END\n${charDefs.chr}CHR\n${charDefs.int}INT\n${charDefs.agl}AGL\n${charDefs.luk}LUK`)
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
		let charPath = dataPath+'/characters.json'
		let charRead = fs.readFileSync(charPath, {flag: 'as+'});
		let charFile = JSON.parse(charRead);
		let enmPath = dataPath+'/Enemies/enemies-' + message.guild.id + '.json'
		let enmRead = fs.readFileSync(enmPath, {flag: 'as+'});
		let enmFile = JSON.parse(enmRead);

        if (charFile[arg[1]] || enmFile[message.guild.id][arg[1]]) {
			const charDefs = charFile[arg[1]] ? charFile[arg[1]] : enmFile[message.guild.id][arg[1]]
            if (!utilityFuncs.RPGBotAdmin(message.author.id)) {
                if ((charDefs.owner && message.author.id != charDefs.owner) || (charDefs.creator && message.author.id != charDefs.creator && !message.member.permissions.serialize().ADMINISTRATOR)) {
                    message.channel.send("You can't edit someone else's character!")
                    return false
                }
            }

            if (arg[2] && arg[3] && utilityFuncs.validType(arg[3].toLowerCase())) {
				let type = arg[3].toLowerCase()
				if (type != 'strike' && type != 'slash' && type != 'pierce')
					return message.channel.send('You can only have "Strike", "Slash" or "Pierce" type melee skills.');
	
                writeMelee(charDefs, arg[2], arg[3].toLowerCase())
				fs.writeFileSync(charPath, JSON.stringify(charFile, null, '    '));
				fs.writeFileSync(enmPath, JSON.stringify(enmFile, null, '    '));
                message.channel.send(`👍 ${arg[1]}'s Melee Skill was changed to ${arg[2]} with the type of ${arg[3]}.`);
            } else {
                message.channel.send(`You need to define a Melee Skill and it's type!`);
            }
        } else
            return message.channel.send(`${arg[1]} isn't a valid entity.`);
    }

    if (command === 'learnskill') {
		if (utilityFuncs.isBanned(message.author.id, message.guild.id) && !utilityFuncs.RPGBotAdmin(message.author.id))
			return message.channel.send("I've been told you were banned from using the RPG sections of the bot, sorry!");

        const arg = message.content.slice(prefix.length).trim().split(/ +/);
        if (arg[1] == null) {
            const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#4b02c9')
				.setTitle(`${prefix}learnskill`)
				.setDescription('(Args <Name> <Skill> <Skill 2> <...>)\nAllow characters to learn new skills.')
            return message.channel.send({embeds: [DiscordEmbed]})
        }

		let charPath = dataPath+'/characters.json'
		let charRead = fs.readFileSync(charPath, {flag: 'as+'});
		let charFile = JSON.parse(charRead);
		let enmPath = dataPath+'/Enemies/enemies-' + message.guild.id + '.json'
		let enmRead = fs.readFileSync(enmPath, {flag: 'as+'});
		let enmFile = JSON.parse(enmRead);
		
		let wasEnemy = false
		
		if (!enmFile[message.guild.id]) {
			enmFile[message.guild.id] = {}
			fs.writeFileSync(enmPath, JSON.stringify(enmFile, null, '    '));
		}

        if (charFile[arg[1]] || enmFile[message.guild.id][arg[1]]) {
			const charDefs = charFile[arg[1]] ? charFile[arg[1]] : enmFile[message.guild.id][arg[1]]
            if (!utilityFuncs.RPGBotAdmin(message.author.id)) {
                if ((charDefs.owner && message.author.id != charDefs.owner) || (charDefs.creator && message.author.id != charDefs.creator && !message.member.permissions.serialize().ADMINISTRATOR)) {
                    message.channel.send("You can't edit someone else's character!")
                    return false
                }
            }
			
			if (charDefs.owner)
				wasEnemy = false;
			else if (charDefs.creator)
				wasEnemy = true;

			let skillPath = dataPath+'/skills.json'
			let skillRead = fs.readFileSync(skillPath, {flag: 'as+'});
			let skillFile = JSON.parse(skillRead);
			let learnString = `👍 ${arg[1]} learned `
			
			let skillLearn = []
			let setAutoLearn = []

			for (let i = 2; i < arg.length; i++) {
				if (i > 1) {
					if (charFuncs.knowsSkill(charDefs, arg[i]))
						return message.channel.send(`${arg[1]} already knows ${arg[i]}!`);

					if (skillFile[arg[i]]) {
						if (!wasEnemy && skillFile[arg[i]].levelLock && charDefs.level < skillFile[arg[i]].levelLock) {
							if (skillFile[arg[i]].levelLock < 100)
								return message.channel.send(`${charDefs.name} is level ${charDefs.level}, however, they must be at level ${skillFile[arg[i]].levelLock} to know this skill.`)
							else
								return message.channel.send(`${charDefs.name} cannot learn this skill.`)
						}

						learnString += (skillFile[arg[i]].name ? skillFile[arg[i]].name : arg[i])
						charDefs.skills.push(arg[i])
						skillLearn.push(arg[i])

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

			if (!charDefs.creator && charDefs.skills.length > 8)
				return message.channel.send("You cannot have more than 8 skills!");
			
			for (const i in charDefs.skills) {
				for (const k in skillLearn) {
					if (skillLearn[k] == charDefs.skills[i])
						setAutoLearn.push(i)
				}
			}

			fs.writeFileSync(charPath, JSON.stringify(charFile, null, '    '));
			fs.writeFileSync(enmPath, JSON.stringify(enmFile, null, '    '));

			if (!charDefs.creator) {
				message.channel.send(`${learnString}\nDo you want to set these skills to be automatically upgraded with ${prefix}evoskill? (Yes/Y/No/N)`);

				var givenResponce = false
				var collector = message.channel.createMessageCollector({ time: 15000 });
				collector.on('collect', m => {
					if (m.author.id == message.author.id) {
						givenResponce = true
						collector.stop()

						for (const i in skillLearn) {
							for (const k in charDefs.skills) {
								if (skillLearn[i] == charDefs.skills[k]) {
									setAutoLearn.push(k);
									continue;
								}
							}
						}

						if (m.content.toLowerCase() == 'yes' || m.content.toLowerCase() == 'y') {							
							if (setAutoLearn.length > 0) {
								if (!charDefs.autoLearn)
									charDefs.autoLearn = {};
								
								for (const i in setAutoLearn)
									charDefs.autoLearn[setAutoLearn[i]] = true;
								
								message.channel.send('These skills will automatically be learned when applicable.')
								fs.writeFileSync(charPath, JSON.stringify(charFile, null, '    '));
								fs.writeFileSync(enmPath, JSON.stringify(enmFile, null, '    '));
							}
						} else {
							message.channel.send('These skills will not be automatically be learned when applicable.')

							if (charDefs.autoLearn) {
								for (const i in setAutoLearn)
									delete charDefs.autoLearn[setAutoLearn[i]];
							}
						}
					}
				});
				collector.on('end', c => {
					if (givenResponce == false) {
						message.channel.send('No response given. These skills will not be automatically be learned when applicable.')
						sendTurnBrief(btl, message.channel)
					}
				});
			} else {
				message.channel.send(learnString)
			}
        } else
            return message.channel.send(`${arg[1]} isn't a valid entity.`);
    }
	
    if (command === 'replaceskill') {
		if (utilityFuncs.isBanned(message.author.id, message.guild.id) && !utilityFuncs.RPGBotAdmin(message.author.id))
			return message.channel.send("I've been told you were banned from using the RPG sections of the bot, sorry!");

        let arg = message.content.slice(prefix.length).trim().split(/ +/);
        let charPath = dataPath+'/characters.json'
        let charRead = fs.readFileSync(charPath, {flag: 'as+'});
        let charFile = JSON.parse(charRead);
		let enmPath = dataPath+'/Enemies/enemies-' + message.guild.id + '.json'
		let enmRead = fs.readFileSync(enmPath, {flag: 'as+'});
		let enmFile = JSON.parse(enmRead);

        if (charFile[arg[1]] || enmFile[message.guild.id][arg[1]]) {
			const charDefs = charFile[arg[1]] ? charFile[arg[1]] : enmFile[message.guild.id][arg[1]]
            if (!utilityFuncs.RPGBotAdmin(message.author.id)) {
                if ((charDefs.owner && message.author.id != charDefs.owner) || (charDefs.creator && message.author.id != charDefs.creator && !message.member.permissions.serialize().ADMINISTRATOR)) {
                    message.channel.send("You can't edit someone else's character!")
                    return false
                }
            }
			
			if (!charFuncs.knowsSkill(charDefs, arg[2]))
				return message.channel.send(`${arg[1]} doesn't know this skill!`);
			
			if (!readSkill(arg[3]))
				return message.channel.send(`${arg[3]} is an invalid skill.`);
			
			let wasEnemy = false
			if (charDefs.owner)
				wasEnemy = false;
			else if (charDefs.creator)
				wasEnemy = true;
			
			let skillDefs = readSkill(arg[3]);
			if (!wasEnemy && skillDefs.levelLock && charDefs.level < skillDefs.levelLock) {
				if (skillDefs.levelLock < 100)
					return message.channel.send(`${charDefs.name} is level ${charDefs.level}, however, they must be at level ${skillDefs.levelLock} to know this skill.`)
				else
					return message.channel.send(`${charDefs.name} cannot learn this skill.`)
			}
			
			// Now replace the skill.
			let setAutoLearn = 0
			for (const i in charDefs.skills) {
				if (charDefs.skills[i] === arg[2]) {
					charDefs.skills[i] = arg[3];
					setAutoLearn = i;
					break
				}
			}

			fs.writeFileSync(charPath, JSON.stringify(charFile, null, '    '));
			fs.writeFileSync(enmPath, JSON.stringify(enmFile, null, '    '));

			if (!charDefs.creator) {
				message.channel.send(`👍\nDo you want to set this skill to be automatically upgraded with ${prefix}evoskill? (Yes/Y/No/N)`);

				var collector = message.channel.createMessageCollector({ time: 15000 });
				collector.on('collect', m => {
					if (m.author.id == message.author.id) {
						givenResponce = true
						collector.stop()

						if (m.content.toLowerCase() == 'yes' || m.content.toLowerCase() == 'y') {							
							charDefs.autoLearn[setAutoLearn] = true;

							message.channel.send('This skill will automatically be learned when applicable.')
							fs.writeFileSync(charPath, JSON.stringify(charFile, null, '    '));
							fs.writeFileSync(enmPath, JSON.stringify(enmFile, null, '    '));
						} else {
							message.channel.send('This skill will not be automatically be learned when applicable.')

							if (charDefs.autoLearn)
								delete charDefs.autoLearn[setAutoLearn];
						}
					}
				});
				collector.on('end', c => {
					if (givenResponce == false) {
						message.channel.send('No response given. These skills will not be automatically be learned when applicable.')
						sendTurnBrief(btl, message.channel)
					}
				});
			} else {
				message.channel.send('👍')
			}
		} else {
			message.channel.send('Invalid entity.')
		}
	}
	
    if (command === 'autolearn') {
		if (utilityFuncs.isBanned(message.author.id, message.guild.id) && !utilityFuncs.RPGBotAdmin(message.author.id))
			return message.channel.send("I've been told you were banned from using the RPG sections of the bot, sorry!");

        let arg = message.content.slice(prefix.length).trim().split(/ +/);
        let charPath = dataPath+'/characters.json'
        let charRead = fs.readFileSync(charPath, {flag: 'as+'});
        let charFile = JSON.parse(charRead);

        if (charFile[arg[1]]) {
			let charDefs = charFile[arg[1]];
            if (!utilityFuncs.RPGBotAdmin(message.author.id)) {
                if (message.author.id != charDefs.owner) {
                    message.channel.send("You can't edit someone else's character!")
                    return false
                }
            }
			
			if (!arg[2])
				return message.channel.send('No Skill Specified.')
			
			if (arg[2].toLowerCase() == 'all') {
				charDefs.autoLearn = {};
				for (const i in charDefs.skills)
					charDefs.autoLearn[i] = true;
			} else if (arg[2].toLowerCase() == 'none')
				charDefs.autoLearn = {};
			else {
				let autoLearn = -1
				for (const i in charDefs.skills) {
					if (charDefs.skills[i].toLowerCase() == arg[2].toLowerCase())
						autoLearn = i;
				}
				
				if (autoLearn <= -1)
					return message.channel.send(`${arg[1]} doesn't know this skill: ${arg[2]}`)
				
				if (!charDefs.autoLearn) {
					charDefs.autoLearn = {
						autoLearn: true
					}
				} else {
					charDefs.autoLearn[autoLearn] = true;
				}
			}

			message.react('👍');
			fs.writeFileSync(charPath, JSON.stringify(charFile, null, '    '));
		} else
			return message.channel.send(`${arg[1]} is an invalid character.`);
	}

    if (command === 'forgetskill') {
		if (utilityFuncs.isBanned(message.author.id, message.guild.id) && !utilityFuncs.RPGBotAdmin(message.author.id))
			return message.channel.send("I've been told you were banned from using the RPG sections of the bot, sorry!");

        let arg = message.content.slice(prefix.length).trim().split(/ +/);
        let charPath = dataPath+'/characters.json'
        let charRead = fs.readFileSync(charPath, {flag: 'as+'});
        let charFile = JSON.parse(charRead);
		let enmPath = dataPath+'/Enemies/enemies-' + message.guild.id + '.json'
		let enmRead = fs.readFileSync(enmPath, {flag: 'as+'});
		let enmFile = JSON.parse(enmRead);

        if (charFile[arg[1]] || enmFile[message.guild.id][arg[1]]) {
			const charDefs = charFile[arg[1]] ? charFile[arg[1]] : enmFile[message.guild.id][arg[1]]
            if (!utilityFuncs.RPGBotAdmin(message.author.id)) {
                if ((charDefs.owner && message.author.id != charDefs.owner) || (charDefs.creator && message.author.id != charDefs.creator && !message.member.permissions.serialize().ADMINISTRATOR)) {
                    message.channel.send("You can't edit someone else's character!")
                    return false
                }
            }
			
			if (!charFuncs.knowsSkill(charDefs, arg[2]))
				return message.channel.send(`${arg[1]} doesn't know this skill!`);
			
			// Now replace the skill.
			for (const i in charDefs.skills) {
				if (charDefs.skills[i] === arg[2]) {
					charDefs.skills.splice(i, 1);
					
					if (charDefs.autoLearn) {
						for (const j in charDefs.autoLearn) {
							if (parseInt(charDefs.autoLearn[j]) == i) {
								delete charDefs.autoLearn[j];
								continue;
							}

							if (parseInt(charDefs.autoLearn[j]) > i) {
								charDefs.autoLearn[j-1] = charDefs.autoLearn[j];
								delete charDefs.autoLearn[j];
							}
						}
					}

					break;
				}
			}

			fs.writeFileSync(charPath, JSON.stringify(charFile, null, '    '));
			fs.writeFileSync(enmPath, JSON.stringify(enmFile, null, '    '));
				
			message.channel.send(`👍 ${charDefs.name} forgot ${arg[2]}!`)
		} else {
			message.channel.send('Invalid entity.')
		}
	}
	
	// Leader Passive
    if (command === 'setleaderskill') {
		if (utilityFuncs.isBanned(message.author.id, message.guild.id) && !utilityFuncs.RPGBotAdmin(message.author.id)) {
			message.channel.send("I've been told you were banned from using the RPG sections of the bot, sorry!")
			return false
		}

        let arg = message.content.slice(prefix.length).trim().split(/ +/);
        let charPath = dataPath+'/characters.json'
        let charRead = fs.readFileSync(charPath, {flag: 'as+'});
        let charFile = JSON.parse(charRead);

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
				case "crit":
					if (!utilityFuncs.validType(arg[4].toLowerCase()) && arg[4].toLowerCase() != "heal" && arg[4].toLowerCase() != "magic" && arg[4].toLowerCase() != "physical")
						return message.channel.send('Invalid element.');
					
					if (arg[4].toLowerCase() === "magic" || arg[4].toLowerCase() === "physical") {
						if (parseInt(arg[5]) > 10) {
							return message.channel.send(`${arg[5]}% is too powerful for a leader skill like this!`)
						}
					} else {
						if (parseInt(arg[5]) > 30) {
							return message.channel.send(`${arg[5]}% is too powerful for a leader skill like this!`)
						}
					}

					if (parseInt(arg[5]) >= 100 || parseInt(arg[5]) <= 0)
						return message.channel.send(`${arg[5]} is an invalid % to ${arg[3].toLowerCase}!`)

					charDefs.leaderSkill = {
						name: arg[2],
						type: arg[3].toLowerCase(),
						target: arg[4].toLowerCase(),
						percent: parseFloat(arg[5])
					}

					break
				
				case "status":
					if (!utilityFuncs.validStatus(arg[4].toLowerCase()))
						return message.channel.send('Invalid status effect.');
					
					if (parseInt(arg[5]) > 10)
						return message.channel.send(`${arg[5]}% is too powerful for a leader skill like this!`);

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
					let input = arg[4].toLowerCase()
					if (input != 'atk' && input != 'end' && input != 'mag' && input != 'prc' && input != 'agl' && input != 'all')
						return message.channel.send('Invalid stat.');

					if (parseInt(arg[5]) > 3 || parseInt(arg[5]) <= 0)
						return message.channel.send(`${arg[5]} is an invalid amount to buff!`)

					charDefs.leaderSkill = {
						name: arg[2],
						type: arg[3].toLowerCase(),
						target: arg[4].toLowerCase(),
						percent: parseInt(arg[5])
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

        let arg = message.content.slice(prefix.length).trim().split(/ +/);
        let charPath = dataPath+'/characters.json'
        let charRead = fs.readFileSync(charPath, {flag: 'as+'});
        let charFile = JSON.parse(charRead);

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
            let charDefs = charFile[arg[1]]

            if (parseInt(arg[7]) == 1) {
                if (parseInt(arg[4]) < 100)
                    return message.channel.send('Limit Meter Requirement Must Be over 100%!');

				if (arg[8].toLowerCase() === 'heal') {
					if (parseInt(arg[3]) > 200)
						return message.channel.send('Limit Break power should be less than 200 for level 1 HEAL Class Limit Breaks.');
				} else {
					if (parseInt(arg[3]) > 400)
						return message.channel.send('Limit Break power should be less than 400 for level 1 ATK Class Limit Breaks.');
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
                if (parseInt(arg[4]) < 150)
                    return message.channel.send("Limit Meter Requirement Must Be over 150%!");

				if (arg[8].toLowerCase() === 'heal') {
					if (parseInt(arg[3]) > 300)
						return message.channel.send('Limit Break power should be less than 300 for level 2 HEAL Class Limit Breaks.');
				} else {
					if (parseInt(arg[3]) > 600)
						return message.channel.send('Limit Break power should be less than 600 for level 2 ATK Class Limit Breaks.');
				}

                let i;
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
                if (parseInt(arg[4]) < 200)
                    return message.channel.send("Limit Meter Requirement Must Be over 200%!");

				if (arg[8].toLowerCase() === 'heal') {
					if (parseInt(arg[3]) > 400)
						return message.channel.send('Limit Break power should be less than 400 for level 3 HEAL Class Limit Breaks.');
				} else {
					if (parseInt(arg[3]) > 800)
						return message.channel.send('Limit Break power should be less than 800 for level 3 ATK Class Limit Breaks.');
				}

                let i;
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
                if (parseInt(arg[4]) < 250)
                    return message.channel.send("Limit Meter Requirement Must Be over 250%!");

				if (arg[8].toLowerCase() === 'heal') {
					if (parseInt(arg[3]) > 9999)
						return message.channel.send('Limit Break power should be less than 9999 for level 4 HEAL Class Limit Breaks.');
				} else {
					if (parseInt(arg[3]) > 1000)
						return message.channel.send('Limit Break power should be less than 1000 for level 4 ATK Class Limit Breaks.');
				}

                let i;
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
		if (utilityFuncs.isBanned(message.author.id, message.guild.id) && !utilityFuncs.RPGBotAdmin(message.author.id))
			return message.channel.send("I've been told you were banned from using the RPG sections of the bot, sorry!");

        const arg = message.content.slice(prefix.length).trim().split(/ +/);

		let charPath = dataPath+'/characters.json'
		let charRead = fs.readFileSync(charPath, {flag: 'as+'});
		let charFile = JSON.parse(charRead);
		let enmPath = dataPath+'/Enemies/enemies-' + message.guild.id + '.json'
		let enmRead = fs.readFileSync(enmPath, {flag: 'as+'});
		let enmFile = JSON.parse(enmRead);

        if (charFile[arg[1]] || enmFile[message.guild.id][arg[1]]) {
			const charDefs = charFile[arg[1]] ? charFile[arg[1]] : enmFile[message.guild.id][arg[1]]
            if (!utilityFuncs.RPGBotAdmin(message.author.id)) {
                if ((charDefs.owner && message.author.id != charDefs.owner) || (charDefs.creator && message.author.id != charDefs.creator && !message.member.permissions.serialize().ADMINISTRATOR)) {
                    message.channel.send("You can't edit someone else's character!")
                    return false
                }
            }
			
			if (!charDefs.meleequote) {charDefs.meleequote = []}
			if (!charDefs.physquote) {charDefs.physquote = []}
			if (!charDefs.allyatkquote) {charDefs.allyatkquote = []}
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
			if (!charDefs.consolequote) {charDefs.consolequote = []}
			if (!charDefs.imfinequote) {charDefs.imfinequote = []}
			if (!charDefs.lvlquote) {charDefs.lvlquote = []}

			let quote = message.content.slice(prefix.length).trim().split('"');
			
			if (!quote[1]) {
				quote = message.content.slice(prefix.length).trim().split("'");
				
				if (!quote[1])
					return message.channel.send(`No quote supplied. Make sure you're using "" or '' instead of “”.`);
			}
			
			if (quote[1].length > 120)
				return message.channel.send('This quote is too long!');

			const quoteType = arg[2].toLowerCase();
			if (quoteType === "melee" || quoteType === "meleeattack") {
				charDefs.meleequote.push(quote[1]);
			} else if (quoteType === "phys" || quoteType === "physical" || quoteType ===  "physattack") {
				charDefs.physquote.push(quote[1]);
			} else if (quoteType === "allyatk" || quoteType === "allyattack" || quoteType ===  "allyassist") {
				charDefs.allyatkquote.push(quote[1]);
			} else if (quoteType === "mag" || quoteType === "magic" || quoteType ===  "magicattack") {
				charDefs.magquote.push(quote[1]);
			} else if (quoteType === "hitweak" || quoteType === "supereffective" || quoteType === "strong" || quoteType === "effective") {
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
			} else if (quoteType === "console" || quoteType === "check" || quoteType ===  "concern") {
				charDefs.consolequote.push(quote[1]);
			} else if (quoteType === "i'mfine" || quoteType === "imfine" || quoteType === "disreguard" || quoteType ===  "reassure") {
				charDefs.imfinequote.push(quote[1]);
			} else {
				message.channel.send("Invalid quote type! Try the following:```diff\n- Melee\n- Phys\n- Mag\n- SuperEffective\n- Crit\n- Hurt\n- Weakness\n- Resist\n- Block\n- Repel\n- Drain\n- Kill\n- Death\n- AllyDeath\n- Heal\n- Healed\n- Limitbreak\n- Lvlup```Have Fun!")
				return false
			}

            fs.writeFileSync(charPath, JSON.stringify(charFile, null, '    '));
            fs.writeFileSync(enmPath, JSON.stringify(enmFile, null, '    '));
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

		let charPath = dataPath+'/characters.json'
		let charRead = fs.readFileSync(charPath, {flag: 'as+'});
		let charFile = JSON.parse(charRead);
		let enmPath = dataPath+'/Enemies/enemies-' + message.guild.id + '.json'
		let enmRead = fs.readFileSync(enmPath, {flag: 'as+'});
		let enmFile = JSON.parse(enmRead);

        if (charFile[arg[1]] || enmFile[message.guild.id][arg[1]]) {
			const charDefs = charFile[arg[1]] ? charFile[arg[1]] : enmFile[message.guild.id][arg[1]]
            if (!utilityFuncs.RPGBotAdmin(message.author.id)) {
                if ((charDefs.owner && message.author.id != charDefs.owner) || (charDefs.creator && message.author.id != charDefs.creator && !message.member.permissions.serialize().ADMINISTRATOR)) {
                    message.channel.send("You can't edit someone else's character!")
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
			if (!charDefs.consolequote) {charDefs.consolequote = []}
			if (!charDefs.imfinequote) {charDefs.imfinequote = []}
			if (!charDefs.allyatkquote) {charDefs.allyatkquote = []}
			if (!charDefs.lvlquote) {charDefs.lvlquote = []}
			
			function handleQuote(t, a) {				
				if (a) {
					if (t[a]) {
						t.splice(parseInt(a), 1);
						message.react('👍')
					} else
						return message.channel.send("This Quote for this section doesn't exist!");
				} else {
					t = [];
					message.react('👍')
				}
			}

			const quoteType = arg[2].toLowerCase()
			if (quoteType === "melee" || quoteType === "meleeattack") {
				handleQuote(charDefs.meleequote, arg[3])
			} else if (quoteType === "phys" || quoteType === "physical" || quoteType ===  "physattack") {
				handleQuote(charDefs.physquote, arg[3]);
			} else if (quoteType === "mag" || quoteType === "magic" || quoteType ===  "magicattack") {
				handleQuote(charDefs.magquote, arg[3]);
			} else if (quoteType === "hitweak" || quoteType === "strong" || quoteType === "supereffective") {
				handleQuote(charDefs.strongquote, arg[3]);
			} else if (quoteType === "crit" || quoteType === "critical") {
				handleQuote(charDefs.critquote, arg[3]);
			} else if (quoteType === "weak" || quoteType === "weakness") {
				handleQuote(charDefs.weakquote, arg[3]);
			} else if (quoteType === "miss" || quoteType === "enemydodge" || quoteType ===  "huh?") {
				handleQuote(charDefs.missquote, arg[3]);
			} else if (quoteType === "dodge" || quoteType === "evade") {
				handleQuote(charDefs.dodgequote, arg[3]);
			} else if (quoteType === "resist") {
				handleQuote(charDefs.resistquote, arg[3]);
			} else if (quoteType === "block") {
				handleQuote(charDefs.blockquote, arg[3]);
			} else if (quoteType === "repel") {
				handleQuote(charDefs.repelquote, arg[3]);
			} else if (quoteType === "drain") {
				handleQuote(charDefs.drainquote, arg[3]);
			} else if (quoteType === "hurt" || quoteType === "damaged" || quoteType === "hit" || quoteType === "punted" || quoteType === "smacked") {
				handleQuote(charDefs.hurtquote, arg[3]);
			} else if (quoteType === "kill" || quoteType === "murder" || quoteType ===  "win") {
				handleQuote(charDefs.killquote, arg[3]);
			} else if (quoteType === "death" || quoteType === "dead" || quoteType ===  "ded" || quoteType === "defeat") {
				handleQuote(charDefs.deathquote, arg[3]);
			} else if (quoteType === "allydeath" || quoteType === "allydead") {
				handleQuote(charDefs.allydeathquote, arg[3]);
			} else if (quoteType === "heal" || quoteType === "restore" || quoteType === "help") {
				handleQuote(charDefs.healquote, arg[3]);
			} else if (quoteType === "healed" || quoteType === "restored" || quoteType ===  "assisted" || quoteType ===  "helped") {
				handleQuote(charDefs.helpedquote, arg[3]);
			} else if (quoteType === "lb" || quoteType === "limitbreak" || quoteType ===  "limit") {
				handleQuote(charDefs.lbquote, arg[3]);
			} else if (quoteType === "lvl" || quoteType === "level" || quoteType ===  "lvlup" || quoteType ===  "levelup" || quoteType ===  "maxxp") {
				handleQuote(charDefs.lvlquote, arg[3]);
			} else if (quoteType === "console" || quoteType === "check" || quoteType ===  "concern") {
				handleQuote(charDefs.consolequote, arg[3]);
			} else if (quoteType === "i'mfine" || quoteType === "imfine" || quoteType === "disreguard" || quoteType ===  "reassure") {
				handleQuote(charDefs.imfinequote, arg[3]);
			} else if (quoteType === "allyatk" || quoteType === "allyattack" || quoteType ===  "allyassist") {
				handleQuote(charDefs.allyatkquote, arg[3]);
			} else {
				message.channel.send("Invalid quote type! Try the following:```diff\n- Melee\n- Phys\n- Mag\n- SuperEffective\n- Crit\n- Hurt\n- Weakness\n- Resist\n- Block\n- Repel\n- Drain\n- Kill\n- Death\n- Heal\n- Healed\n- Limitbreak\n- Lvlup```Have Fun!")
				return false
			}

            fs.writeFileSync(charPath, JSON.stringify(charFile, null, '    '));
            fs.writeFileSync(enmPath, JSON.stringify(enmFile, null, '    '));
        } else {
            message.channel.send(`${arg[1]} isn't a valid character.`);
        }
    }
	
	if (command === 'showquotes' || command === 'getquotes' || command === 'listquotes') {
        const arg = message.content.slice(prefix.length).trim().split(/ +/);

		let charPath = dataPath+'/characters.json'
		let charRead = fs.readFileSync(charPath, {flag: 'as+'});
		let charFile = JSON.parse(charRead);
		let enmPath = dataPath+'/Enemies/enemies-' + message.guild.id + '.json'
		let enmRead = fs.readFileSync(enmPath, {flag: 'as+'});
		let enmFile = JSON.parse(enmRead);

        if (charFile[arg[1]] || enmFile[message.guild.id][arg[1]]) {
			const charDefs = charFile[arg[1]] ? charFile[arg[1]] : enmFile[message.guild.id][arg[1]]

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
			
			let quoteText = {
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
				allyatk: "",
				console: "",
				imfine: "",
				lvl: ""
			}
			
			for (const i in charDefs.meleequote) quoteText.melee += `**${i}**: *"${charDefs.meleequote[i]}"*\n`
			for (const i in charDefs.physquote) quoteText.phys += `**${i}**: *"${charDefs.physquote[i]}"*\n`
			for (const i in charDefs.magquote) quoteText.mag += `**${i}**: *"${charDefs.magquote[i]}"*\n`
			for (const i in charDefs.strongquote) quoteText.weak += `**${i}**: *"${charDefs.strongquote[i]}"*\n`
			for (const i in charDefs.critquote) quoteText.crit += `**${i}**: *"${charDefs.critquote[i]}"*\n`
			for (const i in charDefs.weakquote) quoteText.weakness += `**${i}**: *"${charDefs.weakquote[i]}"*\n`
			for (const i in charDefs.missquote) quoteText.miss += `**${i}**: *"${charDefs.missquote[i]}"*\n`
			for (const i in charDefs.dodgequote) quoteText.dodge += `**${i}**: *"${charDefs.dodgequote[i]}"*\n`
			for (const i in charDefs.resistquote) quoteText.resist += `**${i}**: *"${charDefs.resistquote[i]}"*\n`
			for (const i in charDefs.blockquote) quoteText.block += `**${i}**: *"${charDefs.blockquote[i]}"*\n`
			for (const i in charDefs.repelquote) quoteText.repel += `**${i}**: *"${charDefs.repelquote[i]}"*\n`
			for (const i in charDefs.drainquote) quoteText.drain += `**${i}**: *"${charDefs.drainquote[i]}"*\n`
			for (const i in charDefs.hurtquote) quoteText.hurt += `**${i}**: *"${charDefs.hurtquote[i]}"*\n`
			for (const i in charDefs.killquote) quoteText.kill += `**${i}**: *"${charDefs.killquote[i]}"*\n`
			for (const i in charDefs.deathquote) quoteText.death += `**${i}**: *"${charDefs.deathquote[i]}"*\n`
			for (const i in charDefs.allydeathquote) quoteText.allydeath += `**${i}**: *"${charDefs.allydeathquote[i]}"*\n`
			for (const i in charDefs.lbquote) quoteText.lb += `**${i}**: *"${charDefs.lbquote[i]}"*\n`
			for (const i in charDefs.healquote) quoteText.heal += `**${i}**: *"${charDefs.healquote[i]}"*\n`
			for (const i in charDefs.helpedquote) quoteText.healed += `**${i}**: *"${charDefs.helpedquote[i]}"*\n`
			for (const i in charDefs.allyatkquote) quoteText.allyatk += `**${i}**: *"${charDefs.allyatkquote[i]}"*\n`
			for (const i in charDefs.consolequote) quoteText.console += `**${i}**: *"${charDefs.consolequote[i]}"*\n`
			for (const i in charDefs.imfinequote) quoteText.imfine += `**${i}**: *"${charDefs.imfinequote[i]}"*\n`
			for (const i in charDefs.lvlquote) quoteText.lvl += `**${i}**: *"${charDefs.lvlquote[i]}"*\n`
			
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
					.setDescription(`${quoteText.phys}`)
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
			} else if (quoteType === "allyatk" || quoteType === "allyattack" || quoteType ===  "allyassist") {
				const DiscordEmbed = new Discord.MessageEmbed()
					.setColor('#4b02c9')
					.setTitle(`${arg[1]}: Ally Attack`)
					.setDescription(`${quoteText.allyatk}`)
				message.channel.send({embeds: [DiscordEmbed]});
			} else if (quoteType === "console" || quoteType === "check" || quoteType ===  "concern") {
				const DiscordEmbed = new Discord.MessageEmbed()
					.setColor('#4b02c9')
					.setTitle(`${arg[1]}: Console or Concern`)
					.setDescription(`${quoteText.console}`)
				message.channel.send({embeds: [DiscordEmbed]});
			} else if (quoteType === "i'mfine" || quoteType === "imfine" || quoteType === "disreguard" || quoteType ===  "reassure") {
				const DiscordEmbed = new Discord.MessageEmbed()
					.setColor('#4b02c9')
					.setTitle(`${arg[1]}: Reassuring, "I'm fine."`)
					.setDescription(`${quoteText.imfine}`)
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
						{ name: 'Ally Attack', value: `${quoteText.allyatk}`, inline: true },
						{ name: 'Console & Concern', value: `${quoteText.console}`, inline: true },
						{ name: `Reassurance, "I'm fine."`, value: `${quoteText.imfine}`, inline: true },
						{ name: 'Level Up', value: `${quoteText.lvl}`, inline: true },
					)
				message.channel.send({embeds: [DiscordEmbed]});
				return false
			}
		}
	}
	
	if (command === 'randcharquote') {
        const arg = message.content.slice(prefix.length).trim().split(/ +/);
		let charPath = dataPath+'/characters.json'
		let charRead = fs.readFileSync(charPath, {flag: 'as+'});
		let charFile = JSON.parse(charRead);
		
		let quoteText = {
			melee: [],
			phys: [],
			mag: [],
			strong: [],
			crit: [],
			weak: [],
			miss: [],
			dodge: [],
			resist: [],
			block: [],
			repel: [],
			drain: [],
			hurt: [],
			kill: [],
			death: [],
			allydeath: [],
			lb: [],
			heal: [],
			healed: [],
			lvl: []
		}
		
		let possibleQuotes = []
		for (const i in quoteText) {
			for (const k in charFile) {
				if (!charFile[k].hidden && charFile[k][`${i}quote`] && charFile[k][`${i}quote`].length > 1) {
					possibleQuotes.push([k, i, charFile[k][`${i}quote`][utilityFuncs.randNum(charFile[k][`${i}quote`].length-1)]])
				}
			}
		}

		let quoteData = possibleQuotes[utilityFuncs.randNum(possibleQuotes.length-1)]   
		let randQuote = `"*${quoteData[2]}*"\n**${quoteData[0]}**, ${quoteData[1].toUpperCase()} Quote`;

		const DiscordEmbed = new Discord.MessageEmbed()
			.setColor('#4b02c9')
			.setTitle("Random Quote.")
			.setDescription(randQuote)
		message.channel.send({embeds: [DiscordEmbed]});
	}
	
	if (command === 'dailyquote') {
        const arg = message.content.slice(prefix.length).trim().split(/ +/);
		let preQuoteTxt = "Here's the daily quote for today, again.";

		if (!dailyQuote || dailyQuote == 'none' || dailyQuote == '') {
			let charPath = dataPath+'/characters.json'
			let charRead = fs.readFileSync(charPath, {flag: 'as+'});
			let charFile = JSON.parse(charRead);
			
			let quoteText = {
				melee: [],
				phys: [],
				mag: [],
				strong: [],
				crit: [],
				weak: [],
				miss: [],
				dodge: [],
				resist: [],
				block: [],
				repel: [],
				drain: [],
				hurt: [],
				kill: [],
				death: [],
				allydeath: [],
				lb: [],
				heal: [],
				healed: [],
				lvl: []
			}
			
			let possibleQuotes = []
			for (const i in quoteText) {
				for (const k in charFile) {
					if (!charFile[k].hidden && charFile[k][`${i}quote`] && charFile[k][`${i}quote`].length > 1) {
						possibleQuotes.push([k, i, charFile[k][`${i}quote`][utilityFuncs.randNum(charFile[k][`${i}quote`].length-1)]])
					}
				}
			}

			let quoteData = possibleQuotes[utilityFuncs.randNum(possibleQuotes.length-1)]   
			let harassedUser = client.users.fetch(charFile[quoteData[0]].owner)
			harassedUser.then(function(user) {
				preQuoteTxt = `${user}, your character is featured as the daily quote today!`;
			})

			dailyQuote = `"*${quoteData[2]}*"\n**${quoteData[0]}**, ${quoteData[1].toUpperCase()} Quote`;
		}

		setTimeout(function() {
			let today = new Date();
			let dd = String(today.getDate()).padStart(2, '0');
			let mm = String(today.getMonth() + 1).padStart(2, '0');
			let yyyy = today.getFullYear();

			today = mm + '/' + dd + '/' + yyyy;
			
			if (mm === '12' && dd === '24')
				today = 'Christmas Eve';
			else if (mm === '12' && dd === '25')
				today = 'Christmas';
			else if (mm === '12' && dd === '26')
				today = 'Boxing Day';
			else if (mm === '12' && dd === '31')
				today = "New Years' Eve";
			else if (mm === '1' && dd === '1')
				today = 'New Years';
			else if (mm === '4' && dd === '1')
				today = "April Fools' day";
			else if (mm === '4' && dd === '17' && yyyy == '2022')
				today = 'Easter (2022)';
			else if (mm === '6' && dd === '2')
				today = "<@516359709779820544>'s birthday";
			else if (mm === '10' && dd === '31')
				today = 'Halloween';

			const DiscordEmbed = new Discord.MessageEmbed()
				.setColor('#4b02c9')
				.setTitle("Daily quote, *" + today + "*")
				.setDescription(dailyQuote)
			message.channel.send({content: preQuoteTxt, embeds: [DiscordEmbed]});

			let quotePath = dataPath+'/dailyquote.txt'
			let quoteRead = fs.readFileSync(quotePath, {flag: 'as+'});

			quoteRead = dailyQuote
			fs.writeFileSync(quotePath, quoteRead);
		}, 2000)
	}

    if (command === 'setpet') {
		if (utilityFuncs.isBanned(message.author.id, message.guild.id) && !utilityFuncs.RPGBotAdmin(message.author.id))
			return message.channel.send("I've been told you were banned from using the RPG sections of the bot, sorry!");

        let arg = message.content.slice(prefix.length).trim().split(/ +/);
        if (arg[1] == null) {
            const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#4b02c9')
				.setTitle(`${prefix}${command}`)
				.setDescription("(Args <PartyName> <PetName>)\nSet's the party's current pet.\n\n*In battles, pets can move, ordered by the team leader, and pacify too. You can also switch pets mid-battle to achieve maximum efficiency with them. Pets aren't actually in the battle, and cannot die.*")
            return message.channel.send({embeds: [DiscordEmbed]})
        }

        let charPath = dataPath+'/characters.json'
        let charRead = fs.readFileSync(charPath, {flag: 'as+'});
        let charFile = JSON.parse(charRead);
		let btlPath = dataPath+'/Battles/battle-' + message.guild.id + '.json'
		let btlRead = fs.readFileSync(btlPath, {flag: 'as+'});
		let btl = JSON.parse(btlRead);

		if (!btl[message.guild.id].parties[arg[1]]) 
			return message.channel.send(`${arg[1]} is an invalid party.`)

		if (!btl[message.guild.id].parties[arg[1]].negotiateAllies) 
			return message.channel.send('There are no pets with this party.')

		if (!btl[message.guild.id].parties[arg[1]].negotiateAllies[arg[2]])
			return message.channel.send(`Team ${arg[1]} has not recruited a ${arg[2]} yet.`)

		btl[message.guild.id].parties[arg[1]].curPet = arg[2]
		fs.writeFileSync(btlPath, JSON.stringify(btl, null, '    '));
		
		message.channel.send(`${arg[2]} will now be carried on adventures with ${arg[1]}!`);
	}

    if (command === 'removepet' || command === 'returnpet') {
		if (utilityFuncs.isBanned(message.author.id, message.guild.id) && !utilityFuncs.RPGBotAdmin(message.author.id))
			return message.channel.send("I've been told you were banned from using the RPG sections of the bot, sorry!");

        let arg = message.content.slice(prefix.length).trim().split(/ +/);
        if (arg[1] == null) {
            const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#4b02c9')
				.setTitle(`${prefix}${command}`)
				.setDescription("(Args <PartyName>)\nRemoves the party's current pet.")
            return message.channel.send({embeds: [DiscordEmbed]})
        }

        let charPath = dataPath+'/characters.json'
        let charRead = fs.readFileSync(charPath, {flag: 'as+'});
        let charFile = JSON.parse(charRead);
		let btlPath = dataPath+'/Battles/battle-' + message.guild.id + '.json'
		let btlRead = fs.readFileSync(btlPath, {flag: 'as+'});
		let btl = JSON.parse(btlRead);

		if (!btl[message.guild.id].parties[arg[1]]) 
			return message.channel.send(`${arg[1]} is an invalid party.`)

		if (!btl[message.guild.id].parties[arg[1]].negotiateAllies) 
			return message.channel.send('There are no pets with this party.')

		if (!btl[message.guild.id].parties[arg[1]].curPet)
			return message.channel.send(`Team ${arg[1]} has no equipped pet yet.`)

		message.channel.send(`${arg[2]} steps back from the spot of group pet.`)
		message.delete()

		delete btl[message.guild.id].parties[arg[1]].curPet
		fs.writeFileSync(btlPath, JSON.stringify(btl, null, '    '));
	}
	
	if (command === 'setbioinfo') {
		if (utilityFuncs.isBanned(message.author.id, message.guild.id) && !utilityFuncs.RPGBotAdmin(message.author.id))
			return message.channel.send("I've been told you were banned from using the RPG sections of the bot, sorry!");

        const arg = message.content.slice(prefix.length).trim().split(/ +/);
        if (arg[1] == null) {
            const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#4b02c9')
				.setTitle(`${prefix}${command}`)
				.setDescription(`(Args <CharName> <Section> "<Value>" or <Value>)\nAllows <Value> to be displayed in <CharName>'s <Section> part of their bio.`)
            return message.channel.send({embeds: [DiscordEmbed]})
        }

        let charPath = dataPath+'/characters.json'
        let charRead = fs.readFileSync(charPath, {flag: 'as+'});
        let charFile = JSON.parse(charRead);

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
					gender: "other",
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
				} else if (bioSetting === "gender") {
					if (!arg[3])
						return message.channel.send('No gender supplied, please enter "Male", "Female" or "Other".');

					let gender = arg[3].toLowerCase()
					if (gender === 'male' || gender === 'female' || gender === 'other')
						charDefs.bio.gender = gender
					else
						return message.channel.send('Invalid gender. Please enter "Male", "Female" or "Other".')
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

    if (command === 'findcharm') {
		if (utilityFuncs.isBanned(message.author.id, message.guild.id) && !utilityFuncs.RPGBotAdmin(message.author.id))
			return message.channel.send("I've been told you were banned from using the RPG sections of the bot, sorry!");
        if (!message.member.permissions.serialize().ADMINISTRATOR)
            return message.channel.send('You lack sufficient permissions, apologies!');

        const arg = message.content.slice(prefix.length).trim().split(/ +/);
        if (arg[1] == null) {
            const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#4b02c9')
				.setTitle(`${prefix}${command}`)
				.setDescription('(Args <Name> <Charm>)\nThe specified character locates this charm and is able to use it.')
            return message.channel.send({embeds: [DiscordEmbed]})
        }

		let charPath = dataPath+'/characters.json'
		let charRead = fs.readFileSync(charPath, {flag: 'as+'});
		let charFile = JSON.parse(charRead);

        if (charFile[arg[1]]) {
			const charDefs = charFile[arg[1]]
            if (!utilityFuncs.RPGBotAdmin(message.author.id)) {
                if (charDefs.owner && message.author.id != charDefs.owner) {
                    message.channel.send("You can't edit someone else's character!")
					message.delete()
                    return false
                }
            }

			let hasCharm
			for (const i in charDefs.curCharms) {
				if (arg[2] && charDefs.curCharms[i] == arg[2])
					hasCharm = true;
			}
			
			if (hasCharm) {
				message.channel.send(`${arg[1]} already has ${arg[2]}!`);
				message.delete()
				return false
			}

			let charmPath = dataPath+'/charms.json'
			let charmRead = fs.readFileSync(charmPath, {flag: 'as+'});
			let charmFile = JSON.parse(charmRead);

			if (!charmFile[arg[2]]) {
				message.channel.send(`${arg[2]} is an invalid charm.`)
				message.delete()
				return false
			}

			charDefs.curCharms.push(arg[2])

			message.channel.send(`${arg[1]} found the ${charmFile[arg[2]].name} charm!`);
			fs.writeFileSync(charPath, JSON.stringify(charFile, null, '    '));
			
			message.delete()
        } else
            return message.channel.send(`${arg[1]} isn't a valid character.`);
    }

    if (command === 'equipcharm') {
		if (utilityFuncs.isBanned(message.author.id, message.guild.id) && !utilityFuncs.RPGBotAdmin(message.author.id))
			return message.channel.send("I've been told you were banned from using the RPG sections of the bot, sorry!");

        const arg = message.content.slice(prefix.length).trim().split(/ +/);
        if (arg[1] == null) {
            const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#4b02c9')
				.setTitle(`${prefix}${command}`)
				.setDescription('(Args <Name> <Charm>)\nLets this character use this charm if they have it.')
            return message.channel.send({embeds: [DiscordEmbed]})
        }

		let charPath = dataPath+'/characters.json'
		let charRead = fs.readFileSync(charPath, {flag: 'as+'});
		let charFile = JSON.parse(charRead);

        if (charFile[arg[1]]) {
			const charDefs = charFile[arg[1]]
            if (!utilityFuncs.RPGBotAdmin(message.author.id)) {
                if (charDefs.owner && message.author.id != charDefs.owner) {
                    message.channel.send("You can't edit someone else's character!")
                    return false
                }
            }

			let hasCharm
			for (const i in charDefs.curCharms) {
				if (arg[2] && charDefs.curCharms[i] == arg[2])
					hasCharm = true;
			}
			
			if (!hasCharm)
				return message.channel.send(`${arg[1]} does not have ${arg[2]}!`);

			let charmPath = dataPath+'/charms.json'
			let charmRead = fs.readFileSync(charmPath, {flag: 'as+'});
			let charmFile = JSON.parse(charmRead);

			if (!charmFile[arg[2]])
				return message.channel.send(`${arg[2]} is an invalid charm.`)
			
			let notches = 0
			for (const i in charDefs.charms)
				notches += charmFile[charDefs.charms[i]].notches
			
			notches += charmFile[arg[2]].notches
			
			if (notches > charFuncs.needNotches(charDefs.level))
				return message.channel.send(`${charDefs.name} can only use ${charFuncs.needNotches(charDefs.level)} notches! Using this charm would require ${notches} notches.`)

			charDefs.charms.push(arg[2])

			message.channel.send(`👍 ${arg[1]} equipped ${arg[2]}`);
			fs.writeFileSync(charPath, JSON.stringify(charFile, null, '    '));
        } else
            return message.channel.send(`${arg[1]} isn't a valid character.`);
    }
	
    if (command === 'listchars') {
        let charPath = dataPath+'/characters.json'
        let charRead = fs.readFileSync(charPath, {flag: 'as+'});
        let charFile = JSON.parse(charRead);
		
		let user = message.mentions.users.first() ? message.mentions.users.first() : null

		let charArray = []
        const arg = message.content.slice(prefix.length).trim().split(/ +/);
        if (!arg[2] || arg[2] === ' ' || arg[2] === 'null') {
			for (const i in charFile) {
				if (user) {
					if (charFile[i].owner === user.id) {
						if (!charFile[i].hidden) charArray.push(charFile[i]);
					}
				} else {
					if (!charFile[i].hidden) charArray.push(charFile[i]);
				}
			}

			sendCharArray(message.channel, charArray);
        } else {
			for (const i in charFile) {
				if (charFile[i].name && charFile[i].name.includes(arg[2])) {
					if (user) {
						if (charFile[i].owner === user.id) {
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

        let charPath = dataPath+'/characters.json';
        let charRead = fs.readFileSync(charPath, {flag: 'as+'});
        let charFile = JSON.parse(charRead);
		let skillPath = dataPath+'/skills.json';
		let skillRead = fs.readFileSync(skillPath, {flag: 'as+'});
		let skillFile = JSON.parse(skillRead);

        if (charFile[arg[1]]) {
            const charName = arg[1]
            const charDefs = utilityFuncs.cloneObj(charFile[arg[1]])

            let charSkills = ``;
            for (const i in charDefs.skills) {
				if (skillFile[charDefs.skills[i]]) {
					charSkills += `${elementEmoji[skillFile[charDefs.skills[i]].type]}${skillFile[charDefs.skills[i]].name ? skillFile[charDefs.skills[i]].name : charDefs.skills[i]}`;
					if (charDefs.autoLearn && charDefs.autoLearn[i])
						charSkills += '<:tick:918501752398020628>';
					charSkills += '\n'
				} else
					charSkills += '🛑Invalid Skill\n'
			}

            if (charSkills === ``)
				charSkills = "none";

            let charLBs = ``;
            for (i = 0; i <= 4; i++) {
                if (charDefs["lb" + i]) {
                    if (charDefs["lb" + i].name && charDefs["lb" + i].name.toLowerCase() != "none") {
						charLBs += `\n**${i}**:`
						let lbSkill = charDefs["lb" + i]

                        charLBs += `**${lbSkill.name}** *(${lbSkill.class ? lbSkill.class.toUpperCase() : "ATK"} Class)*\n**${(lbSkill.class === 'heal' && i >= 4) ? '∞' : lbSkill.pow}** Power, ${lbSkill.cost} LB%.`
						
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

            let charAffs = "";
            for (const i in charDefs.superweak) charAffs += `${elementEmoji[charDefs.superweak[i]]} <:supereffective:939053172528394252>\n`;
            for (const i in charDefs.weak) charAffs += `${elementEmoji[charDefs.weak[i]]} <:effective:876899270731628584>\n`;
            for (const i in charDefs.resist) charAffs += `${elementEmoji[charDefs.resist[i]]} <:resist:877132670784647238>\n`;
            for (const i in charDefs.block) charAffs += `${elementEmoji[charDefs.block[i]]} <:block:879801928282939452>\n`;
            for (const i in charDefs.repel) charAffs += `${elementEmoji[charDefs.repel[i]]} <:repel:879801953725595649>\n`;
            for (const i in charDefs.drain) charAffs += `${elementEmoji[charDefs.drain[i]]} <:drain:879801979138895904>\n`;
            if (charAffs === ``) charAffs = "None.";
			
			let leaderSkill = 'None.';
			if (charDefs.leaderSkill) {
				let skillTxt = {
					boost: 'Boosts the specified type.',
					discount: 'Takes away the amount of cost specified to the specified type.',
					buff: 'Start the battle with the specified stat buff',
					status: 'Increased chance to land the specified status effect',
					crit: 'Increased crit chance to the specified element'
				}
				
				let usesPercent = {
					buff: false,
					
					boost: true,
					crit: true,
					status: true,
					discount: true
				}

				let skill = charDefs.leaderSkill
				leaderSkill = `**${skill.name}**\n*${skillTxt[skill.type]}\n${skill.percent}${(usesPercent[skill.type] == true) ? '%' : ''} ${skill.type} toward ${skill.target.toUpperCase()}*`;
			}

			let charmPath = dataPath+'/charms.json'
			let charmRead = fs.readFileSync(charmPath, {flag: 'as+'});
			let charmFile = JSON.parse(charmRead);
			
			let notches = 0
			for (const i in charDefs.charms)
				notches += charmFile[charDefs.charms[i]].notches
			
			let charms = ''
			for (const i in charDefs.curCharms) {
				if (charFuncs.equippedCharm(charDefs, charDefs.curCharms[i]))
					charms += `**${charmFile[charDefs.curCharms[i]].name}**\n`
				else
					charms += `${charmFile[charDefs.curCharms[i]].name}\n`
			}
			
			if (charms === '')
				charms = 'None'
			else
				charms += `*${notches} Notches taken.*`
			
			let transTxt = '';
			if (charDefs.transformations) {
				for (const i in charDefs.transformations) {
					transTxt += `**${charDefs.transformations[i].name}** *(${charDefs.transformations[i].requirement})*\n`
									
					let addStats = [
						"hp",
						"atk",
						"mag",
						"prc",
						"end",
						"agl",
						"int",
						"chr",
						"luk"
					]
					
					for (const k in addStats) {
						let addTxt = `+${charDefs.transformations[i][addStats[k]]} ${addStats[k]}`
						let subTxt = `${charDefs.transformations[i][addStats[k]]} ${addStats[k]}`
						transTxt += `${(charDefs.transformations[i][addStats[k]] >= 0) ? addTxt : subTxt}`;
						if (k < addStats.length-1)
							transTxt += ', '
					}
					
					transTxt += '\n'
				}
			}
			
			if (transTxt === '')
				transTxt = 'None';

			let isNPC = charDefs.npcchar ? true : false;
			
			const DiscordEmbed = new Discord.MessageEmbed()
				.setColor('#12de6a')
			
			if (arg[2]) {
				let toLevel = parseInt(arg[2])
				
				if (toLevel > 99 || toLevel < 1)
					return message.channel.send("You can't go over 99 or less than 1.")
				
				if (toLevel > charDefs.level) {
					let levelsLeft = toLevel-charDefs.level
					for (i = 1; i <= levelsLeft; i++) {
						charDefs.xp = charDefs.maxxp
						charFuncs.lvlUp(charDefs, false, message.guild.id);
					}
				} else if (toLevel < charDefs.level) {
					let levelsLeft = charDefs.level-toLevel
					for (i = 1; i <= levelsLeft; i++) {
						charDefs.xp = 0
						charFuncs.lvlDown(charDefs, message.guild.id);
					}
				}
			}

			let title = `${elementEmoji[charDefs.mainElement] ? elementEmoji[charDefs.mainElement] : '🛑'} ${charName} `
			
			if (charDefs.nickname && charDefs.nickname != '')
				title += `[${charDefs.nickname}] `

			if (isNPC)
				title += `*(NPC)*`;
			else {
				let user = await client.users.fetch(charDefs.owner);
				title += `*(${user.username})*`
			}
			
			if (arg[2])
				title += ` *(At level ${arg[2]})*`;
			
			DiscordEmbed.setTitle(title)

			let xpPercent = Math.floor((charDefs.xp/charDefs.maxxp)*100)
			let xpSquares = xpPercent/12.5
			let xpStr = `[${'🟦'.repeat(xpSquares)}${'⬛'.repeat(8 - xpSquares)}]`

			DiscordEmbed.addFields(
				{ name: 'Stats', value: `Level ${charDefs.level}\n${charDefs.xp}/${charDefs.maxxp}XP\n${xpStr}\n\n${charDefs.hp}/${charDefs.maxhp}HP (${charDefs.basehp} Base)\n${charDefs.mp}/${charDefs.maxmp}${charDefs.mpMeter[1]} (${charDefs.basemp} Base)\n\n${charDefs.atk}ATK (${charDefs.baseatk} Base)\n${charDefs.mag}MAG (${charDefs.basemag} Base)\n${charDefs.prc}PRC (${charDefs.baseprc} Base)\n${charDefs.end}END (${charDefs.baseend} Base)\n${charDefs.chr}CHR (${charDefs.basechr} Base)\n${charDefs.int}INT (${charDefs.baseint} Base)\n${charDefs.agl}AGL (${charDefs.baseagl} Base)\n${charDefs.luk}LUK (${charDefs.baseluk} Base)`, inline: true },
				{ name: 'Skills', value: `**Melee Attack**\n${elementEmoji[charDefs.melee[1]]}${charDefs.melee[0]}\n\n**Skills**\n${charSkills}`, inline: true },
				{ name: 'Limit Break Capabilities', value: `${charLBs}`, inline: true },
				{ name: 'Affinities', value: `${charAffs}`, inline: true },
				{ name: 'Leader Skill', value: `${leaderSkill}`, inline: true },
				{ name: 'Charms', value: `${charms}`, inline: true },
				{ name: 'Transformations', value: `${transTxt}`, inline: true }
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
		
        let charPath = dataPath+'/characters.json'
        let charRead = fs.readFileSync(charPath, {flag: 'as+'});
        let charFile = JSON.parse(charRead);
        if (charFile[arg[1]]) {
            const charName = arg[1]
            const charDefs = charFile[arg[1]]
			
			let bioTxt = `<Name> ${charName}\n`
			
			if (charDefs.nickname && charDefs.nickname != '')
				bioTxt += `<Nickname> ${charDefs.nickname}\n`;

			if (charDefs.bio.species != "")
				bioTxt += `<Species> ${charDefs.bio.species}\n`
			else
				bioTxt += '<Species> N/A\n'

			if (charDefs.bio.gender == "male")
				bioTxt += '<Gender> <:male:911984734912000121>\n'
			else if (charDefs.bio.gender == "female")
				bioTxt += '<Gender> <:female:911984744420491274>\n'
			else
				bioTxt += '<Gender> Other\n'

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
			
			let charTrust = ''
			for (const i in charDefs.trust) {
				let trustVal = charDefs.trust[i]
				let percent = (trustVal.value/trustVal.nextLevel)*100
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
	
	/*
		ENEMY FUNCTIONS
	*/

    if (command === 'registerenemy') {
		if (utilityFuncs.isBanned(message.author.id, message.guild.id) && !utilityFuncs.RPGBotAdmin(message.author.id))
			return message.channel.send("I've been told you were banned from using the RPG sections of the bot, sorry!");
        if (!message.member.permissions.serialize().ADMINISTRATOR)
            return message.channel.send('You lack sufficient permissions, apologies!');

        const arg = message.content.slice(prefix.length).trim().split(/ +/);
        if (arg[1] == null) {
            const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
				.setTitle(`${prefix}registerenemy`)
				.setDescription('(Args <Name> <Level> <HP> <MP> <XP> <Strength> <Magic> <Perception> <Endurance> <Charisma> <Inteligence> <Agility> <Luck> <Miniboss/Boss/BigBoss/Diety> "<Journal Entry>")\nCreates a enemy to be fought in battle. This command is restricted to server admins.\nLevel does not actually affect anything, but it does indicate the level party members should be at to fight it. If you want to know what each stat does, check "rpg!registerchar"')
                .addFields(
                    { name: 'Bosses', value: 'Minibosses, or Bosses are usually stronger than regular enemies. They get two turns in a battle, and they drop increased money too.', inline: true },
                )
            message.channel.send({embeds: [DiscordEmbed]})
            return false
        }
	
        if (message.content.includes("@everyone") || message.content.includes("@here") || message.mentions.users.first())
            return message.channel.send(`You're really mean, you know that?`);

        if (!utilityFuncs.RPGBotAdmin(message.author.id)) {
            if (readEnm(arg[1], message.guild.id) && message.author.id != readEnm(arg[1], message.guild.id).creator)
                return message.channel.send("This enemy exists already. You have insufficient permissions to overwrite it.");
        }
		
		const journalEntry = message.content.slice(prefix.length).trim().split('"')[1];

		let enmDefs = enemyFuncs.writeEnemy(message.author, message.guild.id, arg[1], parseInt(arg[2]), parseInt(arg[3]), parseInt(arg[4]), parseInt(arg[5]), parseInt(arg[6]), parseInt(arg[7]), parseInt(arg[8]), parseInt(arg[9]), parseInt(arg[10]), parseInt(arg[11]), parseInt(arg[12]), parseInt(arg[13]), arg[14].toLowerCase(), journalEntry)
		message.channel.send(`👍 ${arg[1]} has been created!`)
    }

    if (command === 'unregisterenemy' || command === 'deleteenemy') {
        const arg = message.content.slice(prefix.length).trim().split(/ +/);

        let enmPath = dataPath+'/Enemies/enemies-' + message.guild.id + '.json';
        let enmRead = fs.readFileSync(enmPath, {flag: 'as+'});
        let enmJSON = JSON.parse(enmRead);
		let enmFile = enmJSON[message.guild.id]

        if (enmFile[arg[1]]) {
			if (!enmFile[arg[1]].creator || enmFile[arg[1]].creator != message.author.id)
				return message.channel.send("You don't own this enemy.");

			message.channel.send(`Are you **sure** you want to delete ${arg[1]}? You will NEVER get this back, so please, ensure you WANT to delete this enemy.\n**Y/N**`);

			var givenResponce = false
			var collector = message.channel.createMessageCollector({ time: 15000 });
			collector.on('collect', m => {
				if (m.author.id == message.author.id) {
					givenResponce = true
					collector.stop()
					if (m.content.toLowerCase() === 'yes' || m.content.toLowerCase() === 'y') {
						message.channel.send(`${arg[1]} has been erased from existance.`)
						
						delete enmFile[arg[1]];
						fs.writeFileSync(enmPath, JSON.stringify(enmJSON, null, '    '));
					} else {
						message.channel.send(`${arg[1]} has been spared by the great ${message.author.username}.`);
					}
				}
			});
			collector.on('end', c => {
				if (givenResponce == false)
					message.channel.send('No response given. Nothing will happen.');
			});
		} else {
            message.channel.send('Invalid Enemy.');
            return
        }
    }

    if (command === 'setnegotiation') {
		if (utilityFuncs.isBanned(message.author.id, message.guild.id) && !utilityFuncs.RPGBotAdmin(message.author.id))
			return message.channel.send("I've been told you were banned from using the RPG sections of the bot, sorry!");
        if (!message.member.permissions.serialize().ADMINISTRATOR)
            return message.channel.send('You lack sufficient permissions, apologies!');

        const arg = message.content.slice(prefix.length).trim().split(/ +/);
        if (arg[1] == null) {
            const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#4b02c9')
				.setTitle(`${prefix}${command}`)
				.setDescription(`(Args <Enemy Name> <Name> <Special> <Amount> "<Desc>" "<Action>")\nAllows an enemy to be pacified in-battle.`)
            return message.channel.send({embeds: [DiscordEmbed]})
        }

		let enmPath = dataPath+'/Enemies/enemies-' + message.guild.id + '.json'
		let enmRead = fs.readFileSync(enmPath, {flag: 'as+'});
		let enmFile = JSON.parse(enmRead);

        if (enmFile[message.guild.id][arg[1]]) {
			const enmDefs = enmFile[message.guild.id][arg[1]]

			for (i = 1; i < 4; i++) {
				if (!arg[i]) {
					let ext = ['th', 'st', 'nd', 'rd', 'th', 'th', 'th']
					return message.channel.send(`You're missing a ${i}${ext[i]} argument.`)
				}
			}

			const descTxt = message.content.slice(prefix.length).trim().split('"')[1];
			const actTxt = message.content.slice(prefix.length).trim().split('"')[3];

			if (!enmDefs.negotiate)
				enmDefs.negotiate = [];

			enmDefs.negotiate.push({
				name: arg[2],
				desc: descTxt,
				action: actTxt,
				convince: parseFloat(arg[4])
			})

			if (arg[4] != 'none')
				enmDefs.negotiate.special = arg[3].toLowerCase();

			message.react('👍')
			fs.writeFileSync(enmPath, JSON.stringify(enmFile, null, '    '));
        } else
            return message.channel.send(`${arg[1]} isn't a valid enemy.`);
    }

    if (command === 'setpetvalues') {
		if (utilityFuncs.isBanned(message.author.id, message.guild.id) && !utilityFuncs.RPGBotAdmin(message.author.id))
			return message.channel.send("I've been told you were banned from using the RPG sections of the bot, sorry!");
        if (!message.member.permissions.serialize().ADMINISTRATOR)
            return message.channel.send('You lack sufficient permissions, apologies!');

        const arg = message.content.slice(prefix.length).trim().split(/ +/);
        if (arg[1] == null) {
            const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#4b02c9')
				.setTitle(`${prefix}${command}`)
				.setDescription('(Args <Enemy Name> <Required> <ATK> <MAG> <DEF> <Skill>)\nAllows an enemy to be used as a pet after pacified <Required> amount of times.')
            return message.channel.send({embeds: [DiscordEmbed]})
        }

		let enmPath = dataPath+'/Enemies/enemies-' + message.guild.id + '.json'
		let enmRead = fs.readFileSync(enmPath, {flag: 'as+'});
		let enmFile = JSON.parse(enmRead);

        if (enmFile[message.guild.id][arg[1]]) {
			const enmDefs = enmFile[message.guild.id][arg[1]]

			for (i = 2; i < 6; i++) {
				if (!arg[i]) {
					let ext = ['th', 'st', 'nd', 'rd', 'th', 'th', 'th']
					return message.channel.send(`You're missing a ${i}${ext[i]} argument.`)
				}
			}

			const descTxt = message.content.slice(prefix.length).trim().split('"')[1];
			const actTxt = message.content.slice(prefix.length).trim().split('"')[3];

			enmDefs.negotiateDefs = {
				required: parseInt(arg[2]),
				qualities: {
					atk: parseInt(arg[3]),
					mag: parseInt(arg[4]),
					def: parseInt(arg[5]),
					skill: arg[6]
				}
			}

			message.react('👍')
			fs.writeFileSync(enmPath, JSON.stringify(enmFile, null, '    '));
        } else
            return message.channel.send(`${arg[1]} isn't a valid enemy.`);
    }
	
	if (command === 'setimage') {
		if (utilityFuncs.isBanned(message.author.id, message.guild.id) && !utilityFuncs.RPGBotAdmin(message.author.id))
			return message.channel.send("I've been told you were banned from using the RPG sections of the bot, sorry!");
        if (!message.member.permissions.serialize().ADMINISTRATOR)
            return message.channel.send('You lack sufficient permissions, apologies!');

        const arg = message.content.slice(prefix.length).trim().split(/ +/);
        if (arg[1] == null) {
            const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#4b02c9')
				.setTitle(`${prefix}${command}`)
				.setDescription('(Args <Enemy Name> <Attatchment: Send Png or Jpeg>)\nGives the enemy an appearance.')
            return message.channel.send({embeds: [DiscordEmbed]})
        }

		let enmPath = dataPath+'/Enemies/enemies-' + message.guild.id + '.json'
		let enmRead = fs.readFileSync(enmPath, {flag: 'as+'});
		let enmFile = JSON.parse(enmRead);

        if (enmFile[message.guild.id][arg[1]]) {
			if (message.attachments.first()) {
				if (message.attachments.first().name.endsWith('.png') || message.attachments.first().name.endsWith('.jpg')) {
					downloadUrl(message.attachments.first());
				}
				
				enmFile[message.guild.id][arg[1]].image = message.attachments.first().name
				fs.writeFileSync(enmPath, JSON.stringify(enmFile, null, '    '));
				message.react('👍')
			} else {
				return message.channel.send('Missing image.');
			}
		} else {
			return message.channel.send('Invalid Enemy.');
		}
	}

    if (command === 'journal') {
        const arg = message.content.slice(prefix.length).trim().split(/ +/);

        if (readEnm(arg[1], message.guild.id)) {
            const enmName = arg[1]
            const enmDefs = readEnm(enmName, message.guild.id)
			
			const seenEnm = enemyFuncs.encounteredEnemy(enmName, message.guild.id)
			if (seenEnm == false) {
				var DiscordEmbed = new Discord.MessageEmbed()
					.setColor('#12de6a')
					.setTitle(`${enmName}`)
					.setDescription("This enemy hasn't been seen yet, encounter it in battle to reveal it's stats & affinities.")

				message.channel.send({embeds: [DiscordEmbed]})
			}

            let enmSkills = ``;
            for (i = 0; i < enmDefs.skills.length; i++) {
				const skillDefs = readSkill(enmDefs.skills[i])
                enmSkills += `${elementEmoji[skillDefs.type]}${skillDefs.name}\n`
            }

            if (enmSkills === ``)
				enmSkills = "none";

            let enmLB = ``;
            if (enmDefs.lb) {
                if (enmDefs.lb.name && enmDefs.lb.name.toLowerCase() != "none") {
					let lbSkill = enmDefs.lb
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

			let charAffs = "";
			for (const i in enmDefs.superweak) charAffs += `${elementEmoji[enmDefs.superweak[i]]} <:supereffective:939053172528394252>\n`;
			for (const i in enmDefs.weak) charAffs += `${elementEmoji[enmDefs.weak[i]]} <:effective:876899270731628584>\n`;
			for (const i in enmDefs.resist) charAffs += `${elementEmoji[enmDefs.resist[i]]} <:resist:877132670784647238>\n`
			for (const i in enmDefs.block) charAffs += `${elementEmoji[enmDefs.block[i]]} <:block:879801928282939452>\n`;
			for (const i in enmDefs.repel) charAffs += `${elementEmoji[enmDefs.repel[i]]} <:repel:879801953725595649>\n`;
			for (const i in enmDefs.drain) charAffs += `${elementEmoji[enmDefs.drain[i]]} <:drain:879801979138895904>\n`;
			if (charAffs === ``) charAffs = "None.";

			let enmLoot = ``
			if (!enmDefs.loot || enmDefs.loot == '' || enmDefs.loot == undefined)
				enmLoot = `No possible loot.`
			
			if (enmDefs.loot) {
				let lootPath = `${dataPath}/Loot/lootTables-${message.guild.id}.json`
				let lootRead = fs.readFileSync(lootPath, {flag: 'as+'});
				let lootFile = JSON.parse(lootRead);

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
                )
				.setFooter(message.guild.name)

			if (enmLB != "No Limit Break Skill.")
				DiscordEmbed.fields.push({ name: `${enmName}'s Limit Break Capability:`, value: `${enmLB}`, inline: true });

			if (enmLoot != `No possible loot.`)
				DiscordEmbed.fields.push({ name: `${enmName}'s Possible Loot:`, value: `${enmLoot}`, inline: true });

			if (enmDefs.negotiateDefs && enmDefs.negotiateDefs.qualities) {
				let enmQualities = enmDefs.negotiateDefs.qualities
				let qualityString = ''
				
				if (enmQualities.atk)
					qualityString += `${enmQualities.atk} ATK\n`
				if (enmQualities.mag)
					qualityString += `${enmQualities.mag} MAG\n`
				if (enmQualities.def)
					qualityString += `${enmQualities.def} DEF\n`

				if (enmQualities.skill) {
					const skillDefs = readSkill(enmQualities.skill)
					qualityString += `\n**Special**\n${elementEmoji[skillDefs.type]}${skillDefs.name}`
				}

				DiscordEmbed.fields.push({ name: `${enmName}'s Pet Qualities`, value: qualityString, inline: true });
			}

			if (enmDefs.negotiate) {
				let negDefs = enmDefs.negotiate
				let negString = ''
				for (const i in enmDefs.negotiate)
					negString += `\n**${i}**: **${negDefs[i].name}**\n*${negDefs[i].desc}*\n*+${negDefs[i].convince ? negDefs[i].convince : 0}%*`;
				
				if (negString === '')
					negString = 'Nothing.'

				DiscordEmbed.fields.push({ name: `${enmName}'s Pacifying Tactics`, value: negString, inline: true });
			}
			
            if (enmDefs.image) {
				const file = new Discord.MessageAttachment(`./images/enemies/${enmDefs.image}`);
                DiscordEmbed.setThumbnail(`attachment://${enmDefs.image}`)
				
				if (seenEnm)
					message.channel.send({embeds: [DiscordEmbed], files: [file]});
				else if (!seenEnm && message.member.permissions.serialize().ADMINISTRATOR)
					message.author.send({content: "Because you're an admin, you can see this early.", embeds: [DiscordEmbed], files: [file]});
			} else
				if (seenEnm)
					message.channel.send({embeds: [DiscordEmbed]});
				else if (!seenEnm && message.member.permissions.serialize().ADMINISTRATOR)
					message.author.send({content: "Because you're an admin, you can see this early.", embeds: [DiscordEmbed]});
        } else {
            message.channel.send(`Invalid Enemy.`);
            return
        }
    }
	
    if (command === 'listenemies') {
		let enmPath = dataPath+'/Enemies/enemies-' + message.guild.id + '.json'
		let enmRead = fs.readFileSync(enmPath, {flag: 'as+'});
		let enmFile = JSON.parse(enmRead); 
		let user = message.mentions.users.first() ? message.mentions.users.first() : null

		let enmArray = []
        const arg = message.content.slice(prefix.length).trim().split(/ +/);
        if (!arg[2] || arg[2] === ' ' || arg[2] === 'null') {
			for (const i in enmFile[message.guild.id])
				enmArray.push([enmFile[message.guild.id][i], enemyFuncs.encounteredEnemy(i, message.guild.id)]);

			sendEnemyArray(message.channel, enmArray);
        } else {
			for (const i in enmFile[message.guild.id]) {
				if (user) {
					if (enmFile[message.guild.id][i].owner === user.id) {
						enmArray.push([enmFile[message.guild.id][i], enemyFuncs.encounteredEnemy(i, message.guild.id)]);
					}
				} else {
					switch(arg[2].toLowerCase()) {
						case 'boss':
							if (enmFile[message.guild.id][i].boss)
								enmArray.push([enmFile[message.guild.id][i], enemyFuncs.encounteredEnemy(i, message.guild.id)]);
							
						case 'miniboss':
							if (enmFile[message.guild.id][i].miniboss)
								enmArray.push([enmFile[message.guild.id][i], enemyFuncs.encounteredEnemy(i, message.guild.id)]);

						case 'deity':
							if (enmFile[message.guild.id][i].boss)
								enmArray.push([enmFile[message.guild.id][i], enemyFuncs.encounteredEnemy(i, message.guild.id)]);
						
						default: 
							enmArray.push([enmFile[message.guild.id][i], enemyFuncs.encounteredEnemy(i, message.guild.id)]);
					}
				}
			}

			if (enmArray.length <= 0)
				return message.channel.send("No found enemies. **Maybe you haven't encountered them yet.**")

			sendEnemyArray(message.channel, enmArray);
		}
	}

    if (command === 'randomenemy') {
		let enmPath = dataPath+'/Enemies/enemies-' + message.guild.id + '.json'
		let enmRead = fs.readFileSync(enmPath, {flag: 'as+'});
		let enmFile = JSON.parse(enmRead); 
        const arg = message.content.slice(prefix.length).trim().split(/ +/);
		
		let possibleEnemies = [];
		for (const i in enmFile[message.guild.id]) {
			if (enemyFuncs.encounteredEnemy(i, message.guild.id))
				possibleEnemies.push(i);
		}

		let enemy = possibleEnemies[utilityFuncs.randNum(possibleEnemies.length-1)];
		console.log(`Enemy Rolled: ${enemy}`)

        if (enmFile[message.guild.id][enemy]) {
            const enmName = enemy
            const enmDefs = enmFile[message.guild.id][enemy]
			
			const seenEnm = enemyFuncs.encounteredEnemy(enmName, message.guild.id)
			if (!seenEnm) {
				var DiscordEmbed = new Discord.MessageEmbed()
					.setColor('#12de6a')
					.setTitle(`You rolled: _${enmName}_!`)
					.setDescription("This enemy hasn't been seen yet, encounter it in battle to reveal it's stats & affinities.")

				message.channel.send({embeds: [DiscordEmbed]})
			}

            let enmSkills = ``;
            for (i = 0; i < enmDefs.skills.length; i++) {
				const skillDefs = readSkill(enmDefs.skills[i])
                enmSkills += `${elementEmoji[skillDefs.type]}${skillDefs.name}\n`
            }

            if (enmSkills === ``)
				enmSkills = "none";

            let enmLB = ``;
            if (enmDefs.lb) {
                if (enmDefs.lb.name && enmDefs.lb.name.toLowerCase() != "none") {
					let lbSkill = enmDefs.lb
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

			let charAffs = "";
			for (const i in enmDefs.superweak) charAffs += `${elementEmoji[enmDefs.superweak[i]]} <:supereffective:939053172528394252>\n`;
			for (const i in enmDefs.weak) charAffs += `${elementEmoji[enmDefs.weak[i]]} <:effective:876899270731628584>\n`;
			for (const i in enmDefs.resist) charAffs += `${elementEmoji[enmDefs.resist[i]]} <:resist:877132670784647238>\n`
			for (const i in enmDefs.block) charAffs += `${elementEmoji[enmDefs.block[i]]} <:block:879801928282939452>\n`;
			for (const i in enmDefs.repel) charAffs += `${elementEmoji[enmDefs.repel[i]]} <:repel:879801953725595649>\n`;
			for (const i in enmDefs.drain) charAffs += `${elementEmoji[enmDefs.drain[i]]} <:drain:879801979138895904>\n`;
			if (charAffs === ``) charAffs = "None.";

			let enmLoot = ``
			if (!enmDefs.loot || enmDefs.loot == '' || enmDefs.loot == undefined)
				enmLoot = `No possible loot.`
			
			if (enmDefs.loot) {
				let lootPath = `${dataPath}/Loot/lootTables-${message.guild.id}.json`
				let lootRead = fs.readFileSync(lootPath, {flag: 'as+'});
				let lootFile = JSON.parse(lootRead);

				let lootVar=0;

				do {
					enmLoot += `- ${lootFile[enmDefs.loot].items[lootVar]}\n`
					lootVar++
				} while (lootVar < lootFile[enmDefs.loot].items.length) //how tf did a for loop not work with it????????
			}

            var DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#12de6a')
                .setTitle(`You rolled: _${enmName}_`)
                .setDescription(`${enmDefs.journal}`)
                .addFields(
                    { name: `${enmName}'s Stats:`, value: `Level ${enmDefs.level}\nWorth ${enmDefs.awardxp}XP\n\n${enmDefs.hp} Max HP\n${enmDefs.mp} Max MP\n\n${enmDefs.atk}ATK\n${enmDefs.mag}MAG\n${enmDefs.prc}PRC\n${enmDefs.end}END\n${enmDefs.chr}CHR\n${enmDefs.int}INT\n${enmDefs.agl}AGL\n${enmDefs.luk}LUK`, inline: true },
                    { name: `${enmName}'s Skills:`, value: `${enmSkills}`, inline: true },
					{ name: `${enmName}'s Affinities:`, value: `${charAffs}`, inline: true },
                )
				.setFooter(message.guild.name)

			if (enmLB != "No Limit Break Skill.")
				DiscordEmbed.fields.push({ name: `${enmName}'s Limit Break Capability:`, value: `${enmLB}`, inline: true });

			if (enmLoot != `No possible loot.`)
				DiscordEmbed.fields.push({ name: `${enmName}'s Possible Loot:`, value: `${enmLoot}`, inline: true });

			if (enmDefs.negotiateDefs && enmDefs.negotiateDefs.qualities) {
				let enmQualities = enmDefs.negotiateDefs.qualities
				let qualityString = ''
				
				if (enmQualities.atk)
					qualityString += `${enmQualities.atk} ATK\n`
				if (enmQualities.mag)
					qualityString += `${enmQualities.mag} MAG\n`
				if (enmQualities.def)
					qualityString += `${enmQualities.def} DEF\n`

				if (enmQualities.skill) {
					const skillDefs = readSkill(enmQualities.skill)
					qualityString += `\n**Special**\n${elementEmoji[skillDefs.type]}${skillDefs.name}`
				}

				DiscordEmbed.fields.push({ name: `${enmName}'s Pet Qualities`, value: qualityString, inline: true });
			}

			if (enmDefs.negotiate) {
				let negDefs = enmDefs.negotiate
				let negString = ''
				for (const i in enmDefs.negotiate) {
					negString += `\n**${i}**: **${negDefs[i].name}**\n*${negDefs[i].desc}*\n*+${negDefs[i].convince ? negDefs[i].convince : 0}%*`
				}
				
				if (negString === '')
					negString = 'Nothing.'

				DiscordEmbed.fields.push({ name: `${enmName}'s Pacifying Tactics`, value: negString, inline: true });
			}
			
            if (enmDefs.image) {
				const file = new Discord.MessageAttachment(`./images/enemies/${enmDefs.image}`);
                DiscordEmbed.setThumbnail(`attachment://${enmDefs.image}`)
				
				if (seenEnm)
					message.channel.send({embeds: [DiscordEmbed], files: [file]});
				else if (!seenEnm && message.member.permissions.serialize().ADMINISTRATOR)
					message.author.send({content: "Because you're an admin, you can see this early.", embeds: [DiscordEmbed], files: [file]});
			} else
				if (seenEnm)
					message.channel.send({embeds: [DiscordEmbed]});
				else if (!seenEnm && message.member.permissions.serialize().ADMINISTRATOR)
					message.author.send({content: "Because you're an admin, you can see this early.", embeds: [DiscordEmbed]});
        } else {
            message.channel.send('Invalid Enemy.');
            return
        }
    }

	if (command === 'updateenemies') {
		if (utilityFuncs.isBanned(message.author.id, message.guild.id) && !utilityFuncs.RPGBotAdmin(message.author.id))
			return message.channel.send("I've been told you were banned from using the RPG sections of the bot, sorry!");
            
		if (!message.member.permissions.serialize().ADMINISTRATOR)
			return message.channel.send('No.');
		
		message.channel.send("This will take a while, so be patient! I will react with 👍 once I'm done.")

		setTimeout(function() {
			let enmPath = dataPath+'/Enemies/enemies-' + message.guild.id + '.json'
			let enmRead = fs.readFileSync(enmPath, {flag: 'as+'});
			let enmFile = JSON.parse(enmRead);
			
			for (const i in enmFile[message.guild.id]) {
				if (!enmFile[message.guild.id][i].name)
					enmFile[message.guild.id][i].name = i;
			}
			
			fs.writeFileSync(enmPath, JSON.stringify(enmFile, null, '    '));
			message.react('👍')
		}, 1000)
	}

    /////////////////////////////
    // In Battle Stuff!
    /////////////////////////////
	if (command === 'getbattleinfo' || command === 'battleinfo' || command === 'battlestatus') {
        const btl = readBattle(message.guild.id);

		if (!btl[message.guild.id].battling)
			return message.channel.send("There's no battle going on in this server.");
		
		const weather = btl[message.guild.id].changeweather ? btl[message.guild.id].changeweather.weather : btl[message.guild.id].weather
		const terrain = btl[message.guild.id].changeterrain ? btl[message.guild.id].changeterrain.terrain : btl[message.guild.id].terrain
		
		let weatherTxt = "Clear"
		let terrainTxt = "Clear"
		if (weather != "clear")
			weatherTxt = `${weather.toUpperCase()}`;
		if (terrain != "normal")
			terrainTxt = `${terrain.toUpperCase()} terrain`;

		var DiscordEmbed = new Discord.MessageEmbed()
			.setColor('#b81872')
			.setTitle(`${message.guild.name}'s current battle stats.`)
			.setDescription(`The terrain is ${terrainTxt}, and the weather is ${weatherTxt}.`)
			.addFields()

		for (const i in btl[message.guild.id].allies.members) {
			const charDefs = btl[message.guild.id].allies.members[i]

			let buffTxt = ''
			for (const k in charDefs.buffs)
				buffTxt += `\n${charDefs.buffs[k]} ${k.toUpperCase()} buffs`;

			DiscordEmbed.fields.push({name: `${charDefs.id}: ${charDefs.name} (Team 1)`, value: `${charDefs.hp}/${charDefs.maxhp}HP\n${charDefs.mp}/${charDefs.maxmp}MP${buffTxt}`, inline: true});
		}

		for (const i in btl[message.guild.id].enemies.members) {
			const charDefs = btl[message.guild.id].enemies.members[i]

			let buffTxt = ''
			for (const k in charDefs.buffs)
				buffTxt += `\n${charDefs.buffs[k]} ${k} buffs`;

			DiscordEmbed.fields.push({name: `${charDefs.id}: ${charDefs.name} (Team 2)`, value: `${charDefs.hp}/${charDefs.maxhp}HP\n${charDefs.mp}/${charDefs.maxmp}MP${buffTxt}`, inline: true});
		}
		
		message.channel.send({embeds: [DiscordEmbed]})
	}

    if (command === 'testbattle') {
        const btl = readBattle(message.guild.id);

        const arg = message.content.slice(prefix.length).trim().split(/ +/);

        console.log('BattleStatus: Starting Test Battle');

        let charPath = dataPath+'/characters.json'
        let charRead = fs.readFileSync(charPath, {flag: 'as+'});
        let charFile = JSON.parse(charRead);

		if (!charFile[arg[1]])
			return message.channel.send(`${arg[1]} is an invalid character!`);
		
		if (charFile[arg[1]].owner != message.author.id)
			return message.channel.send("You're not the owner of this character.")
		
		if (!enemyFuncs.encounteredEnemy(arg[2], message.guild.id))
			return message.channel.send("You haven't encountered this enemy yet!")

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

		// Ally Character
		let charDefs = utilityFuncs.cloneObj(charFile[arg[1]])
		delete charDefs.lb
		delete charDefs.guard
		delete charDefs.status
		delete charDefs.statusturns

		let battlerDefs = charFuncs.genChar(charDefs, true, {})
		battlerDefs.agl = 99
		battlerDefs.prc = 99
		battlerDefs.id = 0
		btl[message.guild.id].allies.members = [battlerDefs]

		if (!btl[message.guild.id].allies.backup)
			btl[message.guild.id].allies.backup = []
		
		// Enemy character
		let servPath = dataPath+'/Server Settings/server.json'
        let servRead = fs.readFileSync(servPath, {flag: 'as+'});
        let servFile = JSON.parse(servRead);

        btl[message.guild.id].enemies.members = [];
		if (readEnm(arg[2], message.guild.id)) {
			let enemyDefs = enemyFuncs.genEnm(arg[2], message.guild.id)
			enemyDefs.agl = 1
			enemyDefs.prc = 1
			enemyDefs.id = 1
			btl[message.guild.id].enemies.members.push(enemyDefs)

			console.log(`BattleStatus: ${arg[2]} generated.`);
		} else
			return message.channel.send(`${arg[2]} is an invalid enemy.`);

		fs.writeFileSync(servPath, JSON.stringify(servFile, null, '    '));

        // Set up Battle Vars
		turnFuncs.setUpBattleVars(btl[message.guild.id], message.guild.id)

		btl[message.guild.id].testing = true
		btl[message.guild.id].battleteam = arg[1]
		btl[message.guild.id].battlechannel = message.channel.id

        fs.writeFileSync(charPath, JSON.stringify(charFile, null, '    '));
        fs.writeFileSync(dataPath+'/Battles/battle-' + message.guild.id + '.json', JSON.stringify(btl, null, '    '));

        message.channel.send(`Testing ${arg[1]}'s stats in a battle against ${arg[2]}`);
        console.log('BattleStatus: Test battle has Begun.');

		// Start with leaderskill shit
		charFuncs.startBattleLeaderSkill(btl[message.guild.id].allies.members)

        // rid of the message
        message.delete();
		
		// Determine Turn Order
		btl[message.guild.id].turnorder = getTurnOrder(btl[message.guild.id]);

        // Start with the first turn!
        setTimeout(function() {
			advanceTurn(btl, message.guild.id)
        }, 500)
    }

    if (command === 'startenemybattle' || command === 'startbattle' || command === 'battle') {
        const btl = readBattle(message.guild.id);

        if (!message.member.permissions.serialize().ADMINISTRATOR)
            return message.channel.send("You lack sufficient permissions, I'm so sorry!");

        const arg = message.content.slice(prefix.length).trim().split(/ +/);
		for (i = 1; i <= 5; i++) {
			if (arg[i] == null) {
				const DiscordEmbed = new Discord.MessageEmbed()
					.setColor('#0099ff')
					.setTitle(`${prefix}${command}`)
					.setDescription(`(Args <Party> <Can Flee?> <Weather> <Terrain> <Enemy 1> <Enemy 2> <...>)\nBattles are a core part of Bloom Battler. They're the main thing that this bot specialises in. With Bloom Battler, you can make battles in places like Roleplay Servers much easier! To read more about battles, use ${prefix}guide.\n\nNote that to make sure there is no weather, input "clear".\nNote that to make sure there is no terrain, input "none".\nOnly valid enemies can be used. They are case sensitive.`)
				message.channel.send({embeds: [DiscordEmbed]})
				return false
			}
		}

        console.log('BattleStatus: Starting Battle');

        let charPath = dataPath+'/characters.json'
        let charRead = fs.readFileSync(charPath, {flag: 'as+'});
        let charFile = JSON.parse(charRead);
		
		let battlerID = 0;

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
		
		if (!btl[message.guild.id].parties[arg[1]].negotiateAllies)
			btl[message.guild.id].parties[arg[1]].negotiateAllies = {};
		
        btl[message.guild.id].allies.members = [];
        for (const k in btl[message.guild.id].parties[arg[1]].members) {
			let charDefs = charFile[btl[message.guild.id].parties[arg[1]].members[k]]
            delete charDefs.lb
            delete charDefs.guard
			delete charDefs.status
			delete charDefs.statusturns

			if (!charDefs.name)
				charDefs.name = btl[message.guild.id].parties[arg[1]].members[k];

			let pet
			for (const j in btl[message.guild.id].parties[arg[1]].negotiateAllies) {
				if (btl[message.guild.id].parties[arg[1]].negotiateAllies[j].owner == btl[message.guild.id].parties[arg[1]].members[k]) {
					pet = btl[message.guild.id].parties[arg[1]].negotiateAllies[j]
				}
			}

			let battlerDefs = charFuncs.genChar(charDefs, (k <= 0) ? true : false, btl[message.guild.id].parties[arg[1]])
			battlerDefs.id = battlerID

			btl[message.guild.id].allies.members.push(battlerDefs)
			battlerID++;
        }

		if (!btl[message.guild.id].allies.backup)
			btl[message.guild.id].allies.backup = []

        for (const k in btl[message.guild.id].parties[arg[1]].backup) {
			let charDefs = charFile[btl[message.guild.id].parties[arg[1]].backup[k]]
            delete charDefs.lb
            delete charDefs.guard
			delete charDefs.status
			delete charDefs.statusturns

			if (!charDefs.name)
				charDefs.name = btl[message.guild.id].parties[arg[1]].members[k];

			let battlerDefs = charFuncs.genChar(charDefs, false, btl[message.guild.id].parties[arg[1]])
			battlerDefs.id = battlerID

			btl[message.guild.id].allies.backup.push(battlerDefs)
			battlerID++;
        }
		       
		let servPath = dataPath+'/Server Settings/server.json'
        let servRead = fs.readFileSync(servPath, {flag: 'as+'});
        let servFile = JSON.parse(servRead);
		
		if (!servFile[message.guild.id].encountered)
			servFile[message.guild.id].encountered = [];

        btl[message.guild.id].enemies.members = [];
        for (let i = 5; i < arg.length; i++) {
            if (readEnm(arg[i], message.guild.id)) {
                let enemyDefs = enemyFuncs.genEnm(arg[i], message.guild.id)
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
		turnFuncs.setUpBattleVars(btl[message.guild.id], message.guild.id)
		btl[message.guild.id].battleteam = arg[1]
		btl[message.guild.id].battlechannel = message.channel.id
		btl[message.guild.id].canRun = (arg[2].toLowerCase() === 'false') ? false : true;
		btl[message.guild.id].weather = arg[3].toLowerCase();
		btl[message.guild.id].terrain = arg[4].toLowerCase();
		
		if (arg[3].toLowerCase() === 'none') btl[message.guild.id].weather = 'clear';
		if (arg[4].toLowerCase() === 'none') btl[message.guild.id].terrain = 'normal';

        fs.writeFileSync(charPath, JSON.stringify(charFile, null, '    '));
        fs.writeFileSync(dataPath+'/Battles/battle-' + message.guild.id + '.json', JSON.stringify(btl, null, '    '));

        message.channel.send(`Team ${arg[1]} encountered some enemies!`);
        console.log('BattleStatus: Battle has Begun.');
		
		let themeType = "battle"
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
				let BST = 0
				const stats = ["atk", "mag", "end", "chr", "int", "luk", "prc", "agl"]
				for (const k in stats)
					BST += enemyDefs[stats[k]];

				let strongestChar = [0, 0]
				for (const k in btl[message.guild.id].allies.members) {
					let charDefs = btl[message.guild.id].allies.members[k]
				
					let charBST = 0
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
		
		// Determine Turn Order
		btl[message.guild.id].turnorder = getTurnOrder(btl[message.guild.id]);

        // Start with the first turn!
        setTimeout(function() {
			advanceTurn(btl, message.guild.id)
        }, 500)
    }

    if (command === 'aibattle') {
        const btl = readBattle(message.guild.id);

        if (!message.member.permissions.serialize().ADMINISTRATOR)
            return message.channel.send("You lack sufficient permissions, I'm so sorry!");

        const arg = message.content.slice(prefix.length).trim().split(/ +/);
		for (i = 1; i <= 4; i++) {
			if (arg[i] == null) {
				const DiscordEmbed = new Discord.MessageEmbed()
					.setColor('#0099ff')
					.setTitle(`${prefix}${command}`)
					.setDescription(`(Args <Enemy 1> <Enemy 2> <Weather> <Terrain>)\nBattles are a core part of Bloom Battler. They're the main thing that this bot specialises in. With Bloom Battler, you can make battles in places like Roleplay Servers much easier! To read more about battles, use ${prefix}guide.\n\nNote that to make sure there is no weather, input "clear".\nNote that to make sure there is no terrain, input "none".\nOnly valid enemies can be used. They are case sensitive.`)
				message.channel.send({embeds: [DiscordEmbed]})
				return false
			}
		}

        console.log('BattleStatus: Starting Battle');
		
		let battlerID = 0;

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

        btl[message.guild.id].allies.members = [];
        btl[message.guild.id].enemies.members = [];
 
		if (readEnm(arg[1], message.guild.id)) {
			let enemyDefs = enemyFuncs.genEnm(arg[1], message.guild.id)
			enemyDefs.id = battlerID
			btl[message.guild.id].allies.members.push(enemyDefs)
			console.log(`BattleStatus: ${arg[1]} generated.`);
			battlerID++;
		} else {
			message.channel.send(`${arg[1]} is an invalid enemy.`)
			return false
		}

		if (readEnm(arg[2], message.guild.id)) {
			let enemyDefs = enemyFuncs.genEnm(arg[2], message.guild.id)
			enemyDefs.id = battlerID
			btl[message.guild.id].enemies.members.push(enemyDefs)
			console.log(`BattleStatus: ${arg[2]} generated.`);
			battlerID++;
		} else {
			message.channel.send(`${arg[2]} is an invalid enemy.`)
			return false
		}

		fs.writeFileSync(servPath, JSON.stringify(servFile, null, '    '));

        // Set up Battle Vars
		turnFuncs.setUpBattleVars(btl[message.guild.id], message.guild.id)
        btl[message.guild.id].pvp = true;
		btl[message.guild.id].canRun = false;
        btl[message.guild.id].battleteam = arg[1];
        btl[message.guild.id].battleteam2 = arg[2];
		btl[message.guild.id].weather = arg[3].toLowerCase();
		btl[message.guild.id].terrain = arg[4].toLowerCase();
		btl[message.guild.id].battlechannel = message.channel.id;

		if (arg[3].toLowerCase() === 'none') btl[message.guild.id].weather = 'clear';
		if (arg[4].toLowerCase() === 'none') btl[message.guild.id].terrain = 'normal';

        fs.writeFileSync(`${dataPath}/Battles/battle-${message.guild.id}.json`, JSON.stringify(btl, null, '    '));
        console.log('BattleStatus: Battle has Begun.');

		// Start with leaderskill shit
		charFuncs.startBattleLeaderSkill(btl[message.guild.id].allies.members)

        // rid of the message
        message.delete();

		// Determine Turn Order
		btl[message.guild.id].turnorder = getTurnOrder(btl[message.guild.id]);

        // Start with the first turn!
        setTimeout(function() {
			advanceTurn(btl, message.guild.id)
        }, 500)
    }
	
	if (command === 'setencounteredenemy' || command === 'setencountered' || command === 'encounter') {
        if (!message.member.permissions.serialize().ADMINISTRATOR)
            return message.channel.send("You lack sufficient permissions, I'm so sorry!");

        const arg = message.content.slice(prefix.length).trim().split(/ +/);

		if (readEnm(arg[1], message.guild.id)) {
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

        if (btl[message.guild.id].battling == true)
            return  message.channel.send(`You can't reset a battle!`);

        if (!message.member.permissions.serialize().ADMINISTRATOR)
            return message.channel.send("You lack sufficient permissions, I'm so sorry!");

        const arg = message.content.slice(prefix.length).trim().split(/ +/);

        console.log('BattleStatus: Starting Battle in Colosseum');

        let charPath = dataPath+'/characters.json'
        let charRead = fs.readFileSync(charPath, {flag: 'as+'});
        let charFile = JSON.parse(charRead);
		let skillPath = dataPath+'/skills.json'
		let skillRead = fs.readFileSync(skillPath, {flag: 'as+'});
		let skillFile = JSON.parse(skillRead);

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

        if (btl[message.guild.id].parties == {})
            return message.channel.send(`There are no parties avaliable! \n__Check ${prefix}makeparty__`);

        if (!btl[message.guild.id].parties[arg[1]])
            return message.channel.send(`${arg[1]} is an invalid party.`);

		let battlerID = 0;
		let partyDefs = btl[message.guild.id].parties[arg[1]]

        btl[message.guild.id].allies.members = [];
        for (const k in btl[message.guild.id].parties[arg[1]].members) {
			let charDefs = charFile[btl[message.guild.id].parties[arg[1]].members[k]]

			// Reset some effects
            delete charDefs.lb
            delete charDefs.guard
			delete charDefs.status
			delete charDefs.statusturns

			if (!charDefs.name)
				charDefs.name = btl[message.guild.id].parties[arg[1]].members[k];
			
			// Generate Character
			let battlerDefs = charFuncs.genChar(charDefs, (k <= 0) ? true : false, btl[message.guild.id].parties[arg[1]])
			battlerDefs.id = battlerID
			
			if (btl[message.guild.id].trials[arg[2]].endless) {
				battlerDefs.level = 1
				battlerDefs.xp = 0
				battlerDefs.maxxp = 100

				battlerDefs.hp = charDefs.basehp
				battlerDefs.mp = charDefs.basemp
				battlerDefs.maxhp = charDefs.basehp
				battlerDefs.maxmp = charDefs.basemp

				battlerDefs.atk = charDefs.baseatk
				battlerDefs.mag = charDefs.basemag
				battlerDefs.prc = charDefs.baseprc
				battlerDefs.end = charDefs.baseend
				battlerDefs.chr = charDefs.basechr
				battlerDefs.int = charDefs.baseint
				battlerDefs.agl = charDefs.baseagl
				battlerDefs.luk = charDefs.baseluk

				for (const i in battlerDefs.skills) {
					while (skillFile[battlerDefs.skills[i]].preSkill) {
						let oldSkill = skillFile[battlerDefs.skills[i]].preSkill[0]
						if (oldSkill === 'remove') {
							if (!battlerDefs.lvlUpQueue)
								battlerDefs.lvlUpQueue = [];

							battlerDefs.lvlUpQueue.push([battlerDefs.skills[i], skillFile[battlerDefs.skills[i]].preSkill[1]]);
							battlerDefs.skills.splice(i, 1);
						} else {
							battlerDefs.skills[i] = oldSkill;
						}
					}
				}
			}

			btl[message.guild.id].allies.members.push(battlerDefs)
			battlerID++;
        }

		if (!btl[message.guild.id].allies.backup)
			btl[message.guild.id].allies.backup = []

        for (const k in btl[message.guild.id].parties[arg[1]].backup) {
			let charDefs = charFile[btl[message.guild.id].parties[arg[1]].backup[k]]
            delete charDefs.lb
            delete charDefs.guard
			delete charDefs.status
			delete charDefs.statusturns

			if (!charDefs.name)
				charDefs.name = btl[message.guild.id].parties[arg[1]].members[k];

			let battlerDefs = charFuncs.genChar(charDefs, false, btl[message.guild.id].parties[arg[1]])
			battlerDefs.id = battlerID
			
			if (btl[message.guild.id].trials[arg[2]].endless) {
				battlerDefs.level = 1
				battlerDefs.xp = 0
				battlerDefs.maxxp = 100

				battlerDefs.hp = charDefs.basehp
				battlerDefs.mp = charDefs.basemp
				battlerDefs.maxhp = charDefs.basehp
				battlerDefs.maxmp = charDefs.basemp

				battlerDefs.atk = charDefs.baseatk
				battlerDefs.mag = charDefs.basemag
				battlerDefs.prc = charDefs.baseprc
				battlerDefs.end = charDefs.baseend
				battlerDefs.chr = charDefs.basechr
				battlerDefs.int = charDefs.baseint
				battlerDefs.agl = charDefs.baseagl
				battlerDefs.luk = charDefs.baseluk

				for (const i in battlerDefs.skills) {
					while (skillFile[battlerDefs.skills[i]].preSkill) {
						let oldSkill = skillFile[battlerDefs.skills[i]].preSkill[0]
						if (oldSkill === 'remove') {
							if (!battlerDefs.lvlUpQueue)
								battlerDefs.lvlUpQueue = [];

							battlerDefs.lvlUpQueue.push([battlerDefs.skills[i], skillFile[battlerDefs.skills[i]].preSkill[1]]);
							battlerDefs.skills.splice(i, 1);
						} else {
							battlerDefs.skills[i] = oldSkill;
						}
					}
				}
			}

			btl[message.guild.id].allies.backup.push(battlerDefs)
			battlerID++;
        }

        // Set up Battle Vars BEFORE setting the waves
		turnFuncs.setUpBattleVars(btl[message.guild.id], message.guild.id)
        btl[message.guild.id].battlechannel = message.channel.id;
        btl[message.guild.id].battleteam = arg[1];
        btl[message.guild.id].colosseum[0] = true;
        btl[message.guild.id].colosseum[1] = 0;
        btl[message.guild.id].colosseum[2] = arg[2];
		
		let waveNum = 0;
		const trialObj = btl[message.guild.id].trials[arg[2]]
		if (arg[3]) {
			if (partyDefs.endless.saves && partyDefs.endless.saves[arg[2]] && parseInt(arg[3]) <= partyDefs.endless.saves[arg[2]]) {
				if (!btl[message.guild.id].colosseum[3]) {
					btl[message.guild.id].colosseum[3] = {
						curLvl: 1,
						lvlLeft: 2,
						upperBound: 0,
						lowerBound: 0
					}
				}

				for (i = 1; i <= parseInt(arg[3]); i++) {
//					btl[message.guild.id].colosseum[1]++;
					btl[message.guild.id].colosseum[3].curLvl++;
					btl[message.guild.id].colosseum[3].lvlLeft--;

					for (const i in btl[message.guild.id].allies.members)
						charFuncs.lvlUp(btl[message.guild.id].allies.members[i], true, message.guild.id);
					for (const i in btl[message.guild.id].allies.backup)
						charFuncs.lvlUp(btl[message.guild.id].allies.backup[i], true, message.guild.id);

					btl[message.guild.id].colosseum[3].upperBound++;
					if (!trialObj.waves[btl[message.guild.id].colosseum[3].upperBound])
						btl[message.guild.id].colosseum[3].upperBound--;

					if (btl[message.guild.id].colosseum[3].lvlLeft <= 0) {
						btl[message.guild.id].colosseum[3].lowerBound++;
						if (!trialObj.waves[btl[message.guild.id].colosseum[3].lowerBound])
							btl[message.guild.id].colosseum[3].lowerBound--;

						btl[message.guild.id].colosseum[3].lvlLeft = 2
					}
				}

				// Randomize Waves
				waveNum = utilityFuncs.randBetweenNums(btl[message.guild.id].colosseum[3].lowerBound, btl[message.guild.id].colosseum[3].upperBound)
			} else
				return message.channel.send(`Wave ${arg[3]} cannot be accessed as you haven't saved here yet.`);
		}

        btl[message.guild.id].enemies.members = [];
		const trialWave = trialObj.waves[waveNum]
        for (const i in trialWave) {
            if (readEnm(trialWave[i], message.guild.id)) {
                let enemyDefs = enemyFuncs.genEnm(trialWave[i], message.guild.id)
				enemyDefs.id = battlerID
				
				btl[message.guild.id].enemies.members.push(enemyDefs)
				battlerID++;

                console.log(`BattleStatus: ${trialWave[i]} generated.`);
            } else {
                message.channel.send(`${trialWave[i]} in the trial of ${arg[2]} is an invalid enemy.`)
                return false
            }
        }

        fs.writeFileSync(dataPath+`/Battles/battle-${message.guild.id}.json`, JSON.stringify(btl, null, '    '));

        message.channel.send(`The trial of ${arg[2]} has begun. Team ${arg[1]} encountered the first wave!`);
        console.log('BattleStatus: Battle has Begun.');
		
		playThemeType(message.guild.id, "colosseum")

		// Start with leaderskill shit
		charFuncs.startBattleLeaderSkill(btl[message.guild.id].allies.members)

        // rid of the message
        message.delete();
		
		// Determine Turn Order
		btl[message.guild.id].turnorder = getTurnOrder(btl[message.guild.id]);

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

		let gamemode = "none"
		if (arg[1]) {
			if (arg[1].toLowerCase() === "metronome" || arg[1].toLowerCase() === "randskills" || arg[1].toLowerCase() === "randstats" || arg[1].toLowerCase() === "charfuck") {
				gamemode = arg[1].toLowerCase()
			}
		}

		let leaderBoard = []
		for (const i in servFile[message.guild.id].pvpstuff[gamemode]) {
			leaderBoard.push([i, servFile[message.guild.id].pvpstuff[gamemode][i]])
		}
	
		leaderBoard.sort(function(a, b) {return b[1].points - a[1].points});
		
		let leaderText = ""    
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
		let btlPath = dataPath+'/Battles/battle-' + message.guild.id + '.json'
		let btlRead = fs.readFileSync(btlPath, {flag: 'as+'});
		let btl = JSON.parse(btlRead);
		
		if (!btl)
			return message.channel.send('Something went wrong.')

        if (btl[message.channel.guild]) {
            if (btl[message.guild.id].battling == true)
                return message.channel.send(`You can't reset a battle!`);
        }

        if (!message.member.permissions.serialize().ADMINISTRATOR)
            return message.channel.send("You lack sufficient permissions, I'm so sorry!");

        const arg = message.content.slice(prefix.length).trim().split(/ +/);

        console.log('BattleStatus: Starting Battle in PVP Mode');
        let charPath = dataPath+'/characters.json'
        let charRead = fs.readFileSync(charPath, {flag: 'as+'});
        let charFile = JSON.parse(charRead);

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
		
		let battlerID = 0;
        btl[message.guild.id].allies.members = [];
        for (const k in btl[message.guild.id].parties[arg[1]].members) {
			let charDefs = charFile[btl[message.guild.id].parties[arg[1]].members[k]]
            delete charDefs.lb
            delete charDefs.guard
			delete charDefs.status
			delete charDefs.statusturns

			if (!charDefs.name)
				charDefs.name = btl[message.guild.id].parties[arg[1]].members[k];

			let battlerDefs = charFuncs.genChar(charDefs, false, btl[message.guild.id].parties[arg[1]])

			if (btl[message.guild.id].allies.members.includes(battlerDefs))
				return message.channel.send("You can't battle yourself, " + battlerDefs.name)

			battlerDefs.team = "allies"
			battlerDefs.id = battlerID

			btl[message.guild.id].allies.members.push(battlerDefs)
			battlerID++;
        }

        btl[message.guild.id].enemies.members = [];
        for (const k in btl[message.guild.id].parties[arg[2]].members) {
			let charDefs = charFile[btl[message.guild.id].parties[arg[2]].members[k]]
            delete charDefs.lb
            delete charDefs.guard
			delete charDefs.status
			delete charDefs.statusturns

			if (!charDefs.name)
				charDefs.name = btl[message.guild.id].parties[arg[2]].members[k];

			let battlerDefs = charFuncs.genChar(charDefs, false, btl[message.guild.id].parties[arg[2]])

			if (btl[message.guild.id].enemies.members.includes(battlerDefs))
				return message.channel.send("You can't battle yourself, " + battlerDefs.name)

			battlerDefs.team = "enemies"
			battlerDefs.id = battlerID

			btl[message.guild.id].enemies.members.push(battlerDefs)
			battlerID++;
        }
		
		btl[message.guild.id].ranked = true
		if (arg[4] && arg[4].toLowerCase()) {
			if (arg[4].toLowerCase() === 'unranked' || arg[4].toLowerCase() === 'no' || arg[4].toLowerCase() === 'false')
				btl[message.guild.id].ranked = false;
		}
		
		// Owner Check
		if (btl[message.guild.id].ranked == true) {
			let ownerFighters = {}
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

			// Owner Check 2
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
		}

        // Set up Battle Vars
		turnFuncs.setUpBattleVars(btl[message.guild.id], message.guild.id)
        btl[message.guild.id].pvp = true;
        btl[message.guild.id].battleteam = arg[1];
        btl[message.guild.id].battleteam2 = arg[2];
        btl[message.guild.id].battlechannel = message.channel.id;

        client.user.setActivity("a PVP battle.", { type: 'WATCHING' });

		// Start with leaderskill shit
		charFuncs.startBattleLeaderSkill(btl[message.guild.id].allies.members)
		charFuncs.startBattleLeaderSkill(btl[message.guild.id].enemies.members)
		
		if (arg[3]) {
			let gameMode = arg[3].toLowerCase()
			let battlers = []
			for (const i in btl[message.guild.id].allies.members) {
				battlers.push(btl[message.guild.id].allies.members[i])
			}
			for (const i in btl[message.guild.id].enemies.members) {
				battlers.push(btl[message.guild.id].enemies.members[i])
			}

			// for certain skillbased gamemodes
			let skillPath = dataPath+'/skills.json'
			let skillRead = fs.readFileSync(skillPath, {flag: 'as+'});
			let skillFile = JSON.parse(skillRead);

			for (const i in battlers) {
				let charDefs = battlers[i]
				if (gameMode === "metronome") {
					console.log('BattleStatus: Gamemode is Metronome')

					charDefs.skills = ["Metronome"]
					btl[message.guild.id].pvpmode = "metronome"
				} else if (gameMode === "randskills" || gameMode === "randomskills") {
					console.log('BattleStatus: Gamemode is RandSkills')
					charDefs.skills = []

					let possibleSkills = []
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
						let statNum = Math.floor(Math.random()*99)
						charDefs[stats[k]] = statNum
					}
					
					charDefs.superweak = [];
					charDefs.weak = [];
					charDefs.resist = [];
					charDefs.block = [];
					charDefs.repel = [];
					charDefs.drain = [];
					
					const affinities = ["superweak", "weak", "weak", "weak", "normal", "normal", "normal", "normal", "resist", "resist", "block", "repel", "drain"]
					for (const k in Elements) {
						let statusNum = Math.floor(Math.random() * (affinities.length-1))

						if (affinities[statusNum] != "normal") 
							charDefs[affinities[statusNum]].push(Elements[k]);
					}
					
					btl[message.guild.id].pvpmode = "randstats"
				} else if (gameMode === "charfuck" || gameMode === "randall") {
					console.log('BattleStatus: Gamemode is CharFuck');

					charDefs.skills = []

					let possibleSkills = []
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
						let statNum = Math.floor(Math.random()*99)
						charDefs[stats[k]] = statNum
					}
					
					charDefs.superweak = [];
					charDefs.weak = [];
					charDefs.resist = [];
					charDefs.block = [];
					charDefs.repel = [];
					charDefs.drain = [];
					
					const affinities = ["superweak", "weak", "weak", "weak", "normal", "normal", "normal", "normal", "resist", "resist", "block", "repel", "drain"]
					for (const k in Elements) {
						if (Elements[k] === "status" || Elements[k] === "heal" || Elements[k] === "passive" || Elements[k] === "almighty")
							continue;
		
						let statusNum = Math.floor(Math.random() * (affinities.length-1))

						if (affinities[statusNum] != "normal") 
							charDefs[affinities[statusNum]].push(Elements[k]);
					}

					btl[message.guild.id].pvpmode = "charfuck"
				} else if (gameMode === 'enemies' || gameMode === 'randomenemy') {
					console.log('BattleStatus: Gamemode is Enemies');

					let randEnm = ''
					let possibleEnms = []
					let enmPath = `${dataPath}/Enemies/enemies-${message.guild.id}.json`
					let enmRead = fs.readFileSync(enmPath, {flag: 'as+'});
					let enmFile = JSON.parse(enmRead);
					for (const i in enmFile[message.guild.id]) {
						if (enemyFuncs.encounteredEnemy(i, message.guild.id))
							possibleEnms.push(i);
					}

					if (possibleEnms.length <= 0)
						return message.channel.send("This server either has no enemies, or hasn't encountered any.");

					randEnm = possibleEnms[Math.round(Math.random()*(possibleEnms.length-1))]

					const theOwner = charDefs.owner
					const oldName = charDefs.name
					const oldId = charDefs.id

					const enmDefs = enemyFuncs.genEnm(randEnm, message.guild.id);

					for (const i in enmDefs)
						charDefs[i] = enmDefs[i];

					charDefs.owner = theOwner
					charDefs.id = oldId
					charDefs.name += ` (${oldName})`

					delete charDefs.enemy
					delete charDefs.miniboss
					delete charDefs.boss
					delete charDefs.bigboss
					delete charDefs.diety
				} else {
					btl[message.guild.id].pvpmode = "none"
				}
			}
		} else
			btl[message.guild.id].pvpmode = "none";

        fs.writeFileSync(charPath, JSON.stringify(charFile, null, '    '));
        fs.writeFileSync(dataPath+'/Battles/battle-' + message.guild.id + '.json', JSON.stringify(btl, null, '    '));
        message.channel.send(`PVP between Team ${arg[1]} & Team ${arg[2]} has begun.`);
        console.log('BattleStatus: PVP Battle has Begun.');
		
		playThemeType(message.guild.id, "pvp")

        // rid of the message
        message.delete();
		
		// Determine Turn Order
		btl[message.guild.id].turnorder = getTurnOrder(btl[message.guild.id]);

        // Start with the first turn!
        setTimeout(function() {
			advanceTurn(btl, message.guild.id)
        }, 500)
    }

    if (command === 'startraid') {
		let raidPath = dataPath+'/raidenemy.json'
		let raidRead = fs.readFileSync(raidPath, {flag: 'as+'});
		let raidFile = JSON.parse(raidRead);

		if (!utilityFuncs.RPGBotAdmin(message.author.id))
            return message.channel.send('You lack sufficient permissions, apologies!');

        const arg = message.content.slice(prefix.length).trim().split(/ +/);
        if (arg[1] == null) {
            const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
				.setTitle(`${prefix}registerenemy`)
				.setDescription('(Args <Name> <Level> <HP> <MP> <Strength> <Magic> <Perception> <Endurance> <Charisma> <Inteligence> <Agility> <Luck> <Miniboss/Boss/BigBoss/Diety> "<Journal Entry>")\nBegin a raid battle. This battle can be fought amongst multiple servers. If you want to know what each stat does, check "rpg!registerchar"')
            message.channel.send({embeds: [DiscordEmbed]})
            return false
        }
	
        if (message.content.includes("@everyone") || message.content.includes("@here") || message.mentions.users.first())
            return message.channel.send(`You're really mean, you know that?`);

        if (!utilityFuncs.RPGBotAdmin(message.author.id)) {
            if (readEnm(arg[1], message.guild.id) && message.author.id != readEnm(arg[1], message.guild.id).creator)
                return message.channel.send("This enemy exists already. You have insufficient permissions to overwrite it.");
        }
		
		const journalEntry = message.content.slice(prefix.length).trim().split('"')[1];

		let raidDefs = enemyFuncs.writeRaidEnemy(message.author, message.guild.id, arg[1], parseInt(arg[2]), parseInt(arg[3]), parseInt(arg[4]), parseInt(arg[5]), parseInt(arg[6]), parseInt(arg[7]), parseInt(arg[8]), parseInt(arg[9]), parseInt(arg[10]), parseInt(arg[11]), parseInt(arg[12]), arg[13].toLowerCase(), journalEntry)
		message.channel.send(`👍 ${arg[1]} has been created! Now, please specify all skills. Type "continue" when you want to continue.`)
    }

    if (command === 'usemelee' || command === 'meleeatk' || command === 'melee') {
        const btl = readBattle(message.guild.id);
        const arg = message.content.slice(prefix.length).trim().split(/ +/);

        if (btl[message.guild.id].battling == false)
            return message.channel.send(`You can't cast a move out of battle!`);

		if (btl[message.guild.id].petattack)
			return message.channel.send("It's the group's pet's turn!");

		const tempTurnOrder = btl[message.guild.id].turnorder
		let defs = getBattlerFromID(btl[message.guild.id], tempTurnOrder[btl[message.guild.id].doturn], message.author.id)
		
		if (!defs) {
			message.channel.send("Invalid Position: Either you don't own this character or this character does not exist.")
			message.delete()
			return false
		}

        if (defs) {
            let charDefs = defs
			let charName = charDefs.name
		
			let allySide = btl[message.guild.id].allies.members
			let opposingSide = btl[message.guild.id].enemies.members
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
			
			let preText = ""
			if (charDefs.meleequote && charDefs.meleequote.length > 0) {
				let possibleQuote = Math.round(Math.random() * (charDefs.meleequote.length-1))
				preText = `*${charDefs.name}: "${charDefs.meleequote[possibleQuote]}"*\n`
			}
			
            if (opposingSide[parseInt(arg[2])]) {
				let enmDefs = opposingSide[parseInt(arg[2])]				
				if (enmDefs.hp <= 0) {
					message.channel.send("You can't attack a dead foe!")
					message.delete()
					return false
				}
				
				if (turnFuncs.showTimes(message.guild.id)) {
					btl[message.guild.id].canshowtime = false
				}

				let useText = attackFuncs.meleeFoe(charDefs, enmDefs, message.guild.id, null, btl)

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

            fs.writeFileSync(dataPath+'/Battles/battle-' + message.guild.id + '.json', JSON.stringify(btl, null, '    '));
        } else {
            message.channel.send(`There's been an issue finding your character!`);
            return
        }
    }

    if (command === 'usemove' || command === 'useskill') {
        const btl = readBattle(message.guild.id);
        const arg = message.content.slice(prefix.length).trim().split(/ +/);

        let itemPath = dataPath+'/items.json'
        let itemRead = fs.readFileSync(itemPath, {flag: 'as+'});
        let itemFile = JSON.parse(itemRead);
		
		let skillPath = dataPath+'/skills.json'
        let skillRead = fs.readFileSync(skillPath, {flag: 'as+'});
        let skillFile = JSON.parse(skillRead);

		let charPath = dataPath+'/characters.json'
		let charRead = fs.readFileSync(charPath, {flag: 'as+'});
		let charFile = JSON.parse(charRead);

        if (btl[message.guild.id].battling == false) //{
			return message.channel.send('You can only do this in-battle!');
		
		/*
			if (charFile[arg[1]]) {
				let skillDefs = skillFile[arg[2]]
				if (!skillDefs.name) {skillDefs.name = arg[2]}

				let charDefs = charFile[arg[1]]

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

				let finalText = ""
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
						finalText = `${arg[1]} used ${arg[2]}`;
						if (arg[3] && charFile[arg[3]]) {
							finalText += ` on ${arg[3]}`
							
							charFile[arg[1]].buffs = {
								atk: 0,
								mag: 0
							}
							charFile[arg[3]].buffs = {
								end: 0
							}

							let dmg = attackFuncs.generateDmg(charFile[arg[1]], charFile[arg[3]], skillDefs, message.guild.id, null, btl)
							if (dmg <= 0) {
								if (dmg[1] === 'miss')
									finalText += `, but ${arg[3]} dodged it.`
								else
									finalText += `, but ${arg[3]} blocked it.`
							} else {
								let dmgVal = dmg[0] + utilityFuncs.randNum(10)
								finalText += `, dealing ${dmgVal}`
								if (dmg[2] == true)
									finalText += '<:effective:876899270731628584>';
								else if (dmg[1] === "resist")
									finalText += '<:resist:877132670784647238>';

								if (dmg[3] == true)
									finalText += '<:crit:876905905248145448>';
								
								finalText += ' damage!'
								charFile[arg[3]].hp = Math.max(1, charFile[arg[3]].hp - dmgVal)
							}
							
							delete charFile[arg[1]].buffs
							delete charFile[arg[3]].buffs
						} else {
							finalText += '!'
						}
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
		*/

		if (btl[message.guild.id].petattack)
			return message.channel.send("It's the group's pet's turn!")

		const tempTurnOrder = btl[message.guild.id].turnorder
		let defs = getBattlerFromID(btl[message.guild.id], tempTurnOrder[btl[message.guild.id].doturn], message.author.id)
		
		if (!defs) {
			message.channel.send("Invalid Position: Either you don't own this character or this character does not exist.")
			message.delete()
			return false
		}

        if (defs) {
            let charDefs = defs
			let charName = charDefs.name

			let allySide = btl[message.guild.id].allies.members ? btl[message.guild.id].allies.members : [];
			let allyBackup = btl[message.guild.id].allies.backup ? btl[message.guild.id].allies.backup : [];
			let opposingSide = btl[message.guild.id].enemies.members ? btl[message.guild.id].enemies.members : [];
			let opposingBackup = btl[message.guild.id].enemies.backup ? btl[message.guild.id].enemies.backup : [];
			let partyDefs = btl[message.guild.id].parties[btl[message.guild.id].battleteam] ? btl[message.guild.id].parties[btl[message.guild.id].battleteam] : {};
			if (charFuncs.isOpposingSide(charDefs, btl[message.guild.id])) {
				allySide = btl[message.guild.id].enemies.members ? btl[message.guild.id].enemies.members : [];
				allyBackup = btl[message.guild.id].enemies.members ? btl[message.guild.id].enemies.backup : [];
				opposingSide = btl[message.guild.id].allies.members ? btl[message.guild.id].allies.members : [];
				opposingBackup = btl[message.guild.id].allies.backup ? btl[message.guild.id].allies.backup : [];
				partyDefs = btl[message.guild.id].parties[btl[message.guild.id].battleteam2] ? btl[message.guild.id].parties[btl[message.guild.id].battleteam2] : {};
			}

            if (!message.member.permissions.serialize().ADMINISTRATOR) {
                if (message.author.id != charDefs.owner) {
                    message.channel.send("You can't control someone else's character!")
					message.delete()
                    return false
                }
            }

            let skillName = arg[3]
            let skillDefs = skillFile[skillName]

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

			if (charDefs.type == "dazed" && skillDefs.atktype === 'physical') {
				message.channel.send("You can't use _physical_ use skills while afflicted with Silence!")
				message.delete()
				return false
			} else if (charDefs.type == "silence" && (!skillDefs.atktype || skillDefs.atktype === 'magic')) {
				message.channel.send("You can't use _magic_ skills while afflicted with Silence!")
				message.delete()
				return false
			}

			if (skillDefs.type == "heal" && charDefs.status === "ego") {
				message.channel.send("You can't heal while afflicted with Ego!")
				message.delete()
				return false
			}	

			if (charDefs.rageSoul) {
				message.channel.send(`${charDefs.name} has used ${charDefs.rageSoul} previously, and so, cannot use regular skills.`)
				message.delete()
				return false
			}	

			if (skillDefs.ohko && btl[message.guild.id].pvp) {
				message.channel.send("You can't use OHKOs in PVP!")
				message.delete()
				return false
			}	

			// Skill's cost
			let skillCostDefs = {
				cost: skillDefs.cost,
				costType: skillDefs.costtype
			}			
			
			// Leader Skill
			let skillCost = skillCostDefs.cost ? skillCostDefs.cost : 0;
			console.log(`used ${skillCost}${skillCostDefs.costType}`);

			for (const i in allySide) {
				if (allySide[i].leader) {
					if (allySide[i].leaderSkill && allySide[i].leaderSkill.type === "discount") {
						if (allySide[i].leaderSkill.target === skillDefs.type ||
							allySide[i].leaderSkill.target === "all" ||
							allySide[i].leaderSkill.target === "magic" && skillDefs.atktype === "magic" ||
							allySide[i].leaderSkill.target === "physical" && skillDefs.atktype === "physical") {
								let skillDeduct = Math.round((skillCost/100)*allySide[i].leaderSkill.percent)
								console.log(`take away ${allySide[i].leaderSkill.percent}% - ${skillDeduct}`)

								skillCost -= skillDeduct
								console.log(`leaderskill reduced to ${skillCost}${skillDefs.costtype}`)
						}
					}
				}
			}
			
			// Charms
			if (charFuncs.equippedCharm(charDefs, "Reservationist") && skillDefs.atktype === "magic")
				skillCost = Math.round(skillCost*0.6);

			if (charFuncs.equippedCharm(charDefs, "QuickFocus") && skillDefs.type === "heal")
				skillCost = Math.round(skillCost*0.8);

			if (charFuncs.equippedCharm(charDefs, "DeepFocus") && skillDefs.type === "heal")
				skillCost = Math.round(skillCost*1.2);

			// Can use skill?
			console.log(`${skillCost}${skillCostDefs.costType}`)

			if (skillCost > 0) {
				if (skillCostDefs.costType && skillCostDefs.costType === "hp") {
					if (charDefs.hp <= skillCost) {
						return message.channel.send(`Not enough HP! (Need ${skillCost}HP)`)
					} else if (!charDefs.boss) {
						charDefs.hp -= skillCost
					}
				} else if (skillCostDefs.costType && skillCostDefs.costType === "hppercent") {
					if (charDefs.hp <= ((charDefs.maxhp/100)*skillCost)) {
						return message.channel.send(`Not enough HP! (Need ${Math.round((charDefs.maxhp / 100) * skillCost)}HP)`)
					} else if (!charDefs.boss) {
						charDefs.hp -= ((charDefs.maxhp / 100) * skillCost)
					}
				} else if (skillCostDefs.costType && skillCostDefs.costType === "mppercent") {
					if (charDefs.mp < ((charDefs.maxmp / 100)*skillCost)) {
						return message.channel.send(`Not enough MP! (Need ${Math.round((charDefs.maxmp / 100) * skillCost)}MP)`)
					} else {
						charDefs.mp -= ((charDefs.maxmp / 100) * skillCost)
					}
				} else if (skillCostDefs.costType && skillCostDefs.costType === "money") {
					if (partyDefs.rings < skillCost) {
						return message.channel.send(`Not enough money! (Need ${skillCost} money)`)
					} else {
						partyDefs.rings -= skillCost
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
			
			// Copy Skill
			if (skillDefs.copyskill) {
				let possibleSkills = []
				for (const val in allySide) {
					if (allySide[val].id != charDefs.id) {
						for (const i in allySide[val].skills) {
							let skillDefs = skillFile[allySide[val].skills[i]]
							if (skillDefs.type != "heal" && skillDefs.type != "status" && skillDefs.type != "passive") {
								possibleSkills.push(allySide[val].skills[i])
							}
						}
					}
				}
				
				if (possibleSkills.length > 0) {
					let skillVal = possibleSkills[Math.round(Math.random() * (possibleSkills.length-1))]
					
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
				let possibleSkills = []
				for (const val in skillFile) {
					if (skillFile[val].type != "heal" && (skillFile[val].type != "status" && !skillFile[val].buff) && skillFile[val].type != "passive" && val != "Metronome") {
						possibleSkills.push(val)
					}
				}

				let skillVal = possibleSkills[Math.round(Math.random() * (possibleSkills.length-1))]
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

					case "money":
						if (partyDefs.rings > skillDefs.needlessthan) {
							message.channel.send(`This move will fail, don't use it! (${charDefs.hp} Money > ${skillDefs.needlessthan} Money)`)
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

			/*
				FINALLY TIME TO ATTACK
				
				Heal skills and Status skills have their own section.
			*/

            if (skillDefs.type == "heal") {
				let healQuote = ""
				if (charDefs.healquote && charDefs.healquote.length > 0) {
					let possibleQuote = Math.round(Math.random() * (charDefs.healquote.length-1))
					healQuote = `*${charDefs.name}: "${charDefs.healquote[possibleQuote]}"*\n`
				}
				
				let healedQuote = ""

				let affinityMessage = ``;
                if (skillDefs.healall || skillDefs.target && skillDefs.target === "allallies") {
					while (healQuote.includes('%ALLY%'))
						healQuote = healQuote.replace('%ALLY%', 'Allies')

                    if (skillDefs.fullheal) {
                        for (const i in allySide) {
                            let partyDef = allySide[i]
                            if (partyDef.hp > 0) {
                                partyDef.hp = partyDef.maxhp

								affinityMessage += turnFuncs.healPassives(partyDef)
							
								if (partyDef != charDefs && partyDef.helpedquote && partyDef.helpedquote.length > 0) {
									let possibleQuote = Math.round(Math.random() * (partyDef.helpedquote.length-1))
									let theQuote = `\n*${partyDef.name}: "${partyDef.helpedquote[possibleQuote]}"*`

									while (theQuote.includes('%ALLY%'))
										theQuote = theQuote.replace('%ALLY%', charName)

									healedQuote += theQuote
								}
								
								charFuncs.trustUp(partyDef, charDefs, 10, message.guild.id, client)
                            }
                        }
	
						if (skillDefs.debuffuser) {
							charDefs.buffs[skillDefs.debuffuser] = Math.max(-3, charDefs.buffs[skillDefs.debuffuuser]-1)
							affinityMessage += `\n\n${userName}'s ${skillDefs.debuffuser.toUpperCase()} was debuffed!`
						}

                        DiscordEmbed = new Discord.MessageEmbed()
                            .setColor('#e36b2b')
							.setTitle(`${charName} => Party`)
							.setDescription(`${healQuote}${charName} used ${skillName}!\nThe Party's HP was fully restored.${healedQuote} ${affinityMessage}`)
                            .setFooter(`${charName}'s turn`);
                    } else if (skillDefs.statusheal) {
                        for (const i in allySide) {
                            let partyDef = allySide[i]
                            if (partyDef.hp > 0) {
								if (partyDef.status === "hunger") {
									partyDef.atk = Math.round(partyDef.atk*2)
									partyDef.mag = Math.round(partyDef.mag*2)
									partyDef.prc = Math.round(partyDef.prc*2)
									partyDef.agl = Math.round(partyDef.agl*2)
								}

                                partyDef.status = "none";
                                partyDef.statusturns = 0;
							
								affinityMessage += turnFuncs.healPassives(partyDef)
							
								if (partyDef != charDefs && partyDef.helpedquote && partyDef.helpedquote.length > 0) {
									let possibleQuote = Math.round(Math.random() * (partyDef.helpedquote.length-1))
									let theQuote = `\n*${partyDef.name}: "${partyDef.helpedquote[possibleQuote]}"*`

									while (theQuote.includes('%ALLY%'))
										theQuote = theQuote.replace('%ALLY%', charName)

									healedQuote += theQuote
								}
								
								charFuncs.trustUp(partyDef, charDefs, 10, message.guild.id, client)
                            }
                        }
	
						if (skillDefs.debuffuser) {
							charDefs.buffs[skillDefs.debuffuser] = Math.max(-3, charDefs.buffs[skillDefs.debuffuuser]-1)
							affinityMessage += `\n\n${userName}'s ${skillDefs.debuffuser.toUpperCase()} was debuffed!`
						}

						DiscordEmbed = new Discord.MessageEmbed()
                            .setColor('#e36b2b')
							.setTitle(`${charName} => Party`)
							.setDescription(`${healQuote}${charName} used ${skillName}!\nThe Party was cured of their status ailments.${healedQuote} ${affinityMessage}`)
                            .setFooter(`${charName}'s turn`);
                    } else if (skillDefs.healmp) {
                        let txt = ``
                        for (const i in allySide) {
                            let partyDef = allySide[i]								

							let heal = Math.round(skillDefs.pow-8 + Math.round(Math.random()*16))
							
							// Trust Level 10+ will have 10% increased healing.
							if (!btl[message.guild.id].pvp) {
								if (charDefs.id != partyDef.id && charDefs.trust[partyDef.truename] && charDefs.trust[partyDef.truename].level >= 10)
									heal *= 1.1;
							}

							// Magic Buffs incease/decrease healing.
							if (charDefs.buffs.mag) {
								let aff = 1+parseFloat(charDefs.buffs.mag/10)
								heal *= aff
							}

							// Main Element of Heal have increased healing
							if (charDefs.mainElement === 'heal')
								heal *= 1.1;

							// Charms
							if (charFuncs.equippedCharm(charDefs, "DeepFocus"))
								heal *= 1.25;
							if (charFuncs.equippedCharm(charDefs, "Reservationist"))
								heal *= 0.8;

                            partyDef.mp = Math.round(Math.min(partyDef.maxmp, partyDef.mp + heal))
                            txt += `\n${partyDef.name}'s MP was restored by ${Math.round(heal)}. (${partyDef.mp}/${partyDef.maxmp}MP)`
							
							txt += turnFuncs.healPassives(partyDef)
							
							if (partyDef != charDefs && partyDef.helpedquote && partyDef.helpedquote.length > 0) {
								let possibleQuote = Math.round(Math.random() * (partyDef.helpedquote.length-1))
								let theQuote = `\n*${partyDef.name}: "${partyDef.helpedquote[possibleQuote]}"*`

								while (theQuote.includes('%ALLY%'))
									theQuote = theQuote.replace('%ALLY%', charName)
								
								txt += theQuote
							}
							
							charFuncs.trustUp(partyDef, charDefs, 10, message.guild.id, client)
                        }
	
						if (skillDefs.debuffuser) {
							charDefs.buffs[skillDefs.debuffuser] = Math.max(-3, charDefs.buffs[skillDefs.debuffuuser]-1)
							txt += `\n\n${userName}'s ${skillDefs.debuffuser.toUpperCase()} was debuffed!`
						}

						DiscordEmbed = new Discord.MessageEmbed()
                            .setColor('#e36b2b')
							.setTitle(`${charName} => Party`)
							.setDescription(`${healQuote}${charName} used ${skillName}!\nThe Party's MP was restored by ${skillDefs.pow}!\n${txt}`)
                            .setFooter(`${charName}'s turn`);
                    } else if (skillDefs.recarmdra) {
                        let txt = ``
                        for (const i in allySide) {
                            let partyDef = allySide[i];

                            partyDef.hp = partyDef.maxhp;
                            partyDef.mp = partyDef.maxmp;

							txt += turnFuncs.healPassives(partyDef)
							
							if (partyDef != charDefs && partyDef.helpedquote && partyDef.helpedquote.length > 0) {
								let possibleQuote = Math.round(Math.random() * (partyDef.helpedquote.length-1))
								let theQuote = `\n*${partyDef.name}: "${partyDef.helpedquote[possibleQuote]}"*`

								while (theQuote.includes('%ALLY%'))
									theQuote = theQuote.replace('%ALLY%', charName)
								
								txt += theQuote
							}
							
							charFuncs.trustUp(partyDef, charDefs, 80, message.guild.id, client)
                        }

						if (charFuncs.equippedCharm(charDefs, "Reservationist"))
							charDefs.hp = 1;
						else
							charDefs.hp = 0;

						DiscordEmbed = new Discord.MessageEmbed()
                            .setColor('#e36b2b')
							.setTitle(`${charName} => Party`)
							.setDescription(`${healQuote}${charName} used ${skillName}!\nThe Party's HP & MP was fully restored!\n${txt}\n\n${charName} sacrificed themselves!`)
                            .setFooter(`${charName}'s turn`);
                    } else if (skillDefs.regenerate) {
                        let txt = ``
                        for (const i in allySide) {
                            let partyDef = allySide[i]								

							let heal = Math.round(skillDefs.pow-8 + Math.round(Math.random()*16))
							
							// Trust Level 10+ will have 10% increased healing.
							if (!btl[message.guild.id].pvp) {
								if (charDefs.id != partyDef.id && charDefs.trust[partyDef.truename] && charDefs.trust[partyDef.truename].level >= 10)
									heal *= 1.1;
							}

							// Magic Buffs incease/decrease healing.
							if (charDefs.buffs.mag) {
								let aff = 1+parseFloat(charDefs.buffs.mag/10)
								heal *= aff
							}

							// Main Element of Heal have increased healing
							if (charDefs.mainElement === 'heal')
								heal *= 1.1;

							// Charms
							if (charFuncs.equippedCharm(charDefs, "DeepFocus"))
								heal *= 1.25;
							if (charFuncs.equippedCharm(charDefs, "Reservationist"))
								heal *= 0.8;

                            partyDef.regenHeal = [Math.round(heal), skillDefs.crit];
                            txt += `\nA healing aura surrounds ${partyDef.name}!`

							txt += turnFuncs.healPassives(partyDef)
							if (partyDef != charDefs && partyDef.helpedquote && partyDef.helpedquote.length > 0) {
								let possibleQuote = Math.round(Math.random() * (partyDef.helpedquote.length-1))
								let theQuote = `\n*${partyDef.name}: "${partyDef.helpedquote[possibleQuote]}"*`

								while (theQuote.includes('%ALLY%'))
									theQuote = theQuote.replace('%ALLY%', charName)
								
								txt += theQuote
							}

							charFuncs.trustUp(partyDef, charDefs, 10, message.guild.id, client)
                        }
	
						if (skillDefs.debuffuser) {
							charDefs.buffs[skillDefs.debuffuser] = Math.max(-3, charDefs.buffs[skillDefs.debuffuuser]-1)
							txt += `\n\n${userName}'s ${skillDefs.debuffuser.toUpperCase()} was debuffed!`
						}

						DiscordEmbed = new Discord.MessageEmbed()
                            .setColor('#e36b2b')
							.setTitle(`${charName} => Party`)
							.setDescription(`${healQuote}${charName} used ${skillName}!\n${txt}`)
                            .setFooter(`${charName}'s turn`);
                    } else {
                        let txt = ``;
                        for (const i in allySide) {
                            let partyDef = allySide[i]
                            if (partyDef.hp > 0) {
								// Trust Level 10+ will have 10% increased healing.
								let heal = Math.round(skillDefs.pow-8 + Math.round(Math.random()*16))
								if (!btl[message.guild.id].pvp) {
									if (charDefs.id != partyDef.id && charDefs.trust[partyDef.truename] && charDefs.trust[partyDef.truename].level >= 10) {
										heal *= 1.1
									}
								}

								// Magic Buffs incease/decrease healing.
								if (charDefs.buffs.mag) {
									let aff = 1+parseFloat(charDefs.buffs.mag/10)
									heal *= aff
								}

								// Main Element of Heal have increased healing
								if (charDefs.mainElement === 'heal')
									heal *= 1.1;

								// Charms
								if (charFuncs.equippedCharm(charDefs, "DeepFocus"))
									heal *= 1.25;
								if (charFuncs.equippedCharm(charDefs, "Reservationist"))
									heal *= 0.8;
		
								partyDef.hp = Math.round(Math.min(partyDef.maxhp, partyDef.hp + heal))
								
                                txt += `\n${partyDef.name}'s HP was restored by ${Math.round(heal)}. (${partyDef.hp}/${partyDef.maxhp}HP)`							
								txt += turnFuncs.healPassives(partyDef)
							
								if (partyDef != charDefs && partyDef.helpedquote && partyDef.helpedquote.length > 0) {
									let possibleQuote = Math.round(Math.random() * (partyDef.helpedquote.length-1))
									let theQuote = `\n*${partyDef.name}: "${partyDef.helpedquote[possibleQuote]}"*`

									if (theQuote.includes('%ALLY%'))
										theQuote = theQuote.replace('%ALLY%', charName)

									txt += theQuote
								}
								
								charFuncs.trustUp(partyDef, charDefs, 10, message.guild.id, client)
                            }
                        }
	
						if (skillDefs.debuffuser) {
							charDefs.buffs[skillDefs.debuffuser] = Math.max(-3, charDefs.buffs[skillDefs.debuffuuser]-1)
							txt += `\n\n${userName}'s ${skillDefs.debuffuser.toUpperCase()} was debuffed!`
						}

                        DiscordEmbed = new Discord.MessageEmbed()
                            .setColor('#e36b2b')
							.setTitle(`${charName} => Party`)
							.setDescription(`${healQuote}${charName} used ${skillName}!\n${txt}`)
                            .setFooter(`${charName}'s turn`);
                    }
                } else {
//					let closerQuote = ''

					let charDefs2 = charDefs
					let charName2 = charName
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
							let possibleQuote = Math.round(Math.random() * (charDefs2.helpedquote.length-1))
							let theQuote = `\n*${charDefs2.name}: "${charDefs2.helpedquote[possibleQuote]}"*`

							if (theQuote.includes('%ALLY%'))
								theQuote = theQuote.replace('%ALLY%', charName)

							healedQuote += theQuote
						}

						// Trust Levels
						charFuncs.trustUp(charDefs2, charDefs, 25, message.guild.id, client)
	
						if (skillDefs.debuffuser) {
							charDefs.buffs[skillDefs.debuffuser] = Math.max(-3, charDefs.buffs[skillDefs.debuffuuser]-1)
							healedQuote += `\n\n${userName}'s ${skillDefs.debuffuser.toUpperCase()} was debuffed!`
						}

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
						let passives = turnFuncs.healPassives(charDefs2)
						
						if (charDefs2.helpedquote && charDefs2.helpedquote.length > 0) {
							let possibleQuote = Math.round(Math.random() * (charDefs2.helpedquote.length-1))
							let theQuote = `\n*${charDefs2.name}: "${charDefs2.helpedquote[possibleQuote]}"*`

							if (theQuote.includes('%ALLY%'))
								theQuote = theQuote.replace('%ALLY%', charName)

							healedQuote += theQuote
						}

						// Trust Levels
						charFuncs.trustUp(charDefs2, charDefs, 20, message.guild.id, client)
	
						if (skillDefs.debuffuser) {
							charDefs.buffs[skillDefs.debuffuser] = Math.max(-3, charDefs.buffs[skillDefs.debuffuuser]-1)
							passives += `\n\n${userName}'s ${skillDefs.debuffuser.toUpperCase()} was debuffed!`
						}

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

						if (charDefs2.status === "hunger") {
							charDefs2.atk = Math.round(charDefs2.atk*2)
							charDefs2.mag = Math.round(charDefs2.mag*2)
							charDefs2.prc = Math.round(charDefs2.prc*2)
							charDefs2.agl = Math.round(charDefs2.agl*2)
						}

						charDefs2.status = "none";
						charDefs2.statusturns = 0;
						let passives = turnFuncs.healPassives(charDefs2)
						
						if (charDefs2.helpedquote && charDefs2.helpedquote.length > 0) {
							let possibleQuote = Math.round(Math.random() * (charDefs2.helpedquote.length-1))
							let theQuote = `\n*${charDefs2.name}: "${charDefs2.helpedquote[possibleQuote]}"*`

							if (theQuote.includes('%ALLY%'))
								theQuote = theQuote.replace('%ALLY%', charName)

							healedQuote += theQuote
						}

						// Trust Levels
						charFuncs.trustUp(charDefs2, charDefs, 20, message.guild.id, client)
	
						if (skillDefs.debuffuser) {
							charDefs.buffs[skillDefs.debuffuser] = Math.max(-3, charDefs.buffs[skillDefs.debuffuuser]-1)
							passives += `\n\n${userName}'s ${skillDefs.debuffuser.toUpperCase()} was debuffed!`
						}

						DiscordEmbed = new Discord.MessageEmbed()
							.setColor('#e36b2b')
							.setTitle(`${charName} => ${charName2}`)
							.setDescription(`${healQuote}${charName} used ${skillName}!\n${charName2} was cured of their status!\n${passives}${healedQuote}`)
							.setFooter(`${charName}'s turn`);
					} else if (skillDefs.healmp) {
						// Trust Level 10+ will have 10% increased healing.
						let heal = Math.round(skillDefs.pow-8 + Math.round(Math.random()*16))
						if (!btl[message.guild.id].pvp) {
							if (charDefs.id != charDefs2.id && charDefs.trust[charDefs2.truename] && charDefs.trust[charDefs2.truename].level >= 10) {
								heal *= 1.1
							}
						}

						// Magic Buffs incease/decrease healing.
						if (charDefs.buffs.mag) {
							let aff = 1+parseFloat(charDefs.buffs.mag/10)
							heal *= aff
						}

						// Main Element of Heal have increased healing
						if (charDefs.mainElement === 'heal')
							heal *= 1.1;

						// Charms
						if (charFuncs.equippedCharm(charDefs, "DeepFocus"))
							heal *= 1.25;
						if (charFuncs.equippedCharm(charDefs, "Reservationist"))
							heal *= 0.8;

						charDefs2.mp = Math.min(charDefs2.maxmp, charDefs2.mp + Math.round(heal))
						let passives = turnFuncs.healPassives(charDefs2)
						
						if (charDefs2.helpedquote && charDefs2.helpedquote.length > 0) {
							let possibleQuote = Math.round(Math.random() * (charDefs2.helpedquote.length-1))
							let theQuote = `\n*${charDefs2.name}: "${charDefs2.helpedquote[possibleQuote]}"*`

							if (theQuote.includes('%ALLY%'))
								theQuote = theQuote.replace('%ALLY%', charName)

							healedQuote += theQuote
						}

						// Trust Levels
						charFuncs.trustUp(charDefs2, charDefs, 20, message.guild.id, client)
	
						if (skillDefs.debuffuser) {
							charDefs.buffs[skillDefs.debuffuser] = Math.max(-3, charDefs.buffs[skillDefs.debuffuuser]-1)
							passives += `\n\n${userName}'s ${skillDefs.debuffuser.toUpperCase()} was debuffed!`
						}

						DiscordEmbed = new Discord.MessageEmbed()
							.setColor('#e36b2b')
							.setTitle(`${charName} => ${charName2}`)
							.setDescription(`${healQuote}${charName} used ${skillName}!\n${charName2}'s MP was restored by ${Math.round(heal)}! ${passives}${healedQuote}`)
							.setFooter(`${charName}'s turn`);
					} else if (skillDefs.mptohp) {
						charDefs2.hp = Math.min(charDefs2.maxhp, charDefs2.hp + charDefs.mp)
						charDefs.mp = 0

						let passives = turnFuncs.healPassives(charDefs2)
						
						if (charDefs2.helpedquote && charDefs2.helpedquote.length > 0) {
							let possibleQuote = Math.round(Math.random() * (charDefs2.helpedquote.length-1))
							let theQuote = `\n*${charDefs2.name}: "${charDefs2.helpedquote[possibleQuote]}"*`

							if (theQuote.includes('%ALLY%'))
								theQuote = theQuote.replace('%ALLY%', charName)

							healedQuote += theQuote
						}

						// Trust Levels
						charFuncs.trustUp(charDefs2, charDefs, 20, message.guild.id, client)
	
						if (skillDefs.debuffuser) {
							charDefs.buffs[skillDefs.debuffuser] = Math.max(-3, charDefs.buffs[skillDefs.debuffuuser]-1)
							passives += `\n\n${userName}'s ${skillDefs.debuffuser.toUpperCase()} was debuffed!`
						}

						DiscordEmbed = new Discord.MessageEmbed()
							.setColor('#e36b2b')
							.setTitle(`${charName} => ${charName2}`)
							.setDescription(`${healQuote}${charName} used ${skillName}!\n${charName2}'s remaining MP was converted into HP. ${passives}${healedQuote}`)
							.setFooter(`${charName}'s turn`);
					} else if (skillDefs.recarmdra) {
						charDefs2.hp = charDefs2.maxhp;
						charDefs2.mp = charDefs2.maxmp;
						
						charDefs.hp = 0;

						let passives = turnFuncs.healPassives(charDefs2)
						
						if (charDefs2.helpedquote && charDefs2.helpedquote.length > 0) {
							let possibleQuote = Math.round(Math.random() * (charDefs2.helpedquote.length-1))
							let theQuote = `\n*${charDefs2.name}: "${charDefs2.helpedquote[possibleQuote]}"*`

							if (theQuote.includes('%ALLY%'))
								theQuote = theQuote.replace('%ALLY%', charName)

							healedQuote += theQuote
						}

						// Trust Levels
						charFuncs.trustUp(charDefs2, charDefs, 80, message.guild.id, client)

						DiscordEmbed = new Discord.MessageEmbed()
							.setColor('#e36b2b')
							.setTitle(`${charName} => ${charName2}`)
							.setDescription(`${healQuote}${charName} used ${skillName}!\n${charName2}'s HP & MP was fully restored!\n${charName} sacrificed themselves!${passives}${healedQuote}`)
							.setFooter(`${charName}'s turn`);
					} else {
						if (charDefs2.hp <= 0) {
							message.channel.send(`You can't heal a dead character!`)
							message.delete()
							return
						}

						// Trust Level 10+ will have 10% increased healing.
						let heal = Math.round(skillDefs.pow-8 + Math.round(Math.random()*16))
						if (!btl[message.guild.id].pvp) {
							if (charDefs.id != charDefs2.id && charDefs.trust[charDefs2.truename] && charDefs.trust[charDefs2.truename].level >= 10) {
								heal *= 1.1
							}
						}

						// Magic Buffs incease/decrease healing.
						if (charDefs.buffs.mag) {
							let aff = 1+parseFloat(charDefs.buffs.mag/10)
							heal *= aff
						}

						// Main Element of Heal have increased healing
						if (charDefs.mainElement === 'heal')
							heal *= 1.1;

						// Charms
						if (charFuncs.equippedCharm(charDefs, "DeepFocus"))
							heal *= 1.25;
						if (charFuncs.equippedCharm(charDefs, "Reservationist"))
							heal *= 0.8;

						charDefs2.hp = Math.min(charDefs2.maxhp, charDefs2.hp + Math.round(heal))
						let passivesMsg = turnFuncs.healPassives(charDefs2)
						
						if (charDefs2.helpedquote && charDefs2.helpedquote.length > 0) {
							let possibleQuote = Math.round(Math.random() * (charDefs2.helpedquote.length-1))
							let theQuote = `\n*${charDefs2.name}: "${charDefs2.helpedquote[possibleQuote]}"*`

							if (theQuote.includes('%ALLY%'))
								theQuote = theQuote.replace('%ALLY%', charName)

							healedQuote += theQuote
						}

						// Trust Levels
						charFuncs.trustUp(charDefs2, charDefs, 20, message.guild.id, client)
	
						if (skillDefs.debuffuser) {
							charDefs.buffs[skillDefs.debuffuser] = Math.max(-3, charDefs.buffs[skillDefs.debuffuuser]-1)
							passivesMsg += `\n\n${userName}'s ${skillDefs.debuffuser.toUpperCase()} was debuffed!`
						}

						DiscordEmbed = new Discord.MessageEmbed()
							.setColor('#e36b2b')
							.setTitle(`${charName} => ${charName2}`)
							.setDescription(`${charName} used ${skillName}!\n${charName2}'s HP was restored by ${Math.round(heal)}! ${passivesMsg}${healedQuote}`)
							.setFooter(`${charName}'s turn`);
					}
                }
				
				if (skillDefs.pow && turnFuncs.limitBreaks(message.guild.id))
					charDefs.lb += Math.max(0, Math.floor(skillDefs.pow/8));
            } else if (skillDefs.type === "status") {
				if (skillDefs.celebrate) {
					DiscordEmbed = new Discord.MessageEmbed()
						.setColor('#e36b2b')
						.setTitle(`${charName} => Party`)
						.setDescription(`${charName} used ${skillName}!\n${charName} cheers! The rest of the party joins in!\n...If only this had an effect.`)
                } else if (skillDefs.splash) {
					DiscordEmbed = new Discord.MessageEmbed()
						.setColor('#e36b2b')
						.setTitle(`${charName} => Self`)
						.setDescription(`${charName} used ${skillName}!\n${charName} splashes!\n...If only this had an effect.`)
                } else if (skillDefs.analyse) {
                    if (opposingSide[parseInt(arg[2])]) {
                        let enmStats = opposingSide[parseInt(arg[2])]
                        const enmName = enmStats.name
						
						if (readEnm(enmName), message.guild.id) {
							const enmDefs = readEnm(enmName, message.guild.id)
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
					let healedQuote = "";
					let shieldMsg = '';

					let effect = 'shield'
					if (skillDefs.makarakarn)
						effect = 'makarakarn';
					else if (skillDefs.tetrakarn)
						effect = 'tetrakarn';
					else if (skillDefs.trap)
						effect = 'trap';

					if (skillDefs.target === "caster" || !arg[2]) {
                        charDefs[effect] = skillName

						if (effect === 'shield' && charDefs.mainElement === 'status')
							charDefs.powerShield = true;
						else if (effect === 'trap') {
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
								if (effect === 'shield' && charDefs.mainElement === 'status')
									allySide[i].powerShield = true;
								else if (effect === 'trap') {
									delete allySide[i][effect]
									allySide[i].trapType = {
										name: skillName,
										effect: skillDefs.effect
									}
								}

								let charName2 = allySide[i].name
									
								if (allySide[i].helpedquote && allySide[i].helpedquote.length > 0) {
									let possibleQuote = Math.round(Math.random() * (allySide[i].helpedquote.length-1))
									let theQuote = `\n*${charName2}: "${allySide[i].helpedquote[possibleQuote]}"*`

									if (theQuote.includes('%ALLY%'))
										theQuote = theQuote.replace('%ALLY%', charName)

									healedQuote += theQuote
								}

								if (allySide[i].id != charDefs.id)
									shieldMsg += `\n${turnFuncs.buffPassives(allySide[i])}`;

								charFuncs.trustUp(allySide[i], charDefs, 20, message.guild.id, client)
							}

							DiscordEmbed = new Discord.MessageEmbed()
								.setColor('#e36b2b')
								.setTitle(`${charName} => Allies`)
								.setDescription(`${charName} used ${skillName}!\nTheir allies were protected by ${skillName}.\n${shieldMsg}${healedQuote}`)
								.setFooter(`${charName}'s turn`);
						} else if (allySide[arg[2]]) {
							allySide[arg[2]][effect] = skillName
							if (effect === 'shield' && charDefs.mainElement === 'status')
								allySide[arg[2]].powerShield = true;
							else if (effect === 'trap') {
								delete allySide[arg[2]][effect]
								allySide[arg[2]].trapType = {
									name: skillName,
									effect: skillDefs.effect
								}
							}

							let charName2 = allySide[arg[2]].name
							if (allySide[arg[2]].helpedquote && allySide[arg[2]].helpedquote.length > 0) {
								let possibleQuote = Math.round(Math.random() * (allySide[arg[2]].helpedquote.length-1))
								let theQuote = `\n*${charName2}: "${allySide[arg[2]].helpedquote[possibleQuote]}"*`

								if (theQuote.includes('%ALLY%'))
									theQuote = theQuote.replace('%ALLY%', charName)

								healedQuote += theQuote
							}

							charFuncs.trustUp(allySide[arg[2]], charDefs, 20, message.guild.id, client)

							if (allySide[arg[2]].id != charDefs.id)
								shieldMsg = `\n${turnFuncs.buffPassives(allySide[arg[2]])}`;

							DiscordEmbed = new Discord.MessageEmbed()
								.setColor('#e36b2b')
								.setTitle(`${charName} => ${charName2}`)
								.setDescription(`${charName} used ${skillName}!\n${charName2} was protected by ${skillName}.${shieldMsg}${healedQuote}`)
								.setFooter(`${charName}'s turn`);
						} else {
							message.channel.send("Invalid Ally Position")
							message.delete()
							return false
						}
					}
				} else if (skillDefs.tetrabreak) {
					for (const i in opposingSide) {
						if (opposingSide[i].tetrakarn) delete opposingSide[i].tetrakarn;
					}

					DiscordEmbed = new Discord.MessageEmbed()
						.setColor('#e36b2b')
						.setTitle(`${charName} => All Opposing`)
						.setDescription(`${charName} used ${skillName}!\nThe foes' physical shields were broken!`)
				} else if (skillDefs.makarabreak) {
					for (const i in opposingSide) {
						if (opposingSide[i].makarakarn) delete opposingSide[i].makarakarn;
					}

					DiscordEmbed = new Discord.MessageEmbed()
						.setColor('#e36b2b')
						.setTitle(`${charName} => All Opposing`)
						.setDescription(`${charName} used ${skillName}!\nThe foes' magical shields were broken!`)
				} else if (skillDefs.shieldbreak) {
					for (const i in opposingSide) {
						if (opposingSide[i].shield) delete opposingSide[i].shield;
						if (opposingSide[i].trap) delete opposingSide[i].trap;
						if (opposingSide[i].trapType) delete opposingSide[i].trapType;
					}

					DiscordEmbed = new Discord.MessageEmbed()
						.setColor('#e36b2b')
						.setTitle(`${charName} => All Opposing`)
						.setDescription(`${charName} used ${skillName}!\nThe foes' magical shields were broken!`)
				} else if (skillDefs.orgiamode) {
					charDefs.orgiaMode = skillDefs.orgiamode
					charDefs.atk *= 2
					charDefs.mag *= 2
					charDefs.end /= 2

					DiscordEmbed = new Discord.MessageEmbed()
						.setColor('#e36b2b')
						.setTitle(`${charName} => Self`)
						.setDescription(`${charName} used ${skillName}!\n${charName}'s ATK and MAG stats are doubled, but their END stat is halved!`)
				} else if (skillDefs.ragesoul) {
					charDefs.rageSoul = skillName

					DiscordEmbed = new Discord.MessageEmbed()
						.setColor('#e36b2b')
						.setTitle(`${charName} => Self`)
						.setDescription(`${charName} used ${skillName}!\n${charName}'s ATK is doubled, but is stuck to melee attacking!`)
                } else if (skillDefs.status && skillDefs.statuschance) {
					let statusChance = Math.round(skillDefs.statuschance);
					if (charDefs.mainElement === 'status')
						statusChance *= 1.1;

					if (skillDefs.target == "allopposing") {
						let hitSomeone = false;
						let finaltext = `${charName} used ${skillName} on the foes!\n\n`;
						for (const i in opposingSide) {
							let enmDefs = opposingSide[i]
							if (enmDefs && enmDefs.status === "none") {
								let enmName = enmDefs.name

								let targ = (statusChance + (charDefs.chr - enmDefs.luk));
								if (attackFuncs.physStatus(skillDefs.status))
									targ = (statusChance + (charDefs.luk - enmDefs.luk));

								let chance = Math.round(Math.random()*100);

								if (chance <= targ || statusChance >= 100) {
									finaltext += attackFuncs.inflictStatus(enmDefs, skillDefs);
									if (charDefs.critquote && charDefs.critquote.length > 0) {
										let possibleQuote = utilityFuncs.randNum(charDefs.critquote.length-1)
										let critQuote = `\n*${charName}: "${charDefs.critquote[possibleQuote]}"*`

										let possibleAlly = utilityFuncs.randNum(allySide.length-1)
										if (allySide[possibleAlly] && critQuote.includes('%ALLY%'))
											critQuote.replace('%ALLY%', allySide[possibleAlly].name);

										finaltext += critQuote
									}
									if (enmDefs.hitquote && enmDefs.hitquote.length > 0) {
										let possibleQuote = utilityFuncs.randNum(enmDefs.hitquote.length-1)
										finaltext += `\n*${enmName}: "${enmDefs.hitquote[possibleQuote]}"*`
									}
								} else {
									finaltext += `${enmDefs.name} dodged it!`

									if (charDefs.missquote && charDefs.missquote.length > 0) {
										let possibleQuote = Math.round(Math.random() * (charDefs.missquote.length-1))
										finaltext += `\n*${charName}: "${charDefs.missquote[possibleQuote]}"*`
									}
									if (enmDefs.dodgequote && enmDefs.dodgequote.length > 0) {
										let possibleQuote = Math.round(Math.random() * (enmDefs.dodgequote.length-1))
										finaltext += `\n*${enmName}: "${enmDefs.dodgequote[possibleQuote]}"*`
									}
								}
								
								hitSomeone = true
								finaltext += '\n'
							}
						}
						
						if (!hitSomeone)
							return message.channel.send("This move will fail, don't use it! (All opponents have a status.)");
					} else {
						let enmDefs = opposingSide[parseInt(arg[2])]
						if (enmDefs && enmDefs.status === "none") {
							let enmName = enmDefs.name

							let targ = (statusChance + (charDefs.chr - enmDefs.luk));
							if (attackFuncs.physStatus(skillDefs.status))
								targ = (statusChance + (charDefs.luk - enmDefs.luk));

							let chance = Math.round(Math.random()*100);

							const movestatus = skillDefs.status

							let finaltext = `${charName} used ${skillName} on ${enmDefs.name}!\n`;
							if (chance <= targ || statusChance >= 100) {
								finaltext += attackFuncs.inflictStatus(enmDefs, skillDefs);
								if (charDefs.critquote && charDefs.critquote.length > 0) {
									let possibleQuote = utilityFuncs.randNum(charDefs.critquote.length-1)
									let critQuote = `\n*${charName}: "${charDefs.critquote[possibleQuote]}"*`
									
									let possibleAlly = utilityFuncs.randNum(allySide.length-1)
									if (allySide[possibleAlly] && critQuote.includes('%ALLY%'))
										critQuote.replace('%ALLY%', allySide[possibleAlly].name);
									
									finaltext += critQuote
								}
								if (enmDefs.hitquote && enmDefs.hitquote.length > 0) {
									let possibleQuote = utilityFuncs.randNum(enmDefs.hitquote.length-1)
									finaltext += `\n*${enmName}: "${enmDefs.hitquote[possibleQuote]}"*`
								}
							} else {
								finaltext += " But they dodged it!"

								if (charDefs.missquote && charDefs.missquote.length > 0) {
									let possibleQuote = Math.round(Math.random() * (charDefs.missquote.length-1))
									finaltext += `\n*${charName}: "${charDefs.missquote[possibleQuote]}"*`
								}
								if (enmDefs.dodgequote && enmDefs.dodgequote.length > 0) {
									let possibleQuote = Math.round(Math.random() * (enmDefs.dodgequote.length-1))
									finaltext += `\n*${enmName}: "${enmDefs.dodgequote[possibleQuote]}"*`
								}
							}
						}
					}

					DiscordEmbed = new Discord.MessageEmbed()
						.setColor('#e36b2b')
						.setTitle(`${charName} => ${enmName}`)
						.setDescription(`${finaltext}`)
						.setFooter(`${charName}'s turn`);
				} else if (skillDefs.buff) {
					let buffCount = skillDefs.buffCount ? skillDefs.buffCount : 1;
					let buffTxt = ['', '', ' twice', ' three times', ' four times', ' five times', ' completely'];
					let buffMsg = '';

					if (skillDefs.target == "allallies") {
						for (const i in allySide) {
							let charDefs2 = allySide[i];
							for (let i = 0; i < buffCount; i++) {
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

							if (charDefs2.id != charDefs.id)
								buffMsg += `\n${turnFuncs.buffPassives(charDefs2)}`;
						}
			
						DiscordEmbed = new Discord.MessageEmbed()
							.setColor('#e36b2b')
							.setTitle(`${charName} => All Allies`)
							.setDescription(`${charName} buffed their allies' ${(skillDefs.buff == "all") ? "Stats" : skillDefs.buff.toUpperCase()}${buffTxt[buffCount]}!${buffMsg}`)
							.setFooter(`${charName}'s turn`);
					} else if (skillDefs.target == "caster") {
						for (let i = 0; i < buffCount; i++) {
							if (skillDefs.buff == "all") {
								charDefs.buffs.atk = Math.min(3, charDefs.buffs.atk+1)
								charDefs.buffs.mag = Math.min(3, charDefs.buffs.mag+1)
								charDefs.buffs.end = Math.min(3, charDefs.buffs.end+1)
								charDefs.buffs.prc = Math.min(3, charDefs.buffs.prc+1)
								charDefs.buffs.agl = Math.min(3, charDefs.buffs.agl+1)
							} else {
								if (charDefs.buffs[skillDefs.buff] >= 3) {
									message.channel.send(`This move will fail, Don't use it! (${skillDefs.buff.toUpperCase()} already maximally buffed)`);
									message.delete();
									return false;
								}
								
								if (skillDefs.buff === 'prc' && charFuncs.equippedCharm(charDefs, "PureVision")) {
									message.channel.send("This move will fail, Don't use it! (Equipped Pure Vision and cannot buff PRC)");
									message.delete();
									return false;
								}

								charDefs.buffs[skillDefs.buff] = Math.min(3, charDefs.buffs[skillDefs.buff]+1)
							}
						}
			
						DiscordEmbed = new Discord.MessageEmbed()
							.setColor('#e36b2b')
							.setTitle(`${charName} => Self`)
							.setDescription(`${charName} buffed their own ${(skillDefs.buff == "all") ? "Stats" : skillDefs.buff.toUpperCase()}${buffTxt[buffCount]}!`)
							.setFooter(`${charName}'s turn`);
					} else {
						let charDefs2 = allySide[arg[2]]
						for (let i = 0; i < buffCount; i++) {
							if (skillDefs.buff == "all") {
								charDefs2.buffs.atk = Math.min(3, charDefs2.buffs.atk+1)
								charDefs2.buffs.mag = Math.min(3, charDefs2.buffs.mag+1)
								charDefs2.buffs.end = Math.min(3, charDefs2.buffs.end+1)
								charDefs2.buffs.prc = Math.min(3, charDefs2.buffs.prc+1)
								charDefs2.buffs.agl = Math.min(3, charDefs2.buffs.agl+1)
							} else {
								if (charDefs2.buffs[skillDefs.buff] >= 3) {
									message.channel.send(`This move will fail, Don't use it! (${charDefs2.name}'s ${skillDefs.buff.toUpperCase()} already maximally buffed)`);
									message.delete();
									return false;
								}
								
								if (skillDefs.buff === 'prc' && charFuncs.equippedCharm(charDefs2, "PureVision")) {
									message.channel.send("This move will fail, Don't use it! (Equipped Pure Vision and cannot buff PRC)");
									message.delete();
									return false;
								}

								charDefs2.buffs[skillDefs.buff] = Math.min(3, charDefs2.buffs[skillDefs.buff]+1)
							}
						}

						if (charDefs2.id != charDefs.id)
							buffMsg = `\n${turnFuncs.buffPassives(charDefs2)}`;
			
						DiscordEmbed = new Discord.MessageEmbed()
							.setColor('#e36b2b')
							.setTitle(`${charName} => ${charDefs2.name}`)
							.setDescription(`${charName} buffed ${charDefs2.name}'s ${(skillDefs.buff == "all") ? "Stats" : skillDefs.buff.toUpperCase()}${buffTxt[buffCount]}!${buffMsg}`)
							.setFooter(`${charName}'s turn`);
					}
				} else if (skillDefs.dualbuff) {
					let statStuff = '';
					if (skillDefs.target == "allallies") {
						for (const i in allySide) {
							let charDefs2 = allySide[i]

							for (const k in skillDefs.dualbuff) {
								charDefs2.buffs[skillDefs.dualbuff[k]] = Math.min(3, charDefs2.buffs[skillDefs.dualbuff[k]]+1);
								statStuff += `${skillDefs.dualbuff[k]}`
								
								if (i == skillDefs.dualbuff.length-2)
									statStuff += ' and '
								else if (i >= skillDefs.dualbuff.length-1)
									statStuff += '!'
								else
									statStuff += ', '
							}
						}

						DiscordEmbed = new Discord.MessageEmbed()
							.setColor('#e36b2b')
							.setTitle(`${charName} => All Allies`)
							.setDescription(`${charName} buffed their allies' ${statStuff}!`)
							.setFooter(`${charName}'s turn`);
					} else {
						if (!allySide[arg[1]])
							return message.channel.send('Invalid ally!')
						let charDefs2 = allySide[arg[1]];

						for (const k in skillDefs.dualbuff) {
							charDefs2.buffs[skillDefs.dualbuff[k]] = Math.min(3, charDefs2.buffs[skillDefs.dualbuff[k]]+1);
							statStuff += `${skillDefs.dualbuff[k]}`
							
							if (i == skillDefs.dualbuff.length-2)
								statStuff += ' and '
							else if (i >= skillDefs.dualbuff.length-1)
								statStuff += '!'
							else
								statStuff += ', '
						}

						DiscordEmbed = new Discord.MessageEmbed()
							.setColor('#e36b2b')
							.setTitle(`${charName} => ${charDefs2.name}`)
							.setDescription(`${charName} buffed ${charDefs2.name}'s ${statStuff}!`)
							.setFooter(`${charName}'s turn`);
					}
				} else if (skillDefs.debuff) {
					if (skillDefs.target == "allopposing") {
						for (const i in opposingSide) {
							let charDefs2 = opposingSide[i]
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
						let charDefs2 = opposingSide[arg[2]]
						if (skillDefs.debuff == "all") {
							charDefs2.buffs.atk = Math.max(-3, charDefs2.buffs.atk-1)
							charDefs2.buffs.mag = Math.max(-3, charDefs2.buffs.mag-1)
							charDefs2.buffs.end = Math.max(-3, charDefs2.buffs.end-1)
							charDefs2.buffs.prc = Math.max(-3, charDefs2.buffs.prc-1)
							charDefs2.buffs.agl = Math.max(-3, charDefs2.buffs.agl-1)
						} else {
							if (charDefs2.buffs[skillDefs.buff] <= -3) {
								message.channel.send(`This move will fail, Don't use it! (${charDefs2.name}'s ${skillDefs.buff.toUpperCase()} already maximally debuffed)`);
								message.delete();
								return false;
							}
								
							if (skillDefs.debuff === 'prc' && charFuncs.equippedCharm(charDefs2, "PureVision")) {
								message.channel.send(`This move will fail, Don't use it! (${charDefs2.name} has equipped Pure Vision and cannot debuff PRC)`);
								message.delete();
								return false;
							}

							charDefs2.buffs[skillDefs.debuff] = Math.max(-3, charDefs2.buffs[skillDefs.debuff]-1);
						}

						DiscordEmbed = new Discord.MessageEmbed()
							.setColor('#e36b2b')
							.setTitle(`${charName} => ${charDefs2.name}`)
							.setDescription(`${charName} debuffed ${charDefs2.name}'s ${(skillDefs.debuff == "all") ? "Stats" : skillDefs.debuff.toUpperCase()}!`)
							.setFooter(`${charName}'s turn`);
					}
				} else if (skillDefs.dualdebuff) {
					let statStuff = '';
					if (skillDefs.target == "allallies") {
						for (const i in opposingSide) {
							let charDefs2 = opposingSide[i]

							for (const k in skillDefs.dualbuff) {
								charFuncs.buffStat(charDefs2, skillDefs.dualbuff[k].toUpperCase(), -1)
								statStuff += `${skillDefs.dualbuff[k]}`
								
								if (i == skillDefs.dualbuff.length-2)
									statStuff += ' and '
								else if (i >= skillDefs.dualbuff.length-1)
									statStuff += '!'
								else
									statStuff += ', '
							}
						}
			
						DiscordEmbed = new Discord.MessageEmbed()
							.setColor('#e36b2b')
							.setTitle(`${charName} => All Opposing`)
							.setDescription(`${charName} debuffed the opposing side's ${statStuff}!`)
							.setFooter(`${charName}'s turn`);
					} else {
						let charDefs2 = opposingSide[arg[2]]
						for (const k in skillDefs.dualbuff) {
							charFuncs.buffStat(charDefs2, skillDefs.dualbuff[k].toUpperCase(), -1)
							statStuff += `${skillDefs.dualbuff[k]}`

							if (i == skillDefs.dualbuff.length-2)
								statStuff += ' and '
							else if (i >= skillDefs.dualbuff.length-1)
								statStuff += '!'
							else
								statStuff += ', '
						}

						DiscordEmbed = new Discord.MessageEmbed()
							.setColor('#e36b2b')
							.setTitle(`${charName} => ${charDefs2.name}`)
							.setDescription(`${charName} debuffed ${charDefs2.name}'s ${statStuff}!`)
							.setFooter(`${charName}'s turn`);
					}
				} else if (skillDefs.dekaja) {
					let debuffStats = ['atk', 'mag', 'end', 'agl', 'prc']
					if (skillDefs.target == "allopposing") {
						for (const i in opposingSide) {
							let charDefs2 = opposingSide[i]
							for (const k in debuffStats) {
								if (charDefs2.buffs[debuffStats[k]] > 0)
									charDefs2.buffs[debuffStats[k]] = 0;
							}
						}
			
						DiscordEmbed = new Discord.MessageEmbed()
							.setColor('#e36b2b')
							.setTitle(`${charDefs.name} => All Opposing`)
							.setDescription(`${charDefs.name} reverted the foes' stats to normal!`)
							.setFooter(`${charDefs.name}'s turn`);
					} else {
						if (!opposingSide[arg[1]])
							return message.channel.send('Invalid opponent!')

						let charDefs2 = opposingSide[arg[1]]
						for (const k in debuffStats) {
							if (charDefs2.buffs[debuffStats[k]] > 0)
								charDefs2.buffs[debuffStats[k]] = 0;
						}

						DiscordEmbed = new Discord.MessageEmbed()
							.setColor('#e36b2b')
							.setTitle(`${charDefs.name} => ${charDefs2.name}`)
							.setDescription(`${charDefs.name} reverted ${charDefs2.name}'s stats to normal!`)
							.setFooter(`${charDefs.name}'s turn`);
					}
				} else if (skillDefs.mimic) {
					if (charDefs.transformation){
						message.channel.send("This skill will fail! Don't use it! (Unable to mimic during transformation)")
						message.delete()
						return false
					}

					if (arg[4]) {
						let copyDefs
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
						
						if (copyDefs.mimic) {
							message.channel.send(`${copyDefs.name} is already mimicking something.`)
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
/*				} else if (skillDefs.bodyswap) {
					if (charDefs.transformation){
						message.channel.send("This skill will fail! Don't use it! (Unable to Body Swap during transformation)")
						message.delete()
						return false
					}

					let swapDefs = opposingSide[arg[2]];
					
					if (swapDefs.hp <= 0) {
						message.channel.send("You can't swap bodies with downed foes!")
						message.delete()
						return false
					}
					
					if (swapDefs.swapped) {
						message.channel.send("You can't swap bodies with foes that have already been swapped with!")
						message.delete()
						return false
					}
					
					if (swapDefs.miniboss || swapDefs.boss || swapDefs.bigboss || swapDefs.deity) {
						message.channel.send("You can't swap bodies with a boss!")
						message.delete()
						return false
					}

					DiscordEmbed = new Discord.MessageEmbed()
						.setColor('#e36b2b')
						.setTitle(`${charName} => ${swapDefs.name}`)
						.setDescription(`${charName} and ${swapDefs.name} swapped bodies!`)

					charFuncs.swapBodies(charDefs, swapDefs, 2)
*/				} else if (skillDefs.futuresight) {
					let oppDefs = opposingSide[arg[2]]
					
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
					let cloneDefs = utilityFuncs.cloneObj(charDefs)
					
					if (charDefs.mainElement === 'status') {
						cloneDefs.hp = 150
						cloneDefs.maxhp = 150
						cloneDefs.mp = 100
						cloneDefs.maxmp = 100
						cloneDefs.npc = true
					} else {
						cloneDefs.hp = 100
						cloneDefs.maxhp = 100
						cloneDefs.mp = 80
						cloneDefs.maxmp = 80
						cloneDefs.npc = true
					}
					
					for (const i in cloneDefs.skills) {
						if (cloneDefs.skills[i] === arg[3].toLowerCase())
							cloneDefs.skills.splice(i)
					}

					let battlerID = 1
					for (const i in allySide)
						battlerID++;
					for (const i in allyBackup)
						battlerID++;
					for (const i in opposingSide)
						battlerID++;
					for (const i in opposingBackup)
						battlerID++;

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
					let oppDefs = opposingSide[arg[2]]
					
					const stats = ["atkbuff", "magbuff", "endbuff", "prcbuff", "aglbuff"]
					for (const i in stats) {
						let stat1 = charDefs[stats[i]]
						let stat2 = oppDefs[stats[i]]

						charDefs[stats[i]] = stat2
						oppDefs[stats[i]] = stat1
					}
					
					DiscordEmbed = new Discord.MessageEmbed()
						.setColor('#e36b2b')
						.setTitle(`${charName} => ${oppDefs.name}`)
						.setDescription(`${charName} used ${skillDefs.name}!\n${charName} swapped stat buffs with ${oppDefs.name}!`)
				} else if (skillDefs.weather) {
					let weatherMessage = {
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
				} else if (skillDefs.reincarnate) {
					// no more than one reincarnate at a time
					for (const i in allySide) {
						if (allySide[i].undead && allySide[i].hp > 0)
							return message.channel.send("This move will fail! Don't use it! (No more than one reincarnate at a time)")
					}

					// ok go
					let newChar = utilityFuncs.cloneObj(charDefs)

					//Starting Stats
					if (charDefs.mainElement === 'status') {
						newChar.maxhp = Math.round(charDefs.maxhp / 3)
						newChar.hp = newChar.maxhp
						newChar.maxmp = Math.round(charDefs.maxmp / 2.8)
						newChar.mp = newChar.maxmp
						newChar.level = Math.floor(Math.random() * 20 + 10)
					} else {
						newChar.maxhp = Math.round(charDefs.maxhp / 4)
						newChar.hp = newChar.maxhp
						newChar.maxmp = Math.round(charDefs.maxmp / 3)
						newChar.mp = newChar.maxmp
						newChar.level = Math.floor(Math.random() * 19 + 1)
					}

					//Assign it a name
					let statusOfLivingList = [
						'Demon', 'Fallen', 'Undead', 'Ghouly', 'Skeleton', 'Dead', 'Zombie', 'Soulless', 'Ghostly', 'Spectral',
						'Impious', 'Ungodly', 'Reincarnated', 'Unfresh', 'Unholy', 'Revenant', 'Rotter', 'Recovering', 'Dying',
						'Necrotic', 'Non-living', 'Not-dead', 'Nympg', 'Geist', 'Poltergeist', 'Stillborn', 'Exanimated'
					]
					let speciesList = [
						'Hedgehog', 'Fox', 'Echidna', 'Bat', 'Crocodile', 'Bee', 'Wasp', 'Skunk',
						'Panda', 'Bearcat', 'Bear', 'Polar_Bear', 'Tanuki', 'Raccoon',
						'Raccoon_Dog', 'Axolotl', 'Pig', 'Cow', 'Chicken', 'Rooster', 'Mole', 'Shark', 'Snake',
						'Python', 'Cobra', 'Boa', 'Viper', 'Rattlesnake', 'Cod', 'Tuna', 'Seahorse',
						'Flounder', 'Spot', 'Snapper', 'Dolphin', 'Seal', 'Walrus', 'Cat', 'Dog', 'Chihuahua', 'Lion',
						'Tiger', 'Elephant', 'Giraffe', 'Hawk', 'Parrot', 'Zebra', 'Kangaroo', 'Spider',
						'Dragon', 'Ender_Dragon', 'Zombie', 'Wolf', 'Arctic_Wolf', 'Fox', 'Rabbit', 'Altarian',
						'Lizard', 'Gecko', 'Chameleon', 'Slime', 'Creature', 'Hybrid', 'Abomination', 
						'Amalgamation', 'Sheep', 'Ram', 'Lamb', 'Llama', 'Jacob_Sheep', 'Velociraptor', 'Raptor', 'Eagle',
						'Ghost', 'Winteriz', 'Spirit', 'Husk', 'AI', 'Robot', 'Cyborg',
						'Ocelot', 'Piglin', 'Salmon', 'Snow_Golem', 'Snowman', 'Iron_Golem', 'Mooshroom', 'Strider',
						'Tropical_Fish', 'Fish', 'Turtle', 'Tortoise', 'Skeleton', 'Strider', 'Drowned',
						'Illusioner', 'Killer_Bunny', 'Pufferfish', 'Donkey', 'Horse', 'Mule',
						'Skeleton_Horse', 'Goat', 'Pigman', 'Evoker', 'Vindicator', 'Ravager', 'Vex',
						'Guardian', 'Phantom', 'Blaze', 'Wither', 'Witch',
						'Hoglin', 'Warden', 'Jellyfish', 'Crab', 'Shrimp', 'Albatross', 'Duck',
						'Goose', 'Swan', 'Swallow', 'Sparrow', 'Vulture', 'Thylacine', 'Tenrec', 'Armadillo', 
						'Sloth', 'Grizzly_Bear', 'Fennec', 'Ostrich', 'Weasel', 'Otter', 'Deer', 'Buffalo',
						'Water_Buffalo', 'Orca', 'Whale', 'Pika', 'Degu', 'Okapi', 'Bush', 'Tree', 'Chipmunk', 
						'Squirrel', 'Lemming', 'Woodchuck', 'Flying_Squirrel', 'Koala', 'Monkey', 'Gorilla',
						'Orangutan', 'Beaver', 'Ibis', 'Mongoose', 'Tamandua', 'Scorpio'
					]

					let name1 = statusOfLivingList[Math.floor(Math.random() * (statusOfLivingList.length - 1))]
					let name2 = speciesList[Math.floor(Math.random() * (speciesList.length - 1))]

					newChar.name = `${name1} ${name2}`

					//Assign the new member an ID
					let battlerID = 0
					for (const i in allySide)
						battlerID++;
					for (const i in allyBackup)
						battlerID++;
					for (const i in opposingSide)
						battlerID++;
					for (const i in opposingBackup)
						battlerID++;

					newChar.id = battlerID

					// Assign Stats
					const stats = ["atk", "mag", "end", "chr", "int", "luk", "prc", "agl"]
					for (const k in stats) {
						let statNum = utilityFuncs.randNum(33)
						newChar[stats[k]] = statNum
					}

					// Assigning Skills
					let skillPath = dataPath+'/skills.json'
        			let skillRead = fs.readFileSync(skillPath, {flag: 'as+'});
        			let skillFile = JSON.parse(skillRead);

					newChar.skills = []

					let possibleSkills = ["Agilao", "Bufula", "Zionga", "Garula", "Hanama", "Aques", "Psio", "Jino", "Gryva", "Vocalao", "Dia", "Makakaja", "Tarukaja", "Rakukaja", "Visukaja", "Sukukaja", "Makanda", "Tarunda", "Rakunda", "Visunda", "Sukunda"]
					for (let k = 0; k < 2; k++) {
						const skillName = possibleSkills[Math.round(Math.random() * (possibleSkills.length-1))]
						newChar.skills.push(skillName)
					}

					// Assigning Affinities
					newChar.superweak = [];
					newChar.weak = [];
					newChar.resist = [];
					newChar.block = [];
					newChar.repel = [];
					newChar.drain = [];

					const affinities = ["superweak", "weak", "weak", "weak", "normal", "normal", "normal", "normal", "normal", "normal", "normal", "normal", "normal", "resist", "resist", "block", "repel", "drain"]
					for (const k in Elements) {
						if (Elements[k].type != "heal" && Elements[k].type != "status" && Elements[k].type != "passive" && Elements[k].type != "almighty"){
							let statusNum = Math.floor(Math.random() * (affinities.length-1))
							if (affinities[statusNum] != "normal") {newChar[affinities[statusNum]].push(Elements[k])}
						}
					}

					//Getting random shit
					newChar.trueName = newChar.name
					newChar.team = charDefs.team
					newChar.buffs = {
						atk: 0,
						mag: 0,
						end: 0,
						agl: 0,
						prc: 0
					}
					newChar.status = "none"
					newChar.melee = ["Strike Attack", "strike"]
					newChar.npc = true
					newChar.undead = true
					newChar.trust = {}
					delete newChar.leader

					allySide.push(newChar)
					DiscordEmbed = new Discord.MessageEmbed()
						.setColor('#e36b2b')
						.setTitle(`${charName} => Self`)
						.setDescription(`${charName} used ${skillDefs.name}!\n${charName} reincarnated a ${newChar.name} from the dead! `)
                } else if (skillDefs.mindcharge) {
					charDefs.mindcharge = true;
					charDefs.justcharged = true;

					DiscordEmbed = new Discord.MessageEmbed()
						.setColor('#e36b2b')
						.setTitle(`${charName} => Self`)
						.setDescription(`${charName} used ${skillName}!\n${charName} focuses to boost their magic by 2.5x.`)
					message.channel.send({embeds: [DiscordEmbed]})
				} else if (skillDefs.powercharge) {
					charDefs.powercharge = true;
					charDefs.justcharged = true;

					DiscordEmbed = new Discord.MessageEmbed()
						.setColor('#e36b2b')
						.setTitle(`${charName} => Self`)
						.setDescription(`${charName} used ${skillName}!\n${charName} tenses to boost their strength by 2.5x.`)
					message.channel.send({embeds: [DiscordEmbed]})
				} else if (skillDefs.batonpass) {
					if (charDefs.leader)
						return message.channel.send("This move will fail, don't use it! (Leaders can't switch out of battle)");

					if (allyBackup.length <= 0)
						return message.channel.send("This move will fail, don't use it! (No backup)")

					if (charDefs.orgiaMode)
						return message.channel.send("This move will fail, don't use it! (Can't switch yourself out during Orgia Mode")

					DiscordEmbed = new Discord.MessageEmbed()
						.setColor('#fcba03')
						.setTitle(`${charName} => Self`)
						.setDescription(`Who will you use ${skillDefs.name} on?`)
						.addFields()

					for (const i in allyBackup) {
						let backDefs = allyBackup[i]
						DiscordEmbed.fields.push({name: `${i}: ${backDefs.name}`, value: `${backDefs.hp}/${backDefs.maxhp}HP\n${backDefs.mp}/${backDefs.maxmp}MP`, inline: true});
					}

					// Await a responce
					message.channel.send({embeds: [DiscordEmbed]})

					var givenResponce = false
					var collector = message.channel.createMessageCollector({ time: 15000 });
					collector.on('collect', m => {
						if (m.author.id == message.author.id) {
							if (allyBackup[parseInt(m.content)]) {
								if (allyBackup[parseInt(m.content)].hp <= 0) {
									message.channel.send(`You can't use ${skillDefs.name} on downed allies!`);
									message.delete()
									m.delete()
								} else {
									DiscordEmbed = new Discord.MessageEmbed()
										.setColor('#fcba03')
										.setTitle(`${charName} => ${allyBackup[parseInt(m.content)].name}`)
										.setDescription(`${charName} switches position with ${allyBackup[parseInt(m.content)].name}, passing on all of their buffs!`)
									message.channel.send({embeds: [DiscordEmbed]})

									charFuncs.resetMimic(charDefs)
									
									delete charDefs.trap
									delete charDefs.trapType
									delete charDefs.tetrakarn
									delete charDefs.makarakarn
									delete charDefs.shield

									allyBackup[parseInt(m.content)].buffs = charDefs.buffs;

									let curDefs = utilityFuncs.cloneObj(charDefs)
									let newDefs = utilityFuncs.cloneObj(allyBackup[parseInt(m.content)])

									newDefs.id = curDefs.id

									charDefs = utilityFuncs.cloneObj(newDefs);
									allyBackup[parseInt(m.content)] = utilityFuncs.cloneObj(curDefs);

									fs.writeFileSync(`${dataPath}/Battles/battle-${message.guild.id}.json`, JSON.stringify(btl, null, '    '));

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
					});
					
					return
				} else {
                    message.channel.send(`This doesn't work yet!`)
					message.delete()
                    return false
                }
            } else {
				let server = message.guild.id

				/*
				for (const i in allySide) {
					if (allySide[i].trust[charName] && allySide[i].trust[charName].level >= 2 && Math.Random() < 0.2) {
						message.channel.send(`${charName} wants to show off for ${allySide[i].name}!`);
						skillDefs.pow *= 1.1
					}
				}
				*/
				
				if (skillDefs.target == 'everyone') {
					for (const i in allySide)
						charFuncs.trustUp(charDefs, allySide[i], -30, message.guild.id, client)
				}

				// Leader Skills
				for (const i in allySide) {
					if (allySide[i].leader) {
						if (allySide[i].leaderSkill && allySide[i].leaderSkill.type === "crit" && skillDefs.crit) {
							if (allySide[i].leaderSkill.target === skillDefs.type ||
								allySide[i].leaderSkill.target === "all" ||
								allySide[i].leaderSkill.target === "magic" && skillDefs.atktype === "magic" ||
								allySide[i].leaderSkill.target === "physical" && skillDefs.atktype === "physical") {
									skillDefs.crit += allySide[i].leaderSkill.percent
							}
						}
					}
				}

				for (const i in allySide) {
					if (allySide[i].leader) {
						if (allySide[i].leaderSkill && allySide[i].leaderSkill.type === "status" && skillDefs.status && skillDefs.statuschance) {
							if (allySide[i].leaderSkill.target === skillDefs.status || allySide[i].leaderSkill.target === "all")
								skillDefs.statuschance += allySide[i].leaderSkill.percent;
						}
					}
				}
				
				// Dizziness
				if (charDefs.status === "dizzy")
					skillDefs.acc /= 2
				
				// STAB
				if (charDefs.mainElement && charDefs.mainElement == skillDefs.type)
					skillDefs.pow *= 1.1;
				
				// Just in case
				Math.round(skillDefs.pow)

				// Now, strike!
				DiscordEmbed = attackFuncs.attackWithSkill(charDefs, arg[2], allySide, opposingSide, btl, skillDefs, server)
			}
			
			if (DiscordEmbed)
				message.channel.send({embeds: [DiscordEmbed]});
			else
				return message.channel.send('Something went wrong, so I stopped your movement. Try something else.');
			
			fs.writeFileSync(dataPath+'/Battles/battle-' + message.guild.id + '.json', JSON.stringify(btl, null, '    '));
            
            if (btl[message.guild.id].battling == true) {
                setTimeout(function() {
                    advanceTurn(btl, message.guild.id)
					
					setTimeout(function() {
						message.delete();
					}, 500)
                }, 1500)
            }
        } else
            return message.channel.send(`There's been an issue finding your character!`);
    }

    if (command === 'useitem') {
        const btl = readBattle(message.guild.id);
        const arg = message.content.slice(prefix.length).trim().split(/ +/);

        if (btl[message.guild.id].battling == false)
            return message.channel.send("You can't use an item out of battle, as that's not coded in yet.");

		if (btl[message.guild.id].petattack)
			return message.channel.send("It's the group's pet's turn!");

		if (btl[message.guild.id].testing)
			return message.channel.send('This is a test battle! No items!');

        let itemPath = dataPath+'/items.json'
        let itemRead = fs.readFileSync(itemPath, {flag: 'as+'});
        let itemFile = JSON.parse(itemRead);

        if (!itemFile[arg[2]]) {
            message.channel.send(`**${arg[2]}** isn't a valid item.`);
            message.delete()
            return
        }

		const tempTurnOrder = btl[message.guild.id].turnorder
		let defs = getBattlerFromID(btl[message.guild.id], tempTurnOrder[btl[message.guild.id].doturn], message.author.id)
		
		if (!defs) {
			message.channel.send("Invalid Position: Either you don't own this character or this character does not exist.")
			message.delete()
			return false
		}

        if (defs) {
            let charDefs = defs
			let charName = charDefs.name
			
			let allySide = btl[message.guild.id].allies.members
			let opposingSide = btl[message.guild.id].enemies.members
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
			
			if (!itemDefs.type)
				return message.channel.send("You can't use this item!");
			if (itemDefs.type === 'material')
				return message.channel.send("You can't use materials in-battle!");

            let party = []
			if (charFuncs.isOpposingSide(charDefs, btl[message.guild.id]))
				party = btl[message.guild.id].parties[btl[message.guild.id].battleteam2];
			else
				party = btl[message.guild.id].parties[btl[message.guild.id].battleteam];
			
			btl[message.guild.id].canshowtime = false
			
			let charDefs2 = charFighters[arg[3]]

			switch(itemDefs.type.toLowerCase()) {
				case 'heal':
					if (!party.items[itemName] || party.items[itemName] <= 0) {
						message.channel.send("You don't have any of this item!");
						message.delete();
						return false
					}

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
					charFuncs.trustUp(charDefs2, charDefs, 40, message.guild.id, client)

					var DiscordEmbed = new Discord.MessageEmbed()
						.setColor('#fcba03')
						.addFields(
							{ name: `${charName} => ${charDefs2.name}`, value: `${charName} used the *${itemName}* on **${charDefs2.name}**!`, inline: false },
							{ name: `${charDefs2.name}'s HP was restored by ${itemDefs.heal ? itemDefs.heal : 50}!`, value: `${charDefs2.name}'s HP: ${charDefs2.hp}/${charDefs2.maxhp}`, inline: false },
						)
						.setFooter(`${charName}'s turn`);
					message.channel.send({embeds: [DiscordEmbed]});
					
					party.items[arg[2]]--
					break;
				
				case 'healmp':
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
					charFuncs.trustUp(charDefs2, charDefs, 40, message.guild.id, client)

					var DiscordEmbed = new Discord.MessageEmbed()
						.setColor('#fcba03')
						.addFields(
							{ name: `${charName} => ${charDefs2.name}`, value: `${charName} used the *${itemName}* on **${charDefs2.name}**!`, inline: false },
							{ name: `${charDefs2.name}'s MP was restored by ${itemDefs.heal ? itemDefs.heal : 50}!`, value: `${charDefs2.name}'s MP: ${charDefs2.mp}/${charDefs2.maxmp}`, inline: false },
						)
						.setFooter(`${charName}'s turn`);
					message.channel.send({embeds: [DiscordEmbed]});
					
					party.items[arg[2]]--
					break;
				
				case 'healhpmp':
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
					charFuncs.trustUp(charDefs2, charDefs, 45, message.guild.id, client)

					var DiscordEmbed = new Discord.MessageEmbed()
						.setColor('#fcba03')
						.addFields(
							{ name: `${charName} => ${charDefs2.name}`, value: `${charName} used the *${itemName}* on **${charDefs2.name}**!`, inline: false },
							{ name: `${charDefs2.name}'s HP was restored by ${itemDefs.healhp ? itemDefs.healhp : 50}, and MP by ${itemDefs.healmp ? itemDefs.healmp : 35}!`, value: `${charDefs2.name}'s HP: ${charDefs2.hp}/${charDefs2.maxhp}\n${arg[3]}'s MP: ${charDefs2.mp}/${charDefs2.maxmp}`, inline: false },
						)
						.setFooter(`${charName}'s turn`);
					message.channel.send({embeds: [DiscordEmbed]});
					
					party.items[arg[2]]--
					break;
				
				case 'skill':
					let skillPath = dataPath+'/skills.json'
					let skillRead = fs.readFileSync(skillPath, {flag: 'as+'});
					let skillFile = JSON.parse(skillRead);
					if (!skillFile[itemDefs.skill])
						return message.channel.send(`This item will fail, don't use it! (${itemDefs.skill} is an invalid skill)`)
					
					let skillDefs = skillFile[itemDefs.skill]
					switch(skillDefs.target) {
						case 'ally':
							if (!allySide[arg[3]])
								return message.channel.send("That's an invalid ally!")
							break
							
						case 'everyone':
							for (const i in allySide)
								charFuncs.trustUp(charDefs, allySide[i], -20, message.guild.id, client)
						
						case 'one':
							if (!opposingSide[arg[3]])
								return message.channel.send("That's an invalid enemy!")
							break;
					}
					

					var DiscordEmbed = attackFuncs.attackWithSkill(charDefs, arg[3] ? parseInt(arg[3]) : 0, allySide, opposingSide, btl, skillDefs, message.guild.id)
					message.channel.send({embeds: [DiscordEmbed]});

					party.items[arg[2]]--
					break;
				
				case 'revive':
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
					charFuncs.trustUp(charDefs2, charDefs, 40, message.guild.id, client)

					var DiscordEmbed = new Discord.MessageEmbed()
						.setColor('#fcba03')
						.setTitle(`${charName} => ${charDefs2.name}`)
						.setDescription(`${charName} used the *${itemName}* on **${charDefs2.name}**!\n${charDefs2.name} was revived!`)
						.setFooter(`${charName}'s turn`);
					message.channel.send({embeds: [DiscordEmbed]});
					
					party.items[arg[2]]--
					break;

				case 'pacify':
					if (!opposingSide[arg[3]])
						return message.channel.send("That's an invalid enemy!")

					if (opposingSide[arg[3]].negotiatePercent >= itemDefs.pacify) {
						let completelyConvinced = '';
						if (!party.negotiates)
							party.negotiates = {};

						if (!party.negotiateAllies || party.negotiateAllies == [])
							party.negotiateAllies = {};

						if (!party.negotiates[opposingSide[arg[3]].name])
							party.negotiates[opposingSide[arg[3]].name] = 1;
						else
							party.negotiates[opposingSide[arg[3]].name]++;

						if (opposingSide[arg[3]].negotiateDefs && opposingSide[arg[3]].negotiateDefs.required && opposingSide[arg[3]].negotiateDefs.qualities) {
							completelyConvinced = `You let it go.`
							opposingSide[arg[3]].negotiated = true

							if (party.negotiates[opposingSide[arg[3]].name] <= opposingSide[arg[3]].negotiateDefs.required)
								completelyConvinced += `**(${party.negotiates[opposingSide[arg[3]].name]}/${opposingSide[arg[3]].negotiateDefs.required} Negotiates)**`
							else
								completelyConvinced += `**(${party.negotiates[opposingSide[arg[3]].name]} Negotiates)**`

							if (party.negotiates[opposingSide[arg[3]].name] == opposingSide[arg[3]].negotiateDefs.required) {
								completelyConvinced += '\n...but it returns to the group, it seems to like you!'

								let enemyDefs = enemyFuncs.makePet(opposingSide[arg[3]])
								enemyDefs.name = opposingSide[arg[3]].name

								partyDefs.negotiateAllies[opposingSide[arg[3]].name] = enemyDefs
								pacifyThing = true;
							}
						} else {
							completelyConvinced = `${opposingSide[arg[3]].name} stops attacking.`
							opposingSide[arg[3]].negotiated = true
						}

						var DiscordEmbed = new Discord.MessageEmbed()
							.setColor('#d613cc')
							.setTitle(`${charDefs.name} => ${opposingSide[arg[3]].name}`)
							.setDescription(`${charDefs.name} used the ${itemDefs.name}!\n${opposingSide[arg[3]].name} is instantly pacified!\n${completelyConvinced}`)
						message.channel.send({embeds: [DiscordEmbed]})
					} else {
						var DiscordEmbed = new Discord.MessageEmbed()
							.setColor('#d613cc')
							.setTitle(`${charDefs.name} => ${opposingSide[arg[3]].name}`)
							.setDescription(`${charDefs.name} used the ${itemDefs.name}!\n...but ${opposingSide[arg[3]].name} wasn't pacified enough!\n_(Need ${itemDefs.pacify}%)_`)
						message.channel.send({embeds: [DiscordEmbed]})
					}
            }

            fs.writeFileSync(dataPath+'/Battles/battle-' + message.guild.id + '.json', JSON.stringify(btl, null, '    '));

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
        let arg = message.content.slice(prefix.length).trim().split(/ +/);

        if (btl[message.guild.id].battling == false)
            return message.channel.send("You can't cast a move out of battle!");

		if (btl[message.guild.id].petattack)
			return message.channel.send("It's the group's pet's turn!");

		if (btl[message.guild.id].testing)
			return message.channel.send('This is a test battle! No guarding!');
		
		if (arg[1] == null)
			arg[1] = btl[message.guild.id].doturn;

		const tempTurnOrder = btl[message.guild.id].turnorder
		let defs = getBattlerFromID(btl[message.guild.id], tempTurnOrder[btl[message.guild.id].doturn], message.author.id)
		
		if (!defs) {
			message.channel.send("Invalid Position: Either you don't own this character or this character does not exist.")
			message.delete()
			return false
		}

        if (defs) {
            let charDefs = defs
			let charName = charDefs.name
		
			let allySide = btl[message.guild.id].allies.members
			let opposingSide = btl[message.guild.id].enemies.members
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
			
			// Restore MP
			let guardString = ''
			if (charDefs.level >= 20) {
				charDefs.mp = Math.min(charDefs.maxmp, charDefs.mp+1);
				guardString = '\n_(MP was also very slightly restored)_'
			}

            const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#fcba03')
                .setTitle(`${charName} => Self`)
				.setDescription(`${charName} guards!\n*(Damage dealt to ${charName} is halved until hit, or it is ${charName}'s turn again.)*${guardString}`)
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

            fs.writeFileSync(dataPath+'/Battles/battle-' + message.guild.id + '.json', JSON.stringify(btl, null, '    '));
        }
    }

    if (command === 'tactics') {
        const btl = readBattle(message.guild.id);
        const arg = message.content.slice(prefix.length).trim().split(/ +/);

        if (btl[message.guild.id].battling == false)
			return message.channel.send("You can't use tactics out of battle!");

		if (btl[message.guild.id].petattack)
			return message.channel.send("It's the group's pet's turn!");

		if (btl[message.guild.id].testing)
			return message.channel.send('This is a test battle! No tactics!');

        let itemPath = dataPath+'/items.json'
        let itemRead = fs.readFileSync(itemPath, {flag: 'as+'});
        let itemFile = JSON.parse(itemRead);

		const tempTurnOrder = btl[message.guild.id].turnorder
		let defs = getBattlerFromID(btl[message.guild.id], tempTurnOrder[btl[message.guild.id].doturn], message.author.id)
		
		if (!defs) {
			message.channel.send("Invalid Position: Either you don't own this character or this character does not exist.")
			message.delete()
			return false
		}

        if (defs) {
            let charDefs = defs
			let charName = charDefs.name

			let allyDefs = btl[message.guild.id].allies
			let oppDefs = btl[message.guild.id].enemies
			if (charFuncs.isOpposingSide(charDefs, btl[message.guild.id])) {
				allyDefs = btl[message.guild.id].enemies
				oppDefs = btl[message.guild.id].allies
			}

			let allySide = allyDefs.members
			let opposingSide = oppDefs.members

			if (arg[2]) {
				let inputVal = arg[2].toLowerCase();
				var DiscordEmbed = {};

				switch(inputVal) {
					case 'run':
					case 'flee':
					case 'escape':
						let avgSpd = 0
						for (const i in opposingSide) {
							if (opposingSide[i].hp > 0)
								avgSpd += opposingSide[i].agl;
							
							if (btl[message.guild.id].pvp) {
								message.channel.send('You forfeit the battle.');
								charDefs.hp = 0

								setTimeout(function() {
									advanceTurn(btl, message.guild.id)
									
									setTimeout(function() {
										message.delete();
									}, 500)
								}, 1500)
								
								return
							}
							
							if (opposingSide[i].miniboss || opposingSide[i].boss || opposingSide[i].finalboss || opposingSide[i].dietyboss)
								return message.channel.send("You can't run from bosses!");
						}
						avgSpd /= opposingSide.length

						if (!btl[message.guild.id].canRun && attackFuncs.missCheck(charDefs.agl, avgSpd, 90)) {
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
					case 'pacify':
						if (btl[message.guild.id].pvp)
							return message.channel.send('You cannot negotiate in PVP!');

						if (!opposingSide[arg[3]])
							return message.channel.send(`${arg[3]} is an invalid position.`);

						if (!opposingSide[arg[3]].enemy)
							return message.channel.send('You must negotiate with an enemy, not a player!');

						let oppDefs = opposingSide[arg[3]]
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

								fs.writeFileSync(dataPath+'/Battles/battle-' + message.guild.id + '.json', JSON.stringify(btl, null, '    '));
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
								givenResponce = true
								collector.stop()

								let guildID = message.guild.id
								if (doNegotiation(charDefs, oppDefs, parseInt(m.content), m.channel, btl)) {
									setTimeout(function() {
										advanceTurn(btl, guildID)
									}, 1500)
								}

								setTimeout(function() {
									message.delete();
									m.delete();
								}, 500)

								fs.writeFileSync(dataPath+'/Battles/battle-' + message.guild.id + '.json', JSON.stringify(btl, null, '    '));
							}
						});
						collector.on('end', c => {
							if (givenResponce == false) {
								message.channel.send('No response given.')
								sendTurnBrief(btl, message.channel)
							}
						});

						break
						
					case 'backup':
						if (btl[message.guild.id].pvp && btl[message.guild.id].ranked)
							return message.channel.send('You cannot switch party members in Ranked PVP!');
						
						if (!charDefs.leader)
							return message.channel.send("You can't do this while you're not the leader.");

						if (!allyDefs.backup || allyDefs.backup.length < 0)
							return message.channel.send("There's nobody in backup!");
						
						if (!allySide[parseInt(arg[3])])
							return message.channel.send('This is an invalid character to replace!')
						
						let switchDefs = allySide[parseInt(arg[3])]
						
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
							let backDefs = allyDefs.backup[i]
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
										delete allySide[parseInt(arg[3])].tetrakarn
										delete allySide[parseInt(arg[3])].makarakarn
										delete allySide[parseInt(arg[3])].shield

										for (const i in allySide[parseInt(arg[3])].buffs)
											allySide[parseInt(arg[3])].buffs[i] = 0;

										let curDefs = utilityFuncs.cloneObj(allySide[parseInt(arg[3])])
										let newDefs = utilityFuncs.cloneObj(allyDefs.backup[parseInt(m.content)])

										newDefs.id = curDefs.id

										allySide[parseInt(arg[3])] = utilityFuncs.cloneObj(newDefs)
										allyDefs.backup[parseInt(m.content)] = utilityFuncs.cloneObj(curDefs)

										DiscordEmbed = new Discord.MessageEmbed()
											.setColor('#fcba03')
											.setTitle(`${charName} => ${curDefs.name}, ${newDefs.name}`)
											.setDescription(`${charName} decides to switch out ${curDefs.name} for ${newDefs.name}\nTry your best, ${newDefs.name}!`)
										message.channel.send({embeds: [DiscordEmbed]})

										fs.writeFileSync(dataPath+'/Battles/battle-' + message.guild.id + '.json', JSON.stringify(btl, null, '    '));

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
						message.channel.send("That's an invalid tactic! Try one of these:```diff\n- Run\n- Negotiate\n- Backup```")
						message.delete()
						return false
				}
			
				fs.writeFileSync(dataPath+'/Battles/battle-' + message.guild.id + '.json', JSON.stringify(btl, null, '    '));
			} else {
				message.channel.send('Specify a tactic:```diff\n- Run\n- Negotiate\n- Backup```')
				message.delete()
				return false
			}
		} else {
			message.channel.send('Invalid character position.')
			message.delete()
			return false
		}
	}

    if (command === 'limitbreak' || command === 'uselimitbreak' || command === 'lb') {
        const btl = readBattle(message.guild.id);
        const arg = message.content.slice(prefix.length).trim().split(/ +/);

        if (btl[message.guild.id].battling == false)
            return message.channel.send("You can't use a Limit Break Skill out of battle!");

		if (btl[message.guild.id].petattack)
			return message.channel.send("It's the group's pet's turn!");

        if (btl[message.guild.id].noLBs == false)
            return message.channel.send("You can't use a Limit Break Skill right now!");

		if (!turnFuncs.limitBreaks(message.guild.id))
            return message.channel.send(`${message.guild.name} does not have Limit Break Skills enabled.`);

        let itemPath = dataPath+'/items.json'
        let itemRead = fs.readFileSync(itemPath, {flag: 'as+'});
        let itemFile = JSON.parse(itemRead);

		const tempTurnOrder = btl[message.guild.id].turnorder
		let defs = getBattlerFromID(btl[message.guild.id], tempTurnOrder[btl[message.guild.id].doturn], message.author.id)
		
		if (!defs) {
			message.channel.send("Invalid Position: Either you don't own this character or this character does not exist.")
			message.delete()
			return false
		}

        if (defs) {
            let charDefs = defs
			let charName = charDefs.name
		
			let allySide = btl[message.guild.id].allies.members
			let opposingSide = btl[message.guild.id].enemies.members
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

            // Check LBs
            let lbSkill;
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
				hits: lbSkill.hits ? lbSkill.hits : 1,
				drain: lbSkill.drain ? lbSkill.drain : null,
				affinitypow: lbSkill.affinitypow ? lbSkill.affinitypow : null,
				limitbreak: true
			};

			btl[message.guild.id].canshowtime = false

			// Limit Break Skills use the strongest attacking stat.
			if (charDefs.atk >= charDefs.mag)
				skillDefs.atktype = "physical";

			let preText = ""
			if (charDefs.lbquote && charDefs.lbquote.length > 0) {
				let possibleQuote = Math.round(Math.random() * (charDefs.lbquote.length-1))
				preText = `*${charDefs.name}: "${charDefs.lbquote[possibleQuote]}"*\n`
			}
			
			charDefs.lb -= lbSkill.cost
			
			// Use leftover LB%/3 to enhance power
			if (!lbSkill.hits || lbSkill.hits <= 1)
				skillDefs.pow += Math.round(charDefs.lb/3);
			
			if (skillDefs.class && skillDefs.class === "heal") {
				let healTxt = ''
				for (const i in allySide) {
					if (allySide[i].hp > 0) {
						if (skillDefs.level >= 4) {
							allySide[i].hp = allySide[i].maxhp
							allySide[i].mp = allySide[i].maxmp
							healTxt += `${allySide[i].name}'s HP & MP was fully restored`
						} else {
							if (skillDefs.level >= 1) {
								let heal = skillDefs.pow
								let hpToFull = allySide[i].maxhp-allySide[i].hp
								if (heal > hpToFull) 
									heal = hpToFull;

								allySide[i].hp += heal
								healTxt += `${allySide[i].name}'s HP was restored by ${heal}`
							}

							if (skillDefs.level >= 2) {
								let healmp = Math.round(skillDefs.pow/2)
								let mpToFull = allySide[i].maxmp-allySide[i].mp
								if (healmp > mpToFull) 
									healmp = mpToFull;

								allySide[i].mp += healmp
								healTxt += `, MP by ${healmp}`
							}
						}

						if (skillDefs.level >= 3) {
							if (allySide[i].status == 'hunger') {
								allySide[i].atk = Math.round(allySide[i].atk*2)
								allySide[i].mag = Math.round(allySide[i].mag*2)
								allySide[i].prc = Math.round(allySide[i].prc*2)
								allySide[i].agl = Math.round(allySide[i].agl*2)
							}

							allySide[i].status = "none"
							allySide[i].statusturns = 0
							healTxt += ` and status cured`
						}
							
						healTxt += '.'
					}
					
					if (skillDefs.level >= 4 && allySide[i].hp <= 0) {
						allySide[i].hp = allySide[i].maxhp

						let healmp = Math.round(skillDefs.pow/2)
						let mpToFull = allySide[i].maxmp-allySide[i].mp
						if (healmp > mpToFull) 
							healmp = mpToFull;

						allySide[i].mp += healmp
						healTxt += `${allySide[i].name} was revived. Their MP was restored by ${healmp}.`
					}
					
					if (allySide[i].hp > 0)
						healTxt += turnFuncs.healPassives(allySide[i]);

					healTxt += '\n'
					
					if (allySide[i].healedquote && allySide[i].healedquote.length > 0) {
						let possibleQuote = Math.round(Math.random() * (allySide[i].healedquote.length-1))
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
					let enmDefs = opposingSide[parseInt(arg[2])]
					const enmName = enmDefs.name
					let embedText = attackFuncs.attackFoe(charName, enmName, charDefs, enmDefs, skillDefs, false, message.guild.id, btl)

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

            fs.writeFileSync(dataPath+'/Battles/battle-' + message.guild.id + '.json', JSON.stringify(btl, null, '    '));
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

            if (readEnm(arg[2]), message.guild.id) {
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
        if (!message.member.permissions.serialize().ADMINISTRATOR)
            return message.channel.send("You have insufficient permissions to use this command.");

        let btl = readBattle(message.guild.id)
        if (btl[message.guild.id].battling == false)
            return message.channel.send(`There's no battle in progress right now.`);
		
		turnFuncs.clearBTL(btl[message.guild.id])

        fs.writeFileSync(dataPath+'/Battles/battle-' + message.guild.id + '.json', JSON.stringify(btl, null, '    '));
        message.react('👍')
    }

    ///////////////////////////
    // Battle Themes Channel //
    ///////////////////////////
	if (command === 'battlethemechannel' || command === 'themechannel' || command === 'joinvc' || command === 'setvc') {
		const arg = message.content.slice(prefix.length).trim().split(/ +/);
		
		let channel;
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
        if (!message.member.permissions.serialize().ADMINISTRATOR)
            return message.channel.send("You have insufficient permissions to use this command.");
		
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
		
		let queueText = ''
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
        let servPath = dataPath+'/Server Settings/server.json'
        let servRead = fs.readFileSync(servPath, {flag: 'as+'});
        let servFile = JSON.parse(servRead);

        if (!servFile[message.guild.id]) {
            servFile[message.guild.id] = {
				prefix: "rpg!",
				limitbreaks: false,
				showtimes: false,
				onemores: false,
				currency: "Bloom Token",
				xprate: 1,
				damageFormula: "persona",
				levelUpFormula: "original",
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
        let servPath = dataPath+'/Server Settings/server.json'
        let servRead = fs.readFileSync(servPath, {flag: 'as+'});
        let servFile = JSON.parse(servRead);

        if (!servFile[message.guild.id]) {
            servFile[message.guild.id] = {
				prefix: "rpg!",
				limitbreaks: false,
				showtimes: false,
				onemores: false,
				currency: "Bloom Token",
				xprate: 1,
				damageFormula: "persona",
				levelUpFormula: "original",
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
			let songTxt = '';
			let themes = servFile[message.guild.id].themes[i];
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
			backup: [],
			subs: [],
			negotiates: {},
			negotiateAllies: {},
            items: {},
            rings: 0
        }

        let i;
        for (i = 1; i < arg.length; i++) {
			if (readChar(arg[i])) {
				if (btl[message.guild.id].parties[arg[1]].members.length >= 4)
					btl[message.guild.id].parties[arg[1]].backup.push(arg[i]);
				else
					btl[message.guild.id].parties[arg[1]].members.push(arg[i]);
			} else
				return message.channel.send(`${arg[i]} is an invalid character.`);
        }

        message.channel.send(`Created Team ${arg[1]}! You can use them in Battle, PVP Matches and More, enjoy!`)
        fs.writeFileSync(dataPath+'/Battles/battle-' + message.guild.id + '.json', JSON.stringify(btl, null, '    '));
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

		let partyDefs = btl[message.guild.id].parties[arg[1]]
        if (!message.member.permissions.serialize().ADMINISTRATOR && partyDefs.members[0].owner != message.author.id)
            return message.channel.send("You lack sufficient permissions, I'm so sorry!");

		if (!readChar(arg[2]))
			return message.channel.send(`${arg[2]} is an invalid character.`);

		if (partyDefs.members.length >= 4)
			partyDefs.backup.push(arg[2])
		else
			partyDefs.members.push(arg[2])

        message.channel.send(`Added ${arg[2]} to Team ${arg[1]}!`)
        fs.writeFileSync(dataPath+'/Battles/battle-' + message.guild.id + '.json', JSON.stringify(btl, null, '    '));
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
		
		let partyDefs = btl[message.guild.id].parties[arg[1]]
        if (!message.member.permissions.serialize().ADMINISTRATOR && partyDefs.members[0].owner != message.author.id)
            return message.channel.send("You lack sufficient permissions, I'm so sorry!");

		if (!readChar(arg[2]))
			message.channel.send(`${arg[2]} is an invalid character.`);

		for (const i in partyDefs.members) {
			let charName = partyDefs.members[i]
		
			if (charName === arg[2]) {
				partyDefs.members.splice(i, 1)
				break
			}
		}
			
        message.channel.send(`Removed ${arg[2]} from party ${arg[1]}.`)
        fs.writeFileSync(dataPath+'/Battles/battle-' + message.guild.id + '.json', JSON.stringify(btl, null, '    '));
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

		let partyDefs = btl[message.guild.id].parties[arg[1]]
        if (!message.member.permissions.serialize().ADMINISTRATOR && partyDefs.members[0].owner != message.author.id)
            return message.channel.send("You lack sufficient permissions, I'm so sorry!");

		if (!readChar(arg[2]))
			message.channel.send(`${arg[2]} is an invalid character.`);
		
		if (!partyDefs.backup)
			partyDefs.backup = []

		let removedMember = false
		for (const i in partyDefs.members) {
			let charName = partyDefs.members[i]

			if (charName === arg[2]) {
				partyDefs.members.splice(i, 1)
				removedMember = true
				break
			}
		}
		
		if (removedMember == false)
			return message.channel.send("This member doesn't exist within the party!")
		else {
			partyDefs.backup.push(arg[2])
			
			if (arg[3]) {
				removedMember = false
				for (const i in partyDefs.backup) {
					let charName = partyDefs.backup[i]

					if (charName === arg[3]) {
						partyDefs.backup.splice(i, 1)
						removedMember = true
						break
					}
				}
				
				if (removedMember) {
					partyDefs.members.push(arg[3])
					message.channel.send(`Added ${arg[2]} to the party's backup, and replaced them with ${arg[3]}.`)
					fs.writeFileSync(dataPath+'/Battles/battle-' + message.guild.id + '.json', JSON.stringify(btl, null, '    '));
				} else
					return message.channel.send(`${arg[3]} is not a valid character!`)
			} else {
				message.channel.send(`Added ${arg[2]} to the party's backup.`)
				fs.writeFileSync(dataPath+'/Battles/battle-' + message.guild.id + '.json', JSON.stringify(btl, null, '    '));
			}
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
			
			fs.writeFileSync(dataPath+'/Battles/battle-' + message.guild.id + '.json', JSON.stringify(btl, null, '    '));
            message.channel.send(`Team ${arg[1]}'s name was changed to Team ${arg[2]}.`)
		} else
            message.channel.send("Invalid Party.");
	}

    if (command === 'listparties' || command === 'listteams') {
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
				weapons: {},
				armors: {},
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

        let servPath = dataPath+'/Server Settings/server.json'
        let servRead = fs.readFileSync(servPath, {flag: 'as+'});
        let servFile = JSON.parse(servRead);

        if (!servFile[message.guild.id]) {
            servFile[message.guild.id] = {
				prefix: "rpg!",
				limitbreaks: false,
				showtimes: false,
				onemores: false,
				currency: "Bloom Token",
				xprate: 1,
				damageFormula: "persona",
				levelUpFormula: "original",
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

		let parties = [];
        for (const i in btl[message.guild.id].parties) {
			let party = btl[message.guild.id].parties[i]

            let m = '';
            for (const k in party.members) {
                m += `${party.members[k]}`;
				
				if (k < party.members.length-1)
					m += ', ';
			}

			if (m === '')
				m = 'Empty.';

            parties.push({name: `Team ${i}`, value: m})
        }

		sendParties(message.channel, parties);
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
				weapons: {},
				armors: {},
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

        let servPath = dataPath+'/Server Settings/server.json'
        let servRead = fs.readFileSync(servPath, {flag: 'as+'});
        let servFile = JSON.parse(servRead);

        if (!servFile[message.guild.id]) {
            servFile[message.guild.id] = {
				prefix: "rpg!",
				limitbreaks: false,
				showtimes: false,
				onemores: false,
				currency: "Bloom Token",
				xprate: 1,
				damageFormula: "persona",
				levelUpFormula: "original",
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

        if (btl[message.guild.id].parties[arg[1]]) {
			let party = btl[message.guild.id].parties[arg[1]]

            let m = '';
            for (const i in btl[message.guild.id].parties[arg[1]].members)
                m += `\n${btl[message.guild.id].parties[arg[1]].members[i]}`;

			if (m === '')
				m = 'Empty.';

            let b = '';
            for (const i in btl[message.guild.id].parties[arg[1]].backup)
                b += `\n${btl[message.guild.id].parties[arg[1]].backup[i]}`;

			if (b === '')
				b = 'No backup.';

            let p = '';
            for (const i in btl[message.guild.id].parties[arg[1]].negotiateAllies) {
				let petDefs = btl[message.guild.id].parties[arg[1]].negotiateAllies[i]
                p += `\n${petDefs.name} - ${petDefs.skill}`;
			}

			if (p === '')
				p = 'No backup.';

			// Items
			let itemPath = dataPath+'/items.json'
			let itemRead = fs.readFileSync(itemPath, {flag: 'as+'});
			let itemFile = JSON.parse(itemRead);

			let items = '';
			if (party.items) {
				for (const i in party.items)
					items += `${itemFile[i] ? itemFile[i].name : i}: ${party.items[i]}\n`;
			}

			if (items === '')
				items = 'No items.';

			// Weapons and Armor
			let weapons = '';
			let armor = '';

			if (party.weapons) {
				for (const i in party.weapons) {
					let weaponDefs = party.weapons[i]
					weapons += `${i} - **${weaponDefs.atk ? weaponDefs.atk : '0'}ATK**, **${weaponDefs.mag ? weaponDefs.mag : '0'}MAG**\n`;
				}
			}

			if (party.armors) {
				for (const i in party.armors) {
					let armorDefs = party.armors[i]
					armor += `${i} - **${armorDefs.def ? armorDefs.def : '0'}DEF**\n`;
				}
			}

			if (weapons === '')
				weapons = 'No weapons.';
			if (armor === '')
				armor = 'No armor.';

            const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#e36b2b')
				.setTitle(`Team ${arg[1]}`)
                .addFields(
                    { name: 'Members', value: `${m}\n\n**${party.rings} ${servFile[message.guild.id].currency}s**`, inline: true },
                    { name: 'Items', value: items, inline: true },
                    { name: 'Backup', value: b, inline: true },
                    { name: 'Pets', value: p, inline: true },
                    { name: 'Weapons', value: weapons, inline: true },
                    { name: 'Armors', value: armor, inline: true }
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
		
		let btl = readBattle(message.guild.id);
		btl[message.guild.id].trials[arg[1]] = {
			endless: false,
			waves: [
				["Miniscle"]
			]
		}
		
        fs.writeFileSync(dataPath+'/Battles/battle-' + message.guild.id + '.json', JSON.stringify(btl, null, '    '));
		
		message.channel.send(`Created Trial ${arg[1]}, You can edit them with ${prefix}setwave!`);
	}

    if (command === 'setendless') {
        if (!message.member.permissions.serialize().ADMINISTRATOR)
            return message.channel.send("You lack sufficient permissions, I'm so sorry!");
		
		const arg = message.content.slice(prefix.length).trim().split(/ +/);

		let btl = readBattle(message.guild.id);
		btl[message.guild.id].trials[arg[1]].endless = (btl[message.guild.id].trials[arg[1]].endless == true) ? false : true
		
        fs.writeFileSync(dataPath+'/Battles/battle-' + message.guild.id + '.json', JSON.stringify(btl, null, '    '));
		message.channel.send(`Endless Mode for Trial ${arg[1]} has been toggled to ${btl[message.guild.id].trials[arg[1]].endless}.`);
	}
	
    if (command === 'setwave') {
        if (!message.member.permissions.serialize().ADMINISTRATOR)
            return message.channel.send("You lack sufficient permissions, I'm so sorry!");

		const arg = message.content.slice(prefix.length).trim().split(/ +/);

		if (!arg[1] || arg[1] === ' ' || arg[1] === 'null') {
            const DiscordEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
				.setTitle(`${prefix}setwave`)
				.setDescription(`(Args <Trial Name> <Wave Number> <...>)\nCreates a wave of enemies for the specified Trial.\n**The Trial has to exist though!** *(You can make it exist with ${prefix}maketrial.)*`);

			return message.channel.send({embeds: [DiscordEmbed]})
        }
		
		let btl = readBattle(message.guild.id);
		if (btl[message.guild.id].trials[arg[1]].waves) {
			let trialDefs = []
			for (let i = 3; i < arg.length; i++) {
				if (readEnm(arg[i], message.guild.id)) {
					trialDefs.push(arg[i])
				} else {
					message.channel.send(`${arg[i]} is an invalid enemy.`)
					return false
				}
			}
			
			if (!btl[message.guild.id].trials[arg[1]].waves[parseInt(arg[2])-1]) {
				message.channel.send("This wave does not exist, therefore, I have just slotted it in as the next wave for you.")
				btl[message.guild.id].trials[arg[1]].waves.push(trialDefs)
			} else {
				btl[message.guild.id].trials[arg[1]].waves[parseInt(arg[2])-1] = trialDefs
			}

			fs.writeFileSync(dataPath+'/Battles/battle-' + message.guild.id + '.json', JSON.stringify(btl, null, '    '));
			
			message.channel.send("Thank you for waiting!!!\nHere's the trial so far:")
			const trialEmbed = new Discord.MessageEmbed()
				.setColor('#0099ff')
				.setTitle(`Trial of ${arg[1]}`)
				.addFields()
				
			let trialDefinitions = btl[message.guild.id].trials[arg[1]].waves
			for (const i in trialDefinitions) {
				let trialEnemies = ""
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
		let btl = readBattle(message.guild.id);
		const arg = message.content.slice(prefix.length).trim().split(/ +/);
		if (btl[message.guild.id].trials[arg[1]]) {
			let descTxt = 'Here are the waves of the trial.';
			if (btl[message.guild.id].trials[arg[1]].endless)
				descTxt += `\n**Endless:** *${btl[message.guild.id].trials[arg[1]].endless}*`;

			const trialEmbed = new Discord.MessageEmbed()
				.setColor('#0099ff')
				.setTitle(`Trial of ${arg[1]}`)
				.setDescription(descTxt)
				.addFields()

			const trialDefs = btl[message.guild.id].trials[arg[1]].waves
			for (const i in trialDefs) {
				let trialEnemies = ""
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

        let servPath = dataPath+'/Server Settings/server.json'
        let servRead = fs.readFileSync(servPath, {flag: 'as+'});
        let servFile = JSON.parse(servRead);

        if (!servFile[message.guild.id]) {
            servFile[message.guild.id] = {
				prefix: "rpg!",
				limitbreaks: false,
				showtimes: false,
				onemores: false,
				currency: "Bloom Token",
				xprate: 1,
				damageFormula: "persona",
				levelUpFormula: "original",
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
			return message.channel.send("You didn't specify the prefix!");
		if (arg[1].toLowerCase() === '' || arg[1].toLowerCase() === ' ')
			return message.channel.send("Uhh... empty prefix??");

        servFile[message.guild.id].prefix = arg[1].toLowerCase()
        fs.writeFileSync(servPath, JSON.stringify(servFile, null, '    '));

        message.channel.send(`The prefix has been changed to __**${arg[1].toLowerCase()}**__! An example of using a command like this would be "${arg[1]}help"`)
    }

    if (command === 'limitbreaks' || command === 'lbs') {
        if (!message.member.permissions.serialize().ADMINISTRATOR)
            return message.channel.send("You lack sufficient permissions, I'm so sorry!");

        let servPath = dataPath+'/Server Settings/server.json'
        let servRead = fs.readFileSync(servPath, {flag: 'as+'});
        let servFile = JSON.parse(servRead);

        if (!servFile[message.guild.id]) {
            servFile[message.guild.id] = {
				prefix: "rpg!",
				limitbreaks: false,
				showtimes: false,
				onemores: false,
				currency: "Bloom Token",
				xprate: 1,
				damageFormula: "persona",
				levelUpFormula: "original",
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

        let servPath = dataPath+'/Server Settings/server.json'
        let servRead = fs.readFileSync(servPath, {flag: 'as+'});
        let servFile = JSON.parse(servRead);

        if (!servFile[message.guild.id]) {
            servFile[message.guild.id] = {
				prefix: "rpg!",
				limitbreaks: false,
				showtimes: false,
				onemores: false,
				currency: "Bloom Token",
				xprate: 1,
				damageFormula: "persona",
				levelUpFormula: "original",
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

        let servPath = dataPath+'/Server Settings/server.json'
        let servRead = fs.readFileSync(servPath, {flag: 'as+'});
        let servFile = JSON.parse(servRead);

        if (!servFile[message.guild.id]) {
            servFile[message.guild.id] = {
				prefix: "rpg!",
				limitbreaks: false,
				showtimes: false,
				onemores: false,
				currency: "Bloom Token",
				xprate: 1,
				damageFormula: "persona",
				levelUpFormula: "original",
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

        let servPath = dataPath+'/Server Settings/server.json'
        let servRead = fs.readFileSync(servPath, {flag: 'as+'});
        let servFile = JSON.parse(servRead);

        if (!servFile[message.guild.id]) {
            servFile[message.guild.id] = {
				prefix: "rpg!",
				limitbreaks: false,
				showtimes: false,
				onemores: false,
				currency: "Bloom Token",
				xprate: 1,
				damageFormula: "persona",
				levelUpFormula: "original",
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
			let currencyText = arg[1].toLowerCase()
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

        let servPath = dataPath+'/Server Settings/server.json'
        let servRead = fs.readFileSync(servPath, {flag: 'as+'});
        let servFile = JSON.parse(servRead);

        if (!servFile[message.guild.id]) {
            servFile[message.guild.id] = {
				prefix: "rpg!",
				limitbreaks: false,
				showtimes: false,
				onemores: false,
				currency: "Bloom Token",
				xprate: 1,
				damageFormula: "persona",
				levelUpFormula: "original",
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

	if (command === 'trustrate') {
        if (!message.member.permissions.serialize().ADMINISTRATOR) {
            message.channel.send("You lack sufficient permissions, I'm so sorry!");
            return
        }

        let servPath = dataPath+'/Server Settings/server.json'
        let servRead = fs.readFileSync(servPath, {flag: 'as+'});
        let servFile = JSON.parse(servRead);

        if (!servFile[message.guild.id]) {
            servFile[message.guild.id] = {
				prefix: "rpg!",
				limitbreaks: false,
				showtimes: false,
				onemores: false,
				currency: "Bloom Token",
				xprate: 1,
				trustrate: 1,
				damageFormula: "persona",
				levelUpFormula: "original",
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
			servFile[message.guild.id].trustrate = parseFloat(arg[1])
			fs.writeFileSync(servPath, JSON.stringify(servFile, null, '    '));
	
			message.channel.send(`Trust Rate has been changed to ${servFile[message.guild.id].trustrate}x`)
		} else
			message.channel.send(`Please ensure the Trust Rate is a full or decimal number!`)
	}
	
	if (command === 'goldchance' || command === 'goldenchance' || command === 'shinychance') {
        if (!message.member.permissions.serialize().ADMINISTRATOR)
            return message.channel.send("You lack sufficient permissions, I'm so sorry!");

        let servPath = dataPath+'/Server Settings/server.json'
        let servRead = fs.readFileSync(servPath, {flag: 'as+'});
        let servFile = JSON.parse(servRead);

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
				levelUpFormula: "original",
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

        let servPath = dataPath+'/Server Settings/server.json'
        let servRead = fs.readFileSync(servPath, {flag: 'as+'});
        let servFile = JSON.parse(servRead);

        if (!servFile[message.guild.id]) {
            servFile[message.guild.id] = {
				prefix: "rpg!",
				limitbreaks: false,
				showtimes: false,
				onemores: false,
				currency: "Bloom Token",
				xprate: 1,
				damageFormula: "persona",
				levelUpFormula: "original",
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

    if (command === 'levelupformula' || command === 'leveltype' || command === 'lvlformula') {
        if (!message.member.permissions.serialize().ADMINISTRATOR)
            return message.channel.send("You lack sufficient permissions, I'm so sorry!");

        let servPath = dataPath+'/Server Settings/server.json'
        let servRead = fs.readFileSync(servPath, {flag: 'as+'});
        let servFile = JSON.parse(servRead);

        if (!servFile[message.guild.id]) {
            servFile[message.guild.id] = {
				prefix: "rpg!",
				limitbreaks: false,
				showtimes: false,
				onemores: false,
				currency: "Bloom Token",
				xprate: 1,
				damageFormula: "persona",
				levelUpFormula: "original",
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

		let lvlFormulas = {
			percent: '`BaseStat * (1 + ((Level-1) * 0.091))`',
			assist: '`(BaseStat+3) * (1 + ((Level-1) * 0.06751))`',
			original: '`No Specific Formula`'
		}

		switch(arg[1].toLowerCase()) {
			case 'original':
			case 'percent':
			case 'assist':
				servFile[message.guild.id].levelUpFormula = arg[1].toLowerCase()
				message.channel.send(`Damage formula changed to ${arg[1].toLowerCase()}.\n${lvlFormulas[arg[1].toLowerCase()] ? lvlFormulas[arg[1].toLowerCase()] : '???'}`)
				break

			default:
				return message.channel.send('Invalid Level Up Formula. Try:```diff\n-Original\n-Percent\n-Assist```')
		}

        fs.writeFileSync(servPath, JSON.stringify(servFile, null, '    '));
	}

    if (command === 'ban') {
        if (!message.member.permissions.serialize().ADMINISTRATOR)
            return message.channel.send('You lack sufficient permissions. Probably a good thing.');
		
		if (!message.mentions.users.first())
            return message.channel.send('Specify the user to ban.');
		
		let bannedUser = message.mentions.users.first()
		
		if (bannedUser.id === message.author.id)
            return message.channel.send("I didn't know you hated me that much... Don't ban yourself.");
		
        let servPath = dataPath+'/Server Settings/server.json'
        let servRead = fs.readFileSync(servPath, {flag: 'as+'});
        let servFile = JSON.parse(servRead);

        if (!servFile[message.guild.id]) {
            servFile[message.guild.id] = {
				prefix: "rpg!",
				limitbreaks: false,
				showtimes: false,
				onemores: false,
				currency: "Bloom Token",
				xprate: 1,
				damageFormula: "persona",
				levelUpFormula: "original",
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
		
		let reason = '';
		if (message.content.includes('"'))
			reason = message.content.slice(prefix.length).trim().split('"');
		
		servFile[message.guild.id].banned.push(bannedUser.id)
		bannedUser.send(`You were banned from using the RPG section of me in ${message.guild.name}.\n${reason ? reason[1] : "Thank you for understanding."}`)
		
        fs.writeFileSync(servPath, JSON.stringify(servFile, null, '    '));
	}

    if (command === 'unban') {
        if (!message.member.permissions.serialize().ADMINISTRATOR)
            return message.channel.send('You lack sufficient permissions. Probably a good thing.');
		if (!message.mentions.users.first())
            return message.channel.send('Specify the user to unban.');
		
		let bannedUser = message.mentions.users.first()
		
        let servPath = dataPath+'/Server Settings/server.json'
        let servRead = fs.readFileSync(servPath, {flag: 'as+'});
        let servFile = JSON.parse(servRead);

        if (!servFile[message.guild.id]) {
            servFile[message.guild.id] = {
				prefix: "rpg!",
				limitbreaks: false,
				showtimes: false,
				onemores: false,
				currency: "Bloom Token",
				xprate: 1,
				damageFormula: "persona",
				levelUpFormula: "original",
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
		
		let unBanned = false
		for (const i in servFile[message.guild.id].banned) {
			let ID = servFile[message.guild.id].banned[i]
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
	
	if (command === 'description') {
        const arg = message.content.slice(prefix.length + 11)
        if (!message.member.permissions.serialize().ADMINISTRATOR)
            return message.channel.send('You lack sufficient permissions. Probably a good thing.');
		
        let servPath = dataPath+'/Server Settings/server.json'
        let servRead = fs.readFileSync(servPath, {flag: 'as+'});
        let servFile = JSON.parse(servRead);

        if (!servFile[message.guild.id]) {
            servFile[message.guild.id] = {
				prefix: "rpg!",
				limitbreaks: false,
				showtimes: false,
				onemores: false,
				currency: "Bloom Token",
				xprate: 1,
				damageFormula: "persona",
				levelUpFormula: "original",
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
				banned: [],
				desc: ''
			}
        }
		
		if (!servFile[message.guild.id].desc)
			servFile[message.guild.id].desc = '';
		
		servFile[message.guild.id].desc = arg;
		message.react('🌠')

        fs.writeFileSync(servPath, JSON.stringify(servFile, null, '    '));
    }

    if (command === 'settings') {
        let servPath = dataPath+'/Server Settings/server.json'
        let servRead = fs.readFileSync(servPath, {flag: 'as+'});
        let servFile = JSON.parse(servRead);

        if (!servFile[message.guild.id]) {
            servFile[message.guild.id] = {
				prefix: "rpg!",
				limitbreaks: false,
				showtimes: false,
				onemores: false,
				currency: "Bloom Token",
				xprate: 1,
				damageFormula: "persona",
				levelUpFormula: "original",
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
				banned: [],
				desc: ''
			}
        }
		
		const DiscordEmbed = new Discord.MessageEmbed()
			.setColor('#0099ff')
			.setTitle(`${message.guild.name}'s Settings`)
			.addFields()
		
		const servStuff = servFile[message.guild.id]

		let mechanics = '**'
		let mechanicDesc = ''

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
		
		let mechanicDescriptions = {
			nnn: "A fair, clean fight.",
			ynn: "Just Limit Breaks. Interesting choice.",
			nyn: "Just Show-Times. One-Mores would be chaotic.",
			nny: "Someone likes to strategize.",
			yyn: "Uhh... Okay.",
			nyy: "Personaaa!",
			yny: "This is P5R descrimination.",
			yyy: "Welcome to your special hell.",
		}
		
		DiscordEmbed.fields.push({name: 'Mechanics', value: `${mechanics}\n*${mechanicDescriptions[mechanicDesc]}*`, inline: false})
		
		// Prefix
		DiscordEmbed.fields.push({name: 'Prefix', value: `${servStuff.prefix}`, inline: true})
		
		// Currency
		DiscordEmbed.fields.push({name: 'Currency', value: `${servStuff.currency}, ${servStuff.currency}s`, inline: true})

		// XP Rate
		DiscordEmbed.fields.push({name: 'XP Rate', value: `${servStuff.xprate}x`, inline: true})
		
		// Damage Formula
		let damageFormulas = {
			persona: '5*√(Attack/Endurance * Skill Power)',
			pokemon: '(((2*level)/5+2)*Power*Attack/Endurance)/50+2'
		}

		let dmgArray = servStuff.damageFormula.split('');
		dmgArray[0] = dmgArray[0].toUpperCase()
		let dmgString = dmgArray.join('');
		
		DiscordEmbed.fields.push({name: 'Damage Formula', value: dmgString + '\n`' + damageFormulas[servStuff.damageFormula] + '`', inline: true})
		
		// LvlUp Formula
		if (!servStuff.levelUpFormula) {
			servStuff.levelUpFormula = 'original'
			fs.writeFileSync(servPath, JSON.stringify(servFile, null, '    '));
		}

		let lvlFormulas = {
			percent: 'BaseStat * (1 + ((Level-1) * 0.091))',
			assist: '(BaseStat+3) * (1 + ((Level-1) * 0.06751))',
			original: 'No Specific Formula'
		}

		let lvlArray = servStuff.levelUpFormula.split('');
		lvlArray[0] = lvlArray[0].toUpperCase()
		let lvlString = lvlArray.join('');
		
		DiscordEmbed.fields.push({name: 'Level Up Formula', value: lvlString + '\n`' + lvlFormulas[servStuff.levelUpFormula] + '`', inline: true})
		
		if (!servStuff.goldChance) {
			servStuff.goldChance = 0.1
			fs.writeFileSync(servPath, JSON.stringify(servFile, null, '    '));
		}

		// Gold Chance
		DiscordEmbed.fields.push({name: 'Golden Chance', value: `${servStuff.goldChance}%`, inline: true})

		// Description
		if (!servStuff.desc) {
			servStuff.desc = '';
			fs.writeFileSync(servPath, JSON.stringify(servFile, null, '    '));
		}

		if (servStuff.desc === '') 
			servStuff.desc = 'No Description.';

		DiscordEmbed.fields.push({name: 'Server Description', value: `${servStuff.desc}`, inline: false})

        message.channel.send({embeds: [DiscordEmbed]})
	}

    if (command === 'invite')
        sendInvite(message.channel);
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

    let message = reaction.message;

    if (user.bot) return false;
	
	// Blacksmiths
	let isBlackSmith
	for (const i in blackSmith) {
		if (message == blackSmith[i]) {
			isBlackSmith = true;
			break;
		}
	}

	let optionEmoji = {
		enter: [['🚪', 'exit'], ['⚔', 'weapon'], ['🦾', 'armor'], ['🔥', 'decompose']],
		weapon: [['🔨', 'createWeapon'], ['✨', 'enhanceWeapon'], ['↩️', 'enter']],
		armor: [['🔨', 'createArmor'], ['✨', 'enhanceArmor'], ['↩️', 'enter']],
		decompose: [['⚔', 'decomposeWeapon'], ['🦾', 'decomposeArmor'], ['↩️', 'enter']],
	}

	let options = {
		enter: ['exit', 'weapon', 'armor', 'decompose'],
		weapon: ['createWeapon', 'enhanceWeapon', 'back'],
		createWeapon: ['1', '2', '3', '4', 'nextPage', 'prevPage', 'back'],
		enhanceWeapon: ['1', '2', '3', '4', 'nextPage', 'prevPage', 'back'],
		armor: ['createArmor', 'enhanceArmor', 'back'],
		createArmor: ['1', '2', '3', '4', 'nextPage', 'prevPage', 'back'],
		enhanceArmor: ['1', '2', '3', '4', 'nextPage', 'prevPage', 'back'],
		decompose: ['decomposeWeapon', 'decomposeArmor', 'back'],
		decomposeWeapon: ['1', '2', '3', '4', 'nextPage', 'prevPage', 'back'],
		decomposeArmor: ['1', '2', '3', '4', 'nextPage', 'prevPage', 'back']
	}

	if (!isBlackSmith)
		return;

	let blacksmithPath = `${dataPath}/BlackSmiths/blacksmith-${message.channel.id}.json`
	let blacksmithRead = fs.readFileSync(blacksmithPath, {flag: 'as+'});
	
	if (blacksmithRead == '' || blacksmithRead == ' ')
		blacksmithRead = '{}';

	let blacksmithFile = JSON.parse(blacksmithRead);
	
	if (blackSmith[message.channel.id]) {
		let curState = blacksmithFile.state
		switch (curState) {
			default:
				for (const i in optionEmoji[curState]) {
					if (reaction.emoji.name == optionEmoji[curState][i]) {
						let option = optionEmoji[curState][i][1]
						
						if (option === 'exit') {
							var DiscordEmbed = new Discord.MessageEmbed()
								.setColor('#ffffff')
								.setTitle(`${reaction.emoji.name} ${blacksmithFile.name}`)
								.setDescription('🚪 You left the blacksmiths.')
							message.edit({context: user, embeds: [DiscordEmbed]})
							
							delete blackSmith[message.channel.id]
							blacksmithFile.state = "none"
							return;
						} else if (option === 'weapon' || option === 'armor') {
						}
					}
				}
		}
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

    let relicPath = dataPath+'/RelicSearch/relicData.json'
    let relicRead = fs.readFileSync(relicPath, {flag: 'as+'});
    let relicData = JSON.parse(relicRead);

    let message = reaction.message;

    if (user.bot) return false;

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
                    let relicPath2 = dataPath+'/RelicSearch/relicDefs.json'
                    let relicRead2 = fs.readFileSync(relicPath2, {flag: 'as+'});
                    let relicDefs = JSON.parse(relicRead2);

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
            let relicPath2 = dataPath+'/RelicSearch/relicFight.json'
            let relicRead2 = fs.readFileSync(relicPath2, {flag: 'as+'});
            let relicFight = JSON.parse(relicRead2);

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
            const mafiaRead = fs.readFileSync(mafiaPath, {flag: 'as+'});
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
            const unoRead = fs.readFileSync(unoPath, {flag: 'as+'});
            const uno = JSON.parse(unoRead);

            if (reaction.emoji.name === "🃏") {
                uno[message.guild.id].players.push({
					name: user.username,
					id: user.id,
					cards: [],
					uno: false
				})
            }
			
			let descText = "Players:\n"
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

client.on("guildCreate", guild => {
	// Create specific files for this guildCreate
	if (guild && guild.id) {
		// Battle File
		let btlPath = `${dataPath}/Battles/battle-${guild.id}.json`
		let btlCheck = fs.readFileSync(btlPath, {flag: 'as+'});
		
		if (btlCheck == '') {
			btlCheck = '{}'
			fs.writeFileSync(btlPath, btlCheck);
		}

		// Enemy File
		let enmPath = `${dataPath}/Enemies/enemies-${guild.id}.json`
		let enmCheck = fs.readFileSync(enmPath, {flag: 'as+'});

		if (enmCheck == '') {
			enmCheck = '{}'
			fs.writeFileSync(enmPath, enmCheck);
		}
	}
	
	// Send welcome message
	/*
	const file = new Discord.MessageAttachment('./images/enemies/grassimp.png');
	const DiscordEmbed = new Discord.MessageEmbed()
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


	guild.channels.sort(function(chan1,chan2){
		if(chan1.type!==`text`) return 1;
		if(!chan1.permissionsFor(guild.me).has(`SEND_MESSAGES`)) return -1;
		return chan1.position < chan2.position ? -1 : 1;
	}).first().send({embeds: [DiscordEmbed], files: [file]}).catch(e => console.log(e));
	*/
});

client.login('bot-id');