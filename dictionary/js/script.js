let vocabulary = [];
let currentLesson = null;

// 加载词典数据
function loadDictionary() {
    fetch('./data/Vocab.csv')  // 修改为相对路径
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load dictionary');
            }
            return response.text();
        })
        .then(data => {
            const rows = data.split('\n');
            const headers = rows[0].split(',');
            
            for (let i = 1; i < rows.length; i++) {
                if (rows[i].trim() === '') continue;
                const values = rows[i].split(',');
                const word = {};
                headers.forEach((header, index) => {
                    word[header.trim()] = values[index]?.trim() || '';
                });
                vocabulary.push(word);
            }
            
            initializeLessonList();
        })
        .catch(error => {
            console.error('Error loading dictionary:', error);
        });
}

// 初始化课程列表
function initializeLessonList() {
    const lessons = [...new Set(vocabulary.map(word => word.lesson))].sort();
    const lessonList = document.getElementById('lessonList');
    
    lessons.forEach(lesson => {
        const button = document.createElement('button');
        button.className = 'lesson-button';
        button.textContent = lesson;
        button.onclick = () => showLessonWords(lesson);
        lessonList.appendChild(button);
    });
}

// 显示课程单词列表
function showLessonWords(lesson) {
    currentLesson = lesson;
    
    // 更新课程按钮状态
    document.querySelectorAll('.lesson-button').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent === lesson) {
            btn.classList.add('active');
        }
    });
    
    // 显示该课程的单词列表
    const words = vocabulary.filter(word => word.lesson === lesson);
    const wordList = document.getElementById('wordList');
    wordList.innerHTML = '';
    
    words.forEach(word => {
        const div = document.createElement('div');
        div.className = 'word-item';
        div.textContent = word.word;
        div.onclick = () => displayResults([word]);
        wordList.appendChild(div);
    });
}

// 搜索功能
function searchWord() {
    const searchTerm = searchInput.value.toLowerCase();
    const results = vocabulary.filter(word => 
        (word.word || '').toLowerCase().includes(searchTerm) ||
        (word.trans_cn || '').toLowerCase().includes(searchTerm) ||
        (word.trans_en || '').toLowerCase().includes(searchTerm) ||
        (word.trans_ja || '').toLowerCase().includes(searchTerm) ||
        (word.trans_fr || '').toLowerCase().includes(searchTerm)
    );

    displayResults(results);
}

// 显示结果
// 在 displayResults 函数中修改显示文本
function displayResults(results) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    results.forEach(word => {
        const wordCard = document.createElement('div');
        wordCard.className = 'word-card';

        const audioButton = word.audio ? 
            `<button class="audio-button" onclick="playAudio('${word.audio}')">Play Audio</button>` : '';

        wordCard.innerHTML = `
            <div class="word-tibetan">${word.word} ${audioButton}</div>
            <div class="translations">
                <div>Chinese: ${word.trans_cn || ''}</div>
                <div>English: ${word.trans_en || ''}</div>
                <div>Japanese: ${word.trans_ja || ''}</div>
                <div>French: ${word.trans_fr || ''}</div>
            </div>
            <div style="margin-top: 10px">
                <div>Part of Speech: ${word.pos || ''}</div>
                ${word.etymology ? `<div>Etymology: ${word.etymology}</div>` : ''}
                ${word.example ? `
                    <div class="example-box">
                        <div class="tibetan-text">${word.example}</div>
                        <div class="example-translations">
                            ${word.exam_cn ? `<div>Chinese: ${word.exam_cn}</div>` : ''}
                            ${word.exam_en ? `<div>English: ${word.exam_en}</div>` : ''}
                            ${word.exam_ja ? `<div>Japanese: ${word.exam_ja}</div>` : ''}
                            ${word.exam_fr ? `<div>French: ${word.exam_fr}</div>` : ''}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;

        resultsDiv.appendChild(wordCard);
    });
}

// 播放音频
function playAudio(audioPath) {
    const audio = new Audio(audioPath);
    audio.play();
}

// 页面加载时初始化
// 添加搜索建议功能
function showSearchSuggestions(searchTerm) {
    if (!searchTerm) {
        document.getElementById('searchSuggestions').style.display = 'none';
        return;
    }

    const suggestions = vocabulary.filter(word => 
        word.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
        word.trans_cn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        word.trans_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
        word.trans_ja.toLowerCase().includes(searchTerm.toLowerCase()) ||
        word.trans_fr.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 10);

    const suggestionsDiv = document.getElementById('searchSuggestions');
    suggestionsDiv.innerHTML = '';

    if (suggestions.length > 0) {
        suggestions.forEach(word => {
            const div = document.createElement('div');
            div.className = 'suggestion-item';
            div.innerHTML = `
                <span class="suggestion-tibetan">${word.word}</span>
                <div class="suggestion-translations">
                    <div class="suggestion-left">
                        <span class="suggestion-cn">${word.trans_cn || ''}</span>
                        <span class="suggestion-en">${word.trans_en || ''}</span>
                    </div>
                    <div class="suggestion-right">
                        <span class="suggestion-ja">${word.trans_ja || ''}</span>
                        <span class="suggestion-fr">${word.trans_fr || ''}</span>
                    </div>
                </div>
            `;
            div.onclick = () => {
                document.getElementById('searchInput').value = word.word;
                displayResults([word]);
                suggestionsDiv.style.display = 'none';
            };
            suggestionsDiv.appendChild(div);
        });
        suggestionsDiv.style.display = 'block';
    } else {
        suggestionsDiv.style.display = 'none';
    }
}

// 修改事件监听部分
document.addEventListener('DOMContentLoaded', () => {
    loadDictionary();
    
    const searchInput = document.getElementById('searchInput');
    const searchSuggestions = document.getElementById('searchSuggestions');

    searchInput.addEventListener('input', (e) => {
        showSearchSuggestions(e.target.value);
    });

    // 点击页面其他地方时隐藏建议列表
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !searchSuggestions.contains(e.target)) {
            searchSuggestions.style.display = 'none';
        }
    });

    document.getElementById('searchButton').addEventListener('click', searchWord);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchWord();
            searchSuggestions.style.display = 'none';
        }
    });
});