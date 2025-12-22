SELECT
    ss.shift_date,
    s.name AS shift,
    b.name AS building,
    t.title AS report_item,
    t.unit,

    -- значение за смену
    COALESCE(v_shift.value, 0) AS value_per_shift,

    -- агрегат (месяц / год / кампания)
    COALESCE(v_month.value, v_year.value, v_campaign.value) AS value_aggregated,

    -- тип агрегата (для понимания)
    CASE
        WHEN v_month.value IS NOT NULL THEN 'MONTH'
        WHEN v_year.value IS NOT NULL THEN 'YEAR'
        WHEN v_campaign.value IS NOT NULL THEN 'CAMPAIGN'
    END AS aggregate_period

FROM shift_session ss
JOIN shift s ON s.id = ss.shift_id

JOIN report_item_value v_shift
    ON v_shift.shift_session_id = ss.id
   AND v_shift.period_type = 'SHIFT'

LEFT JOIN report_item_value v_month
    ON v_month.shift_session_id = ss.id
   AND v_month.item_instance_id = v_shift.item_instance_id
   AND v_month.period_type = 'MONTH'

LEFT JOIN report_item_value v_year
    ON v_year.shift_session_id = ss.id
   AND v_year.item_instance_id = v_shift.item_instance_id
   AND v_year.period_type = 'YEAR'

LEFT JOIN report_item_value v_campaign
    ON v_campaign.shift_session_id = ss.id
   AND v_campaign.item_instance_id = v_shift.item_instance_id
   AND v_campaign.period_type = 'CAMPAIGN'

JOIN report_item_instance rii
    ON rii.id = v_shift.item_instance_id

JOIN report_item_template t
    ON t.id = rii.template_id

LEFT JOIN building b
    ON b.id = t.building_id

ORDER BY
    ss.shift_id,
    b.order_index,
    rii.order_index;
