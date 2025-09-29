package com.finconsgroup.com.zoo.dto;

import com.finconsgroup.com.zoo.enums.OperatorType;
import com.finconsgroup.com.zoo.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class UserDtoInput {
    private Long id;
    private String name;
    private String lastName;
    private String username;
    private String password;
    private Role role;
    private OperatorType operatorType;
    private List<Long> animals = new ArrayList<>();
    private List<Long> enclosures = new ArrayList<>();
    private List<Long> tickets = new ArrayList<>();
}
