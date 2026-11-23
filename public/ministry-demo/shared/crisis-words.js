/*
  The crisis words, one list for every Hope in Genesis Ministry: the church websites and the member
  app (shared/hope-demo.js) and the workspace dock (platform/shared/app.js) all read window.HOPE_WORDS
  from this file, so a change is made here once and reaches every Hope the same day.

  Load it before either of them: <script src="../shared/crisis-words.js"></script> on platform pages,
  <script src="../../shared/crisis-words.js" defer></script> before hope-demo.js on the church sites
  (tools/wire-hope.mjs writes it). Both scripts stop with an error if it is missing, so a page can never
  quietly lose its crisis check.

  The pattern and the reply are the live church site's. A crisis is heard however it is written:
  without a contraction ("I do not want to live"), sideways ("nobody would miss me", "I want to
  disappear"), about someone else ("my sister wants to kill herself"), or by a staff member writing
  about someone in the church ("a member told me she wants to die", "my daughter is cutting").
  Violence needs a person doing it ("my husband hits me", "my sister's husband hits her", "a youth
  leader touched me inappropriately"), so "that sermon really hit me" is a sermon. Church roles count
  as people: abuse by a pastor or a leader is a crisis, never the pastors' bio. Sexual abuse ("I was
  raped"), a plan ("jump off a bridge", "a gun... on myself") and a wish not to wake up count too.
  Curly apostrophes ("don’t", an iPhone's default) read as straight ones before every check.
  Everyday words that only sound like danger ("dying to try your coffee", Christ who "died for us")
  are set aside first. Never reword the reply.
*/
(function () {
  "use strict";
  var PERSON = "(?:student|teen\\w*|mom|mother|mum|dad|father|wife|husband|son|daughter|kids?|child|children|sister|brother|baby|partner|girlfriend|boyfriend|fianc\\w*|friend|family|grandma|grandmother|grandpa|grandfather|roommate|neighbou?r|aunt|uncle|cousin|niece|nephew)";
  var KIN = PERSON.slice(3, -1);
  /* People in a church who could do harm: "a pastor", "the youth leader", "one of the volunteers". */
  var ROLE = "(?:(?:youth|worship|small group|life group|children'?s|kids'?|student|associate|senior|lead|assistant|music|choir|camp) )?(?:pastors?|leaders?|teachers?|coach(?:es)?|volunteers?|elders?|deacons?|ministers?|priests?|counsel(?:l)?ors?|mentors?|staff(?: members?)?|chaperones?|directors?)";
  /* Who can do harm: a person ("my husband"), a chain ("my sister's husband", "her boyfriend"), or a
     church role ("a pastor", "the worship leader"). */
  var WHO = "(?:he|she|they|someone|somebody|my " + PERSON + "|our " + PERSON + "|my (?:ex|step\\w+|in-laws?)" +
    "|(?:my|our) " + PERSON + "'?s (?:" + KIN + "|ex|step\\w+)|(?:her|his|their) (?:" + KIN + "|ex|step\\w+)" +
    "|(?:a|an|the|my|our|their|her|his|that|this|one of (?:the|our|my)) " + ROLE + ")";
  var AUX = "(?:'s|'re| is| are| was| were| keeps?| kept| has been| had been| have been| has| had| will| would| always| still| often| sometimes| just)*";
  var HARMS = "(?:hit|hits|hitting|hurt|hurts|hurting|abuses|abused|abusing|chok(?:es|ed|ing)|slap(?:s|ped|ping)?|kick(?:s|ed|ing)?|punch(?:es|ed|ing)?|shov(?:es|ed|ing)|threaten(?:s|ed|ing)?|rap(?:es|ed|ing)|molest(?:s|ed|ing)?|assault(?:s|ed|ing)|attack(?:s|ed|ing)|grop(?:es|ed|ing))";
  var BEATS = "beat(?:s|ing)?";
  var BEAT_NOT = "(?! (?:to|at|up)\\b| in (?:a|the) (?:race|game|match)\\b)";
  /* "My youth pastor touched me" is harm; "she touched me deeply" and "that song touched me" are not. */
  var TOUCHES = "(?:touch(?:es|ed|ing)?|grab(?:s|bed|bing)|fondl(?:es|ed|ing))";
  var TOUCH_NOT = "(?! (?:deeply|so much|so deeply|with|by|in my heart|my heart|me deeply)\\b)";
  /* The person in crisis is the one writing. */
  var CRISIS = new RegExp("\\b(suicid\\w*|kill(?:ing)? (?:myself|my self)|end(?:ing)? (?:my|my own) life|end(?:ing)? it all|take my (?:own )?life|want(?:ed)? to die|wanna die|wish (?:i was|i were|i'?d been) dead|wish i (?:could )?(?:just )?die|(?:i'?d|i would) rather (?:be )?dead|feel(?:ing)? like (?:dying|ending it|killing myself)|don'?t want to (?:live|be alive|be here)|(?:do|does|did) not want to (?:live|be alive|be here)|doesn'?t want to (?:live|be alive|be here)|hurt(?:ing)? myself|harm(?:ing)? myself|self[- ]?harm\\w*|cut(?:s|ting)? myself|overdos\\w*|took too many pills|swallowed (?:a bottle of |all (?:my|the|of my) )?pills|can(?:'?t|not| not) go on (?:anymore|any more|like this|living)|can(?:'?t|not| not) go on(?=\\s*[.!]*$)|can(?:'?t|not| not) (?:do this|take (?:it|this)|keep going) any ?more|no (?:reason|point) (?:in |to )?(?:live|living|go on|going on|keep going)|(?:what'?s|what is|whats) the point (?:of|in) (?:living|life|going on|being alive|being here|trying)|(?:what'?s|what is|whats) the point (?:anymore|any more)|(?:giving|give|gave) up on (?:everything|life|living)|nothing (?:left )?to live for|not worth living|better off (?:dead|without me)|jump(?:ing|ed)? off (?:a|the|of) (?:bridge|building|roof|cliff|overpass|balcony)|(?:gun|pistol|rifle|pills|rope|knife|razor|blade)\\b.{0,60}\\b(?:myself|my self|my life|end it|end things)|(?:sleep|asleep) and (?:never|not) (?:wake|waking) up|(?:don'?t|do not|can'?t|cannot|can not) see the point (?:anymore|any more|in living|of living|in life|of life|in anything|of anything|in going on)|rap(?:e|ed|ing)\\b|sexual(?:ly)? (?:abus\\w*|assault\\w*)|molest\\w*|touch\\w* me\\b.{0,30}\\b(?:don'?t|do not|didn'?t|did not) want|touch\\w* me (?:inappropriately|sexually|in a (?:bad|sexual|wrong|private) way|where)|(?:was|were|am|is|are|got|get|gets|been|being) (?:sexually |physically )?(?:abused|assaulted|molested|attacked)\\b|abus(?:e|ed) by\\b|threaten(?:s|ed|ing)? to (?:hurt|kill|harm|beat|hit|shoot|stab) (?:me|us)\\b|(?:afraid|scared) to go (?:back )?home|(?:nobody|no one|no-one)(?: would| will|'d)?(?: even)? (?:miss me|(?:miss|notice|care)(?: me)?(?: if| when) (?:i'?m|i am|i was|i were|i) (?:gone|dead|not here|died|disappeared))|(?:want|wish)(?:ed)?(?: i could)?(?: just)? (?:to )?disappear|(?:thinking (?:of|about)|going to|want to|planning (?:to|on)) end(?:ing)? it(?: all)?(?!\\s+(?:with|for|between|on|at|early|here|there|now)\\b)|not safe at home|unsafe at home|" +
    WHO + AUX + " " + HARMS + " (?:me|us)\\b(?! up\\b)|" + WHO + AUX + " " + BEATS + " (?:me|us)\\b" + BEAT_NOT + "|" + WHO + AUX + " " + TOUCHES + " (?:me|us)\\b" + TOUCH_NOT + "|(?:keeps?|kept) (?:hitting|beating|hurting) (?:me|us)|(?:being|been|getting|got) (?:abused|beaten up)|being (?:hit|beaten)|abus(?:es|ed|ing) me|domestic (?:violence|abuse)|(?:afraid|scared) of my (?:husband|wife|partner|boyfriend|girlfriend|dad|father|mom|mother|parents?|step\\w+)|(?:i am|i'?m|we are|we'?re) (?:in danger|not safe))\\b", "i");
  /* Someone else is in danger ("my sister wants to kill herself"). */
  var OTHERS = new RegExp("\\b(wants? to die|wanting to die|(?:wants?|wanted|trying) to (?:end|take) (?:her|his|their) (?:own )?life|end(?:ing)? (?:her|his|their) (?:own )?life|kill(?:ing)? (?:herself|himself|themselves|themself)|hurt(?:ing)? (?:herself|himself|themselves|themself)|harm(?:ing)? (?:herself|himself|themselves|themself)|cut(?:s|ting)? (?:herself|himself|themselves)|(?:she|he|they) (?:is|are|was|were) (?:in danger|not safe)|(?:she'?s|he'?s|they'?re) (?:in danger|not safe)|(?:someone|somebody|my " + PERSON + ") (?:is|was|'s) (?:in danger|not safe|unsafe)|(?:talk(?:s|ed|ing)?|writ(?:es|ing)|said|says) about (?:suicide|dying|ending (?:it|her life|his life|their life))|threaten(?:s|ed|ing)? (?:suicide|to kill)|not safe at home|being abused|(?:do|does|did) not want to (?:live|be alive|be here)|doesn'?t want to (?:live|be alive|be here)|" +
    WHO + AUX + " " + HARMS + " (?:her|him|them|my " + PERSON + ")\\b|" + WHO + AUX + " " + BEATS + " (?:her|him|them|my " + PERSON + ")\\b" + BEAT_NOT + "|" + WHO + AUX + " " + TOUCHES + " (?:her|him|them|my " + PERSON + ")\\b" + TOUCH_NOT + "|took too many pills|can(?:'?t|not| not) go on (?:anymore|any more|like this|living)|(?:my " + PERSON + "|she|he|they) (?:wants?|is going|is planning|plans|tried|tries) to (?:die|kill|hurt|end)|(?:my " + PERSON + "|she|he|they) (?:overdosed|took pills)|(?:nobody|no one|no-one)(?: would| will|'d)?(?: even)? miss (?:him|her|them)\\b|wants? to disappear|wanted to disappear|touch(?:ed|es|ing) (?:my|our|her|his|their) " + PERSON + " (?:inappropriately|sexually|in a (?:bad|sexual|wrong|private) way)|(?:will|going to|gonna|might|could) (?:hurt|harm|kill) (?:the|my|our|her|his|their) (?:kids|children|baby|babies|" + KIN + ")\\b|(?:molest\\w*|raped|sexually (?:abused|assaulted)) (?:my|our|her|him|them)\\b)", "i");
  /* Everyday words that only sound like danger. They are set aside before every check, so a guest
     who is moved, or joking, never gets the crisis reply. */
  var CALM = /\b(?:touch(?:ed|es|ing)? (?:my|our) (?:heart|hearts|soul|souls|spirit)|touch(?:ed|es|ing)? (?:me|us) (?:deeply|so deeply|so much)|(?:dying|die|died|dies) (?:to (?:self|ourselves|sin|our old)|for (?:us|me|you|him|her|them|our sins|my sins|the world|sinners))|(?:dying|die) to (?:try|see|know|meet|hear|visit|come|go|get|find|have|join|check|taste|sing|worship)|to die for|die[- ]?hard|di(?:e|ed|ing) (?:of |from )?laugh\w*|dying of laughter|(?:could|would|'d) (?:die|kill) for (?:a|an|some|one)\b|kill(?:ing|ed)? it|kill(?:ing)? time|killers?|(?:this|that|it|the \w+|my (?:back|feet|knees?|head|neck|legs?|job|work|boss|schedule|commute|allergies))(?: \w+)? (?:has been|have been|is|are|was|were|'s|keeps?) killing me)\b/gi;
  /* plain() first: a curly apostrophe ("don’t") never hides a crisis. */
  function calm(q) { return plain(q).replace(CALM, " "); }
  /* A staff member writing about someone else ("a member told me she wants to die",
     "my daughter is cutting"): the others above, and a little more. */
  var STAFF = new RegExp(OTHERS.source + "|\\b(?:(?:my|our|his|her|their) " + PERSON + "|she|he|they) (?:is|has been|keeps|started|been) cutting(?: (?:herself|himself|themselves|again|her arms?|his arms?|their arms?|her wrists?|his wrists?))?(?=\\s*[.!?]*$)|\\b(?:someone|somebody|a (?:member|friend|student|teen\\w*|kid|child|woman|man|girl|boy|guest|neighbor)|one of (?:our|my) \\w+)\\b.{0,40}\\b(?:is|are|may be|might be|could be)\\s+(?:in danger|not safe|unsafe|suicidal)\\b", "i");
  /* The last net: a crisis word that no answer took still gets the crisis reply. */
  var NET = /\b(die|dying|kill\w*|suicid\w*|overdos\w*|pills|abus\w*|unsafe|danger\w*|self[- ]?harm\w*|rape|raped|raping|molest\w*)\b/i;
  /* After every answer, for a question none of them took: words that matter only when nothing else
     fits ("I have a gun"). An answer that fits ("where do I park by the bridge?") comes first. */
  var LAST = /\b(guns?|bridge|wake up|touched)\b/i;
  /* A pastor's question about how abuse or danger is handled ("If a prayer request mentions abuse,
     does Hope report it?"), with no "I" or "me" in it, is about the product: it gets the answer on
     reporting, which gives 988 and 911 too. It only ever sets aside the net above. A crisis pattern
     always wins, and someone telling of their own danger never matches. */
  var POLICY = /^(?!.*\b(?:i|i'?m|im|i'?ve|i'?d|i'?ll|me|my|myself|mine)\b).*\b(?:if|when|what happens|what do(?:es)?|how (?:do|does|will|would|is|are)|who (?:is|gets|at|on)|does|do|will|would|can|could|should)\b.*\b(?:mention\w*|writes?|written|says?|said|types?|talks? about|brings? up|disclos\w*|report\w*|notif\w*|alert\w*|polic(?:y|ies)|procedures?|handl\w*|told)\b/i;
  /* Curly apostrophes ("can’t") read as straight ones, so a phone keyboard never hides a crisis. */
  function plain(t) { return String(t == null ? "" : t).replace(/[\u2018\u2019\u02bc\u2032]/g, "'"); }
  /* The fixed reply, word for word the live church site's, with the church's phone. A page with no
     church (the story pages) ends after "You are not alone." */
  function reply(phone) {
    return "I am so glad you told me, and I am sorry you are carrying this. I am an automated assistant, so please reach a person right now. Call or text 988, the Suicide and Crisis Lifeline, any time, day or night. If you are in immediate danger, call 911. You are not alone." +
      (phone ? " Our pastors would be honored to walk with you, and you can call the church at " + phone + "." : "");
  }
  /* ==== The safety pre-check. Every Hope calls safety() first, before any topic rule, so a word like
     "pastor", "times" or "staff" can never send a disclosure of harm to a cheerful topic answer. ==== */
  /* Someone harming themselves: the fixed crisis reply, even when a leader is named too. */
  var SELF = /\b(?:suicid\w*|kill(?:ing)? (?:myself|my self)|end(?:ing)? (?:my|my own) life|take my (?:own )?life|want(?:ed)? to die|wanna die|hurt(?:ing)? myself|harm(?:ing)? myself|self[- ]?harm\w*|cut(?:s|ting)? myself|overdos\w*|better off dead|(?:don'?t|do not) want to (?:live|be alive|be here))\b/i;
  /* A person at church: a church role ("the youth pastor", "one of the volunteers"), or someone met
     there ("a man at church", "someone from small group"). */
  var PLACE = "(?:church|youth group|youth|small group|life group|bible study|kids'? church|children'?s ministry|sunday school|camp|choir|worship team|ministry|retreat|vbs|service)";
  var CHURCH_WHO = "(?:(?:a|an|the|my|our|their|her|his|that|this|one of (?:the|our|my)) " + ROLE +
    "|(?:someone|somebody|a (?:man|woman|guy|member|person|adult|leader|volunteer|teacher)|an (?:adult|elder|usher|older man|older woman)|one of the (?:men|women|leaders|adults|members|volunteers)|people|a few people) (?:at|from|in|on) (?:the |our |my |this |that )?" + PLACE +
    "|(?:the |our |my |a |one of the )?church (?:leaders?|staff(?: members?)?|members?|volunteers?|elders?|workers?))";
  var LHARM = "(?:hurt|hurts|hurting|harmed|harms|harming|abus(?:e|es|ed|ing)|touch(?:ed|es|ing)|grop(?:ed|es|ing)|grab(?:bed|s|bing)|fondl(?:ed|es|ing)|molest(?:ed|s|ing)?|rap(?:ed|es|ing)|assault(?:ed|s|ing)|attack(?:ed|s|ing)|hit|hits|hitting|beat|beats|beating|slap(?:ped|s|ping)|kick(?:ed|s|ing)|punch(?:ed|es|ing)|chok(?:ed|es|ing)|threaten(?:ed|s|ing)?|harass(?:ed|es|ing)?|groom(?:ed|s|ing)|stalk(?:ed|s|ing)|kiss(?:ed|es|ing)|forc(?:ed|es|ing)|scar(?:es|ed|ing)|frighten(?:s|ed|ing)?|intimidat(?:es|ed|ing)|exposed (?:himself|herself) to|sent (?:nude|naked|sexual|explicit|inappropriate) \\w+ to|(?:did|does|has done|is doing|was doing|tried to do) (?:something|things|stuff) (?:illegal|inappropriate|sexual|wrong|bad|weird) (?:to|with))";
  var LOBJ = "(?:me|us|(?:my|our) (?!heart|hearts|soul|souls|spirit|faith|life|lives)\\w+|her|him|them|myself)\\b(?! up\\b| a lot\\b| (?:deeply|so much|so deeply|hard|in my heart|my heart)\\b)";
  /* Only a place may sit between the person and the harm ("a leader at church touched my son"), so
     "the pastor's sermon really hit me" stays a sermon. */
  var LOC = "(?: (?:at|from|in|on|of) (?:the |our |my |this |that )?[\\w']+(?: [\\w']+)?)?" + AUX;
  var LEADER = new RegExp(
    "\\b" + CHURCH_WHO + "\\b" + LOC + " " + LHARM + " " + LOBJ +
    "|\\b" + CHURCH_WHO + "\\b.{0,60}?\\b(?:and|then|who|he|she|they)" + AUX + " " + LHARM + " " + LOBJ +
    "|\\b" + CHURCH_WHO + "\\b" + LOC + " (?:is|was|has been|keeps being|gets|can be) (?:abusive|violent|inappropriate|threatening|dangerous|creepy)\\b" +
    "|\\b" + CHURCH_WHO + "\\b" + LOC + " (?:makes?|made|making|keeps making) (?:me|us|my \\w+) (?:feel )?(?:unsafe|uncomfortable|scared|afraid|nervous)\\b" +
    "|\\b" + CHURCH_WHO + "\\b" + LOC + " sent (?:me|us|my \\w+) (?:nude|naked|sexual|explicit|inappropriate)\\w*" +
    "|\\b(?:afraid|scared|terrified|frightened) (?:of|around|to be (?:around|alone with)) " + CHURCH_WHO + "\\b" +
    "|\\b(?:don'?t|do not|never|no longer|can'?t|cannot) feel safe (?:around|with|near) " + CHURCH_WHO + "\\b" +
    "|\\b(?:don'?t|do not|never|no longer|can'?t|cannot) feel safe (?:at|in) (?:the |our |my |this )?" + PLACE + "\\b" +
    "|\\b(?:abus\\w*|harass\\w*|touched|groped|molested|raped|assaulted|threatened|hurt|harmed|groomed|attacked|inappropriate\\w*)\\b.{0,30}?\\bby (?:" + CHURCH_WHO + "|(?:a|an|the|my|our|one of the) " + ROLE + ")\\b" +
    "|\\b(?:was|were|got|been|being|get|gets) (?:sexually |physically )?(?:abused|touched|groped|molested|raped|assaulted|harassed|groomed|threatened|attacked) (?:at|in|during) (?:the |our |my |this )?" + PLACE + "\\b", "i");
  /* A disclosure the crisis pattern above may not word: not feeling safe, fear of a person at home,
     threats, stalking, an abusive or violent person, being forced. */
  var DISCLOSE = new RegExp(
    "\\b(?:i|we) (?:don'?t|do not|never|no longer|can'?t|cannot) feel safe (?:at home|in (?:my|our) (?:home|house|marriage|family)|(?:with|around|near) (?:him|her|them|my \\w+|our \\w+)|any ?more|(?=\\s*[.!?]*$))" +
    "|\\b(?:i'?m|i am|we'?re|we are|i feel|i get) (?:so |really |very )?(?:afraid|scared|terrified|frightened) (?:of|around) (?:him|her|them|my \\w+|our \\w+)\\b(?! (?:the dark|heights|spiders|dogs|public speaking|crowds)\\b)" +
    "|\\b(?:i'?m|i am|we'?re|we are) (?:so |really |very )?(?:afraid|scared|terrified|frightened) (?:that )?(?:my|our) (?:" + KIN + "|ex|step\\w+) (?:will|would|might|could|is going to|gonna) (?:find out|hurt|hit|kill|beat|see|catch|follow|find|take|kick|get (?:mad|angry|violent)|be (?:mad|angry))\\b" +
    "|\\b" + WHO + AUX + " (?:threaten(?:s|ed|ing)?|forc(?:es|ed|ing)|stalk(?:s|ed|ing)) (?:me|us|my|to)\\b" +
    "|\\b" + WHO + AUX + " (?:won'?t|will not|doesn'?t|does not) let (?:me|us) (?:leave|go out|go anywhere|see (?:my|anyone|friends|family)|talk to (?:anyone|my)|have (?:a phone|money|my phone))\\b" +
    "|\\b(?:my|our) (?:" + KIN + "|ex|step\\w+)" + AUX + " (?:is|was|has been|gets|can be|keeps being|becomes) (?:abusive|violent|dangerous|threatening)\\b" +
    "|\\b(?:i'?m|i am|we'?re|we are|i was|i live|we live) (?:in|with) (?:an? )?(?:abusive|violent|dangerous) (?:relationship|marriage|home|house|husband|wife|partner|boyfriend|girlfriend|family|parents?|dad|mom|father|mother)\\b" +
    "|\\b(?:someone|somebody|a man|a woman|he|she|they)" + AUX + " (?:following|stalking|threatening) (?:me|us)\\b" +
    "|\\b(?:i'?m|i am|i was|we'?re|we are) being (?:stalked|followed|threatened|harassed|hurt|abused|watched|groomed)\\b" +
    "|\\b(?:forced|made) me (?:to )?(?:have sex|do (?:sexual )?things|touch)\\b|\\bsexual(?:ly)? harass\\w*", "i");
  /* A pastor's or guest's question with no disclosure in it ("How does the church handle abuse
     reports?"): it keeps the reporting answer, which gives 988 and 911. */
  var POLICY_MORE = /^(?!.*\b(?:i|i'?m|im|i'?ve|i'?d|i'?ll|me|my|myself|mine)\b).*(?:\b(?:polic(?:y|ies)|procedures?|protocols?|guidelines?)\b.*\?|\b(?:accused|allegations?|alleged)\b|\bhow (?:do|does|will|would|should) (?:you|the church|your church|a church|churches|genesis|hope|staff|pastors|the pastors)\b.{0,30}\b(?:handle|respond|deal|treat|process)\w*\b)/i;
  /* Someone else named ("someone", "she", "her") keeps a safety reply: it may be about a real person. */
  var THIRD = /\b(?:he|she|they|him|her|them|his|their|someone|somebody)\b/i;
  function isPolicy(t) { return (POLICY.test(t) || POLICY_MORE.test(t)) && !DISCLOSE.test(t); }
  /* What comes before any topic answer: "crisis" (the fixed reply), "leadersafety" (harm by someone at
     church: 911, 988 and help outside the church), "policy" (a question about how harm is handled) or
     null (no safety words; topic routing goes on). When in doubt it chooses a safety reply. */
  function safety(text) {
    var t = calm(text);
    if (!/\S/.test(t)) return null;
    if (SELF.test(t)) return "crisis";
    if (LEADER.test(t) && !isPolicy(t)) return "leadersafety";
    if (isPolicy(t) && !THIRD.test(t) && !STAFF.test(t)) return CRISIS.test(t) || NET.test(t) || LEADER.test(t) ? "policy" : null;
    if (CRISIS.test(t) || STAFF.test(t) || DISCLOSE.test(t)) return "crisis";
    if (NET.test(t)) return isPolicy(t) ? "policy" : "crisis";
    return null;
  }
  /* The reply for harm by someone at church: never only the church's own people. It has 911 and 988,
     and says plainly that help outside the church is always open. */
  function leaderReply(phone) {
    return "I am so sorry, and thank you for telling me. What happened is not your fault. I am an automated assistant, so please reach a person you trust right now. If you or anyone else is in immediate danger, call 911. You can call or text 988, the Suicide and Crisis Lifeline, any time, day or night. You do not have to go through anyone at the church to get help: you can go to the police, or to a person you trust outside the church." +
      (phone ? " If you also want to tell someone at the church, call " + phone + " and ask for a person who is not involved." : "");
  }
  window.HOPE_WORDS = { PERSON: PERSON, crisis: CRISIS, others: OTHERS, staff: STAFF, net: NET, last: LAST, policy: POLICY, leader: LEADER, disclose: DISCLOSE, calm: calm, plain: plain, reply: reply, leaderReply: leaderReply, safety: safety };
})();
