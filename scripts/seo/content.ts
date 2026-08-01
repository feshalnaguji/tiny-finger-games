import type { GameId } from '../../src/games/catalog.ts';

export interface GameCopy {
  /** Browser-tab / search-result title, unique per game. */
  metaTitle: string;
  /** <=160 chars, unique per game. */
  metaDescription: string;
  keywords: string[];
  skills: string[];
  ageRange: string;
  /** 150-250 words total of parent-facing prose. */
  paragraphs: string[];
  howToPlay: string[];
}

export const gameCopy: Record<GameId, GameCopy> = {
  'bubble-pop': {
    metaTitle: 'Bubble Pop — Free Bubble Popping Game for Babies & Toddlers | Tiny Paws',
    metaDescription:
      'Pop floating bubbles with a tap, a swipe, or any key. A free, ad-free bubble popping game for babies and toddlers that works in any browser.',
    keywords: [
      'bubble popping game for babies',
      'bubble game for toddlers',
      'keyboard smash game',
      'free baby games online',
    ],
    skills: ['cause and effect', 'hand-eye coordination', 'fine motor'],
    ageRange: '1–4',
    paragraphs: [
      'Iridescent bubbles drift gently up the screen, and every one of them wants to be popped. A tap bursts a bubble into a splash of droplets with a satisfying pop — big bubbles boom low, tiny ones squeak high, so your child is learning about size and sound without anyone teaching a lesson. Sweeping a finger across the screen pops everything in its path, which delights toddlers who prefer the scribble approach to the precision approach.',
      'Bubble Pop is also a genuine keyboard smash game: any key on the keyboard pops a bubble too, so babies who love hammering the laptop get the same joy as tablet tappers. Nothing can go wrong — bubbles that escape simply pop themselves at the top of the screen, there is no score, no timer, and no way to lose. It is the first game most families open, and the one they come back to.',
    ],
    howToPlay: [
      'Tap a bubble to pop it, or sweep a finger through several at once',
      'Smash any keyboard key — every press pops a bubble',
      'Gamepad buttons work too; bigger bubbles make deeper pops',
    ],
  },
  'rainbow-piano': {
    metaTitle: 'Rainbow Piano — Free Toddler Piano Online | Tiny Paws',
    metaDescription:
      'Eight rainbow bars, one octave of C major, zero wrong notes. A free toddler piano for browser with glissandos, keyboard play, and even real MIDI keyboards.',
    keywords: [
      'toddler piano online',
      'baby piano game',
      'free music game for kids',
      'MIDI piano for kids',
    ],
    skills: ['musical exploration', 'pitch awareness', 'creativity'],
    ageRange: '1–4',
    paragraphs: [
      'Eight full-height rainbow bars fill the screen, each with a friendly animal at its foot, and each playing one note of the C-major scale. Tap a bar and it lights up, bounces, and sings; drag a finger across the whole rainbow and you get a glissando that sounds like a harp falling down the stairs, in a good way. Because every note belongs to the same scale, there are no wrong notes — whatever a toddler plays sounds like music.',
      'Little pianists can also use the computer keyboard, where every key lands somewhere melodic, and if you own a real MIDI keyboard you can plug it in from the parent panel: actual pitches map to the matching rainbow bars, which makes Rainbow Piano a genuine first instrument. With spoken words switched on, tapped bars can call out their solfège names — do, re, mi — planting seeds for later.',
    ],
    howToPlay: [
      'Tap bars to play notes; drag across for a glissando',
      'Any computer key plays a note from the scale',
      'Connect a MIDI piano from the parent panel for real-pitch play',
    ],
  },
  'drum-time': {
    metaTitle: 'Drum Time — Free Baby Drum Kit Game Online | Tiny Paws',
    metaDescription:
      'Five giant drum pads — kick, snare, hi-hat, woodblock, shaker — fully multi-touch so two little hands (or two kids) can drum together free in the browser.',
    keywords: ['baby drum game', 'toddler drum kit online', 'free rhythm game for kids'],
    skills: ['rhythm', 'bilateral coordination', 'gross motor'],
    ageRange: '1–4',
    paragraphs: [
      'Five oversized drum pads sit ready for small hands: a booming kick drum in the middle, a crisp snare, a bright hi-hat, a clacking woodblock, and a swishing shaker. Each pad squashes and bounces when struck and throws a little puff of confetti, because drums should be as fun to watch as they are to hear. The sounds are synthesized to be punchy but never harsh, and a built-in compressor means even the most enthusiastic drum solo cannot get painfully loud.',
      'Drum Time is fully multi-touch, which matters more than it sounds: both hands can drum at once, and two children can share the screen without the game missing a beat. Keyboard keys and gamepad buttons trigger drums as well, mapped consistently so the same key always plays the same drum — the beginnings of intentional rhythm, disguised as noise.',
    ],
    howToPlay: [
      'Tap the pads — every pad has its own drum sound',
      'Use both hands at once; multi-touch catches every hit',
      'Keyboard keys play drums too, same key = same drum',
    ],
  },
  'animal-friends': {
    metaTitle: 'Animal Friends — Free Animal Sounds Game for Toddlers | Tiny Paws',
    metaDescription:
      'Tap a cow, hear it moo. Eight friendly animals with playful calls and spoken names — a free, ad-free animal sounds game for babies and toddlers.',
    keywords: [
      'animal sounds game for toddlers',
      'animal games for babies',
      'farm animal sounds online free',
    ],
    skills: ['vocabulary', 'animal recognition', 'listening'],
    ageRange: '1–3',
    paragraphs: [
      'Eight big animal cards — cat, dog, cow, duck, sheep, frog, bird, and lion — wait in a grid for a tap. Touch one and it wiggles with delight, plays its cartoon call, and (with spoken words on) announces itself: "Cow says moo!" The calls are synthesized in a warm, cartoonish register that toddlers find funnier than realistic recordings, and the lion is exactly as roary as a one-year-old can handle.',
      'One deliberate design choice parents notice: the animals never move house. Positions stay fixed forever because toddlers navigate by spatial memory — the cow lives top-right, and that certainty is comforting. Colors refresh with every tap to keep the grid lively, an idle animal occasionally wiggles to invite attention, and every key on the keyboard is mapped to its own animal, so keyboard smashing tours the whole farm. When your child starts naming the animals before the site does, graduate to Guess the Sound next door.',
    ],
    howToPlay: [
      'Tap an animal to hear its call and its name',
      'Every keyboard key belongs to one animal — same key, same friend',
      'Positions never change, so little ones learn where everyone lives',
    ],
  },
  'space-smash': {
    metaTitle: 'Space Smash — Keyboard Smash Game for Babies | Tiny Paws',
    metaDescription:
      'Every key press or tap launches rockets, planets, aliens, and giant spoken letters over a starfield. The classic baby keyboard smash game, made bigger.',
    keywords: [
      'keyboard smash game for babies',
      'baby keyboard game',
      'space game for toddlers',
      'letter game for babies',
    ],
    skills: ['cause and effect', 'letter exposure', 'visual tracking'],
    ageRange: '1–4',
    paragraphs: [
      'Space Smash is the game for babies who believe keyboards exist to be hammered. Every key press — every single one — makes something happen in the night sky: rockets whoosh across, planets boing in and drift away, a silly alien wobbles past, or a burst of stars sprays from nowhere. Letters and numbers appear giant and colorful when their keys are pressed, and with spoken words on, the site says them aloud, which is how more than one family has discovered their toddler quietly learning the alphabet.',
      'Screen taps work exactly like key presses, so the game plays the same on a tablet, and the starfield slowly fills with stars the longer the smashing continues — a tiny universe built out of chaos. There is no goal and no failure; it is pure cause and effect at the age where cause and effect is the entire curriculum.',
    ],
    howToPlay: [
      'Smash any key — rockets, planets, aliens, and stars appear',
      'Letter keys show giant letters and speak them aloud',
      'Taps anywhere do the same on touchscreens',
    ],
  },
  'finger-paint': {
    metaTitle: 'Finger Paint — Free Finger Painting Game Online | Tiny Paws',
    metaDescription:
      'Every finger is a rainbow brush that plays gentle notes as it draws. Free online finger painting for toddlers with nothing to set up and nothing to clean.',
    keywords: [
      'finger painting game online free',
      'drawing game for toddlers',
      'baby art game browser',
    ],
    skills: ['creativity', 'fine motor', 'color exploration'],
    ageRange: '1–4',
    paragraphs: [
      'Touch the dark canvas and a thick rainbow ribbon follows your finger, cycling through colors as it goes and trailing tiny sparkles. Drawing makes music too: gentle notes play as the line moves, pitched higher near the top of the screen and lower near the bottom, so a scribble is also a little melody. Multi-touch means five fingers paint five ribbons at once, which toddlers discover within seconds.',
      'There are no brushes to choose, no colors to pick, and — the part parents appreciate — nothing to clean up. Strokes fade away on their own over about forty-five seconds, so the canvas never fills and never needs clearing, and no drawing can ever be ruined because every drawing is already leaving. Key presses splat little paint dabs for keyboard-loving babies. It is the closest a screen gets to the joy of finger paints without the laundry afterward.',
    ],
    howToPlay: [
      'Draw with a finger — the rainbow follows and music plays',
      'Use several fingers at once for several ribbons',
      'Old strokes fade by themselves; keys splat paint dabs',
    ],
  },
  fireworks: {
    metaTitle: 'Fireworks — Free Fireworks Game for Kids | Tiny Paws',
    metaDescription:
      'Tap the sky and a firework flies to exactly that spot — spheres, rings, hearts, and willows with whistles and booms. Free, safe, and spectacular.',
    keywords: [
      'fireworks game for kids',
      'fireworks game online free',
      'new year game for toddlers',
    ],
    skills: ['cause and effect', 'anticipation', 'visual tracking'],
    ageRange: '1–4',
    paragraphs: [
      'Tap anywhere in the night sky and a shell whistles up from the bottom of the screen to burst exactly where the finger touched — spheres, rings, hearts, and slow-falling willows in colors that never repeat. The whistle-then-boom rhythm teaches anticipation: toddlers quickly learn to hold their breath between launch and burst, and that half-second of suspense is most of the fun.',
      'Holding a finger down launches a lazy volley, keyboard keys fire shells at random spots, and a little moon drifts across the sky for company. The booms are deep but softened by the same loudness limiter that protects ears everywhere in Tiny Paws, so the spectacle stays gentle. Families tell us this one gets heavy rotation every New Year, Diwali, and Fourth of July — a fireworks show with no crowds, no noise anxiety, and no bedtime compromise.',
    ],
    howToPlay: [
      'Tap the sky — the firework bursts exactly where you touched',
      'Hold a finger down for a continuous volley',
      'Any key launches a shell somewhere surprising',
    ],
  },
  peekaboo: {
    metaTitle: 'Peekaboo — Free Peekaboo Game Online for Babies | Tiny Paws',
    metaDescription:
      'Four doors, somebody new behind each one. The classic object-permanence game babies adore, free in the browser with animal sounds and giggles.',
    keywords: ['peekaboo game online', 'baby games 1 year old', 'object permanence game'],
    skills: ['object permanence', 'anticipation', 'social play'],
    ageRange: '1–2',
    paragraphs: [
      'Peekaboo is the oldest game in the world, and this is its browser edition: four big colored doors, each hiding somebody new. Tap a door and it swings open — a lion! It roars, the site says "Peekaboo!", there is a giggle, and the door closes again in a new color, ready for the next reveal. Behind the doors live animals, friendly faces, and the occasional teddy bear, chosen fresh each time.',
      'Developmentally, this is the game for the youngest players in the Tiny Paws collection. Around their first birthday, children are consolidating object permanence — the astonishing discovery that hidden things still exist — and peekaboo is that discovery made playable. The doors never do anything scary, wrong taps do not exist, and each key on the keyboard opens its own door for babies who play at the laptop.',
    ],
    howToPlay: [
      'Tap a door to see who is hiding behind it',
      'Doors change color after every visit',
      'Keyboard keys open doors too',
    ],
  },
  'little-aquarium': {
    metaTitle: 'Little Aquarium — Calm Fish Game for Toddlers | Tiny Paws',
    metaDescription:
      'A gentle fish tank where taps delight the fish and sprinkle food. The calmest game in the collection — free, ad-free, and perfect for winding down.',
    keywords: ['fish game for toddlers', 'calm games for kids', 'aquarium game online free'],
    skills: ['calm focus', 'observation', 'gentle interaction'],
    ageRange: '1–4',
    paragraphs: [
      'Seven fish idle around a peaceful tank — a shark who would not hurt a fly, a pufferfish, an octopus, a crab — while bubbles rise past swaying coral. Tap a fish and it wiggles happily and darts a little loop, streaming bubbles. Tap open water and food sprinkles down from that spot; nearby fish turn and chase it, nibbling with tiny chomps. Press any key and food scatters from the surface.',
      'Little Aquarium is deliberately the lowest-stimulation game in Tiny Paws. Nothing flashes, nothing hurries, and if your child just watches, the tank is a pleasant living screensaver. Parents reach for it in waiting rooms, on planes, and in the wind-down before dinner — the moments when you want a screen to lower the temperature of the room rather than raise it. Pairs beautifully with Sleepy Stars as the calm end of the collection.',
    ],
    howToPlay: [
      'Tap a fish to delight it; it wiggles and darts a loop',
      'Tap open water to sprinkle food the fish will chase',
      'Any key scatters food from the surface',
    ],
  },
  'feed-the-monster': {
    metaTitle: 'Feed the Monster — Free Feeding Game for Toddlers | Tiny Paws',
    metaDescription:
      'A friendly monster whose eyes follow your finger. Tap fruit and it flies into his mouth — chomps, bulging cheeks, and tiny burps. Free and adorable.',
    keywords: ['feed the monster game', 'feeding game for toddlers', 'monster game for kids free'],
    skills: ['cause and effect', 'empathy play', 'hand-eye coordination'],
    ageRange: '1–3',
    paragraphs: [
      'A big, round, resolutely friendly monster sits in the middle of the screen, and his eyes follow your child’s finger wherever it goes — which is worth the visit all by itself. Fruit drifts around the edges; tap an apple and it flies into his opening mouth with a chomp, his cheeks bulge pink, and his eyes squeeze into happy little arcs. Every five fruits he produces a tiny, comical burp, giggles, and gets right back to being hungry.',
      'The monster is never full and never unhappy, because feeding games at this age are really empathy games: your toddler is taking care of someone, and that someone is always, reliably delighted. Fruit respawns forever, keyboard keys fling fruit across the screen for laptop players, and there is no possible way to feed him wrong. Expect your toddler to wave at him, talk to him, and request to say goodnight to him before bed.',
    ],
    howToPlay: [
      'Tap any fruit — it flies into the monster’s mouth',
      'Watch his eyes follow your finger around the screen',
      'Every fifth fruit earns a tiny burp and a giggle',
    ],
  },
  'shape-party': {
    metaTitle: 'Shape Party — Free Shapes Game for Toddlers | Tiny Paws',
    metaDescription:
      'Match floating shapes to the dashed outline — circles, stars, hearts. Wrong taps just jiggle happily. A no-fail shapes game for ages 1 to 4, free.',
    keywords: [
      'shapes game for toddlers',
      'shape matching game free',
      'learning shapes online kids',
    ],
    skills: ['shape recognition', 'matching', 'visual discrimination'],
    ageRange: '1–4',
    paragraphs: [
      'A large dashed outline — a circle, a star, a heart, a square, a triangle — sits in the middle of the screen while colorful shapes drift around it. Tap a shape that matches the outline and it glides in, snaps into place with a chime, and the screen celebrates with confetti before the next outline appears. Tap a shape that does not match and it simply jiggles, pleased to be included. There is no buzzer in this game, because there is no buzzer in this entire site.',
      'That single design decision lets Shape Party grow with your child. At one, it is a smash toy where everything wiggles delightfully. At two, the snap-and-confetti pattern starts to register. At three, it is a genuine matching game being played on purpose. Same game, no settings, no levels — the child brings the difficulty.',
    ],
    howToPlay: [
      'Look at the dashed outline in the middle',
      'Tap the floating shape that matches — it snaps in with a chime',
      'Wrong shapes jiggle happily; nothing ever buzzes',
    ],
  },
  'star-catcher': {
    metaTitle: 'Star Catcher — Comet Trail Game for Toddlers | Tiny Paws',
    metaDescription:
      'Drag a finger and it becomes a glowing comet; swept-up stars play a rising melody. A dreamy, musical catching game for little hands, free in browser.',
    keywords: ['star game for kids', 'catching game for toddlers', 'night sky game free'],
    skills: ['tracking and sweeping', 'melody exposure', 'smooth pursuit'],
    ageRange: '1–4',
    paragraphs: [
      'Golden stars drift slowly down a violet night sky. Touch the screen and your child’s finger becomes a comet with a glowing purple tail; sweep it near a star and the star is caught with a musical note — and here is the secret — every catch plays the next note of a rising melody, so gathering stars composes a little tune. Toddlers cannot hear it as composition, but they absolutely hear that catching feels like music.',
      'Stars that reach the ground are not lost; they bounce once and burst into gentle glitter, because scarcity has no place in a toddler game. An occasional slow shooting star crosses the sky purely for wonder. Keys catch the lowest star for keyboard players. Star Catcher lives in the dreamy middle of the collection: more active than Sleepy Stars, more serene than Fireworks.',
    ],
    howToPlay: [
      'Drag a finger — it becomes a glowing comet',
      'Sweep near stars to catch them; each catch continues a melody',
      'Grounded stars burst into harmless glitter — nothing is lost',
    ],
  },
  'beep-beep-cars': {
    metaTitle: 'Beep Beep Cars — Free Car Game for Toddlers | Tiny Paws',
    metaDescription:
      'Tap to send cars, buses, and fire trucks driving across a sunny road; tap them again for honks. A free vehicle game for toddlers who love things that go.',
    keywords: [
      'car games for toddlers online',
      'vehicle games for kids free',
      'truck game for 2 year old',
    ],
    skills: ['vehicle vocabulary', 'tracking', 'cause and effect'],
    ageRange: '1–4',
    paragraphs: [
      'Some toddlers are car people, and they know who they are. Beep Beep Cars gives them a sunny three-lane road under a rotating sun: tap anywhere and a vehicle drives across with a putt-putt engine — a taxi, a school bus, a fire truck, a tractor, a police car. Tap a moving vehicle and it answers with a classic two-tone honk, bounces on its wheels, and puffs out little music notes.',
      'The joy here is traffic conducting: with vehicles entering from both directions across three lanes, an enthusiastic toddler can fill the road and preside over a merry, honking jam of their own making. Every key press dispatches another vehicle, so keyboard smashing builds rush hour all by itself. Vehicle names make excellent early words — bus, truck, taxi, tractor — and parents report the fire truck is always, always the favorite. Clouds drift by overhead, and the sun turns slowly, because even traffic jams deserve nice weather.',
    ],
    howToPlay: [
      'Tap the road to send a new vehicle driving across',
      'Tap a moving vehicle to make it honk and bounce',
      'Keys dispatch vehicles too — build a happy traffic jam',
    ],
  },
  'pop-pad': {
    metaTitle: 'Pop Pad — Free Pop It Fidget Game Online | Tiny Paws',
    metaDescription:
      'A pop-it fidget board in the browser: squishy buttons with satisfying pitch-mapped pops. Pop them all for confetti. Free sensory play for toddlers.',
    keywords: ['pop it game online free', 'pop it for toddlers', 'sensory game for kids browser'],
    skills: ['sensory regulation', 'finger isolation', 'completion'],
    ageRange: '1–4',
    paragraphs: [
      'Pop Pad is the beloved pop-it fidget toy, translated faithfully to the screen: a grid of twenty squishy rainbow buttons that press in with a deeply satisfying pop and press back out again. Like the real toy, pitch follows position — bottom rows pop deeper, top rows pop brighter — so running a finger along a row plays a little scale of pops. Multi-touch means whole hands work.',
      'There is one tiny, optional goal: pop every button and the board celebrates with confetti and chimes, then un-pops itself in a rippling wave that is arguably more satisfying than the popping. Keyboard keys pop random buttons, so this works at the laptop too. Of everything in Tiny Paws, Pop Pad is the purest sensory toy — no characters, no story, just the ancient human joy of pressing a button that feels good.',
    ],
    howToPlay: [
      'Press buttons — they pop in and out like a real pop-it',
      'Lower rows pop deeper, upper rows pop brighter',
      'Pop every button for confetti and a rippling reset',
    ],
  },
  'garden-friends': {
    metaTitle: 'Garden Friends — Free Flower Garden Game for Kids | Tiny Paws',
    metaDescription:
      'Tap the meadow and flowers spring up with musical notes; a bee and butterfly fly over to visit each new bloom. Gentle gardening, free in the browser.',
    keywords: ['garden game for kids', 'flower game for toddlers', 'nature game online free'],
    skills: ['nurturing play', 'cause and effect', 'gentle observation'],
    ageRange: '1–4',
    paragraphs: [
      'Tap anywhere on the sunny meadow and a flower springs up on the spot with a happy rising note — a tulip, a sunflower, a hibiscus, a daisy, chosen by the meadow’s mood. Then the residents take notice: a bee and a butterfly patrol the garden and fly over to circle each newest bloom, which means your child’s action summons not just a flower but visitors for it. That little chain of consequence is the quiet magic of the game.',
      'The garden holds about twenty flowers; plant beyond that and the oldest bloom retires in a gentle puff of petals, so the meadow refreshes itself forever and there is nothing to manage. Wind sways everything, clouds amble by, and key presses plant flowers in surprising places. Garden Friends sits with Little Aquarium at the tender end of the collection — nurture, not noise.',
    ],
    howToPlay: [
      'Tap the meadow — a flower grows right there',
      'Watch the bee and butterfly visit your newest bloom',
      'Keys plant flowers in surprise spots',
    ],
  },
  'first-words': {
    metaTitle: 'First Words — Free First Words Game for Babies | Tiny Paws',
    metaDescription:
      'Big everyday things that say their names when tapped — apple, ball, duck, moon. A free first vocabulary game for babies and toddlers, no reading needed.',
    keywords: [
      'first words game for babies',
      'vocabulary game for toddlers',
      'learning words game free',
    ],
    skills: ['vocabulary', 'word-object mapping', 'listening'],
    ageRange: '1–3',
    paragraphs: [
      'Six big, familiar things sit on friendly pastel cards: an apple, a ball, a duck, the moon — drawn from a pool of eighteen everyday objects chosen for being toddler-world words. Tap one and it bounces while the site says its name clearly and warmly. That is the entire game, and that is precisely the point: word-object mapping, the foundation of vocabulary, practiced through the one gesture every toddler has mastered.',
      'After ten taps the set slides away and six new things arrive with a chime, keeping curiosity fed without overwhelming choice. Every keyboard key is tied to a card, so keyboard-smashing babies hear words too. First Words pairs naturally with Animal Friends (animal names) and Color Pop (color names) to form the site’s little language corner — and like everything in Tiny Paws, it requires zero reading and permits zero failure.',
    ],
    howToPlay: [
      'Tap a picture to hear its name spoken',
      'After ten taps, six new things slide in',
      'Keyboard keys speak words too',
    ],
  },
  'color-pop': {
    metaTitle: 'Color Pop — Free Learning Colors Game for Toddlers | Tiny Paws',
    metaDescription:
      '"Find the blue ones!" Touch the target color and every matching dot celebrates. A no-fail learning colors game for toddlers, free in any browser.',
    keywords: [
      'learning colors game toddler',
      'color games for 2 year olds',
      'color recognition game free',
    ],
    skills: ['color recognition', 'listening comprehension', 'matching'],
    ageRange: '2–4',
    paragraphs: [
      'A big pulsing swatch appears at the top of the screen while a friendly voice asks for a color — "Find blue!" Below, a dozen soft dots in red, blue, yellow, and green float and bob. Touch a blue dot and every blue dot on the screen celebrates and pops in a burst of confetti while the voice cheers; then a new color takes the stage. Touch any other color and something kinder than a buzzer happens: the dot jiggles and the voice simply names it — "Red" — turning every miss into a lesson.',
      'This gentle structure means younger siblings can play Color Pop as a poke-the-dots toy while older toddlers genuinely practice color recognition, one of the classic milestones of the twos and threes. The four colors were chosen deliberately: they are the four every pediatric checklist starts with.',
    ],
    howToPlay: [
      'Look at the big swatch and listen for the color name',
      'Touch a matching dot — all its friends celebrate together',
      'Other colors just introduce themselves; nothing buzzes',
    ],
  },
  'sleepy-stars': {
    metaTitle: 'Sleepy Stars — Calm Bedtime Game for Toddlers | Tiny Paws',
    metaDescription:
      'A nearly still night sky where touched stars ring soft, slow chimes. The wind-down screen for before bed — free, gentle, and genuinely calming.',
    keywords: [
      'bedtime game for toddlers',
      'calm down game for kids',
      'relaxing game for babies free',
    ],
    skills: ['self-regulation', 'winding down', 'gentle touch'],
    ageRange: '1–4',
    paragraphs: [
      'Sleepy Stars is the deliberate opposite of every other screen your child will see today. A deep-blue night sky holds twenty-six stars that twinkle on slow, sleepy cycles; the moon takes ten real minutes to cross the sky; dark hills sleep along the bottom. Touch a star and it glows softly and rings a single long chime that takes several seconds to fade. Every twelve seconds or so, the sky hums one low note to itself, unprompted.',
      'That is all it does, and that is its entire job. Screens before bed usually wind children up; Sleepy Stars was built to wind them down — a transition ritual between playtime and bedtime, the digital equivalent of dimming the lights. Use it as the last game of the evening, let the chimes get slower and sparser as attention drifts, and hand off to the actual bedtime routine.',
    ],
    howToPlay: [
      'Touch a star — it glows and rings one soft, long chime',
      'The moon crosses the sky over ten slow minutes',
      'The sky hums to itself now and then; nothing needs doing',
    ],
  },
  'counting-pond': {
    metaTitle: 'Counting Pond — Free Counting Game for Toddlers | Tiny Paws',
    metaDescription:
      'Tap and a duck hops into the pond — "One!" "Two!" "Three!" Count to ten with splashes, quacks, and giant numerals. A free counting game for toddlers.',
    keywords: [
      'counting games for toddlers',
      'learn numbers game for kids',
      'counting to ten game free',
      'number games for 2 year olds',
    ],
    skills: ['counting', 'number recognition', 'one-to-one correspondence'],
    ageRange: '2–4',
    paragraphs: [
      'Tap anywhere and a duck arcs into the pond with a splash and a quack while the site counts aloud — "One!" — and a giant friendly numeral appears for a moment. Tap again: "Two!" Each new duck joins the bobbing flotilla until ten ducks fill the water, at which point the whole pond celebrates with confetti and a cheer, the ducks paddle off, and the counting begins again from one.',
      'Underneath the quacking, this is one-to-one correspondence — the foundational math idea that each action maps to exactly one number — taught the only way toddlers accept teaching: as a direct consequence of something fun they did. The spoken number, the numeral shape, and the growing crowd of ducks reinforce each other on every tap. Tapping a swimming duck earns a bonus quack, and keyboard keys summon ducks too, so the laptop crowd counts right along.',
    ],
    howToPlay: [
      'Tap the pond — a duck hops in and the site counts aloud',
      'Watch the big numeral appear with every splash',
      'Reach ten ducks for a pond-wide celebration and a fresh start',
    ],
  },
  'guess-the-sound': {
    metaTitle: 'Guess the Sound — Free Animal Sounds Guessing Game | Tiny Paws',
    metaDescription:
      'A mystery animal call plays — who said it? Tap the right animal to celebrate; wrong guesses just introduce themselves. Free listening game for toddlers.',
    keywords: [
      'animal sounds guessing game',
      'listening game for toddlers',
      'guess the animal sound free',
    ],
    skills: ['auditory discrimination', 'animal recognition', 'memory'],
    ageRange: '2–4',
    paragraphs: [
      'A mystery call rings out — a moo, a quack, a roar — and four animals line up looking equally innocent. Who said that? Tap the right one and it owns up proudly with its call, a chime, confetti, and a cheer from the site; a moment later four new suspects assemble and a new call plays. The big golden speaker button replays the sound as many times as little ears need.',
      'Tap the wrong animal and the game does something quietly clever: that animal simply introduces itself with its own voice — "That’s the sheep" — which is not a penalty but a clue, narrowing the mystery while teaching another sound. Guess the Sound is the first Tiny Paws game built on listening rather than looking, exercising the auditory discrimination that later underpins language. It pairs perfectly with Animal Friends, where the same eight voices can be met one at a time.',
    ],
    howToPlay: [
      'Listen to the mystery call, then tap who said it',
      'Press the golden speaker to hear it again',
      'Wrong guesses introduce themselves — every tap teaches something',
    ],
  },
};
