package com.formflora.catalog;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/products")
public class ProductController {
    private final ProductRepository products;
    public ProductController(ProductRepository products) { this.products = products; }
    @GetMapping public List<Product> list() { return products.findAllByOrderByCreatedAtDesc(); }
    @GetMapping("/{id}") public Product get(@PathVariable UUID id) { return find(id); }
    @PostMapping @ResponseStatus(HttpStatus.CREATED) public Product create(@Valid @RequestBody ProductRequest request) { return products.save(request.toProduct()); }
    @PutMapping("/{id}") public Product update(@PathVariable UUID id, @Valid @RequestBody ProductRequest request) { Product product = find(id); product.update(request); return products.save(product); }
    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void delete(@PathVariable UUID id) { products.delete(find(id)); }
    private Product find(UUID id) { return products.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found")); }

    public record ProductRequest(@NotBlank @Size(max = 120) String name, @NotBlank @Size(max = 60) String category,
        @NotNull @DecimalMin("0.01") @DecimalMax("999999.99") BigDecimal price,
        @DecimalMin("0.01") @DecimalMax("999999.99") BigDecimal oldPrice,
        @DecimalMin("0.0") @DecimalMax("5.0") BigDecimal rating,
        @NotBlank @Size(max = 500) String image, @Size(max = 40) String tag,
        @NotBlank @Size(max = 1000) String description) {
        Product toProduct() { return new Product(name.trim(), category.trim(), price, oldPrice, rating, image.trim(), tag, description.trim()); }
    }
}
