const questions = [
  "最初に遊んだゲームは？",
  "一番プレイ時間が長いゲームは？",
  "一番簡単だったゲームは？",
  "一番難しかったゲームは？",
  "何度も遊んだゲームは？",
  "面白かった!!けど、一回だけしかクリアしてないゲームは？",
  "友達と一番遊んだゲームは？",
  "一人でじっくり遊びたいゲームは？",
  "子どもの頃から好きだったゲームは？",
  "大人になってから好きになったゲームは？",
  "これはクソゲーだなとおもったゲームは？",
  "音楽が好きなゲームは？",
  "ストーリーが好きなゲームは？",
  "キャラクターが好きなゲームは？",
  "世界観が好きなゲームは？",
  "グラフィックが印象的なゲームは？",
  "一番泣いたゲームは？",
  "一番笑ったゲームは？",
  "今でも続けて遊んでいるゲームは？",
  "クリアするまで一番時間がかかったゲームは？",
  "誰かにおすすめしたいゲームは？",
  "もっと評価されてほしいゲームは？",
  "隠れた名作だと思うゲームは？",
  "リメイクしてほしいゲームは？",
  "記憶を消してもう一度最初から遊びたいゲームは？",
  "怖かったゲームは？",
  "世間で高評価だけど自分に合わなかったゲームは？",
  "一番最近遊んだゲームは？",
  "人生に影響を与えたゲームは？",
  "一番好きなゲームは？"
];

const STORAGE_KEY = "game30Challenge";

const DB_NAME = "game30ChallengeDB";
const DB_VERSION = 1;
const STORE_NAME = "images";

let db;

// --------------------
// データ
// --------------------

let gameChallengeData = {
  answers: Array.from(
    { length: questions.length },
    () => ({
      title: "",
      imageId: null
    })
  )
};

// --------------------
// 要素取得
// --------------------

const challengeScreen =
  document.getElementById("challenge-screen");

const resultScreen =
  document.getElementById("result-screen");

const questionList =
  document.getElementById("question-list");

const resultList =
  document.getElementById("result-list");

const saveStatus =
  document.getElementById("save-status");

const resultButton =
  document.getElementById("result-button");

const editButton =
  document.getElementById("edit-button");

const downloadButton =
  document.getElementById("download-button");

// --------------------
// IndexedDB
// --------------------

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(
      DB_NAME,
      DB_VERSION
    );

    request.onupgradeneeded = (event) => {
      const database = event.target.result;

      if (
        !database.objectStoreNames.contains(
          STORE_NAME
        )
      ) {
        database.createObjectStore(
          STORE_NAME
        );
      }
    };

    request.onsuccess = (event) => {
      db = event.target.result;
      resolve();
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

function saveImage(imageId, file) {
  return new Promise((resolve, reject) => {
    const transaction =
      db.transaction(
        STORE_NAME,
        "readwrite"
      );

    const store =
      transaction.objectStore(STORE_NAME);

    const request =
      store.put(file, imageId);

    request.onsuccess = () => resolve();

    request.onerror = () =>
      reject(request.error);
  });
}

function getImage(imageId) {
  return new Promise((resolve, reject) => {
    const transaction =
      db.transaction(
        STORE_NAME,
        "readonly"
      );

    const store =
      transaction.objectStore(STORE_NAME);

    const request =
      store.get(imageId);

    request.onsuccess = () =>
      resolve(request.result);

    request.onerror = () =>
      reject(request.error);
  });
}

// --------------------
// 保存・読み込み
// --------------------

function saveData() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(gameChallengeData)
  );

  saveStatus.textContent =
    "✓ 自動保存しました";
}

function loadData() {
  const savedData =
    localStorage.getItem(STORAGE_KEY);

  if (!savedData) {
    return;
  }

  try {
    const parsedData =
      JSON.parse(savedData);

    if (
      Array.isArray(
        parsedData.answers
      )
    ) {
      gameChallengeData.answers =
        parsedData.answers.map(
          (answer) => {
            // 以前の文字列形式にも対応
            if (
              typeof answer ===
              "string"
            ) {
              return {
                title: answer,
                imageId: null
              };
            }

            return {
              title:
                answer.title || "",
              imageId:
                answer.imageId || null
            };
          }
        );

      // 30問に足りない分を追加
      while (
        gameChallengeData.answers.length <
        questions.length
      ) {
        gameChallengeData.answers.push({
          title: "",
          imageId: null
        });
      }

      // 質問数より多い場合は30件にする
      gameChallengeData.answers =
        gameChallengeData.answers.slice(
          0,
          questions.length
        );
    }
  } catch (error) {
    console.error(
      "保存データの読み込みに失敗しました",
      error
    );
  }
}

// --------------------
// 入力画面を表示
// --------------------

async function renderQuestions() {
  questionList.innerHTML = "";

  for (
    let index = 0;
    index < questions.length;
    index++
  ) {
    const question =
      questions[index];

    const item =
      document.createElement("div");

    item.className =
      "question-item";

    // 質問文
    const title =
      document.createElement("h2");

    title.textContent =
      `${index + 1}. ${question}`;

    // ゲームタイトル入力
    const input =
      document.createElement("input");

    input.type = "text";

    input.className =
      "game-title-input";

    input.placeholder =
      "ゲームタイトルを入力";

    input.value =
      gameChallengeData
        .answers[index].title;

    input.addEventListener(
      "input",
      (event) => {
        gameChallengeData
          .answers[index].title =
          event.target.value;

        saveData();
      }
    );

    // 画像アップロードエリア
    const imageArea =
      document.createElement("div");

    imageArea.className =
      "image-upload-area";

    const imageLabel =
      document.createElement("label");

    imageLabel.className =
      "image-upload-label";

    imageLabel.textContent =
      "📁 画像を選択";

    const imageInput =
      document.createElement("input");

    imageInput.type = "file";

    imageInput.accept =
      "image/*";

    imageInput.className =
      "image-input";

    const previewContainer =
      document.createElement("div");

    previewContainer.className =
      "image-preview-container";

    imageLabel.appendChild(
      imageInput
    );

    // 画像を選択した時
    imageInput.addEventListener(
      "change",
      async (event) => {
        const file =
          event.target.files[0];

        if (!file) {
          return;
        }

        const imageId =
          `question-${index}`;

        try {
          await saveImage(
            imageId,
            file
          );

          gameChallengeData
            .answers[index].imageId =
            imageId;

          saveData();

          const image =
            document.createElement("img");

          image.className =
            "image-preview";

          image.src =
            URL.createObjectURL(
              file
            );

          previewContainer.innerHTML =
            "";

          previewContainer.appendChild(
            image
          );

        } catch (error) {
          console.error(
            "画像の保存に失敗しました",
            error
          );

          alert(
            "画像の保存に失敗しました。"
          );
        }
      }
    );

    // 保存済み画像を表示
    const imageId =
      gameChallengeData
        .answers[index].imageId;

    if (imageId) {
      try {
        const savedImage =
          await getImage(imageId);

        if (savedImage) {
          const image =
            document.createElement(
              "img"
            );

          image.className =
            "image-preview";

          image.src =
            URL.createObjectURL(
              savedImage
            );

          previewContainer.appendChild(
            image
          );
        }
      } catch (error) {
        console.error(
          "画像の読み込みに失敗しました",
          error
        );
      }
    }

    imageArea.appendChild(
      imageLabel
    );

    imageArea.appendChild(
      previewContainer
    );

    item.appendChild(title);
    item.appendChild(input);
    item.appendChild(imageArea);

    questionList.appendChild(item);
  }
}

// --------------------
// 結果画面を表示
// --------------------

async function renderResults() {
  resultList.innerHTML = "";

  for (
    let index = 0;
    index < questions.length;
    index++
  ) {
    const question =
      questions[index];

    const answerData =
      gameChallengeData
        .answers[index];

    const item =
      document.createElement("div");

    item.className =
      "result-item";

    // 画像表示
    if (answerData.imageId) {
      try {
        const savedImage =
          await getImage(
            answerData.imageId
          );

        if (savedImage) {
          const image =
            document.createElement(
              "img"
            );

          image.className =
            "result-image";

          image.src =
            URL.createObjectURL(
              savedImage
            );

          item.appendChild(image);
        } else {
          addNoImage(item);
        }
      } catch (error) {
        console.error(
          "結果画像の読み込みに失敗しました",
          error
        );

        addNoImage(item);
      }
    } else {
      addNoImage(item);
    }

    // 番号
    const number =
      document.createElement("p");

    number.className =
      "result-number";

    number.textContent =
      `${index + 1}`;

    // 質問
    const questionElement =
      document.createElement("p");

    questionElement.className =
      "result-question";

    questionElement.textContent =
      question;

    // 回答
    const answer =
      document.createElement("p");

    answer.className =
      "result-answer";

    answer.textContent =
      answerData.title ||
      "未回答";

    item.appendChild(number);

    item.appendChild(
      questionElement
    );

    item.appendChild(answer);

    resultList.appendChild(item);
  }

  challengeScreen.classList.add(
    "hidden"
  );

  resultScreen.classList.remove(
    "hidden"
  );

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

// --------------------
// 画像なし表示
// --------------------

function addNoImage(parent) {
  const noImage =
    document.createElement("div");

  noImage.className =
    "no-image";

  noImage.textContent =
    "NO IMAGE";

  parent.appendChild(noImage);
}

// --------------------
// イベント
// --------------------

resultButton.addEventListener(
  "click",
  async () => {
    await renderResults();
  }
);

editButton.addEventListener(
  "click",
  () => {
    resultScreen.classList.add(
      "hidden"
    );

    challengeScreen.classList.remove(
      "hidden"
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }
);

downloadButton.addEventListener(
  "click",
  async () => {
    try {
      // ダウンロード対象
      const target =
        document.getElementById(
          "result-screen"
        );

      // 一時的にボタンを隠す
      downloadButton.style.display =
        "none";

      editButton.style.display =
        "none";

      // 画面を画像化
      const canvas =
        await html2canvas(target, {
          backgroundColor: "#ffffff",
          scale: 2
        });

      // ボタンを元に戻す
      downloadButton.style.display =
        "";

      editButton.style.display =
        "";

      // PNGとしてダウンロード
      const link =
        document.createElement("a");

      link.download =
        "my-game-30-challenge.png";

      link.href =
        canvas.toDataURL("image/png");

      link.click();

    } catch (error) {
      console.error(
        "画像の作成に失敗しました",
        error
      );

      // エラー時もボタンを戻す
      downloadButton.style.display =
        "";

      editButton.style.display =
        "";

      alert(
        "画像の作成に失敗しました。"
      );
    }
  }
);

// --------------------
// アプリ起動
// --------------------

async function initializeApp() {
  try {
    await openDatabase();

    loadData();

    await renderQuestions();

  } catch (error) {
    console.error(
      "アプリの起動に失敗しました",
      error
    );

    alert(
      "アプリの起動に失敗しました。"
    );
  }
}

initializeApp();
