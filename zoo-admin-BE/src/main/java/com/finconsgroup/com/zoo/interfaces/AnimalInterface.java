package com.finconsgroup.com.zoo.interfaces;

import com.finconsgroup.com.zoo.dto.AnimalDto;

import java.util.List;

public interface AnimalInterface {

    AnimalDto addAnimal(AnimalDto animalDto);
    AnimalDto findById(Long id);
    List<AnimalDto> findAll();
    AnimalDto updateById(Long id, AnimalDto animalDto);
    AnimalDto deleteAnimal(Long id);
}
