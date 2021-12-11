// Require
const Discord = require('discord.js');
const fs = require('fs');

// Path to 'data' folder
const dataPath = './data'

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
	poison: "<:poison:906759861742760016>",
	metal: "<:metal:906748877955268638>",
	curse: "<:curse:906748923354443856>",
	bless: "<:bless:903369721980813322>",
	nuclear: "<:nuclear:906877350447300648>",
	
	almighty: "<:almighty:906748842450509894>",
	
	status: "<:status:906877331711344721>",
	heal: "<:heal:906758309351161907>",
	passive: "<:passive:906874477210648576>"
}

// Item
const itemTypes = [
	"weapon",
	"heal",
	"healmp",
	"healhpmp"
]

const itemTypeEmoji = {
	weapon: "🔪",

	heal: "🌀",
	healmp: "⭐",
	healhpmp: "🔰"
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
	"hunger"
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
	hunger: '🍪'
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

function genCharFromPet(charDefs) {
	var battlerDefs = {
		name: charDefs.name,
		truename: charDefs.name,

		melee: ["Strike Attack", "strike"],
		level: charDefs.level,

		hp: 100,
		mp: 80,
		maxhp: 100,
		maxmp: 80,
		lb: 0,

		xp: charDefs.xp,
		maxxp: charDefs.maxxp,

		status: "none",
		statusturns: 0,

		atk: charDefs.atk,
		mag: charDefs.mag,
		prc: charDefs.atk,
		end: charDefs.def,
		chr: charDefs.mag,
		int: charDefs.mag,
		agl: charDefs.atk,
		luk: charDefs.atk,
		weapon: 'none',
		guard: false,

		buffs: {
			atk: 0,
			mag: 0,
			prc: 0,
			end: 0,
			agl: 0
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

function petMove(message, client, btl, petDefs, allySide, oppSide) {
	const arg = message.content.slice(prefix.length).trim().split(/ +/);

	var skillPath = dataPath+'/skills.json'
	var skillRead = fs.readFileSync(skillPath);
	var skillFile = JSON.parse(skillRead);
	
	var charDefs = genCharFromPet(petDefs)

	if (defs) {
		var skillName = petDefs.skill
		var skillDefs = skillFile[skillName]
		
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
		
		var DiscordEmbed;
		btl[message.guild.id].canshowtime = false

		// Heal Skills target allies
		if (skillDefs.type == "heal") {
			var healedQuote = ""

			var affinityMessage = ``;
			if (skillDefs.healall || skillDefs.target && skillDefs.target === "allallies") {
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
						var partyDef = allySide[i]
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
								var possibleQuote = Math.round(Math.random() * (partyDef.helpedquote.length-1))
								var theQuote = `\n*${partyDef.name}: "${partyDef.helpedquote[possibleQuote]}"*`

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
					var txt = ``
					for (const i in allySide) {
						var partyDef = allySide[i]								

						var heal = skillDefs.pow

						partyDef.mp = Math.round(Math.min(partyDef.maxmp, partyDef.mp + heal))
						txt += `\n${partyDef.name}'s MP was restored by ${Math.round(heal)}. (${partyDef.mp}/${partyDef.maxmp}MP)`
						
						txt += turnFuncs.healPassives(partyDef)
						
						if (partyDef.helpedquote && partyDef.helpedquote.length > 0) {
							var possibleQuote = Math.round(Math.random() * (partyDef.helpedquote.length-1))
							var theQuote = `\n*${partyDef.name}: "${partyDef.helpedquote[possibleQuote]}"*`

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
					var txt = ``;
					for (const i in allySide) {
						var partyDef = allySide[i]
						if (partyDef.hp > 0) {	
							partyDef.hp = Math.round(Math.min(partyDef.maxhp, partyDef.hp + heal))

							txt += `\n${partyDef.name}'s HP was restored by ${Math.round(heal)}. (${partyDef.hp}/${partyDef.maxhp}HP)`							
							txt += turnFuncs.healPassives(partyDef)
						
							if (partyDef.helpedquote && partyDef.helpedquote.length > 0) {
								var possibleQuote = Math.round(Math.random() * (partyDef.helpedquote.length-1))
								var theQuote = `\n*${partyDef.name}: "${partyDef.helpedquote[possibleQuote]}"*`

								if (theQuote.includes('%ALLY%'))
									theQuote = theQuote.replace('%ALLY%', petDefs.name)

								txt += theQuote
							}
							
							charFuncs.trustUp(partyDef, charDefs, 5, message.guild.id)
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

				var charDefs2
				var charName2
				if (allySide[arg[2]]) {
					charDefs2 = allySide[arg[2]]
					charName2 = allySide[arg[2]].name
				} else {
					message.channel.send(`${arg[2]} is a nonexistant battler number.`)
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
						var possibleQuote = Math.round(Math.random() * (charDefs2.helpedquote.length-1))
						var theQuote = `\n*${charDefs2.name}: "${charDefs2.helpedquote[possibleQuote]}"*`

						if (theQuote.includes('%ALLY%'))
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
					var passives = turnFuncs.healPassives(charDefs2)
					
					if (charDefs2.helpedquote && charDefs2.helpedquote.length > 0) {
						var possibleQuote = Math.round(Math.random() * (charDefs2.helpedquote.length-1))
						var theQuote = `\n*${charDefs2.name}: "${charDefs2.helpedquote[possibleQuote]}"*`

						if (theQuote.includes('%ALLY%'))
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
					var passives = turnFuncs.healPassives(charDefs2)
					
					if (charDefs2.helpedquote && charDefs2.helpedquote.length > 0) {
						var possibleQuote = Math.round(Math.random() * (charDefs2.helpedquote.length-1))
						var theQuote = `\n*${charDefs2.name}: "${charDefs2.helpedquote[possibleQuote]}"*`

						if (theQuote.includes('%ALLY%'))
							theQuote = theQuote.replace('%ALLY%', petDefs.name)

						healedQuote += theQuote
					}

					DiscordEmbed = new Discord.MessageEmbed()
						.setColor('#e36b2b')
						.setTitle(`${petDefs.name} => ${charName2}`)
						.setDescription(`${petDefs.name} used ${skillName}!\n${charName2} was cured of their status!\n${passives}${healedQuote}`)
						.setFooter(`${petDefs.name}'s turn`);
				} else if (skillDefs.healmp) {
					charDefs2.mp = Math.min(charDefs2.maxmp, charDefs2.mp + Math.round(heal))
					var passives = turnFuncs.healPassives(charDefs2)
					
					if (charDefs2.helpedquote && charDefs2.helpedquote.length > 0) {
						var possibleQuote = Math.round(Math.random() * (charDefs2.helpedquote.length-1))
						var theQuote = `\n*${charDefs2.name}: "${charDefs2.helpedquote[possibleQuote]}"*`

						if (theQuote.includes('%ALLY%'))
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

					charDefs2.hp = Math.min(charDefs2.maxhp, charDefs2.hp + Math.round(heal))
					var passivesMsg = turnFuncs.healPassives(charDefs2)
					
					if (charDefs2.helpedquote && charDefs2.helpedquote.length > 0) {
						var possibleQuote = Math.round(Math.random() * (charDefs2.helpedquote.length-1))
						var theQuote = `\n*${charDefs2.name}: "${charDefs2.helpedquote[possibleQuote]}"*`

						if (theQuote.includes('%ALLY%'))
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
			if (skillDefs.shield || skillDefs.makarakarn || skillDefs.tetrakarn || skillDefs.trap) {
				var healedQuote = ""

				var effect = 'shield'
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

						var charName2 = allySide[i].name
							
						if (allySide[i].helpedquote && allySide[i].helpedquote.length > 0) {
							var possibleQuote = Math.round(Math.random() * (allySide[i].helpedquote.length-1))
							var theQuote = `\n*${charName2}: "${allySide[i].helpedquote[possibleQuote]}"*`

							if (theQuote.includes('%ALLY%'))
								theQuote = theQuote.replace('%ALLY%', petDefs.name)

							healedQuote += theQuote
						}
					}

					DiscordEmbed = new Discord.MessageEmbed()
						.setColor('#e36b2b')
						.setTitle(`${petDefs.name} => Allies`)
						.setDescription(`${petDefs.name} used ${skillName}!\nTheir allies were protected by ${skillName}.\n${healedQuote}`)
						.setFooter(`${petDefs.name}'s turn`);
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
				var enmDefs = oppSide[parseInt(arg[2])]
				var enmName = enmDefs.name
				if (skillDefs.statuschance > 0 || enmDefs.status === "none") {
					var targ = (skillDefs.statuschance + (petDefs.mag - enmDefs.luk)) / 100;
					var chance = Math.random();

					const movestatus = skillDefs.status

					var finaltext = `${petDefs.name} used ${skillName} on ${enmDefs.name}!\n`;
					if (chance <= targ || skillDefs.statuschance >= 100) {
						finaltext += attackFuncs.inflictStatus(enmDefs, skillDefs);
						if (enmDefs.hitquote && enmDefs.hitquote.length > 0) {
							var possibleQuote = utilityFuncs.randNum(enmDefs.hitquote.length-1)
							finaltext += `\n*${enmName}: "${enmDefs.hitquote[possibleQuote]}"*`
						}
					} else {
						finaltext += " But they dodged it!"
						if (enmDefs.dodgequote && enmDefs.dodgequote.length > 0) {
							var possibleQuote = Math.round(Math.random() * (enmDefs.dodgequote.length-1))
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
				var buffCount = skillDefs.buffCount ? skillDefs.buffCount : 1
				var buffTxt = ['', '', ' twice', ' three times', ' four times', ' five times', ' completely']

				if (skillDefs.target == "allallies") {
					for (let i = 0; i < buffCount; i++) {
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
					}
		
					DiscordEmbed = new Discord.MessageEmbed()
						.setColor('#e36b2b')
						.setTitle(`${petDefs.name} => All Allies`)
						.setDescription(`${petDefs.name} buffed their allies' ${(skillDefs.buff == "all") ? "Stats" : skillDefs.buff.toUpperCase()}${buffTxt[buffCount]}!`)
						.setFooter(`${petDefs.name}'s turn`);
				} else {
					if (!allySide[arg[2]])
						return message.channel.send('Invalid ally!')
					var charDefs2 = allySide[arg[2]]

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
						var charDefs2 = oppSide[i]
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
					if (!oppSide[arg[2]])
						return message.channel.send('Invalid opponent!')

					var charDefs2 = oppSide[arg[2]]
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
			} else if (skillDefs.futuresight) {
				var oppDefs = oppSide[arg[2]]
				
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
			var server = message.guild.id
			DiscordEmbed = attackFuncs.attackWithSkill(petDefs, arg[2], allySide, oppSide, btl, skillDefs, server)
		}

		if (DiscordEmbed)
			message.channel.send({embeds: [DiscordEmbed]});
		else
			return message.channel.send('Something went wrong, so I stopped your movement. Try something else.');

		fs.writeFileSync(dataPath+'/battle.json', JSON.stringify(btl, null, '    '));
		return true
	} else
		return message.channel.send(`There's been an issue finding your character!`);
}