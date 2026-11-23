package com.formflora.catalog;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "products")
public class Product {
    @Id @GeneratedValue(strategy = GenerationType.UUID) @JdbcTypeCode(SqlTypes.CHAR) @Column(length = 36, nullable = false, updatable = false)
    private UUID id;
    @Column(nullable = false, length = 120) private String name;
    @Column(nullable = false, length = 60) private String category;
    @Column(nullable = false, precision = 10, scale = 2) private BigDecimal price;
    @Column(name = "old_price", precision = 10, scale = 2) private BigDecimal oldPrice;
    @Column(precision = 2, scale = 1) private BigDecimal rating;
    @Column(nullable = false, length = 500) private String image;
    @Column(length = 40) private String tag;
    @Column(nullable = false, length = 1000) private String description;
    @Column(name = "created_at", nullable = false, updatable = false) private Instant createdAt;
    @Column(name = "updated_at", nullable = false) private Instant updatedAt;

    protected Product() {}
    public Product(String name, String category, BigDecimal price, BigDecimal oldPrice, BigDecimal rating, String image, String tag, String description) {
        this.name = name; this.category = category; this.price = price; this.oldPrice = oldPrice; this.rating = rating; this.image = image; this.tag = tag; this.description = description;
    }
    @jakarta.persistence.PrePersist void onCreate() { createdAt = Instant.now(); updatedAt = createdAt; }
    @jakarta.persistence.PreUpdate void onUpdate() { updatedAt = Instant.now(); }
    public UUID getId() { return id; } public String getName() { return name; } public String getCategory() { return category; }
    public BigDecimal getPrice() { return price; } public BigDecimal getOldPrice() { return oldPrice; } public BigDecimal getRating() { return rating; }
    public String getImage() { return image; } public String getTag() { return tag; } public String getDescription() { return description; }
    public Instant getCreatedAt() { return createdAt; } public Instant getUpdatedAt() { return updatedAt; }
    public void update(ProductController.ProductRequest request) { name = request.name().trim(); category = request.category().trim(); price = request.price(); oldPrice = request.oldPrice(); rating = request.rating(); image = request.image().trim(); tag = request.tag() == null ? null : request.tag().trim(); description = request.description().trim(); }
}
