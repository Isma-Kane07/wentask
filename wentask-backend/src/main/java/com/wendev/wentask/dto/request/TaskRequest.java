package com.wendev.wentask.dto.request;

import com.wendev.wentask.entity.Task;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class TaskRequest {
    @NotBlank(message = "Task title is required")
    @Size(min = 3, max = 200, message = "Task title must be between 3 and 200 characters")
    private String title;

    @Size(max = 2000, message = "Description cannot exceed 2000 characters")
    private String description;

    private Task.TaskStatus status = Task.TaskStatus.TODO;
    private Task.TaskPriority priority = Task.TaskPriority.MEDIUM;
    private Long assigneeId;
    private LocalDate dueDate;
}