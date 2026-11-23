package com.formflora.catalog;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = {"com.formflora.catalog", "com.formflora.security"})
public class CatalogServiceApplication {
    public static void main(String[] args) { SpringApplication.run(CatalogServiceApplication.class, args); }
}
