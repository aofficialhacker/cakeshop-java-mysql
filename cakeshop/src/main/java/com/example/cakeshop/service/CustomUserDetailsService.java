package com.example.cakeshop.service;

import com.example.cakeshop.model.User;
import com.example.cakeshop.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private final String ADMIN_EMAIL = "admin@gmail.com";
    private final String ADMIN_PASSWORD = "vishal"; // For demo purposes

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        if (ADMIN_EMAIL.equalsIgnoreCase(email)) {
            // Return the hardcoded admin user. Spring Security will prepend "ROLE_" to
            // roles.
            return org.springframework.security.core.userdetails.User.withUsername(ADMIN_EMAIL)
                    .password(passwordEncoder.encode(ADMIN_PASSWORD))
                    .roles("ADMIN")
                    .build();
        }
        // For customers: load user from repository.
        com.example.cakeshop.model.User appUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
        return org.springframework.security.core.userdetails.User.withUsername(appUser.getEmail())
                .password(appUser.getPassword()) // Should already be encoded on registration.
                .roles(appUser.getRole()) // e.g., "CUSTOMER"
                .build();
    }
}
