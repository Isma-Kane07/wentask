package com.wendev.wentask.dto.response;

import com.wendev.wentask.entity.Project;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.Set;

@Data
@Builder
public class ProjectResponse {
    private Long id;
    private String name;
    private String description;
    private Project.ProjectStatus status;
    private UserSummary owner;
    private Set<UserSummary> members;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    @Builder
    public static class UserSummary {
        private Long id;
        private String username;
        private String email;
        private String firstName;
        private String lastName;
    }
}