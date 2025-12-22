SELECT
  ss.shift_date,
  s.name AS shift,
  b.name AS building,
  t.title,
  i.opening_balance,
  i.incoming,
  i.outgoing,
  i.closing_balance
FROM inventory_line i
JOIN shift_session ss ON ss.id = i.shift_session_id
JOIN shift s ON s.id = ss.shift_id
JOIN report_item_instance rii ON rii.id = i.item_instance_id
JOIN report_item_template t ON t.id = rii.template_id
LEFT JOIN building b ON b.id = t.building_id
ORDER BY ss.shift_id, b.order_index, rii.order_index;
