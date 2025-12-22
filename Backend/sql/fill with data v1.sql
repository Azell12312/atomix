-- ==========================
-- Section
-- ==========================
INSERT INTO section (id, name, workshop)
VALUES (1, 'Участок 7', 'Цех 100');

-- ==========================
-- Users
-- ==========================
INSERT INTO app_user (id, username, full_name, role, section_id)
VALUES
(1, 'PVIvanov', 'Иванов Петр Васильевич', 'ENGINEER', 1),
(2, 'ISSandalin', 'Сандалин Иван Степанович', 'ENGINEER', 1),
(3, 'ODMarkov', 'Марков Олег Дмитриевич', 'ENGINEER', 1);

-- ==========================
-- Shifts
-- ==========================
INSERT INTO shift (id, name, start_time, end_time, order_index)
VALUES
(1, '1 смена', '07:00', '15:30', 1),
(2, '2 смена', '15:30', '24:00', 2),
(3, '3 смена', '00:00', '07:30', 3);

-- ==========================
-- Buildings
-- ==========================
INSERT INTO building (id, name, order_index)
VALUES
(1, 'Здание 1', 1),
(2, 'Здание 2', 2),
(3, 'Здание 3', 3),
(4, 'Здание 4', 4);

-- ==========================
-- Report Item Templates
-- ==========================
INSERT INTO report_item_template (id, title, unit, is_inventory, building_id)
VALUES
(1, 'Количество принятых и переработанных методом аммиачного осаждения растворов', 'м3', TRUE, 1),
(2, 'Количество прокаленной пульпы', 'м3', TRUE, 1),
(3, 'Количество принятых и переработанных методом известкования растворов', 'м3', TRUE, 2),
(4, 'Отфильтровано пульпы', 'м3', TRUE, 2),
(5, 'Получено контейнеров', 'шт', TRUE, 2),
(6, 'Сжигание отходов (переработано)', 'кг', TRUE, 3),
(7, 'Прессование отходов, получено бочек', 'шт', TRUE, 3),
(8, 'Измельчение фильтров - количество', 'шт', TRUE, 4),
(9, 'Измельчение фильтров - мешки', 'шт', TRUE, 4),
(10, 'Освобождение контейнеров', 'шт', TRUE, 4),
(11, 'Выявленные замечания по механическому оборудованию', NULL, FALSE, NULL),
(12, 'Выявленные замечания по электротехническому оборудованию', NULL, FALSE, NULL),
(13, 'Выявленные замечания по приборному оборудованию', NULL, FALSE, NULL),
(14, 'Отклонения по установкам', NULL, FALSE, NULL),
(15, 'Количество превышений контрольных показателей', NULL, FALSE, NULL),
(16, 'Замечания по персоналу', NULL, FALSE, NULL),
(17, 'Замечания по оборудованию', NULL, FALSE, NULL);

-- ==========================
-- Report Item Instances (на дату)
-- ==========================
-- id = 1..16 для 2025-09-14
INSERT INTO report_item_instance (id, shift_date, section_id, template_id, order_index)
VALUES
(1, '2025-09-14', 1, 1, 1),
(2, '2025-09-14', 1, 2, 2),
(3, '2025-09-14', 1, 3, 3),
(4, '2025-09-14', 1, 4, 4),
(5, '2025-09-14', 1, 5, 5),
(6, '2025-09-14', 1, 6, 6),
(7, '2025-09-14', 1, 7, 7),
(8, '2025-09-14', 1, 8, 8),
(9, '2025-09-14', 1, 9, 9),
(10, '2025-09-14', 1, 10, 10),
(11, '2025-09-14', 1, 11, 11),
(12, '2025-09-14', 1, 12, 12),
(13, '2025-09-14', 1, 13, 13),
(14, '2025-09-14', 1, 14, 14),
(15, '2025-09-14', 1, 15, 15),
(16, '2025-09-14', 1, 16, 16),
(17, '2025-09-14', 1, 17, 17);

-- ==========================
-- Shift Sessions (факт смены)
-- ==========================
INSERT INTO shift_session (id, shift_date, shift_id, user_id, section_id, status, started_at, closed_at)
VALUES
(1, '2025-09-14', 1, 1, 1, 'CLOSED', '2025-09-14 07:00', '2025-09-14 15:30'),
(2, '2025-09-14', 2, 2, 1, 'CLOSED', '2025-09-14 15:30', '2025-09-15 00:00'),
(3, '2025-09-14', 3, 3, 1, 'CLOSED', '2025-09-14 00:00', '2025-09-14 07:30');

-- ==========================
-- Inventory Lines (исправленные значения)
-- ==========================

-- Здание 1
-- Пункт 1: -/1 | -/2 | -/3
INSERT INTO inventory_line (shift_session_id, item_instance_id, opening_balance, incoming, outgoing, closing_balance, auto_filled)
VALUES
(1, 1, 0, 1, 0, 1, TRUE),
(2, 1, 0, 2, 0, 2, TRUE),
(3, 1, 0, 3, 0, 3, TRUE);

-- Пункт 2: -/1 | -/1 | -/1
INSERT INTO inventory_line (shift_session_id, item_instance_id, opening_balance, incoming, outgoing, closing_balance, auto_filled)
VALUES
(1, 2, 0, 1, 0, 1, TRUE),
(2, 2, 0, 1, 0, 1, TRUE),
(3, 2, 0, 1, 0, 1, TRUE);

-- Здание 2
-- Пункт 3: -/5 | -/5 | -/5
INSERT INTO inventory_line (shift_session_id, item_instance_id, opening_balance, incoming, outgoing, closing_balance, auto_filled)
VALUES
(1, 3, 0, 5, 0, 5, TRUE),
(2, 3, 0, 5, 0, 5, TRUE),
(3, 3, 0, 5, 0, 5, TRUE);

-- Пункт 4: 1/9 | 1/10 | 1/11
INSERT INTO inventory_line (shift_session_id, item_instance_id, opening_balance, incoming, outgoing, closing_balance, auto_filled)
VALUES
(1, 4, 1, 8, 0, 9, TRUE),
(2, 4, 1, 9, 0, 10, TRUE),
(3, 4, 1, 10, 0, 11, TRUE);

-- Пункт 5: 1/10 | -/10 | -/9
INSERT INTO inventory_line (shift_session_id, item_instance_id, opening_balance, incoming, outgoing, closing_balance, auto_filled)
VALUES
(1, 5, 1, 9, 0, 10, TRUE),
(2, 5, 0, 10, 0, 10, TRUE),
(3, 5, 0, 9, 0, 9, TRUE);

-- Здание 3
-- Пункт 6: -/- | -/- | -/-
INSERT INTO inventory_line (shift_session_id, item_instance_id, opening_balance, incoming, outgoing, closing_balance, auto_filled)
VALUES
(1, 6, 0, 0, 0, 0, TRUE),
(2, 6, 0, 0, 0, 0, TRUE),
(3, 6, 0, 0, 0, 0, TRUE);

-- Пункт 7: -/10 | -/10 | 1/11
INSERT INTO inventory_line (shift_session_id, item_instance_id, opening_balance, incoming, outgoing, closing_balance, auto_filled)
VALUES
(1, 7, 0, 10, 0, 10, TRUE),
(2, 7, 0, 10, 0, 10, TRUE),
(3, 7, 1, 10, 0, 11, TRUE);

-- Здание 4
-- Пункт 8: количество -/-20 | -/20 | 1/20
INSERT INTO inventory_line (shift_session_id, item_instance_id, opening_balance, incoming, outgoing, closing_balance, auto_filled)
VALUES
(1, 8, 0, 20, 0, 20, TRUE),
(2, 8, 0, 20, 0, 20, TRUE),
(3, 8, 1, 19, 0, 20, TRUE);

-- Пункт 9: мешки -/-40 | -/40 | 2/42
INSERT INTO inventory_line (shift_session_id, item_instance_id, opening_balance, incoming, outgoing, closing_balance, auto_filled)
VALUES
(1, 9, 0, 40, 0, 40, TRUE),
(2, 9, 0, 40, 0, 40, TRUE),
(3, 9, 2, 40, 0, 42, TRUE);

-- Пункт 10: -/5 | -/5 | -/5
INSERT INTO inventory_line (shift_session_id, item_instance_id, opening_balance, incoming, outgoing, closing_balance, auto_filled)
VALUES
(1, 10, 0, 5, 0, 5, TRUE),
(2, 10, 0, 5, 0, 5, TRUE),
(3, 10, 0, 5, 0, 5, TRUE);



-- ==========================
-- Shift Notes
-- ==========================
INSERT INTO shift_note (shift_session_id, type, text, created_at)
VALUES
(1, 'INFO', 'Замечаний нет', now()),
(2, 'INFO', 'Замечаний нет', now()),
(3, 'INFO', 'Замечаний нет', now());
