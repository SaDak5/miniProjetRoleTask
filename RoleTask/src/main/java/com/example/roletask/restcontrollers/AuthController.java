package com.example.roletask.restcontrollers;

import com.example.roletask.entities.Utilisateur;
import com.example.roletask.repos.RoleRepository;
import com.example.roletask.repos.UtilisateurRepository;
import com.example.roletask.security.SecParams;
import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:4200")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UtilisateurRepository utilisateurRepository;
    
    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    loginRequest.getEmail(),
                    loginRequest.getMotDePasse()
                )
            );

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();

            List<String> roles = new ArrayList<>();
            List<String> permissions = new ArrayList<>();

            userDetails.getAuthorities().forEach(authority -> {
                String auth = authority.getAuthority();
                // seuls les rôles métier sont ROLE_ADMIN, ROLE_MANAGER, ROLE_EMPLOYEE
                if (auth.equals("ROLE_ADMIN") ||
                    auth.equals("ROLE_MANAGER") ||
                    auth.equals("ROLE_EMPLOYEE")) {
                    roles.add(auth);
                } else {
                    // tout le reste sont des permissions
                    // ex: ROLE_CREATE, ROLE_READ, PERMISSION_READ, TACHE_READ ...
                    permissions.add(auth);
                }
            });

            String jwt = JWT.create()
                .withSubject(userDetails.getUsername())
                .withArrayClaim("roles", roles.toArray(new String[0]))
                .withArrayClaim("permissions", permissions.toArray(new String[0]))
                .withExpiresAt(new Date(System.currentTimeMillis() + SecParams.EXP_TIME))
                .sign(Algorithm.HMAC256(SecParams.SECRET));

            HttpHeaders headers = new HttpHeaders();
            headers.add("Authorization", "Bearer " + jwt);
            headers.add("Access-Control-Expose-Headers", "Authorization");

            Utilisateur utilisateur = utilisateurRepository.findByEmail(
                userDetails.getUsername()
            ).orElseThrow();

            Map<String, Object> responseBody = new HashMap<>();
            responseBody.put("token", jwt);
            responseBody.put("email", utilisateur.getEmail());
            responseBody.put("nom", utilisateur.getNom());
            responseBody.put("prenom", utilisateur.getPrenom());
            responseBody.put("roles", roles);
            responseBody.put("permissions", permissions);
            responseBody.put("message", "Connexion réussie");

            return ResponseEntity.ok().headers(headers).body(responseBody);

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Email ou mot de passe incorrect");
            return ResponseEntity.status(401).body(error);
        }
    }

 
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Utilisateur utilisateur) {
        try {
            if (utilisateurRepository.findByEmail(utilisateur.getEmail()).isPresent()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Email déjà utilisé");
                return ResponseEntity.badRequest().body(error);
            }

            // affecter EMPLOYEE par défaut si aucun rôle fourni
            if (utilisateur.getRole() == null) {
                roleRepository.findByNom("EMPLOYEE").ifPresent(utilisateur::setRole);
            }

            utilisateur.setMotDePasse(passwordEncoder.encode(utilisateur.getMotDePasse()));

            Utilisateur saved = utilisateurRepository.save(utilisateur);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Utilisateur créé avec succès");
            response.put("id", saved.getId());
            response.put("nom", saved.getNom());
            response.put("prenom", saved.getPrenom());
            response.put("email", saved.getEmail());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Erreur lors de la création : " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

  
    static class LoginRequest {
        private String email;
        private String motDePasse;

        public String getEmail() { return email; }
        public String getMotDePasse() { return motDePasse; }
    }
}