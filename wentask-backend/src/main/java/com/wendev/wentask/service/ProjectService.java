package com.wendev.wentask.service;

import com.wendev.wentask.dto.request.ProjectRequest;
import com.wendev.wentask.dto.response.ProjectResponse;
import com.wendev.wentask.dto.response.ProjectStatsResponse;
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
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final TaskRepository taskRepository;

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    public List<ProjectResponse> getAllProjects() {
        User currentUser = getCurrentUser();
        List<Project> projects = projectRepository.findAllUserProjects(currentUser);

        return projects.stream()
                .map(this::mapToProjectResponse)
                .collect(Collectors.toList());
    }

    public ProjectResponse getProjectById(Long id) {
        User currentUser = getCurrentUser();
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));

        // Vérifier que l'utilisateur a accès au projet
        if (!project.getOwner().equals(currentUser) && !project.getMembers().contains(currentUser)) {
            throw new AccessDeniedException("You don't have access to this project");
        }

        return mapToProjectResponse(project);
    }

    @Transactional
    public ProjectResponse createProject(ProjectRequest projectRequest) {
        User currentUser = getCurrentUser();

        Project project = new Project();
        project.setName(projectRequest.getName());
        project.setDescription(projectRequest.getDescription());
        project.setOwner(currentUser);
        project.setStatus(Project.ProjectStatus.ACTIVE);

        Project savedProject = projectRepository.save(project);
        return mapToProjectResponse(savedProject);
    }

    @Transactional
    public ProjectResponse updateProject(Long id, ProjectRequest projectRequest) {
        User currentUser = getCurrentUser();
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));

        // Vérifier que l'utilisateur est le propriétaire
        if (!project.getOwner().equals(currentUser)) {
            throw new AccessDeniedException("Only the project owner can update the project");
        }

        project.setName(projectRequest.getName());
        project.setDescription(projectRequest.getDescription());
        project.setStatus(projectRequest.getStatus());

        Project updatedProject = projectRepository.save(project);
        return mapToProjectResponse(updatedProject);
    }

    @Transactional
    public void deleteProject(Long id) {
        User currentUser = getCurrentUser();
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));

        // Vérifier que l'utilisateur est le propriétaire ou admin
        if (!project.getOwner().equals(currentUser) && currentUser.getRole() != User.UserRole.ADMIN) {
            throw new AccessDeniedException("Only the project owner or admin can delete the project");
        }

        projectRepository.delete(project);
    }

    @Transactional
    public ProjectResponse addMemberToProject(Long projectId, Long userId) {
        User currentUser = getCurrentUser();
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        // Vérifier que l'utilisateur est le propriétaire
        if (!project.getOwner().equals(currentUser)) {
            throw new AccessDeniedException("Only the project owner can add members");
        }

        User userToAdd = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        project.getMembers().add(userToAdd);
        Project updatedProject = projectRepository.save(project);
        return mapToProjectResponse(updatedProject);
    }

    @Transactional
    public ProjectResponse removeMemberFromProject(Long projectId, Long userId) {
        User currentUser = getCurrentUser();
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        // Vérifier que l'utilisateur est le propriétaire
        if (!project.getOwner().equals(currentUser)) {
            throw new AccessDeniedException("Only the project owner can remove members");
        }

        User userToRemove = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Empêcher de retirer le propriétaire
        if (project.getOwner().equals(userToRemove)) {
            throw new BadRequestException("Cannot remove the project owner");
        }

        project.getMembers().remove(userToRemove);
        Project updatedProject = projectRepository.save(project);
        return mapToProjectResponse(updatedProject);
    }

    public ProjectStatsResponse getProjectStats(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        Long totalTasks = taskRepository.countTasksByProject(project);
        Long todoTasks = taskRepository.countTasksByProjectAndStatus(project, Task.TaskStatus.TODO);
        Long inProgressTasks = taskRepository.countTasksByProjectAndStatus(project, Task.TaskStatus.IN_PROGRESS);
        Long inReviewTasks = taskRepository.countTasksByProjectAndStatus(project, Task.TaskStatus.IN_REVIEW);
        Long doneTasks = taskRepository.countTasksByProjectAndStatus(project, Task.TaskStatus.DONE);

        return ProjectStatsResponse.builder()
                .projectId(projectId)
                .projectName(project.getName())
                .totalTasks(totalTasks)
                .todoTasks(todoTasks)
                .inProgressTasks(inProgressTasks)
                .inReviewTasks(inReviewTasks)
                .doneTasks(doneTasks)
                .memberCount((long) (project.getMembers().size() + 1)) // +1 pour le owner
                .build();
    }

    private ProjectResponse mapToProjectResponse(Project project) {
        return ProjectResponse.builder()
                .id(project.getId())
                .name(project.getName())
                .description(project.getDescription())
                .status(project.getStatus())
                .owner(mapToUserSummary(project.getOwner()))
                .members(project.getMembers().stream()
                        .map(this::mapToUserSummary)
                        .collect(Collectors.toSet()))
                .createdAt(project.getCreatedAt())
                .updatedAt(project.getUpdatedAt())
                .build();
    }

    private ProjectResponse.UserSummary mapToUserSummary(User user) {
        return ProjectResponse.UserSummary.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .build();
    }
}