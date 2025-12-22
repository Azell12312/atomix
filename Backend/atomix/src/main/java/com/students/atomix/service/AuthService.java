package com.students.atomix.service;

import com.students.atomix.dto.LoginRequestDTO;
import com.students.atomix.dto.LoginResponseDTO;
import com.students.atomix.model.AppUser;
import com.students.atomix.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public LoginResponseDTO login(LoginRequestDTO request) {

        AppUser user = userRepository
                .findByUsernameAndActiveTrue(request.getUsername())
                .orElseThrow(() -> new RuntimeException("INVALID_CREDENTIALS"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("INVALID_CREDENTIALS");
        }

        LoginResponseDTO response = new LoginResponseDTO();
        response.setUserId(user.getId());
        response.setUsername(user.getUsername());
        response.setFullName(user.getFullName());
        response.setRole(user.getRole());

        return response;
    }
}
