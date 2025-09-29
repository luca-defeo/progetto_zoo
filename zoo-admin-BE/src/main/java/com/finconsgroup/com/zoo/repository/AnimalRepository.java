package com.finconsgroup.com.zoo.repository;

import com.finconsgroup.com.zoo.dto.AnimalDto;
import com.finconsgroup.com.zoo.entity.Animal;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AnimalRepository extends JpaRepository<Animal, Long> {
}
