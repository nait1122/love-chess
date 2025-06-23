document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const startScreen = document.getElementById('start-screen-overlay');
  const startButton = document.getElementById('start-game-button');
  const appContainer = document.querySelector('.app-container');

  const boardElement = document.getElementById('board');
  const player1Element = document.getElementById('player1');
  const player2Element = document.getElementById('player2');
  const diceContainer = document.getElementById('dice-container');
  const diceElement = document.getElementById('dice');
  const diceFace = document.querySelector('.dice-face');
  const femaleSwitch = document.getElementById('switch-female');
  const maleSwitch = document.getElementById('switch-male');
  const modal = document.getElementById('modal');
  const modalTitle = document.getElementById('modal-title');
  const modalText = document.getElementById('modal-text');
  const modalButton = document.getElementById('modal-button');
  // Editor DOM Elements
  const editorModal = document.getElementById('editor-modal');
  const closeEditorButton = document.getElementById('close-editor');
  const editorGrid = document.getElementById('editor-grid');
  const menuButton = document.querySelector('.menu-icons .icon-button:last-child'); // The hamburger menu
  // New Editor DOM elements
  const setListContainer = document.getElementById('set-list-container');
  const addNewSetButton = document.getElementById('add-new-set');
  const boardContainer = document.getElementById('board-container'); // Added for consistency

  // --- Audio Elements ---
  const audioDiceRoll = document.getElementById('audio-dice-roll');
  const audioPawnMove = document.getElementById('audio-pawn-move');
  const audioTaskComplete = document.getElementById('audio-task-complete');

  // --- Game Configuration ---
  // This is now a fallback/default task list
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

  let cellTasks = []; // This will hold the task for each cell

  const boardSize = 40;
  // Reverting to the previous, more compact layout
  const cellCoordinates = [
    { c: 6, r: 0 }, { c: 5, r: 0 }, { c: 4, r: 0 }, { c: 3, r: 0 }, { c: 2, r: 0 }, { c: 1, r: 0 }, { c: 0, r: 0 },
    { c: 0, r: 1 },
    { c: 1, r: 1 }, { c: 2, r: 1 }, { c: 3, r: 1 }, { c: 4, r: 1 }, { c: 5, r: 1 }, { c: 6, r: 1 },
    { c: 6, r: 2 },
    { c: 5, r: 2 }, { c: 4, r: 2 }, { c: 3, r: 2 }, { c: 2, r: 2 }, { c: 1, r: 2 }, { c: 0, r: 2 },
    { c: 0, r: 3 }, { c: 0, r: 4 },
    { c: 1, r: 4 }, { c: 2, r: 4 }, { c: 3, r: 4 }, { c: 4, r: 4 }, { c: 5, r: 4 }, { c: 6, r: 4 },
    { c: 6, r: 5 }, { c: 6, r: 6 },
    { c: 5, r: 6 }, { c: 4, r: 6 }, { c: 3, r: 6 }, { c: 2, r: 6 }, { c: 1, r: 6 }, { c: 0, r: 6 },
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

  // New data structure for gameplay versions
  let gameplayData = {};

  const diceButton = document.getElementById('dice');
  const resetButton = document.getElementById('reset-button');
  const editTasksButton = document.getElementById('edit-tasks-button');

  // --- Functions ---

  /**
   * Safely plays a sound, handling browser policies and loading.
   * @param {HTMLAudioElement} audioElement The audio element to play.
   */
  async function playSound(audioElement) {
    try {
      // Resetting currentTime is important for re-playing sounds quickly.
      audioElement.currentTime = 0;
      // The play() method returns a Promise. We'll wait for it to resolve.
      await audioElement.play();
    } catch (error) {
      // Log errors for debugging, but don't crash the game.
      // This can happen if the user hasn't interacted with the page yet.
      console.warn("Audio play failed:", error);
    }
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

  function loadCellTasks() {
    const savedTasks = localStorage.getItem('loveLudoCellTasks');
    if (savedTasks) {
      cellTasks = JSON.parse(savedTasks);
    } else {
      // Initialize with default tasks
      cellTasks = Array(boardSize).fill("安全格，休息一下吧~");
      // Pre-fill one as requested
      cellTasks[4] = "说出对方最吸引你的一个特质。";
    }
  }

  function saveCellTasks() {
    localStorage.setItem('loveLudoCellTasks', JSON.stringify(cellTasks));
  }

  function createPlayerElements() {
    players.forEach(player => {
      if (player.element) player.element.remove(); // Remove old element if any
      const playerElement = document.createElement('div');
      playerElement.id = `player-${player.id}`;
      playerElement.classList.add('player');
      playerElement.dataset.playerId = player.id;
      playerElement.style.backgroundImage = `url(${player.avatar})`;
      boardContainer.appendChild(playerElement);
      player.element = playerElement;
    });
  }

  /**
   * Creates the game board UI
   */
  function createBoard() {
    boardContainer.innerHTML = '';
    cellElements = [];
    const grid = document.createElement('div');
    grid.className = 'grid';

    cellCoordinates.forEach((coord, i) => {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      const gap = 4;
      const containerWidth = boardContainer.clientWidth;
      const cellWidth = (containerWidth / 7) - gap;
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

  /**
   * Updates the position of a player's piece on the board
   */
  function updatePlayerPosition(player) {
    if (!player.element) return;
    const cell = cellElements[player.position];
    if (!cell) return;

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
      face.innerHTML = ''; // Clear existing dots
      const dotCount = parseInt(face.dataset.dots, 10);
      for (let i = 0; i < dotCount; i++) {
        const dot = document.createElement('div');
        dot.className = 'dot';
        face.appendChild(dot);
      }
    });
  }

  /**
   * Rolls the dice and moves the player
   */
  function rollDice() {
    if (!isGameActive) return;
    isGameActive = false;

    // Play sound safely
    playSound(audioDiceRoll);

    // Generate a random roll
    const roll = Math.floor(Math.random() * 6) + 1;

    // Apply rotation for the 3D dice effect
    // These rotations are chosen to show the correct face for a standard dice layout
    const rotations = {
      1: 'rotateY(0deg)',       // Face 1 -> Front
      2: 'rotateX(90deg)',      // Face 2 -> Bottom
      3: 'rotateY(-90deg)',     // Face 3 -> Right
      4: 'rotateY(90deg)',      // Face 4 -> Left
      5: 'rotateX(-90deg)',     // Face 5 -> Top
      6: 'rotateY(180deg)'      // Face 6 -> Back
    };
    // Add some random spin for a more dynamic feel
    const randomX = (Math.floor(Math.random() * 4)) * 360;
    const randomY = (Math.floor(Math.random() * 4)) * 360;
    const randomZ = (Math.floor(Math.random() * 4)) * 360;

    diceElement.style.transform = `rotateX(${randomX}deg) rotateY(${randomY}deg) rotateZ(${randomZ}deg) ${rotations[roll]}`;

    setTimeout(() => {
      const player = players[currentPlayerIndex];
      let endPosition = player.position + roll;

      const onMoveComplete = () => {
        const specialCell = boardLayout.find(c => c.index === player.position);
        if (specialCell) {
          handleSpecialCell(player, specialCell);
        } else {
          triggerTask();
        }
      };
      if (endPosition >= boardSize - 1) {
        endPosition = boardSize - 1;
        animateMove(player, endPosition, () => endGame(player));
      } else {
        animateMove(player, endPosition, onMoveComplete);
      }
    }, 1000);
  }

  /**
   * Handles landing on a special cell
   */
  function handleSpecialCell(player, cell) {
    let message = `${player.name} 踩到了特殊格子!`;
    if (cell.type === 'backward') {
      message = `${player.name} 踩到了后退格!`;
    } else if (cell.type === 'flag') {
      message = `${player.name} 到达安全区!`;
    }

    showModal(`特殊格子: ${cell.icon}`, message, "继续");
    modalButton.onclick = () => {
      modal.classList.remove('visible');
      if (cell.type === 'backward') {
        let endPos = player.position + cell.value;
        if (endPos < 0) endPos = 0;

        // After the special move, trigger a task.
        animateMove(player, endPos, triggerTask);

      } else {
        // For non-moving special cells like 'flag', just trigger a task.
        triggerTask();
      }
    };
  }

  /**
   * Switches to the next player
   */
  function switchPlayer() {
    currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
    femaleSwitch.classList.toggle('active', currentPlayerIndex === 0);
    maleSwitch.classList.toggle('active', currentPlayerIndex === 1);
    isGameActive = true;
  }

  /**
   * Ends the game and shows a winner message
   */
  function endGame(winner) {
    isGameActive = false;
    showModal('游戏结束!', `恭喜玩家 ${winner.name} 获得了胜利!`, '再来一局');
    playSound(audioTaskComplete);
    modalButton.onclick = resetGame;
  }

  /**
   * Shows a modal dialog
   */
  function showModal(title, text, buttonText) {
    modalTitle.textContent = title;
    modalText.textContent = text;
    modalButton.textContent = buttonText;
    modal.classList.add('visible');
    if (title !== '游戏结束!') {
      playSound(audioTaskComplete);
    }
  }

  /**
   * Resets the game to its initial state
   */
  function resetGame() {
    players.forEach(p => p.position = 0);
    currentPlayerIndex = 0;
    isGameActive = true;
    createBoard(); // Re-create board to clear any lingering states
    createPlayerElements(); // Re-create player elements
    players.forEach(p => updatePlayerPosition(p));
    modal.classList.remove('active');
    switchPlayer(); // To set the correct active UI on the switch
    switchPlayer(); // Call it twice to get back to player 1
  }

  function triggerTask() {
    const activeSet = gameplayData.gameplaySets[gameplayData.activeSetId];
    let task = "安全格，休息一下吧~";
    if (activeSet.type === 'random') {
      task = defaultTasks[Math.floor(Math.random() * defaultTasks.length)];
    } else {
      const player = players[currentPlayerIndex];
      task = activeSet.tasks[player.position] || task;
    }
    showModal('情侣任务 ❤️', task, "任务完成");
    modalButton.onclick = () => {
      modal.classList.remove('visible');
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
      // Create a container for the button and its actions
      const setItemContainer = document.createElement('div');
      setItemContainer.className = 'set-item-container';

      const setButton = document.createElement('button');
      setButton.className = 'set-btn';
      setButton.textContent = set.name;
      setButton.dataset.setId = set.id;
      if (set.id === gameplayData.activeSetId) {
        setButton.classList.add('active');
      }
      setButton.addEventListener('click', () => switchActiveSet(set.id));

      setItemContainer.appendChild(setButton);

      // Add rename and delete buttons for custom sets only
      if (set.type !== 'random') {
        const renameBtn = document.createElement('button');
        renameBtn.className = 'set-action-btn rename-btn';
        renameBtn.innerHTML = '✏️'; //Pencil icon
        renameBtn.title = '重命名';
        renameBtn.addEventListener('click', () => renameSet(set.id));
        setItemContainer.appendChild(renameBtn);

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'set-action-btn delete-btn';
        deleteBtn.innerHTML = '🗑️'; // Trash can icon
        deleteBtn.title = '删除';
        deleteBtn.addEventListener('click', () => deleteSet(set.id));
        setItemContainer.appendChild(deleteBtn);
      }

      setListContainer.appendChild(setItemContainer);
    });
  }

  function renderTaskGrid() {
    editorGrid.innerHTML = '';
    const activeSet = gameplayData.gameplaySets[gameplayData.activeSetId];
    if (activeSet.type === 'random') {
      editorGrid.innerHTML = '<p style="text-align: center; padding: 20px;">"基础版"使用随机任务，无需编辑。</p>';
      return;
    }
    for (let i = 0; i < boardSize; i++) {
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'cell-task-input';
      input.value = activeSet.tasks[i] || '';
      input.dataset.index = i;
      input.addEventListener('input', (e) => {
        const index = parseInt(e.target.dataset.index, 10);
        activeSet.tasks[index] = e.target.value;
        saveGameplayData();
      });
      const item = document.createElement('div');
      item.className = 'editor-item';
      const number = document.createElement('span');
      number.className = 'cell-number';
      number.textContent = `${i + 1}:`;
      item.appendChild(number);
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
    const newId = `custom_${Date.now()}`;
    const newSetName = `自定义玩法 ${Object.keys(gameplayData.gameplaySets).length}`;
    gameplayData.gameplaySets[newId] = {
      id: newId,
      name: newSetName,
      type: 'cell_based',
      tasks: Array(boardSize).fill("点击编辑任务...")
    };
    switchActiveSet(newId);
  }

  function renameSet(setId) {
    const currentSet = gameplayData.gameplaySets[setId];
    if (!currentSet) return;

    const newName = prompt('请输入新的玩法名称：', currentSet.name);
    if (newName && newName.trim() !== '') {
      currentSet.name = newName.trim();
      saveGameplayData();
      renderSetManager(); // Re-render to show the new name
    }
  }

  function deleteSet(setId) {
    if (setId === 'basic') {
      alert('基础版不能删除哦！');
      return;
    }
    if (confirm(`确定要删除这个玩法版本吗？此操作不可撤销。`)) {
      delete gameplayData.gameplaySets[setId];
      // If the deleted set was the active one, fall back to basic
      if (gameplayData.activeSetId === setId) {
        gameplayData.activeSetId = 'basic';
      }
      saveGameplayData();
      renderEditor(); // Re-render the whole editor view
    }
  }

  function openEditor() {
    renderEditor();
    editorModal.style.display = 'flex';
  }

  function closeEditor() {
    editorModal.style.display = 'none';
    resetGame(); // Reset game to reflect any changes
  }

  function initGame() {
    createBoard();
    createPlayerElements();
    players.forEach(p => updatePlayerPosition(p));
    loadCellTasks();
    loadGameplayData();
    renderSetManager(); // Render the set manager UI
    setupDiceFaces();
    // Set initial active player switch
    if (currentPlayerIndex === 0) {
      femaleSwitch.classList.add('active');
      maleSwitch.classList.remove('active');
    } else {
      maleSwitch.classList.add('active');
      femaleSwitch.classList.remove('active');
    }
    setupEventListeners();
    isGameActive = true; // Make game active after setup
  }

  function startGame() {
    // Hide start screen and show the main app
    startScreen.style.opacity = '0';
    setTimeout(() => {
      startScreen.style.display = 'none';
    }, 500); // Match CSS transition time
    appContainer.style.visibility = 'visible';

    // IMPORTANT: Load audio assets now, after user interaction
    audioDiceRoll.load();
    audioPawnMove.load();
    audioTaskComplete.load();

    // Now, initialize the rest of the game
    initGame();
  }

  function init() {
    // Only set up the start button listener initially
    startButton.addEventListener('click', startGame);
  }

  function setupEventListeners() {
    diceContainer.addEventListener('click', rollDice);
    resetButton.addEventListener('click', resetGame);
    addNewSetButton.addEventListener('click', addNewSet);
    menuButton.addEventListener('click', openEditor);
    closeEditorButton.addEventListener('click', closeEditor);
    femaleSwitch.addEventListener('click', () => {
      if (isGameActive && currentPlayerIndex !== 0) {
        switchPlayer();
      }
    });
    maleSwitch.addEventListener('click', () => {
      if (isGameActive && currentPlayerIndex !== 1) {
        switchPlayer();
      }
    });
    window.addEventListener('resize', () => {
      createBoard();
      players.forEach(updatePlayerPosition);
    });
  }

  // --- Initialisation ---
  init();
}); 