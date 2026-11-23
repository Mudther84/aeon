package com.formflora.security;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.function.Function;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.server.resource.web.BearerTokenResolver;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

public final class SecuritySupport {
    public static final String SESSION_COOKIE = "FORMFLORA_SESSION";
    private SecuritySupport() {}

    public static JwtDecoder jwtDecoder(String base64Secret) {
        byte[] bytes = java.util.Base64.getDecoder().decode(base64Secret);
        if (bytes.length < 32) throw new IllegalStateException("AUTH_JWT_SECRET must decode to at least 32 bytes");
        SecretKey key = new SecretKeySpec(bytes, "HmacSHA256");
        return NimbusJwtDecoder.withSecretKey(key).macAlgorithm(MacAlgorithm.HS256).build();
    }

    public static BearerTokenResolver authCookieOrBearerToken() {
        BearerTokenResolver resolver = cookieOrBearerToken();
        return request -> {
            String path = request.getRequestURI();
            if ("POST".equals(request.getMethod()) && (path.endsWith("/api/auth/register") || path.endsWith("/api/auth/login") || path.endsWith("/api/auth/logout"))) return null;
            return resolver.resolve(request);
        };
    }

    public static BearerTokenResolver cookieOrBearerToken() {
        return (HttpServletRequest request) -> {
            String header = request.getHeader("Authorization");
            if (header != null && header.startsWith("Bearer ")) return header.substring(7);
            Cookie[] cookies = request.getCookies();
            if (cookies == null) return null;
            return Arrays.stream(cookies).filter(cookie -> SESSION_COOKIE.equals(cookie.getName())).map(Cookie::getValue).findFirst().orElse(null);
        };
    }

    public static Converter<Jwt, Collection<GrantedAuthority>> roleAuthorities() {
        return jwt -> {
            Object rawRoles = jwt.getClaims().get("roles");
            if (!(rawRoles instanceof List<?> roles)) return List.of();
            return roles.stream().map(String::valueOf).map(role -> (GrantedAuthority) new SimpleGrantedAuthority("ROLE_" + role)).toList();
        };
    }

    public static Function<Jwt, AbstractAuthenticationToken> roleAuthenticationConverter() {
        return jwt -> new JwtAuthenticationToken(jwt, roleAuthorities().convert(jwt), jwt.getSubject());
    }
}
