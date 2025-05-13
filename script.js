// DOM 요소
const videoPlayer = document.getElementById('lecture-video');
const videoContainer = document.getElementById('video-container');
const chapterList = document.getElementById('chapter-list');
const chapterItems = chapterList.getElementsByTagName('li');
const quizSection = document.getElementById('quiz-section');
const questionText = document.getElementById('question-text');
const quizOptions = document.querySelectorAll('.quiz-option');
const quizFeedback = document.getElementById('quiz-feedback');
const prevQuestionBtn = document.getElementById('prev-question');
const nextQuestionBtn = document.getElementById('next-question');
const questionNumber = document.getElementById('question-number');
const lectureNotes = document.getElementById('lecture-notes');
const quizChapter = document.getElementById('quiz-chapter');
const prevVideoBtn = document.getElementById('prev-video');
const nextVideoBtn = document.getElementById('next-video');
const saveNoteBtn = document.getElementById('save-note');
const savedNotesContainer = document.getElementById('saved-notes');
const resetProgressBtn = document.getElementById('reset-progress');
const nextVideoMessage = document.getElementById('next-video-message');
const quizResultSection = document.getElementById('quiz-result-section') || document.createElement('div');

// 재생 속도 조절 슬라이더 추가
const playbackSpeedControls = document.createElement('div');
playbackSpeedControls.className = 'playback-speed-controls mt-0 mb-3 d-flex align-items-center justify-content-end';
playbackSpeedControls.innerHTML = `
    <div class="d-flex align-items-center justify-content-end" style="width: 100%;">
        <span class="speed-label me-2">재생 속도: <span id="speed-value">1.0</span>x</span>
        <input type="range" id="speed-slider" class="form-range" min="0.5" max="2" step="0.25" value="1" style="width: 33%;">
    </div>
    <style>
        #speed-slider::-webkit-slider-thumb {
            background-color: #dc3545;
        }
        #speed-slider::-moz-range-thumb {
            background-color: #dc3545;
        }
        #speed-slider::-ms-thumb {
            background-color: #dc3545;
        }
        #speed-slider::-webkit-slider-runnable-track {
            background-color: rgba(220, 53, 69, 0.25);
        }
        #speed-slider::-moz-range-track {
            background-color: rgba(220, 53, 69, 0.25);
        }
        #speed-slider::-ms-track {
            background-color: rgba(220, 53, 69, 0.25);
        }
        .video-navigation {
            margin-top: 1rem;
            margin-bottom: 1rem;
        }
        #video-container {
            margin-bottom: 0;
        }
        .playback-speed-controls {
            padding-right: 10px;
        }
        #page-position {
            font-size: 1.5rem;
            font-weight: 500;
            color: #555;
            margin-left: 1rem;
        }
        #quiz-page-position {
            font-size: 1.5rem;
            font-weight: 500;
            color: #555;
            margin-left: 16px;
        }
    </style>
`;

// 페이지 위치 표시 요소 생성
const pagePositionElement = document.createElement('span');
pagePositionElement.id = 'page-position';
pagePositionElement.className = 'ms-3';
pagePositionElement.textContent = '( 1 / 13 )';

// 퀴즈 페이지용 위치 표시 요소 생성
const quizPagePositionElement = document.createElement('span');
quizPagePositionElement.id = 'quiz-page-position';
quizPagePositionElement.className = 'ms-3';
quizPagePositionElement.textContent = '( 1 / 13 )';

// video-navigation 요소 찾기
const videoNavigation = document.querySelector('.video-navigation');

// video-navigation 영역 위에 슬라이더 삽입
if (videoNavigation && videoNavigation.parentNode) {
    videoNavigation.parentNode.insertBefore(playbackSpeedControls, videoNavigation);
    
    // 다음 비디오 버튼 다음에 페이지 위치 표시 삽입
    if (nextVideoBtn && nextVideoBtn.parentNode) {
        nextVideoBtn.parentNode.insertBefore(pagePositionElement, nextVideoBtn.nextSibling);
    }
} else if (videoContainer && videoContainer.parentNode) {
    // 대체 방안: video-navigation이 없으면 기존처럼 video-container 다음에 삽입
    videoContainer.parentNode.insertBefore(playbackSpeedControls, videoContainer.nextSibling);
}

// 퀴즈의 다음 문제 버튼 다음에 페이지 위치 표시 삽입
if (nextQuestionBtn && nextQuestionBtn.parentNode) {
    // 다음 문제 버튼을 감싸는 컨테이너 생성
    const nextBtnContainer = document.createElement('div');
    nextBtnContainer.className = 'd-flex align-items-center';
    
    // 다음 문제 버튼의 부모 요소
    const quizNavigation = nextQuestionBtn.parentNode;
    
    // 이전 버튼, 문제 번호, 새 컨테이너로 네비게이션 재구성
    quizNavigation.innerHTML = '';
    
    // 이전 문제 버튼
    quizNavigation.appendChild(prevQuestionBtn);
    
    // 문제 번호
    const questionNumberContainer = document.createElement('div');
    questionNumberContainer.appendChild(questionNumber);
    quizNavigation.appendChild(questionNumberContainer);
    
    // 다음 문제 버튼과 위치 표시를 한 컨테이너에 넣기
    nextBtnContainer.appendChild(nextQuestionBtn);
    nextBtnContainer.appendChild(quizPagePositionElement);
    quizNavigation.appendChild(nextBtnContainer);
    
    // 네비게이션 스타일 조정
    quizNavigation.classList.add('justify-content-between');
    
    // CSS 스타일 추가
    const style = document.createElement('style');
    style.textContent = `
        .quiz-navigation {
            display: flex;
            align-items: center;
            margin-top: 1rem;
        }
        #quiz-page-position {
            font-size: 1.5rem;
            font-weight: 500;
            color: #555;
            margin-left: 16px;
        }
    `;
    document.head.appendChild(style);
}

// 슬라이더 및 표시 요소 참조 가져오기
const speedSlider = document.getElementById('speed-slider');
const speedValue = document.getElementById('speed-value');
const pagePosition = document.getElementById('page-position');
const quizPagePosition = document.getElementById('quiz-page-position');

// 슬라이더 이벤트 리스너 추가
if (speedSlider) {
    speedSlider.addEventListener('input', function() {
        const speed = parseFloat(this.value);
        videoPlayer.playbackRate = speed;
        speedValue.textContent = speed.toFixed(2).replace(/\.?0+$/, ''); // 소수점 이하 불필요한 0 제거
        
        // 설정 저장
        localStorage.setItem('playbackSpeed', speed);
    });
}

// 퀴즈 결과 섹션이 없으면 생성하고 추가
if (!document.getElementById('quiz-result-section')) {
    quizResultSection.id = 'quiz-result-section';
    quizResultSection.className = 'd-none';
    quizResultSection.innerHTML = `
        <div class="quiz-result-content bg-white p-4 rounded shadow-sm border">
            <h3>퀴즈 결과</h3>
            <div id="quiz-results-container" class="quiz-results-container mb-4"></div>
            <div class="quiz-nav-buttons py-4 d-flex justify-content-between">
                <button id="retake-quiz" class="btn btn-secondary">문제 다시 풀기</button>
                <div class="d-flex align-items-center">
                    <button id="goto-next-video" class="btn btn-warning">다음 영상</button>
                    <span id="result-page-position" class="ms-3">( 12 / 13 )</span>
                </div>
            </div>
        </div>
        <style>
            .quiz-result-item {
                margin-bottom: 20px;
                padding: 15px;
                border-radius: 8px;
                background-color: #f8f9fa;
                border-left: 4px solid #ccc;
            }
            .quiz-result-item.correct {
                border-left-color: #28a745;
            }
            .quiz-result-item.incorrect {
                border-left-color: #dc3545;
            }
            .answer-status {
                font-weight: bold;
                margin-top: 10px;
            }
            .explanation {
                padding: 8px;
                background-color: #f8d7da;
                border-radius: 4px;
                margin-top: 5px;
            }
            .quiz-results-container {
                max-height: 500px;
                overflow-y: auto;
            }
            .btn-warning {
                background-color: #fd7e14;
                border-color: #fd7e14;
                color: white;
            }
            .btn-warning:hover {
                background-color: #e96b02;
                border-color: #e96b02;
                color: white;
            }
            #quiz-result-section {
                margin-bottom: 2rem;
            }
            #result-page-position {
                font-size: 1.5rem;
                font-weight: 500;
                color: #555;
                margin-left: 16px;
            }
        </style>
    `;
    quizSection.parentNode.insertBefore(quizResultSection, quizSection.nextSibling);
}

const retakeQuizBtn = document.getElementById('retake-quiz');
const gotoNextVideoBtn = document.getElementById('goto-next-video');
const quizResultsContainer = document.getElementById('quiz-results-container');

// 강의 챕터 데이터를 index.html의 목차에서 동적으로 생성
const chapters = Array.from(chapterItems).map((item, index) => {
    const title = item.textContent.trim();
    
    // 퀴즈 챕터인 경우
    if (item.id === 'quiz-chapter') {
        return { title, isQuiz: true };
    }
    
    // 일반 챕터인 경우
    const video = item.getAttribute('data-video');
    if (video) {
        return {
            title,
            video: `./videos/${video}`
        };
    }
    return { title, video: null };
});

// 퀴즈 데이터
const quizzes = [
    {
        question: '문제 1: CNN(Convolutional Neural Network)에서 이미지의 특성을 구분하기 위해 국소적 영역에 계산되어지는 작은 필터의 이름은 커널이다.',
        correctAnswer: 'O',
        explanation: 'CNN에서 사용자가 직접 커널의 값을 만들거나 선택할 필요 없이, 딥 러닝에 의해 이미지 분류 등의 목적에 부합하는 최적의 커널 값을 찾아냅니다.'
    },
    {
        question: '문제 2: 초점 거리(Focal Length)가 짧을수록 더 넓은 화각을 얻는다.',
        correctAnswer: 'O',
        explanation: '초점 거리가 짧을수록 더 넓은 화각을 얻으며, 화각이 180도로 가장 넓을 때를 피쉬-아이 뷰(Fish-eye View)라고 합니다.'
    },
    {
        question: '문제 3: 인공지능으로 이미지를 생성할 때 Context는 중요하지 않다.',
        correctAnswer: 'X',
        explanation: 'Context는 이미지의 배경과 상황을 설정하는 중요한 요소이며, 카메라에 대한 개념을 잘 모르더라도 시나리오를 제공하여 이미지를 생성할 수 있습니다.'
    }
];

// 현재 활성화된 챕터 및 퀴즈 인덱스
let currentChapterIndex = 0;
let currentQuizIndex = 0;

// 완료된 챕터 상태 저장
let completedChapters = [];

// 강의 노트 배열
let savedNotes = [];

// 퀴즈 결과 저장 변수 - 사용자 선택 답변 저장
let userAnswers = new Array(quizzes.length).fill(null);

// 로컬 스토리지에서 사용자 진행 상태 복원
function restoreUserProgress() {
    const savedChapterIndex = localStorage.getItem('currentChapterIndex');
    const currentNotes = localStorage.getItem('lectureNotes');
    
    // 완료된 챕터 복원
    const savedCompletedChapters = localStorage.getItem('completedChapters');
    if (savedCompletedChapters) {
        completedChapters = JSON.parse(savedCompletedChapters);
        updateCompletedChapters();
    }
    
    // 저장된 노트 복원
    const savedNotesData = localStorage.getItem('savedNotes');
    if (savedNotesData) {
        savedNotes = JSON.parse(savedNotesData);
        renderSavedNotes();
    }
    
    if (savedChapterIndex) {
        currentChapterIndex = parseInt(savedChapterIndex);
    }
    
    if (currentNotes) {
        lectureNotes.value = currentNotes;
    }
    
    updateUI();
    updateNavigationButtons();
}

// 강의 목차 클릭 이벤트 처리 - 자동 재생 없음
chapterList.addEventListener('click', function(event) {
    if (event.target.tagName === 'LI') {
        const clickedIndex = Array.from(chapterItems).indexOf(event.target);
        changeChapter(clickedIndex, false); // 목차 클릭 시 자동 재생 안함
    }
});

// 챕터 변경 함수
function changeChapter(index, autoPlay = false) {
    // 이전 활성 챕터 비활성화
    chapterItems[currentChapterIndex].classList.remove('active');
    
    // 새 챕터 활성화
    currentChapterIndex = index;
    chapterItems[currentChapterIndex].classList.add('active');
    
    // 다음 영상 메시지 숨기기
    nextVideoMessage.style.display = 'none';
    
    // 항상 퀴즈 결과 섹션 숨기기 및 버튼 상태 복원
    quizResultSection.classList.add('d-none');
    prevVideoBtn.style.display = '';
    nextVideoBtn.style.display = '';
    
    // 페이지 위치 업데이트
    updatePagePosition();
    
    // 퀴즈 챕터인 경우 비디오 대신 퀴즈 섹션 표시
    if (chapters[currentChapterIndex].isQuiz) {
        videoContainer.style.display = 'none';
        quizSection.style.display = 'block';
        
        // 퀴즈 첫 문제부터 시작
        currentQuizIndex = 0;
        updateQuizUI();
    } else {
        // 일반 챕터인 경우 비디오 표시, 퀴즈 숨김
        videoContainer.style.display = 'block';
        quizSection.style.display = 'none';
        
        // 비디오 소스 변경
        const videoSrc = chapters[currentChapterIndex].video;
        if (videoSrc) {
            videoPlayer.src = videoSrc;
            videoPlayer.load();
            
            // 자동 재생 옵션이 true이면 재생
            if (autoPlay) {
                videoPlayer.play();
            }
        }
    }
    
    // 진행 상태 저장
    localStorage.setItem('currentChapterIndex', currentChapterIndex);
    
    // 네비게이션 버튼 상태 업데이트
    updateNavigationButtons();
}

// 퀴즈 옵션 클릭 이벤트 처리
quizOptions.forEach(option => {
    option.addEventListener('click', function() {
        const selectedAnswer = this.getAttribute('data-answer');
        const correctAnswer = quizzes[currentQuizIndex].correctAnswer;
        
        // 이미 답을 선택한 경우 무시
        if (!quizFeedback.classList.contains('d-none')) return;
        
        // 선택 상태 표시
        quizOptions.forEach(opt => {
            if (opt.getAttribute('data-question-index') == currentQuizIndex) {
                opt.classList.remove('selected', 'incorrect');
            }
        });
        this.classList.add('selected');
        this.setAttribute('data-question-index', currentQuizIndex);
        
        // 사용자 답변 저장
        userAnswers[currentQuizIndex] = selectedAnswer;
        
        // 정답 체크
        if (selectedAnswer === correctAnswer) {
            quizFeedback.textContent = '정답입니다! ' + quizzes[currentQuizIndex].explanation;
            quizFeedback.className = 'feedback alert alert-success';
        } else {
            quizFeedback.textContent = '오답입니다. ' + quizzes[currentQuizIndex].explanation;
            quizFeedback.className = 'feedback alert alert-danger';
            this.classList.add('incorrect');
        }
        
        // 피드백 표시
        quizFeedback.classList.remove('d-none');
    });
});

// 다음 문제 버튼 클릭 이벤트
nextQuestionBtn.addEventListener('click', function() {
    // 마지막 문제에서 정답 확인 기능으로 작동
    if (currentQuizIndex === quizzes.length - 1 && nextQuestionBtn.textContent === '정답 확인') {
        showQuizResults();
        return;
    }
    
    if (currentQuizIndex < quizzes.length - 1) {
        currentQuizIndex++;
        updateQuizUI();
    }
});

// 이전 문제 버튼 클릭 이벤트
prevQuestionBtn.addEventListener('click', function() {
    if (currentQuizIndex > 0) {
        currentQuizIndex--;
        updateQuizUI();
    }
});

// 이전 영상 버튼 클릭 이벤트 - 자동 재생 실행
prevVideoBtn.addEventListener('click', function() {
    if (currentChapterIndex > 0) {
        // 아웃트로에서 이전 영상을 누를 때 퀴즈로 이동
        const isOutro = chapters[currentChapterIndex].title.toLowerCase().includes('outro') || 
                        chapters[currentChapterIndex].title.includes('아웃트로');
                        
        if (isOutro) {
            // 퀴즈 챕터 찾기
            let quizIndex = -1;
            for (let i = currentChapterIndex - 1; i >= 0; i--) {
                if (chapters[i].isQuiz) {
                    quizIndex = i;
                    break;
                }
            }
            
            if (quizIndex !== -1) {
                changeChapter(quizIndex, true); // 이전 영상 버튼으로 이동 시 자동 재생
                return;
            }
        }
        
        // 일반적인 경우: 이전 챕터를 찾되, 소제목(section-title)과 퀴즈는 건너뜀
        let prevIndex = currentChapterIndex - 1;
        while (prevIndex >= 0 && 
              (chapters[prevIndex].isQuiz || 
               chapterItems[prevIndex].classList.contains('section-title'))) {
            prevIndex--;
        }
        
        if (prevIndex >= 0) {
            changeChapter(prevIndex, true); // 이전 영상 버튼으로 이동 시 자동 재생
        }
    }
});

// 다음 영상 버튼 클릭 이벤트 - 자동 재생 실행
nextVideoBtn.addEventListener('click', function() {
    if (currentChapterIndex < chapters.length - 1) {
        // 요약하기 챕터인 경우는 퀴즈를 건너뛰지 않음
        if (chapters[currentChapterIndex].title.includes('요약하기')) {
            let nextIndex = currentChapterIndex + 1;
            // 소제목(section-title)만 건너뜀
            while (nextIndex < chapters.length && 
                  chapterItems[nextIndex].classList.contains('section-title')) {
                nextIndex++;
            }
            
            if (nextIndex < chapters.length) {
                changeChapter(nextIndex, true); // 다음 영상 버튼으로 이동 시 자동 재생
            }
        } else {
            // 다른 챕터의 경우 기존대로 퀴즈와 소제목 모두 건너뜀
            let nextIndex = currentChapterIndex + 1;
            while (nextIndex < chapters.length &&
                  (chapters[nextIndex].isQuiz || 
                   chapterItems[nextIndex].classList.contains('section-title'))) {
                nextIndex++;
            }
            
            if (nextIndex < chapters.length) {
                changeChapter(nextIndex, true); // 다음 영상 버튼으로 이동 시 자동 재생
            }
        }
    }
});

// 노트 저장 버튼 클릭 이벤트
saveNoteBtn.addEventListener('click', function() {
    const noteText = lectureNotes.value.trim();
    
    if (noteText) {
        const currentDate = new Date();
        const formattedDate = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')} ${currentDate.getHours().toString().padStart(2, '0')}:${currentDate.getMinutes().toString().padStart(2, '0')}`;
        
        const note = {
            id: Date.now(),
            text: noteText,
            date: formattedDate,
            chapter: chapters[currentChapterIndex].title
        };
        
        // 노트 배열에 추가
        savedNotes.unshift(note);
        
        // 로컬 스토리지에 저장
        localStorage.setItem('savedNotes', JSON.stringify(savedNotes));
        
        // 노트 렌더링
        renderSavedNotes();
        
        // 노트 입력창 초기화
        lectureNotes.value = '';
        localStorage.setItem('lectureNotes', '');
    }
});

// 진행 상황 초기화 버튼 클릭 이벤트
resetProgressBtn.addEventListener('click', function() {
    if (confirm('모든 진행 상황을 초기화하시겠습니까?')) {
        // 완료된 챕터 정보 초기화
        completedChapters = [];
        localStorage.removeItem('completedChapters');
        
        // 모든 챕터에서 completed 클래스 제거
        Array.from(chapterItems).forEach(item => {
            item.classList.remove('completed');
        });
    }
});

// 네비게이션 버튼 상태 업데이트
function updateNavigationButtons() {
    // 이전 영상 버튼 상태
    let hasPrevVideo = false;
    for (let i = currentChapterIndex - 1; i >= 0; i--) {
        if (!chapters[i].isQuiz && !chapterItems[i].classList.contains('section-title')) {
            hasPrevVideo = true;
            break;
        }
    }
    prevVideoBtn.disabled = !hasPrevVideo;
    
    // 다음 영상 버튼 상태
    let hasNextVideo = false;

    // 요약하기 챕터인 경우는 퀴즈를 건너뛰지 않음
    if (chapters[currentChapterIndex].title.includes('요약하기')) {
        for (let i = currentChapterIndex + 1; i < chapters.length; i++) {
            if (!chapterItems[i].classList.contains('section-title')) {
                hasNextVideo = true;
                break;
            }
        }
    } else {
        // 다른 챕터의 경우 기존대로 퀴즈와 소제목 모두 건너뜀
        for (let i = currentChapterIndex + 1; i < chapters.length; i++) {
            if (!chapters[i].isQuiz && !chapterItems[i].classList.contains('section-title')) {
                hasNextVideo = true;
                break;
            }
        }
    }
    
    nextVideoBtn.disabled = !hasNextVideo;
}

// 퀴즈 UI 업데이트
function updateQuizUI() {
    // 문제 텍스트 업데이트
    questionText.textContent = quizzes[currentQuizIndex].question;
    
    // 피드백 초기화
    quizFeedback.textContent = '';
    quizFeedback.className = 'feedback alert d-none';
    
    // 선택 상태 초기화 및 이전 선택 복원
    quizOptions.forEach(option => {
        option.classList.remove('selected', 'incorrect');
        
        // 이전에 선택했던 답변이 있으면 선택 상태 복원
        if (userAnswers[currentQuizIndex] !== null && 
            option.getAttribute('data-answer') === userAnswers[currentQuizIndex]) {
            option.classList.add('selected');
            option.setAttribute('data-question-index', currentQuizIndex);
            
            // 정답/오답 표시 복원
            if (userAnswers[currentQuizIndex] !== quizzes[currentQuizIndex].correctAnswer) {
                option.classList.add('incorrect');
            }
            
            // 피드백 메시지 복원
            if (userAnswers[currentQuizIndex] === quizzes[currentQuizIndex].correctAnswer) {
                quizFeedback.textContent = '정답입니다! ' + quizzes[currentQuizIndex].explanation;
                quizFeedback.className = 'feedback alert alert-success';
            } else {
                quizFeedback.textContent = '오답입니다. ' + quizzes[currentQuizIndex].explanation;
                quizFeedback.className = 'feedback alert alert-danger';
            }
            
            // 피드백 표시
            quizFeedback.classList.remove('d-none');
        }
    });
    
    // 네비게이션 버튼 상태 업데이트
    prevQuestionBtn.disabled = currentQuizIndex === 0;
    
    // 마지막 문제일 경우 '다음 문제' 버튼을 '정답 확인'으로 변경
    if (currentQuizIndex === quizzes.length - 1) {
        nextQuestionBtn.textContent = '정답 확인';
    } else {
        nextQuestionBtn.textContent = '다음 문제';
        nextQuestionBtn.disabled = false;
    }
    
    // 문제 번호 업데이트
    questionNumber.textContent = `${currentQuizIndex + 1}/${quizzes.length}`;
    
    // 퀴즈 결과 섹션 숨기기
    quizResultSection.classList.add('d-none');
    quizSection.classList.remove('d-none');
}

// 완료된 챕터 업데이트
function updateCompletedChapters() {
    Array.from(chapterItems).forEach((item, index) => {
        if (completedChapters.includes(index)) {
            item.classList.add('completed');
        }
    });
}

// 노트 저장
lectureNotes.addEventListener('input', function() {
    localStorage.setItem('lectureNotes', this.value);
});

// 저장된 노트 렌더링
function renderSavedNotes() {
    savedNotesContainer.innerHTML = '';
    
    if (savedNotes.length === 0) {
        savedNotesContainer.innerHTML = '<div class="alert alert-light">저장된 노트가 없습니다.</div>';
        return;
    }
    
    savedNotes.forEach(note => {
        const noteCard = document.createElement('div');
        noteCard.className = 'note-card';
        
        const notePreview = note.text.length > 50 ? note.text.substring(0, 50) + '...' : note.text;
        
        noteCard.innerHTML = `
            <p class="note-content">${notePreview}</p>
            <p class="note-date">${note.date} - ${note.chapter}</p>
            <div class="note-actions">
                <button class="download-button" data-id="${note.id}" title="다운로드"><i class="fas fa-download"></i></button>
                <button class="delete-button" data-id="${note.id}" title="삭제"><i class="fas fa-trash-alt"></i></button>
            </div>
        `;
        
        savedNotesContainer.appendChild(noteCard);
    });
    
    // 다운로드 버튼 이벤트 추가
    document.querySelectorAll('.download-button').forEach(button => {
        button.addEventListener('click', function() {
            const noteId = parseInt(this.getAttribute('data-id'));
            const note = savedNotes.find(n => n.id === noteId);
            
            if (note) {
                downloadNoteAsTxt(note);
            }
        });
    });
    
    // 삭제 버튼 이벤트 추가
    document.querySelectorAll('.delete-button').forEach(button => {
        button.addEventListener('click', function() {
            const noteId = parseInt(this.getAttribute('data-id'));
            deleteNote(noteId);
        });
    });
}

// 노트 삭제 함수
function deleteNote(noteId) {
    if (confirm('정말 이 노트를 삭제하시겠습니까?')) {
        // 노트 배열에서 해당 ID의 노트 제거
        savedNotes = savedNotes.filter(note => note.id !== noteId);
        
        // 로컬 스토리지 업데이트
        localStorage.setItem('savedNotes', JSON.stringify(savedNotes));
        
        // 노트 리스트 다시 렌더링
        renderSavedNotes();
    }
}

// 노트를 텍스트 파일로 다운로드
function downloadNoteAsTxt(note) {
    const fileName = `강의노트_${note.chapter.replace(/[^\w가-힣]/g, '_')}_${note.date.replace(/[^\w]/g, '_')}.txt`;
    const noteContent = `강의: ${note.chapter}\n날짜: ${note.date}\n\n${note.text}`;
    
    const blob = new Blob([noteContent], { type: 'text/plain;charset=utf-8' });
    
    // 다운로드 링크 생성 및 클릭
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = fileName;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}

// UI 업데이트
function updateUI() {
    // 현재 챕터 활성화
    Array.from(chapterItems).forEach((item, index) => {
        item.classList.toggle('active', index === currentChapterIndex);
    });
    
    // 현재 챕터가 퀴즈인지 확인
    if (chapters[currentChapterIndex].isQuiz) {
        videoContainer.style.display = 'none';
        quizSection.style.display = 'block';
        updateQuizUI();
    } else {
        videoContainer.style.display = 'block';
        quizSection.style.display = 'none';
        
        // 비디오 소스 설정
        const videoSrc = chapters[currentChapterIndex].video;
        if (videoSrc) {
            videoPlayer.src = videoSrc;
            videoPlayer.load();
            
            // 자동 재생 하지 않음
            // videoPlayer.play();
        }
    }
}

// 초기화
document.addEventListener('DOMContentLoaded', function() {
    // 인트로 챕터 찾기
    let introIndex = 0; // 기본값으로 첫 번째 챕터 사용
    
    // 챕터 제목에 "인트로" 또는 "intro"가 포함된 항목 찾되, section-title 클래스를 가진 항목은 제외
    for (let i = 0; i < chapters.length; i++) {
        if (chapterItems[i].classList.contains('section-title')) {
            // section-title 클래스를 가진 항목(클릭할 수 없는 제목)은 건너뜀
            continue;
        }
        const title = chapters[i].title.toLowerCase();
        if (title.includes('인트로') || title.includes('intro')) {
            introIndex = i;
            break;
        }
    }
    
    // 로컬 스토리지에 저장된 데이터가 있으면 복원, 없으면 인트로 챕터로 시작
    const savedChapterIndex = localStorage.getItem('currentChapterIndex');
    if (savedChapterIndex) {
        restoreUserProgress();
        // 페이지 위치 업데이트
        updatePagePosition();
    } else {
        // 인트로 챕터로 시작
        currentChapterIndex = introIndex;
        changeChapter(introIndex);
    }
    
    // 저장된 재생 속도 복원
    const savedSpeed = localStorage.getItem('playbackSpeed');
    if (savedSpeed && speedSlider) {
        const speed = parseFloat(savedSpeed);
        videoPlayer.playbackRate = speed;
        speedSlider.value = speed;
        speedValue.textContent = speed.toFixed(2).replace(/\.?0+$/, '');
    }
    
    // 비디오 종료 이벤트 - 자동 이동 대신 메시지 표시
    videoPlayer.addEventListener('ended', function() {
        // 현재 챕터를 완료 상태로 표시
        if (!completedChapters.includes(currentChapterIndex)) {
            completedChapters.push(currentChapterIndex);
            chapterItems[currentChapterIndex].classList.add('completed');
            localStorage.setItem('completedChapters', JSON.stringify(completedChapters));
        }
        
        // 다음 영상이 있는지 확인
        let hasNextVideo = false;
        
        // 요약하기 챕터인 경우는 퀴즈를 건너뛰지 않음
        if (chapters[currentChapterIndex].title.includes('요약하기')) {
            for (let i = currentChapterIndex + 1; i < chapters.length; i++) {
                if (!chapterItems[i].classList.contains('section-title')) {
                    hasNextVideo = true;
                    break;
                }
            }
        } else {
            // 다른 챕터의 경우 기존대로 퀴즈와 소제목 모두 건너뜀
            for (let i = currentChapterIndex + 1; i < chapters.length; i++) {
                if (!chapters[i].isQuiz && !chapterItems[i].classList.contains('section-title')) {
                    hasNextVideo = true;
                    break;
                }
            }
        }
        
        // 다음 영상으로 이동하세요 메시지 표시
        if (hasNextVideo) {
            nextVideoMessage.style.display = 'block';
        }
    });
    
    // 비디오 진행 상태 확인 (완료 표시를 위해)
    videoPlayer.addEventListener('timeupdate', function() {
        // 비디오 90% 이상 시청 시 완료 처리
        if (videoPlayer.currentTime > videoPlayer.duration * 0.9) {
            if (!completedChapters.includes(currentChapterIndex)) {
                completedChapters.push(currentChapterIndex);
                chapterItems[currentChapterIndex].classList.add('completed');
                localStorage.setItem('completedChapters', JSON.stringify(completedChapters));
            }
        }
    });
    
    // 비디오 로드될 때마다 저장된 재생 속도 적용
    videoPlayer.addEventListener('loadedmetadata', function() {
        const savedSpeed = localStorage.getItem('playbackSpeed');
        if (savedSpeed) {
            videoPlayer.playbackRate = parseFloat(savedSpeed);
        }
    });
});

// 퀴즈 결과 표시 함수
function showQuizResults() {
    // 퀴즈 섹션을 숨기고 결과 섹션 표시
    quizSection.classList.add('d-none');
    quizResultSection.classList.remove('d-none');
    
    // 퀴즈 결과 컨테이너 초기화
    quizResultsContainer.innerHTML = '';
    
    let correctCount = 0;
    
    // 각 문제별 결과 표시
    quizzes.forEach((quiz, index) => {
        const userAnswer = getUserAnswer(index);
        const isCorrect = userAnswer === quiz.correctAnswer;
        
        if (isCorrect) correctCount++;
        
        const resultItem = document.createElement('div');
        resultItem.className = `quiz-result-item ${isCorrect ? 'correct' : 'incorrect'}`;
        resultItem.innerHTML = `
            <h4>문제 ${index + 1}</h4>
            <p>${quiz.question}</p>
            <p class="answer-status ${isCorrect ? 'text-success' : 'text-danger'}">
                ${isCorrect ? '✓ 정답' : '✗ 오답'}
            </p>
            ${!isCorrect ? `<p class="explanation">${quiz.explanation}</p>` : ''}
        `;
        
        quizResultsContainer.appendChild(resultItem);
    });
    
    // 퀴즈 전체 점수 표시
    const scoreItem = document.createElement('div');
    scoreItem.className = 'quiz-score';
    scoreItem.innerHTML = `
        <h4>총점: ${correctCount}/${quizzes.length}</h4>
    `;
    quizResultsContainer.prepend(scoreItem);
    
    // 비디오 버튼 숨기기
    prevVideoBtn.style.display = 'none';
    nextVideoBtn.style.display = 'none';
    
    // 퀴즈 완료 상태 업데이트
    if (!completedChapters.includes(currentChapterIndex)) {
        completedChapters.push(currentChapterIndex);
        chapterItems[currentChapterIndex].classList.add('completed');
        localStorage.setItem('completedChapters', JSON.stringify(completedChapters));
    }
}

// 사용자의 특정 문제 답변 가져오기
function getUserAnswer(quizIndex) {
    // 저장된 사용자 답변 반환
    return userAnswers[quizIndex];
}

// 문제 다시 풀기 버튼 클릭 이벤트
if (retakeQuizBtn) {
    retakeQuizBtn.addEventListener('click', function() {
        // 퀴즈 첫 문제로 돌아가기
        currentQuizIndex = 0;
        
        // 선택 상태 및 저장된 답변 초기화
        quizOptions.forEach(option => {
            option.classList.remove('selected', 'incorrect');
        });
        userAnswers = new Array(quizzes.length).fill(null);
        
        // 비디오 버튼 표시 복원
        prevVideoBtn.style.display = '';
        nextVideoBtn.style.display = '';
        
        // 퀴즈 UI 업데이트
        updateQuizUI();
    });
}

// 다음 영상으로 이동 메시지 클릭 이벤트
nextVideoMessage.addEventListener('click', function() {
    // 다음 영상 버튼과 같은 동작 수행
    nextVideoBtn.click();
});

// 다음 영상 버튼 클릭 이벤트 (퀴즈 결과 화면에서)
if (gotoNextVideoBtn) {
    gotoNextVideoBtn.addEventListener('click', function() {
        // 비디오 버튼 표시 복원
        prevVideoBtn.style.display = '';
        nextVideoBtn.style.display = '';
        
        // 아웃트로 챕터 찾기
        let outroIndex = -1;
        for (let i = 0; i < chapters.length; i++) {
            if (!chapters[i].isQuiz && 
                !chapterItems[i].classList.contains('section-title') &&
                (chapters[i].title.toLowerCase().includes('outro') || 
                 chapters[i].title.includes('아웃트로'))) {
                outroIndex = i;
                break;
            }
        }
        
        if (outroIndex !== -1) {
            changeChapter(outroIndex, true); // 퀴즈 결과 화면에서 다음 영상으로 이동 시 자동 재생
        } else {
            // 아웃트로가 없으면 일반 다음 영상으로 이동
            let nextIndex = currentChapterIndex + 1;
            while (nextIndex < chapters.length &&
                  (chapters[nextIndex].isQuiz || 
                   chapterItems[nextIndex].classList.contains('section-title'))) {
                nextIndex++;
            }
            
            if (nextIndex < chapters.length) {
                changeChapter(nextIndex, true); // 퀴즈 결과 화면에서 다음 영상으로 이동 시 자동 재생
            }
        }
    });
}

// 페이지 위치 업데이트 함수
function updatePagePosition() {
    // 페이지 번호 계산 (section-title 제외)
    let pageNumber = 1;
    let totalPages = 0;
    
    // 실제 페이지(section-title 아닌 항목) 개수 계산
    for (let i = 0; i < chapters.length; i++) {
        if (!chapterItems[i].classList.contains('section-title')) {
            totalPages++;
            if (i < currentChapterIndex) {
                pageNumber++;
            }
        }
    }
    
    // 위치 표시 텍스트
    const positionText = `( ${pageNumber} / 13 )`;
    
    // 비디오 페이지 위치 업데이트
    if (pagePosition) {
        pagePosition.textContent = positionText;
    }
    
    // 퀴즈 페이지 위치 업데이트
    if (quizPagePosition) {
        quizPagePosition.textContent = positionText;
    }
    
    // 퀴즈 결과 페이지 위치 업데이트
    const resultPagePosition = document.getElementById('result-page-position');
    if (resultPagePosition) {
        resultPagePosition.textContent = positionText;
    }
} 