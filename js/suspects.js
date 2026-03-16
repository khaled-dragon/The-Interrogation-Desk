const GameState = {
  currentCase: null,
  currentSuspect: null,
  suspectStress: 0,
  suspectTrust: 50,
  suspectDefense: 0,
  evidenceFound: [],
  timer: 600,
  timerActive: false,
  timerInterval: null,
  slamCount: 0,
  actionCount: 0,
  isTyping: false,
  actionsEnabled: true,
  gameOver: false,
  lastPlayedIndex: -1
};

const SuspectDatabase = [
  {
    // 1
    id: 'webb',
    name: 'Marcus Webb',
    caseTitle: 'The Missing Briefcase',
    caseNumber: '001',
    charge: 'Theft',
    caseDesc: 'A leather briefcase belonging to exec Daniel Harmon vanished from the lobby. Webb was the last known person near it.',
    skinTone: ['#d4a070','#c89060','#b87a50'],
    hairColor: '#1a0f08',
    intro: "Look, I already told the other guys — I was in the break room the whole afternoon. You can check with anyone. I didn't touch anyone's briefcase.",
    questions: [
      { text: "The briefcase? Yeah, I saw it in the lobby. Belongs to that Harmon guy. But I didn't— I mean, why would I even want it?", stressDelta: 8, trustDelta: -3 },
      { text: "I already told you. Break room. Three o'clock. Ask Sandra if you don't believe me.", stressDelta: 5, trustDelta: 0 },
      { text: "Why do you keep asking me the same thing? [He averts his gaze] ...I was just curious about what was in it. That's all.", stressDelta: 12, trustDelta: -8, microExpr: 'guilt' },
      { text: "Look, my hands are shaking because YOU make me nervous. This whole setup makes me nervous. That doesn't mean anything.", stressDelta: 15, trustDelta: -5, microExpr: 'stress' },
      { text: "Fine. FINE. I picked it up. I was going to look inside. I put it in the utility closet on floor three.", stressDelta: 20, trustDelta: 10 }
    ],
    stares: [
      { text: "What? Stop looking at me like that.", stressDelta: 6, microExpr: 'lie' },
      { text: "[Shifts in seat] Could you— can you stop? Please?", stressDelta: 10 },
      { text: "[Drops eyes to the table] ...", stressDelta: 14, microExpr: 'guilt' }
    ],
    slams: [
      { text: "WHAT— Jesus! You can't do that!", stressDelta: 18, defenseDelta: 5 },
      { text: "I'm not saying ANYTHING else if you do that again!", stressDelta: 8, defenseDelta: 15 },
      { text: "I WANT MY LAWYER.", stressDelta: -5, defenseDelta: 25 }
    ],
    whispers: [
      { text: "...what did you just say? [Leans forward]", stressDelta: 12, trustDelta: -6, microExpr: 'lie' },
      { text: "You don't know anything. [Voice trembles]", stressDelta: 16, microExpr: 'stress' },
      { text: "H-how did you know about that...", stressDelta: 22, trustDelta: 5 }
    ],
    evidence: [
      { label: 'Lobby CCTV Footage', text: "[Stares at the footage] That's... that timestamp is wrong. The clock in the lobby runs fast.", stressDelta: 20, trustDelta: -10, microExpr: 'lie' },
      { label: 'Keycard Access Log', text: "[Goes pale] The keycard log... that's not— I can explain that. [Long pause] I was checking on something.", stressDelta: 25, trustDelta: -8 },
      { label: 'Witness Statement', text: "[Voice drops] Mrs. Pelham told you that? She couldn't have seen— I mean, she must be mistaken.", stressDelta: 22, trustDelta: -5, microExpr: 'guilt' },
      { label: "Webb's Alibi Check", text: "[Eyes dart] I told you where I was! Why doesn't my alibi check out? [Wipes forehead]", stressDelta: 28, trustDelta: 5, microExpr: 'stress' }
    ],
    confession: "...Alright. [Long exhale] I took it. Harmon's been promoted twice while I've been passed over and I just... snapped. It's in the utility closet, floor three. Code is 4-7-2-1. I'm sorry.",
    confessionResult: "Webb confessed. The briefcase was recovered from the utility closet on floor three.",
    shutdown: "I am DONE talking. I want a lawyer. Right now. Not another word."
  },

  {
    // 2
    id: 'reyes',
    name: 'Sofia Reyes',
    caseTitle: 'The Forged Signature',
    caseNumber: '002',
    charge: 'Document Fraud',
    caseDesc: 'A company transfer form worth $200,000 carried a forged CFO signature. Reyes was the last to handle the document.',
    skinTone: ['#c8906a','#b87858','#a06040'],
    hairColor: '#0a0808',
    intro: "I process hundreds of documents a week. You can't seriously think I forged anything. I have a spotless record — fifteen years with this firm.",
    questions: [
      { text: "The transfer form? I routed it to signing like every other document. I didn't look at it twice.", stressDelta: 7, trustDelta: 2 },
      { text: "I told you — I don't have access to the CFO's signature stamp. That's kept in the executive suite.", stressDelta: 9, trustDelta: -2 },
      { text: "[Pauses] Look, I noticed the signature looked... off. But it wasn't my job to question it. I just process them.", stressDelta: 14, trustDelta: -6, microExpr: 'guilt' },
      { text: "You're reading too much into this. My hands always shake when I'm nervous. It doesn't mean anything!", stressDelta: 16, trustDelta: -4, microExpr: 'stress' },
      { text: "I... I needed the money. My mother's medical bills. I only did it once. I was going to pay it back, I swear.", stressDelta: 22, trustDelta: 8 }
    ],
    stares: [
      { text: "Why are you staring at me? This is completely inappropriate.", stressDelta: 5, microExpr: 'lie' },
      { text: "[Adjusts collar nervously] I have nothing to hide.", stressDelta: 11 },
      { text: "[Looks at the door] ...", stressDelta: 13, microExpr: 'guilt' }
    ],
    slams: [
      { text: "What is WRONG with you?! I'm a professional!", stressDelta: 15, defenseDelta: 8 },
      { text: "If you do that again I am filing a complaint.", stressDelta: 6, defenseDelta: 18 },
      { text: "I want a union rep. Now. I'm not saying another word.", stressDelta: -4, defenseDelta: 26 }
    ],
    whispers: [
      { text: "[Eyes widen] How do you know about that account?", stressDelta: 18, trustDelta: -5, microExpr: 'lie' },
      { text: "[Voice breaks] Please... my mother doesn't know about any of this.", stressDelta: 20, microExpr: 'stress' },
      { text: "[Long silence] ...I can explain everything.", stressDelta: 25, trustDelta: 6 }
    ],
    evidence: [
      { label: 'Ink Analysis Report', text: "[Blinks rapidly] The ink date— that report can't be accurate. Labs make mistakes all the time.", stressDelta: 22, trustDelta: -8, microExpr: 'lie' },
      { label: 'Printer Access Log', text: "[Grips the chair] I use that printer every day. That doesn't prove anything specific.", stressDelta: 20, trustDelta: -6 },
      { label: 'Bank Transfer Record', text: "[Goes very still] Where did you get that? That account isn't— that's personal.", stressDelta: 28, trustDelta: -10, microExpr: 'guilt' },
      { label: 'Handwriting Sample', text: "[Tears up] The loops... I practiced for weeks. I thought it was perfect. [Voice cracks]", stressDelta: 30, trustDelta: 8, microExpr: 'stress' }
    ],
    confession: "...Yes. I did it. [Covers face] My mother needed surgery and the insurance denied everything and I had no one to turn to. I forged it. One time. I transferred $80,000 and I was going to repay it slowly. I'm so ashamed.",
    confessionResult: "Reyes confessed. The $80,000 transfer was traced and frozen. The mother's medical records confirmed the motive.",
    shutdown: "I'm not speaking without legal representation. That's my final word."
  },

  {
    // 3
    id: 'banks',
    name: 'Derek Banks',
    caseTitle: 'The Warehouse Fire',
    caseNumber: '003',
    charge: 'Arson',
    caseDesc: 'A warehouse burned to the ground overnight. The owner was overinsured by $3M. Banks, the night watchman, was the only one on site.',
    skinTone: ['#8a6040','#785030','#604020'],
    hairColor: '#151010',
    intro: "I called it in the second I saw the smoke. You think I would've stayed there and reported it if I set the fire? That makes no sense.",
    questions: [
      { text: "I do my rounds every 45 minutes. Like clockwork. There was nothing unusual until about 2am.", stressDelta: 6, trustDelta: 3 },
      { text: "The east side? I don't go in there. The floor's rotted, it's a liability. I stick to the perimeter.", stressDelta: 10, trustDelta: -4 },
      { text: "[Rubs the back of his neck] Look, I... I smelled something earlier. I thought it was the generator. I should've checked.", stressDelta: 13, trustDelta: -5, microExpr: 'guilt' },
      { text: "My round logs? Those are just— I fill those in at the end of the shift sometimes. It's not what you think.", stressDelta: 18, trustDelta: -8, microExpr: 'stress' },
      { text: "Mr. Voss told me the place was going under. He said if something happened to the building, he'd make sure I was taken care of. I didn't know he meant— I just unlocked the east door.", stressDelta: 24, trustDelta: 6 }
    ],
    stares: [
      { text: "I'm not scared of you, detective.", stressDelta: 5, microExpr: 'lie' },
      { text: "[Jaw tightens] ...", stressDelta: 9 },
      { text: "[Looks at his hands] I think about those boxes of records. People's jobs in there.", stressDelta: 15, microExpr: 'guilt' }
    ],
    slams: [
      { text: "HEY! Easy! I'm cooperating here!", stressDelta: 16, defenseDelta: 6 },
      { text: "You think that scares me? I did two tours in Fallujah.", stressDelta: 5, defenseDelta: 20 },
      { text: "Get me a lawyer. Right now.", stressDelta: -3, defenseDelta: 28 }
    ],
    whispers: [
      { text: "[Freezes] What did Voss tell you?", stressDelta: 20, trustDelta: -4, microExpr: 'lie' },
      { text: "[Leans back] You're bluffing.", stressDelta: 14, microExpr: 'stress' },
      { text: "...How much do you know?", stressDelta: 26, trustDelta: 5 }
    ],
    evidence: [
      { label: 'Accelerant Trace Report', text: "[Swallows hard] Gasoline on the east wall... I don't even own a car. How would I get gasoline?", stressDelta: 24, trustDelta: -9, microExpr: 'lie' },
      { label: 'Phone Records — Voss', text: "[Eyes close briefly] We talk sometimes. That's not a crime. He's my employer.", stressDelta: 22, trustDelta: -7 },
      { label: 'Security Camera Gap', text: "The camera was broken for weeks. That's got nothing to do with me, I reported it!", stressDelta: 20, trustDelta: -5, microExpr: 'guilt' },
      { label: 'Bank Deposit — $15,000', text: "[Goes rigid] That was a loan. A personal loan from— [Long pause] ...from Voss.", stressDelta: 32, trustDelta: 4, microExpr: 'stress' }
    ],
    confession: "...Voss paid me fifteen grand. He said just unlock the east corridor door and look the other way for one hour. I didn't know someone was going to torch it — I swear on my kids. I thought it was just for insurance paperwork or something. I'm not an arsonist. I just... opened a door.",
    confessionResult: "Banks confessed to his role. Voss was picked up at the airport the following morning. Both charged.",
    shutdown: "Not another word. Get me a lawyer or let me go."
  },

  {
    // 4
    id: 'chen',
    name: 'Linda Chen',
    caseTitle: 'The Poisoned Exhibit',
    caseNumber: '004',
    charge: 'Tampering / Attempted Harm',
    caseDesc: 'A rare orchid at the botanical gala was laced with a contact toxin. The competing botanist, Chen, had access to the greenhouse that morning.',
    skinTone: ['#d4b090','#c0987a','#a88060'],
    hairColor: '#080808',
    intro: "I have dedicated thirty years to botanical research. The very suggestion that I would sabotage another scientist's work is insulting beyond words.",
    questions: [
      { text: "Yes, I was in the greenhouse that morning. I'm always there. It's my lab. That proves absolutely nothing.", stressDelta: 7, trustDelta: 1 },
      { text: "Dr. Marsh's orchid? I've seen it. Mediocre specimen, frankly. Not worth the attention it gets.", stressDelta: 9, trustDelta: -3 },
      { text: "[Stiffens] I know what contact toxins do. That doesn't mean I used one. Any trained botanist has that knowledge.", stressDelta: 13, trustDelta: -6, microExpr: 'guilt' },
      { text: "My hands tremble due to a neurological condition. I resent the implication.", stressDelta: 17, trustDelta: -5, microExpr: 'stress' },
      { text: "That award was supposed to be mine. Twenty years in a row. And then Marsh shows up with one orchid and everyone forgets my entire career.", stressDelta: 21, trustDelta: 9 }
    ],
    stares: [
      { text: "I don't respond to intimidation tactics, detective.", stressDelta: 5, microExpr: 'lie' },
      { text: "[Clasps hands precisely] I am perfectly calm.", stressDelta: 8 },
      { text: "[Gaze drifts to the side] ...I'm not a criminal.", stressDelta: 13, microExpr: 'guilt' }
    ],
    slams: [
      { text: "How DARE you! I am a respected academic!", stressDelta: 14, defenseDelta: 7 },
      { text: "I will have your badge for this kind of conduct.", stressDelta: 5, defenseDelta: 19 },
      { text: "Not one more word. My attorney is on speed dial.", stressDelta: -3, defenseDelta: 27 }
    ],
    whispers: [
      { text: "[Eyes narrow] You found the compound. [Barely audible]", stressDelta: 22, trustDelta: -6, microExpr: 'lie' },
      { text: "[Very still] Marsh deserved it. Scientifically speaking.", stressDelta: 19, microExpr: 'stress' },
      { text: "...I only wanted to wilt it. Not harm anyone.", stressDelta: 28, trustDelta: 7 }
    ],
    evidence: [
      { label: 'Toxin Purchase Receipt', text: "[Inhales sharply] Abrin derivatives are used in legitimate research. Anyone could have bought this.", stressDelta: 25, trustDelta: -10, microExpr: 'lie' },
      { label: 'Greenhouse Entry Log', text: "I was there at 6am as I am every single morning. This changes nothing.", stressDelta: 18, trustDelta: -5 },
      { label: 'Glove Residue Test', text: "[Long silence] ...Those gloves are contaminated from general lab work. Cross-contamination is common.", stressDelta: 27, trustDelta: -8, microExpr: 'guilt' },
      { label: "Marsh's Award History", text: "[Voice drops to almost nothing] He took everything. The grant. The award. The recognition. Everything I built.", stressDelta: 30, trustDelta: 10, microExpr: 'stress' }
    ],
    confession: "...Fine. I applied the compound to the soil — a minimal, non-lethal dose. I wanted the orchid to wilt before the judging. That's all. I had no intention of harming Dr. Marsh. I simply wanted... fairness. Some acknowledgment that my work matters too. [Exhales quietly] Is that so terrible?",
    confessionResult: "Chen confessed. The orchid was destroyed as a precaution. Dr. Marsh was unharmed. Chen's research license was suspended.",
    shutdown: "This conversation is over. I will not be treated like a common criminal."
  },

  {
    // 5
    id: 'okafor',
    name: 'Emeka Okafor',
    caseTitle: 'The Inside Trade',
    caseNumber: '005',
    charge: 'Insider Trading',
    caseDesc: 'Someone leaked merger data 48 hours before the public announcement. Okafor, a junior analyst, made a $400K trade the day before.',
    skinTone: ['#7a5030','#684020','#563018'],
    hairColor: '#060404',
    intro: "I invest my own money legally. I've studied the markets for years — anyone who did their homework could have made that call. I just got lucky.",
    questions: [
      { text: "The Mercer-Hollis merger? It was speculated on every finance blog for months. My trade was based on public information.", stressDelta: 8, trustDelta: 2 },
      { text: "I don't have access to M&A documents. I'm a junior analyst. They don't let me near that floor.", stressDelta: 10, trustDelta: -2 },
      { text: "[Hesitates] I may have overheard something in the elevator. But I didn't act on it specifically. It just... confirmed what I already suspected.", stressDelta: 15, trustDelta: -7, microExpr: 'guilt' },
      { text: "Look, my investment strategy is documented. I can show you every trade I've made for three years. This one isn't different.", stressDelta: 12, trustDelta: -4, microExpr: 'stress' },
      { text: "She told me. Priya. She said it was going to close Friday. I didn't think it counted as— I thought she was just talking.", stressDelta: 25, trustDelta: 5 }
    ],
    stares: [
      { text: "I'm not intimidated. I know my rights.", stressDelta: 5, microExpr: 'lie' },
      { text: "[Taps foot rapidly under the table] This is a fishing expedition.", stressDelta: 10 },
      { text: "[Looks away] ...Priya doesn't know I'm here.", stressDelta: 16, microExpr: 'guilt' }
    ],
    slams: [
      { text: "WHOA— What the— Is that legal?!", stressDelta: 17, defenseDelta: 5 },
      { text: "I will sue this entire department.", stressDelta: 6, defenseDelta: 17 },
      { text: "SEC compliance officer. Now. I'm done.", stressDelta: -4, defenseDelta: 27 }
    ],
    whispers: [
      { text: "Did Priya talk? [Barely breathing]", stressDelta: 24, trustDelta: -5, microExpr: 'lie' },
      { text: "[Grips the table edge] You don't have enough to hold me.", stressDelta: 15, microExpr: 'stress' },
      { text: "...She texted me. I still have the messages.", stressDelta: 29, trustDelta: 8 }
    ],
    evidence: [
      { label: 'Trade Timestamp', text: "[Blinks] 9:47am. Yes, that's my trade. The market opened at 9:30. I just moved fast.", stressDelta: 20, trustDelta: -8, microExpr: 'lie' },
      { label: 'Elevator CCTV', text: "[Shifts] Priya and I were in the elevator. People talk in elevators. That's not a crime.", stressDelta: 23, trustDelta: -6 },
      { label: "Priya's Text Messages", text: "[Goes white] You have her phone. [Long pause] She gave you her phone?", stressDelta: 30, trustDelta: -10, microExpr: 'guilt' },
      { label: 'Brokerage Account History', text: "[Voice drops] My previous trades are all under $5,000. I know how this looks. I know.", stressDelta: 28, trustDelta: 6, microExpr: 'stress' }
    ],
    confession: "...Priya told me in the elevator on Wednesday. She said 'it's closing Friday, don't tell anyone.' I took $400,000 of my savings and put it all in. I knew it was wrong. I knew. But I also knew it would work and I... I just thought about getting out of debt. One trade. One time. I'm so sorry.",
    confessionResult: "Okafor confessed. Priya Mehta was brought in separately. Both cooperated. The $400K gain was seized.",
    shutdown: "I'm invoking my right to silence. Talk to my attorney."
  },

  {
    // 6
    id: 'volkov',
    name: 'Alexei Volkov',
    caseTitle: 'The Stolen Prototype',
    caseNumber: '006',
    charge: 'Corporate Espionage',
    caseDesc: 'A classified AI chip prototype went missing from the R&D lab. Volkov, a visiting engineer from a rival firm, had a guest badge.',
    skinTone: ['#d0b8a0','#b8a088','#a08870'],
    hairColor: '#1e1e1e',
    intro: "I was on a legitimate research exchange. My company arranged everything through proper channels. I find this whole situation deeply offensive.",
    questions: [
      { text: "The prototype? I saw it in the display case like everyone else on the tour. I was never alone in that lab.", stressDelta: 7, trustDelta: 1 },
      { text: "My badge only opened designated areas. You can check the access system. I followed every protocol.", stressDelta: 9, trustDelta: -2 },
      { text: "[Carefully] I may have taken photographs of certain components for research notes. That is... standard practice in my field.", stressDelta: 14, trustDelta: -8, microExpr: 'guilt' },
      { text: "My hands are cold. The room is cold. This means nothing about my character.", stressDelta: 11, trustDelta: -3, microExpr: 'stress' },
      { text: "Marchetti asked me to acquire it. He said the technology was based on our original patent and we were entitled to it. I believed him.", stressDelta: 22, trustDelta: 7 }
    ],
    stares: [
      { text: "In my country, this would be considered a diplomatic incident.", stressDelta: 6, microExpr: 'lie' },
      { text: "[Maintains steady eye contact] I have nothing to conceal.", stressDelta: 8 },
      { text: "[Glances at jacket pocket] ...", stressDelta: 15, microExpr: 'guilt' }
    ],
    slams: [
      { text: "This is assault! I will contact my embassy!", stressDelta: 16, defenseDelta: 7 },
      { text: "I demand a translator and a consular officer.", stressDelta: 5, defenseDelta: 20 },
      { text: "I say nothing further. Nothing.", stressDelta: -4, defenseDelta: 28 }
    ],
    whispers: [
      { text: "[Freezes] You found the transmitter.", stressDelta: 26, trustDelta: -7, microExpr: 'lie' },
      { text: "[Very controlled] Marchetti will deny everything. You know this.", stressDelta: 18, microExpr: 'stress' },
      { text: "...I can give you Marchetti in exchange for consideration.", stressDelta: 30, trustDelta: 9 }
    ],
    evidence: [
      { label: 'Badge Override Code', text: "[Pause] Someone must have cloned my badge. I did not authorize that override.", stressDelta: 22, trustDelta: -9, microExpr: 'lie' },
      { label: 'Encrypted USB Found', text: "[Eyes flicker] That USB was for personal files. Music. The encryption is standard.", stressDelta: 26, trustDelta: -8 },
      { label: 'Blueprint Photographs', text: "[Long silence] I took those for academic purposes. The resolution is too low to reproduce anything.", stressDelta: 24, trustDelta: -6, microExpr: 'guilt' },
      { label: 'Marchetti Email Chain', text: "[Something changes in his expression] He wrote it in plain text. [Almost to himself] Idiot.", stressDelta: 33, trustDelta: 8, microExpr: 'stress' }
    ],
    confession: "...Very well. Marchetti told me the prototype contained architecture derived from our Kyoto lab's 2019 research. He said we were recovering what was ours. I used the override code he provided, photographed the internal layout, and copied the firmware schema onto the USB. I did not physically remove the device. I believed I was acting legally. I was... perhaps not careful enough about what I believed.",
    confessionResult: "Volkov provided full cooperation and gave up Marchetti. The firmware copy was recovered. International IP case opened.",
    shutdown: "I am exercising my right to consular assistance. We are finished here."
  },

  {
    // 7
    id: 'harris',
    name: 'Tommy Harris',
    caseTitle: 'The Rigged Match',
    caseNumber: '007',
    charge: 'Match Fixing',
    caseDesc: 'A semi-final boxing match ended in a suspicious 3rd-round knockout. Harris, the trainer, was seen with known bookmakers the week prior.',
    skinTone: ['#b08060','#9a7050','#845a40'],
    hairColor: '#0e0a08',
    intro: "Darnell lost fair and square. The kid got caught with a right hook. It happens. You're seeing a conspiracy where there's just boxing.",
    questions: [
      { text: "Yeah I know bookmakers. This is the fight game. Everyone knows everyone. Doesn't make me dirty.", stressDelta: 8, trustDelta: 2 },
      { text: "I told Darnell to stay on the outside, work the jab. If he'd listened to my game plan he wouldn't have walked into that shot.", stressDelta: 10, trustDelta: -3 },
      { text: "[Looks at his hands] The Vitelli money was a loan. I owe some people. That's a personal matter, not a criminal one.", stressDelta: 14, trustDelta: -7, microExpr: 'guilt' },
      { text: "My whole body's been tight lately. Stress. You'd be stressed too if the feds were crawling up your—", stressDelta: 17, trustDelta: -5, microExpr: 'stress' },
      { text: "Darnell knew. I told him to go down in the third if it got close. I told him it was just to manage the betting line for our rematch. He didn't ask questions.", stressDelta: 23, trustDelta: 6 }
    ],
    stares: [
      { text: "You got a staring problem, detective?", stressDelta: 6, microExpr: 'lie' },
      { text: "[Drums fingers on table] Get on with it.", stressDelta: 9 },
      { text: "[Eyes drop] ...Darnell trusted me.", stressDelta: 16, microExpr: 'guilt' }
    ],
    slams: [
      { text: "EASY! What's wrong with you, man?!", stressDelta: 18, defenseDelta: 5 },
      { text: "You don't scare me. I've been in locker rooms with real killers.", stressDelta: 7, defenseDelta: 17 },
      { text: "Get my lawyer on the phone. Right now. We're done.", stressDelta: -5, defenseDelta: 26 }
    ],
    whispers: [
      { text: "[Stiffens] Did Darnell talk?", stressDelta: 22, trustDelta: -6, microExpr: 'lie' },
      { text: "Vitelli's name better not come out of your mouth again.", stressDelta: 17, microExpr: 'stress' },
      { text: "...How much does Vitelli know you have?", stressDelta: 28, trustDelta: 7 }
    ],
    evidence: [
      { label: 'Vitelli Wire Transfer', text: "[Jaw tightens] That money covered a debt. Gambling debts. Mine. Nothing to do with the fight.", stressDelta: 23, trustDelta: -9, microExpr: 'lie' },
      { label: "Darnell's Training Video", text: "Look at his footwork. He was off all week. You can't fix what the kid does in the ring.", stressDelta: 19, trustDelta: -5 },
      { label: 'Corner Instructions Recording', text: "[Very still] Where did you get that? [Swallows] That was private. Between trainer and fighter.", stressDelta: 29, trustDelta: -8, microExpr: 'guilt' },
      { label: "Betting Line Anomaly Report", text: "[Exhales slowly] The line moved because smart money moves lines. That's how betting works.", stressDelta: 27, trustDelta: 5, microExpr: 'stress' }
    ],
    confession: "...Yeah. Vitelli came to me six weeks out. He had my debt — $180,000 in gambling losses — and he said he'd erase it all if the fight ended in round three. I told Darnell it was a tactical move. That we'd get the rematch, the real payday. He didn't know it was fixed. The kid just did what his trainer told him. That's on me. All of it's on me.",
    confessionResult: "Harris confessed. Darnell Watts was cleared of wrongdoing. Vitelli's organization was referred to organized crime unit.",
    shutdown: "Lawyer. Now. I'm not saying one more syllable."
  },

  {
    // 8
    id: 'malone',
    name: 'Grace Malone',
    caseTitle: 'The Vanished Will',
    caseNumber: '008',
    charge: 'Destruction of Legal Documents',
    caseDesc: 'The late Harold Malone\'s will, which left the estate to charity, disappeared from the law firm overnight. His daughter Grace stands to inherit everything.',
    skinTone: ['#e0c0a0','#c8a888','#b09070'],
    hairColor: '#2a2020',
    intro: "My father's will was probably misfiled. Law firms lose documents all the time. I haven't set foot in that building in three years.",
    questions: [
      { text: "I didn't even know the specifics of his will. Dad and I weren't... close in the final years. You probably know that already.", stressDelta: 7, trustDelta: 3 },
      { text: "The charity thing was a phase. Dad always said he'd take care of the family. I assumed that's what the will reflected.", stressDelta: 9, trustDelta: -2 },
      { text: "[Fidgets with ring] My brother showed me a draft— an old draft— that named the family. I thought that was the final version.", stressDelta: 13, trustDelta: -6, microExpr: 'guilt' },
      { text: "I've barely slept. I'm sorry if I seem nervous. This has been the worst month of my life.", stressDelta: 15, trustDelta: -4, microExpr: 'stress' },
      { text: "Patrick found out there was a newer will. He called me, said we had three days before probate. I didn't ask him how he was going to handle it.", stressDelta: 21, trustDelta: 8 }
    ],
    stares: [
      { text: "I'm grieving my father. Can you at least acknowledge that?", stressDelta: 5, microExpr: 'lie' },
      { text: "[Presses lips together] ...", stressDelta: 9 },
      { text: "[Wipes eye — possibly genuine] I loved him. Whatever else you think.", stressDelta: 12, microExpr: 'guilt' }
    ],
    slams: [
      { text: "HOW DARE YOU— I am a WIDOW in mourning!", stressDelta: 13, defenseDelta: 8 },
      { text: "I will have my attorney here in twenty minutes.", stressDelta: 5, defenseDelta: 19 },
      { text: "Not. Another. Word.", stressDelta: -3, defenseDelta: 26 }
    ],
    whispers: [
      { text: "[Catches breath] You spoke to Patrick.", stressDelta: 20, trustDelta: -5, microExpr: 'lie' },
      { text: "[Voice hollows] Dad gave everything away. To strangers. After everything we...", stressDelta: 18, microExpr: 'stress' },
      { text: "...Patrick had a key to the firm. I gave it to him.", stressDelta: 27, trustDelta: 9 }
    ],
    evidence: [
      { label: 'Firm Entry Log — 11pm', text: "[Swallows] Patrick visits the firm sometimes. He handles Dad's... handled Dad's business affairs.", stressDelta: 21, trustDelta: -8, microExpr: 'lie' },
      { label: 'Shredder Residue Analysis', text: "[Long pause] The shredder there is used by everyone. That proves nothing about anyone.", stressDelta: 19, trustDelta: -6 },
      { label: "Patrick's Phone Location", text: "[Closes eyes] He was there. I know he was there. I sent him.", stressDelta: 28, trustDelta: -9, microExpr: 'guilt' },
      { label: 'Dad\'s Charity Correspondence', text: "[Voice breaks for real this time] He spent his last years doing good. And I... [Cannot finish]", stressDelta: 30, trustDelta: 10, microExpr: 'stress' }
    ],
    confession: "...I gave Patrick the key and I told him there was a document in file drawer seven that needed to go away before Friday. I didn't watch him do it. I didn't ask him to describe it. But I knew what I was asking. I knew. [Quietly] Dad would be so ashamed of me.",
    confessionResult: "Malone confessed. Patrick Malone was arrested that evening. The charity was notified and probate proceedings restarted.",
    shutdown: "I want my attorney and I want her here now. We are completely done."
  },

  {
    // 9
    id: 'nazari',
    name: 'Darius Nazari',
    caseTitle: 'The Poisoned Pen',
    caseNumber: '009',
    charge: 'Defamation / Cyber Fraud',
    caseDesc: 'A fake investigative article destroyed a rival journalist\'s career. The writing style, sources, and timing all point to Nazari.',
    skinTone: ['#c8a070','#b08858','#987040'],
    hairColor: '#101010',
    intro: "I write under my own name. Always have. If someone published a fake article and it sounds like me, that's flattery — or a frame-up. Either way, not my problem.",
    questions: [
      { text: "The Brennan piece? I saw it go up. Thought it was genuine at first — the sourcing looked credible. I actually considered reaching out to whoever wrote it.", stressDelta: 8, trustDelta: 2 },
      { text: "My writing style is distinctive, yes. It's been studied, analyzed, imitated. That doesn't make me the author of every piece that reads like mine.", stressDelta: 10, trustDelta: -2 },
      { text: "[Pauses] Brennan and I had a professional disagreement. A significant one. But professionals have disagreements. They don't destroy each other over them.", stressDelta: 13, trustDelta: -6, microExpr: 'guilt' },
      { text: "My fingers are always ink-stained. I type twelve hours a day. Notice that all you want.", stressDelta: 16, trustDelta: -4, microExpr: 'stress' },
      { text: "I had a draft. A real one, based on real research into Brennan's conflicts of interest. I never published it. Someone else found it and... used it.", stressDelta: 22, trustDelta: 7 }
    ],
    stares: [
      { text: "I interview heads of state. Your stare doesn't register.", stressDelta: 5, microExpr: 'lie' },
      { text: "[Crosses arms] I'm comfortable with silence. Are you?", stressDelta: 8 },
      { text: "[Glances down] ...Brennan was a good journalist once.", stressDelta: 14, microExpr: 'guilt' }
    ],
    slams: [
      { text: "I am going to make you famous, detective. In the worst possible way.", stressDelta: 14, defenseDelta: 7 },
      { text: "Every single thing you do in this room is going in an article.", stressDelta: 6, defenseDelta: 18 },
      { text: "My editor is also my lawyer. Call her.", stressDelta: -3, defenseDelta: 27 }
    ],
    whispers: [
      { text: "[Still] You have my cloud backup.", stressDelta: 24, trustDelta: -6, microExpr: 'lie' },
      { text: "[Quietly] Brennan stole my source. A source I'd protected for six years.", stressDelta: 20, microExpr: 'stress' },
      { text: "...I published it through a ghost account. One time. For one story.", stressDelta: 29, trustDelta: 8 }
    ],
    evidence: [
      { label: 'Metadata Analysis', text: "[Exhales] Metadata can be spoofed. Any editor-level journalist knows that.", stressDelta: 22, trustDelta: -9, microExpr: 'lie' },
      { label: 'Source Contact Records', text: "[Controlled] Those sources spoke to me in confidence. If they're in that file, then someone violated my correspondence.", stressDelta: 20, trustDelta: -6 },
      { label: 'Ghost Account IP Trace', text: "[Long silence] ...A VPN can fail. I know that.", stressDelta: 27, trustDelta: -8, microExpr: 'guilt' },
      { label: "Brennan's Stolen Source", text: "[Something breaks open in his voice] Marcus Fell. He was my source for four years. Brennan published his name without protection. Do you understand what that cost?", stressDelta: 32, trustDelta: 11, microExpr: 'stress' }
    ],
    confession: "...Yes. I published it. Under a ghost account through a Romanian proxy. Every fact in that piece was real — I want you to know that. Brennan's conflicts of interest were real. But I fabricated the secondary quotes, the unnamed officials. That part I invented. Because I wanted it to be airtight. Because I wanted him finished. And because Marcus Fell deserved better than what Brennan did to him. [Pause] That doesn't make it right. I know that.",
    confessionResult: "Nazari confessed and provided the full digital trail. Brennan's lawsuit against him proceeded. Nazari's paper suspended him pending review.",
    shutdown: "Record this clearly: I am invoking my press freedom protections and I am done talking."
  },

  {
    // 10
    id: 'santos',
    name: 'Carla Santos',
    caseTitle: 'The Missing Medicine',
    caseNumber: '010',
    charge: 'Pharmaceutical Theft',
    caseDesc: 'Twelve vials of a scarce cancer medication vanished from the hospital pharmacy. Santos, a night-shift nurse, had after-hours access.',
    skinTone: ['#c09870','#a88058','#907040'],
    hairColor: '#120808',
    intro: "I have given fifteen years to this hospital. I take care of dying people every single night. Whatever happened to those vials, I had nothing to do with it.",
    questions: [
      { text: "Yes, I accessed the pharmacy at 2am. Mrs. Ortega on four needed a pain management adjustment. I documented everything.", stressDelta: 7, trustDelta: 4 },
      { text: "Those medications are logged in and out. If there's a discrepancy, someone made a data entry error. It happens.", stressDelta: 9, trustDelta: -1 },
      { text: "[Voice quiets] My sister is sick. Stage three. She's been on a waiting list for six months for that exact medication. [Stops]", stressDelta: 15, trustDelta: -5, microExpr: 'guilt' },
      { text: "I don't sleep anymore. You try watching people die every night and see how steady your hands are.", stressDelta: 18, trustDelta: -3, microExpr: 'stress' },
      { text: "I took them for Rosa. Four vials. Eight. I kept going back. I know how many people might need those. I know. But she's my sister.", stressDelta: 24, trustDelta: 10 }
    ],
    stares: [
      { text: "I've had harder stares from patients who were scared of dying.", stressDelta: 5, microExpr: 'lie' },
      { text: "[Closes eyes briefly] ...", stressDelta: 10 },
      { text: "[Quietly] Please just let me explain.", stressDelta: 15, microExpr: 'guilt' }
    ],
    slams: [
      { text: "Don't. Don't do that. I'm not who you think I am.", stressDelta: 14, defenseDelta: 6 },
      { text: "[Tears up] I save lives. That's all I do.", stressDelta: 7, defenseDelta: 17 },
      { text: "I want someone else in this room. Right now.", stressDelta: -3, defenseDelta: 25 }
    ],
    whispers: [
      { text: "[Barely holds together] Rosa has three months without treatment.", stressDelta: 20, trustDelta: -4, microExpr: 'lie' },
      { text: "If you have children, you already know what I would do.", stressDelta: 18, microExpr: 'stress' },
      { text: "...She doesn't know where the medicine came from. She can't know.", stressDelta: 26, trustDelta: 10 }
    ],
    evidence: [
      { label: 'Pharmacy Access Log', text: "[Steady] I was logged in for six minutes. That's longer than a pain adjustment takes. I know.", stressDelta: 21, trustDelta: -7, microExpr: 'lie' },
      { label: 'Inventory Discrepancy Report', text: "[Nods slowly] Twelve vials. Yes. I know the number.", stressDelta: 24, trustDelta: -5 },
      { label: "Rosa Santos's Medical File", text: "[Covers mouth] You have her file. [Long pause] ...She doesn't know I took them.", stressDelta: 29, trustDelta: -8, microExpr: 'guilt' },
      { label: 'Hospital Refrigerator Camera', text: "[Quietly, with exhaustion] That's me. That's my third time that week. You can keep watching — I went back twice more.", stressDelta: 31, trustDelta: 12, microExpr: 'stress' }
    ],
    confession: "...I took twelve vials over three weeks. I told myself I'd find a way to replace them, to buy them privately, something. Rosa started responding to the treatment last week. She doesn't know. Please — [voice breaks] whatever happens to me, please don't take her off the treatment. She's finally responding. Please.",
    confessionResult: "Santos confessed fully. The hospital arranged an emergency compassionate-use protocol for her sister. Santos was placed on administrative leave pending review.",
    shutdown: "I need a moment. I need... I can't do this right now. Please."
  }
];

let ActiveCase = null;
let questionIndex = 0;
let stareIndex = 0;
let slamIndex = 0;
let whisperIndex = 0;

function pickRandomCase() {

  let idx;
  do { idx = Math.floor(Math.random() * SuspectDatabase.length); }
  while (idx === GameState.lastPlayedIndex && SuspectDatabase.length > 1);
  GameState.lastPlayedIndex = idx;
  return SuspectDatabase[idx];
}

function loadCase(suspect) {
  ActiveCase = suspect;
  GameState.currentSuspect = suspect.name;
  GameState.currentCase = suspect.caseTitle;


  document.querySelector('.case-brief').innerHTML = `
    <strong>Active Case</strong>
    <b style="color:var(--text-gold)">${suspect.caseTitle}</b><br><br>
    Suspect: <span style="color:var(--text-primary)">${suspect.name}</span><br>
    Case #${suspect.caseNumber} — ${suspect.charge}<br><br>
    <span style="font-size:10px">${suspect.caseDesc}</span>
  `;

  document.querySelector('.case-file-label').textContent = `Case #${suspect.caseNumber}`;
  document.querySelector('.case-file-title').innerHTML = `${suspect.caseTitle}<br><br>Suspect: ${suspect.name}<br>Charge: ${suspect.charge}`;

  const evPanel = document.querySelector('.evidence-panel');
  evPanel.innerHTML = '<div class="panel-title">Evidence File</div>';
  suspect.evidence.forEach((ev, i) => {
    const div = document.createElement('div');
    div.className = 'evidence-item';
    div.id = 'ev' + i;
    div.innerHTML = `<div class="evidence-dot"></div><span>${ev.label}</span>`;
    evPanel.appendChild(div);
  });

  const head = document.getElementById('suspectHead');
  head.style.background = `linear-gradient(180deg, ${suspect.skinTone[0]} 0%, ${suspect.skinTone[1]} 60%, ${suspect.skinTone[2]} 100%)`;
  document.querySelector('.suspect-hair').style.background = `linear-gradient(180deg, ${suspect.hairColor}, ${suspect.hairColor}dd)`;

  document.getElementById('dialogueSpeaker').textContent = suspect.name.toUpperCase();
}

