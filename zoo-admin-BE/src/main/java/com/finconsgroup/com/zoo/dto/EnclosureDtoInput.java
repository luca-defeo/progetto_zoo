package com.finconsgroup.com.zoo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EnclosureDtoInput {

    private Long id;
    private String name;
    private Double area;
    private String description;
    private Long user;
    private List<Long> animals = new ArrayList<>();
}
