package com.wendev.wentask.dto.request;

import com.wendev.wentask.entity.Task;
import lombok.Data;
import java.time.LocalDate;

@Data
public class TaskUpdateRequest {
    private String title;
    private String description;
    private Task.TaskStatus status;
    private Task.TaskPriority priority;
    private Long assigneeId;
    private LocalDate dueDate;
}