package com.finconsgroup.com.zoo.dto;

import com.finconsgroup.com.zoo.enums.AnimalCategory;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AnimalDto {

    private Long id;
    private String name;
    private AnimalCategory category;
    private Double weight;
    private Long user;
    private Long enclosure;
}
