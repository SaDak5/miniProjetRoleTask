package com.example.roletask.security;

import com.example.roletask.entities.Permission;
import com.example.roletask.entities.Utilisateur;
import com.example.roletask.repos.UtilisateurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class MyUserDetailsService implements UserDetailsService {

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Utilisateur utilisateur = utilisateurRepository.findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException(
                "Utilisateur non trouvé : " + email
            ));

        List<SimpleGrantedAuthority> authorities = new ArrayList<>();

        if (utilisateur.getRole() != null) {

            // ajouter le rôle : ex ROLE_ADMIN, ROLE_MANAGER, ROLE_EMPLOYEE
            authorities.add(new SimpleGrantedAuthority(
                "ROLE_" + utilisateur.getRole().getNom()
            ));

            // ajouter chaque permission du rôle : ex TACHE_READ, ROLE_CREATE ...
            if (utilisateur.getRole().getPermissions() != null) {
                for (Permission permission : utilisateur.getRole().getPermissions()) {
                    authorities.add(new SimpleGrantedAuthority(
                        permission.getNom()
                    ));
                }
            }
        }

        return new User(
            utilisateur.getEmail(),
            utilisateur.getMotDePasse(),
            authorities
        );
    }
}