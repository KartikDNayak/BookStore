package com.glowlogics.bookstore.controller;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/books")
public class ReviewController {

    private final JdbcTemplate jdbcTemplate;

    public ReviewController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping("/{bookId}/reviews")
    public List<Map<String, Object>> getReviews(@PathVariable Long bookId) {
        String sql = "SELECT id, reviewer_name, rating, comment, created_at " +
                     "FROM reviews WHERE book_id = ? ORDER BY created_at DESC";
        return jdbcTemplate.queryForList(sql, bookId);
    }

    @PostMapping("/{bookId}/reviews")
    public Map<String, Object> addReview(
            @PathVariable Long bookId,
            @RequestBody Map<String, Object> payload) {

        String reviewerName = (String) payload.getOrDefault("reviewerName", "Anonymous");
        int rating = Integer.parseInt(String.valueOf(payload.getOrDefault("rating", 5)));
        String comment = (String) payload.getOrDefault("comment", "");

        if (reviewerName.isBlank()) reviewerName = "Anonymous";
        if (rating < 1) rating = 1;
        if (rating > 5) rating = 5;
        if (comment.isBlank()) {
            return Map.of("success", false, "message", "Comment cannot be empty.");
        }

        jdbcTemplate.update(
            "INSERT INTO reviews (book_id, reviewer_name, rating, comment) VALUES (?, ?, ?, ?)",
            bookId, reviewerName, rating, comment
        );

        return Map.of("success", true, "message", "Review added successfully!");
    }
}
