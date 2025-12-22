CREATE TYPE shift_status AS ENUM ('OPEN', 'CLOSED');
CREATE TYPE note_type AS ENUM ('INFO', 'WARNING', 'INCIDENT');


-- участок
CREATE TABLE section (
    id           BIGSERIAL PRIMARY KEY,
    name         VARCHAR(100) NOT NULL,
    workshop     VARCHAR(100) NOT NULL
);


-- пользователь
CREATE TABLE app_user (
    id           BIGSERIAL PRIMARY KEY,
    username     VARCHAR(100) NOT NULL UNIQUE,
    password     VARCHAR(255) NOT NULL,
    full_name    VARCHAR(255) NOT NULL,
    role         VARCHAR(20) NOT NULL CHECK (role IN ('ENGINEER', 'ADMIN')),
    section_id   BIGINT REFERENCES section(id),
    active       BOOLEAN NOT NULL DEFAULT TRUE
);


-- справочник смен
CREATE TABLE shift (
    id           BIGSERIAL PRIMARY KEY,
    name         VARCHAR(50) NOT NULL,
    start_time   TIME NOT NULL,
    end_time     TIME NOT NULL,
    order_index  INT NOT NULL UNIQUE
);


-- конкретная смена
CREATE TABLE shift_session (
    id           BIGSERIAL PRIMARY KEY,
    shift_date   DATE NOT NULL,
    shift_id     BIGINT NOT NULL REFERENCES shift(id),
    user_id      BIGINT NOT NULL REFERENCES app_user(id),
    section_id   BIGINT NOT NULL REFERENCES section(id),
    status       shift_status NOT NULL,
    started_at   TIMESTAMP NOT NULL,
    closed_at    TIMESTAMP,

    CONSTRAINT uq_shift_session UNIQUE (shift_date, shift_id, section_id)
);


-- здание
CREATE TABLE building (
    id           BIGSERIAL PRIMARY KEY,
    name         VARCHAR(100) NOT NULL,
    order_index  INT NOT NULL
);


-- шаблон показателя
CREATE TABLE report_item_template (
    id              BIGSERIAL PRIMARY KEY,
    title           TEXT NOT NULL,
    unit            VARCHAR(50),
    is_inventory    BOOLEAN NOT NULL DEFAULT FALSE,
    building_id     BIGINT REFERENCES building(id),
    active          BOOLEAN NOT NULL DEFAULT TRUE
);


-- конкретный показатель на дату для участка
CREATE TABLE report_item_instance (
    id              BIGSERIAL PRIMARY KEY,
    shift_date      DATE NOT NULL,
    section_id      BIGINT NOT NULL REFERENCES section(id),
    template_id     BIGINT NOT NULL REFERENCES report_item_template(id),
    order_index     INT NOT NULL,

    CONSTRAINT uq_item_instance UNIQUE (shift_date, section_id, template_id)
);


-- значения показателей с периодами
CREATE TABLE inventory_line (
    id                   BIGSERIAL PRIMARY KEY,
    shift_session_id     BIGINT NOT NULL REFERENCES shift_session(id),
    item_instance_id     BIGINT NOT NULL REFERENCES report_item_instance(id),

    opening_balance      NUMERIC(14,3) NOT NULL,
    incoming             NUMERIC(14,3) NOT NULL DEFAULT 0,
    outgoing             NUMERIC(14,3) NOT NULL DEFAULT 0,
    closing_balance      NUMERIC(14,3) NOT NULL,
    auto_filled          BOOLEAN NOT NULL,

    CONSTRAINT chk_inventory_non_negative
        CHECK (incoming >= 0 AND outgoing >= 0),

    CONSTRAINT chk_inventory_balance
        CHECK (closing_balance = opening_balance + incoming - outgoing),

    CONSTRAINT chk_inventory_closing_non_negative
        CHECK (closing_balance >= 0)
);


-- неинвентарные значения
CREATE TABLE report_value (
    id                   BIGSERIAL PRIMARY KEY,
    shift_session_id     BIGINT NOT NULL REFERENCES shift_session(id),
    item_instance_id     BIGINT NOT NULL REFERENCES report_item_instance(id),

    value_number         NUMERIC(14,3),
    value_text           TEXT,

    CONSTRAINT chk_only_one_value
        CHECK (
            (value_number IS NOT NULL AND value_text IS NULL)
         OR (value_number IS NULL AND value_text IS NOT NULL)
        )
);


-- замечания
CREATE TABLE shift_note (
    id                   BIGSERIAL PRIMARY KEY,
    shift_session_id     BIGINT NOT NULL REFERENCES shift_session(id),
    type                 note_type NOT NULL,
    text                 TEXT NOT NULL,
    created_at           TIMESTAMP NOT NULL
);



