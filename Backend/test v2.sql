WITH shift_map AS (
    SELECT
        ss.id              AS shift_session_id,
        ss.shift_id,
        ss.shift_date
    FROM shift_session ss
    WHERE ss.shift_date = DATE '2025-09-01'
),
all_values AS (
    -- обычные числовые показатели
    SELECT
        riv.shift_session_id,
        rii.template_id,
        riv.period_type,
        riv.value
    FROM report_item_value riv
    JOIN report_item_instance rii ON rii.id = riv.item_instance_id

    UNION ALL

    -- инвентарные показатели
    SELECT
        il.shift_session_id,
        rii.template_id,
        il.period_type,
        il.quantity AS value
    FROM inventory_line il
    JOIN report_item_instance rii ON rii.id = il.item_instance_id
),
pivoted AS (
    SELECT
        t.id AS template_id,

        -- 1 смена
        MAX(CASE WHEN sm.shift_id = 1 AND v.period_type = 'SHIFT'     THEN v.value END) AS s1_shift,
        MAX(CASE WHEN sm.shift_id = 1 AND v.period_type <> 'SHIFT'    THEN v.value END) AS s1_period,

        -- 2 смена
        MAX(CASE WHEN sm.shift_id = 2 AND v.period_type = 'SHIFT'     THEN v.value END) AS s2_shift,
        MAX(CASE WHEN sm.shift_id = 2 AND v.period_type <> 'SHIFT'    THEN v.value END) AS s2_period,

        -- 3 смена
        MAX(CASE WHEN sm.shift_id = 3 AND v.period_type = 'SHIFT'     THEN v.value END) AS s3_shift,
        MAX(CASE WHEN sm.shift_id = 3 AND v.period_type <> 'SHIFT'    THEN v.value END) AS s3_period

    FROM report_item_template t
    JOIN report_item_instance rii
        ON rii.template_id = t.id
       AND rii.shift_date = DATE '2025-09-01'
       AND rii.section_id = 1

    LEFT JOIN all_values v
        ON v.template_id = t.id
    LEFT JOIN shift_map sm
        ON sm.shift_session_id = v.shift_session_id

    GROUP BY t.id
)

SELECT
    b.name                              AS building,
    rii.order_index                     AS item_no,
    t.title                             AS item_title,
    t.unit                              AS unit,

    -- формат как в рапорте
    COALESCE(s1_shift, 0)::TEXT || '/' || COALESCE(s1_period, 0)::TEXT AS "1 смена",
    COALESCE(s2_shift, 0)::TEXT || '/' || COALESCE(s2_period, 0)::TEXT AS "2 смена",
    COALESCE(s3_shift, 0)::TEXT || '/' || COALESCE(s3_period, 0)::TEXT AS "3 смена"

FROM pivoted p
JOIN report_item_template t ON t.id = p.template_id
JOIN report_item_instance rii
    ON rii.template_id = t.id
   AND rii.shift_date = DATE '2025-09-01'
   AND rii.section_id = 1
LEFT JOIN building b ON b.id = t.building_id

ORDER BY
    b.order_index NULLS LAST,
    rii.order_index;
