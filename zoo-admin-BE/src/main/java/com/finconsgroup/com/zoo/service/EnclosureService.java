package com.finconsgroup.com.zoo.service;

import com.finconsgroup.com.zoo.dto.EnclosureDtoInput;
import com.finconsgroup.com.zoo.dto.EnclosureDtoOutput;
import com.finconsgroup.com.zoo.entity.Animal;
import com.finconsgroup.com.zoo.entity.Enclosure;
import com.finconsgroup.com.zoo.entity.User;
import com.finconsgroup.com.zoo.exception.InvalidInputException;
import com.finconsgroup.com.zoo.interfaces.EnclosureInterface;
import com.finconsgroup.com.zoo.mapper.EnclosureMapper;
import com.finconsgroup.com.zoo.repository.AnimalRepository;
import com.finconsgroup.com.zoo.repository.EnclosureRepository;
import com.finconsgroup.com.zoo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EnclosureService implements EnclosureInterface {

    private final EnclosureMapper enclosureMapper;
    private final UserRepository userRepository;
    private final AnimalRepository animalRepository;
    private final EnclosureRepository enclosureRepository;

    @Override
    public EnclosureDtoOutput addEnclosure(EnclosureDtoInput enclosureDtoInput) {
        if (enclosureDtoInput != null) {
            User user = userRepository.findById(enclosureDtoInput.getUser()).orElseThrow(
                    () -> new InvalidInputException("Nessuno user presente con questo id")
            );
            List<Animal> animals = new ArrayList<>();

            if (enclosureDtoInput.getAnimals() != null && !enclosureDtoInput.getAnimals().isEmpty()) {
                enclosureDtoInput.getAnimals().forEach(a ->
                        animals.add(animalRepository.findById(a).orElseThrow(
                                () -> new InvalidInputException("Nessun animale associato a questo id")
                        )));
            }

            Enclosure enclosure = enclosureMapper.toEnclosure(enclosureDtoInput, user, animals);

            Enclosure saved = enclosureRepository.save(enclosure);

            user.getEnclosures().add(saved);

            animals.forEach(a -> {
                a.setEnclosure(saved);
                animalRepository.save(a);
            });

            userRepository.save(user);

            return enclosureMapper.toDto(saved);
        } else
        {
            throw new InvalidInputException("Elemento passato non valido");
        }
    }

    @Override
    public EnclosureDtoOutput findById(Long id) {
        Enclosure enclosure = enclosureRepository.findById(id).orElseThrow(
                () -> new InvalidInputException("Nessuna gabbia presente con questo id")
        );

        return enclosureMapper.toDto(enclosure);
    }

    @Override
    public List<EnclosureDtoInput> findAll() {
        return enclosureRepository.findAll().stream()
                .map(enclosureMapper::toDtoLong)
                .toList();
    }

    @Override
    public EnclosureDtoOutput updateById(Long id, EnclosureDtoInput enclosureDtoInput) {
        if (enclosureDtoInput != null){
            Enclosure enclosure = enclosureRepository.findById(id).orElseThrow(
                    () -> new InvalidInputException("Nessuna gabbia presente con questo id")
            );

            User oldUser = userRepository.findById(enclosure.getUser().getId()).orElseThrow(
                    () -> new InvalidInputException("Nessun utente presente con questo id")
            );

            User newUser = userRepository.findById(enclosureDtoInput.getUser()).orElseThrow(
                    () -> new InvalidInputException("Nessun utente presente con questo id")
            );

            List<Animal> newList = new ArrayList<>(animalRepository.findAllById(enclosureDtoInput.getAnimals()));

            List<Animal> oldList = enclosure.getAnimals();

            oldList.forEach(a -> {
                a.setEnclosure(null);
                animalRepository.save(a);
            });

            oldUser.getEnclosures().remove(enclosure);

            enclosure.setName(enclosureDtoInput.getName());
            enclosure.setDescription(enclosureDtoInput.getDescription());
            enclosure.setArea(enclosureDtoInput.getArea());
            enclosure.setUser(newUser);
            enclosure.setAnimals(newList);

            Enclosure saved = enclosureRepository.save(enclosure);

            newList.forEach(a -> {
                a.setEnclosure(saved);
                animalRepository.save(a);
            });

            newUser.getEnclosures().add(saved);

            return enclosureMapper.toDto(enclosure);
        } else {
            throw new InvalidInputException("il dto non è valido");
        }
    }

    @Override
    public EnclosureDtoOutput deleteEnclosure(Long id) {
        Enclosure enclosure = enclosureRepository.findById(id).orElseThrow(
                () -> new InvalidInputException("Nessuna gabbia trovata con questo id")
        );

        List<Animal> animals = enclosure.getAnimals();
        for (Animal animal : animals) {
            animal.setEnclosure(null);
            animalRepository.save(animal);
        }

        User user = enclosure.getUser();
        if (user != null) {
            user.getEnclosures().remove(enclosure);
            userRepository.save(user);
        }

        enclosureRepository.delete(enclosure);

        return enclosureMapper.toDto(enclosure);
    }

}
