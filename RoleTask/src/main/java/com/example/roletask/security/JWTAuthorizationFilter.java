package com.example.roletask.security;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Component  // ✅ AJOUT — manquait ici
public class JWTAuthorizationFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain)
            throws ServletException, IOException {

        String path = request.getServletPath();

        // URLs publiques
        if (path.equals("/api/auth/login") ||
            path.equals("/api/auth/register") ||
            path.startsWith("/swagger-ui") ||
            path.startsWith("/v3/api-docs") ||
            path.startsWith("/api-docs") ||
            path.startsWith("/swagger-resources") ||
            path.startsWith("/webjars")) {
            chain.doFilter(request, response);
            return;
        }

        // Laisser passer OPTIONS (CORS preflight)
        if (request.getMethod().equals("OPTIONS")) {
            response.setStatus(HttpServletResponse.SC_OK);
            chain.doFilter(request, response);
            return;
        }

        String header = request.getHeader(SecParams.HEADER_STRING);

        // Pas de token → 401
        if (header == null || !header.startsWith(SecParams.TOKEN_PREFIX)) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"Token JWT manquant ou invalide\"}");
            return;
        }

        try {
            String token = header.replace(SecParams.TOKEN_PREFIX, "");

            DecodedJWT decodedJWT = JWT.require(Algorithm.HMAC256(SecParams.SECRET))
                    .build()
                    .verify(token);

            String email = decodedJWT.getSubject();

            List<SimpleGrantedAuthority> authorities = new ArrayList<>();

            String[] roles = decodedJWT.getClaim("roles").asArray(String.class);
            if (roles != null) {
                Arrays.stream(roles)
                        .map(SimpleGrantedAuthority::new)
                        .forEach(authorities::add);
            }

            String[] permissions = decodedJWT.getClaim("permissions").asArray(String.class);
            if (permissions != null) {
                Arrays.stream(permissions)
                        .map(SimpleGrantedAuthority::new)
                        .forEach(authorities::add);
            }

            UsernamePasswordAuthenticationToken auth =
                    new UsernamePasswordAuthenticationToken(email, null, authorities);

            SecurityContextHolder.getContext().setAuthentication(auth);

        } catch (Exception e) {
            SecurityContextHolder.clearContext();
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"Token JWT invalide\"}");
            return;
        }

        chain.doFilter(request, response);
    }
}