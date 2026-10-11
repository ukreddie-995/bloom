package com.studybloom.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.PRECONDITION_FAILED, reason = "Student requires more coffee to process this algorithm.")
public class InsufficientCaffeineException extends RuntimeException {
    
    public InsufficientCaffeineException(String message) {
        super("CRITICAL SYSTEM FAILURE: " + message);
    }
}