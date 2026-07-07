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
    @Transactional
    CommandLineRunner initDatabase(
            UserRepository userRepository,
            ProjectRepository projectRepository,
            TaskRepository taskRepository,
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
            User pm1 = createUserIfNotExists(userRepository, passwordEncoder,
                    "amadou", "amadou.coulibaly@wentask.ml", "pass123",
                    "Amadou", "Coulibaly", User.UserRole.PROJECT_MANAGER);

            User pm2 = createUserIfNotExists(userRepository, passwordEncoder,
                    "aminata", "aminata.keita@wentask.ml", "pass123",
                    "Aminata", "Keita", User.UserRole.PROJECT_MANAGER);

            // ================================================
            // 5 MEMBRES
            // ================================================
            User m1 = createUserIfNotExists(userRepository, passwordEncoder,
                    "mariam", "mariam.sacko@wentask.ml", "pass123",
                    "Mariam", "Sacko", User.UserRole.MEMBER);

            User m2 = createUserIfNotExists(userRepository, passwordEncoder,
                    "ousmane", "ousmane.diarra@wentask.ml", "pass123",
                    "Ousmane", "Diarra", User.UserRole.MEMBER);

            User m3 = createUserIfNotExists(userRepository, passwordEncoder,
                    "aissata", "aissata.maiga@wentask.ml", "pass123",
                    "Aïssata", "Maïga", User.UserRole.MEMBER);

            User m4 = createUserIfNotExists(userRepository, passwordEncoder,
                    "ibrahim", "ibrahim.sangare@wentask.ml", "pass123",
                    "Ibrahim", "Sangaré", User.UserRole.MEMBER);

            User m5 = createUserIfNotExists(userRepository, passwordEncoder,
                    "kadidia", "kadidia.doumbia@wentask.ml", "pass123",
                    "Kadidia", "Doumbia", User.UserRole.MEMBER);

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
            addMembers(projectRepository, p1.getId(), Set.of(m1, m2, m3));
            addMembers(projectRepository, p2.getId(), Set.of(m1, m4, m5));
            addMembers(projectRepository, p3.getId(), Set.of(m2, m4, m5));
            addMembers(projectRepository, p4.getId(), Set.of(m3, m4, m5));

            // ================================================
            // TÂCHES - Projet 1 (7 tâches)
            // ================================================
            addTask(taskRepository, "Maquette page d'accueil", "Créer la maquette Figma de la nouvelle page d'accueil.", Task.TaskStatus.DONE, Task.TaskPriority.HIGH, p1, m1, pm1, LocalDate.now().minusDays(20));
            addTask(taskRepository, "Développement Header/Footer", "Intégration du header et footer responsive avec Tailwind CSS.", Task.TaskStatus.DONE, Task.TaskPriority.MEDIUM, p1, m2, pm1, LocalDate.now().minusDays(15));
            addTask(taskRepository, "Module de dons en ligne", "Intégration des API Orange Money et Moov Money.", Task.TaskStatus.IN_PROGRESS, Task.TaskPriority.URGENT, p1, m3, pm1, LocalDate.now().plusDays(10));
            addTask(taskRepository, "Page Nos Projets", "Développer la page listant tous les projets de l'ONG.", Task.TaskStatus.IN_PROGRESS, Task.TaskPriority.MEDIUM, p1, m1, pm1, LocalDate.now().plusDays(15));
            addTask(taskRepository, "Blog et actualités", "Créer le module de blog avec gestion des articles.", Task.TaskStatus.TODO, Task.TaskPriority.LOW, p1, m2, pm1, LocalDate.now().plusDays(25));
            addTask(taskRepository, "Formulaire de contact", "Développer le formulaire de contact avec validation.", Task.TaskStatus.TODO, Task.TaskPriority.MEDIUM, p1, m3, pm1, LocalDate.now().plusDays(7));
            addTask(taskRepository, "Tests et recette", "Phase de tests fonctionnels et corrections de bugs.", Task.TaskStatus.TODO, Task.TaskPriority.HIGH, p1, null, pm1, LocalDate.now().plusDays(30));

            // ================================================
            // TÂCHES - Projet 2 (6 tâches)
            // ================================================
            addTask(taskRepository, "Analyse des besoins", "Rencontres avec les sages-femmes et médecins.", Task.TaskStatus.DONE, Task.TaskPriority.HIGH, p2, m4, pm2, LocalDate.now().minusDays(40));
            addTask(taskRepository, "Architecture Flutter", "Définition de l'architecture Flutter et state management.", Task.TaskStatus.DONE, Task.TaskPriority.HIGH, p2, m5, pm2, LocalDate.now().minusDays(30));
            addTask(taskRepository, "Module Suivi de grossesse", "Développement du calendrier de suivi avec rappels.", Task.TaskStatus.IN_PROGRESS, Task.TaskPriority.URGENT, p2, m1, pm2, LocalDate.now().plusDays(5));
            addTask(taskRepository, "Base de données nutritionnelle", "Conseils nutritionnels adaptés à chaque trimestre.", Task.TaskStatus.IN_PROGRESS, Task.TaskPriority.MEDIUM, p2, m4, pm2, LocalDate.now().plusDays(15));
            addTask(taskRepository, "Notifications Firebase", "Configuration des notifications push.", Task.TaskStatus.TODO, Task.TaskPriority.MEDIUM, p2, m5, pm2, LocalDate.now().plusDays(20));
            addTask(taskRepository, "Mode hors ligne", "Synchronisation des données sans connexion.", Task.TaskStatus.TODO, Task.TaskPriority.LOW, p2, null, pm2, LocalDate.now().plusDays(30));

            // ================================================
            // TÂCHES - Projet 3 (5 tâches)
            // ================================================
            addTask(taskRepository, "Modélisation base de données", "Schéma PostgreSQL pour les coopératives.", Task.TaskStatus.DONE, Task.TaskPriority.HIGH, p3, m2, pm1, LocalDate.now().minusDays(15));
            addTask(taskRepository, "Module gestion des membres", "CRUD des membres avec rôles.", Task.TaskStatus.IN_PROGRESS, Task.TaskPriority.HIGH, p3, m4, pm1, LocalDate.now().plusDays(5));
            addTask(taskRepository, "Module suivi des récoltes", "Enregistrement et suivi des récoltes.", Task.TaskStatus.IN_PROGRESS, Task.TaskPriority.MEDIUM, p3, m5, pm1, LocalDate.now().plusDays(10));
            addTask(taskRepository, "Tableau de bord statistiques", "Graphiques et indicateurs de production.", Task.TaskStatus.TODO, Task.TaskPriority.MEDIUM, p3, m2, pm1, LocalDate.now().plusDays(20));
            addTask(taskRepository, "Export PDF et Excel", "Génération de rapports exportables.", Task.TaskStatus.TODO, Task.TaskPriority.LOW, p3, null, pm1, LocalDate.now().plusDays(35));

            // ================================================
            // TÂCHES - Projet 4 (5 tâches)
            // ================================================
            addTask(taskRepository, "Audit infrastructure existante", "Inventaire des serveurs et applications.", Task.TaskStatus.DONE, Task.TaskPriority.HIGH, p4, m3, pm2, LocalDate.now().minusDays(25));
            addTask(taskRepository, "Plan de migration", "Plan détaillé de migration par phases.", Task.TaskStatus.DONE, Task.TaskPriority.URGENT, p4, m4, pm2, LocalDate.now().minusDays(10));
            addTask(taskRepository, "Migration bases de données", "Migration PostgreSQL et MySQL vers cloud.", Task.TaskStatus.IN_PROGRESS, Task.TaskPriority.URGENT, p4, m5, pm2, LocalDate.now().plusDays(3));
            addTask(taskRepository, "Déploiement Kubernetes", "Déploiement des applications conteneurisées.", Task.TaskStatus.TODO, Task.TaskPriority.HIGH, p4, m3, pm2, LocalDate.now().plusDays(15));
            addTask(taskRepository, "Tests post-migration", "Validation du bon fonctionnement.", Task.TaskStatus.TODO, Task.TaskPriority.MEDIUM, p4, null, pm2, LocalDate.now().plusDays(25));

            System.out.println("============================================");
            System.out.println("✅ Données initiales chargées avec succès !");
            System.out.println("   - 1 Admin : admin / admin123");
            System.out.println("   - 2 Project Managers : amadou, aminata");
            System.out.println("   - 5 Membres : mariam, ousmane, aissata, ibrahim, kadidia");
            System.out.println("   - 4 Projets avec 23 tâches");
            System.out.println("   - Mot de passe : pass123 (sauf admin: admin123)");
            System.out.println("============================================");
        };
    }

    // ================================================
    // MÉTHODES UTILITAIRES
    // ================================================

    private User createUserIfNotExists(UserRepository repo, PasswordEncoder encoder,
                                        String username, String email, String password,
                                        String firstName, String lastName, User.UserRole role) {
        return repo.findByUsername(username).orElseGet(() -> {
            User user = new User();
            user.setUsername(username);
            user.setEmail(email);
            user.setPassword(encoder.encode(password));
            user.setFirstName(firstName);
            user.setLastName(lastName);
            user.setRole(role);
            return repo.save(user);
        });
    }

    private Project createProjectIfNotExists(ProjectRepository repo,
                                              String name, String description,
                                              Project.ProjectStatus status, User owner) {
        return repo.findAll().stream()
                .filter(p -> p.getName().equals(name))
                .findFirst()
                .orElseGet(() -> {
                    Project project = new Project();
                    project.setName(name);
                    project.setDescription(description);
                    project.setStatus(status);
                    project.setOwner(owner);
                    return repo.save(project);
                });
    }

    private void addMembers(ProjectRepository repo, Long projectId, Set<User> members) {
        Project project = repo.findById(projectId).orElse(null);
        if (project != null) {
            members.forEach(member -> project.getMembers().add(member));
            repo.save(project);
        }
    }

    private void addTask(TaskRepository repo, String title, String description,
                          Task.TaskStatus status, Task.TaskPriority priority,
                          Project project, User assignee, User createdBy, LocalDate dueDate) {
        boolean exists = repo.findByProject(project).stream()
                .anyMatch(t -> t.getTitle().equals(title));
        if (!exists) {
            Task task = new Task();
            task.setTitle(title);
            task.setDescription(description);
            task.setStatus(status);
            task.setPriority(priority);
            task.setProject(project);
            task.setAssignee(assignee);
            task.setCreatedBy(createdBy);
            task.setDueDate(dueDate);
            repo.save(task);
        }
    }
}