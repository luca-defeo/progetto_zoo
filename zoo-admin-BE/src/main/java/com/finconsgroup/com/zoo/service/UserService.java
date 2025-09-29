package com.finconsgroup.com.zoo.service;

import com.finconsgroup.com.zoo.dto.UserDtoInput;
import com.finconsgroup.com.zoo.dto.UserDtoOutput;
import com.finconsgroup.com.zoo.entity.Animal;
import com.finconsgroup.com.zoo.entity.Enclosure;
import com.finconsgroup.com.zoo.entity.User;
import com.finconsgroup.com.zoo.exception.InvalidInputException;
import com.finconsgroup.com.zoo.interfaces.UserInterface;
import com.finconsgroup.com.zoo.mapper.UserMapper;
import com.finconsgroup.com.zoo.repository.AnimalRepository;
import com.finconsgroup.com.zoo.repository.EnclosureRepository;
import com.finconsgroup.com.zoo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService implements UserInterface {

    private final UserRepository userRepository;
    private final AnimalRepository animalRepository;
    private final EnclosureRepository enclosureRepository;
    private final UserMapper userMapper;

    @Override
    public UserDtoOutput addUser(UserDtoInput userDtoInput) {
        if (userDtoInput != null){

            List<Animal> animals = new ArrayList<>();
            if (userDtoInput.getAnimals() != null && !userDtoInput.getAnimals().isEmpty()){
                animals = animalRepository.findAllById(userDtoInput.getAnimals());

            }

            List<Enclosure> enclosures = new ArrayList<>();

            if (userDtoInput.getEnclosures() != null && !userDtoInput.getEnclosures().isEmpty()){
                enclosures = enclosureRepository.findAllById(userDtoInput.getEnclosures());
            }

            User user = userMapper.toUser(userDtoInput,animals,enclosures);

            User saved = userRepository.save(user);

            animals.forEach(a -> {
                a.setUser(saved);
                animalRepository.save(a);
            });

            enclosures.forEach(e -> {
                e.setUser(saved);
                enclosureRepository.save(e);
            });

            return userMapper.toDto(saved);
        } else {
            throw new InvalidInputException("Elemento passato non valido");
        }
    }

    @Override
    public UserDtoOutput findUserById(Long id) {
        User user = userRepository.findById(id).orElseThrow(
                () -> new InvalidInputException("Nessun utente correlato a questo id")
        );

        return userMapper.toDto(user);
    }

    @Override
    public List<UserDtoOutput> findAll() {
        return userRepository.findAll().stream()
                .map(userMapper::toDto)
                .toList();
    }

    @Override
    public UserDtoOutput updateUserById(Long id, UserDtoInput userDtoInput) {
        if (userDtoInput != null){
            User user = userRepository.findById(id).orElseThrow(
                    () -> new InvalidInputException("Nessun utente correlato a questo id")
            );

            List<Animal> oldAnimals = new ArrayList<>();

            if (user.getAnimals() != null){
                oldAnimals = user.getAnimals();
            }

            List<Enclosure> oldEnclosures = new ArrayList<>();

            if (user.getEnclosures() != null){
                oldEnclosures = user.getEnclosures();
            }

            List<Animal> animals = new ArrayList<>();
            if (userDtoInput.getAnimals() != null && !userDtoInput.getAnimals().isEmpty()){
                animals = animalRepository.findAllById(userDtoInput.getAnimals());

            }

            List<Enclosure> enclosures = new ArrayList<>();

            if (userDtoInput.getEnclosures() != null && !userDtoInput.getEnclosures().isEmpty()){
                enclosures = enclosureRepository.findAllById(userDtoInput.getEnclosures());
            }

            oldAnimals.forEach(a -> {
                a.setUser(null);
                animalRepository.save(a);
            });

            oldEnclosures.forEach(e -> {
                e.setUser(null);
                enclosureRepository.save(e);
            });

            user.setName(userDtoInput.getName());
            user.setLastName(userDtoInput.getLastName());
            user.setUsername(userDtoInput.getUsername());
            user.setRole(userDtoInput.getRole());
            if (user.isOperator()) {
                user.setOperatorType(userDtoInput.getOperatorType());
            } else {
                user.setOperatorType(null);
            }

            user.setAnimals(animals);
            user.setEnclosures(enclosures);

            User updated = userRepository.save(user);

            animals.forEach(a -> {
                a.setUser(updated);
                animalRepository.save(a);
            });

            enclosures.forEach(e -> {
                e.setUser(updated);
                enclosureRepository.save(e);
            });

            return userMapper.toDto(updated);
        } else {
            throw new InvalidInputException("Elemento passato non valido");
        }
    }

    @Override
    public UserDtoOutput deleteUser(Long id) {
        User user = userRepository.findById(id).orElseThrow(
                () -> new InvalidInputException("Nessun utente correlato a questo id")
        );

        if (user.getAnimals() != null) {
            user.getAnimals().forEach(animal -> {
                animal.setUser(null);
                animalRepository.save(animal);
            });
        }

        if (user.getEnclosures() != null) {
            user.getEnclosures().forEach(enclosure -> {
                enclosure.setUser(null);
                enclosureRepository.save(enclosure);
            });
        }

        userRepository.delete(user);

        return userMapper.toDto(user);
    }

}