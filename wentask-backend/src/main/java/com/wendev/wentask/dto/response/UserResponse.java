package com.wendev.wentask.dto.response;

import com.wendev.wentask.entity.User;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class UserResponse {
    private Long id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private User.UserRole role;
    private LocalDateTime createdAt;
}