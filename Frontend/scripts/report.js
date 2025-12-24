// ============ ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ============
var activeFreeSpace = null;
var nextRowNumber = 7;
var fieldIdCounter = 100;
var customFields = [];
var currentDate = new Date();
var currentZoom = 100;

// ============ DOM ЭЛЕМЕНТЫ ============
var dateDisplay;
var saveBtn;
var endShiftBtn;
var reportTitle;
var zoomOutBtn;
var zoomInBtn;
var zoomLevel;
var printBtn;
var reportContent;
var statusMessage;
var tableBody;
var currentUser;

// ============ ОСНОВНЫЕ ФУНКЦИИ ============

// Функция для инициализации DOM элементов
function initDOM() {
    console.log('Инициализация DOM элементов...');
    
    dateDisplay = document.getElementById('dateDisplay');
    saveBtn = document.getElementById('saveBtn');
    endShiftBtn = document.getElementById('endShiftBtn');
    reportTitle = document.getElementById('reportTitle');
    zoomOutBtn = document.getElementById('zoomOutBtn');
    zoomInBtn = document.getElementById('zoomInBtn');
    zoomLevel = document.getElementById('zoomLevel');
    printBtn = document.getElementById('printBtn');
    reportContent = document.getElementById('reportContent');
    statusMessage = document.getElementById('statusMessage');
    tableBody = document.getElementById('tableBody');
    currentUser = document.getElementById('currentUser');
    
    console.log('Проверка элементов:');
    console.log('- customFields:', customFields);
    console.log('- tableBody:', tableBody);
    console.log('- currentUser:', currentUser);
}

// Функция для переключения свободного места
function toggleFreeSpace(element) {
    console.log('toggleFreeSpace вызван для элемента:', element);
    
    const row = element.closest('tr');
    console.log('Найдена строка:', row);
    
    // Если уже активно другое свободное место - закрываем его
    if (activeFreeSpace && activeFreeSpace !== row) {
        console.log('Закрываем предыдущее активное место');
        closeActiveFreeSpace();
    }
    
    // Если текущее место уже активно - закрываем
    if (row.classList.contains('active')) {
        console.log('Закрываем текущее активное место');
        closeActiveFreeSpace();
        return;
    }
    
    // Активируем текущее место
    console.log('Активируем строку');
    row.classList.add('active');
    activeFreeSpace = row;
    
    // Создаем расширенное содержимое
    const expandedRow = document.createElement('tr');
    expandedRow.className = 'expanded-row';
    expandedRow.innerHTML = `
        <td colspan="2">
            <div class="expanded-content">
                <select class="dropdown-menu" onchange="handleMenuChange(this)">
                    <option value="">------------------</option>
                    <option value="manual">Ввести вручную</option>
                </select>
                <div id="customFieldContainer"></div>
            </div>
        </td>
    `;
    
    // Вставляем расширенное содержимое после текущей строки
    row.parentNode.insertBefore(expandedRow, row.nextSibling);
    
    console.log('Расширенное содержимое добавлено');
    
    // Автоматически фокусируемся на выпадающем меню
    setTimeout(() => {
        const dropdown = expandedRow.querySelector('.dropdown-menu');
        if (dropdown) dropdown.focus();
    }, 100);
}

// Функция для закрытия активного свободного места
function closeActiveFreeSpace() {
    if (activeFreeSpace) {
        console.log('Закрываем активное свободное место');
        activeFreeSpace.classList.remove('active');
        const expandedRow = activeFreeSpace.nextElementSibling;
        if (expandedRow && expandedRow.classList.contains('expanded-row')) {
            expandedRow.remove();
            console.log('Расширенная строка удалена');
        }
        activeFreeSpace = null;
        
        // Очищаем контейнер
        const container = document.getElementById('customFieldContainer');
        if (container) container.innerHTML = '';
    }
}

// Обработчик изменения выпадающего меню
function handleMenuChange(selectElement) {
    console.log('handleMenuChange вызван, выбрано значение:', selectElement.value);
    
    const container = document.getElementById('customFieldContainer');
    if (!container) {
        console.error('Контейнер customFieldContainer не найден');
        return;
    }
    
    if (selectElement.value === 'manual') {
        container.innerHTML = `
            <div style="margin-bottom: 15px;">
                <input type="text" class="custom-field-input field-name-input" 
                       placeholder="Введите название нового поля"
                       onkeydown="handleCustomFieldKeydown(event, this)"
                       style="width: 100%; padding: 10px; margin-bottom: 10px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box;">
                
                <div style="display: flex; align-items: center; gap: 10px; margin-top: 10px;">
                    <span style="color: #666; font-size: 0.9em; white-space: nowrap;">Единица измерения:</span>
                    <select class="unit-select" style="flex: 1; padding: 8px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box;">
                        <option value="">Выберите единицу</option>
                        <option value="кг">кг</option>
                        <option value="м³">м³</option>
                        <option value="шт">шт</option>
                        <option value="custom">Другая...</option>
                    </select>
                </div>
                
                <div id="customUnitContainer" style="margin-top: 10px; display: none;">
                    <input type="text" class="custom-unit-input" 
                           placeholder="Введите свою единицу измерения"
                           style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box;">
                </div>
            </div>
            <button class="btn add-field-btn" onclick="addCustomField(this)" style="margin-top: 10px; width: 100%; padding: 10px; background-color: #1e3a5f; color: white; border: none; border-radius: 4px; cursor: pointer;">
                <i class="fas fa-plus"></i> Добавить поле
            </button>
        `;
        
        // Добавляем обработчик для выбора "Другая..."
        const unitSelect = container.querySelector('.unit-select');
        if (unitSelect) {
            unitSelect.addEventListener('change', function() {
                const customUnitContainer = document.getElementById('customUnitContainer');
                if (this.value === 'custom') {
                    customUnitContainer.style.display = 'block';
                    const customInput = customUnitContainer.querySelector('.custom-unit-input');
                    if (customInput) customInput.focus();
                } else {
                    customUnitContainer.style.display = 'none';
                }
            });
        }
        
        // Автоматически фокусируемся на поле ввода названия
        setTimeout(() => {
            const nameInput = container.querySelector('.field-name-input');
            if (nameInput) {
                nameInput.focus();
                console.log('Фокус установлен на поле ввода названия');
            }
        }, 100);
    } else {
        container.innerHTML = '';
    }
}

// Обработчик нажатия клавиши Enter в поле ввода
function handleCustomFieldKeydown(event, inputElement) {
    if (event.key === 'Enter') {
        event.preventDefault();
        const container = inputElement.closest('#customFieldContainer');
        if (container) {
            const addButton = container.querySelector('.add-field-btn');
            if (addButton) {
                console.log('Enter нажат, вызываем addCustomField');
                addCustomField(addButton);
            }
        }
    }
}

// Функция для добавления пользовательского поля
function addCustomField(buttonElement) {
    console.log('addCustomField вызван');
    console.log('Текущий customFields:', customFields);
    console.log('Текущий fieldIdCounter:', fieldIdCounter);
    console.log('Текущий nextRowNumber:', nextRowNumber);
    
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
    const fieldId = `custom_${fieldIdCounter}`;
    console.log('Создаем поле с ID:', fieldId);
    fieldIdCounter++;
    
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
            <span class="row-number">${nextRowNumber}</span>
            ${fieldName}
            ${unit ? `<div class="sub-description">${unit}</div>` : ''}
        </td>
        <td>
            <div style="display: flex; gap: 5px; justify-content: center;">
                <input type="text" class="data-input" id="${fieldId}_shift">
            </div>
        </td>
    `;
    
    // Добавляем информацию о поле в массив
    customFields.push({
        id: fieldId,
        name: fieldName,
        unit: unit,
        rowNumber: nextRowNumber,
        building: getCurrentBuilding(freeSpaceRow)
    });
    
    console.log('Добавлено поле:', fieldName, 'с ID:', fieldId);
    console.log('Всего customFields:', customFields.length);
    
    // Увеличиваем номер следующей строки
    nextRowNumber++;
    console.log('Следующий nextRowNumber:', nextRowNumber);
    
    // Вставляем новую строку перед блоком свободного места
    if (tableBody) {
        tableBody.insertBefore(newRow, freeSpaceRow);
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
    if (statusMessage) {
        statusMessage.textContent = message;
        statusMessage.className = `status-message ${type}`;
        statusMessage.style.display = 'block';
        
        setTimeout(() => {
            if (statusMessage) {
                statusMessage.style.display = 'none';
            }
        }, 3000);
    }
}

// ============ ФУНКЦИИ ОТЧЕТА ============

// Форматирование даты
function formatDate(date) {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('ru-RU', options);
}

// Форматирование даты для ключа в localStorage
function formatDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Обновление отображения даты
function updateDateDisplay() {
    const formattedDate = formatDate(currentDate);
    if (dateDisplay) {
        dateDisplay.textContent = formattedDate;
    }
    if (reportTitle) {
        reportTitle.textContent = `Рапорт за ${formattedDate}`;
    }
}

// Получение текущей даты из системы
function getCurrentSystemDate() {
    return new Date();
}

// Сохранение отчета
function saveDate() {
    updateDateDisplay();

    // Сбор данных отчета
    const reportData = collectReportData();
    const dateKey = formatDateKey(currentDate);
    
    // Добавляем информацию о пользовательских полях
    reportData.customFields = customFields;
    
    localStorage.setItem(`report_${dateKey}`, JSON.stringify(reportData));

    // Показываем сообщение об успехе
    showStatusMessage(`Отчет за ${formatDate(currentDate)} сохранен!`, 'success-message');

    console.log('Отчет сохранен:', reportData);
}

// Сбор данных отчета
function collectReportData() {
    const reportData = {
        date: formatDateKey(currentDate),
        building1: {
            item1: { 
                shift: document.getElementById('data1-1')?.value || ''
            },
            item2: { 
                shift: document.getElementById('data2-1')?.value || ''
            }
        },
        building2: {
            item3: { 
                shift: document.getElementById('data3-1')?.value || ''
            },
            item4: { 
                shift: document.getElementById('data4-1')?.value || ''
            },
            item5: { 
                shift: document.getElementById('data5-1')?.value || ''
            }
        },
        building3: {
            item6: { 
                shift: document.getElementById('data6-1')?.value || ''
            }
        },
        timestamp: new Date().toISOString(),
        operator: currentUser ? currentUser.textContent : ''
    };

    // Добавляем данные из пользовательских полей
    customFields.forEach(field => {
        if (!reportData.customFieldsData) {
            reportData.customFieldsData = {};
        }
        reportData.customFieldsData[field.id] = {
            name: field.name,
            unit: field.unit,
            shift: document.getElementById(`${field.id}_shift`)?.value || '',
            building: field.building
        };
    });

    return reportData;
}

// Завершение смены
function endShift() {
    if (confirm('Вы уверены, что хотите завершить смену? После завершения редактирование будет невозможно.')) {
        // Сохраняем отчет перед завершением
        saveDate();

        showStatusMessage('Смена завершена успешно! Отчет отправлен в архив.', 'success-message');

        // Блокируем элементы редактирования
        document.querySelectorAll('.data-input').forEach(input => {
            input.disabled = true;
        });
        
        // Блокируем возможность добавления новых полей
        document.querySelectorAll('.free-space-row').forEach(row => {
            row.style.pointerEvents = 'none';
            row.style.opacity = '0.5';
        });
        
        if (saveBtn) saveBtn.disabled = true;
        if (endShiftBtn) endShiftBtn.disabled = true;

        console.log('Смена завершена');
    }
}

function updateZoom() {
    if (zoomLevel) {
        zoomLevel.textContent = `${currentZoom}%`;
    }
    if (reportContent) {
        reportContent.style.transform = `scale(${currentZoom / 100})`;
        reportContent.style.transformOrigin = 'top left';
    }
}

function zoomIn() {
    if (currentZoom < 150) {
        currentZoom += 10;
        updateZoom();
    }
}

function zoomOut() {
    if (currentZoom > 50) {
        currentZoom -= 10;
        updateZoom();
    }
}

// Печать
function printReport() {
    window.print();
}

// Загрузка сохраненного отчета
function loadSavedReport() {
    const dateKey = formatDateKey(currentDate);
    const savedReport = localStorage.getItem(`report_${dateKey}`);

    if (savedReport) {
        try {
            const reportData = JSON.parse(savedReport);
            
            // Загружаем данные только если они существуют в сохраненном отчете
            if (reportData.building1) {
                if (reportData.building1.item1) {
                    const elem = document.getElementById('data1-1');
                    if (elem) elem.value = reportData.building1.item1.shift || '';
                }
                if (reportData.building1.item2) {
                    const elem = document.getElementById('data2-1');
                    if (elem) elem.value = reportData.building1.item2.shift || '';
                }
            }
            
            if (reportData.building2) {
                if (reportData.building2.item3) {
                    const elem = document.getElementById('data3-1');
                    if (elem) elem.value = reportData.building2.item3.shift || '';
                }
                if (reportData.building2.item4) {
                    const elem = document.getElementById('data4-1');
                    if (elem) elem.value = reportData.building2.item4.shift || '';
                }
                if (reportData.building2.item5) {
                    const elem = document.getElementById('data5-1');
                    if (elem) elem.value = reportData.building2.item5.shift || '';
                }
            }
            
            if (reportData.building3 && reportData.building3.item6) {
                const elem = document.getElementById('data6-1');
                if (elem) elem.value = reportData.building3.item6.shift || '';
            }
            
            // Загружаем пользовательские поля
            if (reportData.customFields) {
                customFields = reportData.customFields;
                nextRowNumber = 7; // Сбрасываем
                fieldIdCounter = 100; // Сбрасываем
                
                // Находим максимальные значения
                reportData.customFields.forEach(field => {
                    if (field.rowNumber >= nextRowNumber) {
                        nextRowNumber = field.rowNumber + 1;
                    }
                    const idNum = parseInt(field.id.replace('custom_', ''));
                    if (!isNaN(idNum) && idNum >= fieldIdCounter) {
                        fieldIdCounter = idNum + 1;
                    }
                });
                
                console.log('Загружены пользовательские поля:', customFields.length);
                console.log('Установлен nextRowNumber:', nextRowNumber);
                console.log('Установлен fieldIdCounter:', fieldIdCounter);
                
                if (reportData.customFieldsData) {
                    // Восстанавливаем пользовательские поля
                    Object.keys(reportData.customFieldsData).forEach(fieldId => {
                        const fieldData = reportData.customFieldsData[fieldId];
                        const fieldInfo = customFields.find(f => f.id === fieldId);
                        
                        if (fieldInfo) {
                            // Находим место для вставки (после соответствующего здания)
                            insertCustomField(fieldInfo, fieldData.shift);
                        }
                    });
                    
                    // Обновляем нумерацию
                    updateRowNumbers();
                }
            }
            
            console.log('Отчет загружен:', dateKey);
        } catch (e) {
            console.error('Ошибка загрузки отчета:', e);
        }
    }
}

// Вставка пользовательского поля при загрузке
function insertCustomField(fieldInfo, shiftValue) {
    if (!tableBody) return;
    
    // Находим соответствующее здание
    const buildingHeaders = tableBody.querySelectorAll('.building-header');
    let targetBuildingRow = null;
    
    for (let header of buildingHeaders) {
        if (header.querySelector('td').textContent.trim() === fieldInfo.building) {
            targetBuildingRow = header;
            break;
        }
    }
    
    if (targetBuildingRow) {
        // Находим следующую свободную строку после этого здания
        let currentRow = targetBuildingRow;
        let freeSpaceRow = null;
        
        while (currentRow.nextElementSibling) {
            currentRow = currentRow.nextElementSibling;
            if (currentRow.classList.contains('free-space-row')) {
                freeSpaceRow = currentRow;
                break;
            }
        }

        // Обработчик изменения выпадающего меню
        function handleMenuChange(selectElement) {
            const container = document.getElementById('customFieldContainer');
            
            if (selectElement.value === 'manual') {
                container.innerHTML = `
                    <input type="text" class="custom-field-input" 
                           placeholder="Введите название нового поля"
                           onkeydown="handleCustomFieldKeydown(event, this)">
                    <button class="btn" onclick="addCustomField(this)" style="margin-top: 10px;">
                        <i class="fas fa-plus"></i> Добавить поле
                    </button>
                `;
            } else {
                container.innerHTML = '';
            }
        }

        // Обработчик нажатия клавиши Enter в поле ввода
        function handleCustomFieldKeydown(event, inputElement) {
            if (event.key === 'Enter') {
                addCustomField(inputElement);
            }
        }

        // Функция для добавления пользовательского поля
        function addCustomField(buttonElement) {
            const inputElement = buttonElement.previousElementSibling;
            const fieldName = inputElement.value.trim();
            
            if (!fieldName) {
                alert('Пожалуйста, введите название поля');
                return;
            }
            
            // Находим текущий блок свободного места
            const freeSpaceRow = buttonElement.closest('.expanded-content').parentElement.parentElement.previousElementSibling;
            const tableBody = document.getElementById('tableBody');
            
            // Создаем новую строку с полем
            const newRow = document.createElement('tr');
            newRow.innerHTML = `
                <td>
                    <span class="row-number">${nextRowNumber}</span>
                    ${fieldName}
                </td>
                <td>
                    <div style="display: flex; gap: 5px; justify-content: center;">
                        <input type="text" class="data-input" id="data${nextRowNumber}-1">
                    </div>
                </td>
            `;
            
            // Увеличиваем номер следующей строки
            nextRowNumber++;
            
            // Вставляем новую строку перед блоком свободного места
            tableBody.insertBefore(newRow, freeSpaceRow);
            
            // Закрываем расширенное содержимое
            closeActiveFreeSpace();
            
            // Показываем сообщение об успешном добавлении
            showStatusMessage(`Поле "${fieldName}" успешно добавлено`, 'success');
        }
    }
}

// Обновление нумерации строк
function updateRowNumbers() {
    if (!tableBody) return;
    
    let rowNumber = 1;
    const rows = tableBody.querySelectorAll('tr:not(.building-header):not(.separator):not(.free-space-row):not(.expanded-row)');
    
    rows.forEach(row => {
        const rowNumberElement = row.querySelector('.row-number');
        if (rowNumberElement) {
            rowNumberElement.textContent = rowNumber;
            
            // Обновляем ID если это пользовательское поле
            if (row.dataset.isCustom && row.dataset.fieldId) {
                const field = customFields.find(f => f.id === row.dataset.fieldId);
                if (field) {
                    field.rowNumber = rowNumber;
                }
            }
            
            rowNumber++;
        }
    });
    
    nextRowNumber = rowNumber;
}

// Выход из системы
function logout() {
    if (confirm('Вы уверены, что хотите выйти?')) {
        localStorage.removeItem('user');
        localStorage.removeItem('role');
        window.location.href = 'index.html';
    }
}

// Навигация
function showMainPage() {
    alert('Вы находитесь на главной странице');
}

function showReports() {
    alert('Раздел "Рапорты" находится в разработке');
}

function showDocuments() {
    alert('Раздел "Отчеты" находится в разработке');
}

// Основная функция инициализации
function init() {
    console.log('Запуск функции init()...');
    console.log('Проверка глобальных переменных перед init:');
    console.log('- customFields:', customFields);
    console.log('- nextRowNumber:', nextRowNumber);
    console.log('- fieldIdCounter:', fieldIdCounter);
    
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
    if (currentUser) {
        currentUser.textContent = username;
    }
    
    // Устанавливаем текущую дату из системы
    currentDate = getCurrentSystemDate();
    updateDateDisplay();

    // Загрузка сохраненного отчета
    loadSavedReport();

    // Обработчики событий
    if (saveBtn) {
        saveBtn.addEventListener('click', saveDate);
    }
    if (endShiftBtn) {
        endShiftBtn.addEventListener('click', endShift);
    }
    if (zoomInBtn) {
        zoomInBtn.addEventListener('click', zoomIn);
    }
    if (zoomOutBtn) {
        zoomOutBtn.addEventListener('click', zoomOut);
    }
    if (printBtn) {
        printBtn.addEventListener('click', printReport);
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
        if (activeFreeSpace && !activeFreeSpace.contains(event.target)) {
            const expandedRow = activeFreeSpace.nextElementSibling;
            if (expandedRow && !expandedRow.contains(event.target)) {
                closeActiveFreeSpace();
            }
        }
    });

    // Обновляем нумерацию строк
    updateRowNumbers();
    
    console.log('Инициализация завершена');
    console.log('Финальные значения:');
    console.log('- customFields:', customFields);
    console.log('- nextRowNumber:', nextRowNumber);
    console.log('- fieldIdCounter:', fieldIdCounter);
}

// Запуск при загрузке страницы
window.addEventListener('DOMContentLoaded', function() {
    console.log('=== DOM загружен, запускаем инициализацию ===');
    init();
});
