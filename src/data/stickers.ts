import type { Sticker, TeamInfo, Confederation } from '@/types'

// NOTE: Group assignments and sticker numbers are approximate.
// Verify against the physical Panini FIFA World Cup 2026 album.
// Player names are placeholders — update once the official checklist is available.

interface RawTeam {
  code: string
  name: string
  flag: string
  conf: Confederation
}

const GROUPS: Record<string, RawTeam[]> = {
  A: [
    { code: 'USA', name: 'Estados Unidos', flag: '🇺🇸', conf: 'CONCACAF' },
    { code: 'PAN', name: 'Panamá', flag: '🇵🇦', conf: 'CONCACAF' },
    { code: 'NZL', name: 'Nueva Zelanda', flag: '🇳🇿', conf: 'OFC' },
    { code: 'SCO', name: 'Escocia', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', conf: 'UEFA' },
  ],
  B: [
    { code: 'CAN', name: 'Canadá', flag: '🇨🇦', conf: 'CONCACAF' },
    { code: 'MAR', name: 'Marruecos', flag: '🇲🇦', conf: 'CAF' },
    { code: 'URU', name: 'Uruguay', flag: '🇺🇾', conf: 'CONMEBOL' },
    { code: 'ALB', name: 'Albania', flag: '🇦🇱', conf: 'UEFA' },
  ],
  C: [
    { code: 'MEX', name: 'México', flag: '🇲🇽', conf: 'CONCACAF' },
    { code: 'JAM', name: 'Jamaica', flag: '🇯🇲', conf: 'CONCACAF' },
    { code: 'ECU', name: 'Ecuador', flag: '🇪🇨', conf: 'CONMEBOL' },
    { code: 'IRQ', name: 'Irak', flag: '🇮🇶', conf: 'AFC' },
  ],
  D: [
    { code: 'BRA', name: 'Brasil', flag: '🇧🇷', conf: 'CONMEBOL' },
    { code: 'CHI', name: 'Chile', flag: '🇨🇱', conf: 'CONMEBOL' },
    { code: 'CMR', name: 'Camerún', flag: '🇨🇲', conf: 'CAF' },
    { code: 'AUS', name: 'Australia', flag: '🇦🇺', conf: 'AFC' },
  ],
  E: [
    { code: 'ARG', name: 'Argentina', flag: '🇦🇷', conf: 'CONMEBOL' },
    { code: 'COL', name: 'Colombia', flag: '🇨🇴', conf: 'CONMEBOL' },
    { code: 'JPN', name: 'Japón', flag: '🇯🇵', conf: 'AFC' },
    { code: 'COD', name: 'R.D. Congo', flag: '🇨🇩', conf: 'CAF' },
  ],
  F: [
    { code: 'GER', name: 'Alemania', flag: '🇩🇪', conf: 'UEFA' },
    { code: 'VEN', name: 'Venezuela', flag: '🇻🇪', conf: 'CONMEBOL' },
    { code: 'KOR', name: 'Corea del Sur', flag: '🇰🇷', conf: 'AFC' },
    { code: 'CIV', name: 'Costa de Marfil', flag: '🇨🇮', conf: 'CAF' },
  ],
  G: [
    { code: 'FRA', name: 'Francia', flag: '🇫🇷', conf: 'UEFA' },
    { code: 'HON', name: 'Honduras', flag: '🇭🇳', conf: 'CONCACAF' },
    { code: 'IRN', name: 'Irán', flag: '🇮🇷', conf: 'AFC' },
    { code: 'SEN', name: 'Senegal', flag: '🇸🇳', conf: 'CAF' },
  ],
  H: [
    { code: 'ESP', name: 'España', flag: '🇪🇸', conf: 'UEFA' },
    { code: 'TUR', name: 'Turquía', flag: '🇹🇷', conf: 'UEFA' },
    { code: 'KSA', name: 'Arabia Saudí', flag: '🇸🇦', conf: 'AFC' },
    { code: 'NGA', name: 'Nigeria', flag: '🇳🇬', conf: 'CAF' },
  ],
  I: [
    { code: 'ENG', name: 'Inglaterra', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', conf: 'UEFA' },
    { code: 'POR', name: 'Portugal', flag: '🇵🇹', conf: 'UEFA' },
    { code: 'QAT', name: 'Catar', flag: '🇶🇦', conf: 'AFC' },
    { code: 'EGY', name: 'Egipto', flag: '🇪🇬', conf: 'CAF' },
  ],
  J: [
    { code: 'NED', name: 'Países Bajos', flag: '🇳🇱', conf: 'UEFA' },
    { code: 'SUI', name: 'Suiza', flag: '🇨🇭', conf: 'UEFA' },
    { code: 'JOR', name: 'Jordania', flag: '🇯🇴', conf: 'AFC' },
    { code: 'MLI', name: 'Malí', flag: '🇲🇱', conf: 'CAF' },
  ],
  K: [
    { code: 'BEL', name: 'Bélgica', flag: '🇧🇪', conf: 'UEFA' },
    { code: 'HUN', name: 'Hungría', flag: '🇭🇺', conf: 'UEFA' },
    { code: 'RSA', name: 'Sudáfrica', flag: '🇿🇦', conf: 'CAF' },
    { code: 'IDN', name: 'Indonesia', flag: '🇮🇩', conf: 'AFC' },
  ],
  L: [
    { code: 'ITA', name: 'Italia', flag: '🇮🇹', conf: 'UEFA' },
    { code: 'CRO', name: 'Croacia', flag: '🇭🇷', conf: 'UEFA' },
    { code: 'AUT', name: 'Austria', flag: '🇦🇹', conf: 'UEFA' },
    { code: 'DEN', name: 'Dinamarca', flag: '🇩🇰', conf: 'UEFA' },
  ],
}

const INTRO_NAMES = [
  'Copa Mundial FIFA 2026',
  'México – Sede anfitriona',
  'Estados Unidos – Sede anfitriona',
  'Canadá – Sede anfitriona',
  'Estadios / Stadiums I',
  'Estadios / Stadiums II',
  'El Trofeo FIFA',
  'Historia de la Copa',
  'Bienvenidos al Mundial',
]

const MUSEUM_NAMES = [
  'Uruguay 1930',
  'Italia 1934 & 1938',
  'Brasil 1958',
  'Inglaterra 1966',
  'Brasil 1970',
  'Alemania Occ. 1974',
  'Argentina 1978 & 1986',
  'Italia 1982',
  'Francia 1998',
  'Brasil 2002',
  'Leyendas del Mundial',
]

function generateStickers(): Sticker[] {
  const stickers: Sticker[] = []
  let num = 1

  // Intro section (1–9)
  for (let i = 0; i < 9; i++) {
    stickers.push({
      id: `INTRO-${i + 1}`,
      code: `INT-${i + 1}`,
      number: num++,
      name: INTRO_NAMES[i],
      country: 'Mundial 2026',
      team: 'INTRO',
      flag: '🌍',
      category: 'intro',
      type: 'base',
      rarity: 'common',
    })
  }

  // Team sections (10–969)
  for (const [group, teams] of Object.entries(GROUPS)) {
    for (const team of teams) {
      // Sticker 1: Badge/Escudo
      stickers.push({
        id: `${team.code}-1`,
        code: `${team.code}-1`,
        number: num++,
        name: `${team.name} – Escudo`,
        country: team.name,
        team: team.code,
        flag: team.flag,
        group,
        confederation: team.conf,
        category: 'team',
        type: 'badge',
        rarity: 'common',
      })

      // Sticker 2: Team photo
      stickers.push({
        id: `${team.code}-2`,
        code: `${team.code}-2`,
        number: num++,
        name: `${team.name} – Foto del equipo`,
        country: team.name,
        team: team.code,
        flag: team.flag,
        group,
        confederation: team.conf,
        category: 'team',
        type: 'photo',
        rarity: 'common',
      })

      // Stickers 3–20: Players (18 players)
      for (let p = 1; p <= 18; p++) {
        const isSpecial = p === 1 // first player gets a special/foil treatment
        stickers.push({
          id: `${team.code}-${p + 2}`,
          code: `${team.code}-${p + 2}`,
          number: num++,
          name: `${team.name} – Jugador ${p}`,
          country: team.name,
          team: team.code,
          flag: team.flag,
          group,
          confederation: team.conf,
          category: 'team',
          type: isSpecial ? 'foil' : 'base',
          rarity: isSpecial ? 'rare' : 'common',
        })
      }
    }
  }

  // FIFA Museum section (970–980)
  for (let i = 0; i < 11; i++) {
    stickers.push({
      id: `MUS-${i + 1}`,
      code: `MUS-${i + 1}`,
      number: num++,
      name: MUSEUM_NAMES[i],
      country: 'FIFA Museum',
      team: 'MUSEUM',
      flag: '🏆',
      category: 'museum',
      type: 'special',
      rarity: 'rare',
    })
  }

  return stickers
}

export const ALL_STICKERS: Sticker[] = generateStickers()

export const STICKER_MAP: Map<string, Sticker> = new Map(
  ALL_STICKERS.map(s => [s.id, s])
)

export const TEAMS_INFO: TeamInfo[] = Object.entries(GROUPS).flatMap(([group, teams]) =>
  teams.map(t => ({
    code: t.code,
    name: t.name,
    flag: t.flag,
    confederation: t.conf,
    group,
  }))
)

export const TOTAL_STICKERS = ALL_STICKERS.length // 980
