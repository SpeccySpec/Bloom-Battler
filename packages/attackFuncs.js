// Require
const Discord = require('discord.js');
const fs = require('fs');

const utilityFuncs = require('./utilityFuncs.js');
const charFuncs = require('./charFuncs.js');
const enemyFuncs = require('./enemyFuncs.js');
const turnFuncs = require('./turnFuncs.js');
const skillFuncs = require('./skillFuncs.js');

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

// Weather & Terrain
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
	"grassy", // Heal 1/10th max HP
	"light", // 1.2x to Bless
	"psychic", // Reverse turn order
	"misty", // no status effects
	"sky", // 1.2x to wind
	
	// boss specific
	"flooded",
	"swamp",
	"glacial",
	"fairydomain",
	"graveyard",
	"factory",
	"blindingradiance"
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
		
		console.log(`${skillDefs.name} used ${skillDefs.cost}`)
	}
	
	return true
}

// Buffs
function statWithBuff(stat, buff, passive) {
	return Math.round(stat + (buff*(stat/5)))
}

// Miss Check
function missCheck(userPrc, oppAgl, moveAcc) {
	if (moveAcc >= 100)
		return true;

	let targVal = (moveAcc + ((userPrc - oppAgl)/2))
	let randomVal = Math.round(Math.random()*100)

	if (randomVal > targVal)
		return false;
	
	return true
}

// Technical Check
const elementTechs = {
	burn: ['water', 'earth', 'nuclear'],
	bleed: ['slash', 'poison', 'nuclear'],
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

function isTech(charDefs, element) {
	if (!charDefs.status || charDefs.status == 'none')
		return false;
	
	if (charDefs.status === 'sleep')
		return true;

	for (const i in elementTechs[charDefs.status]) {
		var techElement = elementTechs[charDefs.status][i]
		if (element == techElement)
			return true;
	}

	return false;
}

// Is the status effect physical?
function isPhysicalStatus(status) {
	if (!status) return false;

	var statusName = status.toLowerCase()
	if (statusName === 'burn' || statusName === 'bleed' || statusName === 'freeze' || statusName === 'paralyze' || statusName === 'poison' || statusName === 'hunger' || statusName === 'dazed' || statusName === 'illness' || statusName === 'mirror' || statusName === 'blind')
		return true;

	return false;
}

// Knows enemy?
function knowsEnemy(oppDefs, server) {
	if (!oppDefs.enemy)
		return true

	var servPath = dataPath+'/Server Settings/server.json'
	var servRead = fs.readFileSync(servPath);
	var servFile = JSON.parse(servRead);

	if (!servFile[server].encountered) {
		servFile[server].encountered = []
		fs.writeFileSync(servPath, JSON.stringify(servFile, null, '    '));
		return false;
	}

	for (const i in servFile[server].encountered) {
		if (servFile[server].encountered[i] == oppDefs.name)
			return true;
	}

	return false;
}

// Determine the Damage that this move will deal. Also handles Status Effects, Affinities and Critical Hits
function genDmg(userDefs, targDefs, skillDefs, server, forceDmgType, btl) {
	console.log("genDmg:")

    let values = [0, "normal", false, false, false, false]; // Damage, Damagestate, Hit a Weakness?, Crit?, Inflict Status?, Technical?, Super Weakness?

	// Weaknesses and shit
	let dmgtype = "normal"
	if (forceDmgType)
		dmgtype = forceDmgType
	else if (targDefs.status === 'mirror') {
		if (skillDefs.atktype === 'physical')
			dmgtype = "weak";
		else
			dmgtype = "repel"
	} else {
		dmgtype = getAffinity(targDefs, skillDefs.type)
		if (dmgtype === 'weak' && targDefs.guard)
			dmgtype = 'normal'
		if (dmgtype === 'superweak' && targDefs.guard)
			dmgtype = 'weak'
	}

	if ((dmgtype === 'repel' || dmgtype === 'barrier') && userDefs.petChar)
		dmgtype = 'block';

    if (dmgtype === "block") {
		if (userDefs.rollouts) {
			userDefs.ignoreRollout = true;
			delete userDefs.rollouts;
			delete userDefs.forceMove;
		}

        return [0, dmgtype, false, false, false, false];
	}

    values[0] = 1

	let skillPow = skillDefs.pow
	let skillAcc = skillDefs.acc
	let skillStatus = skillDefs.statuschance ? skillDefs.statuschance : 0
	
	// Leader Skills
	var allySide = btl[server].allies.members
	var opposingSide = btl[server].enemies.members
	if (charFuncs.isOpposingSide(userDefs, btl[server])) {
		allySide = btl[server].enemies.members
		opposingSide = btl[server].allies.members
	}

	let allies = 0
	for (const i in allySide) {
		let allyDefs = allySide[i]
		if (allyDefs.hp > 0) allies++;

		if (allyDefs.hp > 0 && allyDefs.leader && allyDefs.leaderSkill) {
			if (allyDefs.leaderSkill.type == "boost") {
				switch (allyDefs.leaderSkill.target) {
					case skillDefs.type:
					case "all":
						skillPow += Math.round((skillPow/100)*allyDefs.leaderSkill.percent);

					case "magic":
						if (skillDefs.atktype === "magic")
							skillPow += Math.round((skillPow/100)*allyDefs.leaderSkill.percent);

					case "physical":
						if (skillDefs.atktype === "physical")
							skillPow += Math.round((skillPow/100)*allyDefs.leaderSkill.percent);
				}
			}
		}
	}

	// Charms
	if (charFuncs.equippedCharm(userDefs, "ShamanStone") && skillDefs.atktype === "magic")
		skillPow *= 1.5

	if (charFuncs.equippedCharm(userDefs, "FragileStrength") || charFuncs.equippedCharm(userDefs, "UnbreakableStrength"))
		skillPow *= 1.4

	if (charFuncs.equippedCharm(userDefs, "FuryOfTheFallen") && userDefs.hp <= userDefs.maxhp/5)
		skillPow *= 2

	if (charFuncs.equippedCharm(userDefs, "GrubberflysElegy"))
		skillAcc *= 1.3

	if (charFuncs.equippedCharm(userDefs, "Reservationist") && skillDefs.atktype === "magic")
		skillPow *= 0.8;
	
	// Boost Passives
	if (charFuncs.hasPassive(userDefs, "boost")) {
		let boostDefs = charFuncs.hasPassive(userDefs, "boost")
		skillPow *= 1 + (boostDefs.pow/100)
	}

	// Skills
	if (skillDefs.hpcalc) {
		let percentMod = 0.5 + (userDefs.hp/userDefs.maxhp)
		skillPow *= percentMod
	}

	if (skillDefs.mpcalc) {
		let percentMod = 0.5 + (userDefs.mp/userDefs.maxmp)
		skillPow *= percentMod
	}

	if (skillDefs.affinitypow && userDefs.affinitypoint && charFuncs.hasPassive(userDefs, "affinitypoint")) {
		for (i = 0; i < userDefs.affinitypoint; i++)
			skillPow += skillDefs.affinitypow;
	}

	if (skillDefs.powerbuff && userDefs.buffs[skillDefs.powerbuff[0]]) {
		for (i = 0; i < userDefs.buffs[skillDefs.powerbuff[0]]; i++)
			skillPow += userDefs.buffs[skillDefs.powerbuff[0]]*skillDefs.powerbuff[1];
	}
	
	if (skillDefs.lonewolf && allies <= 1)
		skillPow *= 1.5;
	
	if (skillDefs.rollout && userDefs.rollouts) {
		skillPow += Math.round((skillPow/100)*skillDefs.rollout)*userDefs.rollouts;
		
		if (skillPow >= skillDefs.pow*2 || userDefs.rollouts > 4) {
			userDefs.ignoreRollout = true;
			delete userDefs.rollouts;
			delete userDefs.forceMove;
		}
	}

    // Accuracy Checks
	if (!skillDefs.limitbreak) {
		if (!forceDmgType) {
			console.log("<<Accuracy Checks done in missCheck (line 149)>>")
			let prcCheck = statWithBuff(userDefs.prc, userDefs.buffs.prc)
			let aglCheck = statWithBuff(targDefs.agl, targDefs.buffs.agl)

			if (userDefs.status === 'dizzy') {
				prcCheck = 0;
				aglCheck = 0;
			}

			if (userDefs.status === 'blind')
				prcCheck /= 2;

			if (targDefs.status === 'blind')
				aglCheck /= 2;

			if (charFuncs.hasPassive(targDefs, 'guarddodge') && targDefs.guard)
				aglCheck *= 1.6

			if (!missCheck(Math.round(prcCheck), Math.round(aglCheck), skillAcc)) {
				if (userDefs.rollouts) {
					userDefs.ignoreRollout = true;
					delete userDefs.rollouts;
					delete userDefs.forceMove;
				}

				return [0, "miss", false, false, false, false];
			}
		} else {
			if (dmgtype === "miss") {
				if (userDefs.rollouts) {
					userDefs.ignoreRollout = true;
					delete userDefs.rollouts;
					delete userDefs.forceMove;
				}

				return [0, "miss", false, false, false, false];
			}
		}
	}

    // Damage Generation
	let atkStat = statWithBuff(userDefs.atk, userDefs.buffs.atk)
	let endStat = statWithBuff(targDefs.end, targDefs.buffs.end)

	if (skillDefs.atktype === "magic") {
		atkStat = statWithBuff(userDefs.mag, userDefs.buffs.mag);
		
		if (userDefs.status === 'poison') atkStat /= 2;
	} else {
		if (userDefs.status === 'burn') atkStat /= 2;
	}

	if (skillDefs.statCalc)
		atkStat = statWithBuff(userDefs[skillDefs.statCalc], userDefs.buffs[skillDefs.statCalc] ? userDefs.buffs[skillDefs.statCalc] : 0);

	if (userDefs.rageSoul) atkStat *= 2;
	
	let def = atkStat / endStat;

	if (skillDefs.limitbreak) {
		values[0] = Math.round((((skillPow+(atkStat*2)-targDefs.end)*2) + Math.round(Math.random() * 30))/2)

		if (targDefs.miniboss || targDefs.boss || targDefs.diety)
			values[0] = Math.round(values[0]*0.75);
		
		// Damage Types
		if (dmgtype === "weak") {
			values[2] = true;
			values[1] = "weak";
			values[0] = Math.round(values[0]*1.5);
		} else if (dmgtype === "superweak") {
			values[2] = true;
			values[1] = "superweak";
			values[0] = Math.round(values[0]*2.5);
		} else if (dmgtype === "resist" || dmgtype === "repel" || dmgtype === "block") {
			values[1] = "resist";
			values[0] = Math.round(values[0] / 2);
		}
	} else {
		if (btl[server].damageFormula === 'pokemon')
			values[0] = Math.round((((2*userDefs.level)/5+2)*skillPow*def)/50+2)
		else
			values[0] = Math.round(5 * Math.sqrt(def * skillPow));

		if (dmgtype === "repel" || dmgtype === "drain")
			return [Math.round(values[0]), dmgtype, false, false, false, false];
 		
		// Damage Types
		if (dmgtype === "weak") {
			values[2] = true;
			values[1] = "weak";
			values[0] = Math.round(values[0]*1.5);
		} else if (dmgtype === "superweak") {
			values[2] = true;
			values[1] = "superweak";
			values[0] = Math.round(values[0]*2.1);
		} else if (dmgtype === "resist") {
			values[1] = "resist";
			values[0] = Math.round(values[0]/2);
		}

		// Crits
		console.log("<<Crit Checks>>")
		if (skillDefs.crit > 0 && !targDefs.guard) {
			let targ2 = (skillDefs.crit + (statWithBuff(userDefs.luk, userDefs.buffs.crit) - targDefs.luk));
			let crit = (Math.floor(Math.random() * 100));

			console.log(`Random Value ${crit} < Target Value ${Math.round(targ2*100)}?`)
			if (crit <= targ2 || skillDefs.crit >= 100 || targDefs.status === "sleep") {
				values[0] = Math.round(values[0]*1.5);
				skillStatus *= 1.5;
				values[3] = true;
			}
		}

		// Shield
		if (targDefs.shield && !skillDefs.feint) {
			if (targDefs.powerShield)
				values[0] = Math.ceil(values[0]/8);
			else
				values[0] = Math.round(values[0]/3);

			console.log('Damage Checks: Shield & Power Shield')

//			delete targDefs.shield
//			delete targDefs.powerShield
		}

		// Armors
		if (targDefs.armorData && targDefs.armorData.element && skillDefs.type === targDefs.armorData.element)
			values[0] = Math.round(values[0]*(0.9-(targDefs.armorData.level/100)));
	}

    // Status
	console.log("<<Status Checks>>")
    if (skillDefs.status && skillStatus > 0) {
		let status = skillDefs.status
		if (typeof(status) === 'object')
			status = status[Math.round(Math.random() * status.length-1)];

		let targ3 = (skillStatus + (userDefs.chr - targDefs.luk));
		if (isPhysicalStatus(status))
			targ3 = (skillStatus + (userDefs.luk - targDefs.luk));

		let st = Math.round(Math.random()*100);

		console.log(`Random Value ${Math.round(st)} < Target Value ${Math.round(targ3)}?`)
		if (st < targ3 || skillStatus >= 100)
			values[4] = true;
    }
	
	// Technicals
	console.log("<<Technical Boost>>")
	if (isTech(targDefs, skillDefs.type)) {
		values[0] = Math.round(values[0]*1.25);
		values[5] = true;
	} else if (skillDefs.forceTech) {
		if (typeof(skillDefs.forceTech) === 'object') {
			for (const i in skillDefs.forceTech) {
				if (skillDefs.type === skillDefs.forceTech[i]) {
					values[0] = Math.round(values[0]*1.25);
					values[5] = true;
					break;
				}
			}
		} else {
			if (skillDefs.type === skillDefs.forceTech) {
				values[0] = Math.round(values[0]*1.25);
				values[5] = true;
			}
		}
	}
	
	// Mind and Power Charge
	if (userDefs.mindcharge && skillDefs.atktype === 'magic' || userDefs.powercharge && skillDefs.atktype === 'physical')
		values[0] = Math.round(values[0]*2.5);
	
	// Guard
	if (targDefs.guard) {
		let guardMult = skillDefs.limitbreak ? 0.8 : 0.6;
		if (charFuncs.hasPassive(targDefs, 'guardboost')) {
			let guardDefs = charFuncs.hasPassive(targDefs, 'guardboost')

			let guardPow = guardDefs.pow;
			if (charFuncs.hasPassive(targDefs, 'guarddodge'))
				guardPow /= 1.5;
			
			if (skillDefs.limitbreak)
				guardPow /= 2;

			guardMult -= Math.min(0.59, guardPow/100)
		}

		values[0] = Math.round(values[0]*guardMult)
	}

	return values
}

// Inflict Status
function inflictStatus(oppDefs, skillDefs) {
	if (oppDefs.status != "none")
		return 'No status was inflicted.';
	
	var skillStatus;
	if (typeof skillDefs.status === 'object')
		skillStatus = skillDefs.status[Math.round(Math.random() * skillDefs.status.length)].toLowerCase();
	else
		skillStatus = skillDefs.status.toLowerCase();

	var finaltext = '';
	if (skillStatus === "burn") {
		finaltext = `${oppDefs.name} was burned!`
		oppDefs.status = "burn"
		oppDefs.statusturns = 3
	} else if (skillStatus === "bleed") {
		finaltext = `${oppDefs.name} was inflicted with bleeding!`
		oppDefs.status = "bleed"
		oppDefs.statusturns = 5
	} else if (skillStatus === "poison" || skillStatus === "toxic") {
		finaltext = `${oppDefs.name} was poisoned!`
		oppDefs.status = "poison"
		oppDefs.statusturns = 3
	} else if (skillStatus === "freeze") {
		finaltext = `${oppDefs.name} was frozen!`
		oppDefs.status = "freeze"
		oppDefs.statusturns = 1
	} else if (skillStatus === "paralyze") {
		finaltext = `${oppDefs.name} was paralyzed!`
		oppDefs.status = "paralyze"
		oppDefs.statusturns = 1
	} else if (skillStatus === "sleep") {
		finaltext = `${oppDefs.name} fell asleep!`
		oppDefs.status = "sleep"
		oppDefs.statusturns = 3
	} else if (skillStatus === "dizzy") {
		finaltext = `${oppDefs.name} was inflicted with dizziness!`
		oppDefs.status = "dizzy"
		oppDefs.statusturns = 3
	} else if (skillStatus === "brainwash") {
		finaltext = `${oppDefs.name} was brainwashed!`
		oppDefs.status = "brainwash"
		oppDefs.statusturns = 2
	} else if (skillStatus === "rage") {
		finaltext = `${oppDefs.name} was enraged!`
		oppDefs.status = "rage"
		oppDefs.statusturns = 3
	} else if (skillStatus === "fear") {
		finaltext = `${oppDefs.name} was inflicted with fear!`
		oppDefs.status = "fear"
		oppDefs.statusturns = 2
	} else if (skillStatus === "ego") {
		finaltext = `${oppDefs.name} was made egotistic!`
		oppDefs.status = "ego"
		oppDefs.statusturns = 3
	} else if (skillStatus === "paranoia") {
		finaltext = `${oppDefs.name} was made paranoid!`
		oppDefs.status = "paranoia"
		oppDefs.statusturns = 2
	} else if (skillStatus === "despair") {
		finaltext = `${oppDefs.name} was inflicted with despair!`
		oppDefs.status = "despair"
		oppDefs.statusturns = 5
	} else if (skillStatus === "silence") {
		finaltext = `${oppDefs.name} was silenced!`
		oppDefs.status = "silence"
		oppDefs.statusturns = 2
	} else if (skillStatus === "hunger") {
		finaltext = `${oppDefs.name} was made hungry!`
		oppDefs.status = "hunger"
		oppDefs.statusturns = 3

		if (oppDefs.status === "hunger") {
			oppDefs.atk = Math.round(oppDefs.atk/2)
			oppDefs.mag = Math.round(oppDefs.mag/2)
			oppDefs.prc = Math.round(oppDefs.prc/2)
			oppDefs.agl = Math.round(oppDefs.agl/2)
		}
	} else if (skillStatus === "illness") {
		finaltext = `${oppDefs.name} was made ill!`
		oppDefs.status = "illness"
		oppDefs.statusturns = 5
	} else if (skillStatus === "infatuation") {
		finaltext = `${oppDefs.name} was infatuated!`
		oppDefs.infatuation = 5;
	} else if (skillStatus === "confusion") {
		finaltext = `${oppDefs.name} was confused!`
		oppDefs.confusion = 3
	} else if (skillStatus === "mirror") {
		finaltext = `${oppDefs.name} was encased in a mirror!`
		oppDefs.status = "mirror"
		oppDefs.statusturns = 3
	} else if (skillStatus === "blind") {
		finaltext = `${oppDefs.name} was blinded!`
		oppDefs.status = "blind"
		oppDefs.statusturns = 3
	}
	
	return finaltext
}

function inflictStatusFromText(oppDefs, statusEffect) {
	if (oppDefs.status != "none")
		return 'No status was inflicted.';

	var finaltext = '';
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
		oppDefs.status = "sleep"
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
	} else if (statusEffect === "silence") {
		finaltext = "They were silenced!"
		oppDefs.status = "silence"
		oppDefs.statusturns = 2
	} else if (statusEffect === "hunger") {
		finaltext = "They were made hungry!"
		oppDefs.status = "hunger"
		oppDefs.statusturns = 3

		if (oppDefs.status === "hunger") {
			oppDefs.atk = Math.round(oppDefs.atk/2)
			oppDefs.mag = Math.round(oppDefs.mag/2)
			oppDefs.prc = Math.round(oppDefs.prc/2)
			oppDefs.agl = Math.round(oppDefs.agl/2)
		}
	} else if (statusEffect === "illness") {
		finaltext = `${oppDefs.name} was made ill!`
		oppDefs.status = "illness"
		oppDefs.statusturns = 5
	} else if (statusEffect === "infatuation") {
		finaltext = `${oppDefs.name} was infatuated!`
		oppDefs.infatuation = 5;
	} else if (statusEffect === "confusion") {
		finaltext = `${oppDefs.name} was confused!`
		oppDefs.confusion = 3
	} else if (statusEffect === "mirror") {
		finaltext = `${oppDefs.name} was encased in a mirror!`
		oppDefs.status = "mirror"
		oppDefs.statusturns = 3
	} else if (statusEffect === "blind") {
		finaltext = `${oppDefs.name} was blinded!`
		oppDefs.status = "blind"
		oppDefs.statusturns = 3
	}
	
	return finaltext
}

function getAffinity(charDefs, skillType) {
	var affinity = 'normal'
	if (skillType && skillType != "almighty") {
		const affinities = ["superweak", "weak", "resist", "block", "repel", "drain"]
		for (const i in affinities) {
			for (const k in charDefs[affinities[i]]) {
				if (charDefs[affinities[i]][k] == skillType)
					affinity = affinities[i];
			}
		}
	}
	
	return affinity
}

function weatherMod(dmg, weather, skillDefs) {
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

function terrainMod(dmg, terrain, skillDefs) {				
	if (terrain === "flaming") {
		if (skillDefs.type === "fire")
			dmg[0] = Math.round(dmg[0]*1.2);
	} else if (terrain === "thunder") {
		if (skillDefs.type === "electric")
			dmg[0] = Math.round(dmg[0]*1.2);
	} else if (terrain === "icy") {
		if (skillDefs.type === "ice")
			dmg[0] = Math.round(dmg[0]*1.2);
	} else if (terrain === "light") {
		if (skillDefs.type === "bless")
			dmg[0] = Math.round(dmg[0]*1.2);
	} else if (terrain === "misty") {
		if (skillDefs.statuschance)
			skillDefs.statuschance = 0;
	} else if (terrain === "wind") {
		if (skillDefs.type === "sky")
			dmg[0] = Math.round(dmg[0]*1.2);
	}
	
	return dmg
}

function fieldMod(dmg, weather, terrain, skillDefs) {
	weatherMod(dmg, weather, skillDefs)
	terrainMod(dmg, terrain, skillDefs)
	
	return dmg
}

// Attack Object
function attackEnemy(userName, oppName, userDefs, oppDefs, skillDefs, useEnergy, server, btl) {
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
	
	var allySide = btl[server].allies.members
	var opposingSide = btl[server].enemies.members
	if (charFuncs.isOpposingSide(userDefs, btl[server])) {
		allySide = btl[server].enemies.members
		opposingSide = btl[server].allies.members
	}

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
				var targ = (skillDefs.statuschance + (userDefs.chr - oppDefs.luk));
				if (isPhysicalStatus(skillDefs.status))
					targ = (skillDefs.statuschance + (userDefs.luk - oppDefs.luk));

				var chance = Math.round(Math.random()*100);

				if (oppDefs.status === "none") {
					var finaltext = ""
					if (chance > targ || skillDefs.statuschance >= 100) {
						finaltext += inflictStatus(oppDefs, skillDefs)
					} else {
						finaltext = "But they dodged it!"

						if (userDefs.missquote && userDefs.missquote.length > 0) {
							var possibleQuote = Math.round(Math.random() * (userDefs.missquote.length-1))
							var missQuote = `\n*${userName}: "${userDefs.missquote[possibleQuote]}"*`
							
							if (missQuote.includes('%ENEMY%'))
								missQuote.replace('%ENEMY%', oppName)
							
							finaltext += missQuote
						}

						if (oppDefs.dodgequote && oppDefs.dodgequote.length > 0) {
							var possibleQuote = Math.round(Math.random() * (oppDefs.dodgequote.length-1))
							var dodgeQuote = `\n*${oppName}: "${oppDefs.dodgequote[possibleQuote]}"*`
							
							if (dodgeQuote.includes('%ENEMY%'))
								dodgeQuote.replace('%ENEMY%', userName)
							
							finaltext += dodgeQuote
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
			embedText.attackText = `${userName} used ${skillDefs.name} on ${oppDefs.name}!`
			embedText.resultText = `${oppDefs.name} is going to be affected by ${userName}'s future attack.`
		} else if (skillDefs.debuff) {
			if (skillDefs.debuff == "all") {
				oppDefs.buffs.atk = Math.max(-3, oppDefs.buffs.atk-1)
				oppDefs.buffs.mag = Math.max(-3, oppDefs.buffs.mag-1)
				oppDefs.buffs.end = Math.max(-3, oppDefs.buffs.end-1)
				oppDefs.buffs.prc = Math.max(-3, oppDefs.buffs.prc-1)
				oppDefs.buffs.agl = Math.max(-3, oppDefs.buffs.agl-1)
			} else {
				if (oppDefs.buffs[skillDefs.debuff] <= -3) {
					embedText.targetText = `${userName} => ${oppDefs.name}`
					embedText.attackText = `${userName} used ${skillDefs.name}!`
					embedText.attackText = `But ${oppDefs.name}'s ${skillDefs.debuff.toUpperCase()} can't go lower!`
					return embedText
				}

				oppDefs.buffs[skillDefs.debuff] = Math.max(-3, oppDefs.buffs[skillDefs.debuff]-1)
			}

			embedText.targetText = `${userName} => ${oppDefs.name}`
			embedText.attackText = `${userName} used ${skillDefs.name}!`
			embedText.attackText = `${userName} debuffed ${oppDefs.name}'s ${(skillDefs.debuff == "all") ? "Stats" : skillDefs.debuff.toUpperCase()}!`
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
		
		// OHKO skills
		if (skillDefs.ohko) {
			embedText.targetText = `${userDefs.name} => ${oppDefs.name}`
			embedText.attackText = `${userDefs.name} used ${skillDefs.name}!`

			if (oppDefs.boss || oppDefs.miniboss || oppDefs.finalboss || oppDefs.diety) {
				embedText.resultText += 'But it failed!'
				return embedText
			}
			
			var dmgType = getAffinity(oppDefs, skillDefs.type)
			switch(dmgType) {
				case 'superweak':
					skillDefs.acc *= 3
					break

				case 'weak':
					skillDefs.acc *= 2
					break
				
				case 'resist':
					skillDefs.acc /= 2
					break
				
				case 'block':
				case 'repel':
				case 'drain':
					embedText.resultText += 'But was blocked!';
					return embedText
				
				default:
					console.log('No affinity toward the insta-kill.')
			}

			if (missCheck(userDefs.luk, oppDefs.luk, skillDefs.acc)) {
				embedText.resultText += `The attack instantly defeated ${oppDefs.name}!`;
				oppDefs.hp = 0

				if (userDefs.killquote && userDefs.killquote.length > 0) {
					var possibleQuote = Math.round(Math.random() * (userDefs.killquote.length-1))
					var quote = `\n*${userDefs.name}: "${userDefs.killquote[possibleQuote]}"*`

					while (quote.includes('%ENEMY%'))
						quote = quote.replace('%ENEMY%', oppDefs.name);

					finaltext += quote
				}

				if (oppDefs.deathquote && oppDefs.deathquote.length > 0) {
					var possibleQuote = Math.round(Math.random() * (oppDefs.deathquote.length-1))
					var quote = `\n*${oppDefs.name}: "${oppDefs.deathquote[possibleQuote]}"*`

					while (quote.includes('%ENEMY%'))
						quote.replace('%ENEMY%', userDefs.name);

					finaltext += quote
				}
			} else {
				embedText.resultText += 'But it missed!';

				if (userDefs.missquote && userDefs.missquote.length > 0) {
					var possibleQuote = Math.round(Math.random() * (userDefs.missquote.length-1))
					var missQuote = `\n*${userName}: "${userDefs.missquote[possibleQuote]}"*`
					
					if (missQuote.includes('%ENEMY%'))
						missQuote.replace('%ENEMY%', oppName)
					
					embedText.resultText += missQuote
				}

				if (oppDefs.dodgequote && oppDefs.dodgequote.length > 0) {
					var possibleQuote = Math.round(Math.random() * (oppDefs.dodgequote.length-1))
					var dodgeQuote = `\n*${oppName}: "${oppDefs.dodgequote[possibleQuote]}"*`
					
					if (dodgeQuote.includes('%ENEMY%'))
						dodgeQuote.replace('%ENEMY%', userName)
					
					embedText.resultText += dodgeQuote
				}
			}
			
			return embedText
		}

		// Now, do regular attacks.
		var atk = statWithBuff(userDefs.atk, userDefs.buffs.atk)
		if (skillDefs.atktype && skillDefs.atktype === "magic")
			atk = statWithBuff(userDefs.mag, userDefs.buffs.mag)

		var prc = statWithBuff(userDefs.prc, userDefs.buffs.prc)
		var luk = userDefs.luk
		var chr = userDefs.chr
		var enmdef = statWithBuff(oppDefs.end, oppDefs.buffs.end)
		var enmagl = statWithBuff(oppDefs.agl, oppDefs.buffs.agl)
		var enmluk = oppDefs.luk

		var movepow = parseInt(skillDefs.pow)

		var movetype = skillDefs.atktype
		var moveacc = 999
		if (skillDefs.acc)
			moveacc = skillDefs.acc;
		
		// Dizziness
		if (userDefs.status === "dizzy") 
			moveacc -= Math.floor(moveacc/2)

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
		var dmgtype = getAffinity(oppDefs, skillDefs.type)

		const skillPath = dataPath+'/skills.json'
		const skillRead = fs.readFileSync(skillPath);
		const skillFile = JSON.parse(skillRead);
		
		// Boosting Passives
		let extraHit = null;
		if (charFuncs.hasPassive(userDefs, "extrahit") && skillDefs.hits <= 1) {
			var skillDefs2 = charFuncs.hasPassive(userDefs, "extrahit")
			
			if (skillDefs2.pow <= -1) {
				embedText.targetText = `${userName} => ${oppName}`
				embedText.attackText = `${userName} used ${skillDefs.name}!`
				embedText.resultText = `...but ${userName}'s ${skillDefs2.name} stopped the attack.`
				return embedText
			}

			for (let i = 0; i < skillDefs2.pow; i++) {
				if (Math.round(Math.random()*100) > (skillDefs2.acc-(5*i))) {
					skillDefs.hits = skillDefs.hits ? skillDefs.hits++ : 2;
					skillDefs.pow = Math.round(skillDefs.pow*0.9);
					extraHit = skillDefs2.name;
					movepow = skillDefs.pow;
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
					if (skillDefs2.passive === "wonderguard" && dmgtype != "weak" && dmgtype != "superweak") {
						embedText.targetText = `${userName} => ${oppName}`
						embedText.attackText = `${userName} used ${skillDefs.name}!`
						embedText.resultText = `${oppName}'s ${skillDefs2.name} made them immune to the attack!`

						if (oppDefs.blockquote && oppDefs.blockquote.length > 0) {
							var possibleQuote = Math.round(Math.random() * (oppDefs.blockquote.length-1))
							finaltext += `\n*${oppName}: "${oppDefs.blockquote[possibleQuote]}"*`
						}
						
						/*
						if (useEnergy)
							useCost(userDefs, skillDefs);
						*/

						return embedText
					} else if (skillDefs2.passive === "weaken" && skillDefs2.weaktype == skillDefs.type)
						movepow -= (movepow/100)*skillDefs2.pow;
					else if (skillDefs2.passive === "repelmag") {
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
							
							/*
							if (useEnergy)
								useCost(userDefs, skillDefs);
							*/

							return embedText
						}
					}

					if ((skillDefs2.passive === "counterphys" && skillDefs.atktype === "physical") ||
							   (skillDefs2.passive === "countermag" && skillDefs.atktype === "magic")) {
						var dodgeChance = skillDefs2.counter.chance
						var dodgeValue = Math.round(Math.random()*100);

						console.log(`CounterSkill: ${dodgeValue} <= ${dodgeChance}?`)
						if (dodgeValue <= dodgeChance)
							counterSkill = skillDefs2.counter.skill;
					}
					
					if (!counterSkill && skillDefs2.passive === "swordbreaker" && skillDefs.atktype === "physical" && (dmgtype === "normal" || dmgtype === "weak" || dmgtype === "superweak")) {
						var resistChance = skillDefs2.pow;
						var resistValue = Math.round(Math.random()*100);

						console.log(`Swordbreaker: ${resistValue} <= ${resistChance}?`)
						if (resistValue <= resistChance)
							resistSkill = skillDefs2.name;
					}
				}
			}
		}
		
		if (counterSkill) {
			var dmgtype2 = getAffinity(userDefs, counterSkill.type)

			// Affinity Cutter & Slicer
			for (const i in oppDefs.skills) {
				var oppSkill = skillFile[oppDefs.skills[i]]
				
				if (oppSkill.passive) {
					if (oppSkill.affinitycutter) {
						var randChance = Math.round(Math.random()*100)
						
						if (randChance <= oppSkill.pow && (dmgtype2 === "resist" || dmgtype2 === "block")) {
							finaltext += `\n${oppName}'s ${oppSkill.name} allowed them to cut through resist & block affinities!`
							dmgtype2 = "normal"
						}
					} else if (oppSkill.affinityslicer) {
						var randChance = Math.round(Math.random()*100)
						
						if (randChance <= oppSkill.pow && (dmgtype2 === "resist" || dmgtype2 === "block" || dmgtype2 === "repel" || dmgtype2 === "drain")) {
							finaltext += `\n${oppName}'s ${oppSkill.name} allowed them to cut through resist, block, repel and drain affinities!`
							
							if (dmgtype2 === "resist")
								dmgtype2 = "normal"
							else
								dmgtype2 = "resist"
						}
					}
				}
			}

			if (counterSkill.atktype == "physical" && userDefs.trapType && !counterSkill.feint) {
				dmgtype2 = "resist";
				trapped = true;
			}

			var atk = statWithBuff(oppDefs.atk, oppDefs.buffs.atk)
			if (counterSkill.atktype && counterSkill.atktype === "magic")
				atk = statWithBuff(oppDefs.mag, oppDefs.buffs.mag)

			var prc = statWithBuff(oppDefs.prc, oppDefs.buffs.prc)
			var luk = oppDefs.luk
			var chr = oppDefs.chr
			var enmdef = statWithBuff(userDefs.end, userDefs.buffs.end)
			var enmagl = statWithBuff(userDefs.agl, userDefs.buffs.agl)
			var enmluk = userDefs.luk

			var movepow = parseInt(counterSkill.pow)

			var movetype = counterSkill.atktype
			var moveacc = 999
			if (counterSkill.acc)
				moveacc = counterSkill.acc;
			
			// Dizziness
			if (oppDefs.status === "dizzy") 
				moveacc -= Math.floor(moveacc/2);

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

			var dmg = genDmg(oppDefs, userDefs, counterSkill, server, null, btl);
			
			var finaltext = `${oppName}'s ${counterSkill.name} allowed them to evade & counter! `
			var rand = -7 + Math.round(Math.random() * 14)
			dmg[0] += Math.round(rand)

			// Prompts
			var result = Math.round(dmg[0]);

			if (result < 1) 
				result = 1;

			if (dmg[1] == "miss") {
				finaltext += `${userName} dodged it!`;
				trapped = false;

				if (oppDefs.missquote && oppDefs.missquote.length > 0) {
					var possibleQuote = Math.round(Math.random() * (oppDefs.missquote.length-1))
					var missQuote = `\n*${oppName}: "${oppDefs.missquote[possibleQuote]}"*`
					
					if (missQuote.includes('%ENEMY%'))
						missQuote.replace('%ENEMY%', userName)
					
					finaltext += missQuote
				}

				if (userDefs.dodgequote && userDefs.dodgequote.length > 0) {
					var possibleQuote = Math.round(Math.random() * (userDefs.dodgequote.length-1))
					var dodgeQuote = `\n*${userName}: "${userDefs.dodgequote[possibleQuote]}"*`
					
					if (dodgeQuote.includes('%ENEMY%'))
						dodgeQuote.replace('%ENEMY%', oppName)
					
					finaltext += dodgeQuote
				}
			} else if (!counterSkill.feint && (dmg[1] == "block" || dmg[1] == "repel" || repelSkill || (skillDefs.type != 'almighty' && (userDefs.makarakarn && counterSkill.atktype === "magic" || userDefs.tetrakarn && counterSkill.atktype === "physical")))) {
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
					if (dmg[1] == "superweak")
						finaltext += "<:supereffective:939053172528394252>";
					else
						finaltext += "<:effective:876899270731628584>";
				} else if (dmgtype === "resist")
					finaltext = finaltext + "<:resist:877132670784647238>";

				// Display Crits
				if (dmg[3] == true)
					finaltext += "<:crit:876905905248145448>";

				// Display Techs
				if (dmg[5] == true)
					finaltext += statusEmojis[userDefs.status];

				// Display the "damage" part of the text
				finaltext += " damage";

				if (userDefs.hp <= 0) {
					finaltext += ' and was defeated';
					userDefs.hp = 0;

					if (charFuncs.hasPassive(oppDefs, "sacrifice")) {
						oppDefs.hp = Math.min(oppDefs.maxhp, oppDefs.hp + userDefs.level)
						oppDefs.mp = Math.min(oppDefs.maxmp, oppDefs.mp + Math.floor(userDefs.level/2))
						finaltext += `, with ${oppDefs.name}'s HP being restored by ${userDefs.level} & MP restored by ${userDefs.level/2}`
					}
					
					finaltext += '!'

					if (oppDefs.killquote && oppDefs.killquote.length > 0) {
						var possibleQuote = Math.round(Math.random() * (oppDefs.killquote.length-1))
						var quote = `\n*${oppDefs.name}: "${oppDefs.killquote[possibleQuote]}"*`

						while (quote.includes('%ENEMY%'))
							quote = quote.replace('%ENEMY%', oppDefs.name);

						finaltext += quote;
					}

					if (userDefs.deathquote && userDefs.deathquote.length > 0) {
						var possibleQuote = Math.round(Math.random() * (userDefs.deathquote.length-1))
						var quote = `\n*${userDefs.name}: "${userDefs.deathquote[possibleQuote]}"*`

						if (quote.includes('%ENEMY%'))
							quote = quote.replace('%ENEMY%', oppDefs.name);
						
						finaltext += quote;
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
					finaltext += `\n${oppName} drained ${draindmg} damage.`
				}
				
				// Verse Skills
				if (userDefs.healVerse) {
					var healDmg = Math.round((dmg[0]/100)*userDefs.healVerse.healPercent)
					finaltext += `\n${userDefs.healVerse.username}'s ${userDefs.healVerse.skillname} healed ${oppName} by ${healDmg}!`
					oppDefs.hp = Math.min(oppDefs.maxhp, oppDefs.hp + healDmg) 
				}

				if (userDefs.spreadVerse && skillDefs.target === 'one') {
					var spreadDmg = Math.round((dmg[0]/100)*userDefs.spreadVerse.dmgPercent)
					finaltext += `\n${userDefs.spreadVerse.username}'s ${userDefs.spreadVerse.skillname} spread ${spreadDmg} to ${userDefs.name}'s allies!`
					
					for (const i in allySide) {
						var allyDefs = allySide[i]
						allyDefs.hp = Math.max(1, allyDefs.hp - spreadDmg)
					}
				}

				if (counterSkill.verse) {
					if (counterSkill.verse[0] === 'heal' && !userDefs.healVerse) {
						finaltext += `\nA healing aura begun surrounding ${userDefs.name}!`
						userDefs.healVerse = {
							username: oppName,
							skillname: counterSkill.name,
							turns: 3,
							healPercent: counterSkill.verse[1]
						}
					}

					if (counterSkill.verse[0] === 'power' && !userDefs.powVerse) {
						finaltext += `\nAn orange aura begun surrounding ${userDefs.name}!`
						userDefs.powVerse = {
							username: oppName,
							skillname: counterSkill.name,
							turns: 3,
							buffPercent: counterSkill.verse[1]
						}
					}

					if (counterSkill.verse[0] === 'spread' && !userDefs.spreadVerse) {
						finaltext += `\nA yellow aura begun surrounding ${userDefs.name}!`
						userDefs.spreadVerse = {
							username: oppName,
							skillname: counterSkill.name,
							turns: 3,
							dmgPercent: counterSkill.verse[1]
						}
					}
				}

				// Passives
				if (charFuncs.hasPassive(userDefs, "damagephys") && counterSkill.atktype === 'physical') {
					var skillDefs2 = charFuncs.hasPassive(userDefs, "damagephys")
					oppDefs.hp = Math.min(oppDefs.maxhp, oppDefs.hp - skillDefs2.pow)
					finaltext += ` ${oppName} was damaged by ${userName}'s ${skillDefs2.name}, taking ${skillDefs2.pow} damage!`
				}
				if (charFuncs.hasPassive(userDefs, "damagemag") && counterSkill.atktype === 'magic') {
					var skillDefs2 = charFuncs.hasPassive(userDefs, "damagemag")
					oppDefs.hp = Math.min(oppDefs.maxhp, oppDefs.hp - skillDefs2.pow)
					finaltext += ` ${oppName} was damaged by ${userName}'s ${skillDefs2.name}, taking ${skillDefs2.pow} damage!`
				}
			}
		} else {
			var userQuote
			var oppQuote
			var forceDmgType
			
			const weather = btl[server].changeweather ? btl[server].changeweather.weather : btl[server].weather
			const terrain = btl[server].changeterrain ? btl[server].changeterrain.terrain : btl[server].terrain
			
			// Resist Overwrites
			if (resistSkill && !skillDefs.feint) {
				forceDmgType = "resist"
				dmgtype = "resist";
			}

			if (skillDefs.atktype == "physical" && oppDefs.trapType && !skillDefs.feint) {
				dmgtype = "resist";
				trapped = true;
				
				forceDmgType = "resist"
			}

			// Affinity Cutter & Slicer
			for (const i in oppDefs.skills) {
				var oppSkill = skillFile[oppDefs.skills[i]]
				
				if (oppSkill.passive) {
					if (oppSkill.affinitycutter) {
						var randChance = Math.random()*100
						
						if (randChance <= oppSkill.pow && (dmgtype === "resist" || dmgtype2 === "block")) {
							finaltext += `\n${userName}'s ${oppSkill.name} allowed them to cut through resist & block affinities!`
							dmgtype = "normal"
							forceDmgType = "normal"
						}
					} else if (oppSkill.affinityslicer) {
						var randChance = Math.random()*100
						
						if (randChance <= oppSkill.pow && (dmgtype === "resist" || dmgtype === "block" || dmgtype === "repel" || dmgtype === "drain")) {
							finaltext += `\n${userName}'s ${oppSkill.name} allowed them to cut through resist, block, repel and drain affinities!`
							
							if (dmgtype === "resist") {
								dmgtype = "normal"
								forceDmgType = "normal"
							} else {
								dmgtype = "resist"
								forceDmgType = "resist"
							}
						}
					}
				}
			}
			
			var mpSteal = 0
			if (skillDefs.takemp)
				mpSteal = skillDefs.takemp*skillDefs.hits;
			
			// Damage Check
			const dmgCheck = getAffinity(oppDefs, skillDefs.type);

			if (!skillDefs.hits || skillDefs.hits == 1) {
				var dmg = genDmg(userDefs, oppDefs, skillDefs, server, forceDmgType, btl)
				var finaltext = ``
				
				var rand = -7 + Math.round(Math.random() * 14)
				dmg[0] += rand;
				
				fieldMod(dmg, weather, terrain, skillDefs)
				
				var ignoreDmgTxt = false

				// Prompts
				var result = Math.round(dmg[0]);
				if (result < 1) { result = 1 }

				if (dmg[1] == "miss") {
					finaltext += `${oppName} dodged it!`
					trapped = false;

					if (userDefs.missquote && userDefs.missquote.length > 0) {
						var possibleQuote = Math.round(Math.random() * (userDefs.missquote.length-1))
						userQuote = `\n*${userName}: "${userDefs.missquote[possibleQuote]}"*`
						
						if (userQuote.includes('%ENEMY%'))
							userQuote.replace('%ENEMY%', oppName)
					}

					if (oppDefs.dodgequote && oppDefs.dodgequote.length > 0) {
						var possibleQuote = Math.round(Math.random() * (oppDefs.dodgequote.length-1))
						oppQuote = `\n*${oppName}: "${oppDefs.dodgequote[possibleQuote]}"*`
					
						if (oppQuote.includes('%ENEMY%'))
							oppQuote.replace('%ENEMY%', userName)
					}
				} else if (dmg[1] == "repel") {
					finaltext += `${oppName} repelled it!\n`


					skillDefs.acc = 999
					var repelDmg = genDmg(userDefs, userDefs, skillDefs, server, null, btl)
					
					var rand = -7 + Math.round(Math.random() * 14)
					repelDmg[0] += rand;
					
					fieldMod(repelDmg, weather, terrain, skillDefs)
					
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
					
					ignoreDmgTxt = true
				} else if (repelSkill) {
					finaltext += `${oppName}'s ${repelSkill.name} repels the attack!\n`;

					skillDefs.acc = 999
					var repelDmg = genDmg(userDefs, userDefs, skillDefs, server, null, btl)
					
					var rand = -7 + Math.round(Math.random() * 14)
					repelDmg[0] += rand;
					
					fieldMod(repelDmg, weather, terrain, skillDefs)
					
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
					ignoreDmgTxt = true
				} else if (!skillDefs.feint && skillDefs.type != 'almighty' && (oppDefs.makarakarn && skillDefs.atktype === "magic" || oppDefs.tetrakarn && skillDefs.atktype === "physical")) {
					if (oppDefs.makarakarn && skillDefs.atktype === "magic") {
						finaltext += `${oppName}'s ${oppDefs.makarakarn} repels the magical attack, but gets destroyed\n`;
						delete oppDefs.makarakarn
					} else if (oppDefs.tetrakarn && skillDefs.atktype === "physical") {
						finaltext += `${oppName}'s ${oppDefs.tetrakarn} repels the physical attack, but gets destroyed!\n`;
						delete oppDefs.tetrakarn
					}

					skillDefs.acc = 999

					var repelDmg = genDmg(userDefs, userDefs, skillDefs, server, null, btl)
					var rand = -7 + Math.round(Math.random() * 14)
					repelDmg[0] += rand;
					
					fieldMod(repelDmg, weather, terrain, skillDefs)
					
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
					ignoreDmgTxt = true
				} else if (dmg[1] == "block") {
					finaltext += `${oppName} blocked it!`
					
					if (oppDefs.blockquote && oppDefs.blockquote.length > 0) {
						var possibleQuote = Math.round(Math.random() * (oppDefs.blockquote.length-1))
						oppQuote = `\n*${oppDefs.name}: "${oppDefs.blockquote[possibleQuote]}"*`
					}

					ignoreDmgTxt = true
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

				var targDefs = oppDefs
				if (dmgCheck === 'repel' || repelSkill || !skillDefs.feint && skillDefs.type != 'almighty' && (oppDefs.makarakarn && skillDefs.atktype === "magic" || oppDefs.tetrakarn && skillDefs.atktype === "physical"))
					targDefs = userDefs

				// Display Weakness
				if (dmg[1] !== "miss" && dmg[1] !== "block" && dmg[1] !== "drain") {
					if (dmg[2] == true) {
						if (dmg[1] == "superweak")
							finaltext += "<:supereffective:939053172528394252>";
						else
							finaltext += "<:effective:876899270731628584>";

						if (doOneMores(server) && !oppDefs.down) {
							oppDefs.down = true
							embedText.oneMore = true
						}
					} else if (dmgtype === "resist")
						finaltext += "<:resist:877132670784647238>";

					// Display Crits
					if (dmg[3] == true) {
						finaltext += "<:crit:876905905248145448>";

						if (doOneMores(server) && !oppDefs.down) {
							oppDefs.down = true
							embedText.oneMore = true
						}
					}

					// Display Techs
					if (dmg[5] == true)
						finaltext += statusEmojis[oppDefs.status];

					// Display the "damage" part of the text
					if (ignoreDmgTxt == false)
						finaltext += " damage";

					// Critical Quotes
					if (dmg[3] == true && userDefs.critquote && userDefs.critquote.length > 0) {
						var possibleQuote = Math.round(Math.random() * (userDefs.critquote.length-1))
						
						var critQuote = `\n*${userDefs.name}: "${userDefs.critquote[possibleQuote]}"*`
						if (critQuote.includes('%ALLY%'))
							critQuote = critQuote.replace('%ALLY%', allySide[Math.round(Math.random() * (allySide.length-1))].name);
						if (critQuote.includes('%ENEMY%'))
							critQuote = critQuote.replace('%ENEMY%', knowsEnemy(oppDefs.name, server) ? oppDefs.name : 'Monster');

						if (userQuote) {
							userQuote += critQuote
						} else {
							userQuote = critQuote
						}
					}

					if (oppDefs.hp <= 0 && dmg[1] != "repel") {
						finaltext += ' and was defeated';
						oppDefs.hp = 0;

						if (charFuncs.hasPassive(userDefs, "sacrifice")) {
							userDefs.hp = Math.min(userDefs.maxhp, userDefs.hp + oppDefs.level)
							userDefs.mp = Math.min(userDefs.maxmp, userDefs.mp + Math.floor(oppDefs.level/2))
							finaltext += `, with ${userDefs.name}'s HP being restored by ${oppDefs.level} & MP restored by ${oppDefs.level/2}`
						}

						finaltext += '!'

						if (userDefs.killquote && userDefs.killquote.length > 0) {
							var possibleQuote = Math.round(Math.random() * (userDefs.killquote.length-1))
							userQuote = `\n*${userDefs.name}: "${userDefs.killquote[possibleQuote]}"*`

							while (userQuote.includes('%ENEMY%'))
								userQuote = userQuote.replace('%ENEMY%', oppDefs.name);
						}

						if (oppDefs.deathquote && oppDefs.deathquote.length > 0) {
							var possibleQuote = Math.round(Math.random() * (oppDefs.deathquote.length-1))
							oppQuote = `\n*${oppDefs.name}: "${oppDefs.deathquote[possibleQuote]}"*`

							if (oppQuote.includes('%ENEMY%'))
								oppQuote = oppQuote.replace('%ENEMY%', userDefs.name);
						}

						for (const i in opposingSide) {
							var allyDefs = opposingSide[i]
							if (oppDefs.trust[allyDefs.name] && oppDefs.trust[allyDefs.name].level >= 12) {
								if (allyDefs.hp > 0 && allyDefs.allydeathquote && allyDefs.allydeathquote.length > 0) {
									var possibleQuote = Math.round(Math.random() * (allyDefs.allydeathquote.length-1))
									var allyQuote = `\n*${allyDefs.name}: "${allyDefs.allydeathquote[possibleQuote]}"*`
									if (allyQuote.includes('%ALLY%'))
										allyQuote = allyQuote.replace('%ALLY%', oppDefs.name);
									if (allyQuote.includes('%ENEMY%'))
										allyQuote = allyQuote.replace('%ENEMY%', userDefs.name);
									
									oppQuote += allyQuote
								}
							}
						}
					} else if (userDefs.hp <= 0 && dmg[1] == "repel") {
						finaltext += ' and was defeated';
						userDefs.hp = 0;

						if (charFuncs.hasPassive(oppDefs, "sacrifice")) {
							oppDefs.hp = Math.min(oppDefs.maxhp, oppDefs.hp + userDefs.level)
							oppDefs.mp = Math.min(oppDefs.maxmp, oppDefs.mp + Math.floor(userDefs.level/2))
							finaltext += `, with ${oppDefs.name}'s HP being restored by ${userDefs.level} & MP restored by ${userDefs.level/2}`
						}
						
						finaltext += '!'

						if (oppDefs.killquote && oppDefs.killquote.length > 0) {
							var possibleQuote = Math.round(Math.random() * (oppDefs.killquote.length-1))
							oppQuote = `\n*${oppDefs.name}: "${oppDefs.killquote[possibleQuote]}"*`
						}

						if (userDefs.deathquote && userDefs.deathquote.length > 0) {
							var possibleQuote = Math.round(Math.random() * (userDefs.deathquote.length-1))
							userQuote = `\n*${userDefs.name}: "${userDefs.deathquote[possibleQuote]}"*`

							if (userQuote.includes('%ENEMY%'))
								userQuote = userQuote.replace('%ENEMY%', oppDefs.name);
						}

						for (const i in allySide) {
							var allyDefs = allySide[i]
							if (userDefs.trust[allyDefs.name] && userDefs.trust[allyDefs.name].level >= 12) {
								if (allyDefs.hp > 0 && allyDefs.allydeathquote && allyDefs.allydeathquote.length > 0) {
									var possibleQuote = Math.round(Math.random() * (allyDefs.allydeathquote.length-1))
									var allyQuote = `\n*${allyDefs.name}: "${allyDefs.allydeathquote[possibleQuote]}"*`
									if (allyQuote.includes('%ALLY%'))
										allyQuote = allyQuote.replace('%ALLY%', userDefs.name);
									if (allyQuote.includes('%ENEMY%'))
										allyQuote = allyQuote.replace('%ENEMY%', oppDefs.name);
									
									oppQuote += allyQuote
								}
							}
						}
					} else {
						finaltext += "!";
						if (dmg[4] == true && targDefs.status == "none" && skillDefs.status) {
							if (typeof skillDefs.status == "object") {
								var possibleStatus = []
								for (const i in skillDefs.status)
									possibleStatus.push(skillDefs.status[i]);
								
								if (possibleStatus.length > 0) 
									finaltext += " " + inflictStatusFromText(targDefs, possibleStatus[Math.round(Math.random() * (possibleStatus.length-1))]);
							} else {
								finaltext += " " + inflictStatus(targDefs, skillDefs)
							}
						}
					}

					// Drain Moves
					if (skillDefs.drain && userDefs.id != targDefs.id) {
						const draindmg = Math.round(dmg[0] / skillDefs.drain)
						userDefs.hp = Math.min(userDefs.maxhp, userDefs.hp + draindmg)
						finaltext = finaltext + ` ${userName} drained ${draindmg} damage.`
					}

					// Verse Skills
					if (targDefs.healVerse && !skillDefs.limitbreak) {
						var healDmg = Math.round((dmg[0]/100)*targDefs.healVerse.healPercent)
						finaltext += `\n${targDefs.healVerse.username}'s ${targDefs.healVerse.skillname} healed ${userName} by ${healDmg}!`
						userDefs.hp = Math.min(userDefs.maxhp, userDefs.hp + healDmg)
					}

					if (targDefs.spreadVerse && skillDefs.target === 'one') {
						var spreadDmg = Math.round((dmg[0]/100)*targDefs.spreadVerse.dmgPercent)
						finaltext += `\n${targDefs.spreadVerse.username}'s ${targDefs.spreadVerse.skillname} spread ${spreadDmg} to ${targDefs.name}'s allies!`

						for (const i in opposingSide) {
							var allyDefs = opposingSide[i]
							allyDefs.hp = Math.max(1, allyDefs.hp - spreadDmg)
						}
					}

					if (skillDefs.verse) {
						if (skillDefs.verse[0] === 'heal' && !targDefs.healVerse) {
							finaltext += `\nA healing aura begun surrounding ${targDefs.name}!`
							targDefs.healVerse = {
								username: userName,
								skillname: skillDefs.name,
								turns: 3,
								healPercent: skillDefs.verse[1]
							}
						}
						
						if (skillDefs.verse[0] === 'power' && !targDefs.powVerse) {
							finaltext += `\nA orange aura begun surrounding ${targDefs.name}!`
							targDefs.powVerse = {
								username: userName,
								skillname: skillDefs.name,
								turns: 3,
								buffPercent: skillDefs.verse[1]
							}
						}

						if (skillDefs.verse[0] === 'spread' && !targDefs.spreadVerse) {
							finaltext += `\nA yellow aura begun surrounding ${targDefs.name}!`
							targDefs.spreadVerse = {
								username: userName,
								skillname: skillDefs.name,
								turns: 3,
								dmgPercent: skillDefs.verse[1]
							}
						}
					}

					// Passives
					if (charFuncs.hasPassive(targDefs, "damagephys") && skillDefs.atktype === 'physical') {
						var skillDefs2 = charFuncs.hasPassive(targDefs, "damagephys")
						userDefs.hp = Math.min(userDefs.maxhp, userDefs.hp - skillDefs2.pow)
						finaltext += ` ${userName} was damaged by ${oppName}'s ${skillDefs2.name}, taking ${skillDefs2.pow} damage!`
					}
					if (charFuncs.hasPassive(targDefs, "damagemag") && skillDefs.atktype === 'magic') {
						var skillDefs2 = charFuncs.hasPassive(targDefs, "damagemag")
						userDefs.hp = Math.min(userDefs.maxhp, userDefs.hp - skillDefs2.pow)
						finaltext += ` ${userName} was damaged by ${oppName}'s ${skillDefs2.name}, taking ${skillDefs2.pow} damage!`
					}

					if (targDefs.shield && !skillDefs.feint) {
						finaltext += `\n${oppName}'s protection was destroyed!`
						delete targDefs.shield
						delete targDefs.powerShield
					}

					// Limit Break
					if (dmg[1] != "repel" && doLimitBreaks(server)) {
						var lbGain = [0, Math.floor(result / 16) ]
						if (skillDefs.target === "allopposing" || skillDefs.target === "allallies") {
							lbGain[0] += Math.floor(result / 8)
						} else if (skillDefs.target === "everyone") {
							lbGain[0] += Math.floor(result / 16)
						} else {
							lbGain[0] += Math.floor(result / 4)
						}

						if (targDefs.powVerse)
							lbGain[0] += Math.round((lbGain[0]/100)*userDefs.powVerse.buffPercent)
						if (userDefs.powVerse)
							lbGain[1] += Math.round((lbGain[1]/100)*userDefs.powVerse.buffPercent)

						userDefs.lb += lbGain[0]
						targDefs.lb += lbGain[1]
					}

					if (charFuncs.hasPassive(targDefs, "alterpain") && targDefs.hp >= 0 && !skillDefs.feint) {
						var painDefs = charFuncs.hasPassive(targDefs, "alterpain");

						var mpGain = Math.round((result/100)*painDefs.pow);		
						targDefs.mp = Math.min(targDefs.maxmp, targDefs.mp+mpGain);

						finaltext += `\n${targDefs.name}'s ${painDefs.name} allowed them to gain ${mpGain}MP back!`;
					}
				}
			} else {
				var finaltext = ``;

				if (dmgCheck == "miss") {
					finaltext = `${oppName} dodged it!`;
					trapped = false;

					if (userDefs.missquote && userDefs.missquote.length > 0) {
						var possibleQuote = Math.round(Math.random() * (userDefs.missquote.length-1))
						userQuote = `\n*${userName}: "${userDefs.missquote[possibleQuote]}"*`
						
						if (userQuote.includes('%ENEMY%'))
							userQuote.replace('%ENEMY%', oppName)
					}

					if (oppDefs.dodgequote && oppDefs.dodgequote.length > 0) {
						var possibleQuote = Math.round(Math.random() * (oppDefs.dodgequote.length-1))
						oppQuote = `\n*${oppName}: "${oppDefs.dodgequote[possibleQuote]}"*`
					
						if (oppQuote.includes('%ENEMY%'))
							oppQuote.replace('%ENEMY%', userName)
					}
				} else if (dmgCheck == "repel") {
					finaltext = `${oppName} repelled it! `;

					var repelDmg = genDmg(userDefs, userDefs, skillDefs, server, null, btl)
					if (repelDmg[1] === "block" || repelDmg[1] === "repel") {
						finaltext += `${userName} blocked it!`;
						dmgCheck = "block"
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

					var repelDmg = genDmg(userDefs, userDefs, skillDefs, server, null, btl)
					if (repelDmg[1] === "block" || repelDmg[1] === "repel") {
						finaltext += `${userName} blocked it!`;
						dmgCheck = "block"
					} else if (repelDmg[1] === "drain") {
						finaltext += `${userName} drained `;
					} else {
						finaltext += `${userName} took `;
					}
					
					if (oppDefs.repelquote && oppDefs.repelquote.length > 0) {
						var possibleQuote = Math.round(Math.random() * (oppDefs.repelquote.length-1))
						oppQuote = `\n*${oppDefs.name}: "${oppDefs.repelquote[possibleQuote]}"*`
					}
				} else if (!skillDefs.feint && skillDefs.type != 'almighty' && (oppDefs.makarakarn && skillDefs.atktype === "magic" || oppDefs.tetrakarn && skillDefs.atktype === "physical")) {
					if (oppDefs.makarakarn && skillDefs.atktype === "magic") {
						finaltext += `${oppName}'s ${oppDefs.makarakarn} repels the magical attack, but gets destroyed!`;
						delete oppDefs.makarakarn
					} else if (oppDefs.tetrakarn && skillDefs.atktype === "physical") {
						finaltext += `${oppName}'s ${oppDefs.tetrakarn} repels the physical attack, but gets destroyed!`;
						delete oppDefs.tetrakarn
					}

					var repelDmg = genDmg(userDefs, userDefs, skillDefs, server, null, btl)
					if (repelDmg[1] === "block" || repelDmg[1] === "repel") {
						finaltext += `${userName} blocked it!`;
						dmgCheck = "block"
					} else if (repelDmg[1] === "drain") {
						finaltext += `${userName} drained `;
					} else {
						finaltext += `${userName} took `;
					}
					
					if (oppDefs.repelquote && oppDefs.repelquote.length > 0) {
						var possibleQuote = Math.round(Math.random() * (oppDefs.repelquote.length-1))
						oppQuote = `\n*${oppDefs.name}: "${oppDefs.repelquote[possibleQuote]}"*`
					}
				} else if (dmgCheck == "block") {
					finaltext = `${oppName} blocked it!`;
					
					if (oppDefs.blockquote && oppDefs.blockquote.length > 0) {
						var possibleQuote = Math.round(Math.random() * (oppDefs.blockquote.length-1))
						oppQuote = `\n*${oppDefs.name}: "${oppDefs.blockquote[possibleQuote]}"*`
					}
				} else if (dmgCheck == "drain") {
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
				if (dmgCheck != 'repel' && !repelSkill) {
					for (let i = 2; i <= skillDefs.hits; i++) {
						if (missCheck(prc, enmagl, moveacc)) {
							hitCount++;
						} else {
							break
						}
					}
				}
				
				if (dmgCheck != "block" && dmgCheck != "miss") {
					var total = 0;
					var resulttext = ``;
					
					var hasCrit = false;
					var hasStatus = false;

					for (let i = 1; i <= hitCount; i++) {
						skillDefs.acc = 999

						var dmg = genDmg(userDefs, oppDefs, skillDefs, server, forceDmgType, btl)

						var rand = -7 + Math.round(Math.random() * 14)
						dmg[0] += Math.round(rand);
						
						fieldMod(dmg, weather, terrain, skillDefs)

						// Prompts
						var result = Math.round(dmg[0]);
						
						if (result < 1)
							result = 1;

						if (dmgCheck == "repel" || repelSkill || (skillDefs.type != 'almighty' && (oppDefs.makarakarn && skillDefs.atktype === "magic" || oppDefs.tetrakarn && skillDefs.atktype === "physical")) && !skillDefs.feint) {
							var repelDmg = genDmg(userDefs, userDefs, skillDefs, server, null, btl)
							var rand = -7 + Math.round(Math.random() * 14)
							repelDmg[0] += rand;
							fieldMod(repelDmg, weather, terrain, skillDefs)
							
							result = repelDmg[0];

							if (repelDmg[1] === "block" || repelDmg[1] === "repel") {
								// Do nothing
							} else if (repelDmg[1] === "drain") {
								userDefs.hp = Math.min(userDefs.maxhp, userDefs.hp + result)
							} else {
								userDefs.hp = Math.max(0, userDefs.hp - result)
							}
						} else if (dmgCheck == "drain") {
							oppDefs.hp = Math.min(oppDefs.maxhp, oppDefs.hp + result)
						} else {
							oppDefs.hp = Math.max(0, oppDefs.hp - result)
							oppDefs.guard = false
						}
						
						if ((dmg[2] || dmg[3]) && doOneMores(server) && !oppDefs.down) {
							oppDefs.down = true
							embedText.oneMore = true
						}

						var effective = ''
						if (dmg[2]) effective = '<:effective:876899270731628584>';
						if (dmg[1] == 'resist') effective = '<:resist:877132670784647238>';

						// Display Crits
						if (dmg[3])
							hasCrit = true;
						
						// Inflict Statusses
						if (dmg[4])
							hasStatus = true;

						// Display Techs
						if (dmg[5] == true)
							effective += statusEmojis[oppDefs.status];

						resulttext += `${result}${effective}${dmg[3] ? "<:crit:876905905248145448>" : ""}`;

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
					if (dmgCheck !== "miss" && dmgCheck !== "drain" && dmgCheck !== "block") {
						finaltext = finaltext + " damage";

						// Weakness Quotes & Critical Quotes
						if (dmgCheck == 'weak' || dmgCheck == 'superweak') {
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
						} else if (dmgCheck === "resist") {
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
						
						if (hasCrit == true && userDefs.critquote && userDefs.critquote.length > 0) {
							var possibleQuote = Math.round(Math.random() * (userDefs.critquote.length-1))

							var critQuote = `\n*${userDefs.name}: "${userDefs.critquote[possibleQuote]}"*`
							if (critQuote.includes('%ALLY%'))
								critQuote = critQuote.replace('%ALLY%', allySide[Math.round(Math.random() * (allySide.length-1))].name);
							if (critQuote.includes('%ENEMY%'))
								critQuote = critQuote.replace('%ENEMY%', knowsEnemy(oppDefs.name, server) ? oppDefs.name : 'Monster');

							if (userQuote) {
								userQuote += critQuote
							} else {
								userQuote = critQuote
							}
						}

						var targDefs = oppDefs
						if (dmgCheck === 'repel' || repelSkill)
							targDefs = userDefs

						if (oppDefs.hp <= 0 && dmgCheck != "repel") {
							finaltext += ' and was defeated';
							oppDefs.hp = 0;

							if (charFuncs.hasPassive(userDefs, "sacrifice")) {
								userDefs.hp = Math.min(userDefs.maxhp, userDefs.hp + oppDefs.level)
								userDefs.mp = Math.min(userDefs.maxmp, userDefs.mp + Math.floor(oppDefs.level/2))
								finaltext += `, with ${userDefs.name}'s HP being restored by ${oppDefs.level} & MP restored by ${oppDefs.level/2}`
							}
							
							finaltext += '!'

							if (userDefs.killquote && userDefs.killquote.length > 0) {
								var possibleQuote = Math.round(Math.random() * (userDefs.killquote.length-1))
								userQuote = `\n*${userDefs.name}: "${userDefs.killquote[possibleQuote]}"*`
							}

							if (oppDefs.deathquote && oppDefs.deathquote.length > 0) {
								var possibleQuote = Math.round(Math.random() * (oppDefs.deathquote.length-1))
								oppQuote = `\n*${oppDefs.name}: "${oppDefs.deathquote[possibleQuote]}"*`

								if (oppQuote.includes('%ENEMY%'))
									oppQuote = oppQuote.replace('%ENEMY%', userDefs.name);
							}

							for (const i in opposingSide) {
								var allyDefs = opposingSide[i]
								if (oppDefs.trust[allyDefs.name] && oppDefs.trust[allyDefs.name].level >= 12) {
									if (allyDefs.hp > 0 && allyDefs.allydeathquote && allyDefs.allydeathquote.length > 0) {
										var possibleQuote = Math.round(Math.random() * (allyDefs.allydeathquote.length-1))
										var allyQuote = `\n*${allyDefs.name}: "${allyDefs.allydeathquote[possibleQuote]}"*`
										if (allyQuote.includes('%ALLY%'))
											allyQuote = allyQuote.replace('%ALLY%', oppDefs.name);
										if (allyQuote.includes('%ENEMY%'))
											allyQuote = allyQuote.replace('%ENEMY%', userDefs.name);
										
										oppQuote += allyQuote
									}
								}
							}
						} else if (userDefs.hp <= 0 && dmgCheck == "repel") {
							finaltext += ' and was defeated';
							userDefs.hp = 0;

							if (charFuncs.hasPassive(oppDefs, "sacrifice")) {
								oppDefs.hp = Math.min(oppDefs.maxhp, oppDefs.hp + userDefs.level)
								oppDefs.mp = Math.min(oppDefs.maxmp, oppDefs.mp + Math.floor(userDefs.level/2))
								finaltext += `, with ${oppDefs.name}'s HP being restored by ${userDefs.level} & MP restored by ${userDefs.level/2}`
							}
							
							finaltext += '!'

							if (oppDefs.killquote && oppDefs.killquote.length > 0) {
								var possibleQuote = Math.round(Math.random() * (oppDefs.killquote.length-1))
								oppQuote = `\n*${oppDefs.name}: "${oppDefs.killquote[possibleQuote]}"*`
							}

							if (userDefs.deathquote && userDefs.deathquote.length > 0) {
								var possibleQuote = Math.round(Math.random() * (userDefs.deathquote.length-1))
								userQuote = `\n*${userDefs.name}: "${userDefs.deathquote[possibleQuote]}"*`
							}

							for (const i in allySide) {
								var allyDefs = allySide[i]
								if (userDefs.trust[allyDefs.name] && userDefs.trust[allyDefs.name].level >= 12) {
									if (allyDefs.hp > 0 && allyDefs.allydeathquote && allyDefs.allydeathquote.length > 0) {
										var possibleQuote = Math.round(Math.random() * (allyDefs.allydeathquote.length-1))
										var allyQuote = `\n*${allyDefs.name}: "${allyDefs.allydeathquote[possibleQuote]}"*`
										if (allyQuote.includes('%ALLY%'))
											allyQuote = allyQuote.replace('%ALLY%', userDefs.name);
										if (allyQuote.includes('%ENEMY%'))
											allyQuote = allyQuote.replace('%ENEMY%', oppDefs.name);
										
										oppQuote += allyQuote
									}
								}
							}
						} else {
							finaltext = finaltext + "!";
							if (hasStatus && targDefs.status != "none" && skillDefs.status) {
								if (typeof skillDefs.status == "object") {
									var possibleStatus = []
									for (const i in skillDefs.status)
										possibleStatus.push(skillDefs.status[i]);
									
									if (possibleStatus.length > 0) 
										finaltext += " " + inflictStatusFromText(targDefs, possibleStatus[Math.round(Math.random() * (possibleStatus.length-1))]);
								} else
									finaltext += " " + inflictStatus(targDefs, skillDefs);
							}
						}

						// Drain Moves
						if (skillDefs.drain && userDefs.id != targDefs.id) {
							const draindmg = Math.round(total / skillDefs.drain)
							userDefs.hp = Math.min(userDefs.maxhp, userDefs.hp + draindmg)
							finaltext += ` ${userName} drained ${draindmg} damage.`
						}

						// Verse Skills
						if (targDefs.healVerse && !skillDefs.limitbreak) {
							var healDmg = Math.round((total/100)*targDefs.healVerse.healPercent)
							finaltext += `\n${targDefs.healVerse.username}'s ${targDefs.healVerse.skillname} healed ${userName} by ${healDmg}!`
							userDefs.hp = Math.min(userDefs.maxhp, userDefs.hp + healDmg)
						}

						if (targDefs.spreadVerse && skillDefs.target === 'one') {
							var spreadDmg = Math.round((total/100)*targDefs.spreadVerse.dmgPercent)
							finaltext += `\n${targDefs.spreadVerse.username}'s ${targDefs.spreadVerse.skillname} spread ${spreadDmg} to ${targDefs.name}'s allies!`

							for (const i in opposingSide) {
								var allyDefs = opposingSide[i]
								allyDefs.hp = Math.max(1, allyDefs.hp - spreadDmg)
							}
						}

						if (skillDefs.verse) {
							if (skillDefs.verse[0] === 'heal' && !targDefs.healVerse) {
								finaltext += `\nA healing aura begun surrounding ${targDefs.name}!`
								targDefs.healVerse = {
									username: userName,
									skillname: skillDefs.name,
									turns: 3,
									healPercent: skillDefs.verse[1]
								}
							}

							if (skillDefs.verse[0] === 'power' && !targDefs.healVerse) {
								finaltext += `\nAn orange aura begun surrounding ${targDefs.name}!`
								targDefs.powVerse = {
									username: userName,
									skillname: skillDefs.name,
									turns: 3,
									buffPercent: skillDefs.verse[1]
								}
							}

							if (skillDefs.verse[0] === 'spread' && !targDefs.spreadVerse) {
								finaltext += `\nA yellow aura begun surrounding ${targDefs.name}!`
								targDefs.spreadVerse = {
									username: userName,
									skillname: skillDefs.name,
									turns: 3,
									dmgPercent: skillDefs.verse[1]
								}
							}
						}

						// Passives
						if (charFuncs.hasPassive(targDefs, "damagephys") && skillDefs.atktype === 'physical') {
							var skillDefs2 = charFuncs.hasPassive(targDefs, "damagephys")
							userDefs.hp = Math.min(userDefs.maxhp, userDefs.hp - skillDefs2.pow)
							finaltext += ` ${userName} was damaged by ${oppName}'s ${skillDefs2.name}, taking ${skillDefs2.pow} damage!`
						}
						if (charFuncs.hasPassive(targDefs, "damagemag") && skillDefs.atktype === 'magic') {
							var skillDefs2 = charFuncs.hasPassive(targDefs, "damagemag")
							userDefs.hp = Math.min(userDefs.maxhp, userDefs.hp - skillDefs2.pow)
							finaltext += ` ${userName} was damaged by ${oppName}'s ${skillDefs2.name}, taking ${skillDefs2.pow} damage!`
						}

						if (targDefs.shield && !skillDefs.feint) {
							finaltext += `\n${targDefs.name}'s protection was destroyed!`
							delete targDefs.shield
							delete targDefs.powerShield
						}
						
						// Limit Break
						if (dmgCheck != "repel" && doLimitBreaks(server)) {
							var lbGain = [0, Math.floor(total / 32)]
							if (skillDefs.target === "allopposing" || skillDefs.target === "allallies") {
								lbGain[0] += Math.floor(total / 32)
							} else if (skillDefs.target === "everyone") {
								lbGain[0] += Math.floor(total / 64)
							} else {
								lbGain[0] += Math.floor(total / 16)
							}

							if (targDefs.powVerse)
								lbGain[0] += Math.round((lbGain[0]/100)*userDefs.powVerse.buffPercent)
							if (userDefs.powVerse)
								lbGain[1] += Math.round((lbGain[1]/100)*userDefs.powVerse.buffPercent)

							userDefs.lb += lbGain[0]
							targDefs.lb += lbGain[1]
						}

						if (charFuncs.hasPassive(targDefs, "alterpain") && targDefs.hp >= 0 && !skillDefs.feint) {
							var painDefs = charFuncs.hasPassive(targDefs, "alterpain");

							var mpGain = Math.round((total/100)*painDefs.pow);		
							targDefs.mp = Math.min(targDefs.maxmp, targDefs.mp+mpGain);

							finaltext += `\n${targDefs.name}'s ${painDefs.name} allowed them to gain ${mpGain}MP back!`;
						}
					}
				}
			}
			
			if (resistSkill)
				finaltext += `\n${oppName}'s ${resistSkill} halved the power of the skill.`;
			
			if (extraHit)
				finaltext += `\n${userName}'s ${extraHit} managed to hit an extra time!`;
			
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

			if (userQuote) finaltext += userQuote;
			if (oppQuote) finaltext += oppQuote;
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

		if (mpSteal > 0) {
			userDefs.mp += mpSteal
			if (userDefs.mp > userDefs.maxmp) userDefs.mp = userDefs.maxmp;
			finaltext += `\n${userName} managed to steal ${mpSteal}MP from ${oppName}!`;
		}
		
		if (skillDefs.steal) {
			var lootPath = `${dataPath}/Loot/lootTables-${server}.json`
			var lootRead = fs.readFileSync(lootPath, {flag: 'as+'});
			var lootFile = JSON.parse(lootRead);

			var stealPercent = Math.round(Math.random()*100)
			var stealChance = skillDefs.steal - Math.round((oppDefs.luk-userDefs.luk)/2)

			console.log(`StealCheck: ${stealPercent} <= ${stealChance}?`);
			if (stealPercent <= stealChance && lootFile[oppDefs.itemLoot]) {
				var items = lootFile[oppDefs.itemLoot].items;
				var itemName = items[Math.round(Math.random() * items.length-1)]

				finaltext += ` ${userName} managed to get their hands on ${oppName}'s ${itemName}!`

				var partyDefs = btl[server].parties[btl[server].battleteam];
				if (charFuncs.isOpposingSide(userDefs))
					partyDefs = btl[server].parties[btl[server].battleteam2];
	
				if (!partyDefs.items[itemName])
					partyDefs.items[itemName] = 1;
				else
					partyDefs.items[itemName] += 1;
			}
		}

		if (charFuncs.hasPassive(oppDefs, "endure") && oppDefs.hp <= 0 && !skillDefs.feint) {
			var endDefs = charFuncs.hasPassive(oppDefs, "endure")
			if (endDefs.pow >= 999) {
				finaltext += `\n\n...But ${oppDefs.name} endures the attack!`;
				oppDefs.hp = 1;
			} else {
				if (!oppDefs.endured) {
					finaltext += `\n\n...But ${oppDefs.name} endures the attack!`;
					oppDefs.hp = 1;
				}
			}
		}

		embedText.targetText = `${userName} => ${oppName}`
		embedText.attackText = `${userName} used ${skillDefs.name} on ${oppName}!`
		embedText.resultText = `${finaltext}`
	}

	/*
	if (useEnergy)
		useCost(userDefs, skillDefs);
	*/
	
	return embedText
}

function meleeAttack(userDefs, enmDefs, server, rage, btl) {
	const embedText = {
		targetText: "",
		attackText: "",
		resultText: "",
		oneMore: false
	}
	
	var userName = userDefs.name
	var enmName = enmDefs.name
	
    var itemPath = dataPath+'/items.json'
    var itemRead = fs.readFileSync(itemPath);
    var itemFile = JSON.parse(itemRead);

	// Weaknesses and shit
	var dmgtype = getAffinity(enmDefs, userDefs.melee[1])
	
	const skillPath = dataPath+'/skills.json'
	const skillRead = fs.readFileSync(skillPath);
	const skillFile = JSON.parse(skillRead);
	
	// Resisting Passives
	var repelSkill = null
	var counterSkill = null
	var resistSkill = null
	var trapped = false
	for (const i in enmDefs.skills) {
		const skillDefs = skillFile[enmDefs.skills[i]]
	
		if (skillDefs && skillDefs.type && skillDefs.type == 'passive') {
			if (skillDefs.passive === "wonderguard" && dmgtype != "weak" && dmgtype != "superweak") {
				embedText.targetText = `${userName} => ${enmDefs.name}`
				embedText.attackText = `${userName} used ${userDefs.melee.name}!`
				embedText.resultText = `${enmDefs.name}'s ${skillDefs.name} made them immune to the attack!`

				return embedText
			}
		}
	}

	// Damage.
	const skillDefs = {
		name: userDefs.melee.name ? userDefs.melee.name : "Strike Attack",
		pow: rage ? userDefs.melee.pow*2 : userDefs.melee.pow,
		acc: userDefs.melee.acc ? userDefs.melee.acc : 95,
		crit: userDefs.melee.crit ? userDefs.melee.crit : 15,
		type: userDefs.melee.type ? userDefs.melee.type : movetype,
		status: userDefs.melee.status ? userDefs.melee.status : "none",
		statuschance: userDefs.melee.statuschance ? userDefs.melee.statuschance : 0,
		atktype: userDefs.melee.atktype ? userDefs.melee.atktype : "physical",
		target: "one",
		affinitypow: userDefs.melee[4] ? userDefs.melee[4] : 0,
		melee: true
	};
	
	if (userDefs.rageSoul)
		skillDefs.pow = Math.round(skillDefs.pow*2.2)
	
	if (charFuncs.hasPassive(userDefs, "magicmelee"))
		skillDefs.atktype = 'magic'
	
	if (charFuncs.hasPassive(userDefs, "attackall"))
		skillDefs.target = 'allopposing'

	if (skillDefs.target === 'allopposing') {
		var damages = [];
		var finaltext = ``;
		var embedTexts = [];
		
		var allySide = btl[server].allies.members
		var opposingSide = btl[server].enemies.members
		if (charFuncs.isOpposingSide(userDefs, btl[server])) {
			allySide = btl[server].enemies.members
			opposingSide = btl[server].allies.members
		}

		for (const i in opposingSide) {
			var enmDefs = opposingSide[i];
			var enmName = opposingSide[i].name;

			if (enmDefs.hp > 0 && !enmDefs.negotiated) {
				var embedTxt = attackEnemy(userDefs.name, enmName, userDefs, enmDefs, skillDefs, false, server, btl)
				if (embedTxt.oneMore == true && doOneMores(server)) {
					btl[server].onemore = true
				}

				embedTexts.push(embedTxt)
			}
		}
		
		embedText = {
			targetText: `${userDefs.name} => All Opposing`,
			attackText: `${userDefs.name} used their melee attack, ${userDefs.melee.name}, on the opposing side!`,
			resultText: ''
		}
		
		for (const i in embedTexts)
			embedText.resultText += `\n${embedTexts[i].resultText}`;

		if (preText.includes('%ENEMY%'))
			preText = preText.replace('%ENEMY%', 'Enemies');

		return embedText
	} else {
		var dmg = genDmg(userDefs, enmDefs, skillDefs, server, null, btl)
		var finaltext = ``
		var rand = -7 + Math.round(Math.random() * 14)
		dmg[0] += Math.round(rand)

		// Prompts
		var result = Math.round(dmg[0]);
		if (dmg[1] == "miss") {
			finaltext += `${enmName} dodged it!`;
			trapped = false;

			if (userDefs.missquote && userDefs.missquote.length > 0) {
				var possibleQuote = Math.round(Math.random() * (userDefs.missquote.length-1))
				var missQuote = `\n*${userName}: "${userDefs.missquote[possibleQuote]}"*`
				
				if (missQuote.includes('%ENEMY%'))
					missQuote.replace('%ENEMY%', enmDefs.name)
				
				finaltext += missQuote
			}

			if (enmDefs.dodgequote && enmDefs.dodgequote.length > 0) {
				var possibleQuote = Math.round(Math.random() * (enmDefs.dodgequote.length-1))
				var dodgeQuote = `\n*${enmDefs.name}: "${enmDefs.dodgequote[possibleQuote]}"*`
				
				if (dodgeQuote.includes('%ENEMY%'))
					dodgeQuote.replace('%ENEMY%', userDefs.name)
				
				finaltext += dodgeQuote
			}

			embedText.targetText = `${userDefs.name} => ${enmDefs.name}`
			embedText.attackText = `${userDefs.name} used their melee attack: ${userDefs.melee.name}!`
			embedText.resultText = finaltext
			return embedText
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
			finaltext += `${enmDefs.name} drains the attack to gain ${result} HP.`;
			enmDefs.hp = Math.max(enmDefs.maxhp, enmDefs.hp + result)

			if (enmDefs.drainquote && enmDefs.drainquote.length > 0) {
				var possibleQuote = Math.round(Math.random() * (enmDefs.drainquote.length-1))
				finaltext += `\n*${oppDefs.name}: "${enmDefs.drainquote[possibleQuote]}"*`
			}

			embedText.targetText = `${userDefs.name} => ${enmDefs.name}`
			embedText.attackText = `${userDefs.name} used their melee attack: ${userDefs.melee.name}!`
			embedText.resultText = finaltext
			return embedText
		} else {
			if (result < 1)
				result = 1;

			finaltext += `${enmName} took ` + result;
			enmDefs.hp -= result
			userDefs.guard = false
		}

		// Display Weakness
		if (dmg[2] == true) {
			if (dmg[1] == "superweak")
				finaltext += "<:supereffective:939053172528394252>";
			else
				finaltext += "<:effective:876899270731628584>";

			if (doOneMores(server) && !enmDefs.down) {
				enmDefs.down = true
				embedText.oneMore = true
			}
		} else if (dmgtype === "resist")
			finaltext += "<:resist:877132670784647238>";

		// Display Crits
		if (dmg[3] == true) {
			finaltext += "<:crit:876905905248145448>";

			if (doOneMores(server) && !enmDefs.down) {
				enmDefs.down = true
				embedText.oneMore = true
			}
		}

		// Display Techs
		if (dmg[5] == true)
			finaltext += statusEmojis[enmDefs.status];

		// Display the "damage" part of the text
		finaltext += " damage";

		if (enmDefs.hp <= 0) {
			finaltext += ' and was defeated';
			enmDefs.hp = 0;

			if (charFuncs.hasPassive(userDefs, "sacrifice")) {
				userDefs.hp = Math.min(userDefs.maxhp, userDefs.hp + enmDefs.level)
				userDefs.mp = Math.min(userDefs.maxmp, userDefs.mp + (enmDefs.level/2))
				finaltext += `, with ${userDefs.name}'s HP being restored by ${enmDefs.level} & MP restored by ${enmDefs.level/2}`
			}
			
			finaltext += '!'

			if (userDefs.killquote && userDefs.killquote.length > 0) {
				var possibleQuote = Math.round(Math.random() * (userDefs.killquote.length-1))
				var theQuote = `\n*${userDefs.name}: "${userDefs.killquote[possibleQuote]}"*`;
				
				while (theQuote.includes('%ENEMY%'))
					theQuote = theQuote.replace('%ENEMY%', enmDefs.name);
				
				finaltext += theQuote
			}

			if (enmDefs.deathquote && enmDefs.deathquote.length > 0) {
				var possibleQuote = Math.round(Math.random() * (enmDefs.deathquote.length-1))
				finaltext += `\n*${enmDefs.name}: "${enmDefs.deathquote[possibleQuote]}"*`
			}
		}
			
		if (charFuncs.hasPassive(enmDefs, "endure") && enmDefs.hp <= 0) {
			var endDefs = charFuncs.hasPassive(enmDefs, "endure")
			if (endDefs.pow >= 999) {
				finaltext += `\n\n...But ${enmDefs.name} endures the attack!`;
				enmDefs.hp = 1;
			} else {
				if (!enmDefs.endured) {
					finaltext += `\n\n...But ${enmDefs.name} endures the attack!`;
					enmDefs.hp = 1;
				}
			}
		}
		
		embedText.targetText = `${userDefs.name} => ${enmDefs.name}`
		embedText.attackText = `${userDefs.name} used their melee attack: ${userDefs.melee.name}!`
		embedText.resultText = finaltext
		return embedText
	}
}

function concernTxt(charDefs, allySide, server, btl) {							
	for (const i in allySide) {
		if (allySide[i].enemy)
			continue;

		if (charDefs.id != allySide[i].id && charDefs.trust[allySide[i].truename] && charDefs.trust[allySide[i].truename].level >= 4) {
			var helpVal = Math.random()

			var targVal = 0.05;
			if (charDefs.trust[allySide[i].truename].level >= 7)
				targVal =  0.1;
			if (charDefs.trust[allySide[i].truename].level >= 10)
				targVal =  0.2;
			if (charDefs.trust[allySide[i].truename].level >= 13)
				targVal =  0.3;

			console.log(`ConcernTxt: ${helpVal} < ${targVal}?`)

			if (helpVal <= targVal) {
				var resultText = `\n\n${allySide[i].name} consoles ${charDefs.name}.\n`

				if (allySide[i].consolequote && allySide[i].consolequote.length > 0) {
					var possibleQuote = allySide[i].consolequote[Math.round(Math.random() * (allySide[i].consolequote.length-1))]

					while (possibleQuote.includes('%ALLY%'))
						possibleQuote = possibleQuote.replace('%ALLY%', charDefs.name);

					resultText += `_${allySide[i].name}: "${possibleQuote}"_\n`
				} 

				if (charDefs.imfinequote && charDefs.imfinequote.length > 0) {
					var possibleQuote = charDefs.imfinequote[Math.round(Math.random() * (charDefs.meleequote.length-1))]

					while (possibleQuote.includes('%ALLY%'))
						possibleQuote = possibleQuote.replace('%ALLY%', allySide[i].name);

					resultText += `_${charDefs.name}: "${possibleQuote}"_\n`
				}

				charFuncs.trustUp(charDefs, allySide[i], 50, message.guild.id, client)
				return resultText
			}
		}
	}
	
	return ''
}

function allyHelp(charDefs, allySide, enmDefs, server, btl) {							
	for (const i in allySide) {
		if (allySide[i].enemy)
			continue;

		if (charDefs.id != allySide[i].id && charDefs.trust[allySide[i].truename] && charDefs.trust[allySide[i].truename].level >= 5) {
			var helpVal = Math.random()

			var targVal = 0.1;
			if (charDefs.trust[allySide[i].truename].level >= 10)
				targVal =  0.2;
			if (charDefs.trust[allySide[i].truename].level >= 15)
				targVal =  0.28;
			if (charDefs.trust[allySide[i].truename].level >= 20)
				targVal =  0.35;

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

				if (allySide[i].allyatkquote && allySide[i].allyatkquote.length > 0) {
					var possibleQuote = allySide[i].allyatkquote[Math.round(Math.random() * (allySide[i].allyatkquote.length-1))]
					
					while (possibleQuote.includes('%ALLY%'))
						possibleQuote = possibleQuote.replace('%ALLY%', charDefs.name);
					while (possibleQuote.includes('%ENEMY%'))
						possibleQuote = possibleQuote.replace('%ENEMY%', enmDefs.name);

					resultText += `*${allySide[i].name}: "${possibleQuote}"*\n`
				} else if (allySide[i].meleequote && allySide[i].meleequote.length > 0) {
					var possibleQuote = allySide[i].meleequote[Math.round(Math.random() * (allySide[i].meleequote.length-1))]

					while (possibleQuote.includes('%ENEMY%'))
						possibleQuote = possibleQuote.replace('%ENEMY%', enmDefs.name);

					resultText += `*${allySide[i].name}: "${possibleQuote}"*\n`
				}
				
				resultText += attackEnemy(allySide[i].name, enmDefs.name, allySide[i], enmDefs, allyAttack, false, server, btl).resultText;
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
	if (skillDefs.melee) {
		if (userDefs.meleequote && userDefs.meleequote.length > 0) {
			var possibleQuote = Math.round(Math.random() * (userDefs.meleequote.length-1))
			preText = `*${userDefs.name}: "${userDefs.meleequote[possibleQuote]}"*\n`
		}
	} else {
		if (userDefs.magquote && userDefs.magquote.length > 0 && skillDefs.atktype === "magic") {
			var possibleQuote = Math.round(Math.random() * (userDefs.magquote.length-1))
			preText = `*${userDefs.name}: "${userDefs.magquote[possibleQuote]}"*\n`
		}

		if (userDefs.physquote && userDefs.physquote.length > 0 && skillDefs.atktype === "physical") {
			var possibleQuote = Math.round(Math.random() * (userDefs.physquote.length-1))
			preText = `*${userDefs.name}: "${userDefs.physquote[possibleQuote]}"*\n`
		}
	}

	if (!skillDefs.name)
		skillDefs.name = 'a skill';

	if (preText.includes('%SKILL%'))
		preText = preText.replace('%SKILL%', skillDefs.name)

	if (preText.includes('%ALLY%'))
		preText = preText.replace('%ALLY%', allySide[Math.round(Math.random() * (allySide.length-1))].name);

	if (!skillDefs.target || skillDefs.target === "one") {
		if (opposingSide[targetNum]) {
			var enmDefs = opposingSide[targetNum]
			const enmName = enmDefs.name
			
			if (enmDefs.hp <= 0 || enmDefs.negotiated) {
				return new Discord.MessageEmbed()
					.setColor('#e36b2b')
					.setTitle(`${userDefs.name} => ???`)
					.setDescription(`${userDefs.name} used ${skillDefs.name}... but there was no target.`)
					.setFooter(`${userDefs.name}'s turn`);
			}

			if (preText.includes('%ENEMY%'))
				preText = preText.replace('%ENEMY%', enmName);

			embedText = attackEnemy(userDefs.name, enmName, userDefs, enmDefs, skillDefs, false, server, btl)
			if (embedText.oneMore == true) {
				if (doOneMores(server))
					btl[server].onemore = true;
				
				// This probably means it was alot of damage. In that case, let's console our friend.
				if (!btl[server].pvp)
					embedText.resultText += concernTxt(userDefs, allySide, server, btl);
			}
			
			// Trust Level 5+ will have a 10% chance - increasing with trust level - for an ally to help with physical attacks.
			if (!btl[server].pvp)
				embedText.resultText += allyHelp(userDefs, allySide, enmDefs, server, btl)

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
			} else {
				if (skillDefs.rollout && !userDefs.ignoreRollout) {
					if (!userDefs.rollouts)
						userDefs.rollouts = 1
					else
						userDefs.rollouts++;
					
					userDefs.forceMove = [targetNum, skillDefs]
				}
			}
			
			delete userDefs.ignoreRollout

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
		embedText = attackEnemy(userDefs.name, userDefs.name, userDefs, userDefs, skillDefs, false, server, btl)
		if (embedText.oneMore == true && doOneMores(server))
			btl[server].onemore = true;

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

		if (preText.includes('%ENEMY%'))
			preText = preText.replace('%ENEMY%', userDefs.name);

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

			embedText = attackEnemy(userDefs.name, enmName, userDefs, enmDefs, skillDefs, false, server, btl)
			if (embedText.oneMore == true && doOneMores(server))
				btl[server].onemore = true;

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

			if (preText.includes('%ENEMY%'))
				preText = preText.replace('%ENEMY%', enmName);

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
			var enmDefs = opposingSide[i];
			var enmName = opposingSide[i].name;

			if (enmDefs.hp > 0 && !enmDefs.negotiated) {
				var embedTxt = attackEnemy(userDefs.name, enmName, userDefs, enmDefs, skillDefs, false, server, btl)
				if (embedTxt.oneMore == true && doOneMores(server)) {
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

		if (preText.includes('%ENEMY%'))
			preText = preText.replace('%ENEMY%', 'Enemies');

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
			var targDefs = allySide[i];
			var targName = allySide[i].name;
			
			if (targDefs.hp > 0 && !targDefs.negotiated && userDefs.name != targName) {
				var embedTxt = attackEnemy(userDefs.name, targName, userDefs, targDefs, skillDefs, false, server, btl)
				if (embedTxt.oneMore == true && doOneMores(server)) {
					btl[server].onemore = true
				}

				embedTexts.push(embedTxt)
			}
		}
		
		embedText = {
			targetText: `${userDefs.name} => All Allies`,
			attackText: `${userDefs.name} used ${skillDefs.name} on their own side!`,
			resultText: `${preText}`
		}
		
		for (const i in embedTexts)
			embedText.resultText += `\n${embedTexts[i].resultText}`;

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

		if (preText.includes('%ENEMY%'))
			preText = preText.replace('%ENEMY%', 'Allies');

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

		for (const i in allySide) {
			if (allySide[i].id != userDefs.id) {
				if (allySide[i].hp > 0 && !allySide[i].negotiated) {
					fighters.push(allySide[i])
				}
			}
		}

		for (const i in opposingSide) {
			if (opposingSide[i].id != userDefs.id) {
				if (opposingSide[i].hp > 0 && !opposingSide[i].negotiated) {
					fighters.push(opposingSide[i])
				}
			}
		}

		for (const i in fighters) {
			var embedTxt = attackEnemy(userDefs.name, fighters[i].name, userDefs, fighters[i], skillDefs, false, server, btl)
			if (embedTxt.oneMore == true && doOneMores(server)) {
				btl[server].onemore = true
			}
			
			embedTexts.push(embedTxt)
		}
		
		embedText = {
			targetText: `${userDefs.name} => Everyone`,
			attackText: `${userDefs.name} used ${skillDefs.name} on all fighters!`,
			resultText: `${preText}`
		}
		
		for (const i in embedTexts)
			embedText.resultText += `\n${embedTexts[i].resultText}`;

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

		if (preText.includes('%ENEMY%'))
			preText = preText.replace('%ENEMY%', 'Everyone');

		return new Discord.MessageEmbed()
			.setColor('#e36b2b')
			.setTitle(`${embedText.targetText}`)
			.setDescription(`${embedText.attackText}!\n${embedText.resultText}`)
			.setFooter(`${userDefs.name}'s turn`);
	} else if (skillDefs.target === "random") {
		var damages = [];
		var finaltext = ``;
		var embedTexts = [];
		var fighters = [];

		for (const i in btl[server].allies.members) {
			if (btl[server].allies.members[i].name != userDefs.name) {
				if (btl[server].allies.members[i].hp > 0 && !btl[server].allies.members[i].negotiated) {
					fighters.push(btl[server].allies.members[i])
				}
			}
		}

		for (const i in btl[server].enemies.members) {
			if (btl[server].enemies.members[i].name != userDefs.name) {
				if (btl[server].enemies.members[i].hp > 0 && !btl[server].enemies.members[i].negotiated) {
					fighters.push(btl[server].enemies.members[i])
				}
			}
		}

		var hits = skillDefs.hits ? parseInt(skillDefs.hits) : 1
		
		// reset hits so they dont multi-hit
		var newSkillDefs = utilityFuncs.cloneObj(skillDefs)
		delete newSkillDefs.hits;

		// k lets go, BEGIN THE CHAOS
		for (let i = 0; i < hits; i++) {
			var enmDefs = fighters[Math.round(Math.random()*(fighters.length-1))]
			if (!enmDefs) continue;

			const enmName = enmDefs.name

			if (enmDefs.hp > 0 && !enmDefs.negotiated) {
				var embedTxt = attackEnemy(userDefs.name, enmName, userDefs, enmDefs, newSkillDefs, false, server, btl)
				if (embedTxt.oneMore == true && doOneMores(server)) {
					btl[server].onemore = true
				}

				embedTexts.push(embedTxt)
			}
		}
		
		embedText = {
			targetText: `${userDefs.name} => ???`,
			attackText: `${userDefs.name} used ${skillDefs.name} on random targets!`,
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

		if (preText.includes('%ENEMY%'))
			preText = preText.replace('%ENEMY%', 'Everyone');

		return new Discord.MessageEmbed()
			.setColor('#e36b2b')
			.setTitle(`${embedText.targetText}`)
			.setDescription(`${embedText.attackText}!\n${embedText.resultText}`)
			.setFooter(`${userDefs.name}'s turn`);
	} else if (skillDefs.target === "randomopposing") {
		var damages = [];
		var finaltext = ``;
		var embedTexts = [];
		var fighters = [];

		for (const i in opposingSide) {
			if (opposingSide[i].id != userDefs.id) {
				if (opposingSide[i].hp > 0 && !opposingSide[i].negotiated) {
					fighters.push(opposingSide[i])
				}
			}
		}

		var hits = skillDefs.hits ? parseInt(skillDefs.hits) : 1
		
		// reset hits so they dont multi-hit
		var newSkillDefs = utilityFuncs.cloneObj(skillDefs)
		delete newSkillDefs.hits;

		// k lets go, BEGIN THE CHAOS... except, only hit enemies this time
		for (let i = 0; i < hits; i++) {
			var enmDefs = fighters[Math.round(Math.random()*(fighters.length-1))]
			if (!enmDefs) continue;

			const enmName = enmDefs.name

			if (enmDefs.hp > 0 && !enmDefs.negotiated) {
				var embedTxt = attackEnemy(userDefs.name, enmName, userDefs, enmDefs, newSkillDefs, false, server, btl)
				if (embedTxt.oneMore == true && doOneMores(server)) {
					btl[server].onemore = true
				}

				embedTexts.push(embedTxt)
			}
		}
		
		embedText = {
			targetText: `${userDefs.name} => ???`,
			attackText: `${userDefs.name} used ${skillDefs.name} on random foes!`,
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

		if (preText.includes('%ENEMY%'))
			preText = preText.replace('%ENEMY%', 'Everyone');

		return new Discord.MessageEmbed()
			.setColor('#e36b2b')
			.setTitle(`${embedText.targetText}`)
			.setDescription(`${embedText.attackText}!\n${embedText.resultText}`)
			.setFooter(`${userDefs.name}'s turn`);
	}
}

// Export Functions
module.exports = {
	meleeFoe: function(userDefs, oppDefs, server, rage, btl) {
		return meleeAttack(userDefs, oppDefs, server, rage, btl)
	},
	
	technicalDmg: function(userDefs, element) {
		return isTech(userDefs, element);
	},
	
	physStatus: function(status) {
		return isPhysicalStatus(status.toLowerCase());
	},
	
	generateDmg: function(userDefs, targDefs, skillDefs, server, forceDmgType, btl) {
		return genDmg(userDefs, targDefs, skillDefs, server, forceDmgType, btl);
	},
	
	attackFoe: function(userName, oppName, userDefs, oppDefs, skillDefs, useEnergy, server, btl) {
		return attackEnemy(userName, oppName, userDefs, oppDefs, skillDefs, useEnergy, server, btl)
	},
	
	attackWithSkill: function(userDefs, targetNum, allySide, opposingSide, btl, skillDefs, server) {
		return attackWithSkill(userDefs, targetNum, allySide, opposingSide, btl, skillDefs, server)
	},
	
	inflictStatus: function(targDefs, skillDefs) {
		return inflictStatus(targDefs, skillDefs)
	},
	
	inflictStatusFromText: function(targDefs, statusEffect) {
		return inflictStatusFromText(targDefs, statusEffect)
	},
	
	missCheck: function(stat1, stat2, accuracy) {
		return missCheck(stat1, stat2, accuracy)
	}
}