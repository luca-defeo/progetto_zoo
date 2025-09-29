package com.finconsgroup.com.zoo.config;

import com.finconsgroup.com.zoo.service.CustomUserService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final CustomUserService customUserService;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll()

                        .requestMatchers("/api/user/**").hasAnyAuthority("ADMIN", "MANAGER")

                        .requestMatchers(HttpMethod.POST, "/api/ticket/add").hasAnyAuthority("ADMIN", "MANAGER")
                        .requestMatchers(HttpMethod.PUT, "/api/ticket/**").hasAnyAuthority("ADMIN", "MANAGER")
                        .requestMatchers(HttpMethod.DELETE, "/api/ticket/**").hasAnyAuthority("ADMIN", "MANAGER")
                        .requestMatchers(HttpMethod.GET, "/api/ticket/all").hasAnyAuthority("ADMIN", "MANAGER")
                        .requestMatchers(HttpMethod.GET, "/api/ticket/dashboard").hasAnyAuthority("ADMIN", "MANAGER", "OPERATOR")
                        .requestMatchers(HttpMethod.POST, "/api/ticket/*/accept").hasAuthority("OPERATOR")
                        .requestMatchers(HttpMethod.GET, "/api/ticket/my-tickets").hasAuthority("OPERATOR")
                        .requestMatchers(HttpMethod.GET, "/api/ticket/*").hasAnyAuthority("ADMIN", "MANAGER", "OPERATOR")

                        .requestMatchers(HttpMethod.GET, "/api/animal/**").hasAnyAuthority("ADMIN", "MANAGER", "OPERATOR")
                        .requestMatchers(HttpMethod.GET, "/api/enclosure/**").hasAnyAuthority("ADMIN", "MANAGER", "OPERATOR")

                        .requestMatchers("/api/animal/**").hasAnyAuthority("ADMIN", "MANAGER")
                        .requestMatchers("/api/enclosure/**").hasAnyAuthority("ADMIN", "MANAGER")

                        .anyRequest().authenticated()
                )
                .httpBasic(httpBasic -> httpBasic
                        .authenticationEntryPoint((request, response, authException) -> {
                            // Solo per endpoint NON /api/auth/**
                            if (!request.getRequestURI().startsWith("/api/auth/")) {
                                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, authException.getMessage());
                            }
                        })
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        return http.build();
    }

    @Bean
    public AuthenticationManager authManager() throws Exception {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(customUserService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return new ProviderManager(authProvider);
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("http://localhost:*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}