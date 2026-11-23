import type { PostImage } from '@/lib/blog/blog'
import type { PostSource } from '../dataset'

/*
 * The Fashion journal, newest first. `categorySlug` and `authorId` resolve
 * against the sibling files before a post leaves the adapter.
 *
 * `featured` is the handpicked set the home page draws: 1 per section, each
 * one that reads for anyone, since both departments' homes show the same row.
 * The newest pick also leads the journal, and each section leads with its own.
 *
 * `productSlugs` name products in the Fashion catalog, and every story's cover
 * shows the pieces it names. A conversation can name none.
 */

/** Covers and landscape figures share one 4:3 master, 2x the widest slot a cover is drawn in. */
const LANDSCAPE = { width: 1800, height: 1350 }

/** The odd figure shot upright. */
const PORTRAIT = { width: 1440, height: 1800 }

/** A photograph from the journal's folder. */
function photo(name: string, alt: string, size = LANDSCAPE): PostImage {
  return { src: `/demo/fashion/blog/${name}.webp`, alt, ...size }
}

export const fashionPosts: PostSource[] = [
  {
    slug: 'how-to-wash-wool',
    title: 'How to wash wool without shrinking it',
    excerpt:
      'Wool shrinks from heat and rubbing, not from water. Keep it cool and keep your hands still, and a sweater comes out the size it went in.',
    image: photo(
      'how-to-wash-wool',
      'A woman loading a camel sweater in a mesh laundry bag beside a front-loading washing machine',
    ),
    categorySlug: 'care-and-repair',
    authorId: 'nora-vang',
    publishedAt: '2026-09-29',
    featured: true,
    productSlugs: [
      'merino-crew-neck-sweater',
      'oversized-cable-knit-sweater',
      'cashmere-roll-neck-sweater',
      'lambswool-v-neck-sweater',
      'merino-quarter-zip-sweater',
      'wool-blend-scarf',
    ],
    relatedSlugs: ['putting-knits-away', 'at-the-repairs-counter'],
    body: [
      {
        type: 'paragraph',
        text: 'Most of the sweaters that reach our repairs counter shrunken were not washed too often. They were washed too warm, or rubbed while they were wet. Each wool fiber is covered in tiny scales. Heat opens them, friction locks them together, and once they lock they do not let go. That is felting, and it cannot be undone.',
      },
      {
        type: 'paragraph',
        text: 'The good news is that wool needs washing far less than cotton. It resists smells and lets go of most dirt with a brush and a night by an open window.',
      },
      { type: 'heading', text: 'Wash less' },
      {
        type: 'paragraph',
        text: 'Air a sweater after each wear instead of washing it. Hang it over a chair back, not on a hanger, so the shoulders keep their shape. Brush off surface dirt with a soft clothes brush, and spot clean a small mark with cool water and a drop of wool wash. For a knit you wear twice a week, a proper wash every 6 to 8 weeks is plenty.',
      },
      { type: 'heading', text: 'In the machine' },
      {
        type: 'paragraph',
        text: 'A modern machine is gentler than most hands. Its wool cycle fills cold and rocks the drum instead of turning it, so the fibers barely rub. If the label allows a machine wash, use it.',
      },
      {
        type: 'list',
        ordered: true,
        items: [
          'Turn the sweater inside out and zip it into a mesh laundry bag, on its own or with 1 or 2 other knits.',
          'Choose the wool cycle at 30 °C at most, with the spin at 600 or lower.',
          'Use a wool wash. Ordinary detergents often carry enzymes that digest protein, and wool is protein.',
          'Take it out as soon as the cycle ends. A wet knit left in the drum creases and stretches.',
        ],
      },
      { type: 'heading', text: 'By hand' },
      {
        type: 'paragraph',
        text: 'For cashmere, mohair, and anything labeled hand wash only, fill a basin with cool water and a little wool wash. Press the sweater under, leave it for 10 minutes, and rinse it in water at the same temperature. Do not swirl it or scrub it, and press the water out rather than wringing it.',
      },
      { type: 'heading', text: 'Drying flat' },
      {
        type: 'paragraph',
        text: 'Lay the sweater on a dry towel, roll the two up together, and press down along the roll to take out most of the water. Then unroll it onto a fresh towel, out of direct sun and away from the radiator. Pat it back to its own shape with your hands: square the shoulders, straighten the sleeves, ease the ribbing back in.',
      },
      {
        type: 'image',
        image: photo('wool-drying-flat', 'A camel merino sweater laid flat to dry on a white towel on a green table'),
        caption: 'Flat, on a towel, and smoothed back into shape. Turn it over once the top is dry.',
      },
      {
        type: 'paragraph',
        text: 'A hanger stretches a wet knit by a size in an afternoon, and a tumble dryer shrinks it in 20 minutes. However you washed it, dry it flat.',
      },
      {
        type: 'quote',
        text: 'If you would not put your hand in the water for a minute, do not put the sweater in it.',
        attribution: 'Nora Vang, at the repairs counter',
      },
      {
        type: 'paragraph',
        text: 'And if it does go wrong, bring it in. We cannot unshrink a sweater, but we can tell you what happened, and a hole from a moth or a frayed cuff we mend for free.',
      },
    ],
  },
  {
    slug: 'layering-for-the-in-between-weeks',
    title: 'Layering for the in-between weeks',
    excerpt:
      'Cold at 8, warm by noon, raining by 5. A shirt, a knit, and an overshirt cover all three, and each one comes off on its own.',
    image: photo(
      'layering-for-the-in-between-weeks',
      'A woman in an ecru cardigan over a blue shirt and a man in a brown corduroy overshirt walking along a harbor of colorful houses',
    ),
    categorySlug: 'style-notes',
    authorId: 'ida-lund',
    publishedAt: '2026-09-24',
    featured: true,
    productSlugs: [
      'fitted-button-up-cardigan',
      'oversized-poplin-shirt',
      'corduroy-overshirt',
      'merino-crew-neck-sweater',
      'quilted-liner-jacket',
      'wool-blend-scarf',
    ],
    body: [
      {
        type: 'paragraph',
        text: 'In Copenhagen, September and October are the hardest months to dress for. The morning wants a coat and the afternoon wants a T-shirt. The answer is not a lighter coat. It is 3 thinner layers that you can take off one at a time.',
      },
      { type: 'heading', text: 'Start with a shirt' },
      {
        type: 'paragraph',
        text: 'The layer against your skin should be the one you would be happy to end the day in. A cotton poplin shirt breathes, washes easily, and looks finished on its own once everything else comes off. Cut it a little loose, so a knit over it does not pull it tight across the back.',
      },
      { type: 'heading', text: 'Add warmth in the middle' },
      {
        type: 'paragraph',
        text: 'The middle layer does most of the work. A fine merino crew neck or a button-up cardigan holds warmth without bulk, and a cardigan has an advantage: you can open it. Wool also keeps you warm when it is a little damp, which matters on the walk home.',
      },
      { type: 'heading', text: 'Finish with something that opens' },
      {
        type: 'paragraph',
        text: 'On top, choose a layer that buttons or zips all the way down. An overshirt in corduroy or a quilted liner turns away wind and light rain, and worn open it hardly counts as a coat at all. By lunch it goes over your arm, not into your bag.',
      },
      {
        type: 'list',
        items: [
          'Keep the layers thin to thick, inside to outside, so each one slides over the last.',
          'Mix textures, not colors: poplin, merino, and corduroy in 3 neutrals look intentional together.',
          'Let the shirt collar sit outside the knit. It frames the face and keeps the wool off your neck.',
          'A scarf is the fourth layer, and the one that packs smallest.',
        ],
      },
      {
        type: 'paragraph',
        text: 'None of this needs new clothes. Most wardrobes already hold a shirt, a sweater, and a jacket that opens. The trick is wearing them together on the same day.',
      },
    ],
  },
  {
    slug: 'a-week-at-the-porto-atelier',
    title: 'A week at the atelier in Porto',
    excerpt:
      'Every shirt we sell is cut, sewn, and pressed by 22 people in a converted printworks in Porto. We spent a week watching them work.',
    image: photo(
      'a-week-at-the-porto-atelier',
      'A young seamstress sewing a white shirt in a sunlit atelier, beside a rail of blue, yellow, and white shirts',
    ),
    categorySlug: 'the-making',
    authorId: 'rui-teixeira',
    publishedAt: '2026-09-18',
    featured: true,
    productSlugs: [
      'relaxed-linen-shirt',
      'oversized-poplin-shirt',
      'oxford-button-down-shirt',
      'washed-linen-shirt',
      'slim-poplin-dress-shirt',
      'striped-poplin-shirt',
    ],
    relatedSlugs: ['a-tailor-in-porto', 'where-our-linen-comes-from'],
    body: [
      {
        type: 'paragraph',
        text: 'The atelier sits on the second floor of an old printworks, 3 streets from our Porto store. It has sewn our shirts since the first collection in 2016, and it is run by the same family that opened it in 1987. Today 22 people work there. Most of them have been there longer than we have existed.',
      },
      { type: 'heading', text: 'Monday: cutting' },
      {
        type: 'paragraph',
        text: 'The week starts at the long table by the windows. Cloth is laid out in up to 40 layers, and the pattern pieces are marked by hand rather than by machine. It is slower, but a cutter can shift a piece to miss a flaw in the weave, and a machine cannot see one.',
      },
      { type: 'heading', text: 'Tuesday to Thursday: sewing' },
      {
        type: 'paragraph',
        text: 'A shirt passes through 9 pairs of hands. One person sets collars and does nothing else, and she can tell a good collar from a bad one by touch. Seams are sewn at 6 stitches to the centimeter, which is slow but makes a seam that lies flat and does not pucker after the first wash.',
      },
      {
        type: 'image',
        image: photo(
          'porto-atelier-stitching',
          'Hands guiding white poplin under a sewing machine foot along a shirt collar',
        ),
        caption: 'The collar is the hardest part of a shirt, and the first thing anyone notices about it.',
      },
      {
        type: 'paragraph',
        text: 'Buttonholes come last, on a machine that does nothing else. The buttons are sewn with a shank, a few turns of thread under the button, so they sit high enough to fasten easily and do not tear the cloth when you do.',
      },
      { type: 'heading', text: 'Friday: pressing and checking' },
      {
        type: 'paragraph',
        text: 'Every shirt is pressed by hand and checked against its pattern. About 1 in 50 goes back for a seam to be resewn. Nothing leaves the building with a fault we know about.',
      },
      {
        type: 'image',
        image: photo(
          'porto-atelier-shirts',
          'A rail of finished shirts in white, cobalt, yellow, and ecru against a terracotta wall',
          PORTRAIT,
        ),
        caption: 'Finished, tagged, and waiting for the Monday van to Copenhagen.',
      },
      {
        type: 'quote',
        text: 'We do not make many shirts. We make them so they come back to be mended, not to be replaced.',
        attribution: 'Ana Ferreira, who runs the atelier',
      },
      {
        type: 'paragraph',
        text: 'We pay the atelier when the shirts are delivered, not 90 days later, and we agree on the price before the cloth is cut. That is less a policy than the reason they still pick up the phone when we call.',
      },
    ],
  },
  {
    slug: 'at-the-repairs-counter',
    title: 'At the repairs counter with Nora Vang',
    excerpt:
      'Behind the Bredgade store is a counter where anything we have sold comes back to be mended. Its keeper on moths, elbows, and the repairs she refuses.',
    image: photo(
      'at-the-repairs-counter',
      'A woman darning the elbow of a powder blue sweater in cobalt yarn at a terracotta counter',
    ),
    categorySlug: 'conversations',
    authorId: 'ida-lund',
    publishedAt: '2026-09-11',
    featured: true,
    relatedSlugs: ['why-we-resole', 'how-to-wash-wool'],
    body: [
      {
        type: 'paragraph',
        text: 'Since 2018 we have mended anything we have ever sold, at no charge. Most of that work happens at a wooden counter at the back of our first store, on Bredgade. Nora Vang has run it since the day it opened. We sat with her for an afternoon while she worked.',
      },
      { type: 'heading', text: 'What comes in most?' },
      {
        type: 'paragraph',
        text: 'Elbows, by a long way. Then cuffs, then moth holes, then buttons. Elbows go because people lean on desks. Nobody thinks of a desk as rough, but it is the same spot rubbing on the same surface 5 days a week.',
      },
      { type: 'heading', text: 'How do you mend an elbow?' },
      {
        type: 'paragraph',
        text: 'With a darn: you weave new yarn across the hole and then through it, like a tiny piece of cloth. I use a darning mushroom to keep the knit stretched, and often a yarn in another color. People ask if I can make it invisible. I can get close, but I would rather they could see it.',
      },
      {
        type: 'image',
        image: photo('repairs-darn', 'A woven darn in mustard yarn on the elbow of a sage green sweater'),
        caption: 'A darn is woven, not patched, so it stretches with the knit around it. This one is meant to show.',
      },
      { type: 'heading', text: 'Is there anything you will not mend?' },
      {
        type: 'paragraph',
        text: 'Very little. A sweater that has felted in a hot wash cannot be saved; the fibers have locked together. A zip I will replace, a lining I will replace, a collar I will turn. If a piece is beyond mending we say so, and we tell the person why, so it does not happen to the next one.',
      },
      {
        type: 'quote',
        text: 'A mended sweater is not a damaged sweater. It is one somebody wanted to keep.',
        attribution: 'Nora Vang',
      },
      { type: 'heading', text: 'What should people do before they come in?' },
      {
        type: 'paragraph',
        text: 'Bring it early. A small hole is 10 minutes. A hole that has been worn for another winter is an afternoon, and sometimes it is too late for a darn. And wash it first, please. I mend a lot of sweaters.',
      },
      {
        type: 'paragraph',
        text: 'You can hand a repair in at either store, or post it to the atelier in Porto with your order number. It comes back to you in about 2 weeks.',
      },
    ],
  },
  {
    slug: 'how-a-jacket-should-fit',
    title: 'How a jacket should fit, in 4 checks',
    excerpt:
      'Shoulders first, because a tailor cannot change them. Then the collar, the front, and the sleeves, which a tailor can.',
    image: photo(
      'how-a-jacket-should-fit',
      'A tailor pinning the shoulder seam of a navy wool jacket on a man against a pale gray wall',
    ),
    categorySlug: 'style-notes',
    authorId: 'ida-lund',
    publishedAt: '2026-09-04',
    productSlugs: [
      'tailored-wool-suit',
      'linen-blend-suit',
      'slim-cotton-suit',
      'oxford-button-down-shirt',
      'slim-poplin-dress-shirt',
      'leather-derby-shoes',
    ],
    relatedSlugs: ['a-tailor-in-porto'],
    body: [
      {
        type: 'paragraph',
        text: 'A jacket that fits looks more expensive than one that cost twice as much and does not. You do not need a tailor to tell the difference. Stand in front of a mirror in the shirt you will wear under it, and check 4 things in this order.',
      },
      { type: 'heading', text: '1. The shoulders' },
      {
        type: 'paragraph',
        text: 'The shoulder seam should end where your shoulder bone ends. Too wide and the sleeve head collapses into a dent just below the seam. Too narrow and you will feel it pull across your back when you reach forward. This is the one thing a tailor cannot fix, so choose the size by the shoulders and alter the rest.',
      },
      { type: 'heading', text: '2. The collar' },
      {
        type: 'paragraph',
        text: 'Turn sideways. The jacket collar should rest against your shirt collar all the way round, with no gap at the back of the neck. A gap usually means the jacket is too big, or that you are standing straighter than you normally do. Relax and look again.',
      },
      { type: 'heading', text: '3. The front, buttoned' },
      {
        type: 'paragraph',
        text: 'Fasten the top button of a 2-button jacket, or the middle one of 3. The fronts should meet flat. If the fabric pulls into an X around the button, the jacket is too small through the middle. If you can fit a fist inside, it is too big.',
      },
      { type: 'heading', text: '4. The sleeves' },
      {
        type: 'paragraph',
        text: 'With your arms at your sides, about 1 cm of shirt cuff should show below the jacket sleeve. Sleeves are the easiest alteration there is, and we shorten them for free in either store.',
      },
      {
        type: 'quote',
        text: 'Buy the shoulders. Everything else is an afternoon with a needle.',
        attribution: 'Marta Moreira, tailor, Porto',
      },
      {
        type: 'paragraph',
        text: 'Length matters too, but less than people think. A jacket that covers your seat suits nearly everyone. Anything shorter is a choice, and you will know if it is yours.',
      },
    ],
  },
  {
    slug: 'suede-after-the-first-rain',
    title: 'Suede after the first rain',
    excerpt:
      'Water does not ruin suede. Heat does, and so does brushing it wet. What to do on the evening of the first downpour.',
    image: photo(
      'suede-after-the-first-rain',
      'Brown suede Chelsea boots and taupe suede ankle boots on a bench by a rain-spotted glass door, between yellow raincoats',
    ),
    categorySlug: 'care-and-repair',
    authorId: 'nora-vang',
    publishedAt: '2026-08-28',
    productSlugs: [
      'suede-western-ankle-boots',
      'suede-chelsea-boots',
      'suede-desert-boots',
      'suede-shopper-bag',
      'suede-trucker-jacket',
      'suede-clog-mules',
    ],
    body: [
      {
        type: 'paragraph',
        text: 'Suede is leather with its surface buffed into a soft nap. It marks easily and it darkens when it gets wet, which is why people treat it as a fair-weather material. It is tougher than it looks. Most suede that comes to us damaged was not rained on. It was dried on a radiator.',
      },
      { type: 'heading', text: 'Before you wear it' },
      {
        type: 'paragraph',
        text: 'Spray new suede with a protector made for it, in 2 light coats from about 20 cm, and let it dry overnight. Repeat every few months. It will not make suede waterproof, but water will bead and roll off instead of soaking in.',
      },
      { type: 'heading', text: 'When it gets wet' },
      {
        type: 'list',
        ordered: true,
        items: [
          'Blot off standing water with a dry cloth. Do not rub.',
          'Stuff shoes and boots with plain paper to hold their shape and draw out moisture.',
          'Leave them to dry at room temperature, away from radiators, fires, and hair dryers. Heat makes suede stiff and brittle.',
          'Once fully dry, brush the nap back up with a suede brush, moving in one direction.',
        ],
      },
      { type: 'heading', text: 'Marks and salt' },
      {
        type: 'paragraph',
        text: 'A dry mark usually lifts with a suede eraser, rubbed gently, then a brush. Winter salt leaves white tide lines: dab them with a cloth barely dampened with water and a little white vinegar, let it dry, and brush. Work on the whole panel rather than the stain alone, so it dries to an even color.',
      },
      {
        type: 'paragraph',
        text: 'Suede darkens and softens with age, and that is part of the point. Shoes that look a little lived in after a year are doing what suede does. If a seam opens or a sole wears through, the repairs counter will see to it.',
      },
    ],
  },
  {
    slug: 'a-tailor-in-porto',
    title: 'The tailor who taught us to cut a shoulder',
    excerpt:
      'Marta Moreira cuts suits in the Porto workshop her grandfather opened in 1976. She agreed to look at our first jacket, and she did not like it.',
    image: photo(
      'a-tailor-in-porto',
      'A tailor chalking a jacket pattern onto navy wool beside a wall of blue and white tiles',
    ),
    categorySlug: 'conversations',
    authorId: 'rui-teixeira',
    publishedAt: '2026-08-20',
    productSlugs: ['tailored-wool-suit', 'pleated-wool-trousers', 'tailored-linen-waistcoat', 'linen-blend-suit'],
    relatedSlugs: ['how-a-jacket-should-fit', 'a-week-at-the-porto-atelier'],
    body: [
      {
        type: 'paragraph',
        text: 'Marta Moreira is 34. Her workshop is a single room above a café near the Bolhão market, with a wall of blue azulejo tiles and brown paper patterns pinned beside it. Her grandfather opened it in 1976, and she has cut suits there since she was 19. In 2020 we brought her the first jacket we had made, and asked what she thought.',
      },
      { type: 'heading', text: 'What did you think?' },
      {
        type: 'paragraph',
        text: 'That it was a good shirt pretending to be a jacket. The cloth was fine. But the shoulder was flat, cut like a box, and it had no idea there was a person inside it. A shoulder is not a corner. It slopes, it rolls forward, and the sleeve has to hang from it, not hang off it.',
      },
      { type: 'heading', text: 'How do you fix a shoulder?' },
      {
        type: 'paragraph',
        text: 'You start before the cloth is cut. The pattern needs a little more length at the back of the armhole than the front, because arms move forward, never backward. Then the sleeve head is eased in, a few millimeters of extra cloth worked into the seam, so it curves over the shoulder instead of folding at it.',
      },
      {
        type: 'quote',
        text: 'Anybody can make a jacket that looks right on a hanger. The hanger does not move.',
        attribution: 'Marta Moreira',
      },
      { type: 'heading', text: 'What should someone look for in a suit?' },
      {
        type: 'paragraph',
        text: 'Lift your arms. If the whole jacket rises with them, the armhole is too low and too big. A good jacket lets your arm move and leaves the body where it is. Then sit down. If the buttons strain, it will not be comfortable at dinner, whatever it looks like in the shop.',
      },
      {
        type: 'paragraph',
        text: 'She redrew our jacket pattern over 3 weeks, at her table, in pencil. Every jacket and waistcoat we have made since starts from it.',
      },
    ],
  },
  {
    slug: 'denim-from-loom-to-fade',
    title: 'Denim, from the loom to the fade',
    excerpt:
      'Our straight-leg jeans start as a 33 cm wide strip of indigo cloth on a shuttle loom. How they end up is mostly up to you.',
    image: photo(
      'denim-from-loom-to-fade',
      'A bolt of indigo selvedge denim on a white cutting table with chalk lines and shears, a pair of jeans on the wall',
    ),
    categorySlug: 'the-making',
    authorId: 'rui-teixeira',
    publishedAt: '2026-08-12',
    productSlugs: [
      'straight-leg-jeans',
      'denim-maxi-skirt',
      'denim-midi-skirt',
      'mid-length-denim-shorts',
      'chambray-work-shirt',
    ],
    body: [
      {
        type: 'paragraph',
        text: 'Most denim today is woven on fast, wide looms that turn out cloth 1.5 meters across. Ours comes from shuttle looms, which weave a narrow strip and turn the weft thread back at each edge. That turn makes a clean, finished edge called a selvedge, and you can see it on the outseam when you roll up the hem.',
      },
      { type: 'heading', text: 'Why the slow loom' },
      {
        type: 'paragraph',
        text: 'Shuttle looms run at a fraction of the speed, and the cloth they make is denser and a little uneven. That unevenness is what gives the fade its character later. The yarn is dyed with indigo in many shallow dips, which colors only its outside and leaves the core white. Every time the cloth is bent or rubbed, a little of the white shows through.',
      },
      { type: 'heading', text: 'Cutting and sewing' },
      {
        type: 'paragraph',
        text: 'Because the cloth is narrow, each leg is cut so the selvedge runs down the outseam. It uses more cloth than a modern pattern, about 3 meters a pair. The seams are felled, folded over and sewn twice, so they will not fray however often you wash them.',
      },
      { type: 'heading', text: 'The fade is yours' },
      {
        type: 'list',
        items: [
          'Wear them for a few months before the first wash. The creases you make become the fades you keep.',
          'Wash them inside out, cold, on their own, and hang them to dry.',
          'Expect some indigo to rub off on pale sofas and white sneakers at first. It stops.',
          'Bring them in when a knee or a seat wears thin. We patch denim from the inside with the same cloth.',
        ],
      },
      {
        type: 'paragraph',
        text: 'A pair worn every day for a year will look like nobody else’s. That is the only promise denim makes, and it always keeps it.',
      },
    ],
  },
  {
    slug: 'wide-leg-trousers-office-to-saturday',
    title: 'Wide-leg trousers, from the office to Saturday',
    excerpt:
      'One pair of pleated trousers, 2 ways to wear them. The secret is in the hem, and in keeping everything above them close.',
    image: photo(
      'wide-leg-trousers-office-to-saturday',
      'A woman in cream pleated wide-leg trousers, an ivory blouse, and a camel sweater over her shoulders against a pale blue wall',
    ),
    categorySlug: 'style-notes',
    authorId: 'ida-lund',
    publishedAt: '2026-07-30',
    productSlugs: [
      'pleated-wide-leg-trousers',
      'silk-blend-blouse',
      'cropped-v-neck-sweater',
      'leather-ballet-flats',
      'slim-leather-belt',
      'linen-straight-trousers',
    ],
    body: [
      {
        type: 'paragraph',
        text: 'Wide-leg trousers have been in our range since the first collection, and they are still the piece people are most unsure about. They worry the width will swallow them. It will not, as long as you get 2 things right.',
      },
      { type: 'heading', text: 'Hem them for your shoes' },
      {
        type: 'paragraph',
        text: 'A wide leg needs to almost reach the floor. Decide which shoes you will wear most, a flat or a low heel, and hem the trousers to clear the ground by a finger’s width in those. Too short and the width looks like a mistake. We hem for free in both stores, so bring the shoes.',
      },
      { type: 'heading', text: 'Keep the top close' },
      {
        type: 'paragraph',
        text: 'The width belongs to the trousers, so keep everything above them neat. Tuck a blouse in, or wear a knit that ends at the waist. A high rise and a belt mark where you are, and the pleats do the rest.',
      },
      { type: 'heading', text: 'For the office' },
      {
        type: 'paragraph',
        text: 'Cream trousers, an ivory silk-blend blouse tucked in, black ballet flats. Drape a camel sweater over your shoulders for the air conditioning. It looks considered and asks almost nothing of you at 7 in the morning.',
      },
      { type: 'heading', text: 'For Saturday' },
      {
        type: 'paragraph',
        text: 'The same trousers with a white T-shirt, the sweater worn properly, and sneakers or sandals. Roll the hem once if you are in flat shoes. Nobody will guess they are the trousers you wore on Tuesday.',
      },
      {
        type: 'paragraph',
        text: 'If the pleats are a step too far, a straight linen trouser follows the same rules and asks even less of you.',
      },
    ],
  },
  {
    slug: 'why-we-resole',
    title: 'Why we resole rather than replace',
    excerpt:
      'A good shoe outlives 3 or 4 soles. Ours are built so the sole comes off without touching the rest, and we replace it for free.',
    image: photo(
      'why-we-resole',
      'A young cobbler fitting a new sole to a cognac leather derby shoe beside a modern finishing machine',
    ),
    categorySlug: 'care-and-repair',
    authorId: 'nora-vang',
    publishedAt: '2026-07-21',
    productSlugs: ['leather-derby-shoes', 'leather-penny-loafers', 'suede-chelsea-boots', 'suede-desert-boots'],
    relatedSlugs: ['at-the-repairs-counter'],
    body: [
      {
        type: 'paragraph',
        text: 'The sole is the part of a shoe that wears out first, and on most shoes it is glued to the rest. When it goes, the shoe goes with it. Our leather shoes are made differently, so that the sole can be replaced as many times as the upper will allow. With care, that is decades.',
      },
      { type: 'heading', text: 'How the shoe is built' },
      {
        type: 'paragraph',
        text: 'Between the upper and the sole sits a narrow strip of leather called a welt. The upper is stitched to the welt, and the sole is stitched to the welt, but the upper and the sole never touch. To resole, a cobbler cuts the old stitches, lifts the sole away, and sews a new one to the same welt.',
      },
      {
        type: 'image',
        image: photo(
          'resole-welt',
          'Hands stitching a cognac leather shoe held on a steel last with an awl and waxed thread',
        ),
        caption: 'Stitched by hand with waxed thread, the way the shoe was first made.',
      },
      { type: 'heading', text: 'When to resole' },
      {
        type: 'paragraph',
        text: 'Look at the ball of the foot. When the sole there feels soft when you press it with a thumb, or you can see the stitching wearing through, it is time. Do not wait for a hole. Once the wear reaches the welt, the repair is far bigger. Heels wear faster than soles and can be replaced on their own.',
      },
      { type: 'heading', text: 'Making a sole last' },
      {
        type: 'list',
        items: [
          'Rest a pair for a day between wears, so the leather dries out completely.',
          'Keep cedar shoe trees in them. They hold the shape and draw out moisture.',
          'Polish the uppers every few weeks. Leather that is fed does not crack.',
        ],
      },
      {
        type: 'paragraph',
        text: 'Like every repair, resoling is free for anything we have sold. Hand your shoes in at either store, and they come back in about 3 weeks with a new sole and the same shape your feet gave them.',
      },
    ],
  },
  {
    slug: 'the-knitters-of-barcelos',
    title: 'The knitters of Barcelos',
    excerpt:
      'Our hand-finished knits pass through a village outside Barcelos, where 9 women sew every seam by hand. We asked them what a machine cannot do.',
    image: photo(
      'the-knitters-of-barcelos',
      'A young woman hand-sewing the seam of a cream cable-knit sweater on whitewashed steps beside red geraniums',
    ),
    categorySlug: 'conversations',
    authorId: 'rui-teixeira',
    publishedAt: '2026-07-09',
    productSlugs: [
      'open-knit-sweater',
      'bobble-knit-sweater',
      'chunky-cable-knit-sweater',
      'cable-knit-crew-sweater',
      'waffle-knit-vest',
    ],
    body: [
      {
        type: 'paragraph',
        text: 'Our sweaters are knitted in panels on machines at a mill in northern Portugal. Then they go somewhere unusual: to a group of 9 women in a village outside Barcelos, who join the panels and finish every edge by hand. Some of them have done this work for 40 years.',
      },
      { type: 'heading', text: 'Why by hand?' },
      {
        type: 'paragraph',
        text: 'A machine joins knit panels with an overlocked seam. It is fast, but it is stiff, and it makes a ridge you can feel on the inside. Joined by hand, stitch by stitch, the seam is part of the knit. It stretches with the sweater and you cannot find it with your eyes closed.',
      },
      {
        type: 'quote',
        text: 'The machine does not know where the shoulder is. I do.',
        attribution: 'Dona Fernanda, who has finished knits since 1984',
      },
      { type: 'heading', text: 'What takes longest?' },
      {
        type: 'paragraph',
        text: 'The cables. Where 2 cabled panels meet at the side, the twists have to line up, or the pattern looks broken. Each one is matched by eye. A chunky cable-knit takes one woman most of a day to finish.',
      },
      { type: 'heading', text: 'What would they change?' },
      {
        type: 'paragraph',
        text: 'They asked us to keep the undyed yarns. Wool left its natural color is softer to work, and they like that the sweater they hold is the color of the sheep it came from. We agreed. 5 of our knits now come undyed.',
      },
      {
        type: 'paragraph',
        text: 'We visit every few months, and we pay by the piece at a rate they set. When we asked if younger people in the village are learning, the answer was 2 of them. One, Inês, is 24, and nobody matches a cable faster.',
      },
    ],
  },
  {
    slug: 'the-first-12-ten-years-on',
    title: 'The first 12, 10 years on',
    excerpt:
      'In 2016 we made 12 pieces in a Copenhagen basement. All 12 are still in the range. What changed in them, and what we refused to change.',
    image: photo(
      'the-first-12-ten-years-on',
      'A clothing rail of 12 simple garments against a sage green wall in hard sunlight',
    ),
    categorySlug: 'the-making',
    authorId: 'mette-holm',
    publishedAt: '2026-06-24',
    productSlugs: [
      'breton-stripe-top',
      'heavyweight-cotton-tee',
      'oxford-button-down-shirt',
      'straight-leg-jeans',
      'wool-blend-overcoat',
      'minimal-leather-sneakers',
    ],
    body: [
      {
        type: 'paragraph',
        text: 'Jonas and I started with a rule: a piece only joins the collection if we would still want to wear it in 10 years. In 2016 that was a guess. This summer it is a fact we can check. All 12 of the first pieces are still in the range, and still made by the atelier that first sewed them.',
      },
      { type: 'heading', text: 'What changed' },
      {
        type: 'paragraph',
        text: 'The cloth, mostly. The first Breton top was a cotton we could afford, not the one we wanted. Today it is a heavier organic jersey that holds its shape after 100 washes. The oxford shirt gained 2 cm in the back, after customers told us it rode up when they cycled. The overcoat lost a pocket nobody used.',
      },
      { type: 'heading', text: 'What did not' },
      {
        type: 'paragraph',
        text: 'The shapes. Every year someone suggests making the jeans slimmer, or the overcoat shorter, or the T-shirt boxier, because that is what is selling. We say no. A shape that is in fashion is, by definition, one that will be out of it.',
      },
      {
        type: 'quote',
        text: 'The best compliment we get is a customer who cannot remember when they bought it.',
        attribution: 'Mette Holm',
      },
      { type: 'heading', text: 'What we got wrong' },
      {
        type: 'paragraph',
        text: 'We thought 12 pieces would be enough for a whole wardrobe. It was not. People need more than one kind of trouser, and a sweater that is not navy. The range grew. But the rule never changed, and it has cost us more good ideas than we can count.',
      },
      {
        type: 'paragraph',
        text: 'If you own one of the first 12, we would love to see it. Bring it to Bredgade. We will mend whatever needs mending, and we might ask to take its picture.',
      },
    ],
  },
  {
    slug: 'a-week-by-the-sea-in-one-bag',
    title: 'A week by the sea in one bag',
    excerpt:
      'Linen, a hat, one pair of sandals, and a tote that doubles as the beach bag. A packing list that fits under the seat in front of you.',
    image: photo(
      'a-week-by-the-sea-in-one-bag',
      'A white linen dress, a straw sun hat, tan leather sandals, sunglasses, and a canvas tote on terracotta tiles by a pool',
    ),
    categorySlug: 'style-notes',
    authorId: 'ida-lund',
    publishedAt: '2026-06-12',
    productSlugs: [
      'linen-midi-dress',
      'raffia-sun-hat',
      'woven-leather-sandals',
      'canvas-tote-bag',
      'tortoiseshell-sunglasses',
      'relaxed-linen-shirt',
    ],
    body: [
      {
        type: 'paragraph',
        text: 'Every summer I pack too much and wear a third of it. This year I tried the opposite: 7 days on the coast near Porto with one canvas tote and nothing in the hold. I did not miss anything.',
      },
      { type: 'heading', text: 'Choose linen' },
      {
        type: 'paragraph',
        text: 'Linen is the best fabric to travel with in the heat. It dries in an hour on a balcony, it stays cool against the skin, and it is meant to look a little creased. A linen dress goes from the beach to dinner with a change of shoes, and a linen shirt is a cover-up, a jacket, and a shirt.',
      },
      { type: 'heading', text: 'The list' },
      {
        type: 'list',
        items: [
          'A linen midi dress, worn on the plane.',
          'A relaxed linen shirt and 2 T-shirts.',
          'One pair of shorts and one pair of loose trousers.',
          'A swimsuit, rinsed and dried every evening.',
          'One pair of leather sandals. They take you everywhere a beach town goes.',
          'A wide-brimmed hat, worn rather than packed, and sunglasses.',
        ],
      },
      { type: 'heading', text: 'The bag is part of the outfit' },
      {
        type: 'paragraph',
        text: 'A canvas tote is light enough to carry on, and once you arrive it becomes the beach bag and the market bag. Pack the heaviest things at the bottom and roll everything else. Rolled linen creases less than folded linen, and what creases there are fall out after an hour of wearing.',
      },
      {
        type: 'paragraph',
        text: 'Leave room at the top. You will come home with a jar of something, a book, and a ceramic bowl you did not need, and they have to go somewhere.',
      },
    ],
  },
  {
    slug: 'where-our-linen-comes-from',
    title: 'Where our linen comes from',
    excerpt:
      'Flax grown in Normandy, retted in the fields, and woven near Guimarães. A plant that needs no irrigation, and a fiber that softens for years.',
    image: photo('where-our-linen-comes-from', 'A field of blue-flowering flax under a clear summer sky'),
    categorySlug: 'the-making',
    authorId: 'rui-teixeira',
    publishedAt: '2026-05-28',
    productSlugs: [
      'linen-straight-trousers',
      'linen-camp-collar-shirt',
      'linen-drawstring-trousers',
      'tailored-linen-waistcoat',
      'washed-linen-shirt',
      'linen-midi-dress',
    ],
    relatedSlugs: ['a-week-at-the-porto-atelier', 'a-week-by-the-sea-in-one-bag'],
    body: [
      {
        type: 'paragraph',
        text: 'Linen is made from flax, and most of the world’s best flax grows in a strip of coastal land from Normandy to the Netherlands. The climate there suits it: cool, damp, and mild. The plants need no irrigation at all, only rain, which is a large part of why we use so much of it.',
      },
      { type: 'heading', text: 'From the field' },
      {
        type: 'paragraph',
        text: 'Flax flowers for only a few weeks in June, and each flower lasts a single morning. In July the plants are pulled up by the roots rather than cut, to keep the fibers as long as possible. Then they are left lying in rows in the field for several weeks. Dew and soil bacteria loosen the fibers from the stem. It is called retting, and the farmer’s skill is knowing when to stop it.',
      },
      { type: 'heading', text: 'To the mill' },
      {
        type: 'paragraph',
        text: 'The dried stems are crushed and combed to free the long fibers, which are spun into yarn. Our yarn is woven at a family mill near Guimarães, about an hour from our Porto atelier, on looms set a little slower than most so the cloth comes out dense and even.',
      },
      {
        type: 'image',
        image: photo('linen-loom', 'A modern loom weaving undyed linen in a mill with ochre walls'),
        caption: 'Undyed linen on the loom near Guimarães.',
      },
      { type: 'heading', text: 'And then for years' },
      {
        type: 'paragraph',
        text: 'New linen is crisp. Every wash breaks it in a little more, and a linen shirt is at its best somewhere around its second summer. It is also one of the strongest natural fibers there is, stronger wet than dry, which is why linen sheets get handed down. Wash it at 40 °C, hang it to dry, and do not bother ironing it.',
      },
    ],
  },
  {
    slug: 'five-years-in-one-jacket',
    title: '5 years in one jacket',
    excerpt:
      'Anders bought our field jacket in 2021 and has worn it most days since. We borrowed it back for an afternoon to see what 5 years had done.',
    image: photo(
      'five-years-in-one-jacket',
      'A man in a faded olive field jacket and white T-shirt on a harbor bench with a takeaway coffee',
    ),
    categorySlug: 'conversations',
    authorId: 'ida-lund',
    publishedAt: '2026-05-14',
    productSlugs: ['cotton-field-jacket', 'wool-blend-overcoat', 'suede-trucker-jacket', 'fitted-button-up-cardigan'],
    body: [
      {
        type: 'paragraph',
        text: 'Anders Bech is a primary school teacher in Nørrebro. He bought an olive cotton field jacket from us in the autumn of 2021, and as far as he can tell, he has worn it 4 days out of 5 ever since. When he brought it in to have a pocket mended, we asked if we could talk to him about it.',
      },
      { type: 'heading', text: 'Why that jacket?' },
      {
        type: 'paragraph',
        text: 'I cycle to work and I am outside with the children at every break, in all weather. I wanted one jacket that did all of it. It has 4 pockets, and I use all of them: keys, phone, whistle, and whatever the children hand me.',
      },
      { type: 'heading', text: 'What has changed in 5 years?' },
      {
        type: 'paragraph',
        text: 'It has gone from dark green to something closer to sage. The cuffs are soft now, and the collar has a shape it did not have when I bought it. The cotton feels like an old shirt. People ask where I bought it, which never happened when it was new.',
      },
      {
        type: 'quote',
        text: 'It looks better now than the day I bought it. I cannot say that about anything else I own.',
        attribution: 'Anders Bech',
      },
      { type: 'heading', text: 'What has gone wrong?' },
      {
        type: 'paragraph',
        text: 'A pocket corner tore when I caught it on a bike rack, and a button came off twice. That is all. Both times I brought it here and it was fixed in a week.',
      },
      {
        type: 'paragraph',
        text: 'The repairs counter put a new corner on the pocket in the same cotton, from a roll we keep for exactly this. It was back with him the following Tuesday. He wore it home.',
      },
    ],
  },
  {
    slug: 'putting-knits-away',
    title: 'Putting knits away for the summer',
    excerpt:
      'Moths do not eat clean wool. They eat what is on it. Wash, fold, seal, and check once in July, and your sweaters come back in October as you left them.',
    image: photo(
      'putting-knits-away',
      'Folded knit sweaters in powder blue, sage, burgundy, and camel on an oak shelf against a pale gray wall',
    ),
    categorySlug: 'care-and-repair',
    authorId: 'nora-vang',
    publishedAt: '2026-04-30',
    productSlugs: [
      'oversized-cable-knit-sweater',
      'lambswool-v-neck-sweater',
      'cropped-v-neck-sweater',
      'brushed-mohair-blend-sweater',
      'chunky-cable-knit-sweater',
    ],
    relatedSlugs: ['how-to-wash-wool'],
    body: [
      {
        type: 'paragraph',
        text: 'Every autumn the repairs counter fills with moth holes, and almost all of them were made over the summer, in a drawer or a wardrobe nobody opened. It is the easiest damage there is to prevent.',
      },
      { type: 'heading', text: 'Wash everything first' },
      {
        type: 'paragraph',
        text: 'Clothes moth larvae feed on wool, but what draws the adults to lay eggs is what is on the wool: skin oils, sweat, a spot of food. A sweater worn once and put away is an invitation. Wash or air every knit before it goes in, following the same cool, gentle method you use all winter.',
      },
      { type: 'heading', text: 'Fold, never hang' },
      {
        type: 'paragraph',
        text: 'Knits stretch on a hanger over a summer. Fold them along the side seams and lay them flat, heaviest at the bottom. Then seal them in: a cotton storage bag, a lidded box, or a drawer that closes properly. Moths look for still, dark, undisturbed places, so the less air moves in and out, the better.',
      },
      { type: 'heading', text: 'Cedar and lavender help, a little' },
      {
        type: 'paragraph',
        text: 'Both put moths off but neither kills them. Cedar loses its scent within a season; give the blocks a light sanding each spring to wake it up. Lavender sachets need replacing every year. Think of them as a second line of defense, after clean wool and a closed drawer.',
      },
      {
        type: 'list',
        items: [
          'Open the drawer once in midsummer, take everything out, and shake it in daylight.',
          'If you find holes, seal the piece in a plastic bag and leave it in the freezer for a week to kill any larvae.',
          'Vacuum the drawer or shelf before anything goes back in.',
        ],
      },
      {
        type: 'paragraph',
        text: 'And if a moth got there first, bring the sweater to the counter. A small hole is a 10-minute darn, and like every repair it is free.',
      },
    ],
  },
]
