/* Genesis Ministry design preview: sermon notes and devotionals, one source for every surface.
   Read by the four church sites (their Notes page), the workspace Notes screens, the member app (home,
   notes reader, devotional reader) and every Hope that answers "What was Sunday's message about?".
   Every church, pastor and word here is made up for the demo. The pastors' notes and devotionals are
   written fresh; the scripture is the King James Version, which is in the public domain in the United
   States, printed word for word with its translation named.

   Shape (window.GM_NOTES):
     translation, translationNote, today (the demo clock's date), devotionalAt
     churches[slug] = { name, short, watch (the site's message anchor), services (Sunday service times),
       sundayAt (30 minutes before the first service: the default time Sunday notes go out),
       sermons:  [{ id, kind:"sermon", series, part, title, speaker:"lead"|"care", date, length, ref,
                    verses:[{ ref, text }], points[3-4], more[], questions[3], week, status:"published" }],
       draft:    { the next Sunday's sermon, status "draft": the same fields, plus way (outline, file,
                   video or memo), came, raw[{ text, t }], file, video, memo, src (which raw line or lines
                   each shaped line came from: a number or an array of numbers), leftOut { line, text,
                   shaped } (the one raw line Hope left out, and the pastor's own words for it if put back) },
       devotionals: [{ id, kind:"devotional", date, title, verses, paras[3], prayer, by:"care",
                       status:"published"|"scheduled"|"draft", at:"06:00", and on the draft: way, raw,
                       file, video, memo, src }] }
   Every shaped line keeps to the pastor's own words: tools/notes.mjs --check holds each one to the words
   of the raw line or lines it cites (grammar and small words aside), and every raw line is either cited
   or is the one line left out.
   Helpers: GM_NOTES.church(slug), .byName(name), .latest(slug), .todays(slug), .find(slug, id),
   .all(slug), .speaker(note, pastors), .dateLong(iso), .dayShort(iso), .refHTML(ref) (a reference that
   never breaks across lines), .readMins(devotional), .words(text), .srcList(src). Nothing is fetched or sent. */
(function () {
  "use strict";
  var KJV = "King James Version";

  function v(ref, text) { return { ref: ref, text: text }; }
  function line(text, t) { return { text: text, t: t || "" }; }
  /* A manuscript paragraph under one of the pastor's own headings. */
  function head(h, text, t) { return { h: h, text: text, t: t || "" }; }

  var C = {};

  /* ------------------------------------------------------------------ Lightwell Church (Bright and Modern) */
  C["bright-modern"] = {
    name: "Lightwell Church", short: "Lightwell", watch: "#message", prefix: "lw", pastors: ["Theo", "Priya"],
    services: ["9:00 AM", "10:45 AM"],
    sermons: [
      { id: "lw-2026-11-15", series: "Open Doors", part: "Week 3", title: "Room for questions", speaker: "lead", date: "2026-11-15", length: "36 min", ref: "John 20:24-29",
        verses: [v("John 20:29", "Jesus saith unto him, Thomas, because thou hast seen me, thou hast believed: blessed are they that have not seen, and yet have believed.")],
        points: ["Thomas brought his doubts into the room, and Jesus met him there.", "Honest questions are welcome here. Faith grows when it is allowed to ask.", "Peace came before the answers. Jesus said peace first."],
        more: ["Thomas was not pushed out for asking. He was still with the others a week later, and that is where Jesus found him.", "Doubt is not the opposite of faith. Sometimes it is how faith learns to stand on its own feet."],
        questions: ["What honest question are you carrying right now?", "Why do you think Jesus offered peace before answers?", "How can our group make room for each other's questions?"],
        week: "Bring one honest question to God this week, out loud or on paper." },
      { id: "lw-2026-11-08", series: "Open Doors", part: "Week 2", title: "Today at your house", speaker: "care", date: "2026-11-08", length: "34 min", ref: "Luke 19:1-10",
        verses: [v("Luke 19:5", "And when Jesus came to the place, he looked up, and saw him, and said unto him, Zacchaeus, make haste, and come down; for to day I must abide at thy house.")],
        points: ["Zacchaeus climbed a tree to see Jesus, not to be seen.", "Jesus stopped, called him by name and invited himself over.", "The change came after the welcome, not before it."],
        more: [],
        questions: ["When have you felt you had to earn a seat before you could belong?", "Jesus said today. What would saying yes today look like for you?", "Who in your life needs an invitation more than a lecture?"],
        week: "Share a meal with someone, with no agenda." }
    ],
    draft: { id: "lw-2026-11-22", series: "Open Doors", part: "Week 4", title: "Come and see", speaker: "care", date: "2026-11-22", length: "", ref: "John 1:45-46",
      way: "outline", came: "Wednesday",
      verses: [v("John 1:45-46", "Philip findeth Nathanael, and saith unto him, We have found him, of whom Moses in the law, and the prophets, did write, Jesus of Nazareth, the son of Joseph. And Nathanael said unto him, Can there any good thing come out of Nazareth? Philip saith unto him, Come and see.")],
      passages: [{ label: "John 1:46 only", note: "Nathanael's question and Philip's answer", verses: [v("John 1:46", "And Nathanael said unto him, Can there any good thing come out of Nazareth? Philip saith unto him, Come and see.")] }],
      raw: [
        line("Come and see: John 1:45-46, Open Doors wk 4"),
        line("Philip finds Nathanael. He doesn't argue, he invites"),
        line("Can anything good come out of Nazareth? honest doubt again (tie to Thomas)"),
        line("come and see = invitation not debate"),
        line("our part: bring people, Jesus does the convincing"),
        line("story: my grandmother invited the neighbor to Easter for eleven years"),
        line("groups: who invited you? who is your Nathanael? what keeps us from asking?"),
        line("this week: invite one person to Sunday or to Start Here lunch")
      ],
      /* The same message as Pastor Priya says it (her run-through video or a voice memo): full spoken sentences. */
      spoken: [
        line("This is week four of Open Doors. Come and see, from John 1, verses 45 and 46.", "0:05"),
        line("Philip finds Nathanael, and notice what he doesn't do. He doesn't argue. He invites.", "0:31"),
        line("Nathanael says, can anything good come out of Nazareth? That's honest doubt again, just like Thomas last week.", "1:02"),
        line("And Philip just says come and see. Come and see is an invitation. It's not a debate.", "1:40"),
        line("That's our part. We bring people, and Jesus does the convincing.", "2:12"),
        line("My grandmother invited the neighbor to Easter for eleven years before she finally came.", "2:48"),
        line("In your groups this week, talk about who invited you. Who is your Nathanael? And what keeps us from asking?", "3:30"),
        line("This week, invite one person to Sunday, or to the Start Here lunch.", "4:02")
      ],
      file: { name: "come-and-see-outline.docx", pages: 2 }, video: "https://video.example.org/lightwell/run-through-2026-11-18", posted: "https://video.example.org/lightwell/sunday-2026-11-22", memo: "4:20",
      points: ["Philip finds Nathanael. He does not argue. He invites.", "Can anything good come out of Nazareth? Honest doubt again, like Thomas.", "Come and see is an invitation, not a debate.", "Our part is to bring people. Jesus does the convincing."],
      questions: ["Who invited you?", "Who is your Nathanael?", "What keeps us from asking?"],
      week: "Invite one person to Sunday or to the Start Here lunch.",
      src: { title: 0, verses: [0], points: [1, 2, 3, 4], questions: [6, 6, 6], week: 7 },
      leftOut: { line: 5, text: "the story about your grandmother's Easter invitation", shaped: "My grandmother invited the neighbor to Easter for eleven years." } },
    devotionals: [
      { date: "2026-11-16", title: "How long?", verses: [v("Psalm 13:1", "How long wilt thou forget me, O LORD? for ever? how long wilt thou hide thy face from me?")],
        paras: ["David asks God the same question four times in two short verses: how long? He does not tidy it up first or pretend that he is fine. He says what he feels, to the One he feels it about.",
          "That kind of honesty is not a lack of faith. You only keep asking how long of someone you still expect to answer. The psalm ends in trust a few verses later, but it starts right here, and God kept both parts in the Bible for us to read.",
          "So you are allowed to start where you are this week. If there is a question you keep asking, say it plainly to God today, out loud or on paper. Then stay a minute in the quiet and listen."],
        prayer: "Lord, you know the question I keep asking. Thank you that I can bring it to you. Amen." },
      { date: "2026-11-17", title: "Help my unbelief", verses: [v("Mark 9:24", "And straightway the father of the child cried out, and said with tears, Lord, I believe; help thou mine unbelief.")],
        paras: ["A father brings his son to Jesus after the disciples could not help. His prayer comes out half faith and half doubt: Lord, I believe; help thou mine unbelief. He says it with tears.",
          "Jesus does not send him away to sort himself out first. He does not ask for a cleaner prayer. He hears the half that is faith and the half that is not, and he helps the boy. Jesus takes the boy by the hand and lifts him up.",
          "Mixed faith is still faith. Most of us live in that father's sentence more often than we admit. Today, bring Jesus the part of you that believes, name the part that does not, and let him meet you in both. Jesus is patient with that kind of honest prayer."],
        prayer: "Jesus, I believe. Help the part of me that does not believe yet. Amen." },
      { date: "2026-11-18", title: "Ask, seek, knock", verses: [v("Matthew 7:7-8", "Ask, and it shall be given you; seek, and ye shall find; knock, and it shall be opened unto you: For every one that asketh receiveth; and he that seeketh findeth; and to him that knocketh it shall be opened.")],
        paras: ["Jesus gives three invitations in a row, and each one is something you do. Ask. Seek. Knock. None of them needs the answer first. They only need you to come to the door. You do not have to knock loudly or for long.",
          "Notice the promise that follows: every one that asketh receiveth. Not every one who asks perfectly, or who already knows the right words. Every one. The door is not kept for people who have it all figured out.",
          "Try it plainly today. Ask God one honest question out loud. Seek him in a few verses of scripture before lunch. Knock again tonight, even if it feels like nothing happened this morning, and keep listening through the day."],
        prayer: "Father, I am asking, seeking and knocking. Thank you that you hear me. Amen." },
      { date: "2026-11-19", title: "Peace first", verses: [v("John 14:27", "Peace I leave with you, my peace I give unto you: not as the world giveth, give I unto you. Let not your heart be troubled, neither let it be afraid.")],
        paras: ["Jesus spoke these words the night before the cross, to friends who were about to be very afraid. He did not give them a full explanation of what was coming. He gave them his peace.",
          "He also says it is not as the world giveth. The world's peace usually waits until every problem is solved. His peace comes first, in the middle of the questions, and it stays when the answers are slow. It is a gift, not a reward for having everything settled.",
          "Whatever you are carrying into today, you do not have to settle it all before you receive what he offers. Let not your heart be troubled, he says. Take a slow breath, hand him the question, and take his peace first."],
        prayer: "Lord, I bring you my questions today. Meet me in them, and give me your peace first. Amen." },
      { date: "2026-11-20", title: "Wisdom for the asking", verses: [v("James 1:5", "If any of you lack wisdom, let him ask of God, that giveth to all men liberally, and upbraideth not; and it shall be given him.")],
        paras: ["James says God gives wisdom to all men liberally, and upbraideth not. That old word means he does not scold. He gives generously, without a lecture attached to the gift.",
          "Some of us were taught to expect a God who sighs when we ask for help again. James paints a different picture. You can come back with the same decision a second and a third time, and you will not be shamed for asking. He would rather you ask than guess.",
          "Is there a choice in front of you this week, at home, at work or in a friendship? Write it down in one line. Ask God for wisdom about it plainly, and expect a generous answer, even if it comes one step at a time. Then take the first step."],
        prayer: "God, I need wisdom for what is in front of me. Thank you for giving freely. Amen." },
      { date: "2026-11-21", title: "Be still", verses: [v("Psalm 46:10", "Be still, and know that I am God: I will be exalted among the heathen, I will be exalted in the earth.")],
        paras: ["This verse sits in a psalm full of noise: waters that roar, mountains that shake, nations in an uproar. Be still is not spoken in a quiet room. It is spoken in the middle of all that. And still the psalm says God is our refuge and strength.",
          "So stillness here is not the absence of trouble. It is trust while the trouble is still loud. The psalm says the Lord of hosts is with us, and that is the reason we can stop striving for a moment.",
          "Take five minutes today with no phone and no plan. Sit, breathe and read the verse slowly two or three times. Let it remind you who God is before the noise of the day starts talking again."],
        prayer: "Lord, quiet my heart today, and help me know that you are God. Amen." },
      { date: "2026-11-22", title: "Taste and see", verses: [v("Psalm 34:8", "O taste and see that the LORD is good: blessed is the man that trusteth in him.")],
        paras: ["Taste and see is an invitation, not an argument. You cannot taste something by reading about it. Somebody can describe a meal to you all day long, and you still do not really know it until you sit down and eat. The second half of the verse says blessed is the man that trusteth in him, and trust usually starts small, with one taste.",
          "Philip said almost the same thing to Nathanael: come and see. Same invitation. He did not win a debate with his friend. He just brought him, and Nathanael brought his doubt with him.",
          "So today, as you come to worship, do not just hear about God's goodness from somebody else. Come and see it, come and taste it for yourself, and bring somebody with you if you can."],
        prayer: "Lord, I want to taste and see that you are good today. Amen.",
        way: "memo", memo: "2:10", file: { name: "taste-and-see-devotional.docx", pages: 1 }, video: "https://video.example.org/lightwell/devotional-2026-11-22",
        raw: [line("Sunday devotional, Psalm 34 verse 8, taste and see.", "0:03"),
          line("Okay. Taste and see is an invitation, it's not an argument. You can't taste something by reading about it. Somebody can describe a meal to you all day long, and you still don't really know it until you sit down and eat.", "0:12"),
          line("And the second half of the verse says blessed is the man that trusteth in him. Trust usually starts small, with one taste.", "0:41"),
          line("Tie it to Philip and Nathanael. Philip said almost the same thing, come and see. Same invitation. He didn't win a debate with his friend, he just brought him, and Nathanael brought his doubt with him.", "0:58"),
          line("So today, as you come to worship, don't just hear about God's goodness from somebody else. Come and see it, come and taste it for yourself, and bring somebody with you if you can.", "1:31"),
          line("Prayer: Lord, I want to taste and see that you're good today. Amen.", "1:58")],
        src: { title: 0, verses: [0], paras: [[1, 2], 3, 4], prayer: 5 } }
    ]
  };

  /* ------------------------------------------------------------------ Lampstand Church (Bold and Dark) */
  C["bold-dark"] = {
    name: "Lampstand Church", short: "Lampstand", watch: "#watch", prefix: "ls", pastors: ["Andre", "Talia"],
    services: ["10:00 AM", "6:00 PM"],
    sermons: [
      { id: "ls-2026-11-15", series: "Lamps On", part: "Part 3", title: "Shine where you are", speaker: "care", date: "2026-11-15", length: "38 min", ref: "Matthew 5:14-16",
        verses: [v("Matthew 5:16", "Let your light so shine before men, that they may see your good works, and glorify your Father which is in heaven.")],
        points: ["A lamp does not choose the room. It shines where it is set.", "Your street, your shift and your table are places God can use.", "Good works point past us, to the Father."],
        more: ["Jesus did not say you will become the light someday. He said you are the light, right now.", "Hiding the lamp is easy. Setting it on a stand takes a little courage every day."],
        questions: ["Which ordinary place in your week feels least like a place for light?", "What is the difference between showing off and letting your light shine?", "How can we pray for each other's streets and shifts?"],
        week: "Pick one ordinary place and ask how you can be light there." },
      { id: "ls-2026-11-08", series: "Lamps On", part: "Part 2", title: "Not under a bushel", speaker: "lead", date: "2026-11-08", length: "40 min", ref: "Mark 4:21-23",
        verses: [v("Mark 4:21", "And he said unto them, Is a candle brought to be put under a bushel, or under a bed? and not to be set on a candlestick?")],
        points: ["A lamp is made to be seen, not stored.", "Fear and hurry are the bushels we reach for most.", "Even a small light changes a dark room."],
        more: [],
        questions: ["What tends to cover your light?", "Whose small light helped you this year?", "How could you set your lamp on the stand this week?"],
        week: "Do one kind thing where people can see it, and give God the thanks." }
    ],
    draft: { id: "ls-2026-11-22", series: "Lamps On", part: "Part 4", title: "Follow the light", speaker: "lead", date: "2026-11-22", length: "", ref: "John 8:12",
      way: "memo", came: "Tuesday",
      verses: [v("John 8:12", "Then spake Jesus again unto them, saying, I am the light of the world: he that followeth me shall not walk in darkness, but shall have the light of life.")],
      raw: [
        line("Follow the light. John 8:12. Lamps On, part 4"),
        line("Jesus doesn't say I'll point you to the light. He says I am the light."),
        line("following means the next step, not the whole map"),
        line("promise at the end: whoever follows him has the light of life"),
        line("story: the night the power went out at the shelter, one flashlight got everyone down the stairs"),
        line("groups: where do you wish you had the whole map? what's your next step? who walked ahead of you with a light?"),
        line("this week: take one next step you already know to take, and tell someone")
      ],
      spoken: [
        line("Okay, Sunday, part four of Lamps On. Follow the light. John 8:12.", "0:04"),
        line("Jesus doesn't say I'll point you to the light. He says I am the light. That's the whole thing.", "0:21"),
        line("Following means the next step. Not the whole map.", "1:02"),
        line("And the promise at the end: whoever follows him has the light of life.", "1:40"),
        line("Tell the story about the night the power went out at the shelter and one flashlight got everyone down the stairs.", "2:15"),
        line("Groups: where do you wish you had the whole map? What's your next step? Who walked ahead of you with a light?", "2:58"),
        line("This week: take one next step you already know to take, and tell someone.", "3:31")
      ],
      file: { name: "follow-the-light-notes.pdf", pages: 1 }, video: "https://video.example.org/lampstand/run-through-2026-11-18", posted: "https://video.example.org/lampstand/sunday-2026-11-22", memo: "3:48",
      points: ["Jesus does not say I will point you to the light. He says I am the light.", "Following means the next step, not the whole map.", "The promise at the end: whoever follows him has the light of life."],
      questions: ["Where do you wish you had the whole map?", "What is your next step?", "Who walked ahead of you with a light?"],
      week: "Take one next step you already know to take, and tell someone.",
      src: { title: 0, verses: [0], points: [1, 2, 3], questions: [5, 5, 5], week: 6 },
      leftOut: { line: 4, text: "the story about the night the power went out at the shelter", shaped: "The night the power went out at the shelter, one flashlight got everyone down the stairs." } },
    devotionals: [
      { date: "2026-11-16", title: "Let there be light", verses: [v("Genesis 1:3", "And God said, Let there be light: and there was light.")],
        paras: ["The first words God speaks in the Bible make light. Before the land, the seas or anything living, God says let there be light, and there was light. Nothing argued back.",
          "The earth was without form and dark when those words were spoken. God did not wait for the darkness to tidy itself up. He spoke into it, and the light came at his word. Darkness was upon the face of the deep, and it did not have the last word.",
          "Whatever this week holds for you, a hard diagnosis, a quiet house or a job that wears you down, the God who spoke light at the very start is still speaking it now. Ask him to speak light into one dark place in your week."],
        prayer: "God of the first morning, speak light into my day. Amen." },
      { date: "2026-11-17", title: "A lamp for the next step", verses: [v("Psalm 119:105", "Thy word is a lamp unto my feet, and a light unto my path.")],
        paras: ["A lamp in the ancient world was a small clay dish with oil and a wick. It did not light up the whole road. It lit a few steps around your feet, and that was enough to walk by.",
          "The psalm says God's word is like that: a lamp unto my feet, and a light unto my path. Not a floodlight over the next ten years. Light for the step in front of you, and then the next one.",
          "If you cannot see the whole year ahead, you are not doing faith wrong. Read a few verses today and ask one question: what is the next faithful step? Then take that one step, and trust the lamp for the next."],
        prayer: "Lord, light the next step, and give me courage to take it. Amen." },
      { date: "2026-11-18", title: "Light in the dark", verses: [v("John 1:5", "And the light shineth in darkness; and the darkness comprehended it not.")],
        paras: ["John says the light shineth in darkness, and the darkness comprehended it not. The darkness did not understand the light. It did not know what to do with it, and the light kept shining anyway.",
          "Notice that John does not say the darkness is gone. He says the light is shining in it, right now, in the present tense. Some seasons feel exactly like that. The hard thing is still there, and so is the light.",
          "If you are in a dark stretch this week, you are not alone in it. Name one small light God has given you today, a friend who called, a verse that stayed with you or an hour of quiet, and thank him for it by name."],
        prayer: "Jesus, shine in the dark places I carry today. Amen." },
      { date: "2026-11-19", title: "No darkness at all", verses: [v("1 John 1:5", "This then is the message which we have heard of him, and declare unto you, that God is light, and in him is no darkness at all.")],
        paras: ["John's whole message fits in one line: God is light, and in him is no darkness at all. Nothing hidden, nothing false, nothing waiting in the shadows to catch you out. John had walked with Jesus and seen it for himself.",
          "That can sound frightening at first, because light shows everything. But the next verses in the letter are about walking in the light together, and about being made clean. The light is not there to shame you. It is there so you can walk in it.",
          "So you can come to a God like that with the truth about your day. Tell him what really happened, the good and the not so good. He already knows, and he will not use it against you. Honesty is the first step into the light."],
        prayer: "Father of light, I come to you honestly today. Amen." },
      { date: "2026-11-20", title: "Arise, shine", verses: [v("Isaiah 60:1", "Arise, shine; for thy light is come, and the glory of the LORD is risen upon thee.")],
        paras: ["Isaiah speaks to a tired people who had known exile and loss. He tells them to get up and shine. Not because they are strong, but because, as he says, thy light is come.",
          "The order matters. The glory of the Lord rises on them first, and then they shine. They are not asked to make the light. They are asked to stand up in it. Their part is to arise. His part is the light.",
          "If you feel worn out today, start there. You do not have to produce your own glow. Let his light rise on you in a few quiet minutes this morning, and then go and shine where you are set: your street, your shift, your table. Your shining does not have to be loud."],
        prayer: "Lord, let your glory rise on me today, so I can shine where I am. Amen." },
      { date: "2026-11-21", title: "Whom shall I fear?", verses: [v("Psalm 27:1", "The LORD is my light and my salvation; whom shall I fear? the LORD is the strength of my life; of whom shall I be afraid?")],
        paras: ["David names the Lord three ways in one verse: my light, my salvation and the strength of my life. Then he asks two questions that answer themselves. Whom shall I fear? Of whom shall I be afraid? David had real reasons to be afraid.",
          "He is not pretending there is nothing frightening in his life. The rest of the psalm talks about enemies and armies. He is setting what he fears beside who God is, and letting the bigger one win. Fear gets smaller when it is set beside the right thing.",
          "Try that today. Name one worry you are carrying, as plainly as you can. Then set it beside those three words, light, salvation and strength, and say the verse out loud once before you go."],
        prayer: "Lord, you are my light and my strength. Calm my worries today. Amen." },
      { date: "2026-11-22", title: "Light in our hearts", verses: [v("2 Corinthians 4:6", "For God, who commanded the light to shine out of darkness, hath shined in our hearts, to give the light of the knowledge of the glory of God in the face of Jesus Christ.")],
        paras: ["Paul is looking right back at Genesis here. The same God who said let there be light at creation, out of darkness, is the one who has shined in our hearts. Back then the light came into a dark, empty world. Now it comes into a heart. Same voice, new morning.",
          "Where does that light show up? In the face of Jesus Christ. So when we want to know what God is like, we look at Jesus. That is the whole verse in one line.",
          "Before church today, stop for a minute and thank him for the light you already have. You do not have to earn it this morning. It is already shining, and it is meant to show. Then carry it into the room with you, into the coffee line and the seat next to somebody new."],
        prayer: "God, thank you for shining in my heart. Let it show today. Amen.",
        way: "memo", memo: "2:24", file: { name: "light-in-our-hearts.pdf", pages: 1 }, video: "https://video.example.org/lampstand/devotional-2026-11-22",
        raw: [line("Sunday morning devotional. Second Corinthians 4:6. Light in our hearts.", "0:03"),
          line("Paul is looking right back at Genesis here. The same God who said let there be light at creation, out of darkness, he's the one who has shined in our hearts. Back then the light came into a dark, empty world. Now it comes into a heart. Same voice, new morning.", "0:11"),
          line("And where does that light show up? In the face of Jesus Christ. So when we want to know what God is like, we look at Jesus. That's the whole verse in one line.", "0:49"),
          line("Before church today, just stop for a minute and thank him for the light you already have. You don't have to earn it this morning. It's already shining, and it's meant to show. Then carry it into the room with you, into the coffee line, the seat next to somebody new.", "1:22"),
          line("Prayer: God, thank you for shining in my heart. Let it show today. Amen.", "2:10")],
        src: { title: 0, verses: [0], paras: [1, 2, 3], prayer: 4 } }
    ]
  };

  /* ------------------------------------------------------------------ Calder Hill Chapel (Classic and Timeless) */
  C["classic-timeless"] = {
    name: "Calder Hill Chapel", short: "Calder Hill", watch: "#message", prefix: "ch", pastors: ["Samuel", "Ruth"],
    services: ["9:00 AM", "11:00 AM"],
    sermons: [
      { id: "ch-2026-11-15", series: "Songs for the Road", part: "Week 4", title: "Lift up your eyes", speaker: "care", date: "2026-11-15", length: "36 min", ref: "Psalm 121",
        verses: [v("Psalm 121:1-2", "I will lift up mine eyes unto the hills, from whence cometh my help. My help cometh from the LORD, which made heaven and earth.")],
        points: ["This psalm was sung on the road, by people who were tired.", "Our help comes from the Lord, who made heaven and earth.", "He keeps our going out and our coming in, every step."],
        more: ["The hills could not help the travelers. They looked past the hills to the One who made them.", "The Lord who keeps Israel does not sleep. We can."],
        questions: ["Where do you look first when you need help?", "What does it mean to you that the Lord does not sleep?", "Which line of Psalm 121 do you most need this week?"],
        week: "Read Psalm 121 each morning this week before you leave the house." },
      { id: "ch-2026-11-08", series: "Songs for the Road", part: "Week 3", title: "Glad to go", speaker: "lead", date: "2026-11-08", length: "31 min", ref: "Psalm 122",
        verses: [v("Psalm 122:1", "I was glad when they said unto me, Let us go into the house of the LORD.")],
        points: ["The pilgrims were glad before they arrived. The going was part of the gift.", "Worship is something we do side by side on the road.", "The psalm turns into prayer for the peace of the city."],
        more: [],
        questions: ["What makes you glad to gather, and what makes it hard?", "Who has walked beside you on the road of faith?", "How could we pray for the peace of Richmond this week?"],
        week: "Pray for the peace of your street each evening." }
    ],
    draft: { id: "ch-2026-11-22", series: "Songs for the Road", part: "Week 5", title: "Great things", speaker: "lead", date: "2026-11-22", length: "", ref: "Psalm 126",
      /* A full manuscript, the way Pastor Samuel writes: Wednesday night, in Word, with headings. */
      way: "file", came: "Wednesday at 10:40 PM", manuscript: true,
      verses: [v("Psalm 126:3", "The LORD hath done great things for us; whereof we are glad."), v("Psalm 126:5", "They that sow in tears shall reap in joy.")],
      /* Other passages the pastor can print instead, every one named in the manuscript and printed word for word. */
      passages: [
        { label: "Psalm 126:1-3 and 126:5", note: "Adds verses 1 and 2, which key point 1 quotes", verses: [v("Psalm 126:1-3", "When the LORD turned again the captivity of Zion, we were like them that dream. Then was our mouth filled with laughter, and our tongue with singing: then said they among the heathen, The LORD hath done great things for them. The LORD hath done great things for us; whereof we are glad."), v("Psalm 126:5", "They that sow in tears shall reap in joy.")] },
        { label: "All of Psalm 126", note: "The whole psalm, six verses", verses: [v("Psalm 126:1-6", "When the LORD turned again the captivity of Zion, we were like them that dream. Then was our mouth filled with laughter, and our tongue with singing: then said they among the heathen, The LORD hath done great things for them. The LORD hath done great things for us; whereof we are glad. Turn again our captivity, O LORD, as the streams in the south. They that sow in tears shall reap in joy. He that goeth forth and weepeth, bearing precious seed, shall doubtless come again with rejoicing, bringing his sheaves with him.")] }
      ],
      raw: [
        line("Great things. Psalm 126. Songs for the Road, week 5. A message for Thanksgiving week.", "0:06"),
        line("This is the fifth of the Songs of Degrees we have walked through this fall, the songs the pilgrims sang on the road up to Jerusalem. Psalm 126 is short, six verses, but it holds the whole year in it: the laughter, the tears and the harvest.", "0:20"),
        head("They remembered", "When the Lord turned again the captivity of Zion, we were like them that dream. Then was our mouth filled with laughter. The people remembered what God had done, and they laughed out loud.", "1:05"),
        line("Think about what that captivity meant. Years far from home, years of songs that would not come. Then the way home opened, and it felt too good to be real. They were like them that dream.", "1:48"),
        line("Even the neighbors noticed. Then said they among the heathen, The Lord hath done great things for them. The people around Israel could see it before Israel could say it.", "2:40"),
        head("Gratitude remembers out loud", "Verse 3 is the center of the psalm. The LORD hath done great things for us; whereof we are glad. The neighbors said for them. Israel answers for us. Gratitude remembers out loud, and it makes the story personal.", "3:22"),
        line("Most of us do not forget the great things on purpose. We just stop saying them. The week fills up, and what God did in March is buried by what we need in November.", "4:15"),
        line("So this week, before the table and the turkey, I want us to practice remembering. Not a list of everything. One great thing, said out loud, with your own mouth.", "5:02"),
        head("Sowing in tears", "Then the psalm turns, and it turns honest. Turn again our captivity, O Lord, as the streams in the south. The people who laughed in verse 2 are praying again in verse 4. Gratitude does not mean every prayer is answered.", "5:50"),
        line("Verse 5 of the psalm is the promise for that place. They that sow in tears shall reap in joy. Tears sown are not wasted. The farmer who weeps as he plants is still planting.", "6:41"),
        line("Some of you are sowing in tears right now. A diagnosis, an empty chair at the table this year, a child who has not called. The psalm does not tell you to stop crying. It tells you the seed is still in the ground.", "7:30"),
        line("When I was a boy, the river came up over my father's garden. The spring after the flood he planted it again, row by row, and some of what came up that summer was the best we ever grew. I think of that garden every Thanksgiving.", "8:24"),
        head("Bringing in the sheaves", "Verse 6 ends with the harvest. He that goeth forth and weepeth, bearing precious seed, shall doubtless come again with rejoicing, bringing his sheaves with him. The same person who went out weeping comes back carrying the harvest.", "9:31"),
        head("For groups", "For your group this week: What has the Lord done that you have stopped remembering? Say one great thing out loud. Where are you sowing in tears right now?", "10:40"),
        head("This week", "At your Thanksgiving table, ask everyone to name one great thing the Lord has done. Start with your own.", "11:12")
      ],
      file: { name: "great-things-manuscript.docx", pages: 5 }, video: "https://video.example.org/calder-hill/run-through-2026-11-18", posted: "https://video.example.org/calder-hill/sunday-2026-11-22", memo: "11:40",
      points: ["When the Lord turned again the captivity, they remembered what God had done, and they laughed out loud.", "Gratitude remembers out loud, and it makes the story personal.", "Tears sown are not wasted. The farmer who weeps as he plants is still planting.", "The same person who went out weeping comes back carrying the harvest."],
      questions: ["What has the Lord done that you have stopped remembering?", "Say one great thing out loud.", "Where are you sowing in tears right now?"],
      week: "At your Thanksgiving table, ask everyone to name one great thing the Lord has done.",
      src: { title: 0, verses: [5, 9], points: [2, 5, 9, 12], questions: [13, 13, 13], week: 14 },
      leftOut: { line: 11, text: "the illustration about your father's garden", shaped: "My father's garden, the spring after the flood." } },
    devotionals: [
      { date: "2026-11-16", title: "Heard in distress", verses: [v("Psalm 120:1", "In my distress I cried unto the LORD, and he heard me.")],
        paras: ["The songs of the road, the Songs of Degrees, begin with a cry for help. In my distress I cried unto the LORD. The pilgrims did not set out on their journey feeling strong and ready.",
          "That is a comfort. The first step toward the house of the Lord was not confidence. It was honesty about trouble, and a God who listened. And he heard me, the psalm says, in plain words. God does not wait for us to be strong before he listens.",
          "If you begin this week in distress, you are in good company. You do not need to feel ready to start walking. Tell the Lord what troubles you this morning, in a sentence or two, and trust that he still hears."],
        prayer: "Lord, hear me today, as you heard them. Amen." },
      { date: "2026-11-17", title: "Your keeper, your shade", verses: [v("Psalm 121:5", "The LORD is thy keeper: the LORD is thy shade upon thy right hand.")],
        paras: ["Shade was no small thing on a hot road to Jerusalem. Travelers walked for days in the sun. The psalm says the Lord himself is that shade, close at hand, upon thy right hand. A little shade could mean the difference between going on and giving up.",
          "The right hand was the place of a helper standing beside you. So the picture is not a distant God watching from far away. It is a keeper walking along with you, near enough to cast a shadow over you.",
          "Look for one place today where you feel the heat, a hard meeting, a long drive or a worry that will not quiet. Before you go into it, remember who stands at your right hand there, and ask him to keep you."],
        prayer: "Lord, be my shade today and keep me close. Amen." },
      { date: "2026-11-18", title: "He will not slumber", verses: [v("Psalm 121:3", "He will not suffer thy foot to be moved: he that keepeth thee will not slumber.")],
        paras: ["Travelers on the road often slept in the open, and someone had to keep watch through the night. The psalm promises a keeper who never dozes off: he that keepeth thee will not slumber. That was a real worry for them.",
          "It also says he will not suffer thy foot to be moved. On rocky paths a slip could mean real harm. The Lord watches over the small steps as well as the long night. He is never too busy or too tired to keep you.",
          "You were never meant to stay awake holding everything together. When you lie down tonight, name the people you love and hand each one to the Lord by name. Then rest. He is awake, and you can sleep. Sleep can be an act of trust."],
        prayer: "Keeper of my life, watch over me and those I love tonight. Amen." },
      { date: "2026-11-19", title: "Going out and coming in", verses: [v("Psalm 121:8", "The LORD shall preserve thy going out and thy coming in from this time forth, and even for evermore.")],
        paras: ["Every leaving and every returning is held by the Lord. The front door in the morning, the long drive to work, the walk home in the dark, the hospital doors and the airport gate. Each one is a small crossing, and he is in every one.",
          "The psalm ends by stretching that promise as far as it will go: from this time forth, and even for evermore. Not only today's trip. Every going out and coming in for the rest of your life. There is no trip too small for his care.",
          "As you go out today, pause for a moment at your own front door and say this verse once. When you come home tonight, say it again, and thank him for keeping you along the way."],
        prayer: "Lord, keep my going out and my coming in, today and always. Amen." },
      { date: "2026-11-20", title: "Eyes on the Lord", verses: [v("Psalm 123:1", "Unto thee lift I up mine eyes, O thou that dwellest in the heavens.")],
        paras: ["In Psalm 121 the pilgrims lifted up their eyes to the hills. Two songs later they lift their eyes higher: unto thee lift I up mine eyes, O thou that dwellest in the heavens.",
          "The hills were large and close, and help did not come from them. Psalm 123 goes on to say that our eyes wait upon the Lord, as a servant watches the hand of the master. Waiting on him is not wasted time.",
          "When the hills in your life feel large today, a bill, a test result or a hard conversation, look one step higher. Lift your eyes to the Lord on purpose, even for a minute, and wait on him there. The hills will still be there, but they will look different."],
        prayer: "Lord, I lift my eyes to you. Amen." },
      { date: "2026-11-21", title: "Our help is in his name", verses: [v("Psalm 124:8", "Our help is in the name of the LORD, who made heaven and earth.")],
        paras: ["This psalm looks back on a danger that nearly swept the people away. If it had not been the LORD who was on our side, it says, the waters would have gone over their soul. The people knew how close it had been.",
          "Then it ends in one plain sentence of trust: our help is in the name of the LORD, who made heaven and earth. It is the same line we sang in Psalm 121, now said by people who have lived through the flood.",
          "Remember one time the Lord helped you, a time you did not think you would get through. Say it out loud today, to God or to someone you love. Remembering how he helped before makes room for trust now. Then thank him again."],
        prayer: "Our help is in your name, Lord. Thank you for every time you helped me. Amen." },
      { date: "2026-11-22", title: "Like mount Zion", verses: [v("Psalm 125:1", "They that trust in the LORD shall be as mount Zion, which cannot be removed, but abideth for ever.")],
        paras: ["A mountain does not worry about the weather. Storms come over it, snow and wind and all of it, and it is still there in the morning. Those who trust in the Lord are steady like that. Mount Zion was where the temple stood, the place the pilgrims were walking toward on these songs of the road.",
          "The next verse says as the mountains are round about Jerusalem, so the Lord is round about his people. So we are not just steady. We are surrounded.",
          "When you gather this morning, let your trust be steady, even if your week was not. Bring the week as it was. You do not have to pretend it was calm to come and worship. Sing what you can, pray what you can, and let the Lord hold the rest."],
        prayer: "Lord, make my trust in you steady as a mountain. Amen.",
        way: "memo", memo: "2:16", file: { name: "like-mount-zion.docx", pages: 1 }, video: "https://video.example.org/calder-hill/devotional-2026-11-22",
        raw: [line("Sunday devotional. Psalm 125, verse 1. Like mount Zion.", "0:04"),
          line("A mountain doesn't worry about the weather. Storms come over it, snow, wind, all of it, and it's still there in the morning. Those who trust in the Lord are steady like that. And mount Zion was where the temple stood, the place the pilgrims were walking toward on these songs of the road.", "0:12"),
          line("The next verse says as the mountains are round about Jerusalem, so the Lord is round about his people. So we're not just steady, we're surrounded.", "0:58"),
          line("When you gather this morning, let your trust be steady even if your week was not. Bring the week as it was. You don't have to pretend it was calm to come and worship. Sing what you can, pray what you can, and let the Lord hold the rest.", "1:24"),
          line("Prayer: Lord, make my trust in you steady as a mountain. Amen.", "2:02")],
        src: { title: 0, verses: [0], paras: [1, 2, 3], prayer: 4 } }
    ]
  };

  /* ------------------------------------------------------------------ Goldenrod Commons Church (Warm Community) */
  C["warm-community"] = {
    name: "Goldenrod Commons Church", short: "Goldenrod Commons", watch: "#watch", prefix: "gc", pastors: ["Marcus", "Ellie"],
    services: ["9:00 AM", "10:45 AM"],
    sermons: [
      { id: "gc-2026-11-15", series: "Love Thy Neighbor", part: "Part 2", title: "Casseroles and courage", speaker: "lead", date: "2026-11-15", length: "38 min", ref: "Luke 10:30-37",
        verses: [v("Luke 10:36-37", "Which now of these three, thinkest thou, was neighbour unto him that fell among the thieves? And he said, He that shewed mercy on him. Then said Jesus unto him, Go, and do thou likewise.")],
        points: ["The Samaritan saw, came near and stayed long enough to help.", "Love often looks like a meal, a ride or a knock on the door.", "Courage is choosing to cross the road anyway."],
        more: ["The others in the story were not cruel. They were busy. Busy is the road most of us walk.", "Mercy is rarely convenient. It is almost always a casserole away."],
        questions: ["What keeps you from crossing the road for someone?", "Who has been a Samaritan to you?", "What would a small act of mercy look like on your block this week?"],
        week: "Name one neighbor and do one small, kind thing for them." },
      { id: "gc-2026-11-08", series: "Love Thy Neighbor", part: "Part 1", title: "Who is my neighbor?", speaker: "care", date: "2026-11-08", length: "35 min", ref: "Luke 10:25-29",
        verses: [v("Luke 10:29", "But he, willing to justify himself, said unto Jesus, And who is my neighbour?")],
        points: ["The lawyer knew the answer: love God and love your neighbor.", "Then he looked for the edge of the circle.", "Jesus answered with a story instead of a boundary."],
        more: [],
        questions: ["Who is easy to call a neighbor, and who is harder?", "Why do we look for the edge of the circle?", "What story taught you who your neighbor is?"],
        week: "Learn the name of one neighbor you have not met." }
    ],
    draft: { id: "gc-2026-11-22", series: "Love Thy Neighbor", part: "Part 3", title: "A longer table", speaker: "care", date: "2026-11-22", length: "", ref: "Luke 14:13-14",
      /* Pastor Ellie's run-through video from Wednesday's rehearsal: its captions, never shown to members. */
      way: "video", came: "Wednesday",
      verses: [v("Luke 14:13-14", "But when thou makest a feast, call the poor, the maimed, the lame, the blind: And thou shalt be blessed; for they cannot recompense thee: for thou shalt be recompensed at the resurrection of the just.")],
      passages: [{ label: "Luke 14:13 only", note: "The one verse the message quotes", verses: [v("Luke 14:13", "But when thou makest a feast, call the poor, the maimed, the lame, the blind:")] }],
      raw: [
        line("A longer table. Luke 14:13-14. Love Thy Neighbor, part 3"),
        line("Jesus at a dinner: he noticed who was invited and who was not"),
        line("Hospitality is not asking who can pay me back. It's asking who is missing."),
        line("v13: when you make a feast, call the poor, the maimed, the lame, the blind"),
        line("every table can get a little longer. ours too."),
        line("story: the potluck where we ran out of chairs"),
        line("groups: who is missing from your table? what makes it hard to invite? what would one more chair look like?"),
        line("this week: invite someone who cannot invite you back")
      ],
      spoken: [
        line("A longer table. Luke 14, verses 13 and 14. Part three of Love Thy Neighbor.", "0:45"),
        line("Jesus was at a dinner, and he noticed who was invited and who was not.", "4:10"),
        line("Hospitality is not asking who can pay me back. It's asking who is missing.", "9:32"),
        line("When you make a feast, call the poor, the maimed, the lame, the blind.", "12:05"),
        line("Every table can get a little longer. Ours too.", "18:40"),
        line("Let me tell you about the potluck where we ran out of chairs.", "21:15"),
        line("Talk about it in your group: who is missing from your table? What makes it hard to invite? What would one more chair look like?", "27:50"),
        line("This week, invite someone who cannot invite you back.", "30:02")
      ],
      file: { name: "a-longer-table.docx", pages: 1 }, video: "https://video.example.org/goldenrod/run-through-2026-11-18", posted: "https://video.example.org/goldenrod/sunday-2026-11-22", memo: "3:55",
      points: ["Jesus noticed who was invited and who was not.", "Hospitality is not asking who can pay me back. It is asking who is missing.", "Every table can get a little longer. Ours too."],
      questions: ["Who is missing from your table?", "What makes it hard to invite?", "What would one more chair look like?"],
      week: "Invite someone who cannot invite you back.",
      src: { title: 0, verses: [[0, 3]], points: [1, 2, 4], questions: [6, 6, 6], week: 7 },
      leftOut: { line: 5, text: "the story about the potluck where you ran out of chairs", shaped: "The potluck where we ran out of chairs." } },
    devotionals: [
      { date: "2026-11-16", title: "As yourself", verses: [v("Leviticus 19:18", "Thou shalt not avenge, nor bear any grudge against the children of thy people, but thou shalt love thy neighbour as thyself: I am the LORD.")],
        paras: ["Love thy neighbour as thyself is older than the parable of the Samaritan. It shows up first in Leviticus, right beside two other commands: do not take revenge, and do not hold a grudge. I am the LORD, it ends.",
          "That placement is worth noticing. Loving a neighbor is not only about kind feelings. It starts with what we refuse to keep holding against the people around us. A grudge takes up the room where love would live. Letting go comes before loving well.",
          "Is there a grudge you could set down this week, even a small one? Name the person in prayer today. You do not have to feel warm about it yet. Ask the Lord to help you let go of it, one day at a time."],
        prayer: "Lord, help me let go of what I am holding against others. Amen." },
      { date: "2026-11-17", title: "Love does no harm", verses: [v("Romans 13:10", "Love worketh no ill to his neighbour: therefore love is the fulfilling of the law.")],
        paras: ["Paul sums up a long list of commands in one plain sentence: love worketh no ill to his neighbour. Whatever else love does, it does not set out to harm the person next to you.",
          "That sounds simple, but it covers a lot of ground: the tone we use at home, the way we talk about people who are not in the room, the shortcuts we take that cost someone else. Love is careful with people.",
          "Today, think about the people you will pass, at work, at the store or across the fence. In each moment where you could choose a sharp word or a kind one, choose the kind word, and count it as keeping the law of love."],
        prayer: "Lord, let my words and actions do good today. Amen." },
      { date: "2026-11-18", title: "Carry it together", verses: [v("Galatians 6:2", "Bear ye one another's burdens, and so fulfil the law of Christ.")],
        paras: ["Nobody was meant to carry everything alone. Paul says bear ye one another's burdens, and so fulfil the law of Christ. Carrying a load for someone is not an extra. It is what following Jesus looks like. It is part of the life of the church.",
          "Most burdens are not visible from across the room. A smile at church can sit on top of a sick parent, an overdue bill or a lonely week. Usually we only find out when someone asks, and then listens.",
          "Ask someone today what they are carrying, and then really listen. You may not be able to fix it. You can help carry it, with a meal, a ride, a prayer or simply by staying in the conversation a little longer."],
        prayer: "Jesus, show me whose load I can help carry today. Amen." },
      { date: "2026-11-19", title: "Given to hospitality", verses: [v("Romans 12:13", "Distributing to the necessity of saints; given to hospitality.")],
        paras: ["Paul puts hospitality right beside sharing with people in need: distributing to the necessity of saints; given to hospitality. In the early church, an open door was part of everyday faith. Sharing a table was one of the ways the church cared for people.",
          "Hospitality in the Bible is not the same as entertaining. It does not need a spotless house or a fancy meal. It means making room, at the table and in your week, for someone who needs a place.",
          "A pot of coffee and a free chair are enough to begin. Think of one person who would be glad of an invitation this week, a new neighbor, a widow from church or a coworker far from home, and ask them over. Keep it simple and warm."],
        prayer: "Lord, open my door and my heart to someone this week. Amen." },
      { date: "2026-11-20", title: "In deed and in truth", verses: [v("1 John 3:18", "My little children, let us not love in word, neither in tongue; but in deed and in truth.")],
        paras: ["John writes to his little children with a gentle push: let us not love in word, neither in tongue; but in deed and in truth. Love that only talks about itself is not finished yet.",
          "Most of us mean well. We say we will call, visit, help or write, and then the week fills up. John is not scolding. He is reminding us that love becomes real when it moves from our mouths to our hands. Small deeds count.",
          "Pick one small thing you have meant to do for someone and kept putting off: a card, a call, a meal left at the door. Do it today, before evening, and let that be your prayer in deed. Love that acts does not need to be big."],
        prayer: "Lord, turn my good intentions into kind actions today. Amen." },
      { date: "2026-11-21", title: "Strangers at the door", verses: [v("Hebrews 13:2", "Be not forgetful to entertain strangers: for thereby some have entertained angels unawares.")],
        paras: ["Hebrews tells us not to be forgetful to entertain strangers, for thereby some have entertained angels unawares. Welcoming a stranger can be a holy moment, even when it looks completely ordinary.",
          "We tend to save our welcome for people we already know. The Bible keeps pointing us past that circle, to the person at the edge of the room who does not have anyone to talk to yet. Jesus spent a lot of his time with people at the edge.",
          "Notice someone new today, at the store, at work, on your street or tomorrow at church. Learn their name and greet them warmly. You may never know what that small welcome meant to them, and that is all right. Smile, ask a question and listen."],
        prayer: "Lord, help me see strangers the way you see them. Amen." },
      { date: "2026-11-22", title: "When it is in your hand", verses: [v("Proverbs 3:27", "Withhold not good from them to whom it is due, when it is in the power of thine hand to do it.")],
        paras: ["Proverbs keeps it simple: withhold not good from them to whom it is due. If you can do good for somebody today, do not put it off. The next verse even says do not tell your neighbor to come back tomorrow when you have it with you now.",
          "Most of the time the good we can do is not big. It is a ride, a meal, a phone call or a little time. It is already in your hand, and we wait for some bigger moment that never comes.",
          "When you gather this morning, ask what good is already in your hand. Look around the room for one person, and do that good for them this week, while it is still in the power of your hand to do it."],
        prayer: "Lord, show me the good I can do, and give me a willing heart. Amen.",
        way: "memo", memo: "2:05", file: { name: "in-your-hand.docx", pages: 1 }, video: "https://video.example.org/goldenrod/devotional-2026-11-22",
        raw: [line("Okay, Sunday devotional, Proverbs 3:27. When it is in your hand.", "0:05"),
          line("Proverbs keeps it simple. Withhold not good from them to whom it is due. If you can do good for somebody today, don't put it off. The next verse even says don't tell your neighbor to come back tomorrow when you have it with you now.", "0:14"),
          line("Most of the time the good we can do is not big. It's a ride, a meal, a phone call, a little time. It's already in your hand, and we wait for some bigger moment that never comes.", "0:48"),
          line("When you gather this morning, ask what good is already in your hand. Look around the room for one person, and do that good for them this week, while it's still in the power of your hand to do it.", "1:19"),
          line("Prayer: Lord, show me the good I can do, and give me a willing heart. Amen.", "1:52")],
        src: { title: 0, verses: [0], paras: [1, 2, 3], prayer: 4 } }
    ]
  };

  /* ------------------------------------------------------------------ times */
  function toMin(t) { var m = String(t).match(/(\d+):(\d+)\s*(AM|PM)/i); if (!m) return 0; var h = +m[1] % 12 + (/PM/i.test(m[3]) ? 12 : 0); return h * 60 + +m[2]; }
  function toText(n) { var h = Math.floor(n / 60), m = n % 60, ap = h >= 12 ? "PM" : "AM", hh = h % 12 || 12; return hh + ":" + (m < 10 ? "0" : "") + m + " " + ap; }
  function shortTime(t) { return String(t).replace(/:00(?= [AP]M)/, ""); }

  /* ------------------------------------------------------------------ ids, status and the helpers */
  var TODAY = "2026-11-19";
  var HEARD = { "bright-modern": "2:12", "bold-dark": "2:20", "classic-timeless": "1:58", "warm-community": "2:04" };
  Object.keys(C).forEach(function (slug) {
    var ch = C[slug];
    ch.slug = slug;
    /* Sunday notes go out 30 minutes before the first service, so members can open them as they sit down. */
    ch.sundayAt = toText(toMin(ch.services[0]) - 30);
    ch.afterLast = toText(toMin(ch.services[ch.services.length - 1]) + 75);
    ch.sermons.forEach(function (s) { s.kind = "sermon"; s.status = "published"; s.at = ch.sundayAt; });
    ch.draft.kind = "sermon"; ch.draft.status = "draft"; ch.draft.at = ch.sundayAt; ch.draft.more = [];
    /* The draft's words as they were written (an outline or a manuscript) and as they were spoken (a voice
       memo or a run-through video's captions). Line i of one is line i of the other, so a source fits both. */
    if (!ch.draft.spoken) ch.draft.spoken = ch.draft.raw;
    ch.devotionals.forEach(function (d) {
      d.kind = "devotional"; d.by = "care"; d.at = "6:00 AM";
      if (d.raw) { d.spoken = d.spoken || d.raw; d.came = d.came || "this morning"; }
      /* Today's reading came in as the care pastor's voice memo, so members can also listen to it. */
      if (d.date === TODAY && HEARD[slug]) d.heard = HEARD[slug];
      d.id = ch.prefix + "-d-" + d.date;
      d.status = d.raw ? "draft" : d.date <= TODAY ? "published" : "scheduled";
    });
  });

  function slugOf(note) { for (var k in C) if (note && note.id && note.id.indexOf(C[k].prefix + "-") === 0) return k; return ""; }
  var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  function parts(iso) { var p = String(iso).split("-"); return new Date(+p[0], +p[1] - 1, +p[2], 12); }
  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function words(t) { return String(t || "").split(/\s+/).filter(Boolean).length; }
  /* "John 20:24-29" as { book, ch, from, to }; a whole chapter ("Psalm 121") runs from 1 to 999. */
  function parseRef(r) {
    var m = String(r).match(/^(.*\D)\s+(\d+)(?::(\d+)(?:-(\d+))?)?$/); if (!m) return null;
    return { book: m[1].trim(), ch: +m[2], from: m[3] ? +m[3] : 1, to: m[4] ? +m[4] : m[3] ? +m[3] : 999 };
  }
  function inside(a, b) { var x = parseRef(a), y = parseRef(b); return !!(x && y && x.book === y.book && x.ch === y.ch && x.from >= y.from && x.to <= y.to); }
  /* Whether the printed verses are the whole passage named, or only its key verse or verses. */
  function covers(note) {
    var p = parseRef(note.ref); if (!p || p.to === 999) return false;
    var got = {}; note.verses.forEach(function (v) { var x = parseRef(v.ref); if (x && x.book === p.book && x.ch === p.ch) for (var i = x.from; i <= x.to; i++) got[i] = 1; });
    for (var i = p.from; i <= p.to; i++) if (!got[i]) return false;
    return true;
  }

  window.GM_NOTES = {
    translation: KJV,
    translationNote: "Public domain in the United States",
    /* Other translations a church can choose; each follows the church's own license. */
    translations: ["King James Version", "New International Version", "English Standard Version", "New King James Version", "Christian Standard Bible", "New Living Translation"],
    today: TODAY,
    devotionalAt: "6:00 AM",
    churches: C,
    church: function (slug) { return C[slug] || null; },
    byName: function (name) { for (var k in C) if (C[k].name === name || C[k].short === name) return C[k]; return null; },
    /* The latest published Sunday notes. */
    latest: function (slug) { var c = C[slug]; return c ? c.sermons[0] : null; },
    /* Today's devotional (Thursday, November 19 on the demo clock). */
    todays: function (slug) { var c = C[slug]; if (!c) return null; return c.devotionals.filter(function (d) { return d.date === TODAY; })[0] || null; },
    /* Everything for one church, newest first: the draft, the sermons and the devotionals. */
    all: function (slug) { var c = C[slug]; if (!c) return []; return [c.draft].concat(c.sermons, c.devotionals).sort(function (a, b) { return a.date < b.date ? 1 : a.date > b.date ? -1 : a.kind === "sermon" ? -1 : 1; }); },
    find: function (slug, id) { return this.all(slug).filter(function (n) { return n.id === id; })[0] || null; },
    /* "Pastor Theo": pastors is the church's [lead, care] first names. */
    speaker: function (note, pastors) { var p = pastors || (note && C[slugOf(note)] || {}).pastors || []; return "Pastor " + (note.speaker === "care" || note.by === "care" ? p[1] : p[0]); },
    /* When a note goes out by default: Sunday notes 30 minutes before the first service, devotionals at 6 AM. */
    defaultAt: function (note) { var c = C[slugOf(note)] || {}; return note.kind === "devotional" ? "6:00 AM" : c.sundayAt || "8:30 AM"; },
    shortTime: shortTime,
    dateLong: function (iso) { var d = parts(iso); return DAYS[d.getDay()] + ", " + MONTHS[d.getMonth()] + " " + d.getDate(); },
    dateShort: function (iso) { var d = parts(iso); return MONTHS[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear(); },
    dayShort: function (iso) { return DAYS[parts(iso).getDay()].slice(0, 3); },
    dayNum: function (iso) { return parts(iso).getDate(); },
    weekday: function (iso) { return DAYS[parts(iso).getDay()]; },
    /* A scripture reference as HTML that never breaks across lines ("John 1:45-46"). */
    refHTML: function (ref) { return '<span class="gm-ref" style="white-space:nowrap">' + esc(ref) + "</span>"; },
    /* Any text, escaped, with each scripture reference in it kept on one line ("John 1:45-46", "v1-2"). */
    refsHTML: function (text) { return esc(text).replace(/\b(?:[1-3] )?[A-Z][a-z]+ \d+(?::\d+(?:-\d+)?)?\b|\bv\d+(?:-\d+)?\b/g, function (m) { return '<span class="gm-ref" style="white-space:nowrap">' + m + "</span>"; }); },
    words: words,
    parseRef: parseRef,
    /* Every printed verse sits inside the passage the note names. */
    inside: inside,
    /* "" when the printed verses are the whole passage, else "Key verse" or "Key verses". */
    keyLabel: function (note) { return covers(note) ? "" : note.verses.length > 1 ? "Key verses" : "Key verse"; },
    /* A way in that is spoken (a voice memo or a video's captions) reads the spoken words; the rest the written. */
    spokenWay: function (way) { return way === "memo" || way === "video"; },
    rawFor: function (note, way) { return (way === "memo" || way === "video" ? note.spoken : note.raw) || note.raw || []; },
    /* About how long a devotional takes to read: the verse, the reading and the prayer, at an unhurried 130 words a minute. */
    readMins: function (d) { var n = words(d.verses.map(function (x) { return x.text; }).join(" ")) + words(d.paras.join(" ")) + words(d.prayer); return Math.max(1, Math.ceil(n / 130)); },
    /* A source is one raw line (a number) or several (an array). */
    srcList: function (s) { return s == null ? [] : Array.isArray(s) ? s : [s]; },
    /* What the pastor decided in the editor, for this browser tab only (church-note.html writes it):
       { state: "scheduled" | "published" | "", when: "Sunday, November 22 at 8:30 AM" }. */
    decision: function (id) {
      var v = ""; try { v = sessionStorage.getItem("gm.notes." + id) || ""; } catch (e) {}
      var i = v.indexOf("@"); return { state: i < 0 ? v : v.slice(0, i), when: i < 0 ? "" : v.slice(i + 1) };
    },
    /* Whether the pastor added the message's video link after Sunday (a sample link, this tab only). */
    videoAdded: function (id) { try { return sessionStorage.getItem("gm.notes.video." + id) === "1"; } catch (e) { return false; } },
    /* A draft as the pastor shaped and checked it in the editor (this tab only), else as it came in. */
    shaped: function (note) {
      var m = null; try { m = JSON.parse(sessionStorage.getItem("gm.notes.model." + note.id) || "null"); } catch (e) { m = null; }
      if (!m) return note;
      var o = {}, k; for (k in note) o[k] = note[k];
      var t = function (x) { return x && typeof x === "object" ? x.text : x; };
      ["title", "week", "prayer"].forEach(function (f) { if (m[f]) o[f] = t(m[f]); });
      ["points", "questions", "more", "paras"].forEach(function (f) { if (Array.isArray(m[f])) o[f] = m[f].map(t); });
      /* The passage the pastor chose to print (Change the Passage), always word for word. */
      if (Array.isArray(m.verses) && m.verses.length) o.verses = m.verses.map(function (v) { return { ref: v.ref, text: v.text }; });
      return o;
    }
  };
})();
