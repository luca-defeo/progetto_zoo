package com.finconsgroup.com.zoo.dto;

import com.finconsgroup.com.zoo.enums.OperatorType;
import com.finconsgroup.com.zoo.enums.Role;
import com.finconsgroup.com.zoo.enums.TicketUrgency;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TicketDto {

    private Long id;
    private String title;
    private OperatorType recommendedRole;
    private TicketUrgency ticketUrgency;
    private LocalDate creationDate;
    private String description;
    private Long user;
}
