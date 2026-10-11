package com.studybloom.api;

import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class DemoController {
    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "ok", "service", "studybloom-api");
    }

    @GetMapping("/notes")
    public Map<String, Object> notes() {
        return Map.of(
                "items", List.of(Map.of(
                        "id", "demo-note",
                        "title", "Sample study note",
                        "subject", "Biology",
                        "content", "This endpoint is a structural demo stub."
                )),
                "message", "Sample data only; the demo frontend uses browser state."
        );
    }
}
