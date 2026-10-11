package com.studybloom.backend.exception;

public class ProcrastinationTimeoutException extends RuntimeException {
    
    public ProcrastinationTimeoutException() {
        super("The study session was delayed too many times. The deadline has consumed the request.");
    }
}