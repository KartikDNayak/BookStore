package com.glowlogics.bookstore.controller;

import com.glowlogics.bookstore.model.Book;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/books")
public class BookController {

    private final JdbcTemplate jdbcTemplate;

    public BookController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<Book> bookRowMapper = (rs, rowNum) -> {
        Book book = new Book();
        book.setId(rs.getLong("id"));
        book.setTitle(rs.getString("title"));
        book.setAuthor(rs.getString("author"));
        book.setLanguage(rs.getString("language"));
        book.setDescription(rs.getString("description"));
        book.setPrice(rs.getDouble("price"));
        book.setImageUrl(rs.getString("image_url"));
        return book;
    };

    @GetMapping
    public List<Book> getAllBooks(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String language,
            @RequestParam(required = false) Double maxPrice) {
            
        StringBuilder sql = new StringBuilder("SELECT * FROM books WHERE 1=1");
        List<Object> params = new java.util.ArrayList<>();

        if (search != null && !search.isEmpty()) {
            sql.append(" AND (LOWER(title) LIKE LOWER(?) OR LOWER(author) LIKE LOWER(?))");
            String query = "%" + search + "%";
            params.add(query);
            params.add(query);
        }

        if (language != null && !language.isEmpty() && !language.equalsIgnoreCase("All")) {
            sql.append(" AND language = ?");
            params.add(language);
        }

        if (maxPrice != null && maxPrice > 0) {
            sql.append(" AND price <= ?");
            params.add(maxPrice);
        }

        return jdbcTemplate.query(sql.toString(), bookRowMapper, params.toArray());
    }

    @GetMapping("/languages")
    public List<java.util.Map<String, Object>> getLanguageCounts() {
        String sql = "SELECT language, COUNT(*) as count FROM books GROUP BY language";
        return jdbcTemplate.queryForList(sql);
    }

    @GetMapping("/{id}")
    public Book getBookById(@PathVariable Long id) {
        return jdbcTemplate.queryForObject("SELECT * FROM books WHERE id = ?", bookRowMapper, id);
    }
}
