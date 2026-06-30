const listeningContent = document.querySelector("#listeningContent");
const listeningProgress = document.querySelector("#listeningProgress");
const listeningSupportMessage = document.querySelector("#listeningSupportMessage");
const listeningModeButtons = Array.from(document.querySelectorAll("[data-listening-type][data-listening-mode]"));

const RESET_PROGRESS_PASSWORD = "104821";

function confirmResetProgressWithPassword(successMessage, resetAction) {
  const password = window.prompt("請輸入重設進度密碼：\n提示：六碼，Vivi生日");

  if (password === null) {
    return false;
  }

  if (password !== RESET_PROGRESS_PASSWORD) {
    window.alert("密碼錯誤，請重新輸入");
    return false;
  }

  const confirmed = window.confirm("密碼正確，確定要重設全部進度嗎？");

  if (!confirmed) {
    return false;
  }

  resetAction();
  window.alert(successMessage);
  return true;
}

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


const geptPictureListeningItems = [
  { id: "gept_picture_001", type: "geptPicture", audioText: "The dog is under the table.", answerId: "picture_dog_under_table", options: [{ id: "picture_dog_under_table", label: "🐶⬇️🪑", alt: "dog under table" }, { id: "picture_cat_on_chair", label: "🐱⬆️🪑", alt: "cat on chair" }, { id: "picture_boy_reading", label: "👦📖", alt: "boy reading" }, { id: "picture_girl_running", label: "👧🏃", alt: "girl running" }], level: "GEPT Elementary" },
  { id: "gept_picture_002", type: "geptPicture", audioText: "The boy is reading a book.", answerId: "picture_boy_reading", options: [{ id: "picture_boy_reading", label: "👦📖", alt: "boy reading" }, { id: "picture_boy_sleeping", label: "👦🛏️", alt: "boy sleeping" }, { id: "picture_girl_running", label: "👧🏃", alt: "girl running" }, { id: "picture_man_driving", label: "👨🚗", alt: "man driving" }], level: "GEPT Elementary" },
  { id: "gept_picture_003", type: "geptPicture", audioText: "The girl is riding a bike.", answerId: "picture_girl_biking", options: [{ id: "picture_girl_biking", label: "👧🚲", alt: "girl riding a bike" }, { id: "picture_girl_running", label: "👧🏃", alt: "girl running" }, { id: "picture_boy_swimming", label: "👦🏊", alt: "boy swimming" }, { id: "picture_dog_sleeping", label: "🐶💤", alt: "dog sleeping" }], level: "GEPT Elementary" },
  { id: "gept_picture_004", type: "geptPicture", audioText: "There are three apples on the desk.", answerId: "picture_three_apples_desk", options: [{ id: "picture_three_apples_desk", label: "🍎🍎🍎🪑", alt: "three apples on desk" }, { id: "picture_one_banana", label: "🍌", alt: "one banana" }, { id: "picture_two_books", label: "📚📚", alt: "two books" }, { id: "picture_milk_cup", label: "🥛", alt: "milk" }], level: "GEPT Elementary" },
  { id: "gept_picture_005", type: "geptPicture", audioText: "The cat is sleeping on the sofa.", answerId: "picture_cat_sofa", options: [{ id: "picture_cat_sofa", label: "🐱💤🛋️", alt: "cat sleeping on sofa" }, { id: "picture_dog_table", label: "🐶🪑", alt: "dog by table" }, { id: "picture_bird_tree", label: "🐦🌳", alt: "bird in tree" }, { id: "picture_fish_bowl", label: "🐟", alt: "fish" }], level: "GEPT Elementary" },
  { id: "gept_picture_006", type: "geptPicture", audioText: "It is raining today.", answerId: "picture_rain", options: [{ id: "picture_rain", label: "🌧️☂️", alt: "rainy day" }, { id: "picture_sunny", label: "☀️", alt: "sunny day" }, { id: "picture_snow", label: "❄️", alt: "snowy day" }, { id: "picture_windy", label: "💨", alt: "windy day" }], level: "GEPT Elementary" },
  { id: "gept_picture_007", type: "geptPicture", audioText: "The teacher is writing on the board.", answerId: "picture_teacher_board", options: [{ id: "picture_teacher_board", label: "👩‍🏫✏️⬛", alt: "teacher writing on board" }, { id: "picture_student_book", label: "🧑📖", alt: "student reading" }, { id: "picture_doctor", label: "👨‍⚕️", alt: "doctor" }, { id: "picture_cook", label: "👩‍🍳", alt: "cook" }], level: "GEPT Elementary" },
  { id: "gept_picture_008", type: "geptPicture", audioText: "The shoes are under the bed.", answerId: "picture_shoes_under_bed", options: [{ id: "picture_shoes_under_bed", label: "👟⬇️🛏️", alt: "shoes under bed" }, { id: "picture_hat_on_chair", label: "🧢⬆️🪑", alt: "hat on chair" }, { id: "picture_bag_on_desk", label: "🎒⬆️🪑", alt: "bag on desk" }, { id: "picture_keys_in_bag", label: "🔑🎒", alt: "keys in bag" }], level: "GEPT Elementary" },
  { id: "gept_picture_009", type: "geptPicture", audioText: "The family is eating dinner.", answerId: "picture_family_dinner", options: [{ id: "picture_family_dinner", label: "👨‍👩‍👧‍👦🍽️", alt: "family eating dinner" }, { id: "picture_children_school", label: "👧👦🏫", alt: "children at school" }, { id: "picture_people_bus", label: "🧑🚌", alt: "people on bus" }, { id: "picture_family_park", label: "👨‍👩‍👧‍👦🌳", alt: "family in park" }], level: "GEPT Elementary" },
  { id: "gept_picture_010", type: "geptPicture", audioText: "The boy is brushing his teeth.", answerId: "picture_boy_brushing", options: [{ id: "picture_boy_brushing", label: "👦🪥", alt: "boy brushing teeth" }, { id: "picture_boy_eating", label: "👦🍔", alt: "boy eating" }, { id: "picture_boy_biking", label: "👦🚲", alt: "boy riding bike" }, { id: "picture_boy_writing", label: "👦✏️", alt: "boy writing" }], level: "GEPT Elementary" },
];

const geptQuestionResponseItems = listeningQuestionAnswers.slice(0, 10).map((item, index) => ({
  id: `gept_qr_${String(index + 1).padStart(3, "0")}`,
  type: "geptQuestionResponse",
  audioText: item.question,
  answer: item.answer,
  options: item.options,
  level: "GEPT Elementary",
}));

const geptConversationListeningItems = [
  { id: "gept_conversation_001", type: "geptConversation", audioText: "A: Where is your brother? B: He is in the kitchen. Question: Where is the boy's brother?", answer: "He is in the kitchen.", options: ["He is in the kitchen.", "He is in the park.", "He is at school.", "He is on the bus."], level: "GEPT Elementary" },
  { id: "gept_conversation_002", type: "geptConversation", audioText: "A: What are you doing? B: I am reading a book. Question: What is the girl doing?", answer: "She is reading a book.", options: ["She is reading a book.", "She is eating lunch.", "She is playing tennis.", "She is washing her hands."], level: "GEPT Elementary" },
  { id: "gept_conversation_003", type: "geptConversation", audioText: "A: How do you go to school? B: I go to school by bus. Question: How does the student go to school?", answer: "The student goes to school by bus.", options: ["The student goes to school by bus.", "The student walks to school.", "The student goes by bike.", "The student goes by train."], level: "GEPT Elementary" },
  { id: "gept_conversation_004", type: "geptConversation", audioText: "A: Is this your pencil? B: Yes, it is. Thank you. Question: What is the boy talking about?", answer: "He is talking about a pencil.", options: ["He is talking about a pencil.", "He is talking about a bag.", "He is talking about a dog.", "He is talking about a bike."], level: "GEPT Elementary" },
  { id: "gept_conversation_005", type: "geptConversation", audioText: "A: What time is lunch? B: Lunch is at twelve. Question: What time is lunch?", answer: "Lunch is at twelve.", options: ["Lunch is at twelve.", "Lunch is at seven.", "Lunch is at eight.", "Lunch is at ten."], level: "GEPT Elementary" },
  { id: "gept_conversation_006", type: "geptConversation", audioText: "A: Do you like bananas? B: No, I like apples. Question: What fruit does the child like?", answer: "The child likes apples.", options: ["The child likes apples.", "The child likes bananas.", "The child likes oranges.", "The child likes grapes."], level: "GEPT Elementary" },
  { id: "gept_conversation_007", type: "geptConversation", audioText: "A: Where is your new cap? B: It is on my bed. Question: Where is the cap?", answer: "It is on the bed.", options: ["It is on the bed.", "It is under the desk.", "It is in the bag.", "It is near the door."], level: "GEPT Elementary" },
  { id: "gept_conversation_008", type: "geptConversation", audioText: "A: Can you swim? B: Yes, I can swim well. Question: What can the child do?", answer: "The child can swim.", options: ["The child can swim.", "The child can cook.", "The child can drive.", "The child can sing."], level: "GEPT Elementary" },
  { id: "gept_conversation_009", type: "geptConversation", audioText: "A: Why are you happy? B: Today is my birthday. Question: Why is the child happy?", answer: "Today is the child's birthday.", options: ["Today is the child's birthday.", "The child has a new dog.", "The child is going home.", "The child likes math."], level: "GEPT Elementary" },
  { id: "gept_conversation_010", type: "geptConversation", audioText: "A: What is your sister wearing? B: She is wearing a red jacket. Question: What is the sister wearing?", answer: "She is wearing a red jacket.", options: ["She is wearing a red jacket.", "She is wearing blue shoes.", "She is wearing a green hat.", "She is wearing a yellow dress."], level: "GEPT Elementary" },
];

const geptShortTalkListeningItems = [
  { id: "gept_shorttalk_001", type: "geptShortTalk", audioText: "Tom is a student. He gets up at seven every morning. He goes to school by bus. Question: How does Tom go to school?", answer: "He goes to school by bus.", options: ["He goes to school by bus.", "He walks to school.", "He goes to school by bike.", "He goes to school by train."], level: "GEPT Elementary" },
  { id: "gept_shorttalk_002", type: "geptShortTalk", audioText: "Amy has a small dog. The dog is white. It likes to run in the park. Question: What color is Amy's dog?", answer: "It is white.", options: ["It is white.", "It is black.", "It is brown.", "It is yellow."], level: "GEPT Elementary" },
  { id: "gept_shorttalk_003", type: "geptShortTalk", audioText: "It is Sunday. Ben and his family are at home. They are eating breakfast together. Question: Where is Ben's family?", answer: "They are at home.", options: ["They are at home.", "They are at school.", "They are in the park.", "They are on a bus."], level: "GEPT Elementary" },
  { id: "gept_shorttalk_004", type: "geptShortTalk", audioText: "Lisa likes music. She plays the piano after school. Her mother listens to her. Question: What does Lisa play?", answer: "She plays the piano.", options: ["She plays the piano.", "She plays soccer.", "She plays basketball.", "She plays the guitar."], level: "GEPT Elementary" },
  { id: "gept_shorttalk_005", type: "geptShortTalk", audioText: "Mark is thirsty. He opens the refrigerator and drinks some milk. Question: What does Mark drink?", answer: "He drinks some milk.", options: ["He drinks some milk.", "He drinks orange juice.", "He drinks water.", "He drinks tea."], level: "GEPT Elementary" },
  { id: "gept_shorttalk_006", type: "geptShortTalk", audioText: "Grace has a red school bag. She puts two books and one pencil case in it. Question: What color is Grace's school bag?", answer: "It is red.", options: ["It is red.", "It is blue.", "It is green.", "It is black."], level: "GEPT Elementary" },
  { id: "gept_shorttalk_007", type: "geptShortTalk", audioText: "Peter visits his grandma on Saturday. They make cookies in the kitchen. Question: When does Peter visit his grandma?", answer: "He visits her on Saturday.", options: ["He visits her on Saturday.", "He visits her on Monday.", "He visits her on Wednesday.", "He visits her on Friday."], level: "GEPT Elementary" },
  { id: "gept_shorttalk_008", type: "geptShortTalk", audioText: "The library is quiet. Many students read books there. The library is on the second floor. Question: Where is the library?", answer: "It is on the second floor.", options: ["It is on the second floor.", "It is near the bus stop.", "It is in the kitchen.", "It is under the tree."], level: "GEPT Elementary" },
  { id: "gept_shorttalk_009", type: "geptShortTalk", audioText: "Nina is in her room. She cleans her desk and finds her keys. Question: What does Nina find?", answer: "She finds her keys.", options: ["She finds her keys.", "She finds her shoes.", "She finds her phone.", "She finds her cap."], level: "GEPT Elementary" },
  { id: "gept_shorttalk_010", type: "geptShortTalk", audioText: "It is hot today. Jack wears a T-shirt and shorts. He wants to drink water. Question: What does Jack want to drink?", answer: "He wants to drink water.", options: ["He wants to drink water.", "He wants to drink milk.", "He wants to drink tea.", "He wants to drink juice."], level: "GEPT Elementary" },
];

const LISTENING_PROGRESS_KEY = "englishListeningProgress_v1";
const LISTENING_MOCK_RESULTS_KEY = "englishListeningMockResults_v1";
const VOCAB_PROGRESS_KEY = "englishVocabProgress_v1";
const LISTENING_PROGRESS_VERSION = 1;
const LISTENING_MOCK_RESULTS_VERSION = 1;
const VOCAB_PROGRESS_VERSION = 1;
const LISTENING_TEST_TARGET_COUNT = 10;
const listeningModePractice = "practice";
const listeningModeTest = "test";
const listeningTypeVocabulary = "vocabulary";
const listeningTypeSentence = "sentence";
const listeningTypeQa = "qa";
const listeningTypeGeptPicture = "geptPicture";
const listeningTypeGeptQuestionResponse = "geptQuestionResponse";
const listeningTypeGeptConversation = "geptConversation";
const listeningTypeGeptShortTalk = "geptShortTalk";
const listeningTypeGeptFullMock = "geptFullMock";
const geptListeningTypes = [listeningTypeGeptPicture, listeningTypeGeptQuestionResponse, listeningTypeGeptConversation, listeningTypeGeptShortTalk];
const futureListeningTypes = [
  "vocabulary",
  "sentence",
  "qa",
  "geptPicture",
  "geptQuestionResponse",
  "geptConversation",
  "geptShortTalk",
  listeningTypeGeptFullMock,
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
let testStartedAt = null;
let mockQuestions = [];
let mockQuestionIndex = 0;
let mockAnsweredQuestionIds = new Set();
let mockPlayedQuestionIds = new Set();
let mockResults = [];
let mockCorrectCount = 0;
let mockPhase = "ready";
let mockSectionIndex = 0;
let mockStartedAt = null;

const mockSectionDefinitions = [
  { type: listeningTypeGeptPicture, orderLabel: "第一部分", label: "看圖辨義", targetCount: 5, wrongTarget: 1, answeredTarget: 1, instruction: "請聽音訊後選出正確圖片。", answerLabel: "圖片" },
  { type: listeningTypeGeptQuestionResponse, orderLabel: "第二部分", label: "問答", targetCount: 10, wrongTarget: 2, answeredTarget: 2, instruction: "請聽音訊後選出最適合的回答。", answerLabel: "英文回答" },
  { type: listeningTypeGeptConversation, orderLabel: "第三部分", label: "簡短對話", targetCount: 10, wrongTarget: 2, answeredTarget: 2, instruction: "請聽對話與問題後選出正確答案。", answerLabel: "英文答案" },
  { type: listeningTypeGeptShortTalk, orderLabel: "第四部分", label: "短文聽解", targetCount: 5, wrongTarget: 1, answeredTarget: 1, instruction: "請聽短文與問題後選出正確答案。", answerLabel: "英文答案" },
];

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
  const geptConfigs = {
    [listeningTypeGeptPicture]: {
      type: listeningTypeGeptPicture,
      label: "看圖辨義",
      practiceTitle: "看圖辨義練習",
      testTitle: "看圖辨義測驗",
      answerLabel: "圖片",
      emptyMessage: "目前沒有可用題目",
      items: geptPictureListeningItems,
      getText: (item) => item.audioText,
      getAnswer: (item) => item.answerId,
      getSourceId: (item) => item.id || item.audioText,
      itemIdPrefix: "listening_geptPicture",
    },
    [listeningTypeGeptQuestionResponse]: {
      type: listeningTypeGeptQuestionResponse,
      label: "GEPT 問答",
      practiceTitle: "問答練習",
      testTitle: "問答測驗",
      answerLabel: "英文回答",
      emptyMessage: "目前沒有可用題目",
      items: geptQuestionResponseItems,
      getText: (item) => item.audioText,
      getAnswer: (item) => item.answer,
      getSourceId: (item) => item.id || item.audioText,
      itemIdPrefix: "listening_geptQuestionResponse",
    },
    [listeningTypeGeptConversation]: {
      type: listeningTypeGeptConversation,
      label: "簡短對話",
      practiceTitle: "簡短對話練習",
      testTitle: "簡短對話測驗",
      answerLabel: "英文答案",
      emptyMessage: "目前沒有可用題目",
      items: geptConversationListeningItems,
      getText: (item) => item.audioText,
      getAnswer: (item) => item.answer,
      getSourceId: (item) => item.id || item.audioText,
      itemIdPrefix: "listening_geptConversation",
    },
    [listeningTypeGeptShortTalk]: {
      type: listeningTypeGeptShortTalk,
      label: "短文聽解",
      practiceTitle: "短文聽解練習",
      testTitle: "短文聽解測驗",
      answerLabel: "英文答案",
      emptyMessage: "目前沒有可用題目",
      items: geptShortTalkListeningItems,
      getText: (item) => item.audioText,
      getAnswer: (item) => item.answer,
      getSourceId: (item) => item.id || item.audioText,
      itemIdPrefix: "listening_geptShortTalk",
    },
  };

  if (geptConfigs[type]) {
    return geptConfigs[type];
  }

  if (type === listeningTypeGeptFullMock) {
    return {
      type: listeningTypeGeptFullMock,
      label: "GEPT 初級聽力模擬",
      practiceTitle: "GEPT 初級聽力模擬測驗",
      testTitle: "GEPT 初級聽力模擬測驗",
      answerLabel: "答案",
      emptyMessage: "目前沒有可用的 GEPT 初級聽力模擬題目。",
      items: geptListeningTypes.flatMap((geptType) => getActivityConfig(geptType).items),
      getText: (item) => item.audioText || item.question || item.text || "",
      getAnswer: (item) => item.answerId || item.answer || "",
      getSourceId: (item) => item.id || item.audioText || item.question || item.text,
      itemIdPrefix: "listening_geptFullMock",
    };
  }

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
  if (geptListeningTypes.includes(type) && typeof item?.id === "string" && item.id.trim()) {
    const geptId = item.id.trim().replace(/^gept_(picture|qr|conversation|shorttalk)_/, "");
    return `${config.itemIdPrefix}_${geptId}`;
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
    updatedAt: typeof record.updatedAt === "string" ? record.updatedAt : null,
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
  next.updatedAt = now;
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

function getOptionValue(option) {
  if (option && typeof option === "object") {
    return option.id || option.answer || option.label || "";
  }
  return option || "";
}

function getOptionLabel(option) {
  if (option && typeof option === "object") {
    return option.label || option.alt || option.id || "";
  }
  return option || "";
}

function getOptionAlt(option) {
  if (option && typeof option === "object") {
    return option.alt || option.label || option.id || "";
  }
  return getOptionLabel(option);
}

function findOptionByValue(item, value) {
  return Array.isArray(item?.options) ? item.options.find((option) => getOptionValue(option) === value) : null;
}

function formatAnswerForReview(item, answer, type = listeningType) {
  if (type !== listeningTypeGeptPicture) {
    return answer || "未作答";
  }
  const option = findOptionByValue(item, answer);
  const label = option ? getOptionLabel(option) : answer;
  const alt = option ? getOptionAlt(option) : "";
  return alt && alt !== label ? `${label} (${alt})` : label;
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
  const seenValues = new Set();
  [findOptionByValue(currentItem, correctAnswer) || correctAnswer, ...optionSource].forEach((option) => {
    const value = getOptionValue(option);
    if (value && !seenValues.has(value)) {
      seenValues.add(value);
      uniqueOptions.push(option);
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


function createEmptyMockResults() {
  return {
    version: LISTENING_MOCK_RESULTS_VERSION,
    updatedAt: new Date().toISOString(),
    attempts: [],
  };
}

function normalizeMockSectionRecord(record = {}) {
  return {
    total: normalizeListeningNumber(record.total),
    correct: normalizeListeningNumber(record.correct),
    wrong: normalizeListeningNumber(record.wrong),
  };
}

function normalizeMockResults(results) {
  const normalized = createEmptyMockResults();
  normalized.updatedAt = typeof results?.updatedAt === "string" ? results.updatedAt : normalized.updatedAt;
  if (Array.isArray(results?.attempts)) {
    normalized.attempts = results.attempts
      .filter((attempt) => attempt && typeof attempt === "object" && !Array.isArray(attempt))
      .map((attempt) => ({
        id: typeof attempt.id === "string" ? attempt.id : `mock_${attempt.startedAt || new Date().toISOString()}`,
        startedAt: typeof attempt.startedAt === "string" ? attempt.startedAt : null,
        finishedAt: typeof attempt.finishedAt === "string" ? attempt.finishedAt : null,
        totalQuestions: normalizeListeningNumber(attempt.totalQuestions),
        correctCount: normalizeListeningNumber(attempt.correctCount),
        wrongCount: normalizeListeningNumber(attempt.wrongCount),
        accuracy: normalizeListeningNumber(attempt.accuracy),
        sections: mockSectionDefinitions.reduce((sections, section) => {
          sections[section.type] = normalizeMockSectionRecord(attempt.sections?.[section.type]);
          return sections;
        }, {}),
      }));
  }
  return normalized;
}

function loadMockResults() {
  const emptyResults = createEmptyMockResults();
  if (!canUseListeningLocalStorage()) {
    return emptyResults;
  }
  try {
    const storedResults = window.localStorage.getItem(LISTENING_MOCK_RESULTS_KEY);
    if (!storedResults) {
      window.localStorage.setItem(LISTENING_MOCK_RESULTS_KEY, JSON.stringify(emptyResults));
      return emptyResults;
    }
    const parsedResults = JSON.parse(storedResults);
    if (!parsedResults || parsedResults.version !== LISTENING_MOCK_RESULTS_VERSION) {
      throw new Error("Invalid listening mock results data");
    }
    const normalizedResults = normalizeMockResults(parsedResults);
    window.localStorage.setItem(LISTENING_MOCK_RESULTS_KEY, JSON.stringify(normalizedResults));
    return normalizedResults;
  } catch (error) {
    try {
      window.localStorage.setItem(LISTENING_MOCK_RESULTS_KEY, JSON.stringify(emptyResults));
    } catch (storageError) {
      // Mock tests remain usable even when storage is unavailable.
    }
    return emptyResults;
  }
}

function saveMockAttempt(attempt) {
  const results = loadMockResults();
  const now = new Date().toISOString();
  results.attempts = [attempt, ...results.attempts].slice(0, 50);
  results.updatedAt = now;
  if (!canUseListeningLocalStorage()) {
    return normalizeMockResults(results);
  }
  try {
    window.localStorage.setItem(LISTENING_MOCK_RESULTS_KEY, JSON.stringify(results));
  } catch (error) {
    // Summary history is optional; keep the result screen usable.
  }
  return normalizeMockResults(results);
}

function resetMockResults() {
  if (!canUseListeningLocalStorage()) {
    return;
  }
  try {
    window.localStorage.removeItem(LISTENING_MOCK_RESULTS_KEY);
  } catch (error) {
    // Ignore storage errors and keep the page usable.
  }
}

function selectListeningQuestionsByType(type, targetCount, wrongTarget, answeredTarget, usedIds = new Set()) {
  const config = getActivityConfig(type);
  const availableQuestions = shuffleListeningItems(config.items).slice(0);
  const progress = loadListeningProgress();
  const wrongPool = [];
  const answeredPool = [];
  const unseenPool = [];

  availableQuestions.forEach((item) => {
    const itemId = getListeningItemId(item, type);
    if (usedIds.has(itemId)) {
      return;
    }
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

  const selected = [];
  const addFromPool = (pool, count) => {
    shuffleListeningItems(pool).forEach((item) => {
      const itemId = getListeningItemId(item, type);
      if (selected.length >= targetCount || count <= 0 || usedIds.has(itemId)) {
        return;
      }
      usedIds.add(itemId);
      selected.push(item);
      count -= 1;
    });
  };

  addFromPool(wrongPool, wrongTarget);
  addFromPool(answeredPool, answeredTarget);
  addFromPool(unseenPool, targetCount - selected.length);
  addFromPool([...wrongPool, ...answeredPool, ...unseenPool], targetCount - selected.length);
  return selected.slice(0, targetCount);
}

function selectMockQuestions() {
  const usedIds = new Set();
  const selected = [];
  mockSectionDefinitions.forEach((section) => {
    const sectionItems = selectListeningQuestionsByType(section.type, section.targetCount, section.wrongTarget, section.answeredTarget, usedIds);
    sectionItems.forEach((item, index) => {
      selected.push({
        item,
        type: section.type,
        section,
        sectionIndex: mockSectionDefinitions.indexOf(section),
        sectionOrder: index + 1,
      });
    });
  });
  return selected.map((entry, index) => ({ ...entry, order: index + 1 }));
}

function getMockSectionEntries(sectionIndex) {
  return mockQuestions.filter((entry) => entry.sectionIndex === sectionIndex);
}

function findNextMockSectionIndex(startIndex) {
  for (let index = startIndex; index < mockSectionDefinitions.length; index += 1) {
    if (getMockSectionEntries(index).length) {
      return index;
    }
  }
  return -1;
}

function getMockQuestionEntry() {
  return mockQuestions[mockQuestionIndex];
}

function getMockSectionStatsFromResults() {
  return mockSectionDefinitions.reduce((stats, section) => {
    const sectionResults = mockResults.filter((result) => result.type === section.type);
    const correct = sectionResults.filter((result) => result.result === "correct").length;
    stats[section.type] = {
      total: sectionResults.length,
      correct,
      wrong: sectionResults.length - correct,
    };
    return stats;
  }, {});
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

  if (listeningType === listeningTypeGeptFullMock) {
    renderMockPreparation();
    return;
  }

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
    "不顯示英文播放稿",
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

function createListeningOptionButton(option, index, type = listeningType) {
  const optionButton = document.createElement("button");
  optionButton.className = "quiz-option gept-quiz-option";
  optionButton.type = "button";
  optionButton.dataset.answer = getOptionValue(option);
  if (type === listeningTypeGeptPicture) {
    optionButton.classList.add("gept-picture-option");
    optionButton.setAttribute("aria-label", `${String.fromCharCode(65 + index)}. ${getOptionAlt(option)}`);
    const letter = document.createElement("span");
    letter.className = "gept-picture-letter";
    letter.textContent = `${String.fromCharCode(65 + index)}.`;
    const imageLabel = document.createElement("span");
    imageLabel.className = "gept-picture-label";
    imageLabel.textContent = getOptionLabel(option);
    optionButton.append(letter, imageLabel);
    return optionButton;
  }
  optionButton.textContent = `${String.fromCharCode(65 + index)}. ${getOptionLabel(option)}`;
  return optionButton;
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

  practiceCurrentOptions.forEach((option, index) => {
    const optionButton = createListeningOptionButton(option, index);
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
  const correctAnswerText = formatAnswerForReview(currentItem, correctAnswer);
  feedback.textContent = isCorrect ? `答對了！${reviewText}` : `答錯了，正確${config.answerLabel}是：${correctAnswerText}${reviewText}`;
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
  testStartedAt = null;
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
    "不顯示英文播放稿",
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
    testStartedAt = new Date().toISOString();
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
  testCurrentOptions.forEach((option, index) => {
    const optionButton = createListeningOptionButton(option, index);
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
    item: currentItem,
    type: listeningType,
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
    const userAnswer = formatAnswerForReview(result.item, result.userAnswer, result.type);
    const correctAnswer = formatAnswerForReview(result.item, result.correctAnswer, result.type);
    const transcriptLabel = config.type === listeningTypeGeptPicture
      ? "英文播放稿"
      : config.type === listeningTypeQa || config.type === listeningTypeGeptQuestionResponse
        ? "英文問句"
        : config.type === listeningTypeGeptConversation
          ? "英文對話播放稿"
          : config.type === listeningTypeGeptShortTalk
            ? "英文短文播放稿"
            : "英文播放稿";
    const transcriptText = config.type === listeningTypeVocabulary || config.type === listeningTypeSentence ? "" : `${transcriptLabel}：${result.question}｜`;
    item.textContent = `第 ${result.order} 題｜${transcriptText}你的答案：${userAnswer}｜正確${config.answerLabel}：${correctAnswer}｜結果：${result.result === "correct" ? "答對" : "答錯"}`;
    list.append(item);
  });
  return list;
}

function getListeningEntryHref() {
  return "./";
}

function renderTestCompletePanel() {
  cancelEnglishSpeech();
  testPhase = "complete";
  const config = getActivityConfig();
  const total = testResults.length;
  const wrongCount = total - testCorrectCount;
  const accuracy = total ? Math.round((testCorrectCount / total) * 100) : 0;
  const endedAt = new Date().toISOString();
  recordEnglishLearningSession({
    module: "listening",
    mode: "quiz",
    totalQuestions: total,
    correctCount: testCorrectCount,
    wrongCount,
    durationSeconds: testStartedAt ? Math.max(0, Math.round((new Date(endedAt) - new Date(testStartedAt)) / 1000)) : 0,
    startedAt: testStartedAt || endedAt,
    endedAt,
  });
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
  homeLink.href = getListeningEntryHref();
  homeLink.textContent = "回聽力入口頁";
  actions.append(retryButton, homeLink);
  card.append(title, summary, createTestResultList(), actions);
  listeningContent.replaceChildren(card);
}


function resetMockState() {
  cancelEnglishSpeech();
  mockQuestions = selectMockQuestions();
  mockQuestionIndex = 0;
  mockAnsweredQuestionIds = new Set();
  mockPlayedQuestionIds = new Set();
  mockResults = [];
  mockCorrectCount = 0;
  mockPhase = "ready";
  mockSectionIndex = findNextMockSectionIndex(0);
  mockStartedAt = null;
}

function getMockAvailableCounts() {
  return mockSectionDefinitions.reduce((counts, section) => {
    counts[section.type] = mockQuestions.filter((entry) => entry.type === section.type).length;
    return counts;
  }, {});
}

function renderMockHistory(container) {
  const results = loadMockResults();
  const history = document.createElement("div");
  history.className = "quiz-ready-details";
  const heading = document.createElement("h4");
  heading.textContent = "查看模擬測驗紀錄";
  history.append(heading);
  if (!results.attempts.length) {
    const empty = document.createElement("p");
    empty.textContent = "目前尚無模擬測驗紀錄。";
    history.append(empty);
  } else {
    const list = document.createElement("ol");
    list.className = "quiz-result-list";
    results.attempts.slice(0, 5).forEach((attempt) => {
      const item = document.createElement("li");
      const sectionSummary = mockSectionDefinitions.map((section) => {
        const stat = attempt.sections?.[section.type] || { total: 0, correct: 0, wrong: 0 };
        return `${section.label} ${stat.correct}/${stat.total}`;
      }).join("｜");
      item.textContent = `${attempt.finishedAt || attempt.startedAt || "未記錄時間"}｜總題數：${attempt.totalQuestions}｜答對：${attempt.correctCount}｜答錯：${attempt.wrongCount}｜正確率：${attempt.accuracy}%｜${sectionSummary}`;
      list.append(item);
    });
    history.append(list);
  }
  container.append(history);
}

function renderMockPreparation() {
  resetMockState();
  const total = mockQuestions.length;
  listeningProgress.textContent = `GEPT 初級聽力模擬測驗準備中：0 / ${total}`;
  const card = document.createElement("article");
  card.className = "quiz-card quiz-ready-card gept-quiz-card";
  const badge = document.createElement("span");
  badge.className = "card-number";
  badge.textContent = "測驗準備";
  const title = document.createElement("h3");
  title.className = "quiz-title";
  title.textContent = "GEPT 初級聽力模擬測驗";
  const details = document.createElement("div");
  details.className = "quiz-ready-details";
  const counts = getMockAvailableCounts();
  const totalLine = total === 30 ? "本次測驗：30 題" : `本次可用題數：${total} 題`;
  [
    totalLine,
    `第一部分：看圖辨義 ${counts[listeningTypeGeptPicture] || 0} 題`,
    `第二部分：問答 ${counts[listeningTypeGeptQuestionResponse] || 0} 題`,
    `第三部分：簡短對話 ${counts[listeningTypeGeptConversation] || 0} 題`,
    `第四部分：短文聽解 ${counts[listeningTypeGeptShortTalk] || 0} 題`,
    "音訊只能播放一次",
    "不顯示中文提示",
    "不顯示英文播放稿",
    "不設定答題秒數",
  ].forEach((text) => {
    const item = document.createElement("p");
    item.textContent = text;
    details.append(item);
  });

  const actions = document.createElement("div");
  actions.className = "quiz-actions";
  const startButton = createModeActionButton("開始測驗", () => {
    if (!mockQuestions.length) {
      return;
    }
    mockPhase = "sectionReady";
    mockStartedAt = new Date().toISOString();
    mockSectionIndex = findNextMockSectionIndex(0);
    renderMockSectionIntro();
  });
  startButton.disabled = total === 0;
  actions.append(startButton);
  const resetButton = createModeActionButton("重設聽力模擬測驗紀錄", () => {
    confirmResetProgressWithPassword("聽力模擬測驗紀錄已清除。日文資料未受影響。", () => {
      resetMockResults();
      renderMockPreparation();
    });
  }, "secondary-button");
  actions.append(resetButton);

  card.append(badge, title, details);
  if (!total) {
    const emptyMessage = document.createElement("p");
    emptyMessage.className = "status-message quiz-status-message";
    emptyMessage.textContent = "目前沒有可用的 GEPT 初級聽力模擬題目。";
    card.append(emptyMessage);
  }
  card.append(actions);
  renderMockHistory(card);
  listeningContent.replaceChildren(card);
}

function renderMockSectionIntro() {
  cancelEnglishSpeech();
  if (mockSectionIndex < 0) {
    renderMockCompletePanel();
    return;
  }
  const section = mockSectionDefinitions[mockSectionIndex];
  const sectionEntries = getMockSectionEntries(mockSectionIndex);
  listeningProgress.textContent = `GEPT 初級聽力模擬測驗：${mockResults.length} / ${mockQuestions.length}`;
  const card = document.createElement("article");
  card.className = "quiz-card quiz-ready-card gept-quiz-card";
  const badge = document.createElement("span");
  badge.className = "card-number";
  badge.textContent = section.orderLabel;
  const title = document.createElement("h3");
  title.className = "quiz-title";
  title.textContent = `${section.orderLabel}：${section.label}`;
  const details = document.createElement("div");
  details.className = "quiz-ready-details";
  [`共 ${sectionEntries.length} 題`, section.instruction, "按下開始本部分後才會播放音訊。"].forEach((text) => {
    const item = document.createElement("p");
    item.textContent = text;
    details.append(item);
  });
  const startButton = createModeActionButton("開始本部分", () => {
    const firstQuestionIndex = mockQuestions.findIndex((entry) => entry.sectionIndex === mockSectionIndex && !mockResults.some((result) => result.order === entry.order));
    mockQuestionIndex = firstQuestionIndex >= 0 ? firstQuestionIndex : mockQuestionIndex;
    mockPhase = "running";
    renderMockQuestion();
  });
  card.append(badge, title, details, startButton);
  listeningContent.replaceChildren(card);
}

function playMockItemOnce(entry) {
  const itemId = getListeningItemId(entry.item, entry.type);
  if (mockPlayedQuestionIds.has(itemId)) {
    return;
  }
  mockPlayedQuestionIds.add(itemId);
  if (speakEnglish(getItemText(entry.item, entry.type))) {
    recordListeningPlay(entry.item, listeningModeTest, entry.type);
  }
}

function renderMockQuestion() {
  cancelEnglishSpeech();
  if (mockPhase !== "running") {
    renderMockPreparation();
    return;
  }
  const entry = getMockQuestionEntry();
  if (!entry) {
    renderMockCompletePanel();
    return;
  }

  recordListeningSeen(entry.item, entry.type);
  const options = getListeningOptions(entry.item, entry.type);
  const sectionEntries = getMockSectionEntries(entry.sectionIndex);
  listeningProgress.textContent = `GEPT 初級聽力模擬測驗：${entry.order} / ${mockQuestions.length}`;

  const card = document.createElement("article");
  card.className = "quiz-card gept-quiz-card";
  const prompt = document.createElement("div");
  prompt.className = "quiz-prompt";
  const title = document.createElement("p");
  title.className = "quiz-prompt-label";
  title.textContent = "GEPT 初級聽力模擬測驗";
  const sectionLabel = document.createElement("p");
  sectionLabel.className = "gept-quiz-instruction";
  sectionLabel.textContent = `${entry.section.orderLabel}：${entry.section.label}`;
  const orderLabel = document.createElement("p");
  orderLabel.className = "listening-play-status";
  orderLabel.textContent = `第 ${entry.order} / ${mockQuestions.length} 題｜${entry.section.label} 第 ${entry.sectionOrder} / ${sectionEntries.length} 題`;
  const instruction = document.createElement("p");
  instruction.className = "gept-quiz-instruction";
  instruction.textContent = entry.section.instruction;
  const playStatus = document.createElement("p");
  playStatus.className = "listening-play-status";
  playStatus.textContent = "音訊已播放一次，請作答。";
  prompt.append(title, sectionLabel, orderLabel, instruction, playStatus);

  const optionList = document.createElement("div");
  optionList.className = "quiz-options gept-quiz-options";
  options.forEach((option, index) => {
    const optionButton = createListeningOptionButton(option, index, entry.type);
    optionButton.addEventListener("click", () => handleMockAnswer(optionButton, entry));
    optionList.append(optionButton);
  });

  card.append(prompt, optionList);
  listeningContent.replaceChildren(card);
  playMockItemOnce(entry);
}

function handleMockAnswer(selectedButton, entry) {
  if (mockPhase !== "running") {
    return;
  }
  const itemId = getListeningItemId(entry.item, entry.type);
  if (mockAnsweredQuestionIds.has(itemId)) {
    return;
  }
  mockAnsweredQuestionIds.add(itemId);
  const correctAnswer = getItemAnswer(entry.item, entry.type);
  const selectedAnswer = selectedButton.dataset.answer;
  const isCorrect = selectedAnswer === correctAnswer;
  recordListeningAnswer(entry.item, isCorrect, entry.type);
  if (isCorrect) {
    mockCorrectCount += 1;
  }
  mockResults.push({
    order: entry.order,
    sectionOrder: entry.sectionOrder,
    sectionLabel: `${entry.section.orderLabel}：${entry.section.label}`,
    userAnswer: selectedAnswer,
    question: getItemText(entry.item, entry.type),
    correctAnswer,
    item: entry.item,
    type: entry.type,
    result: isCorrect ? "correct" : "wrong",
  });
  listeningContent.querySelectorAll(".gept-quiz-option").forEach((button) => {
    button.disabled = true;
  });

  window.setTimeout(() => {
    const nextIndex = mockQuestionIndex + 1;
    if (nextIndex >= mockQuestions.length) {
      renderMockCompletePanel();
      return;
    }
    const nextEntry = mockQuestions[nextIndex];
    mockQuestionIndex = nextIndex;
    if (nextEntry.sectionIndex !== entry.sectionIndex) {
      mockSectionIndex = nextEntry.sectionIndex;
      mockPhase = "sectionReady";
      renderMockSectionIntro();
      return;
    }
    renderMockQuestion();
  }, 450);
}

function getMockTranscriptLabel(type) {
  if (type === listeningTypeGeptQuestionResponse) {
    return "英文問句播放稿";
  }
  if (type === listeningTypeGeptConversation) {
    return "英文對話播放稿";
  }
  if (type === listeningTypeGeptShortTalk) {
    return "英文短文播放稿";
  }
  return "英文播放稿";
}

function createMockSectionSummary(stats) {
  const list = document.createElement("div");
  list.className = "quiz-ready-details";
  mockSectionDefinitions.forEach((section) => {
    const sectionStats = stats[section.type] || { total: 0, correct: 0, wrong: 0 };
    const accuracy = sectionStats.total ? Math.round((sectionStats.correct / sectionStats.total) * 100) : 0;
    const item = document.createElement("p");
    item.textContent = `${section.label}：總題數 ${sectionStats.total}｜答對 ${sectionStats.correct}｜答錯 ${sectionStats.wrong}｜正確率 ${accuracy}%`;
    list.append(item);
  });
  return list;
}

function createMockResultList() {
  const list = document.createElement("ol");
  list.className = "quiz-result-list";
  mockResults.forEach((result) => {
    const item = document.createElement("li");
    const userAnswer = formatAnswerForReview(result.item, result.userAnswer, result.type);
    const correctAnswer = formatAnswerForReview(result.item, result.correctAnswer, result.type);
    const transcriptText = result.type === listeningTypeGeptPicture ? "" : `${getMockTranscriptLabel(result.type)}：${result.question}｜`;
    item.textContent = `第 ${result.order} 題｜${result.sectionLabel}｜${transcriptText}你的答案：${userAnswer}｜正確答案：${correctAnswer}｜結果：${result.result === "correct" ? "答對" : "答錯"}`;
    list.append(item);
  });
  return list;
}

function renderMockCompletePanel() {
  cancelEnglishSpeech();
  mockPhase = "complete";
  const total = mockResults.length;
  const wrongCount = total - mockCorrectCount;
  const accuracy = total ? Math.round((mockCorrectCount / total) * 100) : 0;
  const finishedAt = new Date().toISOString();
  const sectionStats = getMockSectionStatsFromResults();
  const attempt = {
    id: `mock_${finishedAt}`,
    startedAt: mockStartedAt || finishedAt,
    finishedAt,
    totalQuestions: total,
    correctCount: mockCorrectCount,
    wrongCount,
    accuracy,
    sections: sectionStats,
  };
  if (total) {
    saveMockAttempt(attempt);
    recordEnglishLearningSession({
      module: "listening",
      mode: "quiz",
      totalQuestions: total,
      correctCount: mockCorrectCount,
      wrongCount,
      durationSeconds: mockStartedAt ? Math.max(0, Math.round((new Date(finishedAt) - new Date(mockStartedAt)) / 1000)) : 0,
      startedAt: mockStartedAt || finishedAt,
      endedAt: finishedAt,
    });
  }
  listeningProgress.textContent = `GEPT 初級聽力模擬測驗完成：${total} / ${total}`;

  const card = document.createElement("article");
  card.className = "quiz-card gept-quiz-card";
  const title = document.createElement("h3");
  title.className = "quiz-title";
  title.textContent = "GEPT 初級聽力模擬測驗";
  const summary = document.createElement("p");
  summary.className = "article-result-message";
  summary.textContent = `總題數：${total} 題｜答對：${mockCorrectCount} 題｜答錯：${wrongCount} 題｜正確率：${accuracy}%`;
  const actions = document.createElement("div");
  actions.className = "quiz-actions";
  const retryButton = createModeActionButton("再測一次", renderMockPreparation);
  const homeLink = document.createElement("a");
  homeLink.className = "secondary-button";
  homeLink.href = getListeningEntryHref();
  homeLink.textContent = "回聽力入口頁";
  actions.append(retryButton, homeLink);
  card.append(title, summary, createMockSectionSummary(sectionStats), createMockResultList(), actions);
  listeningContent.replaceChildren(card);
}

function setListeningActivity(type, mode) {
  if (listeningType === type && listeningMode === mode) {
    return;
  }
  listeningType = type;
  listeningMode = mode;
  const pageName = window.location.pathname.split("/").pop();
  if (pageName === "practice.html" || pageName === "quiz.html") {
    const targetPage = mode === listeningModeTest ? "quiz.html" : "practice.html";
    window.location.href = `${targetPage}?type=${encodeURIComponent(type)}`;
    return;
  }
  window.location.hash = `${type}-${mode}`;
  renderCurrentMode();
}

function parseListeningActivityFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const pageName = window.location.pathname.split("/").pop();
  const requestedType = params.get("type") || "";
  const validTypes = [
    listeningTypeVocabulary,
    listeningTypeSentence,
    listeningTypeQa,
    ...geptListeningTypes,
    listeningTypeGeptFullMock,
  ];
  const type = validTypes.includes(requestedType) ? requestedType : listeningTypeVocabulary;

  if (pageName === "quiz.html") {
    return { type, mode: listeningModeTest };
  }

  if (pageName === "practice.html") {
    return {
      type: type === listeningTypeGeptFullMock ? listeningTypeGeptPicture : type,
      mode: listeningModePractice,
    };
  }

  return null;
}

function parseListeningHash() {
  const urlActivity = parseListeningActivityFromUrl();
  if (urlActivity) {
    return urlActivity;
  }

  const hash = window.location.hash.replace("#", "");
  if (hash === "test") {
    return { type: listeningTypeVocabulary, mode: listeningModeTest };
  }
  if (hash === "practice") {
    return { type: listeningTypeVocabulary, mode: listeningModePractice };
  }
  const [type, mode] = hash.split("-");
  const supportedTypes = [listeningTypeSentence, listeningTypeQa, ...geptListeningTypes, listeningTypeGeptFullMock];
  return {
    type: supportedTypes.includes(type) ? type : listeningTypeVocabulary,
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
