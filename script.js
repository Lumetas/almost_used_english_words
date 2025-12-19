
// Данные из JSON (в реальном приложении загружались бы из файла)
// Для примера используем предоставленные данные
let words = [
	{ "en": "a", "ru": "В/Некий" },
	{ "en": "able", "ru": "способный" },
	{ "en": "about", "ru": "о" },
	{ "en": "above", "ru": "выше" },
];

// Переменные состояния приложения
let currentWordIndex = 0;
let correctAnswers = 0;
let incorrectAnswers = 0;
let difficultWords = [];
let isEnglishToRussian = true; // Режим перевода
let usedIndices = []; // Индексы уже использованных слов
let allWordsCompleted = false; // Все слова пройдены

// Элементы DOM
const wordElement = document.getElementById('word');
const optionsElement = document.getElementById('options');
const resultMessageElement = document.getElementById('result-message');
const totalWordsElement = document.getElementById('total-words');
const correctAnswersElement = document.getElementById('correct-answers');
const incorrectAnswersElement = document.getElementById('incorrect-answers');
const difficultWordsCountElement = document.getElementById('difficult-words-count');
const nextWordButton = document.getElementById('next-word');
const resetStatsButton = document.getElementById('reset-stats');
const showDifficultButton = document.getElementById('show-difficult');
const difficultWordsElement = document.getElementById('difficult-words');
const difficultWordsListElement = document.getElementById('difficult-words-list');
const modeEnRuButton = document.getElementById('mode-en-ru');
const modeRuEnButton = document.getElementById('mode-ru-en');
const progressFillElement = document.getElementById('progress-fill');

// Загрузка данных из localStorage
function loadFromLocalStorage() {
	const savedCorrect = localStorage.getItem('correctAnswers');
	const savedIncorrect = localStorage.getItem('incorrectAnswers');
	const savedDifficult = localStorage.getItem('difficultWords');

	if (savedCorrect) correctAnswers = parseInt(savedCorrect);
	if (savedIncorrect) incorrectAnswers = parseInt(savedIncorrect);
	if (savedDifficult) difficultWords = JSON.parse(savedDifficult);

	updateStats();
}

// Сохранение данных в localStorage
function saveToLocalStorage() {
	localStorage.setItem('correctAnswers', correctAnswers.toString());
	localStorage.setItem('incorrectAnswers', incorrectAnswers.toString());
	localStorage.setItem('difficultWords', JSON.stringify(difficultWords));
}

// Обновление статистики
function updateStats() {
	totalWordsElement.textContent = words.length;
	correctAnswersElement.textContent = correctAnswers;
	incorrectAnswersElement.textContent = incorrectAnswers;
	difficultWordsCountElement.textContent = difficultWords.length;

	// Обновляем прогресс
	const progress = usedIndices.length / words.length * 100;
	progressFillElement.style.width = `${progress}%`;

	saveToLocalStorage();
}

// Получение случайного индекса слова
function getRandomWordIndex() {
	// Если есть сложные слова и все обычные слова уже пройдены
	if (allWordsCompleted && difficultWords.length > 0) {
		// Берем случайное сложное слово
		const randomDifficultIndex = Math.floor(Math.random() * difficultWords.length);
		return difficultWords[randomDifficultIndex];
	}

	// Если все слова использованы, отмечаем это
	if (usedIndices.length >= words.length) {
		allWordsCompleted = true;
		return getRandomWordIndex(); // Рекурсивно вызываем для выбора сложных слов
	}

	let randomIndex;
	do {
		randomIndex = Math.floor(Math.random() * words.length);
	} while (usedIndices.includes(randomIndex));

	return randomIndex;
}

// Показать текущее слово и варианты
function showWord() {
	// Сбрасываем сообщение
	resultMessageElement.textContent = '';
	resultMessageElement.className = 'result-message';

	// Получаем случайное слово
	currentWordIndex = getRandomWordIndex();

	// Если это не сложное слово, добавляем в использованные
	if (!allWordsCompleted && !usedIndices.includes(currentWordIndex)) {
		usedIndices.push(currentWordIndex);
	}

	const word = words[currentWordIndex];

	// Показываем слово в зависимости от режима
	if (isEnglishToRussian) {
		wordElement.textContent = word.en;
	} else {
		wordElement.textContent = word.ru;
	}

	// Создаем варианты ответов
	createOptions(word);

	// Обновляем статистику
	updateStats();

	// Добавляем анимацию
	wordElement.parentElement.classList.add('fade-in');
	setTimeout(() => {
		wordElement.parentElement.classList.remove('fade-in');
	}, 500);
}

// Создание вариантов ответов
function createOptions(correctWord) {
	optionsElement.innerHTML = '';

	// Создаем массив с правильным и случайными неправильными ответами
	let options;

	if (isEnglishToRussian) {
		// Правильный ответ на русском
		const correctOption = correctWord.ru;
		options = [correctOption];

		// Добавляем случайные неправильные ответы
		while (options.length < 3) {
			const randomIndex = Math.floor(Math.random() * words.length);
			const randomRu = words[randomIndex].ru;

			if (!options.includes(randomRu)) {
				options.push(randomRu);
			}
		}
	} else {
		// Правильный ответ на английском
		const correctOption = correctWord.en;
		options = [correctOption];

		// Добавляем случайные неправильные ответы
		while (options.length < 3) {
			const randomIndex = Math.floor(Math.random() * words.length);
			const randomEn = words[randomIndex].en;

			if (!options.includes(randomEn)) {
				options.push(randomEn);
			}
		}
	}

	// Перемешиваем варианты
	options = shuffleArray(options);

	// Создаем элементы вариантов
	options.forEach(option => {
		const optionElement = document.createElement('div');
		optionElement.className = 'option';
		optionElement.textContent = option;

		optionElement.addEventListener('click', () => checkAnswer(option, correctWord));
		optionsElement.appendChild(optionElement);
	});
}

// Перемешивание массива
function shuffleArray(array) {
	const newArray = [...array];
	for (let i = newArray.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[newArray[i], newArray[j]] = [newArray[j], newArray[i]];
	}
	return newArray;
}

// Проверка ответа
function checkAnswer(selectedOption, correctWord) {
	let isCorrect = false;

	if (isEnglishToRussian) {
		isCorrect = selectedOption === correctWord.ru;
	} else {
		isCorrect = selectedOption === correctWord.en;
	}

	// Показываем результат
	const optionElements = document.querySelectorAll('.option');
	optionElements.forEach(option => {
		// Находим правильный ответ
		let correctOption;
		if (isEnglishToRussian) {
			correctOption = correctWord.ru;
		} else {
			correctOption = correctWord.en;
		}

		if (option.textContent === correctOption) {
			option.classList.add('correct');
		}

		if (option.textContent === selectedOption && option.textContent !== correctOption) {
			option.classList.add('incorrect');
		}

		// Отключаем клики после выбора
		option.style.pointerEvents = 'none';
	});

	// Обновляем статистику
	if (isCorrect) {
		correctAnswers++;
		resultMessageElement.textContent = 'Правильно! 👍';
		resultMessageElement.className = 'result-message correct-message';
	} else {
		incorrectAnswers++;
		resultMessageElement.textContent = `Неправильно! Правильный ответ: ${isEnglishToRussian ? correctWord.ru : correctWord.en}`;
		resultMessageElement.className = 'result-message incorrect-message';

		// Добавляем слово в сложные, если его там еще нет
		if (!difficultWords.includes(currentWordIndex)) {
			difficultWords.push(currentWordIndex);
			updateDifficultWordsList();
		}
	}

	updateStats();
}

// Обновление списка сложных слов
function updateDifficultWordsList() {
	difficultWordsListElement.innerHTML = '';

	if (difficultWords.length === 0) {
		difficultWordsListElement.innerHTML = '<div class="difficult-word">Нет сложных слов</div>';
		return;
	}

	// Показываем только первые 20 сложных слов для экономии места
	const wordsToShow = difficultWords.slice(0, 20);

	wordsToShow.forEach(wordIndex => {
		try {
			const word = words[wordIndex];
			const wordElement = document.createElement('div');
			wordElement.className = 'difficult-word';
			wordElement.textContent = `${word.en} - ${word.ru}`;
			difficultWordsListElement.appendChild(wordElement);
		} catch (error) {
			alert('ошибка с словами, сбросьте статистику');
			resetStats();
			console.error(error);
		}
	});

	if (difficultWords.length > 20) {
		const moreElement = document.createElement('div');
		moreElement.className = 'difficult-word';
		moreElement.textContent = `... и ещё ${difficultWords.length - 20} слов`;
		difficultWordsListElement.appendChild(moreElement);
	}
}

// Переключение режима
function toggleMode(newMode) {
	isEnglishToRussian = newMode === 'en-ru';

	if (isEnglishToRussian) {
		modeEnRuButton.classList.add('active');
		modeRuEnButton.classList.remove('active');
	} else {
		modeEnRuButton.classList.remove('active');
		modeRuEnButton.classList.add('active');
	}

	// Показываем новое слово в новом режиме
	showWord();
}

// Сброс статистики
function resetStats() {
	if (confirm('Вы уверены, что хотите сбросить всю статистику?')) {
		correctAnswers = 0;
		incorrectAnswers = 0;
		difficultWords = [];
		usedIndices = [];
		allWordsCompleted = false;

		localStorage.removeItem('correctAnswers');
		localStorage.removeItem('incorrectAnswers');
		localStorage.removeItem('difficultWords');

		updateStats();
		showWord();
		updateDifficultWordsList();

		alert('Статистика сброшена!');
	}
}

// Инициализация приложения
function init() {
	// Загружаем данные
	loadFromLocalStorage();

	// Показываем первое слово
	showWord();

	// Обновляем список сложных слов
	updateDifficultWordsList();

	// Назначаем обработчики событий
	nextWordButton.addEventListener('click', showWord);

	resetStatsButton.addEventListener('click', resetStats);

	showDifficultButton.addEventListener('click', () => {
		const isHidden = difficultWordsElement.style.display === 'none' || difficultWordsElement.style.display === '';
		difficultWordsElement.style.display = isHidden ? 'block' : 'none';
		showDifficultButton.innerHTML = isHidden ?
			'<i class="fas fa-eye-slash"></i> Скрыть сложные слова' :
			'<i class="fas fa-exclamation-triangle"></i> Показать сложные слова';
	});

	modeEnRuButton.addEventListener('click', () => toggleMode('en-ru'));
	modeRuEnButton.addEventListener('click', () => toggleMode('ru-en'));

	// Добавляем обработчик клавиатуры для быстрого перехода к следующему слову
	document.addEventListener('keydown', (e) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			showWord();
		}

		// Быстрый выбор вариантов цифрами 1-3
		if (e.key >= '1' && e.key <= '3') {
			const optionIndex = parseInt(e.key) - 1;
			const optionElements = document.querySelectorAll('.option');
			if (optionElements.length > optionIndex) {
				optionElements[optionIndex].click();
			}
		}
	});
}



// Запускаем приложение после загрузки страницы
window.addEventListener('DOMContentLoaded', init);

fetch('./words.json')
	.then(response => response.json())
	.then(data => {
		words = data;
		init();
	});

