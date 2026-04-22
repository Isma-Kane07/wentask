package com.wendev.wentask.dto.request;

import com.wendev.wentask.entity.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateUserRequest {
    @Size(min = 3, max = 20)
    private String username;

    @Size(max = 50)
    @Email
    private String email;

    private String firstName;
    private String lastName;

    @Size(min = 6, max = 40)
    private String password;

    private User.UserRole role;
}