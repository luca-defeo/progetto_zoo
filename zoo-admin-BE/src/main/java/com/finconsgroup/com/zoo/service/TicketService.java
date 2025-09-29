package com.finconsgroup.com.zoo.service;

import com.finconsgroup.com.zoo.dto.TicketDto;
import com.finconsgroup.com.zoo.entity.Ticket;
import com.finconsgroup.com.zoo.enums.OperatorType;
import com.finconsgroup.com.zoo.interfaces.TicketInterface;
import com.finconsgroup.com.zoo.mapper.TicketMapper;
import com.finconsgroup.com.zoo.repository.TicketRepository;
import com.finconsgroup.com.zoo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import com.finconsgroup.com.zoo.entity.User;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TicketService implements TicketInterface {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final TicketMapper ticketMapper;

    @Override
    public TicketDto addTicket(TicketDto ticketDto) {
        Ticket ticket = new Ticket();
        ticket.setTitle(ticketDto.getTitle());
        ticket.setDescription(ticketDto.getDescription());
        ticket.setRecommendedRole(ticketDto.getRecommendedRole());
        ticket.setTicketUrgency(ticketDto.getTicketUrgency());
        ticket.setCreationDate(ticketDto.getCreationDate() != null ? ticketDto.getCreationDate() : LocalDate.now());
        ticket.setUser(null);

        Ticket savedTicket = ticketRepository.save(ticket);
        return ticketMapper.toDto(savedTicket);
    }

    @Override
    public TicketDto getTicketById(Long id) {
        Optional<Ticket> optionalTicket = ticketRepository.findById(id);

        if(optionalTicket.isEmpty()) {
            throw new RuntimeException("Ticket non trovato con ID: " + id);
        }

        return ticketMapper.toDto(optionalTicket.get());
    }

    @Override
    public List<TicketDto> getAllTickets() {
        List<Ticket> tickets = ticketRepository.findAll();
        return tickets.stream()
                .map(ticketMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<TicketDto> getUnassignedTickets() {
        User currentUser = getCurrentUser();

        // Se è un operatore con un tipo specifico
        if (currentUser.isOperator() && currentUser.getOperatorType() != null) {
            // Ottieni ticket per il suo tipo
            List<Ticket> myTypeTickets = ticketRepository.findByUserIsNullAndRecommendedRole(currentUser.getOperatorType());

            // Ottieni ticket generici (senza ruolo specifico)
            List<Ticket> genericTickets = ticketRepository.findByUserIsNullAndRecommendedRoleIsNull();

            // Unisci le due liste
            List<Ticket> allTickets = new ArrayList<>(myTypeTickets);
            allTickets.addAll(genericTickets);

            return allTickets.stream()
                    .map(ticketMapper::toDto)
                    .collect(Collectors.toList());
        }

        // Admin/Manager/Operatori senza tipo vedono tutti i ticket
        List<Ticket> unassignedTickets = ticketRepository.findByUserIsNull();
        return unassignedTickets.stream()
                .map(ticketMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<TicketDto> getMyAssignedTickets() {
        User currentUser = getCurrentUser();
        List<Ticket> myTickets = ticketRepository.findByUser(currentUser);
        return myTickets.stream()
                .map(ticketMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public TicketDto assignTicketToCurrentUser(Long ticketId) {
        Optional<Ticket> optionalTicket = ticketRepository.findById(ticketId);

        if (optionalTicket.isEmpty()) {
            throw new RuntimeException("Ticket non trovato con ID: " + ticketId);
        }

        Ticket ticket = optionalTicket.get();

        if (ticket.getUser() != null) {
            throw new RuntimeException("Il ticket è già assegnato a un altro utente");
        }

        User currentUser = getCurrentUser();
        ticket.setUser(currentUser);

        Ticket assignedTicket = ticketRepository.save(ticket);
        return ticketMapper.toDto(assignedTicket);
    }

    @Override
    public TicketDto updateTicketById(Long id, TicketDto ticketDto) {
        Optional<Ticket> optionalTicket = ticketRepository.findById(id);

        if (optionalTicket.isEmpty()) {
            throw new RuntimeException("Ticket non trovato con ID: " + id);
        }

        Ticket existingTicket = optionalTicket.get();

        if (ticketDto.getTitle() != null) {
            existingTicket.setTitle(ticketDto.getTitle());
        }
        if (ticketDto.getDescription() != null) {
            existingTicket.setDescription(ticketDto.getDescription());
        }
        if (ticketDto.getRecommendedRole() != null) {
            existingTicket.setRecommendedRole(ticketDto.getRecommendedRole());
        }
        if (ticketDto.getTicketUrgency() != null) {
            existingTicket.setTicketUrgency(ticketDto.getTicketUrgency());
        }
        if (ticketDto.getCreationDate() != null) {
            existingTicket.setCreationDate(ticketDto.getCreationDate());
        }
        if (ticketDto.getUser() != null) {
            User user = userRepository.findById(ticketDto.getUser())
                    .orElseThrow(() -> new RuntimeException("Utente non trovato"));
            existingTicket.setUser(user);
        }

        Ticket updatedTicket = ticketRepository.save(existingTicket);
        return ticketMapper.toDto(updatedTicket);
    }

    @Override
    public TicketDto deleteTicketById(Long id) {
        Optional<Ticket> optionalTicket = ticketRepository.findById(id);

        if (optionalTicket.isEmpty()) {
            throw new RuntimeException("Ticket non trovato con ID: " + id);
        }

        Ticket ticket = optionalTicket.get();
        TicketDto ticketDto = ticketMapper.toDto(ticket);

        ticketRepository.deleteById(id);

        return ticketDto;
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