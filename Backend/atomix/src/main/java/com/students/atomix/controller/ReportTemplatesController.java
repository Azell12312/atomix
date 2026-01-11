package com.students.atomix.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.students.atomix.dto.ReportItemTemplateDTO;
import com.students.atomix.repository.ReportItemTemplateRepository;

@RestController
@RequestMapping("/api/report")
@CrossOrigin(origins = {"http://127.0.0.1:5500", "http://localhost:5500"})
public class ReportTemplatesController {

    private final ReportItemTemplateRepository templateRepository;

    public ReportTemplatesController(ReportItemTemplateRepository templateRepository) {
        this.templateRepository = templateRepository;
    }

    @GetMapping("/templates")
    public List<ReportItemTemplateDTO> templates() {
        return templateRepository.findAll()
                .stream()
                .map(ReportItemTemplateDTO::from)
                .toList();
    }
}
