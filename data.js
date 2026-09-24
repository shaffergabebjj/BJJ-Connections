// BJJ Connections puzzle bank. Original 50 rounds preserved.
const ROUNDS = [

/* 1 */
[
["MARCELO GARCIA","ROGER GRACIE","BRUNO MALFACINE","RAFAEL MENDES","LEGENDS"],
["BUTTERFLY","X-GUARD","DE LA RIVA","SPIDER","GUARDS"],
["KIMURA","AMERICANA","ARMBAR","OMOPLATA","ARM ATTACKS"],
["TORIANDO","LEG DRAG","KNEE CUT","SMASH PASS","PASSES"]
],

/* 2 */
[
["GORDON RYAN","CRAIG JONES","NICK RODRIGUEZ","ANDREW WILSON","NO-GI"],
["HEEL HOOK","KNEEBAR","STRAIGHT ANKLE","CALF SLICER","LEG ATTACKS"],
["ASHI GARAMI","SINGLE LEG X","INSIDE SANKAKU","OUTSIDE ASHI","LEG-LOCK POSITIONS"],
["SEATBELT","BODY TRIANGLE","HOOKS","BACK TAKE","BACK CONTROL"]
],

/* 3 */
[
["DEMIAN MAIA","ROGER GRACIE","LEANDRO LO","MARCUS ALMEIDA","PRESSURE"],
["MOUNT","SIDE CONTROL","KESA","NORTH-SOUTH","TOP POSITIONS"],
["CROSS CHOKE","PAPER CUTTER","EZEKIEL","BOW-AND-ARROW","GI CHOKES"],
["SINGLE LEG","DOUBLE LEG","ANKLE PICK","UCHI MATA","TAKEDOWNS"]
],

/* 4 */
[
["MARCELO GARCIA","RUBENS CHARLES","GUI MENDES","RAFAEL MENDES","ALL-TIME GI STARS"],
["DE LA RIVA","BERIMBOLO","LASSO","COLLAR-SLEEVE","GI GUARDS"],
["GUILLOTINE","D'ARCE","ANACONDA","MARCELOTINE","HEAD-AND-NECK CHOKES"],
["ARMBAR","TRIANGLE","OMOPLATA","KIMURA","SUBMISSIONS"]
],

/* 5 */
[
["ROGER GRACIE","BUCHECHA","XANDE RIBEIRO","SAULO RIBEIRO","GRACIE-LINEAGE CHAMPIONS"],
["MOUNT","BACK","SIDE CONTROL","KNEE-ON-BELLY","POSITIONS"],
["STACK PASS","OVER-UNDER","DOUBLE UNDER","BODY LOCK","PRESSURE PASSES"],
["COLLAR CHOKE","CROSS CHOKE","CLOCK CHOKE","PAPER CUTTER","CHOKES"]
],

/* 6 */
[
["GORDON RYAN","NICHOLAS MIERA","CRAIG JONES","JT TORRES","MODERN NO-GI"],
["HALF GUARD","DEEP HALF","KNEE SHIELD","Z-GUARD","HALF GUARDS"],
["HEEL HOOK","INSIDE SANKAKU","ASHI GARAMI","KNEEBAR","LEG LOCKS"],
["BODY LOCK","LEG DRAG","KNEE CUT","SMASH PASS","PASSES"]
],

/* 7 */
[
["MARCUS ALMEIDA","RODOLFO VIEIRA","ERBERTH SANTOS","LEANDRO LO","GI POWERHOUSES"],
["CLOSED GUARD","BUTTERFLY","SPIDER","DE LA RIVA","GUARDS"],
["MOUNT","BACK","SIDE CONTROL","NORTH-SOUTH","TOP CONTROL"],
["ARMBAR","TRIANGLE","KIMURA","AMERICANA","ARM SUBMISSIONS"]
],

/* 8 */
[
["MARCELO GARCIA","KRON GRACIE","DEMIAN MAIA","GORDON RYAN","SUBMISSION SPECIALISTS"],
["GUILLOTINE","ANACONDA","D'ARCE","PAPER CUTTER","CHOKES"],
["BERIMBOLO","BACK TAKE","ARM DRAG","TECHNICAL STAND-UP","BACK-TAKE TOOLS"],
["BUTTERFLY","X-GUARD","SINGLE LEG X","DEEP HALF","OPEN GUARDS"]
],

/* 9 */
[
["RAFAEL MENDES","GUI MENDES","MICA GALVAO","GABRIEL SOUSA","TECHNICAL GUARD PLAYERS"],
["DE LA RIVA","REVERSE DE LA RIVA","SPIDER","LASSO","OPEN GUARD"],
["BERIMBOLO","LEG DRAG","TORIANDO","KNEE CUT","GUARD-PASSING"],
["ARMBAR","OMOPLATA","TRIANGLE","KIMURA","ARM ATTACKS"]
],

/* 10 */
[
["JOHN DANAHER","GORDON RYAN","GARRY TONON","CRAIG JONES","DANAHER-ASSOCIATED NO-GI"],
["HEEL HOOK","KNEEBAR","STRAIGHT ANKLE","CALF SLICER","LEG SUBMISSIONS"],
["ASHI GARAMI","SINGLE LEG X","INSIDE SANKAKU","OUTSIDE ASHI","LEG POSITIONS"],
["SEATBELT","BODY TRIANGLE","BACK TAKE","HOOKS","BACK CONTROL"]
],

/* 11 */
[
["ROGER GRACIE","MARCELO GARCIA","SAULO RIBEIRO","ROMULO BARRAL","IBJJF LEGENDS"],
["CLOSED GUARD","BUTTERFLY","DEEP HALF","HALF GUARD","GUARDS"],
["MOUNT","SIDE CONTROL","KESA","NORTH-SOUTH","POSITIONS"],
["CROSS CHOKE","BOW-AND-ARROW","EZEKIEL","COLLAR CHOKE","GI CHOKES"]
],

/* 12 */
[
["BRUNO MALFACINE","CAIO TERRA","MIYAO BROTHERS","RAFAEL MENDES","LIGHTWEIGHT STARS"],
["SPIDER","DE LA RIVA","LASSO","COLLAR-SLEEVE","GI GUARDS"],
["ARMBAR","TRIANGLE","OMOPLATA","KIMURA","SUBMISSIONS"],
["TORIANDO","LEG DRAG","KNEE CUT","LONG STEP","PASSES"]
],

/* 13 */
[
["BUCHECHA","RODOLFO VIEIRA","GORDON RYAN","NICK RODRIGUEZ","HEAVYWEIGHT NO-GI NAMES"],
["MOUNT","SIDE CONTROL","NORTH-SOUTH","KESA","TOP POSITIONS"],
["BODY LOCK","SMASH PASS","STACK PASS","OVER-UNDER","PRESSURE PASSES"],
["GUILLOTINE","D'ARCE","ANACONDA","ARM TRIANGLE","CHOKES"]
],

/* 14 */
[
["MARCELO GARCIA","DEMIAN MAIA","ROGER GRACIE","KRON GRACIE","SUBMISSION-FOCUSED"],
["BUTTERFLY","CLOSED GUARD","HALF GUARD","DEEP HALF","GUARDS"],
["ARM DRAG","TECHNICAL STAND-UP","CHAIR SIT","BERIMBOLO","BACK TAKES"],
["REAR NAKED CHOKE","BOW-AND-ARROW","GUILLOTINE","D'ARCE","CHOKES"]
],

/* 15 */
[
["LEANDRO LO","MARCUS ALMEIDA","RUBENS CHARLES","RODOLFO VIEIRA","GI CHAMPIONS"],
["KIMURA","ARMBAR","AMERICANA","OMOPLATA","ARM ATTACKS"],
["MOUNT","BACK","SIDE CONTROL","KNEE-ON-BELLY","TOP POSITIONS"],
["SINGLE LEG","DOUBLE LEG","UCHI MATA","ANKLE PICK","TAKEDOWNS"]
],

/* 16 */
[
["GORDON RYAN","CRAIG JONES","GARRY TONON","NICK RODRIGUEZ","NO-GI COMPETITORS"],
["HEEL HOOK","KNEEBAR","STRAIGHT ANKLE","CALF SLICER","LEG LOCKS"],
["ASHI GARAMI","SINGLE LEG X","INSIDE SANKAKU","OUTSIDE ASHI","LEG POSITIONS"],
["LEG DRAG","KNEE CUT","BODY LOCK","TORIANDO","PASSES"]
],

/* 17 */
[
["RAFAEL MENDES","GUI MENDES","MICA GALVAO","BRUNO MALFACINE","TECHNICAL LIGHTWEIGHTS"],
["DE LA RIVA","BERIMBOLO","SPIDER","LASSO","GI GUARDS"],
["TRIANGLE","ARMBAR","OMOPLATA","KIMURA","SUBMISSIONS"],
["TORIANDO","LEG DRAG","LONG STEP","KNEE CUT","PASSES"]
],

/* 18 */
[
["ROGER GRACIE","BUCHECHA","SAULO RIBEIRO","ROMULO BARRAL","GI LEGENDS"],
["CROSS CHOKE","COLLAR CHOKE","EZEKIEL","BOW-AND-ARROW","CHOKES"],
["MOUNT","SIDE CONTROL","BACK","NORTH-SOUTH","POSITIONS"],
["CLOSED GUARD","BUTTERFLY","HALF GUARD","DEEP HALF","GUARDS"]
],

/* 19 */
[
["MARCELO GARCIA","GORDON RYAN","DEMIAN MAIA","ROGER GRACIE","FAMOUS SUBMISSION STYLES"],
["GUILLOTINE","ANACONDA","D'ARCE","REAR NAKED CHOKE","CHOKES"],
["BUTTERFLY","X-GUARD","DE LA RIVA","SINGLE LEG X","GUARDS"],
["BACK TAKE","ARM DRAG","BERIMBOLO","CHAIR SIT","BACK ATTACKS"]
],

/* 20 */
[
["JOHN DANAHER","GORDON RYAN","GARRY TONON","CRAIG JONES","DANAHER SYSTEM"],
["HEEL HOOK","KNEEBAR","CALF SLICER","STRAIGHT ANKLE","LEG ATTACKS"],
["ASHI GARAMI","SINGLE LEG X","INSIDE SANKAKU","OUTSIDE ASHI","LEG POSITIONS"],
["BODY LOCK","HALF GUARD","KNEE CUT","SMASH PASS","PASSING"]
],

/* 21 */
[
["RODOLFO VIEIRA","BUCHECHA","ERBERTH SANTOS","ROMULO BARRAL","POWERFUL GI"],
["MOUNT","SIDE CONTROL","KESA","NORTH-SOUTH","TOP POSITIONS"],
["KIMURA","ARMBAR","AMERICANA","ARM TRIANGLE","ARM ATTACKS"],
["SINGLE LEG","DOUBLE LEG","ANKLE PICK","UCHI MATA","TAKEDOWNS"]
],

/* 22 */
[
["RAFAEL MENDES","GUI MENDES","BRUNO MALFACINE","CAIO TERRA","LIGHTWEIGHT TECHNIQUE"],
["SPIDER","LASSO","DE LA RIVA","COLLAR-SLEEVE","GUARDS"],
["BERIMBOLO","LEG DRAG","TORIANDO","KNEE CUT","PASSING"],
["TRIANGLE","ARMBAR","OMOPLATA","KIMURA","SUBMISSIONS"]
],

/* 23 */
[
["MARCELO GARCIA","KRON GRACIE","DEMIAN MAIA","ROGER GRACIE","BACK-TAKE / SUBMISSION"],
["BUTTERFLY","CLOSED GUARD","HALF GUARD","DEEP HALF","GUARDS"],
["ARM DRAG","BACK TAKE","BERIMBOLO","CHAIR SIT","BACK TAKES"],
["GUILLOTINE","ANACONDA","D'ARCE","REAR NAKED CHOKE","CHOKES"]
],

/* 24 */
[
["GORDON RYAN","NICK RODRIGUEZ","CRAIG JONES","GARRY TONON","NO-GI"],
["HEEL HOOK","KNEEBAR","STRAIGHT ANKLE","CALF SLICER","LEG LOCKS"],
["ASHI GARAMI","SINGLE LEG X","INSIDE SANKAKU","OUTSIDE ASHI","LEG POSITIONS"],
["SEATBELT","BODY TRIANGLE","HOOKS","BACK TAKE","BACK CONTROL"]
],

/* 25 */
[
["ROGER GRACIE","LEANDRO LO","MARCUS ALMEIDA","RUBENS CHARLES","GI"],
["MOUNT","BACK","SIDE CONTROL","KNEE-ON-BELLY","POSITIONS"],
["CROSS CHOKE","COLLAR CHOKE","EZEKIEL","BOW-AND-ARROW","GI CHOKES"],
["STACK PASS","OVER-UNDER","DOUBLE UNDER","BODY LOCK","PASSES"]
],

/* 26 */
[
["MARCELO GARCIA","RAFAEL MENDES","GUI MENDES","BRUNO MALFACINE","GI TECHNICIANS"],
["DE LA RIVA","SPIDER","LASSO","BUTTERFLY","GUARDS"],
["ARMBAR","OMOPLATA","TRIANGLE","KIMURA","SUBMISSIONS"],
["TORIANDO","LEG DRAG","LONG STEP","KNEE CUT","PASSES"]
],

/* 27 */
[
["DEMIAN MAIA","ROGER GRACIE","MARCELO GARCIA","KRON GRACIE","SUBMISSION LEGENDS"],
["GUILLOTINE","D'ARCE","ANACONDA","REAR NAKED CHOKE","CHOKES"],
["BUTTERFLY","CLOSED GUARD","HALF GUARD","DEEP HALF","GUARDS"],
["BACK TAKE","ARM DRAG","BERIMBOLO","CHAIR SIT","BACK ATTACKS"]
],

/* 28 */
[
["GORDON RYAN","CRAIG JONES","GARRY TONON","NICK RODRIGUEZ","NO-GI"],
["HEEL HOOK","KNEEBAR","CALF SLICER","STRAIGHT ANKLE","LEG LOCKS"],
["ASHI GARAMI","SINGLE LEG X","INSIDE SANKAKU","OUTSIDE ASHI","LEG POSITIONS"],
["BODY LOCK","SMASH PASS","LEG DRAG","KNEE CUT","PASSES"]
],

/* 29 */
[
["ROGER GRACIE","BUCHECHA","RODOLFO VIEIRA","XANDE RIBEIRO","GI HEAVYWEIGHTS"],
["MOUNT","SIDE CONTROL","KESA","NORTH-SOUTH","POSITIONS"],
["CROSS CHOKE","COLLAR CHOKE","EZEKIEL","PAPER CUTTER","CHOKES"],
["SINGLE LEG","DOUBLE LEG","UCHI MATA","ANKLE PICK","TAKEDOWNS"]
],

/* 30 */
[
["RAFAEL MENDES","GUI MENDES","MICA GALVAO","BRUNO MALFACINE","TECHNICAL GUARD PLAYERS"],
["DE LA RIVA","REVERSE DE LA RIVA","SPIDER","LASSO","OPEN GUARDS"],
["BERIMBOLO","LEG DRAG","TORIANDO","LONG STEP","PASSING"],
["TRIANGLE","ARMBAR","OMOPLATA","KIMURA","ARM ATTACKS"]
],

/* 31 */
[
["MARCELO GARCIA","DEMIAN MAIA","ROGER GRACIE","GORDON RYAN","FAMOUS GRAPPLERS"],
["BUTTERFLY","X-GUARD","HALF GUARD","DEEP HALF","GUARDS"],
["GUILLOTINE","D'ARCE","ANACONDA","REAR NAKED CHOKE","CHOKES"],
["SEATBELT","BODY TRIANGLE","HOOKS","BACK TAKE","BACK CONTROL"]
],

/* 32 */
[
["JOHN DANAHER","GORDON RYAN","GARRY TONON","CRAIG JONES","LEG-LOCK ERA"],
["HEEL HOOK","KNEEBAR","CALF SLICER","STRAIGHT ANKLE","SUBMISSIONS"],
["ASHI GARAMI","SINGLE LEG X","INSIDE SANKAKU","OUTSIDE ASHI","POSITIONS"],
["KNEE CUT","BODY LOCK","SMASH PASS","LEG DRAG","PASSES"]
],

/* 33 */
[
["LEANDRO LO","ROGER GRACIE","BUCHECHA","SAULO RIBEIRO","GI ICONS"],
["MOUNT","BACK","SIDE CONTROL","NORTH-SOUTH","POSITIONS"],
["CROSS CHOKE","BOW-AND-ARROW","COLLAR CHOKE","EZEKIEL","CHOKES"],
["CLOSED GUARD","BUTTERFLY","HALF GUARD","DEEP HALF","GUARDS"]
],

/* 34 */
[
["RAFAEL MENDES","GUI MENDES","BRUNO MALFACINE","CAIO TERRA","LIGHTWEIGHTS"],
["SPIDER","LASSO","DE LA RIVA","COLLAR-SLEEVE","GUARDS"],
["BERIMBOLO","TORIANDO","LEG DRAG","KNEE CUT","PASSES"],
["ARMBAR","TRIANGLE","OMOPLATA","KIMURA","SUBMISSIONS"]
],

/* 35 */
[
["MARCELO GARCIA","KRON GRACIE","DEMIAN MAIA","ROGER GRACIE","SUBMISSION STYLE"],
["BUTTERFLY","CLOSED GUARD","DEEP HALF","HALF GUARD","GUARDS"],
["ARM DRAG","BACK TAKE","BERIMBOLO","CHAIR SIT","BACK TAKES"],
["GUILLOTINE","D'ARCE","ANACONDA","REAR NAKED CHOKE","CHOKES"]
],

/* 36 */
[
["GORDON RYAN","CRAIG JONES","GARRY TONON","NICK RODRIGUEZ","MODERN NO-GI"],
["HEEL HOOK","KNEEBAR","CALF SLICER","STRAIGHT ANKLE","LEG ATTACKS"],
["ASHI GARAMI","SINGLE LEG X","INSIDE SANKAKU","OUTSIDE ASHI","POSITIONS"],
["BODY LOCK","SMASH PASS","KNEE CUT","OVER-UNDER","PASSES"]
],

/* 37 */
[
["RODOLFO VIEIRA","BUCHECHA","SAULO RIBEIRO","ERBERTH SANTOS","GI POWER"],
["MOUNT","SIDE CONTROL","KESA","NORTH-SOUTH","TOP CONTROL"],
["KIMURA","AMERICANA","ARMBAR","ARM TRIANGLE","ARM ATTACKS"],
["SINGLE LEG","DOUBLE LEG","UCHI MATA","ANKLE PICK","TAKEDOWNS"]
],

/* 38 */
[
["RAFAEL MENDES","GUI MENDES","MICA GALVAO","BRUNO MALFACINE","GUARD SPECIALISTS"],
["DE LA RIVA","SPIDER","LASSO","BUTTERFLY","GUARDS"],
["BERIMBOLO","LEG DRAG","TORIANDO","LONG STEP","PASSING"],
["TRIANGLE","OMOPLATA","ARMBAR","KIMURA","SUBMISSIONS"]
],

/* 39 */
[
["ROGER GRACIE","MARCELO GARCIA","DEMIAN MAIA","KRON GRACIE","LEGENDS"],
["CLOSED GUARD","BUTTERFLY","HALF GUARD","DEEP HALF","GUARDS"],
["GUILLOTINE","D'ARCE","ANACONDA","REAR NAKED CHOKE","CHOKES"],
["BACK TAKE","ARM DRAG","BERIMBOLO","CHAIR SIT","BACK ATTACKS"]
],

/* 40 */
/* NOTE: this used to be an exact duplicate of puzzle 28 (same 4 categories,
   same 16 words). Replaced with new, distinct content. */
[
["ADCC","IBJJF","EBI","POLARIS","GRAPPLING ORGANIZATIONS"],
["SCISSOR SWEEP","FLOWER SWEEP","HIP BUMP SWEEP","PENDULUM SWEEP","SWEEPS"],
["TOEHOLD","ESTIMA LOCK","ACHILLES LOCK","KNEEBAR","FOOT LOCKS"],
["UNDERHOOK","OVERHOOK","COLLAR TIE","PUMMELING","CLINCH POSITIONS"]
],

/* 41 */
[
["ROGER GRACIE","BUCHECHA","LEANDRO LO","RODOLFO VIEIRA","GI CHAMPIONS"],
["MOUNT","BACK","SIDE CONTROL","KESA","POSITIONS"],
["CROSS CHOKE","COLLAR CHOKE","EZEKIEL","BOW-AND-ARROW","CHOKES"],
["STACK PASS","OVER-UNDER","DOUBLE UNDER","BODY LOCK","PASSES"]
],

/* 42 */
[
["MARCELO GARCIA","RAFAEL MENDES","GUI MENDES","BRUNO MALFACINE","GI TECHNICIANS"],
["DE LA RIVA","SPIDER","LASSO","COLLAR-SLEEVE","GUARDS"],
["ARMBAR","OMOPLATA","TRIANGLE","KIMURA","SUBMISSIONS"],
["TORIANDO","LEG DRAG","KNEE CUT","LONG STEP","PASSES"]
],

/* 43 */
[
["DEMIAN MAIA","MARCELO GARCIA","ROGER GRACIE","KRON GRACIE","SUBMISSION ICONS"],
["BUTTERFLY","CLOSED GUARD","HALF GUARD","DEEP HALF","GUARDS"],
["GUILLOTINE","D'ARCE","ANACONDA","REAR NAKED CHOKE","CHOKES"],
["SEATBELT","BODY TRIANGLE","HOOKS","BACK TAKE","BACK CONTROL"]
],

/* 44 */
[
["GORDON RYAN","CRAIG JONES","GARRY TONON","NICK RODRIGUEZ","NO-GI STARS"],
["HEEL HOOK","KNEEBAR","STRAIGHT ANKLE","CALF SLICER","LEG LOCKS"],
["ASHI GARAMI","SINGLE LEG X","INSIDE SANKAKU","OUTSIDE ASHI","LEG POSITIONS"],
["BODY LOCK","SMASH PASS","LEG DRAG","KNEE CUT","PASSES"]
],

/* 45 */
[
["LEANDRO LO","BUCHECHA","RODOLFO VIEIRA","ROGER GRACIE","GI HEAVYWEIGHTS"],
["MOUNT","SIDE CONTROL","KESA","NORTH-SOUTH","POSITIONS"],
["KIMURA","AMERICANA","ARMBAR","ARM TRIANGLE","ARM ATTACKS"],
["SINGLE LEG","DOUBLE LEG","UCHI MATA","ANKLE PICK","TAKEDOWNS"]
],

/* 46 */
[
["RAFAEL MENDES","GUI MENDES","MICA GALVAO","BRUNO MALFACINE","TECHNICAL BJJ"],
["DE LA RIVA","SPIDER","LASSO","BUTTERFLY","GUARDS"],
["BERIMBOLO","TORIANDO","LEG DRAG","KNEE CUT","PASSES"],
["TRIANGLE","ARMBAR","OMOPLATA","KIMURA","SUBMISSIONS"]
],

/* 47 */
[
["ROGER GRACIE","MARCELO GARCIA","DEMIAN MAIA","GORDON RYAN","FAMOUS STYLISTS"],
["BUTTERFLY","X-GUARD","HALF GUARD","DEEP HALF","GUARDS"],
["GUILLOTINE","ANACONDA","D'ARCE","REAR NAKED CHOKE","CHOKES"],
["BACK TAKE","ARM DRAG","BERIMBOLO","CHAIR SIT","BACK ATTACKS"]
],

/* 48 */
[
["GORDON RYAN","CRAIG JONES","GARRY TONON","NICK RODRIGUEZ","NO-GI"],
["HEEL HOOK","KNEEBAR","CALF SLICER","STRAIGHT ANKLE","LEG LOCKS"],
["ASHI GARAMI","SINGLE LEG X","INSIDE SANKAKU","OUTSIDE ASHI","LEG POSITIONS"],
["BODY LOCK","KNEE CUT","SMASH PASS","OVER-UNDER","PASSES"]
],

/* 49 */
[
["ROGER GRACIE","LEANDRO LO","BUCHECHA","RODOLFO VIEIRA","GI LEGENDS"],
["MOUNT","BACK","SIDE CONTROL","NORTH-SOUTH","POSITIONS"],
["CROSS CHOKE","COLLAR CHOKE","EZEKIEL","BOW-AND-ARROW","CHOKES"],
["CLOSED GUARD","BUTTERFLY","HALF GUARD","DEEP HALF","GUARDS"]
],

/* 50 */
[
["MARCELO GARCIA","RAFAEL MENDES","GORDON RYAN","ROGER GRACIE","ALL-TIME GREAT BJJ NAMES"],
["DE LA RIVA","BUTTERFLY","X-GUARD","SPIDER","GUARDS"],
["ARMBAR","TRIANGLE","KIMURA","OMOPLATA","SUBMISSIONS"],
["LEG DRAG","TORIANDO","KNEE CUT","SMASH PASS","PASSES"]
]
];

// ---------------------------------------------------------------------
// Real "Learn why" explanations, keyed by exact category string.
// One or two honest sentences about what the category actually is —
// not just the category name repeated back. Kept general/descriptive
// rather than making specific superlative claims about any one person.
// A category not found here falls back to a generic sentence so a
// future puzzle with a new category name never breaks the UI.
// ---------------------------------------------------------------------
const EXPLANATIONS = {
  "GUARDS": "General term for defensive positions played from the bottom, using the legs to control distance, off-balance an opponent, and set up attacks from underneath.",
  "PASSES": "Guard passes are techniques a top player uses to get around an opponent's legs and into a dominant position.",
  "CHOKES": "Chokes cut off blood flow or air through the neck to force a tap — among the most common finishes in both gi and no-gi.",
  "SUBMISSIONS": "General term for any technique — a choke, joint lock, or compression — used to force an opponent to submit.",
  "POSITIONS": "Core control positions in jiu-jitsu, each with its own hierarchy of dominance and typical attacking options.",
  "LEG POSITIONS": "Control positions used to enter and finish leg locks, developed and popularized in the modern no-gi leg-lock era.",
  "ARM ATTACKS": "Joint locks that target the elbow or shoulder to force a submission.",
  "LEG LOCKS": "Submissions that attack the knee, ankle, or hip through the leg — a major focus of modern no-gi grappling.",
  "TAKEDOWNS": "Techniques used to bring a standing opponent to the mat, many borrowed from wrestling and judo.",
  "NO-GI": "A ruleset and style of grappling practiced without a gi, which changes grips and often opens up leg-lock-heavy game plans.",
  "BACK CONTROL": "The dominant back position, usually combined with hooks or a body triangle, from which many chokes are finished.",
  "TOP POSITIONS": "Dominant positions controlled from on top of the opponent, offering strong attacking angles with lower risk.",
  "BACK ATTACKS": "Techniques and entries used to take or maintain an opponent's back, one of the most valuable positions in grappling.",
  "PASSING": "The family of techniques used to get past an opponent's legs into a dominant position.",
  "LEG ATTACKS": "Another term for leg locks — submissions that target the ankle, knee, or hip.",
  "GI CHOKES": "Chokes that use the collar or lapel of the gi for extra leverage, unavailable in no-gi grappling.",
  "GI GUARDS": "Guard variations that rely on gripping the opponent's gi — collar, sleeve, or pants — for control.",
  "BACK TAKES": "Techniques and entries used specifically to get to an opponent's back.",
  "LEGENDS": "Widely regarded as among the most influential competitors in jiu-jitsu history.",
  "PRESSURE PASSES": "Guard passes that rely on heavy top pressure and weight distribution rather than speed.",
  "MODERN NO-GI": "Competitors associated with the current generation of no-gi grappling and its leg-lock-heavy meta.",
  "TOP CONTROL": "Positions and techniques used to maintain dominant control from the top.",
  "OPEN GUARDS": "Guard variations played without the legs closed around the opponent's torso, usually more mobile than closed guard.",
  "TECHNICAL GUARD PLAYERS": "Known for a detailed, technique-heavy guard game rather than relying on athleticism alone.",
  "GI CHAMPIONS": "Competitors known for their success specifically in gi competition.",
  "GI LEGENDS": "Widely regarded among the most accomplished competitors in gi jiu-jitsu.",
  "GI TECHNICIANS": "Known for precise, detail-oriented technique within the gi ruleset.",
  "GI HEAVYWEIGHTS": "Accomplished competitors who competed primarily in the heavier gi weight classes.",
  "LEG-LOCK POSITIONS": "Control positions used to enter and finish leg-lock submissions.",
  "PRESSURE": "Known for a heavy, pressure-based style of top control.",
  "ALL-TIME GI STARS": "Among the most decorated and recognizable names in gi competition history.",
  "HEAD-AND-NECK CHOKES": "Submissions that finish by choking through the neck, using an arm, the collar, or a combination of both.",
  "GRACIE-LINEAGE CHAMPIONS": "Competitors from the Gracie family lineage who became major competition champions.",
  "HALF GUARDS": "Guard variations played with one leg trapped between the opponent's legs.",
  "GI POWERHOUSES": "Known for strong, physically dominant performances in gi competition.",
  "ARM SUBMISSIONS": "Submissions that finish by attacking the arm.",
  "SUBMISSION SPECIALISTS": "Known for finishing a high percentage of matches by submission rather than by points.",
  "BACK-TAKE TOOLS": "Techniques used specifically to get to and secure an opponent's back.",
  "OPEN GUARD": "A family of guards played without closing the legs around the opponent.",
  "GUARD-PASSING": "Techniques used to get around an opponent's guard and into a dominant position.",
  "DANAHER-ASSOCIATED NO-GI": "Competitors associated with coach John Danaher's leg-lock-focused no-gi system.",
  "LEG SUBMISSIONS": "Submissions that finish by attacking the leg.",
  "IBJJF LEGENDS": "Among the most decorated competitors in IBJJF (International Brazilian Jiu-Jitsu Federation) competition history.",
  "LIGHTWEIGHT STARS": "Accomplished competitors known for competing in the lighter weight classes.",
  "HEAVYWEIGHT NO-GI NAMES": "Accomplished competitors known for no-gi competition in the heavier weight classes.",
  "SUBMISSION-FOCUSED": "Known for an aggressive, finish-first competitive style.",
  "NO-GI COMPETITORS": "Competitors who built their reputation primarily in no-gi competition.",
  "TECHNICAL LIGHTWEIGHTS": "Lighter-weight competitors known for detailed, technique-driven grappling.",
  "FAMOUS SUBMISSION STYLES": "Known for a distinctive, submission-hunting competitive style.",
  "DANAHER SYSTEM": "Competitors associated with the systematic leg-lock and back-attack approach developed by coach John Danaher.",
  "POWERFUL GI": "Known for a strong, pressure-heavy game within the gi ruleset.",
  "LIGHTWEIGHT TECHNIQUE": "Lighter-weight competitors recognized for technical, detail-focused grappling.",
  "BACK-TAKE / SUBMISSION": "Known for combining back takes with high finishing rates.",
  "GI": "Accomplished competitors within the gi ruleset.",
  "SUBMISSION LEGENDS": "Among the most recognizable submission specialists in the sport's history.",
  "FAMOUS GRAPPLERS": "Widely recognized names across jiu-jitsu and grappling.",
  "LEG-LOCK ERA": "Competitors associated with the rise of leg locks as a mainstream competitive weapon.",
  "GI ICONS": "Widely recognized figures in gi competition history.",
  "LIGHTWEIGHTS": "Accomplished competitors in the lighter weight classes.",
  "SUBMISSION STYLE": "Known for a particular, recognizable approach to finishing fights.",
  "GI POWER": "Known for a strong, physically dominant style within the gi ruleset.",
  "GUARD SPECIALISTS": "Known for an especially technical or dangerous guard game.",
  "SUBMISSION ICONS": "Widely recognized for a submission-focused competitive style.",
  "NO-GI STARS": "Well-known competitors within the no-gi ruleset.",
  "TECHNICAL BJJ": "Known for detail-oriented, technique-driven grappling.",
  "FAMOUS STYLISTS": "Recognized for a signature style of grappling.",
  "ALL-TIME GREAT BJJ NAMES": "Among the most recognizable names across jiu-jitsu history.",
  "GRAPPLING ORGANIZATIONS": "Major organizations and events that host high-level grappling competition.",
  "SWEEPS": "Sweeps are guard techniques used to reverse position from the bottom, turning a bottom player into the top player.",
  "FOOT LOCKS": "Submissions that attack the foot or ankle — a specialized branch of leg locks.",
  "CLINCH POSITIONS": "Grip and control positions used in the stand-up clinch, often as entries into takedowns."
};
function explanationFor(category, items) {
  return EXPLANATIONS[category] || `A recognized grouping in jiu-jitsu: ${items.join(", ")}.`;
}

// ---------------------------------------------------------------------
// Difficulty is classified from the puzzle's actual technique content
// instead of its position in the array. Advanced leg-lock-system terms
// push a puzzle to black; advanced guard/back-take terms push to purple;
// a majority of true fundamentals pulls it to white; anything else
// lands on blue. This also means a newly added puzzle classifies itself
// correctly without needing to be manually slotted in.
// ---------------------------------------------------------------------
const BLACK_BELT_TERMS = new Set(["HEEL HOOK","KNEEBAR","CALF SLICER","STRAIGHT ANKLE","ASHI GARAMI",
  "INSIDE SANKAKU","OUTSIDE ASHI","SINGLE LEG X","ESTIMA LOCK","ACHILLES LOCK","TOEHOLD","MARCELOTINE"]);
const PURPLE_BELT_TERMS = new Set(["BERIMBOLO","LASSO","REVERSE DE LA RIVA","TORIANDO","LONG STEP",
  "CHAIR SIT","TECHNICAL STAND-UP","ARM DRAG","SEATBELT","BODY TRIANGLE","KNEE CUT","SMASH PASS",
  "STACK PASS","OVER-UNDER","DOUBLE UNDER","BODY LOCK","SPIDER","DE LA RIVA","COLLAR-SLEEVE","X-GUARD",
  "DEEP HALF","HALF GUARD","KNEE SHIELD","Z-GUARD","KNEE-ON-BELLY","NORTH-SOUTH","KESA"]);
const WHITE_BELT_TERMS = new Set(["MOUNT","SIDE CONTROL","CLOSED GUARD","BUTTERFLY","CROSS CHOKE",
  "COLLAR CHOKE","ARMBAR","KIMURA","AMERICANA","TRIANGLE","SINGLE LEG","DOUBLE LEG","UCHI MATA",
  "ANKLE PICK","EZEKIEL","REAR NAKED CHOKE","GUILLOTINE","BACK TAKE","HOOKS"]);

function classifyDifficulty(items) {
  // A whole dedicated leg-lock-system group (4 black-tier terms) makes
  // the puzzle black-belt level outright.
  const blackCount = items.filter(w => BLACK_BELT_TERMS.has(w)).length;
  if (blackCount >= 4) return "black";
  // A single stray leg-lock term mixed into an otherwise lighter puzzle
  // still earns purple (exposure, not a full system) rather than black.
  if (blackCount >= 1) return "purple";
  // Otherwise, weigh advanced vs. fundamental term density.
  let score = 0;
  items.forEach(w => {
    if (PURPLE_BELT_TERMS.has(w)) score += 1;
    else if (WHITE_BELT_TERMS.has(w)) score -= 1;
  });
  if (score <= -2) return "white";
  if (score <= 2) return "blue";
  return "purple";
}

const PUZZLES = ROUNDS.map((groups, index) => {
  const builtGroups = groups.map(g => ({
    items: g.slice(0, 4),
    category: g[4],
    explanation: explanationFor(g[4], g.slice(0, 4))
  }));
  const allItems = builtGroups.flatMap(g => g.items);
  return {
    id: index + 1,
    groups: builtGroups,
    difficulty: classifyDifficulty(allItems),
    theme: ["Legends", "Techniques", "Competition", "Guards", "No-Gi"][index % 5]
  };
});

function validatePuzzle(puzzle) {
  const items = puzzle.groups.flatMap(g => g.items);
  const errors = [];
  if (puzzle.groups.length !== 4) errors.push("Puzzle must have 4 groups.");
  if (items.length !== 16) errors.push("Puzzle must have 16 items.");
  if (new Set(items).size !== items.length) errors.push("Puzzle contains duplicate items.");
  puzzle.groups.forEach((g,i) => {
    if (g.items.length !== 4) errors.push(`Group ${i+1} must have 4 items.`);
    if (!g.category) errors.push(`Group ${i+1} is missing a category.`);
    if (!g.explanation) errors.push(`Group ${i+1} is missing an explanation.`);
  });
  return errors;
}

// Bank-level check: catches an exact-duplicate puzzle (same 4 category
// names + same 16 words as another puzzle) before it ships. This is the
// check that would have caught puzzles #28/#40 being identical.
function validateAllPuzzles(puzzles) {
  const errors = [];
  puzzles.forEach(p => errors.push(...validatePuzzle(p).map(e => `Puzzle ${p.id}: ${e}`)));
  const seen = new Map();
  puzzles.forEach(p => {
    const key = JSON.stringify(p.groups.map(g => ({ c: g.category, i: g.items.slice().sort() }))
      .sort((a, b) => a.c.localeCompare(b.c)));
    if (seen.has(key)) errors.push(`Puzzle ${p.id} is an exact duplicate of puzzle ${seen.get(key)}.`);
    else seen.set(key, p.id);
  });
  return errors;
}
