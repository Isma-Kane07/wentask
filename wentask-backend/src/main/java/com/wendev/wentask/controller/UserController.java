package com.wendev.wentask.controller;

import com.wendev.wentask.dto.request.UpdateUserRequest;
import com.wendev.wentask.dto.response.MessageResponse;
import com.wendev.wentask.dto.response.UserResponse;
import com.wendev.wentask.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @userSecurity.isCurrentUser(#id)")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROJECT_MANAGER')")
    public ResponseEntity<List<UserResponse>> searchUsers(@RequestParam String username) {
        return ResponseEntity.ok(userService.searchUsers(username));
    }

    // ✅ Nouveau : Mise à jour d'un utilisateur (ADMIN uniquement)
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRequest request) {
        return ResponseEntity.ok(userService.updateUser(id, request));
    }

    // ✅ Nouveau : Suppression d'un utilisateur (ADMIN uniquement)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MessageResponse> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(new MessageResponse("User deleted successfully"));
    }
}