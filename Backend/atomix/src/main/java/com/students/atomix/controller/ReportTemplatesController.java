package com.students.atomix.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.students.atomix.dto.ReportItemTemplateDTO;
import com.students.atomix.repository.ReportItemTemplateRepository;

@RestController // REST-контроллер, возвращает JSON
@RequestMapping("/api/report") // Базовый путь
@CrossOrigin(origins = {"http://127.0.0.1:5500", "http://localhost:5500"}) // Разрешённый фронт
public class ReportTemplatesController {

    private final ReportItemTemplateRepository templateRepository; // Репозиторий для работы с БД

    // Внедрение репозитория
    public ReportTemplatesController(ReportItemTemplateRepository templateRepository) {
        this.templateRepository = templateRepository;
    }

    @GetMapping("/templates") // GET /api/report/templates
    public List<ReportItemTemplateDTO> templates() {
        // Получаем все записи из БД
        // Преобразуем их в DTO
        // Возвращаем список
        return templateRepository.findAll()
                .stream()
                .map(ReportItemTemplateDTO::from)
                .toList();
    }
}
