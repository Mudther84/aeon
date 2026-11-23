package com.formflora.auth;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = {"com.formflora.auth", "com.formflora.security"})
public class AuthServiceApplication {
    public static void main(String[] args) { SpringApplication.run(AuthServiceApplication.class, args); }
}
