-- =====================
-- Типы для статусов и заметок
-- =====================
CREATE TYPE shift_status AS ENUM ('OPEN', 'CLOSED');
CREATE TYPE note_type AS ENUM ('INFO', 'WARNING', 'INCIDENT');

-- =====================
-- Участки
-- =====================
CREATE TABLE section (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    workshop VARCHAR(100) NOT NULL
);

-- =====================
-- Пользователи
-- =====================
CREATE TABLE app_user (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('ENGINEER', 'ADMIN')),
    section_id BIGINT REFERENCES section(id),
    active BOOLEAN NOT NULL DEFAULT TRUE
);

-- =====================
-- Смены
-- =====================
CREATE TABLE shift (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    order_index INT NOT NULL UNIQUE
);

-- =====================
-- Конкретная смена на дату
-- =====================
CREATE TABLE shift_session (
    id BIGSERIAL PRIMARY KEY,
    shift_date DATE NOT NULL,
    shift_id BIGINT NOT NULL REFERENCES shift(id),
    user_id BIGINT NOT NULL REFERENCES app_user(id),
    section_id BIGINT NOT NULL REFERENCES section(id),
    status shift_status NOT NULL,
    started_at TIMESTAMP NOT NULL,
    closed_at TIMESTAMP,
    CONSTRAINT uq_shift_session UNIQUE (shift_date, shift_id, section_id)
);

-- =====================
-- Здания
-- =====================
CREATE TABLE building (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    order_index INT NOT NULL
);

-- =====================
-- Шаблон показателя (Report Item)
-- =====================
CREATE TABLE report_item_template (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    unit VARCHAR(50), -- м³, кг, шт.
    is_inventory BOOLEAN NOT NULL DEFAULT FALSE, -- инвентарные движения
    building_id BIGINT REFERENCES building(id),
    active BOOLEAN NOT NULL DEFAULT TRUE
);

-- =====================
-- Конкретный показатель на дату для участка
-- =====================
CREATE TABLE report_item_instance (
    id BIGSERIAL PRIMARY KEY,
    shift_date DATE NOT NULL,
    section_id BIGINT NOT NULL REFERENCES section(id),
    template_id BIGINT NOT NULL REFERENCES report_item_template(id),
    order_index INT NOT NULL,
    CONSTRAINT uq_item_instance UNIQUE (shift_date, section_id, template_id)
);

-- =====================
-- Значения показателей с периодами
-- =====================
CREATE TYPE period_type AS ENUM ('SHIFT', 'MONTH', 'CAMPAIGN', 'YEAR');

CREATE TABLE report_item_value (
    id BIGSERIAL PRIMARY KEY,
    shift_session_id BIGINT NOT NULL REFERENCES shift_session(id),
    item_instance_id BIGINT NOT NULL REFERENCES report_item_instance(id),
    period_type period_type NOT NULL,
    value NUMERIC(14,3) NOT NULL
);

-- =====================
-- Инвентарные линии (для движений контейнеров, мешков и т.п.)
-- =====================
CREATE TABLE inventory_line (
    id BIGSERIAL PRIMARY KEY,
    shift_session_id BIGINT NOT NULL REFERENCES shift_session(id),
    item_instance_id BIGINT NOT NULL REFERENCES report_item_instance(id),
    quantity NUMERIC(14,3) NOT NULL, -- количество за смену
    period_type period_type NOT NULL, -- SHIFT / MONTH / CAMPAIGN / YEAR
    auto_filled BOOLEAN NOT NULL DEFAULT FALSE
);

-- =====================
-- Неинвентарные значения (текстовые или числовые)
-- =====================
CREATE TABLE report_value (
    id BIGSERIAL PRIMARY KEY,
    shift_session_id BIGINT NOT NULL REFERENCES shift_session(id),
    item_instance_id BIGINT NOT NULL REFERENCES report_item_instance(id),
    value_number NUMERIC(14,3),
    value_text TEXT,
    CONSTRAINT chk_only_one_value CHECK (
        (value_number IS NOT NULL AND value_text IS NULL) OR
        (value_number IS NULL AND value_text IS NOT NULL)
    )
);

-- =====================
-- Заметки по смене
-- =====================
CREATE TABLE shift_note (
    id BIGSERIAL PRIMARY KEY,
    shift_session_id BIGINT NOT NULL REFERENCES shift_session(id),
    type note_type NOT NULL,
    text TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL
);
