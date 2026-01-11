package com.students.atomix.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration // Класс с настройками Spring
public class SecurityConfig {

    @Bean // Бин для шифрования паролей
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(); // Безопасный алгоритм
    }

    @Bean // Настройка безопасности
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        // Отключаем CSRF
        // Разрешаем все запросы без авторизации
        http.csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth.anyRequest().permitAll());

        return http.build(); // Применяем настройки
    }
}
