package com.taskmanager.controller;

import com.taskmanager.entity.Project;
import com.taskmanager.entity.Task;
import com.taskmanager.entity.TaskStatus;
import com.taskmanager.entity.User;
import com.taskmanager.repository.ProjectRepository;
import com.taskmanager.repository.TaskRepository;
import com.taskmanager.repository.UserRepository;
import com.taskmanager.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public List<Task> getAllTasks(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        String role = userDetails.getAuthorities().iterator().next().getAuthority();
        if (role.equals("ROLE_ADMIN")) {
            return taskRepository.findAll();
        } else {
            return taskRepository.findByAssignedToId(userDetails.getId());
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createTask(@RequestBody Task taskRequest, @AuthenticationPrincipal UserDetailsImpl userDetails) {
        Project project = projectRepository.findById(taskRequest.getProject().getId())
                .orElseThrow(() -> new RuntimeException("Project not found"));
        
        User createdBy = userRepository.findById(userDetails.getId()).get();
        taskRequest.setProject(project);
        taskRequest.setCreatedBy(createdBy);

        if (taskRequest.getAssignedTo() != null && taskRequest.getAssignedTo().getId() != null) {
            User assignedTo = userRepository.findById(taskRequest.getAssignedTo().getId())
                    .orElseThrow(() -> new RuntimeException("Assigned user not found"));
            taskRequest.setAssignedTo(assignedTo);
        }

        taskRepository.save(taskRequest);
        return ResponseEntity.ok(taskRequest);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateTaskStatus(@PathVariable Long id, @RequestBody Map<String, String> body,
                                              @AuthenticationPrincipal UserDetailsImpl userDetails) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        // Only ADMIN or the ASSIGNED USER can update status
        String role = userDetails.getAuthorities().iterator().next().getAuthority();
        if (!role.equals("ROLE_ADMIN") && (task.getAssignedTo() == null || !task.getAssignedTo().getId().equals(userDetails.getId()))) {
            return ResponseEntity.status(403).body("Unauthorized to update this task");
        }

        try {
            TaskStatus status = TaskStatus.valueOf(body.get("status").toUpperCase());
            task.setStatus(status);
            taskRepository.save(task);
            return ResponseEntity.ok("Task status updated");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Invalid status");
        }
    }
}
