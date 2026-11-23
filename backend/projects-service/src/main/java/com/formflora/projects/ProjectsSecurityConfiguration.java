package com.formflora.projects;

import com.formflora.security.SecuritySupport;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class ProjectsSecurityConfiguration {
    @Bean SecurityFilterChain projectsFilterChain(HttpSecurity http) throws Exception {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(SecuritySupport.roleAuthorities());
        return http.csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth.requestMatchers("/actuator/health").permitAll().requestMatchers("/api/projects/**").hasRole("ADMIN").anyRequest().authenticated())
            .oauth2ResourceServer(oauth -> oauth.bearerTokenResolver(SecuritySupport.cookieOrBearerToken()).jwt(jwt -> jwt.jwtAuthenticationConverter(converter)))
            .build();
    }
}
