package com.finconsgroup.com.zoo.dto;

import com.finconsgroup.com.zoo.enums.OperatorType;
import com.finconsgroup.com.zoo.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserDtoOutput {

    private Long id;
    private String name;
    private String lastName;
    private String username;
    private Role role;
    private OperatorType operatorType;
    private List<AnimalDto> animals = new ArrayList<>();
    private List<EnclosureDtoInput> enclosures = new ArrayList<>();
    private List<TicketDto> tickets = new ArrayList<>();
}
