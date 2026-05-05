package com.taskmanager.controller;

import com.taskmanager.entity.TaskStatus;
import com.taskmanager.repository.ProjectRepository;
import com.taskmanager.repository.TaskRepository;
import com.taskmanager.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private TaskRepository taskRepository;

    @GetMapping("/stats")
    public Map<String, Object> getDashboardStats(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        String role = userDetails.getAuthorities().iterator().next().getAuthority();
        Map<String, Object> stats = new HashMap<>();

        if (role.equals("ROLE_ADMIN")) {
            stats.put("totalProjects", projectRepository.count());
            stats.put("totalTasks", taskRepository.count());
            stats.put("tasksTodo", taskRepository.countByStatus(TaskStatus.TO_DO));
            stats.put("tasksInProgress", taskRepository.countByStatus(TaskStatus.IN_PROGRESS));
            stats.put("tasksDone", taskRepository.countByStatus(TaskStatus.DONE));
        } else {
            Long userId = userDetails.getId();
            stats.put("totalProjects", projectRepository.findByMembersId(userId).size());
            stats.put("totalTasks", taskRepository.countByAssignedToId(userId));
            stats.put("tasksTodo", taskRepository.countByAssignedToIdAndStatus(userId, TaskStatus.TO_DO));
            stats.put("tasksInProgress", taskRepository.countByAssignedToIdAndStatus(userId, TaskStatus.IN_PROGRESS));
            stats.put("tasksDone", taskRepository.countByAssignedToIdAndStatus(userId, TaskStatus.DONE));
        }

        return stats;
    }
}
