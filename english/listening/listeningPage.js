const listeningContent = document.querySelector("#listeningContent");
const listeningProgress = document.querySelector("#listeningProgress");
const listeningSupportMessage = document.querySelector("#listeningSupportMessage");
const listeningModeButtons = Array.from(document.querySelectorAll("[data-listening-type][data-listening-mode]"));

const listeningVocabulary = Array.isArray(geptVocabulary)
  ? geptVocabulary.filter((item) => item && typeof item.word === "string" && item.word.trim())
  : [];

const listeningSentences = [
  { id: "sentence_001", text: "I go to school by bus.", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_002", text: "She is reading a book.", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_003", text: "My father is a doctor.", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_004", text: "The dog is under the table.", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_005", text: "We have English class today.", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_006", text: "He likes to play basketball.", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_007", text: "There are three apples on the desk.", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_008", text: "I get up at seven every morning.", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_009", text: "It is sunny today.", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_010", text: "Please open the window.", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_011", text: "This is my new pencil.", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_012", text: "Tom can ride a bike.", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_013", text: "I want a glass of water.", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_014", text: "The cat is sleeping on the sofa.", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_015", text: "My mother cooks dinner at home.", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_016", text: "We are going to the park.", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_017", text: "I have two sisters.", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_018", text: "He is wearing a blue jacket.", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_019", text: "The bus stop is near my house.", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_020", text: "May I borrow your ruler?", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_021", text: "They play soccer after school.", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_022", text: "I brush my teeth before breakfast.", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_023", text: "The library is on the second floor.", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_024", text: "She drinks milk every morning.", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_025", text: "My brother is twelve years old.", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_026", text: "The teacher is writing on the board.", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_027", text: "I am hungry now.", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_028", text: "We eat lunch at school.", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_029", text: "The shoes are under the bed.", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_030", text: "Can you help me, please?", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_031", text: "I like music very much.", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_032", text: "She washes her hands before dinner.", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_033", text: "There is a bird in the tree.", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_034", text: "He goes to bed at nine.", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_035", text: "My favorite color is green.", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_036", text: "The store opens at ten.", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_037", text: "I can see a rainbow.", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_038", text: "We need three eggs for the cake.", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_039", text: "She has a red bag.", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_040", text: "The boy is playing with his dog.", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_041", text: "I do my homework after dinner.", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_042", text: "It is time for class.", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_043", text: "My grandparents live in Tainan.", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_044", text: "He takes the train to Taipei.", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_045", text: "The water is too hot.", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_046", text: "Please write your name here.", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_047", text: "I am looking for my keys.", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_048", text: "We visit our uncle on Sunday.", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_049", text: "The girl is singing a song.", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_050", text: "This cake tastes good.", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_051", text: "I need a clean shirt.", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_052", text: "She is waiting for the bus.", level: "GEPT Elementary", type: "sentence" },
];

const listeningQuestionAnswers = [
  { id: "qa_001", question: "How are you?", answer: "I am fine, thank you.", options: ["I am fine, thank you.", "It is a book.", "She is my sister.", "I go to school by bus."], level: "GEPT Elementary", type: "qa" },
  { id: "qa_002", question: "What time is it?", answer: "It is seven o'clock.", options: ["It is seven o'clock.", "I am ten years old.", "It is blue.", "She is my mother."], level: "GEPT Elementary", type: "qa" },
  { id: "qa_003", question: "What is your name?", answer: "My name is Tom.", options: ["My name is Tom.", "I am going to school.", "It is on the desk.", "Yes, I do."], level: "GEPT Elementary", type: "qa" },
  { id: "qa_004", question: "Where are you going?", answer: "I am going to school.", options: ["I am going to school.", "It is seven o'clock.", "No, it is not.", "She is my mother."], level: "GEPT Elementary", type: "qa" },
  { id: "qa_005", question: "Do you like apples?", answer: "Yes, I do.", options: ["Yes, I do.", "It is blue.", "He is my teacher.", "I am fine, thank you."], level: "GEPT Elementary", type: "qa" },
  { id: "qa_006", question: "Is this your pencil?", answer: "Yes, it is.", options: ["Yes, it is.", "My name is Tom.", "I go by bus.", "They are under the bed."], level: "GEPT Elementary", type: "qa" },
  { id: "qa_007", question: "Who is she?", answer: "She is my mother.", options: ["She is my mother.", "It is sunny.", "I am ten years old.", "Yes, it is."], level: "GEPT Elementary", type: "qa" },
  { id: "qa_008", question: "How old are you?", answer: "I am ten years old.", options: ["I am ten years old.", "It is seven o'clock.", "She is in the kitchen.", "No, I don't."], level: "GEPT Elementary", type: "qa" },
  { id: "qa_009", question: "What color is your bag?", answer: "It is blue.", options: ["It is blue.", "It is on the desk.", "I am fine.", "He is my brother."], level: "GEPT Elementary", type: "qa" },
  { id: "qa_010", question: "Where is my book?", answer: "It is on the desk.", options: ["It is on the desk.", "It is red.", "I am going home.", "Yes, I can."], level: "GEPT Elementary", type: "qa" },
  { id: "qa_011", question: "How do you go to school?", answer: "I go to school by bus.", options: ["I go to school by bus.", "It is my school bag.", "She is my sister.", "No, it is not."], level: "GEPT Elementary", type: "qa" },
  { id: "qa_012", question: "What is this?", answer: "It is a book.", options: ["It is a book.", "I am in the classroom.", "Yes, I do.", "She is my aunt."], level: "GEPT Elementary", type: "qa" },
  { id: "qa_013", question: "Who is he?", answer: "He is my father.", options: ["He is my father.", "It is raining.", "I like bananas.", "At seven thirty."], level: "GEPT Elementary", type: "qa" },
  { id: "qa_014", question: "What do you want?", answer: "I want some water.", options: ["I want some water.", "It is under the chair.", "She is my teacher.", "Yes, it is mine."], level: "GEPT Elementary", type: "qa" },
  { id: "qa_015", question: "Can you swim?", answer: "Yes, I can.", options: ["Yes, I can.", "It is my ruler.", "I am eleven years old.", "They are at home."], level: "GEPT Elementary", type: "qa" },
  { id: "qa_016", question: "Are you hungry?", answer: "Yes, I am.", options: ["Yes, I am.", "It is green.", "He goes by train.", "This is my pencil."], level: "GEPT Elementary", type: "qa" },
  { id: "qa_017", question: "Where do you live?", answer: "I live in Taipei.", options: ["I live in Taipei.", "It is six o'clock.", "No, I am not.", "She is reading."], level: "GEPT Elementary", type: "qa" },
  { id: "qa_018", question: "What day is today?", answer: "It is Monday.", options: ["It is Monday.", "It is a ruler.", "I am twelve.", "Yes, she is."], level: "GEPT Elementary", type: "qa" },
  { id: "qa_019", question: "How is the weather?", answer: "It is sunny.", options: ["It is sunny.", "I am fine.", "He is my uncle.", "I go to school."], level: "GEPT Elementary", type: "qa" },
  { id: "qa_020", question: "What are you doing?", answer: "I am reading a book.", options: ["I am reading a book.", "It is on the table.", "No, I do not.", "She is my cousin."], level: "GEPT Elementary", type: "qa" },
  { id: "qa_021", question: "Where is your mother?", answer: "She is in the kitchen.", options: ["She is in the kitchen.", "It is my bag.", "I am ten.", "Yes, I like it."], level: "GEPT Elementary", type: "qa" },
  { id: "qa_022", question: "What is your favorite color?", answer: "My favorite color is green.", options: ["My favorite color is green.", "It is on Sunday.", "He is a doctor.", "No, it is not."], level: "GEPT Elementary", type: "qa" },
  { id: "qa_023", question: "When is your birthday?", answer: "It is in May.", options: ["It is in May.", "I am at school.", "Yes, I can.", "They are pencils."], level: "GEPT Elementary", type: "qa" },
  { id: "qa_024", question: "What do you eat for breakfast?", answer: "I eat bread and eggs.", options: ["I eat bread and eggs.", "It is five dollars.", "She is my friend.", "No, I am not."], level: "GEPT Elementary", type: "qa" },
  { id: "qa_025", question: "Do you have a brother?", answer: "Yes, I do.", options: ["Yes, I do.", "It is yellow.", "I am at home.", "She is cooking."], level: "GEPT Elementary", type: "qa" },
  { id: "qa_026", question: "Is your father a doctor?", answer: "No, he is not.", options: ["No, he is not.", "I like English.", "It is on the bed.", "Yes, I am."], level: "GEPT Elementary", type: "qa" },
  { id: "qa_027", question: "What subject do you like?", answer: "I like English.", options: ["I like English.", "It is my cap.", "She is my mother.", "At eight o'clock."], level: "GEPT Elementary", type: "qa" },
  { id: "qa_028", question: "What time do you get up?", answer: "I get up at seven.", options: ["I get up at seven.", "It is brown.", "No, thank you.", "They are my friends."], level: "GEPT Elementary", type: "qa" },
  { id: "qa_029", question: "Where is the library?", answer: "It is on the second floor.", options: ["It is on the second floor.", "I am going to the park.", "Yes, I do.", "He is nine years old."], level: "GEPT Elementary", type: "qa" },
  { id: "qa_030", question: "May I borrow your ruler?", answer: "Sure, here you are.", options: ["Sure, here you are.", "It is a dog.", "I live in Tainan.", "No, she is not."], level: "GEPT Elementary", type: "qa" },
  { id: "qa_031", question: "Thank you very much.", answer: "You're welcome.", options: ["You're welcome.", "I am fine.", "It is a pencil.", "He is at school."], level: "GEPT Elementary", type: "qa" },
  { id: "qa_032", question: "How much is this pen?", answer: "It is ten dollars.", options: ["It is ten dollars.", "It is on the chair.", "I am watching TV.", "Yes, I have."], level: "GEPT Elementary", type: "qa" },
  { id: "qa_033", question: "What is your phone number?", answer: "It is 1234-5678.", options: ["It is 1234-5678.", "It is sunny today.", "She is my sister.", "No, I can't."], level: "GEPT Elementary", type: "qa" },
  { id: "qa_034", question: "What does your sister like?", answer: "She likes music.", options: ["She likes music.", "It is under the desk.", "I go by bike.", "Yes, it is."], level: "GEPT Elementary", type: "qa" },
  { id: "qa_035", question: "Where are your shoes?", answer: "They are under the bed.", options: ["They are under the bed.", "It is my brother.", "I am thirsty.", "No, I don't."], level: "GEPT Elementary", type: "qa" },
  { id: "qa_036", question: "Are these your books?", answer: "Yes, they are.", options: ["Yes, they are.", "It is in June.", "I like math.", "She is sleeping."], level: "GEPT Elementary", type: "qa" },
  { id: "qa_037", question: "What do you do after school?", answer: "I play soccer after school.", options: ["I play soccer after school.", "It is white.", "He is my uncle.", "No, it isn't."], level: "GEPT Elementary", type: "qa" },
  { id: "qa_038", question: "Who is your English teacher?", answer: "Ms. Lin is my English teacher.", options: ["Ms. Lin is my English teacher.", "It is on the wall.", "I am going home.", "Yes, I can."], level: "GEPT Elementary", type: "qa" },
  { id: "qa_039", question: "What is in your bag?", answer: "There is a book in my bag.", options: ["There is a book in my bag.", "I am eleven years old.", "She is in the park.", "No, thank you."], level: "GEPT Elementary", type: "qa" },
  { id: "qa_040", question: "Do you want some milk?", answer: "Yes, please.", options: ["Yes, please.", "It is my bike.", "I live in Kaohsiung.", "He is running."], level: "GEPT Elementary", type: "qa" },
  { id: "qa_041", question: "Can I help you?", answer: "Yes, please.", options: ["Yes, please.", "It is Monday.", "She is my grandma.", "I go at six."], level: "GEPT Elementary", type: "qa" },
  { id: "qa_042", question: "What time is lunch?", answer: "Lunch is at twelve.", options: ["Lunch is at twelve.", "It is my eraser.", "No, I am not.", "They are in the box."], level: "GEPT Elementary", type: "qa" },
  { id: "qa_043", question: "Where do you play basketball?", answer: "I play basketball at school.", options: ["I play basketball at school.", "It is cloudy.", "Yes, she does.", "He is a student."], level: "GEPT Elementary", type: "qa" },
  { id: "qa_044", question: "What animal do you like?", answer: "I like dogs.", options: ["I like dogs.", "It is on the sofa.", "She is ten.", "No, it is his."], level: "GEPT Elementary", type: "qa" },
  { id: "qa_045", question: "Is it raining now?", answer: "No, it is not.", options: ["No, it is not.", "I am reading.", "It is my pencil case.", "She goes by bus."], level: "GEPT Elementary", type: "qa" },
  { id: "qa_046", question: "How many pencils do you have?", answer: "I have three pencils.", options: ["I have three pencils.", "It is in the bag.", "Yes, I do.", "He is my cousin."], level: "GEPT Elementary", type: "qa" },
  { id: "qa_047", question: "What fruit do you like?", answer: "I like bananas.", options: ["I like bananas.", "It is ten o'clock.", "No, she is not.", "They are on the desk."], level: "GEPT Elementary", type: "qa" },
  { id: "qa_048", question: "Where is your classroom?", answer: "It is on the third floor.", options: ["It is on the third floor.", "I am fine, thank you.", "Yes, I am.", "She likes art."], level: "GEPT Elementary", type: "qa" },
  { id: "qa_049", question: "What are those?", answer: "They are birds.", options: ["They are birds.", "It is my house.", "I am going to bed.", "No, I can't."], level: "GEPT Elementary", type: "qa" },
  { id: "qa_050", question: "Good morning, class.", answer: "Good morning, teacher.", options: ["Good morning, teacher.", "It is under the table.", "I have two sisters.", "Yes, it does."], level: "GEPT Elementary", type: "qa" },
];

const LISTENING_PROGRESS_KEY = "englishListeningProgress_v1";
const VOCAB_PROGRESS_KEY = "englishVocabProgress_v1";
const LISTENING_PROGRESS_VERSION = 1;
const VOCAB_PROGRESS_VERSION = 1;
const LISTENING_TEST_TARGET_COUNT = 10;
const listeningModePractice = "practice";
const listeningModeTest = "test";
const listeningTypeVocabulary = "vocabulary";
const listeningTypeSentence = "sentence";
const listeningTypeQa = "qa";
const futureListeningTypes = [
  "vocabulary",
  "sentence",
  "qa",
  "geptPicture",
  "geptQuestionResponse",
  "geptConversation",
  "geptShortTalk",
  "geptFullMock",
];

let listeningMode = listeningModePractice;
let listeningType = listeningTypeVocabulary;
let practiceQuestions = [];
let practiceQuestionIndex = 0;
let practiceAnsweredCurrentQuestion = false;
let testQuestions = [];
let testQuestionIndex = 0;
let testAnsweredQuestionIds = new Set();
let testPlayedQuestionIds = new Set();
let testResults = [];
let testCorrectCount = 0;
let testPhase = "ready";

function canUseListeningLocalStorage() {
  try {
    const testKey = `${LISTENING_PROGRESS_KEY}_test`;
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch (error) {
    return false;
  }
}

function createEmptyListeningProgress() {
  return {
    version: LISTENING_PROGRESS_VERSION,
    updatedAt: new Date().toISOString(),
    items: {},
  };
}

function normalizeListeningNumber(value) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue > 0 ? Math.floor(numberValue) : 0;
}

function getActivityConfig(type = listeningType) {
  if (type === listeningTypeSentence) {
    return {
      type: listeningTypeSentence,
      label: "句子聽力",
      practiceTitle: "句子聽力練習",
      testTitle: "句子聽力測驗",
      answerLabel: "英文句子",
      emptyMessage: "目前沒有可用的句子聽力題目",
      items: listeningSentences,
      getText: (item) => item.text,
      getAnswer: (item) => item.text,
      getSourceId: (item) => item.id || item.text,
      itemIdPrefix: "listening_sentence",
    };
  }

  if (type === listeningTypeQa) {
    return {
      type: listeningTypeQa,
      label: "問答聽力",
      practiceTitle: "問答聽力練習",
      testTitle: "問答聽力測驗",
      answerLabel: "英文回答",
      emptyMessage: "目前沒有可用的問答聽力題目",
      items: listeningQuestionAnswers,
      getText: (item) => item.question,
      getAnswer: (item) => item.answer,
      getSourceId: (item) => item.id || item.question,
      itemIdPrefix: "listening_qa",
    };
  }

  return {
    type: listeningTypeVocabulary,
    label: "單字聽力",
    practiceTitle: "單字聽力練習",
    testTitle: "單字聽力測驗",
    answerLabel: "英文單字",
    emptyMessage: "目前沒有可用的單字聽力題目",
    items: listeningVocabulary,
    getText: (item) => item.word,
    getAnswer: (item) => item.word,
    getSourceId: (item) => item.word || item.id,
    itemIdPrefix: "listening_vocab",
  };
}

function getListeningItemId(item, type = listeningType) {
  const config = getActivityConfig(type);
  if ((type === listeningTypeSentence || type === listeningTypeQa) && typeof item?.id === "string" && item.id.trim()) {
    return `listening_${item.id.trim()}`;
  }
  const source = String(config.getSourceId(item) || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  return `${config.itemIdPrefix}_${source || type}`;
}

function normalizeListeningItem(record = {}, itemId = "", text = "", type = listeningTypeVocabulary, answer = "") {
  const normalizedType = futureListeningTypes.includes(record.type) ? record.type : type;
  return {
    itemId: record.itemId || itemId,
    type: normalizedType,
    text: record.text || text,
    answer: record.answer || answer || null,
    seenCount: normalizeListeningNumber(record.seenCount),
    answeredCount: normalizeListeningNumber(record.answeredCount),
    correctCount: normalizeListeningNumber(record.correctCount),
    wrongCount: normalizeListeningNumber(record.wrongCount),
    practicePlayCount: normalizeListeningNumber(record.practicePlayCount),
    testPlayCount: normalizeListeningNumber(record.testPlayCount),
    lastSeenAt: typeof record.lastSeenAt === "string" ? record.lastSeenAt : null,
    lastAnsweredAt: typeof record.lastAnsweredAt === "string" ? record.lastAnsweredAt : null,
  };
}

function normalizeListeningProgress(progress) {
  const normalized = createEmptyListeningProgress();
  normalized.updatedAt = typeof progress?.updatedAt === "string" ? progress.updatedAt : normalized.updatedAt;

  if (progress?.items && typeof progress.items === "object" && !Array.isArray(progress.items)) {
    Object.entries(progress.items).forEach(([itemId, record]) => {
      if (!itemId || !record || typeof record !== "object" || Array.isArray(record)) {
        return;
      }
      normalized.items[itemId] = normalizeListeningItem(record, itemId, record.text || "", record.type || listeningTypeVocabulary);
    });
  }

  return normalized;
}

function loadListeningProgress() {
  const emptyProgress = createEmptyListeningProgress();

  if (!canUseListeningLocalStorage()) {
    return emptyProgress;
  }

  try {
    const storedProgress = window.localStorage.getItem(LISTENING_PROGRESS_KEY);
    if (!storedProgress) {
      window.localStorage.setItem(LISTENING_PROGRESS_KEY, JSON.stringify(emptyProgress));
      return emptyProgress;
    }

    const parsedProgress = JSON.parse(storedProgress);
    if (!parsedProgress || parsedProgress.version !== LISTENING_PROGRESS_VERSION) {
      throw new Error("Invalid listening progress data");
    }

    const normalizedProgress = normalizeListeningProgress(parsedProgress);
    window.localStorage.setItem(LISTENING_PROGRESS_KEY, JSON.stringify(normalizedProgress));
    return normalizedProgress;
  } catch (error) {
    try {
      window.localStorage.setItem(LISTENING_PROGRESS_KEY, JSON.stringify(emptyProgress));
    } catch (storageError) {
      // Listening remains usable even when localStorage is unavailable.
    }
    return emptyProgress;
  }
}

function saveListeningProgress(progress) {
  const normalizedProgress = normalizeListeningProgress(progress);
  if (!canUseListeningLocalStorage()) {
    return normalizedProgress;
  }

  try {
    window.localStorage.setItem(LISTENING_PROGRESS_KEY, JSON.stringify(normalizedProgress));
  } catch (error) {
    // Listening records are optional; keep the activity usable.
  }

  return normalizedProgress;
}

function updateListeningProgress(item, type, updater) {
  const config = getActivityConfig(type);
  const progress = loadListeningProgress();
  const itemId = getListeningItemId(item, type);
  const text = config.getText(item);
  const answer = config.getAnswer(item);
  const now = new Date().toISOString();
  const current = normalizeListeningItem(progress.items[itemId], itemId, text, type, answer);
  const next = updater(current, now) || current;
  next.itemId = itemId;
  next.type = type;
  next.text = text;
  next.answer = answer || null;
  progress.items[itemId] = next;
  progress.updatedAt = now;
  return saveListeningProgress(progress).items[itemId];
}

function recordListeningSeen(item, type = listeningType) {
  return updateListeningProgress(item, type, (record, now) => ({
    ...record,
    seenCount: normalizeListeningNumber(record.seenCount) + 1,
    lastSeenAt: now,
  }));
}

function recordListeningPlay(item, mode, type = listeningType) {
  return updateListeningProgress(item, type, (record) => ({
    ...record,
    practicePlayCount: normalizeListeningNumber(record.practicePlayCount) + (mode === listeningModePractice ? 1 : 0),
    testPlayCount: normalizeListeningNumber(record.testPlayCount) + (mode === listeningModeTest ? 1 : 0),
  }));
}

function recordListeningAnswer(item, isCorrect, type = listeningType) {
  return updateListeningProgress(item, type, (record, now) => ({
    ...record,
    answeredCount: normalizeListeningNumber(record.answeredCount) + 1,
    correctCount: normalizeListeningNumber(record.correctCount) + (isCorrect ? 1 : 0),
    wrongCount: normalizeListeningNumber(record.wrongCount) + (isCorrect ? 0 : 1),
    lastAnsweredAt: now,
  }));
}

function loadVocabProgress() {
  const emptyProgress = {
    version: VOCAB_PROGRESS_VERSION,
    updatedAt: new Date().toISOString(),
    words: {},
  };

  if (!canUseListeningLocalStorage()) {
    return emptyProgress;
  }

  try {
    const storedProgress = window.localStorage.getItem(VOCAB_PROGRESS_KEY);
    if (!storedProgress) {
      window.localStorage.setItem(VOCAB_PROGRESS_KEY, JSON.stringify(emptyProgress));
      return emptyProgress;
    }

    const parsedProgress = JSON.parse(storedProgress);
    if (!parsedProgress || parsedProgress.version !== VOCAB_PROGRESS_VERSION || typeof parsedProgress.words !== "object" || Array.isArray(parsedProgress.words)) {
      throw new Error("Invalid vocabulary progress data");
    }
    return parsedProgress;
  } catch (error) {
    try {
      window.localStorage.setItem(VOCAB_PROGRESS_KEY, JSON.stringify(emptyProgress));
    } catch (storageError) {
      // Keep listening usable when storage fails.
    }
    return emptyProgress;
  }
}

function normalizeVocabProgressNumber(value) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue > 0 ? Math.floor(numberValue) : 0;
}

function calculateVocabStatus(record) {
  const practiceCount = normalizeVocabProgressNumber(record.practiceCount);
  const testSeenCount = normalizeVocabProgressNumber(record.testSeenCount);
  const testCorrectCount = normalizeVocabProgressNumber(record.testCorrectCount);

  if (practiceCount === 0 && testSeenCount === 0) {
    return "new";
  }

  if (practiceCount >= 6 && testCorrectCount >= 6) {
    return "known";
  }

  return "learning";
}

function syncListeningTestAnswerToVocabProgress(word, isCorrect) {
  if (!word?.id && !word?.word) {
    return;
  }

  const progress = loadVocabProgress();
  const wordKey = String(word.id || word.word || "").trim();
  if (!wordKey) {
    return;
  }

  const now = new Date().toISOString();
  const current = progress.words[wordKey] && typeof progress.words[wordKey] === "object" && !Array.isArray(progress.words[wordKey])
    ? progress.words[wordKey]
    : {};
  const nextRecord = {
    word: current.word || word.word || wordKey,
    practiceCount: normalizeVocabProgressNumber(current.practiceCount ?? current.studyCount),
    testSeenCount: normalizeVocabProgressNumber(current.testSeenCount ?? 0) + 1,
    testCorrectCount: normalizeVocabProgressNumber(current.testCorrectCount ?? current.correctCount) + (isCorrect ? 1 : 0),
    testWrongCount: normalizeVocabProgressNumber(current.testWrongCount ?? current.wrongCount) + (isCorrect ? 0 : 1),
    status: "new",
    firstStudiedAt: current.firstStudiedAt || now,
    lastStudiedAt: current.lastStudiedAt || null,
    lastTestedAt: now,
  };
  nextRecord.status = calculateVocabStatus(nextRecord);
  progress.words[wordKey] = nextRecord;
  progress.updatedAt = now;

  if (!canUseListeningLocalStorage()) {
    return;
  }

  try {
    window.localStorage.setItem(VOCAB_PROGRESS_KEY, JSON.stringify(progress));
  } catch (error) {
    // Vocab sync is optional; do not block listening.
  }
}

function shuffleListeningItems(items) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }
  return shuffled;
}

function getItemText(item, type = listeningType) {
  return getActivityConfig(type).getText(item);
}

function getItemAnswer(item, type = listeningType) {
  return getActivityConfig(type).getAnswer(item);
}

function getListeningOptions(currentItem, type = listeningType) {
  const config = getActivityConfig(type);
  const correctAnswer = config.getAnswer(currentItem);
  const optionSource = Array.isArray(currentItem?.options) && currentItem.options.length
    ? currentItem.options
    : [
      correctAnswer,
      ...shuffleListeningItems(config.items)
        .map((item) => config.getAnswer(item))
        .filter((answer) => answer && answer !== correctAnswer),
    ];
  const uniqueOptions = [];
  [correctAnswer, ...optionSource].forEach((answer) => {
    if (answer && !uniqueOptions.includes(answer)) {
      uniqueOptions.push(answer);
    }
  });
  return shuffleListeningItems(uniqueOptions.slice(0, 4));
}

function selectListeningTestQuestions(type = listeningType) {
  const config = getActivityConfig(type);
  const availableQuestions = shuffleListeningItems(config.items).slice(0);
  if (availableQuestions.length <= LISTENING_TEST_TARGET_COUNT) {
    return availableQuestions;
  }

  const progress = loadListeningProgress();
  const wrongPool = [];
  const answeredPool = [];
  const unseenPool = [];

  availableQuestions.forEach((item) => {
    const itemId = getListeningItemId(item, type);
    const record = normalizeListeningItem(progress.items[itemId], itemId, config.getText(item), type, config.getAnswer(item));
    if (record.type !== type) {
      unseenPool.push(item);
      return;
    }
    if (record.wrongCount > 0) {
      wrongPool.push(item);
      return;
    }
    if (record.answeredCount > 0 || record.seenCount > 0) {
      answeredPool.push(item);
      return;
    }
    unseenPool.push(item);
  });

  const selectedIds = new Set();
  const selected = [];
  const addFromPool = (pool, count) => {
    shuffleListeningItems(pool).forEach((item) => {
      const itemId = getListeningItemId(item, type);
      if (selected.length >= LISTENING_TEST_TARGET_COUNT || count <= 0 || selectedIds.has(itemId)) {
        return;
      }
      selectedIds.add(itemId);
      selected.push(item);
      count -= 1;
    });
  };

  addFromPool(wrongPool, 2);
  addFromPool(answeredPool, 2);
  addFromPool(unseenPool, LISTENING_TEST_TARGET_COUNT - selected.length);
  addFromPool([...wrongPool, ...answeredPool, ...unseenPool], LISTENING_TEST_TARGET_COUNT - selected.length);
  return shuffleListeningItems(selected).slice(0, LISTENING_TEST_TARGET_COUNT);
}

function isSpeechSynthesisSupported() {
  return typeof window !== "undefined" && "speechSynthesis" in window && typeof window.SpeechSynthesisUtterance === "function";
}

function cancelEnglishSpeech() {
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.cancel();
  }
}

function updateSpeechSupportMessage() {
  const supported = isSpeechSynthesisSupported();
  listeningSupportMessage.hidden = supported;
  listeningSupportMessage.textContent = supported
    ? ""
    : "此瀏覽器不支援語音播放，請改用 Chrome、Safari 或 Edge。";
  return supported;
}

function speakEnglish(text, options = {}) {
  if (!updateSpeechSupportMessage()) {
    return false;
  }

  cancelEnglishSpeech();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = options.lang || "en-US";
  utterance.rate = options.rate || 0.9;
  utterance.pitch = options.pitch || 1;
  utterance.volume = options.volume || 1;
  window.speechSynthesis.speak(utterance);
  return true;
}

function createEmptyMessage(message) {
  const card = document.createElement("article");
  card.className = "quiz-card gept-quiz-card";
  const status = document.createElement("p");
  status.className = "status-message quiz-status-message";
  status.textContent = message;
  card.append(status);
  return card;
}

function createModeActionButton(label, onClick, className = "answer-button") {
  const button = document.createElement("button");
  button.className = className;
  button.type = "button";
  button.textContent = label;
  button.addEventListener("click", onClick);
  return button;
}

function updateModeButtons() {
  listeningModeButtons.forEach((button) => {
    const isActive = button.dataset.listeningType === listeningType && button.dataset.listeningMode === listeningMode;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function renderCurrentMode() {
  cancelEnglishSpeech();
  updateModeButtons();
  updateSpeechSupportMessage();

  const config = getActivityConfig();
  if (!config.items.length) {
    listeningProgress.textContent = `${config.label}：0 / 0`;
    listeningContent.replaceChildren(createEmptyMessage(config.emptyMessage));
    return;
  }

  if (listeningMode === listeningModePractice) {
    renderPracticePreparation();
    return;
  }

  renderTestPreparation();
}

function resetPracticeState() {
  practiceQuestions = shuffleListeningItems(getActivityConfig().items);
  practiceQuestionIndex = 0;
  practiceAnsweredCurrentQuestion = false;
}

function renderPracticePreparation() {
  testPhase = "ready";
  const config = getActivityConfig();
  listeningProgress.textContent = `${config.practiceTitle}：0 / ${config.items.length}`;
  const card = document.createElement("article");
  card.className = "quiz-card quiz-ready-card gept-quiz-card";
  const badge = document.createElement("span");
  badge.className = "card-number";
  badge.textContent = "練習準備";
  const title = document.createElement("h3");
  title.className = "quiz-title";
  title.textContent = config.practiceTitle;
  const details = document.createElement("div");
  details.className = "quiz-ready-details";
  [
    `請聽音訊後選出正確${config.answerLabel}`,
    "播放次數不限，可以重複聆聽",
    "不設定答題秒數",
    "不顯示中文提示",
    "不顯示英文問句文字",
  ].forEach((text) => {
    const item = document.createElement("p");
    item.textContent = text;
    details.append(item);
  });
  card.append(badge, title, details, createModeActionButton("開始練習", () => {
    resetPracticeState();
    renderPracticeQuestion();
  }));
  listeningContent.replaceChildren(card);
}

function playPracticeItem(item) {
  if (speakEnglish(getItemText(item))) {
    recordListeningPlay(item, listeningModePractice);
  }
}

function renderPracticeQuestion() {
  cancelEnglishSpeech();
  const config = getActivityConfig();
  const currentItem = practiceQuestions[practiceQuestionIndex];
  if (!currentItem) {
    renderPracticePreparation();
    return;
  }

  recordListeningSeen(currentItem);
  practiceAnsweredCurrentQuestion = false;
  const practiceCurrentOptions = getListeningOptions(currentItem);
  listeningProgress.textContent = `${config.practiceTitle}：${practiceQuestionIndex + 1} / ${practiceQuestions.length}`;

  const card = document.createElement("article");
  card.className = "quiz-card gept-quiz-card";
  const prompt = document.createElement("div");
  prompt.className = "quiz-prompt";
  const label = document.createElement("p");
  label.className = "quiz-prompt-label";
  label.textContent = `${config.practiceTitle}｜第 ${practiceQuestionIndex + 1} 題`;
  const instruction = document.createElement("p");
  instruction.className = "gept-quiz-instruction";
  instruction.textContent = `請聽音訊後選出正確${config.answerLabel}。`;
  const playButton = createModeActionButton("播放音訊 / 再聽一次", () => playPracticeItem(currentItem), "secondary-button listening-play-button");
  prompt.append(label, instruction, playButton);

  const options = document.createElement("div");
  options.className = "quiz-options gept-quiz-options";
  const feedback = document.createElement("p");
  feedback.className = "quiz-feedback";
  feedback.setAttribute("aria-live", "polite");

  practiceCurrentOptions.forEach((answer, index) => {
    const optionButton = document.createElement("button");
    optionButton.className = "quiz-option gept-quiz-option";
    optionButton.type = "button";
    optionButton.textContent = `${String.fromCharCode(65 + index)}. ${answer}`;
    optionButton.dataset.answer = answer;
    optionButton.addEventListener("click", () => handlePracticeAnswer(optionButton, currentItem, feedback));
    options.append(optionButton);
  });

  const actions = document.createElement("div");
  actions.className = "quiz-actions";
  const nextButton = createModeActionButton("下一題", () => {
    practiceQuestionIndex = practiceQuestionIndex >= practiceQuestions.length - 1 ? 0 : practiceQuestionIndex + 1;
    renderPracticeQuestion();
  });
  nextButton.disabled = true;
  nextButton.id = "nextListeningPracticeQuestion";
  actions.append(nextButton);

  card.append(prompt, options, feedback, actions);
  listeningContent.replaceChildren(card);
}

function handlePracticeAnswer(selectedButton, currentItem, feedback) {
  if (practiceAnsweredCurrentQuestion) {
    return;
  }

  const config = getActivityConfig();
  const correctAnswer = getItemAnswer(currentItem);
  practiceAnsweredCurrentQuestion = true;
  const isCorrect = selectedButton.dataset.answer === correctAnswer;
  recordListeningAnswer(currentItem, isCorrect);

  listeningContent.querySelectorAll(".gept-quiz-option").forEach((button) => {
    const buttonIsCorrect = button.dataset.answer === correctAnswer;
    button.classList.toggle("is-correct", buttonIsCorrect);
    button.classList.toggle("is-wrong", button === selectedButton && !buttonIsCorrect);
    button.disabled = true;
  });

  feedback.classList.toggle("is-correct", isCorrect);
  feedback.classList.toggle("is-wrong", !isCorrect);
  const reviewText = listeningType === listeningTypeQa ? `｜英文問句：${getItemText(currentItem)}` : "";
  feedback.textContent = isCorrect ? `答對了！${reviewText}` : `答錯了，正確${config.answerLabel}是：${correctAnswer}${reviewText}`;
  const nextButton = document.querySelector("#nextListeningPracticeQuestion");
  if (nextButton) {
    nextButton.disabled = false;
  }
}

function resetTestState() {
  cancelEnglishSpeech();
  testQuestions = selectListeningTestQuestions();
  testQuestionIndex = 0;
  testAnsweredQuestionIds = new Set();
  testPlayedQuestionIds = new Set();
  testResults = [];
  testCorrectCount = 0;
  testPhase = "ready";
}

function renderTestPreparation() {
  resetTestState();
  const config = getActivityConfig();
  listeningProgress.textContent = `${config.testTitle}準備中：0 / ${testQuestions.length}`;
  const card = document.createElement("article");
  card.className = "quiz-card quiz-ready-card gept-quiz-card";
  const badge = document.createElement("span");
  badge.className = "card-number";
  badge.textContent = "測驗準備";
  const title = document.createElement("h3");
  title.className = "quiz-title";
  title.textContent = config.testTitle;
  const details = document.createElement("div");
  details.className = "quiz-ready-details";
  [
    `本次測驗：${testQuestions.length} 題`,
    "音訊只能播放一次",
    "不顯示中文提示",
    "不顯示英文問句文字",
    "不設定答題秒數",
  ].forEach((text) => {
    const item = document.createElement("p");
    item.textContent = text;
    details.append(item);
  });
  card.append(badge, title, details, createModeActionButton("開始測驗", () => {
    if (testPhase === "running") {
      return;
    }
    testPhase = "running";
    renderTestQuestion();
  }));
  listeningContent.replaceChildren(card);
}

function playTestItemOnce(item) {
  const itemId = getListeningItemId(item);
  if (testPlayedQuestionIds.has(itemId)) {
    return;
  }
  testPlayedQuestionIds.add(itemId);
  if (speakEnglish(getItemText(item))) {
    recordListeningPlay(item, listeningModeTest);
  }
}

function renderTestQuestion() {
  cancelEnglishSpeech();
  if (testPhase !== "running") {
    renderTestPreparation();
    return;
  }

  const config = getActivityConfig();
  const currentItem = testQuestions[testQuestionIndex];
  if (!currentItem) {
    renderTestCompletePanel();
    return;
  }

  recordListeningSeen(currentItem);
  const testCurrentOptions = getListeningOptions(currentItem);
  listeningProgress.textContent = `${config.testTitle}：${testQuestionIndex + 1} / ${testQuestions.length}`;

  const card = document.createElement("article");
  card.className = "quiz-card gept-quiz-card";
  const prompt = document.createElement("div");
  prompt.className = "quiz-prompt";
  const label = document.createElement("p");
  label.className = "quiz-prompt-label";
  label.textContent = `${config.testTitle}｜第 ${testQuestionIndex + 1} / ${testQuestions.length} 題`;
  const instruction = document.createElement("p");
  instruction.className = "gept-quiz-instruction";
  instruction.textContent = `請聽音訊後選出正確${config.answerLabel}。`;
  const playStatus = document.createElement("p");
  playStatus.className = "listening-play-status";
  playStatus.textContent = "音訊已播放一次，請作答。";
  prompt.append(label, instruction, playStatus);

  const options = document.createElement("div");
  options.className = "quiz-options gept-quiz-options";
  testCurrentOptions.forEach((answer, index) => {
    const optionButton = document.createElement("button");
    optionButton.className = "quiz-option gept-quiz-option";
    optionButton.type = "button";
    optionButton.textContent = `${String.fromCharCode(65 + index)}. ${answer}`;
    optionButton.dataset.answer = answer;
    optionButton.addEventListener("click", () => handleTestAnswer(optionButton, currentItem));
    options.append(optionButton);
  });

  card.append(prompt, options);
  listeningContent.replaceChildren(card);
  playTestItemOnce(currentItem);
}

function handleTestAnswer(selectedButton, currentItem) {
  if (testPhase !== "running") {
    return;
  }

  const itemId = getListeningItemId(currentItem);
  if (testAnsweredQuestionIds.has(itemId)) {
    return;
  }

  const correctAnswer = getItemAnswer(currentItem);
  testAnsweredQuestionIds.add(itemId);
  const selectedAnswer = selectedButton.dataset.answer;
  const isCorrect = selectedAnswer === correctAnswer;
  recordListeningAnswer(currentItem, isCorrect);
  if (listeningType === listeningTypeVocabulary) {
    syncListeningTestAnswerToVocabProgress(currentItem, isCorrect);
  }

  if (isCorrect) {
    testCorrectCount += 1;
  }

  testResults.push({
    order: testQuestionIndex + 1,
    userAnswer: selectedAnswer,
    question: getItemText(currentItem),
    correctAnswer,
    result: isCorrect ? "correct" : "wrong",
  });

  listeningContent.querySelectorAll(".gept-quiz-option").forEach((button) => {
    button.disabled = true;
  });

  window.setTimeout(() => {
    if (testQuestionIndex >= testQuestions.length - 1) {
      renderTestCompletePanel();
      return;
    }
    testQuestionIndex += 1;
    renderTestQuestion();
  }, 450);
}

function createTestResultList() {
  const config = getActivityConfig();
  const list = document.createElement("ol");
  list.className = "quiz-result-list";
  testResults.forEach((result) => {
    const item = document.createElement("li");
    const questionText = config.type === listeningTypeQa ? `英文問句：${result.question}｜` : "";
    item.textContent = `第 ${result.order} 題｜${questionText}你的答案：${result.userAnswer}｜正確${config.answerLabel}：${result.correctAnswer}｜結果：${result.result === "correct" ? "答對" : "答錯"}`;
    list.append(item);
  });
  return list;
}

function renderTestCompletePanel() {
  cancelEnglishSpeech();
  testPhase = "complete";
  const config = getActivityConfig();
  const total = testResults.length;
  const wrongCount = total - testCorrectCount;
  const accuracy = total ? Math.round((testCorrectCount / total) * 100) : 0;
  listeningProgress.textContent = `${config.testTitle}完成：${total} / ${total}`;

  const card = document.createElement("article");
  card.className = "quiz-card gept-quiz-card";
  const title = document.createElement("h3");
  title.className = "quiz-title";
  title.textContent = config.testTitle;
  const summary = document.createElement("p");
  summary.className = "article-result-message";
  summary.textContent = `總題數：${total} 題｜答對：${testCorrectCount} 題｜答錯：${wrongCount} 題｜正確率：${accuracy}%`;
  const actions = document.createElement("div");
  actions.className = "quiz-actions";
  const retryButton = createModeActionButton("再測一次", renderTestPreparation);
  const homeLink = document.createElement("a");
  homeLink.className = "secondary-button";
  homeLink.href = "../";
  homeLink.textContent = "回英文學習首頁";
  actions.append(retryButton, homeLink);
  card.append(title, summary, createTestResultList(), actions);
  listeningContent.replaceChildren(card);
}

function setListeningActivity(type, mode) {
  if (listeningType === type && listeningMode === mode) {
    return;
  }
  listeningType = type;
  listeningMode = mode;
  window.location.hash = `${type}-${mode}`;
  renderCurrentMode();
}

function parseListeningHash() {
  const hash = window.location.hash.replace("#", "");
  if (hash === "test") {
    return { type: listeningTypeVocabulary, mode: listeningModeTest };
  }
  if (hash === "practice") {
    return { type: listeningTypeVocabulary, mode: listeningModePractice };
  }
  const [type, mode] = hash.split("-");
  return {
    type: [listeningTypeSentence, listeningTypeQa].includes(type) ? type : listeningTypeVocabulary,
    mode: mode === listeningModeTest ? listeningModeTest : listeningModePractice,
  };
}

listeningModeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setListeningActivity(button.dataset.listeningType, button.dataset.listeningMode);
  });
});

window.addEventListener("beforeunload", cancelEnglishSpeech);
window.addEventListener("hashchange", () => {
  const nextActivity = parseListeningHash();
  if (nextActivity.type !== listeningType || nextActivity.mode !== listeningMode) {
    listeningType = nextActivity.type;
    listeningMode = nextActivity.mode;
    renderCurrentMode();
  }
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    cancelEnglishSpeech();
  }
});

const initialActivity = parseListeningHash();
listeningType = initialActivity.type;
listeningMode = initialActivity.mode;
renderCurrentMode();
