package com.wendev.wentask.config;

import com.wendev.wentask.entity.*;
import com.wendev.wentask.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Set;

@Configuration
public class DataInitializer {

    @Bean
    @Transactional  // ✅ Ajout de @Transactional pour garder la session Hibernate ouverte
    CommandLineRunner initDatabase(
            UserRepository userRepository,
            ProjectRepository projectRepository,
            TaskRepository taskRepository,
            CommentRepository commentRepository,
            PasswordEncoder passwordEncoder) {
        return args -> {

            // ================================================
            // ADMIN
            // ================================================
            if (userRepository.findByUsername("admin").isEmpty()) {
                User admin = new User();
                admin.setUsername("admin");
                admin.setEmail("admin@wentask.com");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setFirstName("Admin");
                admin.setLastName("System");
                admin.setRole(User.UserRole.ADMIN);
                userRepository.save(admin);
                System.out.println("✅ Admin créé : admin / admin123");
            } else {
                System.out.println("✅ Admin déjà présent");
            }

            // ================================================
            // 2 PROJECT MANAGERS
            // ================================================
            User pm1 = createIfNotExists(userRepository, passwordEncoder,
                    "amadou", "amadou.coulibaly@wentask.ml", "pass123",
                    "Amadou", "Coulibaly", User.UserRole.PROJECT_MANAGER);

            User pm2 = createIfNotExists(userRepository, passwordEncoder,
                    "aminata", "aminata.keita@wentask.ml", "pass123",
                    "Aminata", "Keita", User.UserRole.PROJECT_MANAGER);

            // ================================================
            // 5 MEMBRES
            // ================================================
            User m1 = createIfNotExists(userRepository, passwordEncoder,
                    "mariam", "mariam.sacko@wentask.ml", "pass123",
                    "Mariam", "Sacko", User.UserRole.MEMBER);

            User m2 = createIfNotExists(userRepository, passwordEncoder,
                    "ousmane", "ousmane.diarra@wentask.ml", "pass123",
                    "Ousmane", "Diarra", User.UserRole.MEMBER);

            User m3 = createIfNotExists(userRepository, passwordEncoder,
                    "aissata", "aissata.maiga@wentask.ml", "pass123",
                    "Aïssata", "Maïga", User.UserRole.MEMBER);

            User m4 = createIfNotExists(userRepository, passwordEncoder,
                    "ibrahim", "ibrahim.sangare@wentask.ml", "pass123",
                    "Ibrahim", "Sangaré", User.UserRole.MEMBER);

            User m5 = createIfNotExists(userRepository, passwordEncoder,
                    "kadidia", "kadidia.doumbia@wentask.ml", "pass123",
                    "Kadidia", "Doumbia", User.UserRole.MEMBER);

            // Flush pour synchroniser avec la base avant de créer les projets
            userRepository.flush();

            // ================================================
            // 4 PROJETS
            // ================================================
            Project p1 = createProjectIfNotExists(projectRepository,
                    "Refonte Site Web ONG Malienne",
                    "Refonte complète du site web de l'ONG 'Aide et Développement Mali' avec intégration de dons en ligne Orange Money et Moov Money.",
                    Project.ProjectStatus.ACTIVE, pm1);

            Project p2 = createProjectIfNotExists(projectRepository,
                    "App Mobile Santé Maternelle",
                    "Développement d'une application mobile de suivi de grossesse pour les centres de santé ruraux du Mali.",
                    Project.ProjectStatus.ACTIVE, pm2);

            Project p3 = createProjectIfNotExists(projectRepository,
                    "SIGA - Système de Gestion Agricole",
                    "Plateforme de gestion des coopératives agricoles de la région de Sikasso : suivi des récoltes, stocks et membres.",
                    Project.ProjectStatus.ACTIVE, pm1);

            Project p4 = createProjectIfNotExists(projectRepository,
                    "Migration Infrastructure Cloud Université",
                    "Migration des serveurs on-premise vers le cloud pour l'Université de Bamako avec Kubernetes.",
                    Project.ProjectStatus.ACTIVE, pm2);

            projectRepository.flush();

            // ================================================
            // AJOUT DES MEMBRES AUX PROJETS
            // ================================================
            addMembersToProject(projectRepository, p1, pm1, Set.of(m1, m2, m3));
            addMembersToProject(projectRepository, p2, pm2, Set.of(m1, m4, m5));
            addMembersToProject(projectRepository, p3, pm1, Set.of(m2, m4, m5));
            addMembersToProject(projectRepository, p4, pm2, Set.of(m3, m4, m5));

            // ================================================
            // TÂCHES - Projet 1 : Refonte Site Web (7 tâches)
            // ================================================
            createTaskIfNotExists(taskRepository, "Maquette page d'accueil",
                    "Créer la maquette Figma de la nouvelle page d'accueil avec les sections : mission, projets, dons.",
                    Task.TaskStatus.DONE, Task.TaskPriority.HIGH, p1, m1, pm1, LocalDate.now().minusDays(20));

            createTaskIfNotExists(taskRepository, "Développement Header/Footer",
                    "Intégration du header et footer responsive avec Tailwind CSS.",
                    Task.TaskStatus.DONE, Task.TaskPriority.MEDIUM, p1, m2, pm1, LocalDate.now().minusDays(15));

            createTaskIfNotExists(taskRepository, "Module de dons en ligne",
                    "Intégration des API Orange Money et Moov Money pour les dons en ligne.",
                    Task.TaskStatus.IN_PROGRESS, Task.TaskPriority.URGENT, p1, m3, pm1, LocalDate.now().plusDays(10));

            createTaskIfNotExists(taskRepository, "Page Nos Projets",
                    "Développer la page listant tous les projets de l'ONG avec filtres par catégorie.",
                    Task.TaskStatus.IN_PROGRESS, Task.TaskPriority.MEDIUM, p1, m1, pm1, LocalDate.now().plusDays(15));

            createTaskIfNotExists(taskRepository, "Blog et actualités",
                    "Créer le module de blog avec gestion des articles, catégories et commentaires.",
                    Task.TaskStatus.TODO, Task.TaskPriority.LOW, p1, m2, pm1, LocalDate.now().plusDays(25));

            createTaskIfNotExists(taskRepository, "Formulaire de contact",
                    "Développer le formulaire de contact avec validation et envoi d'email automatique.",
                    Task.TaskStatus.TODO, Task.TaskPriority.MEDIUM, p1, m3, pm1, LocalDate.now().plusDays(7));

            createTaskIfNotExists(taskRepository, "Tests et recette",
                    "Phase de tests fonctionnels, corrections de bugs et validation client.",
                    Task.TaskStatus.TODO, Task.TaskPriority.HIGH, p1, null, pm1, LocalDate.now().plusDays(30));

            // ================================================
            // TÂCHES - Projet 2 : App Mobile Santé (6 tâches)
            // ================================================
            createTaskIfNotExists(taskRepository, "Analyse des besoins",
                    "Rencontres avec les sages-femmes et médecins pour définir les fonctionnalités essentielles.",
                    Task.TaskStatus.DONE, Task.TaskPriority.HIGH, p2, m4, pm2, LocalDate.now().minusDays(40));

            createTaskIfNotExists(taskRepository, "Architecture Flutter",
                    "Définition de l'architecture Flutter, choix des packages et state management.",
                    Task.TaskStatus.DONE, Task.TaskPriority.HIGH, p2, m5, pm2, LocalDate.now().minusDays(30));

            createTaskIfNotExists(taskRepository, "Module Suivi de grossesse",
                    "Développement du calendrier de suivi avec rappels de rendez-vous et conseils hebdomadaires.",
                    Task.TaskStatus.IN_PROGRESS, Task.TaskPriority.URGENT, p2, m1, pm2, LocalDate.now().plusDays(5));

            createTaskIfNotExists(taskRepository, "Base de données nutritionnelle",
                    "Création de la base de données de conseils nutritionnels adaptés à chaque trimestre.",
                    Task.TaskStatus.IN_PROGRESS, Task.TaskPriority.MEDIUM, p2, m4, pm2, LocalDate.now().plusDays(15));

            createTaskIfNotExists(taskRepository, "Notifications Firebase",
                    "Configuration des notifications push pour rappels de rendez-vous et conseils.",
                    Task.TaskStatus.TODO, Task.TaskPriority.MEDIUM, p2, m5, pm2, LocalDate.now().plusDays(20));

            createTaskIfNotExists(taskRepository, "Mode hors ligne",
                    "Synchronisation des données pour fonctionnement sans connexion internet.",
                    Task.TaskStatus.TODO, Task.TaskPriority.LOW, p2, null, pm2, LocalDate.now().plusDays(30));

            // ================================================
            // TÂCHES - Projet 3 : SIGA (5 tâches)
            // ================================================
            createTaskIfNotExists(taskRepository, "Modélisation base de données",
                    "Création du schéma PostgreSQL pour les coopératives, membres, récoltes et stocks.",
                    Task.TaskStatus.DONE, Task.TaskPriority.HIGH, p3, m2, pm1, LocalDate.now().minusDays(15));

            createTaskIfNotExists(taskRepository, "Module gestion des membres",
                    "CRUD des membres avec rôles (président, trésorier, membre simple).",
                    Task.TaskStatus.IN_PROGRESS, Task.TaskPriority.HIGH, p3, m4, pm1, LocalDate.now().plusDays(5));

            createTaskIfNotExists(taskRepository, "Module suivi des récoltes",
                    "Enregistrement et suivi des récoltes par parcelle avec historique.",
                    Task.TaskStatus.IN_PROGRESS, Task.TaskPriority.MEDIUM, p3, m5, pm1, LocalDate.now().plusDays(10));

            createTaskIfNotExists(taskRepository, "Tableau de bord statistiques",
                    "Graphiques et indicateurs de production, rendements et revenus.",
                    Task.TaskStatus.TODO, Task.TaskPriority.MEDIUM, p3, m2, pm1, LocalDate.now().plusDays(20));

            createTaskIfNotExists(taskRepository, "Export PDF et Excel",
                    "Génération de rapports exportables en PDF et Excel.",
                    Task.TaskStatus.TODO, Task.TaskPriority.LOW, p3, null, pm1, LocalDate.now().plusDays(35));

            // ================================================
            // TÂCHES - Projet 4 : Migration Cloud (5 tâches)
            // ================================================
            createTaskIfNotExists(taskRepository, "Audit infrastructure existante",
                    "Inventaire complet des serveurs, applications et dépendances.",
                    Task.TaskStatus.DONE, Task.TaskPriority.HIGH, p4, m3, pm2, LocalDate.now().minusDays(25));

            createTaskIfNotExists(taskRepository, "Plan de migration",
                    "Élaboration du plan détaillé de migration par phases avec rollback.",
                    Task.TaskStatus.DONE, Task.TaskPriority.URGENT, p4, m4, pm2, LocalDate.now().minusDays(10));

            createTaskIfNotExists(taskRepository, "Migration bases de données",
                    "Migration PostgreSQL et MySQL vers instances cloud managées.",
                    Task.TaskStatus.IN_PROGRESS, Task.TaskPriority.URGENT, p4, m5, pm2, LocalDate.now().plusDays(3));

            createTaskIfNotExists(taskRepository, "Déploiement Kubernetes",
                    "Déploiement des applications conteneurisées sur cluster Kubernetes.",
                    Task.TaskStatus.TODO, Task.TaskPriority.HIGH, p4, m3, pm2, LocalDate.now().plusDays(15));

            createTaskIfNotExists(taskRepository, "Tests post-migration",
                    "Validation du bon fonctionnement de tous les services migrés.",
                    Task.TaskStatus.TODO, Task.TaskPriority.MEDIUM, p4, null, pm2, LocalDate.now().plusDays(25));

            System.out.println("============================================");
            System.out.println("✅ Données initiales chargées avec succès !");
            System.out.println("   - 1 Admin : admin / admin123");
            System.out.println("   - 2 Project Managers : amadou, aminata");
            System.out.println("   - 5 Membres : mariam, ousmane, aissata, ibrahim, kadidia");
            System.out.println("   - 4 Projets avec tâches");
            System.out.println("   - Mot de passe pour tous : pass123");
            System.out.println("============================================");
        };
    }

    private User createIfNotExists(UserRepository userRepository, PasswordEncoder encoder,
                                    String username, String email, String password,
                                    String firstName, String lastName, User.UserRole role) {
        return userRepository.findByUsername(username).orElseGet(() -> {
            User user = new User();
            user.setUsername(username);
            user.setEmail(email);
            user.setPassword(encoder.encode(password));
            user.setFirstName(firstName);
            user.setLastName(lastName);
            user.setRole(role);
            return userRepository.save(user);
        });
    }

    private Project createProjectIfNotExists(ProjectRepository projectRepository,
                                              String name, String description,
                                              Project.ProjectStatus status, User owner) {
        return projectRepository.findAll().stream()
                .filter(p -> p.getName().equals(name))
                .findFirst()
                .orElseGet(() -> {
                    Project project = new Project();
                    project.setName(name);
                    project.setDescription(description);
                    project.setStatus(status);
                    project.setOwner(owner);
                    return projectRepository.save(project);
                });
    }

    private void addMembersToProject(ProjectRepository projectRepository, Project project,
                                      User owner, Set<User> membersToAdd) {
        // ✅ Recharger le projet avec les membres initialisés
        Project refreshedProject = projectRepository.findById(project.getId())
                .orElse(project);
        
        membersToAdd.forEach(member -> {
            if (!member.equals(owner)) {
                refreshedProject.getMembers().add(member);
            }
        });
        projectRepository.save(refreshedProject);
    }
}