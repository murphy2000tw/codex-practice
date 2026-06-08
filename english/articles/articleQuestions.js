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
    "sentence": "I need an eraser.",
    "blankSentence": "I need ___ eraser.",
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
    "sentence": "She has an idea.",
    "blankSentence": "She has ___ idea.",
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
    "sentence": "We waited for an hour.",
    "blankSentence": "We waited for ___ hour.",
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
    "sentence": "The earth goes around the sun.",
    "blankSentence": "___ earth goes around the sun.",
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
    "sentence": "We play baseball after school.",
    "blankSentence": "We play ___ baseball after school.",
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
    "sentence": "I eat breakfast at seven.",
    "blankSentence": "I eat ___ breakfast at seven.",
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
    "sentence": "Students need pencils.",
    "blankSentence": "___ Students need pencils.",
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
  }
];

window.articleQuestions = articleQuestions;
