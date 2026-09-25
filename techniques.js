// BJJ Connections — Technique Database
// Organized by category. Descriptions are concise and accurate.
// Belt levels are approximate difficulty indicators, not rank requirements.

const TECHNIQUE_CATEGORIES = [
  { id: "position", label: "Positions" },
  { id: "submission", label: "Submissions" },
  { id: "escape", label: "Escapes" },
  { id: "sweep", label: "Sweeps" },
  { id: "takedown", label: "Takedowns" },
  { id: "guard", label: "Guards" },
  { id: "pass", label: "Guard Passing" },
  { id: "leg", label: "Leg Entanglements" },
  { id: "transition", label: "Transitions" }
];

const TECHNIQUES = [
  // ---- Positions ----
  { name: "Mount", cat: "position", belt: "white", desc: "Top position sitting on the opponent's torso with knees on the ground beside their hips. One of the highest-scoring positions in competition." },
  { name: "Side Control", cat: "position", belt: "white", desc: "Top position perpendicular to the opponent, chest-to-chest, pinning them to the mat. A strong control position with many attack options." },
  { name: "Back Control", cat: "position", belt: "white", desc: "Position behind the opponent with hooks (feet) inserted inside their thighs or a body triangle locked. Awards the most points in competition." },
  { name: "Knee-on-Belly", cat: "position", belt: "white", desc: "Top position with one knee driving into the opponent's torso while the other foot is on the ground. A mobile, high-pressure control position." },
  { name: "North-South", cat: "position", belt: "blue", desc: "Top position where you are chest-to-chest but oriented in the opposite direction (your head by their feet). Offers chokes and arm attacks." },
  { name: "Turtle (Top)", cat: "position", belt: "white", desc: "Opponent is on hands and knees; you are behind or beside them in top position. Common transition point for back takes and clock chokes." },
  { name: "Scarf Hold (Kesa-Gatame)", cat: "position", belt: "blue", desc: "Side control variant where one arm is wrapped around the opponent's head/neck and your hip is against their ribs. Borrowed from judo." },
  { name: "Modified Scarf Hold", cat: "position", belt: "blue", desc: "Kesa-Gatame with the far arm underhooked instead of wrapping the neck. More secure against escapes but offers different attack angles." },

  // ---- Submissions ----
  { name: "Armbar (from Mount)", cat: "submission", belt: "white", desc: "Isolating the opponent's arm between your legs and hyperextending the elbow joint. One of the most fundamental submissions in BJJ." },
  { name: "Armbar (from Guard)", cat: "submission", belt: "white", desc: "Breaking the opponent's posture in guard, then swinging a leg over their shoulder to isolate and extend the arm." },
  { name: "Triangle Choke", cat: "submission", belt: "white", desc: "Choking the opponent by trapping one arm in and one arm out, then locking your legs in a triangle around their neck and shoulder." },
  { name: "Rear Naked Choke", cat: "submission", belt: "white", desc: "Blood choke applied from back control using the arm around the neck, compressing the carotid arteries. High-percentage finish." },
  { name: "Kimura", cat: "submission", belt: "white", desc: "Double-wrist lock that isolates the shoulder joint by leveraging the arm behind the back. Works from many positions." },
  { name: "Americana (Keylock)", cat: "submission", belt: "white", desc: "Shoulder lock applied from top positions by bending the arm in an L-shape and driving it toward the head." },
  { name: "Guillotine Choke", cat: "submission", belt: "white", desc: "Front headlock choke using the arm to wrap the neck, often from standing or front headlock position. Common in both gi and no-gi." },
  { name: "Cross Collar Choke", cat: "submission", belt: "white", desc: "Gi choke from mount or closed guard using deep collar grips to compress the neck. One of the first chokes taught in BJJ." },
  { name: "Ezekiel Choke", cat: "submission", belt: "blue", desc: "Choke using your own sleeve across the opponent's neck, often from mount or side control. Works in gi and no-gi." },
  { name: "Arm Triangle", cat: "submission", belt: "blue", desc: "Choke that traps the opponent's arm and neck together using your own arm, pressing from side control or mount." },
  { name: "D'Arce Choke", cat: "submission", belt: "purple", desc: "Head-and-arm choke using a figure-four grip, often entered from side control or front headlock. Compresses the arm into the neck." },
  { name: "Anaconda Choke", cat: "submission", belt: "purple", desc: "Head-and-arm choke from the front headlock position, rolling the opponent through to tighten the squeeze." },
  { name: "Bow and Arrow Choke", cat: "submission", belt: "blue", desc: "Gi choke from back control using the collar and lapel, pulling the lapel across the neck while rotating. High-percentage in competition." },
  { name: "Clock Choke", cat: "submission", belt: "blue", desc: "Gi choke from top turtle position using a collar grip, walking toward the opponent's head to tighten the lapel across the neck." },
  { name: "Paper Cutter Choke", cat: "submission", belt: "blue", desc: "Gi choke from side control or knee-on-belly using a deep collar grip and driving the shoulder into the neck." },
  { name: "Loop Choke", cat: "submission", belt: "purple", desc: "Gi choke from guard using the collar to create a loop around the opponent's neck, often catching them when they posture up." },
  { name: "Baseball Choke", cat: "submission", belt: "purple", desc: "Gi choke from side control using a baseball-style grip on the collar, rotating to tighten the lapel around the neck." },
  { name: "North-South Choke", cat: "submission", belt: "purple", desc: "Choke from the north-south position using the arms to compress the neck. Requires strong squeeze and correct angle." },
  { name: "Peruvian Necktie", cat: "submission", belt: "black", desc: "Front-headlock choke that threads the arm through the legs, combining a neck crank and choke. Named after Tony DeSouza." },
  { name: "Von Flue Choke", cat: "submission", belt: "black", desc: "Shoulder choke from side control when the opponent has an underhook, using your shoulder to compress their neck. Named after Jason Von Flue." },
  { name: "Gogoplata", cat: "submission", belt: "black", desc: "Choke using the shin across the opponent's throat while pulling their head down. Rare but effective from rubber guard." },
  { name: "Buggy Choke", cat: "submission", belt: "black", desc: "Triangle-style choke from bottom side control using the legs to trap the opponent's arm and neck together." },
  { name: "Wristlock", cat: "submission", belt: "blue", desc: "Joint lock targeting the wrist, often available when the opponent grabs your gi or holds a grip. Legal at all belt levels." },
  { name: "Bicep Slicer", cat: "submission", belt: "purple", desc: "Compression lock targeting the bicep or forearm by wedging the shin or forearm behind the opponent's arm and applying pressure." },
  { name: "Calf Slicer", cat: "submission", belt: "black", desc: "Compression lock targeting the calf muscle by wedging the shin behind the knee and applying pressure. Legal at advanced levels." },
  { name: "Heel Hook", cat: "submission", belt: "black", desc: "Leg lock attacking the knee by rotating the foot, controlling the heel. One of the most dangerous submissions in grappling." },
  { name: "Kneebar", cat: "submission", belt: "purple", desc: "Leg lock that hyperextends the knee by isolating the leg between your legs and applying leverage to the joint." },
  { name: "Straight Ankle Lock", cat: "submission", belt: "blue", desc: "Foot lock that extends and plantarflexes the ankle, targeting the Achilles and foot. Legal at all belt levels in most rulesets." },
  { name: "Toehold", cat: "submission", belt: "purple", desc: "Foot lock using a figure-four grip on the foot to apply rotational pressure to the ankle and knee." },

  // ---- Escapes ----
  { name: "Upa (Bridge and Roll)", cat: "escape", belt: "white", desc: "Mount escape where you bridge and roll the opponent over using an trapped arm and leg. One of the first escapes taught in BJJ." },
  { name: "Knee-Elbow Escape", cat: "escape", belt: "white", desc: "Mount escape using elbow pressure to create space, then inserting a knee to recover guard or half guard." },
  { name: "Ghost Escape", cat: "escape", belt: "purple", desc: "Side control escape where you slip out the back door, rotating behind the opponent when they apply pressure." },
  { name: "Underhook Escape (Side Control)", cat: "escape", belt: "blue", desc: "Creating space from bottom side control to establish an underhook and either stand up or recover guard." },
  { name: "Technical Stand-up", cat: "escape", belt: "blue", desc: "Controlled movement from the ground to standing position, protecting the head and maintaining balance. Essential for self-defense and competition." },
  { name: "Stand-up in Base", cat: "escape", belt: "blue", desc: "Standing up from the ground while maintaining a defensive posture. Fundamental movement for escaping bottom positions." },
  { name: "Back Escape (Hook Removal)", cat: "escape", belt: "blue", desc: "Techniques for removing the opponent's hooks from back control to escape the position. Often involves turning toward the choking arm." },
  { name: "Guard Retention", cat: "escape", belt: "blue", desc: "Defensive skills to prevent guard passes and maintain the guard position. Involves framing, pummeling, and hip movement." },
  { name: "Turtle Escape", cat: "escape", belt: "blue", desc: "Escapes from the turtle position (bottom), including recovering guard, standing up, or countering back takes." },

  // ---- Sweeps ----
  { name: "Scissor Sweep", cat: "sweep", belt: "white", desc: "Fundamental sweep from closed guard using a scissoring motion of the legs to off-balance and reverse the opponent." },
  { name: "Hip Bump Sweep", cat: "sweep", belt: "white", desc: "Sweep from closed guard when the opponent posts a hand, using a hip rotation to come up and over into mount." },
  { name: "Flower Sweep", cat: "sweep", belt: "blue", desc: "Open guard sweep using a sleeve grip and leg motion to sweep the opponent's legs, often from spider or de la Riva guard." },
  { name: "X-Guard Sweep", cat: "sweep", belt: "purple", desc: "Sweep from X-guard position using the legs to control and off-balance the opponent's lower body." },
  { name: "Single Leg X Sweep", cat: "sweep", belt: "purple", desc: "Sweep from single leg X position, using the outside hook to off-balance the opponent and come on top." },
  { name: "Butterfly Sweep", cat: "sweep", belt: "blue", desc: "Sweep from butterfly guard using a hook to elevate the opponent's leg while driving forward." },
  { name: "Sit-up Sweep", cat: "sweep", belt: "white", desc: "Closed guard sweep where you sit up and drive forward when the opponent's posture is broken. Often combined with a guillotine." },
  { name: "Kimura Sweep", cat: "sweep", belt: "blue", desc: "Sweep from guard using a Kimura grip on the opponent's arm to off-balance and reverse them." },
  { name: "Elevator Sweep", cat: "sweep", belt: "blue", desc: "Closed guard sweep using a foot hook on the opponent's leg to elevate and sweep them." },
  { name: "Pendulum Sweep", cat: "sweep", belt: "blue", desc: "Closed guard sweep using a swinging leg motion (pendulum) to create momentum and reverse the opponent." },
  { name: "Spider Guard Sweep", cat: "sweep", belt: "blue", desc: "Sweep from spider guard using foot-on-biceps control to off-balance the opponent." },
  { name: "De La Riva Sweep", cat: "sweep", belt: "purple", desc: "Sweep from de la Riva guard using the outside hook to control and off-balance the opponent." },
  { name: "Berimbolo", cat: "sweep", belt: "black", desc: "Inverted sweep from de la Riva or single leg X that takes the opponent's back. A signature technique of modern competition BJJ." },
  { name: "Knee Shield Sweep", cat: "sweep", belt: "blue", desc: "Sweep from half guard using the knee shield to create space and off-balance the opponent." },
  { name: "Old School Sweep", cat: "sweep", belt: "purple", desc: "Half guard sweep using an underhook and deep hook on the far leg to take the opponent backward." },
  { name: "Electric Chair Sweep", cat: "sweep", belt: "purple", desc: "Lockdown half guard sweep that stretches the opponent's leg to create imbalance, often combined with a submission." },

  // ---- Takedowns ----
  { name: "Double Leg Takedown", cat: "takedown", belt: "white", desc: "Wrestling takedown where you drive forward and grab both of the opponent's legs, driving them to the mat." },
  { name: "Single Leg Takedown", cat: "takedown", belt: "white", desc: "Wrestling takedown grabbing one leg and driving forward or finishing with a trip. One of the most common takedowns in BJJ." },
  { name: "Uchi-Mata", cat: "takedown", belt: "blue", desc: "Judo throw using the inner thigh to lift and sweep the opponent. Effective in both gi and no-gi." },
  { name: "Ankle Pick", cat: "takedown", belt: "white", desc: "Low-risk takedown grabbing the ankle while controlling the collar or wrist, pulling the opponent forward." },
  { name: "Tomoe Nage", cat: "takedown", belt: "blue", desc: "Judo sacrifice throw using a foot in the opponent's hip or stomach, falling backward to launch them over." },
  { name: "Osoto Gari", cat: "takedown", belt: "blue", desc: "Judo foot sweep where you reap the opponent's outside leg while pushing them backward." },
  { name: "Seoi Nage", cat: "takedown", belt: "blue", desc: "Judo shoulder throw where you rotate under the opponent's arm and throw them over your shoulder." },
  { name: "Fireman's Carry", cat: "takedown", belt: "blue", desc: "Wrestling takedown where you lift the opponent across your shoulders and bring them to the mat." },
  { name: "Snap Down", cat: "takedown", belt: "white", desc: "Snapping the opponent's head down from a collar tie to force them into a front headlock position." },
  { name: "Body Lock Takedown", cat: "takedown", belt: "blue", desc: "No-gi takedown using double underhooks to lock the torso, then tripping or driving the opponent down." },

  // ---- Guards ----
  { name: "Closed Guard", cat: "guard", belt: "white", desc: "Bottom position with legs wrapped around the opponent's torso. The first guard taught in BJJ and the foundation of guard work." },
  { name: "Half Guard", cat: "guard", belt: "white", desc: "Bottom position with one of the opponent's legs trapped between your legs. Versatile position with both defensive and offensive options." },
  { name: "Deep Half", cat: "guard", belt: "purple", desc: "Half guard variant where you go deep under the opponent, controlling their leg and looking to sweep. Popularized by Jeff Glover." },
  { name: "Butterfly Guard", cat: "guard", belt: "blue", desc: "Open guard using the inside of the feet (hooks) against the opponent's legs for elevation and sweeping. Popularized by Marcelo Garcia." },
  { name: "Spider Guard", cat: "guard", belt: "blue", desc: "Gi guard using feet on the opponent's biceps and sleeve grips for control. Strong for sweeping and setting up triangles." },
  { name: "De La Riva Guard", cat: "guard", belt: "purple", desc: "Open guard with an outside hook on the opponent's leg, named after Ricardo de la Riva. Foundation of modern guard play." },
  { name: "Reverse De La Riva", cat: "guard", belt: "purple", desc: "Mirror of de la Riva with the hook on the inside of the opponent's leg. Often used to counter passing." },
  { name: "X-Guard", cat: "guard", belt: "purple", desc: "Guard position where both legs control the opponent's legs in an X formation. Excellent for sweeping." },
  { name: "Single Leg X", cat: "guard", belt: "purple", desc: "Guard position with one leg inside and one leg outside the opponent's legs. Common entry point for leg locks and sweeps." },
  { name: "50/50 Guard", cat: "guard", belt: "black", desc: "Position where both grapplers' legs are intertwined symmetrically. Can be used for control, sweeps, or leg locks." },
  { name: "Collar-Sleeve Guard", cat: "guard", belt: "blue", desc: "Gi guard using a collar grip and sleeve grip to control the opponent's posture and set up sweeps and submissions." },
  { name: "Lasso Guard", cat: "guard", belt: "purple", desc: "Gi guard threading your leg through the opponent's arm to create strong control. Often combined with spider guard." },
  { name: "Worm Guard", cat: "guard", belt: "black", desc: "Lapel guard popularized by Keenan Cornelius, using the opponent's lapel to wrap and control their leg." },
  { name: "Z-Guard", cat: "guard", belt: "blue", desc: "Half guard variant with the top knee creating a frame (Z shape) against the opponent's torso." },
  { name: "Knee Shield", cat: "guard", belt: "blue", desc: "Half guard variant using the knee as a frame against the opponent's hip or chest to manage distance and prevent pressure." },
  { name: "Open Guard", cat: "guard", belt: "blue", desc: "General term for guard positions where the legs are not closed around the opponent. More mobile and dynamic than closed guard." },

  // ---- Guard Passing ----
  { name: "Knee Cut Pass", cat: "pass", belt: "blue", desc: "Pass where you drive your knee through the opponent's legs, cutting across to side control. One of the most common passes in BJJ." },
  { name: "Toreando Pass", cat: "pass", belt: "blue", desc: "Speed pass where you pivot around the opponent's legs, often using a grip on the pants or shorts. Also called the matador pass." },
  { name: "Stack Pass", cat: "pass", belt: "blue", desc: "Pass where you drive the opponent's legs over their head, stacking them to compress and pass through." },
  { name: "Over-Under Pass", cat: "pass", belt: "blue", desc: "Pressure pass with one arm over and one under the opponent's leg, driving forward into side control." },
  { name: "Double Under Pass", cat: "pass", belt: "blue", desc: "Pass where both arms go under both of the opponent's legs, stacking and driving forward to side control." },
  { name: "Body Lock Pass", cat: "pass", belt: "purple", desc: "No-gi pass using a body lock (hands clasped around the opponent's torso) to drive forward and pass their legs." },
  { name: "Leg Drag", cat: "pass", belt: "purple", desc: "Pass where you drag the opponent's leg across their body, pinning it to establish side control or back control." },
  { name: "Smash Pass", cat: "pass", belt: "blue", desc: "Pressure pass where you drive your weight forward, smashing the opponent's legs down to pass through." },
  { name: "Long Step Pass", cat: "pass", belt: "blue", desc: "Pass where you step wide and long around the opponent's legs, often combined with a knee cut." },
  { name: "Headquarters Pass", cat: "pass", belt: "purple", desc: "Starting from headquarters position (one leg between opponent's legs), transitioning into a knee cut or smash pass." },

  // ---- Leg Entanglements ----
  { name: "Ashi Garami", cat: "leg", belt: "black", desc: "Leg entanglement where your legs control one of the opponent's legs, positioning for heel hooks and kneebars. Core of the Danaher leg-lock system." },
  { name: "Outside Ashi", cat: "leg", belt: "black", desc: "Leg entanglement with your outside leg hooking the opponent's far leg. Provides strong control for heel hooks." },
  { name: "Inside Sankaku", cat: "leg", belt: "black", desc: "Leg entanglement where your legs form a triangle around the opponent's leg, controlling for heel hooks. Also called 4-11." },
  { name: "Saddle (Honeyhole)", cat: "leg", belt: "black", desc: "Position where both of your legs are inside the opponent's legs, creating strong control for outside heel hooks. Also called honeyhole." },
  { name: "The Truck", cat: "leg", belt: "black", desc: "Position behind the opponent where you control one leg between your legs. Often leads to a calf crank or twister." },
  { name: "50/50 Guard (Leg Lock)", cat: "leg", belt: "black", desc: "Symmetric leg entanglement where both grapplers' legs are intertwined. Can be used for control and heel hooks." },

  // ---- Transitions ----
  { name: "Back Take", cat: "transition", belt: "blue", desc: "Movement to get behind the opponent and secure back control. One of the highest-value transitions in BJJ." },
  { name: "Arm Drag", cat: "transition", belt: "blue", desc: "Technique of dragging the opponent's arm across their body to expose their back or create an angle for attack." },
  { name: "Guard Retention Drills", cat: "transition", belt: "blue", desc: "Defensive movement patterns to prevent guard passes, including framing, shrimping, and pummeling legs back inside." },
  { name: "Underhook Battle", cat: "transition", belt: "blue", desc: "Fighting for underhook position to control the opponent's upper body. Critical in half guard and stand-up." },
  { name: "Collar Tie", cat: "transition", belt: "white", desc: "Stand-up grip using the hand on the back of the opponent's neck to control their posture and set up takedowns." },
  { name: "Pummeling", cat: "transition", belt: "blue", desc: "Trading underhooks back and forth with the opponent to establish dominant control. Used in clinch and guard work." },
  { name: "Knee-on-Belly Transition", cat: "transition", belt: "blue", desc: "Using knee-on-belly as a mobile transition point between side control, mount, and back control." },

  // ---- Additional Positions ----
  { name: "Top Half Guard", cat: "position", belt: "white", desc: "Top position with one leg trapped between the opponent's legs. Strong control position with submission and passing options." },
  { name: "Quarter Position", cat: "position", belt: "blue", desc: "Side control variant where you are positioned at the opponent's hip rather than fully perpendicular. Often a transition point." },
  { name: "Front Headlock", cat: "position", belt: "white", desc: "Control position with the opponent's head and one arm trapped, usually from a sprawl. Sets up chokes and takedowns." },
  { name: "Crucifix (Top)", cat: "position", belt: "purple", desc: "Control position where both of the opponent's arms are trapped behind their back using your legs and arms. Highly dominant." },
  { name: "S-Mount", cat: "position", belt: "purple", desc: "Mount variant where one leg is placed higher on the opponent's chest, creating an S-shape. Excellent for armbar setups." },
  { name: "High Mount", cat: "position", belt: "blue", desc: "Mount variant with knees positioned high in the opponent's armpits, preventing them from bridging or turning. Strong attacking position." },

  // ---- Additional Submissions ----
  { name: "Marceloplata", cat: "submission", belt: "black", desc: "Armbar variant from guard that uses the leg over the shoulder in a modified omoplata/armbar hybrid. Named after Marcelo Garcia." },
  { name: "Baratoplata", cat: "submission", belt: "black", desc: "Shoulder lock from side control using a figure-four grip on the opponent's arm. Named after Rafael Barata." },
  { name: "Crucifix Neck Crank", cat: "submission", belt: "black", desc: "Neck crank applied from the crucifix position using the arms to apply rotational pressure to the cervical spine." },
  { name: "Calf Crank", cat: "submission", belt: "black", desc: "Submission applying compression to the calf muscle by leveraging the shin against the knee. Distinct from a calf slicer." },
  { name: "Banana Split", cat: "submission", belt: "black", desc: "Groin stretch submission where both of the opponent's legs are pulled apart in opposite directions." },
  { name: "Twister", cat: "submission", belt: "black", desc: "Spinal lock that twists the opponent's spine using a hook on the far leg and control of the head. Popularized by Eddie Bravo." },
  { name: "Bicep Slicer (from Mount)", cat: "submission", belt: "purple", desc: "Compression lock targeting the bicep from mount position, using the shin or forearm behind the opponent's arm." },
  { name: "Americana from Side Control", cat: "submission", belt: "white", desc: "Keylock applied from side control, bending the opponent's arm in an L-shape and driving toward the head." },
  { name: "Kimura from Side Control", cat: "submission", belt: "white", desc: "Double-wrist lock applied from side control, isolating the shoulder by leveraging the arm behind the back." },
  { name: "Cross Collar Choke from Guard", cat: "submission", belt: "white", desc: "Gi choke from closed guard using deep collar grips to compress the neck. One of the first guard chokes taught." },
  { name: "Loop Choke from Half Guard", cat: "submission", belt: "purple", desc: "Gi choke from bottom half guard using the collar to create a loop around the opponent's neck when they apply pressure." },
  { name: "Monoplata", cat: "submission", belt: "black", desc: "Shoulder lock using the leg over the opponent's arm similar to an omoplata but with a different finishing angle." },

  // ---- Additional Escapes ----
  { name: "Elbow Push Escape (Side Control)", cat: "escape", belt: "white", desc: "Creating space from bottom side control by pushing the opponent's elbow and bridging to recover guard." },
  { name: "Bridge and Roll (Side Control)", cat: "escape", belt: "blue", desc: "Escaping side control by bridging explosively and rolling the opponent over when they are too high or off-balance." },
  { name: "Guard Recovery from Turtle", cat: "escape", belt: "blue", desc: "From bottom turtle, sitting back to recover guard or half guard before the opponent can establish back control." },
  { name: "Bridge Escape from Back Control", cat: "escape", belt: "blue", desc: "Escaping back control by bridging and turning toward the choking arm to remove hooks and face the opponent." },
  { name: "Frame and Stand (Side Control)", cat: "escape", belt: "blue", desc: "Using frames (forearms/shins) to create space and technical stand-up from bottom side control." },
  { name: "Knee Insertion Escape (Mount)", cat: "escape", belt: "white", desc: "Mount escape where you bridge and insert a knee to create space and recover half guard or full guard." },
  { name: "Foot Lift Back Escape", cat: "escape", belt: "purple", desc: "Escaping back control by lifting the opponent's foot off the mat to remove the hook, then turning in." },

  // ---- Additional Sweeps ----
  { name: "Triangle Sweep", cat: "sweep", belt: "blue", desc: "Sweep from guard using the triangle setup — when the opponent defends the choke, use the leg position to sweep instead." },
  { name: "Omoplata Sweep", cat: "sweep", belt: "purple", desc: "When the opponent defends the omoplata submission, transition into a sweep by using the leg over the shoulder as leverage." },
  { name: "Guillotine Sweep", cat: "sweep", belt: "blue", desc: "Sweep from guard using a guillotine grip — when the opponent resists the choke, use the momentum to sweep them." },
  { name: "Collar-Sleeve Sweep", cat: "sweep", belt: "blue", desc: "Sweep from collar-sleeve guard using the sleeve grip to pull the opponent forward while sweeping with the legs." },
  { name: "Reverse De La Riva Sweep", cat: "sweep", belt: "purple", desc: "Sweep from reverse de la Riva guard using the inside hook to off-balance the opponent and come on top." },
  { name: "Lasso Sweep", cat: "sweep", belt: "purple", desc: "Sweep from lasso guard using the threaded leg to control the opponent's arm and create an off-balancing angle." },
  { name: "Deep Half Sweep", cat: "sweep", belt: "black", desc: "Sweep from deep half guard using the underhook and leg positioning to off-balance and reverse the opponent." },
  { name: "Underhook Half Guard Sweep", cat: "sweep", belt: "blue", desc: "Sweep from half guard using the underhook to get to the opponent's back or come up into a dogfight position." },

  // ---- Additional Takedowns ----
  { name: "Kouchi Gari", cat: "takedown", belt: "blue", desc: "Judo foot sweep reaping the opponent's inside leg while pushing them backward." },
  { name: "Deashi Harai", cat: "takedown", belt: "blue", desc: "Judo foot sweep where you sweep the opponent's advancing leg from the outside." },
  { name: "Kosoto Gake", cat: "takedown", belt: "purple", desc: "Judo throw hooking the opponent's outside leg while driving forward." },
  { name: "Drop Seoi Nage", cat: "takedown", belt: "purple", desc: "Variation of seoi nage where you drop to both knees to create leverage for the throw." },
  { name: "Sumi Gaeshi", cat: "takedown", belt: "purple", desc: "Judo sacrifice throw where you grab the opponent's leg and roll backward to take them over." },
  { name: "Russian 2-on-1", cat: "takedown", belt: "blue", desc: "Grip fighting technique controlling the opponent's arm with both hands to set up takedowns and throws." },
  { name: "Lateral Drop", cat: "takedown", belt: "purple", desc: "Wrestling throw using an overhook to throw the opponent laterally, falling to the side." },

  // ---- Additional Guards ----
  { name: "Closed Guard (High)", cat: "guard", belt: "blue", desc: "Closed guard variant with legs positioned high on the opponent's back, breaking posture and setting up chokes and armbars." },
  { name: "Full Guard", cat: "guard", belt: "white", desc: "Another term for closed guard — legs wrapped around the opponent's torso with ankles crossed." },
  { name: "Headquarters Position", cat: "guard", belt: "purple", desc: "Top position between the opponent's legs, often the starting point for guard passing. One leg inside, one outside." },
  { name: "Octopus Guard", cat: "guard", belt: "black", desc: "Unorthodox guard where you invert and use the opponent's leg and torso for control. Rare but creative." },
  { name: "Lockdown", cat: "guard", belt: "purple", desc: "Half guard variant popularized by Eddie Bravo, using a figure-four leg lock on the opponent's leg for control." },
  { name: "K-Guard", cat: "guard", belt: "black", desc: "Modern guard position where one of your feet is on the opponent's hip and the other hooks behind their knee, creating entries to leg locks." },
  { name: "Reverse Half Guard", cat: "guard", belt: "purple", desc: "Half guard variant where you face the opponent's legs rather than their torso, often used for leg lock entries." },

  // ---- Additional Guard Passing ----
  { name: "Floating Pass", cat: "pass", belt: "purple", desc: "Pass where you jump or float over the opponent's legs, landing directly in side control or mount." },
  { name: "Shin Pin Pass", cat: "pass", belt: "blue", desc: "Pass where you pin the opponent's shin to the mat with your hand or knee, then step around to side control." },
  { name: "Leg Pin Pass", cat: "pass", belt: "blue", desc: "Pass where you pin both of the opponent's legs to one side, then walk around to the other side for side control." },
  { name: "Crash Pass", cat: "pass", belt: "purple", desc: "No-gi pass where you crash your weight forward through the opponent's guard, using momentum and pressure to pass." },
  { name: "Tripod Pass", cat: "pass", belt: "purple", desc: "Pass where you tripod on your head and feet to clear the opponent's legs, then settle into side control." },

  // ---- Additional Leg Entanglements ----
  { name: "Outside Heel Hook", cat: "leg", belt: "black", desc: "Heel hook where the foot is rotated outward, attacking the knee's medial collateral ligament. Generally considered the more dangerous variation." },
  { name: "Inside Heel Hook", cat: "leg", belt: "black", desc: "Heel hook where the foot is rotated inward. Often applied from the saddle or 50/50 position." },
  { name: "Straight Foot Lock", cat: "leg", belt: "blue", desc: "Another term for the straight ankle lock — extending the foot to attack the Achilles tendon and ankle joint." },
  { name: "Achilles Lock", cat: "leg", belt: "blue", desc: "Compression lock on the Achilles tendon and calf muscle, often applied from ashi garami or single leg X." },
  { name: "Estima Lock", cat: "leg", belt: "black", desc: "Foot lock named after the Estima brothers, applying rotational pressure to the foot from a standing or top position." },
  { name: "Saddle Entry", cat: "leg", belt: "black", desc: "Transition from single leg X or ashi garami into the saddle (honeyhole) position for a stronger heel hook entry." },

  // ---- Additional Transitions ----
  { name: "Guard Pull", cat: "transition", belt: "white", desc: "Deliberately pulling the opponent into your guard from standing. Common in gi competition to avoid takedown exchanges." },
  { name: "Sit Guard", cat: "transition", belt: "blue", desc: "Sitting guard position where you sit upright with one or both feet on the opponent's hips, ready to attack or retain guard." },
  { name: "Dogfight Position", cat: "transition", belt: "blue", desc: "Transitional position on one knee with an underhook, used to come up from half guard or defend against being flattened." },
  { name: "Whizzer", cat: "transition", belt: "white", desc: "Overhook on the opponent's arm, typically used to defend against takedowns or control their upper body." },
  { name: "Underhook Entry", cat: "transition", belt: "blue", desc: "Technique of establishing an underhook from various positions to create an angle for back takes or sweeps." },
  { name: "Head Outside Single", cat: "transition", belt: "blue", desc: "Single leg takedown entry where your head is on the outside of the opponent's leg, setting up finishes or transitions." },
  { name: "Sprawl", cat: "transition", belt: "white", desc: "Defensive technique against takedowns — dropping your hips and legs back to prevent the opponent from completing the takedown." },
  { name: "Stand-up", cat: "transition", belt: "white", desc: "Returning to standing position from the ground, typically using a technical stand-up to protect the head and maintain base." }
];
