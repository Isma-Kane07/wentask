package com.wendev.wentask.config;

import com.wendev.wentask.entity.User;
import com.wendev.wentask.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initDatabase(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (userRepository.findByUsername("admin").isEmpty()) {
                User admin = new User();
                admin.setUsername("admin");
                admin.setEmail("admin@wentask.com");
                // On encode le mot de passe avant de l'enregistrer
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setFirstName("Admin");
                admin.setLastName("System");
                admin.setRole(User.UserRole.ADMIN);

                userRepository.save(admin);
                System.out.println("--- Utilisateur Admin créé par défaut (admin / admin123) ---");
            } else {
                System.out.println("--- Utilisateur Admin déjà présent en base ---");
            }
        };
    }
}