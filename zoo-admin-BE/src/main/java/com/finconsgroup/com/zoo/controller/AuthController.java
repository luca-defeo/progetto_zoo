package com.finconsgroup.com.zoo.controller;

import com.finconsgroup.com.zoo.entity.User;
import com.finconsgroup.com.zoo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody LoginRequest loginRequest) {
        Map<String, Object> response = new HashMap<>();

        try {


            Optional<User> userOptional = userRepository.findByUsername(loginRequest.getUsername());

            if (userOptional.isEmpty()) {

                response.put("success", false);
                response.put("message", "Username o password non corretti");
                return ResponseEntity.badRequest().body(response);
            }

            User user = userOptional.get();


            if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {

                response.put("success", false);
                response.put("message", "Username o password non corretti");
                return ResponseEntity.badRequest().body(response);
            }




            Map<String, Object> userInfo = new HashMap<>();
            userInfo.put("id", user.getId());
            userInfo.put("username", user.getUsername());
            userInfo.put("name", user.getName());
            userInfo.put("lastName", user.getLastName());
            userInfo.put("role", user.getRole().name());
            userInfo.put("operatorType", user.getOperatorType() != null ? user.getOperatorType().name() : null);

            response.put("success", true);
            response.put("message", "Login effettuato con successo");
            response.put("user", userInfo);



            return ResponseEntity.ok(response);

        } catch (Exception e) {

            e.printStackTrace();
            response.put("success", false);
            response.put("message", "Errore durante il login");
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("AuthController funziona!");
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Logout effettuato");
        return ResponseEntity.ok(response);
    }


    public static class LoginRequest {
        private String username;
        private String password;

        public LoginRequest() {}

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }

    }

    @GetMapping("/generate-password")
    public ResponseEntity<Map<String, String>> generatePassword(@RequestParam String password) {
        Map<String, String> response = new HashMap<>();
        String hashedPassword = passwordEncoder.encode(password);
        response.put("plainPassword", password);
        response.put("hashedPassword", hashedPassword);
        return ResponseEntity.ok(response);
    }
}