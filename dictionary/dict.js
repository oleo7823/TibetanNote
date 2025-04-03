// 生成课程按钮
function generateLessonButtons() {
    const lessons = [...new Set(dictionaryData.map(entry => entry.lesson))].sort();
    const buttonsContainer = document.getElementById('lessonButtons');
    
    lessons.forEach(lesson => {
        const button = document.createElement('button');
        button.className = 'lesson-button';
        button.setAttribute('data-lesson', lesson);
        const [volume, lessonNum] = lesson.split('-');
        button.textContent = `${volume.substring(1)}-${lessonNum.substring(1)}`;
        button.onclick = () => filterByLesson(lesson);
        buttonsContainer.appendChild(button);
    });
}

// 按课程筛选词条
function filterByLesson(lesson) {
    const buttons = document.querySelectorAll('.lesson-button');
    buttons.forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-lesson') === lesson);
    });

    // 获取当前课程的所有词条
    const lessonEntries = dictionaryData.filter(entry => entry.lesson === lesson);

    // 显示侧边栏
    const sidebar = document.getElementById('wordSidebar');
    const wordList = document.getElementById('wordList');
    sidebar.style.display = 'block';
    
    // 生成词汇列表，只显示藏文
    wordList.innerHTML = lessonEntries.map(entry => `
        <div class="word-item" onclick="scrollToWord('${entry.word}')">
            ${entry.word}
        </div>
    `).join('');

    // 显示词条内容
    const container = document.getElementById('dictionaryEntries');
    container.innerHTML = '';
    
    // 添加课程信息提示
    const resultElement = document.createElement('div');
    resultElement.className = 'search-result';
    const [volume, lessonNum] = lesson.split('-');
    resultElement.innerHTML = `<p>Volume ${volume.substring(1)} Lesson ${lessonNum.substring(1)} - ${lessonEntries.length} entries</p>`;
    container.appendChild(resultElement);

    // 显示该课程的所有词条
    lessonEntries.forEach(entry => {
        const entryElement = document.createElement('div');
        entryElement.innerHTML = createEntryHTML(entry);
        container.appendChild(entryElement.firstElementChild);
    });
}

// 添加滚动到指定词条的函数
function scrollToWord(word) {
    const entry = document.querySelector(`[data-word="${word}"]`);
    if (entry) {
        entry.scrollIntoView({ behavior: 'smooth' });
        // 添加高亮效果
        entry.classList.add('highlight');
        setTimeout(() => entry.classList.remove('highlight'), 2000);
    }
}

// 修改搜索函数，考虑课程筛选
function searchDictionary() {
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput.value.trim().toLowerCase();
    const activeLesson = document.querySelector('.lesson-button.active')?.getAttribute('data-lesson');

    const entries = document.querySelectorAll('.entry');
    entries.forEach(entry => {
        const wordContent = entry.textContent.toLowerCase();
        const wordData = entry.getAttribute('data-word');
        const entryData = dictionaryData.find(data => data.word === wordData);
        
        let shouldShow = true;
        
        // 检查搜索词
        if (searchTerm !== '') {
            shouldShow = wordContent.includes(searchTerm) || 
                        (wordData && wordData.toLowerCase().includes(searchTerm));
        }
        
        // 检查课程筛选
        if (activeLesson && shouldShow) {
            shouldShow = entryData.lesson === activeLesson;
        }
        
        entry.hidden = !shouldShow;
    });
}

// 修改页面加载初始化函数
document.addEventListener('DOMContentLoaded', function() {
    // 生成课程按钮
    generateLessonButtons();
    
    // 获取词条容器
    const container = document.getElementById('dictionaryEntries');
    
    // 生成所有词条但默认隐藏
    dictionaryData.forEach(entry => {
        const entryElement = document.createElement('div');
        entryElement.innerHTML = createEntryHTML(entry);
        entryElement.firstElementChild.hidden = true;
        container.appendChild(entryElement.firstElementChild);
    });

    // 添加提示信息
    const promptElement = document.createElement('div');
    promptElement.className = 'initial-prompt';
    promptElement.innerHTML = '<p>Please use the search box or click on a lesson button to view entries</p>';
    container.insertBefore(promptElement, container.firstChild);
});

// 生成词条HTML的函数
function createEntryHTML(entryData) {
    const conjugationHTML = entryData.partOfSpeech === 'v' ? `
        <div class="conjugation">
            <h3>Conjugation</h3>
            <table>
                <tr>
                    <td>Past:</td>
                    <td>${entryData.conjugation.past}</td>
                </tr>
                <tr>
                    <td>Present:</td>
                    <td>${entryData.conjugation.present}</td>
                </tr>
                <tr>
                    <td>Future:</td>
                    <td>${entryData.conjugation.future}</td>
                </tr>
                <tr>
                    <td>Imperative:</td>
                    <td>${entryData.conjugation.imperative}</td>
                </tr>
            </table>
        </div>
    ` : '';

    return `
        <div class="entry" data-word="${entryData.word}">
            <div class="headword">
                <h1>${entryData.word}</h1>
                <audio controls>
                    <source src="${entryData.audio}" type="audio/mpeg">
                </audio>
            </div>
            
            <div class="definitions">
                <p class="part-of-speech"><b>${entryData.partOfSpeech}</b></p>
                ${conjugationHTML}
                <div class="meaning">
                    <p class="lang-fr">${entryData.meanings.fr}</p>
                    <p class="lang-en">${entryData.meanings.en}</p>
                    <p class="lang-ja">${entryData.meanings.ja}</p>
                    <p class="lang-zh">${entryData.meanings.zh}</p>
                </div>
            </div>
            
            <div class="examples">
                ${entryData.examples.map(example => `
                    <div class="example">
                        <p class="original">${example.original}</p>
                        <p class="translation en">${example.translations.en}</p>
                        <p class="translation ja">${example.translations.ja}</p>
                        <p class="translation zh">${example.translations.zh}</p>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// 添加回车键搜索功能
document.getElementById('searchInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchDictionary();
    }
});

// 添加搜索建议功能
// 获取搜索相关的DOM元素
const searchInput = document.getElementById('searchInput');
const suggestionsDiv = document.getElementById('suggestions');

// 添加输入事件监听
searchInput.addEventListener('input', function() {
    const searchTerm = this.value.trim();
    showSuggestions(searchTerm);
});

// 修改显示建议的函数
function showSuggestions(searchTerm) {
    if (!searchTerm) {
        suggestionsDiv.style.display = 'none';
        return;
    }

    const matches = dictionaryData.filter(entry => 
        entry.word.includes(searchTerm) || 
        Object.values(entry.meanings).some(meaning => 
            meaning.toLowerCase().includes(searchTerm.toLowerCase())
        )
    ).slice(0, 5); // 限制显示前5个匹配结果

    if (matches.length > 0) {
        suggestionsDiv.innerHTML = matches.map(entry => `
            <div class="suggestion-item" onclick="selectWord('${entry.word}')">
                <span class="tibetan-text">${entry.word}</span> - ${entry.meanings.zh}- ${entry.meanings.en}- ${entry.meanings.fr}
            </div>
        `).join('');
        suggestionsDiv.style.display = 'block';
    } else {
        suggestionsDiv.style.display = 'none';
    }
}

// 选择建议词
function selectSuggestion(word) {
    document.getElementById('searchInput').value = word;
    document.getElementById('suggestions').style.display = 'none';
    searchDictionary();
}

// 生成词条 HTML
function generateEntryHTML(entry) {
    return `
        <div class="entry" id="${entry.word}">
            <div class="headword">
                <h1>${entry.word}</h1>
                <p class="part-of-speech">${entry.partOfSpeech}</p>
            </div>
            
            <audio controls>
                <source src="${entry.audio}" type="audio/wav">
            </audio>

            <div class="meaning">
                <p class="lang-fr">${entry.meanings.fr}</p>
                <p class="lang-en">${entry.meanings.en}</p>
                <p class="lang-ja">${entry.meanings.ja}</p>
                <p class="lang-zh">${entry.meanings.zh}</p>
            </div>

            ${entry.conjugation ? `
                <div class="conjugation">
                    <h3>动词变位</h3>
                    <table>
                        <tr><td>过去时</td><td>${entry.conjugation.past}</td></tr>
                        <tr><td>现在时</td><td>${entry.conjugation.present}</td></tr>
                        <tr><td>将来时</td><td>${entry.conjugation.future}</td></tr>
                        <tr><td>命令式</td><td>${entry.conjugation.imperative}</td></tr>
                    </table>
                </div>
            ` : ''}

            <div class="examples">
                ${entry.examples.map(example => `
                    <div class="example">
                        <p class="original">${example.original}</p>
                        ${Object.entries(example.translations).map(([lang, text]) => 
                            `<p class="translation lang-${lang}">${text}</p>`
                        ).join('')}
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// 修改选择单词的函数
function selectWord(word) {
    const dictionaryEntries = document.getElementById('dictionaryEntries');
    const entry = dictionaryData.find(e => e.word === word);
    
    if (entry) {
        // 清空现有内容并显示选中的词条
        dictionaryEntries.innerHTML = generateEntryHTML(entry);
        
        // 添加高亮效果
        const entryElement = document.getElementById(word);
        entryElement.classList.add('highlight');
        setTimeout(() => entryElement.classList.remove('highlight'), 2000);
        
        // 关闭建议列表并更新搜索框
        suggestionsDiv.style.display = 'none';
        searchInput.value = word;
        
        // 滚动到词条位置
        entryElement.scrollIntoView({ behavior: 'smooth' });
    }
}

// 搜索按钮点击事件
function searchDictionary() {
    const searchTerm = searchInput.value.toLowerCase();
    const entries = document.querySelectorAll('.entry');
    
    entries.forEach(entry => {
        const word = entry.querySelector('.headword h1').textContent.toLowerCase();
        const meanings = Array.from(entry.querySelectorAll('.meaning p')).map(p => p.textContent.toLowerCase());
        
        if (word.includes(searchTerm) || meanings.some(meaning => meaning.includes(searchTerm))) {
            entry.hidden = false;
            entry.classList.add('highlight');
            setTimeout(() => entry.classList.remove('highlight'), 2000);
        } else {
            entry.hidden = true;
        }
    });
}

// 点击页面其他地方关闭建议列表
document.addEventListener('click', function(e) {
    if (!e.target.closest('.search-input-wrapper')) {
        suggestionsDiv.style.display = 'none';
    }
});