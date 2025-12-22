-- =====================
-- Здания
-- =====================
INSERT INTO building (name, order_index) VALUES
('Здание 1', 1),
('Здание 2', 2),
('Здание 3', 3),
('Здание 4', 4);

-- =====================
-- Участок
-- =====================
INSERT INTO section (name, workshop) VALUES ('Участок 7', 'Цех Х');

-- =====================
-- Пользователь
-- =====================
INSERT INTO app_user (username, full_name, role, section_id)
VALUES ('engineer7', 'Сменный инженер', 'ENGINEER', 1);

-- =====================
-- Смены
-- =====================
INSERT INTO shift (name, start_time, end_time, order_index) VALUES
('1-я смена', '07:00', '15:30', 1),
('2-я смена', '15:30', '24:00', 2),
('3-я смена', '00:00', '07:30', 3);

-- =====================
-- Сессии смен за 01.09.2025
-- =====================
INSERT INTO shift_session (shift_date, shift_id, user_id, section_id, status, started_at, closed_at)
VALUES
('2025-09-01', 1, 1, 1, 'CLOSED', '2025-09-01 07:00', '2025-09-01 15:30'),
('2025-09-01', 2, 1, 1, 'CLOSED', '2025-09-01 15:30', '2025-09-01 24:00'),
('2025-09-02', 3, 1, 1, 'CLOSED', '2025-09-02 00:00', '2025-09-02 07:30');

-- =====================
-- Шаблоны показателей (report_item_template)
-- =====================
-- Здание 1
INSERT INTO report_item_template (title, unit, is_inventory, building_id) VALUES
('Количество принятых и переработанных методом аммиачного осаждения растворов', 'м3', FALSE, 1),
('Количество прокаленной пульпы', 'м3', FALSE, 1);

-- Здание 2
INSERT INTO report_item_template (title, unit, is_inventory, building_id) VALUES
('Количество принятых и переработанных методом известкования растворов', 'м3', FALSE, 2),
('Отфильтровано пульпы', 'м3', FALSE, 2),
('Получено контейнеров', 'шт.', TRUE, 2);

-- Здание 3
INSERT INTO report_item_template (title, unit, is_inventory, building_id) VALUES
('Сжигание отходов - переработано отходов', 'кг', FALSE, 3),
('Сжигание отходов - получено емкостей с золой', 'шт.', TRUE, 3),
('Прессование отходов - получено бочек', 'шт.', TRUE, 3);

-- Здание 4
INSERT INTO report_item_template (title, unit, is_inventory, building_id) VALUES
('Измельчение фильтров на шредере - количество', 'шт.', FALSE, 4),
('Измельчение фильтров на шредере - получено мешков', 'шт.', TRUE, 4),
('Освобождение контейнеров', 'шт.', TRUE, 4);

-- Замечания
INSERT INTO report_item_template (title, unit, is_inventory, building_id) VALUES
('Выявленные замечания по механическому оборудованию', '', FALSE, NULL),
('Выявленные замечания по электротехническому оборудованию', '', FALSE, NULL),
('Выявленные замечания по приборному оборудованию', '', FALSE, NULL),
('Отклонения по установкам', '', FALSE, NULL),
('Количество превышений контрольных показателей', '', FALSE, NULL),
('Замечания по персоналу', '', FALSE, NULL),
('Замечания по оборудованию', '', FALSE, NULL);

-- =====================
-- Создание экземпляров показателей на дату (report_item_instance)
-- =====================
-- Предположим, template_id идут последовательно с 1
INSERT INTO report_item_instance (shift_date, section_id, template_id, order_index) VALUES
('2025-09-01', 1, 1, 1),  ('2025-09-01', 1, 2, 2),
('2025-09-01', 1, 3, 3),  ('2025-09-01', 1, 4, 4),  ('2025-09-01', 1, 5, 5),
('2025-09-01', 1, 6, 6),  ('2025-09-01', 1, 7, 7),  ('2025-09-01', 1, 8, 8),
('2025-09-01', 1, 9, 9),  ('2025-09-01', 1, 10, 10),  ('2025-09-01', 1, 11, 11),
('2025-09-01', 1, 12, 12),  ('2025-09-01', 1, 13, 13), ('2025-09-01', 1, 14, 14),
('2025-09-01', 1, 15, 15), ('2025-09-01', 1, 16, 16);

-- =====================
-- Числовые показатели (report_item_value)
-- =====================
-- Пример заполнения (SHIFT / MONTH / CAMPAIGN / YEAR)
-- Здание 1, пункт 1
INSERT INTO report_item_value (shift_session_id, item_instance_id, period_type, value) VALUES
(1,1,'SHIFT',0),(1,1,'MONTH',1),
(2,1,'SHIFT',0),(2,1,'MONTH',2),
(3,1,'SHIFT',0),(3,1,'MONTH',3);

-- Здание 1, пункт 2
INSERT INTO report_item_value (shift_session_id, item_instance_id, period_type, value) VALUES
(1,2,'SHIFT',0),(1,2,'MONTH',1),
(2,2,'SHIFT',0),(2,2,'MONTH',1),
(3,2,'SHIFT',0),(3,2,'MONTH',1);

-- Здание 2, пункт 3
INSERT INTO report_item_value (shift_session_id, item_instance_id, period_type, value) VALUES
(1,3,'SHIFT',0),(1,3,'MONTH',5),
(2,3,'SHIFT',0),(2,3,'MONTH',5),
(3,3,'SHIFT',0),(3,3,'MONTH',5);

-- Здание 2, пункт 4
INSERT INTO report_item_value (shift_session_id, item_instance_id, period_type, value) VALUES
(1,4,'SHIFT',1),(1,4,'MONTH',9),
(2,4,'SHIFT',1),(2,4,'MONTH',10),
(3,4,'SHIFT',1),(3,4,'MONTH',11);

-- Здание 3, пункт 6 (сжигание отходов)
INSERT INTO report_item_value (shift_session_id, item_instance_id, period_type, value) VALUES
(1,6,'SHIFT',0),(1,6,'CAMPAIGN',0),
(2,6,'SHIFT',0),(2,6,'CAMPAIGN',0),
(3,6,'SHIFT',0),(3,6,'CAMPAIGN',0);

-- Здание 4, пункт 8 (фильтры)
INSERT INTO report_item_value (shift_session_id, item_instance_id, period_type, value) VALUES
(1,8,'SHIFT',0),(1,8,'YEAR',20),
(2,8,'SHIFT',0),(2,8,'YEAR',20),
(3,8,'SHIFT',1),(3,8,'YEAR',20);

-- =====================
-- Инвентарные показатели (inventory_line)
-- =====================
-- Здание 2, пункт 5 — контейнеры
INSERT INTO inventory_line (shift_session_id, item_instance_id, quantity, period_type, auto_filled) VALUES
(1,5,1,'SHIFT',TRUE),(1,5,10,'MONTH',TRUE),
(2,5,0,'SHIFT',TRUE),(2,5,10,'MONTH',TRUE),
(3,5,0,'SHIFT',TRUE),(3,5,9,'MONTH',TRUE);

-- Здание 3, пункт 7 — бочки
INSERT INTO inventory_line (shift_session_id, item_instance_id, quantity, period_type, auto_filled) VALUES
(1,7,0,'SHIFT',TRUE),(1,7,10,'MONTH',TRUE),
(2,7,0,'SHIFT',TRUE),(2,7,10,'MONTH',TRUE),
(3,7,1,'SHIFT',TRUE),(3,7,11,'MONTH',TRUE);

-- Здание 4, пункт 9 — контейнеры
INSERT INTO inventory_line (shift_session_id, item_instance_id, quantity, period_type, auto_filled) VALUES
(1,9,0,'SHIFT',TRUE),(1,9,5,'MONTH',TRUE),
(2,9,0,'SHIFT',TRUE),(2,9,5,'MONTH',TRUE),
(3,9,0,'SHIFT',TRUE),(3,9,5,'MONTH',TRUE);

-- Здание 4, пункт 8 — мешки
INSERT INTO inventory_line (shift_session_id, item_instance_id, quantity, period_type, auto_filled) VALUES
(1,9,0,'SHIFT',TRUE),(1,9,40,'YEAR',TRUE),
(2,9,0,'SHIFT',TRUE),(2,9,40,'YEAR',TRUE),
(3,9,2,'SHIFT',TRUE),(3,9,42,'YEAR',TRUE);

-- =====================
-- Замечания (report_value) — текстовые
-- =====================
INSERT INTO report_value (shift_session_id, item_instance_id, value_text) VALUES
-- Механическое оборудование
(1,10,'-'),(2,10,'-'),(3,10,'-'),
-- Электротехническое оборудование
(1,11,'-'),(2,11,'-'),(3,11,'-'),
-- Приборное оборудование
(1,12,'-'),(2,12,'-'),(3,12,'-'),
-- Отклонения по установкам
(1,13,'-'),(2,13,'-'),(3,13,'-'),
-- Количество превышений контрольных показателей
(1,14,'-'),(2,14,'-'),(3,14,'-'),
-- Замечания по персоналу
(1,15,'нет'),(2,15,'нет'),(3,15,'нет'),
-- Замечания по оборудованию
(1,16,'-'),(2,16,'-'),(3,16,'-');
