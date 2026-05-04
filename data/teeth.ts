import type { ToothRecord } from '@/types/tooth';

export const TEETH_DATABASE: ToothRecord[] = [
  {
    id: 'megalodon',
    commonName: 'Megalodon',
    scientificName: 'Otodus megalodon',
    rarity: 'legendary',
    era: 'Miocene–Pliocene (~23–3.6 Ma)',
    shortDescription:
      'The iconic giant megatooth shark — serrated triangles the size of your hand that ruled ancient coastlines.',
    identificationTraits: [
      'Bourelette (dark chevron) at the root on many specimens',
      'Coarse, regular serrations along the entire cutting edge',
      'Broad triangular crown with a robust V-shaped root',
      'Lateral cusplets reduced or absent on adult teeth',
    ],
    funFacts: [
      'Estimates suggest adults reached 15–18 m — longer than a school bus.',
      'Their bite force is modeled among the strongest of any vertebrate.',
      'Teeth are far more common in the fossil record than vertebrae or cartilage.',
    ],
    collectingTips: [
      'Focus on river gravels and phosphate mines in the Carolinas and Florida.',
      'Learn repair vs. natural wear — chips happen, but cracks affect value.',
    ],
  },
  {
    id: 'great-white',
    commonName: 'Great White',
    scientificName: 'Carcharodon carcharias',
    rarity: 'rare',
    era: 'Neogene–Recent',
    shortDescription:
      'Heavy triangular teeth built for large prey — modern whites and their fossil kin leave dramatic shed finds.',
    identificationTraits: [
      'Serrated blade with a distinct notch (“hook”) near the tip on many laterals',
      'Broad root with clear lingual and labial root lobes',
      'Laterals more slender; anteriors more symmetrical triangles',
    ],
    funFacts: [
      'White shark lineages show a long fossil history across multiple genera.',
      'Shed teeth can appear polished from tumbling in surf zones.',
      'Juvenile teeth are noticeably smaller and more delicate.',
    ],
    collectingTips: [
      'Legalities vary — prioritize fossil sites and ethical beach collecting.',
      'Pair tooth position (upper/lower, anterior/lateral) when curating a set.',
    ],
  },
  {
    id: 'mako',
    commonName: 'Shortfin Mako',
    scientificName: 'Isurus oxyrinchus',
    rarity: 'uncommon',
    era: 'Paleogene–Recent',
    shortDescription:
      'Needle-fast hunters with smooth, dagger-like teeth — sleek crowns built for speed.',
    identificationTraits: [
      'Smooth cutting edges without coarse serrations',
      'Slender crown, often slightly curved distally',
      'Lateral teeth more hooked; anteriors straighter',
    ],
    funFacts: [
      'Makos are among the fastest sharks in the ocean.',
      'Fossil relatives include striking “classic” mako morphologies.',
      'High-crown teeth can look almost metallic when well preserved.',
    ],
    collectingTips: [
      'Distinguish from juvenile white tips by edge texture and root shape.',
      'Look for symmetry and fine enamel wrinkles on quality pieces.',
    ],
  },
  {
    id: 'sand-tiger',
    commonName: 'Sand Tiger',
    scientificName: 'Carcharias taurus (and fossil Odontaspididae)',
    rarity: 'common',
    era: 'Mesozoic–Recent',
    shortDescription:
      'Slender, spine-like teeth with pronounced central cusps — the classic “snaggle” silhouette.',
    identificationTraits: [
      'Long central cusp with paired smaller lateral cusplets',
      'Smooth or very fine serrations compared to requiem sharks',
      'Slender root, often with a subtle nutrient groove',
    ],
    funFacts: [
      'Sand tigers are famous for surface-browsing gulp-air behavior in aquaria.',
      'Their teeth are common fossils in many Cretaceous marine deposits.',
    ],
    collectingTips: [
      'Great starter fossils — abundant and affordable in many formations.',
      'Watch for composite restorations on unusually “perfect” matrix pieces.',
    ],
  },
  {
    id: 'tiger-shark',
    commonName: 'Tiger Shark',
    scientificName: 'Galeocerdo cuvier',
    rarity: 'uncommon',
    era: 'Paleogene–Recent',
    shortDescription:
      'Notched, coarsely serrated blades with a distinctive “shark fin” profile on many positions.',
    identificationTraits: [
      'Deep U- or V-shaped notches on the distal cutting edge',
      'Coarse serrations that can look almost “chunky”',
      'Complex crown curves depending on tooth position',
    ],
    funFacts: [
      'Tiger sharks are famously opportunistic feeders — the ocean’s cleanup crew.',
      'Their teeth vary wildly by jaw position, which makes sets fun to collect.',
    ],
    collectingTips: [
      'Learn position series — a single species can look like many different sharks.',
      'Color can vary with sediment chemistry (black, tan, blue-gray).',
    ],
  },
  {
    id: 'bull-shark',
    commonName: 'Bull Shark',
    scientificName: 'Carcharhinus leucas',
    rarity: 'common',
    era: 'Neogene–Recent',
    shortDescription:
      'Stocky triangular teeth for tough prey — broad bases and heavy roots for power.',
    identificationTraits: [
      'Broad triangular crown with fine serrations',
      'Thick root with squared-off lobes on many positions',
      'Less hook than many requiem laterals; more “workhorse” look',
    ],
    funFacts: [
      'Bull sharks tolerate fresh water and are known far upriver.',
      'Their teeth are common in nearshore fossil beds.',
    ],
    collectingTips: [
      'Compare with dusky/blacktip series — subtle differences in root width.',
      'River gravels can yield surprisingly fresh-looking fossil teeth.',
    ],
  },
  {
    id: 'lemon-shark',
    commonName: 'Lemon Shark',
    scientificName: 'Negaprion brevirostris',
    rarity: 'common',
    era: 'Paleogene–Recent',
    shortDescription:
      'Slender, angled blades with fine serrations — neat triangles with a coastal attitude.',
    identificationTraits: [
      'Slender crown with a slight distal lean',
      'Fine serrations along the cutting edges',
      'Root lobes often asymmetrical on laterals',
    ],
    funFacts: [
      'Lemon sharks form loose social groups in mangrove nurseries.',
      'Their teeth are a staple of Florida beach microfossil mixes.',
    ],
    collectingTips: [
      'Sift carefully — lemon teeth can hide among similar small requiems.',
      'Good lighting helps spot the fine serration pattern.',
    ],
  },
  {
    id: 'hemipristis',
    commonName: 'Snaggletooth (Hemipristis)',
    scientificName: 'Hemipristis serra',
    rarity: 'uncommon',
    era: 'Paleogene–Neogene',
    shortDescription:
      'The famous “snaggle” look — one edge smooth, the other serrated, like a pocketknife split personality.',
    identificationTraits: [
      'Distinctive dual cutting edge: mesial smooth, distal serrated (or vice versa by position)',
      'Strong distal hook on many teeth',
      'Prominent root lobes with a dramatic silhouette',
    ],
    funFacts: [
      'Hemipristis is a fan favorite because the teeth look unmistakably wild.',
      'They’re common enough to collect but weird enough to display.',
    ],
    collectingTips: [
      'Buy position-matched pairs if you want a symmetrical display.',
      'Beware heavily worn specimens that lose the signature edge contrast.',
    ],
  },
  {
    id: 'cow-shark',
    commonName: 'Sixgill / Sevengill (Cow Shark)',
    scientificName: 'Hexanchus spp. / Notorynchus spp.',
    rarity: 'rare',
    era: 'Mesozoic–Recent',
    shortDescription:
      'Comb-shaped lower teeth and slender uppers — instantly recognizable “saw rows” from deep-line sharks.',
    identificationTraits: [
      'Multi-cusped lower teeth with a “comb” of cusplets',
      'Slender uppers with a central cusp and smaller side cusplets',
      'Little to no serration compared to many coastal sharks',
    ],
    funFacts: [
      'Sixgills are deep-water classics — ancient morphology, modern mystery.',
      'Lower cow-shark teeth are some of the most graphic fossil shapes.',
    ],
    collectingTips: [
      'Lower positions are the showpieces; uppers can be easy to mis-ID.',
      'Matrix pieces with multiple combs make dramatic display fossils.',
    ],
  },
  {
    id: 'hammerhead',
    commonName: 'Hammerhead',
    scientificName: 'Sphyrna spp.',
    rarity: 'uncommon',
    era: 'Paleogene–Recent',
    shortDescription:
      'Graceful, narrow teeth for grabbing fish — laterals can look almost like tiny wings.',
    identificationTraits: [
      'Smooth edges on many species (check regional relatives)',
      'Narrow crown with expanded root shoulders',
      'Strong distal curvature on laterals',
    ],
    funFacts: [
      'The cephalofoil may help stereo smell and maneuvering — nature’s multitool.',
      'Hammerhead teeth are prized for clean symmetry.',
    ],
    collectingTips: [
      'Compare with small carcharhinids — hammerheads often feel more “sleek.”',
      'Be mindful of modern protections; prioritize fossil contexts.',
    ],
  },
];

export const TOOTH_BY_ID: Record<string, ToothRecord> = Object.fromEntries(
  TEETH_DATABASE.map((t) => [t.id, t])
);
