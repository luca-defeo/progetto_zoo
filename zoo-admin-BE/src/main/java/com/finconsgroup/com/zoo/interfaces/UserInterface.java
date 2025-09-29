package com.finconsgroup.com.zoo.interfaces;

import com.finconsgroup.com.zoo.dto.UserDtoInput;
import com.finconsgroup.com.zoo.dto.UserDtoOutput;
import com.finconsgroup.com.zoo.entity.User;

import java.util.List;

public interface UserInterface {

    UserDtoOutput addUser(UserDtoInput userDtoInput);
    UserDtoOutput findUserById(Long id);
    List<UserDtoOutput> findAll();
    UserDtoOutput updateUserById(Long id, UserDtoInput userDtoInput);
    UserDtoOutput deleteUser(Long id);
}
