package com.wendev.wentask.service;

import com.wendev.wentask.dto.request.LoginRequest;
import com.wendev.wentask.dto.request.SignupRequest;
import com.wendev.wentask.dto.response.JwtResponse;
import com.wendev.wentask.dto.response.MessageResponse;
import com.wendev.wentask.entity.User;
import com.wendev.wentask.exception.BadRequestException;
import com.wendev.wentask.exception.ResourceNotFoundException;
import com.wendev.wentask.repository.UserRepository;
import com.wendev.wentask.security.JwtUtils;
import com.wendev.wentask.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder encoder;
    private final JwtUtils jwtUtils;

    public JwtResponse authenticateUser(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsername(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

        return new JwtResponse(
                jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getEmail(),
                roles
        );
    }

    @Transactional
    public MessageResponse registerUser(SignupRequest signUpRequest) {
        // Vérifier si le nom d'utilisateur existe déjà
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            throw new BadRequestException("Error: Username is already taken!");
        }

        // Vérifier si l'email existe déjà
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            throw new BadRequestException("Error: Email is already in use!");
        }

        // Créer le nouvel utilisateur
        User user = new User();
        user.setUsername(signUpRequest.getUsername());
        user.setEmail(signUpRequest.getEmail());
        user.setPassword(encoder.encode(signUpRequest.getPassword()));
        user.setFirstName(signUpRequest.getFirstName());
        user.setLastName(signUpRequest.getLastName());

        // Déterminer le rôle
        Set<String> strRoles = signUpRequest.getRole();
        User.UserRole role = User.UserRole.MEMBER;

        if (strRoles != null) {
            if (strRoles.contains("admin")) {
                role = User.UserRole.ADMIN;
            } else if (strRoles.contains("pm")) {
                role = User.UserRole.PROJECT_MANAGER;
            }
        }

        user.setRole(role);
        userRepository.save(user);

        return new MessageResponse("User registered successfully!");
    }
}