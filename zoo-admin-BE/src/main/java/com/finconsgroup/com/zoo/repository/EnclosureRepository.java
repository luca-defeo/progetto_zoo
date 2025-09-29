package com.finconsgroup.com.zoo.repository;

import com.finconsgroup.com.zoo.entity.Animal;
import com.finconsgroup.com.zoo.entity.Enclosure;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EnclosureRepository extends JpaRepository<Enclosure, Long> {
}
