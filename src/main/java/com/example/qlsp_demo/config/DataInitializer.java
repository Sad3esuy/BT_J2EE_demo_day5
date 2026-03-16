package com.example.qlsp_demo.config;

import com.example.qlsp_demo.model.User;
import com.example.qlsp_demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Set;

@Configuration
@RequiredArgsConstructor
public class DataInitializer {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    public CommandLineRunner initData() {
        return args -> {
            if (userRepository.count() == 0) {
                User user = User.builder()
                        .username("user")
                        .password(passwordEncoder.encode("123456"))
                        .roles(Set.of("USER"))
                        .build();

                User admin = User.builder()
                        .username("admin")
                        .password(passwordEncoder.encode("admin123"))
                        .roles(Set.of("ADMIN"))
                        .build();

                userRepository.save(user);
                userRepository.save(admin);
                System.out.println("Default users created: user/123456, admin/admin123");
            }
        };
    }
}
