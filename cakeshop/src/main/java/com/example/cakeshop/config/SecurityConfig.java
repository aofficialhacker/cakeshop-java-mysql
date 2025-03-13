package com.example.cakeshop.config;

import com.example.cakeshop.service.CustomUserDetailsService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.http.HttpMethod;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@EnableGlobalMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(authz -> authz
                // Public endpoints: authentication URLs and static resources.
                .requestMatchers(
                    new AntPathRequestMatcher("/api/auth/**"),
                    new AntPathRequestMatcher("/login.html"),
                    new AntPathRequestMatcher("/register.html"),
                    new AntPathRequestMatcher("/css/**"),
                    new AntPathRequestMatcher("/js/**"),
                    new AntPathRequestMatcher("/images/**"))
                .permitAll()
                // Allow GET requests to /api/cakes/** for everyone.
                .requestMatchers(new AntPathRequestMatcher("/api/cakes/**", "GET"))
                .permitAll()
                // All non-GET requests to /api/cakes/** require ADMIN role.
                .requestMatchers(new AntPathRequestMatcher("/api/cakes/**"))
                .hasRole("ADMIN")
                // Checkout and Cart pages require authentication.
                .requestMatchers(
                    new AntPathRequestMatcher("/checkout.html"),
                    new AntPathRequestMatcher("/cart.html"))
                .authenticated()
                .anyRequest().permitAll())
            .formLogin(form -> form
                .loginPage("/login.html")
                .loginProcessingUrl("/api/auth/login")  // Change this to match your form
                .usernameParameter("email")  // Change this to match your form field
                .passwordParameter("password")  // Make sure this matches your form field
                .defaultSuccessUrl("/index.html", true)
                .failureUrl("/login.html?error")
                .permitAll())
            .logout(logout -> logout
                .logoutUrl("/api/auth/logout")
                .logoutSuccessUrl("/index.html")
                .invalidateHttpSession(true)
                .deleteCookies("JSESSIONID")
                .permitAll());
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
