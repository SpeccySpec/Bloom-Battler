// Require
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
	poison: "☠️",
	metal: "🔩",
	curse: "👻",
	bless: "⭐",
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
	despair: "💦",
    poison: "☠️",
	dizzy: "💫",
    brainwash: "🦆",
	fear: "👁",
	rage: "<:effective:876899270731628584>",
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

// Utils
function doLimitBreaks(server) {
	var servPath = dataPath+'/Server Settings/server.json'
    var servRead = fs.readFileSync(servPath);
    var servFile = JSON.parse(servRead);
	var servDefs = servFile[server]
	
	return servDefs.limitbreaks ? true : false
}

function doOneMores(server) {
	var servPath = dataPath+'/Server Settings/server.json'
    var servRead = fs.readFileSync(servPath);
    var servFile = JSON.parse(servRead);
	var servDefs = servFile[server]
	
	return servDefs.onemores ? true : false
}

function doShowTimes(server) {
	var servPath = dataPath+'/Server Settings/server.json'
    var servRead = fs.readFileSync(servPath);
    var servFile = JSON.parse(servRead);
	var servDefs = servFile[server]
	
	return servDefs.showtimes ? true : false
}

function hasPassiveCopyLol(userDefs, passiveType) {					
	for (const skillNum in userDefs.skills) {
		const skillPath = dataPath+'/skills.json'
		const skillRead = fs.readFileSync(skillPath);
		const skillFile = JSON.parse(skillRead);

		var skillDefs2 = skillFile[userDefs.skills[skillNum]];
		if (skillDefs2 && skillDefs2.type && skillDefs2.type === "passive") {
			if (skillDefs2.passive.toLowerCase() === passiveType.toLowerCase()) {
				console.log(`${userDefs.name} has the ${passiveType} passive.`)
				return true
			}
		}
	}
	
	return false
}

// Miss Check
function missCheck(userPrc, oppAgl, moveAcc) {
	if (moveAcc >= 100) {return true}
	
	var targVal = (moveAcc + ((userPrc - oppAgl)*(3/4))) / 100
	var randomVal = Math.random()
	
	if (randomVal > targVal) {
		return false
	}
	
	return true
}

// Determine the Damage that this move will deal. Also handles Status Effects, Affinities and Critical Hits
function genDmg(atk, prc, luk, chr, movepow, moveacc, movecrit, movestatus, movestatuschance, movetype, enmdef, enmagl, enmluk, dmgtype) {
	console.log("genDmg:")

    var values = [0, "normal", false, false, false]; // Damage, Damagestate, Hit a Weakness?, Crit?, Inflict Status?
    if (dmgtype === "block") {
        return [0, dmgtype, false, false, false]
    }

    values[0] = 1

    // Accuracy Checks
	console.log("<<Accuracy Checks done in missCheck (line 149)>>")
    if (!missCheck(prc, enmagl, moveacc)) {
		return [0, "miss", false, false, false]
	}

    // Damage Generation
	console.log(`5 * Math.sqrt((${atk} / ${enmdef}) * ${movepow}) = ${5 * Math.sqrt((atk/enmdef)* movepow)}`)
    var def = atk / enmdef;
    values[0] = 5 * Math.sqrt(def * movepow);

    if (dmgtype === "repel" || dmgtype === "drain") {
        return [Math.round(values[0]), dmgtype, false, false, false]
    }

    // Damage Types
    if (dmgtype === "weak") {
        values[2] = true;
        values[1] = "weak";
        values[0] = Math.round((values[0] * 3) / 2);
    } else if (dmgtype === "resist") {
        values[1] = "resist";
        values[0] = Math.round(values[0] / 2);
    }

    // Crits
	console.log("<<Crit Checks>>")
    if (movecrit > 0) {
        var targ2 = (movecrit + (luk - enmluk));
        var crit = (Math.floor(Math.random() * 100));
		
		console.log(`Random Value ${crit} < Target Value ${Math.round(targ2*100)}?`)
        if (crit <= targ2 || movecrit >= 100) {
            values[0] = Math.round((values[0] * 3) / 2);
            values[3] = true;
        }
    }

    // Status
	console.log("<<Status Checks>>")
    if (movestatuschance > 0) {
		var targ3 = (movestatuschance + (chr - enmluk)) / 100;
		var st = Math.random();
		
		console.log(`Random Value ${Math.round(st*100)} < Target Value ${Math.round(targ3*100)}?`)
		if (st < targ3 || movestatuschance >= 100) {
			values[4] = true;
		}
    }

    return values
}

// Attack Object
function attackEnemy(userName, oppName, userDefs, oppDefs, skillDefs, useEnergy, server) {
    var itemPath = dataPath+'/items.json'
    var itemRead = fs.readFileSync(itemPath);
    var itemFile = JSON.parse(itemRead);
	
	const embedText = {
		targetText: ``,
		attackText: ``,
		resultText: ``,
		oneMore: false,
		showTime: false
	}

	if (!userDefs.weapon) {
		userDefs.weapon = "none"
	}
	
	if (!oppDefs.weapon) {
		oppDefs.weapon = "none"
	}
	
	const userWeapon = itemFile[userDefs.weapon] ? itemFile[userDefs.weapon] : itemFile["none"]
	const oppWeapon = itemFile[oppDefs.weapon] ? itemFile[oppDefs.weapon] : itemFile["none"]

	// Heal Skills target allies
	if (skillDefs.type === "heal") {
		if (skillDefs.fullheal) {
			oppDefs.hp = oppDefs.maxhp

			embedText.targetText = `${userName} => It's Allies`
			embedText.attackText = `${userName} used ${skillDefs.name}!`
			embedText.resultText = `${oppName} was fully healed!`
		} else if (skillDefs.statusheal) {
			oppDefs.status = "none";
			oppDefs.statusturns = 0;

			embedText.targetText = `${userName} => ${oppName}`
			embedText.attackText = `${userName} used ${skillDefs.name}!`
			embedText.resultText = `${oppName} was cured of status effects!`
		} else if (skillDefs.healmp) {
			oppDefs.mp = Math.min(partyDef.maxmp, partyDef.mp + skillDefs.pow)

			embedText.targetText = `${userName} => ${oppName}`
			embedText.attackText = `${userName} used ${skillDefs.name}!`
			embedText.resultText = `${oppName} had their MP restored by ${skillDefs.pow}!`
		} else {
			oppDefs.hp = Math.min(partyDef.maxhp, partyDef.hp + skillDefs.pow)

			embedText.targetText = `${userName} => ${oppName}`
			embedText.attackText = `${userName} used ${skillDefs.name}!`
			embedText.resultText = `${oppName} had their HP restored by ${skillDefs.pow}!`
		}
	} else if (skillDefs.type === "status") {
		if (skillDefs.status && skillDefs.statuschance) {
			if (skillDefs.statuschance > 0) {
				var targ = (skillDefs.statuschance + (userDefs.chr - oppDefs.luk)) / 100;
				var chance = Math.random();

				var finaltext = ""
				if (chance > targ || skillDefs.statuschance >= 100) {
					if (skillDefs.status === "burn") {
						finaltext = "They were burned!"
						oppDefs.status = "burn"
						oppDefs.statusturns = 3
					} else if (skillDefs.status === "bleed") {
						finaltext = "They were inflicted with bleed!"
						oppDefs.status = "bleed"
						oppDefs.statusturns = 5
					} else if (skillDefs.status === "poison" || skillDefs.status === "toxic") {
						finaltext = "They were poisoned!"
						oppDefs.status = "poison"
						oppDefs.statusturns = 3
					} else if (skillDefs.status === "freeze") {
						finaltext = "They were frozen!"
						oppDefs.status = "freeze"
						oppDefs.statusturns = 1
					} else if (skillDefs.status === "paralyze") {
						finaltext = "They were paralyzed!"
						oppDefs.status = "paralyze"
						oppDefs.statusturns = 1
					} else if (skillDefs.status === "dizzy") {
						finaltext = finaltext + " They were inflicted with dizziness!"
						oppDefs.status = "dizzy"
						oppDefs.statusturns = 3
					} else if (skillDefs.status === "brainwash") {
						finaltext = "They were brainwashed!"
						oppDefs.status = "brainwash"
						oppDefs.statusturns = 2
					} else if (skillDefs.status === "rage") {
						finaltext = finaltext + " They were enraged!"
						oppDefs.status = "rage"
						oppDefs.statusturns = 3
					} else if (skillDefs.status === "fear") {
						finaltext = finaltext + " They got scared!"
						oppDefs.status = "fear"
						oppDefs.statusturns = 2
					} else if (skillDefs.status === "ego") {
						finaltext = finaltext + " They were made egotistic!"
						oppDefs.status = "ego"
						oppDefs.statusturns = 3
					} else if (skillDefs.status === "paranoia") {
						finaltext = finaltext + " They were made paranoid!"
						oppDefs.status = "paranoia"
						oppDefs.statusturns = 2
					} else if (skillDefs.status === "despair") {
						finaltext = finaltext + " They were inflicted with despair!"
						oppDefs.status = "despair"
						oppDefs.statusturns = -1
					}
				} else {
					finaltext = "But they dodged it!"

					if (userDefs.missquote && userDefs.missquote.length > 0) {
						var possibleQuote = Math.round(Math.random() * (userDefs.missquote.length-1))
						finaltext += `\n*${userName}: "${userDefs.missquote[possibleQuote]}"*`
					}
					if (oppDefs.dodgequote && oppDefs.dodgequote.length > 0) {
						var possibleQuote = Math.round(Math.random() * (oppDefs.dodgequote.length-1))
						finaltext += `\n*${oppName}: "${oppDefs.dodgequote[possibleQuote]}"*`
					}
				}

				embedText.targetText = `${userName} => ${oppName}`, 
				embedText.attackText = `${userName} used ${skillDefs.name} on ${oppName}!`
				embedText.resultText = `${finaltext}`
			}
		} else if (skillDefs.futuresight) {
			if (oppDefs) {
				oppDefs.futureSightSkill = skillDefs.futuresight
				oppDefs.futureSightSkill.user = userDefs

				const DiscordEmbed = new Discord.MessageEmbed()
					.setColor('#e36b2b')
					.setTitle(`${userName} => ${oppDefs.name}`)
					.setDescription(`${oppDefs.name} is going to be affected by ${userName}'s future attack.`)
				message.channel.send(DiscordEmbed)
			} else {
				message.channel.send("Invalid enemy.")
				message.delete()
				return false
			}
		}
	} else {
		// some attacks arent fucking normal holy shitt

		// Spirit Leech
		if (skillDefs.stealmp) {
			oppDefs.mp = Math.max(0, oppDefs.mp-skillDefs.pow)
			userDefs.mp = Math.min(userDefs.maxmp, userDefs.mp+skillDefs.pow)
			
			embedText.targetText = `${userDefs.name} => ${oppDefs.name}`
			embedText.attackText = `${userDefs.name} used ${skillDefs.name}!`
			embedText.resultText = `${userName} stole ${skillDefs.pow}MP from the target!`
			return embedText
		}

		// Now, do regular attacks.
		var atk = userDefs.atk + (userWeapon.atk ? userWeapon.atk : 0) + ((userDefs.atk/10)*userDefs.buffs.atk)
		if (skillDefs.atktype && skillDefs.atktype === "magic") {
			atk = userDefs.mag + (userWeapon.mag ? userWeapon.mag : 0) + ((userDefs.mag/10)*userDefs.buffs.mag)
		}
		var prc = userDefs.prc + ((userDefs.prc/10)*userDefs.buffs.prc)
		var luk = userDefs.luk
		var chr = userDefs.chr
		var enmdef = oppDefs.end + (oppWeapon.def ? oppWeapon.def : 0) + ((oppDefs.end/10)*oppDefs.buffs.end)
		var enmagl = oppDefs.agl + ((oppDefs.agl/10)*oppDefs.buffs.agl)
		var enmluk = oppDefs.luk

		var movepow = skillDefs.pow
		if (skillDefs.affinitypow && userDefs.affinitypoint && hasPassiveCopyLol(userDefs, "affinitypoint")) {
			for (i = 0; i < userDefs.affinitypoint; i++) {
				movepow += skillDefs.affinitypow
			}
		}

		var movetype = skillDefs.atktype
		var moveacc = 999
		if (skillDefs.acc) {
			moveacc = skillDefs.acc
		}
		
		// Dizziness
		if (userDefs.status === "dizzy") {moveacc -= Math.floor(moveacc/2)}

		var movecrit = 0
		if (skillDefs.crit) {
			movecrit = skillDefs.crit
		}
		var movestatus = "none"
		if (skillDefs.status) {
			movestatus = skillDefs.status
		}
		var movestatuschance = 0
		if (skillDefs.status && skillDefs.statuschance) {
			movestatuschance = skillDefs.statuschance
		}

		// Weaknesses and shit
		var dmgtype = "normal"
		if (skillDefs.type && skillDefs.type != "almighty") {
			for (i = 0; i < oppDefs.weak.length; i++) {
				if (oppDefs.weak[i] == skillDefs.type) {
					dmgtype = "weak"
				}
			}
			for (i = 0; i < oppDefs.resist.length; i++) {
				if (oppDefs.resist[i] == skillDefs.type) {
					dmgtype = "resist"
				}
			}
			for (i = 0; i < oppDefs.block.length; i++) {
				if (oppDefs.block[i] == skillDefs.type) {
					dmgtype = "block"
				}
			}
			for (i = 0; i < oppDefs.repel.length; i++) {
				if (oppDefs.repel[i] == skillDefs.type) {
					dmgtype = "repel"
				}
			}
			for (i = 0; i < oppDefs.drain.length; i++) {
				if (oppDefs.drain[i] == skillDefs.type) {
					dmgtype = "drain"
				}
			}
		}

		const skillPath = dataPath+'/skills.json'
		const skillRead = fs.readFileSync(skillPath);
		const skillFile = JSON.parse(skillRead);
		
		// Boosting Passives
		for (const i in userDefs.skills) {
			const skillDefs2 = skillFile[userDefs.skills[i]]
		
			if (skillDefs2.type && skillDefs2.type === "passive") {
				if (skillDefs2.passive === "boost" && skillDefs2.boosttype == skillDefs.type) {
					movepow += (movepow/100)*skillDefs2.pow
				}
			}
		}
		
		// Resisting Passives
		var repelSkill = null
		var counterSkill = null
		for (const i in oppDefs.skills) {
			const skillDefs2 = skillFile[oppDefs.skills[i]]
		
			if (skillDefs2.type && skillDefs2.type == 'passive' && !skillDefs.limitbreak) {
				if (skillDefs2.passive === "weaken" && skillDefs2.weaktype == skillDefs.type) {
					movepow -= (movepow/100)*skillDefs2.pow
				} else if (skillDefs2.passive === "repelmag") {
					for (const i in skillDefs2.repeltypes) {
						if (skillDefs2.repeltypes[i] == skillDefs.type) {repelSkill = skillDefs2}
					}
				} else if ((skillDefs2.passive === "dodgephys" && skillDefs.atktype === "physical") ||
						   (skillDefs2.passive === "dodgemag" && skillDefs.atktype === "magic")) {
					var dodgeChance = skillDefs2.pow
					var dodgeValue = Math.round(Math.random()*100)

					console.log(`DodgeSkill: ${dodgeValue} <= ${dodgeChance}?`)
					if (dodgeValue <= dodgeChance) {
						embedText.targetText = `${userName} => ${oppName}`
						embedText.attackText = `${userName} used ${skillDefs.name}!`
						embedText.resultText = `${oppName}'s ${skillDefs2.name} allowed them to dodge the attack!`
						
						if (useEnergy) {
							if (skillDefs.cost && skillDefs.costtype) {
								if (skillDefs.costtype === "hp") {
									userDefs.hp = Math.max(0, userDefs.hp - skillDefs.cost)
								} else if (skillDefs.costtype === "hppercent" && !userDefs.boss) {
									userDefs.hp = Math.round(Math.max(0, userDefs.hp - ((userDefs.maxhp / 100) * skillDefs.cost)))
								} else if (skillDefs.costtype === "mp") {
									userDefs.mp = Math.max(0, userDefs.mpe - skillDefs.cost)
								} else if (skillDefs.costtype === "mppercent") {
									userDefs.mp = Math.round(Math.max(0, userDefs.mp - ((userDefs.maxmp / 100) * skillDefs.cost)))
								}
							}
						}

						return embedText
					}
				} else if ((skillDefs2.passive === "counterphys" && skillDefs.atktype === "physical") ||
						   (skillDefs2.passive === "countermag" && skillDefs.atktype === "magic")) {
					var dodgeChance = skillDefs2.counter.chance
					var dodgeValue = Math.round(Math.random()*100)

					console.log(`CounterSkill: ${dodgeValue} <= ${dodgeChance}?`)
					if (dodgeValue <= dodgeChance) {
						counterSkill = skillDefs2.counter.skill
					}
				}
			}
		}
		
		if (counterSkill) {
			var dmgtype2 = "normal"
			if (skillDefs.type && skillDefs.type != "almighty") {
				for (i = 0; i < userDefs.weak.length; i++) {
					if (userDefs.weak[i] == skillDefs.type) {
						dmgtype2 = "weak"
					}
				}
				for (i = 0; i < userDefs.resist.length; i++) {
					if (userDefs.resist[i] == skillDefs.type) {
						dmgtype2 = "resist"
					}
				}
				for (i = 0; i < userDefs.block.length; i++) {
					if (userDefs.block[i] == skillDefs.type) {
						dmgtype2 = "block"
					}
				}
				for (i = 0; i < userDefs.repel.length; i++) {
					if (userDefs.repel[i] == skillDefs.type) {
						dmgtype2 = "repel"
					}
				}
				for (i = 0; i < userDefs.drain.length; i++) {
					if (userDefs.drain[i] == skillDefs.type) {
						dmgtype2 = "drain"
					}
				}
			}

			var atk = oppDefs.atk + (oppWeapon.atk ? oppWeapon.atk : 0) + ((oppDefs.atk/10)*oppDefs.buffs.atk)
			if (counterSkill.atktype && counterSkill.atktype === "magic") {
				atk = oppDefs.mag + (oppWeapon.mag ? oppWeapon.mag : 0) + ((oppDefs.mag/10)*oppDefs.buffs.mag)
			}
			var prc = oppDefs.prc + ((oppDefs.prc/10)*oppDefs.buffs.prc)
			var luk = oppDefs.luk
			var chr = oppDefs.chr
			var enmdef = userDefs.end + (userWeapon.def ? userWeapon.def : 0) + ((userDefs.end/10)*userDefs.buffs.end)
			var enmagl = userDefs.agl + ((userDefs.agl/10)*userDefs.buffs.agl)
			var enmluk = userDefs.luk

			var movepow = counterSkill.pow
			if (counterSkill.affinitypow && oppDefs.affinitypoint && hasPassiveCopyLol(oppDefs, "affinitypoint")) {
				for (i = 0; i < oppDefs.affinitypoint; i++) {
					movepow += skillDefs.affinitypow
				}
			}

			var movetype = counterSkill.atktype
			var moveacc = 999
			if (counterSkill.acc) {
				moveacc = counterSkill.acc
			}
			
			// Dizziness
			if (oppDefs.status === "dizzy") {moveacc -= Math.floor(moveacc/2)}

			var movecrit = 0
			if (counterSkill.crit) {
				movecrit = counterSkill.crit
			}
			var movestatus = "none"
			var movestatuschance = 0
			if (counterSkill.status) {
				movestatus = counterSkill.status
				if (counterSkill.statuschance) {
					movestatuschance = counterSkill.statuschance
				}
			}

			var dmg = genDmg(atk, prc, luk, chr, movepow, moveacc, movecrit, movestatus, movestatuschance, movetype, enmdef, enmagl, enmluk, dmgtype2);
			
			var finaltext = `${oppName}'s ${counterSkill.name} allowed them to evade & counter! `
			var rand = Math.round(Math.random() * 10);
			dmg[0] = +dmg[0] + +rand;

			// Prompts
			var result = Math.round(dmg[0]);
			if (result < 1) { result = 1 }


			if (dmg[1] == "miss") {
				finaltext += `${userName} dodged it!`

				if (oppDefs.missquote && oppDefs.missquote.length > 0) {
					var possibleQuote = Math.round(Math.random() * (oppDefs.missquote.length-1))
					finaltext += `\n*${oppName}: "${oppDefs.missquote[possibleQuote]}"*`
				}
				if (userDefs.dodgequote && userDefs.dodgequote.length > 0) {
					var possibleQuote = Math.round(Math.random() * (userDefs.dodgequote.length-1))
					finaltext += `\n*${userName}: "${userDefs.dodgequote[possibleQuote]}"*`
				}
			} else if (dmg[1] == "repel") {
				finaltext += `It was repelled! ${oppName} took ${result}`;
				oppDefs.hp = Math.max(0, oppDefs.hp - result)
					
				if (userDefs.repelquote && userDefs.repelquote.length > 0) {
					var possibleQuote = Math.round(Math.random() * (userDefs.repelquote.length-1))
					finaltext += `\n*${userName}: "${userDefs.repelquote[possibleQuote]}"*`
				}
			} else if (repelSkill) {
				finaltext += `${userName}'s ${repelSkill.name} repels the attack! ${oppName} took ${result}`;
				oppDefs.hp = Math.max(0, oppDefs.hp - result)
					
				if (userDefs.repelquote && userDefs.repelquote.length > 0) {
					var possibleQuote = Math.round(Math.random() * (oppDefs.repelquote.length-1))
					finaltext += `\n*${userName}: "${userDefs.repelquote[possibleQuote]}"*`
				}
			} else if (userDefs.shield === "makarakarn" && counterSkill.atktype === "magic" || userDefs.shield === "tetrakarn" && counterSkill.atktype === "physical") {
				finaltext += `${userName}'s shield repels the attack, but gets destroyed! ${oppName} took ${result}`;
				oppDefs.hp = Math.max(0, oppDefs.hp - result)
				delete userDefs.shield
					
				if (userDefs.repelquote && userDefs.repelquote.length > 0) {
					var possibleQuote = Math.round(Math.random() * (oppDefs.repelquote.length-1))
					finaltext += `\n*${userName}: "${userDefs.repelquote[possibleQuote]}"*`
				}
			} else if (dmg[1] == "block") {
				finaltext += `${userName} blocked it!`
					
				if (userDefs.blockquote && userDefs.blockquote.length > 0) {
					var possibleQuote = Math.round(Math.random() * (userDefs.blockquote.length-1))
					finaltext += `\n*${userDefs.name}: "${userDefs.blockquote[possibleQuote]}"*`
				}
			} else if (dmg[1] == "drain") {
				finaltext = `It was drained! ${userName}'s HP was restored by ${result}`;
				userDefs.hp = Math.min(userDefs.maxhp, userDefs.hp + result)
					
				if (userDefs.drainquote && userDefs.drainquote.length > 0) {
					var possibleQuote = Math.round(Math.random() * (userDefs.drainquote.length-1))
					finaltext += `\n*${userDefs.name}: "${userDefs.drainquote[possibleQuote]}"*`
				}
			} else {
				finaltext += `${userName} took ${result}`;
				userDefs.hp = Math.max(0, userDefs.hp - result)
				userDefs.guard = false
			}

			if (dmg[1] !== "miss" && dmg[1] !== "block" && dmg[1] !== "drain") {
				if (dmg[2] == true) {
					finaltext = finaltext + "<:effective:876899270731628584>";
				} else if (dmgtype === "resist") {
					finaltext = finaltext + "<:resist:876899270517747814>";
				}

				// Display Crits
				if (dmg[3] == true) {
					finaltext = finaltext + "<:crit:876905905248145448>";
				}

				// Display the "damage" part of the text
				finaltext = finaltext + " damage";

				if (userDefs.hp <= 0) {
					finaltext = finaltext + " and was defeated!";
					userDefs.hp = 0;

					if (oppDefs.killquote && oppDefs.killquote.length > 0) {
						var possibleQuote = Math.round(Math.random() * (oppDefs.killquote.length-1))
						finaltext += `\n*${oppDefs.name}: "${oppDefs.killquote[possibleQuote]}"*`
					}
					if (userDefs.deathquote && userDefs.deathquote.length > 0) {
						var possibleQuote = Math.round(Math.random() * (userDefs.deathquote.length-1))
						finaltext += `\n*${userDefs.name}: "${userDefs.deathquote[possibleQuote]}"*`
					}
				} else {
					finaltext = finaltext + "!";
					if (dmg[4] == true && userDefs.status == "none") {
						const movestatus = counterSkill.status ? counterSkill.status : "none"

						if (movestatus === "burn") {
							finaltext += " They were burned!"
							userDefs.status = "burn"
							userDefs.statusturns = 3
						} else if (movestatus === "bleed") {
							finaltext += " They were inflicted with bleed!"
							userDefs.status = "bleed"
							userDefs.statusturns = 5
						} else if (movestatus === "poison" || movestatus === "toxic") {
							finaltext += " They were poisoned!"
							userDefs.status = "poison"
							userDefs.statusturns = 3
						} else if (movestatus === "freeze") {
							finaltext += " They were frozen!"
							userDefs.status = "freeze"
							userDefs.statusturns = 1
						} else if (movestatus === "paralyze") {
							finaltext += " They were paralyzed!"
							userDefs.status = "paralyze"
							userDefs.statusturns = 1
						} else if (movestatus === "dizzy") {
							finaltext = finaltext + " They were inflicted with dizziness!"
							userDefs.status = "dizzy"
							userDefs.statusturns = 3
						} else if (movestatus === "brainwash") {
							finaltext += " They were brainwashed!"
							userDefs.status = "brainwash"
							userDefs.statusturns = 2
						} else if (movestatus === "rage") {
							finaltext = finaltext + " They were enraged!"
							userDefs.status = "rage"
							userDefs.statusturns = 3
						} else if (movestatus === "fear") {
							finaltext = finaltext + " They got scared!"
							userDefs.status = "fear"
							userDefs.statusturns = 2
						} else if (movestatus === "ego") {
							finaltext = finaltext + " They were made egotistic!"
							userDefs.status = "ego"
							userDefs.statusturns = 3
						} else if (movestatus === "paranoia") {
							finaltext = finaltext + " They were made paranoid!"
							userDefs.status = "paranoia"
							oppDefs.statusturns = 2
						} else if (movestatus === "despair") {
							finaltext = finaltext + " They were inflicted with despair!"
							userDefs.status = "despair"
							userDefs.statusturns = -1
						}
					}
					
					if (userDefs.hurtquote && userDefs.hurtquote.length > 0) {
						var possibleQuote = Math.round(Math.random() * (userDefs.hurtquote.length-1))
						finaltext += `\n*${userDefs.name}: "${userDefs.hurtquote[possibleQuote]}"*`
					}
				}

				// Drain Moves
				if (counterSkill.drain) {
					const draindmg = Math.round(dmg[0]/counterSkill.drain)
					oppDefs.hp = Math.min(oppDefs.maxhp, oppDefs.hp + draindmg)
					finaltext = finaltext + ` ${oppName} drained ${draindmg} damage.`
				}

				// Passives
				const skillPath = dataPath+'/skills.json'
				const skillRead = fs.readFileSync(skillPath);
				const skillFile = JSON.parse(skillRead);
				for (const skillNum in userDefs.skills) {
					const skillDefs2 = skillFile[userDefs.skills[skillNum]]
					if (skillDefs2.type && skillDefs2.type === "passive") {
						if (skillDefs2.passive === "damagephys" && counterSkill.atktype === "physical") {
							oppDefs.hp = Math.max(oppDefs.maxhp, oppDefs.hp - skillDefs2.pow)
							finaltext += ` ${oppName} was damaged by ${userName}'s ${oppDefs.skills[skillNum]}, taking ${skillDefs2.pow} damage!`
						}
						
						if (skillDefs2.passive === "damagemag" && counterSkill.atktype === "magic") {
							oppDefs.hp = Math.max(oppDefs.maxhp, oppDefs.hp - skillDefs2.pow)
							finaltext += ` ${oppName} was damaged by ${userName}'s ${oppDefs.skills[skillNum]}, taking ${skillDefs2.pow} damage!`
						}
					}
				}
			}
		} else {
			var userQuote
			var oppQuote

			if (!skillDefs.hits || skillDefs.hits == 1) {
				var dmg = genDmg(atk, prc, luk, chr, movepow, moveacc, movecrit, movestatus, movestatuschance, movetype, enmdef, enmagl, enmluk, dmgtype)
				var finaltext = ``
				var rand = Math.round(Math.random() * 10);
				dmg[0] = +dmg[0] + +rand;

				// Prompts
				var result = Math.round(dmg[0]);
				if (result < 1) { result = 1 }

				if (oppDefs.guard && !skillDefs.limitbreak) {
					result = Math.round(dmg[0]/2)
				}

				if (oppDefs.shield && oppDefs.shield === "guard" && !skillDefs.type === "almighty" && !skillDefs.limitbreak) {
					result = Math.round(dmg[0]/4)
				}

				if (dmg[1] == "miss") {
					finaltext += `${oppName} dodged it!`

					if (userDefs.missquote && userDefs.missquote.length > 0) {
						var possibleQuote = Math.round(Math.random() * (userDefs.missquote.length-1))
						userQuote = `\n*${userDefs.name}: "${userDefs.missquote[possibleQuote]}"*`
					}
					if (oppDefs.dodgequote && oppDefs.dodgequote.length > 0) {
						var possibleQuote = Math.round(Math.random() * (oppDefs.dodgequote.length-1))
						oppQuote = `\n*${oppDefs.name}: "${oppDefs.dodgequote[possibleQuote]}"*`
					}
				} else if (dmg[1] == "repel") {
					finaltext += `It was repelled! ${userName} took ${result}`;
					userDefs.hp = Math.max(0, userDefs.hp - result)
					
					if (oppDefs.repelquote && oppDefs.repelquote.length > 0) {
						var possibleQuote = Math.round(Math.random() * (oppDefs.repelquote.length-1))
						oppQuote = `\n*${oppDefs.name}: "${oppDefs.repelquote[possibleQuote]}"*`
					}
				} else if (repelSkill) {
					finaltext += `${oppName}'s ${repelSkill.name} repels the attack! ${userName} took ${result}`;
					userDefs.hp = Math.max(0, userDefs.hp - result)
					
					if (oppDefs.repelquote && oppDefs.repelquote.length > 0) {
						var possibleQuote = Math.round(Math.random() * (oppDefs.repelquote.length-1))
						oppQuote = `\n*${oppDefs.name}: "${oppDefs.repelquote[possibleQuote]}"*`
					}
				} else if (oppDefs.shield === "makarakarn" && skillDefs.atktype === "magic" || oppDefs.shield === "tetrakarn" && skillDefs.atktype === "physical") {
					finaltext += `${oppName}'s shield repels the attack, but gets destroyed! ${userName} took ${result}`;
					userDefs.hp = Math.max(0, userDefs.hp - result)
					delete oppDefs.shield
					
					if (oppDefs.repelquote && oppDefs.repelquote.length > 0) {
						var possibleQuote = Math.round(Math.random() * (oppDefs.repelquote.length-1))
						oppQuote = `\n*${oppDefs.name}: "${oppDefs.repelquote[possibleQuote]}"*`
					}
				} else if (dmg[1] == "block") {
					finaltext += `${oppName} blocked it!`
					
					if (oppDefs.blockquote && oppDefs.blockquote.length > 0) {
						var possibleQuote = Math.round(Math.random() * (oppDefs.blockquote.length-1))
						oppQuote = `\n*${oppDefs.name}: "${oppDefs.blockquote[possibleQuote]}"*`
					}
				} else if (dmg[1] == "drain") {
					finaltext = `It was drained! ${oppName}'s HP was restored by ${result}`;
					oppDefs.hp = Math.min(oppDefs.maxhp, oppDefs.hp + result)
					
					if (oppDefs.drainquote && oppDefs.drainquote.length > 0) {
						var possibleQuote = Math.round(Math.random() * (oppDefs.drainquote.length-1))
						oppQuote = `\n*${oppDefs.name}: "${oppDefs.drainquote[possibleQuote]}"*`
					}
				} else {
					finaltext += `${oppName} took ${result}`;
					oppDefs.hp = Math.max(0, oppDefs.hp - result)
					oppDefs.guard = false
					
					if (oppDefs.hurtquote && oppDefs.hurtquote.length > 0) {
						var possibleQuote = Math.round(Math.random() * (oppDefs.hurtquote.length-1))
						oppQuote = `\n*${oppDefs.name}: "${oppDefs.hurtquote[possibleQuote]}"*`
					}
				}

				// Display Weakness
				if (dmg[1] !== "miss" && dmg[1] !== "block" && dmg[1] !== "drain") {
					if (dmg[2] == true) {
						finaltext = finaltext + "<:effective:876899270731628584>";

						if (doOneMores(server) && !oppDefs.down) {
							oppDefs.down = true
							embedText.oneMore = true
						}
					} else if (dmgtype === "resist") {
						finaltext = finaltext + "<:resist:877132670784647238>";
					}

					// Display Crits
					if (dmg[3] == true) {
						finaltext = finaltext + "<:crit:876905905248145448>";

						if (doOneMores(server) && !oppDefs.down) {
							oppDefs.down = true
							embedText.oneMore = true
						}
					}

					// Display the "damage" part of the text
					finaltext += " damage";

					// Weakness Quotes & Critical Quotes
					if (dmg[2] == true) {
						if (userDefs.strongquote && userDefs.strongquote.length > 0) {
							var possibleQuote = Math.round(Math.random() * (userDefs.strongquote.length-1))
	
							if (userQuote) {
								userQuote += `\n*${userDefs.name}: "${userDefs.strongquote[possibleQuote]}"*`
							} else {
								userQuote = `\n*${userDefs.name}: "${userDefs.strongquote[possibleQuote]}"*`
							}
						}

						if (oppDefs.weakquote && oppDefs.weakquote.length > 0) {
							console.log(`${oppDefs.name}'s Weak Quote is played.`)
							var possibleQuote = Math.round(Math.random() * (oppDefs.weakquote.length-1))
							
							if (oppQuote) {
								oppQuote += `\n*${oppDefs.name}: "${oppDefs.weakquote[possibleQuote]}"*`
							} else {
								oppQuote = `\n*${oppDefs.name}: "${oppDefs.weakquote[possibleQuote]}"*`
							}
						}
					}
					
					if (dmg[3] == true && userDefs.critquote && userDefs.critquote.length > 0) {
						var possibleQuote = Math.round(Math.random() * (userDefs.critquote.length-1))
						
						if (userQuote) {
							userQuote += `\n*${userDefs.name}: "${userDefs.critquote[possibleQuote]}"*`
						} else {
							userQuote = `\n*${userDefs.name}: "${userDefs.critquote[possibleQuote]}"*`
						}
					}

					if (oppDefs.hp <= 0 && dmg[1] != "repel") {
						finaltext = finaltext + " and was defeated!";
						oppDefs.hp = 0;

						if (userDefs.killquote && userDefs.killquote.length > 0) {
							var possibleQuote = Math.round(Math.random() * (userDefs.killquote.length-1))
							userQuote = `\n*${userDefs.name}: "${userDefs.killquote[possibleQuote]}"*`
						}

						if (oppDefs.deathquote && oppDefs.deathquote.length > 0) {
							var possibleQuote = Math.round(Math.random() * (oppDefs.deathquote.length-1))
							oppQuote = `\n*${oppDefs.name}: "${oppDefs.deathquote[possibleQuote]}"*`
						}
					} else if (userDefs.hp <= 0 && dmg[1] == "repel") {
						finaltext = finaltext + " and was defeated!";
						userDefs.hp = 0;

						if (oppDefs.killquote && oppDefs.killquote.length > 0) {
							var possibleQuote = Math.round(Math.random() * (oppDefs.killquote.length-1))
							oppQuote = `\n*${oppDefs.name}: "${oppDefs.killquote[possibleQuote]}"*`
						}

						if (userDefs.deathquote && userDefs.deathquote.length > 0) {
							var possibleQuote = Math.round(Math.random() * (userDefs.deathquote.length-1))
							userQuote = `\n*${userDefs.name}: "${userDefs.deathquote[possibleQuote]}"*`
						}
					} else {
						finaltext = finaltext + "!";
						if (dmg[4] == true && oppDefs.status == "none") {
							if (movestatus === "burn") {
								finaltext += " They were burned!"
								oppDefs.status = "burn"
								oppDefs.statusturns = 3
							} else if (movestatus === "bleed") {
								finaltext += " They were inflicted with bleed!"
								oppDefs.status = "bleed"
								oppDefs.statusturns = 5
							} else if (movestatus === "poison" || movestatus === "toxic") {
								finaltext += " They were poisoned!"
								oppDefs.status = "poison"
								oppDefs.statusturns = 3
							} else if (movestatus === "freeze") {
								finaltext += " They were frozen!"
								oppDefs.status = "freeze"
								oppDefs.statusturns = 1
							} else if (movestatus === "paralyze") {
								finaltext += " They were paralyzed!"
								oppDefs.status = "paralyze"
								oppDefs.statusturns = 1
							} else if (movestatus === "dizzy") {
								finaltext = finaltext + " They were inflicted with dizziness!"
								oppDefs.status = "dizzy"
								oppDefs.statusturns = 3
							} else if (movestatus === "brainwash") {
								finaltext += " They were brainwashed!"
								oppDefs.status = "brainwash"
								oppDefs.statusturns = 2
							} else if (movestatus === "rage") {
								finaltext = finaltext + " They were enraged!"
								oppDefs.status = "rage"
								oppDefs.statusturns = 3
							} else if (movestatus === "fear") {
								finaltext = finaltext + " They got scared!"
								oppDefs.status = "fear"
								oppDefs.statusturns = 2
							} else if (movestatus === "ego") {
								finaltext = finaltext + " They were made egotistic!"
								oppDefs.status = "ego"
								oppDefs.statusturns = 3
							} else if (movestatus === "paranoia") {
								finaltext = finaltext + " They were made paranoid!"
								oppDefs.status = "paranoia"
								oppDefs.statusturns = 2
							} else if (movestatus === "despair") {
								finaltext = finaltext + " They were inflicted with despair!"
								oppDefs.status = "despair"
								oppDefs.statusturns = -1
							}
						}
					}

					// Drain Moves
					if (skillDefs.drain) {
						const draindmg = Math.round(dmg[0] / skillDefs.drain)
						userDefs.hp = Math.min(userDefs.maxhp, userDefs.hp + draindmg)
						finaltext = finaltext + ` ${userName} drained ${draindmg} damage.`
					}

					// Passives
					const skillPath = dataPath+'/skills.json'
					const skillRead = fs.readFileSync(skillPath);
					const skillFile = JSON.parse(skillRead);
					for (const skillNum in oppDefs.skills) {
						const skillDefs2 = skillFile[oppDefs.skills[skillNum]]
						if (skillDefs2.type && skillDefs2.type === "passive") {
							if (skillDefs2.passive === "damagephys" && skillDefs.atktype === "physical") {
								userDefs.hp = Math.max(userDefs.maxhp, userDefs.hp - skillDefs2.pow)
								finaltext += ` ${userName} was damaged by ${oppName}'s ${oppDefs.skills[skillNum]}, taking ${skillDefs2.pow} damage!`
							}
							
							if (skillDefs2.passive === "damagemag" && skillDefs.atktype === "magic") {
								userDefs.hp = Math.max(userDefs.maxhp, userDefs.hp - skillDefs2.pow)
								finaltext += ` ${userName} was damaged by ${oppName}'s ${oppDefs.skills[skillNum]}, taking ${skillDefs2.pow} damage!`
							}
						}
					}

					if (oppDefs.shield == "guard") {
						finaltext += `\n${oppName}'s protection was destroyed!`
						delete oppDefs.shield
					}

					// Limit Break
					if (dmg[1] != "repel" && doLimitBreaks(server)) {
						if (skillDefs.target === "allopposing" || skillDefs.target === "allallies") {
							userDefs.lb += Math.floor(result / 8)
						} else if (skillDefs.target === "everyone") {
							userDefs.lb += Math.floor(result / 16)
						} else {
							userDefs.lb += Math.floor(result / 4)
						}

						oppDefs.lb += Math.floor(result / 16)
					}
				}
			} else {
				var finaltext = ``;
				
				var dmgCheck = genDmg(atk, prc, luk, chr, movepow, moveacc, movecrit, movestatus, movestatuschance, movetype, enmdef, enmagl, enmluk, dmgtype);
				if (dmgCheck[1] == "miss") {
					finaltext = `${oppName} dodged it!`;

					if (userDefs.missquote && userDefs.missquote.length > 0) {
						var possibleQuote = Math.round(Math.random() * (userDefs.missquote.length-1))
						userQuote = `\n*${userDefs.name}: "${userDefs.missquote[possibleQuote]}"*`
					}
					if (oppDefs.dodgequote && oppDefs.dodgequote.length > 0) {
						var possibleQuote = Math.round(Math.random() * (oppDefs.dodgequote.length-1))
						oppQuote = `\n*${oppDefs.name}: "${oppDefs.dodgequote[possibleQuote]}"*`
					}
				} else if (dmgCheck[1] == "repel") {
					finaltext = `It was repelled! ${userName} took `;
					
					if (oppDefs.repelquote && oppDefs.repelquote.length > 0) {
						var possibleQuote = Math.round(Math.random() * (oppDefs.repelquote.length-1))
						oppQuote = `\n*${oppDefs.name}: "${oppDefs.repelquote[possibleQuote]}"*`
					}
				} else if (repelSkill) {
					finaltext = `${oppName}'s ${repelSkill.name} repels the attack! ${userName} took `;
					
					if (oppDefs.repelquote && oppDefs.repelquote.length > 0) {
						var possibleQuote = Math.round(Math.random() * (oppDefs.repelquote.length-1))
						oppQuote = `\n*${oppDefs.name}: "${oppDefs.repelquote[possibleQuote]}"*`
					}
				} else if (oppDefs.shield === "makarakarn" && skillDefs.atktype === "magic" || oppDefs.shield === "tetrakarn" && skillDefs.atktype === "physical") {
					finaltext = `${oppName}'s shield repels the attack, but gets destroyed! ${userName} took`;
					delete oppDefs.shield
					
					if (oppDefs.repelquote && oppDefs.repelquote.length > 0) {
						var possibleQuote = Math.round(Math.random() * (oppDefs.repelquote.length-1))
						oppQuote = `\n*${oppDefs.name}: "${oppDefs.repelquote[possibleQuote]}"*`
					}
				} else if (dmgCheck[1] == "block") {
					finaltext = `${oppName} blocked it!`;
					
					if (oppDefs.blockquote && oppDefs.blockquote.length > 0) {
						var possibleQuote = Math.round(Math.random() * (oppDefs.blockquote.length-1))
						oppQuote = `\n*${oppDefs.name}: "${oppDefs.blockquote[possibleQuote]}"*`
					}
				} else if (dmgCheck[1] == "drain") {
					finaltext = `It was drained! ${oppName}'s HP was restored by`;
					
					if (oppDefs.drainquote && oppDefs.drainquote.length > 0) {
						var possibleQuote = Math.round(Math.random() * (oppDefs.drainquote.length-1))
						oppQuote = `\n*${oppDefs.name}: "${oppDefs.drainquote[possibleQuote]}"*`
					}
				} else {
					finaltext = `${oppName} took `;
				}
				
				// Accuracy Checks
				var hitCount = 1;
				for (let i = 2; i <= skillDefs.hits; i++) {
					if (missCheck(prc, enmagl, moveacc)) {
						hitCount++;
					} else {
						break
					}
				}
				
				if (dmgCheck[1] != "block" && dmgCheck[1] != "miss") {
					var total = 0;
					var resulttext = ``;
					for (let i = 1; i <= hitCount; i++) {
						var dmg = genDmg(atk, prc, luk, chr, movepow, 9999, movecrit, movestatus, movestatuschance, movetype, enmdef, 0, enmluk, dmgtype)
						var rand = Math.floor(Math.random() * 10);
						dmg[0] += +rand;

						// Prompts
						var result = Math.round(dmg[0]);
						if (result < 1) { result = 1 }

						if (oppDefs.guard && !skillDefs.limitbreak) {
							result = Math.round(dmg[0]/2)
						}

						if (oppDefs.shield && oppDefs.shield === "guard" && !skillDefs.type === "almighty" && !skillDefs.limitbreak) {
							result = Math.round(dmg[0]/4)
						}

						if (dmgCheck[1] == "repel" || repelSkill || (oppDefs.shield === "makarakarn" && skillDefs.atktype === "magic" || oppDefs.shield === "tetrakarn" && skillDefs.atktype === "physical")) {
							userDefs.hp = Math.max(0, userDefs.hp - result)
						} else if (dmgCheck[1] == "drain") {
							oppDefs.hp = Math.min(oppDefs.maxhp, oppDefs.hp + result)
						} else {
							if (oppDefs.guard) { result = Math.round(result/2)}

							oppDefs.hp = Math.max(0, oppDefs.hp - result)
							oppDefs.guard = false
						}
						
						if ((dmgCheck[2] || dmg[3]) && doOneMores(server) && !oppDefs.down) {
							oppDefs.down = true
							embedText.oneMore = true
						}

						var effective = ""
						if (dmgCheck[2]) {effective = "<:effective:876899270731628584>"}
						if (dmgCheck[1] === "resist") {effective = "<:resist:877132670784647238>"}

						resulttext += `${result}${effective}${(dmg[3]) ? "<:crit:876905905248145448>" : ""}`;

						total += result;
						if (i < hitCount) {
							resulttext += "+";
						} else {
							if (hitCount >= skillDefs.hits) {
								resulttext += ` *(**Full Combo!** ${total} Total!)*`;
							} else {
								resulttext += ` *(${hitCount}/${skillDefs.hits} landed hits, ${total} Total!)*`;
							}
						}
					}

					finaltext += resulttext

					// Display Weakness
					if (dmgCheck[1] !== "miss" && dmgCheck[1] !== "drain" && dmgCheck[1] !== "block") {
						finaltext = finaltext + " damage";

						// Weakness Quotes & Critical Quotes
						if (dmgCheck[2] == true) {
							if (userDefs.strongquote && userDefs.strongquote.length > 0) {
								var possibleQuote = Math.round(Math.random() * (userDefs.strongquote.length-1))
		
								if (userQuote) {
									userQuote += `\n*${userDefs.name}: "${userDefs.strongquote[possibleQuote]}"*`
								} else {
									userQuote = `\n*${userDefs.name}: "${userDefs.strongquote[possibleQuote]}"*`
								}
							}

							if (oppDefs.weakquote && oppDefs.weakquote.length > 0) {
								console.log(`${oppDefs.name}'s Weak Quote is played.`)
								var possibleQuote = Math.round(Math.random() * (oppDefs.weakquote.length-1))
								
								if (oppQuote) {
									oppQuote += `\n*${oppDefs.name}: "${oppDefs.weakquote[possibleQuote]}"*`
								} else {
									oppQuote = `\n*${oppDefs.name}: "${oppDefs.weakquote[possibleQuote]}"*`
								}
							}
						}
						
						if (dmgCheck[3] == true && userDefs.critquote && userDefs.critquote.length > 0) {
							var possibleQuote = Math.round(Math.random() * (userDefs.critquote.length-1))
							
							if (userQuote) {
								userQuote += `\n*${userDefs.name}: "${userDefs.critquote[possibleQuote]}"*`
							} else {
								userQuote = `\n*${userDefs.name}: "${userDefs.critquote[possibleQuote]}"*`
							}
						}

						if (oppDefs.hp <= 0 && dmgCheck[1] != "repel") {
							finaltext = finaltext + " and was defeated!";
							oppDefs.hp = 0;

							if (userDefs.killquote && userDefs.killquote.length > 0) {
								var possibleQuote = Math.round(Math.random() * (userDefs.killquote.length-1))
								userQuote = `\n*${userDefs.name}: "${userDefs.killquote[possibleQuote]}"*`
							}

							if (oppDefs.deathquote && oppDefs.deathquote.length > 0) {
								var possibleQuote = Math.round(Math.random() * (oppDefs.deathquote.length-1))
								oppQuote = `\n*${oppDefs.name}: "${oppDefs.deathquote[possibleQuote]}"*`
							}
						} else if (userDefs.hp <= 0 && dmgChecj[1] == "repel") {
							finaltext = finaltext + " and was defeated!";
							userDefs.hp = 0;

							if (oppDefs.killquote && oppDefs.killquote.length > 0) {
								var possibleQuote = Math.round(Math.random() * (oppDefs.killquote.length-1))
								oppQuote = `\n*${oppDefs.name}: "${oppDefs.killquote[possibleQuote]}"*`
							}

							if (userDefs.deathquote && userDefs.deathquote.length > 0) {
								var possibleQuote = Math.round(Math.random() * (userDefs.deathquote.length-1))
								userQuote = `\n*${userDefs.name}: "${userDefs.deathquote[possibleQuote]}"*`
							}
						} else {
							finaltext = finaltext + "!";
							if (dmgCheck[4] == true) {
								if (movestatus === "burn") {
									finaltext = finaltext + " They were burned!"
									oppDefs.status = "burn"
									oppDefs.statusturns = 3
								} else if (movestatus === "bleed") {
									finaltext = finaltext + " They were inflicted with bleed!"
									oppDefs.status = "bleed"
									oppDefs.statusturns = 5
								} else if (movestatus === "poison" || movestatus === "toxic") {
									finaltext = finaltext + " They were poisoned!"
									oppDefs.status = "poison"
									oppDefs.statusturns = 3
								} else if (movestatus === "freeze") {
									finaltext = finaltext + " They were frozen!"
									oppDefs.status = "freeze"
									oppDefs.statusturns = 1
								} else if (movestatus === "paralyze") {
									finaltext = finaltext + " They were paralyzed!"
									oppDefs.status = "paralyze"
									oppDefs.statusturns = 1
								} else if (movestatus === "dizzy") {
									finaltext = finaltext + " They were inflicted with dizziness!"
									oppDefs.status = "dizzy"
									oppDefs.statusturns = 3
								} else if (movestatus === "brainwash") {
									finaltext = finaltext + " They were brainwashed!"
									oppDefs.status = "brainwash"
									oppDefs.statusturns = 2
								} else if (movestatus === "rage") {
									finaltext = finaltext + " They were enraged!"
									oppDefs.status = "rage"
									oppDefs.statusturns = 3
								} else if (movestatus === "fear") {
									finaltext = finaltext + " They got scared!"
									oppDefs.status = "fear"
									oppDefs.statusturns = 2
								} else if (movestatus === "ego") {
									finaltext = finaltext + " They were made egotistic!"
									oppDefs.status = "ego"
									oppDefs.statusturns = 3
								} else if (movestatus === "paranoia") {
									finaltext = finaltext + " They were made paranoid!"
									oppDefs.status = "paranoia"
									oppDefs.statusturns = 2
								} else if (movestatus === "despair") {
									finaltext = finaltext + " They were inflicted with despair!"
									oppDefs.status = "despair"
									oppDefs.statusturns = -1
								}
							}
						}

						// Drain Moves
						if (skillDefs.drain) {
							const draindmg = Math.round(total / skillDefs.drain)
							userDefs.hp = Math.min(userDefs.maxhp, userDefs.hp + draindmg)
							finaltext += ` ${userName} drained ${draindmg} damage.`
						}

						// Passives
						for (const skillNum in oppDefs.skills) {
							const skillPath = dataPath+'/skills.json'
							const skillRead = fs.readFileSync(skillPath);
							const skillFile = JSON.parse(skillRead);
							const skillDefs2 = skillFile[oppDefs.skills[skillNum]]
							if (skillDefs2.type && skillDefs2.type === "passive") {
								if (skillDefs2.passive === "damagephys" && skillDefs.atktype === "physical") {
									userDefs.hp = Math.max(userDefs.maxhp, userDefs.hp - skillDefs2.pow)
									finaltext = finaltext + ` ${userName} was damaged by ${oppName}'s ${oppDefs.skills[skillNum]}, taking ${skillDefs2.pow} damage!`
								}
								
								if (skillDefs2.passive === "damagemag" && skillDefs.atktype === "magic") {
									userDefs.hp = Math.max(userDefs.maxhp, userDefs.hp - skillDefs2.pow)
									finaltext += ` ${userName} was damaged by ${oppName}'s ${oppDefs.skills[skillNum]}, taking ${skillDefs2.pow} damage!`
								}
							}
						}

						if (oppDefs.shield == "guard") {
							finaltext += `\n${oppName}'s protection was destroyed!`
							delete oppDefs.shield
						}
						
						// Limit Break
						if (dmgCheck[1] != "repel" && doLimitBreaks(server)) {
							if (skillDefs.target === "allopposing" || skillDefs.target === "allallies") {
								userDefs.lb += Math.floor(total / 8)
							} else if (skillDefs.target === "everyone") {
								userDefs.lb += Math.floor(total / 16)
							} else {
								userDefs.lb += Math.floor(total / 4)
							}

							oppDefs.lb += Math.floor(total / 16)
						}
					}
				}
			}

			if (userQuote) {finaltext += userQuote}
			if (oppQuote) {finaltext += oppQuote}
		}

		if (skillDefs.buff) {
			if (skillDefs.buffchance) {
				if (Math.random() < skillDefs.buffchance/100) {
					userDefs[`${skillDefs.buff}buff`] = Math.min(3, userDefs[`${skillDefs.buff}buff`]++)
					finaltext += `\n${userName}'s ${skillDefs.buff.toUpperCase()} was buffed!`
				}
			} else {
				userDefs[`${skillDefs.buff}buff`] = Math.min(3, userDefs[`${skillDefs.buff}buff`]++)
				finaltext += `\n${userName}'s ${skillDefs.buff.toUpperCase()} was buffed!`
			}
		}

		if (skillDefs.debuff) {
			if (skillDefs.buffchance) {
				var debuffChance = (skillDefs.buffchance + (userDefs.luk - oppDefs.luk)) / 100;
				var chance = Math.random();
				
				if (chance < debuffChance) {
					oppDefs[`${skillDefs.debuff}buff`] = Math.max(-3, oppDefs[`${skillDefs.debuff}buff`]--)
					finaltext += `\n${userName} debuffed ${oppName}'s ${skillDefs.debuff.toUpperCase()}!`
				}
			} else {
				oppDefs[`${skillDefs.debuff}buff`] = Math.max(-3, oppDefs[`${skillDefs.debuff}buff`]--)
				finaltext += `\n${userName} debuffed ${oppName}'s ${skillDefs.debuff.toUpperCase()}!`
			}
		}

		if (skillDefs.rest) {
			userDefs.rest = true
			finaltext += `\n*${userName} needs to recharge.*`
		}

		embedText.targetText = `${userName} => ${oppName}`
		embedText.attackText = `${userName} used ${skillDefs.name} on ${oppName}!`
		embedText.resultText = `${finaltext}`
	}

	if (useEnergy) {
		if (skillDefs.cost && skillDefs.costtype) {
			if (skillDefs.costtype === "hp") {
				userDefs.hp = Math.max(1, userDefs.hp - skillDefs.cost)
			} else if (skillDefs.costtype === "hppercent" && !userDefs.boss) {
				userDefs.hp = Math.round(Math.max(1, userDefs.hp - ((userDefs.maxhp / 100) * skillDefs.cost)))
			} else if (skillDefs.costtype === "mp") {
				userDefs.mp = Math.max(0, userDefs.mp - skillDefs.cost)
			} else if (skillDefs.costtype === "mppercent") {
				userDefs.mp = Math.round(Math.max(0, userDefs.mp - ((userDefs.maxmp / 100) * skillDefs.cost)))
			}
		}
	}
	
	return embedText
}

function meleeAttack(userDefs, enmDefs, server) {
	const embedText = {
		targetText: "",
		attackText: "",
		resultText: "",
		oneMore: false
	}
	
	var userName = userDefs.name
	var enmName = enmDefs.name

    if (!userDefs.weapon) {
        userDefs.weapon = "none"
    }
		
    if (!enmDefs.weapon) {
        enmDefs.weapon = "none"
    }
	
    var itemPath = dataPath+'/items.json'
    var itemRead = fs.readFileSync(itemPath);
    var itemFile = JSON.parse(itemRead);
		
    const userWeapon = itemFile[userDefs.weapon] ? itemFile[userDefs.weapon] : itemFile["none"]
    const enmWeapon = itemFile[enmDefs.weapon] ? itemFile[enmDefs.weapon] : itemFile["none"]

	var atk = userDefs.atk + (userWeapon.atk ? userWeapon.atk : 0) + ((userDefs.atk/10)*userDefs.buffs.atk)
	var prc = userDefs.prc + ((userDefs.prc/10)*userDefs.buffs.prc)
	var luk = userDefs.luk
	var chr = userDefs.chr
	var enmdef = enmDefs.end + (enmWeapon.def ? enmWeapon.def : 0) + ((enmDefs.end/10)*enmDefs.buffs.end)
	var enmagl = enmDefs.agl + ((enmDefs.agl/10)*enmDefs.buffs.agl)
	var enmluk = enmDefs.luk
	var movetype = userDefs.melee[1]

	// Weaknesses and shit
	var dmgtype = "normal"
	if (userDefs.melee[1]) {
		for (i = 0; i < enmDefs.weak.length; i++) {
			if (enmDefs.weak[i] == userDefs.melee[1]) {
				dmgtype = "weak"
			}
		}
		for (i = 0; i < enmDefs.resist.length; i++) {
			if (enmDefs.resist[i] == userDefs.melee[1]) {
				dmgtype = "resist"
			}
		}
		for (i = 0; i < enmDefs.block.length; i++) {
			if (enmDefs.block[i] == userDefs.melee[1]) {
				dmgtype = "block"
			}
		}
		for (i = 0; i < enmDefs.repel.length; i++) {
			if (enmDefs.repel[i] == userDefs.melee[1]) {
				dmgtype = "repel"
			}
		}
		for (i = 0; i < enmDefs.drain.length; i++) {
			if (enmDefs.drain[i] == userDefs.melee[1]) {
				dmgtype = "drain"
			}
		}
	}

	// Damage.
	var dmg = genDmg(atk, prc, luk, chr, 15, 95, 10, "none", 0, movetype, enmdef, enmagl, enmluk, dmgtype)
	var finaltext = ``
	var rand = Math.floor(Math.random() * 10);
	dmg[0] = +dmg[0] + +rand;

	// Prompts
	var result = Math.round(dmg[0]);
	if (dmg[1] == "miss") {
		finaltext += `${enmName} dodged it!`

		if (userDefs.missquote && userDefs.missquote.length > 0) {
			var possibleQuote = Math.round(Math.random() * (userDefs.missquote.length-1))
			finaltext += `\n*${userDefs.name}: "${userDefs.missquote[possibleQuote]}"*`
		}
		if (enmDefs.dodgequote && enmDefs.dodgequote.length > 0) {
			var possibleQuote = Math.round(Math.random() * (enmDefs.dodgequote.length-1))
			finaltext += `\n*${enmDefs.name}: "${enmDefs.dodgequote[possibleQuote]}"*`
		}
	} else if (dmg[1] == "repel") {
		finaltext += `It was repelled! ${userName} took ` + result;
		userDefs.hp -= result
		userDefs.guard = false
					
		if (enmDefs.repelquote && enmDefs.repelquote.length > 0) {
			var possibleQuote = Math.round(Math.random() * (enmDefs.repelquote.length-1))
			finaltext += `\n*${enmDefs.name}: "${enmDefs.repelquote[possibleQuote]}"*`
		}
	} else if (dmg[1] == "drain") {
		finaltext += `It was drained! ${enmName} drained ${result} HP.`;
		enmDefs.hp = Math.max(enmDefs.maxhp, enmDefs.hp + result)
					
		if (enmDefs.drainquote && enmDefs.drainquote.length > 0) {
			var possibleQuote = Math.round(Math.random() * (enmDefs.drainquote.length-1))
			finaltext += `\n*${oppDefs.name}: "${enmDefs.drainquote[possibleQuote]}"*`
		}
	} else if (enmDefs.guard) {
		finaltext += "It was guarded! The effect was nullified."
	} else {
		if (result < 1) {
			result = 1;
		}

		finaltext += `${enmName} took ` + result;
		enmDefs.hp -= result
		userDefs.guard = false
	}

	// Display Weakness
	if (dmg[1] !== "miss" && dmg[1] !== "drain" && !enmDefs.guard) {
		if (dmg[2] == true) {
			finaltext += "<:effective:876899270731628584>";

			if (doOneMores(server) && !enmDefs.down) {
				enmDefs.down = true
				embedText.oneMore = true
			}
		} else if (dmgtype === "resist") {
			finaltext += "<:resist:877132670784647238>";
		}

		// Display Crits
		if (dmg[3] == true) {
			finaltext += "<:crit:876905905248145448>";

			if (doOneMores(server) && !enmDefs.down) {
				enmDefs.down = true
				embedText.oneMore = true
			}
		}

		// Display the "damage" part of the text
		finaltext += " damage";

		if (enmDefs.hp <= 0) {
			finaltext += " and was defeated!";

			if (userDefs.killquote && userDefs.killquote.length > 0) {
				var possibleQuote = Math.round(Math.random() * (userDefs.killquote.length-1))
				finaltext += `\n*${userDefs.name}: "${userDefs.killquote[possibleQuote]}"*`
			}

			if (enmDefs.deathquote && enmDefs.deathquote.length > 0) {
				var possibleQuote = Math.round(Math.random() * (enmDefs.deathquote.length-1))
				finaltext += `\n*${enmDefs.name}: "${enmDefs.deathquote[possibleQuote]}"*`
			}
		}
	}
	
	embedText.targetText = `${userDefs.name} => ${enmDefs.name}`
	embedText.attackText = `${userDefs.name} used their melee attack: ${userDefs.melee[0]}!`
	embedText.resultText = finaltext
	return embedText
}

// Export Functions
module.exports = {
	generateDamage: function (atk, prc, luk, chr, movepow, moveacc, movecrit, movestatus, movestatuschance, movetype, enmdef, enmagl, enmluk, dmgtype) {
		return genDmg(atk, prc, luk, chr, movepow, moveacc, movecrit, movestatus, movestatuschance, movetype, enmdef, enmagl, enmluk, dmgtype)
	},
	
	meleeFoe: function(userDefs, oppDefs, server) {
		return meleeAttack(userDefs, oppDefs, server)
	},
	
	attackFoe: function(userName, oppName, userDefs, oppDefs, skillDefs, useEnergy, server) {
		return attackEnemy(userName, oppName, userDefs, oppDefs, skillDefs, useEnergy, server)
	}
}