export interface Phrase {
  ko: string;
  mn: string;
  pron: string;
  audio?: string; // /audio/phrasebook/{섹션키}_{인덱스}.mp3
}

export interface PhrasebookSection {
  key: string;
  title: string;
  emoji: string;
  numbered?: boolean;
  phrases: Phrase[];
}

export const phrasebookData: PhrasebookSection[] = [
  {
    key: "greeting",
    title: "기본 인사 & 자기소개",
    emoji: "🤝",
    phrases: [
      { ko: "안녕하세요", mn: "Сайн байна уу?", pron: "새앵 배노?" },
      { ko: "안녕 (반말)", mn: "Сайн уу?", pron: "새노?" },
      { ko: "감사합니다", mn: "Баярлалаа.", pron: "바야를라아." },
      { ko: "만나서 반가워요", mn: "Уулзсандаа баяртай байна.", pron: "오올쯔싼다 바야르태 배나" },
      { ko: "제 이름은 ○○입니다", mn: "Миний нэрийг ○○ гэдэг.", pron: "미니 네리그 ○○ 게덱" },
      { ko: "저는 한국에서 왔어요", mn: "Би Солонгосоос ирсэн.", pron: "비 솔롱거스어스 이르센" },
      { ko: "네", mn: "Тийм", pron: "팀" },
      { ko: "아니요", mn: "Үгүй", pron: "위구이" },
      { ko: "미안합니다 / 실례합니다", mn: "Уучлаарай.", pron: "오오칠라래" },
      { ko: "안녕히 가세요", mn: "Баяртай.", pron: "바야르태" },
    ],
  },
  {
    key: "blessing",
    title: "축복 & 사랑의 표현",
    emoji: "💚",
    phrases: [
      { ko: "하나님은 당신을 사랑하십니다", mn: "Бурхан танд хайртай.", pron: "부르항 탄드 해르태", audio: "/audio/phrasebook/blessing_0.mp3" },
      { ko: "하나님의 축복이 있기를 바랍니다", mn: "Бурхан таныг ивээх болтугай.", pron: "부르항 타닉 이웨-흐 볼토개", audio: "/audio/phrasebook/blessing_1.mp3" },
      { ko: "당신을 위해 기도하겠습니다", mn: "Би таны төлөө залбиръя.", pron: "비 타니 털러 잘비리야", audio: "/audio/phrasebook/blessing_2.mp3" },
      { ko: "예수님은 당신의 친구입니다", mn: "Есүс бол таны найз.", pron: "예수쓰 볼 타니 내즈", audio: "/audio/phrasebook/blessing_3.mp3" },
      { ko: "당신은 소중한 사람입니다", mn: "Та бол эрхэм нандин хүн.", pron: "타 볼 에르헴 난딩 훙", audio: "/audio/phrasebook/blessing_4.mp3" },
      { ko: "만나서 정말 기쁩니다", mn: "Уулзсандаа маш их баяртай байна.", pron: "오올쯔싼다 마시 이흐 바야르태 배나", audio: "/audio/phrasebook/blessing_5.mp3" },
    ],
  },
  {
    key: "gospel",
    title: "복음 핵심 메시지",
    emoji: "✝️",
    numbered: true,
    phrases: [
      {
        ko: "하나님은 세상을 만드시고 사람을 만드셨습니다.",
        mn: "Бурхан ертөнцийг бүтээж, дараа нь хүнийг бүтээсэн.",
        pron: "부르항 예르툽치익 부텡쥬, 다라안 후닝 부텡셍",
        audio: "/audio/phrasebook/gospel_0.mp3",
      },
      {
        ko: "하나님은 모든 사람이 천국에 가기를 원하십니다.",
        mn: "Мөн Бурхан бүх хүнийг диваажинд очоосой гэж хүсдэг.",
        pron: "믕 부르항 부흐 후니익 디와진드 오초-세- 게쥬 후스덱",
        audio: "/audio/phrasebook/gospel_1.mp3",
      },
      {
        ko: "하지만 모든 인간은 죄인입니다.",
        mn: "Гэвч бүх хүн нүгэлтэн юм.",
        pron: "게브치 부흐 훙 누글텡 윰",
        audio: "/audio/phrasebook/gospel_2.mp3",
      },
      {
        ko: "죄인은 천국에 가는 것이 불가능합니다.",
        mn: "Нүгэлт хүн диваажинд очих боломжгүй.",
        pron: "누글트 훙 디와진드 오치흐 볼름지구이",
        audio: "/audio/phrasebook/gospel_3.mp3",
      },
      {
        ko: "그래서 예수님은 우리의 죄값을 치르기 위해 십자가에서 죽으셨습니다.",
        mn: "Тиймээс Есүс бидний нүглийн төлөөсийг төлөхийн тулд загалмай дээр нас барсан.",
        pron: "티메-세 예수-스 비드니 누글링 툘레-시익 툘러히- 투읻 자갈마이 데-르 나스 바르상",
        audio: "/audio/phrasebook/gospel_4.mp3",
      },
      {
        ko: "그리고 3일 만에 부활하셨습니다.",
        mn: "Тэгээд Тэрээр гурав хоногийн дараа дахин амилсан.",
        pron: "테게-드 테레-르 구랍 호녹깅 다라- 다힝 아밀상",
        audio: "/audio/phrasebook/gospel_5.mp3",
      },
      {
        ko: "예수님을 믿으면 천국에 갈 수 있습니다.",
        mn: "Есүст итгэвэл та диваажинд очиж чадна.",
        pron: "예수스트 잇게벨 타 디와진드 오치쥬 차드나",
        audio: "/audio/phrasebook/gospel_6.mp3",
      },
      {
        ko: "예수님을 구원자로 영접하길 원하십니까?",
        mn: "Та Есүсийг өөрийн Аврагчаар хүлээн авахад бэлэн байна уу?",
        pron: "타 예수-시익 어-링 아우락차-르 훌렝 아와하드 벨렙 뱅 노?",
        audio: "/audio/phrasebook/gospel_7.mp3",
      },
      {
        ko: "당신을 위해 기도해도 될까요?",
        mn: "Би таны төлөө залбирч болох уу?",
        pron: "비 타니 툘레- 잘비르치 볼로 후?",
        audio: "/audio/phrasebook/gospel_8.mp3",
      },
      {
        ko: "예수님의 이름으로 기도했습니다. 아멘.",
        mn: "Есүсийн нэрээр залбирлаа. Амен.",
        pron: "예수싱 네레-르 잘비를라. 아멘",
        audio: "/audio/phrasebook/gospel_9.mp3",
      },
    ],
  },
  {
    key: "daily",
    title: "일상 표현",
    emoji: "💬",
    phrases: [
      { ko: "이게 뭐예요?", mn: "Энэ юу вэ?", pron: "엔 유 웨?" },
      { ko: "맛있어요!", mn: "Амттай байна!", pron: "암따태 배나!" },
      { ko: "화장실이 어디예요?", mn: "Бие засах газар хаана вэ?", pron: "비에 자사흐 가자르 하아나 웨?" },
      { ko: "도와주세요!", mn: "Надад туслаарай!", pron: "나다드 투슬라-래!" },
      { ko: "맛있게 드세요!", mn: "Сайхан хооллоорой!", pron: "새항 홀로-레!" },
      { ko: "천천히 말씀해 주세요", mn: "Удаан яриач.", pron: "오당 야리아츠" },
      { ko: "다시 한번 말씀해 주세요", mn: "Дахиад хэлээч.", pron: "다햐드 헬레-츠" },
      { ko: "잠시만요", mn: "Түр хүлээнэ үү.", pron: "튀르 훌레-네 오" },
      { ko: "힘내! (파이팅!)", mn: "Амжилт!", pron: "암질트!" },
    ],
  },
];
