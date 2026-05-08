package com.glowlogics.bookstore.controller;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.dao.DuplicateKeyException;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final JdbcTemplate jdbcTemplate;

    public AuthController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @PostMapping("/register")
    public Map<String, Object> register(@RequestBody Map<String, String> payload) {
        String name = payload.get("name");
        String email = payload.get("email");
        String password = payload.get("password");

        if (name == null || name.isBlank() || email == null || email.isBlank()
                || password == null || password.isBlank()) {
            return Map.of("success", false, "message", "All fields are required.");
        }

        if (!email.matches("^[\\w-.]+@[\\w-]+\\.[a-zA-Z]{2,}$")) {
            return Map.of("success", false, "message", "Invalid email address.");
        }

        if (password.length() < 6) {
            return Map.of("success", false, "message", "Password must be at least 6 characters.");
        }

        try {
            jdbcTemplate.update(
                "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
                name, email, password
            );
            Long userId = jdbcTemplate.queryForObject(
                "SELECT id FROM users WHERE email = ?", Long.class, email);
            return Map.of("success", true, "message", "Account created successfully!",
                "user", Map.of("id", userId, "name", name, "email", email));
        } catch (DuplicateKeyException e) {
            return Map.of("success", false, "message", "An account with this email already exists.");
        }
    }

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String password = payload.get("password");

        if (email == null || email.isBlank() || password == null || password.isBlank()) {
            return Map.of("success", false, "message", "Email and password are required.");
        }

        try {
            Map<String, Object> user = jdbcTemplate.queryForMap(
                "SELECT id, name, email FROM users WHERE email = ? AND password = ?",
                email, password
            );
            return Map.of("success", true, "message", "Login successful!",
                "user", Map.of(
                    "id", user.get("ID") != null ? user.get("ID") : user.get("id"),
                    "name", user.get("NAME") != null ? user.get("NAME") : user.get("name"),
                    "email", user.get("EMAIL") != null ? user.get("EMAIL") : user.get("email")
                ));
        } catch (EmptyResultDataAccessException e) {
            return Map.of("success", false, "message", "Invalid email or password.");
        }
    }
}
