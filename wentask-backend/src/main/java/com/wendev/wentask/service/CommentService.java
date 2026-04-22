package com.wendev.wentask.service;

import com.wendev.wentask.dto.request.CommentRequest;
import com.wendev.wentask.dto.response.CommentResponse;
import com.wendev.wentask.entity.Comment;
import com.wendev.wentask.entity.Task;
import com.wendev.wentask.entity.User;
import com.wendev.wentask.exception.AccessDeniedException;
import com.wendev.wentask.exception.ResourceNotFoundException;
import com.wendev.wentask.repository.CommentRepository;
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
public class CommentService {

    private final CommentRepository commentRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private void checkTaskAccess(Task task, User user) {
        if (!task.getProject().getOwner().equals(user) &&
                !task.getProject().getMembers().contains(user)) {
            throw new AccessDeniedException("You don't have access to this task");
        }
    }

    public List<CommentResponse> getCommentsByTask(Long taskId) {
        User currentUser = getCurrentUser();
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        checkTaskAccess(task, currentUser);

        List<Comment> comments = commentRepository.findByTaskOrderByCreatedAtDesc(task);
        return comments.stream()
                .map(this::mapToCommentResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public CommentResponse addComment(Long taskId, CommentRequest commentRequest) {
        User currentUser = getCurrentUser();
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        checkTaskAccess(task, currentUser);

        Comment comment = new Comment();
        comment.setContent(commentRequest.getContent());
        comment.setTask(task);
        comment.setAuthor(currentUser);

        Comment savedComment = commentRepository.save(comment);
        return mapToCommentResponse(savedComment);
    }

    @Transactional
    public void deleteComment(Long commentId) {
        User currentUser = getCurrentUser();
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));

        // Seul l'auteur du commentaire, le propriétaire du projet ou un admin peut supprimer
        boolean canDelete = comment.getAuthor().equals(currentUser) ||
                comment.getTask().getProject().getOwner().equals(currentUser) ||
                currentUser.getRole() == User.UserRole.ADMIN;

        if (!canDelete) {
            throw new AccessDeniedException("You don't have permission to delete this comment");
        }

        commentRepository.delete(comment);
    }

    private CommentResponse mapToCommentResponse(Comment comment) {
        return CommentResponse.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .author(CommentResponse.UserSummary.builder()
                        .id(comment.getAuthor().getId())
                        .username(comment.getAuthor().getUsername())
                        .firstName(comment.getAuthor().getFirstName())
                        .lastName(comment.getAuthor().getLastName())
                        .build())
                .createdAt(comment.getCreatedAt())
                .build();
    }
}