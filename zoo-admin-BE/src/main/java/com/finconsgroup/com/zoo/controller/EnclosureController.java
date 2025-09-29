package com.finconsgroup.com.zoo.controller;

import com.finconsgroup.com.zoo.dto.EnclosureDtoInput;
import com.finconsgroup.com.zoo.dto.EnclosureDtoOutput;
import com.finconsgroup.com.zoo.interfaces.EnclosureInterface;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/enclosure")
@RequiredArgsConstructor
public class EnclosureController {

    private final EnclosureInterface enclosureInterface;

    @PostMapping("/add")
    public ResponseEntity<EnclosureDtoOutput> addEnclosure(@RequestBody EnclosureDtoInput enclosureDtoInput) {
        return ResponseEntity.ok(enclosureInterface.addEnclosure(enclosureDtoInput));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EnclosureDtoOutput> findById(@PathVariable Long id) {
        return ResponseEntity.ok(enclosureInterface.findById(id));
    }

    @GetMapping("/list")
    public ResponseEntity<List<EnclosureDtoInput>> findAll() {
        return ResponseEntity.ok(enclosureInterface.findAll());
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<EnclosureDtoOutput> updateById(@PathVariable Long id, @RequestBody EnclosureDtoInput enclosureDtoInput) {
        return ResponseEntity.ok(enclosureInterface.updateById(id, enclosureDtoInput));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<EnclosureDtoOutput> deleteEnclosure(@PathVariable Long id) {
        return ResponseEntity.ok(enclosureInterface.deleteEnclosure(id));
    }
}
