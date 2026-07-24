export type RawTrainerMon = {
  species: string;
  item: string;
  ability: string;
  nature: string;
  level: number;
  evs: { hp: number; atk: number; def: number; spa: number; spd: number; spe: number };
  ivs: { hp: number; atk: number; def: number; spa: number; spd: number; spe: number };
  moves: string[];
};

export type RawTrainer = {
  name: string;
  title: string;
  generation: number;
  spriteId: string;
  team: RawTrainerMon[];
};

const IVS31 = { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 };

const physical = (over: Partial<RawTrainerMon["evs"]> = {}) => ({
  hp: 4, atk: 252, def: 0, spa: 0, spd: 0, spe: 252, ...over,
});
const special = (over: Partial<RawTrainerMon["evs"]> = {}) => ({
  hp: 4, atk: 0, def: 0, spa: 252, spd: 0, spe: 252, ...over,
});
const bulkyPhys = (over: Partial<RawTrainerMon["evs"]> = {}) => ({
  hp: 252, atk: 252, def: 4, spa: 0, spd: 0, spe: 0, ...over,
});
const wallDef = (over: Partial<RawTrainerMon["evs"]> = {}) => ({
  hp: 252, atk: 0, def: 252, spa: 0, spd: 4, spe: 0, ...over,
});
const wallSpd = (over: Partial<RawTrainerMon["evs"]> = {}) => ({
  hp: 252, atk: 0, def: 4, spa: 0, spd: 252, spe: 0, ...over,
});

const mon = (
  species: string,
  item: string,
  ability: string,
  nature: string,
  moves: string[],
  evs: RawTrainerMon["evs"],
  level = 50,
): RawTrainerMon => ({ species, item, ability, nature, level, evs, ivs: IVS31, moves });

export const trainerSeeds: RawTrainer[] = [
  // --- Kanto (Generation 1) ---
  {
    name: "Brock", title: "Pewter City Gym Leader", generation: 1, spriteId: "brock",
    team: [
      mon("Geodude", "Leftovers", "Sturdy", "Adamant", ["Rock Slide", "Earthquake", "Stealth Rock", "Explosion"], bulkyPhys()),
      mon("Onix", "Leftovers", "Sturdy", "Impish", ["Stealth Rock", "Rock Slide", "Earthquake", "Toxic"], wallDef()),
      mon("Graveler", "Leftovers", "Sturdy", "Adamant", ["Rock Slide", "Earthquake", "Rock Polish", "Explosion"], bulkyPhys()),
      mon("Sudowoodo", "Leftovers", "Rock Head", "Adamant", ["Wood Hammer", "Rock Slide", "Earthquake", "Stealth Rock"], bulkyPhys()),
      mon("Rhyhorn", "Eviolite", "Lightning Rod", "Adamant", ["Earthquake", "Rock Blast", "Megahorn", "Stone Edge"], bulkyPhys()),
      mon("Omastar", "Leftovers", "Swift Swim", "Modest", ["Surf", "Ice Beam", "Earth Power", "Spikes"], special()),
    ],
  },
  {
    name: "Misty", title: "Cerulean City Gym Leader", generation: 1, spriteId: "misty",
    team: [
      mon("Staryu", "Leftovers", "Natural Cure", "Timid", ["Surf", "Ice Beam", "Rapid Spin", "Recover"], special()),
      mon("Starmie", "Leftovers", "Natural Cure", "Timid", ["Surf", "Ice Beam", "Thunderbolt", "Recover"], special()),
      mon("Psyduck", "Eviolite", "Damp", "Modest", ["Surf", "Ice Beam", "Psychic", "Amnesia"], special()),
      mon("Golduck", "Leftovers", "Damp", "Modest", ["Surf", "Ice Beam", "Psychic", "Calm Mind"], special()),
      mon("Poliwhirl", "Eviolite", "Water Absorb", "Bold", ["Surf", "Ice Beam", "Toxic", "Protect"], wallDef()),
      mon("Seaking", "Leftovers", "Swift Swim", "Adamant", ["Waterfall", "Megahorn", "Ice Punch", "Agility"], physical()),
    ],
  },
  {
    name: "Lt. Surge", title: "Vermilion City Gym Leader", generation: 1, spriteId: "ltsurge",
    team: [
      mon("Voltorb", "Leftovers", "Static", "Timid", ["Thunderbolt", "Volt Switch", "Taunt", "Explosion"], special()),
      mon("Pikachu", "Light Ball", "Static", "Timid", ["Thunderbolt", "Volt Tackle", "Surf", "Iron Tail"], special()),
      mon("Magnemite", "Eviolite", "Magnet Pull", "Modest", ["Thunderbolt", "Flash Cannon", "Volt Switch", "Discharge"], special()),
      mon("Electrode", "Leftovers", "Static", "Timid", ["Thunderbolt", "Volt Switch", "Foul Play", "Explosion"], special()),
      mon("Electabuzz", "Leftovers", "Vital Spirit", "Modest", ["Thunderbolt", "Psychic", "Focus Blast", "Ice Punch"], special()),
      mon("Raichu", "Leftovers", "Static", "Timid", ["Thunderbolt", "Volt Switch", "Focus Blast", "Surf"], special()),
    ],
  },
  {
    name: "Erika", title: "Celadon City Gym Leader", generation: 1, spriteId: "erika",
    team: [
      mon("Oddish", "Eviolite", "Chlorophyll", "Bold", ["Giga Drain", "Sludge Bomb", "Sleep Powder", "Moonlight"], wallDef()),
      mon("Bellsprout", "Eviolite", "Chlorophyll", "Modest", ["Giga Drain", "Sludge Bomb", "Sleep Powder", "Growth"], special()),
      mon("Tangela", "Leftovers", "Chlorophyll", "Bold", ["Giga Drain", "Sludge Bomb", "Knock Off", "Synthesis"], wallDef()),
      mon("Vileplume", "Leftovers", "Chlorophyll", "Modest", ["Giga Drain", "Sludge Bomb", "Sleep Powder", "Moonlight"], special()),
      mon("Weepinbell", "Eviolite", "Chlorophyll", "Modest", ["Giga Drain", "Sludge Bomb", "Sleep Powder", "Growth"], special()),
      mon("Victreebel", "Leftovers", "Chlorophyll", "Modest", ["Giga Drain", "Sludge Bomb", "Sleep Powder", "Sunny Day"], special()),
    ],
  },
  {
    name: "Koga", title: "Fuchsia City Gym Leader", generation: 1, spriteId: "koga",
    team: [
      mon("Koffing", "Eviolite", "Levitate", "Bold", ["Sludge Bomb", "Fire Blast", "Toxic Spikes", "Haze"], wallDef()),
      mon("Muk", "Leftovers", "Sticky Hold", "Careful", ["Poison Jab", "Knock Off", "Curse", "Rest"], wallSpd()),
      mon("Weezing", "Leftovers", "Levitate", "Bold", ["Sludge Bomb", "Fire Blast", "Toxic Spikes", "Pain Split"], wallDef()),
      mon("Venomoth", "Leftovers", "Shield Dust", "Timid", ["Sludge Bomb", "Bug Buzz", "Quiver Dance", "Roost"], special()),
      mon("Grimer", "Eviolite", "Sticky Hold", "Careful", ["Poison Jab", "Knock Off", "Curse", "Rest"], wallSpd()),
      mon("Crobat", "Leftovers", "Infiltrator", "Jolly", ["Cross Poison", "Brave Bird", "U-turn", "Roost"], physical()),
    ],
  },
  {
    name: "Sabrina", title: "Saffron City Gym Leader", generation: 1, spriteId: "sabrina",
    team: [
      mon("Abra", "Eviolite", "Synchronize", "Modest", ["Psychic", "Shadow Ball", "Focus Blast", "Calm Mind"], special()),
      mon("Kadabra", "Eviolite", "Synchronize", "Modest", ["Psychic", "Shadow Ball", "Focus Blast", "Calm Mind"], special()),
      mon("Mr. Mime", "Leftovers", "Soundproof", "Timid", ["Psychic", "Dazzling Gleam", "Focus Blast", "Baton Pass"], special()),
      mon("Venomoth", "Leftovers", "Shield Dust", "Timid", ["Bug Buzz", "Sludge Bomb", "Quiver Dance", "Roost"], special()),
      mon("Alakazam", "Focus Sash", "Synchronize", "Timid", ["Psychic", "Shadow Ball", "Focus Blast", "Calm Mind"], special()),
      mon("Espeon", "Leftovers", "Synchronize", "Timid", ["Psychic", "Shadow Ball", "Dazzling Gleam", "Calm Mind"], special()),
    ],
  },
  {
    name: "Blaine", title: "Cinnabar Island Gym Leader", generation: 1, spriteId: "blaine",
    team: [
      mon("Growlithe", "Eviolite", "Intimidate", "Adamant", ["Flare Blitz", "Close Combat", "Extreme Speed", "Morning Sun"], physical()),
      mon("Ponyta", "Eviolite", "Flame Body", "Timid", ["Flamethrower", "Solar Beam", "Morning Sun", "Agility"], special()),
      mon("Rapidash", "Leftovers", "Flame Body", "Jolly", ["Flare Blitz", "Wild Charge", "Megahorn", "Morning Sun"], physical()),
      mon("Arcanine", "Leftovers", "Intimidate", "Adamant", ["Flare Blitz", "Close Combat", "Extreme Speed", "Morning Sun"], physical()),
      mon("Magmar", "Leftovers", "Flame Body", "Modest", ["Fire Blast", "Focus Blast", "Thunderbolt", "Will-O-Wisp"], special()),
      mon("Ninetales", "Leftovers", "Drought", "Timid", ["Flamethrower", "Solar Beam", "Nasty Plot", "Will-O-Wisp"], special()),
    ],
  },
  {
    name: "Giovanni", title: "Viridian City Gym Leader", generation: 1, spriteId: "giovanni",
    team: [
      mon("Rhyhorn", "Eviolite", "Lightning Rod", "Adamant", ["Earthquake", "Rock Blast", "Megahorn", "Stone Edge"], bulkyPhys()),
      mon("Dugtrio", "Focus Sash", "Arena Trap", "Jolly", ["Earthquake", "Stone Edge", "Sucker Punch", "Stealth Rock"], physical()),
      mon("Nidoqueen", "Leftovers", "Poison Point", "Adamant", ["Earthquake", "Poison Jab", "Stone Edge", "Ice Beam"], physical()),
      mon("Nidoking", "Leftovers", "Poison Point", "Adamant", ["Earthquake", "Poison Jab", "Megahorn", "Ice Beam"], physical()),
      mon("Rhydon", "Eviolite", "Lightning Rod", "Adamant", ["Earthquake", "Rock Slide", "Megahorn", "Stone Edge"], bulkyPhys()),
      mon("Persian", "Leftovers", "Limber", "Jolly", ["Return", "Knock Off", "U-turn", "Taunt"], physical()),
    ],
  },
  {
    name: "Lance", title: "Kanto Elite Four", generation: 1, spriteId: "lance",
    team: [
      mon("Dragonair", "Eviolite", "Shed Skin", "Modest", ["Dragon Pulse", "Ice Beam", "Thunderbolt", "Agility"], special()),
      mon("Gyarados", "Leftovers", "Intimidate", "Adamant", ["Waterfall", "Earthquake", "Ice Fang", "Dragon Dance"], physical()),
      mon("Aerodactyl", "Focus Sash", "Pressure", "Jolly", ["Stone Edge", "Earthquake", "Ice Fang", "Stealth Rock"], physical()),
      mon("Dragonite", "Leftovers", "Inner Focus", "Adamant", ["Outrage", "Earthquake", "Extreme Speed", "Dragon Dance"], physical()),
      mon("Charizard", "Leftovers", "Blaze", "Timid", ["Flamethrower", "Air Slash", "Focus Blast", "Roost"], special()),
      mon("Kingdra", "Leftovers", "Swift Swim", "Modest", ["Surf", "Draco Meteor", "Ice Beam", "Rain Dance"], special()),
    ],
  },
  {
    name: "Bruno", title: "Kanto Elite Four", generation: 1, spriteId: "bruno",
    team: [
      mon("Onix", "Eviolite", "Sturdy", "Impish", ["Stealth Rock", "Rock Slide", "Earthquake", "Toxic"], wallDef()),
      mon("Hitmonchan", "Leftovers", "Iron Fist", "Adamant", ["Close Combat", "Mach Punch", "Ice Punch", "Thunder Punch"], physical()),
      mon("Hitmonlee", "Leftovers", "Reckless", "Jolly", ["High Jump Kick", "Stone Edge", "Sucker Punch", "Rapid Spin"], physical()),
      mon("Machamp", "Leftovers", "Guts", "Adamant", ["Close Combat", "Knock Off", "Ice Punch", "Bulk Up"], physical()),
      mon("Steelix", "Leftovers", "Sturdy", "Impish", ["Heavy Slam", "Earthquake", "Stone Edge", "Curse"], wallDef()),
      mon("Hitmontop", "Leftovers", "Technician", "Impish", ["Close Combat", "Triple Kick", "Rapid Spin", "Toxic"], wallDef()),
    ],
  },
  {
    name: "Blue", title: "Rival", generation: 1, spriteId: "blue",
    team: [
      mon("Pidgeot", "Leftovers", "Keen Eye", "Timid", ["Hurricane", "Heat Wave", "U-turn", "Roost"], special()),
      mon("Alakazam", "Focus Sash", "Synchronize", "Timid", ["Psychic", "Shadow Ball", "Focus Blast", "Calm Mind"], special()),
      mon("Rhyhorn", "Eviolite", "Lightning Rod", "Adamant", ["Earthquake", "Rock Blast", "Megahorn", "Stone Edge"], bulkyPhys()),
      mon("Gyarados", "Leftovers", "Intimidate", "Adamant", ["Waterfall", "Earthquake", "Ice Fang", "Dragon Dance"], physical()),
      mon("Arcanine", "Leftovers", "Intimidate", "Adamant", ["Flare Blitz", "Close Combat", "Extreme Speed", "Morning Sun"], physical()),
      mon("Charizard", "Leftovers", "Blaze", "Timid", ["Flamethrower", "Air Slash", "Focus Blast", "Roost"], special()),
    ],
  },
  {
    name: "Red", title: "Kanto Champion", generation: 1, spriteId: "red",
    team: [
      mon("Pikachu", "Light Ball", "Static", "Timid", ["Thunderbolt", "Volt Tackle", "Surf", "Iron Tail"], special()),
      mon("Venusaur", "Leftovers", "Overgrow", "Bold", ["Giga Drain", "Sludge Bomb", "Sleep Powder", "Synthesis"], wallDef()),
      mon("Charizard", "Leftovers", "Blaze", "Timid", ["Flamethrower", "Air Slash", "Focus Blast", "Roost"], special()),
      mon("Blastoise", "Leftovers", "Torrent", "Bold", ["Surf", "Ice Beam", "Rapid Spin", "Roost"], wallDef()),
      mon("Snorlax", "Leftovers", "Thick Fat", "Careful", ["Body Slam", "Earthquake", "Curse", "Rest"], wallSpd()),
      mon("Lapras", "Leftovers", "Water Absorb", "Bold", ["Surf", "Ice Beam", "Toxic", "Rest"], wallDef()),
    ],
  },
  // --- Johto (Generation 2) ---
  {
    name: "Falkner", title: "Violet City Gym Leader", generation: 2, spriteId: "falkner",
    team: [
      mon("Pidgey", "Eviolite", "Keen Eye", "Jolly", ["Brave Bird", "U-turn", "Roost", "Tailwind"], physical()),
      mon("Pidgeotto", "Eviolite", "Keen Eye", "Jolly", ["Brave Bird", "U-turn", "Roost", "Tailwind"], physical()),
      mon("Pidgeot", "Leftovers", "Keen Eye", "Timid", ["Hurricane", "Heat Wave", "U-turn", "Roost"], special()),
      mon("Hoothoot", "Eviolite", "Insomnia", "Bold", ["Air Slash", "Roost", "Toxic", "Reflect"], wallDef()),
      mon("Noctowl", "Leftovers", "Insomnia", "Bold", ["Air Slash", "Roost", "Toxic", "Whirlwind"], wallDef()),
      mon("Skarmory", "Leftovers", "Sturdy", "Impish", ["Brave Bird", "Iron Head", "Spikes", "Roost"], wallDef()),
    ],
  },
  {
    name: "Bugsy", title: "Azalea Town Gym Leader", generation: 2, spriteId: "bugsy",
    team: [
      mon("Metapod", "Eviolite", "Shed Skin", "Bold", ["Struggle Bug", "Protect", "Toxic", "Harden"], wallDef()),
      mon("Kakuna", "Eviolite", "Shed Skin", "Bold", ["Struggle Bug", "Protect", "Toxic", "Harden"], wallDef()),
      mon("Scyther", "Eviolite", "Technician", "Jolly", ["Dual Wingbeat", "U-turn", "Swords Dance", "Roost"], physical()),
      mon("Beedrill", "Leftovers", "Swarm", "Adamant", ["Poison Jab", "X-Scissor", "Drill Run", "U-turn"], physical()),
      mon("Butterfree", "Leftovers", "Compound Eyes", "Timid", ["Bug Buzz", "Sleep Powder", "Quiver Dance", "Roost"], special()),
      mon("Heracross", "Leftovers", "Guts", "Adamant", ["Close Combat", "Megahorn", "Knock Off", "Swords Dance"], physical()),
    ],
  },
  {
    name: "Whitney", title: "Goldenrod City Gym Leader", generation: 2, spriteId: "whitney",
    team: [
      mon("Clefairy", "Eviolite", "Magic Guard", "Bold", ["Moonblast", "Soft-Boiled", "Toxic", "Calm Mind"], wallDef()),
      mon("Miltank", "Leftovers", "Scrappy", "Impish", ["Body Slam", "Earthquake", "Milk Drink", "Stealth Rock"], wallDef()),
      mon("Girafarig", "Leftovers", "Inner Focus", "Timid", ["Psychic", "Hyper Voice", "Baton Pass", "Calm Mind"], special()),
      mon("Snorlax", "Leftovers", "Thick Fat", "Careful", ["Body Slam", "Earthquake", "Curse", "Rest"], wallSpd()),
      mon("Ursaring", "Leftovers", "Guts", "Adamant", ["Facade", "Close Combat", "Crunch", "Swords Dance"], physical()),
      mon("Tauros", "Leftovers", "Intimidate", "Jolly", ["Double-Edge", "Earthquake", "Zen Headbutt", "Rest"], physical()),
    ],
  },
  {
    name: "Morty", title: "Ecruteak City Gym Leader", generation: 2, spriteId: "morty",
    team: [
      mon("Gastly", "Eviolite", "Levitate", "Timid", ["Shadow Ball", "Sludge Bomb", "Hypnosis", "Destiny Bond"], special()),
      mon("Haunter", "Eviolite", "Levitate", "Timid", ["Shadow Ball", "Sludge Bomb", "Hypnosis", "Destiny Bond"], special()),
      mon("Gengar", "Focus Sash", "Cursed Body", "Timid", ["Shadow Ball", "Sludge Wave", "Focus Blast", "Nasty Plot"], special()),
      mon("Misdreavus", "Eviolite", "Levitate", "Timid", ["Shadow Ball", "Dazzling Gleam", "Nasty Plot", "Pain Split"], special()),
      mon("Sableye", "Leftovers", "Prankster", "Calm", ["Foul Play", "Recover", "Will-O-Wisp", "Taunt"], wallSpd()),
      mon("Mismagius", "Leftovers", "Levitate", "Timid", ["Shadow Ball", "Dazzling Gleam", "Nasty Plot", "Taunt"], special()),
    ],
  },
  {
    name: "Chuck", title: "Cianwood City Gym Leader", generation: 2, spriteId: "chuck",
    team: [
      mon("Primeape", "Leftovers", "Vital Spirit", "Adamant", ["Close Combat", "U-turn", "Stone Edge", "Bulk Up"], physical()),
      mon("Poliwrath", "Leftovers", "Water Absorb", "Adamant", ["Waterfall", "Close Combat", "Ice Punch", "Bulk Up"], physical()),
      mon("Machamp", "Leftovers", "Guts", "Adamant", ["Close Combat", "Knock Off", "Ice Punch", "Bulk Up"], physical()),
      mon("Heracross", "Leftovers", "Guts", "Adamant", ["Close Combat", "Megahorn", "Knock Off", "Swords Dance"], physical()),
      mon("Hitmontop", "Leftovers", "Technician", "Impish", ["Close Combat", "Triple Kick", "Rapid Spin", "Toxic"], wallDef()),
      mon("Hariyama", "Leftovers", "Guts", "Adamant", ["Close Combat", "Knock Off", "Bullet Punch", "Bulk Up"], bulkyPhys()),
    ],
  },
  {
    name: "Jasmine", title: "Olivine City Gym Leader", generation: 2, spriteId: "jasmine",
    team: [
      mon("Magnemite", "Eviolite", "Magnet Pull", "Modest", ["Thunderbolt", "Flash Cannon", "Volt Switch", "Discharge"], special()),
      mon("Steelix", "Leftovers", "Sturdy", "Impish", ["Heavy Slam", "Earthquake", "Stone Edge", "Curse"], wallDef()),
      mon("Skarmory", "Leftovers", "Sturdy", "Impish", ["Brave Bird", "Iron Head", "Spikes", "Roost"], wallDef()),
      mon("Forretress", "Leftovers", "Sturdy", "Impish", ["Gyro Ball", "Earthquake", "Spikes", "Rapid Spin"], wallDef()),
      mon("Magneton", "Leftovers", "Magnet Pull", "Modest", ["Thunderbolt", "Flash Cannon", "Volt Switch", "Discharge"], special()),
      mon("Scizor", "Leftovers", "Technician", "Adamant", ["Bullet Punch", "U-turn", "Knock Off", "Swords Dance"], physical()),
    ],
  },
  {
    name: "Pryce", title: "Mahogany Town Gym Leader", generation: 2, spriteId: "pryce",
    team: [
      mon("Seel", "Eviolite", "Thick Fat", "Bold", ["Surf", "Ice Beam", "Toxic", "Rest"], wallDef()),
      mon("Dewgong", "Leftovers", "Thick Fat", "Bold", ["Surf", "Ice Beam", "Toxic", "Rest"], wallDef()),
      mon("Piloswine", "Eviolite", "Thick Fat", "Adamant", ["Earthquake", "Icicle Crash", "Stone Edge", "Stealth Rock"], bulkyPhys()),
      mon("Lapras", "Leftovers", "Water Absorb", "Bold", ["Surf", "Ice Beam", "Toxic", "Rest"], wallDef()),
      mon("Cloyster", "Focus Sash", "Skill Link", "Adamant", ["Icicle Spear", "Rock Blast", "Ice Shard", "Shell Smash"], physical()),
      mon("Glalie", "Leftovers", "Inner Focus", "Timid", ["Ice Beam", "Freeze-Dry", "Explosion", "Spikes"], special()),
    ],
  },
  {
    name: "Clair", title: "Blackthorn City Gym Leader", generation: 2, spriteId: "clair",
    team: [
      mon("Dratini", "Eviolite", "Shed Skin", "Modest", ["Dragon Pulse", "Ice Beam", "Thunderbolt", "Agility"], special()),
      mon("Dragonair", "Eviolite", "Shed Skin", "Modest", ["Dragon Pulse", "Ice Beam", "Thunderbolt", "Agility"], special()),
      mon("Gyarados", "Leftovers", "Intimidate", "Adamant", ["Waterfall", "Earthquake", "Ice Fang", "Dragon Dance"], physical()),
      mon("Kingdra", "Leftovers", "Swift Swim", "Modest", ["Surf", "Draco Meteor", "Ice Beam", "Rain Dance"], special()),
      mon("Dragonite", "Leftovers", "Inner Focus", "Adamant", ["Outrage", "Earthquake", "Extreme Speed", "Dragon Dance"], physical()),
      mon("Altaria", "Leftovers", "Natural Cure", "Bold", ["Dragon Pulse", "Hurricane", "Roost", "Toxic"], wallDef()),
    ],
  },
  {
    name: "Will", title: "Johto Elite Four", generation: 2, spriteId: "will",
    team: [
      mon("Xatu", "Leftovers", "Synchronize", "Timid", ["Psychic", "Heat Wave", "U-turn", "Roost"], special()),
      mon("Jynx", "Leftovers", "Forewarn", "Timid", ["Ice Beam", "Psychic", "Focus Blast", "Lovely Kiss"], special()),
      mon("Exeggutor", "Leftovers", "Chlorophyll", "Modest", ["Psychic", "Giga Drain", "Sleep Powder", "Leech Seed"], special()),
      mon("Slowbro", "Leftovers", "Oblivious", "Bold", ["Scald", "Psychic", "Slack Off", "Toxic"], wallDef()),
      mon("Espeon", "Leftovers", "Synchronize", "Timid", ["Psychic", "Shadow Ball", "Dazzling Gleam", "Calm Mind"], special()),
      mon("Alakazam", "Focus Sash", "Synchronize", "Timid", ["Psychic", "Shadow Ball", "Focus Blast", "Calm Mind"], special()),
    ],
  },
  {
    name: "Karen", title: "Johto Elite Four", generation: 2, spriteId: "karen",
    team: [
      mon("Umbreon", "Leftovers", "Synchronize", "Calm", ["Foul Play", "Wish", "Protect", "Toxic"], wallSpd()),
      mon("Vileplume", "Leftovers", "Chlorophyll", "Modest", ["Giga Drain", "Sludge Bomb", "Sleep Powder", "Moonlight"], special()),
      mon("Gengar", "Focus Sash", "Cursed Body", "Timid", ["Shadow Ball", "Sludge Wave", "Focus Blast", "Nasty Plot"], special()),
      mon("Murkrow", "Eviolite", "Insomnia", "Adamant", ["Brave Bird", "Knock Off", "Sucker Punch", "Roost"], physical()),
      mon("Houndoom", "Leftovers", "Flash Fire", "Modest", ["Dark Pulse", "Fire Blast", "Sludge Bomb", "Nasty Plot"], special()),
      mon("Absol", "Life Orb", "Super Luck", "Jolly", ["Knock Off", "Sucker Punch", "Play Rough", "Swords Dance"], physical()),
    ],
  },
  {
    name: "Silver", title: "Rival", generation: 2, spriteId: "silver",
    team: [
      mon("Feraligatr", "Leftovers", "Torrent", "Adamant", ["Waterfall", "Ice Punch", "Earthquake", "Dragon Dance"], physical()),
      mon("Gengar", "Focus Sash", "Cursed Body", "Timid", ["Shadow Ball", "Sludge Wave", "Focus Blast", "Nasty Plot"], special()),
      mon("Sneasel", "Eviolite", "Inner Focus", "Jolly", ["Ice Punch", "Knock Off", "Ice Shard", "Swords Dance"], physical()),
      mon("Magneton", "Leftovers", "Magnet Pull", "Modest", ["Thunderbolt", "Flash Cannon", "Volt Switch", "Discharge"], special()),
      mon("Gyarados", "Leftovers", "Intimidate", "Adamant", ["Waterfall", "Earthquake", "Ice Fang", "Dragon Dance"], physical()),
      mon("Weavile", "Life Orb", "Pressure", "Jolly", ["Ice Punch", "Knock Off", "Ice Shard", "Swords Dance"], physical()),
    ],
  },
  // --- Hoenn (Generation 3) ---
  {
    name: "Roxanne", title: "Rustboro City Gym Leader", generation: 3, spriteId: "roxanne",
    team: [
      mon("Geodude", "Eviolite", "Sturdy", "Adamant", ["Rock Slide", "Earthquake", "Stealth Rock", "Explosion"], bulkyPhys()),
      mon("Nosepass", "Eviolite", "Sturdy", "Careful", ["Power Gem", "Earth Power", "Toxic", "Stealth Rock"], wallSpd()),
      mon("Graveler", "Eviolite", "Sturdy", "Adamant", ["Rock Slide", "Earthquake", "Rock Polish", "Explosion"], bulkyPhys()),
      mon("Probopass", "Leftovers", "Sturdy", "Careful", ["Power Gem", "Earth Power", "Volt Switch", "Stealth Rock"], wallSpd()),
      mon("Golem", "Leftovers", "Sturdy", "Adamant", ["Rock Slide", "Earthquake", "Explosion", "Stealth Rock"], bulkyPhys()),
      mon("Aggron", "Leftovers", "Sturdy", "Adamant", ["Heavy Slam", "Earthquake", "Stone Edge", "Head Smash"], physical()),
    ],
  },
  {
    name: "Brawly", title: "Dewford Town Gym Leader", generation: 3, spriteId: "brawly",
    team: [
      mon("Machop", "Eviolite", "Guts", "Adamant", ["Close Combat", "Knock Off", "Ice Punch", "Bulk Up"], bulkyPhys()),
      mon("Makuhita", "Eviolite", "Guts", "Adamant", ["Close Combat", "Knock Off", "Bullet Punch", "Bulk Up"], bulkyPhys()),
      mon("Meditite", "Eviolite", "Pure Power", "Adamant", ["Close Combat", "Ice Punch", "Zen Headbutt", "Bulk Up"], physical()),
      mon("Hariyama", "Leftovers", "Guts", "Adamant", ["Close Combat", "Knock Off", "Bullet Punch", "Bulk Up"], bulkyPhys()),
      mon("Medicham", "Life Orb", "Pure Power", "Adamant", ["Close Combat", "Ice Punch", "Zen Headbutt", "Bulk Up"], physical()),
      mon("Breloom", "Focus Sash", "Technician", "Adamant", ["Mach Punch", "Bullet Seed", "Spore", "Swords Dance"], physical()),
    ],
  },
  {
    name: "Wattson", title: "Mauville City Gym Leader", generation: 3, spriteId: "wattson",
    team: [
      mon("Voltorb", "Leftovers", "Static", "Timid", ["Thunderbolt", "Volt Switch", "Taunt", "Explosion"], special()),
      mon("Electrike", "Eviolite", "Static", "Timid", ["Thunderbolt", "Volt Switch", "Discharge", "Thunder Wave"], special()),
      mon("Magneton", "Leftovers", "Magnet Pull", "Modest", ["Thunderbolt", "Flash Cannon", "Volt Switch", "Discharge"], special()),
      mon("Manectric", "Leftovers", "Static", "Timid", ["Thunderbolt", "Volt Switch", "Overheat", "Switcheroo"], special()),
      mon("Electrode", "Leftovers", "Static", "Timid", ["Thunderbolt", "Volt Switch", "Foul Play", "Explosion"], special()),
      mon("Ampharos", "Leftovers", "Static", "Modest", ["Thunderbolt", "Dragon Pulse", "Focus Blast", "Volt Switch"], special()),
    ],
  },
  {
    name: "Flannery", title: "Lavaridge Town Gym Leader", generation: 3, spriteId: "flannery",
    team: [
      mon("Numel", "Eviolite", "Simple", "Modest", ["Fire Blast", "Earth Power", "Yawn", "Amnesia"], special()),
      mon("Slugma", "Eviolite", "Flame Body", "Modest", ["Fire Blast", "Earth Power", "Toxic", "Recover"], special()),
      mon("Camerupt", "Leftovers", "Solid Rock", "Modest", ["Fire Blast", "Earth Power", "Stealth Rock", "Yawn"], wallSpd()),
      mon("Torkoal", "Leftovers", "White Smoke", "Bold", ["Fire Blast", "Earth Power", "Stealth Rock", "Rapid Spin"], wallDef()),
      mon("Magcargo", "Leftovers", "Flame Body", "Bold", ["Fire Blast", "Earth Power", "Stealth Rock", "Recover"], wallDef()),
      mon("Houndoom", "Leftovers", "Flash Fire", "Modest", ["Dark Pulse", "Fire Blast", "Sludge Bomb", "Nasty Plot"], special()),
    ],
  },
  {
    name: "Norman", title: "Petalburg City Gym Leader", generation: 3, spriteId: "norman",
    team: [
      mon("Slaking", "Choice Band", "Truant", "Adamant", ["Giga Impact", "Earthquake", "Facade", "Double-Edge"], physical()),
      mon("Spinda", "Leftovers", "Own Tempo", "Jolly", ["Return", "Superpower", "Trick Room", "Baton Pass"], physical()),
      mon("Vigoroth", "Leftovers", "Vital Spirit", "Adamant", ["Return", "Close Combat", "Knock Off", "Bulk Up"], bulkyPhys()),
      mon("Linoone", "Leftovers", "Pickup", "Adamant", ["Return", "Extreme Speed", "Belly Drum", "Seed Bomb"], physical()),
      mon("Kecleon", "Leftovers", "Color Change", "Adamant", ["Return", "Knock Off", "Shadow Sneak", "Recover"], bulkyPhys()),
      mon("Snorlax", "Leftovers", "Thick Fat", "Careful", ["Body Slam", "Earthquake", "Curse", "Rest"], wallSpd()),
    ],
  },
  {
    name: "Winona", title: "Fortree City Gym Leader", generation: 3, spriteId: "winona",
    team: [
      mon("Swablu", "Eviolite", "Natural Cure", "Bold", ["Dragon Pulse", "Hurricane", "Roost", "Toxic"], wallDef()),
      mon("Tropius", "Leftovers", "Chlorophyll", "Bold", ["Air Slash", "Giga Drain", "Roost", "Toxic"], wallDef()),
      mon("Pelipper", "Leftovers", "Drizzle", "Bold", ["Hurricane", "Scald", "Roost", "Toxic"], wallDef()),
      mon("Skarmory", "Leftovers", "Sturdy", "Impish", ["Brave Bird", "Iron Head", "Spikes", "Roost"], wallDef()),
      mon("Altaria", "Leftovers", "Natural Cure", "Bold", ["Dragon Pulse", "Hurricane", "Roost", "Toxic"], wallDef()),
      mon("Salamence", "Leftovers", "Intimidate", "Adamant", ["Outrage", "Earthquake", "Dragon Dance", "Roost"], physical()),
    ],
  },
  {
    name: "Steven", title: "Hoenn Champion", generation: 3, spriteId: "steven",
    team: [
      mon("Skarmory", "Leftovers", "Sturdy", "Impish", ["Brave Bird", "Iron Head", "Spikes", "Roost"], wallDef()),
      mon("Claydol", "Leftovers", "Levitate", "Bold", ["Earth Power", "Ice Beam", "Stealth Rock", "Rapid Spin"], wallDef()),
      mon("Cradily", "Leftovers", "Suction Cups", "Careful", ["Giga Drain", "Earthquake", "Recover", "Toxic"], wallSpd()),
      mon("Armaldo", "Leftovers", "Battle Armor", "Adamant", ["X-Scissor", "Earthquake", "Stone Edge", "Knock Off"], bulkyPhys()),
      mon("Aggron", "Leftovers", "Sturdy", "Adamant", ["Heavy Slam", "Earthquake", "Stone Edge", "Head Smash"], physical()),
      mon("Metagross", "Leftovers", "Clear Body", "Adamant", ["Meteor Mash", "Earthquake", "Zen Headbutt", "Agility"], physical()),
    ],
  },
];
