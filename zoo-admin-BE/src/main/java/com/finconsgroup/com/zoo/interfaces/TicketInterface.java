package com.finconsgroup.com.zoo.interfaces;

import com.finconsgroup.com.zoo.dto.TicketDto;

import java.util.List;

public interface TicketInterface {

    TicketDto addTicket(TicketDto ticketDto);
    TicketDto updateTicketById(Long Id, TicketDto ticketDto);
    TicketDto deleteTicketById(Long Id);
    TicketDto getTicketById(Long Id);
    List<TicketDto> getAllTickets();

    List<TicketDto> getUnassignedTickets();
    List<TicketDto> getMyAssignedTickets();

    TicketDto assignTicketToCurrentUser(Long ticketId);


}
