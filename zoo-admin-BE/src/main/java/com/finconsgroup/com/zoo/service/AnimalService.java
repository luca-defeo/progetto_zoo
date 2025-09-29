package com.finconsgroup.com.zoo.service;

import com.finconsgroup.com.zoo.dto.AnimalDto;
import com.finconsgroup.com.zoo.entity.Animal;
import com.finconsgroup.com.zoo.entity.Enclosure;
import com.finconsgroup.com.zoo.entity.User;
import com.finconsgroup.com.zoo.exception.InvalidInputException;
import com.finconsgroup.com.zoo.interfaces.AnimalInterface;
import com.finconsgroup.com.zoo.mapper.AnimalMapper;
import com.finconsgroup.com.zoo.repository.AnimalRepository;
import com.finconsgroup.com.zoo.repository.EnclosureRepository;
import com.finconsgroup.com.zoo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AnimalService implements AnimalInterface {

    private final AnimalRepository animalRepository;
    private final UserRepository userRepository;
    private final EnclosureRepository enclosureRepository;
    private final AnimalMapper animalMapper;


    @Override
    public AnimalDto addAnimal(AnimalDto animalDto) {
        if (animalDto != null) {
            User user = userRepository.findById(animalDto.getUser()).orElseThrow(
                    () -> new InvalidInputException("Nessuno user presente con questo id")
            );

            Enclosure enclosure = enclosureRepository.findById(animalDto.getEnclosure()).orElseThrow(
                    () -> new InvalidInputException("Nessuna gabbia presente con l'id passato")
            );

            Animal animal = animalMapper.toAnimal(animalDto, user, enclosure);

            Animal saved = animalRepository.save(animal);

            user.getAnimals().add(saved);
            enclosure.getAnimals().add(saved);
            userRepository.save(user);
            enclosureRepository.save(enclosure);

            return animalMapper.toAnimalDto(animal);
        } else {
            throw new InvalidInputException("Il dto passato non è valido");
        }
    }

    @Override
    public AnimalDto findById(Long id) {
        Animal animal = animalRepository.findById(id).orElseThrow(
                () -> new InvalidInputException("Nessun elemento presente con questo id")
        );

        return animalMapper.toAnimalDto(animal);
    }

    @Override
    public List<AnimalDto> findAll() {
        return animalRepository.findAll().stream()
                .map(animalMapper::toAnimalDto)
                .toList();
    }

    @Override
    public AnimalDto updateById(Long id, AnimalDto animalDto) {
        if (animalDto != null){
            Animal animal = animalRepository.findById(id).orElseThrow(
                    () -> new InvalidInputException("Nessun animale presente con questo id")
            );

            User oldUser = userRepository.findById(animal.getUser().getId()).orElseThrow(
                    () -> new InvalidInputException("Nessuno user con questo id")
            );

            User newUser = userRepository.findById(animalDto.getUser()).orElseThrow(
                    () -> new InvalidInputException("Nessuno user con questo id")
            );

            Enclosure oldEnclosure = enclosureRepository.findById(animal.getEnclosure().getId()).orElseThrow(
                    () -> new InvalidInputException("Nessuna gabbia presente con questo id")
            );

            Enclosure newEnclosure = enclosureRepository.findById(animalDto.getEnclosure()).orElseThrow(
                    () -> new InvalidInputException("Nessuna gabbia presente con questo id")
            );

            oldUser.getAnimals().remove(animal);
            oldEnclosure.getAnimals().remove(animal);

            animal.setUser(newUser);
            animal.setEnclosure(newEnclosure);

            animal.setName(animalDto.getName());
            animal.setWeight(animalDto.getWeight());

            if (animalDto.getCategory() != null){
                animal.setCategory(animalDto.getCategory());
            }



            Animal saved = animalRepository.save(animal);

            newUser.getAnimals().add(saved);
            newEnclosure.getAnimals().add(saved);

            return animalMapper.toAnimalDto(animal);
        } else {
            throw new InvalidInputException("Elemento passato non valido");
        }
    }

    @Override
    public AnimalDto deleteAnimal(Long id) {
        Animal animal = animalRepository.findById(id).orElseThrow(
                () -> new InvalidInputException("Nessun animale presente con questo id")
        );

        User oldUser = userRepository.findById(animal.getUser().getId()).orElseThrow(
                () -> new InvalidInputException("Nessuno user con questo id")
        );

        Enclosure oldEnclosure = enclosureRepository.findById(animal.getEnclosure().getId()).orElseThrow(
                () -> new InvalidInputException("Nessuna gabbia presente con questo id")
        );

        oldUser.getAnimals().remove(animal);
        oldEnclosure.getAnimals().remove(animal);

        animalRepository.delete(animal);

        return animalMapper.toAnimalDto(animal);
    }
}
