package com.finconsgroup.com.zoo.mapper;

import com.finconsgroup.com.zoo.dto.TicketDto;
import com.finconsgroup.com.zoo.entity.Ticket;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class TicketMapper {

    public TicketDto toDto(Ticket ticket) {
        if (ticket == null) {
            return null;
        }
        TicketDto dto = new TicketDto();
        dto.setId(ticket.getId());
        dto.setTitle(ticket.getTitle());
        dto.setDescription(ticket.getDescription());
        dto.setRecommendedRole(ticket.getRecommendedRole());
        dto.setTicketUrgency(ticket.getTicketUrgency());
        dto.setCreationDate(ticket.getCreationDate());


        if (ticket.getUser() != null) {
            dto.setUser(ticket.getUser().getId());
        } else {
            dto.setUser(null);
        }

        return dto;
    }

    public Ticket toEntity(TicketDto dto) {
        if(dto == null) {
            return null;
        }

        Ticket ticket = new Ticket();

        if(dto.getId() != null) {
            ticket.setId(dto.getId());
        }

        ticket.setTitle(dto.getTitle());
        ticket.setDescription(dto.getDescription());
        ticket.setRecommendedRole(dto.getRecommendedRole());
        ticket.setTicketUrgency(dto.getTicketUrgency());
        ticket.setCreationDate(dto.getCreationDate());



        return ticket;
    }

    public List<TicketDto> toDtoList(List<Ticket> tickets) {
        if (tickets == null) {
            return null;
        }
        return tickets.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<Ticket> toEntityList(List<TicketDto> dtos) {
        if (dtos == null) {
            return null;
        }
        return dtos.stream()
                .map(this::toEntity)
                .collect(Collectors.toList());
    }
}