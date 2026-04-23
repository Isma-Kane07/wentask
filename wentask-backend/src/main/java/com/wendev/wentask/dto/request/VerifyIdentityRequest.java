package com.wendev.wentask.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class VerifyIdentityRequest {
    @NotBlank
    private String username;

    @NotBlank
    @Email
    private String email;
}