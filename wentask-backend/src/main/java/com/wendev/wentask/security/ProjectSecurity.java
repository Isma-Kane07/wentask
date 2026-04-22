package com.wendev.wentask.security;

import com.wendev.wentask.entity.Project;
import com.wendev.wentask.entity.User;
import com.wendev.wentask.repository.ProjectRepository;
import com.wendev.wentask.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component("projectSecurity")
@RequiredArgsConstructor
public class ProjectSecurity {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public boolean isProjectOwner(Long projectId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        User currentUser = userRepository.findByUsername(username).orElse(null);
        if (currentUser == null) return false;

        Project project = projectRepository.findById(projectId).orElse(null);
        if (project == null) return false;

        return project.getOwner().equals(currentUser);
    }
}