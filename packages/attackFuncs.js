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
	sleep: "😴",
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

// Utils
function doLimitBreaks(server) {
	var servPath = dataPath+'/Server Settings/server.json';
    var servRead = fs.readFileSync(servPath);
    var servFile = JSON.parse(servRead);
	var servDefs = servFile[server];
	
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

// Cost
function useCost(userDefs, skillDefs) {
	if (skillDefs.cost && skillDefs.costtype) {
		if (skillDefs.costtype === "hp" && !userDefs.diety)
			userDefs.hp = Math.max(0, userDefs.hp - skillDefs.cost);
		else if (skillDefs.costtype === "hppercent" && !userDefs.miniboss && !userDefs.boss)
			userDefs.hp = Math.round(Math.max(0, userDefs.hp - ((userDefs.maxhp / 100) * skillDefs.cost)));
		else if (skillDefs.costtype === "mp")
			userDefs.mp = Math.max(0, userDefs.mp - skillDefs.cost);
		else if (skillDefs.costtype === "mppercent")
			userDefs.mp = Math.round(Math.max(0, userDefs.mp - ((userDefs.maxmp / 100) * skillDefs.cost)));
	}
	
	return true
}

// Miss Check
function missCheck(userPrc, oppAgl, moveAcc) {
	if (moveAcc >= 100) 
		return true;
	
	var targVal = (moveAcc + ((userPrc - oppAgl)*(3/4))) / 100
	var randomVal = Math.random()
	
	if (randomVal > targVal)
		return false;
	
	return true
}

// Determine the Damage that this move will deal. Also handles Status Effects, Affinities and Critical Hits
function genDmg(userDefs, targDefs, skillDefs) {
	console.log("genDmg:")

    var values = [0, "normal", false, false, false]; // Damage, Damagestate, Hit a Weakness?, Crit?, Inflict Status?

	// Weaknesses and shit
	var dmgtype = "normal"
	if (skillDefs.type && skillDefs.type != "almighty") {
		const affinities = ["weak", "resist", "block", "repel", "drain"]
		for (const i in affinities) {
			for (const k in targDefs[affinities[i]]) {
				if (targDefs[affinities[i]][k] == skillDefs.type)
					dmgtype = affinities[i];
			}
		}
	}

    if (dmgtype === "block")
        return [0, dmgtype, false, false, false];

    values[0] = 1

    // Accuracy Checks
	console.log("<<Accuracy Checks done in missCheck (line 149)>>")
    if (!missCheck(userDefs.prc, targDefs.agl, skillDefs.acc))
		return [0, "miss", false, false, false];

    // Damage Generation    
	var itemPath = dataPath+'/items.json'
    var itemRead = fs.readFileSync(itemPath);
    var itemFile = JSON.parse(itemRead);

	if (!userDefs.weapon)
		userDefs.weapon = "none";
	
	if (!targDefs.weapon)
		targDefs.weapon = "none";
	
	const userWeapon = itemFile[userDefs.weapon] ? itemFile[userDefs.weapon] : itemFile["none"]
	const oppWeapon = itemFile[targDefs.weapon] ? itemFile[targDefs.weapon] : itemFile["none"]

	var atkStat = userDefs.atk + (userWeapon.atk ? userWeapon.atk : 0) + ((userDefs.atk/10)*userDefs.buffs.atk)
	var endStat = targDefs.end + (oppWeapon.end ? oppWeapon.end : 0) + ((targDefs.atk/10)*targDefs.buffs.atk)

	var def = atkStat / endStat;
	if (skillDefs.atktype === "magic") {
		atkStat = userDefs.mag + (userWeapon.mag ? userWeapon.mag : 0) + ((userDefs.mag/10)*userDefs.buffs.mag)
		def = atkStat / endStat;
	}

	if (userDefs.leader && userDefs.leaderSkill) {
		if (userDefs.leaderSkill.type == "boost") {
			if (userDefs.leaderSkill.target === skillDefs.type ||
				userDefs.leaderSkill.target === "all" ||
				userDefs.leaderSkill.target === "magic" && skillDefs.atktype === "magic" ||
				userDefs.leaderSkill.target === "physical" && skillDefs.atktype === "physical") {
					skillDefs.pow += Math.round((skillDefs.pow/100)*userDefs.leaderSkill.percent);
			}
		}
	}

	if (skillDefs.limitbreak) {
		values[0] = Math.round((((skillDefs.pow+(atkStat*2)-targDefs.end)*2) + Math.round(Math.random() * 30))/2)
		
		if (targDefs.miniboss || targDefs.boss || targDefs.diety)
			values[0] = Math.round(values[0]*0.75);
		
		// Damage Types
		if (dmgtype === "weak") {
			values[2] = true;
			values[1] = "weak";
			values[0] = Math.round((values[0] * 3) / 2);
		} else if (dmgtype === "resist" || dmgtype === "repel" || dmgtype === "block") {
			values[1] = "resist";
			values[0] = Math.round(values[0] / 2);
		}
	} else {
		values[0] = Math.round(5 * Math.sqrt(def * skillDefs.pow));
		if (targDefs.shield) {
			values[0] *= 0.33;
			values[0] = Math.round(values[0]);
			console.log('Damage Checks: Shield')
		}

		if (dmgtype === "repel" || dmgtype === "drain")
			return [Math.round(values[0]), dmgtype, false, false, false];
		
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
		if (skillDefs.crit > 0) {
			var targ2 = (skillDefs.crit + (userDefs.luk - targDefs.luk));
			var crit = (Math.floor(Math.random() * 100));
			
			console.log(`Random Value ${crit} < Target Value ${Math.round(targ2*100)}?`)
			if (crit <= targ2 || skillDefs.crit >= 100 || targDefs.status === "sleep") {
				values[0] = Math.round((values[0] * 3) / 2);
				values[3] = true;
			}
		}
	}

    // Status
	console.log("<<Status Checks>>")
    if (skillDefs.status && skillDefs.statuschance > 0) {
		var targ3 = (skillDefs.statuschance + (userDefs.chr - targDefs.luk)) / 100;
		var st = Math.random();
		
		console.log(`Random Value ${Math.round(st*100)} < Target Value ${Math.round(targ3*100)}?`)
		if (st < targ3 || skillDefs.statuschance >= 100)
			values[4] = true;
    }

    return values
}

function genDmgFromVals(atk, prc, luk, chr, movepow, moveacc, movecrit, movestatus, movestatuschance, movetype, enmdef, enmagl, enmluk, dmgtype) {
	console.log("genDmgFromVals:")

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

// Inflict Status
function inflictStatus(oppDefs, skillDefs) {
	var finaltext;
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
	} else if (skillDefs.status === "sleep") {
		finaltext = "They fell asleep!"
		oppDefs.status = "paralyze"
		oppDefs.statusturns = 3
	} else if (skillDefs.status === "dizzy") {
		finaltext = "They were inflicted with dizziness!"
		oppDefs.status = "dizzy"
		oppDefs.statusturns = 3
	} else if (skillDefs.status === "brainwash") {
		finaltext = "They were brainwashed!"
		oppDefs.status = "brainwash"
		oppDefs.statusturns = 2
	} else if (skillDefs.status === "rage") {
		finaltext = "They were enraged!"
		oppDefs.status = "rage"
		oppDefs.statusturns = 3
	} else if (skillDefs.status === "fear") {
		finaltext = "They were inflicted with fear!"
		oppDefs.status = "fear"
		oppDefs.statusturns = 2
	} else if (skillDefs.status === "ego") {
		finaltext = "They were made egotistic!"
		oppDefs.status = "ego"
		oppDefs.statusturns = 3
	} else if (skillDefs.status === "paranoia") {
		finaltext = "They were made paranoid!"
		oppDefs.status = "paranoia"
		oppDefs.statusturns = 2
	} else if (skillDefs.status === "despair") {
		finaltext = "They were inflicted with despair!"
		oppDefs.status = "despair"
		oppDefs.statusturns = -1
	}
	
	return finaltext
}

function inflictStatusFromText(oppDefs, statusEffect) {
	var finaltext;
	if (statusEffect === "burn") {
		finaltext = "They were burned!"
		oppDefs.status = "burn"
		oppDefs.statusturns = 3
	} else if (statusEffect === "bleed") {
		finaltext = "They were inflicted with bleed!"
		oppDefs.status = "bleed"
		oppDefs.statusturns = 5
	} else if (statusEffect === "poison" || statusEffect === "toxic") {
		finaltext = "They were poisoned!"
		oppDefs.status = "poison"
		oppDefs.statusturns = 3
	} else if (statusEffect === "freeze") {
		finaltext = "They were frozen!"
		oppDefs.status = "freeze"
		oppDefs.statusturns = 1
	} else if (statusEffect === "paralyze") {
		finaltext = "They were paralyzed!"
		oppDefs.status = "paralyze"
		oppDefs.statusturns = 1
	} else if (statusEffect === "sleep") {
		finaltext = "They fell asleep!"
		oppDefs.status = "paralyze"
		oppDefs.statusturns = 3
	} else if (statusEffect === "dizzy") {
		finaltext = "They were inflicted with dizziness!"
		oppDefs.status = "dizzy"
		oppDefs.statusturns = 3
	} else if (statusEffect === "brainwash") {
		finaltext = "They were brainwashed!"
		oppDefs.status = "brainwash"
		oppDefs.statusturns = 2
	} else if (statusEffect === "rage") {
		finaltext = "They were enraged!"
		oppDefs.status = "rage"
		oppDefs.statusturns = 3
	} else if (statusEffect === "fear") {
		finaltext = "They were inflicted with fear!"
		oppDefs.status = "fear"
		oppDefs.statusturns = 2
	} else if (statusEffect === "ego") {
		finaltext = "They were made egotistic!"
		oppDefs.status = "ego"
		oppDefs.statusturns = 3
	} else if (statusEffect === "paranoia") {
		finaltext = "They were made paranoid!"
		oppDefs.status = "paranoia"
		oppDefs.statusturns = 2
	} else if (statusEffect === "despair") {
		finaltext = "They were inflicted with despair!"
		oppDefs.status = "despair"
		oppDefs.statusturns = 5
	}
	
	return finaltext
}

function weatherMod(dmg, weather) {
	if (weather === "rain") {
		if (skillDefs.type === "water")
			dmg[0] = Math.round(dmg[0]*1.2);
		else if (skillDefs.type === "fire")
			dmg[0] = Math.round(dmg[0]/1.1);
	} else if (weather === "thunder") {
		if (skillDefs.status === "paralyze" && skillDefs.statuschance) {
			if (Math.round() < 0.25)
				dmg[4] = true;
		}
	} else if (weather === "sunlight") {
		if (skillDefs.type === "fire")
			dmg[0] = Math.round(dmg[0]*1.1);
		else if (skillDefs.type === "water" || skillDefs.type === "grass")
			dmg[0] = Math.round(dmg[0]/1.1);
	} else if (weather === "windy") {
		if (skillDefs.type === "wind" && skillDefs.atktype === "magic")
			dmg[0] = Math.round(dmg[0]*1.2);
	}
	
	return dmg
}

function terrainMod(dmg, terrain) {				
	if (terrain === "flaming") {
		if (skillDefs.type === "fire")
			dmg[0] = Math.round(dmg[0]*1.2);
	} else if (terrain === "thunder") {
		if (skillDefs.type === "electric")
			dmg[0] = Math.round(dmg[0]*1.2);
	}
	
	return dmg
}

function fieldMod(dmg, weather, terrain) {
	weatherMod(dmg, weather)
	terrainMod(dmg, terrain)
	
	return dmg
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
		var healedQuote = ""
		if (oppDefs.healedquote && oppDefs.healedquote.length > 0) {
			var possibleQuote = Math.round(Math.random() * (oppDefs.healedquote.length-1))
			healedQuote = `*${oppName}: "${oppDefs.healedquote[possibleQuote]}"*\n`
		}

		if (skillDefs.fullheal) {
			oppDefs.hp = oppDefs.maxhp

			embedText.targetText = `${userName} => It's Allies`
			embedText.attackText = `${userName} used ${skillDefs.name}!`
			embedText.resultText = `${oppName} was fully healed!\n${healedQuote}`
		} else if (skillDefs.statusheal) {
			oppDefs.status = "none";
			oppDefs.statusturns = 0;

			embedText.targetText = `${userName} => ${oppName}`
			embedText.attackText = `${userName} used ${skillDefs.name}!`
			embedText.resultText = `${oppName} was cured of status effects!\n${healedQuote}`
		} else if (skillDefs.healmp) {
			oppDefs.mp = Math.min(oppDefs.maxmp, oppDefs.mp + skillDefs.pow)

			embedText.targetText = `${userName} => ${oppName}`
			embedText.attackText = `${userName} used ${skillDefs.name}!`
			embedText.resultText = `${(oppDefs.id == userDefs.id) ? "They" : oppName} had their MP restored by ${skillDefs.pow}!\n${healedQuote}`
		} else if (skillDefs.hptomp) {
			if (userDefs.mp <= 0) {
				embedText.targetText = `${userName} => ${oppName}`
				embedText.attackText = `${userName} used ${skillDefs.name}!`
				embedText.resultText = `But it failed!`
			} else {
				oppDefs.hp = Math.min(oppDefs.maxhp, oppDefs.hp + oppDefs.mp)
				oppDefs.mp = 0

				embedText.targetText = `${userName} => ${oppName}`
				embedText.attackText = `${userName} used ${skillDefs.name}!`
				embedText.resultText = `${userName} converted their MP into HP for ${(oppDefs.id == userDefs.id) ? "Themselves" : oppName}!`
			}
		} else {
			oppDefs.hp = Math.min(oppDefs.maxhp, oppDefs.hp + skillDefs.pow)

			embedText.targetText = `${userName} => ${oppName}`
			embedText.attackText = `${userName} used ${skillDefs.name}!`
			embedText.resultText = `${(oppDefs.id == userDefs.id) ? "They" : oppName} had their HP restored by ${skillDefs.pow}!`
		}
	} else if (skillDefs.type === "status") {
		if (skillDefs.status && skillDefs.statuschance) {
			if (skillDefs.statuschance > 0) {
				var targ = (skillDefs.statuschance + (userDefs.chr - oppDefs.luk)) / 100;
				var chance = Math.random();

				if (oppDefs.status === "none") {
					var finaltext = ""
					if (chance > targ || skillDefs.statuschance >= 100) {
						finaltext += inflictStatus(oppDefs, skillDefs)
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
				} else {
					embedText.targetText = `${userName} => ${oppName}`, 
					embedText.attackText = `${userName} used ${skillDefs.name} on ${oppName}!`
					embedText.resultText = 'But it had no effect!'
				}
			}
		} else if (skillDefs.futuresight) {
			oppDefs.futureSightSkill = skillDefs.futuresight
			oppDefs.futureSightSkill.user = userDefs

			embedText.targetText = `${userName} => ${oppDefs.name}`
			embedText.attackText = `${userName} used ${skillDefs.name} on ${oppName}!`
			embedText.resultText = `${oppDefs.name} is going to be affected by ${userName}'s future attack.`
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
		
		if (skillDefs.limitbreak)
			movepow *= 3;

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
		
			if (skillDefs2 && skillDefs2.type && skillDefs2.type === "passive") {
				if (skillDefs2.passive === "boost" && skillDefs2.boosttype == skillDefs.type) {
					movepow += (movepow/100)*skillDefs2.pow
				}
			}
		}
		
		// Resisting Passives
		var repelSkill = null
		var counterSkill = null
		var resistSkill = null
		var trapped = false
		if (!skillDefs.limitbreak) {
			for (const i in oppDefs.skills) {
				const skillDefs2 = skillFile[oppDefs.skills[i]]
			
				if (skillDefs2 && skillDefs2.type && skillDefs2.type == 'passive') {
					if (skillDefs2.passive === "wonderguard" && dmgtype != "weak") {
						embedText.targetText = `${userName} => ${oppName}`
						embedText.attackText = `${userName} used ${skillDefs.name}!`
						embedText.resultText = `${oppName}'s ${skillDefs2.name} made them immune to the attack!`

						if (charDefs.blockquote && charDefs.blockquote.length > 0) {
							var possibleQuote = Math.round(Math.random() * (charDefs.blockquote.length-1))
							finaltext += `\n*${charName}: "${charDefs.blockquote[possibleQuote]}"*`
						}
						
						if (useEnergy)
							useCost(userDefs, skillDefs);

						return embedText
					} else if (skillDefs2.passive === "weaken" && skillDefs2.weaktype == skillDefs.type) {
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
							
							if (useEnergy)
								useCost(userDefs, skillDefs);

							return embedText
						}
					}

					if ((skillDefs2.passive === "counterphys" && skillDefs.atktype === "physical") ||
							   (skillDefs2.passive === "countermag" && skillDefs.atktype === "magic")) {
						var dodgeChance = skillDefs2.counter.chance/100
						var dodgeValue = Math.random()

						console.log(`CounterSkill: ${dodgeValue} <= ${dodgeChance}?`)
						if (dodgeValue <= dodgeChance) {
							counterSkill = skillDefs2.counter.skill
						}
					}
					
					if (!counterSkill && skillDefs2.passive === "swordbreaker" && skillDefs.atktype === "physical" && (dmgtype === "normal" || dmgtype === "weak")) {
						var resistChance = skillDefs2.pow/100
						var resistValue = Math.random()

						console.log(`Swordbreaker: ${resistValue} <= ${resistChance}?`)
						if (resistValue <= resistChance) {
							resistSkill = skillDefs2.name
						}
					}
				}
			}
		}
		
		if (counterSkill) {
			var dmgtype2 = "normal"
			if (counterSkill.type && counterSkill.type != "almighty") {
				for (i = 0; i < userDefs.weak.length; i++) {
					if (userDefs.weak[i] == counterSkill.type) {
						dmgtype2 = "weak"
					}
				}
				for (i = 0; i < userDefs.resist.length; i++) {
					if (userDefs.resist[i] == counterSkill.type) {
						dmgtype2 = "resist"
					}
				}
				for (i = 0; i < userDefs.block.length; i++) {
					if (userDefs.block[i] == counterSkill.type) {
						dmgtype2 = "block"
					}
				}
				for (i = 0; i < userDefs.repel.length; i++) {
					if (userDefs.repel[i] == counterSkill.type) {
						dmgtype2 = "repel"
					}
				}
				for (i = 0; i < userDefs.drain.length; i++) {
					if (userDefs.drain[i] == counterSkill.type) {
						dmgtype2 = "drain"
					}
				}
			}

			if (counterSkill.atktype == "physical" && userDefs.trapType && !counterSkill.feint) {
				dmgtype2 = "resist"
				trapped = true
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

			var dmg = genDmgFromVals(atk, prc, luk, chr, movepow, moveacc, movecrit, movestatus, movestatuschance, movetype, enmdef, enmagl, enmluk, dmgtype2);
			
			var finaltext = `${oppName}'s ${counterSkill.name} allowed them to evade & counter! `
			var rand = Math.round(Math.random() * 10);
			dmg[0] = +dmg[0] + +rand;

			// Prompts
			var result = Math.round(dmg[0]);
			if (result < 1) { result = 1 }

			if (dmg[1] == "miss") {
				finaltext += `${userName} dodged it!`;
				trapped = false;

				if (oppDefs.missquote && oppDefs.missquote.length > 0) {
					var possibleQuote = Math.round(Math.random() * (oppDefs.missquote.length-1))
					finaltext += `\n*${oppName}: "${oppDefs.missquote[possibleQuote]}"*`
				}
				if (userDefs.dodgequote && userDefs.dodgequote.length > 0) {
					var possibleQuote = Math.round(Math.random() * (userDefs.dodgequote.length-1))
					finaltext += `\n*${userName}: "${userDefs.dodgequote[possibleQuote]}"*`
				}
			} else if (!counterSkill.feint && (dmg[1] == "block" || dmg[1] == "repel" || repelSkill || (userDefs.makarakarn && counterSkill.atktype === "magic" || userDefs.tetrakarn && counterSkill.atktype === "physical"))) {
				finaltext += `${userName} blocked it!`
				dmg[1] = "block"
					
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
					finaltext = finaltext + "<:resist:877132670784647238>";
				}

				// Display Crits
				if (dmg[3] == true)
					finaltext = finaltext + "<:crit:876905905248145448>";

				// Display the "damage" part of the text
				finaltext = finaltext + " damage";

				if (userDefs.hp <= 0) {
					finaltext += " and was defeated!";
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
					finaltext += "!";
					if (dmg[4] == true && userDefs.status == "none" && counterSkill.status) {
						if (typeof counterSkill.status == "object") {
							var possibleStatus = []
							for (const i in counterSkill.status)
								possibleStatus.push(counterSkill.status[i]);
							
							if (possibleStatus.length > 0) 
								finaltext += " " + inflictStatusFromText(userDefs, possibleStatus[Math.round(Math.random() * (possibleStatus.length-1))]);
						} else {
							finaltext += " " + inflictStatus(userDefs, counterSkill)
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
					if (skillDefs2 && skillDefs2.type && skillDefs2.type === "passive") {
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
			   
			var btlPath = dataPath+'/battle.json'
			var btlRead = fs.readFileSync(btlPath);
			var btl = JSON.parse(btlRead);
			
			const weather = btl[server].changeweather ? btl[server].changeweather.weather : btl[server].weather
			const terrain = btl[server].changeterrain ? btl[server].changeterrain.terrain : btl[server].terrain
			
			// Resist Overwrites
			if (resistSkill && !skillDefs.feint)
				dmgtype = "resist";

			if (skillDefs.atktype == "physical" && oppDefs.trapType && !skillDefs.feint) {
				dmgtype = "resist";
				trapped = true;
			}

			if (!skillDefs.hits || skillDefs.hits == 1) {
				var dmg = genDmg(userDefs, oppDefs, skillDefs)
				var finaltext = ``
				
				var rand = Math.round(Math.random() * 10);
				dmg[0] += rand;
				
				fieldMod(dmg, weather, terrain)

				// Prompts
				var result = Math.round(dmg[0]);
				if (result < 1) { result = 1 }

				if (oppDefs.guard && !skillDefs.limitbreak)
					result = Math.round(dmg[0]/2);

				if (dmg[1] == "miss") {
					finaltext += `${oppName} dodged it!`
					trapped = false;

					if (userDefs.missquote && userDefs.missquote.length > 0) {
						var possibleQuote = Math.round(Math.random() * (userDefs.missquote.length-1))
						userQuote = `\n*${userDefs.name}: "${userDefs.missquote[possibleQuote]}"*`
					}
					if (oppDefs.dodgequote && oppDefs.dodgequote.length > 0) {
						var possibleQuote = Math.round(Math.random() * (oppDefs.dodgequote.length-1))
						oppQuote = `\n*${oppDefs.name}: "${oppDefs.dodgequote[possibleQuote]}"*`
					}
				} else if (dmg[1] == "repel") {
					finaltext += `${oppName} repelled it!`
					
					fieldMod(repelDmg, weather, terrain)

					skillDefs.acc = 999
					var repelDmg = genDmg(userDefs, userDefs, skillDefs)
					
					var rand = Math.round(Math.random() * 10);
					repelDmg[0] += rand;
					
					result = repelDmg[0];

					if (repelDmg[1] === "block" || repelDmg[1] === "repel") {
						finaltext += `${userName} blocked it, dealing no damage.`;
						dmg[1] = "block"
					} else if (repelDmg[1] === "drain") {
						finaltext += `${userName} HP was restored by ${result}.`;
						userDefs.hp = Math.min(userDefs.maxhp, userDefs.hp + result)
						dmg = repelDmg
					} else {
						finaltext += `${userName} took ${result} damage.`;
						userDefs.hp = Math.max(0, userDefs.hp - result)
						dmg = repelDmg
						
						if (oppDefs.repelquote && oppDefs.repelquote.length > 0) {
							var possibleQuote = Math.round(Math.random() * (oppDefs.repelquote.length-1))
							oppQuote = `\n*${oppDefs.name}: "${oppDefs.repelquote[possibleQuote]}"*`
						}
					}

					skillDefs.acc = 0
					dmg = repelDmg
				} else if (repelSkill) {
					finaltext += `${oppName}'s ${repelSkill.name} repels the attack!`;

					skillDefs.acc = 999
					var repelDmg = genDmg(userDefs, userDefs, skillDefs)
					
					var rand = Math.round(Math.random() * 10);
					repelDmg[0] += rand;
					
					fieldMod(repelDmg, weather, terrain)
					
					result = repelDmg[0];

					if (repelDmg[1] === "block" || repelDmg[1] === "repel") {
						finaltext += `${userName} blocked it, dealing no damage.`;
						dmg[1] = "block"
					} else if (repelDmg[1] === "drain") {
						finaltext += `${userName} HP was restored by ${result}.`;
						userDefs.hp = Math.min(userDefs.maxhp, userDefs.hp + result)
						dmg = repelDmg
					} else {
						finaltext += `${userName} took ${result} damage.`;
						userDefs.hp = Math.max(0, userDefs.hp - result)
						dmg = repelDmg
						
						if (oppDefs.repelquote && oppDefs.repelquote.length > 0) {
							var possibleQuote = Math.round(Math.random() * (oppDefs.repelquote.length-1))
							oppQuote = `\n*${oppDefs.name}: "${oppDefs.repelquote[possibleQuote]}"*`
						}
					}

					skillDefs.acc = 0
					dmg = repelDmg
				} else if (!skillDefs.feint && (oppDefs.makarakarn && skillDefs.atktype === "magic" || oppDefs.tetrakarn && skillDefs.atktype === "physical")) {
					if (oppDefs.makarakarn && skillDefs.atktype === "magic") {
						finaltext += `${oppName}'s ${oppDefs.makarakarn} repels the magical attack, but gets destroyed!`;
						delete oppDefs.makarakarn
					} else if (oppDefs.tetrakarn && skillDefs.atktype === "physical") {
						finaltext += `${oppName}'s ${oppDefs.tetrakarn} repels the physical attack, but gets destroyed!`;
						delete oppDefs.tetrakarn
					}

					skillDefs.acc = 999

					var repelDmg = genDmg(userDefs, userDefs, skillDefs)
					var rand = Math.round(Math.random() * 10);
					repelDmg[0] += rand;
					
					fieldMod(repelDmg, weather, terrain)
					
					result = repelDmg[0];

					if (repelDmg[1] === "block" || repelDmg[1] === "repel") {
						finaltext += `${userName} blocked it, dealing no damage.`;
						dmg[1] = "block"
					} else if (repelDmg[1] === "drain") {
						finaltext += `${userName} HP was restored by ${result}.`;
						userDefs.hp = Math.min(userDefs.maxhp, userDefs.hp + result)
						dmg = repelDmg
					} else {
						finaltext += `${userName} took ${result} damage.`;
						userDefs.hp = Math.max(0, userDefs.hp - result)
						dmg = repelDmg
						
						if (oppDefs.repelquote && oppDefs.repelquote.length > 0) {
							var possibleQuote = Math.round(Math.random() * (oppDefs.repelquote.length-1))
							oppQuote = `\n*${oppDefs.name}: "${oppDefs.repelquote[possibleQuote]}"*`
						}
					}

					skillDefs.acc = 0
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
					
					if (dmg[2] == true) {
						if (userDefs.strongquote && userDefs.strongquote.length > 0) {
							var possibleQuote = Math.round(Math.random() * (userDefs.strongquote.length-1))
							userQuote = `\n*${userDefs.name}: "${userDefs.strongquote[possibleQuote]}"*`
						}

						if (oppDefs.weakquote && oppDefs.weakquote.length > 0) {
							var possibleQuote = Math.round(Math.random() * (oppDefs.weakquote.length-1))
							oppQuote = `\n*${oppDefs.name}: "${oppDefs.weakquote[possibleQuote]}"*`
						}
					} else if (dmgtype === "resist") {
						if (oppDefs.resistquote && oppDefs.resistquote.length > 0) {
							var possibleQuote = Math.round(Math.random() * (oppDefs.resistquote.length-1))
							oppQuote = `\n*${oppDefs.name}: "${oppDefs.resistquote[possibleQuote]}"*`
						}
					} else {
						if (oppDefs.hurtquote && oppDefs.hurtquote.length > 0) {
							var possibleQuote = Math.round(Math.random() * (oppDefs.hurtquote.length-1))
							oppQuote = `\n*${oppDefs.name}: "${oppDefs.hurtquote[possibleQuote]}"*`
						}
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

					// Critical Quotes
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
						if (dmg[4] == true && oppDefs.status == "none" && skillDefs.status) {
							if (typeof skillDefs.status == "object") {
								var possibleStatus = []
								for (const i in skillDefs.status)
									possibleStatus.push(skillDefs.status[i]);
								
								if (possibleStatus.length > 0) 
									finaltext += " " + inflictStatusFromText(oppDefs, possibleStatus[Math.round(Math.random() * (possibleStatus.length-1))]);
							} else {
								finaltext += " " + inflictStatus(oppDefs, skillDefs)
							}
						}
					}

					// Drain Moves
					if (skillDefs.drain && userDefs.id != oppDefs.id) {
						const draindmg = Math.round(dmg[0] / skillDefs.drain)
						userDefs.hp = Math.min(userDefs.maxhp, userDefs.hp + draindmg)
						finaltext = finaltext + ` ${userName} drained ${draindmg} damage.`
					}

					// Passives
					const skillPath = dataPath+'/skills.json'
					const skillRead = fs.readFileSync(skillPath);
					const skillFile = JSON.parse(skillRead);
					for (const skillNum in oppDefs.skills) {
						console.log(oppDefs.skills[skillNum])
						const skillDefs2 = skillFile[oppDefs.skills[skillNum]]

						if (skillDefs2 && skillDefs2.type && skillDefs2.type === "passive") {
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

					if ((oppDefs.shield == "guard" || oppDefs.shield == "shield") && !skillDefs.feint) {
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
				
				var dmgCheck = genDmgFromVals(atk, prc, luk, chr, movepow, moveacc, movecrit, movestatus, movestatuschance, movetype, enmdef, enmagl, enmluk, dmgtype);
				if (dmgCheck[1] == "miss") {
					finaltext = `${oppName} dodged it!`;
					trapped = false;

					if (userDefs.missquote && userDefs.missquote.length > 0) {
						var possibleQuote = Math.round(Math.random() * (userDefs.missquote.length-1))
						userQuote = `\n*${userDefs.name}: "${userDefs.missquote[possibleQuote]}"*`
					}
					if (oppDefs.dodgequote && oppDefs.dodgequote.length > 0) {
						var possibleQuote = Math.round(Math.random() * (oppDefs.dodgequote.length-1))
						oppQuote = `\n*${oppDefs.name}: "${oppDefs.dodgequote[possibleQuote]}"*`
					}
				} else if (dmgCheck[1] == "repel") {
					finaltext = `${oppName} repelled it! `;

					var repelDmg = genDmg(userDefs, userDefs, skillDefs)
					if (repelDmg[1] === "block" || repelDmg[1] === "repel") {
						finaltext += `${userName} blocked it!`;
						dmgCheck[1] = "block"
					} else if (repelDmg[1] === "drain") {
						finaltext += `${userName} drained `;
					} else {
						finaltext += `${userName} took `;
					}
					
					if (oppDefs.repelquote && oppDefs.repelquote.length > 0) {
						var possibleQuote = Math.round(Math.random() * (oppDefs.repelquote.length-1))
						oppQuote = `\n*${oppDefs.name}: "${oppDefs.repelquote[possibleQuote]}"*`
					}
				} else if (repelSkill) {
					finaltext = `${oppName}'s ${repelSkill.name} repels the attack! `;

					var repelDmg = genDmg(userDefs, userDefs, skillDefs)
					if (repelDmg[1] === "block" || repelDmg[1] === "repel") {
						finaltext += `${userName} blocked it!`;
						dmgCheck[1] = "block"
					} else if (repelDmg[1] === "drain") {
						finaltext += `${userName} drained `;
						userDefs.hp = Math.min(userDefs.maxhp, userDefs.hp + result)
					} else {
						finaltext += `${userName} took `;
						userDefs.hp = Math.max(0, userDefs.hp - result)
					}
					
					if (oppDefs.repelquote && oppDefs.repelquote.length > 0) {
						var possibleQuote = Math.round(Math.random() * (oppDefs.repelquote.length-1))
						oppQuote = `\n*${oppDefs.name}: "${oppDefs.repelquote[possibleQuote]}"*`
					}
				} else if (!skillDefs.feint && (oppDefs.makarakarn && skillDefs.atktype === "magic" || oppDefs.tetrakarn && skillDefs.atktype === "physical")) {
					if (oppDefs.makarakarn && skillDefs.atktype === "magic") {
						finaltext += `${oppName}'s ${oppDefs.makarakarn} repels the magical attack, but gets destroyed!`;
						delete oppDefs.makarakarn
					} else if (oppDefs.tetrakarn && skillDefs.atktype === "physical") {
						finaltext += `${oppName}'s ${oppDefs.tetrakarn} repels the physical attack, but gets destroyed!`;
						delete oppDefs.tetrakarn
					}

					var repelDmg = genDmg(userDefs, userDefs, skillDefs)
					if (repelDmg[1] === "block" || repelDmg[1] === "repel") {
						finaltext += `${userName} blocked it!`;
						dmgCheck[1] = "block"
					} else if (repelDmg[1] === "drain") {
						finaltext += `${userName} drained `;
						userDefs.hp = Math.min(userDefs.maxhp, userDefs.hp + result)
					} else {
						finaltext += `${userName} took `;
						userDefs.hp = Math.max(0, userDefs.hp - result)
					}
					
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
						skillDefs.acc = 999
						var dmg = genDmg(userDefs, oppDefs, skillDefs)
						var rand = Math.floor(Math.random() * 10);
						dmg[0] += +rand;
						
						fieldMod(dmg, weather, terrain)

						// Prompts
						var result = Math.round(dmg[0]);
						if (result < 1) { result = 1 }

						if (oppDefs.guard && !skillDefs.limitbreak) {
							result = Math.round(dmg[0]/2)
						}

						if (dmgCheck[1] == "repel" || repelSkill || (oppDefs.makarakarn && skillDefs.atktype === "magic" || oppDefs.tetrakarn && skillDefs.atktype === "physical") && !skillDefs.feint) {
							var repelDmg = genDmg(userDefs, userDefs, skillDefs)
							var rand = Math.round(Math.random() * 10);
							repelDmg[0] += rand;
							fieldMod(repelDmg, weather, terrain)
							
							result = repelDmg[0];

							if (repelDmg[1] === "block" || repelDmg[1] === "repel") {
								// Do nothing
							} else if (repelDmg[1] === "drain") {
								userDefs.hp = Math.min(userDefs.maxhp, userDefs.hp + result)
							} else {
								userDefs.hp = Math.max(0, userDefs.hp - result)
							}
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
						
						skillDefs.acc = 0
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
								
								oppQuote = `\n*${oppDefs.name}: "${oppDefs.weakquote[possibleQuote]}"*`
							}
						} else if (dmgCheck[1] === "resist") {
							if (oppDefs.resistquote && oppDefs.resistquote.length > 0) {
								var possibleQuote = Math.round(Math.random() * (oppDefs.resistquote.length-1))
								oppQuote = `\n*${oppDefs.name}: "${oppDefs.resistquote[possibleQuote]}"*`
							}
						} else {
							if (oppDefs.hurtquote && oppDefs.hurtquote.length > 0) {
								var possibleQuote = Math.round(Math.random() * (oppDefs.hurtquote.length-1))
								oppQuote = `\n*${oppDefs.name}: "${oppDefs.hurtquote[possibleQuote]}"*`
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
							if (dmgCheck[4] == true && oppDefs.status != "none" && skillDefs.status) {
								if (typeof skillDefs.status == "object") {
									var possibleStatus = []
									for (const i in skillDefs.status)
										possibleStatus.push(skillDefs.status[i]);
									
									if (possibleStatus.length > 0) 
										finaltext += " " + inflictStatusFromText(oppDefs, possibleStatus[Math.round(Math.random() * (possibleStatus.length-1))]);
								} else {
									finaltext += " " + inflictStatus(oppDefs, skillDefs)
								}
							}
						}

						// Drain Moves
						if (skillDefs.drain && userDefs.id != oppDefs.id) {
							const draindmg = Math.round(total / skillDefs.drain)
							userDefs.hp = Math.min(userDefs.maxhp, userDefs.hp + draindmg)
							finaltext += ` ${userName} drained ${draindmg} damage.`
						}

						// Passives
						const skillPath = dataPath+'/skills.json'
						const skillRead = fs.readFileSync(skillPath);
						const skillFile = JSON.parse(skillRead);
						for (const skillNum in oppDefs.skills) {
							const skillDefs2 = skillFile[oppDefs.skills[skillNum]]
							if (skillDefs2 && skillDefs2.type && skillDefs2.type === "passive") {
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

						if ((oppDefs.shield == "guard" || oppDefs.shield == "shield") && !skillDefs.feint) {
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
			
			if (resistSkill)
				finaltext += `\n${oppName}'s ${resistSkill} halved the power of the skill.`;
			
			if (trapped && !skillDefs.feint) {
				finaltext += `\n${oppName}'s ${oppDefs.trapType.name} halved the power of the skill! `
				
				if (oppDefs.trapType.effect[0] == "damage") {
					userDefs.hp -= parseInt(oppDefs.trapType.effect[1])
					finaltext += `${userName} took ${oppDefs.trapType.effect[1]} damage`;
					if (userDefs.hp <= 0) {
						userDefs.hp = 0;
						finaltext += ' and was defeated!'
					} else
						finaltext += '!';
				} else if (oppDefs.trapType.effect[0] == "status")
					finaltext += ' ' + inflictStatusFromText(userDefs, oppDefs.trapType.effect[1]);
				else if (oppDefs.trapType.effect[0] == "debuff") {
					finaltext += `${userName}'s ${oppDefs.trapType.effect[1].toUpperCase()} was debuffed!`;
					userDefs.buffs.agl = Math.max(-3, oppDefs.buffs[oppDefs.trapType.effect[1]]-1)
				}
				
				delete oppDefs.trap
				delete oppDefs.trapType
			}

			if (userQuote) {finaltext += userQuote}
			if (oppQuote) {finaltext += oppQuote}
		}

		if (skillDefs.buff) {
			if (skillDefs.buffchance) {
				if (Math.random() < skillDefs.buffchance/100) {
					userDefs.buffs[skillDefs.buff] = Math.min(3, userDefs.buffs[skillDefs.buff]+1)
					finaltext += `\n${userName}'s ${skillDefs.buff.toUpperCase()} was buffed!`
				}
			} else {
				userDefs.buffs[skillDefs.buff] = Math.min(3, userDefs.buffs[skillDefs.buff]+1)
				finaltext += `\n${userName}'s ${skillDefs.buff.toUpperCase()} was buffed!`
			}
		}

		if (skillDefs.debuff) {
			if (skillDefs.buffchance) {
				var debuffChance = (skillDefs.buffchance + (userDefs.luk - oppDefs.luk)) / 100;
				var chance = Math.random();
				
				if (chance < debuffChance) {
					oppDefs.buffs[skillDefs.debuff] = Math.max(-3, oppDefs.buffs[skillDefs.debuff]-1)
					finaltext += `\n${userName} debuffed ${oppName}'s ${skillDefs.debuff.toUpperCase()}!`
				}
			} else {
				oppDefs.buffs[skillDefs.debuff] = Math.max(-3, oppDefs.buffs[skillDefs.debuff]-1)
				finaltext += `\n${userName} debuffed ${oppName}'s ${skillDefs.debuff.toUpperCase()}!`
			}
		}

		if (skillDefs.debuffuser) {
			userDefs.buffs[skillDefs.debuffuser] = Math.max(-3, userDefs.buffs[skillDefs.debuffuuser]-1)
			finaltext += `\n${userName}'s ${skillDefs.debuffuser.toUpperCase()} was debuffed!`
		}

		if (skillDefs.rest) {
			userDefs.rest = true
			finaltext += `\n*${userName} needs to recharge.*`
		}

		embedText.targetText = `${userName} => ${oppName}`
		embedText.attackText = `${userName} used ${skillDefs.name} on ${oppName}!`
		embedText.resultText = `${finaltext}`
	}

	if (useEnergy)
		useCost(userDefs, skillDefs);
	
	return embedText
}

function meleeAttack(userDefs, enmDefs, server, rage) {
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
	
	if (rage)
		atk *= 2;

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
	
	const skillPath = dataPath+'/skills.json'
	const skillRead = fs.readFileSync(skillPath);
	const skillFile = JSON.parse(skillRead);
	
	// Boosting Passives
	for (const i in userDefs.skills) {
		const skillDefs2 = skillFile[userDefs.skills[i]]
	
		if (skillDefs2 && skillDefs2.type && skillDefs2.type === "passive") {
			if (skillDefs2.passive === "boost" && skillDefs2.boosttype == userDefs.melee[1]) {
				movepow += (movepow/100)*skillDefs2.pow
			}
		}
	}
	
	// Resisting Passives
	var repelSkill = null
	var counterSkill = null
	var resistSkill = null
	var trapped = false
	for (const i in enmDefs.skills) {
		const skillDefs = skillFile[enmDefs.skills[i]]
	
		if (skillDefs && skillDefs.type && skillDefs.type == 'passive') {
			if (skillDefs.passive === "wonderguard" && dmgtype != "weak") {
				embedText.targetText = `${userName} => ${enmDefs.name}`
				embedText.attackText = `${userName} used ${userDefs.melee[0]}!`
				embedText.resultText = `${enmDefs.name}'s ${skillDefs.name} made them immune to the attack!`
				
				if (useEnergy)
					useCost(userDefs, skillDefs);

				return embedText
			}
		}
	}

	// Damage.
	var dmg = genDmgFromVals(atk, prc, luk, chr, 30, 95, 10, "none", 0, movetype, enmdef, enmagl, enmluk, dmgtype)
	var finaltext = ``
	var rand = Math.floor(Math.random() * 10);
	dmg[0] = +dmg[0] + +rand;

	// Prompts
	var result = Math.round(dmg[0]);
	if (dmg[1] == "miss") {
		finaltext += `${enmName} dodged it!`;
		trapped = false;

		if (userDefs.missquote && userDefs.missquote.length > 0) {
			var possibleQuote = Math.round(Math.random() * (userDefs.missquote.length-1))
			finaltext += `\n*${userDefs.name}: "${userDefs.missquote[possibleQuote]}"*`
		}
		if (enmDefs.dodgequote && enmDefs.dodgequote.length > 0) {
			var possibleQuote = Math.round(Math.random() * (enmDefs.dodgequote.length-1))
			finaltext += `\n*${enmDefs.name}: "${enmDefs.dodgequote[possibleQuote]}"*`
		}
	} else if (dmg[1] == "repel") {
		finaltext += `${enmName} repelled it! ${userName} took ` + result;
		userDefs.hp = Math.max(0, userDefs.hp - result)
		userDefs.guard = false
					
		if (enmDefs.repelquote && enmDefs.repelquote.length > 0) {
			var possibleQuote = Math.round(Math.random() * (enmDefs.repelquote.length-1))
			finaltext += `\n*${enmDefs.name}: "${enmDefs.repelquote[possibleQuote]}"*`
		}
	} else if (enmDefs.tetrakarn) {
		finaltext += `${enmDefs.name}'s Tetrakarn Shield repels the attack, but gets destroyed! ${userDefs.name} took ${result}`;
		userDefs.hp = Math.max(0, userDefs.hp - result)
		delete enmDefs.tetrakarn
		
		if (enmDefs.repelquote && enmDefs.repelquote.length > 0) {
			var possibleQuote = Math.round(Math.random() * (enmDefs.repelquote.length-1))
			finaltext += `\n*${enmDefs.name}: "${enmDefs.repelquote[possibleQuote]}"*`
		}
	} else if (dmg[1] == "drain") {
		finaltext += `It was drained! ${enmDefs.name} drained ${result} HP.`;
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

function allyHelp(charDefs, allySide, enmDefs, server) {							
	for (const i in allySide) {
		if (allySide[i].enemy)
			continue;

		if (charDefs.id != allySide[i].id && charDefs.trust[allySide[i].truename] && charDefs.trust[allySide[i].truename].level >= 5) {
			var helpVal = Math.random()

			var targVal = 0.1;
			if (charDefs.trust[allySide[i].truename].level >= 15)
				targVal =  0.2;
			if (charDefs.trust[allySide[i].truename].level >= 25)
				targVal =  0.3;
			if (charDefs.trust[allySide[i].truename].level >= 40)
				targVal =  0.3;

			console.log(`AllyAttack: ${helpVal} < ${targVal}?`)

			if (helpVal <= targVal) {
				var resultText = `\n\n${allySide[i].name} helps with the attack!\n`
				var allyAttack = {
					name: allySide[i].melee[0],
					pow: 140,
					acc: 100,
					crit: 10,
					type: allySide[i].melee[1],
					atktype: 'physical',
					target: 'one'
				}
				
				if (allySide[i].meleequote && allySide[i].meleequote.length > 0) {
					var possibleQuote = Math.round(Math.random() * (allySide[i].meleequote.length-1))
					resultText += `*${allySide[i].name}: "${allySide[i].meleequote[possibleQuote]}"*\n`
				}
				
				resultText += attackEnemy(allySide[i].name, enmDefs.name, allySide[i], enmDefs, allyAttack, false, server).resultText
				return resultText
			}
		}
	}
	
	return ''
}

// Attack with skill
function attackWithSkill(userDefs, targetNum, allySide, opposingSide, btl, skillDefs, server) {
	var embedText = {}

	var preText = "";
	if (userDefs.magquote && userDefs.magquote.length > 0 && skillDefs.atktype === "magic") {
		var possibleQuote = Math.round(Math.random() * (userDefs.magquote.length-1))
		preText = `*${userDefs.name}: "${userDefs.magquote[possibleQuote]}"*\n`
	}
	if (userDefs.physquote && userDefs.physquote.length > 0 && skillDefs.atktype === "physical") {
		var possibleQuote = Math.round(Math.random() * (userDefs.physquote.length-1))
		preText = `*${userDefs.name}: "${userDefs.physquote[possibleQuote]}"*\n`
	}

	if (!skillDefs.name) {skillDefs.name = "a skill with no name"}

	if (!skillDefs.target || skillDefs.target === "one") {
		if (opposingSide[targetNum]) {
			var enmDefs = opposingSide[targetNum]
			const enmName = enmDefs.name
			
			if (enmDefs.hp <= 0) {
				return new Discord.MessageEmbed()
					.setColor('#e36b2b')
					.setTitle(`${userDefs.name} => ???`)
					.setDescription(`${userDefs.name} used ${skillDefs.name}... but there was no target.`)
					.setFooter(`${userDefs.name}'s turn`);
			}

			embedText = attackEnemy(userDefs.name, enmName, userDefs, enmDefs, skillDefs, false, server)
			if (embedText.oneMore == true && turnFuncs.oneMores(server)) {
				btl[server].onemore = true
			}
			
			// Trust Level 5+ will have a 10% chance - increasing with trust level - for an ally to help with physical attacks.
			if (!btl[server].pvp)
				embedText.resultText += allyHelp(userDefs, allySide, enmDefs, server)

			if (skillDefs.resistremove) {
				embedText.resultText += `\n${userDefs.name} lost all resisting affinities toward ${skillDefs.resistremove} type skills.`
				
				const affinities = ["resist", "block", "repel", "drain"]
				for (const i in affinities) {
					for (const k in userDefs[affinities[i]]) {
						if (userDefs[affinities[i]][k] === skillDefs.resistremove) {
							userDefs[affinities[i]].splice(k)
						}
					}
				}
			}

			if (skillDefs.sacrifice) {
				embedText.resultText += `\n${userDefs.name} sacrificed themselves in the process.`
				userDefs.hp = 0
			}

			return new Discord.MessageEmbed()
				.setColor('#e36b2b')
				.setTitle(`${embedText.targetText}`)
				.setDescription(`${preText}${embedText.attackText}!\n${embedText.resultText}`)
				.setFooter(`${userDefs.name}'s turn`);
		} else {
			return new Discord.MessageEmbed()
				.setColor('#e36b2b')
				.setTitle(`${userDefs.name} => ???`)
				.setDescription(`${userDefs.name} used ${skillDefs.name}... but there was no target.`)
				.setFooter(`${userDefs.name}'s turn`);
		}
	} else if (skillDefs.target === "caster") {
		embedText = attackEnemy(userDefs.name, userDefs.name, userDefs, userDefs, skillDefs, false, server)
		if (embedText.oneMore == true && turnFuncs.oneMores(server)) {
			btl[server].onemore = true
		}

		if (skillDefs.resistremove) {
			embedText.resultText += `\n${userDefs.name} lost all resisting affinities toward ${skillDefs.resistremove} type skills.`
			
			const affinities = ["resist", "block", "repel", "drain"]
			for (const i in affinities) {
				for (const k in userDefs[affinities[i]]) {
					if (userDefs[affinities[i]][k] === skillDefs.resistremove) {
						userDefs[affinities[i]].splice(k)
					}
				}
			}
		}
		
		if (skillDefs.sacrifice) {
			embedText.resultText += `\n${userDefs.name} sacrificed themselves in the process.`
			userDefs.hp = 0
		}

		return new Discord.MessageEmbed()
			.setColor('#e36b2b')
			.setTitle(`${embedText.targetText}`)
			.setDescription(`${preText}${embedText.attackText}!\n${embedText.resultText}`)
			.setFooter(`${userDefs.name}'s turn`);
	} else if (skillDefs.target === "ally") {
		if (allySide[targetNum]) {
			var enmDefs = allySide[targetNum]
			const enmName = enmDefs.name
			
			if (enmDefs.hp <= 0) {
				message.channel.send("You can't attack a dead foe!")
				message.delete()
				return false
			}

			embedText = attackEnemy(userDefs.name, enmName, userDefs, enmDefs, skillDefs, false, server)
			if (embedText.oneMore == true && turnFuncs.oneMores(server)) {
				btl[server].onemore = true
			}

			if (skillDefs.resistremove) {
				embedText.resultText += `\n${userDefs.name} lost all resisting affinities toward ${skillDefs.resistremove} type skills.`
				
				const affinities = ["resist", "block", "repel", "drain"]
				for (const i in affinities) {
					for (const k in userDefs[affinities[i]]) {
						if (userDefs[affinities[i]][k] === skillDefs.resistremove) {
							userDefs[affinities[i]].splice(k)
						}
					}
				}
			}

			if (skillDefs.sacrifice) {
				embedText.resultText += `\n${userDefs.name} sacrificed themselves in the process.`
				userDefs.hp = 0
			}

			return new Discord.MessageEmbed()
				.setColor('#e36b2b')
				.setTitle(`${embedText.targetText}`)
				.setDescription(`${preText}${embedText.attackText}!\n${embedText.resultText}`)
				.setFooter(`${userDefs.name}'s turn`);
		} else {
			return new Discord.MessageEmbed()
				.setColor('#e36b2b')
				.setTitle(`${userDefs.name} => ???`)
				.setDescription(`${userDefs.name} used ${skillDefs.name}... but there was no target.`)
				.setFooter(`${userDefs.name}'s turn`);
		}
	} else if (skillDefs.target === "allopposing") {
		var damages = []
		var finaltext = ``
		
		var embedTexts = []

		for (const i in opposingSide) {
			var enmDefs = opposingSide[i]
			const enmName = enmDefs.name

			if (enmDefs.hp > 0) {
				var embedTxt = attackEnemy(userDefs.name, enmName, userDefs, enmDefs, skillDefs, false, server)
				if (embedTxt.oneMore == true && turnFuncs.oneMores(server)) {
					btl[server].onemore = true
				}

				embedTexts.push(embedTxt)
			}
		}
		
		embedText = {
			targetText: `${userDefs.name} => All Opposing`,
			attackText: `${userDefs.name} used ${skillDefs.name} on the opposing side!`,
			resultText: `${preText}`
		}
		
		for (const i in embedTexts) {
			embedText.resultText += `\n${embedTexts[i].resultText}`
		}

		if (skillDefs.resistremove) {
			embedText.resultText += `\n${userDefs.name} lost all resisting affinities toward ${skillDefs.resistremove} type skills.`
			
			const affinities = ["resist", "block", "repel", "drain"]
			for (const i in affinities) {
				for (const k in userDefs[affinities[i]]) {
					if (userDefs[affinities[i]][k] === skillDefs.resistremove) {
						userDefs[affinities[i]].splice(k)
					}
				}
			}
		}

		return new Discord.MessageEmbed()
			.setColor('#e36b2b')
			.setTitle(`${embedText.targetText}`)
			.setDescription(`${embedText.attackText}!\n${embedText.resultText}`)
			.setFooter(`${userDefs.name}'s turn`);
	} else if (skillDefs.target === "allallies") {
		var damages = []
		var finaltext = ``
		
		var embedTexts = []

		for (const i in allySide) {
			var targDefs = allySide[i]
			const targName = enmDefs.name
			
			if (targDefs.hp > 0 && userDefs.name != targName) {
				var embedTxt = attackEnemy(userDefs.name, targName, userDefs, targDefs, skillDefs, false, server)
				if (embedTxt.oneMore == true && turnFuncs.oneMores(server)) {
					btl[server].onemore = true
				}

				embedTexts.push(embedTxt)
			}
		}
		
		embedText = {
			targetText: `${userDefs.name} => All Allies`,
			attackText: `${userDefs.name} used ${skillName} on their own side!`,
			resultText: `${preText}`
		}
		
		for (const i in embedTexts) {
			embedText.resultText += `\n${embedTexts[i].resultText}`
		}

		if (skillDefs.resistremove) {
			embedText.resultText += `\n${userDefs.name} lost all resisting affinities toward ${skillDefs.resistremove} type skills.`
			
			const affinities = ["resist", "block", "repel", "drain"]
			for (const i in affinities) {
				for (const k in userDefs[affinities[i]]) {
					if (userDefs[affinities[i]][k] === skillDefs.resistremove) {
						userDefs[affinities[i]].splice(k)
					}
				}
			}
		}
		
		if (skillDefs.sacrifice) {
			embedText.resultText += `\n${userDefs.name} sacrificed themselves in the process.`
			userDefs.hp = 0
		}

		return new Discord.MessageEmbed()
			.setColor('#e36b2b')
			.setTitle(`${embedText.targetText}`)
			.setDescription(`${embedText.attackText}!\n${embedText.resultText}`)
			.setFooter(`${userDefs.name}'s turn`);
	} else if (skillDefs.target === "everyone") {
		var damages = []
		var finaltext = ``;
		var embedTexts = [];
		var fighters = [];

		for (const i in btl[server].allies.members) {
			if (btl[server].allies.members[i].name != userDefs.name) {
				if (btl[server].allies.members[i].hp > 0) {
					fighters.push(btl[server].allies.members[i])
				}
			}
		}

		for (const i in btl[server].enemies.members) {
			if (btl[server].enemies.members[i].name != userDefs.name) {
				if (btl[server].enemies.members[i].hp > 0) {
					fighters.push(btl[server].enemies.members[i])
				}
			}
		}

		for (const i in fighters) {
			var embedTxt = attackEnemy(userDefs.name, fighters[i].name, userDefs, fighters[i], skillDefs, false, server)
			if (embedTxt.oneMore == true && turnFuncs.oneMores(server)) {
				btl[server].onemore = true
			}
			
			embedTexts.push(embedTxt)
		}
		
		embedText = {
			targetText: `${userDefs.name} => All Opposing`,
			attackText: `${userDefs.name} used ${skillDefs.name} on all fighters!`,
			resultText: `${preText}`
		}
		
		for (const i in embedTexts) {
			embedText.resultText = embedText.resultText + `\n${embedTexts[i].resultText}`
		}

		if (skillDefs.resistremove) {
			embedText.resultText += `\n${userDefs.name} lost all resisting affinities toward ${skillDefs.resistremove} type skills.`
			
			const affinities = ["resist", "block", "repel", "drain"]
			for (const i in affinities) {
				for (const k in userDefs[affinities[i]]) {
					if (userDefs[affinities[i]][k] === skillDefs.resistremove) {
						userDefs[affinities[i]].splice(k)
					}
				}
			}
		}
		
		if (skillDefs.sacrifice) {
			embedText.resultText += `\n${userDefs.name} sacrificed themselves in the process.`
			userDefs.hp = 0
		}

		return new Discord.MessageEmbed()
			.setColor('#e36b2b')
			.setTitle(`${embedText.targetText}`)
			.setDescription(`${embedText.attackText}!\n${embedText.resultText}`)
			.setFooter(`${userDefs.name}'s turn`);
	}
}

// Export Functions
module.exports = {
	generateDamage: function (atk, prc, luk, chr, movepow, moveacc, movecrit, movestatus, movestatuschance, movetype, enmdef, enmagl, enmluk, dmgtype) {
		return genDmgFromVals(atk, prc, luk, chr, movepow, moveacc, movecrit, movestatus, movestatuschance, movetype, enmdef, enmagl, enmluk, dmgtype)
	},
	
	meleeFoe: function(userDefs, oppDefs, server, rage) {
		return meleeAttack(userDefs, oppDefs, server, rage)
	},
	
	attackFoe: function(userName, oppName, userDefs, oppDefs, skillDefs, useEnergy, server) {
		return attackEnemy(userName, oppName, userDefs, oppDefs, skillDefs, useEnergy, server)
	},
	
	attackWithSkill: function(userDefs, targetNum, allySide, opposingSide, btl, skillDefs, server) {
		return attackWithSkill(userDefs, targetNum, allySide, opposingSide, btl, skillDefs, server)
	},
	
	inflictStatus: function(targDefs, skillDefs) {
		return inflictStatus(targDefs, skillDefs)
	},
	
	inflictStatusFromText: function(targDefs, statusEffect) {
		return inflictStatusFromText(targDefs, statusEffect)
	}
}