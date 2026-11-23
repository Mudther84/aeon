package com.formflora.projects;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {
    private final ProjectRepository projects;
    public ProjectController(ProjectRepository projects) { this.projects = projects; }
    @GetMapping public List<Project> list() { return projects.findAllByOrderByUpdatedAtDesc(); }
    @GetMapping("/{id}") public Project get(@PathVariable UUID id) { return find(id); }
    @PostMapping @ResponseStatus(HttpStatus.CREATED) public Project create(@Valid @RequestBody ProjectRequest request) { return projects.save(new Project(request)); }
    @PutMapping("/{id}") public Project update(@PathVariable UUID id, @Valid @RequestBody ProjectRequest request) { Project project = find(id); project.apply(request); return projects.save(project); }
    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void delete(@PathVariable UUID id) { projects.delete(find(id)); }
    private Project find(UUID id) { return projects.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found")); }

    public record ProjectRequest(@NotBlank @Size(max = 140) String name, @NotBlank @Size(max = 120) String clientName,
        @NotBlank @Size(max = 120) String owner, @NotNull Project.Status status,
        @NotBlank @Size(max = 1500) String description, LocalDate startDate, LocalDate dueDate) {}
}
