package com.wendev.wentask.controller;

import com.wendev.wentask.dto.request.*;
import com.wendev.wentask.dto.response.JwtResponse;
import com.wendev.wentask.dto.response.MessageResponse;
import com.wendev.wentask.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/signin")
    public ResponseEntity<JwtResponse> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        return ResponseEntity.ok(authService.authenticateUser(loginRequest));
    }

    @PostMapping("/signup")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MessageResponse> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        return ResponseEntity.ok(authService.registerUser(signUpRequest));
    }

    // ✅ Nouveau : Vérifier l'identité
    @PostMapping("/verify-identity")
    public ResponseEntity<MessageResponse> verifyIdentity(@Valid @RequestBody VerifyIdentityRequest request) {
        return ResponseEntity.ok(authService.verifyIdentity(request));
    }

    // ✅ Nouveau : Réinitialiser le mot de passe
    @PostMapping("/reset-password")
    public ResponseEntity<MessageResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        return ResponseEntity.ok(authService.resetPassword(request));
    }
}