package com.finconsgroup.com.zoo.entity;

import com.finconsgroup.com.zoo.enums.OperatorType;
import com.finconsgroup.com.zoo.enums.Role;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
@AllArgsConstructor
@Getter
@Setter
@NoArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "first_name")
    private String name;

    @Column(name = "last_name")
    private String lastName;

    @Column(unique = true, nullable = true)
    private String username;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    private Role role;

    @Enumerated(EnumType.STRING)
    @Column(name = "operator_type", nullable = true)
    private OperatorType operatorType;

    @OneToMany(mappedBy = "user")
    private List<Animal> animals = new ArrayList<>();

    @OneToMany(mappedBy = "user")
    private List<Enclosure> enclosures = new ArrayList<>();

    @OneToMany(mappedBy = "user")
    private List<Ticket> tickets = new ArrayList<>();

    public boolean isOperator(){
        return this.role == Role.OPERATOR;
    }



}
