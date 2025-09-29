package com.finconsgroup.com.zoo.controller;

import com.finconsgroup.com.zoo.dto.AnimalDto;
import com.finconsgroup.com.zoo.interfaces.AnimalInterface;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/animal")
@RequiredArgsConstructor
public class AnimalController {

    private final AnimalInterface animalInterface;

    @PostMapping("/add")
    public ResponseEntity<AnimalDto> addAnimal(@RequestBody AnimalDto animalDto) {
        return ResponseEntity.ok(animalInterface.addAnimal(animalDto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AnimalDto> findById(@PathVariable Long id) {
        return ResponseEntity.ok(animalInterface.findById(id));
    }

    @GetMapping("/list")
    public ResponseEntity<List<AnimalDto>> findAll() {
        return ResponseEntity.ok(animalInterface.findAll());
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<AnimalDto> updateById(@PathVariable Long id, @RequestBody AnimalDto animalDto) {
        return ResponseEntity.ok(animalInterface.updateById(id, animalDto));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<AnimalDto> deleteAnimal(@PathVariable Long id) {
        return ResponseEntity.ok(animalInterface.deleteAnimal(id));
    }
}
