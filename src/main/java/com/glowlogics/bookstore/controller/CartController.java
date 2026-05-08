package com.glowlogics.bookstore.controller;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.web.bind.annotation.*;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class CartController {

    private final JdbcTemplate jdbcTemplate;

    public CartController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<Map<String, Object>> cartRowMapper = (rs, rowNum) -> {
        return Map.of(
            "id", rs.getLong("cart_id"),
            "book", Map.of(
                "id", rs.getLong("id"),
                "title", rs.getString("title"),
                "author", rs.getString("author"),
                "language", rs.getString("language") != null ? rs.getString("language") : "English",
                "price", rs.getDouble("price"),
                "imageUrl", rs.getString("image_url") != null ? rs.getString("image_url") : ""
            )
        );
    };

    @GetMapping("/cart")
    public List<Map<String, Object>> getCart() {
        String sql = "SELECT c.id as cart_id, b.* FROM cart c JOIN books b ON c.book_id = b.id";
        return jdbcTemplate.query(sql, cartRowMapper);
    }

    @PostMapping("/cart")
    public Map<String, String> addToCart(@RequestBody Map<String, Long> payload) {
        Long bookId = payload.get("bookId");
        jdbcTemplate.update("INSERT INTO cart (book_id) VALUES (?)", bookId);
        return Map.of("message", "Added to cart successfully");
    }

    @DeleteMapping("/cart/{id}")
    public Map<String, String> removeFromCart(@PathVariable Long id) {
        jdbcTemplate.update("DELETE FROM cart WHERE id = ?", id);
        return Map.of("message", "Removed from cart");
    }

    @PostMapping("/checkout")
    public Map<String, Object> checkout(@RequestBody(required = false) Map<String, String> payload) {
        // Get current cart items
        String cartSql = "SELECT c.id as cart_id, b.* FROM cart c JOIN books b ON c.book_id = b.id";
        List<Map<String, Object>> cartItems = jdbcTemplate.query(cartSql, cartRowMapper);

        if (cartItems.isEmpty()) {
            return Map.of("success", false, "message", "Cart is empty");
        }

        // Calculate total
        double total = cartItems.stream()
            .mapToDouble(item -> {
                @SuppressWarnings("unchecked")
                Map<String, Object> book = (Map<String, Object>) item.get("book");
                return (Double) book.get("price");
            })
            .sum();

        // Extract user info from payload (may be null if not logged in)
        String userName = payload != null ? payload.getOrDefault("userName", "Guest") : "Guest";
        String userEmail = payload != null ? payload.getOrDefault("userEmail", "") : "";

        // Save the order
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(conn -> {
            PreparedStatement ps = conn.prepareStatement(
                "INSERT INTO orders (user_name, user_email, total_amount) VALUES (?, ?, ?)",
                Statement.RETURN_GENERATED_KEYS
            );
            ps.setString(1, userName);
            ps.setString(2, userEmail);
            ps.setDouble(3, total);
            return ps;
        }, keyHolder);

        long orderId = keyHolder.getKey().longValue();

        // Save order items
        for (Map<String, Object> item : cartItems) {
            @SuppressWarnings("unchecked")
            Map<String, Object> book = (Map<String, Object>) item.get("book");
            jdbcTemplate.update(
                "INSERT INTO order_items (order_id, book_id, book_title, price) VALUES (?, ?, ?, ?)",
                orderId, book.get("id"), book.get("title"), book.get("price")
            );
        }

        // Clear the cart
        jdbcTemplate.update("DELETE FROM cart");

        return Map.of(
            "success", true,
            "orderId", orderId,
            "message", "Order placed successfully",
            "total", total,
            "itemCount", cartItems.size()
        );
    }
}
