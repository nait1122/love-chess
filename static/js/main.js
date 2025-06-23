document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Element Variables ---
  // We declare them here and will assign them inside initGame to ensure they exist.
  let startScreen, startButton, appContainer, boardContainer, diceContainer, diceElement,
    femaleSwitch, maleSwitch, modal, modalTitle, modalText, modalButton, editorModal,
    closeEditorButton, editorGrid, menuButton, setListContainer, addNewSetButton,
    resetButton;

  // --- Game Configuration ---
  const defaultTasks = [
    "夸对方三个优点。", "给对方一个深情的拥抱，持续10秒。", "模仿对方一个可爱的表情或口头禅。",
    "说出第一次见面的地点和天气。", "给对方唱一首情歌的副歌部分。", "用三种不同的方式称呼对方。",
    "帮对方按摩肩膀1分钟。", "分享一件最近让你觉得很幸福的小事。", "两人十指紧扣，对视15秒。",
    "说出对方最喜欢的一道菜。", "下一回合，你来帮对方掷骰子。", "拍一张搞怪的合影。",
    "喂对方吃一小块零食。", "用一句土味情话'撩'对方。", "答应对方一个小小的要求（不能太过分哦）。",
    "分享一个你自己的小秘密。", "认真地对对方说'我爱你'。", "一起计划下一次约会的内容。",
    "互相给对方起一个可爱的昵称。", "快速说出对方的一个缺点（说完要抱抱）。", "帮对方倒一杯水。",
    "讲述一件对方做过的让你很感动的事。", "背诵对方的手机号码。", "闭上眼睛，通过触摸来猜对方的身体部位。",
    "交换角色，用对方的语气说一句话。", "一起看手机里最早的一张合照。", "真诚地感谢对方为你做的一件事。",
    "挠对方痒痒10秒。", "约定一件想和对方一起完成的事。", "给对方一个额头吻。"
  ];
  const boardSize = 40;
  const cellCoordinates = [
    { c: 6, r: 0 }, { c: 5, r: 0 }, { c: 4, r: 0 }, { c: 3, r: 0 }, { c: 2, r: 0 }, { c: 1, r: 0 }, { c: 0, r: 0 },
    { c: 0, r: 1 }, { c: 1, r: 1 }, { c: 2, r: 1 }, { c: 3, r: 1 }, { c: 4, r: 1 }, { c: 5, r: 1 }, { c: 6, r: 1 },
    { c: 6, r: 2 }, { c: 5, r: 2 }, { c: 4, r: 2 }, { c: 3, r: 2 }, { c: 2, r: 2 }, { c: 1, r: 2 }, { c: 0, r: 2 },
    { c: 0, r: 3 }, { c: 0, r: 4 }, { c: 1, r: 4 }, { c: 2, r: 4 }, { c: 3, r: 4 }, { c: 4, r: 4 }, { c: 5, r: 4 }, { c: 6, r: 4 },
    { c: 6, r: 5 }, { c: 6, r: 6 }, { c: 5, r: 6 }, { c: 4, r: 6 }, { c: 3, r: 6 }, { c: 2, r: 6 }, { c: 1, r: 6 }, { c: 0, r: 6 },
    { c: 0, r: 7 }, { c: 1, r: 7 }, { c: 2, r: 7 }
  ];
  const boardLayout = [
    { index: 21, type: 'flag', icon: '🚩' },
    { index: 39, type: 'finish', icon: '🏆' }
  ];

  // --- Game State ---
  let players = [
    { id: 1, name: '女', position: 0, element: null, avatar: './static/images/avatar_female.png' },
    { id: 2, name: '男', position: 0, element: null, avatar: './static/images/avatar_male.png' }
  ];
  let currentPlayerIndex = 0;
  let isGameActive = true;
  let cellElements = [];
  let gameplayData = {};

  // --- Functions ---

  async function playSound(audioElement) {
    if (!audioElement) return;
    try {
      audioElement.currentTime = 0;
      await audioElement.play();
    } catch (error) {
      console.warn("Audio play failed:", error);
    }
  }

  function assignDOMElements() {
    appContainer = document.querySelector('.app-container');
    boardContainer = document.getElementById('board-container');
    diceContainer = document.getElementById('dice-container');
    diceElement = document.getElementById('dice');
    femaleSwitch = document.getElementById('switch-female');
    maleSwitch = document.getElementById('switch-male');
    modal = document.getElementById('modal');
    modalTitle = document.getElementById('modal-title');
    modalText = document.getElementById('modal-text');
    modalButton = document.getElementById('modal-button');
    editorModal = document.getElementById('editor-modal');
    closeEditorButton = document.getElementById('close-editor');
    editorGrid = document.getElementById('editor-grid');
    menuButton = document.getElementById('open-editor-button');
    setListContainer = document.getElementById('set-list-container');
    addNewSetButton = document.getElementById('add-new-set');
    resetButton = document.getElementById('reset-button');

    // 动态创建音频对象，使用本地音频文件
    audioDiceRoll = new Audio('./static/audio/dice-roll.mp3');
    audioPawnMove = new Audio('./static/audio/pawn-move.mp3');
    audioTaskComplete = new Audio('./static/audio/task-complete.mp3');
  }

  function loadGameplayData() {
    const savedData = localStorage.getItem('loveLudoGameplayData');
    if (savedData) {
      gameplayData = JSON.parse(savedData);
    } else {
      gameplayData = {
        activeSetId: 'basic',
        gameplaySets: { 'basic': { id: 'basic', name: '基础版', type: 'random', tasks: {} } }
      };
      saveGameplayData();
    }
  }

  function saveGameplayData() {
    localStorage.setItem('loveLudoGameplayData', JSON.stringify(gameplayData));
  }

  function createPlayerElements() {
    players.forEach(player => {
      if (player.element) player.element.remove();
      const playerElement = document.createElement('div');
      playerElement.id = `player-${player.id}`;
      playerElement.classList.add('player');
      playerElement.dataset.playerId = player.id;
      playerElement.style.backgroundImage = `url(${player.avatar})`;
      boardContainer.appendChild(playerElement);
      player.element = playerElement;
    });
  }

  function createBoard() {
    boardContainer.innerHTML = '';
    cellElements = [];
    const grid = document.createElement('div');
    grid.className = 'grid';

    const gap = 4;
    const containerWidth = boardContainer.clientWidth;
    const cellWidth = (containerWidth / 7) - gap;

    cellCoordinates.forEach((coord, i) => {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.style.position = 'absolute';
      cell.style.left = `${coord.c * (cellWidth + gap)}px`;
      cell.style.top = `${coord.r * (cellWidth + gap)}px`;
      cell.style.width = `${cellWidth}px`;
      cell.style.height = `${cellWidth}px`;
      cell.dataset.index = i;

      const specialCell = boardLayout.find(c => c.index === i);
      if (specialCell) {
        cell.innerHTML = `<span class="special-icon">${specialCell.icon}</span>`;
        cell.dataset.special = specialCell.type;
      } else {
        cell.textContent = i + 1;
      }
      grid.appendChild(cell);
      cellElements.push(cell);
    });
    boardContainer.appendChild(grid);
  }

  function updatePlayerPosition(player) {
    if (!player.element || !cellElements[player.position]) return;
    const cell = cellElements[player.position];

    const otherPlayer = players.find(p => p.id !== player.id);
    let offset = 0;
    if (otherPlayer && player.position === otherPlayer.position && player.position > 0) {
      offset = player.id === 1 ? -(cell.offsetWidth / 4) : (cell.offsetWidth / 4);
    }
    player.element.style.left = `${cell.offsetLeft + cell.offsetWidth / 2 - player.element.offsetWidth / 2 + offset}px`;
    player.element.style.top = `${cell.offsetTop + cell.offsetHeight / 2 - player.element.offsetHeight / 2}px`;
  }

  function animateMove(player, end, callback) {
    const start = player.position;
    if (start === end) {
      if (callback) callback();
      return;
    }
    let current = start;
    const direction = (end > start) ? 1 : -1;

    const step = () => {
      if (current === end) {
        if (callback) callback();
        return;
      }
      current += direction;
      player.position = current;
      player.element.classList.add('is-moving');
      updatePlayerPosition(player);
      playSound(audioPawnMove);

      setTimeout(() => {
        player.element.classList.remove('is-moving');
        if ((direction === 1 && current < end) || (direction === -1 && current > end)) {
          setTimeout(step, 100);
        } else {
          if (callback) callback();
        }
      }, 200);
    };
    step();
  }

  function setupDiceFaces() {
    const faces = diceElement.querySelectorAll('.face');
    faces.forEach(face => {
      face.innerHTML = '';
      const dotCount = parseInt(face.dataset.dots, 10);
      for (let i = 0; i < dotCount; i++) {
        const dot = document.createElement('div');
        dot.className = 'dot';
        face.appendChild(dot);
      }
    });
  }

  function rollDice() {
    if (!isGameActive) return;
    isGameActive = false;
    playSound(audioDiceRoll);
    const roll = Math.floor(Math.random() * 6) + 1;
    const rotations = {
      1: 'rotateY(0deg)', 2: 'rotateX(90deg)', 3: 'rotateY(-90deg)',
      4: 'rotateY(90deg)', 5: 'rotateX(-90deg)', 6: 'rotateY(180deg) rotateX(180deg)'
    };
    diceElement.style.transform = `rotateX(720deg) rotateY(720deg) rotateZ(720deg) ${rotations[roll]}`;

    setTimeout(() => {
      const player = players[currentPlayerIndex];
      let newPosition = player.position + roll;
      if (newPosition >= boardSize) newPosition = boardSize - 1;

      const onMoveComplete = () => {
        handleSpecialCell(player, cellElements[player.position]);
      };

      animateMove(player, newPosition, onMoveComplete);
    }, 1000);
  }

  function handleSpecialCell(player, cell) {
    const specialType = cell.dataset.special;
    if (specialType) {
      switch (specialType) {
        case 'finish':
          endGame(player);
          return;
      }
    }
    triggerTask();
  }

  function switchPlayer() {
    currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
    isGameActive = true;
    if (currentPlayerIndex === 0) {
      femaleSwitch.classList.add('active');
      maleSwitch.classList.remove('active');
    } else {
      maleSwitch.classList.add('active');
      femaleSwitch.classList.remove('active');
    }
  }

  function endGame(winner) {
    isGameActive = false;
    showModal(`游戏结束！`, `恭喜 ${winner.name} 到达终点！`, '重新开始');
    playSound(audioTaskComplete);
    modalButton.onclick = resetGame;
  }

  function showModal(title, text, buttonText) {
    modalTitle.textContent = title;
    modalText.textContent = text;
    modalButton.textContent = buttonText;
    modal.classList.add('active');
  }

  function resetGame() {
    players.forEach(p => p.position = 0);
    currentPlayerIndex = 0;
    isGameActive = true;
    createBoard();
    createPlayerElements();
    players.forEach(p => updatePlayerPosition(p));
    modal.classList.remove('active');
    if (currentPlayerIndex !== 0) switchPlayer();
  }

  function triggerTask() {
    const activeSet = gameplayData.gameplaySets[gameplayData.activeSetId];
    const player = players[currentPlayerIndex];
    let task = "安全格，休息一下吧~";
    if (activeSet) {
      if (activeSet.type === 'custom' && activeSet.tasks[player.position]) {
        task = activeSet.tasks[player.position];
      } else {
        task = defaultTasks[Math.floor(Math.random() * defaultTasks.length)];
      }
    }
    showModal('任务来了！', task, '完成任务');
    modalButton.onclick = () => {
      modal.classList.remove('active');
      playSound(audioTaskComplete);
      switchPlayer();
    };
  }

  // --- Editor Functions ---
  function renderEditor() {
    renderSetManager();
    renderTaskGrid();
  }

  function renderSetManager() {
    setListContainer.innerHTML = '';
    Object.values(gameplayData.gameplaySets).forEach(set => {
      const setContainer = document.createElement('div');
      setContainer.className = 'set-item-container';

      const setButton = document.createElement('button');
      setButton.className = 'set-btn';
      setButton.textContent = set.name;
      if (set.id === gameplayData.activeSetId) {
        setButton.classList.add('active');
      }
      setButton.onclick = () => switchActiveSet(set.id);
      setContainer.appendChild(setButton);

      if (set.type === 'custom') {
        const renameBtn = document.createElement('button');
        renameBtn.className = 'set-action-btn rename-btn';
        renameBtn.textContent = '✏️';
        renameBtn.onclick = () => renameSet(set.id);
        setContainer.appendChild(renameBtn);

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'set-action-btn delete-btn';
        deleteBtn.textContent = '🗑️';
        deleteBtn.onclick = () => deleteSet(set.id);
        setContainer.appendChild(deleteBtn);
      }
      setListContainer.appendChild(setContainer);
    });
  }

  function renderTaskGrid() {
    editorGrid.innerHTML = '';
    const activeSet = gameplayData.gameplaySets[gameplayData.activeSetId];
    if (!activeSet || activeSet.type !== 'custom') {
      editorGrid.innerHTML = '<p>只有自定义玩法可以编辑哦。请先新建一个玩法版本。</p>';
      return;
    }
    for (let i = 0; i < boardSize; i++) {
      const item = document.createElement('div');
      item.className = 'editor-item';
      item.innerHTML = `<span class="cell-number">${i + 1}</span>`;
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'cell-task-input';
      input.value = activeSet.tasks[i] || '';
      input.placeholder = '输入此格的任务...';
      input.onchange = (e) => {
        activeSet.tasks[i] = e.target.value;
        saveGameplayData();
      };
      item.appendChild(input);
      editorGrid.appendChild(item);
    }
  }

  function switchActiveSet(setId) {
    gameplayData.activeSetId = setId;
    saveGameplayData();
    renderEditor();
  }

  function addNewSet() {
    const setName = prompt('请输入新玩法版本的名称：', `自定义玩法 ${Object.keys(gameplayData.gameplaySets).length}`);
    if (setName) {
      const setId = `custom_${Date.now()}`;
      gameplayData.gameplaySets[setId] = { id: setId, name: setName, type: 'custom', tasks: {} };
      gameplayData.activeSetId = setId;
      saveGameplayData();
      renderEditor();
    }
  }

  function renameSet(setId) {
    const newName = prompt('请输入新的名称：', gameplayData.gameplaySets[setId].name);
    if (newName) {
      gameplayData.gameplaySets[setId].name = newName;
      saveGameplayData();
      renderEditor();
    }
  }

  function deleteSet(setId) {
    if (confirm(`确定要删除玩法 "${gameplayData.gameplaySets[setId].name}" 吗？`)) {
      delete gameplayData.gameplaySets[setId];
      if (gameplayData.activeSetId === setId) {
        gameplayData.activeSetId = 'basic';
      }
      saveGameplayData();
      renderEditor();
    }
  }

  function openEditor() { editorModal.classList.add('active'); renderEditor(); }
  function closeEditor() { editorModal.classList.remove('active'); }

  function setupEventListeners() {
    diceContainer.addEventListener('click', rollDice);
    resetButton.addEventListener('click', resetGame);
    femaleSwitch.addEventListener('click', () => { if (isGameActive && currentPlayerIndex !== 0) switchPlayer(); });
    maleSwitch.addEventListener('click', () => { if (isGameActive && currentPlayerIndex !== 1) switchPlayer(); });
    menuButton.addEventListener('click', openEditor);
    closeEditorButton.addEventListener('click', closeEditor);
    addNewSetButton.addEventListener('click', addNewSet);
  }

  function initGame() {
    assignDOMElements();
    createBoard();
    createPlayerElements();
    players.forEach(p => updatePlayerPosition(p));
    loadGameplayData();
    renderSetManager();
    setupDiceFaces();
    if (currentPlayerIndex === 0) {
      femaleSwitch.classList.add('active');
    } else {
      maleSwitch.classList.add('active');
    }
    setupEventListeners();
    isGameActive = true;
  }

  function startGame() {
    startScreen.style.opacity = '0';
    setTimeout(() => { startScreen.style.display = 'none'; }, 500);
    document.querySelector('.app-container').style.visibility = 'visible';
    initGame();
  }

  function init() {
    startScreen = document.getElementById('start-screen-overlay');
    startButton = document.getElementById('start-game-button');
    startButton.addEventListener('click', startGame);
  }

  init();
}); 