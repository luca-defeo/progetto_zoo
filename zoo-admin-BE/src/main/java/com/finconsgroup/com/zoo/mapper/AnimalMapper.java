package com.finconsgroup.com.zoo.mapper;

import com.finconsgroup.com.zoo.dto.AnimalDto;
import com.finconsgroup.com.zoo.entity.Animal;
import com.finconsgroup.com.zoo.entity.Enclosure;
import com.finconsgroup.com.zoo.entity.User;
import com.finconsgroup.com.zoo.exception.InvalidInputException;
import com.finconsgroup.com.zoo.repository.EnclosureRepository;
import com.finconsgroup.com.zoo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AnimalMapper {

    private final UserRepository userRepository;
    private final EnclosureRepository enclosureRepository;

    public AnimalDto toAnimalDto(Animal animal){

        if (animal == null) return null;

        AnimalDto animalDto = new AnimalDto();

        animalDto.setId(animal.getId());
        animalDto.setName(animal.getName());

        if (animal.getCategory() != null){
            animalDto.setCategory(animal.getCategory());
        }

        animalDto.setWeight(animal.getWeight());

        if (animal.getUser() != null) animalDto.setUser(animal.getUser().getId());

        if (animal.getEnclosure() != null) animalDto.setEnclosure(animal.getEnclosure().getId());

        return animalDto;
    }

    public Animal toAnimal(AnimalDto animalDto, User user, Enclosure enclosure) {
        if (animalDto == null) return null;

        Animal animal = new Animal();
        animal.setName(animalDto.getName());
        animal.setCategory(animalDto.getCategory());
        animal.setWeight(animalDto.getWeight());
        animal.setUser(user);
        animal.setEnclosure(enclosure);

        return animal;
    }

}
