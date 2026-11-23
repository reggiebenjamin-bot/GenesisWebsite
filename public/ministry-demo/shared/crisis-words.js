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
  var CALM = /\b(?:(?:dying|die|died|dies) (?:to (?:self|ourselves|sin|our old)|for (?:us|me|you|him|her|them|our sins|my sins|the world|sinners))|(?:dying|die) to (?:try|see|know|meet|hear|visit|come|go|get|find|have|join|check|taste|sing|worship)|to die for|die[- ]?hard|di(?:e|ed|ing) (?:of |from )?laugh\w*|dying of laughter|(?:could|would|'d) (?:die|kill) for (?:a|an|some|one)\b|kill(?:ing|ed)? it|kill(?:ing)? time|killers?|(?:this|that|it|the \w+|my (?:back|feet|knees?|head|neck|legs?|job|work|boss|schedule|commute|allergies))(?: \w+)? (?:has been|have been|is|are|was|were|'s|keeps?) killing me)\b/gi;
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
  window.HOPE_WORDS = { PERSON: PERSON, crisis: CRISIS, others: OTHERS, staff: STAFF, net: NET, last: LAST, policy: POLICY, calm: calm, plain: plain, reply: reply };
})();
