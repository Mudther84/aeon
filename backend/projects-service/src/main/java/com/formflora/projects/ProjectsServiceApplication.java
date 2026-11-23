package com.formflora.projects;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = {"com.formflora.projects", "com.formflora.security"})
public class ProjectsServiceApplication {
    public static void main(String[] args) { SpringApplication.run(ProjectsServiceApplication.class, args); }
}
