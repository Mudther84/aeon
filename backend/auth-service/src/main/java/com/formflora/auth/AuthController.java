package com.formflora.auth;

import com.formflora.security.SecuritySupport;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private static final Duration TOKEN_LIFETIME = Duration.ofHours(8);
    private final AccountRepository accounts;
    private final PasswordEncoder passwordEncoder;
    private final JwtEncoder jwtEncoder;
    private final boolean cookieSecure;

    public AuthController(AccountRepository accounts, PasswordEncoder passwordEncoder, JwtEncoder jwtEncoder,
                          @Value("${security.jwt.cookie-secure:true}") boolean cookieSecure) {
        this.accounts = accounts;
        this.passwordEncoder = passwordEncoder;
        this.jwtEncoder = jwtEncoder;
        this.cookieSecure = cookieSecure;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@Valid @RequestBody RegisterRequest request, HttpServletResponse response) {
        String email = request.email().trim().toLowerCase();
        if (accounts.findByEmailIgnoreCase(email).isPresent()) throw new ResponseStatusException(HttpStatus.CONFLICT, "An account with this email already exists");
        Account account = accounts.save(new Account(email, passwordEncoder.encode(request.password()), request.name().trim(), Account.Role.USER));
        return authenticate(account, response);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request, HttpServletResponse response) {
        Account account = accounts.findByEmailIgnoreCase(request.email().trim()).orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));
        if (!passwordEncoder.matches(request.password(), account.getPasswordHash())) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        return authenticate(account, response);
    }

    @GetMapping("/me")
    public UserResponse me(@AuthenticationPrincipal Jwt jwt) {
        Account account = accounts.findById(java.util.UUID.fromString(jwt.getSubject())).orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
        return userResponse(account);
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(HttpServletResponse response) {
        response.addHeader("Set-Cookie", ResponseCookie.from(SecuritySupport.SESSION_COOKIE, "")
            .httpOnly(true).secure(cookieSecure).path("/").sameSite("Lax").maxAge(Duration.ZERO).build().toString());
    }

    private AuthResponse authenticate(Account account, HttpServletResponse response) {
        Instant now = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder().issuer("form-flora-auth").issuedAt(now).expiresAt(now.plus(TOKEN_LIFETIME))
            .subject(account.getId().toString()).claim("email", account.getEmail()).claim("name", account.getDisplayName())
            .claim("roles", List.of(account.getRole().name())).build();
        String token = jwtEncoder.encode(JwtEncoderParameters.from(JwsHeader.with(MacAlgorithm.HS256).build(), claims)).getTokenValue();
        response.addHeader("Set-Cookie", ResponseCookie.from(SecuritySupport.SESSION_COOKIE, token)
            .httpOnly(true).secure(cookieSecure).path("/").sameSite("Lax").maxAge(TOKEN_LIFETIME).build().toString());
        return new AuthResponse(userResponse(account));
    }

    private UserResponse userResponse(Account account) {
        return new UserResponse(account.getId().toString(), account.getEmail(), account.getDisplayName(), account.getRole().name());
    }

    public record RegisterRequest(@NotBlank @Size(max = 100) String name, @NotBlank @Email @Size(max = 190) String email,
                                  @NotBlank @Size(min = 12, max = 72) String password) {}
    public record LoginRequest(@NotBlank @Email @Size(max = 190) String email, @NotBlank @Size(max = 72) String password) {}
    public record AuthResponse(UserResponse user) {}
    public record UserResponse(String id, String email, String name, String role) {}
}
