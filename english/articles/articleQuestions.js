const articleQuestions = [
  {
    "id": "article-001",
    "sentence": "I have a book.",
    "blankSentence": "I have ___ book.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "a",
    "explanation": "book 是單數可數名詞，第一次提到，且 book 是子音音開頭，所以用 a。",
    "category": "a",
    "usageType": "第一次提到單數可數名詞"
  },
  {
    "id": "article-002",
    "sentence": "He is a teacher.",
    "blankSentence": "He is ___ teacher.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "a",
    "explanation": "teacher 表示一個職業或身分，是單數可數名詞，且 teacher 是子音音開頭，所以用 a。",
    "category": "a",
    "usageType": "職業或身分"
  },
  {
    "id": "article-003",
    "sentence": "She has a cat.",
    "blankSentence": "She has ___ cat.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "a",
    "explanation": "cat 是單數可數名詞，第一次提到，且 cat 是子音音開頭，所以用 a。",
    "category": "a",
    "usageType": "第一次提到單數可數名詞"
  },
  {
    "id": "article-004",
    "sentence": "This is a pencil.",
    "blankSentence": "This is ___ pencil.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "a",
    "explanation": "pencil 是單數可數名詞，第一次提到，且 pencil 是子音音開頭，所以用 a。",
    "category": "a",
    "usageType": "第一次提到單數可數名詞"
  },
  {
    "id": "article-005",
    "sentence": "Tom wants a banana.",
    "blankSentence": "Tom wants ___ banana.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "a",
    "explanation": "banana 是單數可數名詞，表示想要一根香蕉，且 banana 是子音音開頭，所以用 a。",
    "category": "a",
    "usageType": "表示一個、任何一個"
  },
  {
    "id": "article-006",
    "sentence": "We see a bus.",
    "blankSentence": "We see ___ bus.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "a",
    "explanation": "bus 是單數可數名詞，第一次提到，且 bus 是子音音開頭，所以用 a。",
    "category": "a",
    "usageType": "第一次提到單數可數名詞"
  },
  {
    "id": "article-007",
    "sentence": "My brother has a bike.",
    "blankSentence": "My brother has ___ bike.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "a",
    "explanation": "bike 是單數可數名詞，第一次提到，且 bike 是子音音開頭，所以用 a。",
    "category": "a",
    "usageType": "第一次提到單數可數名詞"
  },
  {
    "id": "article-008",
    "sentence": "There is a park near my house.",
    "blankSentence": "There is ___ park near my house.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "a",
    "explanation": "park 是單數可數名詞，第一次介紹某個公園，且 park 是子音音開頭，所以用 a。",
    "category": "a",
    "usageType": "第一次提到單數可數名詞"
  },
  {
    "id": "article-009",
    "sentence": "She is a nurse.",
    "blankSentence": "She is ___ nurse.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "a",
    "explanation": "nurse 表示一個職業或身分，是單數可數名詞，且 nurse 是子音音開頭，所以用 a。",
    "category": "a",
    "usageType": "職業或身分"
  },
  {
    "id": "article-010",
    "sentence": "He wants a pencil.",
    "blankSentence": "He wants ___ pencil.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "a",
    "explanation": "pencil 是單數可數名詞，表示需要一枝鉛筆，且 pencil 是子音音開頭，所以用 a。",
    "category": "a",
    "usageType": "表示一個、任何一個"
  },
  {
    "id": "article-011",
    "sentence": "This is a big bag.",
    "blankSentence": "This is ___ big bag.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "a",
    "explanation": "bag 是單數可數名詞，前面的 big 是子音音開頭，所以用 a。",
    "category": "a",
    "usageType": "第一次提到單數可數名詞"
  },
  {
    "id": "article-012",
    "sentence": "I saw a dog in the park.",
    "blankSentence": "I saw ___ dog in the park.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "a",
    "explanation": "dog 是單數可數名詞，第一次提到，且 dog 是子音音開頭，所以用 a。",
    "category": "a",
    "usageType": "第一次提到單數可數名詞"
  },
  {
    "id": "article-013",
    "sentence": "Mia bought a useful book.",
    "blankSentence": "Mia bought ___ useful book.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "a",
    "explanation": "useful 雖然以母音字母 u 開頭，但發 /ju/ 的子音音，所以用 a useful book。",
    "category": "a",
    "usageType": "母音字母但發音不是母音音，不用 an"
  },
  {
    "id": "article-014",
    "sentence": "He studies at a university.",
    "blankSentence": "He studies at ___ university.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "a",
    "explanation": "university 雖然以母音字母 u 開頭，但發 /ju/ 的子音音，所以不用 an，要用 a。",
    "category": "a",
    "usageType": "母音字母但發音不是母音音，不用 an"
  },
  {
    "id": "article-015",
    "sentence": "She wears a uniform to school.",
    "blankSentence": "She wears ___ uniform to school.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "a",
    "explanation": "uniform 雖然以母音字母 u 開頭，但發 /ju/ 的子音音，所以用 a uniform。",
    "category": "a",
    "usageType": "母音字母但發音不是母音音，不用 an"
  },
  {
    "id": "article-016",
    "sentence": "I need a pencil for the test.",
    "blankSentence": "I need ___ pencil for the test.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "a",
    "explanation": "pencil 是單數可數名詞，表示需要一枝鉛筆，且 pencil 是子音音開頭，所以用 a。",
    "category": "a",
    "usageType": "表示一個、任何一個"
  },
  {
    "id": "article-017",
    "sentence": "My father is a doctor.",
    "blankSentence": "My father is ___ doctor.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "a",
    "explanation": "doctor 表示職業，是單數可數名詞，且 doctor 是子音音開頭，所以用 a。",
    "category": "a",
    "usageType": "職業或身分"
  },
  {
    "id": "article-018",
    "sentence": "There is a small shop on this street.",
    "blankSentence": "There is ___ small shop on this street.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "a",
    "explanation": "shop 是單數可數名詞，第一次提到，前面的 small 是子音音開頭，所以用 a。",
    "category": "a",
    "usageType": "第一次提到單數可數名詞"
  },
  {
    "id": "article-019",
    "sentence": "Can I borrow a pen?",
    "blankSentence": "Can I borrow ___ pen?",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "a",
    "explanation": "pen 是單數可數名詞，表示借一枝筆，且 pen 是子音音開頭，所以用 a。",
    "category": "a",
    "usageType": "表示一個、任何一個"
  },
  {
    "id": "article-020",
    "sentence": "Kevin is a student.",
    "blankSentence": "Kevin is ___ student.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "a",
    "explanation": "student 表示身分，是單數可數名詞，且 student 是子音音開頭，所以用 a。",
    "category": "a",
    "usageType": "職業或身分"
  },
  {
    "id": "article-021",
    "sentence": "She eats an apple.",
    "blankSentence": "She eats ___ apple.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "an",
    "explanation": "apple 是單數可數名詞，第一次提到，且 apple 是母音音開頭，所以用 an。",
    "category": "an",
    "usageType": "母音音開頭的單數可數名詞"
  },
  {
    "id": "article-022",
    "sentence": "This is an egg.",
    "blankSentence": "This is ___ egg.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "an",
    "explanation": "egg 是單數可數名詞，第一次提到，且 egg 是母音音開頭，所以用 an。",
    "category": "an",
    "usageType": "母音音開頭的單數可數名詞"
  },
  {
    "id": "article-023",
    "sentence": "He has an umbrella.",
    "blankSentence": "He has ___ umbrella.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "an",
    "explanation": "umbrella 是單數可數名詞，第一次提到，且 umbrella 是母音音開頭，所以用 an。",
    "category": "an",
    "usageType": "母音音開頭的單數可數名詞"
  },
  {
    "id": "article-024",
    "sentence": "I need an orange marker.",
    "blankSentence": "I need ___ orange marker.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "an",
    "explanation": "eraser 是單數可數名詞，第一次提到，且 eraser 是母音音開頭，所以用 an。",
    "category": "an",
    "usageType": "母音音開頭的單數可數名詞"
  },
  {
    "id": "article-025",
    "sentence": "Amy sees an elephant.",
    "blankSentence": "Amy sees ___ elephant.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "an",
    "explanation": "elephant 是單數可數名詞，第一次提到，且 elephant 是母音音開頭，所以用 an。",
    "category": "an",
    "usageType": "母音音開頭的單數可數名詞"
  },
  {
    "id": "article-026",
    "sentence": "It is an orange.",
    "blankSentence": "It is ___ orange.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "an",
    "explanation": "orange 是單數可數名詞，第一次提到，且 orange 是母音音開頭，所以用 an。",
    "category": "an",
    "usageType": "母音音開頭的單數可數名詞"
  },
  {
    "id": "article-027",
    "sentence": "This is an old house.",
    "blankSentence": "This is ___ old house.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "an",
    "explanation": "old 是母音音開頭，後面接單數可數名詞 house，所以用 an old house。",
    "category": "an",
    "usageType": "母音音開頭的單數可數名詞"
  },
  {
    "id": "article-028",
    "sentence": "He is an honest boy.",
    "blankSentence": "He is ___ honest boy.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "an",
    "explanation": "honest 的 h 不發音，開頭是母音音，所以用 an honest boy。",
    "category": "an",
    "usageType": "母音音開頭但字首不一定是母音字母"
  },
  {
    "id": "article-029",
    "sentence": "She is an honest student.",
    "blankSentence": "She is ___ honest student.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "an",
    "explanation": "honest 的 h 不發音，開頭是母音音，所以用 an honest student。",
    "category": "an",
    "usageType": "母音音開頭但字首不一定是母音字母"
  },
  {
    "id": "article-030",
    "sentence": "We need an umbrella today.",
    "blankSentence": "We need ___ umbrella today.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "an",
    "explanation": "umbrella 是單數可數名詞，第一次提到，且 umbrella 是母音音開頭，所以用 an。",
    "category": "an",
    "usageType": "母音音開頭的單數可數名詞"
  },
  {
    "id": "article-031",
    "sentence": "I saw an ant on the table.",
    "blankSentence": "I saw ___ ant on the table.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "an",
    "explanation": "ant 是單數可數名詞，第一次提到，且 ant 是母音音開頭，所以用 an。",
    "category": "an",
    "usageType": "母音音開頭的單數可數名詞"
  },
  {
    "id": "article-032",
    "sentence": "She has an uncle in Tainan.",
    "blankSentence": "She has ___ uncle in Tainan.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "an",
    "explanation": "idea 是單數可數名詞，第一次提到，且 idea 是母音音開頭，所以用 an。",
    "category": "an",
    "usageType": "母音音開頭的單數可數名詞"
  },
  {
    "id": "article-033",
    "sentence": "It was an easy question.",
    "blankSentence": "It was ___ easy question.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "an",
    "explanation": "easy 是母音音開頭，後面接單數可數名詞 question，所以用 an。",
    "category": "an",
    "usageType": "母音音開頭的單數可數名詞"
  },
  {
    "id": "article-034",
    "sentence": "My uncle is an engineer.",
    "blankSentence": "My uncle is ___ engineer.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "an",
    "explanation": "engineer 是單數可數名詞，表示職業，且 engineer 是母音音開頭，所以用 an。",
    "category": "an",
    "usageType": "母音音開頭的單數可數名詞"
  },
  {
    "id": "article-035",
    "sentence": "We listened to an honest answer.",
    "blankSentence": "We listened to ___ honest answer.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "an",
    "explanation": "hour 的 h 不發音，開頭是母音音，所以用 an hour。",
    "category": "an",
    "usageType": "母音音開頭但字首不一定是母音字母"
  },
  {
    "id": "article-036",
    "sentence": "This is an interesting story.",
    "blankSentence": "This is ___ interesting story.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "an",
    "explanation": "interesting 是母音音開頭，後面接單數可數名詞 story，所以用 an。",
    "category": "an",
    "usageType": "母音音開頭的單數可數名詞"
  },
  {
    "id": "article-037",
    "sentence": "Leo found an empty box.",
    "blankSentence": "Leo found ___ empty box.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "an",
    "explanation": "empty 是母音音開頭，後面接單數可數名詞 box，所以用 an。",
    "category": "an",
    "usageType": "母音音開頭的單數可數名詞"
  },
  {
    "id": "article-038",
    "sentence": "I would like an ice cream.",
    "blankSentence": "I would like ___ ice cream.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "an",
    "explanation": "ice cream 在這裡表示一份冰淇淋，ice 是母音音開頭，所以用 an。",
    "category": "an",
    "usageType": "母音音開頭的單數可數名詞"
  },
  {
    "id": "article-039",
    "sentence": "She gave me an answer.",
    "blankSentence": "She gave me ___ answer.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "an",
    "explanation": "answer 是單數可數名詞，第一次提到，且 answer 是母音音開頭，所以用 an。",
    "category": "an",
    "usageType": "母音音開頭的單數可數名詞"
  },
  {
    "id": "article-040",
    "sentence": "It is an ugly picture.",
    "blankSentence": "It is ___ ugly picture.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "an",
    "explanation": "ugly 是母音音開頭，後面接單數可數名詞 picture，所以用 an。",
    "category": "an",
    "usageType": "母音音開頭的單數可數名詞"
  },
  {
    "id": "article-041",
    "sentence": "The sun is hot.",
    "blankSentence": "___ sun is hot.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "the",
    "explanation": "sun 是世界上獨一無二、大家都知道的事物，所以用 the sun。",
    "category": "the",
    "usageType": "世界上獨一無二的事物"
  },
  {
    "id": "article-042",
    "sentence": "Please open the door.",
    "blankSentence": "Please open ___ door.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "the",
    "explanation": "說話者和聽話者知道是哪一扇門，所以 door 是特定對象，要用 the。",
    "category": "the",
    "usageType": "特定對象"
  },
  {
    "id": "article-043",
    "sentence": "The moon is bright.",
    "blankSentence": "___ moon is bright.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "the",
    "explanation": "moon 是大家都知道的獨一無二事物，所以用 the moon。",
    "category": "the",
    "usageType": "世界上獨一無二的事物"
  },
  {
    "id": "article-044",
    "sentence": "I see a dog. The dog is black.",
    "blankSentence": "I see a dog. ___ dog is black.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "the",
    "explanation": "前一句已經提到 a dog，第二次提到同一隻狗時要用 the。",
    "category": "the",
    "usageType": "第二次提到"
  },
  {
    "id": "article-045",
    "sentence": "The boy is my brother.",
    "blankSentence": "___ boy is my brother.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "the",
    "explanation": "這裡指說話者心中明確的那個男孩，是特定對象，所以用 the。",
    "category": "the",
    "usageType": "特定對象"
  },
  {
    "id": "article-046",
    "sentence": "The water in this cup is cold.",
    "blankSentence": "___ water in this cup is cold.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "the",
    "explanation": "in this cup 說明是哪一杯水，是特定的水，所以用 the。",
    "category": "the",
    "usageType": "特定對象"
  },
  {
    "id": "article-047",
    "sentence": "Close the window, please.",
    "blankSentence": "Close ___ window, please.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "the",
    "explanation": "說話時通常知道要關哪一扇窗戶，所以 window 是特定對象，要用 the。",
    "category": "the",
    "usageType": "特定對象"
  },
  {
    "id": "article-048",
    "sentence": "The teacher is in the classroom.",
    "blankSentence": "The teacher is in ___ classroom.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "the",
    "explanation": "已經知道老師所在的那間教室，classroom 是上下文中的特定地點，所以用 the。",
    "category": "the",
    "usageType": "上下文已知道的事物"
  },
  {
    "id": "article-049",
    "sentence": "Please close the window.",
    "blankSentence": "Please close ___ window.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "the",
    "explanation": "說話者和聽話者知道是哪一扇窗戶，所以 window 是特定對象，要用 the。",
    "category": "the",
    "usageType": "特定對象"
  },
  {
    "id": "article-050",
    "sentence": "I saw a cat. The cat was white.",
    "blankSentence": "I saw a cat. ___ cat was white.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "the",
    "explanation": "前一句已經提到 a cat，第二次提到同一隻貓時要用 the。",
    "category": "the",
    "usageType": "第二次提到"
  },
  {
    "id": "article-051",
    "sentence": "The moon is beautiful tonight.",
    "blankSentence": "___ moon is beautiful tonight.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "the",
    "explanation": "moon 是獨一無二且大家知道的事物，所以用 the moon。",
    "category": "the",
    "usageType": "世界上獨一無二的事物"
  },
  {
    "id": "article-052",
    "sentence": "Put the book on the table.",
    "blankSentence": "Put the book on ___ table.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "the",
    "explanation": "放書的桌子是當下情境中已知道的桌子，所以用 the。",
    "category": "the",
    "usageType": "上下文已知道的事物"
  },
  {
    "id": "article-053",
    "sentence": "Where is the key?",
    "blankSentence": "Where is ___ key?",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "the",
    "explanation": "說話者在問雙方都知道或正在找的那把鑰匙，所以 key 是特定的，用 the。",
    "category": "the",
    "usageType": "上下文已知道的事物"
  },
  {
    "id": "article-054",
    "sentence": "The world is very large.",
    "blankSentence": "___ world is very large.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "the",
    "explanation": "earth 是我們所處的獨一無二星球，所以用 the earth。",
    "category": "the",
    "usageType": "世界上獨一無二的事物"
  },
  {
    "id": "article-055",
    "sentence": "I bought a book. The book is about birds.",
    "blankSentence": "I bought a book. ___ book is about birds.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "the",
    "explanation": "前一句已經提到 a book，第二次提到同一本書時要用 the。",
    "category": "the",
    "usageType": "第二次提到"
  },
  {
    "id": "article-056",
    "sentence": "Turn off the light, please.",
    "blankSentence": "Turn off ___ light, please.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "the",
    "explanation": "房間裡要關的燈是當下明確的特定對象，所以用 the。",
    "category": "the",
    "usageType": "特定對象"
  },
  {
    "id": "article-057",
    "sentence": "The principal is talking to us.",
    "blankSentence": "___ principal is talking to us.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "the",
    "explanation": "這裡指學校裡大家知道的那位校長，所以用 the。",
    "category": "the",
    "usageType": "上下文已知道的事物"
  },
  {
    "id": "article-058",
    "sentence": "I found a wallet. The wallet was under the chair.",
    "blankSentence": "I found a wallet. ___ wallet was under the chair.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "the",
    "explanation": "前一句已經提到 a wallet，第二次提到同一個錢包時要用 the。",
    "category": "the",
    "usageType": "第二次提到"
  },
  {
    "id": "article-059",
    "sentence": "Look at the picture on the wall.",
    "blankSentence": "Look at ___ picture on the wall.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "the",
    "explanation": "on the wall 說明是哪一張圖片，是特定對象，所以用 the。",
    "category": "the",
    "usageType": "特定對象"
  },
  {
    "id": "article-060",
    "sentence": "The classroom is quiet now.",
    "blankSentence": "___ classroom is quiet now.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "the",
    "explanation": "這裡指雙方已知道的那間教室，所以 classroom 是特定的，用 the。",
    "category": "the",
    "usageType": "上下文已知道的事物"
  },
  {
    "id": "article-061",
    "sentence": "I like music.",
    "blankSentence": "I like ___ music.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "不填",
    "explanation": "music 是不可數名詞，表示泛指音樂時，不用冠詞。",
    "category": "不填",
    "usageType": "泛指不可數名詞"
  },
  {
    "id": "article-062",
    "sentence": "Dogs are friendly.",
    "blankSentence": "___ Dogs are friendly.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "不填",
    "explanation": "Dogs 是複數名詞，泛指狗這種動物時，不用冠詞。",
    "category": "不填",
    "usageType": "泛指複數名詞"
  },
  {
    "id": "article-063",
    "sentence": "Our class plays volleyball after school.",
    "blankSentence": "Our class plays ___ volleyball after school.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "不填",
    "explanation": "baseball 是球類運動名稱，前面通常不用冠詞。",
    "category": "不填",
    "usageType": "運動名稱"
  },
  {
    "id": "article-064",
    "sentence": "She drinks milk every morning.",
    "blankSentence": "She drinks ___ milk every morning.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "不填",
    "explanation": "milk 是不可數名詞，表示泛指牛奶時，不用冠詞。",
    "category": "不填",
    "usageType": "泛指不可數名詞"
  },
  {
    "id": "article-065",
    "sentence": "Cats like fish.",
    "blankSentence": "___ Cats like fish.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "不填",
    "explanation": "Cats 是複數名詞，泛指貓這種動物時，不用冠詞。",
    "category": "不填",
    "usageType": "泛指複數名詞"
  },
  {
    "id": "article-066",
    "sentence": "I eat rice for lunch.",
    "blankSentence": "I eat ___ rice for lunch.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "不填",
    "explanation": "rice 是不可數名詞，表示泛指米飯時，不用冠詞。",
    "category": "不填",
    "usageType": "泛指不可數名詞"
  },
  {
    "id": "article-067",
    "sentence": "Children need water.",
    "blankSentence": "Children need ___ water.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "不填",
    "explanation": "water 是不可數名詞，表示泛指水時，不用冠詞。",
    "category": "不填",
    "usageType": "泛指不可數名詞"
  },
  {
    "id": "article-068",
    "sentence": "We play tennis on Sundays.",
    "blankSentence": "We play ___ tennis on Sundays.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "不填",
    "explanation": "tennis 是運動名稱，前面通常不用冠詞。",
    "category": "不填",
    "usageType": "運動名稱"
  },
  {
    "id": "article-069",
    "sentence": "She studies English every day.",
    "blankSentence": "She studies ___ English every day.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "不填",
    "explanation": "English 是語言名稱，表示學英文時不用冠詞。",
    "category": "不填",
    "usageType": "語言／科目"
  },
  {
    "id": "article-070",
    "sentence": "They eat lunch at school.",
    "blankSentence": "They eat ___ lunch at school.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "不填",
    "explanation": "lunch 是餐點名稱，表示吃午餐時通常不用冠詞。",
    "category": "不填",
    "usageType": "餐點名稱"
  },
  {
    "id": "article-071",
    "sentence": "Birds can fly.",
    "blankSentence": "___ Birds can fly.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "不填",
    "explanation": "Birds 是複數名詞，泛指鳥類時，不用冠詞。",
    "category": "不填",
    "usageType": "泛指複數名詞"
  },
  {
    "id": "article-072",
    "sentence": "I usually eat lunch at noon.",
    "blankSentence": "I usually eat ___ lunch at noon.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "不填",
    "explanation": "breakfast 是餐點名稱，表示吃早餐時通常不用冠詞。",
    "category": "不填",
    "usageType": "餐點名稱"
  },
  {
    "id": "article-073",
    "sentence": "My sister studies math.",
    "blankSentence": "My sister studies ___ math.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "不填",
    "explanation": "math 是科目名稱，表示學數學時不用冠詞。",
    "category": "不填",
    "usageType": "語言／科目"
  },
  {
    "id": "article-074",
    "sentence": "They play basketball after class.",
    "blankSentence": "They play ___ basketball after class.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "不填",
    "explanation": "basketball 是球類運動名稱，前面通常不用冠詞。",
    "category": "不填",
    "usageType": "運動名稱"
  },
  {
    "id": "article-075",
    "sentence": "Teachers help students.",
    "blankSentence": "___ Teachers help students.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "不填",
    "explanation": "Students 是複數名詞，泛指學生時，不用冠詞。",
    "category": "不填",
    "usageType": "泛指複數名詞"
  },
  {
    "id": "article-076",
    "sentence": "She likes art.",
    "blankSentence": "She likes ___ art.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "不填",
    "explanation": "art 可作科目或泛指藝術，這裡表示一般喜歡藝術，不用冠詞。",
    "category": "不填",
    "usageType": "語言／科目"
  },
  {
    "id": "article-077",
    "sentence": "We have dinner at home.",
    "blankSentence": "We have ___ dinner at home.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "不填",
    "explanation": "dinner 是餐點名稱，表示吃晚餐時通常不用冠詞。",
    "category": "不填",
    "usageType": "餐點名稱"
  },
  {
    "id": "article-078",
    "sentence": "Many people enjoy soccer.",
    "blankSentence": "Many people enjoy ___ soccer.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "不填",
    "explanation": "soccer 是運動名稱，表示泛指足球時不用冠詞。",
    "category": "不填",
    "usageType": "運動名稱"
  },
  {
    "id": "article-079",
    "sentence": "Books are useful.",
    "blankSentence": "___ Books are useful.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "不填",
    "explanation": "Books 是複數名詞，泛指書本時，不用冠詞。",
    "category": "不填",
    "usageType": "泛指複數名詞"
  },
  {
    "id": "article-080",
    "sentence": "I like tea.",
    "blankSentence": "I like ___ tea.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "不填",
    "explanation": "tea 是不可數名詞，表示泛指茶時，不用冠詞。",
    "category": "不填",
    "usageType": "泛指不可數名詞"
  },
  {
    "id": "article-081",
    "sentence": "Lisa found a coin on the floor.",
    "blankSentence": "Lisa found ___ coin on the floor.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "a",
    "explanation": "coin 是第一次提到的單數可數名詞，且 coin 是子音音開頭，所以用 a。",
    "category": "a",
    "usageType": "第一次提到單數可數名詞"
  },
  {
    "id": "article-082",
    "sentence": "We need a table for the party.",
    "blankSentence": "We need ___ table for the party.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "a",
    "explanation": "table 是單數可數名詞，表示需要一張桌子，且 table 是子音音開頭，所以用 a。",
    "category": "a",
    "usageType": "表示一個、任何一個"
  },
  {
    "id": "article-083",
    "sentence": "Kevin drew a small fish.",
    "blankSentence": "Kevin drew ___ small fish.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "a",
    "explanation": "small fish 是第一次提到的單數可數名詞，small 是子音音開頭，所以用 a。",
    "category": "a",
    "usageType": "形容詞 + 單數可數名詞"
  },
  {
    "id": "article-084",
    "sentence": "My aunt is a farmer.",
    "blankSentence": "My aunt is ___ farmer.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "a",
    "explanation": "farmer 表示職業，是單數可數名詞，且 farmer 是子音音開頭，所以用 a。",
    "category": "a",
    "usageType": "職業或身分"
  },
  {
    "id": "article-085",
    "sentence": "She wants to be a police officer.",
    "blankSentence": "She wants to be ___ police officer.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "a",
    "explanation": "police officer 表示職業身分，police 是子音音開頭，所以用 a。",
    "category": "a",
    "usageType": "職業或身分"
  },
  {
    "id": "article-086",
    "sentence": "Ben bought a red kite.",
    "blankSentence": "Ben bought ___ red kite.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "a",
    "explanation": "red kite 是第一次提到的單數可數名詞，red 是子音音開頭，所以用 a。",
    "category": "a",
    "usageType": "形容詞 + 單數可數名詞"
  },
  {
    "id": "article-087",
    "sentence": "There is a flower on the desk.",
    "blankSentence": "There is ___ flower on the desk.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "a",
    "explanation": "flower 是第一次提到的單數可數名詞，且 flower 是子音音開頭，所以用 a。",
    "category": "a",
    "usageType": "第一次提到單數可數名詞"
  },
  {
    "id": "article-088",
    "sentence": "I need a new notebook.",
    "blankSentence": "I need ___ new notebook.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "a",
    "explanation": "new notebook 是單數可數名詞，new 是子音音開頭，所以用 a。",
    "category": "a",
    "usageType": "形容詞 + 單數可數名詞"
  },
  {
    "id": "article-089",
    "sentence": "Dad gave me a cup.",
    "blankSentence": "Dad gave me ___ cup.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "a",
    "explanation": "cup 是第一次提到的單數可數名詞，且 cup 是子音音開頭，所以用 a。",
    "category": "a",
    "usageType": "第一次提到單數可數名詞"
  },
  {
    "id": "article-090",
    "sentence": "Can I have a ticket?",
    "blankSentence": "Can I have ___ ticket?",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "a",
    "explanation": "ticket 是單數可數名詞，表示任何一張票，且 ticket 是子音音開頭，所以用 a。",
    "category": "a",
    "usageType": "表示一個、任何一個"
  },
  {
    "id": "article-091",
    "sentence": "He is a good student.",
    "blankSentence": "He is ___ good student.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "a",
    "explanation": "good student 表示一個學生，good 是子音音開頭，所以用 a。",
    "category": "a",
    "usageType": "形容詞 + 單數可數名詞"
  },
  {
    "id": "article-092",
    "sentence": "The baby has a toy car.",
    "blankSentence": "The baby has ___ toy car.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "a",
    "explanation": "toy car 是單數可數名詞，toy 是子音音開頭，所以用 a。",
    "category": "a",
    "usageType": "第一次提到單數可數名詞"
  },
  {
    "id": "article-093",
    "sentence": "We visit a museum every month.",
    "blankSentence": "We visit ___ museum every month.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "a",
    "explanation": "museum 是單數可數名詞，且 museum 是子音音開頭，所以用 a。",
    "category": "a",
    "usageType": "子音音開頭"
  },
  {
    "id": "article-094",
    "sentence": "Mark is a bus driver.",
    "blankSentence": "Mark is ___ bus driver.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "a",
    "explanation": "bus driver 表示職業，是單數可數名詞，且 bus 是子音音開頭，所以用 a。",
    "category": "a",
    "usageType": "職業或身分"
  },
  {
    "id": "article-095",
    "sentence": "I want a sandwich for lunch.",
    "blankSentence": "I want ___ sandwich for lunch.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "a",
    "explanation": "sandwich 是單數可數名詞，表示想要一個三明治，且 sandwich 是子音音開頭，所以用 a。",
    "category": "a",
    "usageType": "表示一個、任何一個"
  },
  {
    "id": "article-096",
    "sentence": "She keeps a diary.",
    "blankSentence": "She keeps ___ diary.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "a",
    "explanation": "diary 是單數可數名詞，第一次提到，且 diary 是子音音開頭，所以用 a。",
    "category": "a",
    "usageType": "第一次提到單數可數名詞"
  },
  {
    "id": "article-097",
    "sentence": "Ryan has a useful map.",
    "blankSentence": "Ryan has ___ useful map.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "a",
    "explanation": "useful 的 u 發 /juː/，是子音音開頭，所以用 a useful map。",
    "category": "a",
    "usageType": "特殊發音：u 發 /juː/"
  },
  {
    "id": "article-098",
    "sentence": "Jenny studies in a university in Taipei.",
    "blankSentence": "Jenny studies in ___ university in Taipei.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "a",
    "explanation": "university 的 u 發 /juː/，是子音音開頭，所以用 a。",
    "category": "a",
    "usageType": "特殊發音：u 發 /juː/"
  },
  {
    "id": "article-099",
    "sentence": "This is a used bike.",
    "blankSentence": "This is ___ used bike.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "a",
    "explanation": "used 在 used bike 中發 /juːzd/，是子音音開頭，所以用 a。",
    "category": "a",
    "usageType": "特殊發音：u 發 /juː/"
  },
  {
    "id": "article-100",
    "sentence": "He wears a yellow jacket.",
    "blankSentence": "He wears ___ yellow jacket.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "a",
    "explanation": "yellow jacket 是單數可數名詞，yellow 是子音音開頭，所以用 a。",
    "category": "a",
    "usageType": "子音音開頭"
  },
  {
    "id": "article-101",
    "sentence": "I practice piano once a day.",
    "blankSentence": "I practice piano once ___ day.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "a",
    "explanation": "once a day 表示頻率，意思是一天一次，所以用 a。",
    "category": "a",
    "usageType": "單位或頻率"
  },
  {
    "id": "article-102",
    "sentence": "We have English twice a week.",
    "blankSentence": "We have English twice ___ week.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "a",
    "explanation": "twice a week 表示頻率，意思是一週兩次，所以用 a。",
    "category": "a",
    "usageType": "單位或頻率"
  },
  {
    "id": "article-103",
    "sentence": "She drinks a glass of milk every morning.",
    "blankSentence": "She drinks ___ glass of milk every morning.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "a",
    "explanation": "glass 是單數可數名詞，表示一杯，且 glass 是子音音開頭，所以用 a。",
    "category": "a",
    "usageType": "單位或頻率"
  },
  {
    "id": "article-104",
    "sentence": "Tom runs a mile after school.",
    "blankSentence": "Tom runs ___ mile after school.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "a",
    "explanation": "mile 是單數可數名詞，表示一英里，且 mile 是子音音開頭，所以用 a。",
    "category": "a",
    "usageType": "單位或頻率"
  },
  {
    "id": "article-105",
    "sentence": "Please bring a ruler to class.",
    "blankSentence": "Please bring ___ ruler to class.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "a",
    "explanation": "ruler 是單數可數名詞，表示任何一把尺，且 ruler 是子音音開頭，所以用 a。",
    "category": "a",
    "usageType": "表示一個、任何一個"
  },
  {
    "id": "article-106",
    "sentence": "Nina is a singer in the school band.",
    "blankSentence": "Nina is ___ singer in the school band.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "a",
    "explanation": "singer 表示身分，是單數可數名詞，且 singer 是子音音開頭，所以用 a。",
    "category": "a",
    "usageType": "職業或身分"
  },
  {
    "id": "article-107",
    "sentence": "There is a quiet street behind the school.",
    "blankSentence": "There is ___ quiet street behind the school.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "a",
    "explanation": "quiet street 是第一次提到的單數可數名詞，quiet 是子音音開頭，所以用 a。",
    "category": "a",
    "usageType": "形容詞 + 單數可數名詞"
  },
  {
    "id": "article-108",
    "sentence": "Mom bought a white shirt.",
    "blankSentence": "Mom bought ___ white shirt.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "a",
    "explanation": "white shirt 是單數可數名詞，white 是子音音開頭，所以用 a。",
    "category": "a",
    "usageType": "形容詞 + 單數可數名詞"
  },
  {
    "id": "article-109",
    "sentence": "I saw a bird near the window.",
    "blankSentence": "I saw ___ bird near the window.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "a",
    "explanation": "bird 是第一次提到的單數可數名詞，且 bird 是子音音開頭，所以用 a。",
    "category": "a",
    "usageType": "第一次提到單數可數名詞"
  },
  {
    "id": "article-110",
    "sentence": "He needs a clean towel.",
    "blankSentence": "He needs ___ clean towel.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "a",
    "explanation": "clean towel 是單數可數名詞，clean 是子音音開頭，所以用 a。",
    "category": "a",
    "usageType": "形容詞 + 單數可數名詞"
  },
  {
    "id": "article-111",
    "sentence": "Amy ate an apple after school.",
    "blankSentence": "Amy ate ___ apple after school.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "an",
    "explanation": "apple 是單數可數名詞，且 apple 是母音音開頭，所以用 an。",
    "category": "an",
    "usageType": "母音音開頭"
  },
  {
    "id": "article-112",
    "sentence": "He opened an umbrella in the rain.",
    "blankSentence": "He opened ___ umbrella in the rain.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "an",
    "explanation": "umbrella 是單數可數名詞，且 umbrella 是母音音開頭，所以用 an。",
    "category": "an",
    "usageType": "母音音開頭"
  },
  {
    "id": "article-113",
    "sentence": "There is an elephant in the picture.",
    "blankSentence": "There is ___ elephant in the picture.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "an",
    "explanation": "elephant 是第一次提到的單數可數名詞，且 elephant 是母音音開頭，所以用 an。",
    "category": "an",
    "usageType": "母音音開頭"
  },
  {
    "id": "article-114",
    "sentence": "She is an English teacher.",
    "blankSentence": "She is ___ English teacher.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "an",
    "explanation": "English teacher 表示職業身分，English 是母音音開頭，所以用 an。",
    "category": "an",
    "usageType": "職業或身分且母音音開頭"
  },
  {
    "id": "article-115",
    "sentence": "My brother wants to be an actor.",
    "blankSentence": "My brother wants to be ___ actor.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "an",
    "explanation": "actor 表示職業，是單數可數名詞，且 actor 是母音音開頭，所以用 an。",
    "category": "an",
    "usageType": "職業或身分且母音音開頭"
  },
  {
    "id": "article-116",
    "sentence": "Lisa is an artist.",
    "blankSentence": "Lisa is ___ artist.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "an",
    "explanation": "artist 表示身分，是單數可數名詞，且 artist 是母音音開頭，所以用 an。",
    "category": "an",
    "usageType": "職業或身分且母音音開頭"
  },
  {
    "id": "article-117",
    "sentence": "We saw an old house near the river.",
    "blankSentence": "We saw ___ old house near the river.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "an",
    "explanation": "old house 是第一次提到的單數可數名詞，old 是母音音開頭，所以用 an。",
    "category": "an",
    "usageType": "形容詞 + 母音音開頭名詞"
  },
  {
    "id": "article-118",
    "sentence": "He bought an orange bag.",
    "blankSentence": "He bought ___ orange bag.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "an",
    "explanation": "orange bag 是單數可數名詞，orange 是母音音開頭，所以用 an。",
    "category": "an",
    "usageType": "形容詞 + 母音音開頭名詞"
  },
  {
    "id": "article-119",
    "sentence": "This is an easy question.",
    "blankSentence": "This is ___ easy question.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "an",
    "explanation": "easy question 是單數可數名詞，easy 是母音音開頭，所以用 an。",
    "category": "an",
    "usageType": "形容詞 + 母音音開頭名詞"
  },
  {
    "id": "article-120",
    "sentence": "I need an eraser.",
    "blankSentence": "I need ___ eraser.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "an",
    "explanation": "orange marker 是單數可數名詞，表示任何一枝橘色麥克筆，且 orange 是母音音開頭，所以用 an。",
    "category": "an",
    "usageType": "一個／任何一個，母音音開頭"
  },
  {
    "id": "article-121",
    "sentence": "Can you give me an envelope?",
    "blankSentence": "Can you give me ___ envelope?",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "an",
    "explanation": "envelope 是單數可數名詞，表示任何一個信封，且 envelope 是母音音開頭，所以用 an。",
    "category": "an",
    "usageType": "一個／任何一個，母音音開頭"
  },
  {
    "id": "article-122",
    "sentence": "She has an idea.",
    "blankSentence": "She has ___ idea.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "an",
    "explanation": "uncle 是單數可數名詞，且 uncle 是母音音開頭，所以用 an。",
    "category": "an",
    "usageType": "母音音開頭"
  },
  {
    "id": "article-123",
    "sentence": "Tom found an egg in the box.",
    "blankSentence": "Tom found ___ egg in the box.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "an",
    "explanation": "egg 是第一次提到的單數可數名詞，且 egg 是母音音開頭，所以用 an。",
    "category": "an",
    "usageType": "母音音開頭"
  },
  {
    "id": "article-124",
    "sentence": "It is an interesting story.",
    "blankSentence": "It is ___ interesting story.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "an",
    "explanation": "interesting story 是單數可數名詞，interesting 是母音音開頭，所以用 an。",
    "category": "an",
    "usageType": "形容詞 + 母音音開頭名詞"
  },
  {
    "id": "article-125",
    "sentence": "Mr. Lin is an engineer.",
    "blankSentence": "Mr. Lin is ___ engineer.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "an",
    "explanation": "engineer 表示職業，是單數可數名詞，且 engineer 是母音音開頭，所以用 an。",
    "category": "an",
    "usageType": "職業或身分且母音音開頭"
  },
  {
    "id": "article-126",
    "sentence": "She met an honest boy.",
    "blankSentence": "She met ___ honest boy.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "an",
    "explanation": "honest 的 h 不發音，開頭是母音音，所以用 an。",
    "category": "an",
    "usageType": "特殊發音：h 不發音"
  },
  {
    "id": "article-127",
    "sentence": "We waited for an hour.",
    "blankSentence": "We waited for ___ hour.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "an",
    "explanation": "honest 的 h 不發音，開頭是母音音，所以用 an。",
    "category": "an",
    "usageType": "特殊發音：h 不發音"
  },
  {
    "id": "article-128",
    "sentence": "He is an honor student.",
    "blankSentence": "He is ___ honor student.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "an",
    "explanation": "honor 的 h 不發音，開頭是母音音，所以用 an。",
    "category": "an",
    "usageType": "特殊發音：h 不發音"
  },
  {
    "id": "article-129",
    "sentence": "May I ask an important question?",
    "blankSentence": "May I ask ___ important question?",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "an",
    "explanation": "important question 是單數可數名詞，important 是母音音開頭，所以用 an。",
    "category": "an",
    "usageType": "形容詞 + 母音音開頭名詞"
  },
  {
    "id": "article-130",
    "sentence": "The child wants an ice cream.",
    "blankSentence": "The child wants ___ ice cream.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "an",
    "explanation": "ice cream 在這裡表示一份冰淇淋，ice 是母音音開頭，所以用 an。",
    "category": "an",
    "usageType": "一個／任何一個，母音音開頭"
  },
  {
    "id": "article-131",
    "sentence": "We need an oven for the cake.",
    "blankSentence": "We need ___ oven for the cake.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "an",
    "explanation": "oven 是單數可數名詞，且 oven 是母音音開頭，所以用 an。",
    "category": "an",
    "usageType": "母音音開頭"
  },
  {
    "id": "article-132",
    "sentence": "Dora has an aunt in Japan.",
    "blankSentence": "Dora has ___ aunt in Japan.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "an",
    "explanation": "aunt 是單數可數名詞，且 aunt 是母音音開頭，所以用 an。",
    "category": "an",
    "usageType": "母音音開頭"
  },
  {
    "id": "article-133",
    "sentence": "I saw an ant on the wall.",
    "blankSentence": "I saw ___ ant on the wall.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "an",
    "explanation": "ant 是第一次提到的單數可數名詞，且 ant 是母音音開頭，所以用 an。",
    "category": "an",
    "usageType": "母音音開頭"
  },
  {
    "id": "article-134",
    "sentence": "She is an office worker.",
    "blankSentence": "She is ___ office worker.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "an",
    "explanation": "office worker 表示職業身分，office 是母音音開頭，所以用 an。",
    "category": "an",
    "usageType": "職業或身分且母音音開頭"
  },
  {
    "id": "article-135",
    "sentence": "This is an ugly doll.",
    "blankSentence": "This is ___ ugly doll.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "an",
    "explanation": "ugly doll 是單數可數名詞，ugly 是母音音開頭，所以用 an。",
    "category": "an",
    "usageType": "形容詞 + 母音音開頭名詞"
  },
  {
    "id": "article-136",
    "sentence": "I heard an animal outside.",
    "blankSentence": "I heard ___ animal outside.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "an",
    "explanation": "animal 是第一次提到的單數可數名詞，且 animal 是母音音開頭，所以用 an。",
    "category": "an",
    "usageType": "母音音開頭"
  },
  {
    "id": "article-137",
    "sentence": "Peter needs an extra pen.",
    "blankSentence": "Peter needs ___ extra pen.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "an",
    "explanation": "extra pen 是單數可數名詞，extra 是母音音開頭，所以用 an。",
    "category": "an",
    "usageType": "形容詞 + 母音音開頭名詞"
  },
  {
    "id": "article-138",
    "sentence": "She picked an orange from the tree.",
    "blankSentence": "She picked ___ orange from the tree.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "an",
    "explanation": "orange 是單數可數名詞，且 orange 是母音音開頭，所以用 an。",
    "category": "an",
    "usageType": "母音音開頭"
  },
  {
    "id": "article-139",
    "sentence": "The team made an excellent plan.",
    "blankSentence": "The team made ___ excellent plan.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "an",
    "explanation": "excellent plan 是單數可數名詞，excellent 是母音音開頭，所以用 an。",
    "category": "an",
    "usageType": "形容詞 + 母音音開頭名詞"
  },
  {
    "id": "article-140",
    "sentence": "He put an empty bottle in the bag.",
    "blankSentence": "He put ___ empty bottle in the bag.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "an",
    "explanation": "empty bottle 是單數可數名詞，empty 是母音音開頭，所以用 an。",
    "category": "an",
    "usageType": "形容詞 + 母音音開頭名詞"
  },
  {
    "id": "article-141",
    "sentence": "I bought a pen. The pen writes well.",
    "blankSentence": "I bought a pen. ___ pen writes well.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "the",
    "explanation": "前一句已經提到 pen，第二次提到同一枝筆時要用 the。",
    "category": "the",
    "usageType": "第二次提到"
  },
  {
    "id": "article-142",
    "sentence": "She found a key. The key was under the chair.",
    "blankSentence": "She found a key. ___ key was under the chair.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "the",
    "explanation": "前一句已經提到 key，第二次提到同一把鑰匙時要用 the。",
    "category": "the",
    "usageType": "第二次提到"
  },
  {
    "id": "article-143",
    "sentence": "We saw a movie. The movie was funny.",
    "blankSentence": "We saw a movie. ___ movie was funny.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "the",
    "explanation": "前一句已經提到 movie，第二次提到同一部電影時要用 the。",
    "category": "the",
    "usageType": "第二次提到"
  },
  {
    "id": "article-144",
    "sentence": "Tom has a bike. The bike is blue.",
    "blankSentence": "Tom has a bike. ___ bike is blue.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "the",
    "explanation": "前一句已經提到 bike，第二次提到同一台腳踏車時要用 the。",
    "category": "the",
    "usageType": "第二次提到"
  },
  {
    "id": "article-145",
    "sentence": "I met a girl. The girl was very kind.",
    "blankSentence": "I met a girl. ___ girl was very kind.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "the",
    "explanation": "前一句已經提到 girl，第二次提到同一個女孩時要用 the。",
    "category": "the",
    "usageType": "第二次提到"
  },
  {
    "id": "article-146",
    "sentence": "Please close the door of the classroom.",
    "blankSentence": "Please close ___ door of the classroom.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "the",
    "explanation": "door 由 of the classroom 說明是教室的門，是特定對象，所以用 the。",
    "category": "the",
    "usageType": "特定對象"
  },
  {
    "id": "article-147",
    "sentence": "The teacher is writing on the board.",
    "blankSentence": "The teacher is writing on ___ board.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "the",
    "explanation": "在教室情境中，board 是大家知道的特定黑板，所以用 the。",
    "category": "the",
    "usageType": "上下文已知道"
  },
  {
    "id": "article-148",
    "sentence": "Mom is cooking in the kitchen.",
    "blankSentence": "Mom is cooking in ___ kitchen.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "the",
    "explanation": "家中的 kitchen 是上下文中已知道的特定地點，所以用 the。",
    "category": "the",
    "usageType": "特定地點或物品"
  },
  {
    "id": "article-149",
    "sentence": "Put the cups on the table.",
    "blankSentence": "Put the cups on ___ table.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "the",
    "explanation": "table 是說話者和聽者都知道的特定桌子，所以用 the。",
    "category": "the",
    "usageType": "上下文已知道"
  },
  {
    "id": "article-150",
    "sentence": "The sun rises in the east.",
    "blankSentence": "___ sun rises in the east.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "the",
    "explanation": "sun 是世界上獨一無二的事物，所以用 the。",
    "category": "the",
    "usageType": "世界上獨一無二"
  },
  {
    "id": "article-151",
    "sentence": "We can see the moon tonight.",
    "blankSentence": "We can see ___ moon tonight.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "the",
    "explanation": "moon 是世界上獨一無二的事物，所以用 the。",
    "category": "the",
    "usageType": "世界上獨一無二"
  },
  {
    "id": "article-152",
    "sentence": "The earth goes around the sun.",
    "blankSentence": "___ earth goes around the sun.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "the",
    "explanation": "world 指我們所生活的世界，通常視為獨一無二的事物，所以用 the。",
    "category": "the",
    "usageType": "世界上獨一無二"
  },
  {
    "id": "article-153",
    "sentence": "Today is the first day of school.",
    "blankSentence": "Today is ___ first day of school.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "the",
    "explanation": "first 是序數，序數前通常使用 the。",
    "category": "the",
    "usageType": "序數"
  },
  {
    "id": "article-154",
    "sentence": "This is the second lesson.",
    "blankSentence": "This is ___ second lesson.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "the",
    "explanation": "second 是序數，序數前通常使用 the。",
    "category": "the",
    "usageType": "序數"
  },
  {
    "id": "article-155",
    "sentence": "Amy is the third student in line.",
    "blankSentence": "Amy is ___ third student in line.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "the",
    "explanation": "third 是序數，表示第幾個時前面通常用 the。",
    "category": "the",
    "usageType": "序數"
  },
  {
    "id": "article-156",
    "sentence": "He is the tallest boy in our class.",
    "blankSentence": "He is ___ tallest boy in our class.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "the",
    "explanation": "tallest 是最高級，最高級前通常使用 the。",
    "category": "the",
    "usageType": "最高級"
  },
  {
    "id": "article-157",
    "sentence": "This is the biggest room in the house.",
    "blankSentence": "This is ___ biggest room in the house.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "the",
    "explanation": "biggest 是最高級，最高級前通常使用 the。",
    "category": "the",
    "usageType": "最高級"
  },
  {
    "id": "article-158",
    "sentence": "She is the best singer in the club.",
    "blankSentence": "She is ___ best singer in the club.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "the",
    "explanation": "best 是最高級，最高級前通常使用 the。",
    "category": "the",
    "usageType": "最高級"
  },
  {
    "id": "article-159",
    "sentence": "Ken plays the piano after dinner.",
    "blankSentence": "Ken plays ___ piano after dinner.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "the",
    "explanation": "piano 是樂器名稱，表示演奏樂器時通常用 the。",
    "category": "the",
    "usageType": "樂器"
  },
  {
    "id": "article-160",
    "sentence": "My sister plays the violin.",
    "blankSentence": "My sister plays ___ violin.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "the",
    "explanation": "violin 是樂器名稱，表示演奏樂器時通常用 the。",
    "category": "the",
    "usageType": "樂器"
  },
  {
    "id": "article-161",
    "sentence": "Can you play the guitar?",
    "blankSentence": "Can you play ___ guitar?",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "the",
    "explanation": "guitar 是樂器名稱，表示演奏樂器時通常用 the。",
    "category": "the",
    "usageType": "樂器"
  },
  {
    "id": "article-162",
    "sentence": "The bus to school is late today.",
    "blankSentence": "___ bus to school is late today.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "the",
    "explanation": "bus 有 to school 限定，是特定的校車或公車，所以用 the。",
    "category": "the",
    "usageType": "特定對象"
  },
  {
    "id": "article-163",
    "sentence": "I left my bag in the car.",
    "blankSentence": "I left my bag in ___ car.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "the",
    "explanation": "car 是上下文中已知道的特定車子，所以用 the。",
    "category": "the",
    "usageType": "上下文已知道"
  },
  {
    "id": "article-164",
    "sentence": "Please turn off the light before you leave.",
    "blankSentence": "Please turn off ___ light before you leave.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "the",
    "explanation": "light 指房間裡大家知道的特定電燈，所以用 the。",
    "category": "the",
    "usageType": "特定地點或物品"
  },
  {
    "id": "article-165",
    "sentence": "The red cup is mine.",
    "blankSentence": "___ red cup is mine.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "the",
    "explanation": "red cup 指特定的紅色杯子，所以用 the。",
    "category": "the",
    "usageType": "特定對象"
  },
  {
    "id": "article-166",
    "sentence": "The girl in the blue shirt is my cousin.",
    "blankSentence": "___ girl in the blue shirt is my cousin.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "the",
    "explanation": "girl 後面有 in the blue shirt 限定，是特定女孩，所以用 the。",
    "category": "the",
    "usageType": "特定對象"
  },
  {
    "id": "article-167",
    "sentence": "Please put the book back on the shelf.",
    "blankSentence": "Please put the book back on ___ shelf.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "the",
    "explanation": "shelf 指特定的書架位置，說話者和聽者都知道，所以用 the。",
    "category": "the",
    "usageType": "特定地點或物品"
  },
  {
    "id": "article-168",
    "sentence": "The clock on the wall is slow.",
    "blankSentence": "___ clock on the wall is slow.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "the",
    "explanation": "clock 後面有 on the wall 限定，是特定時鐘，所以用 the。",
    "category": "the",
    "usageType": "特定對象"
  },
  {
    "id": "article-169",
    "sentence": "We ate at the restaurant near the station.",
    "blankSentence": "We ate at ___ restaurant near the station.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "the",
    "explanation": "restaurant 後面有 near the station 限定，是特定餐廳，所以用 the。",
    "category": "the",
    "usageType": "特定對象"
  },
  {
    "id": "article-170",
    "sentence": "The water in this bottle is cold.",
    "blankSentence": "___ water in this bottle is cold.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "the",
    "explanation": "water 後面有 in this bottle 限定，是特定的水，所以用 the。",
    "category": "the",
    "usageType": "特定對象"
  },
  {
    "id": "article-171",
    "sentence": "Students need pencils.",
    "blankSentence": "___ Students need pencils.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "不填",
    "explanation": "Teachers 是複數名詞，表示泛指老師時不用冠詞。",
    "category": "不填",
    "usageType": "泛指複數名詞"
  },
  {
    "id": "article-172",
    "sentence": "Dogs like to run.",
    "blankSentence": "___ Dogs like to run.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "不填",
    "explanation": "Dogs 是複數名詞，泛指狗這一類時不用冠詞。",
    "category": "不填",
    "usageType": "泛指複數名詞"
  },
  {
    "id": "article-173",
    "sentence": "Children enjoy stories.",
    "blankSentence": "___ Children enjoy stories.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "不填",
    "explanation": "Children 是複數名詞，泛指小孩時不用冠詞。",
    "category": "不填",
    "usageType": "泛指複數名詞"
  },
  {
    "id": "article-174",
    "sentence": "Apples are good for you.",
    "blankSentence": "___ Apples are good for you.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "不填",
    "explanation": "Apples 是複數名詞，泛指蘋果時不用冠詞。",
    "category": "不填",
    "usageType": "泛指複數名詞"
  },
  {
    "id": "article-175",
    "sentence": "Water is important.",
    "blankSentence": "___ Water is important.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "不填",
    "explanation": "Water 是不可數名詞，泛指水時不用冠詞。",
    "category": "不填",
    "usageType": "泛指不可數名詞"
  },
  {
    "id": "article-176",
    "sentence": "Rice is popular in Taiwan.",
    "blankSentence": "___ Rice is popular in Taiwan.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "不填",
    "explanation": "Rice 是不可數名詞，泛指米飯時不用冠詞。",
    "category": "不填",
    "usageType": "泛指不可數名詞"
  },
  {
    "id": "article-177",
    "sentence": "Milk is good for children.",
    "blankSentence": "___ Milk is good for children.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "不填",
    "explanation": "Milk 是不可數名詞，泛指牛奶時不用冠詞。",
    "category": "不填",
    "usageType": "泛指不可數名詞"
  },
  {
    "id": "article-178",
    "sentence": "I need time to finish my homework.",
    "blankSentence": "I need ___ time to finish my homework.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "不填",
    "explanation": "time 在這裡是抽象不可數名詞，泛指時間時不用冠詞。",
    "category": "不填",
    "usageType": "抽象名詞泛指"
  },
  {
    "id": "article-179",
    "sentence": "Love makes people happy.",
    "blankSentence": "___ Love makes people happy.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "不填",
    "explanation": "Love 是抽象名詞，泛指愛時不用冠詞。",
    "category": "不填",
    "usageType": "抽象名詞泛指"
  },
  {
    "id": "article-180",
    "sentence": "Music helps me relax.",
    "blankSentence": "___ Music helps me relax.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "不填",
    "explanation": "Music 是抽象名詞，泛指音樂時不用冠詞。",
    "category": "不填",
    "usageType": "抽象名詞泛指"
  },
  {
    "id": "article-181",
    "sentence": "We play baseball after school.",
    "blankSentence": "We play ___ baseball after school.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "不填",
    "explanation": "volleyball 是運動名稱，表示一般運動時通常不加冠詞。",
    "category": "不填",
    "usageType": "運動名稱"
  },
  {
    "id": "article-182",
    "sentence": "They play tennis on Sunday.",
    "blankSentence": "They play ___ tennis on Sunday.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "不填",
    "explanation": "tennis 是運動名稱，表示一般運動時通常不加冠詞。",
    "category": "不填",
    "usageType": "運動名稱"
  },
  {
    "id": "article-183",
    "sentence": "My brother likes basketball.",
    "blankSentence": "My brother likes ___ basketball.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "不填",
    "explanation": "basketball 是運動名稱，泛指籃球運動時不用冠詞。",
    "category": "不填",
    "usageType": "運動名稱"
  },
  {
    "id": "article-184",
    "sentence": "She watches soccer on TV.",
    "blankSentence": "She watches ___ soccer on TV.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "不填",
    "explanation": "soccer 是運動名稱，泛指足球運動時不用冠詞。",
    "category": "不填",
    "usageType": "運動名稱"
  },
  {
    "id": "article-185",
    "sentence": "I study English every day.",
    "blankSentence": "I study ___ English every day.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "不填",
    "explanation": "English 是語言名稱，表示學英文時不用冠詞。",
    "category": "不填",
    "usageType": "語言／科目"
  },
  {
    "id": "article-186",
    "sentence": "Ken likes math.",
    "blankSentence": "Ken likes ___ math.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "不填",
    "explanation": "math 是科目名稱，泛指數學時不用冠詞。",
    "category": "不填",
    "usageType": "語言／科目"
  },
  {
    "id": "article-187",
    "sentence": "We have science on Friday.",
    "blankSentence": "We have ___ science on Friday.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "不填",
    "explanation": "science 是科目名稱，表示上自然課時不用冠詞。",
    "category": "不填",
    "usageType": "語言／科目"
  },
  {
    "id": "article-188",
    "sentence": "She speaks Japanese well.",
    "blankSentence": "She speaks ___ Japanese well.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "不填",
    "explanation": "Japanese 是語言名稱，表示說日文時不用冠詞。",
    "category": "不填",
    "usageType": "語言／科目"
  },
  {
    "id": "article-189",
    "sentence": "I eat breakfast at seven.",
    "blankSentence": "I eat ___ breakfast at seven.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "不填",
    "explanation": "lunch 是餐點名稱，一般用法通常不加冠詞。",
    "category": "不填",
    "usageType": "餐點名稱"
  },
  {
    "id": "article-190",
    "sentence": "They have lunch at school.",
    "blankSentence": "They have ___ lunch at school.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "不填",
    "explanation": "lunch 是餐點名稱，一般用法通常不加冠詞。",
    "category": "不填",
    "usageType": "餐點名稱"
  },
  {
    "id": "article-191",
    "sentence": "We eat dinner with our family.",
    "blankSentence": "We eat ___ dinner with our family.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "不填",
    "explanation": "dinner 是餐點名稱，一般用法通常不加冠詞。",
    "category": "不填",
    "usageType": "餐點名稱"
  },
  {
    "id": "article-192",
    "sentence": "Tom goes to school by bus.",
    "blankSentence": "Tom goes to school by ___ bus.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "不填",
    "explanation": "by bus 表示交通方式，交通工具前通常不加冠詞。",
    "category": "不填",
    "usageType": "交通方式"
  },
  {
    "id": "article-193",
    "sentence": "My dad goes to work by train.",
    "blankSentence": "My dad goes to work by ___ train.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "不填",
    "explanation": "by train 表示交通方式，交通工具前通常不加冠詞。",
    "category": "不填",
    "usageType": "交通方式"
  },
  {
    "id": "article-194",
    "sentence": "We went there by taxi.",
    "blankSentence": "We went there by ___ taxi.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "不填",
    "explanation": "by taxi 表示交通方式，交通工具前通常不加冠詞。",
    "category": "不填",
    "usageType": "交通方式"
  },
  {
    "id": "article-195",
    "sentence": "The children are at school now.",
    "blankSentence": "The children are at ___ school now.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "不填",
    "explanation": "at school 是常見地點片語，表示在學校時通常不加冠詞。",
    "category": "不填",
    "usageType": "常見地點片語"
  },
  {
    "id": "article-196",
    "sentence": "I do my homework at home.",
    "blankSentence": "I do my homework at ___ home.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "不填",
    "explanation": "at home 是固定常見片語，home 前不用冠詞。",
    "category": "不填",
    "usageType": "常見地點片語"
  },
  {
    "id": "article-197",
    "sentence": "Please go to bed early.",
    "blankSentence": "Please go to ___ bed early.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "不填",
    "explanation": "go to bed 是常見片語，表示上床睡覺時不用冠詞。",
    "category": "不填",
    "usageType": "常見地點片語"
  },
  {
    "id": "article-198",
    "sentence": "We swim in summer.",
    "blankSentence": "We swim in ___ summer.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "不填",
    "explanation": "summer 是季節名稱，表示一般季節時通常不加冠詞。",
    "category": "不填",
    "usageType": "季節／月份／星期的一般用法"
  },
  {
    "id": "article-199",
    "sentence": "My birthday is in May.",
    "blankSentence": "My birthday is in ___ May.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "不填",
    "explanation": "May 是月份名稱，一般用法不加冠詞。",
    "category": "不填",
    "usageType": "季節／月份／星期的一般用法"
  },
  {
    "id": "article-200",
    "sentence": "I live in Taiwan.",
    "blankSentence": "I live in ___ Taiwan.",
    "options": [
      "a",
      "an",
      "the",
      "不填"
    ],
    "answer": "不填",
    "explanation": "Taiwan 是專有名詞，國名或地名一般不加冠詞。",
    "category": "不填",
    "usageType": "專有名詞"
  }
];

window.articleQuestions = articleQuestions;
