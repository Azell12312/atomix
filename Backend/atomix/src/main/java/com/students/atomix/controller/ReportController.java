package com.students.atomix.controller;

import com.students.atomix.dto.ReportSaveRequestDTO;
import com.students.atomix.service.ReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController // REST-контроллер (возвращает JSON)
@RequestMapping("/api/report") // Базовый путь для запросов
@CrossOrigin(origins = "http://127.0.0.1:5500") // Разрешаем запросы с фронта
public class ReportController {

	private final ReportService reportService; // Сервис для работы с отчётами

    // Внедрение сервиса через конструктор
    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @PostMapping("/save") // POST /api/report/save
    public ResponseEntity<?> saveReport(@RequestBody ReportSaveRequestDTO request) {
        // Передаём данные в сервис для сохранения
        reportService.saveReport(request);

        // Возвращаем ответ 200 OK без тела
        return ResponseEntity.ok().build();
    }
}
