package com.students.atomix.controller;

import com.students.atomix.dto.ReportSaveRequestDTO;
import com.students.atomix.service.ReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "http://127.0.0.1:5500")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @PostMapping("/save")
    public ResponseEntity<Void> save(@RequestBody ReportSaveRequestDTO request) {
        reportService.saveReport(request);
        return ResponseEntity.ok().build();
    }
}
