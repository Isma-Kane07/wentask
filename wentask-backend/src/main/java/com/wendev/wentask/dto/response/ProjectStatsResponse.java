package com.wendev.wentask.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProjectStatsResponse {
    private Long projectId;
    private String projectName;
    private Long totalTasks;
    private Long todoTasks;
    private Long inProgressTasks;
    private Long inReviewTasks;
    private Long doneTasks;
    private Long memberCount;
}