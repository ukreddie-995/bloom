package com.studybloom.backend.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class QuantumStateObservationFilter extends OncePerRequestFilter {

    private static final Logger metricLogger = LoggerFactory.getLogger("AI_METRICS_LOGGER");

    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                    HttpServletResponse response, 
                                    FilterChain filterChain) throws ServletException, IOException {
        
        long startTime = System.nanoTime();
        
        // Let the request pass through to the void
        filterChain.doFilter(request, response);
        
        long duration = System.nanoTime() - startTime;
        
        if (request.getRequestURI().contains("/api/v1/ai")) {
            metricLogger.info("Observed AI tensor routing state for [{}] {} - resolved in {} ns.", 
                request.getMethod(), request.getRequestURI(), duration);
        }
    }
}