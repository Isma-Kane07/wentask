package com.wendev.wentask.controller;

import com.wendev.wentask.dto.request.ProjectRequest;
import com.wendev.wentask.dto.response.ProjectResponse;
import com.wendev.wentask.dto.response.ProjectStatsResponse;
import com.wendev.wentask.service.ProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @GetMapping
    public ResponseEntity<List<ProjectResponse>> getAllProjects() {
        return ResponseEntity.ok(projectService.getAllProjects());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectResponse> getProjectById(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.getProjectById(id));
    }

    @GetMapping("/{id}/stats")
    public ResponseEntity<ProjectStatsResponse> getProjectStats(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.getProjectStats(id));
    }

    // ✅ Restreindre la création aux ADMIN et PROJECT_MANAGER
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER')")
    public ResponseEntity<ProjectResponse> createProject(@Valid @RequestBody ProjectRequest projectRequest) {
        ProjectResponse createdProject = projectService.createProject(projectRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdProject);
    }

    // ✅ Restreindre la modification au propriétaire ou ADMIN
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @projectSecurity.isProjectOwner(#id)")
    public ResponseEntity<ProjectResponse> updateProject(
            @PathVariable Long id,
            @Valid @RequestBody ProjectRequest projectRequest) {
        return ResponseEntity.ok(projectService.updateProject(id, projectRequest));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @projectSecurity.isProjectOwner(#id)")
    public ResponseEntity<Void> deleteProject(@PathVariable Long id) {
        projectService.deleteProject(id);
        return ResponseEntity.noContent().build();
    }

    // ✅ Restreindre l'ajout de membres au propriétaire ou ADMIN
    @PostMapping("/{id}/members/{userId}")
    @PreAuthorize("hasRole('ADMIN') or @projectSecurity.isProjectOwner(#id)")
    public ResponseEntity<ProjectResponse> addMemberToProject(
            @PathVariable Long id,
            @PathVariable Long userId) {
        return ResponseEntity.ok(projectService.addMemberToProject(id, userId));
    }

    // ✅ Restreindre le retrait de membres au propriétaire ou ADMIN
    @DeleteMapping("/{id}/members/{userId}")
    @PreAuthorize("hasRole('ADMIN') or @projectSecurity.isProjectOwner(#id)")
    public ResponseEntity<ProjectResponse> removeMemberFromProject(
            @PathVariable Long id,
            @PathVariable Long userId) {
        return ResponseEntity.ok(projectService.removeMemberFromProject(id, userId));
    }
}