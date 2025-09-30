package com.finconsgroup.com.zoo.controller;

import com.finconsgroup.com.zoo.dto.TicketDto;
import com.finconsgroup.com.zoo.entity.User;
import com.finconsgroup.com.zoo.interfaces.TicketInterface;
import com.finconsgroup.com.zoo.repository.UserRepository;
import com.finconsgroup.com.zoo.service.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/ticket")
@RequiredArgsConstructor
public class TicketController {

    private final TicketInterface ticketInterface;
    private final TicketService ticketService;
    private final UserRepository userRepository;

    @PostMapping("/add")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('MANAGER')")
    public ResponseEntity<TicketDto> createTicket(@RequestBody TicketDto ticketDto) {
        try {
            TicketDto createdTicket = ticketService.addTicket(ticketDto);
            return new ResponseEntity<>(createdTicket, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('MANAGER') or hasAuthority('OPERATOR')")
    public ResponseEntity<TicketDto> getTicketById(@PathVariable Long id) {
        try {
            TicketDto ticket = ticketService.getTicketById(id);
            return new ResponseEntity<>(ticket, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/dashboard")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('MANAGER') or hasAuthority('OPERATOR')")
    public ResponseEntity<List<TicketDto>> getTicketsForDashboard() {
        try {
            List<TicketDto> unassignedTickets = ticketService.getUnassignedTickets();
            return ResponseEntity.ok(unassignedTickets);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/my-tickets")
    @PreAuthorize("hasAuthority('OPERATOR')")
    public ResponseEntity<List<TicketDto>> getMyAssignedTickets() {
        try {
            List<TicketDto> myTickets = ticketService.getMyAssignedTickets();
            return ResponseEntity.ok(myTickets);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/{id}/accept")
    @PreAuthorize("hasAuthority('OPERATOR')")
    public ResponseEntity<TicketDto> acceptTicket(@PathVariable Long id) {
        try {
            TicketDto assignedTicket = ticketService.assignTicketToCurrentUser(id);
            return ResponseEntity.ok(assignedTicket);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }


    @PostMapping("/{id}/complete")
    @PreAuthorize("hasAuthority('OPERATOR')")
    public ResponseEntity<TicketDto> completeTicket(@PathVariable Long id) {
        try {
            TicketDto ticket = ticketService.getTicketById(id);
            User currentUser = getCurrentUser();


            if (ticket.getUser() == null || !ticket.getUser().equals(currentUser.getId())) {
                return new ResponseEntity<>(null, HttpStatus.FORBIDDEN);
            }


            TicketDto completedTicket = ticketService.deleteTicketById(id);
            return ResponseEntity.ok(completedTicket);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/all")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('MANAGER')")
    public ResponseEntity<List<TicketDto>> getAllTickets() {
        try {
            List<TicketDto> allTickets = ticketInterface.getAllTickets();
            return ResponseEntity.ok(allTickets);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('MANAGER')")
    public ResponseEntity<TicketDto> updateTicket(@PathVariable Long id, @RequestBody TicketDto ticketDto) {
        try {
            TicketDto updatedTicket = ticketService.updateTicketById(id, ticketDto);
            return ResponseEntity.ok(updatedTicket);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('MANAGER')")
    public ResponseEntity<TicketDto> deleteTicket(@PathVariable Long id) {
        try {
            TicketDto deletedTicket = ticketService.deleteTicketById(id);
            return ResponseEntity.ok(deletedTicket);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    private User getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String username;

        if (principal instanceof org.springframework.security.core.userdetails.UserDetails) {
            username = ((org.springframework.security.core.userdetails.UserDetails) principal).getUsername();
        } else {
            username = principal.toString();
        }

        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Utente corrente non trovato: " + username));
    }
}