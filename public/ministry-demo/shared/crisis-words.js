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
  var PERSON = "(?:student|teen\\w*|mom|mother|mum|dad|father|wife|husband|son|daughter|kids?|child|children|sister|brother|baby|partner|girlfriend|boyfriend|fianc\\w*|friend|family|grandma|grandmother|grandpa|grandfather|roommate|neighbou?r|aunt|uncle|cousin|niece|nephew|foster (?:mom|mother|dad|father|parents?|brother|sister|family)|guardians?)";
  /* Round 5: the people a neighbor, a relative or a stranger can harm ("beating his kids"). */
  var THEIRS = "(?:his|her|their) (?:kids?|children|sons?|daughters?|baby|babies|wife|husband|girlfriend|boyfriend|students?|dog)";
  var KIN = PERSON.slice(3, -1);
  /* People in a church who could do harm: "a pastor", "the youth leader", "one of the volunteers". */
  var ROLE = "(?:(?:last|new|other|old|older|substitute|male|female|head|same) )?(?:(?:youth|worship|small group|life group|group|children'?s|kids'?|kids church|student|associate|senior|lead|assistant|music|choir|camp|teen|nursery|vbs|sunday school|bible study|band|praise team|church) )?(?:pastors?|leaders?|teachers?|coach(?:es)?|volunteers?|elders?|deacons?|ministers?|priests?|counsel(?:l)?ors?|mentors?|staff(?: members?)?|chaperones?|directors?|helpers?|aides?|ushers?|greeters?|workers?)";
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
    WHO + AUX + " " + HARMS + " (?:" + THEIRS + "|her|him|them|my " + PERSON + ")\\b|" + WHO + AUX + " " + BEATS + " (?:" + THEIRS + "|her|him|them|my " + PERSON + ")\\b" + BEAT_NOT + "|" + WHO + AUX + " " + TOUCHES + " (?:" + THEIRS + "|her|him|them|my " + PERSON + ")\\b" + TOUCH_NOT + "|took too many pills|can(?:'?t|not| not) go on (?:anymore|any more|like this|living)|(?:my " + PERSON + "|she|he|they) (?:wants?|is going|is planning|plans|tried|tries) to (?:die|kill|hurt|end)|(?:my " + PERSON + "|she|he|they) (?:overdosed|took pills)|(?:nobody|no one|no-one)(?: would| will|'d)?(?: even)? miss (?:him|her|them)\\b|wants? to disappear|wanted to disappear|touch(?:ed|es|ing) (?:my|our|her|his|their) " + PERSON + " (?:inappropriately|sexually|in a (?:bad|sexual|wrong|private) way)|(?:will|going to|gonna|might|could) (?:hurt|harm|kill) (?:the|my|our|her|his|their) (?:kids|children|baby|babies|" + KIN + ")\\b|(?:molest\\w*|raped|sexually (?:abused|assaulted)) (?:my|our|her|him|them)\\b)", "i");
  /* Everyday words that only sound like danger. They are set aside before every check, so a guest
     who is moved, or joking, never gets the crisis reply. */
  var CALM = /\b(?:touch(?:ed|es|ing)? (?:my|our) (?:heart|hearts|soul|souls|spirit)|touch(?:ed|es|ing)? (?:me|us) (?:deeply|so deeply|so much)|(?:dying|die|died|dies) (?:to (?:self|ourselves|sin|our old)|for (?:us|me|you|him|her|them|our sins|my sins|the world|sinners))|(?:dying|die) to (?:try|see|know|meet|hear|visit|come|go|get|find|have|join|check|taste|sing|worship)|(?:a|an|the|some) (?:\w+ )?\w+ to die for|die[- ]?hard|di(?:e|ed|ing) (?:of |from )?laugh\w*|dying of laughter|(?:could|would|'d) (?:die|kill) for (?:a|an|some|one)\b|(?:is|are|was|were|'s|looks?|tastes?|sounds?|smells?) to die for|(?:is|are|was|were|'s) dying (?:of|from)\b(?! (?:an? )?(?:overdose|od|suicide|self)\b)|(?:has|with) (?:cancer|covid|a (?:terminal|serious) illness)|kill(?:ing|ed)? it|kill(?:ing)? time|killers?|(?:this|that|it|the \w+|my (?:back|feet|knees?|head|neck|legs?|job|work|boss|schedule|commute|allergies))(?: \w+)? (?:has been|have been|is|are|was|were|'s|keeps?) killing me|(?:my|the|these|those|our) (?:kids|children|toddlers?|twins|students|teens|boys|girls|little ones)(?: \w+){0,2} (?:are|is|have been|has been|keep|keeps|'re) (?:killing me|killing it)|kill bill|(?:what happens|where do (?:we|you|people|i|they) go|is there (?:life|anything)|what comes)\b.{0,15}\b(?:after|when) (?:we|you|i|people|they|someone|a person) (?:die|dies|died)|(?:after|when) (?:we|you|people) die\b(?=.{0,30}\b(?:believe|teach|bible|heaven|church|scripture)))\b/gi;
  /* Text-speak reads as the words it stands for ("idw live", "hes going to", "dont wanna"), so a
     shortcut never hides a crisis. */
  function slang(t) {
    return t.replace(/\bidw(?:t)?\b/gi, "i don't want to").replace(/\bim\b/gi, "i'm").replace(/\bive\b/gi, "i've")
      .replace(/\b(do|ca|wo|did|is|does|are|was|were|could|would|should)nt\b/gi, "$1n't").replace(/\bcant\b/gi, "can't")
      .replace(/\b(he|she)s\b/gi, "$1's").replace(/\btheyre\b/gi, "they're").replace(/\bwanna\b/gi, "want to")
      .replace(/\bgonna\b/gi, "going to").replace(/\bwhats\b/gi, "what's").replace(/\bthats\b/gi, "that's");
  }
  /* plain() first: a curly apostrophe ("don’t") never hides a crisis. */
  function calm(q) { return slang(plain(q)).replace(CALM, " "); }
  /* A staff member writing about someone else ("a member told me she wants to die",
     "my daughter is cutting"): the others above, and a little more. */
  var STAFF = new RegExp(OTHERS.source + "|\\b(?:(?:my|our|his|her|their) " + PERSON + "|she|he|they) (?:is|has been|keeps|started|been) cutting(?: (?:herself|himself|themselves|again|her arms?|his arms?|their arms?|her wrists?|his wrists?))?(?=\\s*[.!?]*$)|\\b(?:someone|somebody|a (?:member|friend|student|teen\\w*|kid|child|woman|man|girl|boy|guest|neighbor)|one of (?:our|my) \\w+)\\b.{0,40}\\b(?:is|are|may be|might be|could be)\\s+(?:in danger|not safe|unsafe|suicidal)\\b", "i");
  /* The last net: a crisis word that no answer took still gets the crisis reply. */
  var NET = /\b(die|dying|kill\w*|suicid\w*|overdos\w*|pills|abus\w*|unsafe|danger\w*|self[- ]?harm\w*|rape|raped|raping|molest\w*)\b/i;
  /* After every answer, for a question none of them took: words that matter only when nothing else
     fits ("I have a gun"). An answer that fits ("where do I park by the bridge?") comes first. */
  /* "Bridge" counts only with the writer in it ("I'm on the bridge"), so "is the bridge on Main Street
     closed for parking" is a road question. */
  var LAST = /\b(?:(?<!\b(?:hunting|nerf|water|toy|glue|staple|paint|squirt|bring|carry|concealed|bring my|carry my|bring a|carry a|bring their|carry their) )guns?\b(?! (?:safety|range|show|club|class|course|policy|policies|violence|free|laws?|control|locker)\b)|touched\b(?! (?:on|base)\b))|\b(?:not|never|don'?t|won'?t) (?:to )?wake up\b|^(?!.*\b(?:park\w*|streets?|roads?|closed|construction|directions?|traffic|detour|lanes?)\b).*(?:\b(?:i|i'?m|im|me|my|myself)\b.{0,30}\bbridge\b|\bbridge\b.{0,30}\b(?:i|me|myself)\b)/i;
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
  var SELF = /\b(?:suicid\w*|kill(?:ing)? (?:myself|my self)|end(?:ing)? (?:my|my own) life|take my (?:own )?life|want(?:ed)? to die|wanna die|hurt(?:ing)? myself|harm(?:ing)? myself|self[- ]?harm\w*|cut(?:s|ting)? myself|overdos\w*|better off dead|(?:don'?t|do not) want to (?:live|be alive|be here)|burn(?:s|ing|ed|t)? myself|(?:i'?ve been|i have been|i'?m|im|i am|i started|i'?ve started|started|been) (?:cutting|burning|hurting)(?: myself)?(?: again)?(?=\s*[.!?]*$)|(?:i'?ve been|i have been|i'?m|im|i am|i started) (?:cutting|burning) (?:again|my (?:arms?|wrists?|legs?|skin))|cutting (?:myself )?again|scratch\w* (?:myself|my (?:arms?|wrists?|skin))\b.{0,20}\b(?:bleed\w*|blood)|(?<![\d.] ?)kms|unaliv\w*|starving myself|(?:hit|hitting|punch|punching|slap|slapping) myself|starv(?:e|es|ed|ing) (?:myself|herself|himself)|only eat(?:ing)? (?:\d+|a few hundred) calories|(?:eat|eating|ate) (?:only )?\d{1,3} calories (?:a|per) day|purg(?:e|es|ed|ing) (?:after|when|every|again|daily|at night|myself)|plan(?:s|ning)? to (?:end it|end things|end my life|kill myself|die)\b(?!\s+(?:with|for|between|on|at|early|here|there|now|by|off)\b)|(?:have|got|made|making|make) a plan\b.{0,20}\b(?:end it|end things|end my life|die|kill myself)|sewer ?slid\w*|bought (?:a |some )?rope\b(?!.{0,40}\b(?:for (?:the|our|a|vbs|camp)|crafts?|tents?|swings?|tug|climb\w*)))\b/i;
  /* A person at church: a church role ("the youth pastor", "one of the volunteers"), or someone met
     there ("a man at church", "someone from small group"). */
  var PLACE = "(?:church|youth group|youth|small group|life group|bible study|kids'? church|children'?s ministry|sunday school|camp|choir|worship team|ministry|retreat|vbs|service|staff|the staff|the worship team|the church staff)";
  var CHURCH_WHO = "(?:(?:a|an|the|my|our|their|her|his|that|this|one of (?:the|our|my)) " + ROLE +
    "|(?:someone|somebody|a (?:man|woman|guy|member|person|adult|leader|volunteer|teacher)|an (?:adult|elder|usher|older man|older woman)|one of the (?:men|women|leaders|adults|members|volunteers)|people|a few people) (?:at|from|in|on) (?:the |our |my |this |that )?" + PLACE +
    "|(?:the |our |my |a |one of the )?church (?:leaders?|staff(?: members?)?|members?|volunteers?|elders?|workers?)" +
    "|(?:a|an|the|my|our|one of the) (?:pastor|leader|elder|deacon|youth pastor|worship leader)'?s (?:son|daughter|wife|husband|kid|brother|sister|friend|dad|father)" +
    "|(?:someone|somebody|a man|a woman|a guy) (?:who works|who volunteers|who serves|who helps) (?:at|in|with) (?:the |our |my )?" + PLACE +
    /* Round 5: a child's leader with no article ("my sons sunday school teacher", "our daughter's coach"). */
    "|(?:my|our|her|his) (?:son|daughter|kid|child|boy|girl|kids|children|sons|daughters)'?s? " + ROLE + ")";
  var LHARM = "(?:hurt|hurts|hurting|harmed|harms|harming|abus(?:e|es|ed|ing)|touch(?:ed|es|ing)|grop(?:ed|es|ing)|grab(?:bed|s|bing)|fondl(?:ed|es|ing)|molest(?:ed|s|ing)?|rap(?:ed|es|ing)|assault(?:ed|s|ing)|attack(?:ed|s|ing)|hit|hits|hitting|beat|beats|beating|slap(?:ped|s|ping)|kick(?:ed|s|ing)|punch(?:ed|es|ing)|chok(?:ed|es|ing)|threaten(?:ed|s|ing)?|harass(?:ed|es|ing)?|groom(?:ed|s|ing)|stalk(?:ed|s|ing)|pinch(?:ed|es|ing)|shov(?:ed|es|ing)|slamm(?:ed|ing)|slams|strangl(?:ed|es|ing)|yell(?:ed|s|ing) at|scream(?:ed|s|ing) at|kiss(?:ed|es|ing)|forc(?:ed|es|ing)|scar(?:es|ed|ing)|frighten(?:s|ed|ing)?|intimidat(?:es|ed|ing)|exposed (?:himself|herself) to|sent (?:nude|naked|sexual|explicit|inappropriate) \\w+ to|(?:did|does|has done|is doing|was doing|tried to do) (?:something|things|stuff) (?:illegal|inappropriate|sexual|wrong|bad|weird) (?:to|with))";
  var LOBJ = "(?:me|us|(?:my|our) (?!heart|hearts|soul|souls|spirit|faith|life|lives)\\w+|(?:his|her|their) (?:kids?|children|sons?|daughters?|baby|babies|private \\w+|students?)|her|him|them|myself)\\b(?! up\\b| a lot\\b| (?:deeply|so much|so deeply|hard|in my heart|my heart)\\b)";
  /* Only a place may sit between the person and the harm ("a leader at church touched my son"), so
     "the pastor's sermon really hit me" stays a sermon. */
  var LOC = "(?: here| there| on staff| (?:at|from|in|on|of) (?:the |our |my |this |that )?[\\w']+(?: [\\w']+)?)?" + AUX;
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
    "|\\b(?:was|were|got|been|being|get|gets) (?:sexually |physically )?(?:abused|touched|groped|molested|raped|assaulted|harassed|groomed|threatened|attacked) (?:at|in|during) (?:the |our |my |this )?" + PLACE + "\\b" +
    /* Round 5: following or watching by someone at church, a leader who says not to call the police, and
       a leader who says to stay with an abusive spouse. */
    "|\\b" + CHURCH_WHO + "\\b" + LOC + " (?:following|stalking|watching|waiting (?:for|outside)|showing up at|turning up at) (?:me|us|my)\\b" +
    "|\\b(?:someone|somebody|a (?:man|woman|guy|person)|he|she|they|people|my ex)\\b" + AUX + " (?:following|stalking|watching|waiting for) (?:me|us)\\b[^.?!]{0,30}\\b(?:from|at|after|outside|in|to) (?:the |our |my |this )?" + PLACE + "\\b" +
    "|\\b" + CHURCH_WHO + "\\b[^.?!]{0,40}\\b(?:told|tells|said|says|asked|asks|wants?|wanted|advised|begged|warned|pressur\\w*)\\b[^.?!]{0,40}\\b(?:not|never|shouldn'?t|should not|don'?t) (?:to )?(?:call|tell|contact|go to|report (?:it )?to|report)\\b[^.?!]{0,20}\\b(?:police|cops|911|authorities|cps|social services|anyone|anybody)\\b" +
    "|\\b" + CHURCH_WHO + "\\b[^.?!]{0,40}\\b(?:told|tells|said|says|wants?|asked|advised|counsel\\w*)\\b[^.?!]{0,60}\\bstay (?:with|married to|in|home with)\\b[^.?!]{0,40}\\b(?:abus\\w*|violent|hits?|beats?|hurts?)\\b", "i");
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
    "|\\b(?:forced|made) me (?:to )?(?:have sex|do (?:sexual )?things|touch)\\b|\\bsexual(?:ly)? harass\\w*" +
    /* Round 5: a threat about to happen ("hes going to hurt me"), and someone who keeps following,
       with a few words between ("someone from work keeps following me home"). */
    "|\\b" + WHO + AUX + " (?:going to|about to|planning to|coming to) (?:hurt|kill|beat|hit|shoot|stab|rape|attack|choke|take the kids from) (?:me|us|my \\w+)\\b" +
    "|\\b(?:someone|somebody|a man|a woman|a guy|he|she|they|my ex)(?:\\s+[\\w']+){0,3}\\s+(?:keeps?|kept|is|was|has been|won'?t stop)\\s+(?:following|stalking|watching|showing up at|waiting (?:for|outside)) (?:me|us|my)\\b", "i");
  /* Round 5: the person in crisis, in words the pattern above does not hold. */
  var CRISIS5 = new RegExp([
    "\\b(?:don'?t|do not) want to (?:live|be alive|be here)\\b",
    "\\blife (?:is ?n'?t|is not|ain'?t) worth (?:it|living)\\b",
    "\\bwhat'?s the point (?:of|in) (?:anything|it all|everything|trying|any of (?:this|it))\\b",
    "\\bcan(?:'?t|not| not) do (?:life|this|it) any ?more\\b",
    "\\b(?:thinking (?:of|about)|going to|want to|planning (?:to|on)|ready to|about to) end(?:ing)? things\\b(?!\\s+(?:with|for|between|on|at|early|here|there|now|by|off)\\b)|\\bend(?:ing)? things tonight\\b",
    "\\b(?:want|wish|wanted)(?: to)? (?:not (?:exist|be alive)|stop existing)\\b|\\bwish i (?:didn'?t|did not) exist\\b",
    "\\b(?:want to|feel like|thinking (?:of|about)|going to) jump(?:ing)?(?=\\s*(?:tonight|today|now|right now|again)?\\s*[.!]*$)",
    "\\b(?:having|have|had|getting|been having) (?:some |a lot of |these |really |such )?dark thoughts\\b",
    "\\b(?:might|going to|about to|afraid i'?ll|scared i'?ll|i'?ll|i will) do something stupid\\b",
    "\\b(?:i'?m|i am|i feel like) (?:just |such )?a burden\\b|\\bburden to (?:everyone|everybody|my family)\\b",
    "\\bforc(?:ed|es|ing) (?:himself|herself|themselves) on (?:me|her|him|us)\\b",
    "\\bdrugg?ed (?:my|her|his|our) drinks?\\b|\\b(?:put|slipped) something in (?:my|her|his) drink\\b",
    "^\\s*(?:please |pls |plz |someone |somebody )?help me(?: please| pls| plz| now| someone)?\\s*[.!]*\\s*$"
  ].join("|"), "i");
  /* A pastor's or guest's question with no disclosure in it ("How does the church handle abuse
     reports?"): it keeps the reporting answer, which gives 988 and 911. */
  var POLICY_MORE = /^(?!.*\b(?:i|i'?m|im|i'?ve|i'?d|i'?ll|me|my|myself|mine)\b).*(?:\b(?:polic(?:y|ies)|procedures?|protocols?|guidelines?)\b.*\?|\b(?:accused|allegations?|alleged)\b|\bhow (?:do|does|will|would|should) (?:you|the church|your church|a church|churches|genesis|hope|staff|pastors|the pastors)\b.{0,30}\b(?:handle|respond|deal|treat|process)\w*\b)/i;
  /* Someone else named ("someone", "she", "her") keeps a safety reply: it may be about a real person. */
  var THIRD = /\b(?:he|she|they|him|her|them|his|their|someone|somebody)\b/i;
  function isPolicy(t) { return (POLICY.test(t) || POLICY_MORE.test(t)) && !DISCLOSE.test(t); }
  /* Round 4: harm the patterns above do not word. Shoved down the stairs, slammed against a wall, a
     partner who tracks a phone or takes the paycheck, locked out, getting away before he gets home,
     someone showing up at work or watching, a threat to shoot, a parent afraid of hurting a child, an
     overdose (fentanyl, a whole bottle, not breathing), being homeless or without hope, a wish for an
     accident, goodbye letters, an eating disorder, trafficking, and "I said no but he didn't stop". */
  var PARTNER = "(?:he|she|they|my (?:husband|wife|boyfriend|girlfriend|partner|ex|fianc\\w*|spouse|step\\w+|dad|father|mom|mother|uncle|brother|son|parents?)|her (?:husband|boyfriend|ex)|his (?:wife|girlfriend|ex))";
  var MORE = new RegExp([
    WHO + AUX + " (?:push(?:es|ed|ing)?|shov\\w*|throws?|threw|thrown|kicked) (?:me|us|my \\w+|her|him)(?: \\w+){0,2}? (?:down|into|against|off|over|out of|across|onto)\\b",
    WHO + AUX + " (?:slam\\w*|pinch\\w*|strangl\\w*|chok\\w*|drag\\w*|burn\\w*|bit|bites) (?:me|us|my \\w+|her|him)\\b",
    "\\bstrangl\\w*",
    "\\b(?:comes?|came|coming|gets?|got|climbs?|climbed) (?:in|into) my (?:bed|sleeping bag)\\b",
    "\\b(?:comes?|came|coming|sneaks?|snuck) (?:in|into) my (?:room|bedroom) (?:at night|late|when\\b.{0,30}\\b(?:asleep|sleeping|gone|away|out|working))",
    "\\b(?:does|did|doing|done|do) (?:stuff|things|something|sexual things|bad things|weird things) to me\\b",
    PARTNER + AUX + " (?:tracks?|tracked|tracking|monitors?|monitored|monitoring) (?:my|me)\\b",
    PARTNER + AUX + " (?:takes?|took|taking|controls?|controlled|controlling|hides?|hid) (?:all )?(?:of )?my (?:money|paychecks?|pay|phone|keys|car|cards?|wallet|id|passport|bank\\w*)",
    "\\blocked (?:me|us) out\\b",
    "\\b(?:get|got|getting|run|ran|escape|escaping) away from (?:him|her|them|my (?:husband|wife|boyfriend|girlfriend|partner|ex|abuser|dad|father|mom|mother|stepdad|stepmom|step\\w+|uncle|family|parents))\\b",
    "\\bbefore (?:he|she) (?:gets|comes) (?:back )?home\\b",
    "\\b(?:keeps?|kept|keep) (?:showing up|turning up|coming) (?:at|to) my (?:job|work|house|home|school|door|apartment|office|car)\\b",
    "\\b(?:someone|somebody|he|she|they|a (?:man|guy|woman))(?:'s|'re| is| are| keeps?)? (?:been )?(?:watching|following) me\\b(?! (?:on|online)\\b)",
    "\\b(?:i'?m|i am) being (?:watched|followed)\\b",
    "\\b(?:leaves|leaving|left) (?:\\w+ )?notes on my (?:car|door|windshield)\\b",
    "\\bshoot up (?:the |a |our |my |this )?(?:school|church|class|place|office|party)\\b",
    "\\b(?:going to|gonna|will|wants? to|plans? to|planning to|threatened to|threatens to) (?:shoot|stab) (?:us|me|everyone|everybody|people|them|you|my \\w+|up)\\b",
    "\\b(?:going to|gonna|will|wants? to|plans? to|planning to) kill (?:us|everyone|everybody|people|all of us|my (?:family|kids|mom|dad|wife|husband))\\b",
    "\\b(?:outside|here|in the (?:parking lot|lot|lobby|building|hallway)) with a (?:knife|gun|weapon|machete)\\b",
    "\\bi (?:hit|hurt|beat|shake|shook|slap|slapped|choked) my (?:kids?|son|daughter|baby|children|child|toddler)\\b",
    "\\b(?:scared|afraid|worried|terrified) (?:that )?i(?:'?ll| will| might| am going to|'?m going to) (?:hurt|hit|kill|shake|harm) (?:them|him|her|my \\w+|the baby|someone)\\b",
    "\\b(?:locks?|locked|locking) (?:her|his|their|my|the) (?:kids?|children|son|daughter|baby) (?:outside|out of the house|in (?:a|the|their|his|her) (?:room|closet|basement|car))",
    "\\b(?:leaves?|left) (?:her|his|their|the) (?:kids?|children|baby|toddler) (?:alone )?(?:all night|overnight|for days|without food|in the car)\\b",
    "\\b(?:fentanyl|o\\.d\\.|od'?d|od'?ing)",
    "\\bi (?:just |have )?(?:relapsed|used again)\\b|\\bi'?ve relapsed\\b",
    "\\b(?:not|isn'?t|isnt|is not|stopped|wasn'?t|aren'?t) breathing\\b",
    "\\btook (?:a |the |my |an )?(?:whole|entire|full) bottle\\b|\\btook (?:a |the )?bottle of (?:pills|tylenol|advil|ibuprofen|aspirin|sleeping pills|meds|medicine|\\w+ pills)\\b|\\btook \\d+ (?:\\w+ )?(?:pills|tablets|xanax|tylenol|advil)\\b|\\btook (?:all|a bunch|a handful|a lot) of (?:my |the |his |her )?(?:pills|meds|medication|tylenol|sleeping pills)\\b",
    "\\b(?:i'?m|im|i am) not (?:ok|okay)\\b.{0,15}\\b(?:help|please|pls|plz)\\b",
    "\\bhopeless(?:ness)?\\b",
    "\\b(?:i'?m|im|i am|we'?re|we are|i'?ve been|we'?ve been|i became|i'?ll be)(?: \\w+){0,3} homeless\\b|\\bnowhere (?:to|for me to|for us to) (?:sleep|go|stay|live)\\b|\\bkicked (?:me|us) out\\b|\\bsleeping in my car\\b",
    "\\bhope (?:i|that i) (?:get (?:in|into|hit by) (?:a |an )?(?:car |bus |train )?(?:accident|crash|wreck|car|bus|train)|die|crash|don'?t wake up|never wake up)\\b",
    "\\b(?:don'?t|do not) want to wake up\\b|\\bsleep forever\\b|\\bnever wake up\\b",
    "^\\s*(?:i'?m|im|i am) (?:so |really |very )?(?:scared|terrified|afraid|frightened)\\s*[.!]*\\s*$",
    "\\bkys\\b",
    "\\bgoodbye (?:letters?|notes?|messages?|videos?)\\b|\\bsuicide (?:note|letter)\\b",
    "\\bgave away (?:all )?(?:of )?my (?:stuff|things|belongings)\\b",
    "\\b(?:everyone|everybody|they|my family|the world|people) (?:would be|will be|'?d be) (?:better|happier) (?:off )?(?:without me|if i (?:was|were|wasn'?t|weren'?t) (?:gone|here|around|alive|dead))|\\b(?:happier|better) without me\\b|\\bbetter if i (?:wasn'?t|weren'?t|was not|were not) (?:here|around|alive|born)\\b",
    "\\btired of (?:living|being alive|life|existing)\\b",
    "\\bwants? (?:it all|it|everything|the pain|this pain|my life|all of this) to (?:stop|end|be over)\\b",
    "\\b(?:no|don'?t see (?:a|any)|can'?t see (?:a|any)|there'?s no|there is no) way out\\b",
    "\\bit'?s (?:all )?over for me\\b",
    "\\bdeserve to die\\b|\\bwants? me dead\\b",
    "\\bjump(?:ing)? in front of (?:a|the) (?:train|bus|car|truck|subway)\\b",
    "\\b(?:on|at) the (?:roof|ledge|bridge|edge|tracks|railing|overpass)(?: \\w+){0,3} (?:right now|tonight)\\b|\\bstanding on (?:the|a|an|top of the) (?:roof|ledge|bridge|edge|railing|overpass|balcony|tracks|cliff)\\b",
    /* Round 5: bruises a child explains, and an eating disorder in someone else. */
    "\\bbruis\\w*\\b[^?]{0,50}\\b(?:does it|did it|did this|does this|did that|hits?|hitting|beats?|beat (?:her|him|me)|grabbed|gave (?:her|him|me) (?:them|those|that))\\b|\\b(?:hits?|beats?|hit (?:her|him))\\b[^?]{0,40}\\bbruis\\w*",
    "\\bmak(?:e|es|ing) (?:herself|himself|themselves) (?:throw up|puke|vomit|sick)\\b|\\bstarv(?:e|es|ing) (?:herself|himself|themselves)\\b",
    "\\bdrive (?:my car |the car |off )?(?:into|off) (?:a|the) (?:tree|wall|bridge|river|lake|truck|traffic|cliff|pole)\\b|\\bcrash my car on purpose\\b",
    "\\b(?:throw(?:ing)?|threw) up after (?:i eat|eating|meals|every meal|dinner|lunch)\\b|\\bmake myself (?:throw up|puke|vomit)\\b",
    "\\bhaven'?t eaten in (?:days|a week|\\d+ days|weeks)\\b",
    "\\b(?:i'?m|im|i am|i have|i think i have|i'?ve been|i struggle with) (?:\\w+ )?(?:anorexi\\w*|bulimi\\w*)",
    "\\b(?:being|been|was|were|got|am|is|are) trafficked\\b|\\btraffick(?:ing|ed|s) (?:me|us)\\b|\\bmy trafficker\\b",
    "\\bsaid no (?:but|and) (?:he|she|they)\\b|\\b(?:i|we) said (?:no|stop) but\\b",
    "\\bforc\\w* (?:me|us|her|him) (?:to (?:have sex|do|touch)|into (?:sex|it|bed))",
    "\\btouch\\w* (?:me|my \\w+|her|him)\\b.{0,30}\\bprivate (?:area|parts|place)s?",
    "\\b(?:send|sent|sends|asked for|wants?) (?:me |him |her )?(?:nudes|naked (?:pics?|pictures|photos))"
  ].join("|"), "i");
  /* Spanish, written with or without accents. No word edge after an accented letter: JavaScript does
     not count "ó" as a word letter. */
  var SPANISH = /(?:^|[^\wáéíóúñ])(?:suicid\w*|matarme|me quiero morir|quiero morir|no quiero vivir|quitarme la vida|me (?:pega|golpea|lastima|maltrata|viola|violó|abusa|abusó|toca|tocó|toco)|no me siento segur[oa]|tengo miedo|me hago daño|me corto|me quiero matar|me voy a matar|me (?:quiere|va a) (?:matar|pegar|lastimar|hacer daño)|me amenaz\w*)/i;
  var SPANISH_LEADER = /(?:pastor|l[ií]der|maestr[oa]|voluntari[oa]|di[aá]cono|anciano)[^.?!]{0,40}\bme (?:toc[oó]|toca|lastim[oó]|lastima|abus[oó]|abusa|viol[oó]|peg[oó])/i;
  /* Grooming and misconduct by someone at church, with or without a harm verb: texting at night, asking
     for pictures, a secret, a lap, dating a teenager, pressure, explicit pictures shown, alone in a
     bathroom or car, alcohol, hugs after "stop", comments about a body. Any of these with a church role
     anywhere in the message gets the leader safety reply. */
  var GROOM = new RegExp([
    "\\b(?:keeps?|kept|won'?t stop|always|constantly|been|starts?|started) (?:texting|messaging|dm'?ing|dming|snapchatting|calling|sending (?:me|my \\w+) (?:snaps|messages|texts|pictures|pics))(?: (?:me|us|my \\w+(?: \\w+){0,2}))?",
    "\\b(?:texts?|texting|texted|messages?|messaging|messaged|dms?|dm'?ing|calls?|calling|called|sends?|sending|sent|snaps?)\\b.{0,40}\\b(?:at night|late at night|after midnight|in the middle of the night|at (?:[1-4]|1[0-2])(?::\\d\\d)? ?(?:am|a\\.m\\.)|[1-4] ?am)\\b",
    "\\bsnapchat\\w*",
    "\\b(?:ask\\w*|want\\w*|told|tells?|telling|pressur\\w*|begg?\\w*)\\b (?:(?:me|us|her|him|them|my \\w+(?: \\d+ year old)?) )?(?:for|to send|to take|to text)(?: (?:him|her|them|me))? (?:some |a |more |naked |nude |private )?(?:pics?|pictures?|photos?|nudes|selfies|snaps)\\b(?! (?:of|from|for) (?:the|our|camp|vbs|church|the event|the trip|the retreat|the service|the slideshow|the bulletin)\\b)",
    "\\bsend (?:him|her|them) (?:some |a |more )?(?:pics?|pictures?|photos?|nudes|selfies)\\b",
    "\\b(?:asked|told|tells?|wants?|wanted|made|makes|begged|said|says)\\b.{0,30}\\bkeep(?:s|ing)?\\b.{0,25}\\bsecret\\b",
    "\\b(?:it'?s|its|it is|is|was|it was) (?:our|a) (?:little |special )?secret\\b|\\bour (?:little |special )?secret\\b",
    "\\bsecret (?:relationship|texts?|messages?|meetings?|chats?|gifts?)\\b",
    "\\b(?:asked|told|tells?|telling|wants?|wanted|made|makes|said|says)\\b.{0,20}\\b(?:not|never) to tell\\b|\\bdon'?t tell (?:anyone|anybody|your (?:mom|dad|parents|mother|father|family))\\b",
    "\\b(?:told|tells|asked|made) (?:me|him|her|them|my \\w+) to (?:keep quiet|stay quiet|be quiet about|keep (?:it|this) quiet)\\b",
    "\\b(?:sit|sat|sitting) on (?:his|her|their) lap\\b",
    "\\bdating (?:an? )?\\d+[- ]?(?:year|yr)s?[- ]?old\\b|\\bdating (?:a|one of the|one of our|one of my) (?:students?|teens?|kids?|minors?|girls?|boys?|youth)\\b",
    "\\bpressur(?:ed|es|ing) (?:me|us|my \\w+|her|him)\\b",
    "\\bshow(?:s|ed|n|ing)?\\b.{0,25}\\b(?:porn\\w*|inappropriate|sexual|explicit|nude|naked|dirty)\\b",
    "\\balone (?:with (?:him|her|them|me|my \\w+) )?in (?:the |his |her |a |their )?(?:bathroom|restroom|car|office|room|closet|van|bedroom|basement|truck)\\b|\\btook (?:me|my \\w+|her|him) (?:in|into|to) (?:the |a |his |her )?(?:bathroom|restroom|car|office|bedroom|closet|basement|van) alone\\b",
    "\\bgave (?:him|her|me|us|my \\w+|them) (?:alcohol|beer|drinks|liquor|weed|drugs|a vape|vapes|pills|edibles)\\b",
    "\\bhug\\w* (?:me|my \\w+|her|him)\\b.{0,40}\\b(?:stop|uncomfortable|didn'?t want|don'?t want|won'?t let go|too long|weird|creepy|asked)\\b|\\bkeeps? hugging\\b",
    "\\bcomments? about (?:my|her|his) (?:body|looks|chest|breasts|butt|figure|weight|legs|appearance)\\b",
    "\\b(?:hitting|hits|came|comes|coming) on (?:me|my \\w+|her|him)\\b",
    "\\b(?:sleep|sleeping|slept|have sex|had sex|hook up|hooked up) with (?:him|her|them|me)\\b",
    "\\bprivate (?:area|parts)\\b",
    "\\b(?:nudes|naked (?:pics?|pictures|photos))\\b",
    /* Round 5: asked over alone, a relationship with a minor, and pictures sent with some asked back. */
    "\\b(?:come|came|coming|go|went|stay|stayed) (?:over(?! to (?:the |our |this )?(?:church|building|sanctuary|campus|office|chapel))|to (?:his|her|their) (?:house|place|apartment|home|room))\\b.{0,25}\\balone\\b|\\balone\\b.{0,15}\\b(?:at|to) (?:his|her|their) (?:house|place|apartment|home)\\b",
    "\\b(?:relationship|dating|going out|boyfriend|girlfriend)\\b.{0,40}\\b(?:i'?m|i am|she'?s|he'?s|she is|he is|they'?re|they are|my|our|a|an) 1[0-7](?:[- ](?:years?|yrs?)[- ]old)?\\b|\\b(?:i'?m|i am) 1[0-7]\\b.{0,40}\\b(?:relationship|dating|going out|boyfriend|girlfriend)\\b",
    "\\b(?:sends?|sent|sending) (?:me|my \\w+|her|him) (?:pics?|pictures?|photos?|selfies)\\b.{0,40}\\b(?:asks?|asked|wants?|wanted)\\b.{0,15}\\b(?:some|one|them|pics?|pictures?|photos?)\\b|\\bask\\w* for (?:some|one|them) back\\b"
  ].join("|"), "i");
  /* A church role anywhere ("my youth pastor", "a staff member at the church", "the pastor's son"). */
  var CHURCH_ANY = new RegExp("\\b" + CHURCH_WHO + "\\b|\\b(?:youth|worship|children'?s|kids'?|student|small group) (?:pastors?|leaders?)\\b", "i");
  /* Said right after the person: "the youth pastor sends my daughter messages that make me uncomfortable". */
  var NEAR = new RegExp("\\b" + CHURCH_WHO + "\\b[^.?!]{0,60}?\\b(?:(?:makes?|made|making) (?:me|us|my \\w+|her|him|them) (?:feel )?(?:so |really |very )?(?:uncomfortable|unsafe|weird|creepy|icky|scared)|feels? (?:so |really |very )?(?:wrong|weird|creepy|off|icky|inappropriate)|inappropriate\\w*|creepy|not (?:okay|ok)\\b)", "i");
  function churchHarm(t) { return SPANISH_LEADER.test(t) || NEAR.test(t) || (CHURCH_ANY.test(t) && GROOM.test(t)); }
  /* "Pastor Mike" reads as "the pastor", so a name never hides a leader. Capital letters only: "the
     pastor said" is not a name. */
  /* Round 5: a name typed in lower case ("pastor dan kissed me") counts too, but only when what follows
     the name is something a person does, so "the pastor said" and "pastor appreciation" stay as they are. */
  var DOES = "(?:'s|s| is| was| has| had| keeps?| kept| just| always| still| has been| had been| and i)*(?: " + LHARM + "|(?: (?:asked|asks|told|tells|said|says|sends?|sent|texts?|texted|messaged|messages|snapchat\\w*|dm'?d|dms|wants?|wanted|made|makes|took|takes|gave|gives|pressured|showed|shows|calls?|called|won'?t|is|was|keeps?|kept|and i)\\b))";
  var LOWER_NAME = new RegExp("\\b(?:youth pastor|pastor|ptr|elder|deacon|coach|minister|reverend|rev)\\.? (?!(?:is|was|said|says|told|tells|and|or|the|a|an|has|had|of|at|in|on|to|for|who|that|he|she|they|keeps?|kept|will|would|always|just|never|also|again|me|my|us|our|your|his|her|their|with|from|by|about|asked|asks|sent|sends|kissed|touched|hugged|hit|hurt|made|makes|wants?|wanted|texted|texts|called|calls|gave|took|showed|can|could|should|does|did|do|are|were|be|been|i|we|you|it|this|team|appreciation|search|search team|office|meeting|wife|husband|kids?)\\b)[a-z]+\\b(?=" + DOES + ")", "gi");
  function named(t) {
    return t.replace(/\b(?:Pastor|Ptr|Elder|Deacon|Coach|Minister|Reverend|Rev|Brother|Bro|Sister|Mr|Mrs|Ms|Miss|Mister)\.? [A-Z][a-z]+(?: [A-Z][a-z]+)?\b/g, function (m) {
      return /^(?:Mr|Mrs|Ms|Miss|Mister)\b/.test(m) ? "the teacher" : "the pastor";
    }).replace(LOWER_NAME, function (m) { return /^youth/i.test(m) ? "the youth pastor" : "the pastor"; });
  }
  /* What comes before any topic answer: "crisis" (the fixed reply), "leadersafety" (harm by someone at
     church: 911, 988 and help outside the church), "policy" (a question about how harm is handled) or
     null (no safety words; topic routing goes on). When in doubt it chooses a safety reply. */
  function check(t) {
    if (!/\S/.test(t)) return null;
    if (SELF.test(t) || SPANISH.test(t) && /suicid|matarme|morir|vivir|vida|daño|corto/i.test(t)) return "crisis";
    if ((LEADER.test(t) || churchHarm(t)) && !isPolicy(t)) return "leadersafety";
    if (isPolicy(t) && !THIRD.test(t) && !STAFF.test(t)) return CRISIS.test(t) || NET.test(t) || LEADER.test(t) || MORE.test(t) || churchHarm(t) ? "policy" : null;
    /* Round 5: a protective order or following, with the church in the message, is harm at church. */
    var orderOf = /\b(?:protective|restraining|no[- ]contact) orders?\b/i.test(t) && !isPolicy(t) && !/\b(?:polic(?:y|ies)|procedures?|protocols?|guidelines?|how (?:do|does|should|would|will) (?:you|the church|a church|churches|your church))\b/i.test(t);
    if (orderOf && !(CHURCH_ANY.test(t) || /\bchurch\b/i.test(t))) return "crisis";
    if ((orderOf || /\b(?:following|stalking|watching) (?:me|us)\b/i.test(t)) && (CHURCH_ANY.test(t) || /\b(?:this|our|my|the|at|from|to|in) church\b|\b(?:youth group|small group|bible study)\b/i.test(t)) && !isPolicy(t)) return "leadersafety";
    if (CRISIS.test(t) || CRISIS5.test(t) || STAFF.test(t) || DISCLOSE.test(t) || MORE.test(t) || SPANISH.test(t)) return "crisis";
    if (NET.test(t)) return isPolicy(t) ? "policy" : "crisis";
    return null;
  }
  /* The whole message first, then each sentence and clause on its own, so an ordinary question first
     ("Where do I park? I need to get away from my husband") never hides what follows it. */
  function safety(text) {
    var t = named(calm(text)), r = check(t);
    if (r) return r;
    var parts = t.split(/[.?!,;:\n]+|\s+(?:and|but|also|plus|then|so)\s+/i), found = null;
    if (parts.length < 2) return null;
    for (var i = 0; i < parts.length; i++) {
      var s = check(parts[i]);
      if (s === "leadersafety") return s;
      if (s === "crisis") found = s;
    }
    return found;
  }
  /* The reply for harm by someone at church: never only the church's own people. It has 911 and 988,
     and says plainly that help outside the church is always open. */
  function leaderReply(phone) {
    return "I am so sorry, and thank you for telling me. What happened is not your fault. I am an automated assistant, so please reach a person you trust right now. If you or anyone else is in immediate danger, call 911. You can call or text 988, the Suicide and Crisis Lifeline, any time, day or night. You do not have to go through anyone at the church to get help: you can go to the police, or to a person you trust outside the church." +
      (phone ? " If you also want to tell someone at the church, call " + phone + " and ask for a person who is not involved." : "");
  }
  window.HOPE_WORDS = { PERSON: PERSON, crisis: CRISIS, others: OTHERS, staff: STAFF, net: NET, last: LAST, policy: POLICY, leader: LEADER, disclose: DISCLOSE, more: MORE, groom: GROOM, calm: calm, plain: plain, reply: reply, leaderReply: leaderReply, safety: safety };
})();
