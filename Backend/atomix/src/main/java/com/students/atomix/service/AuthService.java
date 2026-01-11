package com.students.atomix.service;

import com.students.atomix.dto.LoginRequestDTO;
import com.students.atomix.dto.LoginResponseDTO;
import com.students.atomix.model.AppUser;
import com.students.atomix.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service // Сервис с логикой авторизации
public class AuthService {

    private final UserRepository userRepository; // Доступ к пользователям в БД
    private final PasswordEncoder passwordEncoder; // Проверка пароля

    // Внедрение зависимостей
    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // Логин пользователя
    public LoginResponseDTO login(LoginRequestDTO request) {

        // Ищем активного пользователя по логину
        AppUser user = userRepository
                .findByUsernameAndActiveTrue(request.getUsername())
                .orElseThrow(() -> new RuntimeException("INVALID_CREDENTIALS"));

        // Проверяем, совпадает ли пароль
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("INVALID_CREDENTIALS");
        }

        // Формируем ответ
        LoginResponseDTO response = new LoginResponseDTO();
        response.setUserId(user.getId());
        response.setUsername(user.getUsername());
        response.setFullName(user.getFullName());
        response.setRole(user.getRole());

        // Возвращаем данные пользователя
        return response;
    }
}
