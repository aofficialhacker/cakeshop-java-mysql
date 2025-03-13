package com.example.cakeshop.controller;

import com.example.cakeshop.model.User;
import com.example.cakeshop.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5500")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public User register(@RequestBody User user) {
        user.setRole("CUSTOMER");
        // Encode the password before saving
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    private static final String ADMIN_EMAIL = "admin@gmail.com"; // Add this line at the top of the class

    @GetMapping("/current-user")
    public Map<String, Object> getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Map<String, Object> userInfo = new HashMap<>();

        if (auth != null && auth.isAuthenticated() && !auth.getName().equals("anonymousUser")) {
            userInfo.put("authenticated", true);
            String email = auth.getName();
            userInfo.put("email", email);

            // Get the username from the repository
            if (!email.equals(ADMIN_EMAIL)) {
                userRepository.findByEmail(email).ifPresent(user -> {
                    userInfo.put("username", user.getUsername());
                });
            } else {
                // For admin user
                userInfo.put("username", "Admin");
            }

            // Get the role without the "ROLE_" prefix
            String role = auth.getAuthorities().stream()
                    .findFirst()
                    .map(a -> a.getAuthority().replace("ROLE_", ""))
                    .orElse("");
            userInfo.put("role", role);
        } else {
            userInfo.put("authenticated", false);
        }

        return userInfo;
    }
}
