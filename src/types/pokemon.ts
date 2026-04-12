export interface NamedAPIResource {
  name: string
  url: string
}

export interface PokemonAbility {
  ability: NamedAPIResource
  is_hidden: boolean
  slot: number
}

export interface VersionGameIndex {
  game_index: number
  version: NamedAPIResource
}

export interface PokemonHeldItemVersion {
  rarity: number
  version: NamedAPIResource
}

export interface PokemonHeldItem {
  item: NamedAPIResource
  version_details: PokemonHeldItemVersion[]
}

export interface PokemonMoveVersion {
  level_learned_at: number
  move_learn_method: NamedAPIResource
  version_group: NamedAPIResource
}

export interface PokemonMove {
  move: NamedAPIResource
  version_group_details: PokemonMoveVersion[]
}

export interface PokemonType {
  slot: number
  type: NamedAPIResource
}

export interface PokemonPastType {
  generation: NamedAPIResource
  types: PokemonType[]
}

export interface PokemonStat {
  base_stat: number
  effort: number
  stat: NamedAPIResource
}

export interface PokemonCries {
  latest: string
  legacy: string
}

export interface SpriteSet {
  front_default: string | null
  front_shiny: string | null
  front_female: string | null
  front_shiny_female: string | null
  back_default: string | null
  back_shiny: string | null
  back_female: string | null
  back_shiny_female: string | null
}

export interface PokemonSpritesOther {
  dream_world: {
    front_default: string | null
    front_female: string | null
  }
  home: {
    front_default: string | null
    front_female: string | null
    front_shiny: string | null
    front_shiny_female: string | null
  }
  'official-artwork': {
    front_default: string | null
    front_shiny: string | null
  }
  showdown: SpriteSet
}

export interface GenerationISprites {
  'red-blue': {
    front_default: string | null
    front_gray: string | null
    back_default: string | null
    back_gray: string | null
    front_transparent: string | null
    back_transparent: string | null
  }
  yellow: {
    front_default: string | null
    front_gray: string | null
    back_default: string | null
    back_gray: string | null
    front_transparent: string | null
    back_transparent: string | null
  }
}

export interface GenerationIISprites {
  crystal: {
    front_default: string | null
    front_shiny: string | null
    front_transparent: string | null
    front_shiny_transparent: string | null
    back_default: string | null
    back_shiny: string | null
    back_transparent: string | null
    back_shiny_transparent: string | null
  }
  gold: {
    front_default: string | null
    front_shiny: string | null
    front_transparent: string | null
    back_default: string | null
    back_shiny: string | null
  }
  silver: {
    front_default: string | null
    front_shiny: string | null
    front_transparent: string | null
    back_default: string | null
    back_shiny: string | null
  }
}

export interface GenerationIIISprites {
  emerald: {
    front_default: string | null
    front_shiny: string | null
  }
  'firered-leafgreen': {
    front_default: string | null
    front_shiny: string | null
    back_default: string | null
    back_shiny: string | null
  }
  'ruby-sapphire': {
    front_default: string | null
    front_shiny: string | null
    back_default: string | null
    back_shiny: string | null
  }
}

export interface GenerationIVSprites {
  'diamond-pearl': SpriteSet
  'heartgold-soulsilver': SpriteSet
  platinum: SpriteSet
}

export interface GenerationVSprites {
  'black-white': SpriteSet & {
    animated: SpriteSet
  }
}

export interface GenerationVISprites {
  'omegaruby-alphasapphire': {
    front_default: string | null
    front_female: string | null
    front_shiny: string | null
    front_shiny_female: string | null
  }
  'x-y': {
    front_default: string | null
    front_female: string | null
    front_shiny: string | null
    front_shiny_female: string | null
  }
}

export interface GenerationVIISprites {
  icons: {
    front_default: string | null
    front_female: string | null
  }
  'ultra-sun-ultra-moon': {
    front_default: string | null
    front_female: string | null
    front_shiny: string | null
    front_shiny_female: string | null
  }
}

export interface GenerationVIIISprites {
  icons: {
    front_default: string | null
    front_female: string | null
  }
}

export interface PokemonSpritesVersions {
  'generation-i': GenerationISprites
  'generation-ii': GenerationIISprites
  'generation-iii': GenerationIIISprites
  'generation-iv': GenerationIVSprites
  'generation-v': GenerationVSprites
  'generation-vi': GenerationVISprites
  'generation-vii': GenerationVIISprites
  'generation-viii': GenerationVIIISprites
}

export interface PokemonSprites extends SpriteSet {
  other: PokemonSpritesOther
  versions: PokemonSpritesVersions
}

export interface Pokemon {
  id: number
  name: string
  base_experience: number
  height: number
  weight: number
  is_default: boolean
  order: number
  location_area_encounters: string
  species: NamedAPIResource
  forms: NamedAPIResource[]
  abilities: PokemonAbility[]
  game_indices: VersionGameIndex[]
  held_items: PokemonHeldItem[]
  moves: PokemonMove[]
  past_types: PokemonPastType[]
  sprites: PokemonSprites
  cries: PokemonCries
  stats: PokemonStat[]
  types: PokemonType[]
}
