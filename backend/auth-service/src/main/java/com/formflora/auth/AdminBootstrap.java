package com.formflora.auth;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminBootstrap implements CommandLineRunner {
    private final AccountRepository accounts;
    private final PasswordEncoder passwordEncoder;
    private final String email;
    private final String password;
    private final String name;

    public AdminBootstrap(AccountRepository accounts, PasswordEncoder passwordEncoder,
                          @Value("${ADMIN_EMAIL:}") String email, @Value("${ADMIN_PASSWORD:}") String password,
                          @Value("${ADMIN_NAME:Store Admin}") String name) {
        this.accounts = accounts; this.passwordEncoder = passwordEncoder; this.email = email; this.password = password; this.name = name;
    }

    @Override public void run(String... args) {
        if (email.isBlank() && password.isBlank()) return;
        if (email.isBlank() || password.length() < 16) throw new IllegalStateException("Set both ADMIN_EMAIL and a unique ADMIN_PASSWORD of at least 16 characters");
        String normalizedEmail = email.trim().toLowerCase();
        if (accounts.findByEmailIgnoreCase(normalizedEmail).isEmpty()) {
            accounts.save(new Account(normalizedEmail, passwordEncoder.encode(password), name, Account.Role.ADMIN));
        }
    }
}
