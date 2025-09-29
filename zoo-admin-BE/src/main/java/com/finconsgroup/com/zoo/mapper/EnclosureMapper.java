package com.finconsgroup.com.zoo.mapper;

import com.finconsgroup.com.zoo.dto.AnimalDto;
import com.finconsgroup.com.zoo.dto.EnclosureDtoInput;
import com.finconsgroup.com.zoo.dto.EnclosureDtoOutput;
import com.finconsgroup.com.zoo.entity.Animal;
import com.finconsgroup.com.zoo.entity.Enclosure;
import com.finconsgroup.com.zoo.entity.User;
import com.finconsgroup.com.zoo.exception.InvalidInputException;
import com.finconsgroup.com.zoo.repository.AnimalRepository;
import com.finconsgroup.com.zoo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class EnclosureMapper {

    private final UserRepository userRepository;
    private final AnimalRepository animalRepository;
    private final AnimalMapper animalMapper;

    public EnclosureDtoOutput toDto(Enclosure enclosure){
        if (enclosure != null){

            EnclosureDtoOutput enclosureDto = new EnclosureDtoOutput();

            enclosureDto.setId(enclosure.getId());
            enclosureDto.setName(enclosure.getName());
            enclosureDto.setArea(enclosure.getArea());
            enclosureDto.setDescription(enclosure.getDescription());

            if (enclosure.getUser() != null) {
                enclosureDto.setUser(enclosure.getUser().getId());
            } else {
                throw new InvalidInputException("L'elemento user non è valido");
            }

            if (!enclosure.getAnimals().isEmpty()){
                List<AnimalDto> animalDtos = new ArrayList<>();
                enclosure.getAnimals().forEach(a ->
                    animalDtos.add(animalMapper.toAnimalDto(a)));

                enclosureDto.setAnimals(animalDtos);
            }

            return enclosureDto;
        } else {
            throw new InvalidInputException("L'oggetto enclosure passato non è valido");
        }
    }

    public EnclosureDtoInput toDtoLong(Enclosure enclosure){
        if (enclosure != null){

            EnclosureDtoInput enclosureDto = new EnclosureDtoInput();

            enclosureDto.setId(enclosure.getId());
            enclosureDto.setName(enclosure.getName());
            enclosureDto.setArea(enclosure.getArea());
            enclosureDto.setDescription(enclosure.getDescription());

            if (enclosure.getUser() != null) {
                enclosureDto.setUser(enclosure.getUser().getId());
            } else {
                throw new InvalidInputException("L'elemento user non è valido");
            }

            if (!enclosure.getAnimals().isEmpty()){
                List<Long> animalDtos = new ArrayList<>();
                enclosure.getAnimals().forEach(a ->
                        animalDtos.add(a.getId()));

                enclosureDto.setAnimals(animalDtos);
            }

            return enclosureDto;
        } else {
            throw new InvalidInputException("L'oggetto enclosure passato non è valido");
        }
    }

    public Enclosure toEnclosure(EnclosureDtoInput enclosureDto, User user, List<Animal> animals) {

        if (enclosureDto == null) return null;
        Enclosure enclosure = new Enclosure();

        enclosure.setName(enclosureDto.getName());
        enclosure.setArea(enclosureDto.getArea());
        enclosure.setDescription(enclosureDto.getDescription());
        enclosure.setUser(user);
        enclosure.setAnimals(animals);

        return enclosure;
    }
}
