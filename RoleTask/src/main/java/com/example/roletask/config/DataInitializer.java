package com.example.roletask.config;

import com.example.roletask.entities.Permission;
import com.example.roletask.entities.Role;
import com.example.roletask.entities.Utilisateur;
import com.example.roletask.repos.PermissionRepository;
import com.example.roletask.repos.RoleRepository;
import com.example.roletask.repos.UtilisateurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Initialize default admin user with all permissions at application startup
 */
@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PermissionRepository permissionRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private static final String[] PERMISSION_NAMES = {
        // ROLE permissions
        "ROLE_READ", "ROLE_CREATE", "ROLE_UPDATE", "ROLE_DELETE",
        // PERMISSION permissions
        "PERMISSION_READ", "PERMISSION_CREATE", "PERMISSION_UPDATE", "PERMISSION_DELETE",
        // TACHE permissions
        "TACHE_READ", "TACHE_CREATE", "TACHE_UPDATE", "TACHE_DELETE",
        // HISTORIQUE permissions
        "HISTORIQUE_READ",
        // UTILISATEUR permissions
        "UTILISATEUR_READ", "UTILISATEUR_CREATE", "UTILISATEUR_UPDATE", "UTILISATEUR_DELETE"
    };

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        System.out.println("🔧 Initializing application data...");
        
        // Step 1: Create all permissions
        for (String permName : PERMISSION_NAMES) {
            Optional<Permission> existing = permissionRepository.findByNom(permName);
            if (!existing.isPresent()) {
                Permission newPerm = new Permission();
                newPerm.setNom(permName);
                permissionRepository.save(newPerm);
            }
        }
        System.out.println("✅ Created/verified " + PERMISSION_NAMES.length + " permissions");

        // Step 2: Fetch all fresh permissions from database (avoids detached entity issue)
        List<Permission> allPermissions = new ArrayList<>();
        for (String permName : PERMISSION_NAMES) {
            permissionRepository.findByNom(permName).ifPresent(allPermissions::add);
        }

        // Step 3: Get or create ADMIN role with all permissions
        Optional<Role> existingRole = roleRepository.findByNom("ADMIN");
        Role adminRole;
        
        if (existingRole.isPresent()) {
            // Update existing role with fresh permissions
            adminRole = existingRole.get();
            adminRole.setPermissions(allPermissions);
        } else {
            // Create new role with fresh permissions
            adminRole = new Role();
            adminRole.setNom("ADMIN");
            adminRole.setDescription("Administrator with full access");
            adminRole.setPermissions(allPermissions);
        }
        roleRepository.save(adminRole);
        System.out.println("✅ ADMIN role created/updated with " + allPermissions.size() + " permissions");

        // Step 4: Create default admin user
        Optional<Utilisateur> existingAdmin = utilisateurRepository.findByEmail("admin@roletask.com");
        if (!existingAdmin.isPresent()) {
            // Fetch fresh admin role
            Role freshAdminRole = roleRepository.findByNom("ADMIN").orElseThrow();
            
            Utilisateur admin = new Utilisateur();
            admin.setEmail("admin@roletask.com");
            admin.setNom("Admin");
            admin.setPrenom("User");
            admin.setMotDePasse(passwordEncoder.encode("admin123456")); // Hash password
            admin.setRole(freshAdminRole);

            utilisateurRepository.save(admin);
            System.out.println("✅ Default admin user created successfully!");
            System.out.println("   Email: admin@roletask.com");
            System.out.println("   Password: admin123456");
        } else {
            System.out.println("✅ Admin user already exists.");
        }
        
        System.out.println("✅ Application data initialization complete!\n");
    }
}
