// Элементы DOM
        const dateDisplay = document.getElementById('dateDisplay');
        const saveBtn = document.getElementById('saveBtn');
        const endShiftBtn = document.getElementById('endShiftBtn');
        const reportTitle = document.getElementById('reportTitle');
        const zoomOutBtn = document.getElementById('zoomOutBtn');
        const zoomInBtn = document.getElementById('zoomInBtn');
        const zoomLevel = document.getElementById('zoomLevel');
        const printBtn = document.getElementById('printBtn');
        const reportContent = document.getElementById('reportContent');
        const statusMessage = document.getElementById('statusMessage');

        // Элементы для данных отчета
        const currentUser = document.getElementById('currentUser');
        
        // Текущая дата из системы компьютера
        let currentDate = new Date();
        
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
            dateDisplay.textContent = formattedDate;
            reportTitle.textContent = `Рапорт за ${formattedDate}`;
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
            localStorage.setItem(`report_${dateKey}`, JSON.stringify(reportData));

            // Показываем сообщение об успехе
            statusMessage.textContent = `Отчет за ${formatDate(currentDate)} сохранен!`;
            statusMessage.className = 'status-message success-message';
            statusMessage.style.display = 'block';

            // Скрываем сообщение через 3 секунды
            setTimeout(() => {
                statusMessage.style.display = 'none';
            }, 3000);

            console.log('Отчет сохранен:', reportData);
        }

        // Сбор данных отчета
        function collectReportData() {
            return {
                date: formatDateKey(currentDate),
                building1: {
                    item1: { 
                        shift: document.getElementById('data1-1').value, 
                        month: document.getElementById('data1-2').value 
                    },
                    item2: { 
                        shift: document.getElementById('data2-1').value, 
                        month: document.getElementById('data2-2').value 
                    }
                },
                building2: {
                    item3: { 
                        shift: document.getElementById('data3-1').value, 
                        month: document.getElementById('data3-2').value 
                    },
                    item4: { 
                        shift: document.getElementById('data4-1').value, 
                        month: document.getElementById('data4-2').value 
                    },
                    item5: { 
                        shift: document.getElementById('data5-1').value, 
                        month: document.getElementById('data5-2').value 
                    }
                },
                building3: {
                    item6: { 
                        shift: document.getElementById('data6-1').value, 
                        campaign: document.getElementById('data6-2').value 
                    }
                },
                timestamp: new Date().toISOString(),
                operator: currentUser.textContent
            };
        }

        // Завершение смены
        function endShift() {
            if (confirm('Вы уверены, что хотите завершить смену? После завершения редактирование будет невозможно.')) {
                // Сохраняем отчет перед завершением
                saveDate();

                statusMessage.textContent = 'Смена завершена успешно! Отчет отправлен в архив.';
                statusMessage.className = 'status-message success-message';
                statusMessage.style.display = 'block';

                // Блокируем элементы редактирования
                document.querySelectorAll('.data-input').forEach(input => {
                    input.disabled = true;
                });
                saveBtn.disabled = true;
                endShiftBtn.disabled = true;

                console.log('Смена завершена');

                // Скрываем сообщение через 3 секунды
                setTimeout(() => {
                    statusMessage.style.display = 'none';
                }, 3000);
            }
        }

        // Управление масштабом
        let currentZoom = 100;

        function updateZoom() {
            zoomLevel.textContent = `${currentZoom}%`;
            reportContent.style.transform = `scale(${currentZoom / 100})`;
            reportContent.style.transformOrigin = 'top left';
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

        // Инициализация
        function init() {
            // Проверка авторизации
            const userJson = localStorage.getItem('user');

            if (!userJson) {
                // если не залогинен — назад на логин
                window.location.href = 'index.html';
                return;
            }

            const user = JSON.parse(userJson);

            // Установка имени пользователя
            const username = localStorage.getItem('username') || 'Иван Иванов';
            currentUser.textContent = username;
            
            // Устанавливаем текущую дату из системы
            currentDate = getCurrentSystemDate();
            updateDateDisplay();

            // Загрузка сохраненного отчета
            loadSavedReport();

            // Обработчики событий
            saveBtn.addEventListener('click', saveDate);
            endShiftBtn.addEventListener('click', endShift);
            zoomInBtn.addEventListener('click', zoomIn);
            zoomOutBtn.addEventListener('click', zoomOut);
            printBtn.addEventListener('click', printReport);

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
            });
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
                            document.getElementById('data1-1').value = reportData.building1.item1.shift || '';
                            document.getElementById('data1-2').value = reportData.building1.item1.month || '';
                        }
                        if (reportData.building1.item2) {
                            document.getElementById('data2-1').value = reportData.building1.item2.shift || '';
                            document.getElementById('data2-2').value = reportData.building1.item2.month || '';
                        }
                    }
                    
                    if (reportData.building2) {
                        if (reportData.building2.item3) {
                            document.getElementById('data3-1').value = reportData.building2.item3.shift || '';
                            document.getElementById('data3-2').value = reportData.building2.item3.month || '';
                        }
                        if (reportData.building2.item4) {
                            document.getElementById('data4-1').value = reportData.building2.item4.shift || '';
                            document.getElementById('data4-2').value = reportData.building2.item4.month || '';
                        }
                        if (reportData.building2.item5) {
                            document.getElementById('data5-1').value = reportData.building2.item5.shift || '';
                            document.getElementById('data5-2').value = reportData.building2.item5.month || '';
                        }
                    }
                    
                    if (reportData.building3 && reportData.building3.item6) {
                        document.getElementById('data6-1').value = reportData.building3.item6.shift || '';
                        document.getElementById('data6-2').value = reportData.building3.item6.campaign || '';
                    }
                    
                    console.log('Отчет загружен:', dateKey);
                } catch (e) {
                    console.error('Ошибка загрузки отчета:', e);
                }
            }
        }

        // Выход из системы
        function logout() {
            localStorage.removeItem('user');
            localStorage.removeItem('role');
            window.location.href = 'index.html';
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

        // Запуск при загрузке страницы
        window.addEventListener('DOMContentLoaded', init);



        // учёт роли
        // Раз роль уже есть, можно заложить будущее:

        // if (user.role !== 'ENGINEER') {
        //     alert('У вас нет прав для заполнения смены');
        //     window.location.href = 'index.html';
        // }