package com.wendev.wentask.dto.response;

import com.wendev.wentask.entity.Task;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class TaskResponse {
    private Long id;
    private String title;
    private String description;
    private Task.TaskStatus status;
    private Task.TaskPriority priority;
    private LocalDate dueDate;
    private ProjectSummary project;
    private UserSummary assignee;
    private UserSummary createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    @Builder
    public static class ProjectSummary {
        private Long id;
        private String name;
    }

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