package com.finconsgroup.com.zoo.enums;

public enum AnimalCategory {
    MAMMAL("Mammal"),
    BIRD("Bird"),
    REPTILE("Reptile"),
    AMPHIBIAN("Amphibian"),
    FISH("Fish"),
    INSECT("Insect");

    private final String category;

    AnimalCategory(String category) {
        this.category = category;
    }

    public String getCategory() {
        return category;
    }
}
