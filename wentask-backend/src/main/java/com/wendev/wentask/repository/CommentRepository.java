package com.wendev.wentask.repository;

import com.wendev.wentask.entity.Comment;
import com.wendev.wentask.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByTaskOrderByCreatedAtDesc(Task task);
}