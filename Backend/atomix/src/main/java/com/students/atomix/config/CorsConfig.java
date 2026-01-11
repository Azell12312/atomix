package com.students.atomix.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.*;

@Configuration // Говорим Spring: это класс с настройками
public class CorsConfig implements WebMvcConfigurer { // Подключаем настройку CORS через MVC

    @Override
    public void addCorsMappings(CorsRegistry registry) { // Здесь задаём правила CORS
        registry.addMapping("/api/**") // Правила применяются только к /api/...
                .allowedOrigins("http://127.0.0.1:5500", "http://localhost:5500") // Разрешённые адреса фронта
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Разрешённые HTTP-методы
                .allowedHeaders("*"); // Разрешаем любые заголовки
    }
}
