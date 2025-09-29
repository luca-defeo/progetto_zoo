package com.finconsgroup.com.zoo.enums;

public enum Role {
    ADMIN("admin"),
    MANAGER("manager"),
    OPERATOR("operator");

    private final String role;

    Role(String role) {
        this.role = role;
    }

    public String getRole() {
        return role;
    }
}
