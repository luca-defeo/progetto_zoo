package com.finconsgroup.com.zoo.interfaces;

import com.finconsgroup.com.zoo.dto.EnclosureDtoInput;
import com.finconsgroup.com.zoo.dto.EnclosureDtoOutput;

import java.util.List;

public interface EnclosureInterface {

    EnclosureDtoOutput addEnclosure(EnclosureDtoInput enclosureDtoInput);
    EnclosureDtoOutput findById(Long id);
    List<EnclosureDtoInput> findAll();
    EnclosureDtoOutput updateById(Long id, EnclosureDtoInput enclosureDtoInput);
    EnclosureDtoOutput deleteEnclosure(Long id);
}
