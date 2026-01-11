package com.students.atomix.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.students.atomix.dto.ShiftStartRequestDTO;
import com.students.atomix.dto.ShiftStartResponseDTO;
import com.students.atomix.service.ShiftService;

@RestController // REST-контроллер (работает с HTTP и JSON)
@RequestMapping("/api/shift") // Базовый путь для смен
@CrossOrigin(origins = "*") // Разрешаем запросы с любых адресов
public class ShiftController {

    private final ShiftService shiftService; // Сервис с бизнес-логикой

    // Внедрение сервиса через конструктор
    public ShiftController(ShiftService shiftService) {
        this.shiftService = shiftService;
    }

    @PostMapping("/start") // POST /api/shift/start
    public ResponseEntity<ShiftStartResponseDTO> startShift(@RequestBody ShiftStartRequestDTO dto) {
        // Запуск смены и возврат данных
        return ResponseEntity.ok(shiftService.startShift(dto));
    }
    
    @PostMapping("/close/{shiftSessionId}") // POST /api/shift/close/{id}
    public ResponseEntity<?> closeShift(@PathVariable Long shiftSessionId) {
        // Закрытие смены по id
        shiftService.closeShift(shiftSessionId);

        // Возвращаем 200 OK без данных
        return ResponseEntity.ok().build();
    }

}
