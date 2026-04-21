package com.example.roletask.security;

public class SecParams {
    public static final String SECRET = resolveSecret();
    public static final long EXP_TIME = 60 * 60 * 1000; // 1 heure
    public static final String TOKEN_PREFIX = "Bearer ";
    public static final String HEADER_STRING = "Authorization";

    private static String resolveSecret() {
        String secret = System.getenv("JWT_SECRET");
        if (secret != null && !secret.isBlank()) {
            return secret;
        }

        return "roletask_secret_key_2024";
    }
}