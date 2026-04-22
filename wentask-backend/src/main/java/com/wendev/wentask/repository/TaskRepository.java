package com.wendev.wentask.repository;

import com.wendev.wentask.entity.Project;
import com.wendev.wentask.entity.Task;
import com.wendev.wentask.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByProject(Project project);
    List<Task> findByAssignee(User assignee);
    List<Task> findByProjectAndStatus(Project project, Task.TaskStatus status);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.project = :project")
    Long countTasksByProject(@Param("project") Project project);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.project = :project AND t.status = :status")
    Long countTasksByProjectAndStatus(@Param("project") Project project,
                                      @Param("status") Task.TaskStatus status);
}