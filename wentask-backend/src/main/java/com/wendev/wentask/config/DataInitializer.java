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

    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, ProjectRepository projectRepository,
                           TaskRepository taskRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.projectRepository = projectRepository;
        this.taskRepository = taskRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Bean
    CommandLineRunner initDatabase() {
        return args -> {
            System.out.println("=== Début initialisation des données ===");
            initUsers();
            initProjectsAndTasks();
            System.out.println("=== Fin initialisation des données ===");
        };
    }

    @Transactional
    public void initUsers() {
        // Admin
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

        // Project Managers
        createUserIfNotExists("amadou", "amadou.coulibaly@wentask.ml", "pass123",
                "Amadou", "Coulibaly", User.UserRole.PROJECT_MANAGER);
        createUserIfNotExists("aminata", "aminata.keita@wentask.ml", "pass123",
                "Aminata", "Keita", User.UserRole.PROJECT_MANAGER);

        // Membres
        createUserIfNotExists("mariam", "mariam.sacko@wentask.ml", "pass123",
                "Mariam", "Sacko", User.UserRole.MEMBER);
        createUserIfNotExists("ousmane", "ousmane.diarra@wentask.ml", "pass123",
                "Ousmane", "Diarra", User.UserRole.MEMBER);
        createUserIfNotExists("aissata", "aissata.maiga@wentask.ml", "pass123",
                "Aïssata", "Maïga", User.UserRole.MEMBER);
        createUserIfNotExists("ibrahim", "ibrahim.sangare@wentask.ml", "pass123",
                "Ibrahim", "Sangaré", User.UserRole.MEMBER);
        createUserIfNotExists("kadidia", "kadidia.doumbia@wentask.ml", "pass123",
                "Kadidia", "Doumbia", User.UserRole.MEMBER);

        userRepository.flush();
        System.out.println("✅ 7 utilisateurs créés");
    }

    @Transactional
    public void initProjectsAndTasks() {
        // Récupérer les utilisateurs
        User pm1 = userRepository.findByUsername("amadou").orElseThrow();
        User pm2 = userRepository.findByUsername("aminata").orElseThrow();
        User m1 = userRepository.findByUsername("mariam").orElseThrow();
        User m2 = userRepository.findByUsername("ousmane").orElseThrow();
        User m3 = userRepository.findByUsername("aissata").orElseThrow();
        User m4 = userRepository.findByUsername("ibrahim").orElseThrow();
        User m5 = userRepository.findByUsername("kadidia").orElseThrow();

        // Projets
        Project p1 = createProject("Refonte Site Web ONG Malienne",
                "Refonte complète du site web de l'ONG avec intégration de dons en ligne.",
                Project.ProjectStatus.ACTIVE, pm1, Set.of(m1, m2, m3));

        Project p2 = createProject("App Mobile Santé Maternelle",
                "Développement d'une application mobile de suivi de grossesse.",
                Project.ProjectStatus.ACTIVE, pm2, Set.of(m1, m4, m5));

        Project p3 = createProject("SIGA - Système de Gestion Agricole",
                "Plateforme de gestion des coopératives agricoles de Sikasso.",
                Project.ProjectStatus.ACTIVE, pm1, Set.of(m2, m4, m5));

        Project p4 = createProject("Migration Infrastructure Cloud Université",
                "Migration des serveurs on-premise vers le cloud pour l'Université de Bamako.",
                Project.ProjectStatus.ACTIVE, pm2, Set.of(m3, m4, m5));

        projectRepository.flush();

        // Tâches Projet 1
        createTask("Maquette page d'accueil", "Créer la maquette Figma.", Task.TaskStatus.DONE, Task.TaskPriority.HIGH, p1, m1, pm1, LocalDate.now().minusDays(20));
        createTask("Développement Header/Footer", "Intégration responsive avec Tailwind CSS.", Task.TaskStatus.DONE, Task.TaskPriority.MEDIUM, p1, m2, pm1, LocalDate.now().minusDays(15));
        createTask("Module de dons en ligne", "Intégration Orange Money et Moov Money.", Task.TaskStatus.IN_PROGRESS, Task.TaskPriority.URGENT, p1, m3, pm1, LocalDate.now().plusDays(10));
        createTask("Page Nos Projets", "Page listant tous les projets de l'ONG.", Task.TaskStatus.IN_PROGRESS, Task.TaskPriority.MEDIUM, p1, m1, pm1, LocalDate.now().plusDays(15));
        createTask("Blog et actualités", "Module de blog avec gestion des articles.", Task.TaskStatus.TODO, Task.TaskPriority.LOW, p1, m2, pm1, LocalDate.now().plusDays(25));
        createTask("Formulaire de contact", "Formulaire avec validation et email.", Task.TaskStatus.TODO, Task.TaskPriority.MEDIUM, p1, m3, pm1, LocalDate.now().plusDays(7));
        createTask("Tests et recette", "Tests fonctionnels et corrections.", Task.TaskStatus.TODO, Task.TaskPriority.HIGH, p1, null, pm1, LocalDate.now().plusDays(30));

        // Tâches Projet 2
        createTask("Analyse des besoins", "Rencontres avec sages-femmes.", Task.TaskStatus.DONE, Task.TaskPriority.HIGH, p2, m4, pm2, LocalDate.now().minusDays(40));
        createTask("Architecture Flutter", "Définition architecture et packages.", Task.TaskStatus.DONE, Task.TaskPriority.HIGH, p2, m5, pm2, LocalDate.now().minusDays(30));
        createTask("Module Suivi de grossesse", "Calendrier de suivi avec rappels.", Task.TaskStatus.IN_PROGRESS, Task.TaskPriority.URGENT, p2, m1, pm2, LocalDate.now().plusDays(5));
        createTask("Base de données nutritionnelle", "Conseils nutritionnels par trimestre.", Task.TaskStatus.IN_PROGRESS, Task.TaskPriority.MEDIUM, p2, m4, pm2, LocalDate.now().plusDays(15));
        createTask("Notifications Firebase", "Configuration notifications push.", Task.TaskStatus.TODO, Task.TaskPriority.MEDIUM, p2, m5, pm2, LocalDate.now().plusDays(20));
        createTask("Mode hors ligne", "Synchronisation sans connexion.", Task.TaskStatus.TODO, Task.TaskPriority.LOW, p2, null, pm2, LocalDate.now().plusDays(30));

        // Tâches Projet 3
        createTask("Modélisation base de données", "Schéma PostgreSQL coopératives.", Task.TaskStatus.DONE, Task.TaskPriority.HIGH, p3, m2, pm1, LocalDate.now().minusDays(15));
        createTask("Module gestion des membres", "CRUD membres avec rôles.", Task.TaskStatus.IN_PROGRESS, Task.TaskPriority.HIGH, p3, m4, pm1, LocalDate.now().plusDays(5));
        createTask("Module suivi des récoltes", "Enregistrement et suivi récoltes.", Task.TaskStatus.IN_PROGRESS, Task.TaskPriority.MEDIUM, p3, m5, pm1, LocalDate.now().plusDays(10));
        createTask("Tableau de bord statistiques", "Graphiques et indicateurs.", Task.TaskStatus.TODO, Task.TaskPriority.MEDIUM, p3, m2, pm1, LocalDate.now().plusDays(20));
        createTask("Export PDF et Excel", "Génération rapports exportables.", Task.TaskStatus.TODO, Task.TaskPriority.LOW, p3, null, pm1, LocalDate.now().plusDays(35));

        // Tâches Projet 4
        createTask("Audit infrastructure existante", "Inventaire serveurs et applications.", Task.TaskStatus.DONE, Task.TaskPriority.HIGH, p4, m3, pm2, LocalDate.now().minusDays(25));
        createTask("Plan de migration", "Plan détaillé par phases.", Task.TaskStatus.DONE, Task.TaskPriority.URGENT, p4, m4, pm2, LocalDate.now().minusDays(10));
        createTask("Migration bases de données", "Migration PostgreSQL et MySQL.", Task.TaskStatus.IN_PROGRESS, Task.TaskPriority.URGENT, p4, m5, pm2, LocalDate.now().plusDays(3));
        createTask("Déploiement Kubernetes", "Déploiement applications conteneurisées.", Task.TaskStatus.TODO, Task.TaskPriority.HIGH, p4, m3, pm2, LocalDate.now().plusDays(15));
        createTask("Tests post-migration", "Validation bon fonctionnement.", Task.TaskStatus.TODO, Task.TaskPriority.MEDIUM, p4, null, pm2, LocalDate.now().plusDays(25));

        System.out.println("============================================");
        System.out.println("✅ Données initiales chargées avec succès !");
        System.out.println("   - 1 Admin : admin / admin123");
        System.out.println("   - 2 PMs : amadou, aminata / pass123");
        System.out.println("   - 5 Membres : mariam, ousmane, aissata, ibrahim, kadidia / pass123");
        System.out.println("   - 4 Projets avec 23 tâches");
        System.out.println("============================================");
    }

    private void createUserIfNotExists(String username, String email, String password,
                                        String firstName, String lastName, User.UserRole role) {
        if (userRepository.findByUsername(username).isEmpty()) {
            User user = new User();
            user.setUsername(username);
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode(password));
            user.setFirstName(firstName);
            user.setLastName(lastName);
            user.setRole(role);
            userRepository.save(user);
        }
    }

    private Project createProject(String name, String description,
                                   Project.ProjectStatus status, User owner, Set<User> members) {
        Project project = new Project();
        project.setName(name);
        project.setDescription(description);
        project.setStatus(status);
        project.setOwner(owner);
        project.getMembers().addAll(members);
        return projectRepository.save(project);
    }

    private void createTask(String title, String description,
                             Task.TaskStatus status, Task.TaskPriority priority,
                             Project project, User assignee, User createdBy, LocalDate dueDate) {
        Task task = new Task();
        task.setTitle(title);
        task.setDescription(description);
        task.setStatus(status);
        task.setPriority(priority);
        task.setProject(project);
        task.setAssignee(assignee);
        task.setCreatedBy(createdBy);
        task.setDueDate(dueDate);
        taskRepository.save(task);
    }
}