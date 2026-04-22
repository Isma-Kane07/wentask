package com.wendev.wentask.repository;

import com.wendev.wentask.entity.Project;
import com.wendev.wentask.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByOwner(User owner);

    @Query("SELECT p FROM Project p JOIN p.members m WHERE m = :user")
    List<Project> findProjectsByMember(@Param("user") User user);

    @Query("SELECT p FROM Project p WHERE p.owner = :user OR :user MEMBER OF p.members")
    List<Project> findAllUserProjects(@Param("user") User user);
}