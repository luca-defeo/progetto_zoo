package com.finconsgroup.com.zoo.mapper;

import com.finconsgroup.com.zoo.dto.*;
import com.finconsgroup.com.zoo.entity.Animal;
import com.finconsgroup.com.zoo.entity.Enclosure;
import com.finconsgroup.com.zoo.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Component
@RequiredArgsConstructor
public class UserMapper {

    private final AnimalMapper animalMapper;
    private final EnclosureMapper enclosureMapper;

    public UserDtoOutput toDto(User user){

        if (user == null) return null;
        UserDtoOutput userDtoOutput = new UserDtoOutput();

        userDtoOutput.setId(user.getId());
        userDtoOutput.setName(user.getName());
        userDtoOutput.setLastName(user.getLastName());
        userDtoOutput.setUsername(user.getUsername());
        userDtoOutput.setRole(user.getRole());
        userDtoOutput.setOperatorType(user.getOperatorType());

        if (user.getAnimals() != null && !user.getAnimals().isEmpty()) {
            List<AnimalDto> animalDtos = new ArrayList<>();
            user.getAnimals().forEach(a -> animalDtos.add(animalMapper.toAnimalDto(a)));
            userDtoOutput.setAnimals(animalDtos);
        } else {
            userDtoOutput.setAnimals(Collections.emptyList());
        }

        if (user.getEnclosures() != null && !user.getEnclosures().isEmpty()) {
            List<EnclosureDtoInput> enclosureDtoInputs = new ArrayList<>();
            user.getEnclosures().forEach(e -> enclosureDtoInputs.add(enclosureMapper.toDtoLong(e)));
            userDtoOutput.setEnclosures(enclosureDtoInputs);
        } else {
            userDtoOutput.setEnclosures(Collections.emptyList());
        }

        return userDtoOutput;
    }

    public User toUser(UserDtoInput userDtoInput, List<Animal> animals, List<Enclosure> enclosures){
        if (userDtoInput == null) return null;
        User user = new User();

        user.setName(userDtoInput.getName());
        user.setLastName(userDtoInput.getLastName());

        // Aggiunti username e password
        user.setUsername(userDtoInput.getUsername());
        user.setPassword(userDtoInput.getPassword());

        user.setRole(userDtoInput.getRole());
        if (user.isOperator()) user.setOperatorType(userDtoInput.getOperatorType());
        user.setAnimals(animals);
        user.setEnclosures(enclosures);

        return user;

    }
}
