package com.finconsgroup.com.zoo.repository;

import com.finconsgroup.com.zoo.entity.Ticket;
import com.finconsgroup.com.zoo.enums.OperatorType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.finconsgroup.com.zoo.entity.User;

import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket,Long> {
    List<Ticket> findByUserIsNull();
    List<Ticket> findByUser(User user);


    List<Ticket> findByUserIsNullAndRecommendedRole(OperatorType operatorType);


    List<Ticket> findByUserIsNullAndRecommendedRoleIsNull();
}