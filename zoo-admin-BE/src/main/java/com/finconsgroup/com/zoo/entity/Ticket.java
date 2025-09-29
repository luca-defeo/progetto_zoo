package com.finconsgroup.com.zoo.entity;

import com.finconsgroup.com.zoo.enums.OperatorType;
import com.finconsgroup.com.zoo.enums.Role;
import com.finconsgroup.com.zoo.enums.TicketUrgency;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name="tickets")
@AllArgsConstructor
@Getter
@Setter
@NoArgsConstructor
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @JoinColumn(name = "ticket_urgency")
    @Enumerated(EnumType.STRING)
    private TicketUrgency ticketUrgency ;

    @JoinColumn(name = "recommended_role")
    @Enumerated(EnumType.STRING)
    private OperatorType recommendedRole ;

    @JoinColumn
    private LocalDate creationDate;

    private String description;

    @ManyToOne
    @JoinColumn(name = "assigned_user_id", nullable = true)
    private User user;
}
