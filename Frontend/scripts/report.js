// ============ ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ============
window.activeFreeSpace = null;
window.nextRowNumber = 7;
window.fieldIdCounter = 100;
window.customFields = [];
window.currentDate = new Date();
window.currentZoom = 100;

// ============ DOM ЭЛЕМЕНТЫ ============
window.dateDisplay = null;
window.saveBtn = null;
window.endShiftBtn = null;
window.reportTitle = null;
window.zoomOutBtn = null;
window.zoomInBtn = null;
window.zoomLevel = null;
window.printBtn = null;
window.reportContent = null;
window.statusMessage = null;
window.tableBody = null;
window.currentUser = null;

// ============ ОСНОВНЫЕ ФУНКЦИИ ============

// Функция для инициализации DOM элементов
function initDOM() {
    console.log('Инициализация DOM элементов...');
    
    window.dateDisplay = document.getElementById('dateDisplay');
    window.saveBtn = document.getElementById('saveBtn');
    window.endShiftBtn = document.getElementById('endShiftBtn');
    window.reportTitle = document.getElementById('reportTitle');
    window.zoomOutBtn = document.getElementById('zoomOutBtn');
    window.zoomInBtn = document.getElementById('zoomInBtn');
    window.zoomLevel = document.getElementById('zoomLevel');
    window.printBtn = document.getElementById('printBtn');
    window.reportContent = document.getElementById('reportContent');
    window.statusMessage = document.getElementById('statusMessage');
    window.tableBody = document.getElementById('tableBody');
    window.currentUser = document.getElementById('currentUser');
    
    // Гарантируем, что массивы инициализированы
    if (!window.customFields) {
        window.customFields = [];
    }
    if (typeof window.nextRowNumber === 'undefined') {
        window.nextRowNumber = 7;
    }
    if (typeof window.fieldIdCounter === 'undefined') {
        window.fieldIdCounter = 100;
    }
    if (!window.activeFreeSpace) {
        window.activeFreeSpace = null;
    }
    
    console.log('Проверка элементов:');
    console.log('- customFields:', window.customFields);
    console.log('- customFields тип:', typeof window.customFields);
    console.log('- nextRowNumber:', window.nextRowNumber);
    console.log('- fieldIdCounter:', window.fieldIdCounter);
    console.log('- tableBody:', window.tableBody);
}

// Функция для добавления пользовательского поля
function addCustomField(buttonElement) {
    console.log('addCustomField вызван');
    console.log('Текущий customFields:', window.customFields);
    console.log('Текущий fieldIdCounter:', window.fieldIdCounter);
    console.log('Текущий nextRowNumber:', window.nextRowNumber);
    
    // Гарантируем, что массивы инициализированы
    if (!window.customFields) {
        console.warn('customFields не инициализирован, инициализирую...');
        window.customFields = [];
    }
    if (typeof window.nextRowNumber === 'undefined') {
        console.warn('nextRowNumber не инициализирован, устанавливаю 7');
        window.nextRowNumber = 7;
    }
    if (typeof window.fieldIdCounter === 'undefined') {
        console.warn('fieldIdCounter не инициализирован, устанавливаю 100');
        window.fieldIdCounter = 100;
    }
    
    const container = buttonElement.closest('#customFieldContainer');
    if (!container) {
        console.error('Контейнер customFieldContainer не найден');
        return;
    }
    
    const nameInput = container.querySelector('.field-name-input');
    const unitSelect = container.querySelector('.unit-select');
    const customUnitInput = container.querySelector('.custom-unit-input');
    
    if (!nameInput) {
        console.error('Поле ввода названия не найдено');
        return;
    }
    
    const fieldName = nameInput.value.trim();
    let unit = '';
    
    if (unitSelect) {
        if (unitSelect.value === 'custom' && customUnitInput) {
            unit = customUnitInput.value.trim();
        } else if (unitSelect.value) {
            unit = unitSelect.value;
        }
    }
    
    console.log('Название поля:', fieldName);
    console.log('Единица измерения:', unit);
    
    if (!fieldName) {
        alert('Пожалуйста, введите название поля');
        nameInput.focus();
        return;
    }
    
    // Используем глобальные переменные
    const fieldId = `custom_${window.fieldIdCounter}`;
    console.log('Создаем поле с ID:', fieldId);
    window.fieldIdCounter++;
    
    // Находим текущий блок свободного места
    const expandedRow = container.closest('.expanded-row');
    if (!expandedRow) {
        console.error('Расширенная строка не найдена');
        return;
    }
    
    const freeSpaceRow = expandedRow.previousElementSibling;
    if (!freeSpaceRow || !freeSpaceRow.classList.contains('free-space-row')) {
        console.error('Строка свободного места не найдена');
        return;
    }
    
    // Создаем новую строку с полем
    const newRow = document.createElement('tr');
    newRow.dataset.fieldId = fieldId;
    newRow.dataset.isCustom = 'true';
    newRow.innerHTML = `
        <td>
            <span class="row-number">${window.nextRowNumber}</span>
            ${fieldName}
            ${unit ? `<div class="sub-description">${unit}</div>` : ''}
        </td>
        <td>
            <div style="display: flex; gap: 5px; justify-content: center;">
                <input type="text" class="data-input" id="${fieldId}_shift">
            </div>
        </td>
    `;
    
    // Добавляем информацию о поле в массив с проверкой
    try {
        console.log('Добавляем поле в массив customFields...');
        console.log('customFields до добавления:', window.customFields);
        
        // Гарантируем, что customFields является массивом
        if (!Array.isArray(window.customFields)) {
            console.warn('customFields не массив, преобразую...');
            window.customFields = [];
        }
        
        window.customFields.push({
            id: fieldId,
            name: fieldName,
            unit: unit,
            rowNumber: window.nextRowNumber,
            building: getCurrentBuilding(freeSpaceRow)
        });
        
        console.log('Добавлено поле:', fieldName, 'с ID:', fieldId);
        console.log('Всего customFields после добавления:', window.customFields.length);
        console.log('customFields:', window.customFields);
    } catch (error) {
        console.error('Ошибка при добавлении поля в массив:', error);
        alert('Произошла ошибка при добавлении поля. Пожалуйста, попробуйте еще раз.');
        return;
    }
    
    // Увеличиваем номер следующей строки
    window.nextRowNumber++;
    console.log('Следующий nextRowNumber:', window.nextRowNumber);
    
    // Вставляем новую строку перед блоком свободного места
    if (window.tableBody) {
        window.tableBody.insertBefore(newRow, freeSpaceRow);
        console.log('Строка добавлена в таблицу');
    } else {
        console.error('tableBody не найден');
    }
    
    // Закрываем расширенное содержимое
    closeActiveFreeSpace();
    
    // Показываем сообщение об успешном добавлении
    showStatusMessage(`Поле "${fieldName}" успешно добавлено`, 'success');
    
    // Фокусируемся на новом поле ввода
    setTimeout(() => {
        const newInput = document.getElementById(`${fieldId}_shift`);
        if (newInput) {
            newInput.focus();
            console.log('Фокус установлен на новое поле ввода');
        }
    }, 100);
    
    // Автоматически сохраняем после добавления поля
    setTimeout(saveDate, 500);
}

// Функция для определения текущего здания
function getCurrentBuilding(freeSpaceRow) {
    // Ищем ближайшее здание выше свободного места
    let currentRow = freeSpaceRow.previousElementSibling;
    while (currentRow) {
        if (currentRow.classList.contains('building-header')) {
            return currentRow.querySelector('td').textContent.trim();
        }
        currentRow = currentRow.previousElementSibling;
    }
    return 'Без категории';
}

// Функция для показа статусных сообщений
function showStatusMessage(message, type) {
    if (window.statusMessage) {
        window.statusMessage.textContent = message;
        window.statusMessage.className = `status-message ${type}`;
        window.statusMessage.style.display = 'block';
        
        setTimeout(() => {
            if (window.statusMessage) {
                window.statusMessage.style.display = 'none';
            }
        }, 3000);
    } else {
        // Если элемент не найден, показываем alert
        alert(message);
    }
}

// Основная функция инициализации
function init() {
    console.log('Запуск функции init()...');
    console.log('Проверка глобальных переменных перед init:');
    console.log('- customFields:', window.customFields);
    console.log('- customFields тип:', typeof window.customFields);
    console.log('- nextRowNumber:', window.nextRowNumber);
    console.log('- fieldIdCounter:', window.fieldIdCounter);
    
    // Инициализируем DOM элементы
    initDOM();
    
    // Проверка авторизации
    const userJson = localStorage.getItem('user');

    if (!userJson) {
        // если не залогинен — назад на логин
        window.location.href = 'index.html';
        return;
    }

    const user = JSON.parse(userJson);

    // Проверка роли пользователя
    if (user.role !== 'ENGINEER') {
        alert('У вас нет прав для заполнения смены');
        window.location.href = 'index.html';
        return;
    }

    // Установка имени пользователя
    const username = localStorage.getItem('username') || 'Иван Иванов';
    if (window.currentUser) {
        window.currentUser.textContent = username;
    }
    
    // Устанавливаем текущую дату из системы
    window.currentDate = getCurrentSystemDate();
    updateDateDisplay();

    // Загрузка сохраненного отчета
    loadSavedReport();

    // Обработчики событий
    if (window.saveBtn) {
        window.saveBtn.addEventListener('click', saveDate);
    }
    if (window.endShiftBtn) {
        window.endShiftBtn.addEventListener('click', endShift);
    }
    if (window.zoomInBtn) {
        window.zoomInBtn.addEventListener('click', zoomIn);
    }
    if (window.zoomOutBtn) {
        window.zoomOutBtn.addEventListener('click', zoomOut);
    }
    if (window.printBtn) {
        window.printBtn.addEventListener('click', printReport);
    }

    // Обработка горячих клавиш
    document.addEventListener('keydown', (e) => {
        // Ctrl + S для сохранения
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            saveDate();
        }

        // Ctrl + P для печати
        if (e.ctrlKey && e.key === 'p') {
            e.preventDefault();
            printReport();
        }

        // Ctrl + '+' для увеличения масштаба
        if (e.ctrlKey && (e.key === '+' || e.key === '=')) {
            e.preventDefault();
            zoomIn();
        }

        // Ctrl + '-' для уменьшения масштаба
        if (e.ctrlKey && e.key === '-') {
            e.preventDefault();
            zoomOut();
        }

        // Escape для закрытия свободного места
        if (e.key === 'Escape') {
            closeActiveFreeSpace();
        }
    });

    // Закрытие свободного места при клике вне его
    document.addEventListener('click', function(event) {
        if (window.activeFreeSpace && !window.activeFreeSpace.contains(event.target)) {
            const expandedRow = window.activeFreeSpace.nextElementSibling;
            if (expandedRow && !expandedRow.contains(event.target)) {
                closeActiveFreeSpace();
            }
        }
    });

    // Обновляем нумерацию строк
    updateRowNumbers();
    
    console.log('Инициализация завершена');
    console.log('Финальные значения:');
    console.log('- customFields:', window.customFields);
    console.log('- nextRowNumber:', window.nextRowNumber);
    console.log('- fieldIdCounter:', window.fieldIdCounter);
}

// Запуск при загрузке страницы
window.addEventListener('DOMContentLoaded', function() {
    console.log('=== DOM загружен, запускаем инициализацию ===');
    
    // Инициализируем глобальные переменные с гарантией
    if (typeof window.customFields === 'undefined') {
        window.customFields = [];
    }
    if (typeof window.nextRowNumber === 'undefined') {
        window.nextRowNumber = 7;
    }
    if (typeof window.fieldIdCounter === 'undefined') {
        window.fieldIdCounter = 100;
    }
    if (typeof window.activeFreeSpace === 'undefined') {
        window.activeFreeSpace = null;
    }
    if (typeof window.currentDate === 'undefined') {
        window.currentDate = new Date();
    }
    if (typeof window.currentZoom === 'undefined') {
        window.currentZoom = 100;
    }
    
    console.log('Глобальные переменные после инициализации:');
    console.log('- customFields:', window.customFields);
    console.log('- nextRowNumber:', window.nextRowNumber);
    console.log('- fieldIdCounter:', window.fieldIdCounter);
    
    init();
});

// Остальные функции (toggleFreeSpace, handleMenuChange, и т.д.) остаются без изменений