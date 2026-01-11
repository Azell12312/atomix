package com.students.atomix.controller;

import com.students.atomix.dto.LoginRequestDTO;
import com.students.atomix.dto.LoginResponseDTO;
import com.students.atomix.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController // Контроллер для REST API
@RequestMapping("/api/auth") // Базовый путь
@CrossOrigin(origins = "http://127.0.0.1:5500") // Разрешаем запросы с фронта
public class AuthController {

    private final AuthService authService;

    // Внедрение сервиса авторизации
    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login") // POST /api/auth/login
    public ResponseEntity<LoginResponseDTO> login(
            @RequestBody LoginRequestDTO request) {

        // Передаём данные в сервис и возвращаем ответ
        return ResponseEntity.ok(authService.login(request));
    }
}
