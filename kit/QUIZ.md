# Daily quiz (15:00) — syllabus and format

Syllabus = the owner's coursebooks (Roadmap A1 for Beginner groups, Roadmap A2 for Elementary groups).
Only the lesson topics are listed here; the books themselves are NOT in this repo and must never be copied.
Two tracks alternate by day: odd day of month = Beginner (A1), even day = Elementary (A2).
Each track follows its `current` pointer below (the lesson the groups are on now); quiz that lesson's grammar
and vocabulary, and mix in 1 review question from an earlier lesson. Move the pointer to the next lesson after
two quizzes on the same lesson (edit this file and commit). The owner may change the pointers at any time.

## Beginner track: Roadmap A1        current: 1B
1A be: I / you · countries
1B be: he / she / it · jobs
1C be: you / we / they · nationalities
1D asking for and giving contact information (phone numbers, email, spelling)
2A possessive 's; my/your/his/her/our/their · family
2B this, that, these, those · everyday objects
2C question words with be · numbers 1–100
3A there is / there are; singular and plural nouns · places in town
3B position of adjectives · describing places
3C asking for and giving directions
4A have got / has got (+ and questions) · everyday objects
4B imperatives · common verbs · giving advice
5A present simple I/you/we/they · days of the week, everyday activities
5B present simple questions · travel and transport
5C present simple with adverbs of frequency · food and drink
6A present simple he/she/it · time expressions
6B present simple questions he/she/it · jobs around the house
6C can / can't for ability · skills
6D making requests
7A wh- questions · places
7B was / were, there was / were · months, dates
7C was / were questions · adjectives
7D buying travel tickets
8A past simple regular verbs · verb phrases
8B past simple irregular verbs
8C past simple questions · holiday activities
8D greeting people
9A object pronouns (me, him, her...) · prepositions of place
9B like / enjoy / love / hate + -ing · hobbies
9C why and because · learning a language
9D making and responding to suggestions
10A would like / love to · collocations
10B be going to · party vocabulary
10C be going to questions · seasons, time expressions
10D making and responding to invitations

## Elementary track: Roadmap A2       current: 1C
1A verb be positive and negative · countries and nationalities
1B questions with be · question words
1C this, that, these, those · everyday objects
1D telling the time
2A possessive adjectives and possessive 's · family members
2B whose and possessive pronouns · everyday objects
2C have got · adjectives describing objects
2D buying things in a shop
3A present simple I/you/we/they, adverbs of frequency, time expressions · free-time activities
3B present simple he/she/it · everyday activities, daily routines
3C present simple questions, do/does · free-time activities
3D buying tickets
4A there is / there are · places in a city
4B articles a/an/the · things in a home
4C need + noun, need + to-infinitive · equipment for a trip
4D asking for information
5A position of adjectives · appearance
5B was / were · adjectives to describe experiences
5C can / can't for ability · skills
5D making and responding to requests
6A past simple regular verbs · prepositions
6B past simple irregular verbs
6C past simple questions · verbs + prepositions
6D giving and accepting an apology
7A countable and uncountable nouns; some, any, lots of, a lot of · food and drink
7B how much / how many + quantifiers · food containers
7C comparative adjectives · describing places to eat
7D ordering in a cafe
8A present continuous · geography
8B present simple vs present continuous · weather
8C superlative adjectives · travel
8D making a phone call
9A should / shouldn't · health
9B be going to · future plans
9C would like / want · activities with go
9D making arrangements and invitations
10A verb patterns · housework
10B have to / don't have to · clothes
10C present perfect simple · technology
10D giving a compliment

## Format (queue item steps)
1. `sendMessage` to "@RegistanLC_Academy": 1–3 natural Uzbek lines introducing today's test (level + topic in
   plain words, e.g. "Bugun Elementary: present perfect. 5 ta savol, javob berib ko'ring"). No footer, no hashtags.
2. Five `sendPoll` steps: `type` "quiz", `is_anonymous` true, `question` ≤300 chars, 3–4 `options` each ≤100
   chars, `correct_option_id`, `explanation` in Uzbek ≤200 chars explaining WHY. Questions in English;
   difficulty rises from Q1 to Q5. Mix forms: fill the gap, choose the correct sentence, find the mistake,
   word meaning. Exactly one correct answer, double-check each one. Vary the position of the correct option.
3. Original questions only. If questions are based on the owner's textbooks, never copy exercises or texts
   verbatim; write new sentences that test the same point.

Log one line per quiz to `log/quiz.jsonl`:
`{"date":"YYYY-MM-DD","level":"A1|A2","topic":"...","questions":["first words of each question", ...]}`
