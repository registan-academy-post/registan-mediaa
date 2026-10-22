# Daily quiz (15:00) — syllabus and format

Until the owner's textbooks are added, follow this standard sequence. Two tracks alternate by day:
odd day of month = Beginner (A1), even day = Elementary (A2). Take the next topic of that track that
`log/quiz.jsonl` has not covered yet; when a track is finished, start it again with new questions.

## Beginner (A1)
1. to be (am/is/are)  2. subject pronouns & possessive adjectives  3. a/an, plural nouns
4. this/that/these/those  5. have got  6. present simple (+)  7. present simple (?/-), do/does
8. adverbs of frequency  9. there is / there are  10. can / can't  11. prepositions of place
12. prepositions of time (in/on/at)  13. countable/uncountable, some/any  14. present continuous
15. present simple vs continuous  16. past simple of be (was/were)  17. past simple regular
18. past simple irregular  19. object pronouns  20. vocabulary: family, food, daily routine, house, jobs, weather

## Elementary (A2)
1. past simple review  2. past continuous  3. comparatives  4. superlatives  5. going to
6. will (predictions, offers)  7. present perfect (ever/never)  8. present perfect vs past simple
9. must/have to  10. should  11. much/many/a lot of  12. too/enough  13. -ing vs to-infinitive
14. first conditional  15. adverbs of manner  16. relative clauses (who/which/that)
17. phrasal verbs (basic)  18. vocabulary: travel, health, shopping, school, free time, feelings

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
