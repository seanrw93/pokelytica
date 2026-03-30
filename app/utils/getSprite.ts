export const getSpriteUrl = (species: string) => {
  if (!species) return "";
  return `https://play.pokemonshowdown.com/sprites/gen5/${species.toLowerCase().replace(/\s/g, "")}.png`;
};

