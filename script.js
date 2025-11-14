/* ============================================================
      БАЗОВЫЕ ДАННЫЕ КОЛОДЫ
============================================================ */

const suits = [
  { symbol: '♥', color: 'red' },
  { symbol: '♦', color: 'red' },
  { symbol: '♣', color: 'black' },
  { symbol: '♠', color: 'black' }
];

const values = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];

function randomCard() {
  const suit = suits[Math.floor(Math.random() * suits.length)];
  const value = values[Math.floor(Math.random() * values.length)];
  return { value, suit };
}

function cardValue(v) {
  if (v === 'A') return 14;
  if (v === 'K') return 13;
  if (v === 'Q') return 12;
  if (v === 'J') return 11;
  return parseInt(v);
}

/* ============================================================
      ГЛОБАЛЬНО ДЛЯ ИГРЫ
============================================================ */

let players = {};  // для обычной игры и для blackjack

/* ============================================================
      ФУНКЦИИ ДЛЯ ОБЫЧНОЙ ИГРЫ (2/3/4 игрока)
============================================================ */

function getElems(p) {
  return {
    inner: document.getElementById(`cardInner${p}`),
    front: document.getElementById(`cardFront${p}`)
  };
}

function showCardOnce(p, card, isFinal) {
  const { inner, front } = getElems(p);

  front.className = `card-face card-front ${card.suit.color}`;
  front.innerHTML = `
    <div class="corner top">${card.value}<br>${card.suit.symbol}</div>
    <div class="center">${card.suit.symbol}</div>
    <div class="corner bottom">${card.value}<br>${card.suit.symbol}</div>
  `;

  inner.classList.add("flip");

  if (!isFinal) {
    setTimeout(() => inner.classList.remove("flip"), 600);
  }
}

function drawCards(p, count) {
  const flipDuration = 700;
  let delay = 0;
  let lastCard = null;

  for (let i = 0; i < count; i++) {
    const card = randomCard();
    lastCard = card;
    const isFinal = i === count - 1;

    setTimeout(() => showCardOnce(p, card, isFinal), delay);
    delay += flipDuration;
  }

  setTimeout(() => {
    players[p] = lastCard;
    checkWinner();
  }, delay + 60);
}

function createPlayers(num) {
  const container = document.getElementById('game-container');
  container.className = "game";
  container.innerHTML = '';
  players = {};

  for (let i = 1; i <= num; i++) {
    container.innerHTML += `
      <div class="player">
        <h2>Игрок ${i}</h2>
        <div class="deck">
          <div class="card">
            <div class="card-inner" id="cardInner${i}">
              <div class="card-face card-back"><span class="back-symbol">🂠</span></div>
              <div class="card-face card-front" id="cardFront${i}"></div>
            </div>
          </div>
        </div>

        <div class="controls">
          <button onclick="drawCards(${i},1)">1 карта</button>
          <button onclick="drawCards(${i},3)">3 карты</button>
          <button onclick="drawCards(${i},5)">5 карт</button>
        </div>
      </div>
    `;
  }
}

function checkWinner() {
  const total = Object.keys(players).length;
  const ready = Object.values(players).filter(Boolean).length;
  if (ready < total) return;

  const resultDiv = document.getElementById('result');

  const results = Object.entries(players).map(([p, c]) => ({
    player: p,
    value: cardValue(c.value)
  }));

  const max = Math.max(...results.map(r => r.value));
  const winners = results.filter(r => r.value === max);

  if (winners.length === 1) {
    resultDiv.textContent = `🏆 Победил Игрок ${winners[0].player}!`;
    resultDiv.style.color = "lime";
  } else {
    resultDiv.textContent = "🤝 Ничья!";
    resultDiv.style.color = "white";
  }

  setTimeout(() => {
    resetAllPlayers();
    resultDiv.textContent = "";
  }, 3500);
}

function resetAllPlayers() {
  for (let p in players) {
    const { inner, front } = getElems(p);
    inner.classList.remove("flip");
    front.className = "card-face card-front";
    front.innerHTML = "";
    players[p] = null;
  }
}

/* ============================================================
      БЛОК BLACKJACK — карты ложатся рядом
============================================================ */

function addCardToPlayer(player, card) {
  const deck = document.getElementById(`deck${player}`);

  const slot = document.createElement("div");
  slot.className = "card-slot";

  slot.innerHTML = `
    <div class="card-inner">
        <div class="card-face card-back"><span class="back-symbol">🂠</span></div>
        <div class="card-face card-front"></div>
    </div>
  `;

  deck.appendChild(slot);

  const inner = slot.querySelector(".card-inner");
  const front = slot.querySelector(".card-front");

  front.className = `card-face card-front ${card.suit.color}`;
  front.innerHTML = `
      <div class="corner top">${card.value}<br>${card.suit.symbol}</div>
      <div class="center">${card.suit.symbol}</div>
      <div class="corner bottom">${card.value}<br>${card.suit.symbol}</div>
  `;

  setTimeout(() => inner.classList.add("flip"), 50);
}

function createBlackjack(numPlayers) {
  const container = document.getElementById("blackjack-game");
  container.innerHTML = "";
  players = {};

  for (let i = 1; i <= numPlayers; i++) {
    container.innerHTML += `
      <div class="player">
        <h2>Игрок ${i}</h2>
        <div class="deck" id="deck${i}"></div>
      </div>
    `;
  }

  dealBlackjack(numPlayers);
}

function dealBlackjack(numPlayers) {
  let delay = 0;
  const step = 700;
  players = {};

  for (let round = 1; round <= 2; round++) {
    for (let p = 1; p <= numPlayers; p++) {
      const card = randomCard();
      if (!players[p]) players[p] = [];
      players[p].push(card);

      setTimeout(() => addCardToPlayer(p, card), delay);
      delay += step;
    }
  }

  setTimeout(() => evaluateBlackjack(numPlayers), delay + 200);
}

function evaluateBlackjack(numPlayers) {
  const resultDiv = document.getElementById("result");

  const scores = [];
  for (let p = 1; p <= numPlayers; p++) {
    const total = players[p].reduce((s, c) => s + cardValue(c.value), 0);
    scores.push({ player: p, total });
  }

  const max = Math.max(...scores.map(s => s.total));
  const winners = scores.filter(s => s.total === max);

  if (winners.length === 1) {
    resultDiv.textContent = `🏆 Победил Игрок ${winners[0].player}! (Очки: ${max})`;
    resultDiv.style.color = "lime";
  } else {
    resultDiv.textContent = `🤝 Ничья! (Очки: ${max})`;
    resultDiv.style.color = "white";
  }

  setTimeout(() => {
    for (let p = 1; p <= numPlayers; p++) {
      document.getElementById(`deck${p}`).innerHTML = "";
    }
    resultDiv.textContent = "";
  }, 40000);
}
function createBlackjackLayout(numPlayers) {
  const container = document.getElementById("blackjack-game");
  container.innerHTML = "";
  players = {};

  for (let i = 1; i <= numPlayers; i++) {
    container.innerHTML += `
      <div class="player">
        <h2>Игрок ${i}</h2>
        <div class="deck" id="deck${i}"></div>
      </div>
    `;
  }
}
