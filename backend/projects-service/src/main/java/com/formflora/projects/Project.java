package com.formflora.projects;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "projects")
public class Project {
    public enum Status { PLANNING, IN_PROGRESS, ON_HOLD, COMPLETED }
    @Id @GeneratedValue(strategy = GenerationType.UUID) @JdbcTypeCode(SqlTypes.CHAR) @Column(length = 36, nullable = false, updatable = false) private UUID id;
    @Column(nullable = false, length = 140) private String name;
    @Column(name = "client_name", nullable = false, length = 120) private String clientName;
    @Column(nullable = false, length = 120) private String owner;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20) private Status status;
    @Column(nullable = false, length = 1500) private String description;
    @Column(name = "start_date") private LocalDate startDate;
    @Column(name = "due_date") private LocalDate dueDate;
    @Column(name = "created_at", nullable = false, updatable = false) private Instant createdAt;
    @Column(name = "updated_at", nullable = false) private Instant updatedAt;

    protected Project() {}
    public Project(ProjectController.ProjectRequest request) { apply(request); }
    @jakarta.persistence.PrePersist void onCreate() { createdAt = Instant.now(); updatedAt = createdAt; }
    @jakarta.persistence.PreUpdate void onUpdate() { updatedAt = Instant.now(); }
    public UUID getId() { return id; } public String getName() { return name; } public String getClientName() { return clientName; }
    public String getOwner() { return owner; } public Status getStatus() { return status; } public String getDescription() { return description; }
    public LocalDate getStartDate() { return startDate; } public LocalDate getDueDate() { return dueDate; }
    public Instant getCreatedAt() { return createdAt; } public Instant getUpdatedAt() { return updatedAt; }
    public void apply(ProjectController.ProjectRequest request) { name = request.name().trim(); clientName = request.clientName().trim(); owner = request.owner().trim(); status = request.status(); description = request.description().trim(); startDate = request.startDate(); dueDate = request.dueDate(); }
}
