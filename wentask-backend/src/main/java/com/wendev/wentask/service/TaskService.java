package com.wendev.wentask.service;

import com.wendev.wentask.dto.request.TaskRequest;
import com.wendev.wentask.dto.request.TaskUpdateRequest;
import com.wendev.wentask.dto.response.TaskResponse;
import com.wendev.wentask.entity.Project;
import com.wendev.wentask.entity.Task;
import com.wendev.wentask.entity.User;
import com.wendev.wentask.exception.AccessDeniedException;
import com.wendev.wentask.exception.BadRequestException;
import com.wendev.wentask.exception.ResourceNotFoundException;
import com.wendev.wentask.repository.ProjectRepository;
import com.wendev.wentask.repository.TaskRepository;
import com.wendev.wentask.repository.UserRepository;
import com.wendev.wentask.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private void checkProjectAccess(Project project, User user) {
        if (!project.getOwner().equals(user) && !project.getMembers().contains(user)) {
            throw new AccessDeniedException("You don't have access to this project");
        }
    }

    public List<TaskResponse> getTasksByProject(Long projectId) {
        User currentUser = getCurrentUser();
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        checkProjectAccess(project, currentUser);

        List<Task> tasks = taskRepository.findByProject(project);
        return tasks.stream()
                .map(this::mapToTaskResponse)
                .collect(Collectors.toList());
    }

    public TaskResponse getTaskById(Long id) {
        User currentUser = getCurrentUser();
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        checkProjectAccess(task.getProject(), currentUser);

        return mapToTaskResponse(task);
    }

    @Transactional
    public TaskResponse createTask(Long projectId, TaskRequest taskRequest) {
        User currentUser = getCurrentUser();
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        checkProjectAccess(project, currentUser);

        Task task = new Task();
        task.setTitle(taskRequest.getTitle());
        task.setDescription(taskRequest.getDescription());
        task.setPriority(taskRequest.getPriority());
        task.setDueDate(taskRequest.getDueDate());
        task.setProject(project);
        task.setCreatedBy(currentUser);
        task.setStatus(Task.TaskStatus.TODO);

        if (taskRequest.getAssigneeId() != null) {
            User assignee = userRepository.findById(taskRequest.getAssigneeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Assignee not found"));

            // Vérifier que l'assigné a accès au projet
            if (!project.getOwner().equals(assignee) && !project.getMembers().contains(assignee)) {
                throw new BadRequestException("Assignee must be a member of the project");
            }

            task.setAssignee(assignee);
        }

        Task savedTask = taskRepository.save(task);
        return mapToTaskResponse(savedTask);
    }

    @Transactional
    public TaskResponse updateTask(Long id, TaskRequest taskRequest) {
        User currentUser = getCurrentUser();
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        checkProjectAccess(task.getProject(), currentUser);

        task.setTitle(taskRequest.getTitle());
        task.setDescription(taskRequest.getDescription());
        task.setStatus(taskRequest.getStatus());
        task.setPriority(taskRequest.getPriority());
        task.setDueDate(taskRequest.getDueDate());

        if (taskRequest.getAssigneeId() != null) {
            User assignee = userRepository.findById(taskRequest.getAssigneeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Assignee not found"));

            // Vérifier que l'assigné a accès au projet
            if (!task.getProject().getOwner().equals(assignee) &&
                    !task.getProject().getMembers().contains(assignee)) {
                throw new BadRequestException("Assignee must be a member of the project");
            }

            task.setAssignee(assignee);
        } else {
            task.setAssignee(null);
        }

        Task updatedTask = taskRepository.save(task);
        return mapToTaskResponse(updatedTask);
    }

    @Transactional
    public void deleteTask(Long id) {
        User currentUser = getCurrentUser();
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        checkProjectAccess(task.getProject(), currentUser);

        // Seul le créateur de la tâche, le propriétaire du projet ou un admin peut supprimer
        boolean canDelete = task.getCreatedBy().equals(currentUser) ||
                task.getProject().getOwner().equals(currentUser) ||
                currentUser.getRole() == User.UserRole.ADMIN;

        if (!canDelete) {
            throw new AccessDeniedException("You don't have permission to delete this task");
        }

        taskRepository.delete(task);
    }

    public List<TaskResponse> getMyTasks() {
        User currentUser = getCurrentUser();
        List<Task> tasks = taskRepository.findByAssignee(currentUser);

        return tasks.stream()
                .map(this::mapToTaskResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public TaskResponse updateTaskStatus(Long id, Task.TaskStatus status) {
        User currentUser = getCurrentUser();
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        checkProjectAccess(task.getProject(), currentUser);

        task.setStatus(status);
        Task updatedTask = taskRepository.save(task);
        return mapToTaskResponse(updatedTask);
    }

    @Transactional
    public TaskResponse patchTask(Long id, TaskUpdateRequest request) {
        User currentUser = getCurrentUser();
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        checkProjectAccess(task.getProject(), currentUser);

        // Mettre à jour uniquement les champs non null
        if (request.getTitle() != null) {
            task.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            task.setDescription(request.getDescription());
        }
        if (request.getStatus() != null) {
            task.setStatus(request.getStatus());
        }
        if (request.getPriority() != null) {
            task.setPriority(request.getPriority());
        }
        if (request.getDueDate() != null) {
            task.setDueDate(request.getDueDate());
        }
        if (request.getAssigneeId() != null) {
            User assignee = userRepository.findById(request.getAssigneeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Assignee not found"));

            // Vérifier que l'assigné a accès au projet
            if (!task.getProject().getOwner().equals(assignee) &&
                    !task.getProject().getMembers().contains(assignee)) {
                throw new BadRequestException("Assignee must be a member of the project");
            }
            task.setAssignee(assignee);
        }

        Task updatedTask = taskRepository.save(task);
        return mapToTaskResponse(updatedTask);
    }

    private TaskResponse mapToTaskResponse(Task task) {
        return TaskResponse.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .status(task.getStatus())
                .priority(task.getPriority())
                .dueDate(task.getDueDate())
                .project(TaskResponse.ProjectSummary.builder()
                        .id(task.getProject().getId())
                        .name(task.getProject().getName())
                        .build())
                .assignee(task.getAssignee() != null ? mapToUserSummary(task.getAssignee()) : null)
                .createdBy(mapToUserSummary(task.getCreatedBy()))
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .build();
    }

    private TaskResponse.UserSummary mapToUserSummary(User user) {
        return TaskResponse.UserSummary.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .build();
    }
}