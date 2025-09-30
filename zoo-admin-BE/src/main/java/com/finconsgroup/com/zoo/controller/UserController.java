package com.finconsgroup.com.zoo.controller;

import com.finconsgroup.com.zoo.dto.UserDtoInput;
import com.finconsgroup.com.zoo.dto.UserDtoOutput;
import com.finconsgroup.com.zoo.interfaces.UserInterface;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserInterface userInterface;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping("/{id}")
    public ResponseEntity<UserDtoOutput> findById(@PathVariable Long id) {
        return ResponseEntity.ok(userInterface.findUserById(id));
    }

    @GetMapping("/list")
    public ResponseEntity<List<UserDtoOutput>> findAll() {
        return ResponseEntity.ok(userInterface.findAll());
    }

    @PostMapping("/add")
    public ResponseEntity<UserDtoOutput> addUser(@RequestBody UserDtoInput userDtoInput) {

        if (userDtoInput.getPassword() != null && !userDtoInput.getPassword().isEmpty()) {
            userDtoInput.setPassword(passwordEncoder.encode(userDtoInput.getPassword()));
        }

        return ResponseEntity.ok(userInterface.addUser(userDtoInput));
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<UserDtoOutput> updateUser(@PathVariable Long id, @RequestBody UserDtoInput userDtoInput) {

        if (userDtoInput.getPassword() != null && !userDtoInput.getPassword().isEmpty()) {
            userDtoInput.setPassword(passwordEncoder.encode(userDtoInput.getPassword()));
        }

        return ResponseEntity.ok(userInterface.updateUserById(id, userDtoInput));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<UserDtoOutput> deleteUser(@PathVariable Long id) {
        return ResponseEntity.ok(userInterface.deleteUser(id));
    }
}