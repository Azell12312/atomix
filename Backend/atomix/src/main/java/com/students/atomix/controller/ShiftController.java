package com.students.atomix.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.students.atomix.dto.ShiftStartRequestDTO;
import com.students.atomix.dto.ShiftStartResponseDTO;
import com.students.atomix.service.ShiftService;

@RestController
@RequestMapping("/api/shift")
@CrossOrigin(origins = "*")
public class ShiftController {

    private final ShiftService shiftService;

    public ShiftController(ShiftService shiftService) {
        this.shiftService = shiftService;
    }

    @PostMapping("/start")
    public ResponseEntity<ShiftStartResponseDTO> startShift(@RequestBody ShiftStartRequestDTO dto) {
        return ResponseEntity.ok(shiftService.startShift(dto));
    }
    
    @PostMapping("/close/{shiftSessionId}")
    public ResponseEntity<?> closeShift(@PathVariable Long shiftSessionId) {
        shiftService.closeShift(shiftSessionId);
        return ResponseEntity.ok().build();
    }

}
